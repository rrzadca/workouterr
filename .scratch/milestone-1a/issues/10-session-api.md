# 10 — Session API

Status: ready-for-agent
Blocked by: 08, 09

## What to build

Storing sessions, using the same sync model offline support will build on in 1b.

- Shared zod session schema: client-generated UUIDs for the session and everything in it; start time + IANA
  time zone; per exercise: source routine entry (or swapped / extra), exercise snapshot (name, metrics,
  per side, steps), target, sets (logged or not), note, mark; version; finish time
- `PUT /api/sessions/:id`: create or replace the whole session; idempotent
  - optimistic concurrency: the body carries the version it was based on; mismatch → `409` with the server copy
  - at most one session in progress per user: a second one → `409` with the other session
- `GET /api/sessions/in-progress`, `DELETE /api/sessions/:id` (discard)
- `GET /api/routines/:id/start-data`: everything the browser needs to start a session of this routine: the
  routine, and per entry the prefill source session (target, mark, logged sets, note, date), using `resolvePrefill`
- "Tracked metrics are fixed once used": updating an exercise's metrics after it appears in a session → 409
  (finishes ticket 06's rule)

## Acceptance criteria

- [ ] Sending the same PUT twice creates one session (test)
- [ ] Stale version → 409; second in-progress session → 409 (tests)
- [ ] Editing or archiving a routine or exercise afterwards doesn't change a stored session (test)
- [ ] `start-data` prefill matches `resolvePrefill` for: first time ever, entry history, new entry with exercise
      history elsewhere, skipped entry last time
