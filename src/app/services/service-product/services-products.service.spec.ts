import { TestBed } from '@angular/core/testing';

import { ServicesProductsService } from './services-products.service';

describe('ServicesProductsService', () => {
  let service: ServicesProductsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServicesProductsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
