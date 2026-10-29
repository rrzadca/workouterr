import { booleanAttribute, Component, computed, input } from '@angular/core';
import { Icon } from '../../icon/icon';
import { type IconName } from '../../icon/icons';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'highlight' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';
export type ButtonType = 'button' | 'submit' | 'reset';

// Full class names, so Tailwind finds them in this file.
const baseClasses =
  'inline-flex w-full cursor-pointer items-center justify-center gap-1.5 border font-medium leading-none whitespace-nowrap ' +
  '[transition:var(--transition-control),filter_var(--dur-fast)_var(--ease-standard)] ' +
  'enabled:hover:brightness-105 enabled:active:brightness-92 disabled:cursor-default disabled:opacity-40 [&_*]:pointer-events-none ' +
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent-ring';

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'border-transparent bg-accent text-text-on-accent shadow-control',
  secondary: 'border-border-field bg-surface-card text-text-strong shadow-control',
  ghost: 'border-transparent bg-transparent text-text-default enabled:hover:bg-surface-hover',
  highlight: 'border-transparent bg-highlight text-text-on-amber shadow-control',
  danger: 'border-transparent bg-status-danger text-text-on-accent shadow-control',
};

// The mockup's sizes scaled for touch: every height is at least 44 px.
const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-control-sm rounded-xs px-3 text-caption',
  md: 'h-control-md rounded-sm px-4 text-body',
  lg: 'h-control-lg rounded-md px-5 text-body-lg',
  xl: 'h-control-xl rounded-lg px-6 text-body-lg',
};

const iconSizes: Record<ButtonSize, number> = { sm: 14, md: 16, lg: 18, xl: 20 };

// A native <button> inside: `<rad-button variant="primary" icon="plus" (click)="save()">Save</rad-button>`.
// `(click)` on <rad-button> hears the inner button's clicks as they bubble up; a disabled button sends none.
@Component({
  imports: [Icon],
  selector: 'rad-button',
  templateUrl: './button.html',
  host: {
    class: 'inline-flex',
    '[class.w-full]': 'fullWidth()',
  },
})
export class Button {
  readonly variant = input<ButtonVariant>('secondary');
  readonly size = input<ButtonSize>('md');
  // The native default is `submit`; a button submits a form only when it says so.
  readonly type = input<ButtonType>('button');
  // Icons before and after the label.
  readonly icon = input<IconName>();
  readonly iconEnd = input<IconName>();
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  // Shows a spinner in place of `icon` and disables the button.
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly iconSize = computed(() => iconSizes[this.size()]);
  protected readonly cssClasses = computed(() =>
    [baseClasses, variantClasses[this.variant()], sizeClasses[this.size()]].join(' '),
  );
}
