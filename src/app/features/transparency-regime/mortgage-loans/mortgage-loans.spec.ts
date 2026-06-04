import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MortgageLoans } from './mortgage-loans';

describe('MortgageLoans', () => {
  let component: MortgageLoans;
  let fixture: ComponentFixture<MortgageLoans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MortgageLoans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MortgageLoans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
