using System.Security.Claims;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using Workouterr.Api.Persistence;
using Workouterr.Api.Users;
using Workouterr.Domain.Exercises;

namespace Workouterr.Api.Exercises;

public static class ExerciseEndpoints
{
    public static void MapExerciseEndpoints(this IEndpointRouteBuilder endpoints)
    {
        var exercises = endpoints.MapGroup("/api/exercises")
            .WithTags("Exercises")
            .RequireAuthorization()
            .ProducesProblem(StatusCodes.Status401Unauthorized);

        exercises.MapGet("", ListExercises)
            .WithName("ListExercises")
            .ProducesValidationProblem()
            // The handler binds the groups as strings (see ListExercises); the document shows what they are.
            .AddOpenApiOperationTransformer((operation, context, _) =>
            {
                var parameter = (OpenApiParameter)operation.Parameters!.Single(
                    parameter => parameter.Name == MuscleGroupsParameter);
                parameter.Schema = new OpenApiSchema
                {
                    Type = JsonSchemaType.Array,
                    Items = new OpenApiSchemaReference(nameof(MuscleGroup), context.Document),
                };
                return Task.CompletedTask;
            });

        exercises.MapPost("", CreateExercise)
            .WithName("CreateExercise")
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status409Conflict);

        // PUT: the form sends the whole exercise. A field added later must be optional, with "missing" meaning "keep",
        // so an older client never resets it.
        exercises.MapPut("/{id:guid}", UpdateExercise)
            .WithName("UpdateExercise")
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status404NotFound);

        // Archive and restore are actions, not field edits: idempotent, and each answers with the exercise as it now is.
        exercises.MapPost("/{id:guid}/archive", ArchiveExercise)
            .WithName("ArchiveExercise")
            .ProducesProblem(StatusCodes.Status404NotFound)
            .Produces<ExerciseInRoutinesProblem>(StatusCodes.Status409Conflict, "application/problem+json");

        exercises.MapPost("/{id:guid}/restore", RestoreExercise)
            .WithName("RestoreExercise")
            .ProducesProblem(StatusCodes.Status404NotFound);
    }

    private const string MuscleGroupsParameter = "muscleGroups";

    /// <summary>The active exercises (or, with <paramref name="archived"/>, the archived ones), by name. With muscle
    /// groups, only the exercises that have at least one of them.</summary>
    /// <remarks>Query binding parses an enum by its C# name (<c>Arms</c>), so the groups arrive as strings and are read
    /// by their wire names (<c>ARMS</c>), like in a JSON body.</remarks>
    private static async Task<Results<Ok<List<ExerciseResponse>>, ValidationProblem>> ListExercises(
        ClaimsPrincipal principal, UserManager<User> userManager, AppDbContext database,
        [FromQuery(Name = MuscleGroupsParameter)] string[]? muscleGroupNames = null, [FromQuery] bool archived = false)
    {
        var muscleGroups = new List<MuscleGroup>();
        foreach (var name in muscleGroupNames ?? [])
        {
            if (!WireNames.TryParse<MuscleGroup>(name, out var group))
            {
                return TypedResults.ValidationProblem(new Dictionary<string, string[]>
                {
                    [MuscleGroupsParameter] = [$"'{name}' is not a muscle group."],
                });
            }
            muscleGroups.Add(group);
        }

        var userId = UserId(principal, userManager);
        var query = database.Exercises.AsNoTracking()
            .Where(exercise => exercise.UserId == userId && exercise.IsArchived == archived);
        if (muscleGroups.Count > 0)
        {
            // The arrays overlap: the exercise has at least one of the groups.
            query = query.Where(exercise => exercise.MuscleGroups.Any(group => muscleGroups.Contains(group)));
        }

        var found = await query
            .OrderBy(exercise => exercise.Name)
            .ThenBy(exercise => exercise.Id)
            .ToListAsync();
        return TypedResults.Ok(found.Select(ExerciseResponse.From).ToList());
    }

    private static async Task<Results<Created<ExerciseResponse>, ProblemHttpResult>> CreateExercise(
        ExerciseRequest request, ClaimsPrincipal principal, UserManager<User> userManager,
        AppDbContext database)
    {
        var userId = UserId(principal, userManager);
        // Archived ones count too: archiving is how an exercise is deleted, so it would otherwise not limit anything.
        // Two creates at the same moment could both pass the count and end one over; the limit guards against abuse,
        // not against that.
        if (await database.Exercises.CountAsync(exercise => exercise.UserId == userId) >= Exercise.MaxPerUser)
        {
            return TypedResults.Problem(
                statusCode: StatusCodes.Status409Conflict,
                title: $"An account can have at most {Exercise.MaxPerUser} exercises, archived ones included.");
        }

        var exercise = new Exercise { UserId = userId, Name = "" };
        request.ApplyTo(exercise);
        database.Exercises.Add(exercise);
        await database.SaveChangesAsync();
        return TypedResults.Created($"/api/exercises/{exercise.Id}", ExerciseResponse.From(exercise));
    }

    private static async Task<Results<Ok<ExerciseResponse>, ProblemHttpResult>> UpdateExercise(
        Guid id, ExerciseRequest request, ClaimsPrincipal principal, UserManager<User> userManager,
        AppDbContext database)
    {
        // TODO(task 29): once sessions exist, refuse to change the tracked metrics of an exercise used in one.
        var exercise = await FindAsync(database, id, UserId(principal, userManager));
        if (exercise is null)
        {
            return NotFound();
        }

        request.ApplyTo(exercise);
        await database.SaveChangesAsync();
        return TypedResults.Ok(ExerciseResponse.From(exercise));
    }

    private static async Task<Results<Ok<ExerciseResponse>, ProblemHttpResult>> ArchiveExercise(
        Guid id, ClaimsPrincipal principal, UserManager<User> userManager, AppDbContext database)
    {
        // TODO(task 25): answer 409 with an ExerciseInRoutinesProblem while the exercise is in a routine.
        return await SetArchivedAsync(database, id, UserId(principal, userManager), archived: true);
    }

    private static async Task<Results<Ok<ExerciseResponse>, ProblemHttpResult>> RestoreExercise(
        Guid id, ClaimsPrincipal principal, UserManager<User> userManager, AppDbContext database) =>
        await SetArchivedAsync(database, id, UserId(principal, userManager), archived: false);

    private static async Task<Results<Ok<ExerciseResponse>, ProblemHttpResult>> SetArchivedAsync(
        AppDbContext database, Guid id, Guid userId, bool archived)
    {
        var exercise = await FindAsync(database, id, userId);
        if (exercise is null)
        {
            return NotFound();
        }

        exercise.IsArchived = archived;
        await database.SaveChangesAsync();
        return TypedResults.Ok(ExerciseResponse.From(exercise));
    }

    // Another user's exercise is "not found", never "forbidden": the answer doesn't reveal that the ID exists.
    private static Task<Exercise?> FindAsync(AppDbContext database, Guid id, Guid userId) =>
        database.Exercises.SingleOrDefaultAsync(exercise => exercise.Id == id && exercise.UserId == userId);

    private static ProblemHttpResult NotFound() =>
        TypedResults.Problem(statusCode: StatusCodes.Status404NotFound, title: "Exercise not found");

    // RequireAuthorization guarantees a logged-in user, so the ID claim is there. The user's row isn't loaded: if the
    // account was deleted, its exercises went with it and every query simply finds nothing.
    private static Guid UserId(ClaimsPrincipal principal, UserManager<User> userManager) =>
        Guid.Parse(userManager.GetUserId(principal)!);
}
