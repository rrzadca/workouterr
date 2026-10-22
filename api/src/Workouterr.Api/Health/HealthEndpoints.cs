using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace Workouterr.Api.Health;

public static class HealthEndpoints
{
    // A Minimal API endpoint rather than MapHealthChecks, so it appears in the OpenAPI document.
    public static void MapHealthEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/health", GetHealth)
            .WithName("GetHealth")
            .WithTags("Health")
            .ProducesProblem(StatusCodes.Status503ServiceUnavailable);
    }

    private static async Task<Results<Ok<HealthResponse>, ProblemHttpResult>> GetHealth(
        HealthCheckService healthChecks, CancellationToken cancellationToken)
    {
        var report = await healthChecks.CheckHealthAsync(cancellationToken);

        return report.Status == HealthStatus.Unhealthy
            ? TypedResults.Problem(statusCode: StatusCodes.Status503ServiceUnavailable, title: "Unhealthy")
            : TypedResults.Ok(new HealthResponse(report.Status));
    }
}

public record HealthResponse(HealthStatus Status);
