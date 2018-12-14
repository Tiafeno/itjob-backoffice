import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PostuledCandidatesComponent } from './postuled-candidates.component';

describe('PostuledCandidatesComponent', () => {
  let component: PostuledCandidatesComponent;
  let fixture: ComponentFixture<PostuledCandidatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PostuledCandidatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostuledCandidatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
