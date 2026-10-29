import { argsToTemplate, type Meta, type StoryObj } from '@storybook/angular-vite';
import { FormInputText } from './form-input-text';

// Outside a form the state inputs (`touched`, `invalid`, …) are set by hand; `[formField]` sets them in the app.
const meta: Meta<FormInputText> = {
  title: 'Forms/FormInputText',
  component: FormInputText,
  args: { type: 'email', label: 'Email', icon: 'mail', placeholder: 'you@example.com' },
  argTypes: {
    type: { control: 'inline-radio', options: ['text', 'email', 'password', 'search', 'tel', 'url'] },
  },
  render: (args) => ({
    props: args,
    template: `<rad-form-input-text class="w-80" ${argsToTemplate(args)} />`,
  }),
};

export default meta;
type Story = StoryObj<FormInputText>;

export const Default: Story = {};

export const WithHint: Story = { args: { hint: 'The one you signed up with' } };

export const WithError: Story = { args: { error: 'Enter your email.', touched: true, invalid: true } };

export const Password: Story = { args: { type: 'password', label: 'Password', icon: 'lock', value: 'correct-horse' } };

export const Disabled: Story = { args: { value: 'me@example.com', disabled: true } };
