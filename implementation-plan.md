# Workouterr — Implementation Plan

Ordered tasks that build the milestones in `project-scope.md`. One task at a time; each ends on its **Done when**.
Tick a task (`[x]`) once it's done and reviewed. Later milestones are coarser and get split further when they're
reached.

Each task names the **Scope** sections to read first (`Section → part` points to a bullet or heading inside it) and,
for UI, the **Design** files. A task that adds a command (build, test, lint, generate, check) also adds it to the
Commands section of the matching `CLAUDE.md`.

## Repository layout

```
api/                          .NET, self-contained
  CLAUDE.md                   API conventions and commands
  global.json                 SDK pin
  Directory.Build.props       nullable, warnings as errors
  Workouterr.slnx
  src/Workouterr.Api/         Minimal API, EF Core, Identity, CLI commands (`dotnet run -- <command>`)
  src/Workouterr.Domain/      pure domain rules (progression, prefill, pre-select, rotation, records, charts)
  tests/Workouterr.Domain.Tests/
  tests/Workouterr.Api.Tests/ WebApplicationFactory + Testcontainers PostgreSQL
web/                          Angular workspace, self-contained
  CLAUDE.md                   Angular conventions and commands
  angular.json, package.json, .nvmrc
  projects/workouterr/        the app
  projects/ui/                UI component library + Storybook
  projects/domain/            TypeScript domain rules for offline sessions
  projects/api-client/        generated TypeScript types and zod schemas (orval), never edited by hand
  e2e/                        Playwright (WebKit, iPad viewport)
contracts/                    what api and web share
  openapi/workouterr.json     written by api, read by web, committed
  domain-cases/               JSON test cases run by the C# and TypeScript domain tests
deploy/                       Dockerfiles, compose.yaml, compose.dev.yaml, Caddyfile, deploy.sh
docs/                         design reference (`docs/design/`), server setup, iPad checklist
```

## Milestone 0 — Foundations

- [x] **1. Repository.** `git init`, `.gitignore` (including `.claude/settings.local.json`), `.editorconfig`, the
  top-level folders, `api/global.json` (.NET 10 SDK), `web/.nvmrc` (Node 24). Docker is installed (tasks 3 and 4
  need it).
  Scope: Tech stack and hosting.
  Done when: the first commit exists and `dotnet --version` / `node --version` match the pinned versions, and
  `docker version` works.
- [x] **2. API skeleton.** Solution with `Workouterr.Api` and `Workouterr.Domain`; `Directory.Build.props` with
  nullable and warnings as errors; Problem Details; `GET /api/health`; `api/CLAUDE.md` with the build and run commands.
  Scope: Tech stack and hosting → Backend.
  Done when: `dotnet build` is clean and `curl /api/health` returns 200.
- [x] **3. Database.** `deploy/compose.dev.yaml` with PostgreSQL; EF Core 10 + Npgsql; `AppDbContext :
  IdentityDbContext` with `Guid` user IDs; first migration; `/api/health` checks the database.
  Scope: Tech stack and hosting → Database, Auth.
  Done when: the migration applies to the dev database and `/api/health` reports the database as healthy.
- [x] **4. Backend tests.** `Workouterr.Domain.Tests` and `Workouterr.Api.Tests` (xUnit, `WebApplicationFactory`,
  Testcontainers PostgreSQL).
  Scope: Tech stack and hosting → Tests.
  Done when: `dotnet test` runs a passing `/api/health` API test against a container database.
- [x] **5. OpenAPI document.** `Microsoft.AspNetCore.OpenApi`, generated at build into
  `contracts/openapi/workouterr.json`; a check script fails if the committed file is out of date.
  Scope: Tech stack and hosting → API contract.
  Done when: changing an endpoint without regenerating makes the check fail.
