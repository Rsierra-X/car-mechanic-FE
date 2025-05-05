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
  showClients = false;
  showProducts = false;
  productsAndServices: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private clientService: ClienteService,
    private productService: InventarioService,
    private orderService: OrdersService
  ) {
    this.orderForm = this.fb.group({
      orderDate: [new Date().toISOString().split('T')[0], Validators.required],
      clientId: [null, Validators.required],
      clientNit: [{ value: '', disabled: true }],
      brand: ['', Validators.required],
      type: ['', Validators.required],
      color: [''],
      year: [''],
      plate: ['', Validators.required],
      nextService: [''],
      orderDetails: this.fb.array([]),
      laborCost: [0],
      abono: [0],
    });
  }

  ngOnInit(): void {
    this.loadClients();
    this.loadProductsAndServices();
    this.addDetail();
  }

  loadClients(): void {
    this.clientService.getAll().subscribe(
      (clients) => {
        this.clients = clients;
        this.showClients = true;
      },
      (error) => {
        console.error('Error loading clients:', error);
      }
    );
  }

  loadProductsAndServices(): void {
    this.productService.getAll().subscribe(
      (products) => {
        this.productsAndServices = products;
        this.showProducts = true;
      },
      (error) => {
        console.error('Error loading products and services:', error);
      }
    );
  }

  get orderDetails(): FormArray {
    return this.orderForm.get('orderDetails') as FormArray;
  }

  addDetail(): void {
    this.orderDetails.push(this.fb.group({
      productId: [null, Validators.required],
      description: [{ value: '', disabled: true }, Validators.required], // Deshabilitado inicialmente
      quantity: [1, Validators.min(1)],
      unitPrice: [{ value: 0, disabled: true }, Validators.min(0)], // Deshabilitado inicialmente
    }));
  }

  removeDetail(index: number): void {
    this.orderDetails.removeAt(index);
  }

  onClientChange(event: any): void {
    const clientId = parseInt(event.target.value, 10);
    const selectedClient = this.clients.find(client => client.ClienteID === clientId);
    if (selectedClient) {
      this.orderForm.patchValue({
        clientNit: selectedClient.Nit // Asume que tu interfaz Client tiene un campo 'nit'
      });
    } else {
      this.orderForm.patchValue({
        clientNit: ''
      });
    }
  }

  onProductOrServiceChange(index: number): void {
    const selectedProductId = this.orderDetails.at(index).get('productId')?.value;
    const selectedProduct = this.productsAndServices.find(item => item.id === selectedProductId);
    if (selectedProduct) {
      this.orderDetails.at(index).patchValue({
        description: selectedProduct.name, // Asume que tu interfaz ProductOrService tiene un campo 'name'
        unitPrice: selectedProduct.price, // Asume que tu interfaz ProductOrService tiene un campo 'price'
      });

    } else {
      this.orderDetails.at(index).patchValue({
        description: '',
        unitPrice: 0
      });
    }
  }

  calculateTotalRepuestos(): number {
    let total = 0;
    this.orderDetails.controls.forEach(control => {
      const quantity = control.get('quantity')?.value || 0;
      const unitPrice = control.get('unitPrice')?.value || 0;
      total += quantity * unitPrice;
    });
    return total;
  }

  calculateSubtotal(): number {
    return this.calculateTotalRepuestos() + (this.orderForm.get('laborCost')?.value || 0);
  }

  calculateTotal(): number {
    const subtotal = this.calculateSubtotal();
    const abono = this.orderForm.get('abono')?.value || 0;
    return subtotal - abono;
  }

  saveOrder(): void {
    if (this.orderForm.valid) {
      const orderData = { ...this.orderForm.value };
      // Adaptar los datos de orderDetails si es necesario para tu backend
      const formattedOrderDetails = this.orderDetails.controls.map(control => ({
        productId: control.get('productId')?.value,
        quantity: control.get('quantity')?.value,
        unitPrice: control.get('unitPrice')?.value,
      }));
      orderData.orderDetails = formattedOrderDetails;

      this.orderService.createOrder(orderData).subscribe(
        (response) => {
          console.log('Order saved successfully:', response);
          this.router.navigate(['/orders']); // Redirigir a la lista de órdenes
        },
        (error) => {
          console.error('Error saving order:', error);
          // Mostrar mensaje de error al usuario
        }
      );
    } else {
      // Marcar todos los controles como tocados para mostrar los errores de validación
      this.markAllAsTouched(this.orderForm);
    }
  }

  markAllAsTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markAllAsTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach(c => {
          if (c instanceof FormGroup) {
            this.markAllAsTouched(c);
          }
        });
      }
    });
  }
}
