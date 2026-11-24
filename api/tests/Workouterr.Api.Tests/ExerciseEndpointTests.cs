using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using Workouterr.Api.Exercises;
using Workouterr.Api.Persistence;
using Workouterr.Domain.Exercises;

namespace Workouterr.Api.Tests;

public class ExerciseEndpointTests(ApiFactory factory)
{
    private static readonly ExerciseRequest BenchPress = new(
        "Bench press", TrackedMetrics.WeightReps, [MuscleGroup.Chest, MuscleGroup.Arms], WeightStep: 2.5m);

    private static readonly ExerciseRequest Plank = new(
        "Plank", TrackedMetrics.Time, [MuscleGroup.Core], TimeStepSeconds: 5);

    private static readonly ExerciseRequest PullUp = new("Pull-up", TrackedMetrics.Reps, [MuscleGroup.Back]);

    // Create

    [Fact]
    public async Task Create_StoresTheExercise_AndAnswersWithIt()
    {
        using var client = await LoggedInClientAsync("exercise-create@example.com");

        using var response = await CreateAsync(client, BenchPress with { Description = "Flat bench.", PerSide = true });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await ReadAsync<ExerciseResponse>(response);
        Assert.Equal($"/api/exercises/{created.Id}", response.Headers.Location?.OriginalString);
        Assert.Equal(
            new ExerciseResponse(created.Id, "Bench press", "Flat bench.", TrackedMetrics.WeightReps, 2.5m, null,
                PerSide: true, created.MuscleGroups, IsArchived: false),
            created);
        Assert.Equal([MuscleGroup.Chest, MuscleGroup.Arms], created.MuscleGroups);
        Assert.Equal(created.Id, Assert.Single(await ListAsync(client)).Id);
    }

    [Fact]
    public async Task Create_TrimsTheText_DropsABlankDescription_AndRepeatedGroups()
    {
        using var client = await LoggedInClientAsync("exercise-trim@example.com");

        using var response = await CreateAsync(client, PullUp with
        {
            Name = "  Pull-up  ",
            Description = "   ",
            MuscleGroups = [MuscleGroup.Back, MuscleGroup.Arms, MuscleGroup.Back],
        });

        var created = await ReadAsync<ExerciseResponse>(response);
        Assert.Equal("Pull-up", created.Name);
        Assert.Null(created.Description);
        Assert.Equal([MuscleGroup.Back, MuscleGroup.Arms], created.MuscleGroups);
    }

