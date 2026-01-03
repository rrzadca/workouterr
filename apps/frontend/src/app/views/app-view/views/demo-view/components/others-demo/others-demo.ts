import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Button } from 'primeng/button';
import { Dialog } from 'primeng/dialog';
import { DatePicker } from 'primeng/datepicker';

@Component({
    selector: 'rr-others-demo',
    imports: [Button, Dialog, DatePicker],
    templateUrl: './others-demo.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OthersDemo {
    protected dialogVisible = signal<boolean>(false);

    protected showDialog(): void {
        this.dialogVisible.set(true);
    }

    protected closeDialog(): void {
        this.dialogVisible.set(false);
    }
}
