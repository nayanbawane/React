import { FillingDetails } from 'phoenix-common-react';
import type { useFillingDetails } from '@/hooks/LCL/FillingDetails/useFillingDetails';

type Props = {
  fillingDetail: ReturnType<typeof useFillingDetails>;
  onRegisterFields: (fields: string[]) => void;
  onFieldsChange: (formData: unknown) => void;
};

const BookingFillingDetails = ({ fillingDetail, onRegisterFields, onFieldsChange }: Props) => {
  const { fillingDetailsFormData, fillingByOptions, handleFieldChange } = fillingDetail;
  return (
    <FillingDetails
      formData={fillingDetailsFormData}
      fillingByOptions={fillingByOptions}
      onFieldChange={handleFieldChange}
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
    />
  );
};

export default BookingFillingDetails;
