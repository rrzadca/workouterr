using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Workouterr.Api.Exercises;
using Workouterr.Api.Persistence;
using Workouterr.Api.Users;

namespace Workouterr.Api.Tests;

public class UserCreationTests(ApiFactory factory)
{
    [Fact]
    public async Task Create_StoresTheUserWithAHashedPassword()
    {
        using var scope = factory.Services.CreateScope();
        var userCreation = scope.ServiceProvider.GetRequiredService<UserCreationService>();

        var (result, user) = await userCreation.CreateAsync("stored@example.com", TestUsers.Password);

        Assert.True(result.Succeeded);
        var storedUser = await scope.ServiceProvider.GetRequiredService<AppDbContext>().Users
            .AsNoTracking()
            .SingleAsync(candidate => candidate.Id == user.Id, TestContext.Current.CancellationToken);
        Assert.Equal("stored@example.com", storedUser.Email);
        Assert.True(storedUser.EmailConfirmed);
        Assert.NotEqual(TestUsers.Password, storedUser.PasswordHash);
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();
        Assert.Equal(
            PasswordVerificationResult.Success,
            passwordHasher.VerifyHashedPassword(storedUser, storedUser.PasswordHash!, TestUsers.Password));
    }

    [Theory]
    [InlineData(Language.English)]
    [InlineData(Language.Polish)]
    public async Task Create_CopiesTheStarterExercises_InTheUsersLanguage(Language language)
    {
        using var scope = factory.Services.CreateScope();
        var userCreation = scope.ServiceProvider.GetRequiredService<UserCreationService>();
        var starterExercises = scope.ServiceProvider.GetRequiredService<StarterExercises>().All;

        var (_, user) = await userCreation.CreateAsync($"starter-{language}@example.com", TestUsers.Password, language);

        var database = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        Assert.Equal(language, (await database.Users.AsNoTracking()
            .SingleAsync(candidate => candidate.Id == user.Id, TestContext.Current.CancellationToken)).Language);
        var exercises = await database.Exercises.AsNoTracking()
            .Where(exercise => exercise.UserId == user.Id)
            .ToListAsync(TestContext.Current.CancellationToken);
        Assert.Equal(
            starterExercises.Select(starter => starter.Name.In(language)).Order(),
            exercises.Select(exercise => exercise.Name).Order());
        var benchPress = Assert.Single(exercises, exercise => exercise.Name == starterExercises[0].Name.In(language));
        Assert.Equal(starterExercises[0].Description.In(language), benchPress.Description);
        Assert.Equal(starterExercises[0].WeightStep, benchPress.WeightStep);
        Assert.Equal(starterExercises[0].MuscleGroups, benchPress.MuscleGroups);
        Assert.All(exercises, exercise => Assert.False(exercise.IsArchived));
    }

    [Fact]
    public async Task Create_IsEnglish_UnlessTold()
    {
        using var scope = factory.Services.CreateScope();
        var userCreation = scope.ServiceProvider.GetRequiredService<UserCreationService>();

        var (_, user) = await userCreation.CreateAsync("starter-default@example.com", TestUsers.Password);

        Assert.Equal(Language.English, user.Language);
        var names = await scope.ServiceProvider.GetRequiredService<AppDbContext>().Exercises.AsNoTracking()
            .Where(exercise => exercise.UserId == user.Id)
            .Select(exercise => exercise.Name)
            .ToListAsync(TestContext.Current.CancellationToken);
        Assert.Contains("Bench press", names);
    }

    [Fact]
    public async Task Create_Fails_WhenTheEmailIsTaken()
    {
        using var scope = factory.Services.CreateScope();
        var userCreation = scope.ServiceProvider.GetRequiredService<UserCreationService>();
        await userCreation.CreateAsync("taken@example.com", TestUsers.Password);

        var (result, _) = await userCreation.CreateAsync("taken@example.com", TestUsers.Password);

        Assert.False(result.Succeeded);
    }

    [Fact]
    public async Task Create_Fails_WhenThePasswordIsShorterThan12Characters()
    {
        using var scope = factory.Services.CreateScope();
        var userCreation = scope.ServiceProvider.GetRequiredService<UserCreationService>();

        var (result, _) = await userCreation.CreateAsync("short@example.com", "abcdefghij1");

        Assert.False(result.Succeeded);
    }

    [Fact]
    public async Task Create_AcceptsA12CharacterPasswordOfLowercaseLettersOnly()
    {
        using var scope = factory.Services.CreateScope();
        var userCreation = scope.ServiceProvider.GetRequiredService<UserCreationService>();

        var (result, _) = await userCreation.CreateAsync("letters@example.com", "abcdefghijkl");

        Assert.True(result.Succeeded);
    }
}
