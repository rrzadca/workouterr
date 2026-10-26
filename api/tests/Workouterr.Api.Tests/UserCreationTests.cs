using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Workouterr.Api.Persistence;
using Workouterr.Api.Users;

namespace Workouterr.Api.Tests;

public class UserCreationTests(ApiFactory factory)
{
    private const string Password = "Correct-horse-1";

    [Fact]
    public async Task Create_StoresTheUserWithAHashedPassword()
    {
        using var scope = factory.Services.CreateScope();
        var userCreation = scope.ServiceProvider.GetRequiredService<UserCreationService>();

        var (result, user) = await userCreation.CreateAsync("stored@example.com", Password);

        Assert.True(result.Succeeded);
        var storedUser = await scope.ServiceProvider.GetRequiredService<AppDbContext>().Users
            .AsNoTracking()
            .SingleAsync(candidate => candidate.Id == user.Id, TestContext.Current.CancellationToken);
        Assert.Equal("stored@example.com", storedUser.Email);
        Assert.True(storedUser.EmailConfirmed);
        Assert.NotEqual(Password, storedUser.PasswordHash);
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<User>>();
        Assert.Equal(
            PasswordVerificationResult.Success,
            passwordHasher.VerifyHashedPassword(storedUser, storedUser.PasswordHash!, Password));
    }

    [Fact]
    public async Task Create_Fails_WhenTheEmailIsTaken()
    {
        using var scope = factory.Services.CreateScope();
        var userCreation = scope.ServiceProvider.GetRequiredService<UserCreationService>();
        await userCreation.CreateAsync("taken@example.com", Password);

        var (result, _) = await userCreation.CreateAsync("taken@example.com", Password);

        Assert.False(result.Succeeded);
    }

    [Fact]
    public async Task Create_Fails_WhenThePasswordIsTooWeak()
    {
        using var scope = factory.Services.CreateScope();
        var userCreation = scope.ServiceProvider.GetRequiredService<UserCreationService>();

        var (result, _) = await userCreation.CreateAsync("weak@example.com", "short");

        Assert.False(result.Succeeded);
    }
}
