import { importProvidersFrom, type EnvironmentProviders } from '@angular/core';
import { TranslocoTestingModule } from '@jsverse/transloco';
import english from '../../public/i18n/en.json';

/** The real English file, loaded up front, so component tests can expect the text a user sees. */
export function provideI18nForTests(): EnvironmentProviders {
  return importProvidersFrom(
    TranslocoTestingModule.forRoot({
      langs: { en: english },
      translocoConfig: { availableLangs: ['en'], defaultLang: 'en' },
      preloadLangs: true,
    }),
  );
}
