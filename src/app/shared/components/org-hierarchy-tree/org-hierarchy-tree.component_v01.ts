import { Component, ElementRef, Input, AfterViewInit,OnDestroy, OnInit,Output,ViewEncapsulation, ViewChild,EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import * as d3flextree from 'd3-flextree';
import { Subscription } from 'rxjs';
import { MeshDataService } from './mesh-data.service';
import {TreeUtilsService} from '../../../tree-utils.service';
import { CardField } from '../../../core/models/ui/card-field.model';
import { NODE_CARD_CONFIG } from '../../../core/models/ui/node-config.model';
const flextree = (d3flextree as any).flextree;
//https://github.com/manirajv06/yunikorn-web/blob/c86fb1b38d8a2dd1fcd9f4232669708b88199159/src/app/components/queue-v2/queues-v2.component.ts#L143
//https://github.com/GSoumyaSri/HRMSWeb/blob/80c17ded6690108adf1f1a3f2ec9e94d0cc4b4f8/src/app/admin/project/d3-org-chart/d3-org-chart.component.ts#L2
//https://github.com/OxfordHCC/Aretha/blob/ecda51469bf98b3e3a181675d0cce1fa9dab42a5/ui/src/app/layout-timeseries/layout-timeseries.component.ts#L4
//https://github.com/epfl-dias/proteus/blob/575c0bcfc5d280d2d1c98c0a907302c5ad9d5b22/tools/panorama/src/app/event-timeline.service.ts#L4
//https://github.com/biosustain/lifelike/blob/master/client/src/app/sankey/abstract/sankey.component.ts#L131
//https://github.com/open-student-environment/xapi-dashboard/blob/5b832d03fa0986c689f3d98edc06e3458705d248/src/app/home/home.component.ts#L3
//https://github.com/uevanson/Angular-RSI-Chart/blob/1d2cf0abb9c4ab735e1ab0e2557bd9b94eb81155/ClientApp/src/app/rsi/rsi-chart.component.ts#L126
//https://github.com/AnishPavuluri/hr-management-ui/blob/64dc80e66cc4dedbb1bba75233b6e09206f1e318/src/app/hr-management/component/claims/claims.component.ts#L5
//https://github.com/VictorHenrique317/boxcluster-visualization/tree/master/src/app
//https://github.com/HayfordMD/d3playground-strongside/blob/bcbda4582dcb0f2554a40720c3a41941652b7083/src/app/treemap/treemap.component.ts#L4
//https://github.com/52North/helgoland-toolbox/blob/627b86bf31d3a3e4c461960e0d9edacb522440d9/projects/helgoland/d3/src/lib/d3-series-graph/d3-series-graph.component.ts#L26
//animate
//https://github.com/SDRC-India/dga-ui/blob/0620265576b20d83713b9145329cd87fe1386d8b/src/app/data-tree/sdrc-data-tree/sdrc-data-tree.component.ts#L89
//zoomin zoomout
//https://github.com/tezedge/tezedge-explorer/blob/40ff6190616474bc055dc967eb43e02aedaa9a90/src/app/shared/factories/tree-map.factory.ts#L33

//https://github.com/Hamza-ye/geoprism-registry/blob/54dc5ba491d57e6ea37bda15854d54eaaab31ea0/georegistry-web/src/main/ng2/src/app/registry/component/hierarchy/hierarchy.component.ts#L907
//https://github.com/Bridxo/BoneStory_2/blob/954a14162ceae0fb5fd40f7b290634429309cbd6/src/provenance-tree-visualization.ts#L473
//https://github.com/senayakagunduz/Zoomable-Treemap-project/tree/f7d2ecdf0ddb4cf049bba60d0a6de7c889f004be/src/app
//"_children.forEach" "d3.zoomIdentity.translate" "angular/core"
@Component({
  selector: 'app-org-hierarchy-tree',
 // template: `<div #svgContainer class="svg-container" style="width:100%; height:100%;"></div>`,
 	templateUrl: './org-hierarchy-tree.component.html',
	styleUrls: ['./org-hierarchy-tree.component.scss'],
  	encapsulation: ViewEncapsulation.None
})
export class OrgHierarchyTreeComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('svgContainer', { static: true }) svgContainer!: ElementRef<HTMLElement>;
	@Input() rootAddress = 'root';
	@Output() nodeClick = new EventEmitter<any>();
	@Input() updateTrigger!: EventEmitter<void>;
	linkStyle: 'curved' | 'rect' = 'rect';
	private firstRender = true;
	@Input() loadChildrenRequest!: (addr: string) => Promise<any[] | undefined>;
	@Input() getTargetsForSearch!: (term: string) => Promise<string[]>;
	@Input() memoryIndex: { address: string; path: string[] }[] = [];
	
	@Input() objectCache: Map<string, any> = new Map<string, any>();
	@Input() tzIndex = new Map<string, string>();         // TZ → address
	@Input() emailIndex = new Map<string, string>();      // email → address
	@Input() phoneIndex = new Map<string, string>();      // phone → address
	private svg!: any;
	private g!: any;
	private outerG!: any;
	private innerG!: any;
	private currentTransform: any = d3.zoomIdentity;
	private root: any;
	lastSearch: string = '';
	private width = 0;
	private height = 0;
	noMore = false;
	private duration = 500;
private cardWidth = 0;
private cardHeight = 0;
	// rawData is the plain JSON tree (mutated when lazy-loading children)
	private rawData: any;
	// prevPositions map used to preserve previous x/y when we rebuild hierarchy
	private prevPos = new Map<string, { x: number; y: number; x0?: number; y0?: number }>();
	private zoom: any;

	private viewReady = false;
	private dataReady = false;
	private firstDrawDone = false;


	public updateFromParent() {
		this.update(); // triggers d3 redraw
	}

	@Input() set myNodes(value: any) {
		if (!value) return;
		console.log("i_called_from","set_my_nodes");
		// replace old ngOnInit logic
		this.rawData = value;
		//this.normalizeRawNode(this.rawData);
		this.treeUtils.normalizeNode(this.rawData);
		this.dataReady = true;
		this.tryInit();
	}
  
	constructor(private treeUtils: TreeUtilsService) {}

  // ------------------ lifecycle ------------------
	ngAfterViewInit() {
		console.log("i_called_from","set_after_view_init");
		this.updateViewSize();
		this.viewReady = true;
		//this.tryInit();

		// simple resize handler
		window.addEventListener('resize', () => {
			this.updateViewSize();
			if (this.svg) this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);
		});

	}

	ngOnInit() {	
		if (this.updateTrigger) {
			this.updateTrigger.subscribe(() => {
				console.log("update_trigger");
				this.update();   // redraw D3
			});
		}
	}

	ngOnDestroy() {
		window.removeEventListener('resize', () => {});
	}

	private tryInit() {
		if (!this.viewReady || !this.dataReady) return;

		this.createSvg();
		console.log("!!!!!!!!!!!!");
		this.update();
		requestAnimationFrame(() => {
			this.enableZoom();
			setTimeout(() => {
				if (this.root) {
				//  this.centerOnAddress(this.root.data.id);
				}
			}, this.duration + 10);
		});
	}

  // ------------------ svg + zoom ------------------
	private enableZoom() {
		if (!this.svg || !this.outerG) return;
		this.svg.call(this.zoom);
		this.outerG.attr('transform', this.currentTransform.toString());
	}


  private createSvg() {
    const el = this.svgContainer.nativeElement;

    this.zoom = d3.zoom()
      .scaleExtent([0.01, 3])
      .on('zoom', (event: any) => {
        this.currentTransform = event.transform;
        if (this.outerG) this.outerG.attr('transform', this.currentTransform.toString());
      });

    // clear previous svg
    d3.select(el).selectAll('svg').remove();

    this.svg = d3.select(el)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', `0 0 ${this.width} ${this.height}`)
      .attr('preserveAspectRatio', 'xMidYMid meet');

    this.outerG = this.svg.append('g').attr('class', 'outer-g');
    this.innerG = this.outerG.append('g').attr('class', 'inner-g');
    this.g = this.innerG;

    this.svg.append('style').text(`
      .node-text { font-family: monospace; font-size:11px; fill: #222; }
      .node-text.highlight { fill: red; font-weight: bold; }
      .node-circle { fill: #69b3a2; stroke: #333; stroke-width: 1.5px; }
      .node-circle.highlight { fill: orange; stroke: red; stroke-width: 2px; }
      .link { fill: none; stroke: #555; stroke-opacity: 0.6; stroke-width: 1.5px; }
    `);

    // reset first draw flag because svg was recreated
    this.firstDrawDone = false;
  }
  
  
   private centerOnAddress(address: string) {
	  console.log("centerOnAddress"," root:", this.root, " address:",address);
    if (!this.root) return;
	 console.log("centerOnAddress","1");
    const node = this.root.descendants().find((d: any) => d.data.id === address);
	console.log("centerOnAddress","2");
    if (!node) return;
console.log("centerOnAddress","3");
    // compute bounds of that node (we'll translate so that node is centered)
    const dx = (this.width / 2) - node.x;
    const dy = (this.height / 2) - node.y;
    const k = this.currentTransform?.k ?? 1;
	console.log("centerOnAddress","dx:",dx, "dy:",dy, " k:",k, " general widht:",this.width, " general height:",this.height);
    const target = d3.zoomIdentity.translate(dx, dy).scale(k);
    this.svg.transition().duration(this.duration).call(this.zoom.transform as any, target);
  }

  // ------------------ update / layout ------------------

	private update() {
		// preserve previous positions
		this.prevPos.clear();
		if (this.g) {
			this.g.selectAll('g.node').each((d: any) => {
				if (d && d.data && d.data.id) {
					this.prevPos.set(d.data.id, { x: d.x ?? 0, y: d.y ?? 0, x0: d.x0, y0: d.y0 });
				}
			});
		}

		if (!this.rawData) return;
 // node/card configuration
  const nodeWidth = 180;
  const nodeHeight = 180;
  const imageWidth = 40;
  const padding = 8;
  const xOffset = 50;
		// rebuild hierarchy
		const root = d3.hierarchy(this.rawData, (d: any) => d.children || null);
		this.root = root;	
		const nodes = this.root.descendants();
//this.measureCards(nodes, imageWidth, padding, nodeHeight);
//computeCardSize
this.applyNodeCardConfig(this.rawData);
root.each((d: any) => {
  this.computeCardSize(d, nodeHeight, imageWidth, padding);
});
		// layout with flextree
		const tree = flextree()
			.nodeSize((node: any) => [node.cardWidth, node.cardHeight+80]) // card width + height
			.spacing((a: any, b: any) => 200);   // space between siblings

		tree(this.root); // populates node.x / node.y

		
		const links = this.root.links();

		// apply card config (fields) to nodes
		

  // initialize previous x0/y0
		nodes.forEach((d: any) => {
			const prev = this.prevPos.get(d.data.id);
			if (prev) {
				d.x0 = prev.x0 ?? prev.x;
				d.y0 = prev.y0 ?? prev.y;
			} else {
				d.x0 = d.parent ? d.parent.x : d.x;
				d.y0 = d.parent ? d.parent.y : d.y;
			}
		});

	// first draw: clear DOM
	if (!this.firstDrawDone) {
		this.g.selectAll('*').remove();
		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				this.centerTree({ mode: 'root', fitPercent: 30 }, false);
				this.firstDrawDone = true;
			});
		});	
	} else {
	  // later updates can animate
	  this.centerTree({ mode: 'fit', fitPercent: 30 }, true);
	}


  // determine min x for normalized drawing
  const minX = d3.min(nodes, (d: any) => d.x) ?? 0;

 

  // --- LINKS ---
  const linkSel = this.g.selectAll('path.link').data(links, (d: any) => d.target.data.id);

  const linkEnter = linkSel.enter().insert('path', 'g')
    .attr('class', 'link')
    .attr('d', (d: any) => this.makeLinkPath(d.source, d.source));

  linkEnter.merge(linkSel as any).transition().duration(this.duration)
    .attr('d', (d: any) => this.makeLinkPath(d.source, d.target));

  linkSel.exit().transition().duration(this.duration)
    .attr('d', (d: any) => this.makeLinkPath(d.source, d.source))
    .remove();

  // --- NODES ---
  // remove old nodes
  this.g.selectAll('g.node').remove();

  // draw rectangle-card nodes
  this.drawNodes(
    this.g,
    nodes,
    minX,
    xOffset,
    nodeWidth,
    nodeHeight,
    imageWidth,
    padding
  );

  // store positions
  nodes.forEach((d: any) => { d.x0 = d.x; d.y0 = d.y; });

  // center tree after layout
  setTimeout(() => {
    requestAnimationFrame(() => {
     // this.centerTree({ mode: 'fixed' });
//	this.centerTree({ mode: 'fit', fitPercent: 10 }, true)
	  //this.centerTree({ mode: 'fixed', fixedZoom: 0.1 }); // keep zoom = 1
      this.firstRender = false;
    });
  }, this.duration + 5);


}


