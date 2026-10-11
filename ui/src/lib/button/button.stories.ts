import { LucideMoon } from '@lucide/angular';
import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { Button } from './button';

const meta: Meta<Button & { label: string }> = {
  title: 'Button',
  component: Button,
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'highlight', 'danger'] },
    size: { control: 'inline-radio', options: ['md', 'lg', 'xl'] },
  },
  args: {
    label: 'Start workout',
    variant: 'primary',
    size: 'xl',
    fullWidth: false,
    disabled: false,
    loading: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <button rad-button [variant]="variant" [size]="size" [fullWidth]="fullWidth" [disabled]="disabled" [loading]="loading">
        {{ label }}
      </button>
    `,
  }),
};

export default meta;

type Story = StoryObj<Button & { label: string }>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: 'secondary', label: 'Cancel' } };

export const Ghost: Story = { args: { variant: 'ghost', label: 'Skip' } };

export const Highlight: Story = { args: { variant: 'highlight', label: 'New record' } };

export const Danger: Story = { args: { variant: 'danger', label: 'Discard workout' } };

export const Loading: Story = { args: { loading: true, label: 'Saving' } };

export const Disabled: Story = { args: { disabled: true } };

export const FullWidth: Story = { args: { fullWidth: true } };

export const IconOnly: Story = {
  decorators: [moduleMetadata({ imports: [LucideMoon] })],
  render: (args) => ({
    props: args,
    template: `
      <button rad-button iconOnly [variant]="variant" [size]="size" aria-label="Dark theme">
        <svg lucideMoon [size]="18"></svg>
      </button>
    `,
  }),
  args: { variant: 'ghost' },
};

export const AllVariantsAndSizes: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-4">
        @for (size of ['xl', 'lg', 'md']; track size) {
          <div class="flex items-center gap-3">
            @for (variant of ['primary', 'secondary', 'ghost', 'highlight', 'danger']; track variant) {
              <button rad-button [variant]="$any(variant)" [size]="$any(size)">{{ variant }}</button>
            }
          </div>
        }
      </div>
    `,
  }),
};
