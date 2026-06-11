import { useState, useEffect, useRef } from 'react';
import { Box, Button } from '@mui/material';
import { PSelect, PTextField, PModal, PToggleButton } from 'phoenix-react-lib';
import DimensionRow from '../CargoDetailsComponent/DimensionRow';
import HazardousSection from '../CargoDetailsComponent/HazardousSection';
import type { DimensionRowType, HazardousRowType } from '@/types/LCL/cargo/CargoDetails.types';
import { makeEmptyCargoRow, makeEmptyDimRow, makeEmptyHazRow, HAZARDOUS_OPTIONS } from '../../../../InitialData/LCL';
import { useGetSelections } from '../../../../hooks/LCL/useGetSelections';
import { packagingSelectionConfig } from '../../../../hooks/LCL/selectionHelpers';
import { useFeatureToggle } from '../../../../hooks/LCL/useFeatureToggle';
import { CommonToggleKeys } from '../../../../core/featureToggles';
import styles from '../../../../styles/LCL/TruckingDetails.module.css';
import dimStyles from '../../../../styles/LCL/DimensionRow.module.css';
import cargoStyles from '../../../../styles/LCL/CargoRow.module.css';

type DimRowData  = ReturnType<typeof makeEmptyDimRow>;
type CargoRowData = ReturnType<typeof makeEmptyCargoRow>;

const calcCbm = (row: DimRowData): string => {
    const l = parseFloat(row.length) || 0;
    const w = parseFloat(row.width) || 0;
    const h = parseFloat(row.height) || 0;
    const p = parseFloat(row.pieces) || 0;
    if (!l || !w || !h || !p) return '';
    let lcm = l, wcm = w, hcm = h;
    if (row.unit === 'Inches') { lcm = l * 2.54; wcm = w * 2.54; hcm = h * 2.54; }
    else if (row.unit === 'Feet') { lcm = l * 30.48; wcm = w * 30.48; hcm = h * 30.48; }
    const v = (lcm * wcm * hcm) / 1_000_000 * p;
    return v ? v.toFixed(4) : '';
};

const toCbf = (cbm: string): string => {
    const v = parseFloat(cbm) || 0;
    return v ? (v * 35.3147).toFixed(4) : '';
};

const toCbm = (cbf: string): string => {
    const v = parseFloat(cbf) || 0;
    return v ? (v * 0.0283168).toFixed(4) : '';
};

const toLbs = (kg: string): string => {
    const v = parseFloat(kg) || 0;
    return v ? (v * 2.20462).toFixed(3) : '';
};

const toKg = (lbs: string): string => {
    const v = parseFloat(lbs) || 0;
    return v ? (v * 0.45359237).toFixed(3) : '';
};

const TMS_CLASS_RANGES = [
    { className: '500', min: 0,    max: 1 },
    { className: '400', min: 1,    max: 2 },
    { className: '300', min: 2,    max: 3 },
    { className: '250', min: 3,    max: 4 },
    { className: '200', min: 4,    max: 5 },
    { className: '175', min: 5,    max: 6 },
    { className: '150', min: 6,    max: 7 },
    { className: '125', min: 7,    max: 8 },
    { className: '110', min: 8,    max: 9 },
    { className: '100', min: 9,    max: 10.5 },
    { className: '92.5', min: 10.5, max: 12 },
    { className: '85',  min: 12,   max: 13.5 },
    { className: '77.5', min: 13.5, max: 15 },
    { className: '70',  min: 15,   max: 22.5 },
    { className: '65',  min: 22.5, max: 30 },
    { className: '60',  min: 30,   max: 35 },
    { className: '55',  min: 35,   max: 50 },
    { className: '50',  min: 50,   max: Number.MAX_SAFE_INTEGER },
];

const getTmsClassFromPcf = (pcf: number): string => {
    for (const range of TMS_CLASS_RANGES) {
        if (pcf >= range.min && pcf < range.max) return range.className;
    }
    return '';
};

