using Microsoft.Net.Http.Headers;

namespace Workouterr.Api.Auth;

/// <summary>
/// Turns away state-changing requests another site could make the browser send. A page elsewhere can submit a form to
/// the API, but only as form data or plain text, and the browser stamps it with that page's Origin. Requiring JSON and
/// our own Origin leaves such a request nothing to get through with; SameSite=Strict on the cookie is the second line.
/// </summary>
public class CsrfGuard(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        var request = context.Request;
        if (IsSafe(request.Method))
        {
            await next(context);
            return;
        }

        // Browsers send Origin on every POST, PUT, PATCH and DELETE, so a request without one didn't come from our app.
        if (!IsSameOrigin(request))
        {
            await TypedResults.Problem(statusCode: StatusCodes.Status403Forbidden, title: "Cross-origin request")
                .ExecuteAsync(context);
            return;
        }

        // A request without a body (logout) has nothing a form could have filled in; one with a body must be JSON.
        if (HasBody(request) && !request.HasJsonContentType())
        {
            await TypedResults.Problem(statusCode: StatusCodes.Status415UnsupportedMediaType, title: "JSON required")
                .ExecuteAsync(context);
            return;
        }

        await next(context);
    }

    private static bool IsSafe(string method) =>
        HttpMethods.IsGet(method) || HttpMethods.IsHead(method) || HttpMethods.IsOptions(method)
        || HttpMethods.IsTrace(method);

    // Compares the host and port only: the browser sets Host to the server it is talking to, and behind the dev proxy or
    // Caddy the API sees plain HTTP while the page's Origin is https.
    private static bool IsSameOrigin(HttpRequest request) =>
        Uri.TryCreate(request.Headers.Origin, UriKind.Absolute, out var origin)
        && string.Equals(origin.Authority, request.Host.Value, StringComparison.OrdinalIgnoreCase);

    // A Content-Type counts too: an empty form submission still says it is a form.
    private static bool HasBody(HttpRequest request) =>
        request.ContentLength > 0 || request.ContentType is not null
        || request.Headers.ContainsKey(HeaderNames.TransferEncoding);
}

public static class CsrfGuardExtensions
{
    public static IApplicationBuilder UseCsrfGuard(this IApplicationBuilder application) =>
        application.UseMiddleware<CsrfGuard>();
}
