// PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
import React from 'react';
import { Box, Button } from '@mui/material';
import { PNumberField, PSelect, AutoTextarea, PToggleButton } from 'phoenix-react-lib';
import HazardousSection from './HazardousSection';
import styles from '../../../../styles/LCL/FCLBookingCargoDetails.module.css';
import { CargoRowType, SelectOption, DimensionRowType } from '@/types/LCL/cargo/CargoDetails.types';
import DimensionRow from './DimensionRow';

interface FCLBookingCargoRowProps {
  row: CargoRowType;
  index: number;
  containerTypeSelect: SelectOption[];
  fclhazardousSelect: SelectOption[];
  packagingOptions?: SelectOption[];
  imoClassOptions?: SelectOption[];
  updateField: (index: number, field: string, value: any) => void;
  blurField: (index: number, field: string, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
  onBlur?: (
    numberOfContainer: string,
    containerType: string,
    index: number,
    changedField: 'numberOfContainer' | 'containerType'
  ) => void;
  onAddHazardousRow: (cargoIndex: number) => void;
  onRemoveHazardousRow: (cargoIndex: number, hazIndex: number) => void;
  onChangeHazardousRow: (cargoIndex: number, hazIndex: number, field: string, value: any) => void;
  isAccurateRatingType?: boolean;
  triggerAccurateOrConfirm?: () => void;
  updateDimension: (cIdx: number, dIdx: number, field: keyof DimensionRowType, value: unknown) => void;
  addDimension: (cIdx: number) => void;
  removeDimension: (cIdx: number, dIdx: number) => void;
  blurDimension?: (cIdx: number, dIdx: number, field: string, value: string) => void;
  rateDetails?: any;
}

const FCLBookingCargoRow: React.FC<FCLBookingCargoRowProps> = ({
  row,
  index,
  containerTypeSelect,
  fclhazardousSelect,
  packagingOptions = [],
  imoClassOptions = [],
  updateField,
  blurField,
  onAdd,
  onRemove,
  onBlur,
  onAddHazardousRow,
  onRemoveHazardousRow,
  onChangeHazardousRow,
  isAccurateRatingType = false,
  triggerAccurateOrConfirm,
  updateDimension,
  addDimension,
  removeDimension,
  blurDimension,
  rateDetails,
}) => {
  const isHazardous = row.hazardous?.startsWith('Y') || row.hazardous === 'Y';

  const [showDims, setShowDims] = React.useState(row.dimRows && row.dimRows.length > 0);

  const isFlatRackOrOpenTop = (typeValue: string) => {
    if (!typeValue) return false;
    const val = typeValue.toUpperCase();
    const label = containerTypeSelect.find((opt) => opt.value === typeValue)?.label?.toUpperCase() || '';
    return val.includes('FR') || 
           val.includes('FL') || 
           val.includes('OT') ||
           label.includes('FLAT') || 
           label.includes('OPEN') || 
           label.includes('RACK') || 
           label.includes('TOP');
  };
  
  const convertCtoF = (cVal: string) => {
    if (!cVal || cVal === '-') return '';
    const c = parseFloat(cVal);
    if (isNaN(c)) return '';
    return String(Math.round(c * 1.8 + 32));
  };

  const convertFtoC = (fVal: string) => {
    if (!fVal || fVal === '-') return '';
    const f = parseFloat(fVal);
    if (isNaN(f)) return '';
    return String(Math.round((f - 32) / 1.8));
  };

  const isReeferContainer = (typeValue: string) => {
    if (!typeValue) return false;
    const val = typeValue.toUpperCase();
    const label = containerTypeSelect.find((opt) => opt.value === typeValue)?.label?.toUpperCase() || '';
    return val.includes('RF') || 
           val.includes('RH') || 
           val.includes('RE') ||
           val.includes('REEFER') || 
           val.includes('REFRIGERATED') ||
           label.includes('REEFER') ||
           label.includes('REFRIGERATED');
  };

  const isEligibleForDims = isFlatRackOrOpenTop(row.containerType1 || '');

  React.useEffect(() => {
    if (!isEligibleForDims) {
      setShowDims(false);
    }
  }, [isEligibleForDims]);

  const handleAddDimensionClick = () => {
    if (!showDims) {
      if (!row.dimRows || row.dimRows.length === 0) {
        addDimension(index);
      }
      setShowDims(true);
    } else {
      setShowDims(false);
    }
  };

  return (
    <Box className={styles.bookingCargoRowWrapper}>
      {/* PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel */}
      {index > 0 && (
        <Box className={styles.headerRow} sx={{ marginTop: '10px' }}>
          <Box className={styles.headerCell}>Equipment Details</Box>
          <Box className={styles.headerCell}>Description of Goods</Box>
          <Box className={styles.headerCell}>Kg</Box>
          <Box className={styles.headerCell}>Cbm</Box>
          <Box className={styles.headerCell}>Lbs</Box>
          <Box className={styles.headerCell}>Cbf</Box>
          <Box className={styles.headerCell}>Hazardous</Box>
          <Box className={styles.headerCell}></Box>
        </Box>
      )}
      {/* PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel */}
      <Box className={styles.cargoRow}>
        {/* Column 1: Equipment Details (Stacked Quantity and Type) */}
        <Box className={styles.equipmentDetailsCell}>
          {/* PHX-131742: FCL Booking: cargo details section changes - Start: Commented by dhapatel */}
          {/* <PNumberField
            maxLength={3}
            name={`numberOfContainer_${index}`}
            value={row.numberOfContainer1 ?? ''}
            required={true}
            inputModeType="numeric"
            onChange={(val: string) => updateField(index, 'numberOfContainer1', val)}
            onBlur={(e) => {
              const freshVal = (e.target as HTMLInputElement).value;
              onBlur?.(freshVal, row.containerType1 || '', index + 1, 'numberOfContainer');
            }}
          />
          <PSelect
            value={row.containerType1 || ''}
            name={`containerType_${index}`}
            required={true}
            options={containerTypeSelect}
            onChange={(val: string) => {
              updateField(index, 'containerType1', val);
              onBlur?.(row.numberOfContainer1 || '', val, index + 1, 'containerType');
            }}
            onBlur={() => {
              onBlur?.(row.numberOfContainer1 || '', row.containerType1 || '', index + 1, 'containerType');
            }}
          /> */}
          {/* PHX-131742: FCL Booking: cargo details section changes - End: Commented by dhapatel */}
          {/* PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel */}
          <div className={!row.numberOfContainer1 ? styles.errorBorder : ''}>
            <PNumberField
              label=""
              value={row.numberOfContainer1 ?? ''}
              name={`numberOfContainer_${index}`}
              maxLength={3}
              required={true}
              error={!row.numberOfContainer1}
              autoComplete="off"
              inputModeType="numeric"
              onChange={(val: string) => updateField(index, 'numberOfContainer1', val)}
              onBlur={(e) => {
                const freshVal = (e.target as HTMLInputElement).value;
                onBlur?.(freshVal, row.containerType1 || '', index + 1, 'numberOfContainer');
              }}
            />
          </div>
          <PSelect
            value={row.containerType1 || ''}
            name={`containerType_${index}`}
            required={true}
            error={!row.containerType1 || row.containerType1 === '-1' || row.containerType1 === 'Please Select'}
            options={containerTypeSelect}
            onChange={(val: string) => {
              updateField(index, 'containerType1', val);
              onBlur?.(row.numberOfContainer1 || '', val, index + 1, 'containerType');
            }}
            onBlur={() => {
              onBlur?.(row.numberOfContainer1 || '', row.containerType1 || '', index + 1, 'containerType');
            }}
          />
          {/* PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel */}
        </Box>

        {/* Column 2: Description of Goods */}
        <Box className={styles.inputCell}>
          <AutoTextarea
            id={`descriptionOfGoods_${index}`}
            value={row.descriptionOfGoods || ''}
            name={`descriptionOfGoods_${index}`}
            charPerLine={35}
            totalLines={5}
            height="50px"
            onChange={(e) => updateField(index, 'descriptionOfGoods', e.target.value)}
            autoSize={false}
            maxLength={175}
            upperCase={true}
          />
        </Box>

        {/* Column 3: Kg */}
        <Box className={styles.inputCell}>
          <PNumberField
            id={`kg_${index}`}
            label=""
            value={row.kg ?? ''}
            name={`kg_${index}_${Date.now()}`}
            maxLength={12}
            autoComplete="new-password"
            inputModeType="decimal"
            onChange={(val: string) => updateField(index, 'kg', val)}
            onBlur={() => {
              blurField(index, 'kg', row.kg || '');
              if (isAccurateRatingType) triggerAccurateOrConfirm?.();
            }}
          />
        </Box>

        {/* Column 4: Cbm */}
        <Box className={styles.inputCell}>
          <PNumberField
            id={`cbm_${index}`}
            label=""
            value={row.cbm ?? ''}
            name={`cbm_${index}_${Date.now()}`}
            maxLength={12}
            autoComplete="new-password"
            inputModeType="decimal"
            onChange={(val: string) => updateField(index, 'cbm', val)}
            onBlur={() => {
              blurField(index, 'cbm', row.cbm || '');
              if (isAccurateRatingType) triggerAccurateOrConfirm?.();
            }}
          />
        </Box>

        {/* Column 5: Lbs */}
        <Box className={styles.inputCell}>
          <PNumberField
            label=""
            value={row.lbs ?? ''}
            name={`lbs_${index}_${Date.now()}`}
            maxLength={12}
            autoComplete="new-password"
            onChange={(val: string) => updateField(index, 'lbs', val)}
            onBlur={() => blurField(index, 'lbs', row.lbs || '')}
          />
        </Box>

        {/* Column 6: Cbf */}
        <Box className={styles.inputCell}>
          <PNumberField
            label=""
            value={row.cbf ?? ''}
            name={`cbf_${index}_${Date.now()}`}
            maxLength={12}
            autoComplete="new-password"
            onChange={(val: string) => updateField(index, 'cbf', val)}
            onBlur={() => blurField(index, 'cbf', row.cbf || '')}
          />
        </Box>

        {/* Column 7: Hazardous */}
        <Box className={styles.inputCell}>          
          {/* PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel */}
          <PSelect
            value={row.hazardous || '-1'}
            label=""
            name={`hazardous_${index}`}
            required={true}
            error={!row.hazardous || row.hazardous === '-1' || row.hazardous === 'Please Select'}
            options={[
              { label: 'Please Select', value: '-1' },
              ...fclhazardousSelect.filter(opt => 
                String(opt.label).trim() !== 'Please Select' && 
                String(opt.value).trim() !== '-1' && 
                String(opt.value).trim() !== ''
              )
            ]}
            onChange={(value: string) => {
              updateField(index, 'hazardous', value);
              if (value === 'Y' && (!row.hazRows || row.hazRows.length === 0)) {
                onAddHazardousRow(index);
              }
              if (isAccurateRatingType) triggerAccurateOrConfirm?.();
            }}
          />
          {/* PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel */}
          {isEligibleForDims && (
            <>
              <Box sx={{ height: '10px' }} />
              <Button
                className={styles.addDimensionBtn}
                onClick={handleAddDimensionClick}
              >
                {showDims ? 'Hide Dimensions' : 'Add Dimensions'}
              </Button>
            </>
          )}
        </Box>

        {/* Column 8: Actions */}
        <Box className={styles.actionsCell}>
          <Box className={styles.cargoRowActionsBox}>
            <Button
              id={`add-cargo_${index}`}
              className={styles.cargoRowActionBtn}
              onClick={onAdd}
            >
              +
            </Button>
           
            <Button
              id={`remove-cargo_${index}`}
              className={styles.cargoRowActionBtn}
              onClick={() => onRemove(index)}
              disabled={index === 0}
            >
              −
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Reefer Details sub-section */}
      {isReeferContainer(row.containerType1 || '') && (
        <Box className={styles.reeferSection}>
          <Box className={styles.reeferField}>
            <label className={styles.reeferLabel}>Temperature (C)</label>
            <PNumberField
              maxLength={3}
              value={row.temperatureC ?? ''}
              name={`temperatureC_${index}`}
              onChange={(val: string) => {
                // allow only numbers and "-" sign
                const sanitized = val.replace(/[^0-9-]/g, '');
                let clean = sanitized;
                if (clean.includes('-')) {
                  clean = (clean.startsWith('-') ? '-' : '') + clean.replace(/-/g, '');
                }
                updateField(index, 'temperatureC', clean);
                updateField(index, 'temperatureF', convertCtoF(clean));
              }}
              onBlur={() => {
                if (row.temperatureC === '-') {
                  updateField(index, 'temperatureC', '');
                  updateField(index, 'temperatureF', '');
                }
              }}
            />
          </Box>
          <Box className={styles.reeferField}>
            <label className={styles.reeferLabel}>Temperature (F)</label>
            <PNumberField
              maxLength={3}
              value={row.temperatureF ?? ''}
              name={`temperatureF_${index}`}
              onChange={(val: string) => {
                // allow only numbers and "-" sign
                const sanitized = val.replace(/[^0-9-]/g, '');
                let clean = sanitized;
                if (clean.includes('-')) {
                  clean = (clean.startsWith('-') ? '-' : '') + clean.replace(/-/g, '');
                }
                updateField(index, 'temperatureF', clean);
                updateField(index, 'temperatureC', convertFtoC(clean));
              }}
              onBlur={() => {
                if (row.temperatureF === '-') {
                  updateField(index, 'temperatureC', '');
                  updateField(index, 'temperatureF', '');
                }
              }}
            />
          </Box>
          <Box className={styles.reeferField}>
            <label className={styles.reeferLabel}>Generator Set</label>
            <PToggleButton
              value={row.generatorSet === 'Yes'}
              onChange={(val: boolean) => updateField(index, 'generatorSet', val ? 'Yes' : 'No')}
              yesTitle="Yes"
              noTitle="No"
            />
          </Box>
          <Box className={styles.reeferField}>
            <label className={styles.reeferLabel}>Vent Setting</label>
            <PToggleButton
              value={row.ventSetting === 'Open'}
              onChange={(val: boolean) => updateField(index, 'ventSetting', val ? 'Open' : 'Close')}
              yesTitle="Open"
              noTitle="Close"
            />
          </Box>
        </Box>
      )}

      {/* Hazardous Details sub-section */}
      {isHazardous && row.hazRows && (
        <Box sx={{ paddingLeft: '14%', paddingBottom: '10px' }}>
          <HazardousSection
            rows={row.hazRows}
            shippingType="F"
            onAdd={() => onAddHazardousRow(index)}
            onChange={(hazIdx: number, field: string, value: string | number) =>
              onChangeHazardousRow(index, hazIdx, field, value)
            }
            onRemove={(hazIdx: number) => onRemoveHazardousRow(index, hazIdx)}
            packagingOptions={packagingOptions}
            imoClassOptions={imoClassOptions}
          />
        </Box>
      )}

      {/* Dimensions sub-section */}
      {showDims && row.dimRows && row.dimRows.length > 0 && (
        <Box className={styles.dimensionsSection}>
          {/* Dimensions Header Row */}
          <Box className={styles.dimensionsHeaderRow}>
            <Box className={`${styles.dimensionsHeaderCell} ${styles.dimColHeader}`}>Length</Box>
            <Box className={`${styles.dimensionsHeaderCell} ${styles.dimColHeader}`}>Width</Box>
            <Box className={`${styles.dimensionsHeaderCell} ${styles.dimColHeader}`}>Height</Box>
            <Box className={`${styles.dimensionsHeaderCell} ${styles.dimRowSel66Header}`}>Unit</Box>
            <Box className={`${styles.dimensionsHeaderCell} ${styles.dimColHeader}`}>Pieces</Box>
            <Box className={`${styles.dimensionsHeaderCell} ${styles.dimColWideHeader}`}>Cbm</Box>
            <Box className={`${styles.dimensionsHeaderCell} ${styles.dimColWideHeader}`}>Cbf</Box>
            <Box className={`${styles.dimensionsHeaderCell} ${styles.dimColWideHeader}`}>Kg</Box>
            <Box className={`${styles.dimensionsHeaderCell} ${styles.dimColWideHeader}`}>Lbs</Box>
            <Box className={`${styles.dimensionsHeaderCell} ${styles.dimRowSel100Header}`}>Shipment Type</Box>
          </Box>

          {/* Dimensions Rows */}
          {row.dimRows.map((dimRow, dimIdx) => (
            <DimensionRow
              key={dimIdx}
              row={dimRow}
              onChange={(f: keyof DimensionRowType | string, v: unknown) =>
                updateDimension(index, dimIdx, f as keyof DimensionRowType, v)
              }
              onBlurField={(field, value) => blurDimension?.(index, dimIdx, field, value)}
              onRemove={() => removeDimension(index, dimIdx)}
              onAdd={() => addDimension(index)}
              isFirst={false}
              showStackingType={false}
              showActions={false}
              pkgTypeOptions={packagingOptions}
              isTrucking={false}
              rateDetails={rateDetails}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FCLBookingCargoRow;
// PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
