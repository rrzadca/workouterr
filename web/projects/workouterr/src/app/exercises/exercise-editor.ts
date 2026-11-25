import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, computed, effect, inject, input, linkedSignal, output, signal, untracked } from '@angular/core';
import { applyWhen, form, FormField, FormRoot, validateStandardSchema } from '@angular/forms/signals';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { RadButton } from '@rrzadca/radinf-ui/button';
import { RadCard, RadCardHeader } from '@rrzadca/radinf-ui/card';
import { RadDialog } from '@rrzadca/radinf-ui/dialog';
import { RadFormField } from '@rrzadca/radinf-ui/form-field';
import { RadFormInputCheckbox } from '@rrzadca/radinf-ui/form-inputs/form-input-checkbox';
import { RadFormInputRadio, RadFormInputRadioGroup } from '@rrzadca/radinf-ui/form-inputs/form-input-radio';
import { RadFormInputSwitch } from '@rrzadca/radinf-ui/form-inputs/form-input-switch';
import { RadFormInputText } from '@rrzadca/radinf-ui/form-inputs/form-input-text';
import { RadFormInputTextarea } from '@rrzadca/radinf-ui/form-inputs/form-input-textarea';
import { RadIcon } from '@rrzadca/radinf-ui/icon';
import { RadToast } from '@rrzadca/radinf-ui/toast';
import {
  ExerciseInRoutinesProblem,
  ExerciseRequest,
  exerciseRequestDescriptionMax,
  exerciseRequestNameMax,
  exerciseRequestTimeStepSecondsMax,
  exerciseRequestWeightStepMax,
  exerciseRequestWeightStepMin,
  type ExerciseResponse,
  MuscleGroup,
  TrackedMetrics,
} from '@workouterr/api-client';
import * as zod from 'zod';
import { requestErrorKind } from '../api/request-error';
import { formatDecimal, parseDecimal, parseWholeNumber } from '../shared/utils/format';
import { ExerciseApi } from './exercise-api';
import {
  ExerciseInRoutinesDialog,
  type ExerciseInRoutinesDialogData,
  exerciseInRoutinesDescriptionId,
} from './exercise-in-routines-dialog';

// What the form edits: the request's fields, with the steps as the text typed into them, so "1,25" or a half-typed
// value stays as it is until it is sent. Both steps are kept while the metrics change, and only the one the metrics
// use is checked and sent.
interface ExerciseDraft {
  name: string;
  description: string;
  metrics: TrackedMetrics;
  weightStep: string;
  timeStepSeconds: string;
  perSide: boolean;
  muscleGroups: MuscleGroup[];
}

// The request's own field schemas, applied to what will be sent: the texts trimmed (the API trims them too, and the
// limit counts the text as sent), the steps parsed. So the form and the API refuse the same values. A string schema
// that checks the sent value, rather than a transform, because Signal Forms wants a schema of the field's own type.
const requestFields = ExerciseRequest.shape;
function sentAs(convert: (text: string) => unknown, requestField: zod.ZodType) {
  return zod.string().superRefine((text, context) => {
    for (const issue of requestField.safeParse(convert(text)).error?.issues ?? []) {
      context.addIssue({ code: 'custom', message: issue.message });
    }
  });
}
const trim = (text: string) => text.trim();
const NameText = sentAs(trim, requestFields.name);
const DescriptionText = sentAs(trim, requestFields.description);
const WeightStepText = sentAs(parseDecimal, requestFields.weightStep.unwrap().unwrap());
const TimeStepText = sentAs(parseWholeNumber, requestFields.timeStepSeconds.unwrap().unwrap());

// A new exercise starts as weight + reps, the most common kind, with the mockup's steps for a barbell and a plank.
const newExerciseDraft: ExerciseDraft = {
  name: '',
  description: '',
  metrics: 'WEIGHT_REPS',
  weightStep: '2.5',
  timeStepSeconds: '5',
  perSide: false,
  muscleGroups: [],
};

