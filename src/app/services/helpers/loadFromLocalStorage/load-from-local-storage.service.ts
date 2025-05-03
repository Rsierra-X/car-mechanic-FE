import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadFromLocalStorageService {

  constructor() { }

  loadFromLocalStorage(key: string): any {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  saveToLocalStorage(key: string, value: any) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}
