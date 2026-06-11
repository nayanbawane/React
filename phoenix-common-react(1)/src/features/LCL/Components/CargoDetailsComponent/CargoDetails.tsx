import { Box, Button } from '@mui/material';
import { PModal } from 'phoenix-react-lib';

import { useFeatureToggle } from '../../../../hooks/LCL/useFeatureToggle';
import { CommonToggleKeys } from '../../../../core/featureToggles';

import styles from '../../../../styles/LCL/CargoDetails.module.css';
import Header from './Header';
import ExternalLot from './ExternalLot';
import CargoRow from './CargoRow';
import { CargoDetailsProps } from '@/types/LCL/cargo/CargoDetails.types';
import FCLCargoDetailsSection from './FCLCargoDetailsSection';

import FCLBookingCargoDetailsSection from './FCLBookingCargoDetailsSection'; // PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel


export function CargoDetails({
  activeTab,
  onTabChange,
  cargoState,
  cargoHandlers,
  customsState,
  customsHandlers,
  lotState,
  lotHandlers,
  instructionState,
  instructionHandlers,
  flagState,
  cbmDialogState,
  cbmDialogHandlers,
  hsCodeStrictMode = false,
  packagingOptions = [],
  imoClassOptions = [],
  commodityOptions = [],
  standardDimensionPreset,
  hasStandardDimensions = false,
  referenceNumber,
  rateDetails,
  moduleCode,
  isTrkEnabled = false,
  dimensionFlags,
  shippingType = 'L',
  containerTypeSelect,
  fclhazardousSelect,
  onKeyDown,
  routingRef,
  onBlur
}: CargoDetailsProps) {
  const { isVisible } = useFeatureToggle();
  const showInstructions = flagState?.flags?.instructions ?? false;
  const showMultiLotComments = isVisible(
    CommonToggleKeys.OCEAN_CLP_SHIPMENT_MULTI_LOT_COMMENTS
  );
  const isHazardous = ['Y', 'E', 'L'].includes(cargoState.cargoRows[0].hazardous);
  
  return (
    <Box className={styles.cargoWrapper}>
      {cbmDialogState?.cbmDialogOpen && (
        <PModal
          open={cbmDialogState?.cbmDialogOpen}
          title="Warning"
          isCloseIcon={false}
          width={450}
          height="auto"
          backgroundColor="#ffffff"
          contentSx={{ padding: 0 }}
        >
          <Box className={styles.cbmModalBody}>
            <Box className={styles.cbmModalIcon}>!</Box>
            <Box
              className={styles.cbmModalText}
            >{`The entered CBM exceeds the maximum allowed limit of ${cbmDialogState?.maxCbm}. Do you want to proceed?`}</Box>
          </Box>
          <Box className={styles.cbmModalActions}>
            <Button
              className={styles.dialogBtn}
              onClick={cbmDialogHandlers?.onCbmConfirm}
            >
              Yes
            </Button>
            <Button
              className={styles.dialogBtn}
              onClick={cbmDialogHandlers?.onCbmCancel}
            >
              No
            </Button>
          </Box>
        </PModal>
      )}
      {
        shippingType === "L" && (
          <Header
            statusBtns={flagState?.statusBtns ?? []}
            flags={flagState?.flags ?? {}}
            setFlags={() => { }}
            activeTab={activeTab}
            setActiveTab={onTabChange}
            modulecode={moduleCode}
          />
        )
      }

      <Box className={styles.cargoContent}>
        {activeTab === 'actual' && shippingType === "L" && (
          <CargoRow
            rateDetails={rateDetails}
            cargoRows={cargoState.cargoRows}
            updateCargoField={cargoHandlers.updateCargoField}
            blurCargoField={cargoHandlers.blurCargoField}
            blurDimension={cargoHandlers.blurDimension}
            removeCargo={cargoHandlers.removeCargo}
            addNewCargo={cargoHandlers.addNewCargo}
            updateDimension={cargoHandlers.updateDimension}
            removeDimension={cargoHandlers.removeDimension}
            addDimension={cargoHandlers.addDimension}
            updateHazardous={cargoHandlers.updateHazardous}
            addHazardous={cargoHandlers.addHazardous}
            removeHazardous={cargoHandlers.removeHazardous}
            applyStandardDimensions={cargoHandlers.applyStandardDimensions}
            clearStandardDimensions={cargoHandlers.clearStandardDimensions}
            hsCodeStrictMode={hsCodeStrictMode}
            packagingOptions={packagingOptions}
            imoClassOptions={imoClassOptions}
            commodityOptions={commodityOptions}
            standardDimensionPreset={standardDimensionPreset}
            hasStandardDimensions={hasStandardDimensions}
            isTrkEnabled={isTrkEnabled}
            moduleCode={moduleCode}
            dimensionFlags={dimensionFlags}
            shippingType={shippingType}
          />
        )}
        {/* PHX-131742: FCL Booking: cargo details section changes - Commented by dhapatel */}
        {/* {shippingType === "F" &&
          <FCLCargoDetailsSection
            shippingType={shippingType}
            updateHazardous={(hIdx: number, field: string, value: unknown) =>
              cargoHandlers.updateHazardous(0, hIdx, field, value)
            }
            addHazardous={() => cargoHandlers.addHazardous(0)}
            removeHazardous={(hIdx: number) =>
              cargoHandlers.removeHazardous(0, hIdx)
            }
            hazRows={cargoState.cargoRows[0].hazRows}
            containerTypeSelect={containerTypeSelect}
            fclCargoRow={cargoState.cargoRows[0]}
            updateFCLCargoRows={(field, value) => cargoHandlers.updateCargoField(0, field, value)
            }
            updateContainerData={cargoHandlers.updateContainerData}
            packagingOptions={packagingOptions}
            imoClassOptions={imoClassOptions}
            fclhazardousSelect={fclhazardousSelect}
            onKeyDown={onKeyDown}
            routingRef={routingRef}
            isHazardous={isHazardous}
            onBlur={onBlur}
            onBlurField={(field: string, value: string) =>
              cargoHandlers.blurCargoField(0, field, value)
            }
            rateDetails={rateDetails}
          />
        } */}

        {/* PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel */}
        {shippingType === "F" && (
          moduleCode === "BKG" ? (
            <FCLBookingCargoDetailsSection
              shippingType={shippingType}
              cargoState={cargoState}
              cargoHandlers={cargoHandlers}
              containerTypeSelect={containerTypeSelect}
              packagingOptions={packagingOptions}
              imoClassOptions={imoClassOptions}
              fclhazardousSelect={fclhazardousSelect}
              onKeyDown={onKeyDown}
              routingRef={routingRef}
              onBlur={onBlur}
              rateDetails={rateDetails}
            />
          ) : (
            <FCLCargoDetailsSection
              shippingType={shippingType}
              updateHazardous={(hIdx: number, field: string, value: unknown) =>
                cargoHandlers.updateHazardous(0, hIdx, field, value)
              }
              addHazardous={() => cargoHandlers.addHazardous(0)}
              removeHazardous={(hIdx: number) =>
                cargoHandlers.removeHazardous(0, hIdx)
              }
              hazRows={cargoState.cargoRows[0].hazRows}
              containerTypeSelect={containerTypeSelect}
              fclCargoRow={cargoState.cargoRows[0]}
              updateFCLCargoRows={(field, value) => cargoHandlers.updateCargoField(0, field, value)
              }
              updateContainerData={cargoHandlers.updateContainerData}
              packagingOptions={packagingOptions}
              imoClassOptions={imoClassOptions}
              fclhazardousSelect={fclhazardousSelect}
              onKeyDown={onKeyDown}
              routingRef={routingRef}
              isHazardous={isHazardous}
              onBlur={onBlur}
              onBlurField={(field: string, value: string) =>
                cargoHandlers.blurCargoField(0, field, value)
              }
              rateDetails={rateDetails}
            />
          )
        )}

        {activeTab === 'actual' && showMultiLotComments && shippingType === "L" && (
          <ExternalLot
            lotRows={lotState.lotRows}
            addNewLot={lotHandlers.addNewLot}
            internalComment={instructionState.internalComment}
            setInternalCmt={instructionHandlers.setInternalCmt}
            removeLot={lotHandlers.removeLot}
            updateLotField={lotHandlers.updateLotField}
            loadingInstruction={instructionState.loadingInstruction}
            setLoadingInstruction={instructionHandlers.setLoadingInstruction}
            warehouseInstruction={instructionState.warehouseInstruction}
            setWarehouseInstruction={
              instructionHandlers.setWarehouseInstruction
            }
            showInstructions={showInstructions}
          />
        )}

        {activeTab === 'customsDeclared' && (
          <CargoRow
            cargoRows={customsState.customsRows}
            updateCargoField={customsHandlers.updateCustomsField}
            blurCargoField={customsHandlers.blurCustomsField}
            blurDimension={customsHandlers.blurCustomsDimension}
            removeCargo={customsHandlers.removeCustoms}
            addNewCargo={customsHandlers.addNewCustoms}
            updateDimension={customsHandlers.updateCustomsDimension}
            removeDimension={customsHandlers.removeCustomsDimension}
            addDimension={customsHandlers.addCustomsDimension}
            updateHazardous={customsHandlers.updateCustomsHazardous}
            addHazardous={customsHandlers.addCustomsHazardous}
            removeHazardous={customsHandlers.removeCustomsHazardous}
            applyStandardDimensions={customsHandlers.applyStandardDimensions}
            clearStandardDimensions={customsHandlers.clearStandardDimensions}
            hsCodeStrictMode={hsCodeStrictMode}
            isCustomsDeclared={true}
            packagingOptions={packagingOptions}
            imoClassOptions={imoClassOptions}
            commodityOptions={commodityOptions}
            standardDimensionPreset={standardDimensionPreset}
            hasStandardDimensions={hasStandardDimensions}
            referenceNumber={referenceNumber}
            moduleCode={moduleCode}
            rateDetails={rateDetails}
            isTrkEnabled={isTrkEnabled}
            dimensionFlags={dimensionFlags}
          />
        )}
      </Box>
    </Box>
  );
}

export default CargoDetails;
