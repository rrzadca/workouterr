import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { Button, Icon } from '@workouterr/ui';

// Where the guards send the app when the API can't be reached. Offline use comes with the service worker.
@Component({
  imports: [Button, Icon, TranslocoDirective],
  selector: 'app-unreachable',
  templateUrl: './unreachable.html',
})
export class Unreachable {
  private readonly router = inject(Router);

  protected readonly retrying = signal(false);

  // Starts over from the home page: its guard asks the API again and goes on to the login page or home, or back here.
  protected async tryAgain() {
    this.retrying.set(true);
    try {
      await this.router.navigateByUrl('/');
    } finally {
      this.retrying.set(false);
    }
  }
}
