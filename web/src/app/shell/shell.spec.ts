import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideI18nForTests } from '../../testing/provide-i18n-for-tests';
import { ThemeService } from '../theme/theme.service';
import { Shell } from './shell';

async function renderShell() {
  TestBed.configureTestingModule({ providers: [provideRouter([]), provideI18nForTests()] });
  const fixture = TestBed.createComponent(Shell);
  await fixture.whenStable();
  return { fixture, element: fixture.nativeElement as HTMLElement };
}

describe('Shell', () => {
  beforeEach(() => {
    localStorage.clear();
    window.matchMedia = vi.fn().mockReturnValue({ matches: false, addEventListener: vi.fn() });
  });

  it('shows the app name and today as the header subtitle', async () => {
    const { element } = await renderShell();
    const header = element.querySelector('header');
    expect(header?.textContent).toContain('Workouterr');
    expect(header?.textContent).toMatch(/\d{4}/);
  });

  it('has the main navigation with a translated label and the start link', async () => {
    const { element } = await renderShell();
    const navigation = element.querySelector('nav');
    expect(navigation?.getAttribute('aria-label')).toBe('Main');
    expect(navigation?.textContent).toContain('Training');
    expect(navigation?.querySelector('a')?.textContent).toContain('Start');
  });

  it('shows the navy logo in the light theme and the teal logo in the dark theme', async () => {
    const { fixture, element } = await renderShell();
    const logoMark = () => element.querySelector('nav img')?.getAttribute('src');
    expect(logoMark()).toBe('assets/images/logo-simple-dark.png');
    TestBed.inject(ThemeService).setTheme('dark');
    await fixture.whenStable();
    expect(logoMark()).toBe('assets/images/logo-simple-light.png');
  });

  it('toggles the theme from the header button, whose label says what it will do', async () => {
    const { fixture, element } = await renderShell();
    const toggle = element.querySelector<HTMLButtonElement>('header button');
    expect(toggle?.getAttribute('aria-label')).toBe('Switch to dark theme');
    toggle?.click();
    await fixture.whenStable();
    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
    expect(toggle?.getAttribute('aria-label')).toBe('Switch to light theme');
  });
});
