import { StatusType } from '../misc/commonTypes';

export type BookingType = 'L' | 'F' | '';

export type routedType = 'Y' | 'N' | 'CT';

export type TransportMode = 'O' | 'R' | 'RA' | 'A' | '';

export type BookingStatus = 'P' | 'F' | '';

export interface OptionType {
  label: string;
  value: string;
}

export interface LookupItem {
  [key: string]: any;
}

export type PStatusSelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
  hasIndicator?: boolean;
  indicatorChecked?: boolean;
  indicatorDisabled?: boolean;
  indicatorColor?: string;
  indicatorDisabledColor?: string;
  indicatorInteractive?: boolean;
};

export interface ImportBookingStatusItem {
  statusCode: string;
  statusName: string;
  isToggleApplicable: 'Y' | 'N' | '';
  toggleValue: 'Y' | 'N' | '';
}

export interface PreBookingFormData {
  type: BookingType;
  reference: string;
  importQuoteNumber: string;
  userReference: LookupItem | null;
  modeOfTransport: TransportMode;
  routed: routedType;
  clauses: LookupItem[];
  preBookingChannel: string;
  exportBookingNumber: string;
  exportQuoteNumber: string;
  followUp: boolean;
  hold: boolean;
  importBookingStatus: any;
  importBookingStatusList: ImportBookingStatusItem[];
  truckQuoteNumber: string;
  pendingFinal: boolean;
  agentBooking: boolean;
  billingCompany: string;
  handlingOffice: string;
  status: string;
  bookingOffice: string;
  createdBy: string;
  createdOn: string | null;
  updatedBy: string;
  updatedOn: string | null;
  wwablnumber: string;
  isReferencePopulated: boolean;
}

export interface PreBookingMainDetailsProps {
  onRegisterFields: (fields: string[]) => void;
  onFieldsChange: (data: any) => void;
  showStatus: (type: StatusType, messages: string[]) => void;
  onPopulateData: (data: any) => void;
  onPopulateQuoteData: (data: any) => void;
  onsaveExportBooking: (data: any) => void;
  isShipmentConfirmed?: boolean;
  suggestClauseIconClick: () => void;
  onResetCustomer?: () => void;
}
