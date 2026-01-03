import { patchState, signalStore, withHooks, withMethods } from '@ngrx/signals';
import {
    EntityId,
    addEntity,
    removeEntity,
    setAllEntities,
    updateEntity,
    withEntities,
} from '@ngrx/signals/entities';
import { Observable, of } from 'rxjs';
import { debounceTime } from 'rxjs/internal/operators/debounceTime';

export const API_RESPONSE_DELAY_MS = 500;

export const getStore = <ENTITY extends { id: EntityId }, DETAILS>(
    initialState: ENTITY[],
    entityToDetails: (entity: ENTITY) => DETAILS,
) =>
    signalStore(
        { providedIn: 'root' },
        withEntities<ENTITY>(),
        withMethods((store) => ({
            list: (): Observable<DETAILS[]> =>
                of(store.entities().map((item) => entityToDetails(item))).pipe(
                    debounceTime(API_RESPONSE_DELAY_MS),
                ),
            get: (id: EntityId): Observable<DETAILS | undefined> => {
                const entity = store.entities().find((item) => item.id === id);
                if (!entity) {
                    return of(undefined).pipe(
                        debounceTime(API_RESPONSE_DELAY_MS),
                    );
                }
                return of(entityToDetails(entity)).pipe(
                    debounceTime(API_RESPONSE_DELAY_MS),
                );
            },
            create: (saveDto: ENTITY): Observable<DETAILS | undefined> => {
                patchState(store, addEntity(saveDto));

                const entity = store
                    .entities()
                    .find((item) => item.id === saveDto.id);
                if (!entity) {
                    return of(undefined).pipe(
                        debounceTime(API_RESPONSE_DELAY_MS),
                    );
                }
                return of(entityToDetails(entity)).pipe(
                    debounceTime(API_RESPONSE_DELAY_MS),
                );
            },
            update: (
                id: EntityId,
                saveDto: ENTITY,
            ): Observable<DETAILS | undefined> => {
                patchState(store, updateEntity({ id, changes: saveDto }));

                const entity = store.entities().find((item) => item.id === id);
                if (!entity) {
                    return of(undefined).pipe(
                        debounceTime(API_RESPONSE_DELAY_MS),
                    );
                }
                return of(entityToDetails(entity)).pipe(
                    debounceTime(API_RESPONSE_DELAY_MS),
                );
            },
            remove: (id: EntityId): Observable<void> => {
                patchState(store, removeEntity(id));
                return of(void 0).pipe(debounceTime(API_RESPONSE_DELAY_MS));
            },
        })),
        withHooks({
            onInit(store) {
                patchState(store, setAllEntities(initialState));
            },
        }),
    );
