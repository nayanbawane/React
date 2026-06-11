import { CfsCargoRow } from 'phoenix-common-react';
import type { useCfsCargoDetails } from '@/hooks/LCL/CfsCargoDetails/useCfsCargoDetails';

type Props = {
  cfsCargoDetails: ReturnType<typeof useCfsCargoDetails>;
  rateDetails?: unknown;
  referenceNumber?: number;
};

const CfsCargoDetails = ({ cfsCargoDetails, rateDetails, referenceNumber }: Props) => {
  const { cargoRows, updateCargoField, blurCargoField, addNewCargo, removeCargo, packagingOptions } = cfsCargoDetails;

  return (
    <CfsCargoRow
      cargoRows={cargoRows}
      updateCargoField={updateCargoField}
      blurCargoField={blurCargoField}
      removeCargo={removeCargo}
      addNewCargo={addNewCargo}
      packagingOptions={packagingOptions}
      rateDetails={rateDetails}
      referenceNumber={referenceNumber}
      moduleCode="BKG"
    />
  );
};

export default CfsCargoDetails;
