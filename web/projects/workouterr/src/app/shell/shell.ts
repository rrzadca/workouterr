import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { RadButton } from '@rrzadca/radinf-ui/button';
import { RadIcon } from '@rrzadca/radinf-ui/icon';
import { AuthService } from '../auth/auth';
import type { AppIconName } from '../shared/icons';
import { AccountSettingsService } from '../settings/account-settings';
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
} as const satisfies Record<Theme, { logoColour: string; toggleIcon: AppIconName; toggleLabelKey: string }>;

// The layout around every page once logged in: the sidebar (iPad landscape first) and the page beside it.
@Component({
  imports: [RadButton, RadIcon, RouterLink, RouterLinkActive, RouterOutlet, TranslocoDirective],
  selector: 'app-shell',
  templateUrl: './shell.html',
})
export class Shell {
  private readonly accountSettings = inject(AccountSettingsService);
  private readonly auth = inject(AuthService);
  private readonly themes = inject(ThemeService);

  protected readonly navLinkClasses = navLinkClasses;

  protected readonly loggingOut = signal(false);
  protected readonly themeChoice = computed(() => themeChoices[this.themes.theme()]);
  // The display name, else the email. Blank while the settings load, so a name never flashes in after the email; the
  // email when they can't be loaded. Undefined only between logout and leaving the page.
  protected readonly userName = computed(() => {
    const settings = this.accountSettings.settings;
    if (settings.isLoading()) {
      return '';
    }
    return (settings.hasValue() ? settings.value().displayName : null) ?? this.auth.currentUser()?.email;
  });
  protected readonly initial = computed(() => this.userName()?.charAt(0).toUpperCase());

  // Switches on this device at once, then saves the choice on the account for the other devices.
  protected toggleTheme() {
    void this.accountSettings.saveTheme(this.themes.toggle());
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
