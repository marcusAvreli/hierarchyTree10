import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as d3 from 'd3';
import { ViewportNode } from '../models/ui/viewport-node.model';

@Injectable({ providedIn: 'root' })
export class ViewportService implements OnDestroy {
  private nodes = new Map<string, ViewportNode>();
  private viewportChanged$ = new Subject<void>();
  private resize$ = fromEvent(window, 'resize');
  private subs = new Subscription();

  // relaxed typing to avoid d3 typing version issues
  public readonly zoomTransform$ = new BehaviorSubject<any>(d3.zoomIdentity);

  constructor() {
    // When either window resizes or nodes change, recalc after small debounce
    this.subs.add(
      merge(this.resize$, this.viewportChanged$)
        .pipe(debounceTime(80))
        .subscribe(() => this.recalculate())
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  // ---------- public API to update node geometry ----------

  updateNode(node: ViewportNode) {
    this.nodes.set(node.id, node);
    this.viewportChanged$.next();
  }

  hideNode(nodeId: string) {
    const n = this.nodes.get(nodeId);
    if (n) {
      n.visible = false;
      this.viewportChanged$.next();
    }
  }

  replaceNodes(newNodes: ViewportNode[]) {
    this.nodes.clear();
    newNodes.forEach(n => this.nodes.set(n.id, n));
    this.viewportChanged$.next();
  }

  // Optionally allow external update to current transform (user zoom)
  updateTransform(transform: any) {
    this.zoomTransform$.next(transform);
  }

  // ---------- core viewport math (only visible nodes) ----------
  private recalculate() {
    const visible = [...this.nodes.values()].filter(v => v.visible);
    if (!visible.length) return;

    // bounding box of visible nodes
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    visible.forEach(n => {
      if (n.x < x0) x0 = n.x;
      if (n.y < y0) y0 = n.y;
      if (n.x + n.width > x1) x1 = n.x + n.width;
      if (n.y + n.height > y1) y1 = n.y + n.height;
    });

    const treeW = x1 - x0;
    const treeH = y1 - y0;

    // Container size — you may replace with container bounding rect if needed
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Margins
    const marginTop = 60;
    const marginBottom = 80;
    const marginSide = 50;

    // compute scale that fits the tree + margins
    const scale = Math.min(
      screenW / (treeW + marginSide * 2),
      screenH / (treeH + marginTop + marginBottom),
      1
    );

    // center horizontally; keep top visible (top margin)
    const translateX = screenW / 2 - (treeW * scale) / 2 - x0 * scale;
    const translateY = marginTop - y0 * scale;

    const transform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);

    // emit transform
    this.zoomTransform$.next(transform);
  }
  
  zoomToFit() {
  const visible = [...this.nodes.values()].filter(n => n.visible);
  console.log("zoom_to_fit",visible);
  if (!visible.length) return;
  console.log("zoom_to_fit",'checkPost_1');
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;

  visible.forEach(n => {
    x0 = Math.min(x0, n.x);
    y0 = Math.min(y0, n.y);
    x1 = Math.max(x1, n.x + n.width);
    y1 = Math.max(y1, n.y + n.height);
  });
console.log("zoom_to_fit",'checkPost_2');
  const treeWidth = x1 - x0;
  const treeHeight = y1 - y0;
console.log("zoom_to_fit",'checkPost_3');
  const screenW = window.innerWidth;
  const screenH = window.innerHeight;

  const margin = 50;
console.log("zoom_to_fit",'checkPost_4');
  const scale = Math.min(
    screenW / (treeWidth + margin * 2),
    screenH / (treeHeight + margin * 2),
    1
  );
console.log("zoom_to_fit",'checkPost_4');
  const translateX = screenW / 2 - (x0 + treeWidth / 2) * scale;
  const translateY = screenH / 2 - (y0 + treeHeight / 2) * scale;

  const t = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
console.log("zoom_to_fit",'checkPost_5');
  this.zoomTransform$.next(t);
}
}