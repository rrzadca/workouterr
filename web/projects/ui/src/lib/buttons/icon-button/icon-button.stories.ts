import { type Meta, type StoryObj } from '@storybook/angular-vite';
import { IconButton } from './icon-button';

const meta: Meta<IconButton> = {
  title: 'Core/IconButton',
  component: IconButton,
  args: { icon: 'moon', label: 'Dark theme', variant: 'ghost', size: 'sm' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<IconButton>;

export const Ghost: Story = {};

export const Loading: Story = { args: { loading: true } };

export const Disabled: Story = { args: { disabled: true } };

export const AllVariants: Story = {
  render: () => ({
    template: `
      <rad-icon-button icon="plus" label="Add" variant="primary" />
      <rad-icon-button icon="plus" label="Add" variant="secondary" />
      <rad-icon-button icon="plus" label="Add" variant="ghost" />
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <rad-icon-button icon="log-out" label="Log out" variant="secondary" size="sm" />
      <rad-icon-button icon="log-out" label="Log out" variant="secondary" size="md" />
      <rad-icon-button icon="log-out" label="Log out" variant="secondary" size="lg" />
    `,
  }),
};
