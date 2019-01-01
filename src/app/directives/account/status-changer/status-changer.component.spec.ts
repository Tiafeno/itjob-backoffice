import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StatusChangerComponent } from './status-changer.component';

describe('StatusChangerComponent', () => {
  let component: StatusChangerComponent;
  let fixture: ComponentFixture<StatusChangerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StatusChangerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StatusChangerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
