import { argsToTemplate, moduleMetadata, type Meta, type StoryObj } from '@storybook/angular-vite';
import { Button } from '../../buttons/button/button';
import { Dialog } from './dialog';

// A modal covers the whole viewport, so each story renders once, in the toolbar's theme, and the docs page shows each
// story in its own iframe.
const meta: Meta<Dialog> = {
  title: 'Feedback/Dialog',
  component: Dialog,
  decorators: [moduleMetadata({ imports: [Button] })],
  parameters: { singleThemePanel: true, docs: { story: { inline: false, iframeHeight: 360 } } },
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
