import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HistoryChart } from './history-chart';

describe('HistoryChart', () => {
  let component: HistoryChart;
  let fixture: ComponentFixture<HistoryChart>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryChart]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HistoryChart);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
