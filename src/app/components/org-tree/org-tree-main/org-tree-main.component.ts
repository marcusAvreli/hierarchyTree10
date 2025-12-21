import { Component, OnInit, OnDestroy, AfterViewInit,EventEmitter } from '@angular/core';
import { takeUntil, tap,map,firstValueFrom  } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import * as d3 from 'd3';


import { BaseComponent } from '../../../core/components/base/base.component';
import { CardField } from '../../../core/models/ui/card-field.model';
import { OrgNode } from '../../../core/models/org-node.model';
import { MaskedItem } from '../../../core/models/ui/masked-item.model';
import { NODE_CARD_CONFIG } from '../../../core/models/ui/node-config.model';
import { OrgNodeService } from '../../../core/backend/org-node.service';
import { LoggerService } from '../../../core/services/logger.service';
import {TreeUtilsService} from './tree-utils.service';
//import { MeshDataService } from './mesh-data.service';

export interface MemoryIndexItem {
  address: string;   // OrgNode.uuid
  path: string[];    // ancestors path
}

@Component({
  selector: 'app-org-tree-main',
  templateUrl: './org-tree-main.component.html',
  styleUrls: ['./org-tree-main.component.scss']
})
export class OrgTreeMainComponent extends BaseComponent implements OnInit,AfterViewInit {
	objectCache = new Map<string, OrgNode>();
	tzIndex = new Map<string, string>();         // TZ  address
	emailIndex = new Map<string, string>();      // email  address
	phoneIndex = new Map<string, string>();      // phone  address
	
	rootNode!: MaskedItem<OrgNode>;
	rootAddress = "root";  
	rootData: any;
	rawData : any;
	updateTreeTrigger = new EventEmitter<void>();
	  private allLoaded = false;
private currentSearchTerm :string="";
  memoryIndex: { address: string; path: string[] }[] = [];
	//items = (dataFile as any).data;
	// constructor(private dataService: MeshDataService) {}
	constructor(private readonly orgNodeService: OrgNodeService
	,private loggerService: LoggerService
	, private treeUtils: TreeUtilsService
	) {
	  
	  super();
	 // console.log("items:",this.items);
  }
  ngOnInit() {
   
	this.orgNodeService.findAll().pipe(tap((rawRes: any) => {
		//this.loggerService.info('raw_object','rest_api','cold_start', rawRes);
	})).subscribe({
		next: (nodes: OrgNode[]) => {
		  this.rawData = nodes[0];
		//  console.log("loaded_rawData:",this.rawData);
		  this.treeUtils.normalizeNode(this.rawData);
		}
		,error:err => {}
		});
		
	//this.rawData = await this.dataService.loadRoot(this.rootAddress);
	
  }
  
  ngAfterViewInit() {
	  	/*
		this.rawData  = this.orgNodeService.findAll().pipe(tap((rawRes: any) => {
		this.loggerService.info('raw_object','rest_api','cold_start', rawRes);
	})).subscribe({
		next: (nodes: OrgNode[]) => {
		  this.rawData = nodes[0];
		  console.log("loaded_rawData:",this.rawData);
		  this.treeUtils.normalizeNode(this.rawData);
		}
		,error:err => {}
		});
		*/
  }
  /*ngOnInit(): void {
    
	this.orgNodeService.findAll().pipe(tap((rawRes: any) => {
        this.loggerService.info('raw_object','rest_api','cold_start', rawRes);
      })).subscribe({
      next: (nodes: OrgNode[]) => {
        const root = nodes.find(n => n.parentCompanyCode === '' && n.title === 'President');
        if (!root) return console.error('No root node found');

        // Masking is done here
        this.rootNode = {
          ...root,
          childrenLoaded: false,
          ui: { cardFields: NODE_CARD_CONFIG['managerial'] || [] }
        };
      },
      error: err => console.error('Failed to load root nodes:', err)
    });


  }*/
  
  
  
  
	async handleNodeClick2(addr: string) {
		//console.log("handle_Node_Click","2",addr);
		//const raw = this.findRawNode(addr);
		const raw = this.treeUtils.findNode(this.rawData, addr);

		//console.log("handle_Node_Click","3","raw",raw);
		// --- ROOT COLLAPSE ---
		if (addr === this.rawData.address && raw?.children) {
		//	console.log("handle_Node_Click","4","raw",raw);
			this.collapseAllRaw(addr);
			this.updateTreeTrigger.emit();
			//  this.child.updateFromParent();
			return;
		}
		//console.log("handle_Node_Click","before_node_exists:","raw:",raw);
		// --- NODE EXISTS ---
		if (raw) {
			if (raw.children?.length) {
			  raw._children = raw.children;
			  raw.children = undefined;
			    this.indexRawSubtree(raw);
			}
			else if (raw._children?.length) {
			  raw.children = raw._children;
			  raw._children = undefined;
			}
			else if (raw.hasChildren) {
				//console.log("handle_Node_Click","before_node_exists:","raw:",raw.hasChildren);
					//console.log("handle_Node_Click","before_node_exists:","raw:",raw, " addr:",addr);
			  const loaded = await this.ensureChildrenRaw(addr);
		  //console.log("handle_Node_Click","6","loaded",loaded);
			  if (loaded?.length) {
				raw.children = loaded;
				raw._children = undefined;
				 this.indexRawSubtree(raw);
			  }
			}
		}
		//console.log("handle_Node_Click","7","this.rawData",this.rawData);
		this.treeUtils.normalizeNode(this.rawData);
		//this.child.updateFromParent();
		//console.log("handle_Node_Click","8","this.rawData",this.rawData);
		this.updateTreeTrigger.emit();
	}
  
  
  
