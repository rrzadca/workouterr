using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Testing;
using Workouterr.Api.Auth;
using Workouterr.Api.Diagnostics;
using Workouterr.Api.Users;

namespace Workouterr.Api.Tests;

public class DiagnosticsTests(ApiFactory factory)
{
    // The task's "done when", API side: a thrown exception is logged as an error with the user's ID, and nothing logged
    // on the way (login included) holds the email.
    [Fact]
    public async Task UnhandledException_IsLoggedWithTheUserId_AndNoEmail()
    {
        const string email = "diagnostics-exception@example.com";
        await using var application = factory.WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
            services.AddSingleton<HealthCheckService, ThrowingHealthCheckService>()));
        var user = await application.CreateUserAsync(email);
        using var client = await application.LogInAsync(email);

        using var response = await client.GetAsync("/api/health", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var records = application.Services.GetFakeLogCollector().GetSnapshot();
        var error = Assert.Single(records, record => record.Exception is TestException);
        Assert.Equal(LogLevel.Error, error.Level);
        Assert.Equal(user.Id.ToString(), UserIdOf(error));
        Assert.All(records, record => Assert.DoesNotContain(email, Describe(record), StringComparison.OrdinalIgnoreCase));
    }

    // The task's "done when", app side: an error the app reports lands in the same log, with the user's ID.
    [Fact]
    public async Task ClientError_IsLoggedWithTheUserId_AndNoEmail()
    {
        const string email = "diagnostics-client-error@example.com";
        var user = await factory.CreateUserAsync(email);
        using var client = await factory.LogInAsync(email);
        var message = $"Test client error {Guid.NewGuid()}";

        using var response = await client.PostAsJsonAsync("/api/client-errors",
            new ReportClientErrorRequest(message, "Error: boom\n    at main.js:1:1", "/settings"),
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var error = Assert.Single(factory.Services.GetFakeLogCollector().GetSnapshot(),
            record => record.Message.Contains(message));
        Assert.Equal(LogLevel.Error, error.Level);
        Assert.Contains("/settings", error.Message);
        Assert.Equal(user.Id.ToString(), UserIdOf(error));
        Assert.DoesNotContain(email, Describe(error), StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public async Task ClientError_IsLoggedWithoutAUser_BeforeLogin()
    {
        using var client = factory.CreateClient();
        var message = $"Test anonymous client error {Guid.NewGuid()}";

        using var response = await client.PostAsJsonAsync("/api/client-errors",
            new ReportClientErrorRequest(message), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var error = Assert.Single(factory.Services.GetFakeLogCollector().GetSnapshot(),
            record => record.Message.Contains(message));
        Assert.Null(UserIdOf(error));
    }

    [Fact]
    public async Task ClientError_OverTheLimit_IsRejected()
    {
        using var client = factory.CreateClient();

        using var response = await client.PostAsJsonAsync("/api/client-errors",
            new ReportClientErrorRequest(new string('a', ReportClientErrorRequest.MessageMaxLength + 1)),
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ClientError_WithAnEmailInIt_IsLoggedWithTheEmailRedacted()
    {
        using var client = factory.CreateClient();
        var marker = Guid.NewGuid();

        using var response = await client.PostAsJsonAsync("/api/client-errors",
            new ReportClientErrorRequest($"Error {marker}: 'someone@example.com' is invalid",
                "Error: boom\ncheck@https://localhost/main-abc.js:12:34\nsomeone@example.com"),
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var error = Assert.Single(factory.Services.GetFakeLogCollector().GetSnapshot(),
            record => record.Message.Contains(marker.ToString()));
        Assert.DoesNotContain("someone@example.com", Describe(error), StringComparison.OrdinalIgnoreCase);
        Assert.Contains($"'{EmailRedaction.Placeholder}' is invalid", error.Message);
        // A Safari stack frame has an @ too, and stays as it is.
        Assert.Contains("check@https://localhost/main-abc.js:12:34", error.Message);
    }

    [Fact]
    public async Task ClientError_OverTheRateLimit_IsRejected()
    {
        // Its own app, so its own rate limiter: the other tests' reports don't count, nor do this test's against them.
        await using var application = factory.WithWebHostBuilder(_ => { });
        using var client = application.CreateClient();

        for (var index = 0; index < ClientErrorEndpoints.ReportsPerMinute; index++)
        {
            using var accepted = await client.PostAsJsonAsync("/api/client-errors",
                new ReportClientErrorRequest($"error {index}"), TestContext.Current.CancellationToken);
            Assert.Equal(HttpStatusCode.NoContent, accepted.StatusCode);
        }

        using var response = await client.PostAsJsonAsync("/api/client-errors",
            new ReportClientErrorRequest("one too many"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.TooManyRequests, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task ClientError_WithAnEmptyMessage_IsRejected()
    {
        using var client = factory.CreateClient();

        using var response = await client.PostAsJsonAsync("/api/client-errors",
            new ReportClientErrorRequest(""), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static string? UserIdOf(FakeLogRecord record) =>
        record.Scopes.OfType<IEnumerable<KeyValuePair<string, object>>>()
            .SelectMany(scope => scope)
            .Where(pair => pair.Key == UserLogScope.UserIdKey)
            .Select(pair => pair.Value.ToString())
            .SingleOrDefault();

    // Everything a log line could carry: the message, the exception, the structured values and the scopes.
    private static string Describe(FakeLogRecord record) => string.Join('\n', [
        record.Message,
        record.Exception?.ToString(),
        .. record.StructuredState?.Select(pair => $"{pair.Key}={pair.Value}") ?? [],
        .. record.Scopes.SelectMany(scope => scope is IEnumerable<KeyValuePair<string, object?>> pairs
            ? pairs.Select(pair => $"{pair.Key}={pair.Value}")
            : [scope?.ToString() ?? ""]),
    ]);

    private sealed class TestException() : Exception("Test exception from the API");

    // Any endpoint would do; the health check is the simplest one to make throw.
    private sealed class ThrowingHealthCheckService : HealthCheckService
    {
        public override Task<HealthReport> CheckHealthAsync(
            Func<HealthCheckRegistration, bool>? predicate, CancellationToken cancellationToken = default) =>
            throw new TestException();
    }
}
