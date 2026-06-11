import {
  BookingQuoteChargeBeanFull,
  ChargeType,
  ChargesState,
  RateDetailsFormData,
  RoeRow,
} from '../../types/LCL/RateDetails/RateDetails.types';
import { makeRowId } from '../../types/LCL/RateDetails/rateDetailsHelper';

export const makeDefaultRow = (
  chargeType: ChargeType,
  truckChargeGroup = '',
  localCurrency: string,
  invoiceCurrency: string
): BookingQuoteChargeBeanFull => ({
  // ── Income ──
  incomeChargeDetails: {
    chargeCode: '',
    chargeDescription: '',
    chargeType,
  },
  incomeRate: 0,
  incomeCurrency: localCurrency,
  incomeBasis: '',
  incomeAmount: 0,
  incomeROE: 0,
  incomeLocalAmount: 0,
  incomeVAT: 'N',
  incomeOldBasis: '',
  incomeMaximumRate: null,
  incomeMinimumRate: null,
  incomeCFSFee: 'N',
  incomeOldBasisMinByKgCbm: '',

  // ── Expense ──
  expenseRate: 0,
  expenseCurrency: localCurrency,
  expenseBasis: '',
  expenseAmount: 0,
  expenseROE: 0,
  expenseLocalAmount: 0,
  expenseVAT: 'N',
  expenseOldBasis: '',
  expenseMaximumRate: null,
  expenseMinimumRate: null,
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
  cfsFee: 'N',

  // ── Flags ──
  isLinkedWithPhoenix: true,
  rowSequence: 0,
  relayFlag: 'U',
  isPrintOnDocument: true,
  transactionalFlag: 'N',
  isVatBean: false,
  isEnableForEdit: true,
  isFiltered: false,
  isZeroAllowed: false,
  isTruckingRates: false,
  additionalRatingFlags: {},
  transmittedFlag: '',

  // ── AccuRate integration ──
  actualLenght: 0,
  fromLenght: 0,
  actualWeight: 0,
  fromWeight: 0,

  // ── State ──
  isOldRate: false,
  isCalculatedZero: false,
  isOFRAccurate: false,
  isFileROE: false,

  // ── VAT / Tax ──
  vatPercent: '',
  vatType: '',
  vatAmount: 0,
  taxKey: '',
  taxCode: '',
  taxText: '',
  applyFor: '',
  glCode: '',

  overridden: false,

  // ── Invoice currency ──
  invoiceCurrency: invoiceCurrency,
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
  isNewlyAddedRow: false,
  isFocusSet: false,
  rateTypeFlag: 0,
  isCallFromAccurate: false,
  isFirstTimeRatesAdded: true,
  taxAmount: null,
  taxLocalAmount: null,

  // ── Trucking ──
  truckerRateExpired: '',
  truckChargeGroup,
  truckCity: '',
  truckZipCountry: '',
  truckChargeNotes: '',
  truckerName: '',
  truckRateId: 0,
  cfsName: '',
  doorCountry: '',
  euVatRuleId: 0,
  pickupId: '',
  expensePickupId: '',
  truckRate: {},
  truckRateDetailsFileId: 0,
});

export const defaultChargesState = (
  localCurrency: string,
  invoiceCurrency: string
): ChargesState => ({
  rateDetails: [],
  deletedRateDetails: [],
});

export const defaultRoeRows = (invoiceCurrency: string): RoeRow => ({
  id: makeRowId(),
  currency: invoiceCurrency,
  localCurrencyROE: '1',
  invoiceCurrencyROE: '1',
  isFile: false,
});

export const defaultRateDetailsFormData = (
  localCurrency: string,
  invoiceCurrency: string
): RateDetailsFormData => ({
  ratingType: '',
  shipmentSummary: {},
  rateOfExchange: {
    rateOfExchangeType: '',
    baseCurrency: '',
    baseRoe: 1,
    roeRows: [defaultRoeRows(localCurrency)],
  },
  charges: defaultChargesState(localCurrency, invoiceCurrency),
  totals: {
    incomeData: null,
    expenseData: null,
    invoiceCurrency: '',
  },

  toogleButtons: {
    isPickupExpanded: true,
    isExpandShipmentSummaryDetailsActive: false,
    isExpandRateOfExchangeActive: false,
    isPrintPlcConfirmationActive: false,
    isExpandChargeDetailsActive: false,
    isModifyRatesActive: false,
  },
});
