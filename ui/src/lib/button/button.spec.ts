import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Button, type ButtonSize, type ButtonVariant } from './button';

@Component({
  imports: [Button],
  template: `
    <button
      rad-button
      class="extra-class"
      [variant]="variant()"
      [size]="size()"
      [loading]="loading()"
      [disabled]="disabled()"
      [iconOnly]="iconOnly()"
      (click)="clicks = clicks + 1"
    >
      Save
    </button>
  `,
})
class ButtonHost {
  readonly variant = signal<ButtonVariant>('secondary');
  readonly size = signal<ButtonSize>('xl');
  readonly loading = signal(false);
  readonly disabled = signal(false);
  readonly iconOnly = signal(false);
  clicks = 0;
}

async function renderButton() {
  const fixture = TestBed.createComponent(ButtonHost);
  await fixture.whenStable();
  const button = (fixture.nativeElement as HTMLElement).querySelector('button');
  if (!button) {
    throw new Error('button not rendered');
  }
  return { fixture, host: fixture.componentInstance, button };
}

describe('Button', () => {
  it('shows its content and keeps classes set by the user', async () => {
    const { button } = await renderButton();
    expect(button.textContent.trim()).toBe('Save');
    expect(button.classList).toContain('extra-class');
  });

  it('is the 44px touch size by default', async () => {
    const { button } = await renderButton();
    expect(button.classList).toContain('h-control-xl');
  });

  it('switches classes with the variant and size', async () => {
    const { fixture, host, button } = await renderButton();
    host.variant.set('primary');
    host.size.set('md');
    await fixture.whenStable();
    expect(button.classList).toContain('bg-accent');
    expect(button.classList).toContain('h-control-md');
    expect(button.classList).not.toContain('h-control-xl');
  });

  it('is disabled and busy while loading, and ignores clicks', async () => {
    const { fixture, host, button } = await renderButton();
    host.loading.set(true);
    await fixture.whenStable();
    button.click();
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(host.clicks).toBe(0);
  });

  it('can be disabled', async () => {
    const { fixture, host, button } = await renderButton();
    host.disabled.set(true);
    await fixture.whenStable();
    expect(button.disabled).toBe(true);
    expect(button.hasAttribute('aria-busy')).toBe(false);
  });

  it('is a square without side padding when it holds only an icon', async () => {
    const { fixture, host, button } = await renderButton();
    host.iconOnly.set(true);
    await fixture.whenStable();
    expect(button.classList).toContain('w-control-xl');
    expect(button.classList).not.toContain('px-5.5');
  });

  it('passes clicks through when enabled', async () => {
    const { host, button } = await renderButton();
    button.click();
    expect(host.clicks).toBe(1);
  });
});