private computeCardSize(d: any, nodeHeight: number, imageWidth: number, padding: number) {
  const fields: CardField[] = d.data.ui?.cardFields || [];

  // estimate height (this part is fine)
  /*const cardHeight =
    padding * 3 +
    Math.max(1, fields.length) * nodeHeight +
    40; // avatar height
	*/
const cardHeight = padding * 3 + 16+100;
  // estimate width using canvas (FAST & SAFE)
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = '0.8em sans-serif';
console.log("cardWidth: ", fields);
console.log("cardWidth: ", d);
  const maxTextWidth = Math.max(
    ...fields.map(f =>
      ctx.measureText(`${f.label} : ${d.data[f.key] ?? ''}`).width
    ),
    0
  );

  const cardWidth = imageWidth + padding * 3 + maxTextWidth+50;

  d.cardWidth = Math.ceil(cardWidth);
  d.cardHeight = Math.ceil(cardHeight);
 
	//d.cardWidth  = 240;
	//d.cardHeight = 100;
	//d.cardWidth  = imageWidth + padding * 3 + maxTextWidth;
    //d.cardHeight = padding * 3 + maxTextHeight+100
	/*
	 d.cardWidth  = imageWidth + padding * 3 + maxTextWidth;
    d.cardHeight = padding * 3 + maxTextHeight+100
	*/
	 console.log("cardWidth: ",cardWidth ," cardHeight:",cardHeight, " d.cardWidth:",d.cardWidth," d.cardHeight:",d.cardHeight, " nodeHeight:",nodeHeight, " maxTextWidth:" ,maxTextWidth, " padding:",padding );
}

