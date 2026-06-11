import { PNumberField, PSelect, PTextField } from 'phoenix-react-lib';
import styles from '../../../../styles/LCL/HazardousSection.module.css';
import { HazardousRowType, SelectOption } from '@/types/LCL/cargo/CargoDetails.types';
import { Box } from '@mui/material';
interface HzRowType {
  label?: string;
  key: string;
  type: 'select' | 'number' | 'text' | 'button';
  inputModeType?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
  selectOptions?: SelectOption[];
  width: string;
  maxLength?: number;
  show?: boolean | ((shippingType: string) => boolean);
  mandatory?: boolean;
}

const PKG_GROUP_OPTIONS = [{
  label:'Please Select',value:'-1'},
 {label: 'I',value:'I'},
 {label: 'II',value:'II'},
 {label: 'III',value:'III'},
];

const QUANTITY_OPTIONS = [
  { label: 'Please Select', value: '-1' },
  { label: 'L - Limited Quantity', value: 'L' },
  { label: 'E - Excepted Quantity', value: 'E' },
];


const toFahrenheit = (c: number): number => Math.round((c * 1.8) + 32);
const toCelsius = (f: number): number => Math.round((f - 32) * 0.5556);

const getTopTableColumns = (shippingType: string, imoClassOptions: SelectOption[], packagingOptions: SelectOption[]): HzRowType[] => {
  return [
    {
      label: 'IMO Class',
      key: 'imoClass',
      type: 'select',
      selectOptions: imoClassOptions,
      width: '60px',
    },
    {
      label: 'IMO Subclass',
      key: 'imoSubclass',
      type: 'select',
      selectOptions: imoClassOptions,
      width: '86px',
    },
    {
      label: 'UN Number',
      key: 'unNumber',
      type: 'number',
      inputModeType: 'numeric',
      maxLength: 4,
      width: '65px',
    },
    {
      label: 'IMO Page',
      key: 'imoPage',
      type: 'text',
      maxLength: 6,
      width: '65px',
    },
    {
      label: "Packaging Group",
      key: "pkgGroup",
      type: "select",
      selectOptions: PKG_GROUP_OPTIONS,
      width: '100px',
    },
    {
      label: 'Flashpoint (C)',
      key: 'flashpointC',
      type: 'number',
      inputModeType: 'numeric',
      maxLength: 4,
      width: '75px',
    },
    {
      label: 'Flashpoint (F)',
      key: 'flashpointF',
      type: 'number',
      inputModeType: 'numeric',
      maxLength: 4,
      width: '75px',
    },
    {
      label: 'Pieces',
      key: 'pieces',
      type: 'number',
      inputModeType: 'numeric',
      maxLength: 6,
      width: '50px',
    },
    {
      label: 'Packaging',
      key: 'packaging',
      type: 'select',
      selectOptions: packagingOptions,
      width: '60px',
    },
    {
      label: 'Weight',
      key: 'weight',
      type: 'number',
      inputModeType: 'decimal',
      maxLength: 12,
      width: '63px',
    },
    {
      label: 'Proper Shipping Name',
      key: 'properShippingName',
      type: 'text',
      maxLength: shippingType === 'L' ? 200 : 40,
      width: shippingType === 'L' ? '550px' : '222px',
    },
  ];
};

const getBottomTableColumns = (commodityOptions: SelectOption[], showCommodity: boolean): HzRowType[] => {
  return [
    {
      label: 'Commodity',
      key: 'commodity',
      type: 'select',
      selectOptions: commodityOptions,
      width: '154px',
      show: showCommodity,
    },
    {
      label: 'Technical Name',
      key: 'technicalName',
      type: 'text',
      maxLength: 40,
      width: '253px',
    },
    {
      label: 'Placard 1',
      key: 'placard1',
      type: 'text',
      maxLength: 15,
      width: '100px',
    },
    {
      label: 'Placard 2',
      key: 'placard2',
      type: 'text',
      maxLength: 15,
      width: '100px',
    },
    {
      label: 'Emergency Number',
      key: 'emergencyNumber',
      type: 'text',
      maxLength: 20,
      width: '116px',
    },
    {
      label: 'Emergency Contact',
      key: 'emergencyContact',
      type: 'text',
      maxLength: 20,
      width: '130px',
    },
    {
      label: 'Quantity',
      key: 'quantity',
      type: 'select',
      selectOptions: QUANTITY_OPTIONS,
      width: '162px',
      show: (type: string) => type !== 'F',
    },
    // {
    //   label: 'Shipper Name 1',
    //   key: 'shipperName1',
    //   type: 'text',
    //   width: '140px',
    //   show: (type: string) => type !== 'F',
    // },
    // {
    //   label: 'Shipper Name 2',
    //   key: 'shipperName2',
    //   type: 'text',
    //   width: '140px',
    //   show: (type: string) => type !== 'F',
    // },
    {
      label: '',
      key: 'actions',
      type: 'button',
      width: '50px',
    },
  ];
};

