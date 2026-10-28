import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import { form, FormField, FormRoot, validateStandardSchema } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { LoginBody, type LoginRequest } from '@workouterr/api-client';
import { Button, FormInputText, Icon } from '@workouterr/ui';
import { AuthService } from '../auth/auth';

@Component({
  imports: [Button, FormField, FormInputText, FormRoot, Icon, TranslocoDirective],
  selector: 'app-login',
  templateUrl: './login.html',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly credentials = signal<LoginRequest>({ email: '', password: '' });
  // The limits come from the contract: LoginBody is the zod schema generated from the API's LoginRequest.
  protected readonly loginForm = form(
    this.credentials,
    (credentials) => validateStandardSchema(credentials, LoginBody),
    {
      submission: { action: () => this.login() },
    },
  );

  // The email field's message, shown by the field once it is touched and invalid: the schema's only email rules are
  // "not empty" and the length limit.
  protected readonly emailErrorKey = computed(() =>
    this.loginForm.email().value() ? 'login.emailTooLong' : 'login.emailRequired',
  );
  // The login's own errors, set by `login()`; editing a field clears them.
  protected readonly loginErrorKey = computed(() => {
    const error = this.loginForm().errors()[0];
    return error ? `login.${error.kind}` : null;
  });

  // Runs only when the form is valid. A returned error goes on the form, where `loginErrorKey` shows it.
  private async login() {
    try {
      await this.auth.login(this.credentials());
    } catch (error) {
      const wrongCredentials = error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized;
      return { kind: wrongCredentials ? 'invalidCredentials' : 'failed' };
    }
    await this.router.navigateByUrl('/');
    return undefined;
  }
}
