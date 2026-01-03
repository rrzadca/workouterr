import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Card } from 'primeng/card';
import { TypographyDemo } from './components/typography-demo/typography-demo';
import { IconsDemo } from './components/icons-demo/icons-demo';
import { OthersDemo } from './components/others-demo/others-demo';
import { TabsModule } from 'primeng/tabs';
import { LayoutStateService } from '@services/layout-state.service';

@Component({
    selector: 'rr-demo-view',
    imports: [Card, TypographyDemo, IconsDemo, OthersDemo, TabsModule],
    templateUrl: './demo-view.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoView {
    private readonly layoutStateService = inject(LayoutStateService);

    protected toggleDarkMode() {
        this.layoutStateService.toggleDarkMode();
    }
}
