using System.Text.Json;
using System.Text.Json.Serialization;
using Workouterr.Api.Users;
using Workouterr.Domain.Exercises;

namespace Workouterr.Api.Exercises;

/// <summary>
/// The exercises every new account starts with, read once from <c>starter-exercises.json</c> (embedded in the
/// assembly). Each new user gets a copy in their language; from then on the copies are theirs, so changing this file
/// never touches existing accounts.
/// </summary>
public class StarterExercises
{
    public const string ResourceName = "starter-exercises.json";

    // Strict, so a typo in the file fails its test instead of quietly dropping a field: an unknown or wrongly cased
    // property, a missing one, or null where the record doesn't allow it are all errors. Enums by their wire names
    // (their own converters).
    public static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        PropertyNameCaseInsensitive = false,
        NumberHandling = JsonNumberHandling.Strict,
        RespectNullableAnnotations = true,
        RespectRequiredConstructorParameters = true,
        UnmappedMemberHandling = JsonUnmappedMemberHandling.Disallow,
    };

    public IReadOnlyList<StarterExercise> All { get; } = Parse(ReadResource());

    public static List<StarterExercise> Parse(string json) =>
        JsonSerializer.Deserialize<List<StarterExercise>>(json, JsonOptions)
        ?? throw new JsonException("The starter exercises are null.");

    public static string ReadResource()
    {
        using var stream = typeof(StarterExercises).Assembly.GetManifestResourceStream(ResourceName)
            ?? throw new InvalidOperationException($"The embedded resource '{ResourceName}' is missing.");
        using var reader = new StreamReader(stream);
        return reader.ReadToEnd();
    }
}

/// <summary>One entry of the file: the fields of an exercise, with the texts in every language.</summary>
public record StarterExercise(
    TranslatedText Name,
    TranslatedText Description,
    TrackedMetrics Metrics,
    List<MuscleGroup> MuscleGroups,
    decimal? WeightStep = null,
    int? TimeStepSeconds = null,
    bool PerSide = false)
{
    /// <summary>The request a user would send to create it, so the copy goes through the same limits (its test checks
    /// them) and the same trimming as an exercise made in the app.</summary>
    public ExerciseRequest ToRequest(Language language) => new(
        Name.In(language), Metrics, MuscleGroups, Description.In(language), WeightStep, TimeStepSeconds, PerSide);
}

/// <summary>A text in every language an account can have; a missing one is an error when the file is read.</summary>
public record TranslatedText(string En, string Pl)
{
    public string In(Language language) => language switch
    {
        Language.English => En,
        Language.Polish => Pl,
        _ => throw new ArgumentOutOfRangeException(nameof(language), language, null),
    };
}
