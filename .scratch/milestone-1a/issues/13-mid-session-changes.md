# 13 — Mid-session changes

Status: ready-for-agent
Blocked by: 11

## What to build

- Add or remove a set (one-off; the routine's set count is unchanged)
- Skip an exercise
- Swap an exercise: picker filtered by muscle group, the replaced exercise's groups pre-selected
- Add an extra exercise
- Swapped and extra exercises: prefilled from the last session with a logged set of that exercise (its target,
  adjusted by its mark if it had one); no increase / decrease mark on them
- On finish: offer to save swapped and extra exercises into the routine; if accepted, ask for sets, rest time and
  progression strategy and update the routine (a swap replaces the entry: remove the old one, add a new one)
- Design: `ExercisePicker.jsx`, and the swap / extra / "save to routine" parts of `SessionScreen.jsx`; see [design/README.md](../design/README.md)

## Acceptance criteria

- [ ] Next session after a skip prefills from the last time the entry was actually done (test)
- [ ] Next session after a removed set uses the routine's set count again (test)
- [ ] Saving a swap into the routine leaves past sessions unchanged and the new entry prefills from the swap's
      session (test)
