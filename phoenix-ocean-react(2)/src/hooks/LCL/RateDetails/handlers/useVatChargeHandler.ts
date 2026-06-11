import { useMemo } from 'react';
import {
  BookingQuoteChargeBeanFull,
  calculateMultipleVat,
  calculateVatForEachRateRow,
  ChargeType,
  CommonRateDetails,
  CommonRateOfExchange,
  CommonToggleKeys,
  createBlankBeanRow,
  OriginDestination,
  PrepaidCollect,
  RoeRow,
  setArTaxBeanMap,
  TaxBean,
  TaxInfo,
  useFeatureToggle,
  VAT_CHARGE_CODE,
} from 'phoenix-common-react';

export interface VatHandlerDeps {
  invoiceCurrency: string;
  isVATEnable: boolean;
  localCurrency: string;
  roeRows: RoeRow[];
  taxSettingMap?: Record<string, TaxInfo> | null;
}


export const filterForVat = (
  rows: BookingQuoteChargeBeanFull[]
): BookingQuoteChargeBeanFull[] =>
  rows.filter(
    (r) =>
      !r.isVatBean &&
      r.incomeVAT?.startsWith('Y') &&
      r.transactionalFlag !== 'D' &&
      !!r.incomeChargeDetails?.chargeCode?.trim() &&
      r.prepaidCollect === 'P'
  );

