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
- Optional display name (1–50 characters), asked at registration and editable in settings. Used for the avatar
  initials and the greeting in emails; without one the app shows the email address and its first letter
  - No login until the email is verified: the login form gives the same generic error, with a "resend
    verification email" link that always answers "if the account exists, we've sent an email"
  - The verification link is valid for 24 hours and can be resent (rate limited like the other auth endpoints)
  - Unverified accounts are deleted after 7 days (daily cleanup job)
  - Registering an email that already exists shows the same "check your inbox" screen; the existing owner gets
    an email ("someone tried to register with your address; if it was you, log in or reset your password")
- **Invites** (private beta, until public launch):
  - Only the owner creates invites, with the CLI script (`invite create <email>`); no admin UI in V1
  - An invite is a single-use token tied to one email address, sent in a translated email (the invitee's
    language is chosen when the invite is created), valid for 7 days; expired invites are removed by a cleanup job
  - Redeeming it opens registration with the email filled in and locked; the account counts as verified straight
    away, since the invite proved the address
  - At public launch the invite check is turned off by configuration (the invite table stays)
- **Demo accounts**: a "Demo" button on the login screen lets anyone try the app without registering
  - Each click creates a separate, temporary demo user and logs the visitor straight in; visitors never share data
  - The new user gets a copy of a demo template (exercises, routines, a training plan and a few weeks of session
    history) in the browser's language. History dates are generated relative to the creation day, so it looks
    recent and prefill and progression work from the first session
  - A demo user expires 24 hours after creation; a daily cleanup job deletes expired demo users and all their data
  - Demo users have no email or password: change email, change password, delete account and invites are
    unavailable to them (hidden in the UI, rejected by the API). Theme, language and everything else work normally
  - Demo creation is rate limited per IP and sends no email
- Login, logout, password reset (a reset logs out all devices)
- Change password: requires the current password and logs out all other devices
- Change email: the new address must be verified before it replaces the old one; the old address is notified
- Delete account (and all its data), confirmed with the password. Deletion is immediate and removes everything
  linked to the user; once backups exist (milestone 3), deleted data disappears from them within 30 days
- Export all data (exercises, routines, training plans, sessions) as a ZIP download, streamed by the API:
  - `workouterr-export.json`: everything, in the API's types (as described in its OpenAPI document), with a
    format version
  - `sets.csv`: one row per logged set (date, routine, exercise, set number, values, per side, target, note)
  - Neutral formats regardless of language: English column names, `.` decimals, ISO 8601 dates with time zone
- Language setting: English or Polish. Defaults to the browser language at registration (English if neither)
- Theme: a sun / moon button in the sidebar footer switches between Light and Dark (no theme setting on the
  settings page). A new account follows the system theme until the button is first tapped; from then on the choice
  is saved on the account (same on every device, like the language and the rest-timer sound), with a copy in
  `localStorage` so the theme is known on load and on the login screen. The theme is managed only inside the Angular
  app (no script in `index.html`); until Angular starts, the browser background follows the system theme, so a saved
  theme that differs from the system's shows briefly in the system's colours on load (accepted)
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
  (no FULL_BODY: tick the groups instead). The list is part of the app (C# enum published in the OpenAPI
  document, labels translated), not user-defined. A flat set, no primary / secondary in V1
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
  - Removed entries are soft-deleted, so past sessions keep a valid reference to them
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
- **Limits** (defined once in the API and published in its OpenAPI document; the Angular app's zod schemas are
  generated from it, so the browser and the API reject the same values):
  - Rep ladder: 1 to 10 rungs, strictly ascending (the editor sorts them). A single rung means increase / decrease
    always change the weight by one step (linear progression)
  - Reps 1–100 (logged sets 0–100); weight 0–1000 kg, weight step 0.01–100 kg, both with at most 2 decimals
  - Time in whole seconds: values 1 s – 1 h (logged sets from 0 s), time step 1 s – 10 min. Shown as `45 s`
    below a minute, `1:30` from a minute up
  - Rest time 0 s – 10 min in whole seconds (0 = no rest timer for that entry), default 90 s; the editor's stepper
    moves by 15 s and typed values are accepted
  - Names (exercise, routine, plan): 1–100 characters, trimmed, not blank. Duplicate names are allowed
  - Descriptions up to 2,000 characters; notes (per exercise in a session) up to 1,000
  - Sets per routine entry 1–20; sets per exercise in a session (including added ones) up to 30
  - Entries per routine up to 30; exercises in a session (including extras) up to 40; routines per plan up to 20
  - Per user (archived ones included): up to 500 exercises, 100 routines and 50 plans

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
- Removed plan entries are soft-deleted, so past sessions keep a valid reference to them
- Deleting a plan archives it (same as routines and exercises): hidden, and can be restored; restoring brings back
  its rotation position, since that comes from history. Archiving the active plan clears the active plan (normal
  confirm dialog)

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
  - Skip ends the rest early (no cue); +15 s / −15 s adjust the current rest only, never the routine. No pause.
    Logging another set while the timer runs restarts it from that set. Timer state stays on the device (not synced)
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
- Forgotten session: when the app opens and the in-progress session's last logged set is more than 3 hours old,
  it asks "Finish this session?" and suggests the time of the last logged set as the finish time (editable)
