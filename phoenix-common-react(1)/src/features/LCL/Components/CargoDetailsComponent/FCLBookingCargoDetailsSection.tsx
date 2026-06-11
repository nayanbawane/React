// PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
import React from 'react';
import { Box } from '@mui/material';
import FCLBookingCargoRow from './FCLBookingCargoRow';
import styles from '../../../../styles/LCL/FCLBookingCargoDetails.module.css';
import { CargoRowType, SelectOption } from '@/types/LCL/cargo/CargoDetails.types';

interface FCLBookingCargoDetailsSectionProps {
  shippingType: string;
  cargoState: {
    cargoRows: CargoRowType[];
  };
  cargoHandlers: {
    updateCargoField: (cargoIndex: number, field: string, value: unknown) => void;
    blurCargoField: (cargoIndex: number, field: string, value: string) => void;
    addNewCargo: () => void;
    removeCargo: (cargoIndex: number) => void;
    updateHazardous: (cargoIndex: number, hazIndex: number, field: string, value: unknown) => void;
    addHazardous: (cargoIndex: number) => void;
    removeHazardous: (cargoIndex: number, hazIndex: number) => void;
    updateDimension: (cIdx: number, dIdx: number, field: any, value: unknown) => void;
    addDimension: (cIdx: number) => void;
    removeDimension: (cIdx: number, dIdx: number) => void;
    blurDimension?: (cIdx: number, dIdx: number, field: string, value: string) => void;
  };
  
  containerTypeSelect: SelectOption[];
  packagingOptions?: SelectOption[];
  imoClassOptions?: SelectOption[];
  fclhazardousSelect: SelectOption[];
  onKeyDown?: (
    event: React.KeyboardEvent<HTMLInputElement>,
    ref?: React.MutableRefObject<HTMLInputElement | null>,
    accordionId?: number,
    openOnTab?: boolean,
    openOnShiftTab?: boolean
  ) => void;
  routingRef: any;
  onBlur?: (
    numberOfContainer: string,
    containerType: string,
    index: number,
    changedField: 'numberOfContainer' | 'containerType'
  ) => void;
  rateDetails: any;
}

const FCLBookingCargoDetailsSection: React.FC<FCLBookingCargoDetailsSectionProps> = ({
  shippingType,
  cargoState,
  cargoHandlers,
  containerTypeSelect,
  packagingOptions = [],
  imoClassOptions = [],
  fclhazardousSelect = [],
  onKeyDown,
  routingRef,
  onBlur,
  rateDetails,
}) => {
  const accurateRate = rateDetails?.accurateRate;
  const triggerAccurateOrConfirm = accurateRate?.triggerAccurateOrConfirm;
  const isAccurateRatingType = rateDetails?.defaultState?.isAccurateServiceActive ?? false;

  const handleAddNewCargo = () => {
    // Restrict to max 3 container rows
    if (cargoState.cargoRows.filter((r) => r.controlFlag !== 'D').length < 3) {
      cargoHandlers.addNewCargo();
    }
  };

  const handleRemoveCargo = (index: number) => {
    if (index !== 0) {
      cargoHandlers.removeCargo(index);
    }
  };

  const updateField = (index: number, field: string, value: any) => {
    cargoHandlers.updateCargoField(index, field, value);
  };

  const blurField = (index: number, field: string, value: string) => {
    cargoHandlers.blurCargoField(index, field, value);
  };

  const onAddHazardousRow = (cargoIndex: number) => {
    cargoHandlers.addHazardous(cargoIndex);
  };

  const onRemoveHazardousRow = (cargoIndex: number, hazIndex: number) => {
    cargoHandlers.removeHazardous(cargoIndex, hazIndex);
  };

  const onChangeHazardousRow = (cargoIndex: number, hazIndex: number, field: string, value: any) => {
    cargoHandlers.updateHazardous(cargoIndex, hazIndex, field, value);
  };

  return (
    <Box className={styles.bookingCargoWrapper}>
      {/* Table Header Row */}
      <Box className={styles.headerRow}>
        <Box className={styles.headerCell}>Equipment Details</Box>
        <Box className={styles.headerCell}>Description of Goods</Box>
        <Box className={styles.headerCell}>Kg</Box>
        <Box className={styles.headerCell}>Cbm</Box>
        <Box className={styles.headerCell}>Lbs</Box>
        <Box className={styles.headerCell}>Cbf</Box>
        <Box className={styles.headerCell}>Hazardous</Box>
        <Box className={styles.headerCell}></Box>
      </Box>

      {/* Cargo Rows */}
      {cargoState.cargoRows.map((row, idx) => {
        if (row.controlFlag === 'D') {
          return null;
        }
        return (
          <FCLBookingCargoRow
            key={idx}
            row={row}
            index={idx}
            containerTypeSelect={containerTypeSelect}
            fclhazardousSelect={fclhazardousSelect}
            packagingOptions={packagingOptions}
            imoClassOptions={imoClassOptions}
            updateField={updateField}
            blurField={blurField}
            onAdd={handleAddNewCargo}
            onRemove={handleRemoveCargo}
            onBlur={onBlur}
            onAddHazardousRow={onAddHazardousRow}
            onRemoveHazardousRow={onRemoveHazardousRow}
            onChangeHazardousRow={onChangeHazardousRow}
            isAccurateRatingType={isAccurateRatingType}
            triggerAccurateOrConfirm={triggerAccurateOrConfirm}
            updateDimension={cargoHandlers.updateDimension}
            addDimension={cargoHandlers.addDimension}
            removeDimension={cargoHandlers.removeDimension}
            blurDimension={cargoHandlers.blurDimension}
            rateDetails={rateDetails}
          />
        );
      })}
    </Box>
  );
};

export default FCLBookingCargoDetailsSection;
// PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
