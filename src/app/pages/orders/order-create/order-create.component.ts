import {Component, OnInit} from '@angular/core';
import {DecimalPipe, NgForOf, NgIf} from "@angular/common";
import {FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {Router, RouterLink} from "@angular/router";
import {ClienteService} from "../../../services/clientes-service/cliente.service";
import {InventarioService} from "../../../services/inventario-service/inventario.service";
import {OrdersService} from "../../../services/orders/orders.service";

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
    DecimalPipe
  ],
  templateUrl: './order-create.component.html',
  styleUrl: './order-create.component.css'
})
export class OrderCreateComponent implements OnInit {
  orderForm: FormGroup;
  clients: any[] = [];
  productsAndServices: any[] = [];
marcas = ['Toyota', 'Nissan', 'Ford', 'Hyundai', 'Chevrolet'];
tipos = ['Sedán', 'SUV', 'Pick-Up', 'Camión', 'Motocicleta'];
  showClients = false;
  showProducts = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private clientService: ClienteService,
    private productService: InventarioService,
    private orderService: OrdersService
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
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadProductsAndServices();
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
    const selectedId = this.orderDetails.at(index).get('productId')?.value;
    const selected = this.productsAndServices.find(p => p.id === selectedId);

    this.orderDetails.at(index).patchValue({
      description: selected?.name || '',
      unitPrice: selected?.price || 0
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

    const formattedOrder = {
      ...rawValue,
      orderDetails: rawValue.orderDetails.map((detail: any) => ({
        productId: detail.productId,
        quantity: detail.quantity,
        unitPrice: detail.unitPrice,
      })),
    };

    this.orderService.createOrder(formattedOrder).subscribe({
      next: () => this.router.navigate(['/orders']),
      error: (err) => console.error('Error saving order:', err)
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
        this.productsAndServices = items;
        this.showProducts = true;
      },
      error: (err) => console.error('Error loading products/services:', err)
    });
  }
}
