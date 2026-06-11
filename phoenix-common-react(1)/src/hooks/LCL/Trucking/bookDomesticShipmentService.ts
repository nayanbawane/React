export interface Address {
  companyName: string;
  streetAddress: string;
  streetAddressTwo: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  contactName?: string;
  phone?: string;
  email?: string;
  readyTime?: string;
  closingTime?: string;
  additionalInstructions?: string;
}

export interface Commodity {
  handlingQuantity: number;
  length: number;
  width: number;
  height: number;
  weightTotal: number;
  hazardousMaterial: boolean;
  piecesTotal: number;
  freightClass: string;
  nmfc: string;
  description: string;
  additionalMarkings: string;
  cbm: number;
  cbf: number;
}

export interface MainBean {
  shipmentId: string;
  shipmentType: string;
  stackable: boolean;
  trailerType: string;
  weightUnits: string;
  dimensionUnits: string;
  serviceLevel: string;
  shipperReferenceNumber: string;
  poReference: string;
  carrierSCAC: string;
  tariffDescription: string | null;
  originAddress: Address;
  destinationAddress: Address;
  commodities: Commodity[];
  accessorialCodes: string[];
  pickupDate: string;
  doNotDispatchCarrier: boolean;
  driverCellPhoneNumber: string | null;
  totalBuy: number;
  totalSell: number;
  customerReferenceNumber: string | null;
  customerStaffReferenceNumber: string | null;
  billToOrganizationId: string | null;
  customerStaffID: string | null;
  hazmatEmergencyContactNumber: string | null;
  latitude: number;
  longitude: number;
  contractUse: string | null;
  tradingPartnerNum: string | null;
}

export interface TmsOrderMainBean {
  pickupLocationCode: string;
  pickupZipCode: string;
  deliverToLocationCode: string;
  deliverToZipCode: string;
  alternateGateway: string;
  shipmentType: string;
  trailerType: string;
  customerPONumber: string;
  shipperReferenceNumber: string;
  loadReleaseNumber: string;
  tmscarrier: string;
  originBean: Address;
  destinationBean: Address;
  pickupDate: string;
  pickupTimeFrom: string;
  pickupTimeTo: string;
  deliveryEstimatedDate: string;
  pickupId: string;
  referenceNumber: string;
  tmsShipmentId: string;
  transactionalFlag: string;
  moduleCode: string;
  handlingOffice: string;
  chargeCodeMap: Record<string, unknown>;
}

export interface PriceAccessorial {
  accessorialCode: string;
  accessorialPrice: number;
}

export interface RateQuoteResultBean {
  carrierSCAC: string;
  carrierName: string;
  tariffDescription: string;
  transitTime: number;
  serviceLevel: string;
  priceLineHaul: number;
  priceFuelSurcharge: number;
  priceTotal: number;
  pricingInstructions: string;
  usedLiabilityCoverage: number;
  newLiabilityCoverage: number;
  tsaCompliance: string;
  errorMessage: string | null;
  priceAccessorials: PriceAccessorial[];
}

export interface BookDomesticShipmentRequest {
  mainBean: MainBean;
  tmsOrderMainBean: TmsOrderMainBean;
  rateQuoteResultBean: RateQuoteResultBean;
}

export interface BookDomesticShipmentPriceDetail {
  carrierSCAC: string;
  carrierName: string;
  tariffDescription: string;
  transitTime: number;
  serviceLevel: string;
  priceLineHaul: number;
  priceFuelSurcharge: number;
  priceAccessorials: Array<{
    accessorialCode: string;
    accessorialPrice: number;
    description: string | null;
  }>;
  priceTotal: number;
  pricingInstructions: string;
  usedLiabilityCoverage: number;
  newLiabilityCoverage: number;
  tsaCompliance: string;
  errorMessage: string | null;
}

export interface BookDomesticShipmentResult {
  shipmentID: string;
  proNumber: string | null;
  shipperReferenceNumber: string | null;
  poReference: string | null;
  shipmentStatus: string;
  billToType: string | null;
  billToAccountNumber: string | null;
  billToAddress: string | null;
  priceDetail: BookDomesticShipmentPriceDetail | null;
  billOfLadingURL: string | null;
  secondaryBOLNumber: string | null;
  errorMessage: string | null;
  chargeDescription: string;
  localeChargeDescription: string;
}

export interface BookDomesticShipmentResponse {
  success: number;
  result: BookDomesticShipmentResult | null;
  message: string;
  errorCode: string | null;
}
