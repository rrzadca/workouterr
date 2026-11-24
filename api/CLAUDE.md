# API

ASP.NET Core Minimal API on .NET 10. Run every command from `api/`.

- `src/Workouterr.Api`: endpoints, configuration, persistence, CLI commands.
- `src/Workouterr.Domain`: pure domain rules, no ASP.NET Core or EF Core references.
- `tests/`: xUnit v3 on Microsoft.Testing.Platform (opted into in `global.json`). API tests share one `ApiFactory`
  (assembly fixture): the API in memory against a Testcontainers PostgreSQL with the migrations applied.
- Shared build settings (target framework, nullable, warnings as errors) live in `Directory.Build.props`; project
  files only add what is specific to them.
- Errors are Problem Details (`application/problem+json`), never ad-hoc error bodies.
- Logging (`Diagnostics/`): `ILogger` with `[LoggerMessage]` methods. Outside Development the console writes one
  JSON object per line (`appsettings.json`; Development keeps the readable `simple` format). `UserLogScope` adds the
  logged-in user's `UserId` to every line of a request; never log an email, a note or a workout value.
  `UnhandledExceptionLogger` logs each unhandled exception once, at Error, with the user's ID, and answers 500 Problem
  Details; `BadRequestExceptionHandler`, registered before it, answers `BadHttpRequestException` 400 without
  logging. `POST /api/client-errors` logs the Angular app's uncaught errors the same way, at most 30 a minute for all
  callers together (rate limiter, 429). `EmailRedaction` replaces anything shaped like an email with `[email]` in
  text the API doesn't write itself (the browser's errors, Identity's messages in the CLI). API tests read the logs
  through `factory.Services.GetFakeLogCollector()`; `TestUsers` creates and logs in test users.
- Endpoints are Minimal API handlers with typed results (`Results<Ok<T>, ProblemHttpResult>`), a name
  (`WithName`, the client's function name) and a tag, so the OpenAPI document describes them fully.
- JSON (`Program.cs`): enums travel by their wire names, numbers only as JSON numbers (so the document types them
  `number`, not `number | string`), and a request record's constructor parameter without a default must be in the
  body. Optional request fields get a default (`= null`).
- Request validation: data annotations on the request record (published in the document, so the browser's zod schema
  has them); rules across fields in `IValidatableObject.Validate`. An annotation the generator doesn't publish gets a
  schema transformer (`Validation/`: `DecimalPlacesAttribute` → `multipleOf`). Limits that only the request checks are
  constants on the request type; the entity keeps only what its columns need. A body or parameter that can't be bound
  is a 400 Problem Details in every environment (`BadRequestExceptionHandler` answers Development's
  `BadHttpRequestException`).
- Query binding parses enums by their C# names, so an enum in the query string is bound as a string and read with
  `WireNames.TryParse`; an operation transformer on the endpoint shows the enum in the document.
- A user's own records are looked up by ID and user ID together (`ClaimsPrincipal.UserId()`, from the login cookie,
  without loading the user); another user's record is 404, never 403.
- What middleware adds to every endpoint is described in the document by `MiddlewareResponsesTransformer`: the client
  version header parameter and 426 on every operation, the CSRF guard's 403 and 415 on state-changing ones.
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
