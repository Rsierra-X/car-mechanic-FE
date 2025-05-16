import {Component, OnInit} from '@angular/core';
import {ButtonComponent} from "../../../shared/components/button/button.component";
import {CatalogLayoutComponent} from "../../../components/catalog-layout/catalog-layout.component";
import {SimpleTableComponent} from "../../../components/simple-table/simple-table.component";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {ClienteService} from "../../../services/clientes-service/cliente.service";
import {ToastrService} from "ngx-toastr";
import {OrdersService} from "../../../services/orders/orders.service";
import {Router} from "@angular/router";

export interface Order {
  id?: number;
  orderDate: Date;
  clientId: number;
  clientName: string;
  clientNit: string;
  brand: string;
  type: string;
  plate: string;
  total: number;
  estado: string;
}

interface OrderTableRow {
  id?: number;
  Orden: number;
  Fecha: string;
  NIT: string;
  Cliente: string;
  Placa: string;
  Total: string;
  Estado: string;
}

@Component({
  selector: 'app-order-list',
  standalone: true,
    imports: [
        ButtonComponent,
        CatalogLayoutComponent,
        SimpleTableComponent
    ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css'
})
export class OrderListComponent implements OnInit {
  orderForm: FormGroup;
  showModal = false;
  isModalEdit = false;
  orderIdSelected = '';
  orders: Order[] = []; // Use the Order interface
  OrderTableRow: OrderTableRow[] = []; // Use the Order interface
  //searchTerm: string = ''; // You can add this if you want to implement search in the component

  constructor(
    private orderService: OrdersService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router  // Inject the router
  ) {
    this.orderForm = this.fb.group({
      orderDate: [new Date(), Validators.required],
      clientId: [null, Validators.required],  // You might need a client selection dropdown
      clientName: [''],
      clientNit: [''],
      vehicleBrand: ['', Validators.required],
      vehicleType: ['', Validators.required],
      vehiclePlate: ['', Validators.required],
      total: [0, Validators.required], // Or calculate this in the form
      estado: ['En Proceso', Validators.required], // Or use an enum
    });
  }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders() {
    this.orderService.getOrders().subscribe(
      (data) => {
        this.orders = data;
        this.OrderTableRow = this.transformarDatosParaTabla(data);
      },
      (error) => {
        console.error('Error loading orders:', error);
        this.toastr.error('Failed to load orders.', 'Error'); // Use toastr
      }
    );
  }

  transformarDatosParaTabla(data: any[]): OrderTableRow[] {
    if (!data) {
      return []; // Retorna un array vacío si no hay datos
    }

    return data.map(item => {
      // Manejo defensivo para cliente y vehiculo por si alguno fuera null o undefined
      const nombreCliente = item.cliente?.Nombre || '';
      const apellidoCliente = item.cliente?.Apellido || '';
      const nitCliente = item.cliente?.Nit || 'N/A'; // O un valor por defecto si prefieres
      const placaVehiculo = item.vehiculo?.Placa || 'N/A'; // O un valor por defecto

      return {
        orderId: item.id,
        Orden: item.id,
        Fecha: item.fecha,
        NIT: nitCliente,
        Cliente: `${nombreCliente} ${apellidoCliente}`.trim(), // Une nombre y apellido
        Placa: placaVehiculo,
        Total: item.total, // El total ya viene como string "400.00"
        Estado: item.estado
      };
    });
  }

  // search(filters: Record<string, string>) {
  //   console.log('Filtros aplicados:', filters);
  //   // Implement your search logic here.  You'll likely need to call a method
  //   // in your OrderService to fetch filtered data from the backend.
  //   this.orderService.getOrders().subscribe( //Or a new method
  //     (data) => {
  //       this.orders = data.filter(order => {
  //         let match = true;
  //         for (const key in filters) {
  //           if (filters[key]) { // Only filter if the filter value is not empty
  //             const filterValue = filters[key].toLowerCase();
  //             const orderValue = (order as any)[key]?.toString().toLowerCase() || ''; //Make sure the property exists in order
  //             if (!orderValue.includes(filterValue)) {
  //               match = false;
  //               break;
  //             }
  //           }
  //         }
  //         return match;
  //       });
  //     },
  //     (error) => {
  //       console.error("Error searching orders", error);
  //       this.toastr.error('Failed to search orders', 'Error');
  //     }
  //   );
  // }

  search(filters: Record<string, string>) {
    console.log('Filtros aplicados:', filters);
    this.orderService.getOrders().subscribe((orders) => {
        this.orders = orders.filter((order) => {
          let match = true;
          for (const key in filters) {
            if (filters[key]) {
              const filterValue = filters[key].toLowerCase();
              const orderValue = String((order as any)[key]).toLowerCase(); // Access property dynamically

              if (!orderValue.includes(filterValue)) {
                match = false;
              }
            }
          }
          return match;
        });
      },
      (error) => {
        console.error("Error searching orders", error);
        this.toastr.error('Failed to search orders', 'Error');
      }
    );
  }

  goToCreateOrder() {
    this.router.navigate(['/orders/create']); // Navigate to the create order route
  }

  editOrder(order: any) {
    this.orderForm.patchValue({
      orderDate: order.orderDate,
      clientId: order.clientId,
      clientName: order.clientNit, //Fix
      clientNit: order.clientNit,
      vehicleBrand: order.brand,
      vehicleType: order.type,
      vehiclePlate: order.plate,
      total: order.total,
      estado: order.estado,
    });
    this.orderIdSelected = order.id?.toString() || ''; // Make sure order.id is not undefined
    this.showModal = true;
    this.isModalEdit = true;
  }

  updateOrderStatus(order: any) {
    console.log(order)
    this.orderService.updateOrderStatus(order.orderId, order.estado).subscribe(
      () => {
        this.toastr.success(`El estado de la orden ${order.orderId} fue actualizado`, 'Éxito');
        this.loadOrders();
      },
      (error) => {
        console.error('Error al actualizar el estado de la orden:', error);
        this.toastr.error('Hubo un error al actualizar el estado de la orden.', 'Error');
      }
    );
  }

  updateOrder() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const orderData = this.orderForm.value;
    //orderData.id = this.orderIdSelected; // removed id, check if backend expects id

    this.orderService.updateOrder(parseInt(this.orderIdSelected, 10), orderData).subscribe( //changed
      (updatedOrder) => {
        this.toastr.success(`Order ${updatedOrder.id} updated successfully`, 'Success'); // Use updatedOrder
        this.loadOrders();
        this.cerrarModal();
        this.isModalEdit = false;
        this.orderIdSelected = '';
      },
      (error) => {
        console.error('Error updating order:', error);
        this.toastr.error('Failed to update order', 'Error');
      }
    );
  }

  deleteOrder(orderId: any) {
    this.orderService.deleteOrder(orderId).subscribe(
      () => {
        this.toastr.success('Order deleted successfully', 'Success');
        this.loadOrders();
      },
      (error) => {
        console.error('Error deleting order:', error);
        this.toastr.error('Failed to delete order', 'Error');
      }
    );
  }

  cerrarModal() {
    this.showModal = false;
    this.orderForm.reset();
    this.isModalEdit = false;
    this.orderIdSelected = '';
  }

  saveOrder() {
    if (this.isModalEdit) {
      this.updateOrder();
    } else {
      this.createOrder();
    }
  }

  createOrder() {
    if (this.orderForm.invalid) {
      this.orderForm.markAllAsTouched();
      return;
    }

    const newOrder = this.orderForm.value;

    this.orderService.createOrder(newOrder).subscribe(
      (createdOrder) => {
        this.toastr.success(`Order ${createdOrder.id} created successfully`, 'Success');
        this.loadOrders();
        this.cerrarModal();
      },
      (error) => {
        console.error('Error creating order:', error);
        this.toastr.error('Failed to create order', 'Error');
      }
    );
  }
}
