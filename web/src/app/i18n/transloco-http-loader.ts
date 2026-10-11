import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Translation, TranslocoLoader } from '@jsverse/transloco';
import type { Observable } from 'rxjs';

/** Fetches public/i18n/<language>.json, which the build copies to /i18n/<language>.json. */
@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  private readonly httpClient = inject(HttpClient);

  getTranslation(language: string): Observable<Translation> {
    return this.httpClient.get<Translation>(`/i18n/${language}.json`);
  }
}
