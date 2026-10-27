using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Time.Testing;
using Microsoft.Net.Http.Headers;
using Workouterr.Api.Auth;
using Workouterr.Api.Persistence;
using Workouterr.Api.Users;

namespace Workouterr.Api.Tests;

/// <summary>
/// Logins kept server-side: the tests send the cookie by hand, so they can keep a copy of it, as an attacker who stole
/// it would.
/// </summary>
public class LoginStorageTests(ApiFactory factory)
{
    private const string Password = "Correct-horse-1";

    [Fact]
    public async Task Login_SetsAStrictSecureHttpOnlyCookieFor30Days()
    {
        await CreateUserAsync("cookie@example.com");
        using var client = CreateClient(factory);

        using var response = await client.PostAsJsonAsync(
            "/api/auth/login", new LoginRequest("cookie@example.com", Password), TestContext.Current.CancellationToken);

        var cookie = SetCookieHeaderValue.Parse(response.Headers.GetValues(HeaderNames.SetCookie).Single());
        Assert.True(cookie.HttpOnly);
        Assert.True(cookie.Secure);
        Assert.Equal(Microsoft.Net.Http.Headers.SameSiteMode.Strict, cookie.SameSite);
        Assert.NotNull(cookie.Expires);
        Assert.InRange(
            cookie.Expires.Value - DateTimeOffset.UtcNow,
            LoginLifetime.Sliding - TimeSpan.FromMinutes(1),
            LoginLifetime.Sliding);
    }

    [Fact]
    public async Task Logout_EndsTheLogin_EvenForACopyOfTheCookie()
    {
        await CreateUserAsync("logout-copy@example.com");
        var cookie = await LoginAsync(factory, "logout-copy@example.com");
        Assert.Equal(HttpStatusCode.OK, await GetMeStatusAsync(factory, cookie));

        using var logout = await SendAsync(factory, HttpMethod.Post, "/api/auth/logout", cookie);
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);

