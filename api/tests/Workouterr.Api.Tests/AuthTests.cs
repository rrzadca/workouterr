using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Workouterr.Api.Auth;
using Workouterr.Api.Users;

namespace Workouterr.Api.Tests;

public class AuthTests(ApiFactory factory)
{
    [Fact]
    public async Task Login_SignsInAUserCreatedLikeTheCliDoes()
    {
        var user = await factory.CreateUserAsync("login@example.com");
        using var client = factory.CreateClient();

        using var response = await LoginAsync(client, "login@example.com", TestUsers.Password);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var loggedIn = await response.Content.ReadFromJsonAsync<CurrentUserResponse>(
            TestContext.Current.CancellationToken);
        Assert.Equal(new CurrentUserResponse(user.Id, "login@example.com"), loggedIn);

        // The client keeps the cookie the login set, so the next request is signed in.
        var currentUser = await client.GetFromJsonAsync<CurrentUserResponse>(
            "/api/auth/me", TestContext.Current.CancellationToken);
        Assert.Equal(user.Id, currentUser?.Id);
    }

    [Fact]
    public async Task Login_Fails_WithAWrongPassword()
    {
        await factory.CreateUserAsync("wrong-password@example.com");
        using var client = factory.CreateClient();

        using var response = await LoginAsync(client, "wrong-password@example.com", "Wrong-horse-12");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Equal(HttpStatusCode.Unauthorized, await GetMeStatusAsync(client));
    }

    [Fact]
    public async Task Login_AnswersAnUnknownEmailExactlyLikeAWrongPassword()
    {
        await factory.CreateUserAsync("known@example.com");
        using var client = factory.CreateClient();

        using var wrongPassword = await LoginAsync(client, "known@example.com", "Wrong-horse-12");
        using var unknownEmail = await LoginAsync(client, "unknown@example.com", "Wrong-horse-12");

        Assert.Equal(wrongPassword.StatusCode, unknownEmail.StatusCode);
        Assert.Equal(await ReadProblemAsync(wrongPassword), await ReadProblemAsync(unknownEmail));
    }

    [Fact]
    public async Task Login_AnswersAnUnverifiedEmailExactlyLikeAWrongPassword()
    {
        // Not through UserCreationService: it marks the email verified, as the CLI and invites do.
        using (var scope = factory.Services.CreateScope())
        {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var unverified = new User { UserName = "unverified@example.com", Email = "unverified@example.com" };
            Assert.True((await userManager.CreateAsync(unverified, TestUsers.Password)).Succeeded);
        }

        await factory.CreateUserAsync("verified@example.com");
        using var client = factory.CreateClient();

        using var wrongPassword = await LoginAsync(client, "verified@example.com", "Wrong-horse-12");
        using var unverifiedEmail = await LoginAsync(client, "unverified@example.com", TestUsers.Password);

        Assert.Equal(wrongPassword.StatusCode, unverifiedEmail.StatusCode);
        Assert.Equal(await ReadProblemAsync(wrongPassword), await ReadProblemAsync(unverifiedEmail));
    }

    [Fact]
    public async Task Login_RejectsAnEmptyEmail()
    {
        using var client = factory.CreateClient();

        using var response = await LoginAsync(client, "", TestUsers.Password);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Logout_EndsTheLogin()
    {
        await factory.CreateUserAsync("logout@example.com");
        using var client = factory.CreateClient();
        using var login = await LoginAsync(client, "logout@example.com", TestUsers.Password);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);

        using var response = await client.PostAsync("/api/auth/logout", null, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, await GetMeStatusAsync(client));
    }

    [Fact]
    public async Task Me_IsUnauthorized_WithoutALogin()
    {
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/api/auth/me", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    private static Task<HttpResponseMessage> LoginAsync(HttpClient client, string email, string password) =>
        client.PostAsJsonAsync(
            "/api/auth/login", new LoginRequest(email, password), TestContext.Current.CancellationToken);

    // Everything a client sees except the trace ID, which differs on every request.
    private static async Task<(string? Type, string? Title, int? Status, string? Detail)> ReadProblemAsync(
        HttpResponseMessage response)
    {
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>(TestContext.Current.CancellationToken);
        return (problem?.Type, problem?.Title, problem?.Status, problem?.Detail);
    }

    private static async Task<HttpStatusCode> GetMeStatusAsync(HttpClient client)
    {
        using var response = await client.GetAsync("/api/auth/me", TestContext.Current.CancellationToken);
        return response.StatusCode;
    }
}
