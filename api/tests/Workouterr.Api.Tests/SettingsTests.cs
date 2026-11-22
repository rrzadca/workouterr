using System.Net;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Workouterr.Api.Auth;
using Workouterr.Api.Settings;
using Workouterr.Api.Users;

namespace Workouterr.Api.Tests;

public class SettingsTests(ApiFactory factory)
{
    private const string Password = "Correct-horse-1";

    [Fact]
    public async Task Get_ReturnsTheDefaults_ForANewAccount()
    {
        using var client = await LoggedInClientAsync("settings-defaults@example.com");

        var settings = await GetSettingsAsync(client);

        Assert.Equal(new SettingsResponse(DisplayName: null, Theme: null, RestTimerSound: true), settings);
    }

    [Fact]
    public async Task Update_ChangesOnlyTheFieldsItSends()
    {
        using var client = await LoggedInClientAsync("settings-partial@example.com");
        await UpdateAsync(client, new UpdateSettingsRequest(DisplayName: "Rad", RestTimerSound: false));

        using var response = await UpdateAsync(client, new UpdateSettingsRequest(Theme: Theme.Dark));

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var expected = new SettingsResponse("Rad", Theme.Dark, RestTimerSound: false);
        Assert.Equal(expected, await response.Content.ReadFromJsonAsync<SettingsResponse>(
            TestContext.Current.CancellationToken));
        Assert.Equal(expected, await GetSettingsAsync(client));
    }

    [Fact]
    public async Task Update_TrimsTheDisplayName_AndAnEmptyOneRemovesIt()
    {
        using var client = await LoggedInClientAsync("settings-name@example.com");

        await UpdateAsync(client, new UpdateSettingsRequest(DisplayName: "  Rad  "));
        Assert.Equal("Rad", (await GetSettingsAsync(client)).DisplayName);

        await UpdateAsync(client, new UpdateSettingsRequest(DisplayName: "   "));
        Assert.Null((await GetSettingsAsync(client)).DisplayName);
    }

    [Fact]
    public async Task Update_RejectsADisplayNameOver50Characters()
    {
        using var client = await LoggedInClientAsync("settings-long-name@example.com");

        using var response = await UpdateAsync(client, new UpdateSettingsRequest(DisplayName: new string('a', 51)));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Null((await GetSettingsAsync(client)).DisplayName);
    }

    [Fact]
    public async Task Theme_TravelsAsALowerCaseName()
    {
        using var client = await LoggedInClientAsync("settings-theme-json@example.com");

        using var response = await client.PatchAsync("/api/settings",
            JsonContent.Create(new { theme = "dark" }), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("\"theme\":\"dark\"",
            await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    // The task's "done when": a theme chosen in one browser applies in another after login.
    [Fact]
    public async Task Theme_SavedOnOneLogin_ComesBackOnAnother()
    {
        using var firstBrowser = await LoggedInClientAsync("settings-two-browsers@example.com");
        await UpdateAsync(firstBrowser, new UpdateSettingsRequest(Theme: Theme.Dark));

        using var secondBrowser = await LogInAsync("settings-two-browsers@example.com");

        Assert.Equal(Theme.Dark, (await GetSettingsAsync(secondBrowser)).Theme);
    }

    [Fact]
    public async Task Settings_AreUnauthorized_WithoutALogin()
    {
        using var client = factory.CreateClient();

        using var get = await client.GetAsync("/api/settings", TestContext.Current.CancellationToken);
        using var update = await UpdateAsync(client, new UpdateSettingsRequest(Theme: Theme.Dark));

        Assert.Equal(HttpStatusCode.Unauthorized, get.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, update.StatusCode);
    }

    private async Task<HttpClient> LoggedInClientAsync(string email)
    {
        using (var scope = factory.Services.CreateScope())
        {
            var (result, _) = await scope.ServiceProvider.GetRequiredService<UserCreationService>()
                .CreateAsync(email, Password);
            Assert.True(result.Succeeded);
        }
        return await LogInAsync(email);
    }

    // A new client is a new browser: its own cookie container, so its own login.
    private async Task<HttpClient> LogInAsync(string email)
    {
        var client = factory.CreateClient();
        using var login = await client.PostAsJsonAsync(
            "/api/auth/login", new LoginRequest(email, Password), TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        return client;
    }

    private static async Task<SettingsResponse> GetSettingsAsync(HttpClient client) =>
        (await client.GetFromJsonAsync<SettingsResponse>("/api/settings", TestContext.Current.CancellationToken))!;

    private static Task<HttpResponseMessage> UpdateAsync(HttpClient client, UpdateSettingsRequest request) =>
        client.PatchAsJsonAsync("/api/settings", request, TestContext.Current.CancellationToken);
}
