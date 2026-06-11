export type ModuleType = 'BKG' | 'QUOTE';

export interface TransshipmentPortRow {
  id: number;
  portCode: string;
  portName: string;
  eta: Date | null;
}

export interface ManufacturerEntry {
  id: string;
  name: string;
}

export interface RoutingFormData {
  agentName: string;
  shipmentDate: string;
  agentEmail: string;
  terms: string;
  termsLabel: string;
  pickupNeeded: string;
  preCarriageType: string;
  preCarriageBy: string;
  preCarriageEts: Date | null;
  vesselCode: string;
  vesselName: string;
  voyage: string;
  carrierCode: string;
  placeOfReceiptCode: string;
  placeOfReceiptUnCode: string;
  placeOfReceiptName: string;
  placeOfReceiptEtd: Date | null;
  placeOfReceiptRegion: string;
  consolidationCfsCode: string;
  consolidationCfsUnCode: string;
  consolidationCfsName: string;
  consolidationCfsEtd: Date | null;
  consolidationCfsRegion: string;
  portOfLoadingCode: string;
  portOfLoadingUnCode: string;
  portOfLoadingName: string;
  portOfLoadingEts: Date | null;
  portOfLoadingRegion: string;
  transshipmentPorts: TransshipmentPortRow[];
  portOfDischargeCode: string;
  portOfDischargeUnCode: string;
  portOfDischargeName: string;
  portOfDischargeEta: Date | null;
  portOfDischargeRegion: string;
  deconsolidationCfsCode: string;
  deconsolidationCfsUnCode: string;
  deconsolidationCfsName: string;
  deconsolidationCfsEta: Date | null;
  deconsolidationCfsRegion: string;
  destinationCfsCode: string;
  destinationCfsUnCode: string;
  destinationCfsName: string;
  destinationCfsEta: Date | null;
  destinationCfsRegion: string;
  placeOfReceiptPickupFrom: string;
  placeOfReceiptPickupFromName: string;
  placeOfReceiptPickupTo: string;
  placeOfReceiptPickupToName: string;
  placeOfDeliveryCode: string;
  placeOfDeliveryUnCode: string;
  placeOfDeliveryType: string;
  placeOfDeliveryName: string;
  placeOfDeliveryEta: Date | null;
  placeOfDeliveryRegion: string;
  manufacturerNames: ManufacturerEntry[];
  warehouse: string;
  warehouseName: string;
  deliveryReference: string;
  cfsCutoffDate: Date | null;
  cfsCutoffTime: string;
  gatewayCutoffDate: Date | null;
  gatewayCutoffTime: string;
  destinationWarehouse: string;
  docDelivery: string;
  docContact: string;
  docCutoffDate: Date | null;
  docCutoffTime: string;
  customsCutoffDate: Date | null;
  customsCutoffTime: string;
  cargoReadDate: Date | null;
  deliveryType: string;
  cbl: string;
  direction: string;
  cfsContactName: string;
  cfsContactPhone: string;
  customsBroker: string;
  deliveryAppointmentDateFrom: Date | null;
  deliveryAppointmentTimeFrom: string;
  deliveryAppointmentDateTo: Date | null;
  deliveryAppointmentTimeTo: string;
  transitTime: string;
  frequency: string;

  loadCode: string;
  loadName: string;
  loadEts: Date | null;
  loadRegion: string;

  dischargeCode: string;
  dischargeName: string;
  dischargeEta: Date | null;
  dischargeRegion: string;

  rampCode: string;
  rampName: string;
  rampEta: Date | null;
  rampRegion: string;

  locationInformationPublic: string;
  locationInformationPrivate: string;
  callAccurate: boolean;
  oldETSDate: Date | null;
  carrierblCutoff: string;
  autoTitleCutoff: string;
  aesITNCutoff: string;
  carrierblCutofftime: string;
  autoTitleCutofftime: string;
  aesITNCutofftime: string;
  sailDate: Date | null;
  loadUnCode: string;
  originUncode: string;
  dischargeUnCode: string;
  destinationUnCode: string;
  deConsolidationUNCode: string
}