- Duration (finish − start) is shown in the live session (elapsed time in the header) and in history
  (`1 h 12 min`). No duration charts in V1
- A session is dated by its start time, stored in UTC together with the device's time zone (e.g. `Europe/Warsaw`),
  and shown on the local date where it was done
- A session stores what was actually done (exercises, sets, values) and the plan, routine and exercise names as
  they were at the time, so later changes to routines, plans or exercises never change past sessions
- Session history: browse past sessions by date, open one, delete a session. Edits and deletions are reflected in
  progress charts, personal records and the next prefill
  - Editable: set values, targets, notes, increase / decrease marks, start and finish time (not the time zone)
  - Not editable: adding or removing sets or exercises (delete the session and log it again)
  - Saved with the same `PUT /api/sessions/:id` and version number (409 flow) as live sessions; a finished session
    stays finished. Editing is online only, and every save refreshes the offline cache (prefill)

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
  - Visual design from the mockups in `docs/design/` (colours, fonts, layout, components), scaled for touch:
    controls at least 44 px tall (about 56 px on the live session screen), body text 15–16 px, set values larger
  - Sidebar navigation in iPad landscape; no desktop window chrome
- Tolerant of flaky connectivity: an in-progress session is saved in browser storage and synced when the
  connection is back
  - App shell cached by a service worker (`@angular/service-worker`), so a reload while offline (e.g. Safari
    discarding a background tab) still opens the app, which picks up the session from IndexedDB. Not an
    installable PWA in V1
  - Preloaded for offline use (IndexedDB, refreshed on every online load, after every finished session and after
    every history edit): all active routines and exercises with their prefill data (latest targets and marks,
    previous numbers), so any routine can be started and finished offline
  - Session history, charts and records are online only
  - Sync: the client generates UUIDs for sessions and everything in them; the whole session is saved with an
    idempotent `PUT /api/sessions/:id` (debounced while online, sent when the connection is back; finishing is the
    same PUT with a finish time), so retries never create duplicates. The session schema comes from the OpenAPI
    document (C# types in the API, generated TypeScript types and zod schema in the browser)
  - Conflicts: a session has a version number; a save based on an old version gets `409 Conflict`. The app asks
    whether to keep this device's version (overwrite) or load the other one; logged sets are never discarded
    silently. Starting a session offline while another one is in progress elsewhere also gets `409`, and the app
    asks to finish or discard one of them
  - A session started offline may use outdated targets (e.g. a session finished on another device hasn't been
    loaded yet); the app shows that it's offline and the targets can be adjusted by hand
- API-first backend, so future native iOS/iPadOS apps can reuse it
- Old clients keep working after a deploy (an open tab, a session saved offline before the deploy, later native
  apps). No API versioning in V1:
  - API changes are backward compatible only: add optional fields, never remove or rename
  - The client sends its build version in a header. If a breaking change is ever unavoidable, the API answers
    `426 Upgrade Required` and the app shows "new version, reload" (unsynced data stays in browser storage)
  - The service worker checks for updates on load and offers a reload, never while a session is in progress
  - `/v2` routes only when a native app actually needs them
- Light and dark theme (see Accounts), readable in a dim gym; the full-screen rest-timer cue is clearly visible
  in both
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

The project is also a learning path for building REST APIs with .NET and ASP.NET Core.

- Backend: .NET 10 LTS (SDK pinned in `global.json`, same runtime on the server), C# with nullable reference
  types and warnings as errors, REST API on ASP.NET Core Minimal APIs (routing, model binding, Problem Details
  error responses and ASP.NET Core Identity from the framework; the Origin check and rate limiting written in the
  app). Validation with .NET 10's built-in Minimal API validation (data annotations on
  request types) plus explicit checks for cross-field rules (e.g. ascending rep ladder)
