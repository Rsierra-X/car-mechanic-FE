import {Component, OnInit} from '@angular/core';
import {ButtonComponent} from "../../../shared/components/button/button.component";
import {CatalogLayoutComponent} from "../../../components/catalog-layout/catalog-layout.component";
import {NgIf} from "@angular/common";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SimpleTableComponent} from "../../../components/simple-table/simple-table.component";
import {MarcasService} from "../../../services/marcas/marcas.service";
import {ToastrService} from "ngx-toastr";
import {TipoProductoService} from "../../../services/tipo-producto/tipo-producto.service";

@Component({
  selector: 'app-tipo-producto',
  standalone: true,
    imports: [
        ButtonComponent,
        CatalogLayoutComponent,
        NgIf,
        ReactiveFormsModule,
        SimpleTableComponent
    ],
  templateUrl: './tipo-producto.component.html',
  styleUrl: './tipo-producto.component.css'
})
export class TipoProductoComponent implements OnInit {
  marcaForm: FormGroup;
  showModal = false;
  isModalEdit = false;
  marcaIdSeleccionada = '';
  marcas: any[] = [];

  constructor(
    private marcasService: TipoProductoService,
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

  search(dataSearch: any){

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
