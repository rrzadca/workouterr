import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { LucideDumbbell, LucideHouse } from '@lucide/angular';
import { SidebarNav, type SidebarNavSection } from './sidebar-nav';

@Component({ template: '' })
class EmptyPage {}

@Component({
  imports: [SidebarNav],
  template: `
    <nav rad-sidebar-nav [sections]="sections" aria-label="Main">
      <span sidebarHeader>Logo</span>
      <span sidebarFooter>User</span>
    </nav>
  `,
})
class SidebarNavHost {
  readonly sections: SidebarNavSection[] = [
    { label: 'Training', items: [{ link: '/', label: 'Home', icon: LucideHouse }] },
    { label: 'Library', items: [{ link: '/exercises', label: 'Exercises', icon: LucideDumbbell, badge: 12 }] },
  ];
}

async function renderSidebarAt(url: string) {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([
        { path: '', component: EmptyPage },
        { path: 'exercises', component: EmptyPage },
      ]),
    ],
  });
  const fixture = TestBed.createComponent(SidebarNavHost);
  await TestBed.inject(Router).navigateByUrl(url);
  await fixture.whenStable();
  const nav = (fixture.nativeElement as HTMLElement).querySelector('nav');
  if (!nav) {
    throw new Error('nav not rendered');
  }
  return nav;
}

function linkNamed(nav: HTMLElement, label: string): HTMLAnchorElement {
  const link = Array.from(nav.querySelectorAll('a')).find((anchor) => anchor.textContent.includes(label));
  if (!link) {
    throw new Error(`no link named ${label}`);
  }
  return link;
}

describe('SidebarNav', () => {
  it('shows section labels and links with their icons and badges', async () => {
    const nav = await renderSidebarAt('/');
    expect(nav.textContent).toContain('Training');
    expect(nav.textContent).toContain('Library');
    expect(linkNamed(nav, 'Exercises').getAttribute('href')).toBe('/exercises');
    expect(linkNamed(nav, 'Exercises').textContent).toContain('12');
    expect(nav.querySelectorAll('a svg')).toHaveLength(2);
  });

  it('marks only the current page as active', async () => {
    const nav = await renderSidebarAt('/exercises');
    expect(linkNamed(nav, 'Exercises').getAttribute('aria-current')).toBe('page');
    expect(linkNamed(nav, 'Exercises').classList).toContain('bg-accent');
    // '/' matches exactly, otherwise every page would count as Home
    expect(linkNamed(nav, 'Home').hasAttribute('aria-current')).toBe(false);
  });

  it('puts the header above the links and the footer below them', async () => {
    const nav = await renderSidebarAt('/');
    const text = nav.textContent;
    expect(text.indexOf('Logo')).toBeLessThan(text.indexOf('Home'));
    expect(text.indexOf('User')).toBeGreaterThan(text.indexOf('Exercises'));
  });
});