- API contract: OpenAPI document generated by the API (`Microsoft.AspNetCore.OpenApi`) and committed to the
  repo. The Angular app generates its TypeScript types and zod schemas from it (e.g. with orval); a check fails
  the build if the generated code is out of date
- Frontend: newest Angular (Signals, SignalStore, SignalForm) + Tailwind CSS. Node.js 24 LTS (in `.nvmrc`) is
  used only for frontend tooling; nothing runs on Node in production
- Translations: Transloco (runtime; language switches without reloading)
- UI component library (buttons, inputs, selects, etc.): Angular library project in the same workspace, built on
  Angular CDK + Tailwind, developed in Storybook
  - Semantic tokens only, ported from `docs/design/tokens.css` (`--surface-*`, `--text-*`, `--accent`, …, mapped in
    Tailwind), never raw colours; dark theme through `[data-theme="dark"]` on `<html>`; every story shown in both
    themes
  - Fonts (Geist, Geist Mono, Black Ops One) and Lucide icons are self-hosted, nothing loaded from third-party CDNs
- Database: PostgreSQL (Entity Framework Core 10 with the Npgsql provider, EF Core migrations). Moving to a new
  EF Core major version is a deliberate upgrade
- Domain rules are implemented twice, because the browser needs them offline:
  - C# in the API (source of truth): progression, prefill, personal records, chart values
  - TypeScript library in the Angular workspace: progression, prefill and pre-select for offline sessions
  - Both run the same JSON test cases (inputs and expected results, kept in one folder), so the two
    implementations can't drift apart
- Auth: ASP.NET Core Identity with cookie sign-in, its tables in the same PostgreSQL database
  (`IdentityDbContext` with EF Core, `Guid` user IDs)
  - The app's own auth endpoints are built on `UserManager` / `SignInManager`, not `MapIdentityApi`: its fixed
    endpoints don't cover invites, translated emails, notifying the old address on an email change, or account
    deletion with the password
  - From Identity: password hashing (its default hasher), email verification, password reset and email change
    tokens, and the security stamp. Changing the security stamp logs out the user's other devices (password
    change and reset, account deletion), so the stamp is checked on every request, not every 30 minutes
  - Logins stored server-side in PostgreSQL (custom ticket store for the Identity cookie), so the cookie carries
    only a session ID and a logout takes effect immediately
  - Identity's account lockout is not used: it locks per account, which would show whether an email is
    registered. The app's rate limiting covers it (see below)
  - A login lasts 30 days, extended by use (at most once a day), and expires after 90 days at the latest
  - If the login expires with unsynced session data, the data stays in browser storage, the login form opens over
    the session, and the sync is retried after login. If a different user logs in on that device, the previous
    user's stored data is deleted, never synced to the wrong account
  - Cookie is `HttpOnly`, `Secure`, `SameSite=Strict`; the session ID is rotated on login
  - CSRF: state-changing requests must be JSON and carry an `Origin` header matching the app's domain
  - Login, registration, password reset and invite redemption are rate limited (failed attempts per email and per
    IP, stored in PostgreSQL so restarts don't reset them; ASP.NET Core's built-in rate limiter keeps counts in
    memory, so it isn't used for this). Responses never reveal whether an email is registered
- Weight values are never handled as floating point (PostgreSQL `numeric`, C# `decimal`, exact handling in
  TypeScript)
- Tests:
  - Backend: xUnit. Domain rules (progression, prefill, records, chart values) as unit tests, the most thoroughly
    tested part; API tests through `WebApplicationFactory` against a real PostgreSQL in Testcontainers (no EF Core
    in-memory provider)
  - Domain rules in TypeScript (progression, prefill, pre-select): Angular's default test runner, on the same JSON
    test cases as the C# tests
  - Angular: unit tests (Vitest) with Angular's default test runner for logic-heavy services (offline storage, sync with
    retries and 409 / 401 handling, rest timer, wake lock), using fake timers and a fake IndexedDB; component
    tests only for screens with logic (live session). No snapshot tests
  - UI library: Storybook stories, no tests in V1
  - End to end: a few Playwright tests on WebKit with an iPad viewport (live session from start to finish; going
    offline mid-session and syncing afterwards)
  - The deploy script runs lint (`dotnet format --verify-no-changes`, ESLint), build and type check, the OpenAPI
    up-to-date check and all tests (E2E included; skipping them needs an explicit flag)
    and stops on any failure. CI (GitHub Actions) is added once the repo is on GitHub
  - Real iPad: a short manual checklist (`docs/ipad-checklist.md`: screen stays awake, sound at rest end, correct
    timer after locking, airplane mode mid-session and sync, touch targets, decimal comma input) before deploys
    that touch the session screen or offline code
