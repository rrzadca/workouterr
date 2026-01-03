import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { LayoutStateService } from 'src/app/services/layout-state.service';
import { Menu } from 'primeng/menu';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'rr-app-sidebar',
    imports: [Menu],
    templateUrl: './app-sidebar.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppSidebar {
    private readonly router = inject(Router);
    private readonly layoutStateService = inject(LayoutStateService);

    protected menuItems = signal<MenuItem[]>([]);

    protected logoUrl = computed(() =>
        this.layoutStateService.getLayoutState().isDarkMode()
            ? 'assets/images/logo-simple-light.png'
            : 'assets/images/logo-simple-dark.png',
    );

    constructor() {
        this.initMenuItems();
    }

    protected handleLogoClick() {
        this.router.navigate(['/app/dashboard']);
    }

    private initMenuItems(): void {
        this.menuItems.set([
            {
                label: 'Nawigacja',
                items: [
                    {
                        label: 'Ćwiczenia',
                        icon: 'pi pi-palette',
                        routerLink: '/app/exercises',
                    },
                    {
                        label: 'Plany treningowe',
                        icon: 'pi pi-link',
                        routerLink: '/app/training-plans',
                    },
                    {
                        label: 'Treningi',
                        icon: 'pi pi-home',
                        routerLink: '/app/workouts',
                    },
                ],
            },
            {
                label: 'Ustawienia',
                items: [
                    {
                        label: 'Profil',
                        icon: 'pi pi-user',
                        routerLink: '/profile',
                    },
                    {
                        label: 'Demo',
                        icon: 'pi pi-user',
                        routerLink: '/app/demo',
                    },
                ],
            },
        ]);
    }
}
