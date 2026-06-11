import { DecimalCurrencyConfig } from '@/core/utils/utils.types';
import { RateBasisUtility } from '../../../core/utils/rate-basis.utility';
import {
  GetCurrencyConversionRateResponse,
  useFeatureToggle,
} from '../../../hooks';
import { SelectOption } from '../cargo/CargoDetails.types';
export interface PRateDetailsAccordionProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  disabled?: boolean;
  forceExpanded?: boolean;
  buttonId?: string;
  iconButtonId?: string;
}

export interface ReferenceOption {
  code: string;
  name: string;
}

export type ChargeType = 'OFR' | 'FOB' | 'PLC' | 'OCC' | 'PTC' | 'DTC' | 'EXP';

export type RelayFlag = 'U' | 'A' | 'G' | 'T' | 'C' | 'I' | 'D';

export type TransactionalFlag = 'N' | 'U' | 'D';
export type OriginDestination = '' | 'O' | 'D';
export type PrepaidCollect = '' | 'P' | 'C';
export type RateType = 'A' | 'S' | 'O' | 'M' | 'T';

export interface ChargeDetails {
  chargeCode?: string;
  chargeDescription?: string;
  chargeLocaleDescription?: string;
  chargeType?: ChargeType;
  updatedChargeType?: ChargeType;
  fmcChargeType?: string;
}

export interface ChargesState {
  rateDetails: BookingQuoteChargeBeanFull[];
  deletedRateDetails: BookingQuoteChargeBeanFull[];
}

export interface CurrencyEntry {
  currency: string;
  amount: number;
}

export interface LocationField {
  code: string;
  name: string;
}

export interface ShipmentSummaryBkgQuoData {
  billToCustomer?: LocationField;
  placeOfReceipt?: LocationField;
  portOfLoad?: LocationField;
  portOfDischarge?: LocationField;
  placeOfDelivery?: LocationField;
  placeOfDeconsolidation?: LocationField;
}

export type ShipmentSummaryData = ShipmentSummaryBkgQuoData;

export interface SectionData {
  entries: CurrencyEntry[];
}

export interface RowData {
  oceanFreight: SectionData;
  originCharges: SectionData;
  commonCharges?: SectionData;
  postLandingCharges: SectionData;
}

export interface PRateDetailsTotalChargeProps {
  incomeData: RowData;
  expenseData: RowData;
  invoiceCurrency: string;
}

export interface RateDetailsFormData {
  ratingType: string;

  rateOfExchange: {
    rateOfExchangeType: string;
    baseCurrency: string;
    baseRoe: string | number;
    roeRows: RoeRow[];
  };

  shipmentSummary: ShipmentSummaryBkgQuoData;

  charges: ChargesState;

  totals: {
    incomeData: any;
    expenseData: any;
    invoiceCurrency: string;
  };

  toogleButtons: {
    isPickupExpanded: boolean;
    isExpandShipmentSummaryDetailsActive: boolean;
    isExpandRateOfExchangeActive: boolean;
    isPrintPlcConfirmationActive: boolean;
    isExpandChargeDetailsActive: boolean;
    isModifyRatesActive: boolean;
  };
}

export interface RateDetailsState {
  isAccuRatePopulated: boolean;
  isResetDialogOpen: boolean;
  ratingType: string;
  roeType: string;
  localCurrency: string;
  invoiceCurrency: string;
  isPickupExpanded: boolean;
  isExpandShipmentSummaryDetailsActive: boolean;
  isExpandRateOfExchangeActive: boolean;
  isPrintPlcConfirmationActive: boolean;
  isExpandChargeDetailsActive: boolean;
  isModifyRatesActive: boolean;
  isVATEnable: boolean;
  rateUtil?: RateBasisUtility;
  liveRateData: GetCurrencyConversionRateResponse | null;
  roeWarning?: string;
  isKeepOfrDialogOpen?: boolean;
  isAccurateConfirmDialogOpen?: boolean;
  isAccurateLoading?: boolean;
  chargeWarning?: string;
  showPickupSection: boolean;
  showDoorDeliverySection: boolean;
  ratingOptions: { label: string; value: string }[];
  vatOptions: { label: string; value: string }[];
  setEquipmentDetailsList: React.Dispatch<React.SetStateAction<SelectOption[]>>;
  equipmentDetailsList: SelectOption[];
  chargeTypeToShowExpense: string[];
  duplicateChargeDialog: {
    open: boolean;
    chargeCode: string;
    pendingRows: BookingQuoteChargeBeanFull[];
    pendingRoeRows: RoeRow[];
    rowIdToRemove: string;
  };
}

