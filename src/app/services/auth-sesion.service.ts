import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthSesionService {
  constructor() {}

  isLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  logout(): void {
    localStorage.removeItem('token'); // Elimina el token del localStorage
    localStorage.removeItem('username');
  }

  // Obtener el token desde localStorage
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Verificar si el token ha expirado
  isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) {
      return true;
    }

    const expiry = JSON.parse(atob(token.split('.')[1])).exp;
    const now = Math.floor(new Date().getTime() / 1000);
    return now > expiry;
  }

  // Eliminar el token
  clearToken(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
  }
}
