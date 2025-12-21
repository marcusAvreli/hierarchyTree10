export class OrgNode {
  id?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  type?: 'root' | 'employee' | 'branch' | 'orgunit' | 'contract' | 'costcenter';
  companyCode?: string;
  companyName?: string;
  parentCompanyCode?: string;
  parentCompanyName?: string;
  branchId?: string;
  managerId?: string;
  orgUnitCode?: string;
  costCenter?: string;
  contractCode?: number;
  email?: string;
  phoneNumber?: string;
  positionCode?: number;
  jobKey?: string;
  jobName?: string;
  image?: string;
  gender?:string;
  teudatZehut?: string;
  childrenLoaded: boolean = false; // lazy load indicator
 children: OrgNode[] = [];
   parentPath?: string[] = []; // <-- add this
   childrenIds?:string[] =[];
   hasChildren: boolean = false;
  [key: string]: unknown;
  constructor(
    id?: string,
    name?: string,
    firstName?: string,
    lastName?: string,
    title?: string,
    type?: 'root' | 'employee' | 'branch' | 'orgunit' | 'contract' | 'costcenter',
    companyCode?: string,
    companyName?: string,
    parentCompanyCode?: string,
    parentCompanyName?: string,
    branchId?: string,
    managerId?: string,
    orgUnitCode?: string,
    costCenter?: string,
    contractCode?: number,
    email?: string,
    phoneNumber?: string,
    positionCode?: number,
    jobKey?: string,
    jobName?: string,
    image?: string,
    childrenLoaded: boolean = false,
	//children: OrgNode[]; 
   parentPath?: string[], // <-- add this
   childrenIds?:string[],
	hasChildren:boolean=false
  ) {
    this.id = id;
    this.name = name;
    this.firstName = firstName;
    this.lastName = lastName;
    this.title = title;
    this.type = type;
    this.companyCode = companyCode;
    this.companyName = companyName;
    this.parentCompanyCode = parentCompanyCode;
    this.parentCompanyName = parentCompanyName;
    this.branchId = branchId;
    this.managerId = managerId;
    this.orgUnitCode = orgUnitCode;
    this.costCenter = costCenter;
    this.contractCode = contractCode;
    this.email = email;
    this.phoneNumber = phoneNumber;
    this.positionCode = positionCode;
    this.jobKey = jobKey;
    this.jobName = jobName;
    this.image = image;
    this.childrenLoaded = childrenLoaded;
	this.parentPath = parentPath;
	this.childrenIds = childrenIds;
	this.hasChildren = hasChildren;
  }
}

