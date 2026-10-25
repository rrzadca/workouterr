import { type Meta, type StoryObj } from '@storybook/angular-vite';
import { Icon } from './icon';
import { icons } from './icons';

const meta: Meta<Icon> = {
  title: 'Core/Icon',
  component: Icon,
  args: { name: 'plus', size: 24 },
  argTypes: { name: { control: 'select', options: Object.keys(icons) } },
};

export default meta;
type Story = StoryObj<Icon>;

export const Default: Story = {};

// Every registered icon with its name.
export const AllIcons: Story = {
  render: () => ({
    props: { iconNames: Object.keys(icons) },
    template: `
      @for (iconName of iconNames; track iconName) {
        <div class="flex w-28 flex-col items-center gap-2 text-text-muted">
          <rad-icon [name]="iconName" [size]="24" class="text-text-strong" />
          <span class="text-caption">{{ iconName }}</span>
        </div>
      }
    `,
  }),
};
