var builder = WebApplication.CreateBuilder(args);

builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks();

var application = builder.Build();

application.UseExceptionHandler();
application.UseStatusCodePages();

application.MapHealthChecks("/api/health");

application.Run();