    [Fact]
    public async Task Create_SendsTheEnumsByTheirWireNames_AndLeavesTheOptionalFieldsOut()
    {
        using var client = await LoggedInClientAsync("exercise-wire@example.com");

        using var response = await client.PostAsync("/api/exercises", JsonContent.Create(new
        {
            name = "Squat",
            metrics = "WEIGHT_REPS",
            muscleGroups = new[] { "LEGS", "CORE" },
            weightStep = 1.25,
        }), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Contains("\"metrics\":\"WEIGHT_REPS\"", body);
        Assert.Contains("\"muscleGroups\":[\"LEGS\",\"CORE\"]", body);
        Assert.Contains("\"weightStep\":1.25", body);
        Assert.Contains("\"perSide\":false", body);
    }

    public static TheoryData<string, ExerciseRequest> InvalidRequests => new()
    {
        { "Name", BenchPress with { Name = "" } },
        { "Name", BenchPress with { Name = "   " } },
        { "Name", BenchPress with { Name = new string('a', 101) } },
        { "Description", BenchPress with { Description = new string('a', 2001) } },
        { "MuscleGroups", BenchPress with { MuscleGroups = [] } },
        { "WeightStep", BenchPress with { WeightStep = 0m } },
        { "WeightStep", BenchPress with { WeightStep = 100.01m } },
        { "WeightStep", BenchPress with { WeightStep = 1.255m } },
        { "WeightStep", BenchPress with { WeightStep = null } },
        { "WeightStep", PullUp with { WeightStep = 2.5m } },
        { "TimeStepSeconds", Plank with { TimeStepSeconds = 0 } },
        { "TimeStepSeconds", Plank with { TimeStepSeconds = 601 } },
        { "TimeStepSeconds", Plank with { TimeStepSeconds = null } },
        { "TimeStepSeconds", BenchPress with { TimeStepSeconds = 5 } },
    };

    [Theory]
    [MemberData(nameof(InvalidRequests))]
    public async Task CreateAndUpdate_RejectEveryValueOutsideTheLimits(string field, ExerciseRequest request)
    {
        using var client = await LoggedInClientAsync($"exercise-invalid-{Guid.NewGuid()}@example.com");
        using var existing = await CreateAsync(client, BenchPress);
        var id = (await ReadAsync<ExerciseResponse>(existing)).Id;

        using var create = await CreateAsync(client, request);
        using var update = await UpdateAsync(client, id, request);

        foreach (var response in new[] { create, update })
        {
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            var problem = await ReadAsync<JsonElement>(response);
            Assert.True(problem.GetProperty("errors").TryGetProperty(field, out _), $"No error for {field}");
        }
        Assert.Equal([BenchPress.Name], (await ListAsync(client)).Select(exercise => exercise.Name));
    }

    [Theory]
    [InlineData("""{"name":"Squat","muscleGroups":["LEGS"],"weightStep":2.5}""")]
    [InlineData("""{"name":"Squat","metrics":null,"muscleGroups":["LEGS"],"weightStep":2.5}""")]
    [InlineData("""{"name":"Squat","metrics":"WEIGHT_REPS","muscleGroups":["FULL_BODY"],"weightStep":2.5}""")]
    [InlineData("""{"name":"Squat","metrics":"WEIGHT_REPS","muscleGroups":["LEGS"],"weightStep":"2.5"}""")]
    public async Task Create_RejectsABodyThatDoesNotMatchTheSchema(string body)
    {
        using var client = await LoggedInClientAsync($"exercise-schema-{Guid.NewGuid()}@example.com");

        using var response = await client.PostAsync("/api/exercises",
            new StringContent(body, System.Text.Encoding.UTF8, "application/json"),
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        Assert.Empty(await ListAsync(client));
    }

    [Fact]
    public async Task Create_StopsAt500Exercises_CountingArchivedOnes()
    {
        var user = await factory.CreateUserAsync("exercise-limit@example.com");
        using var client = await factory.LogInAsync("exercise-limit@example.com");
        using (var scope = factory.Services.CreateScope())
        {
            var database = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            database.Exercises.AddRange(Enumerable.Range(1, Exercise.MaxPerUser).Select(number => new Exercise
            {
                UserId = user.Id,
                Name = $"Exercise {number}",
                Metrics = TrackedMetrics.Reps,
                MuscleGroups = [MuscleGroup.Core],
                IsArchived = number % 2 == 0,
            }));
            await database.SaveChangesAsync(TestContext.Current.CancellationToken);
        }

        using var response = await CreateAsync(client, PullUp);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
    }

    // List

    [Fact]
    public async Task List_ShowsOnlyTheUsersOwnExercises_ByName()
    {
        using var otherClient = await LoggedInClientAsync("exercise-list-other@example.com");
        await CreateAsync(otherClient, BenchPress);
        using var client = await LoggedInClientAsync("exercise-list@example.com");
        foreach (var request in new[] { PullUp, BenchPress, Plank })
        {
            using var _ = await CreateAsync(client, request);
        }

        var names = (await ListAsync(client)).Select(exercise => exercise.Name);

        Assert.Equal(["Bench press", "Plank", "Pull-up"], names);
    }

    [Fact]
    public async Task List_FiltersByMuscleGroups_MatchingAnyOfThem()
    {
        using var client = await LoggedInClientAsync("exercise-list-filter@example.com");
        foreach (var request in new[] { PullUp, BenchPress, Plank })
        {
            using var _ = await CreateAsync(client, request);
        }

        var arms = await ListAsync(client, "?muscleGroups=ARMS");
        var coreOrBack = await ListAsync(client, "?muscleGroups=CORE&muscleGroups=BACK");

        Assert.Equal(["Bench press"], arms.Select(exercise => exercise.Name));
        Assert.Equal(["Plank", "Pull-up"], coreOrBack.Select(exercise => exercise.Name));
    }

    // Only the wire names: not the C# name, not the enum's number.
    [Theory]
    [InlineData("FULL_BODY")]
    [InlineData("Arms")]
    [InlineData("3")]
    public async Task List_RejectsAnythingButAMuscleGroupsWireName(string muscleGroup)
    {
        using var client = await LoggedInClientAsync($"exercise-list-unknown-{Guid.NewGuid()}@example.com");

        using var response = await client.GetAsync($"/api/exercises?muscleGroups={muscleGroup}",
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.True((await ReadAsync<JsonElement>(response)).GetProperty("errors").TryGetProperty("muscleGroups", out _));
    }

    // Update

    [Fact]
    public async Task Update_ReplacesTheEditableFields()
    {
        using var client = await LoggedInClientAsync("exercise-update@example.com");
        using var created = await CreateAsync(client, BenchPress with { Description = "Flat bench." });
        var id = (await ReadAsync<ExerciseResponse>(created)).Id;

        using var response = await UpdateAsync(client, id, Plank with { Name = "Side plank", PerSide = true });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var expected = new ExerciseResponse(id, "Side plank", null, TrackedMetrics.Time, null, 5, PerSide: true,
            [MuscleGroup.Core], IsArchived: false);
        Assert.Equivalent(expected, await ReadAsync<ExerciseResponse>(response), strict: true);
        Assert.Equivalent(expected, Assert.Single(await ListAsync(client)), strict: true);
    }

    [Fact]
    public async Task Update_IsNotFound_ForAnotherUsersExercise_OrAnUnknownId()
    {
        using var ownerClient = await LoggedInClientAsync("exercise-update-owner@example.com");
        using var created = await CreateAsync(ownerClient, BenchPress);
        var id = (await ReadAsync<ExerciseResponse>(created)).Id;
        using var client = await LoggedInClientAsync("exercise-update-intruder@example.com");

        using var othersExercise = await UpdateAsync(client, id, PullUp);
        using var unknownExercise = await UpdateAsync(client, Guid.NewGuid(), PullUp);

        Assert.Equal(HttpStatusCode.NotFound, othersExercise.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, unknownExercise.StatusCode);
        Assert.Equal("Bench press", Assert.Single(await ListAsync(ownerClient)).Name);
    }

    // Archive and restore

    [Fact]
    public async Task Archive_MovesTheExerciseToTheArchivedList_AndRestoreBringsItBack()
    {
        using var client = await LoggedInClientAsync("exercise-archive@example.com");
        using var created = await CreateAsync(client, BenchPress);
        var id = (await ReadAsync<ExerciseResponse>(created)).Id;
        using var _ = await CreateAsync(client, PullUp);

        using var archive = await PostAsync(client, $"/api/exercises/{id}/archive");

        Assert.Equal(HttpStatusCode.OK, archive.StatusCode);
        Assert.True((await ReadAsync<ExerciseResponse>(archive)).IsArchived);
        Assert.Equal(["Pull-up"], (await ListAsync(client)).Select(exercise => exercise.Name));
        Assert.Equal([id], (await ListAsync(client, "?archived=true")).Select(exercise => exercise.Id));

        using var restore = await PostAsync(client, $"/api/exercises/{id}/restore");

        Assert.Equal(HttpStatusCode.OK, restore.StatusCode);
        Assert.False((await ReadAsync<ExerciseResponse>(restore)).IsArchived);
        Assert.Equal(["Bench press", "Pull-up"], (await ListAsync(client)).Select(exercise => exercise.Name));
        Assert.Empty(await ListAsync(client, "?archived=true"));
    }

    [Fact]
    public async Task ArchiveAndRestore_CanBeRepeated()
    {
        using var client = await LoggedInClientAsync("exercise-archive-twice@example.com");
        using var created = await CreateAsync(client, BenchPress);
        var id = (await ReadAsync<ExerciseResponse>(created)).Id;

        foreach (var action in new[] { "archive", "archive", "restore", "restore" })
        {
            using var response = await PostAsync(client, $"/api/exercises/{id}/{action}");
            Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        }
    }

    [Fact]
    public async Task ArchiveAndRestore_AreNotFound_ForAnotherUsersExercise()
    {
        using var ownerClient = await LoggedInClientAsync("exercise-archive-owner@example.com");
        using var created = await CreateAsync(ownerClient, BenchPress);
        var id = (await ReadAsync<ExerciseResponse>(created)).Id;
        using var client = await LoggedInClientAsync("exercise-archive-intruder@example.com");

        using var archive = await PostAsync(client, $"/api/exercises/{id}/archive");
        using var restore = await PostAsync(client, $"/api/exercises/{id}/restore");

        Assert.Equal(HttpStatusCode.NotFound, archive.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, restore.StatusCode);
        Assert.Single(await ListAsync(ownerClient));
    }

    [Fact]
    public async Task Exercises_AreUnauthorized_WithoutALogin()
    {
        using var client = factory.CreateClient();
        var id = Guid.NewGuid();

        using var list = await client.GetAsync("/api/exercises", TestContext.Current.CancellationToken);
        using var create = await CreateAsync(client, BenchPress);
        using var update = await UpdateAsync(client, id, BenchPress);
        using var archive = await PostAsync(client, $"/api/exercises/{id}/archive");
        using var restore = await PostAsync(client, $"/api/exercises/{id}/restore");

        Assert.All([list, create, update, archive, restore],
            response => Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode));
    }

    private async Task<HttpClient> LoggedInClientAsync(string email)
    {
        await factory.CreateUserAsync(email);
        return await factory.LogInAsync(email);
    }

    private static async Task<List<ExerciseResponse>> ListAsync(HttpClient client, string query = "") =>
        (await client.GetFromJsonAsync<List<ExerciseResponse>>(
            $"/api/exercises{query}", TestContext.Current.CancellationToken))!;

    private static Task<HttpResponseMessage> CreateAsync(HttpClient client, ExerciseRequest request) =>
        client.PostAsJsonAsync("/api/exercises", request, TestContext.Current.CancellationToken);

    private static Task<HttpResponseMessage> UpdateAsync(HttpClient client, Guid id, ExerciseRequest request) =>
        client.PutAsJsonAsync($"/api/exercises/{id}", request, TestContext.Current.CancellationToken);

    // Archive and restore have no body.
    private static Task<HttpResponseMessage> PostAsync(HttpClient client, string path) =>
        client.PostAsync(path, null, TestContext.Current.CancellationToken);

    private static async Task<T> ReadAsync<T>(HttpResponseMessage response) =>
        (await response.Content.ReadFromJsonAsync<T>(TestContext.Current.CancellationToken))!;
}
