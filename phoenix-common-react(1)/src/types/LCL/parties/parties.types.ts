// ─── Party Beans ─────────────────────────────────────────────────────────────

import type { YesNo } from "../common.types";

export interface ShipperBean {
  shipperReference: string;
  shipperCode: string;
  shipperName: string;
  shipperAddress1: string;
  shipperAddress2: string;
  shipperAddress3: string;
  shipperCity: string;
  shipperPhone: string;
  shipperCellphone: string;
  shipperTelephone: string;
  shipperFax: string;
  shipperContact: string;
  namedAccount: string;
  creditHold: YesNo;
  namedAccountFullName: string;
  shipperState: string;
  shipperZip: string;
  shipperCountry: string;
  shipperName2: string;
  shipperName3: string;
  shipperName4: string;
  shipperName5: string;
  isNewCustomerWidgetShownForCanadaEmanifest: boolean;
  isLicense: boolean;
  customerITNo: string;
  asAgentForToggle: YesNo;
  isCustomerDetailsFromBooking: boolean;
  shipperStateId: string;
  shipperStateName: string;
  customerType: string;
}

export interface ConsigneeBean {
  consigneeReference: string;
  consigneeCode: string;
  consigneeName: string;
  consigneeName1: string;
  consigneeAddress1: string;
  consigneeAddress2: string;
  consigneeAddress3: string;
  consigneePhone: string;
  consigneeFax: string;
  consigneeContact: string;
  consigeeCity: string;
  consigneeState: string;
  consigneeCountry: string;
  consigneeZipCode: string;
  consigneeEmail: string;
  consigneeName3: string;
  consigneeName4: string;
  consigneeName5: string;
  isLicense: boolean;
  isCustomerDetailsFromBooking: boolean;
  consigneeStateName: string;
  consigneeStateId: string;
}

export interface ForwarderBean {
  forwarderReference: string;
  forwarderCode: string;
  forwarderName: string;
  forwarderAddress1: string;
  forwarderAddress2: string;
  forwarderAddress3: string;
  forwarderPhone: string;
  forwarderFax: string;
  forwarderContact: string;
  forwarderName2: string;
  forwarderName3: string;
  forwarderName4: string;
  forwarderName5: string;
  forwarderState: string;
  forwarderZip: string;
  forwarderCountry: string;
  forwarderCity: string;
  forwarderEmail: string;
  isLicense: boolean;
  isCustomerDetailsFromBooking: boolean;
  forwarderStateId: string;
  forwarderStateName: string;
}

export interface AgentBean {
  isLicense: boolean;
}

export interface NotifyBean {
  notifyReference: string;
  notifyCode: string;
  notifyName: string;
  notifyName1: string;
  notifyAddress1: string;
  notifyAddress2: string;
  notifyAddress3: string;
  notifyPhone: string;
  notifyFax: string;
  namedAccount: string;
  namedAccountFullName: string;
  notifyCity: string;
  notifyState: string;
  notifyCountry: string;
  notifyZipCode: string;
  notifyConact: string;
  notifyEmail: string;
  notifyName5: string;
  notifyName3: string;
  notifyName4: string;
  notifyStateName: string;
  isCustomerDetailsFromBooking: boolean;
  notifyStateId: string;
}

export interface BookingQuoteCustomerBean {
  customerType: string;
  salesRepresentative: string;
  customerEmail: string;
  purchaseOrderNumber: string;
  shipperBean: ShipperBean;
  consigneeBean: ConsigneeBean;
  forwarderBean: ForwarderBean;
  agentBean: AgentBean;
  actualforwarderBean: ForwarderBean;
  accurateProfile: string;
  wwaReference: string;
  billingCompany: string;
  notifyBean: NotifyBean;
  isEnableTrackAndPrintUrlToggBtn: boolean;
  truckSellRateProfile: string;
}
