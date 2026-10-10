# 14 — Backups and cleanup cron

Status: ready-for-agent
Blocked by: 04, 05

## What to build

- Nightly cron on MyDevil: `pg_dump` into a folder outside the web root, keep 14 days
- `scripts/pull-backup.sh` on the Mac: copies the newest dump, keeps only the last 2 locally
- Cleanup cron script (uses the app's Prisma client): deletes expired login sessions
- Both crons documented in `docs/deploy.md`
- `docs/restore.md`: how to restore a dump into a local database

## Acceptance criteria

- [ ] I restored a real backup into local Docker PostgreSQL by following `docs/restore.md`
- [ ] Old dumps are deleted after 14 days on the server and after 2 copies on the Mac
- [ ] The cleanup script has a test against the test database
