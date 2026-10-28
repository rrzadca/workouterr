import { Component } from '@angular/core';
import { TranslocoDirective } from '@jsverse/transloco';

// The start page; the routines to start from come with the sessions.
@Component({
  imports: [TranslocoDirective],
  selector: 'app-home',
  templateUrl: './home.html',
})
export class Home {}
