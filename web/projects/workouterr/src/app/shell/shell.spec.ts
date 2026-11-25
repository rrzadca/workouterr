import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import type { SettingsResponse } from '@workouterr/api-client';
import { RadButtonHarness } from '@rrzadca/radinf-ui/button/testing';
import { provideRadIcons } from '@rrzadca/radinf-ui/icon';
import { TranslocoTestingModule } from '@jsverse/transloco';
import english from '../../../public/i18n/en.json';
import { AuthService } from '../auth/auth';
import { appIcons } from '../shared/icons';
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
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '', component: EmptyPage }]),
        provideRadIcons(appIcons),
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  const defaultSettings: SettingsResponse = { displayName: null, theme: null, restTimerSound: true };

  // Logs in the way the guard would have, then shows the shell, which starts loading the account's settings.
  async function renderLoading() {
    const auth = TestBed.inject(AuthService);
    const loading = auth.loadCurrentUser();
    httpTesting
      .expectOne('/api/auth/me')
      .flush({ id: '0b5f6c1e-6d3a-4f43-9c56-2f1c6f1d8e01', email: 'me@example.com' });
    await loading;
    await TestBed.inject(Router).navigateByUrl('/');

    const fixture = TestBed.createComponent(Shell);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    // The sidebar's icon-only buttons, found by their accessible name.
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const button = (ariaLabel: string) => loader.getHarness(RadButtonHarness.with({ ariaLabel }));
    // A save's answer reaches the page through a promise: let it run, then render.
    async function settle() {
      await new Promise((resolve) => setTimeout(resolve));
      await fixture.whenStable();
    }
    return { fixture, element, button, settle, settingsRequest: httpTesting.expectOne('/api/settings') };
  }

  // The shell once the account's settings have arrived.
  async function render(settings: SettingsResponse = defaultSettings) {
    const { settingsRequest, ...rendered } = await renderLoading();
    settingsRequest.flush(settings);
    await rendered.fixture.whenStable();
    return rendered;
  }

  it('shows the logged-in user and the home link as the current page', async () => {
    const { element } = await render();

    expect(element.querySelector('nav')?.textContent).toContain('me@example.com');
    expect(element.querySelector('a[aria-current="page"]')?.textContent).toContain('Home');
  });

  it('shows the display name, and its initial, instead of the email', async () => {
    const { element } = await render({ ...defaultSettings, displayName: 'rad' });

    expect(element.querySelector('nav')?.textContent).toContain('rad');
    expect(element.querySelector('nav')?.textContent).not.toContain('me@example.com');
    expect(element.querySelector('[aria-hidden="true"].rounded-pill')?.textContent?.trim()).toBe('R');
  });

  it("applies the account's theme over this device's copy", async () => {
    localStorage.setItem('workouterr.theme', 'light');

    await render({ ...defaultSettings, theme: 'dark' });

    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(localStorage.getItem('workouterr.theme')).toBe('dark');
  });

  it('switches the theme with the sun / moon button', async () => {
    const { element, button } = await render();
    const logoSources = () => Array.from(element.querySelectorAll('nav img'), (logo) => logo.getAttribute('src'));
    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(logoSources()).toEqual(['brand/logo-mark-navy.png', 'brand/logo-word-navy.png']);

    expect(await (await button('Dark theme')).getIcon()).toBe('moon');

    await (await button('Dark theme')).click();

    expect(TestBed.inject(ThemeService).theme()).toBe('dark');
    expect(document.documentElement.dataset['theme']).toBe('dark');
    expect(await (await button('Light theme')).getIcon()).toBe('sun');
    expect(logoSources()).toEqual(['brand/logo-mark-teal.png', 'brand/logo-word-teal.png']);

    // Saved on the account, so the other devices get it after login.
    const save = httpTesting.expectOne({ method: 'PATCH', url: '/api/settings' });
    expect(save.request.body).toEqual({ theme: 'dark' });
    save.flush({ ...defaultSettings, theme: 'dark' });
  });

  it('keeps the new theme on this device when saving it fails', async () => {
    const { fixture, button } = await render();

    await (await button('Dark theme')).click();
    httpTesting
      .expectOne({ method: 'PATCH', url: '/api/settings' })
      .flush(null, { status: 0, statusText: 'Unknown Error' });
    await fixture.whenStable();

    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('keeps a theme chosen while the settings are still loading', async () => {
    const { fixture, element, settle, settingsRequest } = await renderLoading();

    // Clicked directly: the harness would wait for the settings, which are still loading.
    element.querySelector<HTMLButtonElement>('button[aria-label="Dark theme"]')?.click();
    fixture.detectChanges();
    // The settings were read before the tap, so they still hold the old theme.
    settingsRequest.flush({ ...defaultSettings, theme: 'light' });
    await settle();

    expect(document.documentElement.dataset['theme']).toBe('dark');

    httpTesting.expectOne({ method: 'PATCH', url: '/api/settings' }).flush({ ...defaultSettings, theme: 'dark' });
    await settle();

    expect(document.documentElement.dataset['theme']).toBe('dark');
  });

  it('saves only the last of several quick taps, one save at a time', async () => {
    const { button, settle } = await render();

    await (await button('Dark theme')).click();
    await (await button('Light theme')).click();
    // The first tap's answer arrives after the second tap: the screen stays on the second.
    const firstSave = httpTesting.expectOne({ method: 'PATCH', url: '/api/settings' });
    expect(firstSave.request.body).toEqual({ theme: 'dark' });
    firstSave.flush({ ...defaultSettings, theme: 'dark' });
    await settle();

    expect(document.documentElement.dataset['theme']).toBe('light');

    // Sent only once the first save is done, so the account ends with the last tap.
    const secondSave = httpTesting.expectOne({ method: 'PATCH', url: '/api/settings' });
    expect(secondSave.request.body).toEqual({ theme: 'light' });
    secondSave.flush({ ...defaultSettings, theme: 'light' });
    await settle();

    expect(document.documentElement.dataset['theme']).toBe('light');
    expect(localStorage.getItem('workouterr.theme')).toBe('light');
  });

  it('logs out with the log-out button', async () => {
    const { fixture, button } = await render();
    const logOut = await button('Log out');

    await logOut.click();
    expect(await logOut.isLoading()).toBe(true);
    httpTesting.expectOne('/api/auth/logout').flush(null, { status: 204, statusText: 'No Content' });
    await fixture.whenStable();

    expect(TestBed.inject(AuthService).currentUser()).toBeNull();
  });
});
