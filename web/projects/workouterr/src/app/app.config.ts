import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  isDevMode,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { clientVersionInterceptor } from './api/client-version';
import { routes } from './app.routes';
import { loginEndedInterceptor } from './auth/login-ended-interceptor';
import { ThemeService } from './theme';
import { TranslocoHttpLoader } from './transloco-loader';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([clientVersionInterceptor, loginEndedInterceptor])),
    provideTransloco({
      config: {
        availableLangs: ['en'],
        defaultLang: 'en',
        // Switching the language re-renders the page in place, without a reload.
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
    // Sets the theme as the app starts, before the first render.
    provideAppInitializer(() => {
      inject(ThemeService);
    }),
    // Holds the first render until the default language is loaded, so keys never show as blank text.
    provideAppInitializer(() => {
      const transloco = inject(TranslocoService);
      return firstValueFrom(transloco.load(transloco.getDefaultLang()));
    }),
  ],
};
