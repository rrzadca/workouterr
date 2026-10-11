import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslocoPipe } from '@jsverse/transloco';
import { Button, PageLayout } from '@radinf/ui';
import { NetworkError } from '../api/api-errors';
import { HealthService } from './health.service';

/** The start page. For now it shows whether the API and its database are up. */
@Component({
  selector: 'app-home',
  imports: [TranslocoPipe, Button, PageLayout],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home.html',
})
export class Home {
  private readonly healthService = inject(HealthService);

  protected readonly health = rxResource({ stream: () => this.healthService.check() });

  protected readonly errorKey = computed(() =>
    this.health.error() instanceof NetworkError ? 'home.health.serverUnreachable' : 'home.health.unexpectedError',
  );
}
