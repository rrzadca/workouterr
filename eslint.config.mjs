// @ts-check
import eslintJs from '@eslint/js';
import typescriptEslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import { builtinModules } from 'node:module';

export default typescriptEslint.config(
  {
    ignores: ['**/node_modules/', '**/dist/', '**/out-tsc/', '**/.angular/', '**/storybook-static/', '**/coverage/'],
  },
  eslintJs.configs.recommended,
  {
    files: ['**/*.ts'],
    extends: [typescriptEslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Express tells error middleware apart by its 4 parameters, so an unused `_next` must stay
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      // node:test's test() returns a promise that the test runner itself awaits
      '@typescript-eslint/no-floating-promises': [
        'error',
        {
          allowForKnownSafeCalls: [
            { from: 'package', package: 'node:test', name: ['test', 'it', 'describe', 'suite'] },
          ],
        },
      ],
    },
  },
  {
    files: ['shared/src/**/*.ts'],
    ignores: ['shared/src/**/*.test.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['node:*', ...builtinModules, 'express', '@angular/*'],
              message: 'shared runs in the browser and in the API: no Node, Express or Angular imports.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['ui/src/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@workouterr/*', '@jsverse/transloco'],
              message: 'ui is reusable in other projects: no app packages or translations; take text through inputs.',
            },
          ],
        },
      ],
    },
  },
  eslintConfigPrettier,
);
