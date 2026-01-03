import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
    selector: 'rr-auth-layout',
    imports: [],
    templateUrl: './auth-layout.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AuthLayout {}
