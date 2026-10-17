# 04 — Deploy to MyDevil

Status: done
Blocked by: 02, 03

## What to build

Get the tracer bullet running on the real server early, because FreeBSD and Passenger are the biggest unknowns.

- MyDevil setup steps documented in `docs/deploy.md`: Node 24 symlinks in `~/bin`, Node.js site type,
  PostgreSQL database, domain with HTTPS, `devil binexec on` if argon2 needs it
- `scripts/deploy.sh`, in this order: lint, type check, tests → open SSH tunnel → `prisma migrate deploy` →
  build → rsync → `npm ci --omit=dev` on the server → restart Passenger
- Angular build served as static files from the same domain, API under `/api`
- Production config through environment variables on the server (never committed)

## Acceptance criteria

- [x] `scripts/deploy.sh` deploys from a clean state and stops at the first failing step
- [x] The production URL shows the Angular app, and its home page shows `GET /api/health` = OK
- [x] Migrations ran from the Mac through the tunnel (ADR-0001)
- [x] The app comes back after Passenger stops it (first request after idle works)

## Notes

Some steps need the MyDevil panel or SSH. The agent writes the script and the doc; I run the panel steps.

## Comments

- 2026-10-17: Done. `https://workouterr.app` runs commit `5058c71`, deployed by `scripts/deploy.sh` (server s63).
  Checked: health ok with the version, `/` and `/exercises` get `index.html` with `no-cache`, scripts come from
  nginx, `_prisma_migrations` lists `20261010064657_init` (applied through the tunnel), and with Docker PostgreSQL
  stopped the deploy stops at the tests (exit 1, no tunnel opened). The spike (`.scratch/milestone-1a/deploy-spike.md`)
  showed that Passenger runs an ES module `app.js` with `.ts` imports and a workspace link to `shared/`, follows a
  `public_nodejs` symlink, reads `~/.bash_profile`, and starts the app on the first request after a restart.
  Notes for later issues:
  - **Layout:** the workspace lives in `~/domains/workouterr.app/app/`; `public_nodejs` is a link to
    `app/api/public_nodejs`. `index.html` sits next to `app.js` (served by Express, `no-cache`), the rest of the
    Angular build in `public/` (nginx). `docs/deploy.md` has the tree.
  - **Config:** `DATABASE_URL` is exported in `~/.bash_profile` on the server (`chmod 600`). The deploy reads it over
    SSH for the migration, so the Mac stores no password. New variables go there, then `devil www restart`.
  - **Install:** `npm ci --omit=dev --omit=optional --workspace=api --ignore-scripts`; the Prisma client is generated
    on the Mac and uploaded. `--omit=optional` keeps the Prisma CLI (an optional peer of `@prisma/client`) off the
    server.
  - **05:** `--ignore-scripts` also skips argon2's build; add `npm rebuild argon2` after `npm ci` in the deploy, and
    `devil binexec on` (docs/deploy.md step 5) if it needs it. A `user:create` CLI run over SSH must
    `source ~/.bash_profile` first, or run from an SSH login shell.
  - **14:** cron doesn't read `~/.bash_profile`; cron scripts must source it for `DATABASE_URL`. Backups belong
    outside `~/domains/workouterr.app/app/`, because the deploy's `rsync --delete` mirrors that directory.
  - **15:** `--skip-e2e` is not in the script yet; E2E goes after `npm test` in the checks step.
  - **Open:** `NODE_ENV` under Passenger is not confirmed (the app doesn't read it yet). Responses carry
    `x-powered-by: Express`; disable it in later hardening. The 1280 px logo PNGs from 03 are still unshrunk.
