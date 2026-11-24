using System.Text.Json;
using Workouterr.Api.Compatibility;

namespace Workouterr.Api.Tests;

/// <summary>What the document the app's client is generated from shows: the middleware's effect on every request, and
/// the enums the app needs.</summary>
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
            Assert.Contains(operation.Operation.GetProperty("parameters").EnumerateArray(), parameter =>
                parameter.TryGetProperty("$ref", out var reference) && reference.GetString()
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

    [Theory]
    [InlineData("MuscleGroup", new[] { "CHEST", "BACK", "SHOULDERS", "ARMS", "CORE", "LEGS" })]
    [InlineData("TrackedMetrics", new[] { "WEIGHT_REPS", "REPS", "TIME" })]
    public async Task ExerciseEnums_AreSchemasListingTheirWireNames(string schemaName, string[] expectedNames)
    {
        using var document = await GetDocumentAsync();

        var schema = document.RootElement.GetProperty("components").GetProperty("schemas").GetProperty(schemaName);
        Assert.Equal(expectedNames, schema.GetProperty("enum").EnumerateArray().Select(name => name.GetString()));
    }

    [Fact]
    public async Task ExerciseList_FiltersByMuscleGroupNames()
    {
        using var document = await GetDocumentAsync();

        var parameter = document.RootElement.GetProperty("paths").GetProperty("/api/exercises").GetProperty("get")
            .GetProperty("parameters").EnumerateArray()
            .Single(parameter => parameter.TryGetProperty("name", out var name) && name.GetString() == "muscleGroups");
        Assert.Equal("query", parameter.GetProperty("in").GetString());
        Assert.Equal("#/components/schemas/MuscleGroup",
            parameter.GetProperty("schema").GetProperty("items").GetProperty("$ref").GetString());
    }

    // The browser's zod schema gets the 2-decimal rule from here.
    [Fact]
    public async Task ExerciseWeightStep_AllowsAtMostTwoDecimals()
    {
        using var document = await GetDocumentAsync();

        var weightStep = document.RootElement.GetProperty("components").GetProperty("schemas")
            .GetProperty("ExerciseRequest").GetProperty("properties").GetProperty("weightStep");
        Assert.Equal(0.01m, weightStep.GetProperty("multipleOf").GetDecimal());
        Assert.Equal(0.01m, weightStep.GetProperty("minimum").GetDecimal());
    }

    // The app's "used in routines" message reads this shape; the API answers it once routines exist (task 25).
    [Fact]
    public async Task ArchivingAnExercise_CanAnswerWithTheRoutinesItIsIn()
    {
        using var document = await GetDocumentAsync();

        var conflict = document.RootElement.GetProperty("paths").GetProperty("/api/exercises/{id}/archive")
            .GetProperty("post").GetProperty("responses").GetProperty("409");
        Assert.Equal("#/components/schemas/ExerciseInRoutinesProblem", conflict.GetProperty("content")
            .GetProperty("application/problem+json").GetProperty("schema").GetProperty("$ref").GetString());
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