export interface CargoMetrics {
  weight?: number;
  cube?: number;
  pieces?: number;
  teu?: number;
  containerCount?: number;
  containersByEquipment?: Record<string, number>;
}

export interface PRateDetailsPickupChargesRowProps {
  chargeType: ChargeType;
  rows: BookingQuoteChargeBeanFull[];
  onUpdateRow: (
    id: string,
    isIncome: boolean,
    patch: Partial<BookingQuoteChargeBeanFull>
  ) => void;
  onAddRow: (
    afterId: string,
    rowValues?: Partial<BookingQuoteChargeBeanFull>
  ) => void;
  onRemoveRow: (id: string) => void;
  onCurrencySelect: (currency: string) => void;
  showHeader?: boolean;
  isExpanded: boolean;
  chargeTypeImg: string;
  isVATEnable?: boolean;
  showExpenseRow?: boolean;
  showTruckerRow?: boolean;
  isModifyRatesActive: boolean;
  cargoMetrics?: CargoMetrics;
  pickupCargoMetricsMap?: Record<string, CargoMetrics>;
  allRows?: BookingQuoteChargeBeanFull[];
  initialRows?: any[];
  pickupOptions?: { label: string; value: string }[];
  hideAddRemove?: boolean;
  rateUtil?: RateBasisUtility;
  roeRows?: RoeRow[];
  localCurrency: string;
  invoiceCurrency: string;
  featureToggle: ReturnType<typeof useFeatureToggle>;
  moduleType: string;
  decimalCurrencyConfig: DecimalCurrencyConfig;
  onChargeNameChange?: (
    rowId: string,
    chargeDetails: ChargeDetails,
    row: BookingQuoteChargeBeanFull
  ) => void;
  onChargeNameClear?: (rowId: string, row: BookingQuoteChargeBeanFull) => void;
  onPrepaidCollectChange?: (
    rowId: string,
    prepaidCollect: string,
    row: BookingQuoteChargeBeanFull
  ) => void;
  onIncomeBasisChange?: (
    rowId: string,
    isIncome: boolean,
    patch: Partial<BookingQuoteChargeBeanFull>,
    row: BookingQuoteChargeBeanFull
  ) => void;
  onExpenseBasisChange?: (
    rowId: string,
    isIncome: boolean,
    patch: Partial<BookingQuoteChargeBeanFull>,
    row: BookingQuoteChargeBeanFull
  ) => void;
  onIncomeRateChange?: (
    rowId: string,
    newRate: number,
    row: BookingQuoteChargeBeanFull
  ) => void;
  onExpenseRateChange?: (
    rowId: string,
    newRate: number,
    row: BookingQuoteChargeBeanFull
  ) => void;
  onVendorCommit?: (rowId: string, isIncome: boolean, vendor: string) => void;
  isBolInvoiceGenerated?: boolean;
  vatOptions?: { label: string; value: string }[];
  shippingType?: string;
  equipmentDetailsList?: SelectOption[];
  shipmentDirection?: string;
}

export interface PRateDetailsCurrencyConverterProps {
  rows: RoeRow[];
  onUpdateRow: (id: string, patch: Partial<RoeRow>) => void;
  onAddRow: (afterId?: string) => void;
  onRemoveRow: (id: string) => void;
  disabled: boolean;
  onCurrencySelect?: (rowId: string, currency: string) => void;
  onBlurRow?: (
    rowId: string,
    field: 'localCurrencyROE' | 'invoiceCurrencyROE',
    committedValue?: string
  ) => void;
  invoiceCurrencyToggle?: boolean;
  localCurrency?: string;
  invoiceCurrency?: string;
  liveRates?: Record<string, number>;
  roeType?: string;
  roeWarning?: string;
  onClearRoeWarning?: () => void;
}
export interface RoeRow {
  id: string;
  currency: string;
  localCurrencyROE: string;
  invoiceCurrencyROE: string;
  isFile?: boolean;
}

