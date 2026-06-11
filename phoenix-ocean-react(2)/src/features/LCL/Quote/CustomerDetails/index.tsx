import { useCustomerDetails } from '@/hooks/LCL/CustomerDetails/useCustomerdetails';
import { useRateDetails } from '@/hooks/LCL/RateDetails/useRateDetails';
import { CustomerDetails as CustomerDetailsSection } from 'phoenix-common-react';

type Props = {
  moduleType?: string;
  containerType?: string;
  direction?: string;
  rateDetails: ReturnType<typeof useRateDetails>;
  customerDetail: ReturnType<typeof useCustomerDetails>;
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (formData: unknown) => void;
  moreDetailsRef?: React.MutableRefObject<HTMLInputElement | null>;
  trackingCodeRef?: React.MutableRefObject<HTMLInputElement | null>;
  moreDetailsFlagValue?: (item: boolean) => void;
  shipmentType?: string;
  showBannerError?: (messages: string[], autoHideMs?: number, variant?: 'bar' | 'modal') => void;
};

const CustomerDetails = ({
  moduleType,
  containerType,
  direction,
  customerDetail,
  onRegisterFields,
  onFieldsChange,
  rateDetails,
  moreDetailsRef,
  trackingCodeRef,
  moreDetailsFlagValue,
  shipmentType,
  showBannerError
}: Props) => {
  const { customerFormData, customerHandlers, customerSuggestions } =
    customerDetail;

  return (
    <CustomerDetailsSection
      showBannerError={showBannerError}
      moduleType={moduleType}
      containerType={containerType}
      direction={direction}
      formData={customerFormData}
      handlers={customerHandlers}
      suggestions={customerSuggestions}
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
      rateDetails={rateDetails}
      moreDetailsRef={moreDetailsRef}
      trackingCodeRef={trackingCodeRef}
      onMoreDetailsFlagValue={(res) => { moreDetailsFlagValue?.(res) }}
      shipmentType={shipmentType}
    />
  );
};

export default CustomerDetails;
