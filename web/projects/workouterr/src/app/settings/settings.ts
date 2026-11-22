import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { form, FormField, FormRoot, validateStandardSchema } from '@angular/forms/signals';
import { TranslocoDirective } from '@jsverse/transloco';
import { RadButton } from '@rrzadca/radinf-ui/button';
import { RadCard, RadCardHeader } from '@rrzadca/radinf-ui/card';
import { RadFormField } from '@rrzadca/radinf-ui/form-field';
import { RadFormInputSwitch } from '@rrzadca/radinf-ui/form-inputs/form-input-switch';
import { RadFormInputText } from '@rrzadca/radinf-ui/form-inputs/form-input-text';
import { RadIcon } from '@rrzadca/radinf-ui/icon';
import { RadSpinner } from '@rrzadca/radinf-ui/spinner';
import { UpdateSettingsBody, updateSettingsRequestDisplayNameMax } from '@workouterr/api-client';
import { AccountSettingsService } from './account-settings';

// The account's settings. So far the profile (display name) and the preferences (rest-timer sound); email, password,
// export and account deletion join later. The theme is the sidebar's sun / moon button, not a setting here.
@Component({
  imports: [
    FormField,
    FormRoot,
    RadButton,
    RadCard,
    RadCardHeader,
    RadFormField,
    RadFormInputSwitch,
    RadFormInputText,
    RadIcon,
    RadSpinner,
    TranslocoDirective,
  ],
  selector: 'app-settings',
  templateUrl: './settings.html',
})
export class Settings {
  private readonly accountSettings = inject(AccountSettingsService);

  protected readonly settings = this.accountSettings.settings;
  // For the "too long" message: the contract's limit, so the text never repeats the number.
  protected readonly displayNameMaxLength = updateSettingsRequestDisplayNameMax;

  // The form starts from the saved name, and starts again from it after each save (the API's trimmed value).
  protected readonly profile = linkedSignal(() => ({
    displayName: this.settings.hasValue() ? (this.settings.value().displayName ?? '') : '',
  }));
  // The limit comes from the contract: UpdateSettingsBody is the zod schema of the API's UpdateSettingsRequest.
  protected readonly profileForm = form(
    this.profile,
    (profile) => validateStandardSchema(profile, UpdateSettingsBody),
    { submission: { action: () => this.saveProfile() } },
  );
  // Too long is the name's only rule: an empty name removes it.
  protected readonly displayNameErrorKey = computed(() => {
    const displayName = this.profileForm.displayName();
    return displayName.touched() && displayName.invalid() ? 'settings.displayNameTooLong' : null;
  });
  // The save's own error, set by `saveProfile()`; editing the name clears it.
  protected readonly profileErrorKey = computed(() => {
    const error = this.profileForm().errors()[0];
    return error ? `settings.${error.kind}` : null;
  });

  // The switch's own copy, so a failed save can flip it back.
  protected readonly restTimerSound = linkedSignal(() =>
    this.settings.hasValue() ? this.settings.value().restTimerSound : true,
  );
  protected readonly restTimerSoundErrorKey = signal<string | null>(null);

  protected retry() {
    this.settings.reload();
  }

  // The switch saves straight away, like the theme button; a failure turns it back and says why.
  protected async saveRestTimerSound(restTimerSound: boolean) {
    this.restTimerSoundErrorKey.set(null);
    try {
      await this.accountSettings.update({ restTimerSound });
    } catch (error) {
      this.restTimerSound.set(!restTimerSound);
      const kind = saveErrorKind(error);
      this.restTimerSoundErrorKey.set(kind ? `settings.${kind}` : null);
    }
  }

  // Runs only when the form is valid. A returned error goes on the form, where `profileErrorKey` shows it.
  private async saveProfile() {
    try {
      await this.accountSettings.update({ displayName: this.profile().displayName });
    } catch (error) {
      const kind = saveErrorKind(error);
      return kind ? { kind } : undefined;
    }
    return undefined;
  }
}

// A save's own errors, each a key under `settings.` in the translations.
type SaveErrorKind = 'unreachable' | 'serverError';

// What a failed save shows. A 401 shows nothing: the login has ended and the login page replaces this one. Nor does a
// 426: the "new version" dialog already covers the page. Anything else (a 400 the form should have caught, a 5xx, a
// response the contract doesn't allow) can only be tried again later.
function saveErrorKind(error: unknown): SaveErrorKind | null {
  if (!(error instanceof HttpErrorResponse)) {
    return 'serverError';
  }
  switch (error.status) {
    case 0:
      return 'unreachable';
    case HttpStatusCode.Unauthorized:
    case HttpStatusCode.UpgradeRequired:
      return null;
    default:
      return 'serverError';
  }
}
