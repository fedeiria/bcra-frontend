import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MonetaryVariables } from './monetary-variables';

describe('MonetaryVariables', () => {
  let component: MonetaryVariables;
  let fixture: ComponentFixture<MonetaryVariables>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MonetaryVariables]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MonetaryVariables);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
