import { inject, isDevMode, provideAppInitializer, type EnvironmentProviders } from '@angular/core';
import { provideTransloco, TranslocoService } from '@jsverse/transloco';
import { firstValueFrom } from 'rxjs';
import { TranslocoHttpLoader } from './transloco-http-loader';

/** Languages with a file in public/i18n; Polish arrives in 1b as one more entry and one more file. */
export const availableLanguages = ['en'] as const;
export type Language = (typeof availableLanguages)[number];
export const defaultLanguage: Language = 'en';

export function isLanguage(value: string): value is Language {
  return (availableLanguages as readonly string[]).includes(value);
}

export function provideI18n(): EnvironmentProviders[] {
  return [
    ...provideTransloco({
      config: {
        availableLangs: [...availableLanguages],
        defaultLang: defaultLanguage,
        fallbackLang: defaultLanguage,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
        missingHandler: { useFallbackTranslation: true },
      },
      loader: TranslocoHttpLoader,
    }),
    // Load the language before the first render, so the app never shows empty text or raw keys
    provideAppInitializer(() => firstValueFrom(inject(TranslocoService).load(defaultLanguage))),
  ];
}
