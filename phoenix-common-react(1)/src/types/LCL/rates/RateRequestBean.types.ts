/**
 * RateRequestBean - Request DTO for AccuRate endpoints
 */
export interface RateRequestBean {
  placeOfReceiptCode?: string | null;
  loadCode?: string | null;
  dischargeCode?: string | null;
  deconsolidationCode?: string | null;
  finalCfsCode?: string | null;
  placeOfDeliveryCode?: string | null;
  originInlandCFSCode?: string | null;
  consolidationCFSCode?: string | null;
  portOfLoadingCode: string | null;
  transhipment1Code?: string | null;
  transhipment2Code?: string | null;
  transhipment3Code?: string | null;
  portOfDischargeCode: string | null;
  deconsolidationCFSCode?: string | null;
  destinationCFSCode: string | null;
  originOfRequest: string | null;
  companyCode: string;
  namedAccountCode: string;
  cubeCargo?: number | null;
  weightCargo?: number | null;
  prepaidCollect?: string | null;
  uomValue: string;
  overLengthFlag?: boolean | null;
  overWeightFlag?: boolean | null;
  hazardousFlag?: boolean | null;
  companyId: string;
  rateProfileCode: string;
  shipmentDate: string;
  locale: string;
  controllingEntity?: string | null;
  rateControllingEntity?: string | null;
  module?: string | null;
  cubeCargoInFeet?: number | null;
  destinationCFSNamedAccount?: string | null;
  dischargeNamedAccount?: string | null;
  officeId?: number | null;
  officeCode: string;
  spotRateFlag?: number | null;
  ratingType?: string | null;
  direction?: string | null;
  tabNumber?: number | null;
  nacRatesAvailable?: boolean | null;
  nonStackable?: string | null;
  aspects?: string | null;
  terms?: string | null;
  pickupDeliveryFlag?: string | null;
  dimensionBeans?: unknown[] | null;
}
