import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

// The login page or the shell, by route (app.routes.ts).
@Component({
  imports: [RouterOutlet],
  selector: 'app-root',
  templateUrl: './app.html',
})
export class App {}