const calculateTmsClass = (lbs: string, cbf: string): string => {
    const lbsNum = parseFloat(lbs);
    const cbfNum = parseFloat(cbf);
    if (isNaN(lbsNum) || isNaN(cbfNum) || cbfNum === 0) return '';
    return getTmsClassFromPcf(lbsNum / cbfNum);
};

const applyDimCalcs = (row: DimRowData, field: string, value: unknown): DimRowData => {
  const updated = { ...row, [field]: value };
  if (['length', 'width', 'height', 'unit', 'pieces'].includes(field)) {
    const cbm = calcCbm(updated);
    const cbf = toCbf(cbm);
    return { ...updated, cbm, cbf, cls: calculateTmsClass(updated.lbs, cbf) };
  }
  if (field === 'kg') {
    const lbs = toLbs(value as string);
    return { ...updated, lbs, cls: calculateTmsClass(lbs, updated.cbf) };
  }
  if (field === 'lbs') {
    return { ...updated, kg: toKg(value as string), cls: calculateTmsClass(value as string, updated.cbf) };
  }
  if (field === 'cbm') {
    const cbf = toCbf(value as string);
    return { ...updated, cbf, cls: calculateTmsClass(updated.lbs, cbf) };
  }
  if (field === 'cbf') {
    return { ...updated, cbm: toCbm(value as string), cls: calculateTmsClass(updated.lbs, value as string) };
  }
  return updated;
};

const rollUp = (dimRows: DimRowData[]) => {
    const sum = (key: keyof DimRowData) =>
        dimRows.reduce((s, r) => s + (parseFloat(r[key] as string) || 0), 0);
    const fmt3 = (v: number) => (v ? v.toFixed(3) : '');
    const fmt4 = (v: number) => (v ? v.toFixed(4) : '');
    const pieces = sum('pieces');
    return {
        pieces: pieces ? String(pieces) : '',
        kg:  fmt3(sum('kg')),
        lbs: fmt3(sum('lbs')),
        cbm: fmt4(sum('cbm')),
        cbf: fmt4(sum('cbf')),
    };
};

const DEV_PRESET = {
    length: '100', width: '80', height: '60', unit: 'Centimeters',
    pieces: '5', cbm: '0.48', cbf: '16.95', kg: '50', lbs: '110.23',
    stackable: 'Yes', shipmentType: 'LTL', stackingType: 'SD',
};

const getStandardDimensions = () => {
    try {
        const stored = localStorage.getItem('standardDimensionsBean');
        if (stored) {
            const parsed = JSON.parse(stored) as { dimensionMainList?: Array<Record<string, unknown>> };
            const first = parsed?.dimensionMainList?.[0];
            if (first) {
                return {
                    length:       String(first.length       ?? ''),
                    width:        String(first.width        ?? ''),
                    height:       String(first.height       ?? ''),
                    unit:         String(first.unit         ?? 'Inches'),
                    pieces:       String(first.pieces       ?? ''),
                    cbm:          String(first.cbm          ?? ''),
                    cbf:          String(first.cbf          ?? ''),
                    kg:           String(first.kg           ?? ''),
                    lbs:          String(first.lbs          ?? ''),
                    stackable:    String(first.stackable    ?? 'Yes'),
                    shipmentType: String(first.shipmentType ?? ''),
                    stackingType: String(first.StackingType ?? first.stackingType ?? '-1'),
                };
            }
        }
    } catch { }
    return DEV_PRESET;
};

export interface TruckingCargoDetailsProps {
    externalCargoRows?: CargoRowData[];
    onHazardousChange?: (isHazardous: boolean) => void;
    onCargoRowsChange?: (rows: CargoRowData[]) => void;
    isFCLBooking?: boolean;
    fclHazardousOptions?: { label: string; value: string }[];
}

