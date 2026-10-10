# 08 — Routines

Status: ready-for-agent
Blocked by: 06

## What to build

Routines with routine entries, end to end.

- Shared zod schema: name, description, ordered entries. Per entry: stable ID, exercise, number of sets, rest
  time, progression strategy (rep ladder for WEIGHT + REPS: 1–10 rungs, strictly ascending; ± one step for REPS
  or TIME). Limits from the scope
- The same exercise may appear in several entries
- Editing keeps entry IDs: reorder, change sets / rest / ladder. The exercise of an entry can't be changed
- API: list, get, create, update, archive, restore
- Archive guards with `409 Conflict` listing where the item is used:
  - an exercise used in a routine can't be archived (finishes ticket 06's rule)
  - routines vs training plans comes in 1b
- Angular: routine list, routine editor (pick exercises filtered by muscle group, reorder, ladder editor that
  sorts rungs, rest time in `m:ss`)

## Acceptance criteria

- [ ] Updating a routine keeps the IDs of entries that weren't removed (test)
- [ ] Archiving an exercise used in a routine returns 409 with the routine names (test)
- [ ] Ladder `12 / 8 / 10` is saved as `8 / 10 / 12`; duplicates are rejected
