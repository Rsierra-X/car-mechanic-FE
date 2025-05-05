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
  @Output() onDelete = new EventEmitter<number>();
}
