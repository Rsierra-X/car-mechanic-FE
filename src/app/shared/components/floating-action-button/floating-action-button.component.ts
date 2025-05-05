import { Component } from '@angular/core';
import {Router, RouterModule} from '@angular/router';

@Component({
  selector: 'app-floating-action-button',
  standalone: true,
  imports: [RouterModule],
  template: `
    @if (!getRoute) {
      <button
        class="fixed bottom-6 right-6 bg-green-500 text-white w-14 h-14 rounded-full shadow-lg hover:bg-green-600 transition"
        (click)="navigateToNewOrder()"
        tooltip="Nueva Orden"
      >
        +
      </button>
    }
  `,
})
export class FloatingActionButtonComponent {
  constructor(private router: Router) {}

  get getRoute(): boolean {
    return this.router.url === '/orders/create';
  }

  navigateToNewOrder() {
    this.router.navigate(['/orders/create']).then();
  }
}
