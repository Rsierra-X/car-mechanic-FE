import {Component, inject} from '@angular/core';
import {RouterLink} from '@angular/router';
import {SecurityService} from "../../services/security/security.service";

@Component({
  selector: 'app-dashboad',
  imports: [
    RouterLink
  ],
  templateUrl: './dashboad.component.html',
  standalone: true,
  styleUrl: './dashboad.component.css'
})
export class DashboadComponent {
  isLoggedIn = inject(SecurityService).loginStatus;
  constructor() {
    console.log(this.isLoggedIn())
  }
}