    private findRawNode(address: string): any | null {
		console.log("find_raw_node","1"," address:",address," this_rawData:",this.rawData);
    if (!this.rawData){ 
	console.log("rawData_is_undefined_exiting");
		return null
	};
    const stack = [this.rawData];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.id === address) return n;
      const kids = n.children ?? n._children ?? [];
      for (const k of kids) stack.push(k);
    }
    return null;
  }
  
  
async ensureChildrenRaw(addr: string): Promise<any[] | undefined> {
  console.log("ensureChildrenRaw", "address:", addr);

  const raw = this.findRawNode(addr);
  console.log("ensureChildrenRaw", "address_raw:", raw);

  if (!raw) return undefined;

  // Already loaded in memory
  if (raw.children && raw.children.length) {
    console.log("returning children from memory for", addr);
    return raw.children;
  }

  //console.log("ensureChildrenRaw", "address_raw_haschildren:", raw.hasChildren);

  if (!raw.hasChildren) return undefined;

  // ? FIX: wrap async observable in a Promise
  const loaded = await new Promise<any[] | undefined>((resolve, reject) => {

    this.orgNodeService.getChildNodes(addr, 'managerial')
      .pipe(
        tap((res: any) => {
          this.loggerService.info("ensureChildrenRaw",'raw_object', 'rest_api', 'cold_start', res);
        })
      )
      .subscribe({
        next: (nodes: OrgNode[]) => {
          console.log("ensureChildrenRaw loaded:", nodes);

          if (nodes?.length) {
            raw.children = nodes.map((c: any) => {
              const copy = { ...c };
              copy.children = copy.children ?? undefined;
              copy._children = copy._children ?? undefined;
              copy.hasChildren = !!copy.hasChildren;
              return copy;
            });

            console.log("ensureChildrenRaw transformed raw:", raw);
            resolve(raw.children);
          } else {
            resolve(undefined);
          }
        },
        error: err => {
          console.error(err);
          reject(err);
        }
      });
  });

  return loaded;
}
public async getTargetsForSearch(term: string): Promise<string[]> {
	//this.memoryIndex = this.dataService.memoryIndex;
	//return this.dataService.getTargetsForSearch(term);
	this.currentSearchTerm = term;
		 // console.log("getTargetsForSearch","searchig_for:",term);
//652300617
//595237074
	term = term.toLowerCase();
const addressFromTZ2 = this.tzIndex.get(term);   
//console.log(" addressFromTZ2:",addressFromTZ2,);
 console.log("getTargetsForSearch","searchig_for:",term," addressFromTZ2:",addressFromTZ2);
    let results = this.memoryIndex
        .filter(e => e.address.toLowerCase().includes(addressFromTZ2!))
        .map(e => e.address);
		//console.log("getTargetsForSearch:","2","memoryIndex:",this.memoryIndex, " results:",results);
//console.log("getTargetsForSearch:",results, results.length);
    while (!results.length && !this.allLoaded) {
        await this.loadNextChunk();
		console.log("getTargetsForSearch","after_rest_api_call");
        results = this.memoryIndex
            .filter(e => { console.log("getTargetsForSearch:","2_1 ",e," TZ:",this.tzIndex);  
							const addressFromTZ = this.tzIndex.get(term);    

    // no match in TZ index  skip (or return false)
    if (!addressFromTZ) return false;     return e.address.toLowerCase().includes(addressFromTZ.toLowerCase());
 })
            .map(e => e.address);
			
		console.log("getTargetsForSearch:","3","results:",results, results.length, " memory_index:",this.memoryIndex);
	}
	this.allLoaded = false;
		  return results;
  
	///return loaded;
}

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
  
	private collapseAllRaw(nodeAddress: string) {
		const root = this.findRawNode(nodeAddress);
		if (!root) return;

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
  
  
  
  
  
  
  private async loadNextChunk(): Promise<MemoryIndexItem[]> {
  if (this.allLoaded) return [];

  // ask API for next chunk of results
  try {
    const nodes: OrgNode[] = await firstValueFrom(
      this.orgNodeService.searchChildren(
        this.currentSearchTerm ,    // empty  API returns all
        'managerial'//,
    //    this.nextChunkStart              // optional paging
      )
    );

    console.log("loadNextChunk","loadNextChunk_API_returned:",  this.currentSearchTerm , nodes);

    if (!nodes || nodes.length === 0) {
      this.allLoaded = true;
      return [];
    }
 // ---- 2. Update objectCache + indexes ----
    nodes.forEach(n => {
      if (!n.id) return;

      // -- Object cache --
      this.objectCache.set(n.id, n);

      // -- TZ index --
      if (n.teudatZehut) {
        this.tzIndex.set(n.teudatZehut, n.id);
      }

      // -- Email index --
      if (n.email) {
        this.emailIndex.set(n.email.toLowerCase(), n.id);
      }

      // -- Phone index --
      if ((n as any).phone) {
        this.phoneIndex.set((n as any).phone, n.id);
      }
    });
    // transform ApiNodes  MemoryIndexItem[]
    const chunk: MemoryIndexItem[] = nodes
  .filter(n => typeof n.id === 'string' && n.id.length > 0)   // remove invalid
  .map(n => ({
    address: n.id!,                                         // safe now
   path: [...(n.parentPath ?? [])]                // force string[]
  }));

    this.memoryIndex.push(...chunk);
console.log("this_memoryIndex:",this.memoryIndex);
    // Advance paging pointer
   // this.nextChunkStart += nodes.length;

    // If API says no more results
    /*if (nodes.length < this.chunkPageSize) {
      this.allLoaded = true;
    }
	*/
 this.allLoaded = true;
    return chunk;
  } catch (err) {
    console.error("loadNextChunk API error:", err);
    this.allLoaded = true;
    return [];
  }
}
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
   detectRootNode(nodes: OrgNode[]): OrgNode | null {
  const allIds = new Set(nodes.map(n => n.id));
  const root = nodes.find(n => !allIds.has(n.managerId));
  return root ?? null;   // << FIX
}
  private attachChildrenFromRange(nodes: OrgNode[], root: MaskedItem<OrgNode>) {
  const rootCompany = root.companyCode;

  // direct children = where managerId == root.id
  const directChildren = nodes.filter(n => n.managerId === root.id);

  root.children = directChildren.map(child => ({
    ...child,
    _childrenFromSearch: true,       // IMPORTANT flag
    _descendantFromSearch: true,     // indicates range slice
    childrenLoaded: false,
    children: []
  }));

  root.childrenLoaded = true;
}
  private maskNode(node: OrgNode): MaskedItem<OrgNode> {
    return {
      ...node,
      childrenLoaded: false,
      children: [],
      ui: { cardFields: NODE_CARD_CONFIG['managerial'] || [] }
    };
  }

handleNodeClick(node: MaskedItem<OrgNode>): void {
  this.loggerService.info('handleNodeClick', node);

  if ((node as any)['childrenFetching']) return;

  if (!Array.isArray(node['_hiddenChildren'])) {
    node['_hiddenChildren'] = [];
  }

  // Detect if any visible children were injected by search
  const childrenAreSearchInjected =
    Array.isArray(node.children) &&
    node.children.some((c) => c['_childrenFromSearch']);

  this.loggerService.info(
    'handleNodeClick',
    'childrenAreSearchInjected:',
    childrenAreSearchInjected
  );
const hasDescendantFromSearch = !!node['_descendantFromSearch'];
this.loggerService.info("handleNodeClick","hasDescendantFromSearch:",hasDescendantFromSearch);
  // --------------------------------------------------------
  // CASE 1: COLLAPSE/EXPAND toggle only when children are REAL
  // --------------------------------------------------------
  if (
    Array.isArray(node.children) &&
    node.children.length > 0 &&
    !childrenAreSearchInjected && // Only real children allow collapsing
    node.childrenLoaded
	 && !hasDescendantFromSearch   // ADD THIS
  ) {
    node['_collapsed'] = !node['_collapsed'];

    if (node['_collapsed']) {
      // Move real children hidden
      if ((node['_hiddenChildren'] as MaskedItem<OrgNode>[]).length === 0) {
        node['_hiddenChildren'] = [...node.children];
      }
      node.children = [];
    } else {
      // Restore cached children
      node.children = [...(node['_hiddenChildren'] as MaskedItem<OrgNode>[])];
    }

    this.loggerService.info('handleNodeClick', 'exit_1');
    this.refreshTree();
    return;
  }

  // --------------------------------------------------------
  // CASE 2: EXPAND & MERGE (cache, temporary search children)
  // --------------------------------------------------------
   this.loggerService.info('CASE 2: expand from cache OR search injected');

  const hiddenChildren = node['_hiddenChildren'] as MaskedItem<OrgNode>[];
  const visibleChildren = node.children || [];

  this.loggerService.info(
    'handleNodeClick hiddenChildren:',
    hiddenChildren,
    hiddenChildren.length,
    'visible:',
    visibleChildren.length
  );

  const hasSearchInjectedChildren = visibleChildren.some(
    (c) => c['_childrenFromSearch']
  );

this.loggerService.info(    'handleNodeClick hasSearchInjectedChildren:',     hasSearchInjectedChildren   );
  
this.loggerService.info("handleNodeClick","MERGE CONDITION (corrected)",'	hiddenChildren length:',hiddenChildren.length,'	hasSearchInjectedChildren:',hasSearchInjectedChildren);
  // MERGE CONDITION (corrected)
  if (
    hiddenChildren.length > 0 || // cached real children
    hasSearchInjectedChildren || hasDescendantFromSearch // temporary search children
  ) {
    node['_collapsed'] = false;

    // prefer real cached children over temporary search children
    node.children =
      hiddenChildren.length > 0
        ? [...hiddenChildren]
        : [...visibleChildren];

    // Need to fetch real children?
    if (!node.childrenLoaded || hasSearchInjectedChildren || hasDescendantFromSearch) {
      console.log(
        'handleNodeClick: fetching real children because some are search-injected'
      );
      this.fetchChildren(node, true);
      return;
    }

    this.refreshTree();
    console.log('handleNodeClick exit_2');
    return;
  }

  // --------------------------------------------------------
  // CASE 3: No children  fetch normally
  // --------------------------------------------------------
  console.log('handleNodeClick exit_3');
  this.fetchChildren(node, false);
}

// --- helper method with merge option ---
private fetchChildren(node: MaskedItem<OrgNode>, mergeWithExisting: boolean) {
  (node as any)['childrenFetching'] = true;

  this.orgNodeService.getChildNodes(node.id!, 'managerial')
    .pipe(takeUntil(this.getDestroy$()),
	tap((rawRes: any) => {
        console.log('raw_object','rest_api','merge',mergeWithExisting, rawRes);
      })
	
	)
    .subscribe({
      next: (res: OrgNode[]) => {
        const loaded = res.map(c => this.maskNode(c));
        node.childrenLoaded = true;
		
        delete node['_childrenFromSearch'];
        delete (node as any)['childrenFetching'];

        if (mergeWithExisting && Array.isArray(node.children)) {
          // Merge loaded children with existing children (avoid duplicates)
          const existingIds = new Set(node.children.map(c => c.id));
          for (const child of loaded) {
            if (!existingIds.has(child.id)) node.children.push(child);
			console.log("merging:",node.children);
          }
        } else {
          node.children = loaded;
        }

        // Update _hiddenChildren cache (overwrite search-injected)
        node['_hiddenChildren'] = [...node.children];
		console.log("this.rootNode1",node);
console.log("this.rootNode",this.rootNode);
       this.refreshTree(); // trigger CD
      },
      error: (err) => {
        console.error('Failed to load child nodes:', err);
        delete (node as any)['childrenFetching'];
      }
    });
}


    /** ­ЪДа Tree requests lazy children during search */
  onLoadChildren(event: { query: string; callback: (children: MaskedItem<OrgNode>[]) => void }): void {
    const query = event.query;
console.log("load_children","input_node",query);
 
	   this.orgNodeService.searchChildren(query, 'managerial')
    .pipe(tap((rawRes: any) => {
        console.log('raw_object','rest_api','search', rawRes);
      }))
	
    .subscribe({
      next: (res: OrgNode[]) => {
        // Mask nodes
		console.log("masked:" ,res);
      console.log('flat search result:', res);

      // Mask and normalize nodes
      const maskedFlat: MaskedItem<OrgNode>[] = res.map(n => {
        const m = this.maskNode(n);
        m.children = []; // ensure non-null
        m.childrenLoaded = true;
        return m;
      });

      console.log('masked flat list:', maskedFlat);

      // Just pass the flat list to callback
      event.callback(maskedFlat);
        //console.log("app_component loaded nodes count:", masked.length);
      },
      error: (err) => {
        console.error('Failed to load children for search:', err);
        event.callback([]);
      }
    });
  }
 
 
   refreshTree() {
	  console.log("refresh_tree");
  this.rootNode = { ...this.rootNode };
}
private expandAllLevels(node: MaskedItem<OrgNode>) {
  // Force expanded state
  node['_collapsed'] = false;

  // Refresh UI for this level
  this.refreshTree();

  // Recurse into real children
  if (Array.isArray(node.children)) {
    for (const ch of node.children) {
      this.expandAllLevels(ch);
    }
  }
}/*
	private buildTreeFromRange(nodes: OrgNode[], parent: MaskedItem<OrgNode>) {
	  const children = nodes.filter(n => n.managerId === parent.id);

	  parent.children = children.map(child => {
		const wrapped: MaskedItem<OrgNode> = {
		  ...child,
		  _childrenFromSearch: false,
		  _descendantFromSearch: false,
		  childrenLoaded: true,
		  children: []
		};

		// Recursively attach its children
		this.buildTreeFromRange(nodes, wrapped);

		return wrapped;
	  });

	  parent.childrenLoaded = true;
	}*/
	private buildTreeFromRange(nodes: OrgNode[], parent: MaskedItem<OrgNode>) {
  // Find all direct children of this parent
  const children = nodes.filter(n => n.managerId === parent.id);

  // Map each child to a masked node and recursively attach its children
  parent.children = children.map(child => {
    const maskedChild = this.maskNode(child);

    // Mark as REAL children, not search-injected
    maskedChild['_childrenFromSearch'] = false;
    maskedChild['_descendantFromSearch' ]= false;
    maskedChild.childrenLoaded = true;

    // Recursively attach children
    this.buildTreeFromRange(nodes, maskedChild);

    return maskedChild;
  });

  parent.childrenLoaded = true;
}

private indexRawSubtree(node: any, traversalPath: string[] = []) {
	//console.log("indexRawSubtree","node:",node);
  if (!node.id) return;
///console.log("node:",node);
  // --- determine correct parent path ---
  const parentPath: string[] =
    Array.isArray(node.parentPath) && node.parentPath.length
      ? [...node.parentPath]            // API truth
      : [...traversalPath];             // fallback (click traversal)

  // --- prevent duplicates ---
  if (!this.objectCache.has(node.id)) {
    // object cache
    this.objectCache.set(node.id, node);

    // memory index
    this.memoryIndex.push({
      address: node.id,
      path: parentPath
    });
//console.log("node:",node);
//console.log("this_memoryIndex:",this.memoryIndex);
    // secondary indexes
    if (node.teudatZehut) {
      this.tzIndex.set(node.teudatZehut, node.id);
    }

    if (node.email) {
      this.emailIndex.set(node.email.toLowerCase(), node.id);
    }

    if ((node as any).phone) {
      this.phoneIndex.set((node as any).phone, node.id);
    }

    //console.log("indexed:", node.id, parentPath);
  }

  // --- build traversal path for children ---
  const nextTraversalPath = [...parentPath, node.id];

  const kids = node.children ?? node._children ?? [];
  for (const c of kids) {
    this.indexRawSubtree(c, nextTraversalPath);
  }
}
}
