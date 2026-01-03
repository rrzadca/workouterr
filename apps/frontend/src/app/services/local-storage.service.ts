import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class LocalStorageService {
    setTheme(isDarkMode: boolean): void {
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }

    getTheme(): string | null {
        return localStorage.getItem('theme') ?? null;
    }

    resetTheme(): void {
        localStorage.removeItem('theme');
    }
}
