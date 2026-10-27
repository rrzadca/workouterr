using System.Net;
using Microsoft.AspNetCore.Hosting;
using Workouterr.Api.Compatibility;

namespace Workouterr.Api.Tests;

public class ClientVersionCheckTests(ApiFactory factory)
{
    [Fact]
    public async Task AnyVersion_IsServed_WhileNoMinimumIsSet()
    {
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Add(ClientVersionCheck.HeaderName, "0.0.1");

        using var response = await client.GetAsync("/api/health", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    // The path a breaking change would switch on; the real configuration sets no minimum.
    [Theory]
    [InlineData("1.9.9", HttpStatusCode.UpgradeRequired)]
    [InlineData("2.0.0", HttpStatusCode.OK)]
    [InlineData(null, HttpStatusCode.OK)]
    public async Task OlderVersions_AreTurnedAway_OnceAMinimumIsSet(string? clientVersion, HttpStatusCode expected)
    {
        await using var application = factory.WithWebHostBuilder(builder =>
            builder.UseSetting(ClientVersionCheck.MinimumVersionSetting, "2.0.0"));
        using var client = application.CreateClient();
        if (clientVersion is not null)
        {
            client.DefaultRequestHeaders.Add(ClientVersionCheck.HeaderName, clientVersion);
        }

        using var response = await client.GetAsync("/api/health", TestContext.Current.CancellationToken);

        Assert.Equal(expected, response.StatusCode);
    }
}
