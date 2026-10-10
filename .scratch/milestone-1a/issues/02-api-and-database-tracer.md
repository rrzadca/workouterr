# 02 — API and database tracer bullet

Status: done
Blocked by: 01

## What to build

The API foundation, proven with one endpoint that touches the database.

- Express 5 app split into `createApp()` (testable, no listening) and an entry point (`public_nodejs/app.js`
  layout for Passenger later)
- Prisma 7 with `@prisma/adapter-pg`, first migration, `prisma migrate dev` working against Docker PostgreSQL
- Config from environment variables, validated with zod at startup (the app refuses to start with bad config)
- Middleware written in the app: zod request validation and a single error handler with one JSON error shape
  (`{ error: { code, message, details? } }`), 404 for unknown `/api` routes
- `GET /api/health` returns the app version and checks the database connection
- Test helpers: start `createApp()` against a test database, reset it between tests

## Acceptance criteria

- [x] `GET /api/health` returns 200 with the database up and 503 with it down
- [x] A validation failure and an unexpected exception both produce the documented error shape (tests)
- [x] Weight columns use PostgreSQL `numeric`; a test round-trips `41.25` without float error (Prisma `Decimal`)
- [x] Tests run with `node:test` against a real PostgreSQL, not mocks

## Comments

- 2026-10-10: Done. All four criteria covered by tests (`app.test.ts`: health 200/503; `error-handler.test.ts` and
  `validate.test.ts`: error shapes; `database.test.ts`: `numeric(5,2)` column, `41.25` round-trip, exact sums).
  Notes for later issues:
  - Prisma pinned to `^7.10.0`: npm's `latest` tag now points at 8.0 release candidates.
  - `pretest` runs `prisma migrate deploy` (not `reset`) on `workouterr_test`; `resetDatabase()` truncates between
    tests. Prisma blocks `migrate reset` for AI agents without explicit user consent.
  - 04: the Prisma CLI is a devDependency and migrations run from the Mac (ADR-0001), but `postinstall` runs
    `prisma generate`, so `npm ci --omit=dev` on the server needs a different way to get the generated client
    (generate on the Mac and rsync `src/generated/`, or move `prisma` to dependencies). Check that MyDevil's
    Passenger can start an ES module `public_nodejs/app.js`; fallback is a CommonJS file calling `import()`.
  - 06: `Exercise` is minimal (`id` UUIDv7, `name`, `weightStep numeric(5,2)` nullable). Decide how `Decimal`
    weights go over JSON (strings or numbers) in the shared zod schemas.
