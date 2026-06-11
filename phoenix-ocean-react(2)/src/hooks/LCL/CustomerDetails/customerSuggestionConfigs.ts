import { COMMON_ENDPOINTS } from 'phoenix-common-react';
import type { MultiPanelSuggestionItem } from 'phoenix-common-react';

export const parseOrgDisplayString = (displayString: string) => {
  const parts = displayString.split('~');
  return {
    code:       parts[0] ?? '',
    billToCode: parts[1] ?? '',
    name:       parts[2] ?? '',
    type:       parts[3] ?? '',
    alias:      parts[4] ?? '',
    city:       parts[5] ?? '',
    state:      parts[6] ?? '',
    country:    parts[7] ?? '',
    count:      parts[8] ?? '',
  };
};

export const parseOrgInputCode = (inputCode: string) => {
  const p = inputCode.split('~');
  return {
    detailName:   p[0]  ?? '',
    detailName2:  p[1]  ?? '',
    addressLine1: p[2]  ?? '',
    addressLine2: p[3]  ?? '',
    addressLine3: p[4]  ?? '',
    contactName:  p[6]  ?? '',
    phoneNumber:  p[7]  ?? '',
    fax:          p[8]  ?? '',
    wwaCustomer:  p[9]  ?? '',
    city:         p[11] ?? '',
    stateCode:    p[12] ?? '',
    zipCode:      p[13] ?? '',
    country:      p[14] ?? '',
    email:        p[15] ?? '',
    fmcLicensed:  p[21] ?? '',
    stateId:      p[22] ?? '',
    stateName:    p[23] ?? '',
    eoriNumber:   p[24] ?? '',
  };
};

export const parseCustomerInputCode = (inputCode: string) => {
  const p = inputCode.split('~');
  return {
    creditHold:   p[0]  ?? '',
    salesRep:     p[1]  ?? '',
    email:        p[3]  ?? '',
    detailName:   p[4]  ?? '',
    detailName2:  p[5]  ?? '',
    addressLine1: p[6]  ?? '',
    addressLine2: p[7]  ?? '',
    addressLine3: p[8]  ?? '',
    contactName:  p[10] ?? '',
    phoneNumber:  p[11] ?? '',
    fax:          p[12] ?? '',
    wwaCustomer:  p[13] ?? '',
    cellPhone:    p[14] ?? '',
    city:         p[16] ?? '',
    stateCode:    p[17] ?? '',
    zipCode:      p[18] ?? '',
    country:      p[19] ?? '',
    custName1:    p[20] ?? '',
    custName2:    p[21] ?? '',
    custName3:    p[22] ?? '',
    custName4:    p[23] ?? '',
    custName5:    p[24] ?? '',
    fmcLicensed:  p[25] ?? '',
    stateId:      p[26] ?? '',
    stateName:    p[27] ?? '',
    eoriNumber:   p[29] ?? '',
    customerType: p[30] ?? '',
  };
};

export const transformOrgItem = (item: MultiPanelSuggestionItem) => ({
  ...parseOrgDisplayString(item.displayString),
  ...parseOrgInputCode(item.inputCode),
});

export const transformCustomerItem = (item: MultiPanelSuggestionItem) => ({
  ...parseOrgDisplayString(item.displayString),
  ...parseCustomerInputCode(item.inputCode),
});


export type SuggestionModuleType = 'BKG' | 'QUO' | 'prebooking';
type OrgEntityType = 'customer' | 'shipper' | 'consignee' | 'forwarder' | 'notifyParty';

const REFERENCE_LISTS: Record<SuggestionModuleType, Record<OrgEntityType, readonly string[]>> = {
  BKG: {
    customer:    ['customerCodeByUser',    'customerCodeByRegion',    'customerCodeAll'],
    shipper:     ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
    consignee:   ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
    forwarder:   ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
    notifyParty: ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
  },
  QUO: {
    customer:    ['quoteCustCodeByUser',    'quoteCustCodeByRegion',    'quoteCustCodeAll'],
    shipper:     ['quoteShpConsCodeByUser', 'quoteShpConsCodeByRegion', 'quoteShpConsCodeAll'],
    consignee:   ['quoteShpConsCodeByUser', 'quoteShpConsCodeByRegion', 'quoteShpConsCodeAll'],
    forwarder:   ['quoteShpConsCodeByUser', 'quoteShpConsCodeByRegion', 'quoteShpConsCodeAll'],
    notifyParty: ['quoteShpConsCodeByUser', 'quoteShpConsCodeByRegion', 'quoteShpConsCodeAll'],
  },
  prebooking: {
    customer:    ['customerCodeByUser',    'customerCodeByRegion',    'customerCodeAll'],
    shipper:     ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
    consignee:   ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
    forwarder:   ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
    notifyParty: ['bkgCustomerCodeByUser', 'bkgCustomerCodeByRegion', 'bkgCustomerCodeAll'],
  },
} as const;

