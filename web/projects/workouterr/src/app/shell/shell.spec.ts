import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import english from '../../../public/i18n/en.json';
import { AuthService } from '../auth/auth';
import { ThemeService } from '../theme';
import { Shell } from './shell';

@Component({ template: '' })
class EmptyPage {}

describe('Shell', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    // jsdom has no matchMedia; ThemeService reads the system theme from it.
    window.matchMedia = vi.fn(() => ({
      matches: false,
      addEventListener: () => undefined,
    })) as unknown as typeof window.matchMedia;
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [
        TranslocoTestingModule.forRoot({
          langs: { en: english },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
          preloadLangs: true,
        }),
      ],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([{ path: '', component: EmptyPage }])],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  // Logs in the way the guard would have, then shows the shell.
  async function render() {
    const auth = TestBed.inject(AuthService);
    const loading = auth.loadCurrentUser();
    httpTesting
      .expectOne('/api/auth/me')
      .flush({ id: '0b5f6c1e-6d3a-4f43-9c56-2f1c6f1d8e01', email: 'me@example.com' });
    await loading;
    await TestBed.inject(Router).navigateByUrl('/');

    const fixture = TestBed.createComponent(Shell);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const button = (label: string) => element.querySelector(`button[aria-label="${label}"]`) as HTMLButtonElement;
    return { fixture, element, button };
  }

  it('shows the logged-in user and the home link as the current page', async () => {
    const { element } = await render();

    expect(element.querySelector('nav')?.textContent).toContain('me@example.com');
    expect(element.querySelector('a[aria-current="page"]')?.textContent).toContain('Home');
  });

  it('switches the theme with the sun / moon button', async () => {
    const { fixture, element, button } = await render();
    const logoSources = () => Array.from(element.querySelectorAll('nav img'), (logo) => logo.getAttribute('src'));
    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(logoSources()).toEqual(['brand/logo-mark-navy.png', 'brand/logo-word-navy.png']);

    button('Dark theme').click();
    await fixture.whenStable();

    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(button('Light theme').querySelector('svg')?.classList).toContain('lucide-sun');
    expect(logoSources()).toEqual(['brand/logo-mark-teal.png', 'brand/logo-word-teal.png']);
  });

  it('logs out with the log-out button', async () => {
    const { fixture, button } = await render();

    button('Log out').click();
    httpTesting.expectOne('/api/auth/logout').flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    expect(TestBed.inject(AuthService).currentUser()).toBeNull();
  });
});