export interface AccessoriesOption {
  id: string;
  label: string;
}

export interface PickupAccessoriesProps {
  selected?: string[];
  onChange: (selected: string[]) => void;
  options?: AccessoriesOption[];
}

export interface PPickupDetailsWarningProps {
  onYes: () => void;
  onNo: () => void;
}

export interface PickupDetailsFormData {
  pickupCountry: string;
  postalCodeCity: string;
  estimatedPickupDate: Date | null;
  pickupCargoAtCode: string;
  instructions: string;
  name: string;
  streetAddress: string;
  accessorials: string[];
  pickupCity: string;
  pickupZipCode: string;
  pickupState: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  latitude: string;
  longitude: string;
  stateCode: string;
  stateId: string;
}

export interface PickupDetailsProps {
  index: number;
  formData: PickupDetailsFormData;
  onFormDataChange: (
    field: keyof PickupDetailsFormData,
    value: unknown
  ) => void;
  orgSearchOpen?: boolean;
  onOrgSearchOpen?: () => void;
  onOrgSearchClose?: () => void;
  onAccessorialsChange?: (selected: string[]) => void;
  accessorialOptions?: AccessoriesOption[];
  doorAccessorialOptions? : AccessoriesOption[];
  pickupValidationMessage?: string[];
  setPickupValidationMessage?: (messages: string[]) => void;
}

import type { RefObject } from 'react';

export type PickupNeededValue = 'yes' | 'no' | '';

export interface UsePickupFlowReturn {
  pickupNeeded: PickupNeededValue;
  handlePickupNeededChange: (value: string) => void;
  setPickupNeeded: (value: PickupNeededValue) => void;
  pickupDialogOpen: boolean;
  handleDialogClose: () => void;
  handleDialogConfirm: () => void;
  pickups: number[];
  pickupForms: Record<number, PickupDetailsFormData>;
  collapsedSet: Set<number>;
  handleAddPickup: () => void;
  handleFormDataChange: (
    pickupId: number,
    field: keyof PickupDetailsFormData,
    value: unknown
  ) => void;
  handleToggleCollapse: (pickupId: number) => void;
  warningOpen: boolean;
  handleRemoveRequest: (index: number) => void;
  handleConfirmRemove: () => void;
  handleCancelRemove: () => void;
  resetPickupFlow: () => void;
  showTruckingDetails: boolean;
}

export interface pickupState {
  pickUpValue: string;
  openPickupModal: boolean;
  pickups: number[];
  openDialog: boolean;
  collapsedSet: Set<number>;
  doorDeliveryDialogOpen?: boolean;
  combinedDialogOpen?: boolean;
  doorDeliveryCollapsed?: boolean;

  showPickupStack?: boolean;
  showDoorDeliverySection?: boolean;
  doorDeliveryForm?: DoorDeliveryFormData;
  doorDeliveryChargeRows?: PickupCharge[];
  truckingPickupForms?: Record<number, PickupDeliveryFormData>;
  truckingCargoRowsMap?: Record<number, InternalCargoRowData[]>;
  pickupTruckerForms?: Record<number, TruckerFormData>;
  pickupChargeMap?: Record<number, PickupCharge[]>;
  headerDataMap?: Record<number, HeaderData>;

  showPickupOrDoorDelivery?: boolean;
  orgSearchOpenSet?: Set<number>;
  isCFSDoor: boolean;
  showDeliveryType?: boolean;
  isFromTermsHandler?: boolean;
  pickupForms?: Record<number, PickupDetailsFormData>;
  pickupValidationMessages?: string[];
  confirmedPickupForms?: Record<number, PickupDetailsFormData>;
  confirmedVersions?: Record<number, number>;
}

