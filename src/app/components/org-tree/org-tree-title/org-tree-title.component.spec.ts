import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgTreeTitleComponent } from './org-tree-title.component';

describe('OrgTreeTitleComponent', () => {
  let component: OrgTreeTitleComponent;
  let fixture: ComponentFixture<OrgTreeTitleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgTreeTitleComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgTreeTitleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