// The form card beside the list: a new exercise when `exercise` is null, else the given one, with archive or restore.
// Every change the API accepts comes out of `changed`, as the API answered it.
@Component({
  imports: [
    FormField,
    FormRoot,
    RadButton,
    RadCard,
    RadCardHeader,
    RadFormField,
    RadFormInputCheckbox,
    RadFormInputRadio,
    RadFormInputRadioGroup,
    RadFormInputSwitch,
    RadFormInputText,
    RadFormInputTextarea,
    RadIcon,
    TranslocoDirective,
  ],
  selector: 'app-exercise-editor',
  templateUrl: './exercise-editor.html',
})
export class ExerciseEditor {
  private readonly dialog = inject(RadDialog);
  private readonly exerciseApi = inject(ExerciseApi);
  private readonly toast = inject(RadToast);
  private readonly transloco = inject(TranslocoService);

  readonly exercise = input.required<ExerciseResponse | null>();
  readonly changed = output<ExerciseResponse>();

  protected readonly metricOptions = TrackedMetrics.options;
  protected readonly muscleGroupOptions = MuscleGroup.options;
  // For the messages: the contract's limits, so the text never repeats a number.
  protected readonly limits = {
    nameMax: exerciseRequestNameMax,
    descriptionMax: exerciseRequestDescriptionMax,
    timeStepMax: exerciseRequestTimeStepSecondsMax,
  };

  // Starts again from the exercise whenever another one (or the API's answer to a save) comes in.
  protected readonly draft = linkedSignal<ExerciseDraft>(() => draftFrom(this.exercise()));
  protected readonly exerciseForm = form(
    this.draft,
    (draft) => {
      validateStandardSchema(draft.name, NameText);
      validateStandardSchema(draft.description, DescriptionText);
      validateStandardSchema(draft.muscleGroups, requestFields.muscleGroups);
      applyWhen(
        draft,
        ({ value }) => value().metrics === 'WEIGHT_REPS',
        (path) => {
          validateStandardSchema(path.weightStep, WeightStepText);
        },
      );
      applyWhen(
        draft,
        ({ value }) => value().metrics === 'TIME',
        (path) => {
          validateStandardSchema(path.timeStepSeconds, TimeStepText);
        },
      );
    },
    { submission: { action: () => this.save() } },
  );

  // One message per field, shown once the field is touched (submitting touches them all).
  protected readonly nameErrorKey = computed(() => {
    const name = this.exerciseForm.name();
    if (!name.touched() || !name.invalid()) {
      return null;
    }
    return name.value().trim() === '' ? 'exercises.nameRequired' : 'exercises.nameTooLong';
  });
  protected readonly descriptionErrorKey = computed(() =>
    shownError(this.exerciseForm.description(), 'exercises.descriptionTooLong'),
  );
  protected readonly weightStepErrorKey = computed(() =>
    shownError(this.exerciseForm.weightStep(), 'exercises.weightStepInvalid'),
  );
  protected readonly timeStepErrorKey = computed(() =>
    shownError(this.exerciseForm.timeStepSeconds(), 'exercises.timeStepInvalid'),
  );
  protected readonly muscleGroupsErrorKey = computed(() =>
    shownError(this.exerciseForm.muscleGroups(), 'exercises.muscleGroupsRequired'),
  );
  // The weight step's limits as the language writes them (0.01 or 0,01).
  protected readonly weightStepLimits = computed(() => {
    const language = this.transloco.getActiveLang();
    return {
      min: formatDecimal(exerciseRequestWeightStepMin, language),
      max: formatDecimal(exerciseRequestWeightStepMax, language),
    };
  });

  // The last request's own error (a key under `exercises.`), cleared by the next one.
  protected readonly requestErrorKey = signal<string | null>(null);
  protected readonly archiving = signal(false);

  constructor() {
    // Another exercise in the form: its fields start untouched, with no message from the previous one.
    effect(() => {
      this.exercise();
      untracked(() => {
        this.exerciseForm().reset();
        this.requestErrorKey.set(null);
      });
    });
  }

  // The chips' stand-in (checkboxes) isn't bound with [formField], so it touches the field itself.
  protected toggleMuscleGroup(group: MuscleGroup, checked: boolean) {
    this.exerciseForm.muscleGroups().markAsTouched();
    this.draft.update((draft) => ({
      ...draft,
      muscleGroups: checked
        ? MuscleGroup.options.filter((option) => option === group || draft.muscleGroups.includes(option))
        : draft.muscleGroups.filter((option) => option !== group),
    }));
  }

