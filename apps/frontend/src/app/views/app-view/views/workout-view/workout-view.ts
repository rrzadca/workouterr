import {
    ChangeDetectionStrategy,
    Component,
    DestroyRef,
    inject,
    signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    Workout,
    WorkoutApiService,
} from '@services/api-services/workout-api.service';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'rr-workout-view',
    imports: [CardModule, TableModule, TooltipModule],
    templateUrl: './workout-view.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkoutView {
    protected isLoading = signal<boolean>(false);
    protected workouts = signal<Workout[]>([]);

    private readonly destroyRef = inject(DestroyRef);
    private readonly workoutApiService = inject(WorkoutApiService);

    constructor() {
        this.fetchData();
    }

    private fetchData() {
        this.isLoading.set(true);
        this.workoutApiService
            .getAll()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
                next: (data) => {
                    this.workouts.set(data);
                    this.isLoading.set(false);
                },
                error: () => {
                    this.isLoading.set(false);
                },
            });
    }
}
