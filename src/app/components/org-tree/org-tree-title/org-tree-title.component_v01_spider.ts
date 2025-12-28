import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild
} from '@angular/core';
import { takeUntil, tap,map,firstValueFrom  } from 'rxjs';
import { OrgNode } from '../../../core/models/org-node.model';
import { OrgNodeService } from '../../../core/backend/org-node.service';
import { LoggerService } from '../../../core/services/logger.service';
import * as d3 from 'd3';

interface TreeNode {
  id: string;
  firstName: string;
  lastName: string;
  divisionName: string;
  children?: TreeNode[];
  _children?: TreeNode[];
}

@Component({
  selector: 'app-org-tree-title',
  templateUrl: './org-tree-title.component.html',
  styleUrls: ['./org-tree-title.component.scss']
})
export class OrgTreeTitleComponent  implements AfterViewInit {

  @ViewChild('svg', { static: true }) svgRef!: ElementRef<SVGSVGElement>;

  private svg!: any;
  private g!: any;

  private root!: any;
  private duration = 500;

  private cell = 90;
  private cols = 5;
  private baseY = 140;
  
  partialRowAlign: 'left' | 'center' | 'right' = 'center'; // change as needed
  private marginLeft = 80;
private marginRight = 80;
private minCols = 1;
private maxCols = 8;
private margin = { top: 40, left: 40, right: 40 };


private nodeWidth = 140;
private nodeHeight = 64;

private nodePaddingX = 40;
private nodePaddingY = 100;
private zoomBehavior!: any;

// Derived spacing
private cellX = this.nodeWidth + this.nodePaddingX;
private cellY = this.nodeHeight + this.nodePaddingY;

constructor(private readonly orgNodeService: OrgNodeService
	,private loggerService: LoggerService
	
	) {
	}
  ngAfterViewInit(): void {
    this.initSvg();
    this.initData();
	//this.loadData();
	 console.log(" rootNode_loaded:", this.root);
	
	  
    this.update(this.root);
  }

  // ---------------- SVG ----------------
  private initSvg() {
    this.svg = d3.select(this.svgRef.nativeElement);
	//coordinates of root node
    this.g = this.svg.append('g').attr('transform', 'translate(400,40)');
	
	
	  // --- Add zoom support ---
  this.zoomBehavior = d3.zoom()
    .scaleExtent([0.2, 2]) // min/max zoom
    .on('zoom', (event: any) => {
      this.g.attr('transform', event.transform);
    });

  this.svg.call(this.zoomBehavior as any);
  }

  // ---------------- DATA ----------------
  