const renderInputField = (
  column: HzRowType,
  value: string | number,
  onChange: (val: string | number) => void,
  rowIndex?: number,
  onAdd?: (rowIndex: number) => void,
  onRemove?: (rowIndex: number) => void,
  isLastRow?: boolean
) => {
  if (column.type === 'select') {
    return (
      <PSelect
        value={String(value)}
        onChange={(value) => onChange(value)}
        options= {column.selectOptions}//{opts}
        label={column.label}
        required={!!column.mandatory}
      />
    );
  }
  if (column.type === 'number') {
    return (
      <PNumberField
        inputModeType={column.inputModeType}
        value={value}
        onChange={(value) => onChange(value)}
        label={column.label}
        {...(column.maxLength && { maxLength: column.maxLength })}
        required={!!column.mandatory}
      />
    );
  }

  if (column.type === 'button') {
    return (
      <Box className={styles.hazardButtonsContainer}>
        <button className={styles.btn} onClick={() => onAdd?.(rowIndex!)}>
          +
        </button>
        <button
          className={styles.btn}
          onClick={() => onRemove?.(rowIndex!)}
          disabled={isLastRow}
        >
          −
        </button>
      </Box>
    );
  }

  return (
    <PTextField
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label={column.label}
      {...(column.maxLength && { maxLength: column.maxLength })}
      required={!!column.mandatory}
    />
  );
};

const HazardRow = ({
  row,
  rowIndex,
  onChange,
  onAdd,
  onRemove,
  isLastRow,
  shippingType,
  imoClassOptions,
  packagingOptions,
  commodityOptions,
}: {
  row: HazardousRowType;
  rowIndex: number;
  onChange: (rowIndex: number, field: string, value: string | number) => void;
  onAdd: (rowIndex: number) => void;
  onRemove: (rowIndex: number) => void;
  isLastRow: boolean;
  shippingType: string;
  imoClassOptions: SelectOption[];
  packagingOptions: SelectOption[];
  commodityOptions: SelectOption[];
}) => {
  if(row.controlFlag === 'D') return <></>;
  const handleFlashpointCBlur = () => {
    const c = Number(row.flashpointC);
    const f = Number(row.flashpointF);
    if (c !== 0) {
      onChange(rowIndex, 'flashpointF', toFahrenheit(c));
    } else if (f !== 0) {
      onChange(rowIndex, 'flashpointC', toCelsius(f));
    }
  };

  const handleFlashpointFBlur = () => {
    const f = Number(row.flashpointF);
    const c = Number(row.flashpointC);
    if (f !== 0) {
      onChange(rowIndex, 'flashpointC', toCelsius(f));
    } else if (c !== 0) {
      onChange(rowIndex, 'flashpointF', toFahrenheit(c));
    }
  };

  const topColumns = getTopTableColumns(shippingType, imoClassOptions, packagingOptions).filter(
    (col: HzRowType) => {
      if (col.show === undefined) return true;
      if (typeof col.show === 'boolean') return col.show;
      return col.show(shippingType);
    }
  );
  const showCommodity = row.imoClass === '3.0';
  const bottomColumns = getBottomTableColumns(commodityOptions, showCommodity).filter(
    (col: HzRowType) => {
      if (col.show === undefined) return true;
      if (typeof col.show === 'boolean') return col.show;
      return col.show(shippingType);
    }
  );
  const topGrid = topColumns.map((col) => col.width).join(' ');
  const bottomGrid = bottomColumns.map((col) => col.width).join(' ');

  return (
    <Box className={styles.hazardRow}>
      {/* <hr/> */}
      {/* Top Table - Inputs Row */}
      <Box className={styles.hazardGrid} sx={{ gridTemplateColumns: topGrid }}>
        {topColumns.map((column) => {
          const blurHandler =
            column.key === 'flashpointC' ? handleFlashpointCBlur
            : column.key === 'flashpointF' ? handleFlashpointFBlur
            : undefined;
          return (
            <Box key={column.key} className={styles.hazardCell} onBlur={blurHandler}>
              {renderInputField(
                column,
                (row as unknown as Record<string, string | number>)[column.key],
                (value: string | number) => onChange(rowIndex, column.key, value),
                rowIndex,
                onAdd,
                onRemove,
                isLastRow
              )}
            </Box>
          );
        })}
      </Box>

      {/* Bottom Table - Inputs Row */}
      <Box
        className={styles.hazardGrid}
        sx={{ gridTemplateColumns: bottomGrid }}
      >
        {bottomColumns.map((column) => (
          <Box
            key={column.key}
            className={styles.hazardCell}
            style={{ width: column.width }}
          >
            {renderInputField(
              column,
              (row as unknown as Record<string, string | number>)[column.key],
              (value: string | number) => onChange(rowIndex, column.key, value),
              rowIndex,
              onAdd,
              onRemove,
              isLastRow
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const HazardousSection = ({
  rows,
  onChange,
  onAdd,
  onRemove,
  shippingType,
  imoClassOptions = [],
  packagingOptions = [],
  commodityOptions = [],
}: {
  rows: HazardousRowType[];
  onChange: (rowIndex: number, field: string, value: string | number) => void;
  onAdd: (rowIndex: number) => void;
  onRemove: (rowIndex: number) => void;
  shippingType: string;
  imoClassOptions?: SelectOption[];
  packagingOptions?: SelectOption[];
  commodityOptions?: SelectOption[];
}) => {
  const visibleCount = rows.filter((r) => r.controlFlag !== 'D').length;

  return (
    <Box className={styles.hazardousSection}>
      {rows.map((row: any, index: any) => (
        <Box key={index} className={styles.hazardiousSec}>
          <HazardRow
            row={row}
            rowIndex={index}
            onChange={onChange}
            onAdd={onAdd}
            onRemove={onRemove}
            isLastRow={visibleCount <= 1}
            shippingType={shippingType}
            imoClassOptions={imoClassOptions}
            packagingOptions={packagingOptions}
            commodityOptions={commodityOptions}
          />
        </Box>
      ))}
    </Box>
  );
};

export default HazardousSection;
