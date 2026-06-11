import { useRateDetails } from '../../../../hooks/LCL/RateDetails/useRateDetails';
import { CargoMetrics, RateDetailsFormData } from 'phoenix-common-react';
import { RateDetails } from 'phoenix-common-react';
type Props = {
  moduleType: string;
  cargoMetrics?: CargoMetrics;
  pickupCargoMetricsMap?: Record<string, CargoMetrics>;
  rateDetails: ReturnType<typeof useRateDetails>;
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (formData: RateDetailsFormData) => void;
  shippingType?: string;
};

const BookingRateDetails = ({
  moduleType,
  rateDetails,
  cargoMetrics,
  pickupCargoMetricsMap,
  onRegisterFields,
  onFieldsChange,
  shippingType,
}: Props) => {
  const { defaultState, formData, handlers, resetKey } = rateDetails;

  return (
    <RateDetails
      key={resetKey}
      moduleType={moduleType}
      defaultState={defaultState}
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
      cargoMetrics={cargoMetrics}
      pickupCargoMetricsMap={pickupCargoMetricsMap}
      formData={formData}
      handlers={handlers}
      shippingType={shippingType}
    />
  );
};

export default BookingRateDetails;
