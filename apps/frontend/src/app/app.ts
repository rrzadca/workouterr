import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LayoutStateService } from './services/layout-state.service';

@Component({
    selector: 'rr-root',
    imports: [RouterOutlet],
    templateUrl: './app.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
    private readonly layoutStateService = inject(LayoutStateService);
}
