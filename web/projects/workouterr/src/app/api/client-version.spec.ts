import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import packageJson from '../../../../../package.json';
import { ClientVersionService, clientVersionInterceptor } from './client-version';

describe('clientVersionInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([clientVersionInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('sends the build version from package.json to the API', () => {
    http.get('/api/health').subscribe();

    const request = httpTesting.expectOne('/api/health').request;
    expect(request.headers.get('X-Client-Version')).toBe(packageJson.version);
  });

  it('leaves other requests alone', () => {
    http.get('/i18n/en.json').subscribe();

    expect(httpTesting.expectOne('/i18n/en.json').request.headers.has('X-Client-Version')).toBe(false);
  });

  it('marks the build outdated when the API answers 426, and passes the error on', () => {
    let status: number | undefined;
    http.get('/api/auth/me').subscribe({ error: (error: HttpErrorResponse) => (status = error.status) });

    httpTesting.expectOne('/api/auth/me').flush(null, { status: 426, statusText: 'Upgrade Required' });

    expect(TestBed.inject(ClientVersionService).isOutdated()).toBe(true);
    expect(status).toBe(426);
  });

  it('leaves the build current on other errors', () => {
    http.get('/api/auth/me').subscribe({ error: () => undefined });

    httpTesting.expectOne('/api/auth/me').flush(null, { status: 500, statusText: 'Internal Server Error' });

    expect(TestBed.inject(ClientVersionService).isOutdated()).toBe(false);
  });
});
