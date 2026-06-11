import { useEffect, useRef, useState } from 'react';
import { Box, Button, Divider } from '@mui/material';

import { useFeatureToggle } from '../../../../hooks/LCL/useFeatureToggle';
import { CommonToggleKeys } from '../../../../core/featureToggles';
import { useGetSelections } from '../../../../hooks/LCL/useGetSelections';
import { bookingDocumentReferenceConfig } from '../../../../hooks/LCL/selectionHelpers';
import {
  PSelect,
  PTextField,
  PModal,
  PToggleButton,
  PRippleButton,
  PNumberField,
} from 'phoenix-react-lib';

import styles from '../../../../styles/LCL/CargoRow.module.css';
import dimStyles from '../../../../styles/LCL/DimensionRow.module.css';
import DimensionRow from './DimensionRow';
import HazardousSection from './HazardousSection';
import {
  CargoRowProps,
  CargoRowItemProps,
  CargoRowType,
  DimensionRowType,
  HazardousRowType,
  SelectOption,
  StandardDimensionPreset,
} from '@/types/LCL/cargo/CargoDetails.types';

const HAZARDOUS_OPTIONS = [
  { label: 'Please Select', value: '-1' },
  { label: 'Y - Yes', value: 'Y' },
  { label: 'N - No', value: 'N' },
];

export default function CargoRow({
  cargoRows,
  updateCargoField,
  blurCargoField,
  blurDimension,
  removeCargo,
  addNewCargo,
  updateDimension,
  addDimension,
  removeDimension,
  updateHazardous,
  addHazardous,
  removeHazardous,
  applyStandardDimensions,
  clearStandardDimensions,
  hsCodeStrictMode = false,
  isCustomsDeclared = false,
  packagingOptions = [],
  imoClassOptions = [],
  commodityOptions = [],
  standardDimensionPreset,
  hasStandardDimensions = false,
  referenceNumber,
  moduleCode,
  rateDetails,
  isTrkEnabled = false,
  dimensionFlags,
  shippingType,
}: CargoRowProps) {
  return (
    <>
      {cargoRows.map((cargo, cargoIndex) => (
        <CargoRowItem
          key={cargoIndex}
          rateDetails={rateDetails}
          cargo={cargo}
          cargoIndex={cargoIndex}
          onChange={(field: string, value: unknown) =>
            updateCargoField(cargoIndex, field, value)
          }
          onBlurField={(field, value) =>
            blurCargoField?.(cargoIndex, field, value)
          }
          onDimBlur={(dimIdx, field, value) =>
            blurDimension?.(cargoIndex, dimIdx, field, value)
          }
          onAdd={addNewCargo}
          onRemove={() => removeCargo(cargoIndex)}
          dimRows={cargo.dimRows}
          onDimChange={(
            dimIndex: number,
            field: keyof DimensionRowType,
            value: unknown
          ) => updateDimension(cargoIndex, dimIndex, field, value)}
          onDimAdd={() => addDimension(cargoIndex)}
          onDimRemove={(dimIndex: number) =>
            removeDimension(cargoIndex, dimIndex)
          }
          hazRows={cargo.hazRows}
          onHazChange={(hazIndex: number, field: string, value: unknown) =>
            updateHazardous(cargoIndex, hazIndex, field, value)
          }
          onHazAdd={() => addHazardous(cargoIndex)}
          onHazRemove={(hazIndex: number) =>
            removeHazardous(cargoIndex, hazIndex)
          }
          onApplyStandardDimensions={() =>
            applyStandardDimensions?.(cargoIndex)
          }
          onClearStandardDimensions={() =>
            clearStandardDimensions?.(cargoIndex)
          }
          hsCodeStrictMode={hsCodeStrictMode}
          isCustomsDeclared={isCustomsDeclared}
          referenceNumber={referenceNumber}
          moduleCode={moduleCode}
          packagingOptions={packagingOptions}
          imoClassOptions={imoClassOptions}
          commodityOptions={commodityOptions}
          standardDimensionPreset={standardDimensionPreset}
          hasStandardDimensions={hasStandardDimensions}
          isTrkEnabled={isTrkEnabled}
          dimensionFlags={dimensionFlags}
          shippingType={shippingType}
        />
      ))}
    </>
  );
}

