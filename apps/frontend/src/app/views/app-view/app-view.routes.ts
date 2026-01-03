import { Routes } from '@angular/router';
import { AppView } from './app-view';

export const routes: Routes = [
    {
        path: '',
        component: AppView,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'dashboard',
            },
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./views/dashboard-view/dashboard-view').then(
                        (m) => m.DashboardView,
                    ),
            },
            {
                path: 'exercises',
                loadComponent: () =>
                    import('./views/exercises-view/exercises-view').then(
                        (m) => m.ExercisesView,
                    ),
            },
            {
                path: 'workouts',
                loadComponent: () =>
                    import('./views/workout-view/workout-view').then(
                        (m) => m.WorkoutView,
                    ),
            },
            {
                path: 'demo',
                loadComponent: () =>
                    import('./views/demo-view/demo-view').then(
                        (m) => m.DemoView,
                    ),
            },
        ],
    },
];
