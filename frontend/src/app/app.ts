import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastHostComponent } from './core/layout/toast-host/toast-host.component';
import { DialogHostComponent } from './core/layout/dialog-host/dialog-host.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastHostComponent, DialogHostComponent],
  template: `
    <router-outlet></router-outlet>
    <app-toast-host></app-toast-host>
    <app-dialog-host></app-dialog-host>
  `
})
export class AppComponent {
  title = 'alpay';
}
