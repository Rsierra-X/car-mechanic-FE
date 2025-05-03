import {Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-catalog-layout',
  imports: [
    FormsModule
  ],
  standalone: true,
  templateUrl: './catalog-layout.component.html',
  styleUrl: './catalog-layout.component.css'
})
export class CatalogLayoutComponent {
  @Input() title: string = '';
  search = { nombre: '', fecha: '' };

  onBuscar() {
    console.log('Buscar', this.search);
    // Aquí puedes emitir eventos o manejar la lógica de búsqueda
  }
}