- Future mobile app: undecided (backend stays API-first)
- Scheduled jobs: a `BackgroundService` in the API with a `PeriodicTimer`, once a day (one API instance, so no
  locks). Jobs are idempotent (`DELETE ... WHERE expires_at < now()`), so a missed or doubled run does no harm.
  Each job is a plain class with its own test and is also available as a CLI command. Jobs: unverified accounts
  older than 7 days, expired logins in the ticket store, old rate-limit records, expired invites, expired demo
  users
- Hosting: one Hetzner VPS in the EU (Germany or Finland) with Docker Compose
  - The domain stays registered at OVH; its DNS zone there points at the server and holds the email records
  - Compose runs `caddy` (HTTPS, serves the Angular app, proxies `/api`, so app and API share one domain),
    `api` and `postgres` (official image pinned to a major version, named volume, port not exposed outside the
    Docker network)
  - The deploy script builds the images locally after all checks pass (multi-stage API image; Caddy image with the
    built Angular app) and sends them with `docker save | ssh docker load`. No registry until CI exists, then GHCR
  - Migrations: an EF Core migration bundle, run once by the deploy script before the new API starts, never at
    startup
  - Secrets (database password, email credentials) in an `.env` file on the server, outside the repo, `chmod 600`
  - Server basics: SSH keys only, firewall allowing only 22, 80 and 443, automatic security updates
- Transactional email (invites, verification, password reset, email change to both addresses, registration
  attempts on an existing address, account deletion): Brevo (France), over plain SMTP
  - Behind the app's own `IEmailSender` (MailKit underneath), so switching provider is a config change
  - Templates live in the app, translated like the rest of the UI. Brevo's click and open tracking is off
  - SPF, DKIM and DMARC records on the domain
  - Development and tests: a Mailpit container catches every email (dev-only Compose service; API tests can check
    it)
- Operations:
  - Structured JSON logs through `ILogger`, written on the server, kept 14 days. No personal data in logs: user
    ID only, never emails, notes or workout values
  - Error tracking for the API and the Angular app in an EU-hosted or self-hosted tracker (e.g. Sentry EU region
    or GlitchTip); essential, no tracking, so still no cookie banner
  - `/api/health` endpoint (API + database) watched by a free external uptime check that sends email alerts
  - Backups (from milestone 3): nightly encrypted `pg_dump`, copied off the server to EU storage, kept 30 days,
    with a restore test into a scratch database (monthly or from the deploy script). Until then the data export is
    the manual fallback, and losing the server means losing the data

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
- **Learning goals met**: comfortable building a REST API with .NET and ASP.NET Core, Angular, and deploying and
  running a .NET app on a real server

## Timeline

No deadline; side project at its own pace. Suggested milestones:

1. **Core logging**, in two steps:
   - **1a. Usable logger for me**: login and logout for a single account created with a CLI script (no
     registration or email flows), exercises, routines, live session tracking with prefill, progression and rest
     timer, light / dark theme with the toggle, logs, error tracking and the `/api/health` uptime check. English only,
     online only. All UI text goes through Transloco keys from day one; UI library components are built only as
     1a needs them, with semantic colour tokens from the start
   - **1b. Private beta**: offline session support (service worker app shell included), training plans and
     rotation, Polish, invite-only registration, email verification, password reset, change password and change
     email (needs the email service), rate limiting, scheduled cleanup jobs
2. **History and progress**: session history (with edits), per-exercise charts, personal records, data export
3. **Public launch**: open registration (invite check turned off), demo accounts, privacy policy and terms,
   production hardening including nightly backups with a tested restore
