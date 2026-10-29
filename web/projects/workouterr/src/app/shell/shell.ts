import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { Icon, IconButton, type IconName } from '@workouterr/ui';
import { AuthService } from '../auth/auth';
import { type Theme, ThemeService } from '../theme';

// A sidebar link, 44 px tall for touch. RouterLinkActive marks the current page with aria-current="page", which both
// tells screen readers and switches on the `aria-current` styles. Full class names, so Tailwind finds them here.
const navLinkClasses =
  'flex h-control-sm items-center gap-2.5 rounded-sm px-2.5 font-medium text-text-default ' +
  '[transition:var(--transition-control)] hover:bg-surface-hover ' +
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent-ring ' +
  '[&_rad-icon]:text-text-muted ' +
  'aria-[current=page]:bg-accent aria-[current=page]:font-semibold aria-[current=page]:text-text-on-accent ' +
  'aria-[current=page]:[&_rad-icon]:text-text-on-accent';

// What the sidebar shows in each theme: the logo's colour, and the theme button, which offers the other theme.
const themeChoices = {
  light: { logoColour: 'navy', toggleIcon: 'moon', toggleLabelKey: 'nav.darkTheme' },
  dark: { logoColour: 'teal', toggleIcon: 'sun', toggleLabelKey: 'nav.lightTheme' },
} as const satisfies Record<Theme, { logoColour: string; toggleIcon: IconName; toggleLabelKey: string }>;

// The layout around every page once logged in: the sidebar (iPad landscape first) and the page beside it.
@Component({
  imports: [Icon, IconButton, RouterLink, RouterLinkActive, RouterOutlet, TranslocoDirective],
  selector: 'app-shell',
  templateUrl: './shell.html',
})
export class Shell {
  private readonly auth = inject(AuthService);
  private readonly themes = inject(ThemeService);

  protected readonly navLinkClasses = navLinkClasses;

  protected readonly loggingOut = signal(false);
  protected readonly themeChoice = computed(() => themeChoices[this.themes.theme()]);
  // Null only for the moment between logout and leaving the page. Display names come with the account settings.
  protected readonly user = this.auth.currentUser;
  protected readonly initial = computed(() => this.user()?.email.charAt(0).toUpperCase());

  protected toggleTheme() {
    this.themes.toggle();
  }

  protected async logout() {
    this.loggingOut.set(true);
    try {
      await this.auth.logout();
    } catch {
      // Still logged in (no connection, API down): the button is ready to try again.
    } finally {
      this.loggingOut.set(false);
    }
  }
}
