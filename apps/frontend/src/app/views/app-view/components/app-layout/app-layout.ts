import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    input,
    signal,
    TemplateRef,
} from '@angular/core';
import { TransitionDirective } from '@directives/transition/transition.directive';
import { LayoutStateService } from 'src/app/services/layout-state.service';

@Component({
    selector: 'rr-app-layout',
    imports: [NgTemplateOutlet, TransitionDirective],
    templateUrl: './app-layout.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppLayout {
    isDesktopSidebarClosable = input<boolean>(false);
    sidebarTemplate = input<TemplateRef<void>>();
    topbarTemplate = input<TemplateRef<void>>();
    footerTemplate = input<TemplateRef<void>>();

    protected showMobileSidebar = signal<boolean>(false);
    protected overlayVisible = signal<boolean>(false);

    protected isSidebarOpened = computed(() => {
        return this.layoutStateService.getLayoutState().isSidebarOpened();
    });

    private readonly layoutStateService = inject(LayoutStateService);

    protected toggleDarkMode() {
        this.layoutStateService.toggleDarkMode();
    }

    protected toggleSidebar() {
        this.layoutStateService.toggleSidebar();
    }

    protected hideOverlay() {
        this.overlayVisible.set(false);
    }
}
