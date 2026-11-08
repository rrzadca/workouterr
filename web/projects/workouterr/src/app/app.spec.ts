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
import { reloadPage } from './new-version-dialog/new-version-dialog';

describe('App', () => {
  let reloadPageSpy: ReturnType<typeof vi.fn<() => void>>;

  beforeEach(() => {
    reloadPageSpy = vi.fn<() => void>();
    TestBed.configureTestingModule({
      imports: [
        App,
        TranslocoTestingModule.forRoot({
          langs: { en: english },
          translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
          preloadLangs: true,
        }),
      ],
      providers: [provideRouter([]), provideRadIcons(appIcons), { provide: reloadPage, useValue: reloadPageSpy }],
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

  async function renderOutdated() {
    const rendered = await render();
    TestBed.inject(ClientVersionService).markOutdated();
    await rendered.fixture.whenStable();
    return { ...rendered, dialog: await rendered.documentLoader.getHarness(RadDialogHarness) };
  }

  it('asks for a reload once the API has turned this build away', async () => {
    const { dialog } = await renderOutdated();

    expect(await dialog.getRole()).toBe('alertdialog');
    expect(await dialog.getTitleText()).toBe('New version available');
    expect(await dialog.getText()).toContain('Workouterr has been updated.');
    const reload = await dialog.getHarness(RadButtonHarness.with({ text: 'Reload' }));
    expect(await reload.getIcon()).toBe('refresh-cw');
  });

  it('stays open on Escape', async () => {
    const { documentLoader, dialog } = await renderOutdated();

    // The harness's `close` presses Escape.
    await dialog.close();

    expect(await documentLoader.getAllHarnesses(RadDialogHarness)).toHaveLength(1);
  });

  it('stays open on a backdrop click', async () => {
    const { fixture, documentLoader } = await renderOutdated();

    // The backdrop is the CDK overlay's own element, so no harness covers it.
    const backdrop = document.querySelector<HTMLElement>('.cdk-overlay-backdrop');
    expect(backdrop).not.toBeNull();
    backdrop?.click();
    await fixture.whenStable();

    expect(await documentLoader.getAllHarnesses(RadDialogHarness)).toHaveLength(1);
  });

  it('reloads the page from its button', async () => {
    const { dialog } = await renderOutdated();

    await (await dialog.getHarness(RadButtonHarness.with({ text: 'Reload' }))).click();

    expect(reloadPageSpy).toHaveBeenCalledOnce();
  });
});
