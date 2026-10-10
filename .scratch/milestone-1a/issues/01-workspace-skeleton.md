# 01 — Workspace skeleton

Status: done

## What to build

The empty monorepo every other ticket builds on.

- `git init`, `.gitignore`, `.nvmrc` (Node 24), `package.json` with npm workspaces and `engines.node`
- Packages: `api` (Express 5, TypeScript), `web` (newest Angular + Tailwind), `shared` (plain TypeScript, no
  Angular or Express imports), `ui` (Angular library project with Storybook)
- TypeScript strict everywhere; one ESLint + Prettier setup for the whole workspace
- Root scripts: `lint`, `typecheck`, `test` (runs every package's tests)
- `docker-compose.yml` with PostgreSQL for local development
- One trivial test per package so `npm test` proves each runner works (`node:test` for `api` and `shared`,
  Angular's default runner for `web` and `ui`)

## Acceptance criteria

- [x] `npm ci && npm run lint && npm run typecheck && npm test` passes from a clean clone
- [x] `web` and `api` can both import a type and a zod schema from `shared`
- [x] `docker compose up` starts PostgreSQL
- [x] Storybook starts and shows one placeholder story from `ui`

## Comments

- 2026-10-10: Done. All four criteria verified, the first one from a fresh clone on Node 24. Notes for later issues:
  `ui` is published as `@radinf/ui` (reusable outside this repo, no `@workouterr/*` or Transloco imports, enforced
  by lint). When `web` starts using it (issue 03), add a tsconfig `paths` entry to `ui/src/public-api.ts` and a
  Tailwind `@source` for the library's files.
