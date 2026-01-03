import { effect, inject, Injectable, Signal } from '@angular/core';
import { patchState, SignalState, signalState } from '@ngrx/signals';
import { LocalStorageService } from './local-storage.service';

export interface LayoutState {
    isDarkMode: boolean;
    isSidebarOpened: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class LayoutStateService {
    private layoutState = signalState<LayoutState>({
        isDarkMode: false,
        isSidebarOpened: true,
    });

    private readonly localStorageService = inject(LocalStorageService);

    constructor() {
        effect(() => {
            const isDarkMode = this.layoutState().isDarkMode;
            document.documentElement.classList.toggle('dark', isDarkMode);
        });

        this.setTheme();
    }

    toggleDarkMode(): void {
        patchState(this.layoutState, {
            isDarkMode: !this.layoutState().isDarkMode,
        });
        this.localStorageService.setTheme(this.layoutState().isDarkMode);
    }

    toggleSidebar(): void {
        patchState(this.layoutState, {
            isSidebarOpened: !this.layoutState().isSidebarOpened,
        });
    }

    closeSidebar(): void {
        patchState(this.layoutState, {
            isSidebarOpened: false,
        });
    }

    openSidebar(): void {
        patchState(this.layoutState, {
            isSidebarOpened: true,
        });
    }

    getLayoutState(): SignalState<LayoutState> {
        return this.layoutState;
    }

    private setTheme(): void {
        const savedTheme = this.localStorageService.getTheme();

        const isDarkMode =
            savedTheme === 'dark' ||
            (savedTheme === null &&
                window.matchMedia('(prefers-color-scheme: dark)').matches);

        patchState(this.layoutState, {
            isDarkMode,
        });
    }
}
