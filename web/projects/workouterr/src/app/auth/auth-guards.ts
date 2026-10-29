import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

// Lets the navigation through (`true`) or redirects it, by whether someone is logged in. When the API can't say (no
// connection, API down), the "can't reach" page offers to try again. Injects before awaiting: `inject` only works in
// the guard's synchronous part.
function routeByLogin(whenLoggedIn: true | string, whenLoggedOut: true | string): CanActivateFn {
  return async () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    let route: true | string;
    try {
      route = (await auth.loadCurrentUser()) ? whenLoggedIn : whenLoggedOut;
    } catch {
      route = '/unreachable';
    }
    return route === true ? true : router.parseUrl(route);
  };
}

// The app's pages: only for a logged-in user, everyone else goes to the login page.
export const requireLogin = routeByLogin(true, '/login');

// The login page: a logged-in user has nothing to do there and goes home.
export const requireLoggedOut = routeByLogin('/', true);
