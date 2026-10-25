import { TestBed } from '@angular/core/testing';
import { Icon } from './icon';

describe('Icon', () => {
  it('renders the named Lucide icon at the given size, hidden from screen readers', async () => {
    const fixture = TestBed.createComponent(Icon);
    fixture.componentRef.setInput('name', 'plus');
    fixture.componentRef.setInput('size', 20);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    const svg = host.querySelector('svg');
    expect(host.getAttribute('aria-hidden')).toBe('true');
    expect(host.style.width).toBe('20px');
    expect(svg?.getAttribute('width')).toBe('20');
    expect(svg?.classList).toContain('lucide-plus');
  });
});
