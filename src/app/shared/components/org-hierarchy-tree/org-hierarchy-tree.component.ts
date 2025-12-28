import { Component, ElementRef, Input, AfterViewInit,OnDestroy, OnInit,Output,ViewEncapsulation, ViewChild,EventEmitter,
 OnChanges,
  SimpleChanges


 } from '@angular/core';
import * as d3 from 'd3';
import * as d3flextree from 'd3-flextree';
import { Subscription } from 'rxjs';
import { MeshDataService } from './mesh-data.service';
import {TreeUtilsService} from '../../../tree-utils.service';
import { CardField } from '../../../core/models/ui/card-field.model';
import { NODE_CARD_CONFIG } from '../../../core/models/ui/node-config.model';
const flextree = (d3flextree as any).flextree;
///https://github.com/bsv-blockchain/teranode/blob/d73b9ff2e4459e5d55b70396ab1065cee86bc230/ui/dashboard/src/routes/forks/helpers.ts#L102
//https://github.com/teamapps-org/teamapps/blob/e2f7991872285cb1723aa305a889c179dc8af5e3/teamapps-client/ts/modules/UiTreeGraph.ts#L779
//https://github.com/bsv-blockchain/teranode/blob/d73b9ff2e4459e5d55b70396ab1065cee86bc230/ui/dashboard/src/routes/forks/helpers.ts#L344
//https://github.com/UniStuttgart-VISUS/damast/blob/4fa54a0744f076be0840a26dceb43f0c7077f83a/src/vis/religion-hierarchy.ts#L113
//https://github.com/stiproot/mndy/blob/0ee6fb30ae40548595bfa2b2c025e2d2586d8aea/src/ui/src/expandable-tree/links/link-update.ts
//https://github.com/asherdrake/lastfm-treemap/blob/31ef4e5bcbd816082907a2b88d3ebb0ef0c32f78/frontend/src/app/shared/treemap/treemap.component.ts
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
	@Input() rtl = true;
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
	private TOP_PADDING = 100;
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
		console.log("update_trigger_data","this.rawData: ",this.rawData);
				console.log("update_trigger_data", "myNodes:", this.myNodes);
				console.log("update_trigger_data", "value:", value);
		if (!value) {
			/*this.rawData = value; */return;
		}
		
		// replace old ngOnInit logic
		this.rawData = value;
		console.log("update_trigger_data_3", " rawData:", this.rawData);
		//this.normalizeRawNode(this.rawData);
		this.treeUtils.normalizeNode(this.rawData);
		console.log("update_trigger_data_3_1", " rawData:", this.rawData);
		this.dataReady = true;

		this.tryInit();
		console.log("update_trigger","set_my_nodes"," end:");
	}
  
	constructor(private treeUtils: TreeUtilsService) {}

  // ------------------ lifecycle ------------------
	ngAfterViewInit() {
		console.log("update_trigger","set_after_view_init");
		const rect = this.svgContainer.nativeElement.getBoundingClientRect();
		console.log('update_trigger:', rect.width, rect.height,this.svgContainer.nativeElement.clientHeight);
		this.updateViewSize();
		this.viewReady = true;
		this.tryInit();

		// simple resize handler
		window.addEventListener('resize', () => {
			this.updateViewSize();
			if (this.svg) this.svg.attr('viewBox', `0 0 ${this.width} ${this.height}`);
		});

	}
