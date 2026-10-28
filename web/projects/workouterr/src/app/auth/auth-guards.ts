import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth';

// Both guards inject before awaiting: `inject` only works in the guard's synchronous part.

// The app's pages: only for a logged-in user, everyone else goes to the login page.
export const requireLogin: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return (await auth.loadCurrentUser()) ? true : router.parseUrl('/login');
};

// The login page: a logged-in user has nothing to do there and goes home.
export const requireLoggedOut: CanActivateFn = async () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return (await auth.loadCurrentUser()) ? router.parseUrl('/') : true;
};
