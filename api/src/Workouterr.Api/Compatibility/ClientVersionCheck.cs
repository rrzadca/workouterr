namespace Workouterr.Api.Compatibility;

/// <summary>
/// Reads the build version the app sends with every request and answers 426 Upgrade Required to a build older than
/// the configured minimum (<c>Clients:MinimumVersion</c>), so a tablet still running an old build reloads instead of
/// breaking. API changes stay backward compatible, so no minimum is configured and every version gets through; it is
/// set only if a breaking change is ever unavoidable.
/// </summary>
public class ClientVersionCheck(RequestDelegate next, IConfiguration configuration)
{
    public const string HeaderName = "X-Client-Version";

    private readonly Version? minimumVersion = configuration.GetValue<Version?>("Clients:MinimumVersion");

    public async Task InvokeAsync(HttpContext context)
    {
        // No header (curl, Swagger UI) or one that isn't a version is let through: only a build that says it is too old
        // gets turned away.
        if (minimumVersion is not null
            && Version.TryParse(context.Request.Headers[HeaderName], out var clientVersion)
            && clientVersion < minimumVersion)
        {
            await TypedResults.Problem(
                    statusCode: StatusCodes.Status426UpgradeRequired, title: "A newer version of the app is required")
                .ExecuteAsync(context);
            return;
        }

        await next(context);
    }
}

public static class ClientVersionCheckExtensions
{
    public static IApplicationBuilder UseClientVersionCheck(this IApplicationBuilder application) =>
        application.UseMiddleware<ClientVersionCheck>();
}
