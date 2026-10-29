import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TranslocoTestingModule } from '@jsverse/transloco';
import english from '../../public/i18n/en.json';
import { ClientVersionService } from './api/client-version';
import { App } from './app';

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
      providers: [provideRouter([])],
    });
  });

  async function render() {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    return { fixture, page: fixture.nativeElement as HTMLElement };
  }

  it('shows no prompt while the API accepts this build', async () => {
    const { page } = await render();

    expect(page.querySelector('dialog')).toBeNull();
  });

  it('asks for a reload once the API has turned this build away', async () => {
    const { fixture, page } = await render();

    TestBed.inject(ClientVersionService).markOutdated();
    await fixture.whenStable();

    const dialog = page.querySelector('dialog');
    expect(dialog?.hasAttribute('open')).toBe(true);
    expect(dialog?.textContent).toContain('New version available');
    expect(dialog?.querySelector('button')?.textContent).toContain('Reload');
  });
});