        // A cookie alone would still be valid here; the login it points to is gone.
        Assert.Equal(HttpStatusCode.Unauthorized, await GetMeStatusAsync(factory, cookie));
    }

    [Fact]
    public async Task SecurityStampChange_EndsTheLogin_OnTheNextRequest()
    {
        var user = await CreateUserAsync("stamp@example.com");
        var cookie = await LoginAsync(factory, "stamp@example.com");
        Assert.Equal(HttpStatusCode.OK, await GetMeStatusAsync(factory, cookie));

        // What a password change or reset does.
        using (var scope = factory.Services.CreateScope())
        {
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<User>>();
            var storedUser = await userManager.FindByIdAsync(user.Id.ToString());
            Assert.True((await userManager.UpdateSecurityStampAsync(storedUser!)).Succeeded);
        }

        Assert.Equal(HttpStatusCode.Unauthorized, await GetMeStatusAsync(factory, cookie));
        Assert.Equal(0, await CountLoginsAsync(user));
    }

    [Fact]
    public async Task Login_ReplacesTheSessionId_WhenAlreadyLoggedIn()
    {
        var user = await CreateUserAsync("rotate@example.com");
        var firstCookie = await LoginAsync(factory, "rotate@example.com");

        var secondCookie = await LoginAsync(factory, "rotate@example.com", firstCookie);

        Assert.Equal(HttpStatusCode.Unauthorized, await GetMeStatusAsync(factory, firstCookie));
        Assert.Equal(HttpStatusCode.OK, await GetMeStatusAsync(factory, secondCookie));
        Assert.Equal(1, await CountLoginsAsync(user));
    }

    [Fact]
    public async Task Login_IsRenewedAtMostOnceADay()
    {
        var time = new FakeTimeProvider(DateTimeOffset.UtcNow);
        await using var application = WithTime(time);
        await CreateUserAsync("renew@example.com");
        var cookie = await LoginAsync(application, "renew@example.com");

        time.Advance(TimeSpan.FromHours(23));
        using (var sameDay = await SendAsync(application, HttpMethod.Get, "/api/auth/me", cookie))
        {
            Assert.Equal(HttpStatusCode.OK, sameDay.StatusCode);
            Assert.False(sameDay.Headers.Contains(HeaderNames.SetCookie));
        }

        time.Advance(TimeSpan.FromHours(2));
        using var nextDay = await SendAsync(application, HttpMethod.Get, "/api/auth/me", cookie);
        Assert.Equal(HttpStatusCode.OK, nextDay.StatusCode);
        Assert.True(nextDay.Headers.Contains(HeaderNames.SetCookie));
    }

    [Fact]
    public async Task Login_IsExtendedByUse_AndExpiresAfter30DaysUnused()
    {
        var time = new FakeTimeProvider(DateTimeOffset.UtcNow);
        await using var application = WithTime(time);
        await CreateUserAsync("sliding@example.com");
        var cookie = await LoginAsync(application, "sliding@example.com");

        // 58 days in, still logged in: each use moved the expiry 30 days on.
        time.Advance(TimeSpan.FromDays(29));
        Assert.Equal(HttpStatusCode.OK, await GetMeStatusAsync(application, cookie));
        time.Advance(TimeSpan.FromDays(29));
        Assert.Equal(HttpStatusCode.OK, await GetMeStatusAsync(application, cookie));

        time.Advance(TimeSpan.FromDays(31));
        Assert.Equal(HttpStatusCode.Unauthorized, await GetMeStatusAsync(application, cookie));
    }

    [Fact]
    public async Task Login_ExpiresAfter90Days_EvenWhenUsedEveryFewDays()
    {
        var time = new FakeTimeProvider(DateTimeOffset.UtcNow);
        await using var application = WithTime(time);
        await CreateUserAsync("maximum@example.com");
        var cookie = await LoginAsync(application, "maximum@example.com");

        for (var day = 20; day <= 80; day += 20)
        {
            time.Advance(TimeSpan.FromDays(20));
            Assert.Equal(HttpStatusCode.OK, await GetMeStatusAsync(application, cookie));
        }

        time.Advance(TimeSpan.FromDays(9));
        Assert.Equal(HttpStatusCode.OK, await GetMeStatusAsync(application, cookie));

        time.Advance(TimeSpan.FromDays(2));
        Assert.Equal(HttpStatusCode.Unauthorized, await GetMeStatusAsync(application, cookie));
    }

    // The same API and database, on a clock the test moves.
    private WebApplicationFactory<Program> WithTime(TimeProvider time) =>
        factory.WithWebHostBuilder(builder => builder.ConfigureServices(services => services.AddSingleton(time)));

    private async Task<User> CreateUserAsync(string email)
    {
        using var scope = factory.Services.CreateScope();
        var (result, user) = await scope.ServiceProvider.GetRequiredService<UserCreationService>()
            .CreateAsync(email, Password);
        Assert.True(result.Succeeded);
        return user;
    }

    private async Task<int> CountLoginsAsync(User user)
    {
        using var scope = factory.Services.CreateScope();
        return await scope.ServiceProvider.GetRequiredService<AppDbContext>().Logins
            .CountAsync(login => login.UserId == user.Id, TestContext.Current.CancellationToken);
    }

    // Logs in and returns the cookie as a Cookie header value (name=value).
    private static async Task<string> LoginAsync(
        WebApplicationFactory<Program> application, string email, string? currentCookie = null)
    {
        using var client = CreateClient(application);
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login")
        {
            Content = JsonContent.Create(new LoginRequest(email, Password)),
        };
        if (currentCookie is not null)
        {
            request.Headers.Add(HeaderNames.Cookie, currentCookie);
        }

        using var response = await client.SendAsync(request, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var cookie = SetCookieHeaderValue.Parse(response.Headers.GetValues(HeaderNames.SetCookie).Single());
        return $"{cookie.Name}={cookie.Value}";
    }

    private static async Task<HttpResponseMessage> SendAsync(
        WebApplicationFactory<Program> application, HttpMethod method, string path, string cookie)
    {
        using var client = CreateClient(application);
        using var request = new HttpRequestMessage(method, path);
        request.Headers.Add(HeaderNames.Cookie, cookie);
        return await client.SendAsync(request, TestContext.Current.CancellationToken);
    }

    private static async Task<HttpStatusCode> GetMeStatusAsync(WebApplicationFactory<Program> application, string cookie)
    {
        using var response = await SendAsync(application, HttpMethod.Get, "/api/auth/me", cookie);
        return response.StatusCode;
    }

    // No cookie container: each request carries exactly the cookie the test gives it.
    private static HttpClient CreateClient(WebApplicationFactory<Program> application) =>
        application.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = false,
        });
}
