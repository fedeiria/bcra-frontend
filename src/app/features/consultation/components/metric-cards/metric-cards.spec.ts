import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MetricCards } from './metric-cards';

describe('MetricCards', () => {
  let component: MetricCards;
  let fixture: ComponentFixture<MetricCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MetricCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MetricCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
