import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink, RouterOutlet} from '@angular/router';
import {FloatingActionButtonComponent} from "./shared/floating-action-button/floating-action-button.component";
import {SecurityService} from "./services/security/security.service";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, FloatingActionButtonComponent, RouterLink],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'autoErpGT';
  isLoggedIn = inject(SecurityService).loginStatus;

  constructor(private router: Router, private securityService: SecurityService) {}

  ngOnInit(): void {
    this.initializeLogging();
  }

  initializeLogging(): void {
    this.isLoggedIn() ? this.navigateTo('dashboard') : this.navigateTo('login')
  }

  navigateTo(path: string) {
    this.router.navigate([path]).then();
  }
}
