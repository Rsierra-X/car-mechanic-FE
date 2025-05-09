import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {NgForOf} from "@angular/common";

@Component({
  selector: 'app-catalog-layout',
  imports: [NgForOf, FormsModule],
  standalone: true,
  templateUrl: './catalog-layout.component.html',
  styleUrl: './catalog-layout.component.css'
})
export class CatalogLayoutComponent implements OnInit {
  @Input() title: string = '';
  @Input() fields: string[] = [];
  @Input() justRead = false;
  @Input() set readData(data: Record<string, string>) {
    this.fields.forEach(field => {
      this.searchValues[field] = data[field] || '';
    });
  }
  @Output() onSearch = new EventEmitter<Record<string, string>>();

  searchValues: Record<string, string> = {};

  ngOnInit() {
    this.fields.forEach(field => {
      this.searchValues[field] = '';
    });
  }

  emitSearch() {
    this.onSearch.emit({ ...this.searchValues });
  }
}
