import {CardField} from './card-field.model';
export const NODE_CARD_CONFIG: Record<string, CardField[]> = {
  managerial: [
  
  
    { key: 'email', label: "כתובת מייל" },
    { key: 'phoneNumber',label:"מספר טלפון" },
	{ key: 'firstName' ,label:"שם פרטי"},
	{ key: 'lastName' ,label:"שם משפחה"},
	{ key: 'teudatZehut' ,label:"תעודת זהות:"}
	
	/*{ key: 'email', label: "dsdds" },
    { key: 'phoneNumber',label:"sdfdsfsd" },
	{ key: 'firstName' ,label:"sdfdsf"},
	{ key: 'lastName' ,label:"sdfsdfs"},
	{ key: 'teudatZehut' ,label:"sdfds"}
	*/
  ],
  branch: [
    { key: 'name', label: 'Branch Name' },
    { key: 'branchId', label: 'Branch ID' },
    { key: 'companyName', label: 'Company' },
  ],
  orgunit: [
    { key: 'orgUnitCode', label: 'Org Unit Code' },
    { key: 'name', label: 'Org Unit Name' },
  ],
  contract: [
    { key: 'contractCode', label: 'Contract Code' },
    { key: 'name', label: 'Contract Name' },
    { key: 'companyName', label: 'Company' },
  ],
  costcenter: [
    { key: 'costCenter', label: 'Cost Center' },
    { key: 'name', label: 'Cost Center Name' },
    { key: 'companyName', label: 'Company' },
  ]
};