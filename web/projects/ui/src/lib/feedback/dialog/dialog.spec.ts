import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Dialog } from './dialog';

@Component({
  imports: [Dialog],
  template: `
    <rad-dialog title="New version" [description]="description()">
      <button type="button" (click)="presses = presses + 1">Reload</button>
    </rad-dialog>
  `,
})
class DialogHost {
  presses = 0;

  readonly description = signal<string | undefined>('Reload to continue.');
}

describe('Dialog', () => {
  async function render() {
    const fixture = TestBed.createComponent(DialogHost);
    await fixture.whenStable();
    const dialog = (fixture.nativeElement as HTMLElement).querySelector('[role="dialog"]') as HTMLElement;
    return { fixture, host: fixture.componentInstance, dialog };
  }

  it('is a modal dialog named by its title and described by its description', async () => {
    const { dialog } = await render();

    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(document.getElementById(dialog.getAttribute('aria-labelledby') ?? '')?.textContent).toBe('New version');
    expect(document.getElementById(dialog.getAttribute('aria-describedby') ?? '')?.textContent).toBe(
      'Reload to continue.',
    );
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
});
