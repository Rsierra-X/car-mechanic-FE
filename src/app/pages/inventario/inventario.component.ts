import {Component, OnInit} from '@angular/core';
import {ButtonComponent} from "../../shared/components/button/button.component";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SimpleTableComponent} from "../../components/simple-table/simple-table.component";
import {CatalogLayoutComponent} from "../../components/catalog-layout/catalog-layout.component";
import {InventarioService, Producto} from "../../services/inventario-service/inventario.service";
import {ToastrService} from "ngx-toastr";
import {NgIf} from "@angular/common";

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    ButtonComponent,
    ReactiveFormsModule,
    SimpleTableComponent,
    CatalogLayoutComponent,
    NgIf
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.css'
})
export class InventarioComponent implements OnInit {
  productForm: FormGroup;
  showModal = false;
  isModalEdit = false;
  productIdSelected: number | null = null;
  productos: Producto[] = [];

  constructor(
    private productoService: InventarioService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.productForm = this.fb.group({
      Nombre: ['', Validators.required],
      Descripcion: [''],
      Cantidad: [0, [Validators.required, Validators.min(1)]],
      PrecioUnitario: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos() {
    this.productoService.getAll().subscribe((data: Producto[]) => {
      this.productos = data;
    });
  }

  search(filtros: Record<string, string>) {
    console.log('Filtros aplicados:', filtros);

  }

  createProduct() {
    const formData = this.productForm.getRawValue();
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.productoService.create(formData).subscribe({
      next: (producto) => {
        this.productForm.reset();
        this.cerrarModal();
        this.toastr.success(`El producto ${producto.Nombre} ha sido creado exitosamente`, 'Exito');
        this.loadProductos();
      },
      error: (err) => {
        console.error('Error al crear producto:', err);
      }
    });
  }

  updateProduct() {
    const formData = this.productForm.getRawValue();
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const dataToSend = { ...formData, ProductoID: this.productIdSelected };
    this.productoService.update(this.productIdSelected!, dataToSend).subscribe({
      next: (producto) => {
        this.productForm.reset();
        this.cerrarModal();
        this.isModalEdit = false;
        this.productIdSelected = null;
        this.toastr.success(`El producto ${producto.Nombre} ha sido actualizado exitosamente`, 'Exito');
        this.loadProductos();
      },
      error: (err) => {
        console.error('Error al actualizar producto:', err);
      }
    });
  }

  deleteProduct(productId: any) {
    this.productoService.delete(productId).subscribe(() => {
      this.toastr.success('El producto ha sido eliminado', 'Exito');
      this.loadProductos();
    });
  }

  editProduct(productData: any) {
    this.productForm.reset();
    this.productForm.patchValue({
      Nombre: productData.Nombre,
      Descripcion: productData.Descripcion,
      Cantidad: productData.Cantidad,
      PrecioUnitario: productData.PrecioUnitario
    });
    this.productIdSelected = productData.ProductoID;
    this.showModal = true;
    this.isModalEdit = true;
  }

  exportToPDF() {
    this.productoService.exportPdf().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventario.pdf';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  exportToExcel() {
    this.productoService.exportExcel().subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'inventario.xlsx';
      a.click();
      window.URL.revokeObjectURL(url);
    });
  }

  cerrarModal() {
    this.showModal = false;
    this.productForm.reset();
  }
}
