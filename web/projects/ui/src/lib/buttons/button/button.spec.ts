import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { type IconName } from '../../icon/icons';
import { Button, type ButtonVariant } from './button';

@Component({
  imports: [Button],
  template: `
    <rad-button [variant]="variant()" [icon]="icon()" [loading]="loading()" (click)="clicks = clicks + 1">
      Save
    </rad-button>
  `,
})
class ButtonHost {
  clicks = 0;

  readonly variant = signal<ButtonVariant>('secondary');
  readonly icon = signal<IconName | undefined>(undefined);
  readonly loading = signal(false);
}

describe('Button', () => {
  async function render() {
    const fixture = TestBed.createComponent(ButtonHost);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
    return { fixture, host: fixture.componentInstance, button };
  }

  it('is a plain button, not a submit button, showing its label', async () => {
    const { button } = await render();

    expect(button.type).toBe('button');
    expect(button.textContent?.trim()).toBe('Save');
  });

  it('reports presses of its button through (click)', async () => {
    const { host, button } = await render();

    button.click();

    expect(host.clicks).toBe(1);
  });

  it('styles the button by variant', async () => {
    const { fixture, host, button } = await render();
    expect(button.classList).toContain('bg-surface-card');

    host.variant.set('primary');
    await fixture.whenStable();

    expect(button.classList).toContain('bg-accent');
    expect(button.classList).not.toContain('bg-surface-card');
  });

  it('shows its icon before the label', async () => {
    const { fixture, host, button } = await render();
    host.icon.set('plus');
    await fixture.whenStable();

    expect(button.firstElementChild?.querySelector('svg')?.classList).toContain('lucide-plus');
  });

  it('while loading, shows a spinner in place of the icon and ignores presses', async () => {
    const { fixture, host, button } = await render();
    host.icon.set('plus');
    host.loading.set(true);
    await fixture.whenStable();

    button.click();

    expect(button.querySelector('svg')?.classList).toContain('lucide-loader-circle');
    expect(button.querySelector('.lucide-plus')).toBeNull();
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(host.clicks).toBe(0);
  });
});
