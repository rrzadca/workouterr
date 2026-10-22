# Workouterr

Gym session tracker used live on an iPad browser: ASP.NET Core Minimal API (.NET 10), Angular, PostgreSQL. The
project is also the owner's learning path for ASP.NET Core, Angular and running .NET on a real server.

- `project-scope.md`: every product rule and decision. Read the relevant section before building or changing a
  feature; when a decision changes, update it there.
- `implementation-plan.md`: the ordered tasks and the repository layout. Start from the first unticked task.

`api/` (.NET) and `web/` (Angular workspace) are self-contained siblings; run each side's tooling from its own
folder. `contracts/` holds the only files they share: the OpenAPI document and the domain test cases.

`docs/design/`: the visual reference (tokens, components, a JSX source per screen). Read its `README.md` and the
screen's file before building any UI.

## How we work

- Work as a **lesson**: one plan task per turn. Do the task, then explain each command, file and concept and why,
  then stop for the owner's review. Tick the task in the plan once the owner approves it.
- Commit with exactly the message the owner gives, with no trailer.

## Conventions

- **Descriptive names**: full words for every identifier and import alias (`zod`, `request`, `response`, `error`,
  `index`), including where the ecosystem habitually shortens them.
- Angular components keep their template in a sibling `.html` file (`templateUrl`). Test host components in specs
  and Storybook `render` templates may stay inline.
- UI text goes through Transloco keys. Colours come from the semantic tokens (`--surface-*`, `--text-*`, `--accent`,
  …) and work in both themes.
- Weights are exact decimals everywhere: `numeric` in PostgreSQL, `decimal` in C#, exact handling in TypeScript.
- **Limits** and validation rules live once, in the API's request types; zod schemas reach the browser through the
  OpenAPI document.
- API changes are **backward compatible**: add optional fields, keep existing ones. After any API change,
  regenerate `contracts/openapi/workouterr.json` and `web/projects/api-client`.
- Domain rules (progression, prefill, pre-select in C# and TypeScript; rotation in C# only): change the cases in
  `contracts/domain-cases/` first, then make the implementations pass them.
- Logs carry the user ID only: emails, notes and workout values stay out of them.
- Schema changes are EF Core migrations, applied by the migration bundle during deploy.

## Commands

Run from the side's own folder. Each plan task that adds a command adds it here (or in `api/CLAUDE.md` /
`web/CLAUDE.md` for side-specific ones).

- API: see `api/CLAUDE.md`.
- Web: see `web/CLAUDE.md`.
