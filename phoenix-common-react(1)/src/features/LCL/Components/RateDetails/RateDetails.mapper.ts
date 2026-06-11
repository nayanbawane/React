import { BookingQuoteChargeBeanFull, ChargesState, ChargeType, RateDetailsFormData, RelayFlag, RoeRow } from "@/types/LCL/RateDetails/RateDetails.types";
import { createBlankBeanRow, makeRowId } from "../../../../types/LCL/RateDetails/rateDetailsHelper";
import { num, str, strOrNull } from "../../../../core/utils/string.utility";
import type { PickupCharge } from "@/types/LCL/misc/TruckingDetails.types";

// ─── relay flag reverse map ─────────────────────────────────────────────────

const RELAY_FLAG_TO_CODE: Record<string, string> = {
  MANUAL: 'U', ACCURATE: 'A', GRDB: 'G', TARIFF: 'T',
  CTC: 'C', IMPORT: 'I', TRK: 'D',
};

// ─── mainBookingQuoteBean (the outer wrapper) ───────────────────────────────

function mapChargeBeanRowToApi(row: any, idx: number, mainDetails?: any) {
  return {
    bookingQuoteNumber: mainDetails?.referenceNumber,
    recordNumber: idx,
    chargeCode: str(row.incomeChargeDetails?.chargeCode),
    comp: 0,
    tariffNumber: 0,
    commodityNumber: null,
    tariffSequence: 0,
    uom: 'M',
    sellRate: num(row.incomeRate),
    sellBasis: str(row.incomeBasis),
    sellAmount: num(row.incomeAmount),
    buyRate: num(row.expenseRate),
    buyBasis: str(row.expenseBasis),
    buyAmount: num(row.expenseAmount),
    comments: null,
    sellCurrency: str(row.incomeCurrency) || 'USD',
    prepaidCreditFlag: null,
    rateOfExchange: num(row.incomeROE) || 1,
    localAmount: num(row.incomeLocalAmount),
    relayFlag: RELAY_FLAG_TO_CODE[str(row.relayFlag)] || 'U',
    company: '01',
    dueAccount: null,
    rateClass: null,
    vendor: strOrNull(row.vendor),
    originalAmount: null,
    truckingChargeLinkId: num(row.truckingChargeLinkId),
    chargeDescription: str(row.incomeChargeDetails?.chargeDescription),
    localeChargeDescription: null,
    rowId: strOrNull(row.rowId),
    controlFlag: row.controlFlag || str(row.transactionalFlag) || 'N',
    type: null,
    bookingQuoteRateId: num(row.bookingRateId),
    equipmentDetail: strOrNull(row.equipmentDetails),
    dirty: false,
    expense: null,
    code: null,
    applyVat: str(row.incomeVAT) === 'Y' ? 'Y' : 'N',
    description: null,
    oldInvoiceNumber: null,
    oldVendor: null,
    localCurrency: null,
    originDestination: str(row.originDestination) || 'O',
    payType: str(row.prepaidCollect) || '\u0000',
    exchangeRate: null,
    currency: null,
    bookingPrepaid: 0,
    bookingCollect: 0,
    rate: null,
    invoiceDate: strOrNull(row.invoiceDate),
    invoiceNumber: strOrNull(row.invoiceNumber),
    chargeType: str(row.incomeChargeDetails?.chargeType) || 'OFR',
    oldCharge: null,
    oldCurrency: null,
    oldBasis: str(row.incomeOldBasis),
    checkAgainstBasis: null,
    expenseCurrency: str(row.expenseCurrency) || 'USD',
    expenseRateOfExchange: num(row.expenseROE) || 1,
    expenseLocalAmount: num(row.expenseLocalAmount),
    expenseVat: str(row.expenseVAT) === 'Y' ? 1 : 0,
    expenseVendorReference: strOrNull(row.vendorReference),
    expenseOldBasis: strOrNull(row.expenseOldBasis),
    printOndocument: row.isPrintOnDocument ? 'Y' : 'N',
    oldBookingQuoteChargeBean: null,
    taxPercent: '0',
    taxCode: strOrNull(row.taxCode),
    taxText: strOrNull(row.taxText),
    applyFor: strOrNull(row.applyFor),
    glCode: strOrNull(row.glCode),
    maximum: row.incomeMaximumRate ?? null,
    expenseMaximum: row.expenseMaximumRate ?? null,
    expenseMinimum: row.expenseMinimumRate ?? null,
    minimum: row.incomeMinimumRate ?? null,
    overridden: row.overridden ?? false,
    invoiceCurrency: strOrNull(row.invoiceCurrency),
    invoiceExchangeRate: num(row.invoiceCurrencyROE),
    invoiceSellRateOfExchange: num(row.invoiceSellRateOfExchange),
    invoiceExpenseRateOfExchange: num(row.invoiceExpenseRateOfExchange),
    invoiceSellAmount: num(row.invoiceSellAmount),
    invoiceExpenseAmount: num(row.invoiceExpenseAmount),
    invToLocalCurrencyExchangeRate: num(row.invToLocalCurrencyROE) || 1,
    userDefineChargeDescription: str(row.userDefineChargeDescription),
    spotRateDetailsId: strOrNull(row.spotRateDetailsId),
    spotRateKey: str(row.spotRateKey),
    spotRateFlag: num(row.spotRateFlag),
    accurateSpotRateKey: str(row.accurateSpotRateKey),
    sprKey: strOrNull(row.sprKey),
    rateCompanyId: num(row.rateCompanyId),
    fmcChargeType: strOrNull(row.fmcChargeType),
    rowNumber: 0,
    aspect: strOrNull(row.aspect),
    isFmcChargeUpdated: null,
    isCallFromAccurate: row.isCallFromAccurate ?? false,
    taxAmount: row.taxAmount ?? null,
    taxLocalAmount: row.taxLocalAmount ?? null,
    truckerRateExpired: strOrNull(row.truckerRateExpired),
    truckChargeGroup: strOrNull(row.truckChargeGroup),
    pickupCharge: row.truckChargeGroup === 'PTC' ? 'Y' : 'N',
    truckCity: strOrNull(row.truckCity),
    truckZipCountry: strOrNull(row.truckZipCountry),
    truckChargeNotes: strOrNull(row.truckChargeNotes),
    truckerName: strOrNull(row.truckerName),
    truckRateId: num(row.truckRateId),
    cfsName: strOrNull(row.cfsName),
    pickupId: str(row.pickupId),
    doorCountry: strOrNull(row.doorCountry),
    euVatRuleId: num(row.euVatRuleId),
    truckRate: row.truckRate ?? { header: null, charges: null },
    truckRateDetailsFileId: num(row.truckRateDetailsFileId),
    vatPercentage: null,
    chargeAspectOFR: false,
    chargeRest: row.isChargeRest ?? false,
    taxKey: strOrNull(row.taxKey),
    linked: row.isLinkedWithPhoenix ?? true,
    focusSet: row.isFocusSet ?? false,
    vatAmount: num(row.vatAmount),
    rateReset: false,
    oldRate: row.isOldRate ?? false,
    rateResetByQuote: false,
  };
}

