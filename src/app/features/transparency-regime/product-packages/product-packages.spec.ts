import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductPackages } from './product-packages';

describe('ProductPackages', () => {
  let component: ProductPackages;
  let fixture: ComponentFixture<ProductPackages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductPackages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductPackages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
