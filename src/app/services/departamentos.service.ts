import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DepartamentosService {
  private apiUrl = 'http://localhost:8000/departamento';

  constructor(private http: HttpClient) {}

  obtenerDepartamentos(): Observable<any> {
    return this.http.get(`${this.apiUrl}/getAll`);
  }

  registrarDepartamento(bodyData: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.post(`${this.apiUrl}/create`, bodyData, { headers });
  }

  actualizarDepartamento(
    id: string,
    bodyData: any,
    token: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.patch(`${this.apiUrl}/update/${id}`, bodyData, {
      headers,
    });
  }

  eliminarDepartamento(id: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.delete(`${this.apiUrl}/delete/${id}`, { headers });
  }
}
