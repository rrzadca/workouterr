import { HttpClient, httpResource } from '@angular/common/http';
import { effect, inject, Injectable } from '@angular/core';
import { GetSettingsResponse, type UpdateSettingsRequest, UpdateSettingsResponse } from '@workouterr/api-client';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../auth/auth';
import { ThemeService } from '../theme';

// The logged-in account's settings (display name, theme, rest-timer sound), the same on every device. Loaded when
// someone logs in, and again when someone else does; every change goes to the API and comes back as the new settings.
@Injectable({ providedIn: 'root' })
export class AccountSettingsService {
  private readonly auth = inject(AuthService);
  private readonly http = inject(HttpClient);
  private readonly themes = inject(ThemeService);

  // Nobody logged in, no request. Re-runs whenever the current user changes: a logout drops the settings, so the next
  // login (whoever it is) asks again.
  readonly settings = httpResource(() => (this.auth.currentUser() ? '/api/settings' : undefined), {
    parse: GetSettingsResponse.parse,
  });

  constructor() {
    // The account's theme wins over the device's copy, so a theme chosen on another device applies here after login.
    effect(() => {
      if (this.settings.hasValue()) {
        this.themes.useAccountTheme(this.settings.value().theme);
      }
    });
  }

  // Sends only the given fields and keeps the settings the API answers with. Rejects with the HttpErrorResponse (or the
  // zod error for a response the contract doesn't allow), leaving the settings as they were.
  async update(changes: UpdateSettingsRequest) {
    const response = await firstValueFrom(this.http.patch('/api/settings', changes));
    this.settings.set(UpdateSettingsResponse.parse(response));
  }

  // The theme button's choice, already applied on this device. A failed save only means other devices don't get it;
  // this one keeps it, until the account's theme comes back on the next load.
  async saveTheme(theme: 'light' | 'dark') {
    try {
      await this.update({ theme });
    } catch {
      // Offline or API down: nothing to show, the theme already switched.
    }
  }
}
