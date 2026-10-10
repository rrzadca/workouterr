# Workouterr — Project Scope

## Problem

I am tired of manually writing notes from my gym training sessions. I would like to use an application for that.

## Solution

A web application to manage and track gym sessions. Later versions will add AI insights and native iPhone/iPad apps.

## Target users

Public product, free to use. Anyone can register.

## V1 features

### Accounts

- Register with email / password (with email verification)
- Login, logout, password reset (a reset logs out all devices)
- Change password: requires the current password and logs out all other devices
- Change email: the new address must be verified before it replaces the old one; the old address is notified
- Delete account (and all its data), confirmed with the password. Deletion is immediate and removes everything
  linked to the user; deleted data disappears from backups within 30 days
- Export all data (exercises, routines, training plans, sessions) as a ZIP download, streamed by the API:
  - `workouterr-export.json`: everything, in the API's shared types, with a format version
  - `sets.csv`: one row per logged set (date, routine, exercise, set number, values, per side, target, note)
  - Neutral formats regardless of language: English column names, `.` decimals, ISO 8601 dates with time zone
- Language setting: English or Polish. Defaults to the browser language at registration (English if neither)
- Weight unit only kg with 2 decimal places.

### Exercises

- On registration, a starter set of common exercises is copied into the user's account in the user's language.
  From then on they are the user's own exercises, editable like any other (changing the language later or changes
  to the starter set don't affect existing users)
  - About 25 common barbell, dumbbell, machine and bodyweight exercises, with every field preset (name and
    description in English and Polish, tracked metrics, steps suited to the equipment, per-side flag, muscle
    groups)
  - Kept as a JSON file in the backend, checked against the exercise schema by a test, and copied in the same
    transaction that creates the user. Users created with the CLI script get it too
- User-defined exercises: name, description, tracked metrics, step per metric, per-side flag, muscle groups
- **Muscle groups**: each exercise has one or more from a fixed list: CHEST, BACK, SHOULDERS, ARMS, CORE, LEGS
  (no FULL_BODY: tick the groups instead). The list is part of the app (shared enum, labels translated), not
  user-defined. A flat set, no primary / secondary in V1
  - Used to filter the exercise picker (an exercise matches if it has the group). When swapping, the replaced
    exercise's groups are pre-selected
  - Can be edited at any time (unlike tracked metrics); past sessions are not affected
  - Adding a group later is cheap; splitting one (e.g. ARMS into BICEPS and TRICEPS) means re-tagging existing
    exercises
- Each exercise tracks one of these metric combinations: WEIGHT + REPS, REPS, or TIME
  (e.g. bench press = weight + reps, pull-up = reps, plank = time)
- Step per metric, used by the +/- buttons and by progression: WEIGHT step set per exercise (e.g. 1.25 kg),
  TIME step set per exercise (e.g. 5 s), REPS step is always 1
- **Per side** flag for exercises done one side at a time: the logged reps/time mean "each side", shown as
  "10/side"
- Bodyweight variants are separate exercises with no special logic: "Pull-up" = reps; "Weighted pull-up" =
  weight + reps, where weight is the added weight
- Tracked metrics are fixed once the exercise has been used in a session (create a new exercise instead)
- Deleting an exercise archives it: it is hidden from pickers but stays in past sessions, charts and records,
  and can be restored. An exercise used in a routine can't be archived: the app lists the routines to remove it
  from first. A session in progress is not affected (it stores what was done)

### Routines

- Name, description, ordered list of exercises
- The same exercise can appear more than once (e.g. heavy squats first, light squats last). Each **routine entry**
  has a stable identity that survives edits to the routine; prefill and progression follow the routine entry, not
  just the exercise
  - Reordering entries or changing their sets, rest time or progression strategy keeps the entry's history
  - The exercise of an entry can't be changed: remove the entry and add a new one instead
  - A new entry has no history of its own, so its first prefill comes from the last time that exercise was done in
    any session (same rule as swapped and extra exercises, see Session tracking)
