import { ControlFlag } from "../common.types";
import { RateDetailsState } from "../RateDetails/RateDetails.types";
import { RoutingRefs } from "../routing/RoutingDetails.types";

export interface SelectOption {
  label: string;
  value: string;
}

export interface StandardDimensionPreset {
  length: string; width: string; height: string; unit: string;
  pieces: string; cbm: string; cbf: string; kg: string; lbs: string;
  stackable: string; shipmentType: string; stackingType: string;
}

// ─── Existing types ───────────────────────────────────────────────────────────

export interface DimensionRowType {
  length: string; width: string; height: string; unit: string;
  pieces: string; cbm: string; cbf: string; kg: string; lbs: string;
  cls: string; packageType: string; stackable: string;
  shipmentType: string; stackingType: string; tailerType: string;
}

export interface HazardousRowType {
  hrid?: string;
  imoClass: string; imoSubclass: string; unNumber: string; imoPage: string;
  pkgGroup: string; flashpointC: string; flashpointF: string; degreeUnit: string;
  pieces: string; packaging: string; weight: string; properShippingName: string;
  technicalName: string; placard1: string; placard2: string;
  emergencyNumber: string; emergencyContact: string; quantity: string;
  shipperName1: string; shipperName2: string;
  commodity: string;
  controlFlag?: Flag;
}

export interface CargoRowType {
  crid?: string;
  marks: string;
  pieces: string;
  packaging: string;
  description: string;
  kg: string;
  lbs: string;
  cbm: string;
  cbf: string;
  hazardous: string;
  uom: string;
  docRef: string;
  isDimension: boolean;
  overLengthTransmit: boolean;
  overWeightTransmit: boolean;
  hsCode: string;
  sensitiveCargo: boolean;
  dimRows: DimensionRowType[];
  hazRows: HazardousRowType[];
  useStandardDimensions : any,
  //fcl cargo rowType
  numberOfContainer1: string;
  numberOfContainer2: string;
  numberOfContainer3: string;
  containerType1: string;
  containerType2: string;
  containerType3: string;
  descriptionOfGoods: string;
  controlFlag: Flag;
  dirty: boolean;
  // PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
  temperatureC?: string;
  temperatureF?: string;
  ventSetting?: string;
  generatorSet?: string;
  // PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
  reCalculateTEURate?: boolean;
}

export interface LotRowType {
  type: string;
  details: string;
  freeTextInput?: string;
  commentId?: number,
  module?: string,
  reference?: string,
  code?: string,
  name?: string,
  value?: string,
  description?: string,
  inputUserName?: string,
  inputDate?: string | null,
  updateUserName?: string,
  updateDate?: string | null,
  transactionFlagStatus?: string,
  oldCode?: string,
  oldName?: string,
  oldValue?: string,
  oldDescription?: string,
  fromQuote?: boolean,
  controlFlag?: Flag,
  cid?: number,
}

export interface CargoFlagsType {
  fortyContainer: boolean; fortyFiveContainer: boolean;
  fiftyThreeTrailer: boolean; overLength: boolean;
  overWeight: boolean; nonStackable: boolean; printDimension: boolean;
  printDimensionQuote: boolean; instructions: boolean;
}

export interface CargoDetailsFormData {
  flags: CargoFlagsType;
  cargoRows: CargoRowType[];
  customsRows: CargoRowType[];
  lotRows: LotRowType[];
  internalComment: string;
  loadingInstruction: string;
  warehouseInstruction: string;
  sensitiveCargo?: string;
  stackable?: string;
  tmsShipmentType?: string;
}

// ─── Grouped state/handler interfaces ────────────────────────────────────────

export interface CargoRowsState {
  cargoRows: CargoRowType[];
}

export interface CargoRowsHandlers {
  updateCargoField: (index: number, field: string, value: unknown) => void;
  blurCargoField: (index: number, field: string, value: string) => void;
  blurDimension: (cIdx: number, dIdx: number, field: string, value: string) => void;
  addNewCargo: () => void;
  removeCargo: (index: number) => void;
  updateDimension: (cIdx: number, dIdx: number, field: keyof DimensionRowType, value: unknown) => void;
  addDimension: (cIdx: number) => void;
  removeDimension: (cIdx: number, dIdx: number) => void;
  updateHazardous: (cIdx: number, hIdx: number, field: string, value: unknown) => void;
  addHazardous: (cIdx: number) => void;
  addHazardousWithValues: (cIdx: number, fields: Partial<HazardousRowType>) => void;
  removeHazardous: (cIdx: number, hIdx: number) => void;
  applyStandardDimensions: (cargoIndex: number) => void;
  clearStandardDimensions: (cargoIndex: number) => void;
  updateFCLCargoRows?: (field: string, value: any) => void
  valueIsChanged?: (valueChange: boolean, numberOfContainer: string, containerType: string, rateDetailsDefaultState: RateDetailsState) => void
  updateContainerData: (numberOfContainer?: string | number | undefined, containerType?: string | undefined, rowNo?: number | undefined, changedField?: string | undefined, changedValue?: string | undefined) => void
}

