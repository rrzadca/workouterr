using System.Security.Claims;

namespace Workouterr.Api.Diagnostics;

/// <summary>
/// Adds the logged-in user's ID to every log line written while a request runs, as a <c>UserId</c> scope. The ID is
/// the only thing about the user the logs ever carry: never the email, notes or workout values.
/// </summary>
public class UserLogScope(RequestDelegate next, ILogger<UserLogScope> logger)
{
    public const string UserIdKey = "UserId";

    public async Task InvokeAsync(HttpContext context)
    {
        using (Begin(logger, context.User))
        {
            await next(context);
        }
    }

    // Also used by the exception handler: an exception leaves this middleware's scope before it is logged.
    public static IDisposable? Begin(ILogger logger, ClaimsPrincipal user)
    {
        // Identity puts the user's ID in the NameIdentifier claim; an anonymous request has none.
        var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
        return userId is null ? null : logger.BeginScope(new Dictionary<string, object> { [UserIdKey] = userId });
    }
}

public static class UserLogScopeExtensions
{
    // After UseAuthentication, which reads the login cookie and sets the user.
    public static IApplicationBuilder UseUserLogScope(this IApplicationBuilder application) =>
        application.UseMiddleware<UserLogScope>();
}
