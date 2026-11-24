using Workouterr.Domain.Exercises;

namespace Workouterr.Api.Exercises;

/// <summary>One of a user's exercises: a starter one copied at registration or one they made. Never deleted while the
/// user exists: archiving hides it from pickers, and past sessions, charts and records keep pointing at it.</summary>
public class Exercise
{
    public const int NameMaxLength = 100;
    public const int DescriptionMaxLength = 2000;

    // numeric(5, 2): a weight step is at most 100 kg with at most 2 decimals.
    public const int WeightStepPrecision = 5;
    public const int WeightStepScale = 2;

    public Guid Id { get; set; }

    public Guid UserId { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    public TrackedMetrics Metrics { get; set; }

    /// <summary>The +/- and progression step for the weight, in kg (e.g. 1.25). Set only for
    /// <see cref="TrackedMetrics.WeightReps"/>; the reps step is always 1.</summary>
    public decimal? WeightStep { get; set; }

    /// <summary>The +/- and progression step for the time, in whole seconds (e.g. 5). Set only for
    /// <see cref="TrackedMetrics.Time"/>.</summary>
    public int? TimeStepSeconds { get; set; }

    /// <summary>Done one side at a time: the logged reps or time mean "each side" ("10/side").</summary>
    public bool PerSide { get; set; }

    /// <summary>One or more, no duplicates. Editable at any time; past sessions are not affected.</summary>
    public List<MuscleGroup> MuscleGroups { get; set; } = [];

    public bool IsArchived { get; set; }
}
