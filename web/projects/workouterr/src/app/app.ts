import { HttpErrorResponse, HttpStatusCode, httpResource } from '@angular/common/http';
import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { GetHealthResponse } from '@workouterr/api-client';
import { Button } from '@workouterr/ui';

@Component({
  imports: [Button, RouterOutlet, TranslocoDirective],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  // A relative URL: the dev proxy (and Caddy in production) forwards /api to the API on the same origin.
  // The generated schema checks the body at runtime: a response the contract does not allow becomes an error.
  protected readonly health = httpResource(() => '/api/health', { parse: GetHealthResponse.parse });

  // The translation key for the current health state.
  protected readonly healthStatusKey = computed(() => {
    if (this.health.isLoading()) {
      return 'health.checking';
    }
    const error = this.health.error();
    // The API answers 503 when it is up but a dependency (the database) is not.
    if (error instanceof HttpErrorResponse && error.status === HttpStatusCode.ServiceUnavailable) {
      return 'health.unhealthy';
    }
    if (error) {
      return 'health.unreachable';
    }
    return this.health.value()?.status === 'Degraded' ? 'health.degraded' : 'health.healthy';
  });
}
