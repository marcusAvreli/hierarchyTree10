import { Injectable, OnDestroy } from '@angular/core';



@Injectable({ providedIn: 'root' })
export class TreeUtilsService {

  normalizeNode(node: any) {
    if (!node) return;
    node.children = node.children ?? undefined;
    node._children = node._children ?? undefined;
    node.hasChildren = !!node.hasChildren;

    (node.children ?? []).forEach((c:any) => this.normalizeNode(c));
    (node._children ?? []).forEach((c:any) => this.normalizeNode(c));
  }

  findNode(root: any, address: string): any | null {
	   console.log("find_node ","start:"," root:",root, " address:",address);
    if (!root) return null;
    const stack = [root];
    while (stack.length) {
      const n = stack.pop()!;
	  console.log("find_node "," node:",n, " address:",address);
      if (n.id === address) return n;
      const kids = n.children ?? n._children ?? [];
      kids.forEach((k:any) => stack.push(k));
    }
    return null;
  }

  collapseAll(root: any) {
    const recurse = (n: any) => {
      if (n.children) {
        n._children = n.children;
        n.children = undefined;
        n._children.forEach((c: any) => recurse(c));
      } else if (n._children) {
        n._children.forEach((c: any) => recurse(c));
      }
    };
    recurse(root);
  }
}
