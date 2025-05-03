import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdersCatalogComponent } from './orders-catalog.component';

describe('OrdersCatalogComponent', () => {
  let component: OrdersCatalogComponent;
  let fixture: ComponentFixture<OrdersCatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersCatalogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrdersCatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
