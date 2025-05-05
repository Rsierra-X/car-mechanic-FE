import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {FloatingActionButtonComponent} from "./shared/components/floating-action-button/floating-action-button.component";
import {SecurityService} from "./services/security/security.service";
import {MenuComponent} from "./components/menu/menu.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FloatingActionButtonComponent, RouterLink, MenuComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent  {
  title = 'autoErpGT';
  isLoggedIn = inject(SecurityService).loginStatus;

  constructor(private router: Router, private securityService: SecurityService) {}

}
