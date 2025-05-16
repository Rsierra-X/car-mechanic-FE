import { Injectable } from '@angular/core';
import {environment} from "../../../environment/environment";
import {HttpClient, HttpParams} from "@angular/common/http";
import {Observable} from "rxjs";

export interface Producto {
  ProductoID: number;
  Nombre: string;
  Descripcion: string;
  Cantidad: number;
  PrecioUnitario: number;
  FechaIngreso: Date;
}

@Injectable({
  providedIn: 'root'
})
export class InventarioService {
  private baseUrl = `${environment.apiUrl}/inventario`;
  private baseUrlVehicles = `${environment.apiUrl}/vehiculos-lista`;

  constructor(private http: HttpClient) {}

  getAll(nombre?: string): Observable<Producto[]> {
    return this.http.get<Producto[]>(this.baseUrl);
  }

  getAllVehicles(): Observable<any> {
    return this.http.get<any>(this.baseUrlVehicles);
  }

  getById(id: number): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  create(producto: Partial<Producto>): Observable<Producto> {
    return this.http.post<Producto>(this.baseUrl, producto);
  }

  update(id: number, producto: Partial<Producto>): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/${id}`, producto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  exportPdf(nombre?: string): Observable<Blob> {
    let params = new HttpParams();
    params = params.set('formato', 'pdf');
    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob',
    });
  }

  exportExcel(nombre?: string): Observable<Blob> {
    let params = new HttpParams();
    params = params.set('formato', 'excel'); // Siempre debes pasar formato

    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob',
    });
  }

}
