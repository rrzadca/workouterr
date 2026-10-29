import { booleanAttribute, Component, computed, type ElementRef, input, model, output, viewChild } from '@angular/core';
import { type FormValueControl } from '@angular/forms/signals';
import { Icon } from '../../icon/icon';
import { IconName } from '../../icon/icons';

export type FormInputTextType = 'text' | 'email' | 'password' | 'search' | 'tel' | 'url';

// Full class names, so Tailwind finds them in this file.
const boxClasses =
  'flex h-control-md items-center gap-2 rounded-sm border bg-surface-card px-3 ' +
  'shadow-field [transition:var(--transition-control)] ' +
  'focus-within:ring-3 focus-within:ring-accent-ring';
const validBoxClasses = 'border-border-field focus-within:border-accent';
const invalidBoxClasses = 'border-status-danger';

// Types whose values are not words: no capital letter at the start, no spell checking.
const literalTypes: readonly FormInputTextType[] = ['email', 'password', 'url'];

// Gives each field's error its own id, for the input's aria-describedby.
let nextFieldId = 0;

// A labelled text input, bound to a Signal Forms field like a native one:
// `<rad-form-input-text type="email" label="Email" icon="mail" [error]="…" [formField]="loginForm.email" />`.
// `[formField]` keeps `value` in sync and fills the state inputs (touched, invalid, …); the error shows once the field
// is touched and invalid.
@Component({
  imports: [Icon],
  selector: 'rad-form-input-text',
  templateUrl: './form-input-text.html',
  host: { class: 'flex flex-col' },
})
export class FormInputText implements FormValueControl<string> {
  protected readonly errorId = `rad-form-input-text-error-${nextFieldId++}`;

  readonly value = model('');
  readonly type = input<FormInputTextType>('text');
  readonly label = input.required<string>();
  readonly icon = input<IconName>();
  // The native autocomplete token (`username`, `current-password`, …), which password managers and autofill read.
  readonly autocomplete = input<string>();
  readonly placeholder = input<string>();
  readonly hint = input<string>();
  // The message for the field's errors; the caller translates it, since the field's errors carry no text to show.
  readonly error = input<string>();

  // Set by `[formField]` from the field's state.
  readonly name = input('');
  readonly touched = input(false, { transform: booleanAttribute });
  readonly invalid = input(false, { transform: booleanAttribute });
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });

  // Tells `[formField]` the user has left the input, which marks the field as touched.
  readonly touch = output<void>();

  private readonly inputElement = viewChild.required<ElementRef<HTMLInputElement>>('inputElement');

  protected readonly showsError = computed(() => this.touched() && this.invalid() && !!this.error());
  protected readonly isLiteral = computed(() => literalTypes.includes(this.type()));
  protected readonly boxClasses = computed(
    () => `${boxClasses} ${this.showsError() ? invalidBoxClasses : validBoxClasses}`,
  );

  // Called by Signal Forms to focus the field, e.g. the first invalid one.
  focus(options?: FocusOptions) {
    this.inputElement().nativeElement.focus(options);
  }
}
