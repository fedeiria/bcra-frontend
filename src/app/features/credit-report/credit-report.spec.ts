import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditReport } from './credit-report';

describe('CreditReport', () => {
  let component: CreditReport;
  let fixture: ComponentFixture<CreditReport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreditReport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreditReport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
