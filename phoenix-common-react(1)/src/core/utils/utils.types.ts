// Shared interfaces for all utilities in this folder.

export interface CurrencyUtilityBean {
  amount: number;
  currency: string;
  rateOfExchange?: number;
  calculateAmount?: boolean;
  percentage?: number;
  formattedAmountDouble?: number;
  formattedAmountString?: string;
}

export type CurrencyInput = CurrencyUtilityBean;

export interface TaxEntry {
  taxCode: string;
  taxPercent: string;
}

export interface TaxInfo {
  taxCode: string;
  taxPercent: string;
  taxText?: string;
  taxDescription?: string;
  taxLocaleDescription?: string;
  applyFor?: string;
  glCode?: string | null;
  taxFormula?: string;
}

export interface DecimalCurrencyConfig {
  currencyDecimalMap: Record<string, number>;
  localCurrency: string;
}

export type CommonChargeType = 'FOB' | 'OCC' | 'PLC';

export type CommonRateDetailsModule =
  | 'BOL'
  | 'BOOKING'
  | 'QUOTE'
  | 'TRUCK_BOOKING'
  | 'ADDITIONAL_INVOICE'
  | 'ARRIVAL_NOTICE'
  | 'LOT'
  | 'ARN_ADDITIONAL_INVOICE'
  | 'AIR_BOOKING'
  | 'CD_INVOICE';

export interface CommonChargeDetails {
  chargeCode?: string;
  chargeDescription?: string;
  chargeType?: CommonChargeType;
}

export interface CommonRateDetails {
  incomeRate?: number;
  expenseRate?: number;
  incomeLocalAmount?: number;
  expenseLocalAmount?: number;
  incomeAmount?: number | null;
  expenseAmount?: number;
  incomeCurrency?: string;
  expenseCurrency?: string;
  incomeROE?: number;
  expenseROE?: number;
  incomeVAT?: string; // "Y" or "N"
  expenseVAT?: string; // "Y" or "N"
  incomeChargeDetails?: CommonChargeDetails;
  enableForEdit?: boolean;
  isVatRow?: boolean;
  prepaidCollect?: string;
  originDestination?: string;
  incomeBasis?: string;
  expenseBasis?: string;
  zeroAllowed?: boolean;
  taxCode?: string;
  taxKey?: string;
  vatPercent?: string;
  taxText?: string;
  glCode?: string;
  applyFor?: string;
  invoiceSellAmount?: number | null;
  invoiceExpenseAmount?: number | null;
  invoiceSellRateOfExchange?: number;
  invToLocalCurrencyROE?: number;
  taxAmount?: number;
  taxLocalAmount?: number;
}

export interface CommonRateOfExchange {
  currencyCode: string;
  currencyRate: string;
}

export interface CommonRateVatInput {
  rateDetails: CommonRateDetails[];
  module: CommonRateDetailsModule;
  invoiceCurrency: string;
  rateOfExchangeBeans: CommonRateOfExchange[];
}

export type VatChargeCodeMap = Record<string, string>;

export interface RateVatConfig {
  localCurrency: string;
  allowDecimal: string;
}

export interface RateVatFeatureFlags {
  isDecimalCurrencyToggle?: boolean;
  showMultiportPairInQuote?: boolean;
  noRoundupForeignCurrency?: boolean;
  applyVatBasedOnFormula?: boolean;
  ocnIgnoreZeroVatAddCondition?: boolean;
}
