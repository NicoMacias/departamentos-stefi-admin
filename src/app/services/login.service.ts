import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private apiUrl = 'https://departamentos-stefi-backend.onrender.com';

  constructor(private http: HttpClient) {}

  login(bodyData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, bodyData).pipe(
      tap((response: any) => {
        if (response.status) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('username', response.nombre); // Guarda el nombre del usuario
        }
      })
    );
  }
}