export default function TruckingCargoDetails({
    externalCargoRows,
    onHazardousChange,
    onCargoRowsChange,
    isFCLBooking = false,
    fclHazardousOptions,
}: TruckingCargoDetailsProps) {
    const [cargoRows, setCargoRows] = useState<CargoRowData[]>([makeEmptyCargoRow()]);

    const { isVisible } = useFeatureToggle();
    const showHazardousQty = isVisible(CommonToggleKeys.OCN_SHOW_HAZARDOUS_QAUNTITY);
    const hasStandardDimensions = true;

    const { data: packagingOptions } = useGetSelections(packagingSelectionConfig);

    const hazardousOptions: { label: string; value: string }[] = (() => {
        if (showHazardousQty && isFCLBooking && fclHazardousOptions && fclHazardousOptions.length > 0) {
            return [
                { label: 'Please Select', value: '-1' },
                ...fclHazardousOptions,
            ];
        }
        return HAZARDOUS_OPTIONS.map((v) => ({ label: v.label, value: v.value }));
    })();

    const onCargoRowsChangeRef = useRef(onCargoRowsChange);
    useEffect(() => { onCargoRowsChangeRef.current = onCargoRowsChange; });

    useEffect(() => {
        if (externalCargoRows && externalCargoRows.length > 0){
            if (externalCargoRows[0].dimRows.length <= 0){
                externalCargoRows[0].dimRows = [makeEmptyDimRow()];
            }
            setCargoRows(externalCargoRows);
        }
    }, [externalCargoRows]);

    useEffect(() => {
        onCargoRowsChangeRef.current?.(cargoRows);
    }, [cargoRows]);

    const updateCargoField = (ci: number, field: string, value: unknown) => {
        setCargoRows(rows => rows.map((r, i) => {
            if (i !== ci) return r;
            const updated = { ...r, [field]: value };
            if (field === 'kg')  return { ...updated, lbs: toLbs(value as string) };
            if (field === 'lbs') return { ...updated, kg:  toKg(value as string) };
            if (field === 'cbm') return { ...updated, cbf: toCbf(value as string) };
            if (field === 'cbf') return { ...updated, cbm: toCbm(value as string) };
            return updated;
        }));
        if (field === 'hazardous') {
            const isHaz = (v: string) => v === 'Y - Yes' || v === 'Y';
            const anyHazardous = cargoRows.some((r, i) =>
                i === ci ? isHaz(value as string) : isHaz(r.hazardous)
            );
            onHazardousChange?.(anyHazardous);
        }
    };

    const updateDimension = (ci: number, di: number, field: string, value: unknown) => {
        setCargoRows(rows => rows.map((r, i) => {
            if (i !== ci) return r;
            const newDimRows = r.dimRows.map((d, j) =>
                j !== di ? d : applyDimCalcs(d, field, value)
            );
            return { ...r, dimRows: newDimRows, ...rollUp(newDimRows) };
        }));
    };

    const addDimension = (ci: number) => {
        setCargoRows(rows => rows.map((r, i) =>
            i !== ci ? r : { ...r, dimRows: [...r.dimRows, makeEmptyDimRow()] }
        ));
    };

    const removeDimension = (ci: number, di: number) => {
        setCargoRows(rows => rows.map((r, i) => {
            if (i !== ci) return r;
            if (r.dimRows.length <= 1) return r;
            const newDimRows = r.dimRows.filter((_, j) => j !== di);
            return { ...r, dimRows: newDimRows, ...rollUp(newDimRows) };
        }));
    };

    const updateHazardous = (ci: number, hi: number, field: string, value: unknown) => {
        setCargoRows(rows => rows.map((r, i) =>
            i !== ci ? r : {
                ...r,
                hazRows: r.hazRows.map((h, j) => j !== hi ? h : { ...h, [field]: value }),
            }
        ));
    };

    const addHazardous = (ci: number) => {
        setCargoRows(rows => rows.map((r, i) =>
            i !== ci ? r : { ...r, hazRows: [...r.hazRows, makeEmptyHazRow()] }
        ));
    };

    const removeHazardous = (ci: number, hi: number) => {
        setCargoRows(rows => rows.map((r, i) =>
            i !== ci ? r : {
                ...r,
                hazRows: r.hazRows.length > 1 ? r.hazRows.filter((_, j) => j !== hi) : r.hazRows,
            }
        ));
    };

    const applyStandardDimensions = (ci: number) => {
        const preset = getStandardDimensions();
        if (!preset) return;
        const filledRow = applyDimCalcs(
            applyDimCalcs(
                applyDimCalcs(
                    applyDimCalcs({ ...makeEmptyDimRow(), ...preset }, 'pieces', preset.pieces),
                    'kg', preset.kg
                ),
                'cbm', preset.cbm
            ),
            'lbs', preset.lbs
        );
        setCargoRows(rows => rows.map((r, i) => {
            if (i !== ci) return r;
            const newDimRows = [filledRow];
            return { ...r, useStandardDimensions: true, dimRows: newDimRows, ...rollUp(newDimRows) };
        }));
    };

    const clearStandardDimensions = (ci: number) => {
        setCargoRows(rows => rows.map((r, i) => {
            if (i !== ci) return r;
            const newDimRows = [makeEmptyDimRow()];
            return { ...r, useStandardDimensions: false, dimRows: newDimRows, ...rollUp(newDimRows) };
        }));
    };

    return (
        <>
            {cargoRows.map((cargo, ci) => (
                <TruckingCargoRowItem
                    key={ci}
                    cargo={cargo}
                    onChange={(field, value) => updateCargoField(ci, field, value)}
                    dimRows={cargo.dimRows}
                    onDimChange={(di, field, value) => updateDimension(ci, di, field, value)}
                    onDimAdd={() => addDimension(ci)}
                    onDimRemove={(di) => removeDimension(ci, di)}
                    hazRows={cargo.hazRows}
                    onHazChange={(hi, field, value) => updateHazardous(ci, hi, field, value)}
                    onHazAdd={() => addHazardous(ci)}
                    onHazRemove={(hi) => removeHazardous(ci, hi)}
                    hazardousOptions={hazardousOptions}
                    packagingOptions={packagingOptions}
                    hasStandardDimensions={hasStandardDimensions}
                    isDefaultDimActive={!!cargo.useStandardDimensions}
                    onApplyStandardDimensions={() => applyStandardDimensions(ci)}
                    onClearStandardDimensions={() => clearStandardDimensions(ci)}
                />
            ))}
        </>
    );
}

