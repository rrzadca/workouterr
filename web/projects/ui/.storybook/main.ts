import { resolve } from 'node:path';
import type { StorybookConfig } from '@storybook/angular-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.ts'],
  addons: ['@storybook/addon-docs'],
  framework: '@storybook/angular-vite',
  core: { disableTelemetry: true },
  // Vite looks for a PostCSS config only up to the nearest package.json, the library's own; point it at the
  // workspace's `.postcssrc.json` (Tailwind), the one the app build uses.
  viteFinal: (viteConfig, options) =>
    mergeConfig(viteConfig, { css: { postcss: resolve(options.configDir, '../../..') } }),
};

export default config;
