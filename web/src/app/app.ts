import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { muscleGroupSchema, type MuscleGroup } from '@workouterr/shared';

@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly muscleGroups: readonly MuscleGroup[] = muscleGroupSchema.options;
}