export function buildBookingQuoteChargeBeanList(rate?: any, isNewEntry = false, mainDetails?: any) {
  const asInsert = (r: any) => ({ ...r, controlFlag: 'N', rowId: null });

  // 1. Frontend BookingQuoteChargeBeanFull rows (from charges.rateDetails)
  const frontendRows = rate?.charges?.rateDetails;
  if (Array.isArray(frontendRows) && frontendRows.length > 0) {
    // Check if these are already in API format (have chargeCode at top level)
    if (frontendRows[0].chargeCode != null) {
      return isNewEntry ? frontendRows.map(asInsert) : frontendRows;
    }
    // Otherwise map from frontend format to API format
    return frontendRows
      .filter((r: any) => !r.isVatBean)
      .map((row: any, idx: number) => {
        const mapped = mapChargeBeanRowToApi(row, idx, mainDetails);
        return isNewEntry ? asInsert(mapped) : mapped;
      });
  }
  // 2. Already in API format
  if (Array.isArray(rate?.bookingQuoteChargeBeanList) && rate.bookingQuoteChargeBeanList.length > 0) {
    return isNewEntry ? rate.bookingQuoteChargeBeanList.map(asInsert) : rate.bookingQuoteChargeBeanList;
  }
  return [];
}

export interface MappedRateDetailsPopulate {
  charges: ChargesState;
  ratingType: string;
  roeType: string;
  rateOfExchange: RateDetailsFormData['rateOfExchange'];
}

