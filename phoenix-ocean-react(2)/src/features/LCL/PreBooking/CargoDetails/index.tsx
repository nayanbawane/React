import { CargoDetails } from 'phoenix-common-react';
import { useCargoDetails } from '@/hooks/LCL/CargoDetails/useCargodetails';

interface Props {
  cargo: ReturnType<typeof useCargoDetails>;
}

const PreBookingCargoDetails = ({ cargo }: Props) => {
  return (
    <CargoDetails
      activeTab={cargo.activeTab}
      onTabChange={cargo.setActiveTab}
      cargoState={cargo.cargoState}
      cargoHandlers={cargo.cargoHandlers}
      customsState={cargo.customsState}
      customsHandlers={cargo.customsHandlers}
      lotState={cargo.lotState}
      lotHandlers={cargo.lotHandlers}
      instructionState={cargo.instructionState}
      instructionHandlers={cargo.instructionHandlers}
      flagState={cargo.flagState}
      flagHandlers={cargo.flagHandlers}
      cbmDialogState={cargo.cbmDialogState}
      cbmDialogHandlers={cargo.cbmDialogHandlers}
      packagingOptions={cargo.packagingOptions}
      imoClassOptions={cargo.imoClassOptions}
      commodityOptions={cargo.commodityOptions}
    />
  );
};

export default PreBookingCargoDetails;
