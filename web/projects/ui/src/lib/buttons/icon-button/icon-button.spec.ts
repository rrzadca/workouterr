import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { IconButton } from './icon-button';

@Component({
  imports: [IconButton],
  template: `<rad-icon-button icon="sun" label="Light theme" [loading]="loading()" (click)="clicks = clicks + 1" />`,
})
class IconButtonHost {
  clicks = 0;

  readonly loading = signal(false);
}

describe('IconButton', () => {
  async function render() {
    const fixture = TestBed.createComponent(IconButtonHost);
    await fixture.whenStable();
    const button = (fixture.nativeElement as HTMLElement).querySelector('button') as HTMLButtonElement;
    return { fixture, host: fixture.componentInstance, button };
  }

  it('is a plain button named by its label, showing its icon', async () => {
    const { button } = await render();

    expect(button.type).toBe('button');
    expect(button.getAttribute('aria-label')).toBe('Light theme');
    expect(button.title).toBe('Light theme');
    expect(button.querySelector('svg')?.classList).toContain('lucide-sun');
  });

  it('reports presses of its button through (click)', async () => {
    const { host, button } = await render();

    button.click();

    expect(host.clicks).toBe(1);
  });

  it('while loading, shows a spinner in place of the icon and ignores presses', async () => {
    const { fixture, host, button } = await render();
    host.loading.set(true);
    await fixture.whenStable();

    button.click();

    expect(button.querySelector('svg')?.classList).toContain('lucide-loader-circle');
    expect(button.disabled).toBe(true);
    expect(host.clicks).toBe(0);
  });
});