export interface CustomsRowsState {
  customsRows: CargoRowType[];
}

export interface CustomsRowsHandlers {
  updateCustomsField: (index: number, field: string, value: unknown) => void;
  blurCustomsField: (index: number, field: string, value: string) => void;
  blurCustomsDimension: (cIdx: number, dIdx: number, field: string, value: string) => void;
  addNewCustoms: () => void;
  removeCustoms: (index: number) => void;
  updateCustomsDimension: (cIdx: number, dIdx: number, field: keyof DimensionRowType, value: unknown) => void;
  addCustomsDimension: (cIdx: number) => void;
  removeCustomsDimension: (cIdx: number, dIdx: number) => void;
  updateCustomsHazardous: (cIdx: number, hIdx: number, field: string, value: unknown) => void;
  addCustomsHazardous: (cIdx: number) => void;
  removeCustomsHazardous: (cIdx: number, hIdx: number) => void;
  applyStandardDimensions: (customsIndex: number) => void;
  clearStandardDimensions: (customsIndex: number) => void;
}

export interface LotState {
  lotRows: LotRowType[];
}

export interface LotHandlers {
  updateLotField: (index: number, field: string, value: unknown) => void;
  addNewLot: (afterIndex: number) => void;
  removeLot: (index: number) => void;
}

export interface InstructionState {
  internalComment: string;
  loadingInstruction: string;
  warehouseInstruction: string;
}

export interface InstructionHandlers {
  setInternalCmt: (val: string) => void;
  setLoadingInstruction: (val: string) => void;
  setWarehouseInstruction: (val: string) => void;
}

export interface FlagState {
  flags: CargoFlagsType;
  statusBtns: Array<{ key: string; label: string; handler: () => void }>;
}

export interface DimensionChangePayload {
  cargoIndex: number;
  dimIndex: number;
  field: string;
  value: unknown;
  updatedRow: DimensionRowType;
  allDimRows: DimensionRowType[];
}

export interface FlagHandlers {
  handleContainerExclusiveToggle: (key: 'fortyContainer' | 'fortyFiveContainer' | 'fiftyThreeTrailer') => void;
  handleSimpleToggle: (key: keyof CargoFlagsType) => void;
  handleNonStackableToggle: () => void;
  handleDimensionChange: (payload: DimensionChangePayload) => void;
}

export interface CbmDialogState {
  cbmDialogOpen: boolean;
  maxCbm: number | null;
}

export interface CbmDialogHandlers {
  onCbmConfirm: () => void;
  onCbmCancel: () => void;
}

export interface DimensionRowProps {
  row: DimensionRowType;
  onChange: (field: keyof DimensionRowType | string, value: unknown) => void;
  onBlurField?: (field: string, value: string) => void;
  onRemove: () => void;
  onAdd: () => void;
  isFirst?: boolean;
  showStackingType?: boolean;
  pkgTypeOptions?: SelectOption[];
  hasStandardDimensions?: boolean;
  isDefaultDimActive?: boolean;
  onToggleDefaultDim?: (active: boolean) => void;
  isTrucking?: boolean;
  isTrkEnabled?: boolean;
  dimensionFlags?: boolean;
  rateDetails?: any;
  showActions?: boolean;  // PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
}
export type Flag = 'N' | 'D' | 'U';

export interface CargoRowProps {
  cargoRows: CargoRowType[];
  updateCargoField: (idx: number, field: string, value: unknown) => void;
  blurCargoField?: (idx: number, field: string, value: string) => void;
  blurDimension?: (cIdx: number, dIdx: number, field: string, value: string) => void;
  removeCargo: (idx: number) => void;
  addNewCargo: () => void;
  updateDimension: (cIdx: number, dIdx: number, field: keyof DimensionRowType, value: unknown) => void;
  addDimension: (idx: number) => void;
  removeDimension: (cIdx: number, dIdx: number) => void;
  updateHazardous: (cIdx: number, hIdx: number, field: string, value: unknown) => void;
  addHazardous: (idx: number) => void;
  removeHazardous: (cIdx: number, hIdx: number) => void;
  applyStandardDimensions?: (cIdx: number) => void;
  clearStandardDimensions?: (cIdx: number) => void;
  hsCodeStrictMode?: boolean;
  isCustomsDeclared?: boolean;
  packagingOptions?: SelectOption[];
  imoClassOptions?: SelectOption[];
  commodityOptions?: SelectOption[];
  standardDimensionPreset?: StandardDimensionPreset;
  hasStandardDimensions?: boolean;
  referenceNumber?: number;
  moduleCode?: string;
  rateDetails: any;
  isTrkEnabled?: boolean;
  isTrucking?: boolean;
  dimensionFlags?: boolean[];
  shippingType?: string;
}

