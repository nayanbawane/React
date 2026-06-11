export interface OrganizationSearchResponse {
  result: OrganizationResultDetail[];
}

export interface OrganizationSearchRowCountResponse {
  result:String;
}

export interface OrganizationSearchCriteria {
  code: string;
  name: string;
  alias: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  email: string;
  organnizationType: string;
  status: string;
  salesRep: string;
  cSTIOfficeCode: string;
  webService: string;
  schemaName: string;
  CvType: string;
  fromDate: string;
  toDate: string;
  taxId: string;
  einNumber: string;
  orgVatIdNo: string;
  kingdeeStatus: string | null;
  handlingSchema: string;
  isAccountsReceivable: string;
  moduleCode: string;

  inClause: {
    [key: string]: any[];   
  } | null;
}

export interface OrganizationSearchExpandResponse {
  result : OrganizationResultDetail;
}
export interface OrganizationSearchExpandRequest {
  organizationResultDetailBean: OrganizationResultDetail;

   loginBean: {
    [key: string]: any;
  };
}

export interface OrganizationSearchRequest {
  organizationSearchCriteriaBean: OrganizationSearchCriteria;

  officeParam: {
    [key: string]: string;
  };

  loginbean: {
    [key: string]: any;
  };

  lowerLimit: number;
  upperLimit: number;
}

export interface ShipmentStatisticBean {
  organizationCode: String;
  docCategory: String;
  docType: String;
  currentCount: Number;
  pastCount: Number;
  currentWeight: Number;
  pastWeight: Number;
  currentVolume: Number;
  pastVolume: Number;
  countIndicator: boolean;
  volumeIndicator: boolean;
  weightIndicator: boolean;
  countPercent: Number;
  volumePercent: Number;
  weightPercent: Number;
}

export interface AgingWidgetBean {
  organizationCode: string;
  intervalCount: string;
  intervalRange: string;
  unPaidamount: number;
  statusPercent: number;
  targetType: string;
  target: string;
  newInterval: string;
}

export interface AgingMain {
  organizationCode: string;
  agingType: string;
  agingWidgetBeanList: AgingWidgetBean[];
  unappliedAmount: number;
  totalAmount: number;
  totalOverdueAmount: number;
}

export interface ContactDetail {
  contactName: string;
  designation: string;
  telephone: string;
  mobile: string;
  email: string;
  typeContact: string;
}

export interface OrganizationResultDetail {
  custCode: string;
  organizationCode: string;
  organizationAliasCode: string;
  organizationType: string;
  organizationName: string;
  postalCode: string;

  organizationAddress: string;
  organizationAddress2: string;
  organizationAddress3: string;

  city: string;
  state: string;
  country: string;

  phoneNumber: string;
  email: string;
  region: string;

  salesRepresentative: string;

  uninvoicedShipment: number;
  inTransitShipment: number;
  creditLimit: number;

  creditTerm: string;
  onHoldStatus: string;

  paymentIndicator: number;

  billToCode: string;
  collectionOffice: string;
  statementCycle: string;

  creditOverAmount: number;
  totalImportCredit: string;
  arStatement: string;

  saleRepresentativeType: string;
  vesselSchedule: string;

  dateAssigned: string | Date;

  callCycle: string;
  bookingCycle: string;
  rateProfile: string;
  additionalProfile: string;
  accuRateProfile: string;
  truckerSellRateProfile: string;

  accountClass: string;

  einType: string;
  einNumber: string;

  nvoccBond: string;
  fmcNumber: string;

  agent: string;
  broker: string;

  inputBy: string;
  inputDate: string | Date;

  updateBy: string;
  updateDate: string | Date;

  name1: string;
  wwaCustomer: string;

  contactPerson: string;
  fax: string;

  organizationTypeCode: string;
  countryCode: string;

  cellPhone: string;
  vendorCode: string;

  status: string;
  taxId: string;

  name2: string;

  localName: string;
  localName1: string;

  localAddress1: string;
  localAddress2: string;
  localAddress3: string;

  localState: string;
  localZipCnty: string;
  localCountry: string;

  localContact: string;
  localTelephone: string;
  localFax: string;

  localCity: string;

  customerRateType: string;

  shipmentStatisticBeanList: ShipmentStatisticBean[];

  agingMainBean: AgingMain;

  contactDetailBeanList: ContactDetail[];

  contactDetailMap: {
    [key: string]: ContactDetail;
  };

  dateAssignedLabel: string;

  invoiceCurrency: string;

  schemaName: string;

  chaserStatus: string;

  creditTerms: string;

  termsDesc: string;

  scacCode: string;

  invoiceEmail: string;

  fmcAddress1: string;
  fmcAddress2: string;
  fmcAddress3: string;
  fmcAddress4: string;
  fmcAddress5: string;

  fmcLicense: string;

  stateId: string;

  stateName: string;

  eoriNumber: string;

  ics2Filer: string;
}