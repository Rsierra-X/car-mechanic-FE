import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {FormsModule} from '@angular/forms';
import {ToastrService} from 'ngx-toastr';
import {SecurityService} from '../../services/security/security.service';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  standalone: true
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  constructor(
    private router: Router,
    private toastr: ToastrService,
    private securityService: SecurityService
  ) {}

  onSubmit() {
    this.securityService.login(this.username, this.password).subscribe({
      next: () => {
        this.toastr.success('Inicio de sesión exitoso', 'Bienvenido');
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        const message = error?.message || 'Error de autenticación';
        this.toastr.error(message, 'Inicio de sesión fallido');
      }
    });
  }
}
