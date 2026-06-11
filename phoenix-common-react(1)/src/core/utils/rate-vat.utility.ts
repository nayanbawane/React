import type {
  CommonRateDetails,
  CommonChargeDetails,
  CommonChargeType,
  CommonRateDetailsModule,
  CommonRateOfExchange,
  CommonRateVatInput,
  TaxInfo,
  VatChargeCodeMap,
  RateVatConfig,
  RateVatFeatureFlags,
} from './utils.types';
import {
  calculateTaxAmount,
  formatAmount,
  getDoubleValue,
} from './currency.utility';
import { getFormattedNumber, isNotNullOrEmpty } from './string.utility';
import { calculateArTaxByDecimals } from './tax-calculation.utility';
import type { TaxBean } from './tax-calculation.utility';

const PERCENT_BASIS = '%';

export function getTotalIncomeVatAmt(rateDetailsBeans: CommonRateDetails[]): number {
  return rateDetailsBeans.reduce(
    (sum, bean) =>
      bean.incomeVAT?.startsWith('Y') ? sum + (bean.incomeLocalAmount ?? 0) : sum,
    0
  );
}

export function getTotalExpenseVatAmt(rateDetailsBeans: CommonRateDetails[]): number {
  return rateDetailsBeans.reduce(
    (sum, bean) =>
      bean.expenseVAT === 'Y' ? sum + (bean.expenseLocalAmount ?? 0) : sum,
    0
  );
}

export function getTotalInvoiceIncomeVatAmt(rateDetailsBeans: CommonRateDetails[]): number {
  return rateDetailsBeans.reduce(
    (sum, bean) =>
      bean.incomeVAT?.startsWith('Y') && bean.invoiceSellAmount != null
        ? sum + bean.invoiceSellAmount
        : sum,
    0
  );
}

export function getTotalInvoiceExpenseVatAmt(rateDetailsBeans: CommonRateDetails[]): number {
  return rateDetailsBeans.reduce(
    (sum, bean) =>
      bean.expenseVAT === 'Y' && bean.invoiceExpenseAmount != null
        ? sum + bean.invoiceExpenseAmount
        : sum,
    0
  );
}


function getTaxBean(
  taxKey: string,
  taxSettingMap: Record<string, TaxInfo> | null | undefined,
  vatChargeCodeMap: VatChargeCodeMap,
  applyVatBasedOnFormula = false,
  arTaxBeanMap: Record<string, TaxBean> = {}
): TaxInfo {
  let taxBean: TaxInfo | null = null;

  if (taxSettingMap) {
    taxBean = taxSettingMap[taxKey] ?? null;

    if (applyVatBasedOnFormula) {
      const taxCode =
        isNotNullOrEmpty(taxKey) && taxKey.includes('^')
          ? taxKey.split('^')[0]
          : taxKey;
      for (const entry of Object.values(arTaxBeanMap)) {
        if (entry.taxCode?.toLowerCase() === taxCode.toLowerCase()) {
          taxBean = entry as TaxInfo;
          break;
        }
      }
    }
  }

  if (!taxBean) {
    taxBean = {
      applyFor: 'AR',
      glCode: null,
      taxCode: vatChargeCodeMap['code'] ?? '',
      taxDescription: vatChargeCodeMap['name'] ?? '',
      taxLocaleDescription: vatChargeCodeMap['name'] ?? '',
      taxPercent: '0',
      taxText: vatChargeCodeMap['code'] ?? '',
    };
  }

  return taxBean;
}

function getDefaultChargeType(module: CommonRateDetailsModule): CommonChargeType {
  if (
    module === 'ARRIVAL_NOTICE' ||
    module === 'LOT' ||
    module === 'ARN_ADDITIONAL_INVOICE'
  ) {
    return 'PLC';
  }
  return 'FOB';
}

export function isDecimalAllowed(allowDecimal: string | null | undefined): string {
  if (isNotNullOrEmpty(allowDecimal)) return allowDecimal!;
  return 'Y';
}

