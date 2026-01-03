import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'rr-typography-demo',
    imports: [],
    templateUrl: './typography-demo.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypographyDemo {}
