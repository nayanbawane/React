import { useCustomDetails } from '@/hooks/LCL/CustomDetails/useCustomdetails';
import { CustomDetails as CustomDetailsSection } from 'phoenix-common-react';

type Props = {
  customDetail: ReturnType<typeof useCustomDetails>;
  onRegisterFields: (fields: string[]) => void;
  onFieldsChange: (formData: unknown) => void;
  showSCACCode?: boolean;
};

const CustomDetails = ({ customDetail, onRegisterFields, onFieldsChange, showSCACCode }: Props) => {
  const { customFormData, bulkUpdateCustom } = customDetail;

  const handleFormChange = (formData: typeof customFormData) => {
    bulkUpdateCustom(formData);
    onFieldsChange(formData);
  };

  return (
    <CustomDetailsSection
      formData={customFormData}
      onRegisterFields={onRegisterFields}
      onFieldsChange={handleFormChange}
      showSCACCode={showSCACCode}
    />
  );
};

export default CustomDetails;
