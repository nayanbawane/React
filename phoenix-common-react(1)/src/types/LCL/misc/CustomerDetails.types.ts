
export interface CustomerDetailFormState {
  defaultForm: CustomerFormData;
  lclForm: LclBookingDetailsForm;
  customerMoreDetails: CustomerMoreDetailsForm;
}

export interface CustomerFormData {
  customerCode: string;
  customerName: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  customerStateId: string;
  customerStateName: string;
  customerZipCode: string;
  customerCountry: string;
  customerFax: string;
  customerType: string;
  customersContactName: string;
  salesRepresentative: string;
  telephoneNumber: string;
  mobileNumber: string;
  customerEmail: string;
  customerReference: string;
  truckSellRateProfile: string;
}

export interface LclBookingDetailsForm {
  customerCode: string;
  customerName: string;
  customerAddress: string;
  customerCity: string;
  customerState: string;
  customerStateId: string;
  customerStateName: string;
  customerZipCode: string;
  customerCountry: string;
  customerFax: string;
  customerType: string;
  fcustomerType: string;
  customersContactName: string;
  salesRepresentative: string;
  telephoneNumber: string;
  mobileNumber: string;
  customerEmail: string;
  customerReference: string;
  truckSellRateProfile: string;
  accuRateProfile: string;
  prepaidCollect: string;
  controllingEntity: string;
  rateControllingEntity: string;
  agentName: string;
  agentEmail: string;
  asAgentFor: string;
  customerIt: string;
  customerEoriNumber: string;
  customerNamedAccount: string;
  namedAccount: string;

  shipperName: string;
  shipperAddress: string;
  shipperEmail: string;
  shipperContactName: string;
  shipperReference: string;
  shipperPhoneNumber: string;

  consigneeName: string;
  consigneeAddress: string;
  consigneeEmail: string;
  consigneeContactName: string;
  consigneeReference: string;
  consigneePhoneNumber: string;

  notifyPartyName: string;
  notifyPartyAddress: string;
  notifyPartyEmail: string;
  notifyPartyContactName: string;
  notifyPartyReference: string;
  notifyPartyPhoneNumber: string;
}

export interface PreBookingDetailsForm {
  customerCode: string;
  accuRateProfile: string;
  namedAccount: string;
  customerName: string;
  customerEmail: string;
  customerReference: string;
  prepaidCollect: string;
  controllingEntity: string;
  rateControllingEntity: string;
  customersContactName: string;
  customerEoriNumber: string;

  shipperName: string;
  shipperAddress: string;
  shipperEmail: string;
  shipperContactName: string;
  shipperReference: string;
  shipperPhoneNumber: string;

  consigneeName: string;
  consigneeAddress: string;
  consigneeEmail: string;
  consigneeContactName: string;
  consigneeReference: string;
  consigneePhoneNumber: string;

  notifyPartyName: string;
  notifyPartyAddress: string;
  notifyPartyEmail: string;
  notifyPartyContactName: string;
  notifyPartyReference: string;
  notifyPartyPhoneNumber: string;
}

// Suggestion types — one per searchable field
export interface OrgCodeSuggestionItem {
  [key: string]: unknown;
  code: string;
  billToCode: string;
  name: string;
  type: string;
  alias: string;
  city: string;
  state: string;
  country: string;
  count: string;
  detailName: string;
  detailName2: string;
  addressLine1: string;
  addressLine2: string;
  addressLine3: string;
  contactName: string;
  phoneNumber: string;
  fax: string;
  wwaCustomer: string;
  stateCode: string;
  zipCode: string;
  email: string;
  fmcLicensed: string;
  stateId: string;
  stateName: string;
  creditHold: string;
  salesRep: string;
  cellPhone: string;
  eoriNumber: string;
  customerType: string;
  custName1?: string;
  custName2?: string;
  custName3?: string;
  custName4?: string;
  custName5?: string;
}

export interface FieldSuggestion {
  data: OrgCodeSuggestionItem[];
  data1: OrgCodeSuggestionItem[];
  data2: OrgCodeSuggestionItem[];
  setQuery: (query: string) => void;
  loading: boolean;
}

export interface AddressFieldSuggestion {
  data: Record<string, unknown>[];
  loading: boolean;
  setQuery: (query: string) => void;
  onSelect: (item: Record<string, unknown>) => void;
}

export interface CustomerLclSuggestions {
  customerCode: FieldSuggestion;
  customerState?: AddressFieldSuggestion;
  customerCountry?: AddressFieldSuggestion;
}

export interface CustomerMoreDetailsSuggestions {
  shipperCode: FieldSuggestion;
  shipperState?: AddressFieldSuggestion;
  shipperCountry?: AddressFieldSuggestion;
  forwarderCode: FieldSuggestion;
  forwarderState?: AddressFieldSuggestion;
  forwarderCountry?: AddressFieldSuggestion;
  consigneeCode: FieldSuggestion;
  consigneeState?: AddressFieldSuggestion;
  consigneeCountry?: AddressFieldSuggestion;
  notifyPartyCode: FieldSuggestion;
  notifyPartyState?: AddressFieldSuggestion;
  notifyPartyCountry?: AddressFieldSuggestion;
}

