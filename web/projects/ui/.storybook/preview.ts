import { componentWrapperDecorator, type Preview } from '@storybook/angular-vite';

// Every story renders twice, side by side: each panel sets `data-theme`, which re-themes the tokens under it.
const themePanelClasses = 'flex flex-wrap items-center gap-4 bg-surface-app p-6 font-ui text-body text-text-default';

const preview: Preview = {
  decorators: [
    componentWrapperDecorator(
      (story) => `
        <div class="grid min-h-screen grid-cols-2">
          <div data-theme="light" class="${themePanelClasses}">${story}</div>
          <div data-theme="dark" class="${themePanelClasses}">${story}</div>
        </div>
      `,
    ),
  ],
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },
  tags: ['autodocs'],
};

export default preview;
