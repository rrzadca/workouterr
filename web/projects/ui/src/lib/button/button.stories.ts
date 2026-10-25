import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { Button } from './button';

// `label` is the projected text, a story arg only: it isn't an input of Button.
type ButtonStoryArgs = Button & { label: string };

const meta: Meta<ButtonStoryArgs> = {
  title: 'Core/Button',
  component: Button,
  args: { label: 'Start workout', variant: 'secondary', size: 'md' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['primary', 'secondary', 'ghost', 'highlight', 'danger'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg', 'xl'] },
  },
  render: ({ label, ...inputs }) => ({
    props: inputs,
    template: `<rad-button ${argsToTemplate(inputs)}>${label}</rad-button>`,
  }),
};

export default meta;
type Story = StoryObj<ButtonStoryArgs>;

export const Primary: Story = { args: { variant: 'primary' } };

export const Secondary: Story = {};

export const WithIcons: Story = { args: { variant: 'primary', icon: 'plus', iconEnd: 'arrow-right' } };

export const Loading: Story = { args: { variant: 'primary', loading: true } };

export const Disabled: Story = { args: { disabled: true } };

export const AllVariants: Story = {
  render: () => ({
    template: `
      <rad-button variant="primary">Primary</rad-button>
      <rad-button variant="secondary">Secondary</rad-button>
      <rad-button variant="ghost">Ghost</rad-button>
      <rad-button variant="highlight">Highlight</rad-button>
      <rad-button variant="danger">Danger</rad-button>
    `,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <rad-button variant="primary" size="sm" icon="check">Small</rad-button>
      <rad-button variant="primary" size="md" icon="check">Medium</rad-button>
      <rad-button variant="primary" size="lg" icon="check">Large</rad-button>
      <rad-button variant="primary" size="xl" icon="check">Extra large</rad-button>
    `,
  }),
};
