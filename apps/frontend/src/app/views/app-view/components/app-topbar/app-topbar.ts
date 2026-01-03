import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
} from '@angular/core';
import { LayoutStateService } from 'src/app/services/layout-state.service';

@Component({
    selector: 'rr-app-topbar',
    imports: [],
    templateUrl: './app-topbar.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppTopbar {
    private readonly layoutStateService = inject(LayoutStateService);

    protected logoUrl = computed(() =>
        this.layoutStateService.getLayoutState().isDarkMode()
            ? 'assets/images/logo-name-light.png'
            : 'assets/images/logo-name-dark.png',
    );

    protected themeIcon = computed(() =>
        this.layoutStateService.getLayoutState().isDarkMode()
            ? 'pi pi-moon'
            : 'pi pi-sun',
    );

    protected toggleDarkMode() {
        this.layoutStateService.toggleDarkMode();
    }
}
