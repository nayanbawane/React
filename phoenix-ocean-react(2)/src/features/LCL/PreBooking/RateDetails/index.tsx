import { useRateDetails } from '../../../../hooks/LCL/RateDetails/useRateDetails';
import { CargoMetrics, RateDetailsFormData } from 'phoenix-common-react';
import { RateDetails } from 'phoenix-common-react';
type Props = {
  moduleType: string;
  cargoMetrics?: CargoMetrics;
  rateDetails: ReturnType<typeof useRateDetails>;
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (formData: RateDetailsFormData) => void;
};

const PreBookingRateDetails = ({
  moduleType,
  rateDetails,
  cargoMetrics,
  onRegisterFields,
  onFieldsChange,
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
      formData={formData}
      handlers={handlers}
    />
  );
};

export default PreBookingRateDetails;
