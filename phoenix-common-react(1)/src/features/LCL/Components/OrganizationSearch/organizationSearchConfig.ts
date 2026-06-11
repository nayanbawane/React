import {
  OrganizationSearchFormData,
  SearchableFieldConfig,
  SearchResult,
} from '@/types';
import { MinifiedLoginClientBean } from '../../../../core/featureToggles/loginClientBean.types';
import {
  demoCountries,
  orgCodeData,
  orgStateData,
  orgTaxIdData,
  orgPostalCodeData,
} from './organizationData';

import {  buildConsigneeCodeOrgSearchConfig, buildCustomerCodeOrgSearchConfig, buildForwarderCodeOrgSearchConfig, buildNotifyPartyCodeOrgSearchConfig, buildShipperCodeOrgSearchConfig, organizationAliasSuggestionConfig, organizationCountrySuggestionConfig, organizationSalesPersonSuggestionConfig, organizationStateSuggestionConfig, organizationTaxIdSuggestionConfig, OrgSearchModuleType, OrgSearchSessionParams, pickupCargoAtcodeOrgCodeSuggestionConfig } from '../../../../hooks/LCL';

const trimmedStateData = (orgStateData as Record<string, unknown>[]).map(
  (item: any) => ({
    ...item,
    country: item.country?.split('-')[0]?.trim(),
  })
);

const buildDefaultCodeConfig = (loginBean: MinifiedLoginClientBean | null | undefined): SearchableFieldConfig => ({
  columnHeaders: [
    'Code',
    'Bill to Code',
    'Name',
    'Type',
    'Alias',
    'City',
    'State',
    'Country',
    'Status',
    'Last Invoice',
    'Open AR',
  ],
  sections: [
    {
      data:[],
      displayFields: [
        'code',
        'billToCode',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
        'status',
        'lastInvoice',
        'openAr',
      ],
    },
  ],
  displayValueField: 'code',

  useApiSuggestions: true,
  suggestionConfig: pickupCargoAtcodeOrgCodeSuggestionConfig(loginBean),
});

const CUSTOMER_CODE_CONFIG = (
  moduleType:OrgSearchModuleType,
  sessionParams:OrgSearchSessionParams,
  customerTypeList:string[]
): SearchableFieldConfig => ({
  columnHeaders: [
    'Code', 'Bill to Code', 'Name', 'Type', 'Alias',
    'City', 'State', 'Country', 'Count',
  ],
  sections: [
    {
      title: 'Recently Used Customer Codes',
      data: [],
      displayFields: [
        'code', 'billToCode', 'name', 'type', 'alias',
        'city', 'state', 'country', 'count',
      ],
    },
    {
      title: 'Recently Used Customer Codes in Login Office',
      data: [],
      displayFields: [
        'code', 'billToCode', 'name', 'type', 'alias',
        'city', 'state', 'country', 'count',
      ],
    },
    {
      title: 'All Other Customer Codes - In Ascending Order of City',
      data: [],
      displayFields: [
        'code', 'billToCode', 'name', 'type', 'alias',
        'city', 'state', 'country', 'count',
      ],
    },
  ],
  displayValueField: 'code',
  useApiSuggestions: true,
  useMultiPanelSuggestions: true,
  suggestionConfig: buildCustomerCodeOrgSearchConfig(
    moduleType,
    sessionParams,
    customerTypeList
  ),
});

