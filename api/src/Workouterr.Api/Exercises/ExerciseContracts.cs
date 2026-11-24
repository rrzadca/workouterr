using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Workouterr.Api.Validation;
using Workouterr.Domain.Exercises;

namespace Workouterr.Api.Exercises;

/// <summary>
/// Create and update send the same fields. The limits sit here as data annotations: the API checks them and the
/// OpenAPI document publishes them, so the browser's generated zod schema rejects the same values.
/// </summary>
public record ExerciseRequest(
    // The pattern means "not blank": at least one character that isn't white space. The name is stored trimmed.
    [property: Required, MinLength(1), MaxLength(Exercise.NameMaxLength), RegularExpression(ExerciseRequest.NotBlank)]
    string Name,
    TrackedMetrics Metrics,
    // One or more; a group sent twice counts once.
    [property: Required, MinLength(1)] List<MuscleGroup> MuscleGroups,
    [property: MaxLength(Exercise.DescriptionMaxLength)] string? Description = null,
    // In kg, at most 2 decimals. Required for WEIGHT_REPS and only for it.
    [property: Range(ExerciseRequest.WeightStepMin, ExerciseRequest.WeightStepMax)]
    [property: DecimalPlaces(Exercise.WeightStepScale)]
    decimal? WeightStep = null,
    // Whole seconds, 1 s – 10 min. Required for TIME and only for it.
    [property: Range(1, ExerciseRequest.TimeStepMaxSeconds)] int? TimeStepSeconds = null,
    bool PerSide = false) : IValidatableObject
{
    public const string NotBlank = @".*\S.*";

    public const int TimeStepMaxSeconds = 600;
    // Doubles, because attribute arguments can't be decimals; Range compares them with the decimal exactly enough.
    // The column (numeric(5, 2), see Exercise) holds up to 999.99, so the range is the tighter limit.
    public const double WeightStepMin = 0.01;
    public const double WeightStepMax = 100;

    // Runs only when every annotation above passed, so the steps are in range here.
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Metrics == TrackedMetrics.WeightReps ^ WeightStep is not null)
        {
            yield return new ValidationResult(
                "A weight step is required for WEIGHT_REPS and not allowed otherwise.", [nameof(WeightStep)]);
        }
        if (Metrics == TrackedMetrics.Time ^ TimeStepSeconds is not null)
        {
            yield return new ValidationResult(
                "A time step is required for TIME and not allowed otherwise.", [nameof(TimeStepSeconds)]);
        }
    }

    public void ApplyTo(Exercise exercise)
    {
        exercise.Name = Name.Trim();
        // An empty (or blank) description is no description.
        exercise.Description = string.IsNullOrWhiteSpace(Description) ? null : Description.Trim();
        exercise.Metrics = Metrics;
        exercise.WeightStep = WeightStep;
        exercise.TimeStepSeconds = TimeStepSeconds;
        exercise.PerSide = PerSide;
        exercise.MuscleGroups = MuscleGroups.Distinct().ToList();
    }
}

public record ExerciseResponse(
    Guid Id,
    string Name,
    string? Description,
    TrackedMetrics Metrics,
    decimal? WeightStep,
    int? TimeStepSeconds,
    bool PerSide,
    List<MuscleGroup> MuscleGroups,
    bool IsArchived)
{
    public static ExerciseResponse From(Exercise exercise) => new(
        exercise.Id, exercise.Name, exercise.Description, exercise.Metrics, exercise.WeightStep,
        exercise.TimeStepSeconds, exercise.PerSide, exercise.MuscleGroups, exercise.IsArchived);
}

/// <summary>The 409 to archiving an exercise that is still in routines: the app lists them, to remove it from first.</summary>
public class ExerciseInRoutinesProblem : ProblemDetails
{
    public required List<RoutineReference> Routines { get; init; }
}

public record RoutineReference(Guid Id, string Name);
