import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideI18nForTests } from '../../testing/provide-i18n-for-tests';
import { apiErrorInterceptor } from '../api/api-error.interceptor';
import { Home } from './home';

function renderHome() {
  TestBed.configureTestingModule({
    providers: [
      provideHttpClient(withInterceptors([apiErrorInterceptor])),
      provideHttpClientTesting(),
      provideI18nForTests(),
    ],
  });
  const fixture = TestBed.createComponent(Home);
  fixture.detectChanges();
  const httpTesting = TestBed.inject(HttpTestingController);
  const element = fixture.nativeElement as HTMLElement;
  return {
    element,
    httpTesting,
    /** Lets the resource pick up the answer, then renders */
    settle: () => fixture.whenStable(),
    statusText: () => element.querySelector('section')?.textContent.replace(/\s+/g, ' ').trim(),
  };
}

describe('Home', () => {
  it('says it is checking while the request runs', () => {
    const { httpTesting, statusText } = renderHome();
    expect(statusText()).toContain('Checking the server…');
    httpTesting.expectOne('/api/health');
  });

  it('shows that the server is running, with its version', async () => {
    const { httpTesting, settle, statusText } = renderHome();
    httpTesting.expectOne('/api/health').flush({ status: 'ok', version: '0.1.0', database: 'up' });
    await settle();
    expect(statusText()).toContain('The server and its database are running');
    expect(statusText()).toContain('Version 0.1.0');
  });

  it('shows that the database is down when the API answers 503', async () => {
    const { httpTesting, settle, statusText } = renderHome();
    httpTesting
      .expectOne('/api/health')
      .flush(
        { status: 'unavailable', version: '0.1.0', database: 'down' },
        { status: 503, statusText: 'Service Unavailable' },
      );
    await settle();
    expect(statusText()).toContain('The server is running, but its database is not');
  });

  it('shows that the server cannot be reached, and checks again on request', async () => {
    const { element, httpTesting, settle, statusText } = renderHome();
    httpTesting.expectOne('/api/health').error(new ProgressEvent('error'));
    await settle();
    expect(statusText()).toContain('The server cannot be reached');

    element.querySelector<HTMLButtonElement>('header button')?.click();
    // Not settle(): whenStable() would wait for this very request, which is answered below
    TestBed.tick();
    httpTesting.expectOne('/api/health').flush({ status: 'ok', version: '0.1.0', database: 'up' });
    await settle();
    expect(statusText()).toContain('The server and its database are running');
  });
});
