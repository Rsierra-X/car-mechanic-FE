import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ButtonComponent} from "../../../shared/components/button/button.component";
import {NgIf} from "@angular/common";
import {ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-client-modal',
  standalone: true,
    imports: [
        ButtonComponent,
        NgIf,
        ReactiveFormsModule
    ],
  templateUrl: './client-modal.component.html',
  styleUrl: './client-modal.component.css'
})
export class ClientModalComponent {
    @Input() isModalEdit = false;
    @Input() clientForm: any;
    @Output() onCreate = new EventEmitter<any>();
    @Output() onUpdate = new EventEmitter<any>();
    @Output() onCFChange = new EventEmitter<any>();
    @Output() showModal = new EventEmitter<boolean>();

}
