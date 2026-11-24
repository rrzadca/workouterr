using System.Text.Json.Serialization;

namespace Workouterr.Domain.Exercises;

/// <summary>
/// What a set of the exercise records: bench press = weight + reps, pull-up = reps, plank = time. Fixed once the
/// exercise has been used in a session. Upper-case names on the wire, like <see cref="MuscleGroup"/>.
/// </summary>
[JsonConverter(typeof(JsonStringEnumConverter<TrackedMetrics>))]
public enum TrackedMetrics
{
    [JsonStringEnumMemberName("WEIGHT_REPS")] WeightReps,
    [JsonStringEnumMemberName("REPS")] Reps,
    [JsonStringEnumMemberName("TIME")] Time,
}
