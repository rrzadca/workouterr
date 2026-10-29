# Web

Angular workspace (standalone, zoneless, Tailwind CSS v4). Run every command from `web/`, on the Node version in
`.nvmrc`.

- `projects/workouterr`: the app. `projects/ui`: the UI component library. `projects/api-client`: generated from the
  API's OpenAPI document. Later projects (`domain`) sit beside them.
- API client: orval (`orval.config.ts`) turns `../contracts/openapi/workouterr.json` into zod schemas with their
  TypeScript types in `projects/api-client/src/index.ts`, never edited by hand. The app imports it as
  `@workouterr/api-client` (a `tsconfig.json` path, like the UI library). A schema per component (`HealthResponse`)
  and per operation response (`GetHealthResponse`); calls pass the response schema to `httpResource` as
  `parse: GetHealthResponse.parse`, so a body the contract does not allow becomes the resource's error.
- Every `/api` request carries the build version (`package.json` `version`) in the client version header
  (`src/app/api/client-version.ts`); the header name is checked against the contract's operation header schemas.
  A `426` from any call marks the build outdated (`ClientVersionService`), and `App` covers every page with a
  "new version" dialog whose only action is a reload.
- Auth (`src/app/auth/`): `AuthService` knows the current user from `/api/auth/me` (asked once per load, until it
  answers) and logs in and out; `requireLogin` / `requireLoggedOut` guard the routes. Only a 401 means logged out:
  when the API can't be reached the guards show `/unreachable`, whose "Try again" asks again; a 401 from any call not marked `handlesUnauthorized`
  ends the login and shows the login page. Pages after login are children of the `Shell` route (sidebar layout);
  every page is lazy-loaded (`loadComponent`).
- Forms are Signal Forms (`@angular/forms/signals`): `form(model, (path) => validateStandardSchema(path, SomeBody))`
  with the generated zod schema, so the API's limits are the form's; `[formRoot]` on the `<form>`, `[formField]` on
  each control. UI library controls are Signal Forms controls (`FormValueControl`: a `value` model, plus the state
  inputs `[formField]` fills, such as `touched` and `invalid`), so `<rad-form-input-text [formField]="…" />` binds
  like a native input; the page passes only the translated `error` message.
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
- UI library: components follow `docs/design/components/`, one folder each with a spec and a story (`*.stories.ts`),
  inside a folder for their kind in `projects/ui/src/lib/` (`buttons/`, `form-inputs/`, `feedback/`; `icon/` stands
  alone). Form controls are named `FormInput*` after the input they wrap (`FormInputText` is the mockup's
  `TextField`). Components wrap the native element they stand for (`<rad-button>` renders a `<button>`), and
  native events such as `(click)` reach the host by bubbling. Icons are Lucide (`@lucide/angular`, bundled, so
  self-hosted): `<rad-icon name="plus" />`, with the names allowed listed in `projects/ui/src/lib/icon/icons.ts` (add
  one there when a screen needs it). Storybook (`@storybook/angular-vite`) shows every story twice, in a light and a
  dark panel (`.storybook/preview.ts`); a story covering the whole viewport (a modal) sets
  `parameters: { singleThemePanel: true }` and renders once, in the theme picked in the toolbar.
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
  `provideHttpClientTesting`. jsdom has no modal dialogs: `projects/ui/testing/html-dialog.ts` stubs `showModal()` /
  `close()`, loaded by both projects' tests (`setupFiles` in `angular.json`).

## Commands

- `npm ci`: install the exact dependencies from `package-lock.json`.
- `npm start`: serve the app on `http://localhost:4200`, proxying `/api` to the API on `http://localhost:5080` (start
  the API first, see `api/CLAUDE.md`).
- `npm run lint`: ESLint over every project.
- `npm run format:check`: fail on unformatted files; `npm run format` fixes them.
- `npm run build`: production build into `dist/workouterr` (also the type check).
- `npm run generate:api-client`: regenerate `projects/api-client` from the OpenAPI document (after every API change;
  commit the result with it).
- `scripts/check-api-client.sh`: regenerate the client and fail if `projects/api-client` differs from the committed or
  staged one (run by the deploy script).
- `npm run storybook`: Storybook for the UI library on `http://localhost:6006`.
- `npm run build-storybook`: static Storybook into `dist/storybook`.
- `npm test -- --watch=false`: run the unit tests of every project once; `npm test` watches; `npx ng test ui` runs one
  project's.
