import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewNewsletterComponent } from './view-newsletter.component';

describe('ViewNewsletterComponent', () => {
  let component: ViewNewsletterComponent;
  let fixture: ComponentFixture<ViewNewsletterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewNewsletterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewNewsletterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
