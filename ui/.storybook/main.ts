import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/angular-vite';

// npm may install Storybook packages under ui/node_modules instead of the root; Storybook itself lives at the root
// and can't find them by name, so they're resolved from here to absolute paths.
function resolvePackage(packageName: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${packageName}/package.json`)));
}

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.ts'],
  addons: [resolvePackage('@storybook/addon-a11y'), resolvePackage('@storybook/addon-docs')],
  framework: resolvePackage('@storybook/angular-vite'),
};

export default config;
