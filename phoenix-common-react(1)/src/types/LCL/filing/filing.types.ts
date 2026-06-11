// ─── AES / Custom Filing ──────────────────────────────────────────────────────

import type { ControlFlag, YesNo } from "../common.types";

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

export interface BookingQuoteCustomFilingBean {
  filingType: string;
  filingBy: string;
  scacCode: string;
  amsNumber: string;
}

export interface AmsCustomAdvanceFillingMainBean {
  AmsCustomAdvanceFillingBeans: unknown[];
  deleteAmsCustomAdvanceFillingBeans: unknown[];
}

export interface AmendmentCodeBean {
  amendmentCode: string;
  bookingNumber: string;
  handlingOffice: string;
  inputUser: string;
  inputDate: string;
  oldAmendmentCode: string;
  reference: string;
  officeId: number;
  module: string;
  siteId: number;
}

export interface FilingDetailsFormData {
  fillingBy: string;
  customsAdvancedFiling: string;
}

export interface FilingDetailsProps {
  formData: FilingDetailsFormData;
  onChange: (field: keyof FilingDetailsFormData, value: any) => void;
  onFilingByShiftTab?: () => void;
  onFieldsChange?: (formData: FilingDetailsFormData) => void;
  onRegisterFields?: (fields: (keyof FilingDetailsFormData)[]) => void;
}