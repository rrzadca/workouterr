# Web

Angular workspace (standalone, zoneless, Tailwind CSS v4). Run every command from `web/`, on the Node version in
`.nvmrc`.

- `projects/workouterr`: the app. `projects/ui`: the UI component library. Later projects (`domain`, `api-client`) sit
  beside them.
- The app imports the library as `@workouterr/ui`, mapped in `tsconfig.json` to its source (`src/public-api.ts`), so it
  builds with the app and never needs building first.
- Calls to the API use relative `/api/...` URLs: `ng serve` proxies them to the API (`proxy.conf.json`), Caddy does the
  same in production, so the app and the API always share one origin.
- Formatting is Prettier's alone (`.prettierrc`, Angular parser for `.html`); ESLint checks code, with
  `eslint-config-prettier` switching off its formatting rules. Each project's `eslint.config.js` extends the shared
  root one and sets its selector prefix.
- Class members in this order: injected services (`inject(...)`), plain fields, signals (`signal`, `computed`,
  resources), constructor, methods. A field initializer can only read fields declared above it, so injections go
  first.
- UI text lives in `projects/workouterr/public/i18n/<lang>.json` (Transloco, loaded over HTTP before the first
  render); templates use `*transloco="let t"`, specs provide the same JSON through `TranslocoTestingModule`.
- UI library: components follow `docs/design/components/`, one folder each in `projects/ui/src/lib/` with a spec and a
  story (`*.stories.ts`). Components wrap the native element they stand for (`<rad-button>` renders a `<button>`), and
  native events such as `(click)` reach the host by bubbling. Icons are Lucide (`@lucide/angular`, bundled, so
  self-hosted): `<rad-icon name="plus" />`, with the names allowed listed in `projects/ui/src/lib/icon/icons.ts` (add
  one there when a screen needs it). Storybook (`@storybook/angular-vite`) shows every story twice, in a light and a
  dark panel (`.storybook/preview.ts`).
- Global styles live in the library: `projects/ui/src/styles/global.css` (Tailwind, fonts, tokens, theme), loaded by
  the app's `styles.css` and by Storybook. PostCSS (Tailwind) is configured once, in `.postcssrc.json` at the
  workspace root.
- Design tokens are in `projects/ui/src/styles/tokens.css`. Semantic colours are Tailwind colours named after
  the token (`bg-surface-card`, `text-text-muted`); Tailwind's default palette, font sizes, radii and shadows are
  removed, so only the design scales exist.
- Theme: `data-theme="light" | "dark"` on `<html>`, set by `ThemeService` (`src/app/theme.ts`) when the app starts,
  from `localStorage['workouterr.theme']`, else the system theme. `dark:` utilities follow the attribute; nothing
  outside Angular touches the theme. Critical-CSS inlining is off in production: it leaves the
  `[data-theme='dark']` rules out of the inlined CSS.
- Unit tests run on Vitest through Angular's runner (`ng test`), with `jsdom`; HTTP is faked with
  `provideHttpClientTesting`.

## Commands

- `npm ci`: install the exact dependencies from `package-lock.json`.
- `npm start`: serve the app on `http://localhost:4200`, proxying `/api` to the API on `http://localhost:5080` (start
  the API first, see `api/CLAUDE.md`).
- `npm run lint`: ESLint over every project.
- `npm run format:check`: fail on unformatted files; `npm run format` fixes them.
- `npm run build`: production build into `dist/workouterr` (also the type check).
- `npm run storybook`: Storybook for the UI library on `http://localhost:6006`.
- `npm run build-storybook`: static Storybook into `dist/storybook`.
- `npm test -- --watch=false`: run the unit tests of every project once; `npm test` watches; `npx ng test ui` runs one
  project's.