- Per exercise in a routine:
  - Number of sets (all sets share the same target values)
  - Rest time between sets
  - Progression strategy:
    - WEIGHT + REPS: a **rep ladder**, e.g. 8 / 10 / 12 (double progression)
    - REPS only or TIME only: add or subtract one step
- Routines do not store target weight or reps; they come from the previous session (see Session tracking)
- Editing a routine affects only future sessions. Deleting a routine archives it (same as exercises). A routine
  used in a training plan can't be archived: the app lists the plans to remove it from first
- **Limits** (shared zod schemas, so the browser and the API reject the same values):
  - Rep ladder: 1 to 10 rungs, strictly ascending (the editor sorts them). A single rung means increase / decrease
    always change the weight by one step (linear progression)
  - Reps 1–100 (logged sets 0–100); weight 0–1000 kg, weight step 0.01–100 kg, both with at most 2 decimals
  - Time in whole seconds: values 1 s – 1 h (logged sets from 0 s), time step 1 s – 10 min. Shown as `45 s`
    below a minute, `1:30` from a minute up

#### Progression rules

- **Increase** (rep ladder): reps move up one rung (8 → 10 → 12). At the top rung, weight goes up one step and
  reps go back to the bottom rung (12 @ 40 kg → 8 @ 41.25 kg).
- **Decrease** (rep ladder): mirror of increase. Reps move down one rung; at the bottom rung, weight goes down one
  step and reps go to the top rung (8 @ 41.25 kg → 12 @ 40 kg).
