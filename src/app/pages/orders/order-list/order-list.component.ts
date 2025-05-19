import {Component, OnInit} from '@angular/core';
import {ButtonComponent} from "../../../shared/components/button/button.component";
import {CatalogLayoutComponent} from "../../../components/catalog-layout/catalog-layout.component";
import {SimpleTableComponent} from "../../../components/simple-table/simple-table.component";
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";
import {ClienteService} from "../../../services/clientes-service/cliente.service";
import {ToastrService} from "ngx-toastr";
import {OrdersService} from "../../../services/orders/orders.service";
import {Router} from "@angular/router";
import * as pdfMake from 'pdfmake/build/pdfmake';
import { vfs } from 'pdfmake/build/vfs_fonts';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import {Observable} from "rxjs";
import {InventarioService} from "../../../services/inventario-service/inventario.service";
import {ServicesProductsService} from "../../../services/service-product/services-products.service";
import {NgIf} from "@angular/common";




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
    SimpleTableComponent,
    NgIf
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
  products: any[] = [];
  services: any[] = [];
  showReportModal = false;
  constructor(
    private orderService: OrdersService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router,  // Inject the router
  private productService: InventarioService,
    private servicesService: ServicesProductsService,
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
    this.loadProductsAndServices();
  }

  private loadProductsAndServices(): void {
    this.productService.getAll().subscribe({
      next: (items) => {
        this.products = items;
      },
      error: (err) => console.error('Error loading products/services:', err)
    });
    this.servicesService.getAll().subscribe((data) => {
      this.services = data;
    });
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


  search(dataSearch: any) {
    const ordenQuery = (dataSearch['Número de Orden'] || '').toLowerCase().trim();
    const nitQuery = (dataSearch['NIT del Cliente'] || '').toLowerCase().trim();
    const clienteQuery = (dataSearch['Nombre del Cliente'] || '').toLowerCase().trim();
    const estadoQuery = (dataSearch['Estado'] || '').toLowerCase().trim();

    // Siempre partir de la lista original
    this.OrderTableRow = this.OrderTableRow.filter(orden => {
      const ordenMatch = !ordenQuery || orden.Orden.toString().includes(ordenQuery);
      const nitMatch = !nitQuery || orden.NIT.toLowerCase().includes(nitQuery);
      const clienteMatch = !clienteQuery || orden.Cliente.toLowerCase().includes(clienteQuery);
      const estadoMatch = !estadoQuery || orden.Estado.toLowerCase().includes(estadoQuery);

      return ordenMatch && nitMatch && clienteMatch && estadoMatch;
    });
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

  downloadOrder(order: any) {
    this.generateOrderPDF(order.orderId, this.orders);
  }

  exportDailyReport(): void {
    const today = new Date();
    const filteredOrders = this.orders.filter((orden: any) => {
      const orderDate = new Date(orden.fecha);
      return orderDate.toDateString() === today.toDateString();
    });

    this.generateExcel(filteredOrders, 'ordenes_dia');
  }

  exportMonthlyReport(): void {
    const today = new Date();
    const filteredOrders = this.orders.filter((orden: any) => {
      const orderDate = new Date(orden.fecha);
      return (
        orderDate.getMonth() === today.getMonth() &&
        orderDate.getFullYear() === today.getFullYear()
      );
    });

    this.generateExcel(filteredOrders, 'ordenes_mes');
  }

  exportYearlyReport(): void {
    const today = new Date();
    const filteredOrders = this.orders.filter((orden: any) => {
      const orderDate = new Date(orden.fecha);
      return orderDate.getFullYear() === today.getFullYear();
    });

    this.generateExcel(filteredOrders, 'ordenes_anio');
  }

  generateExcel(data: any[], filename: string): void {
    const dataExcel = data.map((orden: any) => ({
      'Número de Orden': orden.id,
      'Fecha': new Date(orden.fecha).toLocaleDateString(),
      'NIT del Cliente': orden.cliente?.Nit || 'N/A',
      'Nombre del Cliente': `${orden.cliente?.Nombre || ''} ${orden.cliente?.Apellido || ''}`.trim(),
      'Placa del Vehículo': orden.vehiculo?.Placa || 'N/A',
      'Marca': orden.vehiculo?.Marca || 'N/A',
      'Modelo': orden.vehiculo?.Modelo || 'N/A',
      'Año': orden.vehiculo?.Anio || 'N/A',
      'Mano de Obra': orden.manoDeObra,
      'Abono': orden.abono,
      'Total': orden.total,
      'Estado': orden.estado
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = { Sheets: { 'Órdenes': worksheet }, SheetNames: ['Órdenes'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  }

  async generateOrderPDF(orderId: number, orders: any[]) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const cliente = order.cliente;
    const vehiculo = order.vehiculo;

    // Cargar imagen del logo desde assets
    const logoBase64 = await fetch('assets/images/ttss.png')
      .then(res => res.blob())
      .then(blob => new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      }));

    const repuestos = order.detalles
      .filter((d: any) => d.tipo === 'producto')
      .map((item: any) => [
        { text: item.cantidad.toString(), alignment: 'center' },
        { text: this.getProducto(item.productoId), alignment: 'left' },
        { text: `Q${item.precioUnitario}`, alignment: 'right' }
      ]);

    const servicios = order.detalles
      .filter((d: any) => d.tipo === 'servicio')
      .map((item: any) => [
        { text: item.cantidad.toString(), alignment: 'center' },
        { text: this.getServicio(item.servicioId), alignment: 'left' },
        { text: `Q${item.precioUnitario}`, alignment: 'right' }
      ]);

    const totalRepuestos = repuestos.reduce((sum: any, i: any) => sum + parseFloat(i[2].text.replace('Q', '')), 0);
    const totalServicios = servicios.reduce((sum: any, i: any) => sum + parseFloat(i[2].text.replace('Q', '')), 0);

    const docDefinition: any = {
      content: [
        {
          columns: [
            {
              image: logoBase64,
              width: 100
            },
            {
              text: 'ORDEN DE TRABAJO',
              alignment: 'right',
              style: 'header',
              margin: [0, 20, 0, 0]
            }
          ]
        },
        {
          text: [
            { text: 'Automotriz "Los Dos"\n', style: 'subheader' },
            { text: 'Dirección: ', bold: true }, '19 avenida 42-25 zona 8 Guatemala, Guatemala\n',
            { text: 'Email: ', bold: true }, 'automotrizlosdos@gmail.com\n',
            { text: 'Tel: ', bold: true }, '52520028\n',
            { text: 'Fecha: ', bold: true }, `${order.fecha}\n`
          ],
          margin: [0, 10, 0, 10],
          style: 'info'
        },
        {
          columns: [
            {
              text: `\nCliente:\n${cliente.Nombre} ${cliente.Apellido}\nNIT: ${cliente.Nit}\nTel: ${cliente.Telefono}\nEmail: ${cliente.CorreoElectronico}\nDirección: ${cliente.Direccion}`,
              width: '50%',
              style: 'info'
            },
            {
              text: `\nVehículo:\nMarca: ${vehiculo.Marca}\nModelo: ${vehiculo.Modelo}\nAño: ${vehiculo.Anio}\nColor: ${vehiculo.Color}\nPlaca: ${vehiculo.Placa}`,
              width: '50%',
              style: 'info'
            }
          ],
          margin: [0, 0, 0, 10]
        },
        { text: 'DETALLES DE LA ORDEN', style: 'subheader' },

        { text: 'Repuestos', bold: true, margin: [0, 10, 0, 5] },
        {
          table: {
            widths: ['10%', '*', '20%'],
            body: [
              [
                { text: 'Cant', bold: true, alignment: 'center' },
                { text: 'Descripción', bold: true },
                { text: 'Precio', bold: true, alignment: 'right' }
              ],
              ...repuestos
            ]
          },
          layout: 'lightHorizontalLines'
        },

        {
          text: `Total Repuestos: Q${totalRepuestos.toFixed(2)}`,
          alignment: 'right',
          margin: [0, 5, 0, 10]
        },

        { text: 'Servicios', bold: true, margin: [0, 10, 0, 5] },
        {
          table: {
            widths: ['10%', '*', '20%'],
            body: [
              [
                { text: 'Cant', bold: true, alignment: 'center' },
                { text: 'Descripción', bold: true },
                { text: 'Precio', bold: true, alignment: 'right' }
              ],
              ...servicios
            ]
          },
          layout: 'lightHorizontalLines'
        },

        {
          text: `Total Servicios: Q${totalServicios.toFixed(2)}`,
          alignment: 'right',
          margin: [0, 5, 0, 10]
        },

        { text: 'Mano de Obra', bold: true, margin: [0, 10, 0, 5] },
        {
          text: `Descripción: Desmontar y montar piezas según orden\nTotal Mano de obra: Q${parseFloat(order.manoDeObra).toFixed(2)}`,
          margin: [0, 0, 0, 10]
        },

        {
          text: `Resumen de Pago`,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        {
          text: `Subtotal: Q${(parseFloat(order.total) + parseFloat(order.abono)).toFixed(2)}\nAbono: Q${parseFloat(order.abono).toFixed(2)}\nTOTAL A PAGAR: Q${parseFloat(order.total).toFixed(2)}`,
          alignment: 'right',
          margin: [0, 0, 0, 0]
        }
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        info: {
          fontSize: 10
        }
      },
      defaultStyle: {
        fontSize: 10
      }
    };

    pdfMake.createPdf(docDefinition).open();
  }

  getServicio(servicioId: number): any {
    return this.services.find(s => s.ServicioID === servicioId)?.Nombre || '';
  }

  getProducto(productoId: number): any {
    return this.products.find(p => p.ProductoID === productoId)?.Nombre || '';
  }
}
