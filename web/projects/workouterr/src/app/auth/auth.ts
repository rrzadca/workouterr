import { HttpClient, HttpContext, HttpContextToken, HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  type CurrentUserResponseOutput,
  GetCurrentUserResponse,
  type LoginRequest,
  LoginResponse,
} from '@workouterr/api-client';
import { firstValueFrom } from 'rxjs';

// Set on the auth calls, whose 401 means "not logged in" or "wrong password" rather than "the login has ended".
export const handlesUnauthorized = new HttpContextToken(() => false);

// Who is logged in on this device. The login itself is the HttpOnly cookie the API sets, out of the app's reach: the
// app learns about it by asking /api/auth/me, and about its end from a 401.
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly authContext = new HttpContext().set(handlesUnauthorized, true);
  // The /api/auth/me request in flight, shared by every caller until it settles. Overlapping navigations would
  // otherwise each ask, and a cancelled navigation's late answer could overwrite a login made since.
  private currentUserRequest: Promise<CurrentUserResponseOutput | null> | null = null;

  // `undefined` until the API has been asked, `null` when nobody is logged in.
  private readonly user = signal<CurrentUserResponseOutput | null | undefined>(undefined);
  readonly currentUser = this.user.asReadonly();
  readonly isLoggedIn = computed(() => !!this.user());

  // Asks the API until it answers, then not again this load: login, logout and 401s keep `currentUser` up to date.
  // Only a 401 means nobody is logged in. Any other failure (no connection, API down) rejects and leaves the user
  // unknown, so the next call asks again: a working login cookie must not be taken for a logged-out device.
  async loadCurrentUser(): Promise<CurrentUserResponseOutput | null> {
    const knownUser = this.user();
    if (knownUser !== undefined) {
      return knownUser;
    }
    // Cleared once settled, so a failure leaves the next call free to ask again.
    this.currentUserRequest ??= this.fetchCurrentUser().finally(() => (this.currentUserRequest = null));
    return this.currentUserRequest;
  }

  // Nobody is logged in on this device any more: forget the user and show the login page.
  private async showLoggedOut() {
    this.user.set(null);
    await this.router.navigateByUrl('/login');
  }

  private async fetchCurrentUser(): Promise<CurrentUserResponseOutput | null> {
    let user: CurrentUserResponseOutput | null;
    try {
      user = GetCurrentUserResponse.parse(
        await firstValueFrom(this.http.get('/api/auth/me', { context: this.authContext })),
      );
    } catch (error) {
      if (!(error instanceof HttpErrorResponse && error.status === HttpStatusCode.Unauthorized)) {
        throw error;
      }
      user = null;
    }
    this.user.set(user);
    return user;
  }

  // Rejects with the HttpErrorResponse: 401 for a wrong email or password, others when the API can't answer.
  async login(credentials: LoginRequest) {
    const response = await firstValueFrom(
      this.http.post('/api/auth/login', credentials, { context: this.authContext }),
    );
    this.user.set(LoginResponse.parse(response));
  }

  // Leaves `currentUser` in place when the request fails: the cookie is still there, so the device is still logged in.
  async logout() {
    await firstValueFrom(this.http.post('/api/auth/logout', null, { context: this.authContext }));
    await this.showLoggedOut();
  }

  // The API answered 401 to a logged-in request: the login expired, or ended elsewhere (password change, logout of all
  // devices).
  async loginEnded() {
    await this.showLoggedOut();
  }
}
