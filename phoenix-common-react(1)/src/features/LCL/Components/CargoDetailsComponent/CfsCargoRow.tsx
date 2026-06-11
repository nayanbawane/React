import { useRef, useState } from 'react';
import { Box, Button, Divider } from '@mui/material';

import { useFeatureToggle } from '../../../../hooks/LCL/useFeatureToggle';
import { CommonToggleKeys } from '../../../../core/featureToggles';
import { useGetSelections } from '../../../../hooks/LCL/useGetSelections';
import { bookingDocumentReferenceConfig } from '../../../../hooks/LCL/selectionHelpers';
import { PSelect, PTextField, PModal, PToggleButton, PNumberField } from 'phoenix-react-lib';

import styles from '../../../../styles/LCL/CargoRow.module.css';
import { CargoRowType, SelectOption } from '@/types/LCL/cargo/CargoDetails.types';

export default function CfsCargoRow({
  cargoRows,
  updateCargoField,
  blurCargoField,
  removeCargo,
  addNewCargo,
  hsCodeStrictMode = false,
  isCustomsDeclared = false,
  packagingOptions = [],
  referenceNumber,
  moduleCode = '',
  rateDetails,
  isTrkEnabled = false,
}: {
  cargoRows: CargoRowType[];
  updateCargoField: (idx: number, field: string, value: unknown) => void;
  blurCargoField?: (idx: number, field: string, value: string) => void;
  removeCargo: (idx: number) => void;
  addNewCargo: () => void;
  hsCodeStrictMode?: boolean;
  isCustomsDeclared?: boolean;
  packagingOptions?: SelectOption[];
  referenceNumber?: number;
  moduleCode?: string;
  rateDetails: unknown;
  isTrkEnabled?: boolean;
}) {
  return (
    <>
      {cargoRows.map((cargo, cargoIndex) => (
        <CfsCargoRowItem
          key={cargoIndex}
          rateDetails={rateDetails}
          cargo={cargo}
          cargoIndex={cargoIndex}
          onChange={(field: string, value: unknown) => updateCargoField(cargoIndex, field, value)}
          onBlurField={(field, value) => blurCargoField?.(cargoIndex, field, value)}
          onAdd={addNewCargo}
          onRemove={() => removeCargo(cargoIndex)}
          hsCodeStrictMode={hsCodeStrictMode}
          isCustomsDeclared={isCustomsDeclared}
          referenceNumber={referenceNumber}
          moduleCode={moduleCode}
          packagingOptions={packagingOptions}
          isTrkEnabled={isTrkEnabled}
        />
      ))}
    </>
  );
}

