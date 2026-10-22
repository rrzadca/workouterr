import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [App],
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

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('API: Healthy');
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
});
