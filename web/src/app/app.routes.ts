import type { Routes } from '@angular/router';
import { Shell } from './shell/shell';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    // The home page arrives in step 13; login (ticket 05) will be a route outside the shell
    children: [],
  },
];
