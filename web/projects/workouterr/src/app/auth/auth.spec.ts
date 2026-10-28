import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService } from './auth';
import { requireLoggedOut, requireLogin } from './auth-guards';
import { loginEndedInterceptor } from './login-ended-interceptor';

@Component({ template: '' })
class EmptyPage {}

const user = { id: '0b5f6c1e-6d3a-4f43-9c56-2f1c6f1d8e01', email: 'me@example.com' };

describe('Auth', () => {
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([loginEndedInterceptor])),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'login', component: EmptyPage, canActivate: [requireLoggedOut] },
          { path: '', component: EmptyPage, canActivate: [requireLogin] },
        ]),
      ],
    });
    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
  });

  afterEach(() => httpTesting.verify());

  // Navigates, answers /api/auth/me the given way, and resolves with the URL the guards end on.
  async function navigateAnsweringMe(url: string, answer: (request: ReturnType<typeof httpTesting.expectOne>) => void) {
    const navigation = router.navigateByUrl(url);
    // The guard asks once the router has matched the route, a few promises later.
    await new Promise((resolve) => setTimeout(resolve));
    answer(httpTesting.expectOne('/api/auth/me'));
    await navigation;
    return router.url;
  }

  it('lets a logged-in user into the app', async () => {
    expect(await navigateAnsweringMe('/', (me) => me.flush(user))).toBe('/');
    expect(TestBed.inject(AuthService).currentUser()).toEqual(user);
  });

  it('sends everyone else to the login page', async () => {
    expect(await navigateAnsweringMe('/', (me) => me.flush(null, { status: 401, statusText: 'Unauthorized' }))).toBe(
      '/login',
    );
  });

  it('sends a logged-in user away from the login page', async () => {
    expect(await navigateAnsweringMe('/login', (me) => me.flush(user))).toBe('/');
  });

  it('asks the API only once per load', async () => {
    await navigateAnsweringMe('/', (me) => me.flush(user));

    await router.navigateByUrl('/login');

    httpTesting.expectNone('/api/auth/me');
    expect(router.url).toBe('/');
  });

  it('goes back to the login page when another call answers 401', async () => {
    await navigateAnsweringMe('/', (me) => me.flush(user));

    TestBed.inject(HttpClient)
      .get('/api/sessions')
      .subscribe({ error: () => undefined });
    httpTesting.expectOne('/api/sessions').flush(null, { status: 401, statusText: 'Unauthorized' });
    // The interceptor starts the navigation without waiting for it.
    await new Promise((resolve) => setTimeout(resolve));

    expect(TestBed.inject(AuthService).currentUser()).toBeNull();
    expect(router.url).toBe('/login');
  });

  it('logs out through the API, then shows the login page', async () => {
    await navigateAnsweringMe('/', (me) => me.flush(user));

    const logout = TestBed.inject(AuthService).logout();
    const request = httpTesting.expectOne('/api/auth/logout');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeNull();
    request.flush(null, { status: 204, statusText: 'No Content' });
    await logout;

    expect(router.url).toBe('/login');
  });
});
