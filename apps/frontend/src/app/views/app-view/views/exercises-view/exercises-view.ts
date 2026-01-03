import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import {
    Exercise,
    ExerciseApiService,
} from 'src/app/services/api-services/exercise-api.service';
import { Tooltip } from 'primeng/tooltip';
import { DictionaryListPipe } from '@pipes/dictionary-list/dictionary-list-pipe';

@Component({
    selector: 'rr-exercises-view',
    imports: [CardModule, TableModule, Tooltip, DictionaryListPipe],
    templateUrl: './exercises-view.html',
    styles: `
        :host {
            display: block;
            height: 100%;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExercisesView {
    protected isLoading = signal<boolean>(false);
    protected exercises = signal<Exercise[]>([]);

    private readonly destroyRef = inject(DestroyRef);
    private readonly exercisesApiService = inject(ExerciseApiService);

    constructor() {
        this.fetchData();
    }

    private fetchData() {
        this.isLoading.set(true);
        this.exercisesApiService
            .getAll()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (data) => {
                    this.exercises.set(data);
                    this.isLoading.set(false);
                },
                error: () => {
                    this.isLoading.set(false);
                },
            });
    }
}
