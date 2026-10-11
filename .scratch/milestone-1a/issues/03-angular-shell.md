# 03 — Angular shell

Status: done
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
- Design: the tokens from `design/source/tokens.css` as a Tailwind v4 `@theme` with light and dark values
  (`data-theme`), the Geist / Geist Mono / Black Ops One fonts, and the logo from `web/src/assets/images` in the
  shell header. Look follows `AppShell.jsx`, `SidebarNav` and `Button`; see [design/README.md](../design/README.md)

## Acceptance criteria

- [x] `ng serve` shows the health status from the API through the proxy
- [x] No hard-coded UI text in templates (a lint rule or a review check)
- [x] Layout is usable at iPad portrait and landscape sizes
- [x] The shell matches the design's `AppShell` look in both light and dark theme, with the right logo for each

## Comments

- 2026-10-11: Done. Checked with the API through the proxy (healthy, Postgres stopped → 503, API stopped → 502) and
  with headless Chrome screenshots at 1180×820 and 820×1180 in both themes. Compared with the design's source
  (`AppShell.jsx`, `TitleBar`, `SidebarNav`, `Button`, `Toolbar`), not with the clicked-through prototype. Notes for
  later issues:
  - **Tokens** are in `web/src/styles/tokens.css` as a Tailwind v4 theme. Colours are `--color-*`, so the design's
    `--text-body` colour is `text-text-body` and the 13px size is `text-body`. Tailwind's default palette is off.
  - **`@radinf/ui`** has `Button` (`button[rad-button]`, default 44px `xl`, `iconOnly`), `SidebarNav`
    (`nav[rad-sidebar-nav]`, router links) and `PageLayout` (`rad-page-layout`, `[pageActions]` slot). Templates are
    separate `.html` files. Storybook uses web's tokens and has a light/dark toolbar switch.
  - **Text:** every visible string is a Transloco key in `web/public/i18n/en.json`. `npm run lint` runs
    `scripts/check-template-text.ts`, which fails on text in templates; strings inside bindings
    (`[title]="'…'"`) are not caught. Ui components take text through inputs; use `translateSignal` to pass them.
  - **Formatting:** `formatNumber` / `formatDate` pipes and the `Formatter` service, with named formats in
    `web/src/app/formatting/formats.ts`. `en` uses `en-GB` conventions; Polish (1b) adds a locale and a JSON file.
  - **HTTP:** failed `/api` requests become `ApiError` (API error shape, switch on `code`), `UnexpectedResponseError`
    (other body, kept in `body`) or `NetworkError` (no answer, or a proxy's 502/504).
  - **Routes:** `Shell` is a layout route at `''`; ticket 05 puts `/login` next to it so login has no sidebar, and
    later tickets add sidebar items in `shell.ts`.
  - **Open:** a short light flash on load in dark mode (theme is set after Angular starts; an inline script in
    `index.html` would fix it); the logo PNGs are 1280 px wide, worth shrinking in 04; 11–13px text from the design
    may be small on the iPad.
