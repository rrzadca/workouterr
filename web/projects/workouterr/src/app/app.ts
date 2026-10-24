import { HttpErrorResponse, HttpStatusCode, httpResource } from '@angular/common/http';
import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';

// Written by hand until task 9 generates it from the OpenAPI document.
interface HealthResponse {
  status: 'Unhealthy' | 'Degraded' | 'Healthy';
}

@Component({
  imports: [RouterOutlet, TranslocoDirective],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  // A relative URL: the dev proxy (and Caddy in production) forwards /api to the API on the same origin.
  protected readonly health = httpResource<HealthResponse>(() => '/api/health');

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
