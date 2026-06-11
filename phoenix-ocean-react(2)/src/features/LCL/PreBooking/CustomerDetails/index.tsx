import {
  CustomerDetails,
  EoriPortConditions,
  PreBookingCustomerDetail,
  StatusType,
} from 'phoenix-common-react';
import type { useCustomerDetails } from '../../../../hooks/LCL/CustomerDetails/useCustomerdetails';
import { useRateDetails } from '../../../../hooks/LCL/RateDetails/useRateDetails';

type Props = {
  customerDetail: ReturnType<typeof useCustomerDetails>;
  showStatus?: (type: StatusType, messages: string[]) => void;
  onRegisterFields: (fields: string[]) => void;
  onFieldsChange: (formData: unknown) => void;
  moduleType?: string;
  // rateDetails: ReturnType<typeof useRateDetails>;
  accuRateProfile?: string;
};

const PreBookingCustomerDetails = ({
  customerDetail,

  // rateDetails,
  onRegisterFields,
  onFieldsChange,
  moduleType,
  showStatus,
}: Props) => {
  const { customerFormData, customerHandlers, customerSuggestions } =
    customerDetail;

  return (
    <PreBookingCustomerDetail
      form={customerFormData.lclForm}
      onFieldsChange={onFieldsChange}
      onRegisterFields={onRegisterFields}
      onFieldChange={customerHandlers.handleLclFormChange}
      customerMoreDetails={customerFormData.customerMoreDetails}
      onMoreDetailsChange={customerHandlers.handleMoreDetailsChange}
      suggestions={customerSuggestions}
      onCustomerCodeSelect={customerHandlers.onCustomerCodeSelect}
      // rateDetails={rateDetails}
      showStatus={showStatus}
      accuRateProfile={customerFormData.lclForm.accuRateProfile}
      moduleType={moduleType}
    />
  );
};

export default PreBookingCustomerDetails;
