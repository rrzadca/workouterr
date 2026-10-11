import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const storageKey = 'workouterr.theme';
const darkSchemeQuery = '(prefers-color-scheme: dark)';

/**
 * Light or dark, applied as data-theme on <html>, which the tokens in styles/tokens.css react to.
 * Follows the system setting until the user picks a theme; the pick is remembered on this device.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly darkSchemeMedia = this.document.defaultView?.matchMedia?.(darkSchemeQuery);
  private readonly chosenTheme = signal<Theme | null>(this.readChosenTheme());
  private readonly systemTheme = signal<Theme>(this.darkSchemeMedia?.matches ? 'dark' : 'light');

  /** The theme on screen: the user's pick, or the system's when there is none */
  readonly theme = computed(() => this.chosenTheme() ?? this.systemTheme());

  constructor() {
    this.darkSchemeMedia?.addEventListener('change', (event) => {
      this.systemTheme.set(event.matches ? 'dark' : 'light');
    });
    effect(() => {
      this.document.documentElement.setAttribute('data-theme', this.theme());
    });
  }

  setTheme(theme: Theme): void {
    this.chosenTheme.set(theme);
    try {
      localStorage.setItem(storageKey, theme);
    } catch {
      // Storage can be blocked (private mode); the theme still applies until the page reloads
    }
  }

  toggle(): void {
    this.setTheme(this.theme() === 'dark' ? 'light' : 'dark');
  }

  private readChosenTheme(): Theme | null {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored === 'light' || stored === 'dark' ? stored : null;
    } catch {
      return null;
    }
  }
}