export interface Handlers {
  setIsResetDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setLocalCurrency: React.Dispatch<React.SetStateAction<string>>;
  setInvoiceCurrency: React.Dispatch<React.SetStateAction<string>>;
  setIsVATEnable: React.Dispatch<React.SetStateAction<boolean>>;
  handleRatingTypeChange: (value: string) => void;
  handleROEFieldsChange: (
    key: keyof RateDetailsFormData['rateOfExchange'],
    value: any
  ) => void;
  handleROERowsChange: (roeRows: RoeRow[]) => void;
  handleRateDetailsChargesChange: (rows: BookingQuoteChargeBeanFull[]) => void;
  handleToggleButtonChange: (
    key: keyof RateDetailsFormData['toogleButtons'],
    value: boolean
  ) => void;
  handleCurrencySelectFromChargeRow: (selectedCurrency: string) => void;
  handleCurrencySelectFromRoeRow: (
    rowId: string,
    selectedCurrency: string
  ) => void;
  handleCurrencySelectFromInvoiceCurrency: (selectedCurrency: string) => void;

  handleRoeRowAdd: (afterId?: string) => void;
  handleRoeRowRemove: (id: string) => void;
  handleRoeRowUpdate: (id: string, patch: Partial<RoeRow>) => void;
  handleRoeRowBlur?: (
    id: string,
    field: 'localCurrencyROE' | 'invoiceCurrencyROE',
    committedValue?: string
  ) => void;
  handleRoeTypeChange: (id: string) => void;
  clearRoeWarning?: () => void;

  handleChargeRowAdd: (
    afterId: string,
    rowValues?: Partial<BookingQuoteChargeBeanFull>
  ) => void;

  handleChargeRowUpdate: (
    id: string,
    isIncome: boolean,
    patch: Partial<BookingQuoteChargeBeanFull>
  ) => void;

  handleChargeRowRemove: (id: string) => void;

  handleChargeNameChange?: (
    rowId: string,
    chargeDetails: ChargeDetails,
    row: BookingQuoteChargeBeanFull
  ) => void;
  handleChargeNameClear?: (
    rowId: string,
    row: BookingQuoteChargeBeanFull
  ) => void;
  handlePrepaidCollectChange?: (
    rowId: string,
    prepaidCollect: string,
    row: BookingQuoteChargeBeanFull
  ) => void;
  handleIncomeBasisChange?: (
    rowId: string,
    isIncome: boolean,
    patch: Partial<BookingQuoteChargeBeanFull>,
    row: BookingQuoteChargeBeanFull
  ) => void;
  handleExpenseBasisChange?: (
    rowId: string,
    isIncome: boolean,
    patch: Partial<BookingQuoteChargeBeanFull>,
    row: BookingQuoteChargeBeanFull
  ) => void;
  handleIncomeRateChange?: (
    rowId: string,
    newRate: number,
    row: BookingQuoteChargeBeanFull
  ) => void;
  handleExpenseRateChange?: (
    rowId: string,
    newRate: number,
    row: BookingQuoteChargeBeanFull
  ) => void;
  handleVendorCommit?: (
    rowId: string,
    isIncome: boolean,
    vendor: string
  ) => void;
  clearChargeWarning?: () => void;

  resetRateDetails: (keepOfr?: boolean) => void;
  handleResetConfirm?: () => void;
  handleKeepOfrDecision?: (keepOfr: boolean) => void;
  recalculateInvoiceROE: (
    invoiceCurrencyCode: string,
    localCurrencyCode: string
  ) => RoeRow[];
  handleCurrencyChangeRecalculate: (newInvoiceCurrency: string) => void;
  getFormulaForUI: (rowId: string, isIncome: boolean) => string;
  handleDuplicateChargeConfirm: () => void;
  handleDuplicateChargeCancel: () => void;
  handleAccurateConfirm?: () => void;
  handleAccurateCancel?: () => void;
}
export interface RateDetailsProps {
  moduleType: string;
  containerType?: string;
  formData: RateDetailsFormData;
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (formData: RateDetailsFormData) => void;
  defaultState: RateDetailsState;
  handlers: Handlers;
  cargoMetrics?: CargoMetrics;
  pickupCargoMetricsMap?: Record<string, CargoMetrics>;
  shippingType?: string;
  shipmentDirection?: string;
  showBannerError?: (
    messages: string[],
    autoHideMs?: number,
    variant?: 'bar' | 'modal'
  ) => void;
}

