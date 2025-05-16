import {Component, OnInit} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule, ValidationErrors,
  ValidatorFn,
  Validators
} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {ClienteService} from "../../../services/clientes-service/cliente.service";
import {InventarioService} from "../../../services/inventario-service/inventario.service";
import {OrdersService} from "../../../services/orders/orders.service";
import {ButtonComponent} from "../../../shared/components/button/button.component";
import {ClientModalComponent} from "../../cliente/client-modal/client-modal.component";
import {ToastrService} from "ngx-toastr";
import {ServicesProductsService} from "../../../services/service-product/services-products.service";

interface OrderDetailForm {
  productId: number | null;
  description: string;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-order-create',
  standalone: true,
  imports: [
    NgForOf,
    ReactiveFormsModule,
    RouterLink,
    NgIf,
    DecimalPipe,
    ButtonComponent,
    ClientModalComponent,
  ],
  templateUrl: './order-create.component.html',
  styleUrl: './order-create.component.css'
})
export class OrderCreateComponent implements OnInit {
  orderForm: FormGroup;
  clients: any[] = [];
  products: any[] = [];
  services: any[] = [];
  productAndService: any[] = [];
  marcas:any[] = [];
  tipos:any[] = [];
  todosLosVehiculos: any[] = [];
  showClients = false;
  showProducts = false;
  clientForm: FormGroup;
  showModal = false;
  productOrService = [{id: 1, name: 'Producto'}, {id: 2, name: 'Servicio'}];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private clientService: ClienteService,
    private productService: InventarioService,
    private orderService: OrdersService,
    private clientesService: ClienteService,
    private toastr: ToastrService,
    private servicesService: ServicesProductsService,
  ) {
    this.orderForm = this.fb.group({
      orderDate: [this.getTodayDate(), Validators.required],
      clientId: [null, Validators.required],
      clientNit: [{ value: '', disabled: true }],
      brand: ['', Validators.required],
      type: ['', Validators.required],
      color: [''],
      year: [''],
      plate: ['', Validators.required],
      nextService: [''],
      orderDetails: this.fb.array([]),
      laborCost: [0, Validators.min(0)],
      abono: [0, Validators.min(0)],
    });

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
    this.loadClients();
    this.loadProductsAndServices();
    this.loadBrandsVehicle();
    this.onBrandChangeVehicle();
    this.addDetail(); // Se agrega al menos una línea de detalle por defecto
  }

  private getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  get orderDetails(): FormArray {
    return this.orderForm.get('orderDetails') as FormArray;
  }

  addDetail(): void {
    this.orderDetails.push(this.fb.group({
      productSelected: [null, Validators.required],
      productId: [null, Validators.required],
      description: [{ value: '', disabled: true }, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [{ value: 0, disabled: true }, Validators.required],
    }));
  }

  removeDetail(index: number): void {
    this.orderDetails.removeAt(index);
  }

  onClientChange(event: Event): void {
    const clientId = parseInt((event.target as HTMLSelectElement).value, 10);
    const selectedClient = this.clients.find(c => c.ClienteID === clientId);
    this.orderForm.patchValue({
      clientNit: selectedClient?.Nit || ''
    });
  }

  onProductOrServiceChange(index: number): void {
    const selectedId = this.orderDetails.controls[index];
    this.productAndService = selectedId.get('productSelected')?.value === 1 ? this.products : this.services;
    selectedId.patchValue({
      productId: 0,
      description:  '',
      unitPrice:  0
    });
  }

  onProductAndServiceChange(index: number): void {
    const selectedId = this.orderDetails.at(index).get('productId')?.value;
    const selectedColumnId = this.orderDetails.at(index).get('productSelected')?.value;
    const quantityControl = this.orderDetails.at(index).get('quantity');
    const unitPriceControl = this.orderDetails.at(index).get('unitPrice');
    let selected: any;
    if (selectedColumnId === 1) {
      selected = this.productAndService.find(p => p.ProductoID === selectedId);
      quantityControl?.enable();
      unitPriceControl?.disable();
    }else {
      selected = this.productAndService.find(p => p.ServicioID === selectedId);
      quantityControl?.disable();
      unitPriceControl?.enable();
    }

    this.orderDetails.at(index).patchValue({
      description: selected?.Descripcion || '',
      unitPrice: selected?.PrecioUnitario || 0
    });
  }

  calculateTotalRepuestos(): number {
    return this.orderDetails.controls.reduce((total, control) => {
      const quantity = control.get('quantity')?.value || 0;
      const unitPrice = control.get('unitPrice')?.value || 0;
      return total + (quantity * unitPrice);
    }, 0);
  }

  calculateSubtotal(): number {
    return this.calculateTotalRepuestos() + (this.orderForm.get('laborCost')?.value || 0);
  }

  calculateTotal(): number {
    return this.calculateSubtotal() - (this.orderForm.get('abono')?.value || 0);
  }

  saveOrder(): void {
    if (this.orderForm.invalid) {
      this.markAllAsTouched(this.orderForm);
      return;
    }

    const rawValue = this.orderForm.getRawValue();

    const detalles = rawValue.orderDetails.map((detail: any) => {
      const isProducto = detail.productSelected === 1;
      return {
        tipo: isProducto ? 'producto' : 'servicio',
        productoId: isProducto ? detail.productId : undefined,
        servicioId: !isProducto ? detail.productId : undefined,
        cantidad: detail.quantity,
        precioUnitario: detail.unitPrice,
      };
    });

    const totalDetalles = detalles.reduce(
      (acc: number, d: any) => acc + d.cantidad * d.precioUnitario,
      0
    );
    const total = totalDetalles + Number(rawValue.laborCost || 0);

    const vehiculo = {
      Placa: rawValue.plate,
      Marca: rawValue.brand,
      Modelo: rawValue.type,
      Anio: Number(rawValue.year || 0),
      Color: rawValue.color || 'N/A',
      Kilometraje: Number(rawValue.nextService || 0)
    };

    const formattedOrder = {
      clienteId: rawValue.clientId,
      vehiculo,
      detalles,
      manoDeObra: Number(rawValue.laborCost || 0),
      abono: Number(rawValue.abono || 0),
      total
    };

    this.orderService.createOrder(formattedOrder).subscribe({
      next: () => this.router.navigate(['/orders']),
      error: (err) => console.error('Error al guardar la orden:', err)
    });
  }

  private markAllAsTouched(group: FormGroup | FormArray): void {
    Object.values(group.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markAllAsTouched(control);
      } else {
        control.markAsTouched();
      }
    });
  }

  private loadClients(): void {
    this.clientService.getAll().subscribe({
      next: (clients) => {
        this.clients = clients;
        this.showClients = true;
      },
      error: (err) => console.error('Error loading clients:', err)
    });
  }

  private loadProductsAndServices(): void {
    this.productService.getAll().subscribe({
      next: (items) => {
        this.products = items;
        this.showProducts = true;
      },
      error: (err) => console.error('Error loading products/services:', err)
    });
    this.servicesService.getAll().subscribe((data) => {
      this.services = data;
    });
  }

  private loadBrandsVehicle(): void {
    this.productService.getAllVehicles().subscribe({
      next: (items) => {
        this.todosLosVehiculos = items
        const marcasUnicas = new Set<string>();
        items.forEach((item: any) => marcasUnicas.add(item.marca));
        this.marcas = Array.from(marcasUnicas);
      },
      error: (err) => console.error('Error al cargar productos/servicios:', err)
    });
  }

  private onBrandChangeVehicle(): void {
    // Escucha los cambios en el valor del FormControl 'brand'
    this.orderForm.get('brand')?.valueChanges.subscribe(selectedBrand => {
      // Cuando la marca cambia, resetea el valor del tipo/modelo y actualiza las opciones
      this.orderForm.get('type')?.setValue(null); // Resetea el valor seleccionado en el input de tipo
      this.tipos = []; // Vacía las opciones actuales de tipo

      if (selectedBrand && this.todosLosVehiculos.length > 0) {
        const modelosDeMarca = this.todosLosVehiculos
          .filter(vehiculo => vehiculo.marca === selectedBrand) // Filtra por la marca seleccionada
          .map(vehiculo => vehiculo.modelo); // Obtiene solo los modelos

        // Asegura que los modelos también sean únicos (por si acaso hay duplicados en los datos originales para una misma marca)
        this.tipos = Array.from(new Set(modelosDeMarca));
        console.log(`Modelos para ${selectedBrand}:`, this.tipos);
      } else {
        console.log('Ninguna marca seleccionada o no hay vehículos cargados.');
      }
    });
  }


  //Create clientes ...........................
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
        this.loadClients();
      },
      error: (err) => {
        console.error('Error al crear cliente:', err);
      }
    });
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
}