function CargoRowItem({
  cargo,
  cargoIndex,
  onChange,
  onBlurField,
  onDimBlur,
  onAdd,
  onRemove,
  dimRows,
  onDimChange,
  onDimAdd,
  onDimRemove,
  hazRows,
  onHazChange,
  onHazAdd,
  onHazRemove,
  onApplyStandardDimensions,
  onClearStandardDimensions,
  hsCodeStrictMode,
  isCustomsDeclared = false,
  packagingOptions = [],
  imoClassOptions = [],
  commodityOptions = [],
  standardDimensionPreset: _standardDimensionPreset,
  hasStandardDimensions = false,
  referenceNumber,
  moduleCode,
  rateDetails,
  isTrkEnabled = false,
  dimensionFlags,
  shippingType,
}: CargoRowItemProps) {
  const isBkg = moduleCode == 'BKG';
  const isPREBKG = moduleCode == 'PREBKG';
  const { isVisible } = useFeatureToggle();
  const descRows = isVisible(
    CommonToggleKeys.OCEAN_QUO_BKG_INCREASE_LINES_OF_DESC_OF_GOODS
  )
    ? 12
    : 5;
  const showPkgDesc = isVisible(
    CommonToggleKeys.SHOW_BKG_PACKAGING_DESCRIPTION
  );
  const [showDialog, setShowDialog] = useState(false);
  const [showDims, setShowDims] = useState(dimRows.length > 0);
  const [showDefaultDimConfirm, setShowDefaultDimConfirm] = useState(false);

  const isStandardDimActive = !!cargo.useStandardDimensions;
  const isShowingDims = showDims || isStandardDimActive;

  useEffect(() => {
    if (dimRows.length > 0) setShowDims(true);
  }, [dimRows.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDefaultDimToggle = (active: boolean) => {
    if (!active) {
      onClearStandardDimensions?.();
      return;
    }
    const hasDimValues = dimRows.some(
      (d) => d.length || d.width || d.height || d.pieces || d.kg || d.lbs
    );
    if (hasDimValues) {
      setShowDefaultDimConfirm(true);
    } else {
      onApplyStandardDimensions?.();
    }
  };
  const {
    data: docRefData,
    loading: docRefLoading,
    refetch: fetchDocRefs,
  } = useGetSelections({
    ...bookingDocumentReferenceConfig(moduleCode, referenceNumber ?? 0),
    autoFetch: false,
  });

  const handleDocRefOpen = () => {
    if (docRefData.length > 0) return;
    fetchDocRefs();
  };

  const accurateRate = rateDetails?.accurateRate;
  const triggerAccurateOrConfirm = accurateRate?.triggerAccurateOrConfirm;
  const isAccurateRatingType =
    rateDetails?.defaultState?.isAccurateServiceActive ?? false;
  const normalizedHazardous = HAZARDOUS_OPTIONS.find((o) => o.label === cargo.hazardous)?.value ?? cargo.hazardous;
  const isHazardous = normalizedHazardous === 'Y';

  const lastSentKgRef = useRef<unknown>('');
  const lastSentCbmRef = useRef<unknown>('');

  if (cargo.controlFlag === 'D') {
    return <></>;
  } else
    return (
      <Box className={styles.cargoBlock}>
        {showDialog && (
          <PModal
            open={showDialog}
            title="Warning"
            isCloseIcon={false}
            width={450}
            height="auto"
            backgroundColor="#ffffff"
            contentSx={{ padding: 0 }}
          >
            <Box className={styles.warningModalBody}>
              <Box className={styles.warningModalIcon}>!</Box>
              <Box className={styles.warningModalText}>
                Are you sure you want to proceed with this action?
              </Box>
            </Box>
            <Box className={styles.warningModalActions}>
              <Button
                className={styles.dialogBtn}
                onClick={() => {
                  onRemove();
                  setShowDialog(false);
                }}
              >
                Yes
              </Button>
              <Button
                className={styles.dialogBtn}
                onClick={() => setShowDialog(false)}
              >
                No
              </Button>
            </Box>
          </PModal>
        )}

        {showDefaultDimConfirm && (
          <PModal
            open={showDefaultDimConfirm}
            title="Default Dimensions"
            isCloseIcon={false}
            width={450}
            height="auto"
            backgroundColor="#ffffff"
            contentSx={{ padding: 0 }}
          >
            <Box className={styles.warningModalBody}>
              <Box className={styles.warningModalIcon}>!</Box>
              <Box className={styles.warningModalText}>
                Applying default dimensions will replace the current values. Do
                you want to proceed?
              </Box>
            </Box>
            <Box className={styles.warningModalActions}>
              <Button
                className={styles.dialogBtn}
                onClick={() => {
                  onApplyStandardDimensions?.();
                  setShowDefaultDimConfirm(false);
                }}
              >
                Yes
              </Button>
              <Button
                className={styles.dialogBtn}
                onClick={() => setShowDefaultDimConfirm(false)}
              >
                No
              </Button>
            </Box>
          </PModal>
        )}

        <Box className={styles.cargoRowInputWrapper}>
          <Box className={`${styles.cargoRowCol} ${styles.cargoRowColMarks}`} data-eservice-field="MARKS_NUMBERS">
            {/* <Box component="label" className={styles.cargoRowLabel}>
            Marks and Numbers
          </Box> */}
            <PTextField
              id="marks"
              label="Marks and Numbers"
              required={isBkg}
              multiline
              rows={3}
              onChange={(e) => onChange('marks', e.target.value)}
              value={cargo.marks}
            />
          </Box>

          <Box
            className={`${styles.cargoRowCol} ${styles.cargoRowColPieces} ${isShowingDims && !isStandardDimActive ? styles.fieldGroupDisabled : ''}`}
           data-eservice-field="NO_OF_PACKAGES">
            {/* <Box component="label" className={styles.cargoRowLabel}>
            Pieces
          </Box> */}
            <PTextField
              id="pieces"
              label="Pieces"
              required={isBkg}
              onChange={(e) => onChange('pieces', e.target.value)}
              value={cargo.pieces}
              type="number"
            />
            {/*{isVisible(CommonToggleKeys.OCEAN_BOOKING_SHOW_SENSITIVE_CARGO) && (*/}
            {!isPREBKG ? (
              <Box className={styles.sensitiveDiv}>
                {/* <Box component="label" className={styles.cargoRowLabel}>
                Sensitive Cargo
              </Box> */}
                <PToggleButton
                  label="Sensitive Cargo"
                  value={cargo.sensitiveCargo}
                  onChange={(val: boolean) => onChange('sensitiveCargo', val)}
                />
              </Box>
            ) : (
              ''
            )}
            {/*// )}*/}
          </Box>
          <Box className={styles.cargoRowCol} data-eservice-field="PACKAGING">
            {/* <Box component="label" className={styles.cargoRowLabel}>
            Packaging
          </Box> */}

            <PSelect
              id="packaging"
              label="Packaging"
              required={!isPREBKG}
              onChange={(value) => {
                const val = value;
                onChange('packaging', val);
                if (showPkgDesc) {
                  const pkgLabels = new Set(
                    packagingOptions
                      .filter((o) => o.value !== '-1')
                      .map((o) => o.label.toUpperCase())
                  );
                  const lines = cargo.description.split('\n');
                  const cleaned = lines
                    .filter((l) => !pkgLabels.has(l.trim().toUpperCase()))
                    .join('\n')
                    .replace(/^\n+/, '');
                  if (val !== '-1') {
                    const label =
                      packagingOptions.find((o) => o.value === val)?.label ??
                      '';
                    onChange(
                      'description',
                      label + (cleaned ? '\n' + cleaned : '')
                    );
                  } else {
                    onChange('description', cleaned);
                  }
                }
              }}
              value={cargo.packaging}
              options={packagingOptions}
              className={styles.cargoRowSelectWrap}
            />
            {isCustomsDeclared && (
              <Box>
                {/* <Box component="label" className={styles.cargoRowLabel}>
                Document Reference
              </Box> */}

                <PSelect
                  id="docRef"
                  label="Document Reference"
                  value={cargo.docRef}
                  options={
                    docRefLoading
                      ? [{ label: 'Loading...', value: cargo.docRef }]
                      : docRefData.length > 0
                        ? docRefData
                        : [{ label: 'Please Select', value: '-1' }]
                  }
                  onChange={(value) => onChange('docRef', value)}
                  onOpen={handleDocRefOpen}
                  className={styles.cargoRowSelectWrap}
                />
              </Box>
            )}
          </Box>

          <Box className={`${styles.cargoRowCol} ${styles.cargoRowColDesc}`} data-eservice-field="DESC_OF_PACKAGE_GOODS">
            {/* <Box component="label" className={styles.cargoRowLabel}>
            Description of Goods
          </Box> */}
            <PTextField
              label="Description of Goods"
              required={isBkg}
              id="description"
              multiline
              rows={3}
              onChange={(e) => {
                const lines = e.target.value.split('\n');
                if (lines.length <= descRows)
                  onChange('description', e.target.value);
              }}
              value={cargo.description}
              slotProps={{ htmlInput: { maxLength: 210 } }}
            />
          </Box>

          <Box
            className={`${styles.cargoRowCol} ${styles.cargoRowColWeight} ${isShowingDims && !isStandardDimActive ? styles.fieldGroupDisabled : ''}`}
          >
            {/* <Box component="label" className={styles.cargoRowWeightLabel}>
            Kg
          </Box> */}
            <Box data-eservice-field="KGS_WEIGHT">
            <PNumberField
                id="kg"
                label="Kg"
                required={!isPREBKG}
                value={cargo.kg}
                onChange={(val) => onChange('kg', val)}
                maxLength={10}
                minLength={0}
                inputModeType="decimal"
                onBlur={() => {
                onBlurField?.('kg', cargo.kg);
                if (isAccurateRatingType && cargo.kg !== lastSentKgRef.current) {
                  lastSentKgRef.current = cargo.kg;
                  triggerAccurateOrConfirm?.();
                }
              }}
              />
            </Box>
          {/* <Box component="label" className={styles.cargoRowWeightLabel}>
            Cbm
          </Box> */}
            <Box data-eservice-field="CBM_MEASUREMENT">
            <PNumberField
                id="cbm"
                label="Cbm"
                required={!isPREBKG}
                value={cargo.cbm}
                onChange={(val) => onChange('cbm', val)}
                maxLength={10}
                minLength={0}
                inputModeType="decimal"
                onBlur={() => {
                onBlurField?.('cbm', cargo.cbm);
                if (isAccurateRatingType && cargo.cbm !== lastSentCbmRef.current) {
                  lastSentCbmRef.current = cargo.cbm;
                  triggerAccurateOrConfirm?.();
                }
              }}
              />
            </Box>
        </Box>

          <Box
            className={`${styles.cargoRowCol} ${styles.cargoRowColWeight} ${isShowingDims && !isStandardDimActive ? styles.fieldGroupDisabled : ''}`}
          >
            {/* <Box component="label" className={styles.cargoRowWeightLabel}>
            Lbs
          </Box> */}
            <Box data-eservice-field="LBS_WEIGHT">
            <PNumberField
                id="lbs"
                label="Lbs"
                required={!isPREBKG}
                value={cargo.lbs}
                onChange={(val) => onChange('lbs', val)}
                maxLength={10}
                minLength={0}
                inputModeType="decimal"
              onBlur={() => onBlurField?.('lbs', cargo.lbs)}
              />
            </Box>
          {/* <Box component="label" className={styles.cargoRowWeightLabel}>
            Cbf
          </Box> */}
            <Box data-eservice-field="CBF_MEASUREMENT">
            <PNumberField
                id="cbf"
                label="Cbf"
                required={!isPREBKG}
                value={cargo.cbf}
                onChange={(val) => onChange('cbf', val)}
                maxLength={10}
                minLength={0}
                inputModeType="decimal"
              onBlur={() => onBlurField?.('cbf', cargo.cbf)}
              />
            </Box>
        </Box>

          <Box className={styles.cargoRowCol}>
            {/* <Box component="label" className={styles.cargoRowLabel}>
            Hazardous
          </Box> */}

            <PSelect
              id="hazardous"
              label="Hazardous"
              // This condition is keep to render the selected value as cargo.hazardous is matching with the label
              value={HAZARDOUS_OPTIONS.find((o) => o.label === cargo.hazardous)?.value ?? cargo.hazardous}
              onChange={(value) => {
                const hazardousChanged = value !== cargo.hazardous;
                onChange('hazardous', value);
                if (value === 'Y' && hazRows.length === 0) onHazAdd();
                if (isAccurateRatingType && hazardousChanged) triggerAccurateOrConfirm?.();
              }}
              options={HAZARDOUS_OPTIONS}
              className={styles.cargoRowSelectWrap}
            />
            <PRippleButton
              active={isShowingDims}
              title={isShowingDims ? 'Hide Dimensions' : 'Add Dimensions'}
              onChange={(next) => {
                if (isStandardDimActive) return;
                if (next && dimRows.length === 0) {
                  onDimAdd();
                }
                setShowDims(next);
              }}
              className={
                isShowingDims
                  ? styles.cargoRowDimTogglex
                  : styles.cargoRowDimToggle
              }
            />
          </Box>

          <Box className={styles.cargoRowActionsWrapper}>
            <Box className={styles.cargoRowActionsBox}>
              <Button
                id="add-cargo"
                className={styles.cargoRowActionBtn}
                onClick={onAdd}
                disabled={!!cargo.useStandardDimensions}
              >
                +
              </Button>
              <Divider className={styles.cargoRowActionDivider} />
              <Button
                className={styles.cargoRowActionBtn}
                onClick={() => {
                  if (cargoIndex !== 0) setShowDialog(true);
                }}
              >
                −
              </Button>
            </Box>
          </Box>
        </Box>

        {isShowingDims && (
          <Box className={dimStyles.cargoDimSection}>
            {dimRows.map((row, idx) => (
              <DimensionRow
                key={idx}
                row={row}
                onChange={(f: keyof DimensionRowType, v: unknown) =>
                  onDimChange(idx, f, v)
                }
                onBlurField={(field, value) => onDimBlur?.(idx, field, value)}
                onRemove={() => onDimRemove(idx)}
                onAdd={onDimAdd}
                isFirst={idx === 0}
                pkgTypeOptions={packagingOptions}
                hasStandardDimensions={hasStandardDimensions}
                isDefaultDimActive={isStandardDimActive}
                onToggleDefaultDim={handleDefaultDimToggle}
                isTrucking={false}
                isTrkEnabled={isTrkEnabled}
                dimensionFlags={dimensionFlags?.[idx]}
                rateDetails={rateDetails}
              />
            ))}
          </Box>
        )}

        {isHazardous && hazRows && (
          <>
            {/* <div style={{ height: "10px" }} /> */}
            <HazardousSection
              rows={hazRows}
              onChange={onHazChange}
              onAdd={onHazAdd}
              onRemove={onHazRemove}
              shippingType={shippingType}
              imoClassOptions={imoClassOptions}
              packagingOptions={packagingOptions}
              commodityOptions={commodityOptions}
            />
          </>
        )}
      </Box>
    );
}