export const mapRateDetailsFromPopulate = (
  chargeBeanList: any[] | undefined | null,
  mainBean: any
): MappedRateDetailsPopulate => {
  const rows: BookingQuoteChargeBeanFull[] = (chargeBeanList ?? [])
    .filter(Boolean)
    .map(mapBookingChargeBeanToRow);

  const currencyRoeMap = new Map<string, { localCurrencyROE: string; invoiceCurrencyROE: string }>();

  (chargeBeanList ?? []).filter(Boolean).forEach((bean: any) => {
    if (bean.sellCurrency?.trim()) {
      currencyRoeMap.set(bean.sellCurrency, {
        localCurrencyROE: String(bean.rateOfExchange ?? 0),
        invoiceCurrencyROE: String(bean.invoiceSellRateOfExchange ?? bean.rateOfExchange ?? 0),
      });
    }
    if (bean.expenseCurrency?.trim()) {
      currencyRoeMap.set(bean.expenseCurrency, {
        localCurrencyROE: String(bean.expenseRateOfExchange ?? 0),
        invoiceCurrencyROE: String(bean.invoiceExpenseRateOfExchange ?? bean.expenseRateOfExchange ?? 0),
      });
    }
  });

  const roeRows: RoeRow[] = Array.from(currencyRoeMap.entries()).map(
    ([currency, roe]) => ({
      id: makeRowId(),
      currency,
      localCurrencyROE: roe.localCurrencyROE,
      invoiceCurrencyROE: roe.invoiceCurrencyROE,
    })
  );

  return {
    charges: {
      rateDetails: rows,
      deletedRateDetails: [],
    },
    ratingType: mainBean?.ratingType ?? mainBean?.selectedRatingType ?? '',
    roeType: mainBean?.roeType ?? mainBean?.rateOfExchangeType ?? '',
    rateOfExchange: {
      baseCurrency: mainBean?.localCurrency ?? 'USD',
      baseRoe: 1,
      rateOfExchangeType: mainBean?.roeType ?? mainBean?.rateOfExchangeType ?? '',
      roeRows,
    },
  };
};

