import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeadlineOfferComponent } from './deadline-offer.component';

describe('DeadlineOfferComponent', () => {
  let component: DeadlineOfferComponent;
  let fixture: ComponentFixture<DeadlineOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeadlineOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeadlineOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
