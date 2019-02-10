import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyOffersComponent } from './company-offers.component';

describe('CompanyOffersComponent', () => {
  let component: CompanyOffersComponent;
  let fixture: ComponentFixture<CompanyOffersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyOffersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyOffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