- **Increase / decrease** (REPS only, TIME only): ± one step (1 rep, or the exercise's time step).
- **Lower limits**: targets are weight ≥ 0 kg, reps ≥ 1, time ≥ 1 s. Decrease and the − buttons clamp weight
  at 0 kg (at the bottom rung and 0 kg, decrease does nothing); for REPS only / TIME only, decrease does nothing
  if the result would be below one step. Logged sets may be 0 reps or 0 s (a failed attempt)
- Progression applies to the exercise's **target** (see Session tracking), never to the logged values.
- **Reps not on the ladder** (the target was changed to e.g. 9 with a ladder of 8 / 10 / 12): increase moves to
  the next rung up (9 → 10) and decrease to the next rung down (9 → 8). Reps above the top rung count as the top
  rung, reps below the bottom rung count as the bottom rung. Keep leaves the target unchanged.

### Training plans

- Name, description, ordered list of routines (at least one)
- A plan is a **rotation**: the app suggests the routine that follows the last one completed (A → B → C → A …)
- No active plan is valid (the active plan can also be cleared): the app then shows a routine picker, most
  recently done first, with no suggestion. A new user starts with empty states, no onboarding wizard
- One plan is active at a time. The rotation is worked out from session history, so editing or deleting past
  sessions corrects it automatically:
  - A routine can appear more than once in a plan (A → B → A → C); the rotation follows the plan position, not
    just the routine
  - Doing a routine that isn't in the active plan doesn't move the rotation
  - Switching to another plan continues from the last session done with that plan (its first routine if none)
  - If the plan entry of the last session was removed from the plan, the rotation restarts at the first routine

### Session tracking

- Start a session from a routine. The active training plan suggests the next routine in the rotation, but the user
  can pick any routine; the rotation continues from the routine actually done
- Log set by set, using the metrics defined on each exercise
- **Target** per exercise in a session: one set of values (weight + reps, reps, or time) shown on the exercise
  card, e.g. "Target: 3 × 10 @ 40 kg". All sets start from the target; logged sets are the actual values
- Prefill:
  - Later sessions: the target is the **last session of the same routine entry**'s target, already adjusted by
    the increase / decrease mark set in that session (see Progression rules); all sets are prefilled with it
  - A routine entry without history uses the last time that exercise was done in any session (see Routines)
  - No history at all: user enters the target once and all sets copy it
- Changing the target mid-session updates the sets not yet logged. Changing a single set changes only that set
  (one bad set doesn't change the plan)
- Adjust any set with + / - buttons, using the exercise's step
- Logged (actual) values feed personal records, progress charts and the "previous numbers"; the target feeds the
  next session's prefill
- Show the numbers from the previous session for each exercise while logging: all logged sets (e.g.
  `10 · 10 · 9 @ 40 kg`), that session's note and how long ago it was ("6 days ago"). The previous session is the
  same one the prefill comes from
- Rest timer: countdown starts automatically after a set is logged, using the routine's rest time for that exercise
  - The timer stores its end time, so it is correct after the tab was hidden or the screen locked
  - At zero: a full-screen visual cue and a sound (can be turned off in settings)
  - The screen is kept awake (Screen Wake Lock) while a session is in progress
  - Known limit: a regular browser tab on iPad gets no notifications, so if the screen is locked by hand there
    is no alert when the rest ends
- Per exercise in a session:
  - Free-text note
  - Mark for next session: **increase**, **decrease** or keep. Defaults to keep; the app pre-selects increase
    when all the routine's sets were logged and each met or beat the target on every metric (extra sets are
    ignored). Decrease is never pre-selected
- Mid-session changes:
  - Add or remove a set (one-off; the next session uses the routine's set count)
  - Skip an exercise (the next session prefills from the last time this routine entry was actually done)
  - Swap an exercise for another one, or add an extra exercise
- Swapped and extra exercises: prefilled from the last time that exercise was done in any session (else empty).
  - "Last time" is the most recent session where the exercise has at least one logged set
  - The prefill is that session's target, adjusted by its increase / decrease mark if it had one
  - Swapped and extra exercises have no progression strategy, so they have no increase / decrease mark: their
    target carries over unchanged
- When finishing the session, the app offers to save them into the routine. If the user agrees, they set number of
  sets, rest time and progression strategy, and the routine is updated
- Finish a session at any time; sets not logged are ignored
- At most one session in progress per user (enforced by the API). Opening the app returns to it; starting another
  session asks to finish or discard the one in progress. Sessions never finish automatically
- A session is dated by its start time, stored in UTC together with the device's time zone (e.g. `Europe/Warsaw`),
  and shown on the local date where it was done
- A session stores what was actually done (exercises, sets, values), so later changes to routines or exercises
  never change past sessions
- Session history: browse past sessions by date, open one, edit set values, targets and notes, delete a session.
  Edits and deletions are reflected in progress charts and personal records

### Progress

- Per-exercise progress over time (charts), from logged values, across all routines; one point per session:
  - WEIGHT + REPS: top set weight (its reps in the tooltip), with a toggle to total volume (Σ weight × reps)
  - REPS, TIME: best set
- Personal records, computed from logged sets:
  - WEIGHT + REPS: heaviest weight lifted, and a rep-max table: best weight for each rep count logged (e.g. best
    for 5, best for 8). No estimated 1RM
  - REPS: most reps in one set. TIME: longest set
  - Per-side exercises compare the per-side value; weighted exercises compare the added weight only
  - Records are recalculated from session history (not stored), so session edits and deletions are always
    reflected

## Non-functional requirements

- Used **live in the gym on an iPad browser**: tablet-first layout, large touch targets
- Tolerant of flaky connectivity: an in-progress session is saved in browser storage and synced when the
  connection is back. The app must already be open; without a PWA it can't be loaded or reloaded while offline
  - Preloaded for offline use (IndexedDB, refreshed on every online load and after every finished session): all
    active routines and exercises with their prefill data (latest targets and marks, previous numbers), so any
    routine can be started and finished offline
  - Session history, charts and records are online only
  - Sync: the client generates UUIDs for sessions and everything in them; the whole session is saved with an
    idempotent `PUT /api/sessions/:id` (debounced while online, sent when the connection is back; finishing is the
    same PUT with a finish time), so retries never create duplicates. The session schema is a shared zod schema
  - Conflicts: a session has a version number; a save based on an old version gets `409 Conflict`. The app asks
    whether to keep this device's version (overwrite) or load the other one; logged sets are never discarded
    silently. Starting a session offline while another one is in progress elsewhere also gets `409`, and the app
    asks to finish or discard one of them
  - A session started offline may use outdated targets (e.g. a session finished on another device hasn't been
    loaded yet); the app shows that it's offline and the targets can be adjusted by hand
- API-first backend, so future native iOS/iPadOS apps can reuse it
- Multilanguage: English and Polish in V1, designed so more languages can be added
  - All UI text, emails, privacy policy and terms are available in both languages
  - Numbers and dates are formatted per language (e.g. Polish uses a decimal comma: 1,25 kg), and number input
    accepts both
  - User data (exercise, routine and plan names, notes) is not translated
- Privacy:
  - User data hosted in the EU
  - No analytics or tracking in V1; only essential cookies (login session), so no cookie banner
  - Privacy policy and terms of service published before launch (workout data is health-related)

## Tech stack and hosting

The project is also a learning path for building REST APIs with Node.js and Express.

- Backend: Node.js 24 LTS (same version in `.nvmrc`, `package.json` `engines` and on MyDevil), TypeScript, REST
  API on Express 5 (routing and body parsing from Express; auth, validation and error responses written in the app
  as middleware); validation with zod
- Frontend: newest Angular + Tailwind CSS, as a regular browser app (no PWA)
- Translations: Transloco (runtime; language switches without reloading)
- UI component library (buttons, inputs, selects, etc.): Angular library project in the same workspace, built on
  Angular CDK + Tailwind, developed in Storybook
- Database: PostgreSQL (Prisma ORM 7.x with the `pg` driver adapter, Prisma Migrate). Moving to Prisma 8 is a
  deliberate upgrade (re-check ADR-0001)
- Shared TypeScript package in an npm workspace with the Angular app: API types, zod schemas and domain logic
  (progression rules, prefill), used by both the browser (offline session) and the backend
- Auth: session-based, implemented in the app (argon2 password hashing, sessions in PostgreSQL, HttpOnly cookie)
  - A login lasts 30 days, extended by use (at most once a day), and expires after 90 days at the latest
  - If the login expires with unsynced session data, the data stays in browser storage, the login form opens over
    the session, and the sync is retried after login. If a different user logs in on that device, the previous
    user's stored data is deleted, never synced to the wrong account
  - Cookie is `HttpOnly`, `Secure`, `SameSite=Strict`; the session ID is rotated on login
  - CSRF: state-changing requests must be JSON and carry an `Origin` header matching the app's domain
  - Login, registration, password reset and invite redemption are rate limited (failed attempts per email and per
    IP, stored in PostgreSQL so restarts don't reset them). Responses never reveal whether an email is registered
- Weight values are never handled as floating point in storage (PostgreSQL `numeric`, exact handling in code)
- Tests:
  - Backend and shared package (domain logic: progression, prefill, pre-select, records, chart values): Node's
    built-in test runner (`node:test`). The shared domain rules are the most thoroughly tested part
  - Angular: unit tests with Angular's default test runner for logic-heavy services (offline storage, sync with
    retries and 409 / 401 handling, rest timer, wake lock), using fake timers and a fake IndexedDB; component
    tests only for screens with logic (live session). No snapshot tests
  - UI library: Storybook stories, no tests in V1
  - End to end: a few Playwright tests on WebKit with an iPad viewport (live session from start to finish; going
    offline mid-session and syncing afterwards)
  - The deploy script runs lint, type check and all tests (E2E included; skipping them needs an explicit flag)
    and stops on any failure. CI (GitHub Actions) is added once the repo is on GitHub
  - Real iPad: a short manual checklist (`docs/ipad-checklist.md`: screen stays awake, sound at rest end, correct
    timer after locking, airplane mode mid-session and sync, touch targets, decimal comma input) before deploys
    that touch the session screen or offline code
- Future mobile app: undecided (backend stays API-first)
- Hosting: existing MyDevil.net account (shared FreeBSD hosting, servers in Poland) for both the private beta and
  the public launch
  - API runs as a MyDevil Node.js site under Phusion Passenger (`public_nodejs/app.js`, one process); the Angular
    build is served as static files from the same domain, with the API under `/api` (one origin, no CORS)
  - PostgreSQL on MyDevil (remote access only through an SSH tunnel)
  - Backups: nightly `pg_dump` by cron, kept 14 days on MyDevil outside the web root, with a weekly copy pulled
    to my Mac (only the last 2 kept). MyDevil also makes daily backups of files and databases, kept 14 days
    (https://pomoc.mydevil.net/Backup/), so deleted data is gone from all backups within 30 days
  - Background work (cleanup of expired login sessions and tokens) runs as cron scripts, because Passenger stops the
    app after 24 h without requests
  - Database migrations (Prisma Migrate) run from my Mac through the SSH tunnel, because Prisma publishes no
    FreeBSD schema-engine binary (see ADR-0001). Migrations are backward compatible, so the old code still works
    if the deploy stops after migrating
  - Deployment by a script: tests (see Tests), migrate, then files (git/rsync, `npm ci`), then restart. No Docker in production;
    Docker is used only for local development (PostgreSQL, Mailpit)
  - Private beta: before launch, registration is closed (invite-only) and the site isn't announced
  - Registration mode is a config setting: `closed`, `invite` or `open`. Admin tasks are CLI scripts run over SSH
    (no admin UI in V1): create a user (used for my own account in milestone 1a) and create invite codes
    (single-use, expire after 14 days, entered on the registration form)
- Transactional email (verification, password reset, email change) through MyDevil SMTP with SPF/DKIM on the domain; switch to an
  email provider if deliverability becomes a problem
- Budget for the public V1: **under €10 / month**. Covered by the existing MyDevil account, so the app adds no
  hosting cost

## Out of scope for V1

- AI features (routine/plan suggestions, post-session summaries)
- Google and Apple login (Apple becomes mandatory alongside Google once the iOS app ships)
- Native iPhone/iPad apps
- Set variations: warm-up sets, drop sets, supersets / circuits, RPE / RIR
- DISTANCE metric
- WEIGHT + TIME exercises (e.g. weighted plank)
- Ad-hoc sessions without a routine
- Assisted exercises (e.g. assisted pull-up, where more weight means easier)
- Per-session and per-set notes (only per-exercise notes in V1)
- Strava integration
- Statistics per muscle group (e.g. weekly sets per group) and primary / secondary muscle groups

## Success criteria

- **I stop writing notes**: every gym session is logged in the app (e.g. 4 weeks in a row, no paper or notes app)
- **Logging is fast**: logging a prefilled set during a live session takes one or two taps
- **Learning goals met**: comfortable building a REST API with Node.js and Express, Angular, and deploying and running
  a Node app on a real server

## Timeline

No deadline; side project at its own pace. Suggested milestones:

1. **Core logging**, in two steps:
   - **1a. Usable logger for me (on MyDevil)**: login and logout for a single account created with a CLI script (no
     registration or email flows), exercises, routines, live session tracking with prefill, progression and rest
     timer, nightly database backups. English only, online only. All UI text goes through Transloco keys from
     day one; UI library components are built only as 1a needs them
   - **1b. Private beta**: offline session support, training plans and rotation, Polish, invite-only registration,
     email verification, password reset, change password and change email (needs the email service), rate limiting
2. **History and progress**: session history, per-exercise charts, personal records, data export
3. **Public launch**: open registration, privacy policy and terms, production hardening
