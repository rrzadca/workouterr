using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace Workouterr.Api.Validation;

/// <summary>
/// Publishes <see cref="DecimalPlacesAttribute"/> in the OpenAPI document as <c>multipleOf</c> (2 places = 0.01), which
/// the generator doesn't do for a custom attribute, so the browser's zod schema rejects 1.255 like the API does.
/// </summary>
public class DecimalPlacesTransformer : IOpenApiSchemaTransformer
{
    public Task TransformAsync(
        OpenApiSchema schema, OpenApiSchemaTransformerContext context, CancellationToken cancellationToken)
    {
        var attribute = context.JsonPropertyInfo?.AttributeProvider?
            .GetCustomAttributes(typeof(DecimalPlacesAttribute), inherit: true)
            .OfType<DecimalPlacesAttribute>()
            .SingleOrDefault();
        if (attribute is not null)
        {
            // 10^-places, built from the scale so it's exact: new decimal(1, 0, 0, false, 2) is 0.01.
            schema.MultipleOf = new decimal(1, 0, 0, isNegative: false, scale: (byte)attribute.Places);
        }
        return Task.CompletedTask;
    }
}
