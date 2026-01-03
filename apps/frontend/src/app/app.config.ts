import {
    ApplicationConfig,
    provideBrowserGlobalErrorListeners,
    provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const AppPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: 'var(--color-primary-50)',
            100: 'var(--color-primary-100)',
            200: 'var(--color-primary-200)',
            300: 'var(--color-primary-300)',
            400: 'var(--color-primary-400)',
            500: 'var(--color-primary-500)',
            600: 'var(--color-primary-600)',
            700: 'var(--color-primary-700)',
            800: 'var(--color-primary-800)',
            900: 'var(--color-primary-900)',
        },
        surface: {
            50: 'var(--color-surface-50)',
            100: 'var(--color-surface-100)',
            200: 'var(--color-surface-200)',
            300: 'var(--color-surface-300)',
            400: 'var(--color-surface-400)',
            500: 'var(--color-surface-500)',
            600: 'var(--color-surface-600)',
            700: 'var(--color-surface-700)',
            800: 'var(--color-surface-800)',
            900: 'var(--color-surface-900)',
            950: 'var(--color-surface-950)',
        },
    },
    components: {
        accordion: {
            header: {
                background: 'none',
                activeBackground: 'none',
                hoverBackground: 'none',
                activeHoverBackground: 'none',
            },
            content: {
                background: 'none',
            },
        },
        card: {
            colorScheme: {
                dark: {
                    root: {
                        background: 'var(--color-surface-600)',
                    },
                },
                light: {
                    root: {
                        background: 'var(--color-primary-200)',
                    },
                },
            },
        },
        datatable: {
            colorScheme: {
                dark: {
                    headerCell: {
                        background: 'none',
                        color: 'var(--p-stone-400)',
                    },
                    row: {
                        background: 'none',
                        color: 'var(--p-stone-300)',
                    },
                },
                light: {
                    headerCell: {
                        background: 'none',
                        color: 'var(--p-stone-700)',
                    },
                    row: {
                        background: 'none',
                        color: 'var(--p-stone-600)',
                    },
                },
            },
        },
        menu: {
            root: {
                background: 'none',
                borderColor: 'none',
            },
        },
        tabs: {
            tablist: {
                background: 'none',
            },
            tabpanel: {
                background: 'none',
            },
            tab: {
                background: 'none',
            },
        },
    },
});

export const appConfig: ApplicationConfig = {
    providers: [
        provideBrowserGlobalErrorListeners(),
        provideRouter(routes),
        provideZonelessChangeDetection(),
        providePrimeNG({
            theme: {
                preset: AppPreset,
                options: {
                    darkModeSelector: '.dark',
                    cssLayer: {
                        name: 'primeng',
                        order: 'theme, base, primeng',
                    },
                },
            },
            ripple: true,
        }),
    ],
};
