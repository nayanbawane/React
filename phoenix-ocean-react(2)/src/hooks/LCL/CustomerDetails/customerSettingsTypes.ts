export interface CustomerRateSettingRequest {
  customerCode: string;
  officeSchemaName: string;
}

export interface CustomerPatternsRequest {
  customerAlias: string;
  officeSchemaName: string;
}

export interface CustomerRateSettingResult {
  customerRateCode: string;
  customerRateAdditionalCode: string;
  customerType: string;
  customerName: string;
  customerCode: string;
  billToCode: string;
  address1: string;
  address2: string;
  city: string;
  state: string | null;
  zip: string;
  ctcno: string;
  ctcdefault: string;
  customerAlias: string;
  creditHold: string;
  wwaCustomer: string;
  accurateProfile: string | null;
  billToCustomerName: string;
  noCreditFlag: string;
  isCreditOver: string | null;
  billtoCustomerCredithold: string | null;
  licensed: string;
  truckerSellRateProfile: string | null;
  truckProfileNamedAccount: string | null;
  customerTypeAdditionInvoice: string | null;
}

export interface CustomerPattern {
  patternId: number;
  patternValue: string;
  patternFormula: string;
  patternDescription: string;
}

export interface CustomerSettingsApiResponse<T> {
  success: number;
  result: T;
  message: string;
  errorCode: string | null;
}
