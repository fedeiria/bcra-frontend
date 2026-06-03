import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccounts } from './savings-accounts';

describe('SavingsAccounts', () => {
  let component: SavingsAccounts;
  let fixture: ComponentFixture<SavingsAccounts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SavingsAccounts]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SavingsAccounts);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
