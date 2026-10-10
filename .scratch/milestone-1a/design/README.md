# Design reference

`Workouterr Mac App.html` is the UI design made in Claude Design. It is the reference for how the Angular app looks.

## How to use it

- **To look at it:** open the HTML file in a browser. It is a clickable prototype: log in with any values, then
  move between screens from the sidebar and switch themes with the moon / sun button in the title bar.
- **To read it:** use the files in `source/`, not the HTML. The HTML keeps every file gzipped and base64-encoded.
  After the HTML changes, run `python3 -I extract.py` in this directory to rebuild `source/`.

| Path                                                 | Contents                                                                        |
| ---------------------------------------------------- | ------------------------------------------------------------------------------- |
| `source/tokens.css`                                  | All design tokens, light and dark theme, base styles                            |
| `source/design-system/components/**`                 | Components such as Button, Stepper and RestTimer (compiled from JSX)            |
| `source/design-system/guidelines/tailwind.config.js` | The tokens as a Tailwind **v3** config (we use v4, see below)                   |
| `source/screens/*.jsx`                               | App screens in their original JSX; `kit.jsx` holds helpers, `data.js` fake data |

## Brand

- **Colours** are sampled from the logo: navy `#0e2d40`, teal `#3f858c` (the accent), amber `#f2ae2e` (highlights).
  Screens use only semantic tokens (`--surface-card`, `--text-strong`, `--accent`, `--border-hairline`, …), and
  the dark theme redefines them under `[data-theme="dark"]`.
- **Fonts** come from Google Fonts: Geist for UI text, Geist Mono for numbers (tabular figures), Black Ops One for brand display text.
- **Icons** are Lucide (`lucide-static@0.427.0` in the design).

## Logos

The files are in `web/src/assets/images/`, served at `/assets/images/…`. The `-dark` files are navy, for light
backgrounds. The `-light` files are teal, for dark backgrounds.

| Where                   | Light theme                           | Dark theme                              |
| ----------------------- | ------------------------------------- | --------------------------------------- |
| Sidebar header          | `logo-simple-dark` + `logo-name-dark` | `logo-simple-light` + `logo-name-light` |
| Login page (navy panel) | `logo-full-light`                     | `logo-full-light`                       |

## Screens and tickets

| Design file                                                                   | Ticket                 |
| ----------------------------------------------------------------------------- | ---------------------- |
| `AppShell.jsx`, `SidebarNav`, `TitleBar`, `Button`                            | 03 Angular shell       |
| `LoginScreen.jsx`                                                             | 05 Login               |
| `ExercisesScreen.jsx`                                                         | 06 Exercises           |
| `RoutinesScreen.jsx`                                                          | 08 Routines            |
| `StartScreen.jsx`, `SessionScreen.jsx`, `SessionExercise.jsx`                 | 11 Live session screen |
| `RestTimer`, the sound switch in `SettingsScreen.jsx`                         | 12 Rest timer          |
| `ExercisePicker.jsx`, swap / extra / "save to routine" in `SessionScreen.jsx` | 13 Mid-session changes |

## Not in 1a

The design shows the whole product. Leave these out for now:

- Registration, "remember me", forgot password, "Continue with Apple"
- Plans and rotation (`PlansScreen.jsx`, plan chips on `StartScreen.jsx`), History, Progress / charts / records
- The language switch in Settings
- The Polish text. Every string goes through a Transloco key with English text.

## When the design and a ticket disagree

Behaviour follows `project-scope.md` and the ticket. Look and feel follows the design.

## Notes for building it (ticket 03 onwards)

- Turn `tokens.css` into a Tailwind v4 `@theme` in `web`. Use the semantic names as utilities (`bg-surface-card`,
  `text-text-strong`, `bg-accent`), and set dark mode with a `data-theme` attribute
  (`@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *))`).
- `@radinf/ui` must not contain Workouterr brand colours. Its components use the semantic utilities, and the app
  defines their values. That keeps the library reusable (see ticket 01's notes).
- The design is drawn as a Mac window with small controls (28 px). We build for the iPad, so `ui` buttons and
  inputs default to the large size (`--control-h-xl`, 44 px).
- The design draws a Mac title bar; a browser app doesn't need one. Put the theme toggle and the subtitle in the
  shell's header instead.
