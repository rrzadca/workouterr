# API

ASP.NET Core Minimal API on .NET 10. Run every command from `api/`.

- `src/Workouterr.Api`: endpoints, configuration, persistence, CLI commands.
- `src/Workouterr.Domain`: pure domain rules, no ASP.NET Core or EF Core references.
- `tests/`: xUnit v3 on Microsoft.Testing.Platform (opted into in `global.json`). API tests share one `ApiFactory`
  (assembly fixture): the API in memory against a Testcontainers PostgreSQL with the migrations applied.
- Shared build settings (target framework, nullable, warnings as errors) live in `Directory.Build.props`; project
  files only add what is specific to them.
- Errors are Problem Details (`application/problem+json`), never ad-hoc error bodies.
- Endpoints are Minimal API handlers with typed results (`Results<Ok<T>, ProblemHttpResult>`), a name
  (`WithName`, the client's function name) and a tag, so the OpenAPI document describes them fully.
- Every route sits under `/api`, so the dev proxy and Caddy forward it to the API.
- Database names are snake_case (`EFCore.NamingConventions`); tables EF or Identity name explicitly get a snake_case
  name in `AppDbContext`. Migrations live in `Persistence/Migrations`, are generated and never edited by hand.

## Commands

- `dotnet tool restore`: install the local tools (`dotnet-ef`) from `dotnet-tools.json`, once per clone.
- `docker compose -f ../deploy/compose.dev.yaml up -d --wait`: start the dev PostgreSQL (`down` stops it; the data
  stays in the `postgres-data` volume).
- `dotnet build`: build the solution (warnings fail it).
- `dotnet run --project src/Workouterr.Api`: run the API on `http://localhost:5080`.
- `dotnet run --project src/Workouterr.Api -- user create <email>`: create a user (verified) in the database the
  API's configuration points at; asks for the password twice with hidden input, or reads one line from a pipe. Exit
  code 1 with Identity's messages when the email is taken or the password breaks the rules.
- `curl http://localhost:5080/api/health`: `{"status":"Healthy"}` (200), or Problem Details (503) when the database is
  down.
- `http://localhost:5080/api/doc`: Swagger UI over the live OpenAPI document (`/api/openapi/v1.json`), Development
  only.
- `dotnet ef migrations add <Name> --project src/Workouterr.Api --output-dir Persistence/Migrations`: add a migration.
- `dotnet ef database update --project src/Workouterr.Api`: apply migrations to the dev database.
- `scripts/check-openapi.sh`: rebuild the API (`--no-incremental`) and fail if `contracts/openapi/workouterr.json`
  differs from the committed or staged one (run by the deploy script). A `dotnet build` that recompiles the API regenerates
  the document; commit it with the change.
- `dotnet test`: run the domain and API tests (Docker must be running: API tests start their own PostgreSQL container).
- `dotnet format --verify-no-changes`: check formatting (run by the deploy script); `dotnet format` fixes it.
