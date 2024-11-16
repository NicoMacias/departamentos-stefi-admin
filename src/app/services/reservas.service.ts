import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReservasService {
  private apiUrl = 'https://departamentos-stefi-backend.onrender.com';

  constructor(private http: HttpClient) {}

  obtenerReservas(token: string): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.get(`${this.apiUrl}/reserva/getAll`, { headers });
  }

  registrarReservas(bodyData: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.post(`${this.apiUrl}/reserva/create`, bodyData, {
      headers,
    });
  }

  actualizarReservas(
    id: string,
    bodyData: any,
    token: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.patch(`${this.apiUrl}/reserva/update/${id}`, bodyData, {
      headers,
    });
  }

  eliminarReservas(id: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.delete(`${this.apiUrl}/reserva/delete/${id}`, { headers });
  }
}
