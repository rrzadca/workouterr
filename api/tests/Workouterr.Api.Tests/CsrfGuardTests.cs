using System.Net;
using System.Net.Http.Json;
using Microsoft.Net.Http.Headers;
using Workouterr.Api.Auth;

namespace Workouterr.Api.Tests;

/// <summary>
/// The login POST a page on another site could make the browser send: a form, or a request stamped with that site's
/// Origin. The guard answers before the login runs, so no user is needed.
/// </summary>
public class CsrfGuardTests(ApiFactory factory)
{
    [Fact]
    public async Task Login_IsRejected_FromAnotherOrigin()
    {
        using var client = factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Post, "/api/auth/login")
        {
            Content = JsonContent.Create(new LoginRequest("csrf@example.com", "Correct-horse-1")),
        };
        request.Headers.Add(HeaderNames.Origin, "https://evil.example");

        using var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Login_IsRejected_WithoutAnOrigin()
    {
        using var client = factory.CreateClient();
        client.DefaultRequestHeaders.Remove(HeaderNames.Origin);

        using var response = await client.PostAsJsonAsync(
            "/api/auth/login", new LoginRequest("csrf@example.com", "Correct-horse-1"),
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Login_IsRejected_AsAForm()
    {
        using var client = factory.CreateClient();
        using var form = new FormUrlEncodedContent(new Dictionary<string, string>
        {
            ["email"] = "csrf@example.com",
            ["password"] = "Correct-horse-1",
        });

        using var response = await client.PostAsync("/api/auth/login", form, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    [Fact]
    public async Task Logout_IsRejected_AsAnEmptyForm()
    {
        using var client = factory.CreateClient();
        using var form = new FormUrlEncodedContent([]);

        using var response = await client.PostAsync("/api/auth/logout", form, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
    }

    [Fact]
    public async Task Get_IsAllowed_FromAnotherOrigin()
    {
        using var client = factory.CreateClient();
        using var request = new HttpRequestMessage(HttpMethod.Get, "/api/health");
        request.Headers.Add(HeaderNames.Origin, "https://evil.example");

        using var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}
