import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AuthSesionService } from '../services/auth-sesion.service'; // Ajusta la ruta si es necesario
import { Router } from '@angular/router';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: AuthSesionService, private router: Router) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    // Lista de rutas que no necesitan verificación de token
    const excludedRoutes = ['/login']; // Ajusta según tus rutas

    // Si la solicitud es para una de las rutas excluidas, no verificamos el token
    if (excludedRoutes.some((route) => request.url.includes(route))) {
      return next.handle(request);
    }

    // Verificar si el token está expirado
    if (this.authService.isTokenExpired()) {
      this.authService.clearToken();
      this.router.navigate(['/login']);
      return throwError(() => new Error('Token expirado'));
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el servidor retorna un 401, es posible que el token haya expirado
        if (error.status === 401) {
          this.authService.clearToken();
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}
