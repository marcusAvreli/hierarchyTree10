// --------------------------------------------------
// 4) mesh-data.service.ts  (replace with real backend calls)
// --------------------------------------------------
import { Injectable } from '@angular/core';
interface MeshIndexItem {
  address: string;
  path: string[];
}
@Injectable({ providedIn: 'root' })
export class MeshDataService {
	private descNodes!: Record<string, string[]>; //| null = null;
	descMap: Record<string, string[]> = {}; // address → path
	descList: { address: string; path: string[] }[] = [];

	memoryIndex: MeshIndexItem[] = [];
	private nextChunkStart = 0;
	private chunkLimitMB = 0.5; // max 0.5 MB per chunk
	private allLoaded = false;

	fullIndex: MeshIndexItem[] = [];

	
//  constructor(private indexUrl :string = '/assets/mesh-search-index.json') {}
async loadDescNodes(): Promise<Record<string, string[]>> {
  const url = '/assets/data/MeSHTree.json';
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to load MeSHTree.json');
  const json = await response.json();

  const map: Record<string, string[]> = {};

  function walk(node: any) {
    const addr = node.address;
    const children = node.children || [];
    map[addr] = children.map((c: any) => c.address);

    children.forEach(walk);
  }

  walk(json); // build map recursively

  return map;
}

  // preload small initial chunk
  // preload small initial chunk
 async preloadInitialChunk() {
    await this.loadNextChunk();
  }


 

async loadSearchIndex() {
	const response = await fetch('/assets/data/mesh-search-index.json');
	if (!response.ok) throw new Error('Failed to load full index');

	const items: MeshIndexItem[] = await response.json();
	this.memoryIndex = items;
	this.nextChunkStart = items.length;
	this.allLoaded = true;

	console.log(`[FULL LOAD] Loaded ${items.length} items into memoryIndex`);
}


  // ---------------------- load root node ----------------------
  async loadRoot(rootAddress: string): Promise<any> {
    const url = `/assets/data/mesh-root.json`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to load root node');
    const json = await response.json();
    return {
      ...json,
      hasChildren: true,
      children: undefined // indicate lazy loading
    };
  }

  // ---------------------- load children by address ----------------------
 async loadChildren(address: string): Promise<any[]> {
  const fileName = `mesh-children-${address}.json`;

  const url = `/assets/data/${fileName}`;

  console.log("Loading children file:", url);

  try {
    const resp = await fetch(url);

    if (!resp.ok) {
      console.warn("No children file exists for", address);
      return [];
    }

    const children = await resp.json();
    return children;   // ← THESE ARE THE REAL CHILDREN
  }
  catch (err) {
    console.error("Error loading children:", err);
    return [];
  }
}

  
  // ---------------------- optional helper: get search index targets ----------------------

  async getTargetsForSearch(term: string): Promise<string[]> {
	  console.log("updated_getTargetsForSearch:",term);
  /*if (!this.descList.length) {
    await this.loadSearchIndex();
  }

  const word = term.toLowerCase();

  return this.descList
    .filter(e => e.address.toLowerCase().includes(word))
    .map(e => e.address);
	*/
	term = term.toLowerCase();
console.log("results_2:","memoryIndex:",this.memoryIndex);
    let results = this.memoryIndex
        .filter(e => e.address.toLowerCase().includes(term))
        .map(e => e.address);
console.log("results:",results, results.length);
    while (!results.length && !this.allLoaded) {
        await this.loadNextChunk();
        results = this.memoryIndex
            .filter(e => e.address.toLowerCase().includes(term))
            .map(e => e.address);
			
		console.log("results_2:",results, results.length,this.memoryIndex);
	}
		  return results;
}

/*
async getTargetsForSearch(term: string): Promise<string[]> {
    term = term.toLowerCase();
console.log("results_2:","memoryIndex:",this.memoryIndex);
    let results = this.memoryIndex
        .filter(e => e.address.toLowerCase().includes(term))
        .map(e => e.address);
console.log("results:",results, results.length);
    while (!results.length && !this.allLoaded) {
        await this.loadNextChunk();
        results = this.memoryIndex
            .filter(e => e.address.toLowerCase().includes(term))
            .map(e => e.address);
			
		console.log("results_2:",results, results.length,this.memoryIndex);
		
    }
console.log("results_3:",results, results.length,this.memoryIndex);
    return results;
}
*/
 // load next chunk from JSON file
 private async loadNextChunk(): Promise<MeshIndexItem[]> {
	console.log("loadNextChunk","1");
    if (this.allLoaded) return [];
console.log("loadNextChunk","2");
    // Only fetch & parse on first use
    if (this.fullIndex.length==0) {
        const res = await fetch('/assets/data/mesh-search-index.json');
        if (!res.ok) throw new Error('Failed fetching index');
        this.fullIndex = await res.json();
    }
console.log("loadNextChunk","3",this.fullIndex);
    const items = this.fullIndex;

    if (this.nextChunkStart >= items.length) {
        this.allLoaded = true;
        this.fullIndex = []; // free memory
        return [];
    }

    const maxBytes = this.chunkLimitMB * 1024 * 1024;
    let chunk: MeshIndexItem[] = [];
    let chunkBytes = 0;

    for (let i = this.nextChunkStart; i < items.length; i++) {
        const item = items[i];
        const size = new Blob([JSON.stringify(item)]).size;
        if (chunkBytes + size > maxBytes) break;

        chunk.push(item);
        chunkBytes += size;
    }

    this.memoryIndex.push(...chunk);
    this.nextChunkStart += chunk.length;

    if (this.nextChunkStart >= items.length) {
        this.allLoaded = true;
        this.fullIndex = [];
    }
    return chunk;
}

}

// -----------------------------------------------------------------------------
// Integration notes
// - Add D3 via `npm install d3` and import as shown.
// - Create the component and service files in Angular app (use the code above).
// - Replace MeshDataService methods with real HTTP requests (using HttpClient).
// - Ensure that the server endpoint returns children arrays with `address` and optional `hasChildren`.
// - descNodes.json can remain a precomputed lookup for search; search uses that to find addresses
//   and then `expandToAddress` will lazily request children along the path.
// - This component is intentionally simplified to highlight lazy-loading & search wiring.
// -----------------------------------------------------------------------------
