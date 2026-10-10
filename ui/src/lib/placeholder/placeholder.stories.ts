import type { Meta, StoryObj } from '@storybook/angular-vite';
import { Placeholder } from './placeholder';

const meta: Meta<Placeholder> = {
  title: 'Placeholder',
  component: Placeholder,
};

export default meta;

export const Default: StoryObj<Placeholder> = {
  args: {
    label: 'Components arrive here from issue 03 on',
  },
};
