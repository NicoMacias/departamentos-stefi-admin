import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthSesionService } from '../../services/auth-sesion.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {
  username: string | null = '';

  constructor(public authService: AuthSesionService, private router: Router) {}

  ngOnInit() {
    this.username = localStorage.getItem('username'); // Obtén el nombre del usuario
  }

  onLogout(): void {
    this.authService.logout(); // Cierra la sesión
    this.router.navigate(['/login']); // Redirige al login
  }
}
