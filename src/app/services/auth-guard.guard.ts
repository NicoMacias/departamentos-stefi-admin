// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSesionService } from './auth-sesion.service'; // Asegúrate de que la ruta sea correcta

export const AuthGuard: CanActivateFn = () => {
  const authService = inject(AuthSesionService); // Inyección del servicio
  const router = inject(Router); // Inyección del router

  if (authService.isLoggedIn()) {
    return true; // Permitir acceso
  } else {
    router.navigate(['/login']); // Redirigir a login si no está autenticado
    return false; // Bloquear acceso
  }
};
