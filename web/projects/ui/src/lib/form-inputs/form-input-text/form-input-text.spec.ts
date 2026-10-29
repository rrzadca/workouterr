import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { disabled, form, FormField, required } from '@angular/forms/signals';
import { FormInputText } from './form-input-text';

@Component({
  imports: [FormField, FormInputText],
  template: `
    <rad-form-input-text
      type="email"
      label="Email"
      icon="mail"
      autocomplete="username"
      hint="The one you signed up with"
      error="Enter your email"
      [formField]="signupForm.email"
    />
  `,
})
class FormInputTextHost {
  readonly signup = signal({ email: '' });
  readonly locked = signal(false);
  readonly signupForm = form(this.signup, (signup) => {
    required(signup.email);
    disabled(signup.email, () => this.locked());
  });
}

describe('FormInputText', () => {
  async function render() {
    const fixture = TestBed.createComponent(FormInputTextHost);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    return {
      fixture,
      host: fixture.componentInstance,
      label: element.querySelector('label') as HTMLLabelElement,
      input: element.querySelector('input') as HTMLInputElement,
    };
  }

  it('is a labelled native input of the given type', async () => {
    const { label, input } = await render();

    expect(label.contains(input)).toBe(true);
    expect(label.textContent).toContain('Email');
    expect(input.type).toBe('email');
    expect(input.autocomplete).toBe('username');
    expect(input.getAttribute('autocapitalize')).toBe('none');
    expect(input.getAttribute('spellcheck')).toBe('false');
    expect(label.querySelector('svg')?.classList).toContain('lucide-mail');
  });

  it('keeps the field and the input in sync', async () => {
    const { fixture, host, input } = await render();

    input.value = 'me@example.com';
    input.dispatchEvent(new Event('input'));
    expect(host.signup().email).toBe('me@example.com');

    host.signupForm.email().value.set('other@example.com');
    await fixture.whenStable();
    expect(input.value).toBe('other@example.com');
  });

  it('shows the hint until the invalid field is left, then the error in its place', async () => {
    const { fixture, label, input } = await render();
    expect(label.textContent).toContain('The one you signed up with');
    expect(label.textContent).not.toContain('Enter your email');

    input.dispatchEvent(new Event('blur'));
    await fixture.whenStable();

    const error = label.querySelector(`#${input.getAttribute('aria-describedby')}`);
    expect(error?.textContent).toContain('Enter your email');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(label.textContent).not.toContain('The one you signed up with');
  });

  it('follows the field’s disabled state', async () => {
    const { fixture, host, input } = await render();
    expect(input.disabled).toBe(false);

    host.locked.set(true);
    await fixture.whenStable();

    expect(input.disabled).toBe(true);
  });
});
