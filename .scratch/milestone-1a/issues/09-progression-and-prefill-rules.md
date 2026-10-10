# 09 — Progression and prefill rules (shared domain logic)

Status: ready-for-agent
Blocked by: 01

## What to build

Pure functions in `shared`, no I/O, tested thoroughly with `node:test`. They run in the browser and the API.

- `applyMark(target, mark, strategy, steps)`: increase / decrease / keep
  - rep ladder: move one rung; past the top/bottom rung, change the weight by one step and wrap the reps
  - reps not on the ladder: next rung up / down; above the top counts as top, below the bottom as bottom
  - REPS / TIME: ± one step
  - lower limits: weight clamps at 0 kg (bottom rung + 0 kg → no change); REPS / TIME decrease does nothing if
    the result would be below one step
- `suggestMark(plannedSetCount, target, loggedSets)`: increase when all planned sets were logged and each met or
  beat the target on every metric (extra sets ignored); otherwise keep. Never decrease
- `resolvePrefill(...)`: the target for a routine entry, in this order: the entry's last session with a logged
  set (target adjusted by its mark) → the exercise's last session anywhere with a logged set (its target, adjusted
  by its mark if it had one) → none. Returns which session it came from, so "previous numbers" can show the same
  one
- Exact weight arithmetic (no floats): decide and document the representation (e.g. integer hundredths of a kg)

## Acceptance criteria

- [ ] Every example in the scope's Progression rules is a test case (`12 @ 40 → 8 @ 41.25`, `9 → 10`, …)
- [ ] Edge cases: single-rung ladder, 0 kg, weight below one step, REPS at 1, TIME at one step, skipped entry
- [ ] `0.1 + 0.2`-style errors are impossible by construction (test with 1.25 steps repeated 100 times)

## Notes

Can be done in parallel with 02–08: it only needs the shared package.
