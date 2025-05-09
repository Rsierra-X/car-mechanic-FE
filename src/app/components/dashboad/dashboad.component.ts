import {Component, inject, OnDestroy, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {SecurityService} from "../../services/security/security.service";
import {Subscription} from "rxjs";
import {InventarioService} from "../../services/inventario-service/inventario.service";
import {CurrencyPipe} from "@angular/common";
import {OrdersService} from "../../services/orders/orders.service";
import {Chart} from "chart.js";
import {ClienteService} from "../../services/clientes-service/cliente.service";

@Component({
  selector: 'app-dashboad',
  imports: [
    RouterLink,
    CurrencyPipe
  ],
  templateUrl: './dashboad.component.html',
  standalone: true,
  styleUrl: './dashboad.component.css'
})
export class DashboadComponent implements OnInit, OnDestroy {
  ingresosMensuales: number = 0;
  totalOrdenes: number = 0;
  totalClientes: number = 0;
  totalInventario: number = 0;
  monthlyRevenueChart: Chart | undefined;
  topProductsChart: Chart | undefined;
  private subs: Subscription[] = [];

  constructor(
    private orderService: OrdersService,
    private clientesService: ClienteService,
    private inventarioService: InventarioService
  ) {}

  ngOnInit(): void {
    this.cargarDatosDelBackend();
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
    if (this.monthlyRevenueChart) {
      this.monthlyRevenueChart.destroy();
    }
    if (this.topProductsChart) {
      this.topProductsChart.destroy();
    }
  }

  crearGraficoLineal(contexto: CanvasRenderingContext2D, titulo: string, etiquetas: string[], datos: number[], color: string): Chart {
    return new Chart(contexto, {
      type: 'line',
      data: {
        labels: etiquetas,
        datasets: [{
          label: titulo,
          data: datos,
          backgroundColor: color,
          borderColor: color,
          fill: false,
          tension: 0.4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            position: 'bottom'
          },
        },
      },
    });
  }

  crearGraficoDeBarras(contexto: CanvasRenderingContext2D, titulo: string, etiquetas: string[], datos: number[], color: string): Chart {
    return new Chart(contexto, {
      type: 'bar',
      data: {
        labels: etiquetas,
        datasets: [{
          label: titulo,
          data: datos,
          backgroundColor: color,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          y: {
            beginAtZero: true,
          },
        },
        plugins: {
          legend: {
            position: 'bottom'
          },
        },
      },
    });
  }

  cargarDatosDelBackend() {
    this.subs.push(
      this.orderService.getOrders().subscribe(ordenesData => {
        let ingresosMensuales = 0;
        ordenesData.forEach(orden => {
          ingresosMensuales += orden.total;
        });
        this.ingresosMensuales = ingresosMensuales;

        this.totalOrdenes = ordenesData.length;

        const ingresosPorMes: { [mes: number]: number } = {};
        ordenesData.forEach(orden => {
          const fecha = new Date(orden.orderDate);
          const mes = fecha.getMonth();
          if (ingresosPorMes[mes]) {
            ingresosPorMes[mes] += orden.total;
          } else {
            ingresosPorMes[mes] = orden.total;
          }
        });
        const etiquetasMeses = [
          'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];
        const datosIngresosMensuales = etiquetasMeses.map((mes, index) => ingresosPorMes[index] || 0);

        const monthlyRevenueChartCtx = document.getElementById('monthly-revenue-chart') as HTMLCanvasElement;
        if (monthlyRevenueChartCtx) {
          if (!this.monthlyRevenueChart) {
            this.monthlyRevenueChart = this.crearGraficoLineal(
              monthlyRevenueChartCtx.getContext('2d')!,
              'Ingresos por Mes',
              etiquetasMeses,
              datosIngresosMensuales,
              '#4CAF50'
            );
          } else {
            this.monthlyRevenueChart.data.datasets[0].data = datosIngresosMensuales;
            this.monthlyRevenueChart.update();
          }
        }


        const productosVendidos: { [nombre: string]: number } = {};
        ordenesData.forEach(orden => {
          orden.orderDetails.forEach((detalle : any) => {
            const nombreProducto = detalle.product.Nombre;
            const cantidad = detalle.quantity;
            if (productosVendidos[nombreProducto]) {
              productosVendidos[nombreProducto] += cantidad;
            } else {
              productosVendidos[nombreProducto] = cantidad;
            }
          });
        });
        const etiquetasProductos = Object.keys(productosVendidos);
        const datosProductosVendidos = Object.values(productosVendidos);

        const topProductsChartCtx = document.getElementById('top-products-chart') as HTMLCanvasElement;
        if (topProductsChartCtx) {
          if (!this.topProductsChart) {
            this.topProductsChart = this.crearGraficoDeBarras(
              topProductsChartCtx.getContext('2d')!,
              'Productos Más Vendidos',
              etiquetasProductos,
              datosProductosVendidos,
              '#3B82F6'
            );
          } else {
            this.topProductsChart.data.labels = etiquetasProductos;
            this.topProductsChart.data.datasets[0].data = datosProductosVendidos;
            this.topProductsChart.update();
          }
        }
      }),
    );

    this.subs.push(
      this.clientesService.getAll().subscribe(clientesData => {
        this.totalClientes = clientesData.length;
      })
    );

    this.subs.push(
      this.inventarioService.getAll().subscribe(inventarioData => {
        this.totalInventario = inventarioData.length;
      })
    );
  }
}
