import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslocoDirective } from '@jsverse/transloco';
import { Button, Dialog } from '@workouterr/ui';
import { ClientVersionService } from './api/client-version';

// The login page or the shell, by route (app.routes.ts), and over either the "new version" prompt once the API has
// turned this build away.
@Component({
  imports: [Button, Dialog, RouterOutlet, TranslocoDirective],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly document = inject(DOCUMENT);
  private readonly clientVersion = inject(ClientVersionService);

  protected readonly isOutdated = this.clientVersion.isOutdated;

  // A reload fetches the new build. Data not yet sent stays in browser storage.
  protected reload() {
    this.document.location.reload();
  }
}