export function fetchROEBean(
  currencyCode: string,
  roeBeans: CommonRateOfExchange[]
): CommonRateOfExchange | null {
  for (const roeBean of roeBeans) {
    if (currencyCode.toLowerCase() === roeBean.currencyCode.toLowerCase()) {
      return roeBean;
    }
  }
  return null;
}

export function isInvoiceCurrencyToggle(
  module: CommonRateDetailsModule,
  isFeatureEnabled: (toggleKey: string) => boolean
): boolean {
  const toggleMap: Partial<Record<CommonRateDetailsModule, string>> = {
    BOOKING: 'INVOICE_CURRENCY_OCEAN_BOOKING',
    QUOTE: 'INVOICE_CURRENCY_QUOTE',
    BOL: 'INVOICE_CURRENCY_BILL_OF_LADING',
    ADDITIONAL_INVOICE: 'INVOICE_CURRENCY_BILL_OF_LADING',
    ARRIVAL_NOTICE: 'INVOICE_CURRENCY_ARRIVAL_NOTICE',
    ARN_ADDITIONAL_INVOICE: 'INVOICE_CURRENCY_ARRIVAL_NOTICE',
    LOT: 'INVOICE_CURRENCY_LOT',
    TRUCK_BOOKING: 'INVOICE_CURRENCY_TRUCK_BOOKING',
    AIR_BOOKING: 'INVOICE_CURRENCY_AIR',
    CD_INVOICE: 'INVOICE_CURRENCY_CREDIT_DEBIT_INVOICE',
  };
  const toggle = toggleMap[module];
  return toggle ? isFeatureEnabled(toggle) : false;
}

export function calculateVat(
  rateDetailsBeans: CommonRateDetails[],
  vatPercentage: number,
  module: CommonRateDetailsModule,
  vatChargeCodeMap: VatChargeCodeMap,
  config: RateVatConfig,
  flags: RateVatFeatureFlags = {}
): CommonRateDetails {
  const totalVATIncomeLocalamount = getTotalIncomeVatAmt(rateDetailsBeans);
  const totalVATExpenseLocalamount = getTotalExpenseVatAmt(rateDetailsBeans);

  const localCurrency = config.localCurrency || 'USD';
  let incomeVatCharge = 0.0;
  let expenseVatCharge = 0.0;

  if (flags.isDecimalCurrencyToggle) {
    // PHX-83959: currency-aware rounding; no percentage passed (matches Java CurrencyUtilityBean(amount, currency))
    incomeVatCharge =
      calculateTaxAmount({ amount: totalVATIncomeLocalamount, currency: localCurrency }, false)
        .formattedAmountDouble ?? 0;
    expenseVatCharge =
      calculateTaxAmount({ amount: totalVATExpenseLocalamount, currency: localCurrency }, false)
        .formattedAmountDouble ?? 0;
  } else {
    if (isDecimalAllowed(config.allowDecimal) === 'N') {
      incomeVatCharge = getDoubleValue(
        getFormattedNumber((totalVATIncomeLocalamount * vatPercentage) / 100, true, 0)
      );
      expenseVatCharge = getDoubleValue(
        getFormattedNumber((totalVATExpenseLocalamount * vatPercentage) / 100, true, 0)
      );
    } else {
      incomeVatCharge = getDoubleValue(
        getFormattedNumber((totalVATIncomeLocalamount * vatPercentage) / 100, true, 2)
      );
      expenseVatCharge = getDoubleValue(
        getFormattedNumber((totalVATExpenseLocalamount * vatPercentage) / 100, true, 2)
      );
    }
  }

  const chargeDetails: CommonChargeDetails = {
    chargeCode: vatChargeCodeMap['code'],
    chargeDescription: vatChargeCodeMap['name'],
    chargeType: getDefaultChargeType(module),
  };

  return {
    incomeRate: vatPercentage,
    expenseRate: vatPercentage,
    incomeLocalAmount: incomeVatCharge,
    expenseLocalAmount: expenseVatCharge,
    incomeAmount: incomeVatCharge,
    expenseAmount: expenseVatCharge,
    incomeCurrency: localCurrency,
    expenseCurrency: localCurrency,
    incomeROE: 1,
    expenseROE: 1,
    incomeVAT: 'N',
    expenseVAT: 'N',
    incomeChargeDetails: chargeDetails,
    enableForEdit: false,
    isVatRow: true,
    prepaidCollect: 'C',
    originDestination: 'D',
    incomeBasis: PERCENT_BASIS,
    expenseBasis: PERCENT_BASIS,
    zeroAllowed: true,
  };
}

