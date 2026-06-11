/**
 * SpotRateResultBean - Spot rate details within RateDetailBean
 */
export interface SpotRateResultBean {
  spotRateId?: string;
  parentRateId?: string;
  reference?: string;
  currencyCode?: string;
  chargeRate?: string;
  rateBasis?: string;
  effectiveDate?: string;
  expirationDate?: string;
  status?: string;
  comments?: string;
  inputLdapUser?: string;
  inputOfficeId?: string;
  inputDate?: string;
  updateLdapUser?: string;
  updateOfficeId?: string;
  updateDate?: string;
  transactionId?: string;
  companyId?: string;
  companyCode?: string;
  rateProfileId?: string;
  rateProfileCode?: string;
  rateNamedAccountId?: string;
  rateNamedAccountCode?: string;
  unitOfMeasurement?: string;
  fromId?: string;
  toId?: string;
}
