import { Injectable } from '@angular/core';
import { BehaviorSubject, fromEvent, merge, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import * as d3 from 'd3';

import { ViewportNode } from '../models/ui/viewport-node.model';

@Injectable({ providedIn: 'root' })
export class ViewportService {

  /** All nodes currently known to the viewport */
  private nodes = new Map<string, ViewportNode>();

  /** Emits when the viewport must be recalculated */
  private viewportChanged$ = new Subject<void>();

  /** Emits when window size changes */
  private readonly resize$ = fromEvent(window, 'resize');

  /**
   * Current zoom transform for the D3 component.
   * BehaviorSubject = relaxed mode — emits last known value immediately.
   */
  public readonly zoomTransform$ =
    new BehaviorSubject<any>(d3.zoomIdentity);

  constructor() {
    //
    // Core MVC: viewport = function(visibleNodes, screenState)
    //
    merge(this.resize$, this.viewportChanged$)
      .pipe(debounceTime(80))
      .subscribe(() => this.recalculate());
  }

  // ---------------------------------------------------------------------------
  // PUBLIC API – called by Angular components
  // ---------------------------------------------------------------------------

  /** Add or update a visible or moved node */
  updateNode(node: ViewportNode) {
    this.nodes.set(node.id, node);
    this.viewportChanged$.next();
  }

  /** Mark a node as hidden (collapsed or removed) */
  hideNode(nodeId: string) {
    const n = this.nodes.get(nodeId);
    if (n) {
      n.visible = false;
      this.viewportChanged$.next();
    }
  }

  /** Replace all nodes on new root or rebuild */
  replaceNodes(newNodes: ViewportNode[]) {
    this.nodes.clear();
    newNodes.forEach(n => this.nodes.set(n.id, n));
    this.viewportChanged$.next();
  }

  // ---------------------------------------------------------------------------
  // CORE: Fit visible nodes to screen, keep top centered
  // ---------------------------------------------------------------------------

  private recalculate() {
    const visible = [...this.nodes.values()].filter(v => v.visible);

    if (!visible.length) return;

    // -------------------------------------------------------------------------
    // Compute bounding box of visible nodes
    // -------------------------------------------------------------------------
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;

    visible.forEach(n => {
      if (n.x < x0) x0 = n.x;
      if (n.y < y0) y0 = n.y;
      if (n.x + n.width > x1) x1 = n.x + n.width;
      if (n.y + n.height > y1) y1 = n.y + n.height;
    });

    const treeWidth = x1 - x0;
    const treeHeight = y1 - y0;

    // -------------------------------------------------------------------------
    // Container size
    // (you can override this with container.getBoundingClientRect() if needed)
    // -------------------------------------------------------------------------
    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    // Extra margin to keep top safe and avoid cut-off
    const marginTop = 80;
    const marginSide = 60;
    const marginBottom = 100;

    // -------------------------------------------------------------------------
    // Compute scale to fit
    // -------------------------------------------------------------------------
    const scale = Math.min(
      screenW / (treeWidth + marginSide * 2),
      screenH / (treeHeight + marginTop + marginBottom),
      1 // never scale bigger than 1
    );

    // -------------------------------------------------------------------------
    // ALWAYS KEEP THE TOP CENTERED
    // -------------------------------------------------------------------------
    const translateX =
      screenW / 2 -
      (treeWidth * scale) / 2 -
      x0 * scale;

    const translateY =
      marginTop -
      y0 * scale;

    const transform = d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(scale);

    // Emit new transform
    this.zoomTransform$.next(transform);
  }
}
