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
  'circle-alert': { paths: ['M22 12a10 10 0 1 1-20 0a10 10 0 1 1 20 0', 'M12 8L12 12', 'M12 16L12.01 16'] },
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
  'refresh-cw': {
    paths: [
      'M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8',
      'M21 3v5h-5',
      'M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16',
      'M8 16H3v5',
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