const SHIPPER_CODE_CONFIG= (  moduleType:OrgSearchModuleType,
  sessionParams:OrgSearchSessionParams,
  shipperTypeList:string[]): SearchableFieldConfig => ({
  columnHeaders: [
    'Code',
    'Bill to Code',
    'Name',
    'Type',
    'Alias',
    'City',
    'State',
    'Country',
    'Count',
  ],
  sections: [
    {
      title: 'Recently Used Shipper Codes',
      data: [],
      displayFields: [
        'code',
        'billToCode',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
        'openAr',
      ],
    },
    {
      title: 'Recently Used Shipper Codes in Login Office',
      data: [],
      displayFields: [
        'code',
        'billToCode',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
        'openAr',
      ],
    },
    {
      title: 'All Other Shipper Codes - In Ascending Order of City',
      data: [],
      displayFields: [
        'code',
        'billToCode',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
        'openAr',
      ],
    },
  ],
  displayValueField: 'code',

  useApiSuggestions: true,
  useMultiPanelSuggestions: true,
   suggestionConfig: buildShipperCodeOrgSearchConfig(
    moduleType,
    sessionParams,
    shipperTypeList
  ),
});

const FORWARDER_CODE_CONFIG= (  moduleType:OrgSearchModuleType,
  sessionParams:OrgSearchSessionParams,
  forwarderTypeList:string[]): SearchableFieldConfig => ({
  columnHeaders: [
    'Code',
    'Bill to Code',
    'Name',
    'Type',
    'Alias',
    'City',
    'State',
    'Country',
    'Count',
  ],
  sections: [
    {
      title: 'Recently Used Forwarder Codes',
      data: [],
      displayFields: [
        'code',
        'billToCode',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
        'openAr',
      ],
    },
    {
      title: 'Recently Used Forwarder Codes in Login Office',
      data: [],
      displayFields: [
        'code',
        'billToCode',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
        'openAr',
      ],
    },
    {
      title: 'All Other Forwarder Codes - In Ascending Order of City',
      data: [],
      displayFields: [
        'code',
        'billToCode',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
        'openAr',
      ],
    },
  ],
  displayValueField: 'code',

  useApiSuggestions:true,
  useMultiPanelSuggestions:true,
  suggestionConfig: buildForwarderCodeOrgSearchConfig(
    moduleType,
    sessionParams,
    forwarderTypeList
  ),
});

const NOTIFY_PARTY_CODE_CONFIG= (  moduleType:OrgSearchModuleType,
  sessionParams:OrgSearchSessionParams,
  forwarderTypeList:string[]): SearchableFieldConfig => ({
  columnHeaders: [
    'Code',
    'Bill to Code',
    'Name',
    'Type',
    'Alias',
    'City',
    'State',
    'Country',
    'Count',
  ],
  sections: [
    {
      title: 'Recently Used Notify Party Codes',
      data: [],
      displayFields: [
        'code',
        'billToCode',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
        'openAr',
      ],
    },
    {
      title: 'Recently Used Notify Party Codes in Login Office',
      data: [],
      displayFields: [
        'code',
        'billToCode',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
        'openAr',
      ],
    },
    {
      title: 'All Other Notify Party Codes - In Ascending Order of City',
      data: orgCodeData as Record<string, unknown>[],
      displayFields: [
        'code',
        'billToCode',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
        'openAr',
      ],
    },
  ],
  displayValueField: 'code',
  useApiSuggestions:true,
  useMultiPanelSuggestions:true,
  suggestionConfig: buildNotifyPartyCodeOrgSearchConfig(
    moduleType,
    sessionParams,
    forwarderTypeList
  ),
});

const CONSIGNEE_CODE_CONFIG= (  moduleType:OrgSearchModuleType,
  sessionParams:OrgSearchSessionParams,
  consigneeTypeList:string[]): SearchableFieldConfig => ({
  columnHeaders: [
    'Code',
    'Bill to Code',
    'Name',
    'Type',
    'Alias',
    'City',
    'State',
    'Country',
    'Count',
  ],
  sections: [
    {
      title: 'Recently Used Consignee Codes',
      data: [],
      displayFields: [
        'code',
        'billToCode',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
        'openAr',
      ],
    },
    {
      title: 'Recently Used Consignee Codes in Login Office',
      data: [],
      displayFields: [
        'code',
        'billToCode',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
        'openAr',
      ],
    },
    {
      title: 'All Other Consignee Codes - In Ascending Order of City',
      data: [],
      displayFields: [
        'code',
        'billToCode',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
        'openAr',
      ],
    },
  ],
  displayValueField: 'code',

  useApiSuggestions: true,
  useMultiPanelSuggestions: true,
  suggestionConfig: buildConsigneeCodeOrgSearchConfig(
    moduleType,
    sessionParams,
    consigneeTypeList
  ),
});

