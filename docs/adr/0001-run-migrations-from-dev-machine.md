# Run database migrations from the dev machine, not on the server

Production runs on MyDevil shared hosting (FreeBSD). Prisma's runtime works there (the TypeScript query compiler
with `@prisma/adapter-pg` needs no native engine), but `prisma migrate deploy` needs the Rust schema-engine binary,
and Prisma publishes none for FreeBSD (its binary CDN returns 404 for freebsd13/14/15 as of Prisma 7.10).

We run `prisma migrate deploy` from the dev machine through the SSH tunnel to MyDevil's PostgreSQL, as the first
step of the deploy script (migrate → upload files → `npm ci` → restart). Migrations must be backward compatible
(add first, remove in a later deploy), so the running code keeps working if the deploy stops after migrating.

## Considered options

- **Build schema-engine for FreeBSD ourselves** (`PRISMA_SCHEMA_ENGINE_BINARY`): rejected; fragile on shared
  hosting, may need `devil binexec on`, and must be rebuilt on every Prisma upgrade.
- **Plain SQL migrations with a pure-JS runner on the server** (e.g. node-pg-migrate): rejected for now; loses
  Prisma's schema diffing. Revisit if deploying from the dev machine becomes a problem (e.g. CI deploys).