  protected async archive() {
    const exercise = this.exercise();
    if (!exercise) {
      return;
    }
    await this.runAction(async () => {
      try {
        this.changed.emit(await this.exerciseApi.archive(exercise.id));
        this.toast.show(this.transloco.translate('exercises.archived'), { variant: 'neutral' });
      } catch (error) {
        const routines = routinesBlockingArchive(error);
        if (!routines) {
          throw error;
        }
        this.dialog.open<void, ExerciseInRoutinesDialogData>(ExerciseInRoutinesDialog, {
          data: { exerciseName: exercise.name, routines },
          role: 'alertdialog',
          ariaDescribedby: exerciseInRoutinesDescriptionId,
        });
      }
    });
  }

  protected async restore() {
    const exercise = this.exercise();
    if (!exercise) {
      return;
    }
    await this.runAction(async () => {
      this.changed.emit(await this.exerciseApi.restore(exercise.id));
      this.toast.show(this.transloco.translate('exercises.restored'), { variant: 'success' });
    });
  }

  // Runs only when the form is valid.
  private async save() {
    const exercise = this.exercise();
    const request = requestFrom(this.draft());
    this.requestErrorKey.set(null);
    try {
      const saved = exercise
        ? await this.exerciseApi.update(exercise.id, request)
        : await this.exerciseApi.create(request);
      this.changed.emit(saved);
      this.toast.show(this.transloco.translate('exercises.saved'), { variant: 'success' });
    } catch (error) {
      // Only a create answers 409 for the account's exercise limit.
      const limitReached = !exercise && isStatus(error, HttpStatusCode.Conflict);
      this.requestErrorKey.set(limitReached ? 'exercises.limitReached' : errorKey(error));
    }
    return undefined;
  }

  // Archive and restore: one at a time, with the failure shown under the buttons.
  private async runAction(action: () => Promise<void>) {
    this.requestErrorKey.set(null);
    this.archiving.set(true);
    try {
      await action();
    } catch (error) {
      this.requestErrorKey.set(errorKey(error));
    } finally {
      this.archiving.set(false);
    }
  }
}

function draftFrom(exercise: ExerciseResponse | null): ExerciseDraft {
  if (!exercise) {
    return { ...newExerciseDraft, muscleGroups: [] };
  }
  return {
    name: exercise.name,
    description: exercise.description ?? '',
    metrics: exercise.metrics,
    // The steps of the other metrics stay at the defaults, ready if the metrics change.
    weightStep: exercise.weightStep === null ? newExerciseDraft.weightStep : String(exercise.weightStep),
    timeStepSeconds:
      exercise.timeStepSeconds === null ? newExerciseDraft.timeStepSeconds : String(exercise.timeStepSeconds),
    perSide: exercise.perSide,
    muscleGroups: [...exercise.muscleGroups],
  };
}

// What is sent: trimmed texts (an empty description is none), and only the step the metrics use.
function requestFrom(draft: ExerciseDraft): ExerciseRequest {
  const description = draft.description.trim();
  return {
    name: draft.name.trim(),
    description: description === '' ? null : description,
    metrics: draft.metrics,
    weightStep: draft.metrics === 'WEIGHT_REPS' ? parseDecimal(draft.weightStep) : null,
    timeStepSeconds: draft.metrics === 'TIME' ? parseWholeNumber(draft.timeStepSeconds) : null,
    perSide: draft.perSide,
    muscleGroups: draft.muscleGroups,
  };
}

function shownError(field: { touched(): boolean; invalid(): boolean }, key: string) {
  return field.touched() && field.invalid() ? key : null;
}

// The routines from the archive's 409, or null for any other failure.
function routinesBlockingArchive(error: unknown) {
  if (!isStatus(error, HttpStatusCode.Conflict)) {
    return null;
  }
  const problem = ExerciseInRoutinesProblem.safeParse(error.error);
  return problem.success ? problem.data.routines : null;
}

function isStatus(error: unknown, status: HttpStatusCode): error is HttpErrorResponse {
  return error instanceof HttpErrorResponse && error.status === status;
}

// A request's failure as a key under `exercises.`: the 404 every call on an exercise can answer, then the ones every
// request has. A 409 means something different per call, so the caller checks it first.
function errorKey(error: unknown) {
  if (isStatus(error, HttpStatusCode.NotFound)) {
    return 'exercises.notFound';
  }
  const kind = requestErrorKind(error);
  return kind ? `exercises.${kind}` : null;
}
