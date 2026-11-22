import { computed, effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const themeStorageKey = 'workouterr.theme';

// The theme is `data-theme` on <html>: the choice saved by the theme button, else the system theme, followed live. The
// choice is kept on the account (AccountSettingsService) and copied here into `localStorage`, so it is known on load
// and on the login page, before the account's settings arrive.
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly darkThemeQuery = matchMedia('(prefers-color-scheme: dark)');

  private readonly savedTheme = signal(this.readSavedTheme());
  private readonly systemTheme = signal<Theme>(this.darkThemeQuery.matches ? 'dark' : 'light');
  readonly theme = computed(() => this.savedTheme() ?? this.systemTheme());

  constructor() {
    // A signal, so the zoneless app re-renders whatever reads `theme`.
    this.darkThemeQuery.addEventListener('change', (event) => this.systemTheme.set(event.matches ? 'dark' : 'light'));
    effect(() => (document.documentElement.dataset['theme'] = this.theme()));
  }

  // The theme button: switches to the other theme and keeps it, so the system theme no longer applies. Returns the new
  // theme, for the caller to save on the account.
  toggle(): Theme {
    const theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.keep(theme);
    return theme;
  }

  // The account's theme, once its settings arrive: it wins over this device's copy. `null` (the button never tapped on
  // any device) follows the system theme, and forgets a copy another account left on this device.
  useAccountTheme(theme: Theme | null) {
    this.keep(theme);
  }

  private keep(theme: Theme | null) {
    this.savedTheme.set(theme);
    try {
      if (theme) {
        localStorage.setItem(themeStorageKey, theme);
      } else {
        localStorage.removeItem(themeStorageKey);
      }
    } catch {
      // Blocked storage: the theme still applies, until the next load.
    }
  }

  private readSavedTheme(): Theme | null {
    try {
      const savedTheme = localStorage.getItem(themeStorageKey);
      return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
    } catch {
      // Storage can be blocked (private mode, settings); fall back to the system theme.
      return null;
    }
  }
}
