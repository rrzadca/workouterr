import { afterNextRender, Component, type ElementRef, input, viewChild } from '@angular/core';

let nextDialogId = 0;

// A modal over the whole page, shown while the parent renders it (`@if`). The actions are projected and sit at the
// bottom right; the dialog has no close button and ignores Escape, so it stays until an action ends it.
// `<rad-dialog [title]="…" [description]="…"><rad-button variant="primary" (click)="…">OK</rad-button></rad-dialog>`.
// A native <dialog> opened with showModal(): the browser moves focus to the first action, keeps Tab inside the dialog
// and makes the rest of the page inert. Leaving the page (the parent's `@if`) closes it.
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

  private readonly dialogElement = viewChild.required<ElementRef<HTMLDialogElement>>('dialogElement');

  constructor() {
    afterNextRender(() => this.dialogElement().nativeElement.showModal());
  }

  // Some browsers close a modal on a repeated Escape even when `cancel` is prevented; while the dialog is on the page,
  // it opens again.
  protected reopen() {
    const dialog = this.dialogElement().nativeElement;
    if (dialog.isConnected && !dialog.open) {
      dialog.showModal();
    }
  }
}