const buildDefaultAliasConfig = (loginBean: MinifiedLoginClientBean | null | undefined): SearchableFieldConfig => ({
  columnHeaders: ['Code', 'Name', 'Type', 'Alias', 'City', 'State', 'Country'],
  sections: [
    {
      data: [],
      displayFields: [
        'code',
        'name',
        'type',
        'alias',
        'city',
        'state',
        'country',
      ],
    },
  ],
  displayValueField: 'alias',
  useApiSuggestions: true,
  suggestionConfig: organizationAliasSuggestionConfig(loginBean),
});

const buildDefaultStateConfig = (loginBean: MinifiedLoginClientBean | null | undefined): SearchableFieldConfig => ({
  columnHeaders: ['Code', 'Name', 'Country'],
  sections: [
    {
      data: [],
      displayFields: ['code', 'name', 'country'],
    },
  ],
  displayValueField: 'name',
  useApiSuggestions: true,
  suggestionConfig: (countryCode: string) => organizationStateSuggestionConfig(countryCode, loginBean),
});

const buildDefaultCountryConfig = (loginBean: MinifiedLoginClientBean | null | undefined): SearchableFieldConfig => ({
  columnHeaders: ['Code', 'Name'],
  sections: [
    {
      data: [],
      displayFields: ['code', 'name'],
    },
  ],
  displayValueField: 'name',

  useApiSuggestions: true,
  suggestionConfig: organizationCountrySuggestionConfig(loginBean),
});

const DEFAULT_STATE_CODE_ONLY_CONFIG: SearchableFieldConfig = {
  columnHeaders: ['Code', 'Name', 'Country Code'],
  sections: [
    {
      data: trimmedStateData as Record<string, unknown>[],
      displayFields: ['code', 'name', 'country'],
    },
  ],
  displayValueField: 'name',
};

const postalCodeDisplayData = (
  orgPostalCodeData as Array<{
    postalCode: string;
    city: string;
    district: string;
    region: string;
    country: string;
  }>
).map((p) => ({
  ...p,
  displayName: [p.postalCode, p.city, p.district, p.region, p.country]
    .filter(Boolean)
    .join(', '),
})) as Record<string, unknown>[];

const POSTAL_CODE_FIELD_CONFIG: SearchableFieldConfig = {
  columnHeaders: [],
  sections: [
    {
      data: postalCodeDisplayData,
      displayFields: ['displayName'],
    },
  ],
  displayValueField: 'displayName',
};

const countryDisplayData = (
  demoCountries as Array<{ code: string; name: string }>
).map((c) => ({
  ...c,
  displayName: `${c.code} - ${c.name}`,
})) as Record<string, unknown>[];

export const COUNTRY_FIELD_CONFIG: SearchableFieldConfig = {
  columnHeaders: ['Country'],
  sections: [
    {
      data: countryDisplayData,
      displayFields: ['displayName'],
    },
  ],
  displayValueField: 'displayName',
};

const buildDefaultSalesPersonConfig = (loginBean: MinifiedLoginClientBean | null | undefined): SearchableFieldConfig => ({
  columnHeaders: ['Code', 'Name'],
  sections: [
    {
      data: [],
      displayFields: ['code', 'name'],
    },
  ],
  displayValueField: 'name',
  useApiSuggestions: true,
  suggestionConfig: organizationSalesPersonSuggestionConfig(loginBean),
});

