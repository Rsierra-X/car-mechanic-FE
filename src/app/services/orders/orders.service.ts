import { Injectable } from '@angular/core';
import {catchError, Observable, of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environment/environment";

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  private apiUrl = `${environment.apiUrl}/ordenes`; // Reemplaza con la URL de tu API de órdenes

  constructor(private http: HttpClient) { }

  getOrders(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError<any[]>('getOrders', []))
      );
  }

  getOrderById(id: number): Observable<any | undefined> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<any>(url)
      .pipe(
        catchError(this.handleError<any>(`getOrderById id=${id}`))
      );
  }

  createOrder(order: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, order)
      .pipe(
        catchError(this.handleError<any>('createOrder'))
      );
  }

  updateOrder(id: number, order: any): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.put<any>(url, order)
      .pipe(
        catchError(this.handleError<any>(`updateOrder id=${id}`))
      );
  }

  updateOrderStatus(id: number, order: any): Observable<any> {
    const url = `${this.apiUrl}/estado/${id}`;
    return this.http.patch<any>(url, order)
      .pipe(
        catchError(this.handleError<any>(`updateOrder id=${id}`))
      );
  }

  deleteOrder(id: number): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete(url)
      .pipe(
        catchError(this.handleError('deleteOrder'))
      );
  }

  /**
   * Manejo de errores para las operaciones HTTP que fallan.
   * Permite que la aplicación continúe.
   * @param operation - nombre de la operación que falló
   * @param result - valor opcional para devolver como resultado del Observable
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`); // Log al console para propósitos de desarrollo

      // Deja que la app siga corriendo regresando un resultado vacío.
      return of(result as T);
    };
  }
}
