import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrgHierarchyTreeComponent } from './components/org-hierarchy-tree/org-hierarchy-tree.component';



@NgModule({
  declarations: [
    OrgHierarchyTreeComponent
  ],
  imports: [
    CommonModule
  ],exports:[
	OrgHierarchyTreeComponent
  ]
})
export class SharedModule { }
