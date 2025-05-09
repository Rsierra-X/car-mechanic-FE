import { Component } from '@angular/core';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {UserService, Usuario} from "../../services/user-service/user.service";
import {SimpleTableComponent} from "../../components/simple-table/simple-table.component";
import {NgIf} from "@angular/common";
import {ToastrService} from "ngx-toastr";
import {ButtonComponent} from "../../shared/components/button/button.component";
import {CatalogLayoutComponent} from "../../components/catalog-layout/catalog-layout.component";

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SimpleTableComponent,
    NgIf,
    ButtonComponent,
    CatalogLayoutComponent
  ],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css'
})
export class ConfigurationComponent {
  usuarioForm: FormGroup;
  showModal = false;

  usuarios: any[] = [];
  currentUser: any | null = null;
  dataTransformed: any[] = [];

  constructor(private fb: FormBuilder, private usuarioService: UserService,private toastr: ToastrService,) {
    this.usuarioForm = this.fb.group({
      NombreUsuario: ['', Validators.required],
      Contrasena: ['', Validators.required],
      Rol: ['empleado', Validators.required]
    });

    this.loadUsuarios();
    this.loadCurrentUser();
  }

  get getDataTransformed() {
    return {
      Usuario: this.currentUser?.NombreUsuario,
      Rol: this.getRole
    }
  }

  get getRole() {
    return this.currentUser?.Rol === "1" ? 'Administrador' : 'Empleado';
  }

  loadUsuarios() {
    this.usuarioService.getAll().subscribe(data => {
      const currentUserId = this.currentUser?.UsuarioID;
      this.usuarios = data
        .filter((usuario: Usuario) =>
          usuario.UsuarioID !== currentUserId &&
          !(usuario.UsuarioID === 1 && usuario.Rol === '1')
        )
        .map((usuario: Usuario) => ({
          ...usuario,
          Rol: usuario.Rol === '1' ? 'Administrador' : 'Empleado'
        }));
    });
  }

  loadCurrentUser() {
    this.currentUser = this.usuarioService.getCurrentUser();
  }

  createUser() {
    if (this.usuarioForm.valid) {
      this.usuarioService.create(this.usuarioForm.value).subscribe(() => {
        this.loadUsuarios();
        this.usuarioForm.reset({ Rol: 'empleado' });
        this.showModal = false;
      });
    }
  }

  eliminarUsuario(id: any) {
    this.usuarioService.delete(id.UsuarioID).subscribe(() => {
      this.toastr.success('El usuario ha sido eliminado', 'Exito');
      this.loadUsuarios()
    });
  }

  search(filtros: Record<string, string>) {
    console.log('Filtros aplicados:', filtros);
    // Aquí puedes hacer una llamada al backend con los filtros, o filtrar localmente
  }
}
