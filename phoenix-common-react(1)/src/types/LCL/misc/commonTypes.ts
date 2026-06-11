export type StatusType = 'info' | 'warning' | 'error' | 'success';
import { ClauseItem } from './QuoteMainDetails.types';
export type Flag = 'N' | 'D' | 'U';

interface DocumentUploadFormData {
  type: string;
  reference: string;
  requiredByDate: string;
  requiredByTime: string;
  receivedDate: string;
  receivedTime: string;
  expirationDate: string;
  customsOffice: string;
  channel: string;
  comments: string;
  active: string;
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface LCLFormState {
  type: string;
  referenceNumber: number;
  userReference: string;
  status: string;
  clauses: ClauseItem[];
  effectiveDate: Date | null;
  expirationDate: Date | null;
  quoteChannel: string;
  direction: string;
  pendingFinal: string;
  truckQuote: string;
  quoteType: string;
  billingCompany: string;
  handlingOffice: string;
  createdBy: string;
  createdOn: Date | null;
  updatedBy: string;
  updatedOn: Date | null;
  Terms: string;
  carrier: any[];
  carrierBookingNumber: string;
  frequency: string;
  pickupNeeded: string;
  prepaidCollect: string;
  controllingEntity: string;
  transitTime: string;
}

export interface CargoRowData {
  marks: string;
  pieces: string;
  packaging: string;
  description: string;
  kg: string;
  lbs: string;
  cbm: string;
  cbf: string;
  hazardous: string;
  docRef: string;
  dimRows: any[];
  hazRows: any[];
}

export interface LotRowData {
  type: string;
  details: string;
  freeTextInput?: string;
  controlFlag?: Flag;
  cid?: number;
}

export interface CargoDetailsState {
  flags: {
    fortyContainer: boolean;
    fortyFiveContainer: boolean;
    fiftyThreeTrailer: boolean;
    overLength: boolean;
    overWeight: boolean;
    nonStackable: boolean;
    printDimension: boolean;
  };
  lotRows: LotRowData[];
  internalComment: string;
  cargoRows: CargoRowData[];
  customsRows: CargoRowData[];
}

export interface LocationInformationData {
  publicInfo: string;
  privateInfo: string;
}

export interface QuoteBookingData {
  mainDetails: LCLFormState;
  documentDetails: DocumentUploadFormData[];
  cargoDetails: CargoDetailsState;
  locationInformation: LocationInformationData;
  // customerDetails and routingDetails can be added as they are explored
}

export interface MainDetailsProps { }

export interface LocationResult {
  id: string;
  code: string;
  name: string;
  exportRegion: string;
  importRegion: string;
  unCode: string;
  lclAgent: string;
  fclAgent: string;
  deconsolidationPoint: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  country: string;
  warehouse: string;
  codeType: string;
  locationType: string;
  pier: string;
  lclExternalInfo: string;
  lclInternalInfo: string;
  fclExternalInfo: string;
  fclInternalInfo: string;
  inputUser: string;
  inputDate: string;
  updateUser: string;
  updateDate: string;
}

export interface LocationSearchFormValues {
  code?: string;
  name?: string;
  country?: string;
  unCode?: string;
  locationType?: string;
}
