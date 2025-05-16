import { Component } from '@angular/core';
import {Router, RouterLink, RouterLinkActive} from "@angular/router";
import {ButtonComponent} from "../../shared/components/button/button.component";
import {SecurityService} from "../../services/security/security.service";
import {NgIf} from "@angular/common";
import * as XLSX from "xlsx";
import * as FileSaver from "file-saver";
import {OrdersService} from "../../services/orders/orders.service";

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [
    RouterLink,
    ButtonComponent,
    RouterLinkActive,
    NgIf
  ],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent {
  showInventarioSubmenu = true;

  constructor(private securityService: SecurityService, private router: Router,private orderService: OrdersService,) {
  }
  onLogout() {
    this.securityService.logout();
  }
  showNewOrderModal() {
    this.router.navigate(['/orders/create']).then();
  }



  exportarOrdenesEntregadas(): void {
    this.orderService.getOrders().subscribe((ordenes: any[]) => {
        const ordenesEntregadas = ordenes.filter(o => o.estado === 'Entregada');

        const dataExcel = ordenesEntregadas.map(o => ({
          'ID Orden': o.id,
          'Fecha': o.fecha,
          'Nombre Cliente': `${o.cliente.Nombre} ${o.cliente.Apellido}`,
          'Dirección': o.cliente.Direccion,
          'NIT': o.cliente.Nit,
          'Monto': o.cliente.total,
          'Correo Electrónico': o.cliente.CorreoElectronico,
          'Teléfono': o.cliente.Telefono
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataExcel);
        const workbook = { Sheets: { 'Ordenes Entregadas': worksheet }, SheetNames: ['Ordenes Entregadas'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        FileSaver.saveAs(blob, `ordenes_entregadas_${new Date().toISOString().slice(0, 10)}.xlsx`);
      },
      (error) => {
        console.error("Error al cargar órdenes: ", error);
        // Aquí podrías mostrar un mensaje de error en el UI
      })

  }
}
