import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'highlight' | 'danger';
export type ButtonSize = 'md' | 'lg' | 'xl';

const baseClasses =
  'inline-flex items-center justify-center gap-1.5 border font-medium leading-none whitespace-nowrap select-none ' +
  'cursor-pointer transition-[background-color,box-shadow,filter,transform] duration-(--duration-fast) ease-standard ' +
  'disabled:cursor-default disabled:opacity-40';

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-text-on-accent border-transparent shadow-control enabled:hover:brightness-105 enabled:active:brightness-92',
  secondary:
    'bg-surface-card text-text-strong border-border-field shadow-control enabled:hover:brightness-105 enabled:active:brightness-92',
  ghost:
    'bg-transparent text-text-body border-transparent enabled:hover:bg-surface-hover enabled:active:bg-surface-active',
  highlight:
    'bg-highlight text-text-on-amber border-transparent shadow-control enabled:hover:brightness-105 enabled:active:brightness-92',
  danger:
    'bg-status-danger text-white border-transparent shadow-control enabled:hover:brightness-105 enabled:active:brightness-92',
};

// The design is a Mac app with 28px controls; on the iPad the 44px xl size is the default touch target
const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-control-md text-body rounded-sm',
  lg: 'h-control-lg text-body-lg rounded-md',
  xl: 'h-control-xl text-body-lg rounded-lg',
};

const paddingClasses: Record<ButtonSize, string> = {
  md: 'px-3',
  lg: 'px-4',
  xl: 'px-5.5',
};

// An icon-only button is a square as wide as it is high
const iconOnlyClasses: Record<ButtonSize, string> = {
  md: 'w-control-md',
  lg: 'w-control-lg',
  xl: 'w-control-xl',
};

/**
 * Styles a native button, so it keeps its own keyboard, form and accessibility behaviour:
 * `<button rad-button variant="primary" (click)="save()">Save</button>`.
 */
@Component({
  selector: 'button[rad-button]',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class]': 'classes()',
    '[disabled]': 'disabled() || loading()',
    '[attr.aria-busy]': 'loading() || null',
  },
  templateUrl: './button.html',
})
export class Button {
  readonly variant = input<ButtonVariant>('secondary');
  readonly size = input<ButtonSize>('xl');
  readonly fullWidth = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  /** Shows a spinner and blocks clicks while an action runs */
  readonly loading = input(false, { transform: booleanAttribute });
  /** A square button that holds only an icon; give it an aria-label, since it has no text */
  readonly iconOnly = input(false, { transform: booleanAttribute });

  protected readonly classes = computed(() =>
    [
      baseClasses,
      variantClasses[this.variant()],
      sizeClasses[this.size()],
      this.iconOnly() ? iconOnlyClasses[this.size()] : paddingClasses[this.size()],
      this.fullWidth() ? 'w-full' : '',
    ].join(' '),
  );
}
