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
    private const string ResourceName = "starter-exercises.json";

    // Strict, so a typo in the file fails its test instead of quietly dropping a field: an unknown or wrongly cased
    // property, a missing one, or null where the record doesn't allow it are all errors. Enums by their wire names
    // (their own converters).
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
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

/// <summary>A text in every language an account can have, keyed by the language's wire name (<c>en</c>, <c>pl</c>).
/// A missing, null or unknown language is an error when the file is read, so adding a language to
/// <see cref="Language"/> fails the file's test until every text has it.</summary>
[JsonConverter(typeof(TranslatedTextConverter))]
public class TranslatedText(IReadOnlyDictionary<Language, string> texts)
{
    public string In(Language language) => texts[language];
}

internal class TranslatedTextConverter : JsonConverter<TranslatedText>
{
    public override TranslatedText Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        // An unknown key fails here: the enum's converter reads only its wire names.
        var texts = JsonSerializer.Deserialize<Dictionary<Language, string?>>(ref reader, options)
            ?? throw new JsonException("A translated text is null.");
        var missing = Enum.GetValues<Language>().Where(language => texts.GetValueOrDefault(language) is null).ToList();
        if (missing.Count > 0)
        {
            throw new JsonException(
                $"A translated text has no {string.Join(", ", missing.Select(WireNames.Of))} text.");
        }
        return new TranslatedText(texts.ToDictionary(pair => pair.Key, pair => pair.Value!));
    }

    // The file is only ever read.
    public override void Write(Utf8JsonWriter writer, TranslatedText value, JsonSerializerOptions options) =>
        throw new NotSupportedException();
}
