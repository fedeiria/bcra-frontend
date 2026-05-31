import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Monetary } from './monetary';

describe('Monetary', () => {
  let component: Monetary;
  let fixture: ComponentFixture<Monetary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Monetary]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Monetary);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
