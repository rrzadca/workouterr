using System.ComponentModel.DataAnnotations;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Http.HttpResults;
using Workouterr.Api.Compatibility;

namespace Workouterr.Api.Diagnostics;

/// <summary>
/// Where the Angular app sends the errors nothing in it caught. Each one becomes an Error line in the API's log, beside
/// the API's own errors, so one place holds both sides' errors without any external tracker.
/// </summary>
public static partial class ClientErrorEndpoints
{
    // The app sends at most 10 per page load; this bounds what anything else can write into the log. One window for
    // every caller: behind Caddy each request comes from the same address, so there is nothing to tell callers apart.
    public const int ReportsPerMinute = 30;

    private const string RateLimitPolicy = "client-errors";

    public static IServiceCollection AddClientErrorRateLimit(this IServiceCollection services) =>
        services.AddRateLimiter(options =>
        {
            options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
            options.AddPolicy(RateLimitPolicy, _ => RateLimitPartition.GetFixedWindowLimiter(RateLimitPolicy,
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = ReportsPerMinute,
                    Window = TimeSpan.FromMinutes(1),
                }));
        });

    public static void MapClientErrorEndpoints(this IEndpointRouteBuilder endpoints)
    {
        // Open without a login: the login page can fail too. UserLogScope adds the user's ID when there is one.
        endpoints.MapPost("/api/client-errors", ReportClientError)
            .WithName("ReportClientError")
            .WithTags("Diagnostics")
            .RequireRateLimiting(RateLimitPolicy)
            .ProducesValidationProblem()
            .ProducesProblem(StatusCodes.Status429TooManyRequests);
    }

    private static NoContent ReportClientError(
        ReportClientErrorRequest request, HttpContext context, ILoggerFactory loggerFactory)
    {
        var logger = loggerFactory.CreateLogger("Workouterr.ClientErrors");
        // The browser's text is logged as sent, except for anything shaped like an email address.
        LogClientError(logger, EmailRedaction.Redact(request.Message)!, request.Path,
            context.Request.Headers[ClientVersionCheck.HeaderName], EmailRedaction.Redact(request.Stack));
        return TypedResults.NoContent();
    }

    [LoggerMessage(Level = LogLevel.Error,
        Message = "Client error: {ClientMessage} on {ClientPath} (version {ClientVersion})\n{ClientStack}")]
    private static partial void LogClientError(
        ILogger logger, string clientMessage, string? clientPath, string? clientVersion, string? clientStack);
}

/// <summary>An error the app caught nowhere. Only the page's path is sent, never its query or form contents.</summary>
public record ReportClientErrorRequest(
    [property: Required, MinLength(1), MaxLength(ReportClientErrorRequest.MessageMaxLength)] string Message,
    [property: MaxLength(ReportClientErrorRequest.StackMaxLength)] string? Stack = null,
    [property: MaxLength(ReportClientErrorRequest.PathMaxLength)] string? Path = null)
{
    public const int MessageMaxLength = 1000;
    public const int StackMaxLength = 8000;
    public const int PathMaxLength = 500;
}
