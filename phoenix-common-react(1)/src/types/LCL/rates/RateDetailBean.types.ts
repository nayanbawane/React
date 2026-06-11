import type { SpotRateResultBean } from './SpotRateResultBean.types';

/**
 * RateDetailBean - Rate detail item in AccuRate response
 */
export interface RateDetailBean {
  rateDetailId?: string;
  companyId?: string;
  companyCode?: string;
  namedAccountId?: string;
  namedAccountCode?: string;
  customerAliasId?: string;
  customerAliasCode?: string;
  placeOfReceiptCode?: string;
  loadCode?: string;
  dischargeCode?: string;
  deconsolidationCode?: string;
  finalCfsCode?: string;
  placeOfDeliveryCode?: string;
  originInlandCFSCode?: string;
  consolidationCFSCode?: string;
  portOfLoadingCode?: string;
  transhipment1Code?: string;
  transhipment2Code?: string;
  transhipment3Code?: string;
  portOfDischargeCode?: string;
  deconsolidationCFSCode?: string;
  destinationCFSCode?: string;
  originOfRequest?: string;
  chargeType?: string;
  chargeCode?: string;
  currencyCode?: string;
  chargeRate?: string;
  rateBasis?: string;
  minimumRate?: string;
  maximumRate?: string;
  unitOfMeasurement?: string;
  measureFrom?: string;
  measureTo?: string;
  effectiveDate?: string;
  expirationDate?: string;
  prepaidCollect?: string;
  comments?: string;
  status?: string;
  locked?: string;
  standardFlag?: number;
  isCalculatedZero?: boolean;
  spotRateDetailsId?: string;
  spotRateFlag?: number;
  spotRateDetails?: SpotRateResultBean[];
  actualLenght?: number;
  fromLenght?: number;
  actualWeight?: number;
  fromWeight?: number;
  inputLdapUser?: string;
  inputOfficeId?: string;
  inputDate?: string;
  updateLdapUser?: string;
  updateOfficeId?: string;
  updateDate?: string;
  transactionId?: string;
  aspectSeparatedByComma?: string;
  controllingEntity?: string;
  conditionalMandatoryType?: string;
  routingKey?: string;
  originDestinationKey?: string;
}
