import { CustomerDetails } from 'phoenix-common-react';
import type { EoriPortConditions } from 'phoenix-common-react';
import type { useCustomerDetails } from '../../../../hooks/LCL/CustomerDetails/useCustomerdetails';
import { useRateDetails } from '../../../../hooks/LCL/RateDetails/useRateDetails';

type Props = {
  customerDetail:      ReturnType<typeof useCustomerDetails>;
  portOfDischarge?:    string;
  eoriPortConditions?: EoriPortConditions;
  onRegisterFields:    (fields: string[]) => void;
  onFieldsChange:      (formData: unknown) => void;
  rateDetails:         ReturnType<typeof useRateDetails>;
  moduleType?:         string;
  containerType?: string;
  direction?: string;
  shipmentType?:string
};

const BookingCustomerDetails = ({
  customerDetail,
  portOfDischarge = '',
  eoriPortConditions = {},
  onRegisterFields,
  rateDetails,
  onFieldsChange,
  moduleType,
  containerType,
  direction,
  shipmentType
}: Props) => {
  const { customerFormData, customerHandlers, customerSuggestions } = customerDetail;
  return (
    <CustomerDetails
      moduleType={moduleType}
      containerType={"l"}
      direction={direction}
      formData={customerFormData}
      handlers={customerHandlers}
      suggestions={customerSuggestions}
      portOfDischarge={portOfDischarge}
      eoriPortConditions={eoriPortConditions}
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
      rateDetails={rateDetails}
      shipmentType={shipmentType}
    />
  );
};

export default BookingCustomerDetails;
