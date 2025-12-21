import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgHierarchyTreeComponent } from './org-hierarchy-tree.component';

describe('OrgHierarchyTreeComponent', () => {
  let component: OrgHierarchyTreeComponent;
  let fixture: ComponentFixture<OrgHierarchyTreeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgHierarchyTreeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgHierarchyTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