function CfsCargoRowItem({
  cargo,
  cargoIndex,
  onChange,
  onBlurField,
  onAdd,
  onRemove,
  isCustomsDeclared = false,
  packagingOptions = [],
  referenceNumber,
  moduleCode = '',
  rateDetails,
}: {
  cargo: CargoRowType;
  cargoIndex: number;
  onChange: (field: string, value: unknown) => void;
  onBlurField?: (field: string, value: string) => void;
  onAdd: () => void;
  onRemove: () => void;
  hsCodeStrictMode: boolean;
  isCustomsDeclared: boolean;
  packagingOptions: SelectOption[];
  referenceNumber?: number;
  moduleCode?: string;
  rateDetails: unknown;
  isTrkEnabled: boolean;
}) {
  const { isVisible } = useFeatureToggle();
  const descRows = isVisible(CommonToggleKeys.OCEAN_QUO_BKG_INCREASE_LINES_OF_DESC_OF_GOODS) ? 12 : 5;
  const showPkgDesc = isVisible(CommonToggleKeys.SHOW_BKG_PACKAGING_DESCRIPTION);
  const [showDialog, setShowDialog] = useState(false);

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

  const accurateRate = (rateDetails as any)?.defaultState?.accurateRate;
  const lastSentKgRef = useRef<unknown>('');
  const lastSentCbmRef = useRef<unknown>('');

  return (
    <Box className={styles.cargoBlock2}>
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

      <Box className={styles.cargoRowInputWrapper2}>
        <Box className={styles.cargoRowColDeliveryId}>
          <Box component="label" className={styles.cargoRowLabel}>
            Delivery ID
          </Box>
          <Box className={styles.cargoRowDeliveryIdValue}>
            {String(cargoIndex + 1).padStart(3, '0')}
          </Box>
        </Box>

        <Box className={`${styles.cargoRowCol} ${styles.cargoRowColMarks}`}>
          <Box component="label" className={styles.cargoRowLabel}>
            Marks and Numbers
          </Box>
          <PTextField
            id="marks"
            multiline
            rows={3}
            onChange={(e) => onChange('marks', e.target.value)}
            value={cargo.marks}
          />
        </Box>

        <Box className={`${styles.cargoRowCol} ${styles.cargoRowColPieces}`}>
          <Box component="label" className={styles.cargoRowLabel}>
            Pieces
          </Box>
          <PTextField
            id="pieces"
            onChange={(e) => onChange('pieces', e.target.value)}
            value={cargo.pieces}
            type="number"
          />
        </Box>

        <Box className={styles.cargoRowCol}>
          <Box component="label" className={styles.cargoRowLabel}>
            Packaging
          </Box>
          <PSelect
            id="packaging"
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
                    packagingOptions.find((o) => o.value === val)?.label ?? '';
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
              <Box component="label" className={styles.cargoRowLabel}>
                Document Reference
              </Box>
              <PSelect
                id="docRef"
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

        <Box className={`${styles.cargoRowCol} ${styles.cargoRowColDesc}`}>
          <Box component="label" className={styles.cargoRowLabel}>
            Description of Goods
          </Box>
          <PTextField
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

        <Box className={`${styles.cargoRowCol} ${styles.cargoRowColWeight}`}>
          <Box component="label" className={styles.cargoRowWeightLabel}>
            Kg
          </Box>
          <PNumberField
            id="kg"
            value={cargo.kg}
            onChange={(val) => onChange('kg', val)}
            maxLength={10}
            minLength={0}
            inputModeType="decimal"
            onBlur={() => {
              onBlurField?.('kg', cargo.kg);
              if (cargo.kg !== lastSentKgRef.current) {
                lastSentKgRef.current = cargo.kg;
                accurateRate?.handleAccurateRate();
              }
            }}
          />
          <Box component="label" className={styles.cargoRowWeightLabel}>
            Cbm
          </Box>
          <PNumberField
            id="cbm"
            value={cargo.cbm}
            onChange={(val) => onChange('cbm', val)}
            maxLength={10}
            minLength={0}
            inputModeType="decimal"
            onBlur={() => {
              onBlurField?.('cbm', cargo.cbm);
              if (cargo.cbm !== lastSentCbmRef.current) {
                lastSentCbmRef.current = cargo.cbm;
                accurateRate?.handleAccurateRate();
              }
            }}
          />
        </Box>

        <Box className={`${styles.cargoRowCol} ${styles.cargoRowColWeight}`}>
          <Box component="label" className={styles.cargoRowWeightLabel}>
            Lbs
          </Box>
          <PNumberField
            id="lbs"
            value={cargo.lbs}
            onChange={(val) => onChange('lbs', val)}
            maxLength={10}
            minLength={0}
            inputModeType="decimal"
            onBlur={() => onBlurField?.('lbs', cargo.lbs)}
          />
          <Box component="label" className={styles.cargoRowWeightLabel}>
            Cbf
          </Box>
          <PNumberField
            id="cbf"
            value={cargo.cbf}
            onChange={(val) => onChange('cbf', val)}
            maxLength={10}
            minLength={0}
            inputModeType="decimal"
            onBlur={() => onBlurField?.('cbf', cargo.cbf)}
          />
        </Box>

        <Box className={styles.cargoRowActionsWrapper}>
          <Box className={styles.cargoRowActionsBox}>
            <Button
              id="add-cargo"
              className={styles.cargoRowActionBtn}
              onClick={onAdd}
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
    </Box>
  );
}
