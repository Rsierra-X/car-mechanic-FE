import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {environment} from "../../../environment/environment";

export interface Cliente {
  ClienteID: number;
  Nombre: string;
  Apellido?: string;
  Direccion?: string;
  Telefono?: string;
  CorreoElectronico?: string;
  FechaRegistro: string;
}

export interface CreateClienteDto extends Omit<Cliente, 'ClienteID' | 'FechaRegistro'> {}

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}/clientes`;

  getAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  create(data: CreateClienteDto): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, data);
  }

  update(id: number, data: Partial<CreateClienteDto>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
