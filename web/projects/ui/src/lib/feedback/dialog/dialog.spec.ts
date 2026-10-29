import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Dialog } from './dialog';

@Component({
  imports: [Dialog],
  template: `
    @if (shown()) {
      <rad-dialog title="New version" [description]="description()">
        <button type="button" (click)="presses = presses + 1">Reload</button>
      </rad-dialog>
    }
  `,
})
class DialogHost {
  presses = 0;

  readonly shown = signal(true);
  readonly description = signal<string | undefined>('Reload to continue.');
}

describe('Dialog', () => {
  async function render() {
    const fixture = TestBed.createComponent(DialogHost);
    await fixture.whenStable();
    const dialog = (fixture.nativeElement as HTMLElement).querySelector('dialog') as HTMLDialogElement;
    return { fixture, host: fixture.componentInstance, dialog };
  }

  it('opens as a modal, named by its title and described by its description', async () => {
    const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
    const { dialog } = await render();

    expect(showModal).toHaveBeenCalledOnce();
    expect(dialog.hasAttribute('open')).toBe(true);
    expect(document.getElementById(dialog.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('New version');
    expect(document.getElementById(dialog.getAttribute('aria-describedby') ?? '')?.textContent).toBe(
      'Reload to continue.',
    );
    showModal.mockRestore();
  });

  it('has no description reference without a description', async () => {
    const { fixture, host, dialog } = await render();
    host.description.set(undefined);
    await fixture.whenStable();

    expect(dialog.hasAttribute('aria-describedby')).toBe(false);
    expect(dialog.querySelector('p')).toBeNull();
  });

  it('shows the projected actions, whose presses reach the parent', async () => {
    const { host, dialog } = await render();

    dialog.querySelector('button')?.click();

    expect(host.presses).toBe(1);
  });

  it('ignores Escape', async () => {
    const { dialog } = await render();

    const escape = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(escape);

    expect(escape.defaultPrevented).toBe(true);
  });

  it('opens again if the browser closes it anyway', async () => {
    const { dialog } = await render();

    dialog.close();

    expect(dialog.hasAttribute('open')).toBe(true);
  });

  it('leaves the page with its parent', async () => {
    const { fixture, host } = await render();
    host.shown.set(false);
    await fixture.whenStable();

    expect((fixture.nativeElement as HTMLElement).querySelector('dialog')).toBeNull();
  });
});