const mapBookingChargeBeanToRow = (bean: any): BookingQuoteChargeBeanFull => {
  return {
    rowId: bean.rowId ?? '',
    rowSequence: bean.recordNumber ?? 0,

    incomeChargeDetails: {
      chargeCode: bean.chargeCode ?? '',
      chargeDescription: bean.chargeDescription ?? '',
      chargeType: toChargeType(bean.chargeType),
    },
    incomeRate: bean.sellRate ?? 0,
    incomeCurrency: bean.sellCurrency ?? '',
    incomeBasis: bean.sellBasis ?? '',
    incomeAmount: bean.sellAmount ?? 0,
    incomeROE: bean.rateOfExchange ?? 0,
    incomeLocalAmount: bean.localAmount ?? 0,
    incomeVAT: bean.applyVat === 'Y' ? 'Y' : 'N',
    incomeOldBasis: bean.oldBasis ?? '',
    incomeMaximumRate: bean.maximum ?? null,
    incomeMinimumRate: bean.minimum ?? null,
    incomeCFSFee: '',
    incomeOldBasisMinByKgCbm: '',

    expenseRate: bean.buyRate ?? 0,
    expenseCurrency: bean.expenseCurrency ?? '',
    expenseBasis: bean.buyBasis ?? '',
    expenseAmount: bean.buyAmount ?? 0,
    expenseROE: bean.expenseRateOfExchange ?? 0,
    expenseLocalAmount: bean.expenseLocalAmount ?? 0,
    expenseVAT: bean.expenseVat ? 'Y' : 'N',
    expenseOldBasis: bean.expenseOldBasis ?? '',
    expenseMaximumRate: bean.expenseMaximum ?? null,
    expenseMinimumRate: bean.expenseMinimum ?? null,
    expenseCFSFee: '',

    originDestination: bean.originDestination ?? '',
    prepaidCollect: bean.payType ?? '',
    vendor: bean.vendor ?? '',
    vendorReference: bean.expenseVendorReference ?? '',
    invoiceNumber: bean.invoiceNumber ?? '',
    invoiceDate: bean.invoiceDate ?? '',
    rateOfExchangeType: '',
    equipmentDetails: bean.equipmentDetail ?? '',
    numberOfContainer: 0,
    pnlExpense: 0,
    cfsFee: '',

    isLinkedWithPhoenix: bean.linked ?? false,
    relayFlag: toRelayFlag(bean.relayFlag),
    isPrintOnDocument: bean.printOndocument === 'Y',
    transactionalFlag: bean.controlFlag,
    isVatBean: false,
    isEnableForEdit: true,
    isFiltered: false,
    isZeroAllowed: true,
    isTruckingRates: !!(bean.truckChargeGroup) || (bean.truckRateId > 0),
    additionalRatingFlags: {},
    transmittedFlag: '',

    actualLenght: 0,
    fromLenght: 0,
    actualWeight: 0,
    fromWeight: 0,
    measureFrom: '',
    measureTo: '',

    isOldRate: bean.oldRate ?? false,
    isCalculatedZero: false,
    isOFRAccurate: false,
    isFileROE: false,
    isCallFromAccurate: bean.isCallFromAccurate ?? null,
    isFirstTimeRatesAdded: null,
    isNewlyAddedRow: false,
    isFocusSet: false,
    rateTypeFlag: 0,
    isChargeRest: bean.chargeRest ?? false,
    overridden: bean.overridden ?? false,

    vatPercent: bean.vatPercent ?? 'N',
    vatType: '',
    vatAmount: bean.vatAmount ?? 0,
    taxKey: bean.taxKey ?? '',
    taxCode: bean.taxCode ?? '',
    taxText: bean.taxText ?? '',
    taxAmount: bean.taxAmount ?? null,
    taxLocalAmount: bean.taxLocalAmount ?? null,
    applyFor: bean.applyFor ?? '',
    glCode: bean.glCode ?? '',

    invoiceCurrency: bean.invoiceCurrency ?? '',
    invoiceCurrencyROE: bean.invoiceExchangeRate ?? 0,
    invoiceCurrencyTotalAmount: 0,
    invoiceSellRateOfExchange: bean.invoiceSellRateOfExchange ?? 0,
    invoiceExpenseRateOfExchange: bean.invoiceExpenseRateOfExchange ?? 0,
    invoiceSellAmount: bean.invoiceSellAmount ?? 0,
    invoiceExpenseAmount: bean.invoiceExpenseAmount ?? 0,
    invToLocalCurrencyROE: 0,
    invoiceCurrencyROEViewOnly: 0,
    invToLocalCurrencyROEViewOnly: 0,

    spotRateDetailsId: bean.spotRateDetailsId ?? '',
    rateDetailId: String(bean.bookingQuoteRateId ?? ''),
    spotRateKey: bean.spotRateKey ?? '',
    spotRateFlag: bean.spotRateFlag ?? 0,
    spotRateEfftectiveDate: '',
    ExpirationDate: '',
    accurateSpotRateKey: bean.accurateSpotRateKey ?? '',
    sprKey: bean.sprKey ?? '',

    companyId: bean.company ?? '',
    bookingRateId: String(bean.bookingQuoteRateId ?? ''),
    rateCompanyId: bean.rateCompanyId ?? 0,
    lotRateId: '',
    truckingChargeLinkId: bean.truckingChargeLinkId ?? 0,

    aspect: bean.aspect ?? '',
    fmcChargeType: bean.fmcChargeType ?? '',
    tabNumber: 0,
    bookingType: '',
    isAdditionalInvCharge: '',
    oinvoiceNumber: '',
    userDefineChargeDescription: bean.userDefineChargeDescription ?? '',

    // Trucking
    truckerRateExpired: bean.truckerRateExpired ?? '',
    truckChargeGroup: bean.truckChargeGroup ?? '',
    truckCity: bean.truckCity ?? '',
    truckZipCountry: bean.truckZipCountry ?? '',
    truckChargeNotes: bean.truckChargeNotes ?? '',
    truckerName: bean.truckerName ?? '',
    truckRateId: bean.truckRateId ?? 0,
    truckRate: bean.truckRate ?? {},
    truckRateDetailsFileId: bean.truckRateDetailsFileId ?? 0,
    pickupId: bean.pickupId ?? '',
    expensePickupId: bean.expensePickupId ?? bean.pickupId ?? '',

    cfsName: bean.cfsName ?? '',
    doorCountry: bean.doorCountry ?? '',
    euVatRuleId: bean.euVatRuleId ?? 0,
  };
};

