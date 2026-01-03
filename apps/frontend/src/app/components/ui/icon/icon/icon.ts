import {
    ChangeDetectionStrategy,
    Component,
    computed,
    input,
} from '@angular/core';
import { FontAwesomeIconName, PrimeIconName } from '../app-icons-lib';
import { IconSize } from '../icon-size';
import { TooltipModule } from 'primeng/tooltip';
import { NgClass, NgStyle } from '@angular/common';

@Component({
    selector: 'rr-icon',
    imports: [TooltipModule, NgClass, NgStyle],
    templateUrl: './icon.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
    name = input.required<FontAwesomeIconName | PrimeIconName>();
    tooltip = input<string>();
    size = input<IconSize>('md');
    clickable = input<boolean>(false);

    cssClasses = computed(() => this.getIconClasses());
    fontSize = computed(() => {
        let fontSize = '';
        switch (this.size()) {
            case 'xxs':
                fontSize = '0.5rem';
                break;
            case 'xs':
                fontSize = '0.75rem';
                break;
            case 'sm':
                fontSize = '1rem';
                break;
            case 'md':
                fontSize = '1.25rem';
                break;
            case 'lg':
                fontSize = '1.5rem';
                break;
            case 'xl':
                fontSize = '1.75rem';
                break;
            case '2xl':
                fontSize = '2rem';
                break;
            case '3xl':
                fontSize = '2.25rem';
                break;
            case '4xl':
                fontSize = '2.5rem';
                break;
            default:
                fontSize = '1.25rem';
                break;
        }

        return { 'font-size': fontSize, 'font-weight': 'light' };
    });

    private getIconClasses(): string {
        const prefix = this.name().startsWith('pi-') ? 'pi' : 'fa-solid';
        const classes = [prefix, this.name()];

        if (this.clickable()) {
            classes.push('cursor-pointer', 'hover:opacity-65');
        }

        return classes.join(' ');
    }
}
