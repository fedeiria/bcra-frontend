import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedTerms } from './fixed-terms';

describe('FixedTerms', () => {
  let component: FixedTerms;
  let fixture: ComponentFixture<FixedTerms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FixedTerms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FixedTerms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
