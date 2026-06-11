import { useCargoDetails } from '@/hooks/LCL/CargoDetails/useCargodetails';
import { useRateDetails } from '../../../../hooks/LCL/RateDetails/useRateDetails';
import { CargoMetrics, RateDetailsFormData } from 'phoenix-common-react';
import { RateDetails } from 'phoenix-common-react';
import { useEffect } from 'react';

type Props = {
  moduleType: string;
  cargoMetrics?: CargoMetrics;
  rateDetails: ReturnType<typeof useRateDetails>;
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (formData: RateDetailsFormData) => void;
  shippingType?: string;
  shipmentDirection?: string;
  showBannerError?: (messages: string[], autoHideMs?: number, variant?: 'bar' | 'modal') => void;
};

const QuoteRateDetails = ({
  moduleType,
  rateDetails,
  cargoMetrics,
  onRegisterFields,
  onFieldsChange,
  shippingType,
  shipmentDirection,
  showBannerError,
}: Props) => {
  const { defaultState, formData, handlers, resetKey } = rateDetails;

  useEffect(() => {
    defaultState.setEquipmentDetailsList?.([
      {
        label: 'Select',
        value: '',
      },
    ]);
  }, []);

  return (
    <RateDetails
      key={resetKey}
      moduleType={moduleType}
      defaultState={defaultState}
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
      cargoMetrics={cargoMetrics}
      formData={formData}
      handlers={handlers}
      shippingType={shippingType}
      shipmentDirection={shipmentDirection}
      showBannerError={showBannerError}
    />
  );
};

export default QuoteRateDetails;
