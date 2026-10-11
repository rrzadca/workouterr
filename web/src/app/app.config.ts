import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { apiErrorInterceptor } from './api/api-error.interceptor';
import { routes } from './app.routes';
import { provideI18n } from './i18n/provide-i18n';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([apiErrorInterceptor])),
    provideI18n(),
  ],
};
