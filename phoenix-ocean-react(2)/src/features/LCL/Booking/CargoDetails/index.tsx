import { CargoDetails as CargoDetailsSection } from 'phoenix-common-react';
import type { useCargoDetails } from '@/hooks/LCL/CargoDetails/useCargodetails';

type Props = {
  cargoDetails:     ReturnType<typeof useCargoDetails>;
  onRegisterFields: (fields: string[]) => void;
  onFieldsChange: (formData: unknown) => void;
  moduleType: string;
  rateDetails?: any;
  // PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel
  shippingType?: string;
  containerTypeSelect?: any;
  fclhazardousSelect?: any;
  routingRef?: any;
  onBlur?: any;
  // PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel
};

const CargoDetails = ({
  cargoDetails,
  onRegisterFields,
  onFieldsChange,
  moduleType,
  rateDetails,
  // PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel
  shippingType,
  containerTypeSelect,
  fclhazardousSelect,
  routingRef,
  onBlur,
  // PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel
}: Props) => {
  const {
    activeTab,
    setActiveTab,
    cargoState,
    cargoHandlers,
    customsState,
    customsHandlers,
    lotState,
    lotHandlers,
    instructionState,
    instructionHandlers,
    flagState,
    flagHandlers,
    cbmDialogState,
    cbmDialogHandlers,
    packagingOptions,
    imoClassOptions,
    commodityOptions,
    standardDimensionPreset,
    hasStandardDimensions,
    isTrkEnabled,
    dimensionFlags
  } = cargoDetails;

  return (
    <CargoDetailsSection
      moduleType={moduleType}
      rateDetails={rateDetails}
      activeTab={activeTab}
      onTabChange={setActiveTab}
      cargoState={cargoState}
      cargoHandlers={cargoHandlers}
      customsState={customsState}
      customsHandlers={customsHandlers}
      lotState={lotState}
      lotHandlers={lotHandlers}
      instructionState={instructionState}
      instructionHandlers={instructionHandlers}
      flagState={flagState}
      flagHandlers={flagHandlers}
      cbmDialogState={cbmDialogState}
      cbmDialogHandlers={cbmDialogHandlers}
      packagingOptions={packagingOptions}
      imoClassOptions={imoClassOptions}
      commodityOptions={commodityOptions}
      standardDimensionPreset={standardDimensionPreset}
      hasStandardDimensions={hasStandardDimensions}
      moduleCode={moduleType}
      onRegisterFields={onRegisterFields}
      onFieldsChange={onFieldsChange}
      isTrkEnabled={isTrkEnabled}
      dimensionFlags={dimensionFlags}
      // PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel
      shippingType={shippingType}
      containerTypeSelect={containerTypeSelect}
      fclhazardousSelect={fclhazardousSelect}
      routingRef={routingRef}
      onBlur={onBlur}
      // PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel
    />
  );
};

export default CargoDetails;
