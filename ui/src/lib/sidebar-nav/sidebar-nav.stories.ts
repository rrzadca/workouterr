import { provideRouter, withHashLocation } from '@angular/router';
import { LucideDumbbell, LucideHouse, LucideListChecks, LucideSettings } from '@lucide/angular';
import { applicationConfig, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { Button } from '../button/button';
import { PageLayout } from '../page-layout/page-layout';
import { SidebarNav, type SidebarNavSection } from './sidebar-nav';

const sections: SidebarNavSection[] = [
  { label: 'Training', items: [{ link: '/', label: 'Start', icon: LucideHouse }] },
  {
    label: 'Library',
    items: [
      { link: '/exercises', label: 'Exercises', icon: LucideDumbbell, badge: 24 },
      { link: '/routines', label: 'Routines', icon: LucideListChecks, badge: 5 },
    ],
  },
  { label: 'Account', items: [{ link: '/settings', label: 'Settings', icon: LucideSettings }] },
];

const meta: Meta<SidebarNav> = {
  title: 'SidebarNav',
  component: SidebarNav,
  decorators: [
    // Every link leads to an empty page, so clicking moves the highlight; hash URLs keep Storybook's own URL
    applicationConfig({ providers: [provideRouter([{ path: '**', children: [] }], withHashLocation())] }),
    moduleMetadata({ imports: [Button, PageLayout] }),
  ],
  args: { sections },
  render: (args) => ({
    props: args,
    template: `
      <div class="flex h-[560px]">
        <nav rad-sidebar-nav class="w-sidebar" [sections]="sections" aria-label="Main">
          <strong sidebarHeader class="px-2 font-display text-title-3 text-text-strong">Workouterr</strong>
          <span sidebarFooter class="border-t border-border-hairline p-2 text-label text-text-muted">Signed in</span>
        </nav>
      </div>
    `,
  }),
};

export default meta;

type Story = StoryObj<SidebarNav>;

export const Default: Story = {};

export const WithPageLayout: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="flex h-[560px] bg-surface-app">
        <nav rad-sidebar-nav class="w-sidebar" [sections]="sections" aria-label="Main"></nav>
        <main class="min-w-0 flex-1 overflow-y-auto">
          <rad-page-layout title="Exercises">
            <button pageActions rad-button variant="primary">New exercise</button>
            <p class="text-text-body">Screen content goes here.</p>
          </rad-page-layout>
        </main>
      </div>
    `,
  }),
};
