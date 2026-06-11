// ─── Hazardous ────────────────────────────────────────────────────────────────

import type { ControlFlag, YesNo } from "../common.types";

export interface BookingMultiCargoHazardous {
  rowId: string;
  referenceNumber: number;
  shipperName1: string;
  techName1: string;
  noOfpieces: number;
  weight: number;
  flashPointCelsius: number;
  flashpointFahrenheit: number;
  plackard1: string;
  plackard2: string;
  emergencyPhone: string;
  emergencyCotact: string;
  hazardousCode: string;
  hazarDousCount: number;
  controlFlag: ControlFlag;
  inputUpdateUser: string;
  recordNumber: number;
  quoteCargoHazardousId: number;
  imoSubClass: string;
  customerDeclaredHazardouId: string;
  customerDeclaredHazardousTransactionFlag: YesNo;
}

export interface BookingHazardousBean {
  rowId: string;
  referenceNumber: number;
  noOfpieces: number;
  weight: number;
  flashPointCelsius: number;
  flashpointFahrenheit: number;
  hazardousCode: string;
  hazarDousCount: number;
  controlFlag: ControlFlag;
  recordNumber: number;
  quoteCargoHazardousId: number;
  imoSubClass: string;
  bookingNumber: string;
  customerDeclaredHazardousTransactionFlag: string;
}

export interface HazardousRule {
  DocumentList: string;
  ACTION: string;
  MULTI_ACTION: string;
  REMARKS: string;
  IMO_CLASS: string;
}
