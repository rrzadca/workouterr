import type { Routes } from '@angular/router';
import { Home } from './home/home';
import { Shell } from './shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    // Login (ticket 05) will be a route next to this one, outside the shell
    children: [{ path: '', component: Home }],
  },
];
