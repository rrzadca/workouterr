# 04 — Deploy to MyDevil

Status: ready-for-agent
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

- [ ] `scripts/deploy.sh` deploys from a clean state and stops at the first failing step
- [ ] The production URL shows the Angular app, and its home page shows `GET /api/health` = OK
- [ ] Migrations ran from the Mac through the tunnel (ADR-0001)
- [ ] The app comes back after Passenger stops it (first request after idle works)

## Notes

Some steps need the MyDevil panel or SSH. The agent writes the script and the doc; I run the panel steps.