- [ ] **6. Angular workspace.** Workspace in `web/` with the `workouterr` app: Tailwind, ESLint, Prettier
  (Angular parser for `.html`), Vitest through Angular's default runner, dev proxy for `/api` (same origin as
  production); `web/CLAUDE.md` with the serve, lint, build and test commands.
  Scope: Tech stack and hosting → Frontend.
  Done when: `ng serve` shows a page that calls `/api/health` through the proxy, and lint, build and test pass.
- [ ] **7. Translations and theme base.** Transloco with `en` keys; tokens ported from `docs/design/tokens.css`
  and mapped in Tailwind (see `docs/design/guidelines/tailwind.config.js`), scaled for touch (controls at least
  44 px, body text 15–16 px); dark theme through `[data-theme="dark"]`; self-hosted Geist, Geist Mono and Black Ops
  One; a pre-boot script applies the saved theme from `localStorage`, else the system theme.
  Scope: Accounts → Theme; Non-functional requirements (iPad, multilanguage); Tech stack and hosting →
  Translations, UI component library.
  Design: `docs/design/README.md`, `tokens.css`.
  Done when: switching the OS theme switches the page with no flash on reload, and all text comes from keys.
- [ ] **8. UI library.** `ui` library project with Storybook showing every story in both themes; self-hosted
  Lucide icons; first components Button and Icon, matching `docs/design/components/core/`. Later components are
  built as screens need them, each from its file in `docs/design/components/`.
  Scope: Tech stack and hosting → UI component library.
  Done when: the Button story renders in light and dark and is used in the app.
- [ ] **9. Generated client.** orval generates `api-client` (types + zod) from `contracts/openapi/workouterr.json`;
  a check fails if the generated code is out of date.
  Scope: Tech stack and hosting → API contract.
  Done when: the app calls `/api/health` with the generated types, and the check catches a stale client.

## Milestone 1a — Usable logger for me

### Auth

- [ ] **10. CLI commands and users.** Command mode in `Workouterr.Api` (`dotnet run -- user create <email>`), running
  with the same configuration and database as the API; the user is created through Identity's `UserManager`.
  Scope: Accounts → Invites (CLI script); Tech stack and hosting → Auth.
  Done when: a user created from the CLI is in the database with a hashed password.
- [ ] **11. Auth endpoints.** `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` on
  `SignInManager` with the Identity cookie; generic errors that never reveal whether an email exists.
  Scope: Accounts; Tech stack and hosting → Auth.
  Done when: API tests cover a good login (of a user created like the CLI does), a wrong password, an unknown
  email (same response), and logout.
- [ ] **12. Login storage.** Server-side ticket store in PostgreSQL; cookie `HttpOnly`, `Secure`, `SameSite=Strict`,
  30 days sliding (renewed at most once a day), 90 days max; session ID rotated on login; security stamp checked on
  every request.
  Scope: Tech stack and hosting → Auth.
  Done when: API tests show a logout and a stamp change take effect on the next request.
- [ ] **13. CSRF guard and client version.** Middleware: state-changing requests must be JSON with a matching
  `Origin`; the client version header is read (the `426` path is in place but unused).
  Scope: Tech stack and hosting → Auth (CSRF); Non-functional requirements → old clients.
  Done when: API tests reject a cross-origin login POST and a form-encoded one.
- [ ] **14. Login screen and app shell.** Login page, auth guard, 401 handling, logout; tablet-first app layout with
  navigation (sidebar with logo, sections and a footer with the user, active plan, sun / moon theme button and
  logout). The theme button saves to `localStorage` only; task 18 saves it on the account.
  Scope: Accounts → Theme; Non-functional requirements (iPad).
  Design: `docs/design/screens/LoginScreen.jsx` (login half only), `AppShell.jsx`.
  Done when: you can log in on an iPad-sized viewport, reach an empty home page, switch the theme and log out; the
  layout is checked on the real iPad.

### Deploy

- [ ] **15. Container images.** Multi-stage API Dockerfile, Caddy image with the built Angular app, `compose.yaml` with
  `caddy`, `api`, `postgres` (named volume, no exposed port), EF Core migration bundle.
  Scope: Tech stack and hosting → Hosting.
  Done when: the app as built so far (login and the shell) runs locally from `compose.yaml` over HTTPS.
