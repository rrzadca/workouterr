using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Mvc;
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

        // The endpoint's own JSON binding would answer 415 too; the title shows the guard turned it away first.
        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var problem = await response.Content.ReadFromJsonAsync<ProblemDetails>(TestContext.Current.CancellationToken);
        Assert.Equal(CsrfGuard.JsonRequiredTitle, problem?.Title);
    }

    [Fact]
    public async Task Logout_IsRejected_AsAnEmptyForm()
    {
        using var client = factory.CreateClient();
        using var form = new FormUrlEncodedContent([]);

        using var response = await client.PostAsync("/api/auth/logout", form, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.UnsupportedMediaType, response.StatusCode);
    }

    // Over HTTP/2 and HTTP/3 a body needs neither Content-Length nor Transfer-Encoding, and nothing makes it declare a
    // Content-Type. The test server speaks HTTP/1.1 and would add Transfer-Encoding, so the request is built directly
    // with the server's word that it has a body.
    [Fact]
    public async Task Logout_IsRejected_WithAnUndeclaredBody()
    {
        var context = new DefaultHttpContext { RequestServices = factory.Services };
        context.Request.Method = HttpMethods.Post;
        context.Request.Path = "/api/auth/logout";
        context.Request.Host = new HostString("localhost");
        context.Request.Headers.Origin = ApiFactory.AppOrigin;
        context.Request.Body = new MemoryStream("email=csrf@example.com"u8.ToArray());
        context.Features.Set<IHttpRequestBodyDetectionFeature>(new RequestWithBody());
        var reachedEndpoint = false;
        var guard = new CsrfGuard(_ =>
        {
            reachedEndpoint = true;
            return Task.CompletedTask;
        });

        await guard.InvokeAsync(context);

        Assert.False(reachedEndpoint);
        Assert.Equal(StatusCodes.Status415UnsupportedMediaType, context.Response.StatusCode);
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

    private sealed class RequestWithBody : IHttpRequestBodyDetectionFeature
    {
        public bool CanHaveBody => true;
    }
}
