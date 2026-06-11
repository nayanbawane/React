import type {
  CargoRowType,
  DimensionRowType,
  HazardousRowType,
  LotRowType,
  CargoFlagsType,
  CargoDetailsState,
} from 'phoenix-common-react';

export const initialDimRow: DimensionRowType = {
  length: '', width: '', height: '', unit: 'Inches',
  pieces: '', cbm: '', kg: '', lbs: '', cls: '',
  packageType: '-1', stackable: 'Yes', shipmentType: 'LTL',
  stackingType: '-1',
};

export const initialHazRow: HazardousRowType = {
  imoClass: '-1',
  imoSubclass: '-1',
  unNumber: '',
  imoPage: '',
  pkgGroup: '-1',
  flashpointC: '0',
  flashpointF: '0',
  degreeUnit: 'C',
  pieces: '0',
  packaging: '-1',
  weight: '0',
  properShippingName: '',
  technicalName: '',
  placard1: '',
  placard2: '',
  emergencyNumber: '',
  emergencyContact: '',
  quantity: '-1',
  shipperName1: '',
  shipperName2: '',
  commodity:'',
  controlFlag: 'N',
};

export const intiialFCLCargoRow = {
  numberOfContainer1: '', numberOfContainer2: '', numberOfContainer3: '',
  containerType1: '-1', containerType2: '-1', containerType3: '-1',
  descriptionOfGoods: '',
  //  cbm: '', cbf: '', kg: '', lbs: '', hazardous: 'Please Select'
}

export const initialCargoRow: CargoRowType = {
  marks: '',
  pieces: '',
  packaging: '-1',
  description: '',
  kg: '',
  lbs: '',
  cbm: '',
  cbf: '',
  hazardous: 'Please Select',
  uom: 'M',
  docRef: '-1',
  isDimension: false,
  overLengthTransmit: false,
  overWeightTransmit: false,
  hsCode: '',
  sensitiveCargo: false,
  dimRows: [],
  hazRows: [{ ...initialHazRow }],
  controlFlag: 'N',
  reCalculateTEURate: false,
  ...intiialFCLCargoRow,
  // PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
  temperatureC: '',
  temperatureF: '',
  ventSetting: 'Close',
  generatorSet: 'No',
  // PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
};

export const initialLotRow: LotRowType = {
  type: '-1',
  details: '',
  freeTextInput: '',
  controlFlag: 'N',
};

export const initialFlags: CargoFlagsType = {
  fortyContainer: false,
  fortyFiveContainer: false,
  fiftyThreeTrailer: false,
  overLength: false,
  overWeight: false,
  nonStackable: false,
  printDimension: false,
  printDimensionQuote: false,
  instructions: false,
};

export const initialCargoDetails: CargoDetailsState = {
  flags: { ...initialFlags },
  lotRows: [{ ...initialLotRow }],
  internalComment: '',
  cargoRows: [{ ...initialCargoRow }],
  customsRows: [],
};
