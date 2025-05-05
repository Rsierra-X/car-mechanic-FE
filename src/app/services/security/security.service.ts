import {computed, effect, inject, Injectable, Injector, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, of, tap, throwError} from 'rxjs';
import {environment} from "../../../environment/environment";
import {Router} from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly http = inject(HttpClient);

  private readonly _loginStatus = signal<boolean>(false);
  readonly loginStatus = computed(() => this._loginStatus());

  private readonly tokenKey = 'access_token';

  constructor(private router: Router) {
    const token = this.getToken();
    if (token) this._loginStatus.set(true);
  }

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
    this.router.navigate(['/login']).then(()=>{
      localStorage.removeItem(this.tokenKey);
      this._loginStatus.set(false);
    });
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}
