# Design

Mockups of the V1 web app made in Claude Design, in Polish, with fake data. They are the visual reference for the
Angular app: match their colours, fonts, layout and components, and build the code fresh (Angular templates,
Transloco keys, the app's own state). `project-scope.md` wins wherever the two disagree.

## Files

- `mockups.html`: the original export. Opens in a browser (it is a self-unpacking bundle of React, the screens and
  the assets).
- `tokens.css`: the design tokens, unchanged: palette, light and dark semantic colours (`[data-theme="dark"]`),
  type scale, spacing, control heights, radii, shadows, motion.
- `brand/`: logo files (full logo, mark and wordmark, in navy and teal).
- `components/`: the mockup's component library, compiled to plain `React.createElement` code, one file per
  component (`core/`, `forms/`, `feedback/`, `navigation/`, `workout/`).
- `guidelines/tailwind.config.js`: the mockup's Tailwind mapping of the tokens.
- `screens/`: readable JSX source of every screen. `data.jsx` is the fake data; `kit.jsx` holds the formatting
  helpers and small shared pieces (modal, set line, metric steppers, previous-numbers strip).

## Differences from the mockups

- **Touch sizes.** The mockups are Mac density (28 px controls, 13 px body text). The app uses controls at least
  44 px tall (about 56 px on the live session screen), 15–16 px body text and larger set values.
- **No window chrome.** The macOS title bar goes; the sidebar stays for iPad landscape.
- **Theme toggle** moves from the title bar to the sidebar footer (sun / moon).
- **Dropped:** "Continue with Apple", "Remember me", pause on the rest timer.
- **Changed:** the rest timer gets +15 s / −15 s next to skip; registration's name field is an optional display
  name.
- **Not in the mockups** (designed from the existing components when built): forgotten-session prompt, 409 conflict
  dialog, offline badge, sign-in-again overlay, "new version" prompt, invite registration, "check your inbox",
  email verification and password reset screens, plan archive, editing marks and times in history, legal pages.
