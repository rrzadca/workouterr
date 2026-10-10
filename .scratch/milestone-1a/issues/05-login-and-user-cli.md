# 05 — Login, logout and the `user:create` script

Status: ready-for-agent
Blocked by: 02, 03

## What to build

Auth for a single account created by hand. No registration, no email flows (that's 1b).

- `User` model; `createUser()` domain function (the starter set gets added to it in ticket 07)
- `npm run user:create -- --email … ` asks for the password, hashes it with argon2
- Login sessions in PostgreSQL; cookie `HttpOnly`, `Secure`, `SameSite=Strict`; session ID rotated on login
- Lifetime: 30 days, extended at most once a day, expires after 90 days at the latest
- Middleware: `requireAuth`; CSRF check (state-changing requests must be JSON and carry a matching `Origin`)
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
- Login error says only "invalid email or password"
- Angular: login page, auth guard, logout button, redirect to login on 401
- Design: `LoginScreen.jsx`, the login form only (no registration, "remember me", forgot password or Apple login); see [design/README.md](../design/README.md)

## Acceptance criteria

- [ ] Tests cover: wrong password, unknown email (same response), expired session, sliding extension, cap at
      90 days, CSRF rejection (missing or foreign `Origin`, non-JSON body)
- [ ] I can log in and out on the deployed app with an account created by the script on the server
- [ ] argon2 installs and works on MyDevil (or the ticket records the fallback chosen)
