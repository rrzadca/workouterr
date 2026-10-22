# Web

Angular workspace (standalone, zoneless, Tailwind CSS v4). Run every command from `web/`, on the Node version in
`.nvmrc`.

- `projects/workouterr`: the app. Later projects (`ui`, `domain`, `api-client`) sit beside it.
- Calls to the API use relative `/api/...` URLs: `ng serve` proxies them to the API (`proxy.conf.json`), Caddy does the
  same in production, so the app and the API always share one origin.
- Formatting is Prettier's alone (`.prettierrc`, Angular parser for `.html`); ESLint checks code, with
  `eslint-config-prettier` switching off its formatting rules. Each project's `eslint.config.js` extends the shared
  root one and sets its selector prefix.
- Unit tests run on Vitest through Angular's runner (`ng test`), with `jsdom`; HTTP is faked with
  `provideHttpClientTesting`.

## Commands

- `npm ci`: install the exact dependencies from `package-lock.json`.
- `npm start`: serve the app on `http://localhost:4200`, proxying `/api` to the API on `http://localhost:5080` (start
  the API first, see `api/CLAUDE.md`).
- `npm run lint`: ESLint over every project.
- `npm run format:check`: fail on unformatted files; `npm run format` fixes them.
- `npm run build`: production build into `dist/workouterr` (also the type check).
- `npm test -- --watch=false`: run the unit tests once; `npm test` watches.
