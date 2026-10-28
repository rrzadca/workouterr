import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import packageJson from '../../../../../package.json';
import { clientVersionInterceptor } from './client-version';

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
});
