import { useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import {
  selectRaw,
  useGetSelections,
  useGetListBox,
  packagingSelectionConfig,
  imoClassSelectionConfig,
  commodityListBoxConfig,
  initialCargoRow,
  initialDimRow,
  initialHazRow,
  useFeatureToggle,
  ApiService,
  COMMON_ENDPOINTS,
  CargoRow,
  containerTypeSelectionConfig,
  FCLhazardousListBoxConfigType,
  useContainerDataBeanApi,
} from 'phoenix-common-react';
import { useAppSelector } from '@/app/store/hooks';
import type {
  CargoRowType,
  DimensionRowType,
  HazardousRowType,
  CargoDetailsFormData,
  CargoRowsState,
  CargoRowsHandlers,
  CustomsRowsState,
  CustomsRowsHandlers,
  InstructionState,
  InstructionHandlers,
  CbmDialogState,
  CbmDialogHandlers,
  LotRowData,
  InternalCargoRowData,
  DimRowData,
  HazRowData,
  StandardDimensionPreset,
  GenAesFilingBean,
  SelectOption,
  RateDetailsState,
  ContainerDataBean,
  ContainerTypeList,
} from 'phoenix-common-react';
import { useLotDetails } from './useLotDetails';
import { calculateTEU } from './useTeuCalculator';

const DEFAULT_PRECISION = 3;

const CARGO_ROW_FIELDS = [
  'uom',
  'pieces',
  'packaging',
  'description',
  'hazardous',
  'kg',
  'cbm',
  'lbs',
  'cbf',
] as const;

// ─── TMS Freight Class Lookup Tables ──────────────────────────────────────────

const TMS_CLASS_RANGES = [
  { className: '500', min: 0, max: 1 },
  { className: '400', min: 1, max: 2 },
  { className: '300', min: 2, max: 3 },
  { className: '250', min: 3, max: 4 },
  { className: '200', min: 4, max: 5 },
  { className: '175', min: 5, max: 6 },
  { className: '150', min: 6, max: 7 },
  { className: '125', min: 7, max: 8 },
  { className: '110', min: 8, max: 9 },
  { className: '100', min: 9, max: 10.5 },
  { className: '92.5', min: 10.5, max: 12 },
  { className: '85', min: 12, max: 13.5 },
  { className: '77.5', min: 13.5, max: 15 },
  { className: '70', min: 15, max: 22.5 },
  { className: '65', min: 22.5, max: 30 },
  { className: '60', min: 30, max: 35 },
  { className: '55', min: 35, max: 50 },
  { className: '50', min: 50, max: Number.MAX_SAFE_INTEGER },
];

const DIMENSION_FIELDS = [
  'length',
  'width',
  'height',
  'pieces',
  'cbm',
  'cbf',
  'kg',
  'lbs',
];
function buildCargoProgressFields(rowCount: number): string[] {
  const fields: string[] = [];
  for (let i = 0; i < rowCount; i++) {
    CARGO_ROW_FIELDS.forEach((f) => fields.push(`cargoRows.${i}.${f}`));
  }
  return fields;
}

// ─── Pure calculation helpers ─────────────────────────────────────────────────

function round(val: number, precision: number): number {
  return parseFloat(val.toFixed(precision));
}

function applyMeasurementSync(
  field: string,
  value: string,
  weightPrecision: number,
  cubePrecision: number
): Record<string, string> {
  if (value === '') {
    if (field === 'kg') return { lbs: '' };
    if (field === 'lbs') return { kg: '' };
    if (field === 'cbm') return { cbf: '' };
    if (field === 'cbf') return { cbm: '' };
    return {};
  }
  const num = parseFloat(value);
  if (isNaN(num)) return {};
  if (field === 'kg')
    return {
      lbs: round(num * 2.20462, weightPrecision).toFixed(weightPrecision),
    };
  if (field === 'lbs')
    return {
      kg: round(num / 2.20462, weightPrecision).toFixed(weightPrecision),
    };
  if (field === 'cbm')
    return { cbf: round(num * 35.3147, cubePrecision).toFixed(cubePrecision) };
  if (field === 'cbf')
    return { cbm: round(num / 35.3147, cubePrecision + 1).toFixed(cubePrecision + 1) };
  return {};
}

function calcDimVolumes(
  l: number,
  w: number,
  h: number,
  unit: string,
  cubePrecision: number
): { cbm: string; cbf: string } {
  const vol = l * w * h;
  let cbm = 0,
    cbf = 0;
  if (unit === 'Centimeters') {
    cbm = vol / 1_000_000;
    cbf = cbm * 35.3147;
  } else if (unit === 'Inches') {
    cbf = vol / 1_728;
    cbm = cbf / 35.3147;
  } else if (unit === 'Feet') {
    cbf = vol;
    cbm = vol / 35.3147;
  } else if (unit === 'Meters') {
    cbm = vol;
    cbf = cbm * 35.3147;
  }
  return {
    cbm: round(cbm, cubePrecision + 1).toFixed(cubePrecision + 1),
    cbf: round(cbf, cubePrecision).toFixed(cubePrecision),
  };
}

// ─── TMS Freight Class Calculation ────────────────────────────────────────────

function getTmsClassFromPcf(pcf: number): string {
  for (const range of TMS_CLASS_RANGES) {
    if (pcf >= range.min && pcf < range.max) {
      return range.className;
    }
  }
  return '';
}

function calculateTmsClass(lbs: string, cbf: string): string {
  const lbsNum = parseFloat(lbs);
  const cbfNum = parseFloat(cbf);

  if (isNaN(lbsNum) || isNaN(cbfNum) || cbfNum === 0) {
    return '';
  }

  const pcf = lbsNum / cbfNum;
  return getTmsClassFromPcf(pcf);
}

function applyDimRowChange(
  dim: DimensionRowType,
  field: string,
  value: unknown,
  weightPrecision: number,
  cubePrecision: number,
  isTrkEnabled: boolean
): DimensionRowType {
  const updated = { ...dim, [field]: value };
  // Unit is a select field — recalculate cbm/cbf immediately on change
  if (field === 'unit') {
    const l = parseFloat(updated.length) || 0;
    const w = parseFloat(updated.width) || 0;
    const h = parseFloat(updated.height) || 0;
    const p = parseFloat(updated.pieces) || 0;
    if (l > 0 && w > 0 && h > 0) {
      const { cbm: unitCbm, cbf: unitCbf } = calcDimVolumes(l, w, h, updated.unit, cubePrecision);
      const totalCbm = p > 0 ? round(parseFloat(unitCbm) * p, cubePrecision + 1) : parseFloat(unitCbm);
      const totalCbf = p > 0 ? round(parseFloat(unitCbf) * p, cubePrecision) : parseFloat(unitCbf);
      const result = {
        ...updated,
        cbm: totalCbm.toFixed(cubePrecision + 1),
        cbf: totalCbf.toFixed(cubePrecision),
      };
      if (isTrkEnabled) {
        result.cls = calculateTmsClass(result.lbs, result.cbf);
      }
      return result;
    }
    return { ...updated, cbm: '', cbf: '' };
  }
  // l/w/h/pieces: just update raw value — cbm/cbf recalculation deferred to onBlur
  const result = { ...updated };
  if (isTrkEnabled && (field === 'lbs' || field === 'cbf')) {
    result.cls = calculateTmsClass(result.lbs, result.cbf);
  }
  return result;
}

function rollUpDimRows(
  dimRows: DimensionRowType[],
  weightPrecision: number,
  cubePrecision: number
): { kg: string; lbs: string; cbm: string; cbf: string; pieces: string } {
  const sumField = (key: keyof DimensionRowType) =>
    dimRows.reduce((s, r) => s + (parseFloat(r[key] as string) || 0), 0);
  const totalKg = sumField('kg');
  const totalLbs = sumField('lbs');
  const totalCbm = sumField('cbm');
  const totalCbf = sumField('cbf');
  const totalPieces = sumField('pieces');
  const hasDimensions = dimRows.some(
    (r) => parseFloat(r.length) > 0 && parseFloat(r.width) > 0 && parseFloat(r.height) > 0
  );
  return {
    kg:     totalKg     ? round(totalKg,  weightPrecision).toFixed(weightPrecision) : '',
    lbs:    totalLbs    ? round(totalLbs, weightPrecision).toFixed(weightPrecision) : '',
    cbm:    hasDimensions || totalCbm > 0 ? round(totalCbm, cubePrecision + 1).toFixed(cubePrecision + 1) : '',
    cbf:    hasDimensions || totalCbf > 0 ? round(totalCbf, cubePrecision).toFixed(cubePrecision) : '',
    pieces: totalPieces ? String(totalPieces)                                        : '',
  };
}

const MANDATORY_FIELDS = [
  'pieces',
  'packaging',
  'description',
  'hazardous',
  'kg',
  'cbm',
  'lbs',
  'cbf',
] as const;

function isFieldEmpty(field: string, value: unknown): boolean {
  if (field === 'packaging') return value === '-1' || value === '';
  if (field === 'hazardous') return value === '-1' || value === '';
  return value === '' || value === null || value === undefined;
}

function validateCargoRows(rows: CargoRowType[]): Record<string, string> {
  const errors: Record<string, string> = {};
  rows.forEach((row, rowIdx) => {
    MANDATORY_FIELDS.forEach((field) => {
      if (isFieldEmpty(field, (row as unknown as Record<string, unknown>)[field])) {
        errors[`row${rowIdx}_${field}`] =
          `Row ${rowIdx + 1}: "${field}" is required`;
      }
    });
  });
  return errors;
}

// ─── CargoRowType → InternalCargoRowData transformation ──────────────────────

function dimRowToInternal(dim: DimensionRowType): DimRowData {
  return {
    length: dim.length,
    width: dim.width,
    height: dim.height,
    unit: dim.unit,
    pieces: dim.pieces,
    cbm: dim.cbm,
    cbf: dim.cbf,
    kg: dim.kg,
    lbs: dim.lbs,
    cls: dim.cls,
    shipmentType: dim.shipmentType,
    stackingType: dim.stackingType,
    packageType: dim.packageType,
    flag: false,
  };
}

function hazRowToInternal(haz: HazardousRowType): HazRowData {
  return {
    imoClass: haz.imoClass,
    imoSubclass: haz.imoSubclass,
    unNumber: haz.unNumber,
    imoPage: haz.imoPage,
    pkgGroup: haz.pkgGroup,
    flashpointC: haz.flashpointC,
    flashpointF: haz.flashpointF,
    pieces: haz.pieces,
    packaging: haz.packaging,
    weight: haz.weight,
    properShippingName: haz.properShippingName,
    technicalName: haz.technicalName,
    placard1: haz.placard1,
    placard2: haz.placard2,
    emergencyNumber: haz.emergencyNumber,
    emergencyContact: haz.emergencyContact,
    quantity: haz.quantity,
  };
}

function toInternalCargoRows(rows: CargoRowType[]): InternalCargoRowData[] {
  const [firstRow] = rows;
  if (!firstRow) return [];

  const dimensions: DimRowData[] = [];
  const hazardous: HazRowData[] = [];
  for (const row of rows) {
    if (row.controlFlag === 'D') continue;
    if (row.isDimension) {
      const dimRows = row.dimRows ?? [];
      for (const dimRow of dimRows) {
        dimensions.push(dimRowToInternal(dimRow));
      }
    }
    if (row.hazardous === 'Y' || row.hazardous === 'Y - Yes') {
      const hazRows = row.hazRows ?? [];
      for (const hazRow of hazRows) {
        hazardous.push(hazRowToInternal(hazRow));
      }
    }
  }

  return [{
    marks: firstRow.marks,
    pieces: firstRow.pieces,
    packaging: firstRow.packaging,
    description: firstRow.description,
    kg: firstRow.kg,
    lbs: firstRow.lbs,
    cbm: firstRow.cbm,
    cbf: firstRow.cbf,
    hazardous: firstRow.hazardous,
    docRef: firstRow.docRef,
    dimRows: dimensions,
    hazRows: hazardous,
  }];
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useCargoDetails = (
  onRegisterFields?: (fields: string[]) => void,
  onFieldsChange?: (data: CargoDetailsFormData) => void,
  onPiecesChange?: (total: number) => void,
  moduleCode?: 'BKG' | 'QUO' | 'PREBKG',
  showStatus?: (type: any, messages: string[]) => void
) => {
  const raw = useSelector(selectRaw) as any;
  const officeId = useAppSelector((state) => state.loginClientBean.data?.officeId ?? 0);

  const weightPrecision = (() => {
    const v = raw.programSettings?.['BKG']?.['WEIGHT_PRECISION'];
    if (v == null) return DEFAULT_PRECISION;
    const p = parseInt(v, 10);
    return isNaN(p) ? DEFAULT_PRECISION : p;
  })();

  const cubePrecision = (() => {
    const v = raw.programSettings?.['BKG']?.['CUBE_PRECISION'];
    if (v == null) return DEFAULT_PRECISION;
    const p = parseInt(v, 10);
    return isNaN(p) ? DEFAULT_PRECISION : p;
  })();

  const rawUom = raw.officeSettings?.['PREFERRED_OFFICE_UOM'];
  const preferredUom: 'M' | 'S' = rawUom === 'E' ? 'S' : 'M';

  const rawHazardous = raw.officeSettings?.['SET_HAZARDOUS_DEFAULT_VALUE'];
  const defaultHazardous =
    rawHazardous === 'Y' || rawHazardous === 'N'
      ? rawHazardous
      : '-1';

  const { data: packagingOptions } = useGetSelections(packagingSelectionConfig);
  const { data: imoClassOptions } = useGetSelections(imoClassSelectionConfig);
  const { data: commodityOptions } = useGetListBox(commodityListBoxConfig);
  const { data: containerTypeSelect } = useGetSelections(containerTypeSelectionConfig('FCL'));
  const { data: fclHazardousOptions } = useGetListBox(FCLhazardousListBoxConfigType);
  const { data: containerTypeBean } = useContainerDataBeanApi({ typeOfMove: 'FCL' });

  const [clauseSuggestions, setClauseSuggestions] = useState<
    Array<{ code: string; name: string; description: string }>
  >([]);

  const { isVisible } = useFeatureToggle();

  const DEV_PRESET: StandardDimensionPreset = {
    length: '100', width: '80', height: '60', unit: 'Centimeters',
    pieces: '5', cbm: '0.48', cbf: '16.95', kg: '50', lbs: '110.23',
    stackable: 'Yes', shipmentType: 'LTL', stackingType: 'OD',
  };

  const standardDimensionPreset = useMemo<StandardDimensionPreset | null>(() => {
    try {
      const stored = localStorage.getItem('standardDimensionsBean');
      if (!stored) return DEV_PRESET;
      const bean = JSON.parse(stored) as { dimensionMainList?: Array<Record<string, unknown>> };
      const first = bean?.dimensionMainList?.[0];
      if (!first) return DEV_PRESET;
      return {
        length: String(first.length ?? ''),
        width: String(first.width ?? ''),
        height: String(first.height ?? ''),
        unit: String(first.unit ?? 'Inches'),
        pieces: String(first.pieces ?? ''),
        cbm: String(first.cbm ?? ''),
        cbf: String(first.cbf ?? ''),
        kg: String(first.kg ?? ''),
        lbs: String(first.lbs ?? ''),
        stackable: String(first.stackable ?? 'Yes'),
        shipmentType: String(first.shipmentType ?? ''),
        stackingType: String(first.StackingType ?? first.stackingType ?? '-1'),
      };
    } catch {
      return DEV_PRESET;
    }
  }, []);

  const hasStandardDimensions = true;
  
  const rawMaxCbm = raw.officeSettings?.['LCL_BKG_MAX_CBM'];
  const maxCbm: number | null =
    rawMaxCbm != null ? parseFloat(rawMaxCbm) : null;

  // ── State ──────────────────────────────────────────────────────────────────

  const [activeTab, setActiveTab] = useState('actual');
  const [cargoRows, setCargoRows] = useState<CargoRowType[]>([
    { ...initialCargoRow, uom: preferredUom, hazardous: defaultHazardous },
  ]);
  const [dimensionFlags, setDimensionFlags] = useState<boolean[]>([false]);
  const updateDimensionFlag = (dimIndex: number, rowData: DimensionRowType) => {
    const hasValue = DIMENSION_FIELDS.some((field) => {
      const value = String(
        rowData?.[field as keyof DimensionRowType] || ''
      ).trim();

      return value !== '' && value !== '-1' && value !== 'Please Select';
    });

    setDimensionFlags((prev) => {
      const updated = Array.from(
        {
          length: Math.max(prev.length, dimIndex + 1),
        },
        (_, index) => prev[index] ?? false
      );

      updated[dimIndex] = hasValue;

      return updated;
    });

    return hasValue;
  };

  const [customsRows, setCustomsRows] = useState<CargoRowType[]>([
    { ...initialCargoRow, uom: preferredUom, hazardous: defaultHazardous },
  ]);
  const { lotRows, setLotRows, lotState, lotHandlers, flagState, flagHandlers } = useLotDetails({
    moduleCode, showStatus, cargoRows, setCargoRows,
  });

  const [internalComment, setInternalCmt] = useState('');
  const [oldInternalComment, setOldInternalCmt] = useState('');
  const [loadingInstruction, setLoadingInstruction] = useState('');
  const [warehouseInstruction, setWarehouseInstruction] = useState('');
  const [cbmDialogOpen, setCbmDialogOpen] = useState(false);
  const [cbmOverrideAllowed, setCbmOverrideAllowed] = useState(false);
  const [genAesFilingBean, setGenAesFilingBean] = useState({});
  const [pendingCbmUpdate, setPendingCbmUpdate] = useState<{
    rowType: 'actual' | 'customs';
    cargoIndex: number;
    value: string;
  } | null>(null);
  const [containerDataList, setContainerDataList] = useState<ContainerDataBean[]>([]);
  // const [containerTypeList, setcontainerTypeList] = useState<string[]>([]);
  let containerTypeList =  [] as string[];
  const [totalTeu, setTotalTeu] = useState<number>(0);

  // ── Sensitive cargo clause fetch ───────────────────────────────────────────

  const hasSensitiveCargo = useMemo(
    () => cargoRows.some((row) => !!row.sensitiveCargo),
    [cargoRows]
  );

  useEffect(() => {
    if (!hasSensitiveCargo) {
      setClauseSuggestions([]);
      return;
    }

    ApiService.post(COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA, {
      query: '%%%SC',
      reference: 'englishMultiClauseByCodeAndName',
      params: {
        office_id: String(officeId),
        c_type: 'O',
        defaultLength: '20',
        site_id: '1',
        inputLength: '3',
      },
    })
      .then((response) => {
        const result = response.data?.result;
        if (!result) return;
        setClauseSuggestions(
          Object.keys(result).map((key) => {
            const parts = key.split('$$~*!');
            return {
              code: parts[0] || '',
              name: parts[1] || '',
              description: parts[2] || '',
            };
          })
        );
      })
      .catch(() => {});
  }, [hasSensitiveCargo, officeId]);

  // ── Progress callbacks ─────────────────────────────────────────────────────

  useEffect(() => {
    onRegisterFields?.(buildCargoProgressFields(cargoRows.length));
  }, [cargoRows.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onFieldsChange?.({
      flags: flagState.flags,
      cargoRows,
      customsRows,
      lotRows,
      internalComment,
      loadingInstruction,
      warehouseInstruction,
    });
  }, [
    cargoRows,
    customsRows,
    lotRows,
    flagState.flags,
    internalComment,
    loadingInstruction,
    warehouseInstruction,
  ]); // onFieldsChange intentionally omitted to prevent re-render loop

  function populateLotTransformer(lotRows?: LotRowData[]): LotRowData[] {
    return (lotRows ?? [])
      .filter((row): row is LotRowData => row != null)
      .map((row) => ({ ...row, controlFlag: 'U' as const }));
  }
  function populateRowTransformer(lotRows?: CargoRowType[]): CargoRowType[] {
    return (lotRows ?? [])
      .filter((row): row is LotRowData => row != null)
      .map((row) => ({
        ...row,
        controlFlag: 'U' as const,
        hazRows: row.hazRows?.map((haz) => ({ ...haz, controlFlag: 'U' as const })) ?? row.hazRows,
      }));
  }
  const bulkPopulateCargo = (data: {
    cargoRows?: CargoRowType[];
    internalComment?: string;
    loadingInstruction?: string;
    warehouseInstruction?: string;
    lotRows?: LotRowData[];
    genAesFilingBean?: GenAesFilingBean;
  }) => {
    if (data.cargoRows?.length)
      setCargoRows(populateRowTransformer(data.cargoRows));
    if (data.internalComment !== undefined) {
      setInternalCmt(data.internalComment);
      setOldInternalCmt(data.internalComment);
    }
    if (data.loadingInstruction !== undefined)
      setLoadingInstruction(data.loadingInstruction);
    if (data.warehouseInstruction !== undefined)
      setWarehouseInstruction(data.warehouseInstruction);
    if (data.lotRows?.length) setLotRows(populateLotTransformer(data.lotRows));

    if (data.genAesFilingBean !== undefined)
      setGenAesFilingBean(data.genAesFilingBean);
  };

  const updateCargoField = (
    cargoIndex: number,
    field: string,
    value: unknown
  ) => {
    if (field === 'sensitiveCargo') {
      setCargoRows((rows) => rows.map((row) => ({ ...row, sensitiveCargo: value })));
      return;
    }
    if (field === 'cbm' && !cbmOverrideAllowed && maxCbm !== null) {
      const num = parseFloat(String(value));
      if (!isNaN(num) && num > maxCbm) {
        setPendingCbmUpdate({ rowType: 'actual', cargoIndex, value: String(value) });
        setCbmDialogOpen(true);
        return;
      }
    }
    setCargoRows((rows) =>
      rows.map((row, i) =>
        i !== cargoIndex ? row : { ...row, [field]: value }
      )
    );
    if (field === 'pieces' && onPiecesChange) {
      const totalPieces = cargoRows.reduce((sum, row, i) => {
        const p = Number(i === cargoIndex ? value : row.pieces);
        return sum + (isNaN(p) ? 0 : p);
      }, 0);
      onPiecesChange(totalPieces);
    }
  };

  const blurCargoField = (cargoIndex: number, field: string, value: string) => {
    const sync = applyMeasurementSync(field, value, weightPrecision, cubePrecision);
    if (Object.keys(sync).length === 0) return;
    setCargoRows((rows) =>
      rows.map((row, i) => (i !== cargoIndex ? row : { ...row, ...sync }))
    );
  };

  const addNewCargo = () => {
    const sensitiveCargo = cargoRows.some((row) => row.sensitiveCargo === true);
    setCargoRows((rows) => [
      ...rows,
      { ...initialCargoRow, uom: preferredUom, hazardous: defaultHazardous, sensitiveCargo },
    ]);
  };

  const removeCargo = (cargoIndex: number) => {
    if (cargoRows.length > 1) {
      setCargoRows((rows) => {
        return rows.map((v, i) => {
          if (i === cargoIndex) {
            if (v.controlFlag === 'U') {
              const updatedHazRows = v.hazRows
                .map((haz) => {
                  if (haz.controlFlag === 'U') return { ...haz, controlFlag: 'D' as const };
                  return null;
                })
                .filter((haz): haz is HazardousRowType => haz !== null);
              return { ...v, controlFlag: 'D', hazRows: updatedHazRows };
            } else {
              return { ...v, dirty: true };
            }
          } else {
            return { ...v };
          }
        }).filter((row) => !row.dirty);
      });
    }
  };

  const updateDimension = (
    cargoIndex: number,
    dimIndex: number,
    field: keyof DimensionRowType,
    value: unknown
  ) => {
    let updatedRow: DimensionRowType | undefined;
    const allDimRows: DimensionRowType[] = [];
    const newRows = cargoRows.map((row, i) => {
      if (i !== cargoIndex) {
        allDimRows.push(...row.dimRows);
        return row;
      }
       const newDimRows = row.dimRows.map((dim, j) => {
         if (j !== dimIndex) return dim;
         const changed = applyDimRowChange(dim, field as string, value, weightPrecision, cubePrecision, isTrkEnabled);
         updatedRow = changed;
        updateDimensionFlag(dimIndex, changed);
         return changed;
       });
      allDimRows.push(...newDimRows);
      // unit is a select field — roll up immediately; all typed fields defer rollup to onBlur
      const rollup = field === 'unit' ? rollUpDimRows(newDimRows, weightPrecision, cubePrecision) : {};
      return { ...row, dimRows: newDimRows, ...rollup };
    });
    setCargoRows(newRows);
    if (updatedRow) {
      flagHandlers.handleDimensionChange({ cargoIndex, dimIndex, field: field as string, value, updatedRow, allDimRows });
    }
    if (cargoIndex === 0 && updatedRow) {
      const odmLotIdx = lotRows.findIndex((r) => r.type === 'ODM');
      if (odmLotIdx !== -1) {
        const { length, width, height } = updatedRow;
        const details =
          length && width && height
            ? `Odd Dims-${length}*${width}*${height}`
            : '';
        setLotRows((rows) =>
          rows.map((r, i) => (i === odmLotIdx ? { ...r, details } : r))
        );
      }
    }
  };

  const addDimension = (cargoIndex: number) => {
    let newDimIndex = 0;
    const allDimRows: DimensionRowType[] = [];
    const newRows = cargoRows.map((row, i) => {
      if (i !== cargoIndex) {
        allDimRows.push(...row.dimRows);
        return row;
      }
      if (row.dimRows.length >= 5 && !isVisible('OCEAN_QUO_BKG_INCREASE_LINES_OF_DIMENSION')) {
        return row;
      }
        const newDimRows: DimRowData[] = [...row.dimRows, { ...initialDimRow }];
        newDimIndex = newDimRows.length - 1;
        allDimRows.push(...newDimRows);
        return { ...row, isDimension: true, dimRows: newDimRows };
    });
    setCargoRows(newRows);
    flagHandlers.handleDimensionChange({
      cargoIndex,
      dimIndex: newDimIndex,
      field: 'length',
      value: '',
      updatedRow: { ...initialDimRow },
      allDimRows,
    });
  };

  const removeDimension = (cargoIndex: number, dimIndex: number) => {
    let allDimRows: DimensionRowType[] = [];
    setCargoRows((rows) =>
      rows.map((row, i) => {
        if (i !== cargoIndex) return row;
        if (row.dimRows.length <= 1) return row;
        const newDimRows = row.dimRows.filter((_, j) => j !== dimIndex);
        allDimRows = newDimRows;
        return { ...row, dimRows: newDimRows, ...rollUpDimRows(newDimRows, weightPrecision, cubePrecision) };
      })
    );
    if (allDimRows.length > 0) {
      flagHandlers.handleDimensionChange({
        cargoIndex,
        dimIndex,
        field: 'length',
        value: '',
        updatedRow: allDimRows[0],
        allDimRows,
      });
    }
  };

  const updateHazardous = (
    cargoIndex: number,
    hazIndex: number,
    field: string,
    value: unknown
  ) => {
    setCargoRows((rows) =>
      rows.map((row, i) =>
        i !== cargoIndex
          ? row
          : {
            ...row,
            hazRows: row.hazRows.map((haz, j) =>
              j !== hazIndex ? haz : { ...haz, [field]: value }
            ),
          }
      )
    );
  };

  const addHazardous = (cargoIndex: number) => {
    const currentRow = cargoRows[cargoIndex];
    const lastRow = currentRow.hazRows[currentRow.hazRows.length - 1];
    if (!lastRow?.imoClass || lastRow.imoClass.trim() === "" || lastRow?.imoClass === "Please Select" || lastRow?.imoClass === "-1") {
      showStatus('warning', ['Please Select IMO Class']);
      return;
    }
    setCargoRows((rows) =>
      rows.map((row, i) =>
        i !== cargoIndex
          ? row
          : { ...row, hazRows: [...row.hazRows, { ...initialHazRow }] }
      )
    );
  };

  const addHazardousWithValues = (cargoIndex: number, fields: Partial<HazardousRowType>) => {
    setCargoRows((rows) =>
      rows.map((row, i) =>
        i !== cargoIndex
          ? row
          : { ...row, hazRows: [...row.hazRows, { ...initialHazRow, ...fields }] }
      )
    );
  };

  const removeHazardous = (cargoIndex: number, hazIndex: number) => {
    setCargoRows((rows) =>
      rows.map((row, i) => {
        if (i !== cargoIndex) return row;

        if (row.hazRows.length <= 1) return row;

        const updatedHazRows = row.hazRows
          .map((haz, j) => {
            if (j !== hazIndex) return haz;
            if (haz.controlFlag === 'U') return { ...haz, controlFlag: 'D'};
            return null;
          })
          .filter((haz) => haz !== null);

        return { ...row, hazRows: updatedHazRows };
      })
    );
  };

  // ── Customs row handlers ───────────────────────────────────────────────────

  const updateCustomsField = (
    customsIndex: number,
    field: string,
    value: unknown
  ) => {
    if (field === 'cbm' && !cbmOverrideAllowed && maxCbm !== null) {
      const num = parseFloat(String(value));
      if (!isNaN(num) && num > maxCbm) {
        setPendingCbmUpdate({ rowType: 'customs', cargoIndex: customsIndex, value: String(value) });
        setCbmDialogOpen(true);
        return;
      }
    }
    setCustomsRows((rows) =>
      rows.map((row, i) =>
        i !== customsIndex ? row : { ...row, [field]: value }
      )
    );
  };

  const blurCustomsField = (customsIndex: number, field: string, value: string) => {
    const sync = applyMeasurementSync(field, value, weightPrecision, cubePrecision);
    if (Object.keys(sync).length === 0) return;
    setCustomsRows((rows) =>
      rows.map((row, i) => (i !== customsIndex ? row : { ...row, ...sync }))
    );
  };

  const addNewCustoms = () => {
    setCustomsRows((rows) => [
      ...rows,
      { ...initialCargoRow, uom: preferredUom, hazardous: defaultHazardous },
    ]);
  };

  const removeCustoms = (customsIndex: number) => {
    if(customsRows.length > 1) {
      setCustomsRows((rows) =>
      {
        return rows.map((v, i) => {
          if(i === customsIndex){
            return {...v, controlFlag: 'D'};
          }
          else{
            return {...v};
          }
        });
      });
    }
  };

  const updateCustomsDimension = (
    customsIndex: number,
    dimIndex: number,
    field: keyof DimensionRowType,
    value: unknown
  ) => {
    setCustomsRows((rows) =>
      rows.map((row, i) => {
        if (i !== customsIndex) return row;
        const newDimRows = row.dimRows.map((dim, j) =>
          j !== dimIndex
            ? dim
            : applyDimRowChange(dim, field as string, value, weightPrecision, cubePrecision, isTrkEnabled)
        );
        const rollup = field === 'unit' ? rollUpDimRows(newDimRows, weightPrecision, cubePrecision) : {};
        return { ...row, dimRows: newDimRows, ...rollup };
      })
    );
  };

  const addCustomsDimension = (customsIndex: number) => {
    setCustomsRows((rows) =>
      rows.map((row, i) =>
        i !== customsIndex
          ? row
          : { ...row, dimRows: [...row.dimRows, { ...initialDimRow }] }
      )
    );
  };

  const removeCustomsDimension = (customsIndex: number, dimIndex: number) => {
    setCustomsRows((rows) =>
      rows.map((row, i) => {
        if (i !== customsIndex) return row;
        if (row.dimRows.length <= 1) return row;
        const newDimRows = row.dimRows.filter((_, j) => j !== dimIndex);
        return { ...row, dimRows: newDimRows, ...rollUpDimRows(newDimRows, weightPrecision, cubePrecision) };
      })
    );
  };

  const updateCustomsHazardous = (
    customsIndex: number,
    hazIndex: number,
    field: string,
    value: unknown
  ) => {
    setCustomsRows((rows) =>
      rows.map((row, i) =>
        i !== customsIndex
          ? row
          : {
            ...row,
            hazRows: row.hazRows.map((haz, j) =>
              j !== hazIndex ? haz : { ...haz, [field]: value }
            ),
          }
      )
    );
  };

  const addCustomsHazardous = (customsIndex: number) => {
    setCustomsRows((rows) =>
      rows.map((row, i) =>
        i !== customsIndex
          ? row
          : { ...row, hazRows: [...row.hazRows, { ...initialHazRow }] }
      )
    );
  };

  const removeCustomsHazardous = (customsIndex: number, hazIndex: number) => {
    setCustomsRows((rows) =>
      rows.map((row, i) =>
        i !== customsIndex
          ? row
          : {
            ...row,
            hazRows:
              row.hazRows.length > 1
                ? row.hazRows.filter((_, j) => j !== hazIndex)
                : row.hazRows,
          }
      )
    );
  };

  const blurDimension = (cargoIndex: number, dimIndex: number, field: string, value: string) => {
    setCargoRows((rows) =>
      rows.map((row, i) => {
        if (i !== cargoIndex) return row;
        const newDimRows = row.dimRows.map((dim, j) => {
          if (j !== dimIndex) return dim;
          if (['length', 'width', 'height', 'pieces'].includes(field)) {
            const l = parseFloat(field === 'length' ? value : dim.length) || 0;
            const w = parseFloat(field === 'width'  ? value : dim.width)  || 0;
            const h = parseFloat(field === 'height' ? value : dim.height) || 0;
            const p = parseFloat(field === 'pieces' ? value : dim.pieces) || 0;
            if (l > 0 && w > 0 && h > 0) {
              const { cbm: unitCbm, cbf: unitCbf } = calcDimVolumes(l, w, h, dim.unit, cubePrecision);
              const totalCbm = p > 0 ? round(parseFloat(unitCbm) * p, cubePrecision + 1) : parseFloat(unitCbm);
              const totalCbf = p > 0 ? round(parseFloat(unitCbf) * p, cubePrecision) : parseFloat(unitCbf);
              const result = {
                ...dim,
                cbm: totalCbm.toFixed(cubePrecision + 1),
                cbf: totalCbf.toFixed(cubePrecision),
              };
              if (isTrkEnabled) result.cls = calculateTmsClass(result.lbs, result.cbf);
              return result;
            }
            return { ...dim, cbm: '', cbf: '' };
          }
          const sync = applyMeasurementSync(field, value, weightPrecision, cubePrecision);
          if (Object.keys(sync).length === 0) return dim;
          const updated = { ...dim, ...sync };
          if (isTrkEnabled) updated.cls = calculateTmsClass(updated.lbs, updated.cbf);
          return updated;
        });
        // return { ...row, dimRows: newDimRows, ...rollUpDimRows(newDimRows, weightPrecision, cubePrecision) };
        const rollup = rollUpDimRows(
          newDimRows,
          weightPrecision,
          cubePrecision
        );
        const hasAnyDimensionValue =
          newDimRows.some((dim) =>
            [
              dim.length,
              dim.width,
              dim.height,
              dim.pieces,
              dim.kg,
              dim.lbs,
              dim.cbm,
              dim.cbf,
            ].some(
              (v) =>
                v !== '' &&
                v !== null &&
                v !== undefined
            )
          );
        if (!hasAnyDimensionValue) {
          return {
            ...row,
            dimRows: newDimRows,
          };
        }
        const isDimensionRemoved =
          ['length', 'width', 'height'].includes(field) &&
        (
          value === '' ||
          value === null ||
          value === undefined
        );
        return {
          ...row,
          dimRows: newDimRows,
          ...(isDimensionRemoved
            ? {
                ...rollup,
                cbm: '',
                cbf: '',
              }
            : field === 'kg' ||
              field === 'lbs' ||
              field === 'cbm' ||
              field === 'cbf' ||
              field === 'pieces'
            ? {
                ...rollup,
                kg:
                  field === 'pieces'
                    ? row.kg || rollup.kg
                    : rollup.kg,
                lbs:
                  field === 'pieces'
                    ? row.lbs || rollup.lbs
                    : rollup.lbs,
                cbm: rollup.cbm,
                cbf: rollup.cbf,
                pieces: rollup.pieces,
              }
            : {
                kg: row.kg || rollup.kg,
                lbs: row.lbs || rollup.lbs,
                cbm:
                  ['length', 'width', 'height', 'pieces'].includes(field)
                    ? rollup.cbm
                    : row.cbm || rollup.cbm,
                cbf:
                  ['length', 'width', 'height', 'pieces'].includes(field)
                    ? rollup.cbf
                    : row.cbf || rollup.cbf,
                pieces:
                  row.pieces || rollup.pieces,
              }),
        };
      })
    );
  };

  const blurCustomsDimension = (customsIndex: number, dimIndex: number, field: string, value: string) => {
    setCustomsRows((rows) =>
      rows.map((row, i) => {
        if (i !== customsIndex) return row;
        const newDimRows = row.dimRows.map((dim, j) => {
          if (j !== dimIndex) return dim;
          if (['length', 'width', 'height', 'pieces'].includes(field)) {
            const l = parseFloat(field === 'length' ? value : dim.length) || 0;
            const w = parseFloat(field === 'width'  ? value : dim.width)  || 0;
            const h = parseFloat(field === 'height' ? value : dim.height) || 0;
            const p = parseFloat(field === 'pieces' ? value : dim.pieces) || 0;
            if (l > 0 && w > 0 && h > 0) {
              const { cbm: unitCbm, cbf: unitCbf } = calcDimVolumes(l, w, h, dim.unit, cubePrecision);
              const totalCbm = p > 0 ? round(parseFloat(unitCbm) * p, cubePrecision + 1) : parseFloat(unitCbm);
              const totalCbf = p > 0 ? round(parseFloat(unitCbf) * p, cubePrecision) : parseFloat(unitCbf);
              const result = {
                ...dim,
                cbm: totalCbm.toFixed(cubePrecision + 1),
                cbf: totalCbf.toFixed(cubePrecision),
              };
              if (isTrkEnabled) result.cls = calculateTmsClass(result.lbs, result.cbf);
              return result;
            }
            return { ...dim, cbm: '', cbf: '' };
          }
          const sync = applyMeasurementSync(field, value, weightPrecision, cubePrecision);
          if (Object.keys(sync).length === 0) return dim;
          const updated = { ...dim, ...sync };
          if (isTrkEnabled) updated.cls = calculateTmsClass(updated.lbs, updated.cbf);
          return updated;
        });
        return { ...row, dimRows: newDimRows, ...rollUpDimRows(newDimRows, weightPrecision, cubePrecision) };
      })
    );
  };

  // ── Standard dimensions handlers ───────────────────────────────────────────

  const applyStandardDimensions = (cargoIndex: number) => {
    if (!standardDimensionPreset) return;
    const presetDimRow: DimensionRowType = {
      length: standardDimensionPreset.length,
      width: standardDimensionPreset.width,
      height: standardDimensionPreset.height,
      unit: standardDimensionPreset.unit,
      pieces: standardDimensionPreset.pieces,
      cbm: standardDimensionPreset.cbm,
      cbf: standardDimensionPreset.cbf,
      kg: standardDimensionPreset.kg,
      lbs: standardDimensionPreset.lbs,
      stackable: standardDimensionPreset.stackable,
      shipmentType: standardDimensionPreset.shipmentType,
      stackingType: standardDimensionPreset.stackingType,
      cls: '', packageType: '-1', tailerType: '',
    };
    setCargoRows((rows) => [
      { ...(rows[cargoIndex] ?? { ...initialCargoRow, uom: preferredUom, hazardous: defaultHazardous }), dimRows: [presetDimRow], useStandardDimensions: true, isDimension: true },
    ]);
  };

  const clearStandardDimensions = (cargoIndex: number) => {
    setCargoRows((rows) =>
      rows.map((row, i) =>
        i !== cargoIndex
          ? row
          : { ...row, dimRows: [{ ...initialDimRow }], useStandardDimensions: false }
      )
    );
  };

  const applyCustomsStandardDimensions = (customsIndex: number) => {
    if (!standardDimensionPreset) return;
    const presetDimRow: DimensionRowType = {
      length: standardDimensionPreset.length,
      width: standardDimensionPreset.width,
      height: standardDimensionPreset.height,
      unit: standardDimensionPreset.unit,
      pieces: standardDimensionPreset.pieces,
      cbm: standardDimensionPreset.cbm,
      cbf: standardDimensionPreset.cbf,
      kg: standardDimensionPreset.kg,
      lbs: standardDimensionPreset.lbs,
      stackable: standardDimensionPreset.stackable,
      shipmentType: standardDimensionPreset.shipmentType,
      stackingType: standardDimensionPreset.stackingType,
      cls: '', packageType: '-1', tailerType: '',
    };
    setCustomsRows((rows) =>
      rows.map((row, i) =>
        i !== customsIndex
          ? row
          : { ...row, dimRows: [presetDimRow], useStandardDimensions: true, isDimension: true }
      )
    );
  };

  const clearCustomsStandardDimensions = (customsIndex: number) => {
    setCustomsRows((rows) =>
      rows.map((row, i) =>
        i !== customsIndex
          ? row
          : { ...row, dimRows: [{ ...initialDimRow }], useStandardDimensions: false }
      )
    );
  };

  // ── CBM dialog handlers ────────────────────────────────────────────────────

  const onCbmConfirm = () => {
    if (!pendingCbmUpdate) return;
    const { rowType, cargoIndex, value } = pendingCbmUpdate;
    const sync = applyMeasurementSync('cbm', value, weightPrecision, cubePrecision);
    const setter = rowType === 'actual' ? setCargoRows : setCustomsRows;
    setter((rows) =>
      rows.map((row, i) =>
        i !== cargoIndex ? row : { ...row, cbm: value, ...sync }
      )
    );
    setCbmOverrideAllowed(true);
    setCbmDialogOpen(false);
    setPendingCbmUpdate(null);
  };

  const onCbmCancel = () => {
    setCbmDialogOpen(false);
    setPendingCbmUpdate(null);
  };

  // ── FCL specifc fiedl handlers ─────────────────────────────────────────────────────────────

  const getContainerDataList = (
    patch?: Record<string, string | number | undefined>
  ): ContainerTypeList[] => {
    const containerDataList: ContainerTypeList[] = [];
    const currentRow = patch ? { ...cargoRows[0], ...patch } : cargoRows[0];

    if (currentRow.numberOfContainer1) {
      containerDataList.push({
        numberOfContainer: parseInt(String(currentRow.numberOfContainer1), 10),
        containerMapKey: currentRow.containerType1,
      });
    }
    if (currentRow.numberOfContainer2) {
      containerDataList.push({
        numberOfContainer: parseInt(String(currentRow.numberOfContainer2), 10),
        containerMapKey: currentRow.containerType2,
      });
    }
    if (currentRow.numberOfContainer3) {
      containerDataList.push({
        numberOfContainer: parseInt(String(currentRow.numberOfContainer3), 10),
        containerMapKey: currentRow.containerType3,
      });
    }

    return containerDataList;
  };

  //calculate teu value handler
  const updateContainerData = (
    numberOfContainer: string | number,
    containerType: string,
    rowNo: number,
    changedField: string,
    changedValue: string
  ) => {
    setCargoRows((prev) => {
      const updated = [...prev];
      updated[0] = { ...updated[0], reCalculateTEURate: !updated[0].reCalculateTEURate };
      return updated;
    });
    if (!rowNo) return;
    const containerDataList = getContainerDataList(
      changedField && changedValue
        ? {
          [`numberOfContainer${rowNo}`]: numberOfContainer,
          [`containerType${rowNo}`]: containerType,
          [changedField]: changedValue, // ✅ overrides the fresh changed field
        }
        : undefined
    );
    calculateTEU(
      'BKG',
      {
        getContainerData: () => containerDataList,
        setTotalTeu: (value) => {
          setTotalTeu(value);
        },
        // reCalculateAmountAndRecalculateAllCharges: () => {
        //   // TODO: RateDetails recalculate chargres function will be added once implemented
        //   // rateDetails.handlers
        //   //   .reCalculateAmountAndRecalculateAllCharges?.();

        // },
      },
      containerTypeBean
    )
  };

  // onChange/onBlur/onValue change handler
  const valueIsChanged = (valueChange: boolean, numberOfContainer: string, containerType: string, rateDetailsDefaultState: RateDetailsState) => {
    // TODO: Set ControFlag condition
    // if ( ) {
    //   const changedValue = `${numberOfContainer}x${containerType}`;

    //   if (cargoDetails.rateEquipmentContainerDataList.length > 0) {

    //     if (cargoDetails.rateEquipmentContainerDataList.includes(changedValue)) {
    //       valueChange = true;
    //     }
    //   }
    // }
    // const containerTypeLi = cargoDetails.containerDataList
    if (!valueChange) {
      // if (rateDetails.defaultState.equipmentDetailsList.length >= 1) {
      //   cargoDetails.setcontainerTypeList([]);
      //   rateDetails.defaultState.setEquipmentDetailsList([]);
      // }

      insertEquipmentValue(numberOfContainer, containerType, rateDetailsDefaultState);
    }
    // return valueChange;
  };

  const insertEquipmentValue = (numberOfContainer: string, containerType: string, rateDetailsDefaultState:RateDetailsState) => {
    const noOfContainer1 = "";
    const noOfContainer2 = "";
    const noOfContainer3 = "";

    let noOfContainerAddValue = 0;
    let removeContainerType = 0;

    let equipmentValue = numberOfContainer + "x" + containerType;
    let containerDisplayString = containerTypeSelect.find((item) => item.value === containerType)?.label;
    let equipmentString = numberOfContainer + " x " + containerDisplayString;
    const row = cargoRows[0];
    // ==========================================================
    const containers = [
      { type: row.containerType1, count: row.numberOfContainer1 },
      { type: row.containerType2, count: row.numberOfContainer2 },
      { type: row.containerType3, count: row.numberOfContainer3 },
    ];
    const grouped: Record<string, number> = {};
    containers.forEach((item) => {
      if (!item.type || item.type === '-1' || item.type === '') return;
      if (!item.count || item.count === '' || Number(item.count) <= 0) return;
      const numericCount = parseInt(item.count, 10);
      if (!numericCount || numericCount <= 0) return;
      grouped[item.type] = (grouped[item.type] ?? 0) + numericCount;
    });

    const newList: SelectOption[] = Object.keys(grouped).map((type) => {
      const total = grouped[type];
      const containerTypeValue =
        containerTypeSelect.find((opt) => opt.value === type)?.label || '';
      return {
        label: `${total} X ${containerTypeValue}`,
        value: `${total}X${type}`,
      };
    });
    setEquipmentSelection(newList, rateDetailsDefaultState);
  }

   const setEquipmentSelection = (newList: SelectOption[], rateDetailsDefaultState: RateDetailsState) => {
    const currentList = rateDetailsDefaultState.equipmentDetailsList || [];

    const isSame =
      newList.length === currentList.length - 1 &&
      newList.every((item) =>
        currentList.some((c) => c.value === item.value)
      );

    if (isSame) return;
     const updatedList: SelectOption[] = [
    {
      label: 'Select',
      value: '',
    },
    ...newList,
  ];
    rateDetailsDefaultState.setEquipmentDetailsList?.(updatedList);
  };

  // ── Auto-add dimension rows for eligible cargo rows ───────────────────────

  const addDimensionRowForEligibleCargoRows = (pickupNeeded: string, terms: string) => {
    const shouldAdd =
      (pickupNeeded === 'T' || pickupNeeded === 'Y') &&
      (terms === 'CFDR' || terms === 'DRDR');
    if (!shouldAdd) return;
    setCargoRows((rows) => {
      let hasChanges = false;
      const newRows = rows.map((row) => {
        if (row.controlFlag === 'D') return row;
        if (row.dimRows && row.dimRows.length > 0) return row;
        hasChanges = true;
        return { ...row, isDimension: true, dimRows: [{ ...initialDimRow }] };
      });
      return hasChanges ? newRows : rows;
    });
  };

  // ── Validation ─────────────────────────────────────────────────────────────

  const validate = (): { valid: boolean; errors: Record<string, string> } => {
    if (maxCbm !== null && !cbmOverrideAllowed) {
      const totalCbm = cargoRows.reduce((sum, row) => {
        const v = parseFloat(row.cbm);
        return sum + (isNaN(v) ? 0 : v);
      }, 0);
      if (totalCbm > maxCbm) {
        setCbmDialogOpen(true);
        return {
          valid: false,
          errors: {
            cbm: `Total CBM (${totalCbm}) exceeds the maximum allowed limit of ${maxCbm}.`,
          },
        };
      }
    }
    const errors = validateCargoRows(cargoRows);
    return { valid: Object.keys(errors).length === 0, errors };
  };

   // ── Return ─────────────────────────────────────────────────────────────────

   const truckingCargoRows = useMemo(() => toInternalCargoRows(cargoRows), [cargoRows]);

   const isTrkEnabled = useMemo(() => isVisible('BKG_QUOTE_TRUCKING_RATES_INTEGRATION'), [isVisible]);

   return {
    activeTab,
    setActiveTab,

    cargoState: { cargoRows } as CargoRowsState,
    setCargoRows,
    cargoHandlers: {
      updateCargoField,
      blurCargoField,
      blurDimension,
      addNewCargo,
      removeCargo,
      updateDimension,
      addDimension,
      removeDimension,
      updateHazardous,
      addHazardous,
      addHazardousWithValues,
      removeHazardous,
      applyStandardDimensions,
      clearStandardDimensions,
      valueIsChanged,
      updateContainerData
    } as CargoRowsHandlers,

    customsState: { customsRows } as CustomsRowsState,
    customsHandlers: {
      updateCustomsField,
      blurCustomsField,
      blurCustomsDimension,
      addNewCustoms,
      removeCustoms,
      updateCustomsDimension,
      addCustomsDimension,
      removeCustomsDimension,
      updateCustomsHazardous,
      addCustomsHazardous,
      removeCustomsHazardous,
      applyStandardDimensions: applyCustomsStandardDimensions,
      clearStandardDimensions: clearCustomsStandardDimensions,
    } as CustomsRowsHandlers,

    lotState,
    lotHandlers,
    lotRows,
    oldInternalComment,
    instructionState: {
      internalComment,
      loadingInstruction,
      warehouseInstruction,
    } as InstructionState,
    instructionHandlers: {
      setInternalCmt,
      setLoadingInstruction,
      setWarehouseInstruction,
    } as InstructionHandlers,

    flagState,
    flagHandlers,

    cbmDialogState: { cbmDialogOpen, maxCbm } as CbmDialogState,
    cbmDialogHandlers: { onCbmConfirm, onCbmCancel } as CbmDialogHandlers,
    
    packagingOptions,
    imoClassOptions,
    commodityOptions,
    clauseSuggestions,
    standardDimensionPreset: standardDimensionPreset ?? undefined,
    hasStandardDimensions,
    validate,
    bulkPopulateCargo,
    addDimensionRowForEligibleCargoRows,
    truckingCargoRows,
    isTrkEnabled,
    dimensionFlags,
    
    containerTypeSelect,
    fclhazardousSelect: fclHazardousOptions,
    // containerTypeList: containerTypeListRef.current,
    // setcontainerTypeList: (val: string[]) => {
    //   containerTypeListRef.current = val;
    // },
    setContainerDataList,
    containerDataList,
    setTotalTeu,
    totalTeu,
    getContainerDataList,
    containerTypeBean
  };
};
