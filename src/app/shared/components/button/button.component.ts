import {Component, EventEmitter, Input, Output} from '@angular/core';
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [
    NgClass
  ],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css'
})
export class ButtonComponent {
  @Input() btnId: string = 'btn-action';
  @Input() iconType: string = '';
  @Input() btnText: string = '';
  @Input() btnColor: string = 'btn-green';
  @Input() padding: string = 'px-6';
  @Input() margin: string = 'my-4';
  @Output() btnClicked = new EventEmitter();
}
