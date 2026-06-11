import { BookingMainDetailsSection, StatusType } from 'phoenix-common-react';

type Props = {
  onRegisterFields: (fields: string[]) => void;
  onFieldsChange: (formData: unknown) => void;
  onPopulateData?: (referenceNumber: string, quoteNumber: string) => void;
  showStatus: (type: StatusType, messages: string[]) => void;
  preloadedClauseSuggestions?: Array<{ code: string; name: string; description: string }>;
  suggestClauseIconClick?: () => void;
};

const BookingMainDetails = ({ onRegisterFields, onFieldsChange, onPopulateData, showStatus, preloadedClauseSuggestions, suggestClauseIconClick }: Props) => {
  return (
    <BookingMainDetailsSection
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
      onPopulateData={onPopulateData}
      showStatus={showStatus}
      preloadedClauseSuggestions={preloadedClauseSuggestions}
      suggestClauseIconClick={suggestClauseIconClick}
    />
  );
};

export default BookingMainDetails;
