# 15 — End-to-end tests in the deploy script

Status: ready-for-agent
Blocked by: 12, 13

## What to build

- Playwright on WebKit with an iPad viewport, against the real API and a test database
- Happy path: log in → start a routine → log every set → change a target → mark an exercise → finish → start the
  same routine again and see the adjusted prefill
- `scripts/deploy.sh` runs E2E after the other tests; `--skip-e2e` skips them only when passed on purpose

## Acceptance criteria

- [ ] `npm run e2e` passes locally from a clean database
- [ ] A failing E2E test stops the deploy
