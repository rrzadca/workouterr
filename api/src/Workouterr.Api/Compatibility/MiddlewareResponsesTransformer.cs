using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;
using Workouterr.Api.Auth;

namespace Workouterr.Api.Compatibility;

/// <summary>
/// Describes what the middleware adds to every endpoint, which endpoint metadata can't show: the client version header
/// (<see cref="ClientVersionCheck"/>) with its 426, and the <see cref="CsrfGuard"/>'s 403 and 415 on state-changing
/// requests. The app takes the header name from the document, so it never hard-codes it.
/// </summary>
public class MiddlewareResponsesTransformer : IOpenApiDocumentTransformer
{
    public const string ClientVersionParameter = "ClientVersion";

    private const string ProblemDetailsSchema = nameof(ProblemDetails);

    public async Task TransformAsync(
        OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        // One named header parameter that every operation refers to, so the generated client has a single schema for it.
        document.AddComponent<IOpenApiParameter>(ClientVersionParameter, new OpenApiParameter
        {
            Name = ClientVersionCheck.HeaderName,
            In = ParameterLocation.Header,
            Description = "The app's build version. A build older than the API accepts gets 426 Upgrade Required.",
            Schema = new OpenApiSchema { Type = JsonSchemaType.String },
        });
        // Present already when an endpoint produces a problem itself; added for the document that has none.
        document.AddComponent(ProblemDetailsSchema,
            await context.GetOrCreateSchemaAsync(typeof(ProblemDetails), cancellationToken: cancellationToken));

        foreach (var (method, operation) in (document.Paths ?? []).Values.SelectMany(path => path.Operations ?? []))
        {
            operation.Parameters ??= [];
            operation.Parameters.Add(new OpenApiParameterReference(ClientVersionParameter, document));

            // In status code order, after the endpoint's own responses.
            operation.Responses ??= [];
            if (!CsrfGuard.IsSafe(method.Method))
            {
                AddProblem(operation, document, StatusCodes.Status403Forbidden, "Forbidden");
                AddProblem(operation, document, StatusCodes.Status415UnsupportedMediaType, "Unsupported Media Type");
            }
            AddProblem(operation, document, StatusCodes.Status426UpgradeRequired, "Upgrade Required");
        }
    }

    // Keeps a response the endpoint describes itself (a 403 with its own meaning).
    private static void AddProblem(OpenApiOperation operation, OpenApiDocument document, int statusCode,
        string description) =>
        operation.Responses!.TryAdd(statusCode.ToString(), new OpenApiResponse
        {
            Description = description,
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["application/problem+json"] = new()
                {
                    Schema = new OpenApiSchemaReference(ProblemDetailsSchema, document),
                },
            },
        });
}
