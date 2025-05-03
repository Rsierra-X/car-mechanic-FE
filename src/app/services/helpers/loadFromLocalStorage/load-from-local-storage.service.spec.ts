import { TestBed } from '@angular/core/testing';

import { LoadFromLocalStorageService } from './load-from-local-storage.service';

describe('LoadFromLocalStorageService', () => {
  let service: LoadFromLocalStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadFromLocalStorageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