export interface pickupHandlers {
  handlePickupChange: (val: string) => void;
  handleAddPickup: () => void;
  handleRemovePickup: (index: number) => void;
  handleConfirmRemove: () => void;
  handleToggleCollapse: (id: number) => void;
  closePickupModal: () => void;
  setPickupNeeded?: (value: string) => void;
  resetRouting?: () => void;
  setCombinedDialogOpen?: (open: boolean) => void;
  handleDoorDeliveryFieldChange?: (
    field: keyof DoorDeliveryFormData,
    value: unknown
  ) => void;
  handleOrgSearchOpen?: (id: number) => void;
  handleOrgSearchClose?: (id: number) => void;
  handlePickupDialogClose?: () => void;
  handlePickupDialogConfirm?: () => void;
  handleDoorDeliveryDialogClose?: () => void;
  handleDoorDeliveryDialogOk?: () => void;
  handleCombinedDialogClose?: () => void;
  handleCombinedDialogOk?: () => void;
  handleCancelRemove?: () => void;
  setDoorDeliveryDialogOpen?: (open: boolean) => void;
  setDoorDeliveryCollapsed?: (fn: (prev: boolean) => boolean) => void;
  setShowPickupStack?: (value: boolean) => void;
  handleAgentNameSelect: (agent: { name: string; email: string }) => void;
  handleAgentNameChange: (value: string) => void;
  handleAgentEmailChange: (value: string) => void;
  handlePickupAccessorialsChange?: (
    pickupId: number,
    selected: string[]
  ) => void;
  clearPickupValidation?: () => void;
  handlePickupFormSync?: (
    pickupId: number,
    partialData: Partial<PickupDetailsFormData>
  ) => void;
  handleTermsSelect?: (code: string) => void;
  handleDeliveryTypeChange?: (value: string) => void;
  handleCarriageTypeChange?: (value: string) => void;
  handleCarriageTypeKeyDown?: (e: KeyboardEvent) => void;
  setPickupValidationMessages?: (messages: string[]) => void;
}

import type {
  DoorDeliveryFormData,
  HeaderData,
  InternalCargoRowData,
  PickupCharge,
  PickupDeliveryFormData,
  TruckerFormData,
} from '../misc/TruckingDetails.types';
import type {
  ScheduleRow,
  ScheduleGroup,
} from '../misc/SailingScheduleSearch.types';
import { StatusType } from '../misc/commonTypes';

export interface LocationSuggestionItem {
  code: string;
  name: string;
  locode: string;
  country: string;
}

export interface LocationSuggestionSlot {
  data: LocationSuggestionItem[];
  setQuery: (query: string) => void;
}

export interface LocationSuggestions {
  placeOfReceipt: LocationSuggestionSlot;
  consolidationCfs: LocationSuggestionSlot;
  portOfLoading: LocationSuggestionSlot;
  portOfDischarge: LocationSuggestionSlot;
  deconsolidationCfs: LocationSuggestionSlot;
  destinationCfs: LocationSuggestionSlot;
  placeOfDelivery: LocationSuggestionSlot;
  locationCountryCodeData: LocationSuggestionSlot;
}

export interface MainDetailsRef {
  referenceNumber?: number | null;
  truckQuote?: string;
}

