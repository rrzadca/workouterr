# @workouterr/api

Express 5 REST API with Prisma 7 on PostgreSQL. TypeScript runs directly on Node 24 (type stripping), with no
build step.

## Local development

```sh
nvm use                          # Node 24, from .nvmrc
docker compose up -d             # PostgreSQL (from the repo root)
cp api/.env.example api/.env     # local config; production sets real environment variables
npm ci                           # also generates the Prisma client (postinstall)
npm run db:migrate -w api        # apply migrations to the dev database
npm run start:dev -w api         # http://localhost:3000/api/health
```

## Scripts

| Script                                       | What it does                                                       |
| -------------------------------------------- | ------------------------------------------------------------------ |
| `npm run start:dev -w api`                   | Server with restart on file changes                                |
| `npm start -w api`                           | Server through `public_nodejs/app.js`, the file Passenger loads    |
| `npm test -w api`                            | Migrates the test database, then runs every `*.test.ts`            |
| `npm run db:migrate -w api -- --name <name>` | After editing `prisma/schema.prisma`: create and apply a migration |
| `npm run db:generate -w api`                 | Regenerate the Prisma client into `src/generated/` (gitignored)    |

## Configuration

Environment variables, validated with zod at startup (`src/config.ts`); the server refuses to start with bad config.

| Variable            | Used by     | Example                                                        |
| ------------------- | ----------- | -------------------------------------------------------------- |
| `DATABASE_URL`      | server, CLI | `postgresql://workouterr:workouterr@localhost:5432/workouterr` |
| `PORT`              | server      | `3000` (default; ignored under Passenger)                      |
| `TEST_DATABASE_URL` | tests       | must name a database ending in `_test`                         |

## Tests

`node:test` against a real PostgreSQL (no mocks), so Docker must be running. `pretest` runs `prisma migrate deploy`
on the test database (creating it if needed). Test files run one at a time because they share that database.

- `startTestApp()` (`src/test-support/test-app.ts`): the real app on a free port, against the test database
- `resetDatabase(prisma)` (`src/test-support/test-database.ts`): empties every table; call it in `beforeEach`

## Conventions

- Errors: throw `HttpError(status, code, message, details?)`; every error response is
  `{ "error": { "code", "message", "details"? } }`. Unexpected errors answer 500 without leaking details.
- Validation: `validate({ params, body, query })` with zod schemas in front of a route handler.
- Weights: PostgreSQL `numeric`, Prisma `Decimal`, never `number`.
- Migrations run from the dev machine, never on the server (ADR-0001), and must stay backward compatible.
