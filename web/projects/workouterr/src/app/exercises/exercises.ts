import { httpResource } from '@angular/common/http';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { TranslocoDirective, TranslocoService } from '@jsverse/transloco';
import { RadBadge } from '@rrzadca/radinf-ui/badge';
import { RadButton } from '@rrzadca/radinf-ui/button';
import { RadFormInputCheckbox } from '@rrzadca/radinf-ui/form-inputs/form-input-checkbox';
import { RadFormInputRadio, RadFormInputRadioGroup } from '@rrzadca/radinf-ui/form-inputs/form-input-radio';
import { RadFormInputText } from '@rrzadca/radinf-ui/form-inputs/form-input-text';
import { RadSpinner } from '@rrzadca/radinf-ui/spinner';
import { type ExerciseResponse, ListExercisesResponse, MuscleGroup } from '@workouterr/api-client';
import { formatDecimal, formatSeconds } from '../shared/utils/format';
import { ExerciseEditor } from './exercise-editor';

type ExerciseView = 'active' | 'archived';

// What the form beside the list shows: nothing, a new exercise, or the exercise with this ID.
type Selection = { kind: 'none' } | { kind: 'new' } | { kind: 'exercise'; id: string };

// The exercise library (project scope, Exercises): the active or the archived exercises, filtered by name and muscle
// group, with the selected one (or a new one) in the form beside them.
@Component({
  imports: [
    ExerciseEditor,
    RadBadge,
    RadButton,
    RadFormInputCheckbox,
    RadFormInputRadio,
    RadFormInputRadioGroup,
    RadFormInputText,
    RadSpinner,
    TranslocoDirective,
  ],
  selector: 'app-exercises',
  templateUrl: './exercises.html',
})
export class Exercises {
  private readonly transloco = inject(TranslocoService);

  protected readonly views: readonly ExerciseView[] = ['active', 'archived'];
  protected readonly muscleGroupOptions = MuscleGroup.options;

  protected readonly view = signal<ExerciseView>('active');
  protected readonly search = signal('');
  protected readonly muscleGroupFilter = signal<readonly MuscleGroup[]>([]);
  // Switching between active and archived closes the form.
  protected readonly selection = linkedSignal<ExerciseView, Selection>({
    source: this.view,
    computation: () => ({ kind: 'none' }),
  });

  // Every exercise of the view, once: the name and muscle-group filters run here, so tapping a chip needs no request
  // (and works on the gym's weak Wi-Fi). At most 500 per account, so the list is never long.
  protected readonly exercises = httpResource(
    () => ({ url: '/api/exercises', params: { archived: this.view() === 'archived' } }),
    { parse: ListExercisesResponse.parse },
  );
  // An exercise matches when its name contains the search (ignoring case) and it has any of the chosen groups.
  protected readonly shownExercises = computed(() => {
    if (!this.exercises.hasValue()) {
      return [];
    }
    const search = this.search().trim().toLocaleLowerCase();
    const groups = this.muscleGroupFilter();
    return this.exercises
      .value()
      .filter(
        (exercise) =>
          exercise.name.toLocaleLowerCase().includes(search) &&
          (groups.length === 0 || exercise.muscleGroups.some((group) => groups.includes(group))),
      );
  });
  protected readonly selectedExercise = computed(() => {
    const selection = this.selection();
    if (selection.kind !== 'exercise' || !this.exercises.hasValue()) {
      return null;
    }
    return this.exercises.value().find((exercise) => exercise.id === selection.id) ?? null;
  });
  // The form is open for a new exercise, or for a selected one still in the list.
  protected readonly editing = computed(() => {
    const selection = this.selection();
    return selection.kind === 'new' || (selection.kind === 'exercise' && this.selectedExercise() !== null);
  });

  // The radio group's value is untyped; only the two views are offered.
  protected showView(view: unknown) {
    if (view === 'active' || view === 'archived') {
      this.view.set(view);
    }
  }

  protected retry() {
    this.exercises.reload();
  }

  protected toggleMuscleGroupFilter(group: MuscleGroup, checked: boolean) {
    this.muscleGroupFilter.update((groups) =>
      checked
        ? this.muscleGroupOptions.filter((option) => option === group || groups.includes(option))
        : groups.filter((option) => option !== group),
    );
  }

  protected select(exercise: ExerciseResponse) {
    this.selection.set({ kind: 'exercise', id: exercise.id });
  }

  protected startNew() {
    this.selection.set({ kind: 'new' });
  }

  // The API's answer to a save, archive or restore. It stays in the list (by name, like the API's order) while it
  // belongs to this view; archived from the active list, or restored from the archive, it leaves, and the form closes.
  protected onChanged(changed: ExerciseResponse) {
    const belongsHere = changed.isArchived === (this.view() === 'archived');
    this.exercises.update((exercises) => {
      const others = (exercises ?? []).filter((exercise) => exercise.id !== changed.id);
      return belongsHere ? [...others, changed].sort(byName) : others;
    });
    this.selection.set(belongsHere ? { kind: 'exercise', id: changed.id } : { kind: 'none' });
  }

  // The step the +/- buttons use, as the list shows it: `2.5 kg`, `1 rep`, `45 s`.
  protected stepLabel(exercise: ExerciseResponse) {
    switch (exercise.metrics) {
      case 'WEIGHT_REPS':
        return this.transloco.translate('exercises.weightStepValue', {
          step: formatDecimal(exercise.weightStep ?? 0, this.transloco.getActiveLang()),
        });
      case 'TIME':
        return formatSeconds(exercise.timeStepSeconds ?? 0);
      case 'REPS':
        return this.transloco.translate('exercises.repsStepValue');
    }
  }
}

function byName(first: ExerciseResponse, second: ExerciseResponse) {
  return first.name.localeCompare(second.name);
}