export const useVatChargeHandler = (
  deps: VatHandlerDeps,
  featureToggle: ReturnType<typeof useFeatureToggle>
) => {
  const { invoiceCurrency, isVATEnable, localCurrency, roeRows, taxSettingMap } = deps;
  const { isVisible, getToggleValue } = featureToggle;

  const isCommonVatEnabled =
    isVisible(CommonToggleKeys.PHX_COMMON_VAT_UTIL_OCN) &&
    isVisible(CommonToggleKeys.PHX_COMMON_VAT_UTIL);

  const allowDecimal = getToggleValue(CommonToggleKeys.DECIMAL) ?? 'Y';

  const arTaxBeanMap = useMemo(
    () => setArTaxBeanMap(taxSettingMap as Record<string, TaxBean> | null | undefined),
    [taxSettingMap]
  );

  const rateOfExchangeBeans: CommonRateOfExchange[] = useMemo(
    () => roeRows.map((r) => ({ currencyCode: r.currency, currencyRate: r.invoiceCurrencyROE })),
    [roeRows]
  );

  const flags = {
    isDecimalCurrencyToggle: isVisible(CommonToggleKeys.OCEAN_CURRENCY_DECIMAL),
    showMultiportPairInQuote: isVisible(CommonToggleKeys.SHOW_MULTIPORT_PAIR_IN_QUOTE),
    noRoundupForeignCurrency: isVisible(CommonToggleKeys.NO_ROUNDUP_FOREIGN_CURRENCY),
    applyVatBasedOnFormula: isVisible(CommonToggleKeys.APPLY_VAT_BASED_ON_FORMULA),
  };

  const vatChargeCodeMap = { code: VAT_CHARGE_CODE, name: VAT_CHARGE_CODE };


  const toVatBeanRow = (
    vatDetail: CommonRateDetails,
    existing?: BookingQuoteChargeBeanFull
  ): BookingQuoteChargeBeanFull => {
    const base = existing ?? createBlankBeanRow('FOB' as ChargeType, invoiceCurrency);

    return {
      ...base,
      isVatBean: true,
      isEnableForEdit: false,
      incomeRate: vatDetail.incomeRate ?? 0,
      expenseRate: vatDetail.expenseRate ?? 0,
      incomeLocalAmount: vatDetail.incomeLocalAmount ?? 0,
      expenseLocalAmount: vatDetail.expenseLocalAmount ?? 0,
      incomeAmount: vatDetail.incomeAmount ?? 0,
      expenseAmount: vatDetail.expenseAmount ?? 0,
      incomeCurrency: vatDetail.incomeCurrency ?? invoiceCurrency,
      expenseCurrency: vatDetail.expenseCurrency ?? invoiceCurrency,
      incomeROE: vatDetail.incomeROE ?? 1,
      expenseROE: vatDetail.expenseROE ?? 1,
      incomeVAT: vatDetail.incomeVAT ?? 'N',
      expenseVAT: vatDetail.expenseVAT ?? 'N',
      incomeChargeDetails: {
        chargeCode: vatDetail.incomeChargeDetails?.chargeCode,
        chargeDescription: vatDetail.incomeChargeDetails?.chargeDescription,
        chargeType: (vatDetail.incomeChargeDetails?.chargeType as ChargeType) ?? 'FOB',
      },
      prepaidCollect: (vatDetail.prepaidCollect as PrepaidCollect) ?? base.prepaidCollect,
      originDestination: (vatDetail.originDestination as OriginDestination) ?? base.originDestination,
      incomeBasis: vatDetail.incomeBasis ?? '%',
      expenseBasis: vatDetail.expenseBasis ?? '%',
      isZeroAllowed: vatDetail.zeroAllowed ?? true,
      taxCode: vatDetail.taxCode ?? '',
      taxKey: vatDetail.taxKey ?? '',
      applyFor: vatDetail.applyFor ?? '',
      taxText: vatDetail.taxText ?? '',
      glCode: vatDetail.glCode ?? '',
      // vatPercent is the income rate (the grouped tax percent)
      vatPercent: String(vatDetail.incomeRate ?? 0),
      invoiceSellAmount: vatDetail.invoiceSellAmount ?? 0,
      invoiceExpenseAmount: vatDetail.invoiceExpenseAmount ?? 0,
      invoiceSellRateOfExchange: vatDetail.invoiceSellRateOfExchange ?? 0,
      taxAmount: vatDetail.taxAmount ?? null,
      taxLocalAmount: vatDetail.taxLocalAmount ?? null,
    };
  };

  const computeVatRows = (
    rows: BookingQuoteChargeBeanFull[]
  ): BookingQuoteChargeBeanFull[] => {
    if (!isVATEnable || !isCommonVatEnabled) return rows;

    const normalRows = rows.filter((r) => !r.isVatBean);
    const oldVatRows = rows.filter((r) => r.isVatBean);

    const processedRows = normalRows.map((row) => {
      const isPrepaid = row.prepaidCollect?.toUpperCase() === 'P';

      if (!isPrepaid || !row.incomeVAT || row.incomeVAT.toUpperCase() === 'N') {
        return { ...row, taxAmount: null, taxLocalAmount: null };
      }

      const rowCopy = { ...row } as unknown as CommonRateDetails;
      calculateVatForEachRateRow(rowCopy, arTaxBeanMap);
      return {
        ...row,
        taxAmount: rowCopy.taxAmount ?? null,
        taxLocalAmount: rowCopy.taxLocalAmount ?? null,
      };
    });

    const eligible = filterForVat(processedRows);

    if (eligible.length === 0) return processedRows;

    const vatDetails = calculateMultipleVat(
      {
        rateDetails: eligible.map((r) => ({ ...r })) as unknown as CommonRateDetails[],
        module: 'BOOKING',
        invoiceCurrency,
        rateOfExchangeBeans,
      },
      vatChargeCodeMap,
      { localCurrency, allowDecimal },
      taxSettingMap,
      (key: string) => isVisible(key as any),
      flags,
      arTaxBeanMap
    );

    const vatRows: BookingQuoteChargeBeanFull[] = vatDetails.map((vatDetail) => {
      // Reuse existing VAT row by taxKey, falling back to vatPercent match
      const existing = oldVatRows.find(
        (r) => r.taxKey === vatDetail.taxKey ||
               (!vatDetail.taxKey && r.vatPercent === String(vatDetail.incomeRate ?? 0))
      );
      return toVatBeanRow(vatDetail, existing);
    });

    const updated = [...processedRows];

    // Insert VAT rows after the last FOB charge row (consistent with prior positioning)
    const lastFOBIndex = updated
      .map((r, i) => (r.incomeChargeDetails?.chargeType === 'FOB' ? i : -1))
      .filter((i) => i !== -1)
      .pop();

    if (lastFOBIndex !== undefined) {
      updated.splice(lastFOBIndex + 1, 0, ...vatRows);
    } else {
      updated.push(...vatRows);
    }

    return updated;
  };

  return { computeVatRows, filterForVat };
};
