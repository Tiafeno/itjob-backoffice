import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewTaxonomyComponent } from './new-taxonomy.component';

describe('NewTaxonomyComponent', () => {
  let component: NewTaxonomyComponent;
  let fixture: ComponentFixture<NewTaxonomyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewTaxonomyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewTaxonomyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
