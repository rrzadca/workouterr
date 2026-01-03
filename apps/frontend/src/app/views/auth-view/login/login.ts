import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { Router } from '@angular/router';
import { AuthLayout } from '../components/auth-layout/auth-layout';

@Component({
    selector: 'rr-login',
    imports: [
        AuthLayout,
        ButtonModule,
        CheckboxModule,
        InputTextModule,
        PasswordModule,
        RippleModule,
    ],
    templateUrl: './login.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
    private readonly router = inject(Router);

    protected handleSubmit() {
        this.router.navigateByUrl('/app');
    }
}
