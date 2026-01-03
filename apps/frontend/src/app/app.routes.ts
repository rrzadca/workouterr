import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'login',
    },
    {
        path: 'login',
        loadChildren: () =>
            import('./views/auth-view/auth-view.routes').then((m) => m.routes),
    },
    {
        path: 'app',
        loadChildren: () =>
            import('./views/app-view/app-view.routes').then((m) => m.routes),
    },
];
