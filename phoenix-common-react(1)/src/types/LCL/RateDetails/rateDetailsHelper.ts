import {
  BookingQuoteChargeBeanFull,
  ChargeType,
  RoeRow,
} from './RateDetails.types';

let _roeCounter = 0;
export const makeRoeRowId = (): string => `roe_${Date.now()}_${++_roeCounter}`;

export const createLocalCurrencyRow = (localCurrency = 'USD'): RoeRow => ({
  id: makeRoeRowId(),
  currency: localCurrency,
  localCurrencyROE: '1',
  invoiceCurrencyROE: '1',
});

export const createBlankRoeRow = (): RoeRow => ({
  id: makeRoeRowId(),
  currency: '',
  localCurrencyROE: '',
  invoiceCurrencyROE: '',
});

export const createRoeRow = (
  currency: string,
  localCurrencyROE: number | string = 0,
  invoiceCurrencyROE: number | string = 0
): RoeRow => ({
  id: makeRoeRowId(),
  currency,
  localCurrencyROE: String(localCurrencyROE),
  invoiceCurrencyROE: String(invoiceCurrencyROE),
});

export const hasCurrency = (rows: RoeRow[], currency: string): boolean => {
  if (!currency) return false;
  const needle = currency.trim().toUpperCase();
  return rows.some((r) => r.currency.trim().toUpperCase() === needle);
};

export const lookupRoe = (
  rows: RoeRow[],
  currency: string
): number | undefined => {
  if (!currency) return undefined;
  const needle = currency.trim().toUpperCase();
  const row = rows.find((r) => r.currency.trim().toUpperCase() === needle);
  if (!row) return undefined;
  const n = Number(row.localCurrencyROE);
  return Number.isFinite(n) ? n : undefined;
};

export const ensureCurrencyPresent = (
  rows: RoeRow[],
  currency: string,
  defaultRoe: number = 0
): { rows: RoeRow[]; added: boolean } => {
  if (!currency || !currency.trim()) return { rows, added: false };
  if (hasCurrency(rows, currency)) return { rows, added: false };
  return {
    rows: [...rows, createRoeRow(currency.trim().toUpperCase(), defaultRoe)],
    added: true,
  };
};

export const updateRoeRow = (
  rows: RoeRow[],
  id: string,
  patch: Partial<RoeRow>
): RoeRow[] => rows.map((r) => (r.id === id ? { ...r, ...patch } : r));

export const addRoeRow = (rows: RoeRow[], afterId?: string): RoeRow[] => {
  const next = [...rows];
  const idx = afterId ? next.findIndex((r) => r.id === afterId) : -1;
  const blank = createBlankRoeRow();
  if (idx >= 0) next.splice(idx + 1, 0, blank);
  else next.push(blank);
  return next;
};

export const removeRoeRow = (rows: RoeRow[], id: string): RoeRow[] =>
  rows.filter((r) => r.id !== id);

let _counter = 0;

export const makeRowId = (): string => `row_${Date.now()}_${++_counter}`;

