import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTaxonomyComponent } from './edit-taxonomy.component';

describe('EditTaxonomyComponent', () => {
  let component: EditTaxonomyComponent;
  let fixture: ComponentFixture<EditTaxonomyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTaxonomyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditTaxonomyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
