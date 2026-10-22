# API

ASP.NET Core Minimal API on .NET 10. Run every command from `api/`.

- `src/Workouterr.Api`: endpoints, configuration, persistence, CLI commands.
- `src/Workouterr.Domain`: pure domain rules, no ASP.NET Core or EF Core references.
- Shared build settings (target framework, nullable, warnings as errors) live in `Directory.Build.props`; project
  files only add what is specific to them.
- Errors are Problem Details (`application/problem+json`), never ad-hoc error bodies.
- Every route sits under `/api`, so the dev proxy and Caddy forward it to the API.

## Commands

- `dotnet build`: build the solution (warnings fail it).
- `dotnet run --project src/Workouterr.Api`: run the API on `http://localhost:5080`.
- `curl http://localhost:5080/api/health`: check it is up.
- `dotnet format --verify-no-changes`: check formatting (run by the deploy script); `dotnet format` fixes it.