- [ ] **16. Server.** Hetzner EU VPS; `A` / `AAAA` records in the domain's OVH DNS zone pointing at it (check
  the zone's existing records first, or use a subdomain); SSH keys only, firewall (22, 80, 443), automatic
  security updates, Docker; written down in `docs/server-setup.md`. `.env` with secrets (`chmod 600`).
  Scope: Tech stack and hosting → Hosting.
  Done when: you can SSH in with a key, password login is refused, `docker compose version` works, and the domain
  resolves to the server.
- [ ] **17. Deploy script.** `deploy/deploy.sh`: lint, build and type check, OpenAPI and client checks, all tests
  (E2E too once task 35 adds them, unless an explicit flag skips them), build images,
  `docker save | ssh docker load`, run the migration bundle, `docker compose up -d`. External uptime check on
  `/api/health`; your account created with the CLI on the server. From here on, each finished task can be deployed.
  Scope: Tech stack and hosting → Tests (deploy script), Hosting, Operations.
  Done when: one command deploys to the server, you can log in there from the iPad, and a failing test stops the
  script before anything is sent.

### Settings and operations basics

- [ ] **18. Account settings.** Settings endpoint and page: optional display name, rest-timer sound on/off; the
  sidebar theme button now also saves the theme on the account, and it comes back from the same endpoint.
  Scope: Accounts (display name, theme); Session tracking → Rest timer (sound).
  Design: `docs/design/screens/SettingsScreen.jsx` (preferences card; email, password, export and delete come
  later).
  Done when: a theme chosen on one browser applies on another after login.
- [ ] **19. Logs and error tracking.** Structured JSON logs through `ILogger` with user ID only; error tracker (Sentry
  EU or GlitchTip) for the API and the app.
  Scope: Tech stack and hosting → Operations.
  Done when: a thrown test exception from each side appears in the tracker, and the log line has no email.

### Exercises

- [ ] **20. Exercise model.** Entity with metrics (WEIGHT + REPS, REPS, TIME), weight and time steps, per side, muscle
  groups (enum), archived flag; column settings (lengths, decimal precision); migration.
  Scope: Exercises.
  Done when: the migration applies and the enums appear in the OpenAPI document.
- [ ] **21. Exercise endpoints.** List (with muscle-group filter and archived toggle), create, update, archive,
  restore; request types carry the limits as data annotations. Archiving is blocked while the exercise is in a
  routine (response lists the routines).
  Scope: Exercises; Routines → Limits.
  Done when: API tests cover every endpoint, the limits and the archive rule.
- [ ] **22. Starter exercises.** About 25 exercises in a JSON file (English and Polish), a test validating it against
  the exercise schema, copied in the user-creation transaction (CLI included). Users get a language (`en` by default,
  `user create <email> --language pl`); the language setting itself comes in task 43.
  Scope: Exercises (starter set); Accounts → Language setting.
  Done when: a new user has the starter set in their language, and a broken JSON entry fails the test.
- [ ] **23. Exercise screens.** List with muscle-group filter, create / edit form (generated zod schema), archive and
  restore, the "used in routines" message. UI components added to `ui` as needed.
  Scope: Exercises.
  Design: `docs/design/screens/ExercisesScreen.jsx`, `ExercisePicker.jsx`.
  Done when: you can manage exercises on an iPad-sized viewport.

### Routines

- [ ] **24. Routine model.** Routine and routine entries (stable IDs, soft-deleted when removed, order, sets, rest
  time, progression: rep ladder or step); migration.
  Scope: Routines.
  Done when: the migration applies and the schema covers every field the scope lists.
- [ ] **25. Routine endpoints.** CRUD, reorder, archive / restore; request types with the limits, cross-field checks
  (ascending ladder, 1–10 rungs) and count limits.
  Scope: Routines (including Limits).
  Done when: API tests cover reordering keeping entry IDs, removing an entry (soft delete), the limits and the
  rejection of an unsorted ladder.
