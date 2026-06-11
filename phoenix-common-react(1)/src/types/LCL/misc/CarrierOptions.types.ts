export interface CarrierAccessorial {
  accessorialCode: string;
  accessorialPrice: number;
  description: string;
}

export interface AccessorialOption {
  accessorialCode: string;
  description: string;
}

export interface CarrierQuote {
  carrierName: string;
  carrierSCAC: string;
  serviceLevel: string;
  transitTime: number;
  newLiabilityCoverage: number;
  usedLiabilityCoverage: number;
  priceLineHaul: number;
  priceFuelSurcharge: number;
  priceAccessorials: CarrierAccessorial[];
  priceTotal: number;
  tsaCompliance: string;
  pricingInstructions: string;
  tariffDescription: string;
  errorMessage: string;
}

export interface CarrierOptionsFormData {
  pickupLocationCode: string;
  pickupZipCode: string;
  deliverToLocationCode: string;
  deliverToZipCode: string;
  pickupAccessorial: string[];
  deliverToAccessorial: string[];
  alternateGateway: string;
  zipCode: string;
  shipmentType: string;
  trailerType: string;
}

export interface RefreshOptionsParams {
  pickupZipCode: string;
  deliverToZipCode: string;
  accessorialCodes: string[];
  alternateGatewayZipCode?: string;
}

export interface RefreshOptionsResult {
  mainQuotes: CarrierQuote[];
  altGatewayQuotes?: CarrierQuote[];
}
