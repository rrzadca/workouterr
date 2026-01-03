import { inject, Injectable } from '@angular/core';
import { Exercise } from './exercise-api.service';
import { getStore } from './entity.store';
import { Observable } from 'rxjs/internal/Observable';
import { debounceTime, of } from 'rxjs';
import { DictionaryItem } from '@services/dictionaries.service';

export interface Workout {
    id: string;
    name: string;
    description?: string;
    type: DictionaryItem;
    exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
    id: string;
    exercise: Exercise;
    sets?: number;
    repetitions?: number;
    weightKg?: number;
    durationSeconds?: number;
    restTimeSeconds: number;
}

@Injectable({
    providedIn: 'root',
})
export class WorkoutApiService {
    private readonly store = inject(
        getStore<Workout, Workout>(initialState, entityToDetails),
    );

    getAll(): Observable<Workout[]> {
        return this.store.list();
    }

    get(id: string): Observable<Workout | undefined> {
        return this.store.get(id);
    }

    create(saveDto: Workout): Observable<Workout | undefined> {
        return this.store.create({
            ...saveDto,
        });
    }

    update(id: string, saveDto: Workout): Observable<Workout | undefined> {
        return this.store.update(id, saveDto);
    }

    delete(id: string): Observable<void> {
        return this.store.remove(id);
    }
}

const entityToDetails = (entity: Workout): Workout => {
    return {
        ...entity,
    };
};

// Service store (mocked BE)

const initialState: Workout[] = [
    {
        id: '1',
        name: 'FBW A',
        description: 'Full Body Workout A',
        type: { id: 'fbw', name: 'FBW' },
        exercises: [
            {
                id: '1',
                exercise: {
                    id: '1',
                    name: 'Martwy ciąg klasyczny',
                    description: 'Podstawowe ćwiczenie na plecy i nogi.',
                    targets: [
                        { id: 'back', name: 'Plecy' },
                        { id: 'legs', name: 'Nogi' },
                    ],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 6,
                weightKg: 45,
                sets: 3,
            },
            {
                id: '2',
                exercise: {
                    id: '2',
                    name: 'Ściąganie drążka wyciągu górnego nachwytem szerokim',
                    description: 'Ćwiczenie na górne partie pleców.',
                    targets: [{ id: 'back', name: 'Plecy' }],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 8,
                weightKg: 50,
                sets: 3,
            },
            {
                id: '3',
                exercise: {
                    id: '3',
                    name: 'Wiosłowanie hantlą w opadzie tułowia',
                    description: 'Ćwiczenie na mięśnie pleców i ramion.',
                    targets: [
                        { id: 'back', name: 'Plecy' },
                        { id: 'arms', name: 'Ramiona' },
                    ],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 15,
                weightKg: 10,
                sets: 3,
            },
            {
                id: '4',
                exercise: {
                    id: '4',
                    name: 'Wyciskanie sztangi na ławce poziomej',
                    description: 'Podstawowe ćwiczenie na klatkę piersiową.',
                    targets: [{ id: 'chest', name: 'Klatka piersiowa' }],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 6,
                weightKg: 42.5,
                sets: 3,
            },
            {
                id: '5',
                exercise: {
                    id: '5',
                    name: 'Przenoszenie hantli za głowę na ławce poziomej',
                    description:
                        'Ćwiczenie na klatkę piersiową i mięśnie naramienne.',
                    targets: [
                        { id: 'chest', name: 'Klatka piersiowa' },
                        { id: 'shoulders', name: 'Barki' },
                    ],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 10,
                weightKg: 17.5,
                sets: 3,
            },
            {
                id: '6',
                exercise: {
                    id: '6',
                    name: 'Wyciskanie hantli nad głowę siedząc',
                    description: 'Ćwiczenie na mięśnie naramienne.',
                    targets: [{ id: 'shoulders', name: 'Barki' }],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 12,
                weightKg: 10,
                sets: 3,
            },
            {
                id: '7',
                exercise: {
                    id: '7',
                    name: 'Uginanie ramion ze sztangą łamaną stojąc',
                    description: 'Ćwiczenie na bicepsy.',
                    targets: [{ id: 'arms', name: 'Ramiona' }],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 8,
                weightKg: 17.5,
                sets: 3,
            },
            {
                id: '8',
                exercise: {
                    id: '8',
                    name: 'Prostowanie ramion na wyciągu górnym',
                    description: 'Ćwiczenie na tricepsy.',
                    targets: [{ id: 'arms', name: 'Ramiona' }],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 15,
                weightKg: 22.5,
                sets: 3,
            },
        ],
    },
    {
        id: '2',
        name: 'FBW B',
        description: 'Full Body Workout B',
        type: { id: 'fbw', name: 'FBW' },
        exercises: [
            {
                id: '9',
                exercise: {
                    id: '9',
                    name: 'Ściąganie drążka wyciągu górnego nachwytem neutralnym',
                    description: 'Ćwiczenie na mięśnie pleców.',
                    targets: [{ id: 'back', name: 'Plecy' }],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 6,
                weightKg: 55,
                sets: 3,
            },
            {
                id: '10',
                exercise: {
                    id: '10',
                    name: 'Przyciąganie liny wyciągu górnego do twarzy',
                    description:
                        'Ćwiczenie na mięśnie naramienne i górne partie pleców.',
                    targets: [
                        { id: 'shoulders', name: 'Barki' },
                        { id: 'back', name: 'Plecy' },
                    ],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 15,
                weightKg: 25,
                sets: 3,
            },
            {
                id: '11',
                exercise: {
                    id: '11',
                    name: 'Wyciskanie hantli na ławce skośnej głową w górę',
                    description: 'Ćwiczenie na górne partie klatki piersiowej.',
                    targets: [{ id: 'chest', name: 'Klatka piersiowa' }],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 12,
                weightKg: 17.5,
                sets: 3,
            },
            {
                id: '12',
                exercise: {
                    id: '12',
                    name: 'Rozpiętki na ławce poziomej',
                    description: 'Ćwiczenie na klatkę piersiową.',
                    targets: [{ id: 'chest', name: 'Klatka piersiowa' }],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 15,
                weightKg: 7.5,
                sets: 3,
            },
            {
                id: '13',
                exercise: {
                    id: '13',
                    name: 'Wznosy ramion bokiem stojąc',
                    description: 'Ćwiczenie na mięśnie naramienne.',
                    targets: [{ id: 'shoulders', name: 'Barki' }],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 16,
                weightKg: 2.5,
                sets: 3,
            },
            {
                id: '14',
                exercise: {
                    id: '14',
                    name: 'Naprzemienne uginanie ramion z hantlami stojąc',
                    description: 'Ćwiczenie na bicepsy.',
                    targets: [{ id: 'arms', name: 'Ramiona' }],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 10,
                weightKg: 10,
                sets: 3,
            },
            {
                id: '15',
                exercise: {
                    id: '15',
                    name: 'Wyciskanie francuskie sztangi leżąc na ławce poziomej',
                    description: 'Ćwiczenie na tricepsy.',
                    targets: [{ id: 'arms', name: 'Ramiona' }],
                    measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
                },
                restTimeSeconds: 60,
                repetitions: 15,
                weightKg: 12.5,
                sets: 3,
            },
        ],
    },
];
