import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgTreeMainComponent } from './org-tree-main.component';

describe('OrgTreeMainComponent', () => {
  let component: OrgTreeMainComponent;
  let fixture: ComponentFixture<OrgTreeMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgTreeMainComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgTreeMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
