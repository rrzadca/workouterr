using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Workouterr.Api;
using Workouterr.Api.Auth;
using Workouterr.Api.Health;
using Workouterr.Api.Persistence;
using Workouterr.Api.Users;

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

// Enums travel as their names, so the OpenAPI document lists them and the client gets a closed set of strings.
builder.Services.ConfigureHttpJsonOptions(options =>
    options.SerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddOpenApi();
builder.Services.AddProblemDetails();
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
application.UseAuthentication();
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

application.Run();
return 0;
