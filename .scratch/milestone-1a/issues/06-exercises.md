# 06 — Exercises

Status: ready-for-agent
Blocked by: 05

## What to build

The user's exercise library, end to end.

- Shared zod schema: name, description, tracked metrics (WEIGHT + REPS, REPS, TIME), weight step, time step,
  per-side flag, muscle groups (enum CHEST, BACK, SHOULDERS, ARMS, CORE, LEGS; at least one), with the limits
  from the scope (steps, 2 decimals)
- API: list (active / archived), create, update, archive, restore. Every query is scoped to the logged-in user
- Angular: exercise list filtered by muscle group, exercise editor with steppers for steps, archive and restore
- `ui` components as needed: input, number input with step buttons, checkbox group / chips, select
- Design: `ExercisesScreen.jsx`; see [design/README.md](../design/README.md)

## Acceptance criteria

- [ ] Another user's exercise returns 404, never 403 or the data (test)
- [ ] Invalid values are rejected with the same messages in the browser and the API (shared schema)
- [ ] Muscle group labels come from Transloco keys
- [ ] Archived exercises are hidden from the list by default and can be restored

## Notes

Two rules need data from later tickets and are done there: "exercise used in a routine can't be archived" (08),
"tracked metrics are fixed once used in a session" (10).
