# 03 — Angular shell

Status: ready-for-agent
Blocked by: 01, 02

## What to build

The app frame every screen lives in.

- Tablet-first layout with Tailwind; large touch targets as the default size of `ui` buttons and inputs
- Transloco set up with an English file; every visible string goes through a key from now on (Polish arrives in
  1b as just another file)
- Number and date formatting through one helper/pipe per kind, ready for per-language formats
- Dev server proxy: `/api` → the local API (one origin, like production)
- An HTTP layer that turns the API error shape into typed errors
- Home page shows the result of `GET /api/health`
- First `ui` components as needed: button, page layout

## Acceptance criteria

- [ ] `ng serve` shows the health status from the API through the proxy
- [ ] No hard-coded UI text in templates (a lint rule or a review check)
- [ ] Layout is usable at iPad portrait and landscape sizes
