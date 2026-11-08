# Web

Angular workspace (standalone, zoneless, Tailwind CSS v4). Run every command from `web/`, on the Node version in
`.nvmrc`.

- `projects/workouterr`: the app. `projects/api-client`: generated from the API's OpenAPI document. Later projects
  (`domain`) sit beside them. Generic UI components come from radinf-ui (below), not from a project here.
- API client: orval (`orval.config.ts`) turns `../contracts/openapi/workouterr.json` into zod schemas with their
  TypeScript types in `projects/api-client/src/index.ts`, never edited by hand. The app imports it as
  `@workouterr/api-client` (a `tsconfig.json` path to its source, so it builds with the app). A schema per component (`HealthResponse`)
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
  each control. radinf-ui's controls are Signal Forms controls (`FormValueControl`), so
  `<rad-form-input-text [formField]="…" />` binds like a native input. Each sits in a `<rad-form-field>`, whose
  `label` and `error` it links to the input. The field shows any `error` it is given, so the page passes
  the translated message only once the field is touched and invalid (a `computed` per field, as in `login.ts`).
  Text inputs are `size="lg"`: 17 px text, below 16 px Safari zooms into a focused input.
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
- UI components: generic ones (buttons, inputs, dialogs, …) come from radinf-ui, one entry point per family
  (`@rrzadca/radinf-ui/button`); a missing feature becomes an issue in `rrzadca/radinf-ui`, not a local copy.
  Workout-specific components (rest timer, set steppers) live in the app, beside the screens that use them, built
  from their file in `docs/design/components/` with Tailwind and the design tokens. Dialogs open from code:
  `inject(RadDialog).open(SomeDialog, { … })`, with an `<h2 radDialogTitle>` and a `<rad-dialog-footer>` in the
  content (see `new-version-dialog/`).
- Icons: Lucide drawings as path data in `src/app/icons.ts`, registered with `provideRadIcons` and shown with
  `<rad-icon name="…">` or a component's `icon` input; add one there when a screen needs it (the file says how).
- Global styles live in the app: `projects/workouterr/src/styles/global.css` (Tailwind, fonts, radinf-ui's
  stylesheet, tokens, theme), loaded by the app's `styles.css`. PostCSS (Tailwind) is configured once, in
  `.postcssrc.json` at the workspace root.
- Design tokens are in `projects/workouterr/src/styles/tokens.css`. Semantic colours are Tailwind colours named after
  the token (`bg-surface-card`, `text-text-muted`); Tailwind's default palette, font sizes, radii and shadows are
  removed, so only the design scales exist.
- radinf-ui (`@rrzadca/radinf-ui`, private, from GitHub Packages through `.npmrc`) is styled only through its
  `--rad-*` tokens: `styles/rad-theme.css` points them at ours (colours on every themed element, sizes and type on
  `:root`), loaded after radinf-ui's stylesheet so it wins. Never style its components' inner markup. A feature it
  lacks becomes an issue in `rrzadca/radinf-ui`.
- Theme: `data-theme="light" | "dark"` on `<html>`, set by `ThemeService` (`src/app/theme.ts`) when the app starts,
  from `localStorage['workouterr.theme']`, else the system theme. `dark:` utilities follow the attribute; nothing
  outside Angular touches the theme. Critical-CSS inlining is off in production: it leaves the
  `[data-theme='dark']` rules out of the inlined CSS.
- Unit tests run on Vitest through Angular's runner (`ng test`), with `jsdom`; HTTP is faked with
  `provideHttpClientTesting`. Specs drive radinf-ui's components through its component harnesses, from each
  family's `testing` entry point (`@rrzadca/radinf-ui/button/testing`) on `TestbedHarnessEnvironment`; dialogs
  render outside the component, so find them with `documentRootLoader(fixture)`.

## Commands

- `npm ci`: install the exact dependencies from `package-lock.json`. Needs `GITHUB_PACKAGES_TOKEN` (a GitHub token
  with `read:packages`) in the environment, for `@rrzadca/radinf-ui`.
- `npm start`: serve the app on `http://localhost:4200`, proxying `/api` to the API on `http://localhost:5080` (start
  the API first, see `api/CLAUDE.md`).
- `npm run lint`: ESLint over every project.
- `npm run format:check`: fail on unformatted files; `npm run format` fixes them.
- `npm run build`: production build into `dist/workouterr` (also the type check).
- `npm run generate:api-client`: regenerate `projects/api-client` from the OpenAPI document (after every API change;
  commit the result with it).
- `scripts/check-api-client.sh`: regenerate the client and fail if `projects/api-client` differs from the committed or
  staged one (run by the deploy script).
- `npm test -- --watch=false`: run the unit tests once; `npm test` watches.
