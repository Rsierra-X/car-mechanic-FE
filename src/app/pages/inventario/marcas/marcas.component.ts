import {Component, OnInit} from '@angular/core';
import {ButtonComponent} from "../../../shared/components/button/button.component";
import {CatalogLayoutComponent} from "../../../components/catalog-layout/catalog-layout.component";
import {NgIf} from "@angular/common";
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {SimpleTableComponent} from "../../../components/simple-table/simple-table.component";
import {ClienteService} from "../../../services/clientes-service/cliente.service";
import {ToastrService} from "ngx-toastr";
import {MarcasService} from "../../../services/marcas/marcas.service";

@Component({
  selector: 'app-marcas',
  standalone: true,
  imports: [
    ButtonComponent,
    CatalogLayoutComponent,
    NgIf,
    ReactiveFormsModule,
    SimpleTableComponent
  ],
  templateUrl: './marcas.component.html',
  styleUrl: './marcas.component.css'
})
export class MarcasComponent implements OnInit {
  marcaForm: FormGroup;
  showModal = false;
  isModalEdit = false;
  marcaIdSeleccionada = '';
  marcas: any[] = [];

  constructor(
    private marcasService: MarcasService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.marcaForm = this.fb.group({
      nombre: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.marcasService.getAll().subscribe((data) => {
      this.marcas = data;
    });
  }

  create() {
    if (this.marcaForm.invalid) {
      this.marcaForm.markAllAsTouched();
      return;
    }

    const formData = this.marcaForm.getRawValue();

    this.marcasService.create(formData).subscribe({
      next: (marca) => {
        this.marcaForm.reset();
        this.cerrarModal();
        this.toastr.success(`La marca "${marca.nombre}" fue creada exitosamente`, 'Éxito');
        this.loadData();
      },
      error: (err) => {
        console.error('Error al crear marca:', err);
        this.toastr.error('Hubo un error al crear la marca.', 'Error');
      }
    });
  }

  update() {
    if (this.marcaForm.invalid) {
      this.marcaForm.markAllAsTouched();
      return;
    }
    const formData = this.marcaForm.getRawValue();

    this.marcasService.update(+this.marcaIdSeleccionada, formData).subscribe({
      next: (marca) => {
        this.marcaForm.reset();
        this.cerrarModal();
        this.isModalEdit = false;
        this.marcaIdSeleccionada = '';
        this.toastr.success(`La marca "${marca.nombre}" fue actualizada exitosamente`, 'Éxito');
        this.loadData();
      },
      error: (err) => {
        console.error('Error al actualizar marca:', err);
        this.toastr.error('Hubo un error al actualizar la marca.', 'Error');
      }
    });
  }

  search(dataSearch: any) {
    const nombreQuery = (dataSearch.nombre || '').toLowerCase().trim();

    // Siempre partir de la lista original
    this.marcas = this.marcas.filter(servicio => {
      console.log(servicio)
      const nombreMatch = !nombreQuery || servicio.nombre.toLowerCase().includes(nombreQuery);
      return nombreMatch ;
    });
  }

  delete(marcaId: any) {
    this.marcasService.delete(marcaId).subscribe(() => {
      this.toastr.success('La marca fue eliminada', 'Éxito');
      this.loadData();
    });
  }

  edit(marca: any) {
    this.marcaForm.reset();
    this.marcaForm.patchValue({
      nombre: marca.nombre
    });

    this.marcaIdSeleccionada = marca.id;
    this.showModal = true;
    this.isModalEdit = true;
  }

  cerrarModal() {
    this.showModal = false;
    this.isModalEdit = false;
    this.marcaForm.reset();
  }
}
