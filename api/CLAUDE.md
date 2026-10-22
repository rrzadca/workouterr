# API

ASP.NET Core Minimal API on .NET 10. Run every command from `api/`.

- `src/Workouterr.Api`: endpoints, configuration, persistence, CLI commands.
- `src/Workouterr.Domain`: pure domain rules, no ASP.NET Core or EF Core references.
- Shared build settings (target framework, nullable, warnings as errors) live in `Directory.Build.props`; project
  files only add what is specific to them.
- Errors are Problem Details (`application/problem+json`), never ad-hoc error bodies.
- Every route sits under `/api`, so the dev proxy and Caddy forward it to the API.
- Database names are snake_case (`EFCore.NamingConventions`); tables EF or Identity name explicitly get a snake_case
  name in `AppDbContext`. Migrations live in `Persistence/Migrations`, are generated and never edited by hand.

## Commands

- `dotnet tool restore`: install the local tools (`dotnet-ef`) from `dotnet-tools.json`, once per clone.
- `docker compose -f ../deploy/compose.dev.yaml up -d --wait`: start the dev PostgreSQL (`down` stops it; the data
  stays in the `postgres-data` volume).
- `dotnet build`: build the solution (warnings fail it).
- `dotnet run --project src/Workouterr.Api`: run the API on `http://localhost:5080`.
- `curl http://localhost:5080/api/health`: `Healthy` (200), or `Unhealthy` (503) when the database is down.
- `dotnet ef migrations add <Name> --project src/Workouterr.Api --output-dir Persistence/Migrations`: add a migration.
- `dotnet ef database update --project src/Workouterr.Api`: apply migrations to the dev database.
- `dotnet format --verify-no-changes`: check formatting (run by the deploy script); `dotnet format` fixes it.
