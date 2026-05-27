import { TestBed } from '@angular/core/testing';

import { CreditReportService } from './credit-report-service';

describe('CreditReportService', () => {
  let service: CreditReportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CreditReportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
