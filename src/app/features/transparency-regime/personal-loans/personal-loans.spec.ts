import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalLoans } from './personal-loans';

describe('PersonalLoans', () => {
  let component: PersonalLoans;
  let fixture: ComponentFixture<PersonalLoans>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalLoans]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalLoans);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
