using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using Workouterr.Domain.Exercises;

namespace Workouterr.Api.Exercises;

/// <summary>
/// Publishes the exercise enums in the OpenAPI document even before an endpoint uses them, so the app's client has
/// <see cref="MuscleGroup"/> and <see cref="TrackedMetrics"/> as closed sets of names (filters, labels, form options).
/// Once the exercise endpoints refer to them the generator adds the same schemas under the same names, and this only
/// confirms them.
/// </summary>
public class ExerciseEnumsTransformer : IOpenApiDocumentTransformer
{
    public async Task TransformAsync(
        OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        document.AddComponent(nameof(MuscleGroup),
            await context.GetOrCreateSchemaAsync(typeof(MuscleGroup), cancellationToken: cancellationToken));
        document.AddComponent(nameof(TrackedMetrics),
            await context.GetOrCreateSchemaAsync(typeof(TrackedMetrics), cancellationToken: cancellationToken));
    }
}
