import { Component } from '@angular/core';

@Component({
  selector: 'app-org-tree-container',
  templateUrl: './org-tree-container.component.html',
  styleUrls: ['./org-tree-container.component.scss']
})
export class OrgTreeContainerComponent {
selectedNodeId!: string | number;

  onNodeSelected(id: string | number): void {
	  console.log("parent_node_selected:",id);
    this.selectedNodeId = id;
  }
}
