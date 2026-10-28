using System.Text.Json;
using Workouterr.Api.Compatibility;

namespace Workouterr.Api.Tests;

/// <summary>What the middleware does to every request, as the document the app's client is generated from shows it.</summary>
public class OpenApiDocumentTests(ApiFactory factory)
{
    [Fact]
    public async Task EveryOperation_DeclaresTheClientVersionHeader_AndItsUpgradeResponse()
    {
        using var document = await GetDocumentAsync();

        var parameter = document.RootElement.GetProperty("components").GetProperty("parameters")
            .GetProperty(MiddlewareResponsesTransformer.ClientVersionParameter);
        Assert.Equal(ClientVersionCheck.HeaderName, parameter.GetProperty("name").GetString());
        Assert.Equal("header", parameter.GetProperty("in").GetString());

        Assert.All(Operations(document), operation =>
        {
            Assert.Contains(operation.Operation.GetProperty("parameters").EnumerateArray(), reference =>
                reference.GetProperty("$ref").GetString()
                == $"#/components/parameters/{MiddlewareResponsesTransformer.ClientVersionParameter}");
            Assert.True(operation.Operation.GetProperty("responses").TryGetProperty("426", out _));
        });
    }

    [Fact]
    public async Task OnlyStateChangingOperations_DeclareTheCsrfGuardsResponses()
    {
        using var document = await GetDocumentAsync();

        Assert.All(Operations(document), operation =>
        {
            var responses = operation.Operation.GetProperty("responses");
            var isStateChanging = operation.Method is not ("get" or "head" or "options" or "trace");
            Assert.Equal(isStateChanging, responses.TryGetProperty("403", out _));
            Assert.Equal(isStateChanging, responses.TryGetProperty("415", out _));
        });
    }

    private async Task<JsonDocument> GetDocumentAsync()
    {
        using var client = factory.CreateClient();
        await using var body = await client.GetStreamAsync("/api/openapi/v1.json", TestContext.Current.CancellationToken);
        return await JsonDocument.ParseAsync(body, cancellationToken: TestContext.Current.CancellationToken);
    }

    private static IEnumerable<(string Method, JsonElement Operation)> Operations(JsonDocument document) =>
        document.RootElement.GetProperty("paths").EnumerateObject()
            .SelectMany(path => path.Value.EnumerateObject())
            .Select(operation => (operation.Name, operation.Value));
}