const VALID_RELAY_FLAGS = new Set<RelayFlag>(['U', 'A', 'G', 'T', 'C', 'I', 'D']);

const toRelayFlag = (code: string | undefined): RelayFlag => {
  const upper = (code ?? '').toUpperCase() as RelayFlag;
  return VALID_RELAY_FLAGS.has(upper) ? upper : 'U';
};

const VALID_CHARGE_TYPES: ChargeType[] = [
  'OFR',
  'FOB',
  'PLC',
  'OCC',
  'PTC',
  'DTC',
  'EXP',
];

const toChargeType = (code: string | undefined): ChargeType => {
  if (!code) return 'OFR';
  const up = code.toUpperCase();
  return (VALID_CHARGE_TYPES.find((t) => t === up) as ChargeType) ?? 'OFR';
};


export const mapPickupChargeBeansToRateRows = (
  pickupList: any[] | null | undefined,
  localCurrency = 'USD'
): BookingQuoteChargeBeanFull[] => {
  if (!Array.isArray(pickupList) || pickupList.length === 0) return [];

  const rows: BookingQuoteChargeBeanFull[] = [];

  for (const pickup of pickupList) {
    const chargeBeans: any[] = pickup?.pickupChargeBeanList ?? [];
    const pickupIdStr = str(pickup?.quotePickupId ?? pickup?.pickupId ?? '');

    for (const charge of chargeBeans) {
      const base = createBlankBeanRow('PTC', localCurrency);

      const chargeCode = str(charge.charge ?? charge.chargeCode ?? '');
      const chargeDesc = str(charge.chargeDescription ?? '');
      const currency = str(charge.currency ?? charge.expenseCurrency ?? localCurrency);
      const expenseCurrency = str(charge.expenseCurrency ?? charge.currency ?? localCurrency);
      const incomeAmt = num(charge.income ?? 0);
      const expenseAmt = num(charge.expense ?? 0);
      const incomeRate = num(charge.incomeRate ?? charge.income ?? 0);
      const expenseRate = num(charge.expenseRate ?? charge.expense ?? 0);

      rows.push({
        ...base,
        rowId: makeRowId(),
        incomeChargeDetails: {
          chargeCode,
          chargeDescription: chargeDesc,
          chargeType: 'FOB',
        },
        truckChargeGroup: 'PTC',
        isTruckingRates: true,
        relayFlag: 'D',
        prepaidCollect: 'P',
        originDestination: 'O',
        transactionalFlag: 'I',
        incomeCurrency: currency,
        incomeRate,
        incomeAmount: incomeAmt,
        incomeLocalAmount: incomeAmt,
        incomeBasis: 'LS',
        expenseCurrency,
        expenseRate,
        expenseAmount: expenseAmt,
        expenseLocalAmount: expenseAmt,
        expenseBasis: 'LS',
        invoiceSellAmount: incomeAmt,
        invoiceExpenseAmount: expenseAmt,
        userDefineChargeDescription: chargeCode
          ? `${chargeCode} - ${chargeDesc}`.trim().replace(/\s*-\s*$/, '')
          : chargeDesc,
        pickupId: pickupIdStr,
        expensePickupId: pickupIdStr,
      });
    }
  }

  return rows;
};

