// ─── Charges ──────────────────────────────────────────────────────────────────

import type { ControlFlag, YesNo, PayType, OriginDestination } from "../common.types";

export interface TruckRate {
  [key: string]: unknown;
}

export interface BookingQuoteChargeBean {
  bookingQuoteNumber: number;
  recordNumber: number;
  chargeCode: string;
  comp: number;
  tariffNumber: number;
  tariffSequence: number;
  uom: string;
  sellRate: number;
  sellBasis: string;
  sellAmount: number;
  buyRate: number;
  buyBasis: string;
  buyAmount: number;
  sellCurrency: string;
  rateOfExchange: number;
  localAmount: number;
  relayFlag: string;
  company: string;
  truckingChargeLinkId: number;
  chargeDescription: string;
  controlFlag: ControlFlag;
  bookingQuoteRateId: number;
  dirty: boolean;
  applyVat: YesNo;
  originDestination: OriginDestination;
  payType: PayType;
  bookingPrepaid: number;
  bookingCollect: number;
  chargeType: string;
  isLinked: boolean;
  oldBasis: string;
  expenseCurrency: string;
  expenseRateOfExchange: number;
  expenseLocalAmount: number;
  expenseVat: number;
  expenseOldBasis: string;
  printOndocument: YesNo;
  isChargeAspectOFR: boolean;
  isRateReset: boolean;
  isOldRate: boolean;
  taxPercent: string;
  minimum?: number;
  maximum?: number;
  overridden: boolean;
  invoiceExchangeRate: number;
  invoiceSellRateOfExchange: number;
  invoiceExpenseRateOfExchange: number;
  invoiceSellAmount: number;
  invoiceExpenseAmount: number;
  invToLocalCurrencyExchangeRate: number;
  userDefineChargeDescription: string;
  spotRateKey: string;
  spotRateFlag: number;
  accurateSpotRateKey: string;
  isChargeRest: boolean;
  rateCompanyId: number;
  fmcChargeType: YesNo;
  rowNumber: number;
  aspect?: string;
  isFocusSet: boolean;
  isRateResetByQuote: boolean;
  isCallFromAccurate: boolean;
  truckRateId: number;
  pickupId: string;
  euVatRuleId: number;
  truckRate: TruckRate;
  truckRateDetailsFileId: number;
  isFmcChargeUpdated?: YesNo;
}
