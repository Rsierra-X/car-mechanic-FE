import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-simple-table',
  standalone: true,
  imports: [
    NgForOf
  ],
  templateUrl: './simple-table.component.html',
  styleUrl: './simple-table.component.css'
})
export class SimpleTableComponent {
  @Input() headers: string[] = [];
  @Input() rows: any[] = [];
  @Input() showEdit: boolean = false;
  @Output() onDelete: EventEmitter<any[]> = new EventEmitter();
  @Output() onEdit: EventEmitter<any[]> = new EventEmitter();

  onDeleteClick(row: any): void {
    this.onDelete.emit(row);
  }

  onEditClick(row: any): void {
    this.onEdit.emit(row);
  }
}
