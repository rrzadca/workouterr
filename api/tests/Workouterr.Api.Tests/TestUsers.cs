using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Workouterr.Api.Auth;
using Workouterr.Api.Persistence;
using Workouterr.Api.Users;

namespace Workouterr.Api.Tests;

/// <summary>Creating and logging in test users, shared by every test class that needs one.</summary>
public static class TestUsers
{
    public const string Password = "Correct-horse-1";

    // The same path as `user create`, so a test logs in a user exactly like one the owner made.
    public static async Task<User> CreateUserAsync(this WebApplicationFactory<Program> application, string email)
    {
        using var scope = application.Services.CreateScope();
        var (result, user) = await scope.ServiceProvider.GetRequiredService<UserCreationService>()
            .CreateAsync(email, Password);
        Assert.True(result.Succeeded);
        return user;
    }

    // For tests that count or name exactly the exercises they store: the user without the starter set (copying it is
    // UserCreationTests' subject).
    public static async Task<User> CreateUserWithoutExercisesAsync(
        this WebApplicationFactory<Program> application, string email)
    {
        var user = await application.CreateUserAsync(email);
        using var scope = application.Services.CreateScope();
        await scope.ServiceProvider.GetRequiredService<AppDbContext>().Exercises
            .Where(exercise => exercise.UserId == user.Id)
            .ExecuteDeleteAsync(TestContext.Current.CancellationToken);
        return user;
    }

    // A new client is a new browser: its own cookie container, so its own login.
    public static async Task<HttpClient> LogInAsync(this WebApplicationFactory<Program> application, string email)
    {
        var client = application.CreateClient();
        using var login = await client.PostAsJsonAsync(
            "/api/auth/login", new LoginRequest(email, Password), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        return client;
    }
}