const buildDefaultTaxIdConfig = (loginBean: MinifiedLoginClientBean | null | undefined): SearchableFieldConfig => ({
  columnHeaders: ['Code', 'Bill to Code', 'Name', 'Type', 'Alias', 'Tax ID'],
  sections: [
    {
      data: [],
      displayFields: ['code', 'billToCode', 'name', 'type', 'alias', 'taxId'],
    },
  ],
  displayValueField: 'taxId',
  useApiSuggestions: true,
  suggestionConfig: organizationTaxIdSuggestionConfig(loginBean),
});

const truckingCodeDisplayData = (
  orgTaxIdData as Array<{
    code: string;
    billToCode: string;
    name: string;
    alias: string;
    taxId: string;
  }>
).map((tc) => ({
  ...tc,
  displayName: `${tc.code}~${tc.billToCode}~${tc.code}~${tc.name}~${tc.taxId}~~`,
})) as Record<string, unknown>[];

const DEFAULT_TRACKING_CODE_CONFIG: SearchableFieldConfig = {
  columnHeaders: [],
  sections: [
    {
      data: truckingCodeDisplayData,
      displayFields: ['displayName'],
    },
  ],
  displayValueField: 'displayName',
};

export interface OrgSearchProfile {
  codeField: SearchableFieldConfig;
  aliasField: SearchableFieldConfig;
  stateField: SearchableFieldConfig;
  countryField: SearchableFieldConfig;
  taxIdField: SearchableFieldConfig;
  salesPersonField?: SearchableFieldConfig;
  trackingCodeField?: SearchableFieldConfig;
  postalCodeField?: SearchableFieldConfig;
}

export const ORG_SEARCH_PROFILES = ({
    moduleType,
    sessionParams,
    customerTypeList,
    shipperTypeList,
    consigneeTypeList,
    forwarderTypeList,
}: {
    moduleType?: string;
    sessionParams?: OrgSearchSessionParams;
    customerTypeList?: string[];
    shipperTypeList?: string[];
    consigneeTypeList?: string[];
    forwarderTypeList?: string[];
}): Record<string, OrgSearchProfile> => {
  const loginBean = sessionParams?.loginBean;
  return{
  default: {
    codeField: buildDefaultCodeConfig(loginBean),
    aliasField: buildDefaultAliasConfig(loginBean),
    stateField: buildDefaultStateConfig(loginBean),
    countryField: buildDefaultCountryConfig(loginBean),
    taxIdField: buildDefaultTaxIdConfig(loginBean),
    salesPersonField: buildDefaultSalesPersonConfig(loginBean),
  },
  customer: {
    codeField: CUSTOMER_CODE_CONFIG(moduleType as OrgSearchModuleType, sessionParams as OrgSearchSessionParams, customerTypeList as string[] ),
    aliasField: buildDefaultAliasConfig(loginBean),
    stateField: buildDefaultStateConfig(loginBean),
    countryField: buildDefaultCountryConfig(loginBean),
    taxIdField: buildDefaultTaxIdConfig(loginBean),
    salesPersonField: buildDefaultSalesPersonConfig(loginBean),
  },
  shipper: {
    codeField: SHIPPER_CODE_CONFIG(moduleType as OrgSearchModuleType, sessionParams as OrgSearchSessionParams, shipperTypeList as string[] ),
    aliasField: buildDefaultAliasConfig(loginBean),
    stateField: buildDefaultStateConfig(loginBean),
    countryField: buildDefaultCountryConfig(loginBean),
    taxIdField: buildDefaultTaxIdConfig(loginBean),
    salesPersonField: buildDefaultSalesPersonConfig(loginBean),
  },
  forwarder: {
    codeField: FORWARDER_CODE_CONFIG(moduleType as OrgSearchModuleType, sessionParams as OrgSearchSessionParams, forwarderTypeList as string[] ),
    aliasField: buildDefaultAliasConfig(loginBean),
    stateField: buildDefaultStateConfig(loginBean),
    countryField: buildDefaultCountryConfig(loginBean),
    taxIdField: buildDefaultTaxIdConfig(loginBean),
    salesPersonField: buildDefaultSalesPersonConfig(loginBean),
  },
  consignee: {
    codeField: CONSIGNEE_CODE_CONFIG(moduleType as OrgSearchModuleType, sessionParams as OrgSearchSessionParams, consigneeTypeList as string[] ),
    aliasField: buildDefaultAliasConfig(loginBean),
    stateField: buildDefaultStateConfig(loginBean),
    countryField: buildDefaultCountryConfig(loginBean),
    taxIdField: buildDefaultTaxIdConfig(loginBean),
    salesPersonField: buildDefaultSalesPersonConfig(loginBean),
  },
  notifyParty: {
    codeField: NOTIFY_PARTY_CODE_CONFIG(moduleType as OrgSearchModuleType, sessionParams as OrgSearchSessionParams, forwarderTypeList as string[] ),
    aliasField: buildDefaultAliasConfig(loginBean),
    stateField: buildDefaultStateConfig(loginBean),
    countryField: buildDefaultCountryConfig(loginBean),
    taxIdField: buildDefaultTaxIdConfig(loginBean),
    salesPersonField: buildDefaultSalesPersonConfig(loginBean),
    trackingCodeField: DEFAULT_TRACKING_CODE_CONFIG,
  },
  doorDeliveryTrucker: {
    codeField: buildDefaultCodeConfig(loginBean),
    aliasField: buildDefaultAliasConfig(loginBean),
    stateField: buildDefaultStateConfig(loginBean),
    countryField: buildDefaultCountryConfig(loginBean),
    taxIdField: buildDefaultTaxIdConfig(loginBean),
    salesPersonField: buildDefaultSalesPersonConfig(loginBean),
  },
  doordelivery: {
    stateField: DEFAULT_STATE_CODE_ONLY_CONFIG,
    countryField: COUNTRY_FIELD_CONFIG,
    postalCodeField: POSTAL_CODE_FIELD_CONFIG,
  },
} };

