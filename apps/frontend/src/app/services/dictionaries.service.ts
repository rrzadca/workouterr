import { Injectable } from '@angular/core';

export interface DictionaryItem {
    id: string;
    name: string;
}

@Injectable({
    providedIn: 'root',
})
export class DictionariesService {
    getExerciseTargets(): DictionaryItem[] {
        return [
            { id: 'chest', name: 'Klatka piersiowa' },
            { id: 'back', name: 'Plecy' },
            { id: 'legs', name: 'Nogi' },
            { id: 'shoulders', name: 'Barki' },
            { id: 'arms', name: 'Ramiona' },
            { id: 'core', name: 'Core' },
        ];
    }

    getExerciseMeasurementUnits(): DictionaryItem[] {
        return [
            { id: 'repetitions', name: 'Powtórzenia' },
            { id: 'time', name: 'Czas' },
        ];
    }

    getWorkoutTypes(): DictionaryItem[] {
        return [
            { id: 'fbw', name: 'FBW' },
            { id: 'pp', name: 'Push-Pull' },
            { id: 'split', name: 'Split' },
            { id: 'run', name: 'Bieganie' },
            { id: 'bike', name: 'Rower' },
        ];
    }
}
