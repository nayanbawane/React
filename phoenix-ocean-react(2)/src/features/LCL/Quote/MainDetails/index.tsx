import { useQuoteMainDetails } from '@/hooks/LCL/MainDetails/Quote/useQuoteMainDetails';
import { QuoteMainDetails, StatusType } from 'phoenix-common-react';

type Props = {
  quoteMainDetails: ReturnType<typeof useQuoteMainDetails>;
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (formData: any) => void;
  onPopulateData?: (referenceNumber: string) => void;
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLInputElement>,
    ref?: React.MutableRefObject<HTMLInputElement | null>,
    accordionId?: number,
    openOnTab?: boolean,      // open accordion when Tab pressed
    openOnShiftTab?: boolean
  ) => void;
  showStatus: (type: StatusType, messages: string[]) => void;
  dateValidationFromRouting: any
  isQuotePopulated?: boolean;
  showBannerError?: (messages: string[], autoHideMs?: number, variant?: 'bar' | 'modal') => void;
  // activeAccordion?: string | null;
  // setActiveAccordion?: (id: string) => void;
  // accordionIds?: string[];
};

const QuoteMainDetailsSection = ({
  quoteMainDetails,
  onRegisterFields,
  onFieldsChange,
  onPopulateData,
  onKeyDown,
  showStatus,
  dateValidationFromRouting,
  isQuotePopulated,
  showBannerError
}: Props) => {
  const {
    datePickerKeyDownHandler,
    dateSelectionHandler,
    datePickerOnBlurHandler,
    error
  } = dateValidationFromRouting
  return (
    <QuoteMainDetails
      formData={quoteMainDetails.mainDetailsValue}
      setFormData={quoteMainDetails.setFormData}
      onChange={(field: any, value: any) => {
        const updatedData = { [field]: value };
        quoteMainDetails.handleMainDetailsChange(updatedData);
        if (onFieldsChange) {
          onFieldsChange({ ...quoteMainDetails.mainDetailsValue, ...updatedData });
        }
      }}
      tempData={quoteMainDetails}
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
      onPopulateData={onPopulateData}
      onKeyDown={onKeyDown}
      showStatus={showStatus}
      datePickerKeyDownHandler={datePickerKeyDownHandler}
      dateSelectionHandler={dateSelectionHandler}
      datePickerOnBlurHandler={datePickerOnBlurHandler}
      error={error}
      isQuotePopulated={isQuotePopulated}
      showBannerError={showBannerError}
    />
  );
};

export default QuoteMainDetailsSection;
