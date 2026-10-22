using Microsoft.EntityFrameworkCore;
using Workouterr.Api.Persistence;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("Workouterr")
    ?? throw new InvalidOperationException("Connection string 'Workouterr' is missing.");

builder.Services.AddDbContext<AppDbContext>(options => options
    .UseNpgsql(connectionString)
    .UseSnakeCaseNamingConvention());

builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks()
    .AddDbContextCheck<AppDbContext>("database");

var application = builder.Build();

application.UseExceptionHandler();
application.UseStatusCodePages();

application.MapHealthChecks("/api/health");

application.Run();
