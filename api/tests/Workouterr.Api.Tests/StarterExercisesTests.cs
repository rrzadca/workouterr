using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using Workouterr.Api.Exercises;
using Workouterr.Api.Users;

namespace Workouterr.Api.Tests;

/// <summary>The starter file against the exercise schema: it must parse strictly, and every entry, in every language,
/// must pass the same limits as an exercise sent to the API.</summary>
public class StarterExercisesTests
{
    [Fact]
    public void TheFile_MeetsTheExerciseSchema_InEveryLanguage()
    {
        Assert.Empty(Problems(StarterExercises.ReadResource()));
    }

    [Fact]
    public void TheFile_HasAbout25Exercises_WithDistinctNamesInEachLanguage()
    {
        var exercises = StarterExercises.Parse(StarterExercises.ReadResource());

        Assert.InRange(exercises.Count, 20, 30);
        foreach (var language in Enum.GetValues<Language>())
        {
            var names = exercises.Select(exercise => exercise.Name.In(language)).ToList();
            Assert.Equal(names.Count, names.Distinct().Count());
        }
    }

    // Each entry breaks one rule; the valid one it starts from is the last case.
    public static TheoryData<string> BrokenEntries => new()
    {
        Entry(name: """{"en":"Squat"}"""),
        Entry(name: """{"en":"Squat","pl":"   "}"""),
        Entry(name: """{"en":"Squat","pl":null}"""),
        Entry(description: """{"en":"Deep.","pl":"Głęboki.","de":"Tief."}"""),
        Entry(muscleGroups: """["FULL_BODY"]"""),
        Entry(muscleGroups: "[]"),
        Entry(metrics: "\"REPS\""),
        Entry(weightStep: "\"2.5\""),
        Entry(weightStep: "1.255"),
        Entry(extra: ",\"perside\":true"),
    };

    [Theory]
    [MemberData(nameof(BrokenEntries))]
    public void ABrokenEntry_FailsTheCheck(string json)
    {
        Assert.True(Problems(json).Count > 0, json);
    }

    [Fact]
    public void TheValidEntry_PassesTheCheck()
    {
        Assert.Empty(Problems(Entry()));
    }

    // What's wrong with the file: the parse error, or every entry that breaks a limit in some language.
    private static List<string> Problems(string json)
    {
        List<StarterExercise> exercises;
        try
        {
            exercises = StarterExercises.Parse(json);
        }
        catch (JsonException exception)
        {
            return [exception.Message];
        }

        var problems = new List<string>();
        foreach (var language in Enum.GetValues<Language>())
        {
            foreach (var exercise in exercises)
            {
                var request = exercise.ToRequest(language);
                var results = new List<ValidationResult>();
                // Annotations first, then IValidatableObject (the cross-field steps), as the API checks a request.
                if (!Validator.TryValidateObject(request, new ValidationContext(request), results, true))
                {
                    problems.AddRange(results.Select(result => $"{exercise.Name.En} ({language}): {result.ErrorMessage}"));
                }
            }
        }
        return problems;
    }

    private static string Entry(
        string name = """{"en":"Squat","pl":"Przysiad"}""",
        string description = """{"en":"Deep.","pl":"Głęboki."}""",
        string metrics = "\"WEIGHT_REPS\"",
        string muscleGroups = """["LEGS"]""",
        string weightStep = "2.5",
        string extra = "") =>
        $$"""
          [{"name":{{name}},"description":{{description}},"metrics":{{metrics}},"muscleGroups":{{muscleGroups}},"weightStep":{{weightStep}}{{extra}}}]
          """;
}