export interface RoutingDetailsProps {
  showBannerError?: (messages: string[], autoHideMs?: number, variant?: 'bar' | 'modal') => void;
  moduleType: ModuleType;
  isAgentBooking?: boolean;
  rateDetails: any;
  formData: RoutingFormData;
  onChange: <K extends keyof RoutingFormData>(
    field: K,
    value: RoutingFormData[K]
  ) => void;
  tempData: any;
  pickupState: pickupState;
  pickupHandlers: pickupHandlers;
  onRegisterFields: (fields: string[]) => void;
  onFieldsChange: (data: any) => void;
  handlePickupFormDataChange?: (
    pickupId: number,
    field: keyof PickupDetailsFormData,
    value: unknown
  ) => void;
  termsSuggestion?: {
    data: Record<string, unknown>[];
    setQuery: (query: string) => void;
  };
  vesselSuggestion?: {
    data: Record<string, unknown>[];
    setQuery: (query: string) => void;
  };
  voyageInputRef?: RefObject<HTMLInputElement>;
  handleVesselCodeSelect?: (item: Record<string, unknown>) => void;
  handlePreCarriageVesselSelect?: (item: Record<string, unknown>) => void;
  handlePreCarriageBySelect?: (item: Record<string, unknown>) => void;
  carrierSuggestion?: {
    data: Record<string, unknown>[];
    setQuery: (query: string) => void;
  };
  handleCarrierCodeSelect?: (item: Record<string, unknown>) => void;
  locationSuggestions?: LocationSuggestions;
  handleLocationCodeSelect?: (
    item: Record<string, unknown>,
    codeField: keyof RoutingFormData,
    nameField: keyof RoutingFormData,
    regionField: keyof RoutingFormData
  ) => void;
  handleWarehouseSelect?: (item: Record<string, unknown>) => void;
  scheduleSearchOpen?: boolean;
  onOpenScheduleSearch?: () => void;
  onCloseScheduleSearch?: () => void;
  onScheduleBookThis?: (
    row: ScheduleRow,
    group: ScheduleGroup,
    isAccurateRatesReset: string
  ) => void;
  accessorialOptions?: AccessoriesOption[];
  doorAccessorialOptions ?: AccessoriesOption[];
  mainDetailsValue?: MainDetailsRef;
  onTruckQuoteReset?: () => void;
  onWarning?: (message: string | null) => void;
  showStatus: (type: StatusType, messages: string[]) => void;
  disableRoutingFields?: any;
  validateLocationOnTab?: any;
  validateTermsOnTab?: any;
  validateVesselOnTab?: any;
  carriageListBoxAddKeyDownHandler: (event: React.KeyboardEvent) => void;
  routingRef?: RoutingRefs
  datePickerKeyDownHandler: (event: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => void;
  dateSelectionHandler: (value: Date | null, fieldName: string) => void;
  datePickerOnBlurHandler: (event: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => void;
  error?: error
  skipNextBlurValidation?: boolean;
  setSkipNextBlurValidation?: (val: boolean) => void;
  hideAddPickup?: boolean;
}

export type RoutingRow = {
  code: string;
  codeRequired: boolean;
  name: string;
  nameRequired: boolean;
  date: string;
  dateRequired: boolean;
  region: string;
  codeName: keyof RoutingFormData;
  fieldName: keyof RoutingFormData;
  dataName: keyof RoutingFormData;
  regionName: keyof RoutingFormData;
  field: string
};

export type RoutingRefs = {
  portOfLoadingEtsRef: React.MutableRefObject<HTMLInputElement | null>;
  preCarriageByRef: React.MutableRefObject<HTMLInputElement | null>;
  loadInputLocationSelectionRef: React.MutableRefObject<HTMLInputElement | null>;
  destinationInputLocationSelectionRef: React.MutableRefObject<HTMLInputElement | null>;
  deConsolidationCodeInputLocationSelectionRef: React.MutableRefObject<HTMLInputElement | null>;
  dischargeInputLocationSelectionRef: React.MutableRefObject<HTMLInputElement | null>;
  origineEtdDateRef: React.MutableRefObject<HTMLInputElement | null>;
  etsDateRef: React.MutableRefObject<HTMLInputElement | null>;
  etaDateRef: React.MutableRefObject<HTMLInputElement | null>;
  etaDestinationDateRef: React.MutableRefObject<HTMLInputElement | null>;
  placeOfReceiptInputLocationSelectionRef: React.MutableRefObject<HTMLInputElement | null>;
  vesselCodeInputSelectionRef: React.MutableRefObject<HTMLInputElement | null>;
};

export type error = {
  showErrorModal: boolean;
  onClose: (fieldName: string) => void;
  message: string | React.ReactNode;
}
