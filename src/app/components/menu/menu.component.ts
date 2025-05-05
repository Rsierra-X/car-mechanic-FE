import { Component } from '@angular/core';
import {RouterLink} from "@angular/router";
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
  constructor(private securityService: SecurityService ) {
  }
  onLogout() {
    this.securityService.logout();
  }
  showNewOrderModal() {
    console.log('show modal')
  }
}
