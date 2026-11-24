using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Workouterr.Api.Exercises;
using Workouterr.Api.Persistence;
using Workouterr.Domain.Exercises;

namespace Workouterr.Api.Tests;

/// <summary>The exercise columns against real PostgreSQL: the exact weight step, the muscle-group array and its filter,
/// and the cascade from the user.</summary>
public class ExerciseStorageTests(ApiFactory factory)
{
    [Fact]
    public async Task AnExercise_ReadsBackAsStored()
    {
        var user = await factory.CreateUserAsync("exercise-stored@example.com");
        var stored = await StoreAsync(new Exercise
        {
            UserId = user.Id,
            Name = "Bench press",
            Description = "Flat bench, barbell.",
            Metrics = TrackedMetrics.WeightReps,
            WeightStep = 1.25m,
            MuscleGroups = [MuscleGroup.Chest, MuscleGroup.Arms, MuscleGroup.Shoulders],
        });

        var loaded = await QueryAsync(exercises => exercises.SingleAsync(
            exercise => exercise.Id == stored.Id, TestContext.Current.CancellationToken));

        Assert.Equal("Bench press", loaded.Name);
        Assert.Equal("Flat bench, barbell.", loaded.Description);
        Assert.Equal(TrackedMetrics.WeightReps, loaded.Metrics);
        Assert.Equal(1.25m, loaded.WeightStep);
        Assert.Null(loaded.TimeStepSeconds);
        Assert.False(loaded.PerSide);
        Assert.Equal([MuscleGroup.Chest, MuscleGroup.Arms, MuscleGroup.Shoulders], loaded.MuscleGroups);
        Assert.False(loaded.IsArchived);
    }

    [Fact]
    public async Task FilteringByMuscleGroup_MatchesExercisesThatHaveIt()
    {
        var user = await factory.CreateUserAsync("exercise-filter@example.com");
        await StoreAsync(new Exercise
        {
            UserId = user.Id,
            Name = "Squat",
            Metrics = TrackedMetrics.WeightReps,
            WeightStep = 2.5m,
            MuscleGroups = [MuscleGroup.Legs, MuscleGroup.Core],
        });
        await StoreAsync(new Exercise
        {
            UserId = user.Id,
            Name = "Plank",
            Metrics = TrackedMetrics.Time,
            TimeStepSeconds = 5,
            MuscleGroups = [MuscleGroup.Core],
        });
        await StoreAsync(new Exercise
        {
            UserId = user.Id,
            Name = "Pull-up",
            Metrics = TrackedMetrics.Reps,
            MuscleGroups = [MuscleGroup.Back],
        });

        var names = await QueryAsync(exercises => exercises
            .Where(exercise => exercise.UserId == user.Id && exercise.MuscleGroups.Contains(MuscleGroup.Core))
            .OrderBy(exercise => exercise.Name)
            .Select(exercise => exercise.Name)
            .ToListAsync(TestContext.Current.CancellationToken));

        Assert.Equal(["Plank", "Squat"], names);
    }

    [Fact]
    public async Task DeletingTheUser_DeletesTheirExercises()
    {
        var user = await factory.CreateUserAsync("exercise-cascade@example.com");
        var stored = await StoreAsync(new Exercise
        {
            UserId = user.Id,
            Name = "Lunge",
            Metrics = TrackedMetrics.Reps,
            PerSide = true,
            MuscleGroups = [MuscleGroup.Legs],
        });

        using (var scope = factory.Services.CreateScope())
        {
            await scope.ServiceProvider.GetRequiredService<AppDbContext>().Users
                .Where(candidate => candidate.Id == user.Id)
                .ExecuteDeleteAsync(TestContext.Current.CancellationToken);
        }

        Assert.False(await QueryAsync(exercises => exercises.AnyAsync(
            exercise => exercise.Id == stored.Id, TestContext.Current.CancellationToken)));
    }

    private async Task<Exercise> StoreAsync(Exercise exercise)
    {
        using var scope = factory.Services.CreateScope();
        var database = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        database.Exercises.Add(exercise);
        await database.SaveChangesAsync(TestContext.Current.CancellationToken);
        return exercise;
    }

    // A fresh context, so the result comes from the database and not from the one that stored it.
    private async Task<T> QueryAsync<T>(Func<IQueryable<Exercise>, Task<T>> query)
    {
        using var scope = factory.Services.CreateScope();
        return await query(scope.ServiceProvider.GetRequiredService<AppDbContext>().Exercises.AsNoTracking());
    }
}
