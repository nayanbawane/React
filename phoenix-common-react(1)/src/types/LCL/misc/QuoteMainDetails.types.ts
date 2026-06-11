import { StatusType } from "./commonTypes";

export interface QuoteMainDetailsProps {
  formData: QuoteMainDetailsFormData;
  setFormData: React.Dispatch<React.SetStateAction<QuoteMainDetailsFormData>>;
  onChange: <K extends keyof QuoteMainDetailsFormData>(
    field: K,
    value: QuoteMainDetailsFormData[K]
  ) => void;
  tempData: any;
  onRegisterFields: (fields: string[]) => void;
  onFieldsChange: (data: any) => void;
  onPopulateData?: (referenceNumber: string) => void;
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLInputElement>,
    ref?: React.MutableRefObject<HTMLInputElement | null>,
    accordionId?: number,
    openOnTab?: boolean,      // open accordion when Tab pressed
    openOnShiftTab?: boolean
  ) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  showStatus: (type: StatusType, messages: string[]) => void;
  datePickerKeyDownHandler: (event: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => void;
  dateSelectionHandler: (value: Date | null, fieldName: string) => void;
  datePickerOnBlurHandler: (event: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => void;
  error?: {
    showErrorModal?: boolean;
    onClose?: () => void;
    message?: string;
  };
  isQuotePopulated?: boolean;
  showBannerError?: (messages: string[], autoHideMs?: number, variant?: 'bar' | 'modal') => void;
}

export interface ClauseItem {
  clauseCode: string;
  clauseName?: string | null;
  clauseNameLocale?: string | null;
  clause?: string | null;
  clauseLocale?: string | null;
  clauseDesc?: string | null;
  clauseDescLocale?: string | null;
  sequence?: number;
}

export interface QuoteMainDetailsFormData {
  type: string;
  referenceNumber: number;
  userReference: string;
  status: string;
  clauses: ClauseItem[];
  effectiveDate: Date | String | null;
  expirationDate: Date | String | null;
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
  updatedOn: Date | string | null;
  transitTime: string;
  terms: string;
  termName: string;
  carrier: any[];
  carrierBookingNumber: string;
  frequency: string;
  pickupNeeded: string;
  prepaidCollect: string;
  controllingEntity: string;
}
