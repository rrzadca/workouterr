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
      const kind = loginErrorKind(error);
      return kind ? { kind } : undefined;
    }
    await this.router.navigateByUrl('/');
    return undefined;
  }
}

// The form's own errors, each a key under `login.` in the translations.
type LoginErrorKind = 'invalidCredentials' | 'unreachable' | 'serverError';

// What a failed login shows on the form. A 426 shows nothing: the "new version" dialog already covers the page. A
// response that isn't an HttpErrorResponse failed the contract's schema, a bug like a 403 or 415 from the CSRF guard:
// the user can only try again later.
function loginErrorKind(error: unknown): LoginErrorKind | null {
  if (!(error instanceof HttpErrorResponse)) {
    return 'serverError';
  }
  switch (error.status) {
    // No response at all: no connection, or nothing answering at the server's address.
    case 0:
      return 'unreachable';
    case HttpStatusCode.Unauthorized:
      return 'invalidCredentials';
    case HttpStatusCode.UpgradeRequired:
      return null;
    default:
      return 'serverError';
  }
}
