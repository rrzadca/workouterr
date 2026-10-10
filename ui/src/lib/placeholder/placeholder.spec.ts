import { TestBed } from '@angular/core/testing';
import { Placeholder } from './placeholder';

describe('Placeholder', () => {
  it('shows the label it is given', async () => {
    const fixture = TestBed.createComponent(Placeholder);
    fixture.componentRef.setInput('label', 'Coming soon');
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent.trim()).toBe('Coming soon');
  });
});
