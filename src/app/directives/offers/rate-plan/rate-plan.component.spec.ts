import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RatePlanComponent } from './rate-plan.component';

describe('RatePlanComponent', () => {
  let component: RatePlanComponent;
  let fixture: ComponentFixture<RatePlanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RatePlanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RatePlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
