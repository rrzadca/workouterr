import { HttpClient, HttpContext, HttpContextToken } from '@angular/common/http';
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

  // `undefined` until the API has been asked, `null` when nobody is logged in.
  private readonly user = signal<CurrentUserResponseOutput | null | undefined>(undefined);
  readonly currentUser = this.user.asReadonly();
  readonly isLoggedIn = computed(() => !!this.user());

  // Asks the API once per app load; after that, login, logout and 401s keep `currentUser` up to date.
  async loadCurrentUser(): Promise<CurrentUserResponseOutput | null> {
    const knownUser = this.user();
    if (knownUser !== undefined) {
      return knownUser;
    }
    let user: CurrentUserResponseOutput | null;
    try {
      user = GetCurrentUserResponse.parse(
        await firstValueFrom(this.http.get('/api/auth/me', { context: this.authContext })),
      );
    } catch {
      // 401, but also an API that can't be reached: either way the login page is where to go next.
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
    this.user.set(null);
    await this.router.navigateByUrl('/login');
  }

  // The API answered 401 to a logged-in request: the login expired, or ended elsewhere (password change, logout of all
  // devices).
  async loginEnded() {
    this.user.set(null);
    await this.router.navigateByUrl('/login');
  }
}
