// ─── Routing ──────────────────────────────────────────────────────────────────

import type { YesNo } from "../common.types";
import type { BookingQuoteChargeBean } from "../charges/charges.types";

export interface ManufacturerDetailsBean {
  referenceType: string;
  referenceNumber: string;
  totalAddedManufacturerNameList: string[];
  newlyAddedManufacturerNameList: string[];
  removedManufacturerNameList: string[];
  updatedManufacturerNameMapList: Record<string, unknown>[];
  previousManufacturerNameList: string[];
  previousManufacturerNameMap: Record<string, unknown>;
}

export interface BookingQuoteRoutingBean {
  preCarriageType: string;
  preCarriageBy: string;
  vesselCode: string;
  vessel: string;
  voyage: string;
  warehouse: string;
  deliveryDate: string;
  deliveryTime: string;
  originCode: string;
  originName: string;
  loadCode: string;
  loadName: string;
  dischargeCode: string;
  dischargeName: string;
  destinationCode: string;
  destinationName: string;
  sailDate: string;
  etaDate: string;
  documentCutoffDate: string;
  documentationCutOffTime: string;
  warehouseName: string;
  originUncode: string;
  loadUnCode: string;
  dischargeUnCode: string;
  destinationUnCode: string;
  placeOfDeliveryUnCode: string;
  originRegionCode: string;
  deconsolidationRegionCode: string;
  finalCFSRegionCode: string;
  wwaScheudle: boolean;
  etaDestination: string;
  warehouseDeliveryRef: string;
  documentDeliveryCode: string;
  documentDeliveryName: string;
  documentDeliveryAddress1: string;
  documentDeliveryAddress2: string;
  documentDeliveryAddress3: string;
  documentDeliveryContact: string;
  locationInformation: string;
  privateLocationInformation: string;
  deConsolidationCode: string;
  deConsolidationName: string;
  deConsolidationDate: string;
  finalCFSCode: string;
  finalCFSName: string;
  finalCFSDate: string;
  consolidationCFSCode: string;
  consolidationCFSName: string;
  consolidationCFSDate: string;
  consolidationCFSRegionCode: string;
  customsDeclaration: string;
  customsCutoffDate: string;
  customsCutoffTime: string;
  quoteNumber: number;
  rowNumber: number;
  bookingQuoteChargeBeanList: BookingQuoteChargeBean[];
  manufacturerDetailsBean: ManufacturerDetailsBean;
  oldVesselCode: string;
  oldVesselName: string;
  oldVoyage: string;
  placeOfReceiptName1: string;
  placeOfReceiptName2: string;
  placeOfReceiptName3: string;
  placeOfReceiptName4: string;
  placeOfDeliveryName1: string;
  placeOfDeliveryName2Selection: string;
  preCarriageETS: string;
  isPrintSailingScheduleInConfirmationDocument: YesNo;
  gatewayCutoffDate: string;
  gatewayCutoffTime: string;
}
