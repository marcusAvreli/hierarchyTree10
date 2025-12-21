import {CardField} from './card-field.model';
export const NODE_CARD_CONFIG: Record<string, CardField[]> = {
  managerial: [
  
    { key: 'type', label: 'Type' },
    { key: 'companyName', label: 'Company' },
    { key: 'email' },
    { key: 'phoneNumber' },
	{ key: 'firstName' ,label:"First Name"},
	{ key: 'lastName' ,label:"Last Name"},
	{ key: 'teudatZehut' ,label:"teudatZehut"},
	{ key: 'gender' ,label:"Gender"},
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