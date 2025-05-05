import { Component } from '@angular/core';
import {Router, RouterLink} from "@angular/router";
import {ButtonComponent} from "../../shared/components/button/button.component";
import {SecurityService} from "../../services/security/security.service";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    RouterLink,
    ButtonComponent
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  constructor(private securityService: SecurityService, private router: Router) {
  }
  onLogout() {
    this.securityService.logout();
  }
  showNewOrderModal() {
    this.router.navigate(['/orders/create']).then();
  }
}
