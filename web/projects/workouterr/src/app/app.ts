import { HttpErrorResponse, HttpStatusCode, httpResource } from '@angular/common/http';
import { Component, computed } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// Written by hand until task 9 generates it from the OpenAPI document.
interface HealthResponse {
  status: 'Unhealthy' | 'Degraded' | 'Healthy';
}

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  // A relative URL: the dev proxy (and Caddy in production) forwards /api to the API on the same origin.
  protected readonly health = httpResource<HealthResponse>(() => '/api/health');

  // The API answers 503 when it is up but a dependency (the database) is not.
  protected readonly isUnhealthy = computed(() => {
    const error = this.health.error();
    return error instanceof HttpErrorResponse && error.status === HttpStatusCode.ServiceUnavailable;
  });
}