- [ ] **26. Routine editor.** Screen for name, description and entries: add an exercise (picker with muscle-group
  filter), reorder, sets, rest time, ladder editor that sorts rungs.
  Scope: Routines.
  Design: `docs/design/screens/RoutinesScreen.jsx` (ladder editor, entries), `ExercisePicker.jsx`.
  Done when: you can build your real routines in the app.

### Domain rules

- [ ] **27. Shared test cases and progression (C#).** `contracts/domain-cases/` format (input, expected output, description);
  progression cases from the scope (ladder, top and bottom rung, off-ladder reps, clamping, REPS / TIME steps);
  `Workouterr.Domain` implementation, test first.
  Scope: Routines → Progression rules; Tech stack and hosting → Domain rules.
  Done when: every progression rule in the scope has a case and the C# tests pass.
- [ ] **28. Prefill and pre-select (C#), pre-select (TypeScript).** Prefill (same routine entry, else the
  exercise's last session, else empty) and increase pre-select (all routine sets logged and each met the target), as
  pure functions over session history in `Workouterr.Domain`; cases first. The `domain` library starts with
  pre-select, which the live screen needs, running the same JSON cases.
  Scope: Session tracking → Prefill, Per exercise in a session (mark), Swapped and extra exercises; Tech stack and
  hosting → Domain rules.
  Done when: the C# tests pass the shared cases, including swapped, extra and skipped exercises, and the TypeScript
  tests pass the pre-select cases with no copied fixtures.

### Sessions

- [ ] **29. Session model.** Session (client UUID, version, start in UTC + time zone, finish time, stored plan /
  routine / exercise names), session exercises (routine entry, swapped or extra; target; mark; note), sets (logged
  values); migration.
  Scope: Session tracking.
  Done when: the migration applies and the schema covers every field the scope lists.
- [ ] **30. Session endpoints.** Idempotent `PUT /api/sessions/{id}` with version check (`409`), one in-progress session
  per user (`409`), finish via the same PUT, discard, `GET` the in-progress session. Exercise metrics become fixed
  once used.
  Scope: Session tracking; Non-functional requirements → Sync, Conflicts.
  Done when: API tests cover retries without duplicates, both 409 cases, finishing and discarding.
- [ ] **31. Session start data.** Endpoint returning, for a routine, each entry's prefilled target and previous numbers
  (sets, note, date) using the domain rules.
  Scope: Session tracking → Prefill, previous numbers.
  Done when: API tests show the target follows the last mark of the same routine entry.
- [ ] **32. Live session screen.** Pick a routine, exercise cards with target and previous numbers, prefilled sets,
  one-tap logging, +/- by step, target change updates unlogged sets, debounced save.
  Scope: Session tracking; Success criteria → Logging is fast.
  Design: `docs/design/screens/StartScreen.jsx`, `SessionScreen.jsx`, `SessionExercise.jsx`, `kit.jsx`
  (SetLine, MetricSteppers, PrevStrip).
  Done when: you can log a whole routine on an iPad-sized viewport, each prefilled set in one or two taps.
- [ ] **33. Rest timer and wake lock.** Timer service storing its end time; full-screen cue and sound (setting
  respected); Screen Wake Lock during a session. Unit tests with fake timers.
  Scope: Session tracking → Rest timer.
  Design: `docs/design/components/workout/RestTimer.js`, the cue overlay in `screens/SessionScreen.jsx`; add +15 s /
  −15 s and skip, no pause.
  Done when: the timer is correct after the tab was hidden, and the tests pass.
- [ ] **34. Mid-session changes and finishing.** Add / remove set, skip, swap (replaced exercise's muscle groups
  pre-selected), extra exercise, notes, marks with pre-select, finish with the offer to save swapped and extra
  exercises into the routine, forgotten-session prompt (last set over 3 h old), duration display.
  Scope: Session tracking (mid-session changes, finishing, forgotten session, duration).
  Design: `docs/design/screens/SessionScreen.jsx` (finish and discard dialogs, save-to-routine rows),
  `SessionExercise.jsx` (marks, skip, swap).
  Done when: each change behaves as the scope describes in a manual run, and the logic-heavy parts have tests.
- [ ] **35. End-to-end test.** Playwright on WebKit with an iPad viewport: log in, start a routine, log sets, finish;
  the next session shows the progressed target.
  Scope: Tech stack and hosting → Tests (end to end).
  Done when: the test passes locally and the deploy script runs it.

### First gym session

- [ ] **36. iPad checklist and first gym session.** `docs/ipad-checklist.md` (wake lock, sound at rest end, timer
  after locking, touch targets); deploy the finished 1a.
  Scope: Tech stack and hosting → Tests (real iPad); Success criteria.
  Done when: you've logged a real gym session on the iPad.
## Milestone 1b — Private beta

- [ ] **37. Email.** Mailpit in `compose.dev.yaml`; `IEmailSender` with MailKit over SMTP; translated templates; Brevo
  account with tracking off; SPF, DKIM and DMARC records in the OVH DNS zone.
  Scope: Tech stack and hosting → Transactional email.
  Done when: an API test reads a sent email from Mailpit, and a real email from production lands in the inbox.
- [ ] **38. Rate limiting.** Failed attempts per email and per IP stored in PostgreSQL, applied to login (then to
  registration, reset and invites as they arrive).
  Scope: Tech stack and hosting → Auth (rate limiting).
  Done when: API tests show the limit kicks in and survives an API restart.
- [ ] **39. Scheduled jobs.** `BackgroundService` with a daily `PeriodicTimer`; each job a class with its own test
  and a CLI command. First jobs: expired logins, old rate-limit records.
  Scope: Tech stack and hosting → Scheduled jobs.
  Done when: running a job from the CLI deletes only expired rows.
- [ ] **40. Invites and registration.** CLI `invite create <email>` (language chosen), single-use 7-day token, email;
  registration only through an invite (configuration flag), account verified on redemption; expired-invite job.
  Scope: Accounts → Invites.
  Design: `docs/design/screens/LoginScreen.jsx` (registration half: email locked, optional display name, terms).
  Done when: the full invite → register → login flow passes as an API test and in the browser.
- [ ] **41. Email verification flow.** For open registration later: no login until verified, 24-hour link, resend
  (neutral response), unverified accounts deleted after 7 days, "someone tried to register" email.
  Scope: Accounts (register, verification).
  Done when: API tests cover each case, with responses that never reveal whether an email exists.
- [ ] **42. Password and email changes.** Password reset (logs out all devices), change password (current password
  required, logs out others), change email (verify new address, notify old).
  Scope: Accounts (password reset, change password, change email).
  Design: `docs/design/screens/SettingsScreen.jsx` (email and password cards).
  Done when: API tests cover each flow, including logouts through the security stamp.
- [ ] **43. Polish.** Transloco `pl`, language setting (browser default at registration), number and date formatting,
  number input accepting `,` and `.`, Polish emails.
  Scope: Accounts → Language setting; Non-functional requirements → Multilanguage.
  Done when: the whole app and every email work in Polish, and `1,25` is accepted as 1.25 kg.
- [ ] **44. Training plans.** Model (soft-deleted entries), endpoints, editor, active plan, archive (clears the
  active plan); rotation rule in `Workouterr.Domain` with shared cases; suggestion on the start screen.
  Scope: Training plans.
  Design: `docs/design/screens/PlansScreen.jsx`, rotation chips in `StartScreen.jsx`.
  Done when: the rotation cases from the scope pass and the start screen suggests the next routine.
- [ ] **45. Progression and prefill (TypeScript).** The `domain` library gains progression (exact decimal handling)
  and prefill, running the same JSON cases, for offline sessions.
  Scope: Routines → Progression rules; Session tracking → Prefill; Tech stack and hosting → Domain rules, Weight
  values.
  Done when: the TypeScript tests pass every progression and prefill case with no copied fixtures.
- [ ] **46. Offline data.** Preload endpoint (active routines, exercises, prefill data, rotation suggestion), stored in
  IndexedDB, refreshed on online load and after each finished session; sessions start and finish offline with the
  TypeScript rules; offline indicator.
  Scope: Non-functional requirements → flaky connectivity (preload, sync).
  Done when: in airplane mode you can start, log and finish a session.
- [ ] **47. Sync.** Sync service: retries, 409 dialogs (keep this device or load the other), 401 → login over the
  session then retry, a different user's login wipes stored data. Unit tests with fake timers and fake IndexedDB.
  Scope: Non-functional requirements → Sync, Conflicts; Tech stack and hosting → Auth (expired login).
  Done when: the tests cover each case, and logged sets are never discarded without asking.
- [ ] **48. Service worker.** `@angular/service-worker` caches the app shell; update check on load offers a reload,
  never during a session.
  Scope: Non-functional requirements → App shell, old clients.
  Done when: reloading in airplane mode reopens the app with the session.
- [ ] **49. Offline end-to-end test.** Playwright: go offline mid-session, finish, come back online, the session syncs.
  Scope: Tech stack and hosting → Tests (end to end, real iPad).
  Done when: the test passes; the iPad checklist gains airplane mode and decimal comma.

## Milestone 2 — History and progress

- [ ] **50. Session history.** List by date, detail view, delete, edits (values, targets, notes, marks, start and
  finish time) through the same `PUT`; each save refreshes the offline cache.
  Scope: Session tracking → Session history.
  Design: `docs/design/screens/HistoryScreen.jsx` (plus marks and start / finish time in edit mode).
  Done when: editing a mark changes the next session's prefill.
- [ ] **51. Progress charts.** Chart values in `Workouterr.Domain` (top set and volume for WEIGHT + REPS, best set for
  REPS / TIME), endpoint, chart screen.
  Scope: Progress.
  Design: `docs/design/screens/ProgressScreen.jsx`, `docs/design/components/workout/VolumeChart.js`.
  Done when: chart values match hand-computed ones in domain tests.
- [ ] **52. Personal records.** Records computed from history (heaviest weight, rep-max table, most reps, longest
  set; per side and added weight rules), endpoint, screen.
  Scope: Progress → Personal records.
  Design: `docs/design/screens/ProgressScreen.jsx` (records cards).
  Done when: domain tests cover each record type, and an edited session changes the records.
- [ ] **53. Data export.** Streamed ZIP with `workouterr-export.json` (format version) and `sets.csv` in neutral formats.
  Scope: Accounts → Export all data.
  Design: `docs/design/screens/SettingsScreen.jsx` (export card).
  Done when: an API test unzips the export and checks both files.

## Milestone 3 — Public launch

- [ ] **54. Delete account.** Password-confirmed, immediate deletion of everything linked to the user, other devices
  logged out.
  Scope: Accounts → Delete account.
  Design: `docs/design/screens/SettingsScreen.jsx` (delete card and dialog).
  Done when: an API test shows no rows left for the user.
- [ ] **55. Backups.** Nightly encrypted `pg_dump` to EU storage off the server, kept 30 days; restore test into a
  scratch database.
  Scope: Tech stack and hosting → Operations (backups).
  Done when: a restore from last night's backup succeeds.
- [ ] **56. Legal pages.** Privacy policy and terms in English and Polish, linked from registration.
  Scope: Non-functional requirements → Privacy.
  Done when: both pages are live in both languages.
- [ ] **57. Production hardening.** Security headers (CSP, HSTS), dependency updates, review of rate limits, logs and
  alerts.
  Scope: Tech stack and hosting (Auth, Operations).
  Done when: every item on the hardening checklist is done.
- [ ] **58. Open registration.** Turn off the invite check.
  Scope: Accounts → Invites; Timeline → Public launch.
  Done when: a stranger can register, verify and log in.
