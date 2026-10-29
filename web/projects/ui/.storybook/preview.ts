import { componentWrapperDecorator, type Preview } from '@storybook/angular-vite';

// Every story renders twice, side by side: each panel sets `data-theme`, which re-themes the tokens under it. A story
// that covers the whole viewport (a modal dialog) sets `parameters: { singleThemePanel: true }` and renders once, in
// the theme picked in the toolbar: two modals would cover each other.
const themePanelClasses = 'flex flex-wrap items-center gap-4 bg-surface-app p-6 font-ui text-body text-text-default';

const preview: Preview = {
  decorators: [
    componentWrapperDecorator(
      (story) => `
        @if (storybookSingleThemePanel) {
          <div [attr.data-theme]="storybookTheme" class="min-h-screen ${themePanelClasses}">${story}</div>
        } @else {
          <div class="grid min-h-screen grid-cols-2">
            <div data-theme="light" class="${themePanelClasses}">${story}</div>
            <div data-theme="dark" class="${themePanelClasses}">${story}</div>
          </div>
        }
      `,
      ({ parameters, globals }) => ({
        storybookSingleThemePanel: parameters['singleThemePanel'] === true,
        storybookTheme: globals['theme'],
      }),
    ),
  ],
  globalTypes: {
    theme: {
      description: 'Theme of the stories that render once (singleThemePanel)',
      toolbar: {
        title: 'Theme',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: { theme: 'light' },
  parameters: {
    layout: 'fullscreen',
    controls: { expanded: true },
  },
  tags: ['autodocs'],
};

export default preview;
