import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CandidateOverviewComponent } from './candidate-overview.component';

describe('CandidateOverviewComponent', () => {
  let component: CandidateOverviewComponent;
  let fixture: ComponentFixture<CandidateOverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CandidateOverviewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CandidateOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
