import { computed, effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const storageKey = 'workouterr.theme';

// The theme is `data-theme` on <html>: the choice saved by the theme button, else the system theme, followed live.
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly systemDark = matchMedia('(prefers-color-scheme: dark)');
  private readonly savedTheme = this.readSavedTheme();

  private readonly systemTheme = signal<Theme>(this.systemDark.matches ? 'dark' : 'light');
  readonly theme = computed(() => this.savedTheme ?? this.systemTheme());

  constructor() {
    // A signal, so the zoneless app re-renders whatever reads `theme`.
    this.systemDark.addEventListener('change', (event) => this.systemTheme.set(event.matches ? 'dark' : 'light'));
    effect(() => (document.documentElement.dataset['theme'] = this.theme()));
  }

  private readSavedTheme(): Theme | null {
    try {
      const savedTheme = localStorage.getItem(storageKey);
      return savedTheme === 'light' || savedTheme === 'dark' ? savedTheme : null;
    } catch {
      // Storage can be blocked (private mode, settings); fall back to the system theme.
      return null;
    }
  }
}
