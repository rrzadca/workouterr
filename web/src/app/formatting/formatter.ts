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
    const locale = this.locale();
    const cacheKey = `${locale}|${format}`;
    let numberFormatter = this.numberFormatters.get(cacheKey);
    if (!numberFormatter) {
      numberFormatter = new Intl.NumberFormat(locale, numberFormats[format]);
      this.numberFormatters.set(cacheKey, numberFormatter);
    }
    return numberFormatter.format(value);
  }

  formatDate(value: Date | string | number, format: DateFormat = 'medium'): string {
    const locale = this.locale();
    const cacheKey = `${locale}|${format}`;
    let dateFormatter = this.dateFormatters.get(cacheKey);
    if (!dateFormatter) {
      dateFormatter = new Intl.DateTimeFormat(locale, dateFormats[format]);
      this.dateFormatters.set(cacheKey, dateFormatter);
    }
    return dateFormatter.format(new Date(value));
  }

  private locale(): string {
    const language = this.language();
    return localeByLanguage[isLanguage(language) ? language : defaultLanguage];
  }
}
