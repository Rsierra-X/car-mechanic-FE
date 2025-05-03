import {computed, effect, Injectable, Injector, signal} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {of, throwError} from 'rxjs';
import {LoadFromLocalStorageService} from '../helpers/loadFromLocalStorage/load-from-local-storage.service';

const loadLoginFromLocalStorage = (): boolean => {
  const value = localStorage.getItem('loginStatus');
  return value ? JSON.parse(value) : false;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  private _loginStatus = signal<boolean>(loadLoginFromLocalStorage());
  readonly loginStatus = computed(() => this._loginStatus());

  constructor(private localStorageService: LoadFromLocalStorageService) {}

  validateLogin(username: string, password: string) {
    if ((username || password) && username === 'Admin' && password === 'admin') {
      this.localStorageService.saveToLocalStorage('loginStatus', true);
      this._loginStatus.set(true); // <- ACTUALIZAS EL SIGNAL
      return of(true);
    }
    return throwError(() => new Error('Credenciales incorrectas'));
  }

  logout() {
    this.localStorageService.saveToLocalStorage('loginStatus', false);
    this._loginStatus.set(false);
  }
}
