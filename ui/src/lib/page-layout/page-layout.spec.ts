import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PageLayout } from './page-layout';

@Component({
  imports: [PageLayout],
  template: `
    <rad-page-layout title="Exercises">
      <button pageActions>New exercise</button>
      <p>Bench press</p>
    </rad-page-layout>
  `,
})
class PageLayoutHost {}

describe('PageLayout', () => {
  it('shows the title as the page heading, actions in the header and content below', async () => {
    const fixture = TestBed.createComponent(PageLayoutHost);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent.trim()).toBe('Exercises');
    expect(compiled.querySelector('header button')?.textContent).toBe('New exercise');
    expect(compiled.querySelector('header p')).toBeNull();
    expect(compiled.textContent).toContain('Bench press');
  });
});
