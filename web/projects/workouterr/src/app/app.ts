import { Component, effect, inject, untracked } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RadDialog } from '@rrzadca/radinf-ui/dialog';
import { ClientVersionService } from './api/client-version';
import { NewVersionDialog, newVersionDescriptionId } from './new-version-dialog/new-version-dialog';

// The login page or the shell, by route (app.routes.ts), and over either the "new version" prompt once the API has
// turned this build away.
@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {
  private readonly clientVersion = inject(ClientVersionService);
  private readonly dialog = inject(RadDialog);

  constructor() {
    // `isOutdated` only ever turns true, so this opens the prompt once. `untracked`: opening the dialog renders its
    // content, whose signal reads must not become this effect's dependencies.
    effect(() => {
      if (this.clientVersion.isOutdated()) {
        untracked(() =>
          this.dialog.open(NewVersionDialog, {
            size: 'sm',
            role: 'alertdialog',
            ariaDescribedby: newVersionDescriptionId,
            disableClose: true,
          }),
        );
      }
    });
  }
}
