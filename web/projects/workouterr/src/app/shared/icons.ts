import type { RadIconSet } from '@rrzadca/radinf-ui/icon';

// The icons the app shows through `<rad-icon name="…">`, registered with `provideRadIcons` in `app.config.ts`. radinf-ui
// adds its own built-in ones (`close`, `check`, `chevron`, `more`).
//
// Each is a Lucide icon (https://lucide.dev/icons, ISC licence) as path data, because radinf-ui draws icons from
// paths only. To add one, copy its SVG from lucide.dev and convert any other shape to a path:
// - `<circle cx cy r>` → `M{cx+r} {cy}a{r} {r} 0 1 1-{2r} 0a{r} {r} 0 1 1 {2r} 0`
// - `<line x1 y1 x2 y2>` → `M{x1} {y1}L{x2} {y2}`
// - `<rect x y width height rx>` → four sides and four `a{rx} {rx} 0 0 1` corners, starting at `M{x+rx} {y}`
export const appIcons = {
  archive: {
    paths: [
      'M3 3h18a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-18a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z',
      'M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8',
      'M10 12h4',
    ],
  },
  'archive-restore': {
    paths: [
      'M3 3h18a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-18a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Z',
      'M4 8v11a2 2 0 0 0 2 2h2',
      'M20 8v11a2 2 0 0 1-2 2h-2',
      'm9 15 3-3 3 3',
      'M12 12v9',
    ],
  },
  'circle-alert': { paths: ['M22 12a10 10 0 1 1-20 0a10 10 0 1 1 20 0', 'M12 8L12 12', 'M12 16L12.01 16'] },
  dumbbell: {
    paths: [
      'M17.596 12.768a2 2 0 1 0 2.829-2.829l-1.768-1.767a2 2 0 0 0 2.828-2.829l-2.828-2.828a2 2 0 0 0-2.829 2.828l-1.767-1.768a2 2 0 1 0-2.829 2.829z',
      'm2.5 21.5 1.4-1.4',
      'm20.1 3.9 1.4-1.4',
      'M5.343 21.485a2 2 0 1 0 2.829-2.828l1.767 1.768a2 2 0 1 0 2.829-2.829l-6.364-6.364a2 2 0 1 0-2.829 2.829l1.768 1.767a2 2 0 0 0-2.828 2.829z',
      'm9.6 14.4 4.8-4.8',
    ],
  },
  house: {
    paths: [
      'M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8',
      'M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    ],
  },
  lock: {
    paths: ['M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-14a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2Z', 'M7 11V7a5 5 0 0 1 10 0v4'],
  },
  'log-out': { paths: ['m16 17 5-5-5-5', 'M21 12H9', 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4'] },
  mail: {
    paths: [
      'm22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7',
      'M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-16a2 2 0 0 1-2-2v-12a2 2 0 0 1 2-2Z',
    ],
  },
  moon: {
    paths: [
      'M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401',
    ],
  },
  plus: { paths: ['M5 12h14', 'M12 5v14'] },
  'refresh-cw': {
    paths: [
      'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8',
      'M21 3v5h-5',
      'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16',
      'M8 16H3v5',
    ],
  },
  search: { paths: ['m21 21-4.34-4.34', 'M19 11a8 8 0 1 1-16 0a8 8 0 1 1 16 0'] },
  settings: {
    paths: [
      'M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915',
      'M15 12a3 3 0 1 1-6 0a3 3 0 1 1 6 0',
    ],
  },
  sun: {
    paths: [
      'M16 12a4 4 0 1 1-8 0a4 4 0 1 1 8 0',
      'M12 2v2',
      'M12 20v2',
      'm4.93 4.93 1.41 1.41',
      'm17.66 17.66 1.41 1.41',
      'M2 12h2',
      'M20 12h2',
      'm6.34 17.66-1.41 1.41',
      'm19.07 4.93-1.41 1.41',
    ],
  },
  'wifi-off': {
    paths: [
      'M12 20h.01',
      'M8.5 16.429a5 5 0 0 1 7 0',
      'M5 12.859a10 10 0 0 1 5.17-2.69',
      'M19 12.859a10 10 0 0 0-2.007-1.523',
      'M2 8.82a15 15 0 0 1 4.177-2.643',
      'M22 8.82a15 15 0 0 0-11.288-3.764',
      'm2 2 20 20',
    ],
  },
} as const satisfies RadIconSet;

export type AppIconName = keyof typeof appIcons;
