import { Component } from '@angular/core';
import {NgFor} from '@angular/common';
import {CatalogLayoutComponent} from '../../../components/catalog-layout/catalog-layout.component';

@Component({
  selector: 'app-orders-catalog',
  imports: [CatalogLayoutComponent, NgFor],
  standalone: true,
  templateUrl: './orders-catalog.component.html',
  styleUrl: './orders-catalog.component.css'
})
export class OrdersCatalogComponent {
  ordenes = [
    { id: 1, cliente: 'Juan Pérez', fecha: '2025-04-01', estado: 'Pendiente' },
    { id: 2, cliente: 'Laura Martínez', fecha: '2025-04-02', estado: 'Entregada' },
  ];
}