export interface BookingQuoteChargeBeanFull {
  // ── Income ──
  incomeChargeDetails: ChargeDetails;
  incomeRate: number;
  incomeCurrency: string;
  incomeBasis: string;
  incomeAmount: number;
  incomeROE: number;
  incomeLocalAmount: number;
  incomeVAT: string;
  incomeOldBasis: string;
  incomeMaximumRate: number | null;
  incomeMinimumRate: number | null;
  incomeCFSFee: string;
  incomeOldBasisMinByKgCbm: string;

  // ── Expense ──
  expenseRate: number;
  expenseCurrency: string;
  expenseBasis: string;
  expenseAmount: number;
  expenseROE: number;
  expenseLocalAmount: number;
  expenseVAT: string;
  expenseOldBasis: string;
  expenseMaximumRate: number | null;
  expenseMinimumRate: number | null;
  expenseCFSFee: string;

  // ── Common ──
  originDestination: OriginDestination;
  prepaidCollect: PrepaidCollect;
  vendor: string;
  vendorReference: string;
  invoiceNumber: string;
  invoiceDate: string;
  rateOfExchangeType: string;
  rowId: string;
  equipmentDetails: string;
  numberOfContainer: number;
  pnlExpense: number;
  cfsFee: string;

  // ── Flags ──
  isLinkedWithPhoenix: boolean;
  rowSequence: number;
  relayFlag: RelayFlag;
  isPrintOnDocument: boolean;
  transactionalFlag: string;
  isVatBean: boolean;
  isEnableForEdit: boolean;
  isFiltered: boolean;
  isZeroAllowed: boolean;
  isTruckingRates: boolean;
  additionalRatingFlags: Record<string, unknown>;
  transmittedFlag: string;

  // ── AccuRate integration ──
  actualLenght: number;
  fromLenght: number;
  actualWeight: number;
  fromWeight: number;

  // ── State ──
  isOldRate: boolean;
  isCalculatedZero: boolean;
  isOFRAccurate: boolean;
  isFileROE: boolean;

  // ── VAT / Tax ──
  vatPercent: string;
  vatType: string;
  vatAmount: number;
  taxKey: string;
  taxCode: string;
  taxText: string;
  applyFor: string;
  glCode: string;

  overridden: boolean;

  // ── Invoice currency ──
  invoiceCurrency: string;
  invoiceCurrencyROE: number;
  invoiceCurrencyTotalAmount: number;
  invoiceSellRateOfExchange: number;
  invoiceExpenseRateOfExchange: number;
  invoiceSellAmount: number;
  invoiceExpenseAmount: number;
  invToLocalCurrencyROE: number;
  invoiceCurrencyROEViewOnly: number;
  invToLocalCurrencyROEViewOnly: number;

  userDefineChargeDescription: string;

  // ── Measure ──
  measureFrom: string;
  measureTo: string;
  aspect: string;

  // ── IDs / References ──
  companyId: string;
  bookingRateId: string;
  truckingChargeLinkId: number;
  rateCompanyId: number;
  lotRateId: string;

  // ── Spot rates ──
  spotRateDetailsId: string;
  rateDetailId: string;
  spotRateKey: string;
  spotRateFlag: number;
  spotRateEfftectiveDate: string;
  ExpirationDate: string;
  accurateSpotRateKey: string;
  isChargeRest: boolean;
  sprKey: string;

  // ── Module-level flags ──
  fmcChargeType: string;
  tabNumber: number;
  bookingType: string;
  isAdditionalInvCharge: string;
  oinvoiceNumber: string;
  isNewlyAddedRow: boolean;
  isFocusSet: boolean;
  rateTypeFlag: number;
  isCallFromAccurate: boolean | null;
  isFirstTimeRatesAdded: boolean | null;
  taxAmount: number | null;
  taxLocalAmount: number | null;

  // ── Trucking ──
  truckerRateExpired: string;
  truckChargeGroup: string;
  truckCity: string;
  truckZipCountry: string;
  truckChargeNotes: string;
  truckerName: string;
  truckRateId: number;
  cfsName: string;
  doorCountry: string;
  euVatRuleId: number;
  pickupId: string;
  expensePickupId: string;
  truckRate: Record<string, any>;
  truckRateDetailsFileId: number;
}

export interface CargoMetrics {
  weight?: number;
  cube?: number;
  pieces?: number;
  teu?: number;
  containerCount?: number;
  containersByEquipment?: Record<string, number>;
}