export interface PickupTruckerInfo {
  truckerName?: string;
  truckCity?: string;
  truckZipCountry?: string;
}

export const mapPickupChargesToRateRows = (
  charges: PickupCharge[],
  pickupId: number,
  localCurrency = 'USD',
  truckerInfo?: PickupTruckerInfo
): BookingQuoteChargeBeanFull[] => {
  const pickupIdStr = String(pickupId);
  return charges.map((charge) => {
    const base = createBlankBeanRow('PTC', localCurrency);
    return {
      ...base,
      rowId: makeRowId(),
      incomeChargeDetails: {
        chargeCode: '',
        chargeDescription: charge.chargeDescription,
        chargeType: 'FOB' as ChargeType,
      },
      truckChargeGroup: 'PTC',
      isTruckingRates: true,
      relayFlag: 'D',
      originDestination: 'O',
      transactionalFlag: 'I',
      prepaidCollect: 'P',
      incomeCurrency: charge.incomeCurrency || localCurrency,
      incomeRate: num(charge.income),
      incomeAmount: num(charge.income),
      incomeLocalAmount: num(charge.income),
      incomeBasis: 'LS',
      expenseCurrency: charge.expenseCurrency || localCurrency,
      expenseRate: num(charge.expense),
      expenseAmount: num(charge.expense),
      expenseLocalAmount: num(charge.expense),
      expenseBasis: 'LS',
      invoiceSellAmount: num(charge.income),
      invoiceExpenseAmount: num(charge.expense),
      pickupId: pickupIdStr,
      expensePickupId: pickupIdStr,
      truckerName: truckerInfo?.truckerName ?? '',
      truckCity: truckerInfo?.truckCity ?? '',
      truckZipCountry: truckerInfo?.truckZipCountry ?? '',
      truckChargeNotes: charge.notes ?? '',
    };
  });
};

export const mapDoorDeliveryChargesToRateRows = (
  charges: PickupCharge[],
  localCurrency = 'USD',
  truckerInfo?: PickupTruckerInfo
): BookingQuoteChargeBeanFull[] => {
  return charges.map((charge) => {
    const base = createBlankBeanRow('DTC', localCurrency);
    return {
      ...base,
      rowId: makeRowId(),
      incomeChargeDetails: {
        chargeCode: '',
        chargeDescription: charge.chargeDescription,
        chargeType: 'FOB' as ChargeType,
      },
      truckChargeGroup: 'DTC',
      isTruckingRates: true,
      relayFlag: 'D',
      originDestination: 'D',
      transactionalFlag: 'I',
      prepaidCollect: 'P',
      incomeCurrency: charge.incomeCurrency || localCurrency,
      incomeRate: num(charge.income),
      incomeAmount: num(charge.income),
      incomeLocalAmount: num(charge.income),
      incomeBasis: 'LS',
      expenseCurrency: charge.expenseCurrency || localCurrency,
      expenseRate: num(charge.expense),
      expenseAmount: num(charge.expense),
      expenseLocalAmount: num(charge.expense),
      expenseBasis: 'LS',
      invoiceSellAmount: num(charge.income),
      invoiceExpenseAmount: num(charge.expense),
      truckerName: truckerInfo?.truckerName ?? '',
      truckCity: truckerInfo?.truckCity ?? '',
      truckZipCountry: truckerInfo?.truckZipCountry ?? '',
      truckChargeNotes: charge.notes ?? '',
    };
  });
};