interface TruckingCargoRowItemProps {
    cargo: CargoRowData;
    onChange: (field: string, value: unknown) => void;
    dimRows: CargoRowData['dimRows'];
    onDimChange: (dimIndex: number, field: string, value: unknown) => void;
    onDimAdd: () => void;
    onDimRemove: (dimIndex: number) => void;
    hazRows: CargoRowData['hazRows'];
    onHazChange: (hazIndex: number, field: string, value: unknown) => void;
    onHazAdd: () => void;
    onHazRemove: (hazIndex: number) => void;
    hazardousOptions: { label: string; value: string }[];
    packagingOptions: { label: string; value: string }[];
    hasStandardDimensions: boolean;
    isDefaultDimActive: boolean;
    onApplyStandardDimensions: () => void;
    onClearStandardDimensions: () => void;
}

function TruckingCargoRowItem({
  cargo,
  onChange,
  dimRows,
  onDimChange,
  onDimAdd,
  onDimRemove,
  hazRows,
  onHazChange,
  onHazAdd,
  onHazRemove,
  hazardousOptions,
  packagingOptions,
  hasStandardDimensions,
  isDefaultDimActive,
  onApplyStandardDimensions,
  onClearStandardDimensions,
}: TruckingCargoRowItemProps) {
  const [showDefaultDimConfirm, setShowDefaultDimConfirm] = useState(false);
  const isHazardous = cargo.hazardous === 'Y - Yes' || cargo.hazardous === 'Y';

  const handleDefaultDimToggle = (active: boolean) => {
    if (!active) {
      onClearStandardDimensions();
      return;
    }
    const hasDimValues = dimRows.some(
      (d) => d.length || d.width || d.height || d.pieces || d.kg || d.lbs
    );
    if (hasDimValues) {
      setShowDefaultDimConfirm(true);
    } else {
      onApplyStandardDimensions();
    }
  };

  return (
    <Box className={styles.cargoRowWrapper}>
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
          <Box className={cargoStyles.warningModalBody}>
            <Box className={cargoStyles.warningModalIcon}>!</Box>
            <Box className={cargoStyles.warningModalText}>
              Applying default dimensions will replace the current values. Do
              you want to proceed?
            </Box>
          </Box>
          <Box className={cargoStyles.warningModalActions}>
            <Button
              className={cargoStyles.dialogBtn}
              onClick={() => {
                onApplyStandardDimensions();
                setShowDefaultDimConfirm(false);
              }}
            >
              Yes
            </Button>
            <Button
              className={cargoStyles.dialogBtn}
              onClick={() => setShowDefaultDimConfirm(false)}
            >
              No
            </Button>
          </Box>
        </PModal>
      )}

      <Box className={styles.cargoMainRow}>
        <Box className={styles.cargoDescCol}>
          <Box component="label" className={styles.cargoFieldLabel}>
            Description of Goods
          </Box>
          <PTextField
            id="description"
            multiline
            rows={4.5}
            value={cargo.description}
            onChange={(e) => onChange('description', e.target.value)}
            className={styles.cargoTextAreaField}
          />
        </Box>

        <Box className={styles.cargoFieldsCol}>
          <Box className={styles.cargoNumFieldsRow}>
            {(
              [
                { id: 'pieces', label: 'Pieces' },
                { id: 'kg', label: 'Kg' },
                { id: 'lbs', label: 'Lbs' },
                { id: 'cbm', label: 'Cbm' },
                { id: 'cbf', label: 'Cbf' },
              ] as const
            ).map(({ id, label }) => (
              <Box key={id} className={styles.cargoNumFieldBox}>
                <Box component="label" className={styles.cargoFieldLabel}>
                  {label}
                </Box>
                {/*@ts-ignore*/}
                <PTextField
                  id={id}
                  type="number"
                  value={cargo[id]}
                  onChange={(e) => onChange(id, e.target.value)}
                  className={styles.cargoNumField}
                />
              </Box>
            ))}
          </Box>

          <Box className={styles.cargoSelectsRow}>
            <Box className={styles.cargoPackagingBox}>
              <Box component="label" className={styles.cargoFieldLabel}>
                Packaging
              </Box>
              <PSelect
                id="packaging"
                value={cargo.packaging}
                options={packagingOptions}
                onChange={(value) => {
                  onChange('packaging', value);
                  if (value !== 'Please Select') {
                    onChange('description', value);
                  }
                }}
                className={styles.cargoSelectField}
              />
            </Box>
            <Box className={styles.cargoHazardousBox}>
              <Box component="label" className={styles.cargoFieldLabel}>
                Hazardous
              </Box>
              <PSelect
                id="hazardous"
                value={cargo.hazardous}
                options={hazardousOptions}
                onChange={(value) => onChange('hazardous', value)}
                className={styles.cargoSelectField}
              />
            </Box>
            {hasStandardDimensions && (
              <Box className={styles.dimDefaultDimWrap}>
                <Box component="span" className={styles.dimColLabel}>
                  Default Dimensions
                </Box>
                <PToggleButton
                  value={isDefaultDimActive}
                  onChange={(val: boolean) => handleDefaultDimToggle?.(val)}
                  fullWidth={true}
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Box className={dimStyles.cargoDimSection}>
        {dimRows.map((row, idx) => (
          <DimensionRow
            key={idx}
            row={
              {
                stackable: 'Yes',
                tailerType: '',
                ...row,
              } as unknown as DimensionRowType
            }
            isFirst={idx === 0}
            onChange={(f: string, v: unknown) => onDimChange(idx, f, v)}
            onRemove={() => onDimRemove(idx)}
            onAdd={onDimAdd}
            showStackingType={false}
            hasStandardDimensions={false}
            isTrucking={true}
            isTrkEnabled={true}
          />
        ))}
      </Box>

      {isHazardous && hazRows && (
        <HazardousSection
          rows={hazRows as unknown as HazardousRowType[]}
          onChange={onHazChange}
          onAdd={onHazAdd}
          onRemove={onHazRemove}
          shippingType=""
        />
      )}
    </Box>
  );
}
