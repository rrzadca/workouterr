import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
    selector: 'rr-auth-view',
    template: `<router-outlet></router-outlet>`,
    styles: [
        `
            :host {
                display: block;
            }
        `,
    ],
    imports: [RouterOutlet],
})
export class AuthView {}
