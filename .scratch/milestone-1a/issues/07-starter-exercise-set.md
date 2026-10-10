# 07 — Starter exercise set

Status: ready-for-agent
Blocked by: 06

## What to build

- `api/src/.../starter-exercises.json`: about 25 common barbell, dumbbell, machine and bodyweight exercises with
  every field filled in, names and descriptions in English and Polish, steps suited to the equipment
  (e.g. barbell 2.5 kg, dumbbell 1 kg, machine 5 kg, plank 5 s), muscle groups, per-side flag
- `createUser()` copies the set in the user's language, in the same transaction that creates the user
- `user:create` gets a `--language en|pl` option (default `en`)

## Acceptance criteria

- [ ] A test validates every entry against the shared exercise schema, in both languages
- [ ] A test shows a failure while copying rolls back the user creation
- [ ] The list covers every muscle group and every metric combination, and includes at least one per-side and
      one weighted bodyweight exercise

## Notes

I review the exercise list and the Polish names before this ticket is closed.
