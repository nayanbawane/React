import { useCustomDetails } from '@/hooks/LCL/CustomDetails/useCustomdetails';
import { FilingDetails as FilingDetailsSection } from 'phoenix-common-react';

// PHX-131742: FCL Booking: cargo details section changes - Commented by dhapatel
/* type Props = {
  filingDetails?: ReturnType<typeof useCustomDetails>;
  onRegisterFields: (fields: string[]) => void;
  onFieldsChange: (formData: unknown) => void;
  showSCACCode?: boolean;
}; */

// PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel
type Props = {
  filingDetails?: ReturnType<typeof useCustomDetails>;
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (formData: unknown) => void;
  showSCACCode?: boolean;
};

const FilingDetails = ({ onRegisterFields, onFieldsChange }: Props) => {
// PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
  // const { customFormData, bulkUpdateCustom } = customDetail;

  // const handleFormChange = (formData: typeof customFormData) => {
  //   bulkUpdateCustom(formData);
  //   onFieldsChange(formData);
  // };

  return (
    <FilingDetailsSection
      // formData={customFormData}
      // onRegisterFields={onRegisterFields}
      // onFieldsChange={handleFormChange}
      // showSCACCode={showSCACCode}
    />
  );
};

export default FilingDetails;
