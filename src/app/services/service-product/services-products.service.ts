import { Injectable } from '@angular/core';
import {environment} from "../../../environment/environment";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";

const API_URL = `${environment.apiUrl}/servicio`;
@Injectable({
  providedIn: 'root'
})
export class ServicesProductsService {

  constructor(private http: HttpClient) {}

  getAll(): Observable<any[]> {
    return this.http.get<any[]>(API_URL);
  }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/${id}`);
  }

  create(data: any): Observable<any> {
    return this.http.post<any>(API_URL, data);
  }

  update(id: number, data: any): Observable<any> {
    return this.http.patch<any>(`${API_URL}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
