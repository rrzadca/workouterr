import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RadButtonHarness } from '@rrzadca/radinf-ui/button/testing';
import { RadFormFieldHarness } from '@rrzadca/radinf-ui/form-field/testing';
import { RadFormInputSwitchHarness } from '@rrzadca/radinf-ui/form-inputs/form-input-switch/testing';
import { RadFormInputTextHarness } from '@rrzadca/radinf-ui/form-inputs/form-input-text/testing';
import { provideRadIcons } from '@rrzadca/radinf-ui/icon';
import { TranslocoTestingModule } from '@jsverse/transloco';
import type { SettingsResponse } from '@workouterr/api-client';
import english from '../../../public/i18n/en.json';
import { AuthService } from '../auth/auth';
import { appIcons } from '../shared/icons';
import { Settings } from './settings';

describe('Settings', () => {
  let httpTesting: HttpTestingController;
  const savedSettings: SettingsResponse = { displayName: 'Rad', theme: null, restTimerSound: true };

  beforeEach(() => {
    // jsdom has no matchMedia; ThemeService (which the settings feed the account's theme) reads the system theme.
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
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([]), provideRadIcons(appIcons)],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  // Logged in the way the guard would have, then the page, its settings answered with `settings`.
  async function render(settings: SettingsResponse = savedSettings) {
    const auth = TestBed.inject(AuthService);
    const loading = auth.loadCurrentUser();
    httpTesting
      .expectOne('/api/auth/me')
      .flush({ id: '0b5f6c1e-6d3a-4f43-9c56-2f1c6f1d8e01', email: 'me@example.com' });
    await loading;

    const fixture = TestBed.createComponent(Settings);
    fixture.detectChanges();
    httpTesting.expectOne('/api/settings').flush(settings);
    await fixture.whenStable();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const displayNameField = await loader.getHarness(RadFormFieldHarness.with({ label: 'Display name' }));
    const displayName = await displayNameField.getHarness(RadFormInputTextHarness);
    const saveButton = await loader.getHarness(RadButtonHarness.with({ text: 'Save' }));
    const soundSwitch = await loader.getHarness(RadFormInputSwitchHarness.with({ label: 'Sound when rest ends' }));

    // The submission's action runs over several promises after the response arrives.
    async function settle() {
      await new Promise((resolve) => setTimeout(resolve));
      await fixture.whenStable();
    }

    return {
      fixture,
      element: fixture.nativeElement as HTMLElement,
      displayNameField,
      displayName,
      saveButton,
      soundSwitch,
      settle,
    };
  }

  it('shows the saved settings', async () => {
    const { displayName, soundSwitch } = await render();

    expect(await displayName.getValue()).toBe('Rad');
    expect(await soundSwitch.isChecked()).toBe(true);
  });

  it('saves the display name and shows what the API kept', async () => {
    const { displayName, saveButton, settle } = await render();

    await displayName.setValue('  Radek ');
    await saveButton.click();
    const save = httpTesting.expectOne({ method: 'PATCH', url: '/api/settings' });
    expect(save.request.body).toEqual({ displayName: '  Radek ' });
    save.flush({ ...savedSettings, displayName: 'Radek' });
    await settle();

    expect(await displayName.getValue()).toBe('Radek');
  });

  it('rejects a display name over 50 characters without sending it', async () => {
    const { displayNameField, displayName, saveButton } = await render();

    await displayName.setValue('a'.repeat(51));
    await saveButton.click();

    expect(await displayNameField.getErrors()).toEqual(['Use at most 50 characters.']);
  });

  it('says so when the display name could not be saved', async () => {
    const { element, displayName, saveButton, settle } = await render();

    await displayName.setValue('Radek');
    await saveButton.click();
    httpTesting
      .expectOne({ method: 'PATCH', url: '/api/settings' })
      .flush(null, { status: 0, statusText: 'Unknown Error' });
    await settle();

    expect(element.querySelector('[role="alert"]')?.textContent).toContain("Couldn't reach Workouterr");
  });

  it('saves the rest-timer sound as soon as it is switched', async () => {
    const { soundSwitch, settle } = await render();

    await soundSwitch.uncheck();
    const save = httpTesting.expectOne({ method: 'PATCH', url: '/api/settings' });
    expect(save.request.body).toEqual({ restTimerSound: false });
    save.flush({ ...savedSettings, restTimerSound: false });
    await settle();

    expect(await soundSwitch.isChecked()).toBe(false);
  });

  it('turns the switch back when the sound could not be saved', async () => {
    const { element, soundSwitch, settle } = await render();

    await soundSwitch.uncheck();
    httpTesting
      .expectOne({ method: 'PATCH', url: '/api/settings' })
      .flush(null, { status: 500, statusText: 'Internal Server Error' });
    await settle();

    expect(await soundSwitch.isChecked()).toBe(true);
    expect(element.querySelector('[role="alert"]')?.textContent).toContain('Something went wrong');
  });
});
