using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http.Json;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using Workouterr.Api.Health;

namespace Workouterr.Api.Tests;

public class HealthTests(ApiFactory factory)
{
    // Nothing listens on port 1, so every connection is refused at once.
    private const string UnreachableDatabase =
        "Host=localhost;Port=1;Database=workouterr;Username=workouterr;Password=workouterr;Timeout=1";

    [Fact]
    public async Task Health_IsHealthy_WhenTheDatabaseIsReachable()
    {
        using var client = factory.CreateClient();

        using var response = await client.GetAsync("/api/health", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        // The API's own JSON options, so the enum is read the way the API writes it.
        var jsonOptions = factory.Services.GetRequiredService<IOptions<JsonOptions>>().Value.SerializerOptions;
        var health = await response.Content.ReadFromJsonAsync<HealthResponse>(
            jsonOptions, TestContext.Current.CancellationToken);
        Assert.Equal(HealthStatus.Healthy, health?.Status);
    }

    [Fact]
    public async Task Health_IsUnhealthy_WhenTheDatabaseIsUnreachable()
    {
        await using var brokenFactory = factory.WithWebHostBuilder(builder =>
            builder.UseSetting("ConnectionStrings:Workouterr", UnreachableDatabase));
        using var client = brokenFactory.CreateClient();

        using var response = await client.GetAsync("/api/health", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }
}
