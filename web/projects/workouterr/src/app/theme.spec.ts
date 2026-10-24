import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme';

describe('ThemeService', () => {
  let systemIsDark: boolean;
  let systemChangeListener: ((event: { matches: boolean }) => void) | undefined;

  // jsdom has no matchMedia; this one reports `systemIsDark` and lets a test flip the system theme.
  beforeEach(() => {
    systemIsDark = false;
    window.matchMedia = vi.fn(() => ({
      get matches() {
        return systemIsDark;
      },
      addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) =>
        (systemChangeListener = listener),
    })) as unknown as typeof window.matchMedia;
    localStorage.clear();
  });

  function startTheme() {
    TestBed.inject(ThemeService);
    TestBed.tick();
    return document.documentElement.dataset['theme'];
  }

  it('follows the system theme when nothing is saved', () => {
    systemIsDark = true;

    expect(startTheme()).toBe('dark');
  });

  it('switches when the system theme changes', () => {
    startTheme();

    systemChangeListener!({ matches: true });
    TestBed.tick();

    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('keeps the saved theme over the system theme', () => {
    localStorage.setItem('workouterr.theme', 'light');
    systemIsDark = true;

    expect(startTheme()).toBe('light');
  });
});
