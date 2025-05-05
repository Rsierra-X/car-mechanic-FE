import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {JwtHelperService} from "@auth0/angular-jwt";
import {environment} from "../../../environment/environment";
import {Observable} from "rxjs";

export interface Usuario {
  UsuarioID: number;
  NombreUsuario: string;
  Contrasena?: string;
  Rol: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly jwtHelper = new JwtHelperService();

  private readonly baseUrl = `${environment.apiUrl}/usuarios`;
  private readonly baseUrlRegister = `${environment.apiUrl}/auth/register`;

  getAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.baseUrl);
  }

  getById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.baseUrl}/${id}`);
  }

  create(usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.post<Usuario>(this.baseUrlRegister, usuario);
  }

  update(id: number, usuario: Partial<Usuario>): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.baseUrl}/${id}`, usuario);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  getCurrentUser(): Usuario | null {
    const token = localStorage.getItem('access_token');
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      const decoded = this.jwtHelper.decodeToken(token);
      return {
        UsuarioID: decoded.sub,
        NombreUsuario: decoded.username,
        Rol: decoded.rol
      } as Usuario;
    }
    return null;
  }
}
