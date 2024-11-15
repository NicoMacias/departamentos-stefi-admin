import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  private apiUrl =
    'https://departamentos-stefi-backend.onrender.com' + '/usuario'; // Cambia la URL según tu API

  constructor(private http: HttpClient) {}

  obtenerUsuarios(token: string): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.get(`${this.apiUrl}/getAll`, { headers });
  }

  registrarUsuario(bodyData: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.post(`${this.apiUrl}/create`, bodyData, { headers });
  }

  // Método para actualizar un usuario
  actualizarUsuario(id: string, bodyData: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.patch(`${this.apiUrl}/update/${id}`, bodyData, {
      headers,
    });
  }

  // Método para eliminar un usuario
  eliminarUsuario(id: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.delete(`${this.apiUrl}/delete/${id}`, { headers });
  }
}
