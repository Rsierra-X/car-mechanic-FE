import {Component, OnInit} from '@angular/core';
import {ButtonComponent} from "../../shared/components/button/button.component";
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SimpleTableComponent} from "../../components/simple-table/simple-table.component";
import {CatalogLayoutComponent} from "../../components/catalog-layout/catalog-layout.component";
import {InventarioService, Producto} from "../../services/inventario-service/inventario.service";
import {ToastrService} from "ngx-toastr";
import {NgForOf, NgIf} from "@angular/common";
import {TipoProductoService} from "../../services/tipo-producto/tipo-producto.service";
import {MarcasService} from "../../services/marcas/marcas.service";

@Component({
  selector: 'app-inventario',
  standalone: true,
  imports: [
    ButtonComponent,
    ReactiveFormsModule,
    SimpleTableComponent,
    CatalogLayoutComponent,
    NgIf,
    NgForOf
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
  productosForTable: any[] = [];
  tiposProductos: any[] = [];
  marcas: any[] = [];

  constructor(
    private productoService: InventarioService,
    private marcasService: MarcasService,
    private tipoProductoService: TipoProductoService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {
    this.productForm = this.fb.group({
      Nombre: ['', Validators.required],
      Descripcion: [''],
      Cantidad: [0, [Validators.required, Validators.min(1)]],
      PrecioUnitario: [0, [Validators.required, Validators.min(0)]],
      Marca: ['', Validators.required], // para la marca
      TipoProducto: ['', Validators.required],
      sku: ['0']
    });
  }

  ngOnInit(): void {
    this.loadProductos();
  }

  loadProductos() {
    this.productos = [];
    this.productosForTable = [];
    this.productoService.getAll().subscribe((data: any[]) => {
      this.productos = data;
       data.map(producto => {
         this.productosForTable.push({
           ProductoID: producto.ProductoID,
           Nombre: producto.Nombre,
           Descripcion: producto.Descripcion,
           Marca: producto.marca?.nombre,
           MarcaId: producto.marca?.id,
           TipoProducto: producto.tipo?.nombre,
           TipoProductoId: producto.tipo?.id,
           Cantidad: producto.Cantidad,
           PrecioUnitario: producto.PrecioUnitario
         })
       });
    });
    this.tipoProductoService.getAll().subscribe((data) => {
      this.tiposProductos = data;
    });
    this.marcasService.getAll().subscribe((data) => {
      this.marcas = data;
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
    const payload = {
      ...formData,
      marca: { id: formData.Marca },
      tipo: { id: formData.TipoProducto },
      sku: 0
    };

    this.productoService.create(payload).subscribe({
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
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    const formData = this.productForm.getRawValue();

    const payload = {
      Cantidad: formData.Cantidad,
      Descripcion: formData.Descripcion,
      Nombre: formData.Nombre,
      PrecioUnitario: formData.PrecioUnitario,
      sku: formData.sku ?? '0',
      marca: { id: formData.Marca },
      tipo: { id: formData.TipoProducto }
    };

    this.productoService.update(this.productIdSelected!, payload).subscribe({
      next: (producto) => {
        this.productForm.reset();
        this.cerrarModal();
        this.isModalEdit = false;
        this.productIdSelected = null;
        this.toastr.success(`El producto ${producto.Nombre} ha sido actualizado exitosamente`, 'Éxito');
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
      PrecioUnitario: productData.PrecioUnitario,
      Marca: productData.MarcaId,
      TipoProducto: productData.TipoProductoId
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
