# 02 — API and database tracer bullet

Status: ready-for-agent
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

- [ ] `GET /api/health` returns 200 with the database up and 503 with it down
- [ ] A validation failure and an unexpected exception both produce the documented error shape (tests)
- [ ] Weight columns use PostgreSQL `numeric`; a test round-trips `41.25` without float error (Prisma `Decimal`)
- [ ] Tests run with `node:test` against a real PostgreSQL, not mocks
