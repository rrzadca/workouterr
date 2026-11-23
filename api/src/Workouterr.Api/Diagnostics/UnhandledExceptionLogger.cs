using Microsoft.AspNetCore.Diagnostics;

namespace Workouterr.Api.Diagnostics;

/// <summary>
/// Logs every exception no endpoint caught, with the user's ID, then answers 500 with Problem Details. The error log
/// is the app's error tracker, so this line is what a crash leaves behind.
/// </summary>
/// <remarks>
/// UseExceptionHandler would log the exception itself, but outside <see cref="UserLogScope"/>, which has ended by then.
/// A handler that returns true counts as handled, and the middleware then logs nothing, so each exception is logged
/// once.
/// </remarks>
public partial class UnhandledExceptionLogger(
    ILogger<UnhandledExceptionLogger> logger, IProblemDetailsService problemDetails) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        using (UserLogScope.Begin(logger, context.User))
        {
            LogUnhandledException(logger, exception, context.Request.Method, context.Request.Path);
        }

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            Exception = exception,
            ProblemDetails = { Status = StatusCodes.Status500InternalServerError },
        });
    }

    [LoggerMessage(Level = LogLevel.Error, Message = "Unhandled exception on {Method} {Path}")]
    private static partial void LogUnhandledException(ILogger logger, Exception exception, string method, string path);
}
