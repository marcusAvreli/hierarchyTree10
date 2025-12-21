import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgTreeContainerComponent } from './org-tree-container.component';

describe('OrgTreeContainerComponent', () => {
  let component: OrgTreeContainerComponent;
  let fixture: ComponentFixture<OrgTreeContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OrgTreeContainerComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgTreeContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
