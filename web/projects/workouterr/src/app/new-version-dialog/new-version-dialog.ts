import { DOCUMENT } from '@angular/common';
import { Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { RadButton } from '@rrzadca/radinf-ui/button';
import { RadDialogFooter, RadDialogTitle } from '@rrzadca/radinf-ui/dialog';

// The `aria-describedby` target `App` passes when it opens this dialog, so screen readers read the message after the
// title.
export const newVersionDescriptionId = 'new-version-description';

// The "new version" prompt, opened by `App` once the API has turned this build away. Its only way out is a reload: it
// opens with `disableClose`, so Escape and the backdrop do nothing.
@Component({
  imports: [RadButton, RadDialogFooter, RadDialogTitle, TranslocoDirective],
  selector: 'app-new-version-dialog',
  templateUrl: './new-version-dialog.html',
})
export class NewVersionDialog {
  private readonly document = inject(DOCUMENT);

  protected readonly descriptionId = newVersionDescriptionId;

  // A reload fetches the new build. Data not yet sent stays in browser storage.
  protected reload() {
    this.document.location.reload();
  }
}
