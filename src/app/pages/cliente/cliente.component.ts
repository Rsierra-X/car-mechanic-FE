import {Component, OnInit} from '@angular/core';
import {CatalogLayoutComponent} from "../../components/catalog-layout/catalog-layout.component";
import {NgForOf, NgIf} from "@angular/common";
import {ButtonComponent} from "../../shared/components/button/button.component";
import {SimpleTableComponent} from "../../components/simple-table/simple-table.component";
import {ClienteService} from "../../services/clientes-service/cliente.service";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {ToastrService} from "ngx-toastr";
import {ClientModalComponent} from "./client-modal/client-modal.component";

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [
    CatalogLayoutComponent,
    NgForOf,
    NgIf,
    ButtonComponent,
    SimpleTableComponent,
    FormsModule,
    ReactiveFormsModule,
    ClientModalComponent
  ],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css'
})
export class ClienteComponent implements OnInit {
  clientForm: FormGroup;
  showModal = false;
  isModalEdit = false;
  clientIdSelected = "";
  clientes: any[] = [];

  constructor(private clientesService: ClienteService,private fb: FormBuilder,private toastr: ToastrService) {
    this.clientForm = this.fb.group({
      Nombre: ['', Validators.required],
      Apellido: [''],
      Telefono: ['', [ Validators.pattern(/^[0-9]{8}$/)]],
      CorreoElectronico: ['', [ Validators.email]],
      Direccion: ['', Validators.required],
      Nit: ['', []],
      esConsumidorFinal: [false],
    }, {
      validators: [this.nitRequiredUnlessCF()]
    });
  }

  ngOnInit(): void {
    this.loadClientes();
  }

  loadClientes() {
    this.clientesService.getAll().subscribe((data) => {
      this.clientes = data;
    });
  }

  search(dataSearch: any) {
    const nombreQuery = (dataSearch.Nombre || '').toLowerCase().trim();
    const apellidoQuery = (dataSearch.Apellido || '').toLowerCase().trim();
    const telefonoQuery = (dataSearch.Telefono || '').toLowerCase().trim();
    const nitQuery = (dataSearch.Nit || '').toLowerCase().trim();

    // Siempre partir de la lista original
    this.clientes = this.clientes.filter(cliente => {
      const nombreMatch = !nombreQuery || cliente.Nombre.toLowerCase().includes(nombreQuery);
      const apellidoMatch = !apellidoQuery || cliente.Apellido.toLowerCase().includes(apellidoQuery);
      const telefonoMatch = !telefonoQuery || cliente.Telefono.toLowerCase().includes(telefonoQuery);
      const nitMatch = !nitQuery || cliente.Nit.toLowerCase().includes(nitQuery);

      return nombreMatch && apellidoMatch && telefonoMatch && nitMatch;
    });
  }

  create() {
    const formData = this.clientForm.getRawValue();
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.clientesService.create(formData).subscribe({
      next: (cliente) => {
        this.clientForm.reset();
        this.clientForm.get('Nit')?.enable();
        this.cerrarModal();
        this.toastr.success(`El cliente ${cliente.Nombre} ha sido creado exitosamente`, 'Exito');
        this.loadClientes();
      },
      error: (err) => {
        console.error('Error al crear cliente:', err);
      }
    });
  }

  updateClient() {
    const formData = this.clientForm.getRawValue();
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }
    const { esConsumidorFinal, ...dataToSend } = formData;
    dataToSend.ClienteID = this.clientIdSelected;
    this.clientesService.update(dataToSend.ClienteID, dataToSend).subscribe({
      next: (cliente) => {
        this.clientForm.reset();
        this.clientForm.get('Nit')?.enable();
        this.cerrarModal();
        this.isModalEdit = false;
        this.clientIdSelected = "";
        this.toastr.success(`El cliente ${cliente.Nombre} ha sido actualizado exitosamente`, 'Exito');
        this.loadClientes();
      },
      error: (err) => {
        console.error('Error al crear cliente:', err);
      }
    });
  }

  onCFChange() {
    const isCF = this.clientForm.get('esConsumidorFinal')?.value;

    if (isCF) {
      this.clientForm.get('Nit')?.setValue('CF');
      this.clientForm.get('Nit')?.disable();
    } else {
      this.clientForm.get('Nit')?.enable();
      this.clientForm.get('Nit')?.reset();
    }
  }

  cerrarModal() {
    this.showModal = false;
    this.clientForm.reset();
    this.clientForm.get('Nit')?.enable();
  }

  nitRequiredUnlessCF(): ValidatorFn {
    return (form: AbstractControl): ValidationErrors | null => {
      const nit = form.get('Nit');
      const isCF = form.get('esConsumidorFinal')?.value;

      if (!isCF && (!nit?.value || nit.value.trim() === '')) {
        return { nitRequired: true };
      }

      return null;
    };
  }

  deleteClient(clienteID: any) {
    this.clientesService.delete(clienteID.ClienteID).subscribe(() => {
      this.toastr.success('El usuario ha sido eliminado', 'Exito');
      this.loadClientes();
    });
  }

  editClient(clienteData: any) {
    const esCF = clienteData.Nit === 'CF';

    this.clientForm.reset();
    this.clientForm.patchValue({
      Nombre: clienteData.Nombre,
      Apellido: clienteData.Apellido,
      Telefono: clienteData.Telefono,
      CorreoElectronico: clienteData.CorreoElectronico,
      Direccion: clienteData.Direccion,
      Nit: esCF ? 'CF' : clienteData.Nit,
      esConsumidorFinal: esCF
    });
    this.clientIdSelected = clienteData.ClienteID;
    if (esCF) {
      this.clientForm.get('Nit')?.disable();
    } else {
      this.clientForm.get('Nit')?.enable();
    }

    this.showModal = true;
    this.isModalEdit = true;
  }
}
