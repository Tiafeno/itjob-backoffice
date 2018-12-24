import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturedSwitcherComponent } from './featured-switcher.component';

describe('FeaturedSwitcherComponent', () => {
  let component: FeaturedSwitcherComponent;
  let fixture: ComponentFixture<FeaturedSwitcherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeaturedSwitcherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeaturedSwitcherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
