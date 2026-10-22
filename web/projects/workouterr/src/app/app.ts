import { httpResource } from '@angular/common/http';
import { Component } from '@angular/core';
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
}
