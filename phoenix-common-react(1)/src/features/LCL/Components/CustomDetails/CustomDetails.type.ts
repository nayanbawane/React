export interface CustomDetailsFormData {
  fillingType: string;
  SCACCodeText: string;
  fillingAs: string;
  ITNNumber: string;
  fillingByUCR: string;
  ucrNumberUCR: string;
  masterUCR: boolean;
}

export interface CustomDetailsProps {
  formData: CustomDetailsFormData;
  onChange: (field: keyof CustomDetailsFormData, value: any) => void;
  showSCACCode?: boolean;
  onFilingTypeShiftTab?: () => void;
  onITNNumberTab?: () => void;
  ucrEnabled?: boolean;
  mrnEnabled?: boolean;
  onFieldsChange?: (formData: CustomDetailsFormData) => void;
  onRegisterFields?: (fields: (keyof CustomDetailsFormData)[]) => void;
}
