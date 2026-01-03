import { inject, Injectable } from '@angular/core';
import { DictionaryItem } from '../dictionaries.service';
import { Observable } from 'rxjs/internal/Observable';
import { debounceTime, of } from 'rxjs';
import { API_RESPONSE_DELAY_MS, getStore } from './entity.store';

export interface Exercise {
    id: string;
    name: string;
    description: string;
    targets: DictionaryItem[];
    measurementUnit: DictionaryItem;
}

@Injectable({
    providedIn: 'root',
})
export class ExerciseApiService {
    private readonly store = inject(
        getStore<Exercise, Exercise>(initialState, entityToDetails),
    );

    getAll(): Observable<Exercise[]> {
        return this.store.list();
    }

    get(id: string): Observable<Exercise | undefined> {
        return this.store.get(id);
    }

    create(saveDto: Exercise): Observable<Exercise | undefined> {
        return this.store.create({
            ...saveDto,
        });
    }

    update(id: string, saveDto: Exercise): Observable<Exercise | undefined> {
        return this.store.update(id, saveDto);
    }

    delete(id: string): Observable<void> {
        return this.store.remove(id);
    }
}

const entityToDetails = (entity: Exercise): Exercise => {
    return {
        ...entity,
    };
};

// Service store (mocked BE)