  private loadData(){
	  this.orgNodeService.searchByRange()
	    .pipe(
        tap((res: any) => {
          this.loggerService.info("ensureChildrenRaw",'raw_object', 'rest_api', 'cold_start', res);
        })
      )
      .subscribe({
        next: (nodes: OrgNode[]) => {
          console.log("ensureChildrenRaw loaded:", nodes);
		  const rootNode = this.findRootNode(nodes);
		  console.log("ensureChildrenRaw rootNode_loaded:", rootNode);
		
if (!rootNode) return;
          if (nodes?.length) {
            /*rootNode!.children = nodes.map((c: any) => {
              const copy = { ...c };
              copy.children = copy.children ?? undefined;
              copy._children = copy._children ?? undefined;
              copy.hasChildren = !!copy.hasChildren;
              return copy;
            });
			
			*/
			rootNode!.children = nodes.filter(n => n.id !== rootNode.id)   // ✅ remove root
			  .map((n:any) => {
				const copy = { ...n };
				 copy.children = copy.children ?? undefined;
              copy._children = copy._children ?? undefined;
              copy.hasChildren = !!copy.hasChildren;
				return copy;
			  });
			
			this.root = d3.hierarchy(rootNode);
			this.root.x0 = 0;
			this.root.y0 = 0;
            console.log("ensureChildrenRaw transformed raw:", rootNode);
			this.update(this.root);
          // resolve(raw.children);
          }
/*		  else {
            //resolve(undefined);
          }
		  */
        },
        error: (err:any) => {
          console.error(err);
          //reject(err);
        }
      });
  }
  private initData() {
	const data: TreeNode = {
		id: 'ceo',
		firstName: 'Daniel',
		lastName: 'Cohen',
		divisionName: 'Executive',

		children: [
		{
			id: 'd1',
			firstName: 'Sarah',
			lastName: 'Levi',
			divisionName: 'Finance'

		},
		{
			id: 'd2',
			firstName: 'Amit',
			lastName: 'Katz',
			divisionName: 'Engineering'

		},
		{
		id: 'd3',
		firstName: 'Rina',
		lastName: 'Mor',
		divisionName: 'HR'
		}
		,
		{
			id: 'd4',
			firstName: 'Moshe',
			lastName: 'Azulai',
			divisionName: 'Sales'
		}
		,
		{
		id: 'd5',
		firstName: 'Tal',
		lastName: 'Noy',
		divisionName: 'Marketing'
		}
		,
		{
		id: 'd6',
		firstName: 'Yossi',
		lastName: 'Halevi',
		divisionName: 'Support'
		}
		,
		{
		id: 'd7',
		firstName: 'Dana',
		lastName: 'Peretz',
		divisionName: 'Operations'
		},
		{
		id: 'd8',
		firstName: 'Itai',
		lastName: 'Friedman',
		divisionName: 'Security'
		}
		,{
		id: 'd9',
		firstName: 'Maya',
		lastName: 'Ron',
		divisionName: 'Product'
		}
		,
		{
		id: 'd10',
		firstName: 'Omer',
		lastName: 'Ziv',
		divisionName: 'IT'
		}
		,
		{
		id: 'd11',
		firstName: 'Omer2',
		lastName: 'Ziv2',
		divisionName: 'IT2'
		}
	  
	  
    ]
  };

    this.root = d3.hierarchy(data);
    this.root.x0 = 0;
    this.root.y0 = 0;
  }
  /*
  private layoutFirstLevelChess(): void {
  if (!this.root || !this.root.children?.length) return;

  const children = this.root.children;

  // ===== CONFIG =====
  const stepX = this.cellX * 2;     // requested spacing
  const stepY = this.nodeHeight-this.nodeHeight/2+15;// + this.nodePaddingY;
console.log("layoutFirstLevelChess: ", " stepY:",stepY, " stepX:",stepX);
  const wideCount = 4;
  const narrowCount = wideCount - 1;

  const wideStartX =
    -((wideCount - 1) / 2) * stepX;     // -540

  const narrowStartX =
    -((narrowCount - 1) / 2) * stepX;   // -360

  let index = 0;
  let row = 0;

  // ===== LAYOUT =====
  while (index < children.length) {
    const isWideRow = row % 2 === 0;
    const nodesInRow = isWideRow ? wideCount : narrowCount;
    const startX = isWideRow ? wideStartX : narrowStartX;

    for (let col = 0; col < nodesInRow && index < children.length; col++) {
      const node = children[index++];

      node.x = startX + col * stepX;
      node.y = this.baseY + row * stepY;

      // layout deeper levels relative to this node
      this.layoutSubtree(node);

      this.loggerService.info(
        'layoutFirstLevelChess',
        `row=${row}`,
        `col=${col}`,
        `x=${node.x}`,
        `y=${node.y}`
      );
    }

    row++;
  }
}

*/
private layoutFirstLevelChess(): void {
  if (!this.root || !this.root.children?.length) return;

  const svgEl = this.svgRef.nativeElement;
  const width = svgEl.clientWidth || 800;
  const height = svgEl.clientHeight || 600;

  // --- Root in center ---
  this.root.x = width / 2;
  this.root.y = height / 2;

  const children = this.root.children;
  const count = children.length;

  // --- Rectangle-based distribution ---
  const paddingX = 80; // horizontal padding from edges
  const paddingY = 40; // vertical padding from edges
  const availableWidth = width - 2 * paddingX;
  const availableHeight = height - 2 * paddingY;

  const stepAngle = Math.PI / 2; // max vertical spread (top-bottom)
  const topY = this.root.y - availableHeight / 2;
  const bottomY = this.root.y + availableHeight / 2;

  // --- Arrange children evenly around root ---
  const rows = 2; // top row and bottom row
  const cols = Math.ceil(count / rows);
  const stepX = availableWidth / (cols - 1 || 1); // horizontal spacing

  let childIndex = 0;

  for (let row = 0; row < rows; row++) {
    const y = row === 0 ? this.root.y - 100 : this.root.y + 100; // distance from root
    for (let col = 0; col < cols && childIndex < count; col++) {
      const child = children[childIndex++];
      const x = paddingX + col * stepX;
      child.x = x;
      child.y = y;
    }
  }
}
  // ---------------- UPDATE ----------------
	private update(source: any) {

		//  const tree = d3.tree().nodeSize([80, 100]);
		// const tree = d3.tree()
		// .nodeSize([this.nodeWidth + this.nodePaddingX, this.nodeHeight + this.nodePaddingY]);
		// tree(this.root);

		// Root fixed at top
		this.root.x = 0;
		this.root.y = 0;
		// First-level children: chess layout
		this.cols = this.computeCols();


		//layout
		this.layoutFirstLevelChess();

		const nodes = this.root.descendants();
		const links = this.root.links();
		// ---------------- NODES ----------------
		const node = this.g.selectAll('g.node')
		  .data(nodes, (d:any) => d.data.id);

		const nodeEnter = node.enter()
			.append('g')
			.attr('class', 'node')
			.attr('transform', (_:any) => `translate(${source.x0},${source.y0})`)
			.on('click', (_ : any, d:any) => this.toggle(d));

		nodeEnter.append('rect')
			.attr('x', -this.nodeWidth / 2)
			.attr('y', -this.nodeHeight / 2)
			.attr('width', this.nodeWidth)
			.attr('height', this.nodeHeight)
			.attr('rx', 10)
			.attr('fill', (d:any) => d.depth === 0 ? '#1e3c95' : '#484795');
		  
		nodeEnter.append('text')
			.attr('y', -6)
			.attr('text-anchor', 'middle')
			.attr('fill', 'white')
			.attr('font-weight', 600)
			.text((d:any) => `${d.data.firstName} ${d.data.lastName}`);

		nodeEnter.append('text')
			.attr('y', 14)
			.attr('text-anchor', 'middle')
			.attr('fill', '#e5e7eb')
			.attr('font-size', '11px')
			.text((d:any) => d.data.divisionName);


		nodeEnter.merge(node as any)
			.transition()
			.duration(this.duration)
			.attr('transform', (d:any) => `translate(${d.x},${d.y})`);

		node.exit()
			.transition()
			.duration(this.duration)
			.attr('transform', (_:any) => `translate(${source.x},${source.y})`)
			.remove();

    // ---------------- LINKS ----------------
    const link = this.g.selectAll('path.link')
      .data(links, (d:any) => d.target.data.id);

    const linkEnter = link.enter()
      .insert('path', 'g')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', '#9ca3af')
      .attr('stroke-width', 1.5)
      .attr('d', (_:any) => this.linkPath({
        source: source,
        target: source
      }));

    linkEnter.merge(link as any)
      .transition()
      .duration(this.duration)
      .attr('d', (d:any) => this.linkPath(d));

    link.exit()
      .transition()
      .duration(this.duration)
      .attr('d', (_:any) => this.linkPath({
        source: source,
        target: source
      }))
      .remove();

    // Store old positions
    nodes.forEach((d:any) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
	this.centerTree(true);
	this.fitToScreen();
  }
private layoutSubtree(parent: any) {
  if (!parent.children) return;

  let offsetX = -((parent.children.length - 1) * this.cellX) / 2;

  parent.children.forEach((child: any, i: number) => {
    // place child relative to parent
    child.x = parent.x + offsetX + i * this.cellX;
    child.y = parent.y + this.nodeHeight + this.nodePaddingY;

    this.layoutSubtree(child);
  });
}
  // ---------------- LINK PATH (ANTI-OVERLAP) ----------------
  private linkPath(d: any): string {
   const sx = d.source.x;
  const sy = d.source.y + this.nodeHeight / 2;

  const tx = d.target.x;
  const ty = d.target.y - this.nodeHeight / 2;

  const midY = sy + 30; // small drop, avoids sibling illusion

  return `
    M ${sx},${sy}
    V ${midY}
    H ${tx}
    V ${ty}
  `;
  }
  
private centerTree(animate = true) {
  const svgEl = this.svgRef.nativeElement;
  const width = svgEl.clientWidth || 800;

  // Root is ALWAYS x = 0 in our layout
  const rootX = this.root.x ?? 0;

  const viewCenterX = width / 2;

  const translateX = viewCenterX - rootX;

  const transform = `translate(${translateX},${this.margin.top})`;

  if (animate) {
    this.g
      .transition()
      .duration(this.duration)
      .attr('transform', transform);
  } else {
    this.g.attr('transform', transform);
  }
}
private computeCols(): number {
  const svgEl = this.svgRef.nativeElement;
  const width = svgEl.clientWidth || 800;

  // available width for nodes
  const usableWidth = width - this.marginLeft - this.marginRight;

  // number of nodes that can fit
  let cols = Math.floor(usableWidth / this.cellX);

  // clamp to min/max
  cols = Math.max(this.minCols, Math.min(cols, this.maxCols));

  return cols;
}


  // ---------------- TOGGLE ----------------
  private toggle(d: any) {
    if (d.children) {
      d._children = d.children;
      d.children = undefined;
    } else {
      d.children = d._children;
      d._children = undefined;
    }
    this.update(d);
  }
  
  
  
  
  public findRootNode(nodes: OrgNode[]): OrgNode | null {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  // 1️⃣ Prefer nodes with empty parentPath
  const explicitRoots = nodes.filter(
    n => !n.parentPath || n.parentPath.length === 0
  );

  if (explicitRoots.length === 1) {
    return explicitRoots[0];
  }

  if (explicitRoots.length > 1) {
    // if multiple, pick the one with shortest path anyway
    return explicitRoots.reduce((a, b) =>
      (a.parentPath?.length ?? 0) <= (b.parentPath?.length ?? 0) ? a : b
    );
  }

  // 2️⃣ Otherwise, choose node with shortest parentPath
  return nodes.reduce((minNode, current) => {
    const minLen = minNode.parentPath?.length ?? Number.MAX_SAFE_INTEGER;
    const curLen = current.parentPath?.length ?? Number.MAX_SAFE_INTEGER;

    return curLen < minLen ? current : minNode;
  });
}
private fitToScreen() {
  if (!this.root) return;

  const svgEl = this.svgRef.nativeElement;
  const svgWidth = svgEl.clientWidth || 800;
  const svgHeight = svgEl.clientHeight || 600;

  // Get bounding box of all nodes
  const nodes = this.root.descendants();
  const xValues = nodes.map((d:any) => d.x);
  const yValues = nodes.map((d:any) => d.y);
  
  const minX = Math.min(...xValues) - this.nodeWidth / 2;
  const maxX = Math.max(...xValues) + this.nodeWidth / 2;
  const minY = Math.min(...yValues) - this.nodeHeight / 2;
  const maxY = Math.max(...yValues) + this.nodeHeight / 2;

  const treeWidth = maxX - minX;
  const treeHeight = maxY - minY;

  // Compute scale to fit
  const scale = Math.min(svgWidth / treeWidth, svgHeight / treeHeight) * 0.9;

  // Compute translation to center
  const translateX = (svgWidth - treeWidth * scale) / 2 - minX * scale;
  const translateY = (svgHeight - treeHeight * scale) / 2 - minY * scale;

  // Apply transform
  const t = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
  this.svg.transition().duration(this.duration).call(this.zoomBehavior.transform, t);
}
}

