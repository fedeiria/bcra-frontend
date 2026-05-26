import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectedChecks } from './rejected-checks';

describe('RejectedChecks', () => {
  let component: RejectedChecks;
  let fixture: ComponentFixture<RejectedChecks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RejectedChecks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RejectedChecks);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
