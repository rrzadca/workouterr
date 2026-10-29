import { Component, input } from '@angular/core';

let nextDialogId = 0;

// A modal over the whole page, shown while the parent renders it (`@if`). The actions are projected and sit at the
// bottom right; the dialog has no close button and ignores taps on the scrim, so it stays until an action ends it.
// `<rad-dialog [title]="…" [description]="…"><rad-button variant="primary" (click)="…">OK</rad-button></rad-dialog>`.
@Component({
  selector: 'rad-dialog',
  templateUrl: './dialog.html',
})
export class Dialog {
  readonly title = input.required<string>();
  readonly description = input<string>();

  private readonly dialogId = nextDialogId++;
  protected readonly titleId = `rad-dialog-title-${this.dialogId}`;
  protected readonly descriptionId = `rad-dialog-description-${this.dialogId}`;
}
