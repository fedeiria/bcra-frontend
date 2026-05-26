import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckConsultation } from './check-consultation';

describe('CheckConsultation', () => {
  let component: CheckConsultation;
  let fixture: ComponentFixture<CheckConsultation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckConsultation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckConsultation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
