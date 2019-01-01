import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedOfferComponent } from './featured-offer.component';

describe('FeaturedOfferComponent', () => {
  let component: FeaturedOfferComponent;
  let fixture: ComponentFixture<FeaturedOfferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeaturedOfferComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturedOfferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