/*

private measureCards(nodes: any[], imageWidth: number, padding: number, nodeHeight: number) {
  const temp = this.svg.append('g')
    .attr('visibility', 'hidden');

  nodes.forEach(d => {
    const g = temp.append('g');

    const fields: CardField[] = d.data.ui?.cardFields || [];
    const textX = imageWidth + padding * 2;

    fields.forEach((field, i) => {
      g.append('text')
        .attr('x', textX)
        .attr('y', 20 + i * nodeHeight)
        .style('font-size', '0.8em')
        .text(`${field.label}: ${d.data[field.key] ?? ''}`);
    });

    const texts = g.selectAll('text').nodes() as SVGTextElement[];

    const maxTextWidth = Math.max(...texts.map(t => t.getBBox().width), 0);
    const maxTextHeight = Math.max(...texts.map(t => t.getBBox().height), 0);

    d.cardWidth  = imageWidth + padding * 3 + maxTextWidth;
    d.cardHeight = padding * 3 + maxTextHeight+100
	console.log("measureCards:",d.cardWidth,d.cardHeight);

  
  
    g.remove();
  });

  temp.remove();
}
*/

  // ------------------ centering / sizing ------------------
 private centerTree(
  config: { mode?: 'fit' | 'fixed' | 'root'; fitPercent?: number; fixedZoom?: number } = {},
  animate = true
) {
  if (!this.root || !this.svg) return;
  const nodes = this.root.descendants();
  if (!nodes.length) return;
  
    // ---- SAME normalization as drawNodes ----
  const rawMinX = d3.min(nodes, (d: any) => d.x) ?? 0;
  const normX = (d: any) => d.x - rawMinX;

  const xOffset = 50; // MUST match drawNodes
  let k = config.fixedZoom ?? 1;
  
  if (config.mode === 'root') {
    const root: any = this.root;

    // ---- USE ROOT-SPECIFIC CARD SIZE ----
    const rootCardWidth  = root.cardWidth  ?? this.cardWidth;
    const rootCardHeight = root.cardHeight ?? this.cardHeight;

    // ---- REAL rendered position of ROOT CARD CENTER ----
    const rootVisualCenterX =
      normX(root) + rootCardWidth / 2;

    const rootVisualCenterY =
      root.y + xOffset + rootCardHeight / 2;

    // ---- Center on viewport ----
    const dx = this.width  / 2 - rootVisualCenterX * k;
    const dy = this.height / 2 - rootVisualCenterY * k;

    const target = d3.zoomIdentity.translate(dx, dy).scale(k);

    if (animate) {
      this.svg
        .transition()
        .duration(this.duration)
        .call(this.zoom.transform as any, target);
    } else {
      this.svg.call(this.zoom.transform as any, target);
    }

    this.currentTransform = target;
    return;
  }





  // ---- Normalize X the same way as drawNodes ----
 // const rawMinX = d3.min(nodes, (d: any) => d.x) ?? 0;
 // const normX = (d: any) => d.x - rawMinX;

  // ---- Compute VISUAL bounds (REAL positions on screen) ----
 // const xOffset = 50; // same as drawNodes

  const minVisualX = d3.min(nodes, (d:any) => normX(d)) ?? 0;
  const maxVisualX = d3.max(nodes, (d:any) => normX(d)) ?? 0;

  // Y uses raw y + xOffset (this is where you draw the card)
  const minVisualY = d3.min(nodes, (d:any) => d.y + xOffset) ?? 0;
  const maxVisualY = d3.max(nodes, (d:any) => d.y + xOffset) ?? 0;

  const treeWidth = maxVisualX - minVisualX || 1;
  const treeHeight = maxVisualY - minVisualY || 1;

 // let k: number;

  if (config.mode === 'fixed') {
    k = config.fixedZoom ?? (this.currentTransform?.k ?? 1);
  } else {
    const padding = 120;
    const availableWidth = this.width - 2 * padding;
    const availableHeight = this.height - 2 * padding;

    const scaleX = availableWidth / treeWidth;
    const scaleY = availableHeight / treeHeight;

    k = Math.min(scaleX, scaleY, 1);
  }

  // ---- Compute VISUAL center ----
  const centerX = (minVisualX + maxVisualX) / 2;
  const centerY = (minVisualY + maxVisualY) / 2;

  // ---- Center tree based on REAL rendered position ----
  const dx = this.width / 2 - centerX * k;
  const dy = this.height / 2 - centerY * k;

  const target = d3.zoomIdentity.translate(dx, dy).scale(k);

  if (animate) {
    this.svg.transition().duration(this.duration)
      .call(this.zoom.transform as any, target);
  } else {
    this.svg.call(this.zoom.transform as any, target);
  }

  this.currentTransform = target;
}

	private applyNodeCardConfig(node: any) {
		//console.log("applyNodeCardConfig","node:",node)
		if (!node) return;

		const type = 'managerial';//node.type || 'managerial';
		//console.log("applyNodeCardConfig","type:",type)
		node.ui = node.ui || {};
		node.ui.cardFields = NODE_CARD_CONFIG[type] || [];

		if (node.children) {
			node.children.forEach((c: any) => this.applyNodeCardConfig(c));
		}

		if (node._children) {
			node._children.forEach((c: any) => this.applyNodeCardConfig(c));
		}
	}




  private drawNodes(container: any, nodes: any[], minX: number, xOffset: number, nodeWidth: number, nodeHeight: number, imageWidth: number, padding: number) {
    //    const nodeSelection = container.selectAll('g.node').data(nodes, (d: any) => d.data.id);
  if (!this.firstRender) {
    this.currentTransform = d3.zoomIdentity;
  }
   
	 const nodeSelection = container.selectAll('g.node').data(nodes, (d: any) => d.data.id);

  // ENTER
  const nodeEnter = nodeSelection.enter()
    .append('g')
    .attr('class', 'node test')
    //.attr('transform', (d:any) => `translate(${d.x - minX + xOffset},${d.y})`)
	.attr('transform', (d:any) => `translate(${d.x - minX },${d.y})`)
    .on('click', (_event: any, d: any) => this.nodeClick.emit(d.data.id));
console.log("draw_nodes:", " nodeWidth:", nodeWidth);



  // Append shapes/text only for entering nodes
  nodeEnter.append('rect')
	.attr('width', (d:any) => d.cardWidth)
	.attr('height', (d:any) => d.cardHeight)
    .attr('rx', 20)
    .attr('ry', 20)
    .attr('fill', '#4e79a7')
    .attr('stroke', '#333');

  nodeEnter.append('image')
    .attr('x', padding)
    .attr('y', padding)
    .attr('width', imageWidth)
    .attr('height', 40)
    .attr('preserveAspectRatio', 'xMidYMid slice')
    .attr('href', (d:any) => d.data.imageUrl || 'assets/avatar-placeholder.png');

  nodeEnter.each(function(this: SVGGElement, d:any) {
    const g = d3.select(this);
    const fields: CardField[] = d.data.ui?.cardFields || [];
    const textX = imageWidth + padding * 2;
    const textStartY = 20;
    const getCardHeight = ((fields.length || 1) + 1) * nodeHeight + 10;
	console.log("getCardHeight:",getCardHeight);
   // g.select('rect').attr('height', getCardHeight); // adjust rect height
   //g.select('rect').attr('height', d.cardHeight).attr('width', d.cardWidth)
	//console.log("field_label_d:",d, "fields:",fields);
    fields.forEach((field, i) => {
//		console.log("field_label:",field,d);
      g.append('text')
        .attr('x', textX)
        .attr('y', textStartY + i * 15)
	    //.attr('y', 400)
        .attr('text-anchor', 'start')
        .attr('fill', '#fff')
        .style('font-size', '0.8em')
        .text(field.label+' : '+d.data[field.key] ?? '')
		//.text(field.label ?? '');
    });
  });

const isMatch = (d: any) => {
console.log("this.rawData._lastSearch_is_match:",this.rawData._lastSearch);
return  !!this.rawData?._lastSearch &&
d.data.teudatZehut?.toLowerCase().includes(this.rawData._lastSearch);
//return true;
};

  // UPDATE + ENTER
  const nodeMerge = nodeEnter.merge(nodeSelection)
    .transition() // optional smooth transition
    .duration(200)
	// .classed('highlight', (d: any) => isMatch(d));
	
const nodeMerge2 = nodeEnter.merge(nodeSelection as any);

nodeMerge2
  .classed('highlight', (d: any) => isMatch(d));	


  
	// nodeMerge.select('text')
    //.attr('class', (d: any) => (this.rawData?._lastSearch && d.data.address.toLowerCase().includes(this.rawData._lastSearch)) ? 'node-text highlight' : 'node-text');
  /*nodeUpdate.select('circle')
    .attr('class', (d: any) => (this.rawData?._lastSearch && d.data.address.toLowerCase().includes(this.rawData._lastSearch)) ? 'node-circle highlight' : 'node-circle');
*/
	//  .attr('transform', (d:any) => `translate(${d.x - minX },${d.y})`);
  //.attr('transform', (d:any) => `translate(${d.x - minX + xOffset},${d.y})`);

  // EXIT
  nodeSelection.exit().remove();
  }




  private diagonal(s: any, d: any) {
    return `M ${s.x},${s.y}
            C ${(s.x + d.x) / 2},${s.y}
              ${(s.x + d.x) / 2},${d.y}
              ${d.x},${d.y}`;
  }



 

	private updateViewSize() {
		const rect = this.svgContainer.nativeElement.getBoundingClientRect();
		this.width = rect.width;
		this.height = rect.height;

		if (this.svg) {
			this.svg
			.attr('width', '100%')
			.attr('height', '100%')
			.attr('viewBox', `0 0 ${this.width} ${this.height}`);
		}
	}
	
	private makeLinkPath(s: any, d: any): string {
  if (this.linkStyle === 'rect') {
    return this.rectLink(s, d);
  } else {
    return this.curvedLink(s, d);
  }
}

  // ------------------ helpers to work with rawData ------------------
  // ensure node object shape is consistent
  private normalizeRawNode(node: any) {
    if (!node) return;
    node.children = node.children ?? undefined;
    node._children = node._children ?? undefined;
    node.hasChildren = !!node.hasChildren;
    if (node.children) {
      node.children.forEach((c: any) => this.normalizeRawNode(c));
    }
    if (node._children) {
      node._children.forEach((c: any) => this.normalizeRawNode(c));
    }
  }

  // find node in rawData by address
  private findRawNode(address: string): any | null {
    if (!this.rawData) return null;
    const stack = [this.rawData];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.address === address) return n;
      const kids = n.children ?? n._children ?? [];
      for (const k of kids) stack.push(k);
    }
    return null;
  }

  // lazy-load children into rawData node (pure JSON)



  // ------------------ search ------------------
  public async search(term: string) {
   if (!term?.trim()) {
      this.lastSearch = '';
      this.rawData._lastSearch = '';
      this.update();
	  console.log("search", "search_term_is_empty");
      return;
    }
  console.log("search", "search_in_progress");
    this.lastSearch = term.toLowerCase();
    this.rawData._lastSearch = this.lastSearch;

    // collapse all first
    const collapseRec = (node: any) => {
      if (node.children) {
        node._children = node.children;
        node.children = undefined;
        node._children.forEach((c: any) => collapseRec(c));
      } else if (node._children) {
        node._children.forEach((c: any) => collapseRec(c));
      }
    };
    collapseRec(this.rawData);

//collapseRec = (node: any)
  


const targets = await this.getTargetsForSearch(term);
console.log("component_search_targets:",targets, "lastSearch:", this.rawData._lastSearch, " term:",term);//A01.378.610.250.300.792.380
//await this.collapseNonMatches(this.rawData, targets); // selective collapse
//console.log("this.rawData._lastSearch:",this.rawData._lastSearch);
  await this.expandMatches(this.rawData, this.rawData._lastSearch,targets);
   
    this.treeUtils.normalizeNode(this.rawData);
    this.update();

    // optionally center on first match
    const firstMatchAddr = this.findFirstMatchAddress(this.rawData, this.lastSearch);
    if (firstMatchAddr) {
      // wait for layout, then center that node (optional)
      setTimeout(() => this.centerOnAddress(firstMatchAddr), this.duration + 10);
    }
	
  }
  private async expandMatches(node: any, search: string, targets: string[]): Promise<boolean> {
	  console.log("expandMatches:","node:",node," targets:",targets);

   if (!node) return false;

    const parentTeudatZehut = (node.teudatZehut || '').toLowerCase();
    search = search.toLowerCase();
	const addr = this.tzIndex.get(parentTeudatZehut);
    const match = addr?.includes(search);
 console.log("expandMatches:","match:",match," addr:",addr);
const isOnPath = targets.some(t => {
    // Find the MeshIndexItem in memoryIndex

   const item = this.memoryIndex.find(e => e.address === t);
 console.log("expandMatches:","item:",item," memoryIndex:",this.memoryIndex);
    if (!item || !item.path) return false;
if (!addr) return false;
    // Check if the given address exists in this item's path
    return item.path.some(p => p.toLowerCase() === addr.toLowerCase());
});
 console.log("expandMatches:","match:",match," isOnPath:",isOnPath);
    if (!match && !isOnPath) return false;

    let children = node.children ?? [];
 console.log("expandMatches:"," node.hasChildren:",node.hasChildren, " children.length:",children.length," isOnPath:",isOnPath);
    // Load children only if node is on path
    if (node.hasChildren && children.length==0 && isOnPath) {
     
		const loaded = await this.loadChildrenRequest(node.id);
 console.log("expandMatches:"," loaded:",loaded);
        if (loaded?.length) children = node.children!;
    }

    let childMatch = false;
    for (const ch of children) {
        if (await this.expandMatches(ch, search, targets)) {
            childMatch = true;
        }
    }

    return match || childMatch;
}

 private collapseNonMatches(node: any, targets: string[]): boolean {
  // Returns true if this node or any descendant is a target
  if (!node) return false;
console.log("collapseNonMatches:",node, " targets:",targets);
  const addr = node.teudatZhut?.toLowerCase();
  const match = targets.some(t => t.toLowerCase() === addr);

  let childMatch = false;
  if (node.children?.length) {
    node.children.forEach((c: any) => {
      if (this.collapseNonMatches(c, targets)) childMatch = true;
    });
  }

  // collapse if neither this node nor any child is a match
  if (!match && !childMatch && node.children) {
    node._children = node.children;
    node.children = undefined;
  }

  return match || childMatch;
}

