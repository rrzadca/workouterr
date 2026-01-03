import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AppLayout } from './components/app-layout/app-layout';
import { AppSidebar } from './components/app-sidebar/app-sidebar';
import { AppTopbar } from './components/app-topbar/app-topbar';
import { AppFooter } from './components/app-footer/app-footer';

@Component({
    selector: 'app-app-view',
    imports: [RouterModule, AppLayout, AppSidebar, AppTopbar, AppFooter],
    templateUrl: './app-view.html',
    styles: `
        :host {
            display: block;
        }
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppView {}
