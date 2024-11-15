import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReservasService {
  private apiUrl = 'http://localhost:8000/reserva';

  constructor(private http: HttpClient) {}

  obtenerReservas(token: string): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.get(`${this.apiUrl}/getAll`, { headers });
  }

  registrarReservas(bodyData: any, token: string): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.post(`${this.apiUrl}/create`, bodyData, { headers });
  }

  actualizarReservas(
    id: string,
    bodyData: any,
    token: string
  ): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.patch(`${this.apiUrl}/update/${id}`, bodyData, {
      headers,
    });
  }

  eliminarReservas(id: string, token: string): Observable<any> {
    const headers = new HttpHeaders().set('authorization', token);
    return this.http.delete(`${this.apiUrl}/delete/${id}`, { headers });
  }
}