export interface CargoRowItemProps {
  cargo: CargoRowType;
  cargoIndex: number;
  onChange: (field: string, value: unknown) => void;
  onBlurField?: (field: string, value: string) => void;
  onDimBlur?: (dimIdx: number, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: () => void;
  dimRows: DimensionRowType[];
  onDimChange: (dimIndex: number, field: keyof DimensionRowType, value: unknown) => void;
  onDimAdd: () => void;
  onDimRemove: (dimIndex: number) => void;
  hazRows: HazardousRowType[];
  onHazChange: (hazIndex: number, field: string, value: unknown) => void;
  onHazAdd: () => void;
  onHazRemove: (hazIndex: number) => void;
  onApplyStandardDimensions?: () => void;
  onClearStandardDimensions?: () => void;
  hsCodeStrictMode: boolean;
  isCustomsDeclared: boolean;
  packagingOptions: SelectOption[];
  imoClassOptions: SelectOption[];
  commodityOptions: SelectOption[];
  standardDimensionPreset?: StandardDimensionPreset;
  hasStandardDimensions?: boolean;
  referenceNumber?: number;
  moduleCode?: string;
  rateDetails: any;
  isTrkEnabled: boolean;
  dimensionFlags: boolean[];
  shippingType?: string;
}

export interface CargoDetailsProps {
  shippingType?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  rateDetails?: any;
  cargoState: CargoRowsState;
  cargoHandlers: CargoRowsHandlers;
  customsState: CustomsRowsState;
  customsHandlers: CustomsRowsHandlers;
  lotState: LotState;
  lotHandlers: LotHandlers;
  instructionState: InstructionState;
  instructionHandlers: InstructionHandlers;
  flagState: FlagState;
  flagHandlers: FlagHandlers;
  cbmDialogState: CbmDialogState;
  cbmDialogHandlers: CbmDialogHandlers;
  hsCodeStrictMode?: boolean;
  packagingOptions?: SelectOption[];
  imoClassOptions?: SelectOption[];
  commodityOptions?: SelectOption[];
  standardDimensionPreset?: StandardDimensionPreset;
  hasStandardDimensions?: boolean;
  referenceNumber?: number;
  moduleCode?: string;
  isTrkEnabled?: boolean;
  dimensionFlags?: boolean[]

  containerTypeSelect: SelectOption[]
  fclhazardousSelect: SelectOption[]
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLInputElement>,
    ref?: React.MutableRefObject<HTMLInputElement | null>,
    accordionId?: number,
    openOnTab?: boolean,      // open accordion when Tab pressed
    openOnShiftTab?: boolean
  ) => void;
  routingRef: RoutingRefs
  onBlur?: (numberOfContainer: string, containerType: string, index: number, changedField: "numberOfContainer" | "containerType") => void;
}

export interface GenAesFilingBean {
  referenceNumber?: string;
  scacCode?: string;
  itnNumber?: string;
  filingType?: string;
  type?: string;
  controlFlag: ControlFlag;
  inputUser?: string;
  mrnNumber?: string;
  filingBy?: string;
}

export interface FCLCargoProps {
  formType: string;
  fclCargoRow: CargoRowType;
  isHazardous: boolean;
  hazRows: HazardousRowType[];
  shippingType: string;
  onCargoChange: (field: string, value: any) => void
  onAddHazardousRow: () => void;
  onRemoveHazardousRow: (hazIndex: number) => void;
  onChangeHazardousRow: (hazIndex: number, field: string, value: string | number) => void;
  containerTypeSelect: SelectOption[]
  packagingOptions?: SelectOption[],
  imoClassOptions?: SelectOption[],
  fclhazardousSelect: SelectOption[]
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLInputElement>,
    ref?: React.MutableRefObject<HTMLInputElement | null>,
    accordionId?: number,
    openOnTab?: boolean,      // open accordion when Tab pressed
    openOnShiftTab?: boolean
  ) => void;
  routingRef: RoutingRefs;
  onBlur: (numberOfContainer: string, containerType: string, index: number, changedField: "numberOfContainer" | "containerType") => void
  updateContainerData: (numberOfContainer?: string | number | undefined, containerType?: string | undefined, rowNo?: number | undefined, changedField?: string | undefined, changedValue?: string | undefined) => void
  onBlurField?: (field: string, value: string) => void;
  isAccurateRatingType?: boolean;
  triggerAccurateOrConfirm?: any
}


export interface ContainerDataBean {
  containerSize: string;
  containerType: string;
  description: string;
  teu: number;
  numberOfContainer: number;
  containerMapKey: string;
}

export interface ContainerTypeList {
  numberOfContainer: number;
  containerMapKey: string
}
