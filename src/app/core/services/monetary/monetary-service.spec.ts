import { TestBed } from '@angular/core/testing';

import { MonetaryService } from './monetary-service';

describe('MonetaryService', () => {
  let service: MonetaryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MonetaryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