findMatchingAddresses(search: string): string[] {
  const result: string[] = [];
  search = search.toLowerCase();

  function scan(n: any) {
    if (!n) return;
    if ((n.name || '').toLowerCase().includes(search) ||
        (n.address || '').toLowerCase().includes(search)) {
      result.push(n.address);
    }
    if (n.children) {
      for (const ch of n.children) scan(ch);
    }
  }

  scan(this.rawData);  // The full dataset without lazy loading
  return result;
}

  private findFirstMatchAddress(root: any, search: string): string | null {
    if (!search) return null;
    const stack = [root];
    while (stack.length) {
      const n = stack.pop();
      if (!n) continue;
      if ((n.address || '').toLowerCase().includes(search)) return n.address;
      const kids = n.children ?? n._children ?? [];
      for (const k of kids) stack.push(k);
    }
    return null;
  }

 
 

private curvedLink(s: any, d: any): string {
  return `M ${s.x},${s.y}
          C ${(s.x + d.x) / 2},${s.y}
            ${(s.x + d.x) / 2},${d.y}
            ${d.x},${d.y}`;
}

private rectLink(source: any, target: any) {

  const nodes = this.root.descendants();
  const minX = d3.min(nodes, (d: any) => d.x) ?? 0;

  // --- Normalized layout positions ---
  const sx = source.x - minX;
  const sy = source.y;

  const tx = target.x - minX;
  const ty = target.y;

  // --- Real card sizes ---
  const parentWidth  = source.cardWidth  ?? 180;
  const parentHeight = source.cardHeight ?? 60;

  const childWidth  = source.cardWidth  ?? 180;
  const childHeight = source.cardHeight ?? 60;

  // --- Bottom-center of parent ---
  const startX = sx + parentWidth / 2;
  const startY = sy + parentHeight;

  // --- Top-center of child ---
  const endX = tx + childWidth / 2;
  const endY = ty;

  // --- Rectangular elbow ---
  const midY = startY + (endY - startY) / 2;

  return `
    M ${startX},${startY}
    L ${startX},${midY}
    L ${endX},${midY}
    L ${endX},${endY}
  `;
}
/*
private rectLink(source: any, target: any) {

  const minX = d3.min(this.root.descendants(), (d: any) => d.x) ?? 0;
 
  const nodeWidth = 180; // same as drawNodes

  // --- Compute normalized X positions ---
  const sx = source.x - minX ;//+ xOffset;
  const sy = source.y;

  const tx = target.x - minX ;//+ xOffset;
  const ty = target.y;

  // --- Read actual rendered node height from DOM ---
  const parentNode = this.g.select(`g.node[id="${source.data.id}"]`).node() as SVGGElement;
  const childNode  = this.g.select(`g.node[id="${target.data.id}"]`).node() as SVGGElement;

  const parentRect = parentNode?.getBBox();
  const childRect  = childNode?.getBBox();

  const parentHeight = parentRect?.height ?? 60; // fallback
  const childHeight  = childRect?.height ?? 60;

  // --- Bottom middle of parent ---
  const startX = sx + nodeWidth / 2;
  const startY = sy + parentHeight;

  // --- Top middle of child ---
  const endX = tx + nodeWidth / 2;
  const endY = ty;

  // --- Midpoint for rectangular elbow ---
  const midY = startY + (endY - startY) / 2;

  return `
    M ${startX},${startY}
    L ${startX},${midY}
    L ${endX},${midY}
    L ${endX},${endY}
  `;
}
*/
/*private rectLink(s: any, d: any): string {
  const w = 180; // node width
  const h = d.data.ui?.cardHeight ?? 60; // dynamic height

  // parent bottom-middle
  const startX = s.x + w / 2;
  const startY = s.y + h;

  // child top-middle
  const endX = d.x + w / 2;
  const endY = d.y;

  const midY = (startY + endY) / 2;

  return `
    M ${startX} ${startY}
    L ${startX} ${midY}
    L ${endX} ${midY}
    L ${endX} ${endY}
  `;
}*/

}

