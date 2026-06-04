import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PledgeLoans } from './pledge-loans';

describe('PledgeLoans', () => {
  let component: PledgeLoans;
  let fixture: ComponentFixture<PledgeLoans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PledgeLoans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PledgeLoans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
