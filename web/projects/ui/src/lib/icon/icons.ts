import {
  LucideArrowRight,
  LucideCheck,
  LucideLoaderCircle,
  LucidePlus,
  LucideRefreshCw,
  type LucideIcon,
} from '@lucide/angular';

// The Lucide icons the app can show, by their Lucide name (https://lucide.dev/icons). The bundle holds only these:
// add an icon here when a screen needs it.
export const icons = {
  'arrow-right': LucideArrowRight,
  check: LucideCheck,
  'loader-circle': LucideLoaderCircle,
  plus: LucidePlus,
  'refresh-cw': LucideRefreshCw,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;
