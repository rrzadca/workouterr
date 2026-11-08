import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import { RadButtonHarness } from '@rrzadca/radinf-ui/button/testing';
import { RadDialogHarness } from '@rrzadca/radinf-ui/dialog/testing';
import { provideRadIcons } from '@rrzadca/radinf-ui/icon';
import english from '../../public/i18n/en.json';
import { ClientVersionService } from './api/client-version';
import { App } from './app';
import { appIcons } from './icons';

describe('App', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        App,
        TranslocoTestingModule.forRoot({
          langs: { en: english },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
          preloadLangs: true,
        }),
      ],
      providers: [provideRouter([]), provideRadIcons(appIcons)],
    });
  });

  async function render() {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    // Dialogs render in the CDK's overlay container at the end of <body>, outside the app's element.
    return { fixture, documentLoader: TestbedHarnessEnvironment.documentRootLoader(fixture) };
  }

  it('shows no prompt while the API accepts this build', async () => {
    const { documentLoader } = await render();

    expect(await documentLoader.getAllHarnesses(RadDialogHarness)).toEqual([]);
  });

  it('asks for a reload once the API has turned this build away, and only lets the reload close it', async () => {
    const { fixture, documentLoader } = await render();

    TestBed.inject(ClientVersionService).markOutdated();
    await fixture.whenStable();

    const dialog = await documentLoader.getHarness(RadDialogHarness);
    expect(await dialog.getRole()).toBe('alertdialog');
    expect(await dialog.getTitleText()).toBe('New version available');
    expect(await dialog.getText()).toContain('Workouterr has been updated.');
    const reload = await dialog.getHarness(RadButtonHarness.with({ text: 'Reload' }));
    expect(await reload.getIcon()).toBe('refresh-cw');

    await dialog.close();

    expect(await documentLoader.getAllHarnesses(RadDialogHarness)).toHaveLength(1);
  });
});
