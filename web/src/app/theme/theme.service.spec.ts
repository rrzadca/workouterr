import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

/** jsdom has no matchMedia; this stands in for the system setting and lets a test change it. */
function stubSystemScheme(prefersDark: boolean) {
  const listeners: ((event: { matches: boolean }) => void)[] = [];
  const media = {
    matches: prefersDark,
    addEventListener: (_type: string, listener: (event: { matches: boolean }) => void) => listeners.push(listener),
  };
  window.matchMedia = vi.fn().mockReturnValue(media);
  return {
    switchTo(dark: boolean) {
      for (const listener of listeners) {
        listener({ matches: dark });
      }
    },
  };
}

function appliedTheme(): string | null {
  TestBed.tick();
  return document.documentElement.getAttribute('data-theme');
}

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with the system theme', () => {
    stubSystemScheme(true);
    const themeService = TestBed.inject(ThemeService);
    expect(themeService.theme()).toBe('dark');
    expect(appliedTheme()).toBe('dark');
  });

  it('follows the system while the user has not picked a theme', () => {
    const systemScheme = stubSystemScheme(false);
    const themeService = TestBed.inject(ThemeService);
    systemScheme.switchTo(true);
    expect(themeService.theme()).toBe('dark');
    expect(appliedTheme()).toBe('dark');
  });

  it('toggles, and the pick wins over the system from then on', () => {
    const systemScheme = stubSystemScheme(false);
    const themeService = TestBed.inject(ThemeService);
    themeService.toggle();
    expect(appliedTheme()).toBe('dark');
    systemScheme.switchTo(false);
    expect(themeService.theme()).toBe('dark');
  });

  it('remembers the pick for the next visit', () => {
    stubSystemScheme(false);
    localStorage.setItem('workouterr.theme', 'dark');
    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
  });

  it('ignores a stored value that is not a theme', () => {
    stubSystemScheme(false);
    localStorage.setItem('workouterr.theme', 'purple');
    expect(TestBed.inject(ThemeService).theme()).toBe('light');
  });
});
