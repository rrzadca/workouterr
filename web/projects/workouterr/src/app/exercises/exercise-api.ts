import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import {
  ArchiveExerciseResponse,
  CreateExerciseResponse,
  type ExerciseRequest,
  RestoreExerciseResponse,
  UpdateExerciseResponse,
} from '@workouterr/api-client';
import { firstValueFrom } from 'rxjs';

// The exercise endpoints that change something; the list is the page's own `httpResource`. Each answers with the
// exercise as the API saved it, checked against the contract, and rejects with the HttpErrorResponse (or the zod
// error for a response the contract doesn't allow).
@Injectable({ providedIn: 'root' })
export class ExerciseApi {
  private readonly http = inject(HttpClient);

  async create(request: ExerciseRequest) {
    return CreateExerciseResponse.parse(await firstValueFrom(this.http.post('/api/exercises', request)));
  }

  async update(id: string, request: ExerciseRequest) {
    return UpdateExerciseResponse.parse(await firstValueFrom(this.http.put(`/api/exercises/${id}`, request)));
  }

  async archive(id: string) {
    return ArchiveExerciseResponse.parse(await firstValueFrom(this.http.post(`/api/exercises/${id}/archive`, null)));
  }

  async restore(id: string) {
    return RestoreExerciseResponse.parse(await firstValueFrom(this.http.post(`/api/exercises/${id}/restore`, null)));
  }
}
