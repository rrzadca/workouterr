import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { apiErrorInterceptor } from '../api/api-error.interceptor';
import { NetworkError } from '../api/api-errors';
import { HealthService } from './health.service';

describe('HealthService', () => {
  let httpTesting: HttpTestingController;
  let healthService: HealthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(withInterceptors([apiErrorInterceptor])), provideHttpClientTesting()],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    healthService = TestBed.inject(HealthService);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('returns the health when the API is up', async () => {
    const health = firstValueFrom(healthService.check());
    httpTesting.expectOne('/api/health').flush({ status: 'ok', version: '0.1.0', database: 'up' });
    expect(await health).toEqual({ status: 'ok', version: '0.1.0', database: 'up' });
  });

  it('returns the unavailable health when the API answers 503', async () => {
    const health = firstValueFrom(healthService.check());
    httpTesting
      .expectOne('/api/health')
      .flush(
        { status: 'unavailable', version: '0.1.0', database: 'down' },
        { status: 503, statusText: 'Service Unavailable' },
      );
    expect(await health).toEqual({ status: 'unavailable', version: '0.1.0', database: 'down' });
  });

  it('fails when the API cannot be reached', async () => {
    const health = firstValueFrom(healthService.check());
    httpTesting.expectOne('/api/health').error(new ProgressEvent('error'));
    await expect(health).rejects.toBeInstanceOf(NetworkError);
  });

  it('fails on a 503 that is not a health body, such as a proxy page', async () => {
    const health = firstValueFrom(healthService.check());
    httpTesting.expectOne('/api/health').flush('<html>', { status: 503, statusText: 'Service Unavailable' });
    await expect(health).rejects.toMatchObject({ name: 'UnexpectedResponseError', status: 503 });
  });
});
