# 12 — Rest timer, sound and wake lock

Status: ready-for-agent
Blocked by: 11

## What to build

- Logging a set starts a countdown with the entry's rest time (swapped / extra exercises: a default, e.g. 90 s)
- The timer stores its end time and recomputes on `visibilitychange`, so it's right after the tab was hidden or
  the screen locked
- At zero: full-screen visual cue and a sound through Web Audio, unlocked by the "log set" tap
- Sound on / off setting (a minimal settings page and a user setting in the API)
- Screen Wake Lock while a session is in progress: acquire on start, re-acquire on `visibilitychange`, release on
  finish or discard; no error if the browser doesn't support it

## Acceptance criteria

- [ ] Unit tests with fake timers: countdown, hidden tab for longer than the rest, skip / restart the timer
- [ ] Wake lock service tested with a fake `navigator.wakeLock` (acquire, re-acquire, release, unsupported)
- [ ] Checked by hand on the iPad: screen stays on, sound plays, correct time after locking and unlocking