/*ngOnChanges(changes: SimpleChanges): void {
	console.log("tree:", " ng_on_changes",changes);
		if (!changes['myNodes']) return;

		const current = changes['selectedNodeId'].currentValue;
		const previous = changes['selectedNodeId'].previousValue;
		console.log("tree", " ng_on_changes:" ,"before_return:",current);
		/*if (current == null || current === previous) return;
		console.log("ng_on_changes:",current);
		console.log("ng_on_changes:",current);
		this.onSelectedNodeChanged(current);
		
	}
	*/
	ngOnInit() {	
		if (this.updateTrigger) {
			this.updateTrigger.subscribe(() => {
				console.log("update_trigger_data_2","this.rawData: ",this.rawData);
				console.log("update_trigger_data_2", "myNodes:", this.myNodes);
				
				console.log("update_trigger");
				
				
					this.tryInit();
				
		});}
			
		}
	

	ngOnDestroy() {
		window.removeEventListener('resize', () => {});
	}

	private tryInit() {
		console.log("viewReady:",this.viewReady, " dataReady:",this.dataReady);
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
console.log("create_Svg:",this.width,this.height);
    this.svg = d3.select(el)
      .append('svg')
      .attr('width', this.width)
      .attr('height', this.height)
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
		console.log("update_trigger:",this.rawData);
		if (!this.rawData) return;
		// node/card configuration
		const nodeWidth = 180;
		const nodeHeight = 180;
		const imageWidth = 40;
		const padding = 8;
		const xOffset = 50;
		console.log("update_trigger:","checkPost_1");
		// rebuild hierarchy
		const root = d3.hierarchy(this.rawData, (d: any) => d.children || null);		
		this.root = root;
		
		
		
		this.applyNodeCardConfig(this.rawData);
		root.each((d: any) => {
		  this.computeCardSize(d, nodeHeight, imageWidth, padding);
		});
			
		const nodes = this.root.descendants();


		// layout with flextree
		const tree = flextree()
			.nodeSize((node: any) => [node.cardWidth, node.cardHeight+80]) // card width + height
			.spacing((a: any, b: any) => 200);   // space between siblings

		tree(this.root); // populates node.x / node.y

		
		const links = this.root.links();
		//console.log("update_was_called:",this.rawData, " nodes:",nodes);
		// apply card config (fields) to nodes
		

		console.log("update_trigger:","checkPost_2", " nodes:",nodes, "firstDrawDone:",this.firstDrawDone);
		if (!this.firstDrawDone && nodes.length ==1) {
			console.log("update_trigger","!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
			this.g.selectAll('*').remove();

			requestAnimationFrame(() => {
				
				requestAnimationFrame(() => {
							this.centerTree({ mode: 'root', fitPercent: 30 }, false);
					this.firstDrawDone = true;
				});
			});	
		} else {
		  // later updates can animate
		//  if(nodes.length >0){
		
		  this.centerTree({ mode: 'fit', fitPercent: 30 }, true);
		  //}
			
		}


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
			nodeHeight,
			imageWidth,
			padding
		);

		// store positions
		//nodes.forEach((d: any) => { d.x0 = d.x; d.y0 = d.y; });

		// center tree after layout
		setTimeout(() => {
		requestAnimationFrame(() => {

		this.firstRender = false;
		});
		}, this.duration + 5);


	}


