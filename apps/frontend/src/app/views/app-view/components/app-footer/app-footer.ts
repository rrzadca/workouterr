import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'rr-app-footer',
    imports: [],
    templateUrl: './app-footer.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppFooter {}