export const ORG_SEARCH_PROFILE_KEYS = {
    default: true,
    customer: true,
    shipper: true,
    forwarder: true,
    consignee: true,
    notifyParty: true,
    doorDeliveryTrucker: true,
    doordelivery: true,
};

export type OrgSearchConfigKey = keyof typeof ORG_SEARCH_PROFILE_KEYS;

export const ORGANIZATION_TYPE_OPTIONS = [
  { label: 'Please Select', value: '' },
  { label: 'Type 1', value: 'type1' },
  { label: 'Type 2', value: 'type2' },
];

export const ORGANIZATION_STATUS_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

export const INITIAL_FORM: OrganizationSearchFormData = {
  organizationCode: '',
  organizationName: '',
  alias: '',
  taxId: '',
  address: '',
  state: '',
  city: '',
  country: '',
  postalCode: '',
  email: '',
  organizationType: '',
  organizationStatus: 'Active',
  salesPerson: '',
};

export const FORM_TO_RESULT_FIELD: Partial<
  Record<keyof OrganizationSearchFormData, keyof SearchResult>
> = {
  organizationName: 'name',
  alias: 'alias',
  taxId: 'taxId',
  address: 'address',
  state: 'state',
  city: 'city',
  country: 'country',
  postalCode: 'postal',
  email: 'email',
  organizationType: 'type',
  organizationStatus: 'status',
};

export function resolveFieldProps(config: SearchableFieldConfig | undefined) {
  if (!config) return {};
  const [s0, s1, s2] = config.sections;
  return {
    data: s0.data,
    displayFields: s0.displayFields,
    title: s0.title,
    ...(s1
      ? { data1: s1.data, displayFields1: s1.displayFields, title1: s1.title }
      : {}),
    ...(s2
      ? { data2: s2.data, displayFields2: s2.displayFields, title2: s2.title }
      : {}),
    columnHeaders: config.columnHeaders,
    displayValueField: config.displayValueField,
  };
}
