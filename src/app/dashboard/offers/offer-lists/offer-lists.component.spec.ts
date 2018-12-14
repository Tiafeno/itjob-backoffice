import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferListsComponent } from './offer-lists.component';

describe('OfferListsComponent', () => {
  let component: OfferListsComponent;
  let fixture: ComponentFixture<OfferListsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ OfferListsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
