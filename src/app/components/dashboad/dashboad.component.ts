import { Component, OnDestroy, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from "rxjs";
import { InventarioService } from "../../services/inventario-service/inventario.service"; // Asumo que lo mantienes
import { CurrencyPipe, DatePipe, NgClass, NgIf, DecimalPipe } from "@angular/common"; // Añade DecimalPipe
import { OrdersService } from "../../services/orders/orders.service"; // Importa la interfaz Order
import { Chart, registerables } from 'chart.js';
import { ClienteService } from "../../services/clientes-service/cliente.service"; // Asumo que lo mantienes
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import {ButtonComponent} from "../../shared/components/button/button.component";

Chart.register(...registerables);

interface MarcaVehiculoData {
  marca: string;
  cantidad: number;
}

@Component({
  selector: 'app-dashboad',
  imports: [
    RouterLink,
    CurrencyPipe,
    DatePipe,
    NgClass,
    NgIf,
    DecimalPipe,
    ButtonComponent,
    // Añadido para porcentajes
  ],
  templateUrl: './dashboad.component.html',
  standalone: true,
  styleUrls: ['./dashboad.component.css']
})
export class DashboadComponent implements OnInit, OnDestroy, AfterViewInit {
  // Órdenes de trabajo del mes
  ordenesPendientesMes: number = 0;
  ordenesEnProcesoMes: number = 0;
  ordenesEntregadasMes: number = 0;

  // Ingresos
  ingresoMesActual: number = 0;
  ingresoMesAnterior: number = 0;

  ordenes: any[] = [];

  // Gráficos
  private monthlyRevenueChart: Chart | undefined; // El que ya tenías para ingresos históricos
  private marcasrecurrentesChart: Chart | undefined; // Nuevo para marcas

  // Totales generales (si aún los quieres mostrar)
  totalOrdenesGeneral: number = 0;
  totalClientesGeneral: number = 0; // Asumo que lo cargas desde ClienteService
  totalInventarioGeneral: number = 0; // Asumo que lo cargas desde InventarioService

  private subs: Subscription[] = [];

  constructor(
    private orderService: OrdersService,
    private clientesService: ClienteService, // Mantener si se usa
    private inventarioService: InventarioService, // Mantener si se usa
    private cdr: ChangeDetectorRef // Para forzar detección de cambios si es necesario
  ) {}

  ngOnInit(): void {
    // Es mejor llamar a la carga de datos en ngAfterViewInit si los gráficos dependen del DOM
  }

  ngAfterViewInit(): void {
    // Se llama después de que la vista del componente y sus hijos se hayan inicializado.
    // Ideal para interactuar con el DOM (como obtener el canvas para Chart.js).
    this.cargarDatosDashboard();
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
    this.destroyCharts();
  }

  exportarOrdenesEntregadas(): void {
    const fechaActual = new Date().toISOString().slice(0, 10); // 'YYYY-MM-DD'

    const ordenesEntregadasHoy = this.ordenes.filter(o =>
      o.estado === 'Entregada' && o.fecha === fechaActual
    );

    const dataExcel = ordenesEntregadasHoy.map(o => ({
      'ID Orden': o.id,
      'Fecha': o.fecha,
      'Nombre Cliente': `${o.cliente.Nombre} ${o.cliente.Apellido}`,
      'Dirección': o.cliente.Direccion,
      'NIT': o.cliente.Nit,
      'Monto': o.total,
      'Correo Electrónico': o.cliente.CorreoElectronico,
      'Teléfono': o.cliente.Telefono
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataExcel);
    const workbook = { Sheets: { 'Ordenes Entregadas': worksheet }, SheetNames: ['Ordenes Entregadas'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    FileSaver.saveAs(blob, `ordenes_entregadas_${fechaActual}.xlsx`);
  }

  private destroyCharts(): void {
    this.monthlyRevenueChart?.destroy();
    this.marcasrecurrentesChart?.destroy();
    this.monthlyRevenueChart = undefined;
    this.marcasrecurrentesChart = undefined;
  }

  // --- Métodos para crear gráficos (puedes refactorizar los que ya tienes) ---

  private crearGraficoLineal(canvasId: string, titleText: string, labels: string[], data: number[], color: string): Chart | undefined {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.error(`Canvas con ID '${canvasId}' no encontrado.`);
      return undefined;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error(`Contexto 2D no se pudo obtener para '${canvasId}'.`);
      return undefined;
    }

    return new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: titleText,
          data: data,
          backgroundColor: `${color}33`, // Color con opacidad para el área
          borderColor: color,
          fill: true,
          tension: 0.4, // Líneas curvas
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: color
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(200, 200, 200, 0.2)' },
            ticks: {
              color: '#0b0a0a',
              callback: function(value) { // Formatear como moneda
                if (typeof value === 'number') {
                  return 'Q' + value.toLocaleString('es-GT');
                }
                return value;
              }
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: '#0b0a0a' }
          }
        },
        plugins: {
          legend: {
            position: 'top',
            labels: { color: '#0b0a0a', usePointStyle: true }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) { label += ': '; }
                if (context.parsed.y !== null) {
                  label += 'Q' + context.parsed.y.toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
                return label;
              }
            }
          }
        }
      }
    });
  }

  private crearGraficoPie(canvasId: string, titleText: string, labels: string[], data: number[]): Chart | undefined {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas) {
      console.error(`Canvas con ID '${canvasId}' no encontrado.`);
      return undefined;
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error(`Contexto 2D no se pudo obtener para '${canvasId}'.`);
      return undefined;
    }

    // Paleta de colores atractiva para el Pie Chart
    const backgroundColors = [
      '#5E5CE6', '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE',
      '#5AC8FA', '#FFCC00', '#BF5AF2', '#30D158', '#FF453A', '#0A84FF'
    ];
    const hoverBackgroundColors = backgroundColors.map(color => `${color}CC`); // Añadir opacidad para hover

    return new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: titleText,
          data: data,
          backgroundColor: backgroundColors.slice(0, data.length), // Usa solo los colores necesarios
          hoverBackgroundColor: hoverBackgroundColors.slice(0, data.length),
          borderColor: '#2c2c41', // Un borde sutil entre secciones, que combine con fondo oscuro
          borderWidth: 2,
          hoverOffset: 8 // Efecto al pasar el mouse
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right', // Mejor para pie charts con varias categorías
            labels: {
              color: '#0b0a0a',
              usePointStyle: true,
              boxWidth: 15, // Ancho del recuadro de color
              padding: 15 // Espaciado entre elementos de la leyenda
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) { label += ': '; }
                const value = context.parsed;
                const sum = context.dataset.data.reduce((a, b) => Number(a) + Number(b), 0) as number;
                const percentage = sum > 0 ? ((Number(value) / sum) * 100).toFixed(1) + '%' : '0%';
                label += `${value} (${percentage})`;
                return label;
              }
            }
          },
          title: { // Título DENTRO del gráfico
            display: false,
            text: titleText,
            position: 'top',
            align: 'center',
            color: '#0b0a0a',
            font: { size: 16, weight: 'normal' },
            padding: { top: 5, bottom: 15 }
          }
        }
      }
    });
  }


  cargarDatosDashboard(): void {
    this.destroyCharts(); // Limpia gráficos anteriores

    const hoy = new Date();
    const anioActual = hoy.getFullYear();
    const mesActual = hoy.getMonth(); // 0 = Enero, 11 = Diciembre

    const primerDiaMesActual = new Date(anioActual, mesActual, 1);
    const ultimoDiaMesActual = new Date(anioActual, mesActual + 1, 0, 23, 59, 59, 999); // Incluye todo el día

    const primerDiaMesAnterior = new Date(anioActual, mesActual - 1, 1);
    const ultimoDiaMesAnterior = new Date(anioActual, mesActual, 0, 23, 59, 59, 999);


    this.subs.push(
      this.orderService.getOrders().subscribe((ordenes: any[]) => {
          this.ordenes = ordenes;
          this.totalOrdenesGeneral = ordenes.length; // Total general de órdenes

          // Reseteamos contadores para cada carga
          this.ordenesPendientesMes = 0;
          this.ordenesEnProcesoMes = 0;
          this.ordenesEntregadasMes = 0;
          this.ingresoMesActual = 0;
          this.ingresoMesAnterior = 0;

          const conteoMarcas: { [marca: string]: number } = {};
          const ingresosPorMesHistorico: { [key: string]: number } = {}; // Para el gráfico de línea

          ordenes.forEach(orden => {
            const fechaCreacionOrden = new Date(orden.fecha);

            if (orden.estado === 'Pendiente') this.ordenesPendientesMes++;
            if (orden.estado === 'En Proceso') this.ordenesEnProcesoMes++;

            if (orden.estado === 'Entregada') {
              this.ordenesEntregadasMes++;

              // 2. Ingreso del Mes (solo órdenes entregadas)
              this.ingresoMesActual += Number(orden.total);

              // 3. Ingreso Mes anterior
              const fechaEntrega = new Date(orden.fecha);
              if (fechaEntrega >= primerDiaMesAnterior && fechaEntrega <= ultimoDiaMesAnterior) {
                this.ingresoMesAnterior += Number(orden.total);
              }

              // 4. Para gráfico de ingresos históricos
              const anioMesEntrega = `${fechaEntrega.getFullYear()}-${String(fechaEntrega.getMonth()).padStart(2, '0')}`; // YYYY-MM
              ingresosPorMesHistorico[anioMesEntrega] = (ingresosPorMesHistorico[anioMesEntrega] || 0) + Number(orden.total);
            }

            // 5. PIE de marcas más frecuentes
            if (orden.vehiculo) {
              conteoMarcas[orden.vehiculo.Marca] = (conteoMarcas[orden.vehiculo.Marca] || 0) + 1;
            }
          });

          // Preparar datos para el gráfico de PIE de Marcas
          const marcasData = Object.entries(conteoMarcas)
            .map(([marca, cantidad]) => ({ marca, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad) // Ordenar por cantidad descendente
            .slice(0, 10); // Mostrar solo las Top 10 marcas, por ejemplo

          const labelsMarcas = marcasData.map(m => m.marca);
          const dataMarcas = marcasData.map(m => m.cantidad);

          if (labelsMarcas.length > 0) {
            this.marcasrecurrentesChart = this.crearGraficoPie(
              'marcas-recurrentes-chart', // ID del canvas en el HTML
              'Marcas Más Recurrentes',
              labelsMarcas,
              dataMarcas
            );
          } else {
            this.mostrarMensajeEnCanvas('marcas-recurrentes-chart', 'No hay datos de marcas.');
          }


          // Preparar datos para el gráfico de Ingresos Históricos por Mes (últimos 12 meses)
          const etiquetasMesesHistoricos: string[] = [];
          const datosIngresosMensualesHistoricos: number[] = [];
          const locales = 'es-GT'; // Para nombres de meses en español
          for (let i = 11; i >= 0; i--) {
            const fecha = new Date(anioActual, mesActual - i, 1);
            const anioMesKey = `${fecha.getFullYear()}-${String(fecha.getMonth()).padStart(2, '0')}`;
            etiquetasMesesHistoricos.push(fecha.toLocaleDateString(locales, { month: 'short', year: '2-digit' }));
            datosIngresosMensualesHistoricos.push(ingresosPorMesHistorico[anioMesKey] || 0);
          }

          if (datosIngresosMensualesHistoricos.some(d => d > 0)) { // Solo crea el gráfico si hay datos
            this.monthlyRevenueChart = this.crearGraficoLineal(
              'monthly-revenue-chart', // ID del canvas en el HTML
              'Ingresos Mensuales (Entregadas)',
              etiquetasMesesHistoricos,
              datosIngresosMensualesHistoricos,
              '#4CAF50' // Verde
            );
          } else {
            this.mostrarMensajeEnCanvas('monthly-revenue-chart', 'No hay datos de ingresos históricos.');
          }


          this.cdr.detectChanges(); // Notificar a Angular de los cambios
        },
        (error) => {
          console.error("Error al cargar órdenes: ", error);
          // Aquí podrías mostrar un mensaje de error en el UI
        })
    );

    // Cargar otros datos (Clientes, Inventario) si aún los necesitas mostrar
    this.subs.push(
      this.clientesService.getAll().subscribe(clientes => {
        this.totalClientesGeneral = clientes.length;
        this.cdr.detectChanges();
      })
    );
    this.subs.push(
      this.inventarioService.getAll().subscribe(inventario => {
        this.totalInventarioGeneral = inventario.length;
        this.cdr.detectChanges();
      })
    );
  }

  private mostrarMensajeEnCanvas(canvasId: string, mensaje: string): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Limpiar el canvas por si había un gráfico anterior
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Estilo del mensaje
        ctx.font = "16px 'Segoe UI', sans-serif";
        ctx.fillStyle = "#888"; // Un color grisáceo
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        // Dibujar el mensaje en el centro del canvas
        ctx.fillText(mensaje, canvas.width / 2, canvas.height / 2);
      }
    }
  }
}
