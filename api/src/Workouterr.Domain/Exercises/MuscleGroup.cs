using System.Text.Json.Serialization;

namespace Workouterr.Domain.Exercises;

/// <summary>
/// The fixed list an exercise is tagged with (one or more), used to filter the exercise picker and to pre-select the
/// groups when swapping. No FULL_BODY: tick the groups instead. Upper-case names on the wire, the app's translation
/// keys. The converter sits on the type, so every serializer reads and writes these names.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<MuscleGroup>))]
public enum MuscleGroup
{
    [JsonStringEnumMemberName("CHEST")] Chest,
    [JsonStringEnumMemberName("BACK")] Back,
    [JsonStringEnumMemberName("SHOULDERS")] Shoulders,
    [JsonStringEnumMemberName("ARMS")] Arms,
    [JsonStringEnumMemberName("CORE")] Core,
    [JsonStringEnumMemberName("LEGS")] Legs,
}
