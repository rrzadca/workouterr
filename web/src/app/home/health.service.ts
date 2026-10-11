import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { healthResponseSchema, type HealthResponse } from '@workouterr/shared';
import { catchError, map, of, throwError, type Observable } from 'rxjs';
import { UnexpectedResponseError } from '../api/api-errors';

@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly httpClient = inject(HttpClient);

  /**
   * The API's health. A 503 with the health body is an answer ("database down"), not a failure, so it is returned
   * as a value; no answer or any other error fails the Observable.
   */
  check(): Observable<HealthResponse> {
    return this.httpClient.get<unknown>('/api/health').pipe(
      map((body) => healthResponseSchema.parse(body)),
      catchError((error: unknown) => {
        if (error instanceof UnexpectedResponseError && error.status === 503) {
          const parsedBody = healthResponseSchema.safeParse(error.body);
          if (parsedBody.success) {
            return of(parsedBody.data);
          }
        }
        return throwError(() => error);
      }),
    );
  }
}
