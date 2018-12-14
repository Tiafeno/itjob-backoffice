import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyListsComponent } from './company-lists.component';

describe('CompanyListsComponent', () => {
  let component: CompanyListsComponent;
  let fixture: ComponentFixture<CompanyListsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyListsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyListsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
