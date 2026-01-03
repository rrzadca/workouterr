import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { LayoutStateService } from '../../../../services/layout-state.service';

@Component({
    selector: 'app-dashboard-view',
    imports: [ButtonModule],
    templateUrl: './dashboard-view.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardView {
    private readonly layoutStateService = inject(LayoutStateService);

    protected toggleDarkMode() {
        this.layoutStateService.toggleDarkMode();
    }

    protected toggleSidebar() {
        this.layoutStateService.toggleSidebar();
    }
}
