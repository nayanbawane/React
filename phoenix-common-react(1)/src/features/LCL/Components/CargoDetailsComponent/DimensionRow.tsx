import { Box, Button, FormControl} from '@mui/material';
import { useRef } from 'react';
import { PSelect, PToggleButton, PNumberField, PTextField } from 'phoenix-react-lib';
import styles from '../../../../styles/LCL/DimensionRow.module.css';
import type { DimensionRowProps } from '@/types/LCL/cargo/CargoDetails.types';
import {
  STACKING_OPTIONS,
  FIELD_LABELS,
} from '../../../../types/LCL/cargo/FixData';

export default function DimensionRow(props: DimensionRowProps) {
  const {
    row,
    onChange,
    onBlurField,
    onRemove,
    onAdd,
    isFirst = false,
    showStackingType = true,
    pkgTypeOptions: _pkgTypeOptions = [],
    hasStandardDimensions = false,
    isDefaultDimActive = false,
    onToggleDefaultDim,
    isTrucking = false,
    isTrkEnabled = false,
    dimensionFlags = false,
    rateDetails,
    showActions = true, // PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
  } = props;

  const triggerAccurateOrConfirm = rateDetails?.accurateRate?.triggerAccurateOrConfirm;
  const isAccurateRatingType = rateDetails?.defaultState?.isAccurateServiceActive ?? false;

  const lastSentLengthRef = useRef<unknown>(null);
  const lastSentWidthRef = useRef<unknown>(null);
  const lastSentHeightRef = useRef<unknown>(null);
  const lastSentPiecesRef = useRef<unknown>(null);
  const lastSentKgRef = useRef<unknown>(null);
  const lastSentLbsRef = useRef<unknown>(null);

  const dimRefMap: Record<string, React.MutableRefObject<unknown>> = {
    length: lastSentLengthRef,
    width: lastSentWidthRef,
    height: lastSentHeightRef,
  };

  const getStackingValue = (value: string) => {
  if (!value) return '-1';

  const matched = STACKING_OPTIONS.find(
    (opt) =>
      opt.value === value ||
      opt.label === value
  );

  return matched?.value || '-1';
};

  return (
    <Box className={styles.cargoDimRow}>
      {(['length', 'width', 'height'] as const).map((f) => (
        <Box key={f} className={styles.dimCol}>
          {/* {isFirst && (
            <Box component="span" className={styles.dimColLabel}>
              {FIELD_LABELS[f]}
            </Box>
          )} */}
           <PNumberField
             label={isFirst && FIELD_LABELS[f]}
             required={dimensionFlags}
             size="small"
             value={row[f]}
             onChange={(value: string | number) =>
               onChange(f, value)
             }
             onBlur={() => {
               onBlurField?.(f, String(row[f]));
               const lastRef = dimRefMap[f];
               if (isAccurateRatingType && lastRef && row[f] !== lastRef.current) {
                 lastRef.current = row[f];
                 triggerAccurateOrConfirm?.();
               }
             }}
             className={`${styles.dimTf} ${dimensionFlags ? styles.requiredField : ''}`}
             disabled={isDefaultDimActive}
           />
        </Box>
      ))}
      <Box className={styles.dimRowSel66}>
        {/* {isFirst && (
          <Box component="span" className={styles.dimColLabel}>
            Unit
          </Box>
        )} */}
        <FormControl className={styles.dimRowSelectWrap}>
          <PSelect
            label={isFirst && 'Unit'}
            size="small"
            required={dimensionFlags}
            value={row.unit}
            onChange={(value) => {
              const unitChanged = value !== row.unit;
              onChange('unit', value);
              if (isAccurateRatingType && unitChanged) triggerAccurateOrConfirm?.();
            }}
            options={['Inches', 'Centimeters', 'Feet', 'Meters'].map((o) => ({
              label: o,
              value: o,
            }))}
            className={styles.dimRowSelectWrap}
            disabled={isDefaultDimActive}
          />
        </FormControl>
      </Box>
      <Box className={styles.dimCol}>
        {/* {isFirst && (
          <Box component="span" className={styles.dimColLabel}>
            Pieces
          </Box>
        )} */}
         <PNumberField
           size="small"
           label={isFirst && 'Pieces'}
           required={dimensionFlags}
           value={row.pieces}
           onChange={(value: string | number) =>
             onChange('pieces', value)
           }
           onBlur={() => {
             onBlurField?.('pieces', String(row.pieces));
             if (isAccurateRatingType && row.pieces !== lastSentPiecesRef.current) {
               lastSentPiecesRef.current = row.pieces;
               triggerAccurateOrConfirm?.();
             }
           }}
           className={`${styles.dimTf} ${dimensionFlags ? styles.requiredField : ''}`}
           disabled={isDefaultDimActive}
         />
      </Box>
      {(['cbm', 'cbf', 'kg', 'lbs', 'cls'] as const)
        .filter((f) => {
          if (f === 'cls') {
            return isTrkEnabled;
          } else return true;
        })
        .map((f) => (
          <Box key={f} className={styles.dimColWide}>
            {/* {isFirst && (
              <Box component="span" className={styles.dimColLabel}>
                {FIELD_LABELS[f]}
              </Box>
            )} */}
             {f === 'cls' ? (
               <PTextField
                 size="small"
                 label={isFirst && FIELD_LABELS[f]}
                 value={row[f]}
                 onChange={() => {}}
                 className={styles.dimTfWide}
                 disabled
               />
             ) : (
               <PNumberField
                 size="small"
                 label={isFirst && FIELD_LABELS[f]}
                 required={dimensionFlags}
                 value={row[f]}
                 onChange={(value: string | number) => {
                   if ('cbm' === f || f === 'cbf') return;
                   onChange(f, value);
                 }}
                 onBlur={() => {
                   if (f === 'kg' || f === 'lbs') onBlurField?.(f, String(row[f]));
                   const lastRef = f === 'kg' ? lastSentKgRef : f === 'lbs' ? lastSentLbsRef : null;
                   if (isAccurateRatingType && lastRef && row[f] !== lastRef.current) {
                     lastRef.current = row[f];
                     triggerAccurateOrConfirm?.();
                   }
                 }}
                 className={`${styles.dimTfWide} ${dimensionFlags ? styles.requiredField : ''}`}
                 disabled={isDefaultDimActive || 'cbm' === f || f === 'cbf'}
               />
             )}
          </Box>
        ))}
      {/* // PHX-131742: FCL Booking: cargo details section changes - Commented by dhapatel */}
      {/* {!isTrucking && (
        <Box className={styles.dimColActions}>
          {isFirst && (
            <Box component="span" className={styles.dimColLabel}>
              &nbsp;
            </Box>
          )}
          <Box className={styles.cargoDimRowActions}>
            <Button
              className={styles.btnPlus}
              onClick={onAdd}
              disabled={isDefaultDimActive}
            >
              +
            </Button>
            <Button
              className={styles.btnMinus}
              onClick={onRemove}
              disabled={isDefaultDimActive}
            >
              −
            </Button>
          </Box>
        </Box>
      )} */}

      {/* // PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel */}
      {showActions && !isTrucking && (
        <Box className={styles.dimColActions}>
          {isFirst && (
            <Box component="span" className={styles.dimColLabel}>
              &nbsp;
            </Box>
          )}
          <Box className={styles.cargoDimRowActions}>
            <Button
              className={styles.btnPlus}
              onClick={onAdd}
              disabled={isDefaultDimActive}
            >
              +
            </Button>
            <Button
              className={styles.btnMinus}
              onClick={onRemove}
              disabled={isDefaultDimActive}
            >
              −
            </Button>
          </Box>
        </Box>
      )}
      
      <Box className={styles.dimToggleWrap}>
        {isFirst && (
          <Box component="span" className={styles.dimColLabel}>
            Stackable
          </Box>
        )}
        <Box
          className={isDefaultDimActive ? styles.fieldGroupDisabled : undefined}
        >
          <PToggleButton
            value={row.stackable !== 'No'}
            onChange={(val: boolean) =>
              onChange('stackable', val ? 'Yes' : 'No')
            }
            fullWidth={true}
          />
        </Box>
      </Box>
      <Box className={styles.dimRowSel100}>
        {/* {isFirst && (
          <Box component="span" className={styles.dimColLabel}>
            Shipment Type
          </Box>
        )} */}
        <FormControl className={styles.dimRowSelectWrap}>
          <PSelect
            size="small"
            label={isFirst && 'Shipment Type'}
            value={row.shipmentType}
            onChange={(value) => onChange('shipmentType', value)}
            options={['LTL', 'FTL'].map((o) => ({ label: o, value: o }))}
            className={styles.dimRowSelectWrap}
            disabled
          />
        </FormControl>
      </Box>
      {/* <Box className={styles.dimRowSel100}> */}
      {/* {isFirst && (
          <Box component="span" className={styles.dimColLabel}>
            Tailer Type
          </Box>
        )} */}
      {/* <FormControl className={styles.dimRowSelectWrap}>
          <PSelect
            size="small"
            label="Tailer Type"
            value={row.shipmentType}
            onChange={(value) => onChange('tailerType', value)}
            options={[].map((o) => ({ label: o, value: o }))}
            className={styles.dimRowSelectWrap}
            disabled={isDefaultDimActive}
          />
        </FormControl> */}
      {/* </Box> */}
      {showStackingType && (
        <Box className={styles.dimRowSel128}>
          {/* {isFirst && (
            <Box component="span" className={styles.dimColLabel}>
              Stacking Type
            </Box>
          )} */}
          <FormControl className={styles.dimRowSelectWrap}>
            <PSelect
              size="small"
              label={isFirst && 'Stacking Type'}
              value={getStackingValue(row.stackingType)}
              onChange={(value) => onChange('stackingType', value)}
              options={STACKING_OPTIONS}
              className={styles.dimRowSelectWrap}
              disabled={isDefaultDimActive}
            />
          </FormControl>
        </Box>
      )}

      {hasStandardDimensions && !isTrucking &&  (
        <Box className={styles.dimDefaultDimWrap}>
           {isFirst && (
            <Box component="span" className={styles.dimColLabel}>
              Default Dimensions
            </Box>
          )}
          {isFirst && (
            <PToggleButton
              // label="Default Dimensions"
              value={isDefaultDimActive}
              onChange={(val: boolean) => onToggleDefaultDim?.(val)}
              fullWidth={true}
            />
          )}
        </Box>
      )}
      {isTrucking && (
        <Box className={styles.dimColActions}>
          {isFirst && (
            <Box component="span" className={styles.dimColLabel}>
              &nbsp;
            </Box>
          )}
          <Box className={styles.cargoDimRowActions}>
            <Button
              className={styles.btnPlus}
              onClick={onAdd}
              disabled={isDefaultDimActive}
            >
              +
            </Button>
            <Button
              className={styles.btnMinus}
              onClick={onRemove}
              disabled={isDefaultDimActive}
            >
              −
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}
