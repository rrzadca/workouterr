import { Routes } from '@angular/router';
import { requireLoggedOut, requireLogin } from './auth/auth-guards';

// Pages load on first visit, each in its own chunk: a logged-in start never downloads the login form, and the other
// way round.
export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login').then((module) => module.Login),
    canActivate: [requireLoggedOut],
  },
  // Every page after login sits inside the shell, behind one guard.
  {
    path: '',
    loadComponent: () => import('./shell/shell').then((module) => module.Shell),
    canActivate: [requireLogin],
    children: [{ path: '', loadComponent: () => import('./home/home').then((module) => module.Home) }],
  },
  { path: '**', redirectTo: '' },
];
