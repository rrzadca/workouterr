import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslocoService } from '@jsverse/transloco';
import { defaultLanguage, isLanguage } from '../i18n/provide-i18n';
import { dateFormats, localeByLanguage, numberFormats, type DateFormat, type NumberFormat } from './formats';

/** Formats numbers and dates for the active language; the pipes and any code that builds text use it. */
@Injectable({ providedIn: 'root' })
export class Formatter {
  private readonly translocoService = inject(TranslocoService);
  private readonly language = toSignal(this.translocoService.langChanges$, {
    initialValue: this.translocoService.getActiveLang(),
  });
  // Building an Intl formatter is slow compared with using one, so each locale + format is built once
  private readonly numberFormatters = new Map<string, Intl.NumberFormat>();
  private readonly dateFormatters = new Map<string, Intl.DateTimeFormat>();

  formatNumber(value: number, format: NumberFormat = 'decimal'): string {
    const numberFormatter = this.cachedFormatter(
      this.numberFormatters,
      format,
      (locale) => new Intl.NumberFormat(locale, numberFormats[format]),
    );
    return numberFormatter.format(value);
  }

  formatDate(value: Date | string | number, format: DateFormat = 'medium'): string {
    const dateFormatter = this.cachedFormatter(
      this.dateFormatters,
      format,
      (locale) => new Intl.DateTimeFormat(locale, dateFormats[format]),
    );
    return dateFormatter.format(new Date(value));
  }

  /** Returns the formatter for the active locale and this format, building it on first use. */
  private cachedFormatter<IntlFormatter>(
    cache: Map<string, IntlFormatter>,
    format: string,
    createFormatter: (locale: string) => IntlFormatter,
  ): IntlFormatter {
    const locale = this.locale();
    const cacheKey = `${locale}|${format}`;
    let formatter = cache.get(cacheKey);
    if (!formatter) {
      formatter = createFormatter(locale);
      cache.set(cacheKey, formatter);
    }
    return formatter;
  }

  private locale(): string {
    const language = this.language();
    return localeByLanguage[isLanguage(language) ? language : defaultLanguage];
  }
}