const initialState: Exercise[] = [
    {
        id: '1',
        name: 'Martwy ciąg klasyczny',
        description: 'Podstawowe ćwiczenie na plecy i nogi.',
        targets: [
            { id: 'back', name: 'Plecy' },
            { id: 'legs', name: 'Nogi' },
        ],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '2',
        name: 'Ściąganie drążka wyciągu górnego nachwytem szerokim',
        description: 'Ćwiczenie na górne partie pleców.',
        targets: [{ id: 'back', name: 'Plecy' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '3',
        name: 'Wiosłowanie hantlą w opadzie tułowia',
        description: 'Ćwiczenie na mięśnie pleców i ramion.',
        targets: [
            { id: 'back', name: 'Plecy' },
            { id: 'arms', name: 'Ramiona' },
        ],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '4',
        name: 'Wyciskanie sztangi na ławce poziomej',
        description: 'Podstawowe ćwiczenie na klatkę piersiową.',
        targets: [{ id: 'chest', name: 'Klatka piersiowa' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '5',
        name: 'Przenoszenie hantli za głowę na ławce poziomej',
        description: 'Ćwiczenie na klatkę piersiową i mięśnie naramienne.',
        targets: [
            { id: 'chest', name: 'Klatka piersiowa' },
            { id: 'shoulders', name: 'Barki' },
        ],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '6',
        name: 'Wyciskanie hantli nad głowę siedząc',
        description: 'Ćwiczenie na mięśnie naramienne.',
        targets: [{ id: 'shoulders', name: 'Barki' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '7',
        name: 'Uginanie ramion ze sztangą łamaną stojąc',
        description: 'Ćwiczenie na bicepsy.',
        targets: [{ id: 'arms', name: 'Ramiona' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '8',
        name: 'Prostowanie ramion na wyciągu górnym',
        description: 'Ćwiczenie na tricepsy.',
        targets: [{ id: 'arms', name: 'Ramiona' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '9',
        name: 'Ściąganie drążka wyciągu górnego nachwytem neutralnym',
        description: 'Ćwiczenie na mięśnie pleców.',
        targets: [{ id: 'back', name: 'Plecy' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '10',
        name: 'Przyciąganie liny wyciągu górnego do twarzy',
        description: 'Ćwiczenie na mięśnie naramienne i górne partie pleców.',
        targets: [
            { id: 'shoulders', name: 'Barki' },
            { id: 'back', name: 'Plecy' },
        ],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '11',
        name: 'Wyciskanie hantli na ławce skośnej głową w górę',
        description: 'Ćwiczenie na górne partie klatki piersiowej.',
        targets: [{ id: 'chest', name: 'Klatka piersiowa' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '12',
        name: 'Rozpiętki na ławce poziomej',
        description: 'Ćwiczenie na klatkę piersiową.',
        targets: [{ id: 'chest', name: 'Klatka piersiowa' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '13',
        name: 'Wznosy ramion bokiem stojąc',
        description: 'Ćwiczenie na mięśnie naramienne.',
        targets: [{ id: 'shoulders', name: 'Barki' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '14',
        name: 'Naprzemienne uginanie ramion z hantlami stojąc',
        description: 'Ćwiczenie na bicepsy.',
        targets: [{ id: 'arms', name: 'Ramiona' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '15',
        name: 'Wyciskanie francuskie sztangi leżąc na ławce poziomej',
        description: 'Ćwiczenie na tricepsy.',
        targets: [{ id: 'arms', name: 'Ramiona' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a1',
        name: 'Martwy ciąg klasyczny',
        description: 'Podstawowe ćwiczenie na plecy i nogi.',
        targets: [
            { id: 'back', name: 'Plecy' },
            { id: 'legs', name: 'Nogi' },
        ],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a2',
        name: 'Ściąganie drążka wyciągu górnego nachwytem szerokim',
        description: 'Ćwiczenie na górne partie pleców.',
        targets: [{ id: 'back', name: 'Plecy' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a3',
        name: 'Wiosłowanie hantlą w opadzie tułowia',
        description: 'Ćwiczenie na mięśnie pleców i ramion.',
        targets: [
            { id: 'back', name: 'Plecy' },
            { id: 'arms', name: 'Ramiona' },
        ],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a4',
        name: 'Wyciskanie sztangi na ławce poziomej',
        description: 'Podstawowe ćwiczenie na klatkę piersiową.',
        targets: [{ id: 'chest', name: 'Klatka piersiowa' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a5',
        name: 'Przenoszenie hantli za głowę na ławce poziomej',
        description: 'Ćwiczenie na klatkę piersiową i mięśnie naramienne.',
        targets: [
            { id: 'chest', name: 'Klatka piersiowa' },
            { id: 'shoulders', name: 'Barki' },
        ],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a6',
        name: 'Wyciskanie hantli nad głowę siedząc',
        description: 'Ćwiczenie na mięśnie naramienne.',
        targets: [{ id: 'shoulders', name: 'Barki' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a7',
        name: 'Uginanie ramion ze sztangą łamaną stojąc',
        description: 'Ćwiczenie na bicepsy.',
        targets: [{ id: 'arms', name: 'Ramiona' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a8',
        name: 'Prostowanie ramion na wyciągu górnym',
        description: 'Ćwiczenie na tricepsy.',
        targets: [{ id: 'arms', name: 'Ramiona' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a9',
        name: 'Ściąganie drążka wyciągu górnego nachwytem neutralnym',
        description: 'Ćwiczenie na mięśnie pleców.',
        targets: [{ id: 'back', name: 'Plecy' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a10',
        name: 'Przyciąganie liny wyciągu górnego do twarzy',
        description: 'Ćwiczenie na mięśnie naramienne i górne partie pleców.',
        targets: [
            { id: 'shoulders', name: 'Barki' },
            { id: 'back', name: 'Plecy' },
        ],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a11',
        name: 'Wyciskanie hantli na ławce skośnej głową w górę',
        description: 'Ćwiczenie na górne partie klatki piersiowej.',
        targets: [{ id: 'chest', name: 'Klatka piersiowa' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a12',
        name: 'Rozpiętki na ławce poziomej',
        description: 'Ćwiczenie na klatkę piersiową.',
        targets: [{ id: 'chest', name: 'Klatka piersiowa' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a13',
        name: 'Wznosy ramion bokiem stojąc',
        description: 'Ćwiczenie na mięśnie naramienne.',
        targets: [{ id: 'shoulders', name: 'Barki' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '1a4',
        name: 'Naprzemienne uginanie ramion z hantlami stojąc',
        description: 'Ćwiczenie na bicepsy.',
        targets: [{ id: 'arms', name: 'Ramiona' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'a15',
        name: 'Wyciskanie francuskie sztangi leżąc na ławce poziomej',
        description: 'Ćwiczenie na tricepsy.',
        targets: [{ id: 'arms', name: 'Ramiona' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b1',
        name: 'Martwy ciąg klasyczny',
        description: 'Podstawowe ćwiczenie na plecy i nogi.',
        targets: [
            { id: 'back', name: 'Plecy' },
            { id: 'legs', name: 'Nogi' },
        ],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b2',
        name: 'Ściąganie drążka wyciągu górnego nachwytem szerokim',
        description: 'Ćwiczenie na górne partie pleców.',
        targets: [{ id: 'back', name: 'Plecy' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b3',
        name: 'Wiosłowanie hantlą w opadzie tułowia',
        description: 'Ćwiczenie na mięśnie pleców i ramion.',
        targets: [
            { id: 'back', name: 'Plecy' },
            { id: 'arms', name: 'Ramiona' },
        ],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b4',
        name: 'Wyciskanie sztangi na ławce poziomej',
        description: 'Podstawowe ćwiczenie na klatkę piersiową.',
        targets: [{ id: 'chest', name: 'Klatka piersiowa' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b5',
        name: 'Przenoszenie hantli za głowę na ławce poziomej',
        description: 'Ćwiczenie na klatkę piersiową i mięśnie naramienne.',
        targets: [
            { id: 'chest', name: 'Klatka piersiowa' },
            { id: 'shoulders', name: 'Barki' },
        ],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b6',
        name: 'Wyciskanie hantli nad głowę siedząc',
        description: 'Ćwiczenie na mięśnie naramienne.',
        targets: [{ id: 'shoulders', name: 'Barki' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b7',
        name: 'Uginanie ramion ze sztangą łamaną stojąc',
        description: 'Ćwiczenie na bicepsy.',
        targets: [{ id: 'arms', name: 'Ramiona' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b8',
        name: 'Prostowanie ramion na wyciągu górnym',
        description: 'Ćwiczenie na tricepsy.',
        targets: [{ id: 'arms', name: 'Ramiona' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b9',
        name: 'Ściąganie drążka wyciągu górnego nachwytem neutralnym',
        description: 'Ćwiczenie na mięśnie pleców.',
        targets: [{ id: 'back', name: 'Plecy' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b10',
        name: 'Przyciąganie liny wyciągu górnego do twarzy',
        description: 'Ćwiczenie na mięśnie naramienne i górne partie pleców.',
        targets: [
            { id: 'shoulders', name: 'Barki' },
            { id: 'back', name: 'Plecy' },
        ],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b11',
        name: 'Wyciskanie hantli na ławce skośnej głową w górę',
        description: 'Ćwiczenie na górne partie klatki piersiowej.',
        targets: [{ id: 'chest', name: 'Klatka piersiowa' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b12',
        name: 'Rozpiętki na ławce poziomej',
        description: 'Ćwiczenie na klatkę piersiową.',
        targets: [{ id: 'chest', name: 'Klatka piersiowa' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: '1b3',
        name: 'Wznosy ramion bokiem stojąc',
        description: 'Ćwiczenie na mięśnie naramienne.',
        targets: [{ id: 'shoulders', name: 'Barki' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b14',
        name: 'Naprzemienne uginanie ramion z hantlami stojąc',
        description: 'Ćwiczenie na bicepsy.',
        targets: [{ id: 'arms', name: 'Ramiona' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
    {
        id: 'b15',
        name: 'Wyciskanie francuskie sztangi leżąc na ławce poziomej',
        description: 'Ćwiczenie na tricepsy.',
        targets: [{ id: 'arms', name: 'Ramiona' }],
        measurementUnit: { id: 'repetitions', name: 'Powtórzenia' },
    },
];
