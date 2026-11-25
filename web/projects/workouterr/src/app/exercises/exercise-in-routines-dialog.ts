import { Component, inject } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';
import { RadBadge } from '@rrzadca/radinf-ui/badge';
import { RadButton } from '@rrzadca/radinf-ui/button';
import { RAD_DIALOG_DATA, RadDialogFooter, RadDialogRef, RadDialogTitle } from '@rrzadca/radinf-ui/dialog';
import type { RoutineReference } from '@workouterr/api-client';

export interface ExerciseInRoutinesDialogData {
  readonly exerciseName: string;
  readonly routines: readonly RoutineReference[];
}

// The `aria-describedby` target the editor passes when it opens this dialog, so screen readers read the message (and
// the routines) after the title.
export const exerciseInRoutinesDescriptionId = 'exercise-in-routines-description';

// Why an exercise can't be archived: the API's 409 lists the active routines it is in, which the owner removes it
// from first (project scope, Exercises).
@Component({
  imports: [RadBadge, RadButton, RadDialogFooter, RadDialogTitle, TranslocoDirective],
  selector: 'app-exercise-in-routines-dialog',
  templateUrl: './exercise-in-routines-dialog.html',
})
export class ExerciseInRoutinesDialog {
  private readonly dialogRef = inject(RadDialogRef);

  protected readonly data = inject<ExerciseInRoutinesDialogData>(RAD_DIALOG_DATA);
  protected readonly descriptionId = exerciseInRoutinesDescriptionId;

  protected close() {
    this.dialogRef.close();
  }
}
