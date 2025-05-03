import {computed, effect, inject, Injectable, Injector, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, of, tap, throwError} from 'rxjs';
import {environment} from "../../../environment/environment";

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly http = inject(HttpClient);

  private readonly _loginStatus = signal<boolean>(this.loadLoginFromLocalStorage());
  readonly loginStatus = computed(() => this._loginStatus());

  private readonly tokenKey = 'access_token';

  login(username: string, password: string) {
    return this.http.post<{ access_token: string }>(`${environment.apiUrl}/auth/login`, {
      NombreUsuario: username,
      Contrasena: password
    }).pipe(
      tap(response => {
        localStorage.setItem(this.tokenKey, response.access_token);
        this._loginStatus.set(true);
      }),
      catchError(err => {
        this._loginStatus.set(false);
        return throwError(() => new Error('Credenciales inválidas'));
      })
    );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this._loginStatus.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private loadLoginFromLocalStorage(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }
}
