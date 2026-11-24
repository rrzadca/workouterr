using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Workouterr.Api;
using Workouterr.Api.Auth;
using Workouterr.Api.Compatibility;
using Workouterr.Api.Diagnostics;
using Workouterr.Api.Exercises;
using Workouterr.Api.Health;
using Workouterr.Api.Persistence;
using Workouterr.Api.Settings;
using Workouterr.Api.Users;
using Workouterr.Api.Validation;

var builder = WebApplication.CreateBuilder(args);

// A command's output is for the person at the terminal; the SQL EF Core logs for each query would bury it.
if (CommandLineInterface.IsCommand(args))
{
    builder.Logging.AddFilter("Microsoft.EntityFrameworkCore.Database.Command", LogLevel.Warning);
}

// Read when the first DbContext is created, not at startup: build-time OpenAPI generation starts the app without one.
builder.Services.AddDbContext<AppDbContext>((services, options) => options
    .UseNpgsql(services.GetRequiredService<IConfiguration>().GetConnectionString("Workouterr")
        ?? throw new InvalidOperationException("Connection string 'Workouterr' is missing."))
    .UseSnakeCaseNamingConvention());

builder.Services.ConfigureHttpJsonOptions(options =>
{
    // Enums travel as their names, so the OpenAPI document lists them and the client gets a closed set of strings.
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter());
    // Numbers are JSON numbers only. The web default also reads them from strings, which the document then types
    // as `number | string` (and the generated client with it).
    options.SerializerOptions.NumberHandling = JsonNumberHandling.Strict;
    // A request record's constructor parameter without a default must be in the body: a missing `metrics` is a 400,
    // not a silent WEIGHT_REPS. Parameters with a default stay optional.
    options.SerializerOptions.RespectRequiredConstructorParameters = true;
});
builder.Services.AddOpenApi(options => options
    .AddDocumentTransformer<MiddlewareResponsesTransformer>()
    .AddSchemaTransformer<DecimalPlacesTransformer>());
builder.Services.AddProblemDetails();
// Exception handlers run in the order they're added, until one handles the exception.
builder.Services.AddExceptionHandler<BadRequestExceptionHandler>();
builder.Services.AddExceptionHandler<UnhandledExceptionLogger>();
builder.Services.AddClientErrorRateLimit();
// Checks the data annotations on request types (LoginRequest, …) and answers 400 with a validation problem.
builder.Services.AddValidation();
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database");

builder.Services.AddAuth();
builder.Services.AddScoped<UserCreationService>();

var application = builder.Build();

if (CommandLineInterface.IsCommand(args))
{
    return await CommandLineInterface.InvokeAsync(application.Services, args);
}

application.UseExceptionHandler();
application.UseStatusCodePages();
// Both answer before authentication, so a rejected request never touches the login store.
application.UseClientVersionCheck();
application.UseCsrfGuard();
application.UseAuthentication();
application.UseUserLogScope();
application.UseRateLimiter();
application.UseAuthorization();

// Swagger UI on /api/doc, reading the same document the build writes to contracts/. Development only.
if (application.Environment.IsDevelopment())
{
    application.MapOpenApi("/api/openapi/{documentName}.json");
    application.UseSwaggerUI(options =>
    {
        options.RoutePrefix = "api/doc";
        options.SwaggerEndpoint("/api/openapi/v1.json", "Workouterr API");
    });
}

application.MapHealthEndpoints();
application.MapAuthEndpoints();
application.MapSettingsEndpoints();
application.MapExerciseEndpoints();
application.MapClientErrorEndpoints();

application.Run();
return 0;
