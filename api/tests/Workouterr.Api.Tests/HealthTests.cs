using System.Net;
using Microsoft.AspNetCore.Hosting;

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
        Assert.Equal("Healthy", await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task Health_IsUnhealthy_WhenTheDatabaseIsUnreachable()
    {
        await using var brokenFactory = factory.WithWebHostBuilder(builder =>
            builder.UseSetting("ConnectionStrings:Workouterr", UnreachableDatabase));
        using var client = brokenFactory.CreateClient();

        using var response = await client.GetAsync("/api/health", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.ServiceUnavailable, response.StatusCode);
        Assert.Equal("Unhealthy", await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken));
    }
}
