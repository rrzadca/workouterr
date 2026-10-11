import type { Decorator, Preview } from '@storybook/angular-vite';

// The library styles itself from the theme's variables; this switches them the same way the app does
const withTheme: Decorator = (story, context) => {
  const theme = context.globals['theme'] === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', theme);
  return story();
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
  globalTypes: {
    theme: {
      description: 'Light or dark theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: 'light',
  },
  decorators: [withTheme],
};

export default preview;
