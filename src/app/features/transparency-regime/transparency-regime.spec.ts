import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransparencyRegime } from './transparency-regime';

describe('TransparencyRegime', () => {
  let component: TransparencyRegime;
  let fixture: ComponentFixture<TransparencyRegime>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransparencyRegime]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransparencyRegime);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