export function calculateMultipleVat(
  input: CommonRateVatInput,
  vatChargeCodeMap: VatChargeCodeMap,
  config: RateVatConfig,
  taxSettingMap: Record<string, TaxInfo> | null | undefined,
  isFeatureEnabled: (toggleKey: string) => boolean,
  flags: RateVatFeatureFlags = {},
  arTaxBeanMap: Record<string, TaxBean> = {}
): CommonRateDetails[] {
  const vatBeanList: CommonRateDetails[] = [];
  const rateDetailsMapList = new Map<string, CommonRateDetails[]>();

  const { rateDetails: rateDetailsBeans, module, invoiceCurrency, rateOfExchangeBeans: roeBeans } = input;
  const localCurrency = config.localCurrency || 'USD';

  // Group rows by taxKey (append chargeType suffix for QUOTE+multiport — PHX-65931)
  for (const rateDetailsBean of rateDetailsBeans) {
    if (!rateDetailsBean.vatPercent) {
      rateDetailsBean.vatPercent = '0';
    }

    let groupKey: string;
    if (flags.showMultiportPairInQuote && module === 'QUOTE') {
      groupKey = `${rateDetailsBean.taxKey}~${rateDetailsBean.incomeChargeDetails?.chargeType ?? ''}`;
    } else {
      groupKey = rateDetailsBean.taxKey ?? '';
    }

    const existing = rateDetailsMapList.get(groupKey);
    if (existing) {
      existing.push(rateDetailsBean);
    } else {
      rateDetailsMapList.set(groupKey, [rateDetailsBean]);
    }
  }

  const invoiceCurrencyActive = isInvoiceCurrencyToggle(module, isFeatureEnabled);

  for (const [rawKey, rateDetailsList] of rateDetailsMapList) {
    // Strip chargeType suffix added for multiport grouping
    let taxKey = rawKey;
    if (
      flags.showMultiportPairInQuote &&
      module === 'QUOTE' &&
      isNotNullOrEmpty(rawKey) &&
      rawKey.includes('~')
    ) {
      taxKey = rawKey.split('~')[0];
    }

    const taxBean = getTaxBean(taxKey, taxSettingMap, vatChargeCodeMap, flags.applyVatBasedOnFormula, arTaxBeanMap);
    const taxPercent = parseFloat(taxBean.taxPercent) || 0;

    const totalVATIncomeLocalamount = getTotalIncomeVatAmt(rateDetailsList);
    const totalVATExpenseLocalamount = getTotalExpenseVatAmt(rateDetailsList);
    const totalVATincomeInvoiceamount = getTotalInvoiceIncomeVatAmt(rateDetailsList);
    const totalVATExpenseInvoiceamount = getTotalInvoiceExpenseVatAmt(rateDetailsList);

    let incomeVatCharge = 0.0;
    let expenseVatCharge = 0.0;
    let incomeInvoiceVatCharge = 0.0;
    let expenseInvoiceVatCharge = 0.0;

    if (flags.isDecimalCurrencyToggle) {
      // PHX-83959: currency-aware rounding WITH percentage (matches Java CurrencyUtilityBean(amount, currency, taxPercent))
      incomeVatCharge =
        calculateTaxAmount(
          { amount: totalVATIncomeLocalamount, currency: localCurrency, percentage: taxPercent },
          !!flags.applyVatBasedOnFormula,
          arTaxBeanMap
        ).formattedAmountDouble ?? 0;

      expenseVatCharge =
        calculateTaxAmount(
          { amount: totalVATExpenseLocalamount, currency: localCurrency, percentage: taxPercent },
          !!flags.applyVatBasedOnFormula,
          arTaxBeanMap
        ).formattedAmountDouble ?? 0;

      incomeInvoiceVatCharge =
        calculateTaxAmount(
          { amount: totalVATincomeInvoiceamount, currency: invoiceCurrency, percentage: taxPercent },
          !!flags.applyVatBasedOnFormula,
          arTaxBeanMap
        ).formattedAmountDouble ?? 0;

      expenseInvoiceVatCharge =
        calculateTaxAmount(
          { amount: totalVATExpenseInvoiceamount, currency: invoiceCurrency, percentage: taxPercent },
          !!flags.applyVatBasedOnFormula,
          arTaxBeanMap
        ).formattedAmountDouble ?? 0;
    } else {
      if (isDecimalAllowed(config.allowDecimal) === 'N') {
        if (flags.noRoundupForeignCurrency) {
          // PHX-83959: when local === invoice currency round to 0; otherwise keep 2 decimals for foreign
          const isSameCurrency = localCurrency.toLowerCase() === invoiceCurrency.toLowerCase();
          const decimals = isSameCurrency ? 0 : 2;

          incomeVatCharge = getDoubleValue(
            getFormattedNumber((totalVATIncomeLocalamount * taxPercent) / 100, true, decimals)
          );
          expenseVatCharge = getDoubleValue(
            getFormattedNumber((totalVATExpenseLocalamount * taxPercent) / 100, true, decimals)
          );
          incomeInvoiceVatCharge = getDoubleValue(
            getFormattedNumber((totalVATincomeInvoiceamount * taxPercent) / 100, true, decimals)
          );
          expenseInvoiceVatCharge = getDoubleValue(
            getFormattedNumber((totalVATExpenseInvoiceamount * taxPercent) / 100, true, decimals)
          );
        } else {
          incomeVatCharge = getDoubleValue(
            getFormattedNumber((totalVATIncomeLocalamount * taxPercent) / 100, true, 0)
          );
          expenseVatCharge = getDoubleValue(
            getFormattedNumber((totalVATExpenseLocalamount * taxPercent) / 100, true, 0)
          );
          incomeInvoiceVatCharge = getDoubleValue(
            getFormattedNumber((totalVATincomeInvoiceamount * taxPercent) / 100, true, 0)
          );
          expenseInvoiceVatCharge = getDoubleValue(
            getFormattedNumber((totalVATExpenseInvoiceamount * taxPercent) / 100, true, 0)
          );
        }
      } else {
        incomeVatCharge = getDoubleValue(
          getFormattedNumber((totalVATIncomeLocalamount * taxPercent) / 100, true, 2)
        );
        expenseVatCharge = getDoubleValue(
          getFormattedNumber((totalVATExpenseLocalamount * taxPercent) / 100, true, 2)
        );
        incomeInvoiceVatCharge = getDoubleValue(
          getFormattedNumber((totalVATincomeInvoiceamount * taxPercent) / 100, true, 2)
        );
        expenseInvoiceVatCharge = getDoubleValue(
          getFormattedNumber((totalVATExpenseInvoiceamount * taxPercent) / 100, true, 2)
        );
      }
    }

    const firstBean = rateDetailsList[0];

    // Resolve chargeType for this VAT row
    let chargeType: CommonChargeType;
    if (
      module === 'BOL' ||
      module === 'BOOKING' ||
      module === 'QUOTE' ||
      module === 'TRUCK_BOOKING' ||
      module === 'ADDITIONAL_INVOICE'
    ) {
      if (
        flags.showMultiportPairInQuote &&
        module === 'QUOTE' &&
        firstBean.incomeChargeDetails?.chargeType === 'OCC'
      ) {
        chargeType = 'OCC';
      } else {
        chargeType = 'FOB';
      }
    } else if (
      module === 'ARRIVAL_NOTICE' ||
      module === 'LOT' ||
      module === 'ARN_ADDITIONAL_INVOICE'
    ) {
      chargeType = 'PLC';
    } else {
      chargeType = getDefaultChargeType(module);
    }

    const chargeDescription = flags.applyVatBasedOnFormula
      ? (taxBean.taxText ?? '')
      : `${taxBean.taxText ?? ''}@${taxBean.taxPercent}${PERCENT_BASIS}`;

    const chargeDetails: CommonChargeDetails = {
      chargeCode: vatChargeCodeMap['code'],
      chargeDescription,
      chargeType,
    };

    const vatBean: CommonRateDetails = {
      incomeRate: taxPercent,
      expenseRate: taxPercent,
      incomeLocalAmount: incomeVatCharge,
      expenseLocalAmount: expenseVatCharge,
      incomeAmount: incomeVatCharge,
      expenseAmount: expenseVatCharge,
      incomeCurrency: localCurrency,
      expenseCurrency: localCurrency,
      incomeROE: 1,
      expenseROE: 1,
      incomeVAT: 'N',
      expenseVAT: 'N',
      incomeChargeDetails: chargeDetails,
      enableForEdit: false,
      isVatRow: true,
      prepaidCollect: firstBean.prepaidCollect,
      originDestination: firstBean.prepaidCollect?.toUpperCase() === 'P' ? 'O' : 'L',
      incomeBasis: PERCENT_BASIS,
      expenseBasis: PERCENT_BASIS,
      zeroAllowed: true,
      taxCode: firstBean.taxCode,
      taxKey: `${firstBean.taxCode}^${firstBean.vatPercent}^${firstBean.taxText}`,
      applyFor: firstBean.applyFor,
      taxText: firstBean.taxText,
      glCode: firstBean.glCode,
    };

    if (invoiceCurrencyActive) {
      vatBean.invoiceSellAmount = incomeInvoiceVatCharge;
      vatBean.invoiceExpenseAmount = expenseInvoiceVatCharge;
      // PHX-65931: incomeAmount/expenseAmount reflect invoice amounts; currency switches to invoiceCurrency
      vatBean.incomeAmount = incomeInvoiceVatCharge;
      vatBean.expenseAmount = expenseInvoiceVatCharge;
      vatBean.incomeCurrency = invoiceCurrency;
      vatBean.expenseCurrency = invoiceCurrency;
      vatBean.invoiceSellRateOfExchange = 1;

      const roeBean = fetchROEBean(invoiceCurrency, roeBeans);
      if (roeBean) {
        vatBean.incomeROE = parseFloat(roeBean.currencyRate) || 1;
        vatBean.expenseROE = parseFloat(roeBean.currencyRate) || 1;
      }
    }

    vatBeanList.push(vatBean);
  }

  return vatBeanList;
}

