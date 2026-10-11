import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { Button } from '../button/button';
import { PageLayout } from './page-layout';

const meta: Meta<PageLayout> = {
  title: 'PageLayout',
  component: PageLayout,
  decorators: [moduleMetadata({ imports: [Button] })],
  args: { title: 'Exercises' },
  render: (args) => ({
    props: { ...args, rows: Array.from({ length: 30 }, (_, index) => index + 1) },
    template: `
      <div class="h-[480px] overflow-y-auto bg-surface-app">
        <rad-page-layout [title]="title">
          <button pageActions rad-button variant="secondary">Archive</button>
          <button pageActions rad-button variant="primary">New exercise</button>
          @for (row of rows; track row) {
            <p class="py-2 text-text-body">Row {{ row }} — scroll to see the toolbar stay on top</p>
          }
        </rad-page-layout>
      </div>
    `,
  }),
};

export default meta;

export const Default: StoryObj<PageLayout> = {};