export interface CustomerDetailsSuggestions {
  lclForm: CustomerLclSuggestions;
  moreDetails: CustomerMoreDetailsSuggestions;
}

export interface CustomerDetailsHandlers {
  handleDefaultFormChange: (
    field: keyof CustomerFormData,
    value: string
  ) => void;
  handleLclFormChange: (
    field: keyof LclBookingDetailsForm,
    value: string
  ) => void;
  handleMoreDetailsChange: (
    field: keyof CustomerMoreDetailsForm,
    value: string
  ) => void;
  onCustomerCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onShipperCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onConsigneeCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onForwarderCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onNotifyPartyCodeSelect?: (item: OrgCodeSuggestionItem) => void;
}

export interface EoriPortConditions {
  isPortOfLoadInEurope?: boolean;
  isDischargePortInEurope?: boolean;
  isFrobCargo?: boolean;
  isDestinationInEurope?: boolean;
}

export interface CustomerDetailsProps {
  rateDetails: any;
  formData: CustomerDetailFormState;
  handlers: CustomerDetailsHandlers;
  suggestions: CustomerDetailsSuggestions;
  moduleType?: string;
  containerType?: string;
  direction?: string;
  bookingType?: string;
  portOfDischarge?: string;
  eoriPortConditions?: EoriPortConditions;
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (formData: CustomerDetailFormState) => void;
  moreDetailsRef?: React.MutableRefObject<HTMLInputElement | null>;
  trackingCodeRef?: React.MutableRefObject<HTMLInputElement | null>;
  onMoreDetailsFlagValue?: (item: boolean) => void;
  shipmentType?: string;
  showBannerError?: (messages: string[], autoHideMs?: number, variant?: 'bar' | 'modal') => void;
  showStatus?: (type: StatusType, messages: string[]) => void;
}

export interface CustomerMoreDetailsForm {
  shipperCode: string;
  shipperNamedAccount: string;
  shipperName: string;
  shipperAddress: string;
  shipperCity: string;
  shipperState: string;
  shipperStateId: string;
  shipperStateName: string;
  shipperZipCode: string;
  shipperCountry: string;
  shipperContactName: string;
  shipperPhoneNumber: string;
  shipperEmail: string;
  shipperFax: string;
  shipperReference: string;
  shipperEoriNumber: string;
  shipperFmcLicensed: string;

  forwarderCode: string;
  forwarderNamedAccount: string;
  forwarderName: string;
  forwarderAddress: string;
  forwarderCity: string;
  forwarderState: string;
  forwarderStateId: string;
  forwarderStateName: string;
  forwarderZipCode: string;
  forwarderCountry: string;
  forwarderContactName: string;
  forwarderPhoneNumber: string;
  forwarderEmail: string;
  forwarderFax: string;
  forwarderReference: string;
  forwarderEoriNumber: string;
  forwarderFmcLicensed: string;

  purchaseOrder: string;

  consigneeCode: string;
  consigneeNamedAccount: string;
  consigneeName: string;
  consigneeAddress: string;
  consigneeCity: string;
  consigneeState: string;
  consigneeStateId: string;
  consigneeStateName: string;
  consigneeZipCode: string;
  consigneeCountry: string;
  consigneeContactName: string;
  consigneePhoneNumber: string;
  consigneeEmail: string;
  consigneeFax: string;
  consigneeReference: string;
  consigneeEoriNumber: string;
  consigneeFmcLicensed: string;

  notifyPartyCode: string;
  notifyPartyNamedAccount: string;
  notifyPartyName: string;
  notifyPartyAddress: string;
  notifyPartyCity: string;
  notifyPartyState: string;
  notifyStateId: string;
  notifyStateName: string;
  notifyPartyZipCode: string;
  notifyPartyCountry: string;
  notifyPartyContactName: string;
  notifyPartyPhoneNumber: string;
  notifyPartyEmail: string;
  notifyPartyFax: string;
  notifyPartyReference: string;
  notifyPartyEoriNumber: string;
  notifyPartyFmcLicensed: string;

  trackingCode: string;
  wwaReference: string;
  wwaCustomer: string;
}

export interface PreBookingDetailsProps {
  form: LclBookingDetailsForm;
  onFieldChange: (field: keyof LclBookingDetailsForm, value: string) => void;
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (data: any) => void;
    showStatus: (type: StatusType, messages: string[]) => void
  customerMoreDetails: CustomerMoreDetailsForm;
  onMoreDetailsChange: (
    field: keyof CustomerMoreDetailsForm,
    value: string
  ) => void;
  suggestions?: CustomerDetailsSuggestions;
  showAgentFields?: boolean;
  eoriPortConditions?: EoriPortConditions;
  onCustomerCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  rateDetails: any;
  accuRateProfile: string
  moduleType?: string;
}