private computeCardSize(d: any, nodeHeight: number, imageWidth: number, padding: number) {
  const fields: CardField[] = d.data.ui?.cardFields || [];


const cardHeight = padding * 3 + 16+100;
  // estimate width using canvas (FAST & SAFE)
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  ctx.font = '0.8em sans-serif';
	//console.log("cardWidth: ", fields);
	//console.log("cardWidth: ", d);
  const maxTextWidth = Math.max(
    ...fields.map(f =>
      ctx.measureText(`${f.label} : ${d.data[f.key] ?? ''}`).width
    ),
    0
  );
d._maxTextWidth = Math.ceil(maxTextWidth);
  const cardWidth = imageWidth + padding * 3 + maxTextWidth+50;

 // d.cardWidth = Math.ceil(cardWidth);
 // d.cardHeight = Math.ceil(cardHeight);
 d.cardWidth = 220;
  d.cardHeight = 100;
  
 
	
	// console.log("cardWidth: ",cardWidth ," cardHeight:",cardHeight, " d.cardWidth:",d.cardWidth," d.cardHeight:",d.cardHeight, " nodeHeight:",nodeHeight, " maxTextWidth:" ,maxTextWidth, " padding:",padding );
}



  // ------------------ centering / sizing ------------------
  



	private centerTree(
	  config: { mode?: 'fit' | 'fixed' | 'root'; fitPercent?: number; fixedZoom?: number } = {},
	  animate = true
	) {
	  if (!this.root || !this.svg) return;

	  const nodes = this.root.descendants();
	  if (!nodes.length) return;

	  const root: any = this.root;
	  const rootW = root.cardWidth ?? this.cardWidth;
	  const rootH = root.cardHeight ?? this.cardHeight;

	  const padding = 120;

	  /* -------------------------------------------------- */
	  /* SCALE (k)                                          */
	  /* -------------------------------------------------- */
	  let k = 1;

	  if (config.mode === 'fixed') {
		k = config.fixedZoom ?? 1;
	  }

	  if (config.mode === 'fit') {
		// Tree bounds in **layout space**
		const minX = d3.min(nodes, (d:any) => d.x) ?? 0;
		const maxX = d3.max(nodes, (d:any) => d.x + (d.cardWidth ?? this.cardWidth)) ?? 0;
		const minY = d3.min(nodes, (d:any) => d.y) ?? 0;
		const maxY = d3.max(nodes, (d:any) => d.y + (d.cardHeight ?? this.cardHeight)) ?? 0;

		const scaleX = (this.width - 2 * padding) / (maxX - minX || 1);
		const scaleY = (this.height - 2 * padding) / (maxY - minY || 1);

		k = Math.min(scaleX, scaleY, 1);
	  }

	  if (config.mode === 'root') {
		k = config.fixedZoom ?? 1;
	  }

	  /* -------------------------------------------------- */
	  /* ROOT ANCHOR (layout space)                          */
	  /* -------------------------------------------------- */
	  const rootCenterX = root.x + rootW / 2;
	  const rootCenterY = root.y + rootH / 2;

	  /* -------------------------------------------------- */
	  /* TARGET POSITION (visual space)                     */
	  /* -------------------------------------------------- */
	  const targetX = this.width / 2;
	  const targetY = this.TOP_PADDING;

	  /* -------------------------------------------------- */
	  /* TRANSLATION                                        */
	  /* -------------------------------------------------- */
	  const dx = targetX - rootCenterX * k;
	  const dy = targetY - rootCenterY * k;

	  const transform = d3.zoomIdentity
		.translate(dx, dy)
		.scale(k);

	  this.applyTransform(transform, animate);
	}

	private applyTransform(transform: any,  animate: boolean) {
		if (animate) {
			this.svg
			  .transition()
			  .duration(this.duration)
			  .call(this.zoom.transform as any, transform);
		} else {
			this.svg.call(this.zoom.transform as any, transform);
		}
		this.currentTransform = transform;
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




  private drawNodes(container: any, nodes: any[],  nodeHeight: number, imageWidth: number, padding: number) {
    //    const nodeSelection = container.selectAll('g.node').data(nodes, (d: any) => d.data.id);
		if (!this.firstRender) {
			this.currentTransform = d3.zoomIdentity;
		}
	   
		const nodeSelection = container.selectAll('g.node').data(nodes, (d: any) => d.data.id);
	
		// ENTER
		const nodeEnter = nodeSelection.enter()
			.append('g')
			.attr('class', 'node test')		
			//.attr('transform', (d:any) => {console.log("draw_nodes:",d.x,minX,d.y, "ROOT_X:",ROOT_X); return `translate(${d.x - minX },${d.y})`})
			.attr('transform', (d:any) => { return `translate(${d.x},${d.y})`})
			.on('click', (_event: any, d: any) => this.nodeClick.emit(d.data.id));
			
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
			const rtl = this.rtl; // 👈 capture component input
			
		nodeEnter.append('clipPath')
		  .attr('id', (d: any) => `clip-text-${d.data.id}`)
		  .attr('clipPathUnits', 'userSpaceOnUse') // 🔑 REQUIRED
		  .append('rect')
		  .attr('x', imageWidth + padding * 2)
		  .attr('y', padding)
		  .attr('width', (d:any) => d.cardWidth - imageWidth - padding * 3)
		  .attr('height', (d:any) => d.cardHeight - padding * 2);
		  
		const bidiSafe = (text: string) => this.bidiSafe(text);
		nodeEnter.each(function (this: SVGGElement, d: any) {
			const g = d3.select(this);
			const fields: CardField[] = d.data.ui?.cardFields || [];
			//const rtl = !!d.data.ui?.rtl; // or this.rtl
			const rtl = true

			const imageWidth = 40;
			const padding = 8;

			const textX = imageWidth + padding * 2;
			const textY = padding;
			const textWidth = d.cardWidth - textX - padding;
			const textHeight = d.cardHeight - padding * 2;

			// ---- foreignObject ----
			const fo = g.append('foreignObject')
				.attr('x', textX)
				.attr('y', textY)
				.attr('width', textWidth)
				.attr('height', textHeight);

			// ---- HTML container ----
			const div = fo.append('xhtml:div')
				.style('width', '100%')
				.style('height', '100%')
				.style('display', 'flex')
				.style('flex-direction', 'column')

				.style('align-items', 'stretch') // ⭐ IMPORTANT
				.style('gap', '4px')
				.style('font-size', '0.8em')
				.style('color', '#fff')
				.style('overflow', 'hidden')
				.style('direction', rtl ? 'rtl' : 'ltr')


			// ---- fields ----
			fields.forEach(field => {
			const value = d.data[field.key] ?? '';
			const safeValue = bidiSafe(value);
			div.append('xhtml:div')
				.style('white-space', 'nowrap')
				.style('overflow', 'hidden')
				.style('text-overflow', 'ellipsis')

				.style('unicode-bidi', 'plaintext') // 🔑 THIS FIXES MIXED RTL/LTR

				.text(`${field.label} : ${safeValue}`);
			});
		});
		const isMatch = (d: any) => {
			console.log("this.rawData._lastSearch_is_match:",this.rawData._lastSearch);
			return  !!this.rawData?._lastSearch &&
			d.data.teudatZehut?.toLowerCase().includes(this.rawData._lastSearch);
			
		};

		// UPDATE + ENTER
		const nodeMerge = nodeEnter.merge(nodeSelection).transition().duration(200)
		const nodeMerge2 = nodeEnter.merge(nodeSelection as any);
		nodeMerge2.classed('highlight', (d: any) => isMatch(d));	
		
		// EXIT
		nodeSelection.exit().remove();
		//end_of_draw_nodes
	}

 bidiSafe(text: string) {
  return /[@.:\/]/.test(text) ? `\u200E${text}\u200E` : text;
}

 

	private updateViewSize() {
		const rect = this.svgContainer.nativeElement.getBoundingClientRect();
		this.width = rect.width;
		this.height = rect.height;
		console.log("updateViewSize:","this.width: ",this.width, " this.height:",this.height);
		if (this.svg) {
			this.svg
			//.attr('width', '100%')
			//.attr('height', '100%')
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
 console.log("expandMatches:","match:",match," addr:",addr, "memoryIndex:",this.memoryIndex);
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
/*
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
  */
    // --- Layout positions (PURE) ---
  const sx = source.x;
  const sy = source.y;

  const tx = target.x;
  const ty = target.y;

  // --- Card sizes ---
  const parentWidth  = source.cardWidth  ?? this.cardWidth;
  const parentHeight = source.cardHeight ?? this.cardHeight;

  const childWidth  = target.cardWidth  ?? this.cardWidth;
  const childHeight = target.cardHeight ?? this.cardHeight;

  // --- Bottom-center of parent ---
  const startX = sx + parentWidth / 2;
  const startY = sy + parentHeight;

  // --- Top-center of child ---
  const endX = tx + childWidth / 2;
  const endY = ty;

  // --- Elbow ---
//  const midY = startY + (endY - startY) / 2;
  const midY = (startY + endY) / 2;
  if (Math.abs(endX - (tx + childWidth / 2)) > 1) {
    console.warn('LINK X DRIFT', { tx, endX, childWidth, target });
  }
  /*console.log('TARGET', {
    x: target.x,
    y: target.y,
    h: target.cardHeight,
    w: target.cardWidth,
    expectedTop: target.y,
    expectedCenter: target.y - target.cardHeight / 2
  });
  */

  return `
    M ${startX},${startY}
    L ${startX},${midY}
    L ${endX},${midY}
    L ${endX},${endY}
  `;
}


}
