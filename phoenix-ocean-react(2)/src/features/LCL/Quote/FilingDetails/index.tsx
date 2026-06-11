import { useCustomDetails } from '@/hooks/LCL/CustomDetails/useCustomdetails';
import { FilingDetails as FilingDetailsSection } from 'phoenix-common-react';

// type Props = {
//   filingDetails?: ReturnType<typeof useCustomDetails>;
//   onRegisterFields: (fields: string[]) => void;
//   onFieldsChange: (formData: unknown) => void;
//   showSCACCode?: boolean;
// };

const FilingDetails = () => {
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
