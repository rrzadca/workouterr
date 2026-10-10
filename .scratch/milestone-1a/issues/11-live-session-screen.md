# 11 — Live session screen

Status: ready-for-agent
Blocked by: 10

## What to build

The screen I use in the gym. Fast logging is a success criterion: a prefilled set takes one or two taps.

- Home: pick a routine (most recently done first) → start; if a session is in progress, open it instead.
  Starting another asks "finish or discard the one in progress"
- Exercise cards: target ("3 × 10 @ 40 kg", "10/side"), sets prefilled from the target, one tap to log a set,
  + / − per value using the exercise's steps and the lower limits
- Changing the target updates sets not yet logged; changing one set changes only that set
- No history yet: enter the target once, all sets copy it
- Previous numbers on each card: logged sets, note, "6 days ago" (same session the prefill came from)
- Per exercise: note, mark (increase pre-selected by `suggestMark`, can be changed)
- Saving: whole-session PUT, debounced; a visible "saved / saving / error" state; a 409 shows the choice
  "keep this device's version / load the other one"
- Finish (sets not logged are ignored) and discard
- Design: `StartScreen.jsx` (without plan chips), `SessionScreen.jsx`, `SessionExercise.jsx`; see [design/README.md](../design/README.md)

## Acceptance criteria

- [ ] Component test for the session screen: log a set, change the target, change one set, mark pre-selection
- [ ] Reloading the page mid-session returns to the same state from the server
- [ ] Numbers use the formatting helpers from ticket 03
