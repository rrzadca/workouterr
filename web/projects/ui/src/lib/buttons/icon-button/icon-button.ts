import { booleanAttribute, Component, computed, input } from '@angular/core';
import { Icon } from '../../icon/icon';
import { type IconName } from '../../icon/icons';

export type IconButtonVariant = 'primary' | 'secondary' | 'ghost';
export type IconButtonSize = 'sm' | 'md' | 'lg';

// Full class names, so Tailwind finds them in this file.
const baseClasses =
  'inline-flex cursor-pointer items-center justify-center rounded-sm border [transition:var(--transition-control)] ' +
  'disabled:cursor-default disabled:opacity-40 [&_*]:pointer-events-none ' +
  'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-accent-ring';

const variantClasses: Record<IconButtonVariant, string> = {
  primary: 'border-transparent bg-accent text-text-on-accent shadow-control enabled:hover:brightness-105',
  secondary:
    'border-border-field bg-surface-card text-text-muted shadow-control enabled:hover:bg-surface-hover ' +
    'enabled:hover:text-text-strong',
  ghost:
    'border-transparent bg-transparent text-text-muted enabled:hover:bg-surface-hover enabled:hover:text-text-strong',
};

// The mockup's 22 / 28 / 34 px squares scaled for touch: the smallest is 44 px.
const sizeClasses: Record<IconButtonSize, string> = {
  sm: 'size-control-sm',
  md: 'size-control-md',
  lg: 'size-control-lg',
};

const iconSizes: Record<IconButtonSize, number> = { sm: 20, md: 22, lg: 24 };

// A native <button> showing only an icon; `label` is its accessible name and its tooltip.
// `<rad-icon-button icon="log-out" label="Log out" (click)="logout()" />`.
@Component({
  imports: [Icon],
  selector: 'rad-icon-button',
  templateUrl: './icon-button.html',
  host: { class: 'inline-flex' },
})
export class IconButton {
  readonly icon = input.required<IconName>();
  readonly label = input.required<string>();
  readonly variant = input<IconButtonVariant>('ghost');
  readonly size = input<IconButtonSize>('sm');
  readonly disabled = input(false, { transform: booleanAttribute });
  // Shows a spinner in place of the icon and disables the button.
  readonly loading = input(false, { transform: booleanAttribute });

  protected readonly iconSize = computed(() => iconSizes[this.size()]);
  protected readonly cssClasses = computed(() =>
    [baseClasses, variantClasses[this.variant()], sizeClasses[this.size()]].join(' '),
  );
}
