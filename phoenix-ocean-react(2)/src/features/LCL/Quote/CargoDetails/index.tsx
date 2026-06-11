import { useEffect } from 'react';
import { CargoDetails as CargoDetailsSection, RoutingRefs } from 'phoenix-common-react';
import { useCargoDetails } from '@/hooks/LCL/CargoDetails/useCargodetails';

type Props = {
  moduleType: string;
  cargoDetails: ReturnType<typeof useCargoDetails>;
  onRegisterFields: (fields: string[]) => void;
  onFieldsChange: (formData: any) => void;
  shippingType?: string;
  rateDetails?: any;
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLInputElement>,
    ref?: React.MutableRefObject<HTMLInputElement | null>,
    accordionId?: number,
    openOnTab?: boolean,      // open accordion when Tab pressed
    openOnShiftTab?: boolean
  ) => void;
  routingRef?: RoutingRefs;
  onBlur?: (numberOfContainer: string, containerType: string, index: number, changedField: "numberOfContainer" | "containerType") => void
};

const QuoteCargoDetails = ({ cargoDetails, onRegisterFields, onFieldsChange, shippingType = 'L', rateDetails, onKeyDown, routingRef, onBlur, moduleType }: Props) => {
  const {
    activeTab,
    setActiveTab,
    cargoState,
    cargoHandlers,
    customsState,
    customsHandlers,
    lotState,
    lotHandlers,
    lotRows,
    oldInternalComment,
    instructionState,
    instructionHandlers,
    flagState,
    flagHandlers,
    cbmDialogState,
    cbmDialogHandlers,
    packagingOptions,
    imoClassOptions,
    standardDimensionPreset,
    hasStandardDimensions,
    commodityOptions,
    containerTypeSelect,
    fclhazardousSelect,
  } = cargoDetails;

  useEffect(() => {
    onFieldsChange({
      cargoState,
      flagState,
      lotState,
      instructionState,
      allLotRows: lotRows,
      oldInternalComment,
    });
  }, [cargoState, flagState, lotState, instructionState, lotRows, oldInternalComment, onFieldsChange]);
  return (
    <CargoDetailsSection
      moduleCode={moduleType}
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
      standardDimensionPreset={standardDimensionPreset}
      hasStandardDimensions={hasStandardDimensions}
      onRegisterFields={onRegisterFields}
      commodityOptions={commodityOptions}
      shippingType={shippingType}
      containerTypeSelect={containerTypeSelect}
      fclhazardousSelect={fclhazardousSelect}
      onKeyDown={onKeyDown}
      routingRef={routingRef}
      onBlur={onBlur}
    />
  );
};

export default QuoteCargoDetails;
