import {
  LucideArrowRight,
  LucideCheck,
  LucideCircleAlert,
  LucideHouse,
  LucideLoaderCircle,
  LucideLock,
  LucideLogOut,
  LucideMail,
  LucideMoon,
  LucidePlus,
  LucideRefreshCw,
  LucideSun,
  LucideWifiOff,
  type LucideIcon,
} from '@lucide/angular';

// The Lucide icons the app can show, by their Lucide name (https://lucide.dev/icons). The bundle holds only these:
// add an icon here when a screen needs it.
export const icons = {
  'arrow-right': LucideArrowRight,
  check: LucideCheck,
  'circle-alert': LucideCircleAlert,
  house: LucideHouse,
  'loader-circle': LucideLoaderCircle,
  lock: LucideLock,
  'log-out': LucideLogOut,
  mail: LucideMail,
  moon: LucideMoon,
  plus: LucidePlus,
  'refresh-cw': LucideRefreshCw,
  sun: LucideSun,
  'wifi-off': LucideWifiOff,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;
