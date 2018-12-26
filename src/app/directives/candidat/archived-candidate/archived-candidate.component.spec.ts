import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ArchivedCandidateComponent } from './archived-candidate.component';

describe('ArchivedCandidateComponent', () => {
  let component: ArchivedCandidateComponent;
  let fixture: ComponentFixture<ArchivedCandidateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ArchivedCandidateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ArchivedCandidateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
