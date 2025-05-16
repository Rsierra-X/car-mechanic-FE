import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgClass, NgForOf} from "@angular/common";

@Component({
  selector: 'app-simple-table',
  standalone: true,
  imports: [
    NgForOf,
    NgClass,
  ],
  templateUrl: './simple-table.component.html',
  styleUrl: './simple-table.component.css'
})
export class SimpleTableComponent {
  @Input() headers: string[] = [];
  @Input() rows: any[] = [];
  @Input() showEdit: boolean = false;
  @Input() showDownload: boolean = false;
  @Input() showUpdateStatus: boolean = false;
  @Output() onDelete: EventEmitter<any[]> = new EventEmitter();
  @Output() onEdit: EventEmitter<any[]> = new EventEmitter();
  @Output() onUpdateStatus: EventEmitter<any[]> = new EventEmitter();
  @Output() onDownload: EventEmitter<any[]> = new EventEmitter();

  getEstadoClasses(estado: string): string {
    switch (estado) {
      case 'Entregada':
        return 'bg-green-100 text-green-800';
      case 'En Proceso':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pendiente':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  onDeleteClick(row: any): void {
    this.onDelete.emit(row);
  }

  onEditClick(row: any): void {
    this.onEdit.emit(row);
  }

  onUpdateStatusClick(row: any): void {
    this.onUpdateStatus.emit(row);
  }

  onDownloadClick(row: any): void {
    this.onDownload.emit(row);
  }
}
