// ─── Cargo ────────────────────────────────────────────────────────────────────

import type { ControlFlag, YesNo } from "../common.types";
import type { GenAesFilingBean } from "../filing/filing.types";
import type { BookingMultiCargoHazardous } from "../hazardous/hazardous.types";

export interface CargoDimensionBean {
  [key: string]: unknown;
}

export interface BookingQuoteCargoBean {
  container1: number;
  container2: number;
  container3: number;
  commodity1: string;
  commodity2: string;
  commodity3: string;
  commodity4: string;
  commodity5: string;
  weight: number;
  cube: number;
  weightLbs: number;
  cubeCbf: number;
  hazardousCode: YesNo | string;
  numberOfPieces: number;
  uom: string;
  marks: string;
  actualPieces: number;
  packaging: string;
  genAesFilingBean: GenAesFilingBean;
  recordSequence: number;
  status: number;
  controlFlag: ControlFlag;
  cargoDimensionBeanList: CargoDimensionBean[];
  isOverLength: boolean;
  isOverWeight: boolean;
  isDimension: boolean;
  oldLotCommentDesc: string;
  lotCommentsValue?: string;
  oldLotCommentsValue?: string;
  externalLotComments: unknown[];
  commodityDescription6: string;
  commodityDescription7: string;
  commodityDescription8: string;
  commodityDescription9: string;
  commodityDescription10: string;
  commodityDescription11: string;
  commodityDescription12: string;
  isInstructions: boolean;
  cargoInsurence?: YesNo;
  assuredParty?: string;
  commercialValue?: string;
  nonStackable: boolean;
  cargoHsCode: string;
  maxContainerSize?: string;
  doDimensionsExceed: boolean;
  doesVolumeExceeds: boolean;
}

export interface BookingQuoteMultiCargoBean {
  container1: number;
  container2: number;
  container3: number;
  commodity1: string;
  commodity2: string;
  commodity3: string;
  commodity4: string;
  commodity5: string;
  weight: number;
  cube: number;
  weightLbs: number;
  cubeCbf: number;
  hazardousCode: YesNo | string;
  numberOfPieces: number;
  uom: string;
  marks: string;
  actualPieces: number;
  packaging: string;
  genAesFilingBean: GenAesFilingBean;
  recordSequence: number;
  status: number;
  controlFlag: ControlFlag;
  cargoDimensionBeanList: CargoDimensionBean[];
  isOverLength: boolean;
  isOverWeight: boolean;
  isDimension: boolean;
  oldLotCommentDesc: string;
  externalLotComments: unknown[];
  stackable: YesNo;
  tmsShipmentType: string;
  isInstructions: boolean;
  bookingMultiCargoHazardousList: BookingMultiCargoHazardous[];
  nonStackable: boolean;
  cargoHsCode: string;
  doDimensionsExceed: boolean;
  doesVolumeExceeds: boolean;
}

export interface MultiCargoBookingQuoteNoteBean {
  added: boolean;
  pieces: string;
  weight: string;
  cube: string;
  weightLbs: string;
  cubeCbf: string;
  marksAndNumbers: string;
  goodsAndDescriptions: string;
  dimensions: string;
  haz: string;
  cargoHsCode: string;
  cargoLineSeq: number;
  isModifiedCargo: boolean;
}

export interface BookingCustomerDeclaredCargoBean {
  container1: number;
  container2: number;
  container3: number;
  weight: number;
  cube: number;
  weightLbs: number;
  cubeCbf: number;
  hazardousCode: string;
  numberOfPieces: number;
  uom: string;
  marks: string;
  actualPieces: number;
  packaging: string;
  genAesFilingBean: GenAesFilingBean;
  documentReferences: string;
  recordSequence: number;
  status: number;
  commodity: string;
  controlFlag: ControlFlag;
  cargoDimensionBeanList: CargoDimensionBean[];
  isOverLength: boolean;
  isOverWeight: boolean;
  isDimension: boolean;
  oldLotCommentDesc: string;
  externalLotComments: unknown[];
  isInstructions: boolean;
  nonStackable: boolean;
  doDimensionsExceed: boolean;
  doesVolumeExceeds: boolean;
}
