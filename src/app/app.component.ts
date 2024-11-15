import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { AuthSesionService } from './services/auth-sesion.service';
import { CalendarOptions } from '@fullcalendar/core'; // useful for typechecking
import dayGridPlugin from '@fullcalendar/daygrid';

@Component({
  selector: 'app-root',
  template: `
    <div class="d-flex">
      <app-sidebar *ngIf="authService.isLoggedIn()"></app-sidebar>
      <div *ngIf="!authService.isLoggedIn()" class="flex-grow-1">
        <router-outlet></router-outlet>
      </div>
      <div *ngIf="authService.isLoggedIn()" class="content flex-grow-1 p-3">
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  constructor(public authService: AuthSesionService) {}
  title = 'stefi-admin';
}
