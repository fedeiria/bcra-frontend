import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeStats} from './exchange-stats';

describe('ExchangeStats', () => {
  let component: ExchangeStats;
  let fixture: ComponentFixture<ExchangeStats>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExchangeStats]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExchangeStats);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
