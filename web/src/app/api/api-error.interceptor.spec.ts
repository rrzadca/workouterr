import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { apiErrorInterceptor } from './api-error.interceptor';
import { ApiError, NetworkError, UnexpectedResponseError } from './api-errors';

describe('apiErrorInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiErrorInterceptor])), provideHttpClientTesting()],
    });
    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  /** Starts a GET, lets the test answer it, and returns what the request failed with. */
  async function failureOf(url: string, answer: (request: ReturnType<HttpTestingController['expectOne']>) => void) {
    const response = firstValueFrom(httpClient.get(url));
    answer(httpTesting.expectOne(url));
    return response.then(
      () => {
        throw new Error('expected the request to fail');
      },
      (error: unknown) => error,
    );
  }

  it('turns the API error shape into an ApiError with its code', async () => {
    const error = await failureOf('/api/exercises/7', (request) =>
      request.flush(
        { error: { code: 'NOT_FOUND', message: 'No exercise 7' } },
        { status: 404, statusText: 'Not Found' },
      ),
    );
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 404, code: 'NOT_FOUND', message: 'No exercise 7' });
  });

  it('keeps validation details', async () => {
    const details = [{ path: ['name'], message: 'Required' }];
    const error = await failureOf('/api/exercises', (request) =>
      request.flush(
        { error: { code: 'VALIDATION_FAILED', message: 'Invalid body', details } },
        { status: 400, statusText: 'Bad Request' },
      ),
    );
    expect(error).toMatchObject({ code: 'VALIDATION_FAILED', details });
  });

  it('keeps the body of a response that is not the error shape', async () => {
    const body = { status: 'unavailable', version: '0.1.0', database: 'down' };
    const error = await failureOf('/api/health', (request) =>
      request.flush(body, { status: 503, statusText: 'Service Unavailable' }),
    );
    expect(error).toBeInstanceOf(UnexpectedResponseError);
    expect(error).toMatchObject({ status: 503, body });
  });

  it('reports a request that got no response as a NetworkError', async () => {
    const error = await failureOf('/api/health', (request) => request.error(new ProgressEvent('error')));
    expect(error).toBeInstanceOf(NetworkError);
  });

  it('reports a proxy that could not reach the API as a NetworkError', async () => {
    const error = await failureOf('/api/health', (request) =>
      request.flush('', { status: 502, statusText: 'Bad Gateway' }),
    );
    expect(error).toBeInstanceOf(NetworkError);
  });

  it('leaves requests outside /api alone', async () => {
    const error = await failureOf('/i18n/en.json', (request) =>
      request.flush('missing', { status: 404, statusText: 'Not Found' }),
    );
    expect(error).not.toBeInstanceOf(UnexpectedResponseError);
    expect(error).toMatchObject({ name: 'HttpErrorResponse', status: 404 });
  });
});
