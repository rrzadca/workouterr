using Microsoft.AspNetCore.Diagnostics;

namespace Workouterr.Api.Diagnostics;

/// <summary>
/// Answers a request the endpoint couldn't bind (malformed JSON, an unknown enum name) with 400 Problem Details, and
/// logs nothing: it's the client's mistake, not a crash. Production answers it 400 without throwing; Development throws
/// <see cref="BadHttpRequestException"/> instead, so the developer sees why. Registered before
/// <see cref="UnhandledExceptionLogger"/>, which gets every other exception.
/// </summary>
public class BadRequestExceptionHandler(IProblemDetailsService problemDetails) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext context, Exception exception, CancellationToken cancellationToken)
    {
        if (exception is not BadHttpRequestException badRequest)
        {
            return false;
        }

        context.Response.StatusCode = badRequest.StatusCode;
        return await problemDetails.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = context,
            ProblemDetails = { Status = badRequest.StatusCode },
        });
    }
}
