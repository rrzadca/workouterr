using System.Text.Json.Serialization;
using Microsoft.EntityFrameworkCore;
using Workouterr.Api.Health;
using Workouterr.Api.Persistence;

var builder = WebApplication.CreateBuilder(args);

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
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database");

var application = builder.Build();

application.UseExceptionHandler();
application.UseStatusCodePages();

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

application.Run();
