import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TranslocoTestingModule } from '@jsverse/transloco';
import english from '../../public/i18n/en.json';
import { App } from './app';

describe('App', () => {
  let httpTesting: HttpTestingController;

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
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('shows the API status from /api/health', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    httpTesting.expectOne('/api/health').flush({ status: 'Healthy' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('API: healthy');
  });

  it('shows the API as degraded when the health check says so', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    httpTesting.expectOne('/api/health').flush({ status: 'Degraded' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('API: degraded');
  });

  it('shows the API as unhealthy when the health check answers 503', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    httpTesting
      .expectOne('/api/health')
      .flush({ title: 'Unhealthy' }, { status: 503, statusText: 'Service Unavailable' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('API unhealthy');
  });

  it('shows the API as unreachable when the request fails', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    httpTesting.expectOne('/api/health').error(new ProgressEvent('error'));
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('API unreachable');
  });

  it('shows the API as unreachable when the body breaks the contract', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    httpTesting.expectOne('/api/health').flush({ status: 'Fine' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('API unreachable');
  });

  it('checks the API again when the button is pressed', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    httpTesting.expectOne('/api/health').error(new ProgressEvent('error'));
    await fixture.whenStable();

    const checkAgainButton = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
    expect(checkAgainButton.textContent).toContain('Check again');
    checkAgainButton.click();
    fixture.detectChanges();

    httpTesting.expectOne('/api/health').flush({ status: 'Healthy' });
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('API: healthy');
  });
});