const CUST_COLUMNS: Record<SuggestionModuleType, Record<OrgEntityType, string>> = {
  BKG: {
    customer:    'ship_code',
    shipper:     'fwdr_code',
    consignee:   'cons_code',
    forwarder:   'c_actual_forwarder_code',
    notifyParty: 'c_notify_party_code',
  },
  QUO: {
    customer:    'quote_cust_code',
    shipper:     'c_forwarder_code',
    consignee:   'c_consignee_code',
    forwarder:   'c_actual_forwarder_code',
    notifyParty: 'c_notify_party_code',
  },
  prebooking: {
    customer:    'ship_code',
    shipper:     'fwdr_code',
    consignee:   'cons_code',
    forwarder:   'c_actual_forwarder_code',
    notifyParty: 'c_notify_party_code',
  },
} as const;

const DEFAULT_CUSTOMER_TYPES = ['A', 'F', 'H', 'I', 'N', 'S'] as const;

export const parseCustomerTypeList = (toggleValue: string | null | undefined): string[] => {
  const trimmed = (toggleValue ?? '').trim();
  if (!trimmed) return [...DEFAULT_CUSTOMER_TYPES];
  return trimmed.split(',').map((t) => t.trim()).filter(Boolean);
};

export interface OrgRequestParams {
  countryCode: string;
  office: string;
  officeSchemaName: string;
  user: string;
}

export interface OrgConfigOptions {
  moduleType?: SuggestionModuleType;
  customerTypeList: string[];
}

const buildOrgRequest = (
  entity: OrgEntityType,
  moduleType: SuggestionModuleType,
  params: OrgRequestParams,
  customerTypeList: string[],
) =>
  (query: string) => ({
    query:         query || '%%%',
    referenceList: REFERENCE_LISTS[moduleType][entity],
    countryCode:   params.countryCode,
    params: {
      custColumn:       CUST_COLUMNS[moduleType][entity],
      office:           params.office,
      user:             params.user,
      officeSchemaName: params.officeSchemaName,
    },
    inClause: {
      CUSTOMER_TYPE: customerTypeList,
    },
    isClassicFlatSuggestionBox: false,
  });

const BASE_CONFIG = {
  endpoint:      COMMON_ENDPOINTS.SUGGESTION_BOX.GET_MULTI_PANEL_SUGGEST_DATA,
  minChars:      1,
  debounceMs:    300,
  transformItem: transformOrgItem,
} as const;

export const buildCustomerCodeMultiPanelConfig = (
  params: OrgRequestParams,
  { moduleType = 'BKG', customerTypeList }: OrgConfigOptions,
) => ({
  ...BASE_CONFIG,
  transformItem:    transformCustomerItem,
  transformRequest: buildOrgRequest('customer', moduleType, params, customerTypeList),
});

export const buildShipperCodeMultiPanelConfig = (
  params: OrgRequestParams,
  { moduleType = 'BKG', customerTypeList }: OrgConfigOptions,
) => ({
  ...BASE_CONFIG,
  transformRequest: buildOrgRequest('shipper', moduleType, params, customerTypeList),
});

export const buildForwarderCodeMultiPanelConfig = (
  params: OrgRequestParams,
  { moduleType = 'BKG', customerTypeList }: OrgConfigOptions,
) => ({
  ...BASE_CONFIG,
  transformRequest: buildOrgRequest('forwarder', moduleType, params, customerTypeList),
});

export const buildConsigneeCodeMultiPanelConfig = (
  params: OrgRequestParams,
  { moduleType = 'BKG', customerTypeList }: OrgConfigOptions,
) => ({
  ...BASE_CONFIG,
  transformRequest: buildOrgRequest('consignee', moduleType, params, customerTypeList),
});

export const buildNotifyPartyCodeMultiPanelConfig = (
  params: OrgRequestParams,
  { moduleType = 'BKG', customerTypeList }: OrgConfigOptions,
) => ({
  ...BASE_CONFIG,
  transformRequest: buildOrgRequest('notifyParty', moduleType, params, customerTypeList),
});
