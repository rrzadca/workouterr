import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { LucideDynamicIcon, type LucideIcon } from '@lucide/angular';

export interface SidebarNavItem {
  /** Router link of the page, such as '/exercises' */
  link: string;
  label: string;
  icon?: LucideIcon;
  /** A count or marker shown at the right end, such as how many exercises there are */
  badge?: string | number;
}

export interface SidebarNavSection {
  label?: string;
  items: readonly SidebarNavItem[];
}

/**
 * The app's main navigation. Put it on a native nav and give that nav an aria-label;
 * mark extra content with sidebarHeader or sidebarFooter to place it above or below the links:
 *
 * ```html
 * <nav rad-sidebar-nav [sections]="sections" aria-label="Main">
 *   <img sidebarHeader src="logo.png" alt="App" />
 * </nav>
 * ```
 */
@Component({
  selector: 'nav[rad-sidebar-nav]',
  imports: [RouterLink, RouterLinkActive, LucideDynamicIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'flex flex-col gap-3.5 overflow-y-auto px-2 py-2.5 border-r border-border-hairline bg-surface-sidebar ' +
      'backdrop-blur-vibrancy backdrop-saturate-180',
  },
  templateUrl: './sidebar-nav.html',
})
export class SidebarNav {
  readonly sections = input.required<readonly SidebarNavSection[]>();

  protected readonly activeLinkClasses = 'bg-accent text-text-on-accent font-semibold';
  protected readonly inactiveLinkClasses = 'font-medium text-text-body hover:bg-surface-hover';
}
