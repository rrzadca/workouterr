import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { Button } from '../../buttons/button/button';
import { Dialog } from './dialog';

// The dialog covers its whole panel: each story shows one.
const meta: Meta<Dialog> = {
  title: 'Feedback/Dialog',
  component: Dialog,
  decorators: [moduleMetadata({ imports: [Button] })],
  args: {
    title: 'New version available',
    description: 'Workouterr has been updated. Reload to keep using it.',
  },
  render: (args) => ({
    props: args,
    template: `
      <rad-dialog ${argsToTemplate(args)}>
        <rad-button variant="primary" size="lg" icon="refresh-cw">Reload</rad-button>
      </rad-dialog>
    `,
  }),
};

export default meta;
type Story = StoryObj<Dialog>;

export const Default: Story = {};

export const TwoActions: Story = {
  render: (args) => ({
    props: args,
    template: `
      <rad-dialog ${argsToTemplate(args)}>
        <rad-button size="lg">Load the other</rad-button>
        <rad-button variant="primary" size="lg">Keep this device's</rad-button>
      </rad-dialog>
    `,
  }),
  args: { title: 'Session changed on another device', description: 'Choose which version to keep.' },
};