export const createBlankBeanRow = (
  chargeType: ChargeType,
  invoiceCurrency?: string
): BookingQuoteChargeBeanFull => {
  const isTrucking = chargeType === 'PTC' || chargeType === 'DTC';
  const effectiveChargeType: string = isTrucking
    ? chargeType === 'PTC'
      ? 'FOB'
      : 'PLC'
    : chargeType;
  const truckChargeGroup = isTrucking ? chargeType : '';

  return {
    // ── Routing — panel filters key on these two fields ──
    incomeChargeDetails: {
      chargeCode: '',
      chargeDescription: '',
      chargeType: effectiveChargeType as ChargeType,
    },
    truckChargeGroup,

    // ── Income side ──
    incomeRate: 0,
    incomeCurrency: invoiceCurrency ?? 'USD',
    incomeBasis: '',
    incomeAmount: 0,
    incomeROE: 0,
    incomeLocalAmount: 0,
    incomeVAT: 'N',
    incomeOldBasis: '',
    incomeMaximumRate: null,
    incomeMinimumRate: 0,
    incomeCFSFee: '',
    incomeOldBasisMinByKgCbm: '',

    // ── Expense side ──
    expenseRate: 0,
    expenseCurrency: invoiceCurrency ?? 'USD',
    expenseBasis: '',
    expenseAmount: 0,
    expenseROE: 0,
    expenseLocalAmount: 0,
    expenseVAT: 'N',
    expenseOldBasis: '',
    expenseMaximumRate: null,
    expenseMinimumRate: 0,
    expenseCFSFee: '',

    // ── Common ──
    originDestination: '',
    prepaidCollect: '',
    vendor: '',
    vendorReference: '',
    invoiceNumber: '',
    invoiceDate: '',
    rateOfExchangeType: '',
    rowId: makeRowId(),
    equipmentDetails: '',
    numberOfContainer: 0,
    pnlExpense: 0,
    cfsFee: '',

    // ── Flags ──
    isLinkedWithPhoenix: true,
    rowSequence: 0,
    relayFlag: 'U',
    isPrintOnDocument: true,
    transactionalFlag: 'N',
    isVatBean: false,
    isEnableForEdit: true,
    isFiltered: false,
    isZeroAllowed: true,
    isTruckingRates: isTrucking,
    additionalRatingFlags: {},
    transmittedFlag: '',

    // ── AccuRate ──
    actualLenght: 0,
    fromLenght: 0,
    actualWeight: 0,
    fromWeight: 0,

    // ── State ──
    isOldRate: false,
    isCalculatedZero: false,
    isOFRAccurate: false,
    isFileROE: false,
    overridden: false,
    isNewlyAddedRow: true,
    isFocusSet: false,
    isCallFromAccurate: null,
    isFirstTimeRatesAdded: null,

    // ── VAT / Tax ──
    vatPercent: '',
    vatType: '',
    vatAmount: 0,
    taxKey: '',
    taxCode: '',
    taxText: '',
    applyFor: '',
    glCode: '',
    taxAmount: null,
    taxLocalAmount: null,

    // ── Invoice currency ──
    invoiceCurrency: 'USD',
    invoiceCurrencyROE: 1,
    invoiceCurrencyTotalAmount: 0,
    invoiceSellRateOfExchange: 0,
    invoiceExpenseRateOfExchange: 0,
    invoiceSellAmount: 0,
    invoiceExpenseAmount: 0,
    invToLocalCurrencyROE: 0,
    invoiceCurrencyROEViewOnly: 0,
    invToLocalCurrencyROEViewOnly: 0,

    userDefineChargeDescription: '',

    // ── Measure ──
    measureFrom: '',
    measureTo: '',
    aspect: '',

    // ── IDs / References ──
    companyId: '',
    bookingRateId: '',
    truckingChargeLinkId: 0,
    rateCompanyId: 0,
    lotRateId: '',

    // ── Spot rates ──
    spotRateDetailsId: '',
    rateDetailId: '',
    spotRateKey: '',
    spotRateFlag: 0,
    spotRateEfftectiveDate: '',
    ExpirationDate: '',
    accurateSpotRateKey: '',
    isChargeRest: false,
    sprKey: '',

    // ── Module-level flags ──
    fmcChargeType: '',
    tabNumber: 0,
    bookingType: '',
    isAdditionalInvCharge: '',
    oinvoiceNumber: '',
    rateTypeFlag: 0,

    // ── Trucking ──
    truckerRateExpired: '',
    truckCity: '',
    truckZipCountry: '',
    truckChargeNotes: '',
    truckerName: '',
    truckRateId: 0,
    cfsName: '',
    pickupId: '',
    expensePickupId: '',
    doorCountry: '',
    euVatRuleId: 0,
    truckRate: {},
    truckRateDetailsFileId: 0,
  };
};