export function calculateLocalAmtForInvCurrencyAmt(
  localCurrency: string,
  vatBean: CommonRateDetails
): void {
  let incomeLocal = (vatBean.incomeAmount ?? 0) * (vatBean.incomeROE ?? 1);
  let expenseLocal = (vatBean.expenseAmount ?? 0) * (vatBean.expenseROE ?? 1);

  incomeLocal =
    formatAmount({ amount: incomeLocal, currency: localCurrency }).formattedAmountDouble ?? incomeLocal;
  expenseLocal =
    formatAmount({ amount: expenseLocal, currency: localCurrency }).formattedAmountDouble ?? expenseLocal;

  vatBean.incomeLocalAmount = incomeLocal;
  vatBean.expenseLocalAmount = expenseLocal;
}

export function calculateVatForEachRateRow(
  rateDetail: CommonRateDetails,
  arTaxBeanMap: Record<string, TaxBean>,
  ocnIgnoreZeroVatAddCondition = false
): void {
  if (!ocnIgnoreZeroVatAddCondition && rateDetail.vatPercent?.toLowerCase() === '0') {
    rateDetail.taxAmount = 0.0;
    rateDetail.taxLocalAmount = 0.0;
    return;
  }

  const baseAmount = rateDetail.incomeAmount ?? 0;
  const roe = rateDetail.invoiceSellRateOfExchange ?? 1;
  const taxBase = baseAmount * roe;

  const taxAmount = calculateArTaxByDecimals(
    String(taxBase),
    rateDetail.taxCode ?? '',
    8,
    arTaxBeanMap
  );

  rateDetail.taxAmount = taxAmount;

  const localRoe = rateDetail.invToLocalCurrencyROE ?? 1;
  rateDetail.taxLocalAmount = Math.round(taxAmount * localRoe * 1e8) / 1e8;
}
