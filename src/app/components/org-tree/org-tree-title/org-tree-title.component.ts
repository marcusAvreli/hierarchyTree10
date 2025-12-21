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
		/*,children: [
          { id: 'd1a', firstName: 'Noam', lastName: 'Bar', divisionName: 'Finance Ops' },
          { id: 'd1b', firstName: 'Yael', lastName: 'Sharon', divisionName: 'Payroll' }
        ]
		*/
      },
      {
        id: 'd2',
        firstName: 'Amit',
        lastName: 'Katz',
        divisionName: 'Engineering'
		/*, children: [
          { id: 'd2a', firstName: 'Eyal', lastName: 'Ben-David', divisionName: 'Backend' },
          { id: 'd2b', firstName: 'Lior', lastName: 'Gold', divisionName: 'Frontend' }
        ]*/
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
  /*
private layoutFirstLevelChess(): void {
  if (!this.root || !this.root.children?.length) return;

  const children = this.root.children;

  // ---------------- PASS 1: GEOMETRY ----------------

  const svgEl = this.svgRef.nativeElement;
  const svgWidth = svgEl.clientWidth || 800;
  
  
	const usableWidth =
    svgWidth - this.marginLeft - this.marginRight;
 
  
  // how many nodes fit in one row
  const cols = Math.max(
    this.minCols,
    Math.min(
      Math.floor(usableWidth / this.cellX),
      this.maxCols
    )
  );
  
   const total = children.length;
  const rows = Math.ceil(total / cols);
   this.loggerService.info("layoutFirstLevelChess ","svgWidth:",svgWidth, "this.cellX:",this.cellX, " usableWidth:",usableWidth, " cols_in_one_row:",cols, " rows:",rows);
   
   
  // ---------------- PASS 2: POSITIONING ----------------
   
   
   let index = 0;

  for (let row = 0; row < rows; row++) {
    const nodesInRow = Math.min(cols, total - index);
	
	
	// CENTER THIS ROW AROUND X = 0
    const startX = -((nodesInRow - 1) / 2) * this.cellX;
	this.loggerService.info("layoutFirstLevelChess ", " nodesInRow:",nodesInRow, " startX:",startX);
	
	for (let col = 0; col < nodesInRow; col++) {
      const node = children[index++];

      node.x = startX + col * this.cellX;

      // chess stagger
      node.y =
        this.baseY +
        row * this.cellY +
        (col % 2 === 1 ? this.cellY / 2 : 0);
this.loggerService.info("layoutFirstLevelChess ", node.x," ", node.y);
      // layout deeper children relative to this node
	  this.layoutSubtree(node);
	}
  }
}
*/
  // ---------------- UPDATE ----------------
  private update(source: any) {

  //  const tree = d3.tree().nodeSize([80, 100]);
  const tree = d3.tree()
    .nodeSize([this.nodeWidth + this.nodePaddingX, this.nodeHeight + this.nodePaddingY]);
    tree(this.root);

    // Root fixed at top
    this.root.x = 0;
    this.root.y = 0;
// First-level children: chess layout
this.cols = this.computeCols();

// responsive chess layout
let remainingNodes = this.root.children?.length || 0;
let rowStartIndex = 0;
let y = this.baseY;


//layout
this.layoutFirstLevelChess();
/*
while (remainingNodes > 0) {
  const nodesThisRow = Math.min(this.cols, remainingNodes);
 // const spacing = this.cellX * (this.cols / nodesThisRow);
 const spacing = this.cellX;
  console.log({spacing:spacing,cellX:this.cellX,cols:this.cols,nodesThisRow:nodesThisRow,remainingNodes:remainingNodes});
  // first node X based on alignment
  let firstNodeX = 0;
  if (nodesThisRow === this.cols) {
    // full row: always center
    firstNodeX = -((this.cols - 1) / 2) * this.cellX;
  } else {
    // partial row
    switch (this.partialRowAlign) {
      case 'left':
        firstNodeX = -((this.cols - 1) / 2) * this.cellX;
        break;
      case 'center':
        //firstNodeX = -((nodesThisRow - 1)) * this.cellX;
		firstNodeX = -spacing ;
		console.log("firstNodeX:",firstNodeX," nodesThisRow:",nodesThisRow, " this.cellX:",this.cellX, " spacing:",spacing);
        break;
      case 'right':
       // firstNodeX = ((this.cols - nodesThisRow) / 2) * this.cellX;
	   firstNodeX = -spacing ;
        break;
    }
  }

  for (let i = 0; i < nodesThisRow; i++) {
    const node = this.root.children![rowStartIndex + i];

    // horizontal position
    node.x = firstNodeX + i* this.cellX;
console.log("node_x:",node.x," nodesThisRow:",nodesThisRow," this.cols:",this.cols);
    // vertical stagger: only for full rows
    node.y = y;
    //if (nodesThisRow === this.cols && i % 2 === 1) {
	if (nodesThisRow === this.cols && i % 2 === 1) {
      node.y += this.cellY / 2;
    }else{
		if(i % 2 === 1){
		
			node.y += this.cellY / 2;
		}
		//node.y = y
	}

    this.layoutSubtree(node);
  }

  remainingNodes -= nodesThisRow;
  rowStartIndex += nodesThisRow;
  y += this.cellY;
}
*/
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
  .attr('fill', (d:any) => d.depth === 0 ? '#020617' : '#1d4ed8');
  
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
    /*const sx = d.source.x;
   const sy = d.source.y + this.nodeHeight / 2;

    const tx = d.target.x;
 const ty = d.target.y - this.nodeHeight / 2;

    const midY = (sy + ty) / 2;

    return `
      M ${sx},${sy}
      C ${sx},${midY}
        ${tx},${midY}
        ${tx},${ty}
    `;
	*/
	 const sx = d.source.x;
  const sy = d.source.y + this.nodeHeight / 2;

  const tx = d.target.x;
  const ty = d.target.y - this.nodeHeight / 2;

  // elbow: vertical first, then horizontal
  return `
    M ${sx},${sy}
    V ${(sy + ty) / 2}
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
}

