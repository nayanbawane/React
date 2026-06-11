import { useState } from 'react';
import {
  useGetSelections,
  packagingSelectionConfig,
  initialCargoRow,
} from 'phoenix-common-react';
import type { CargoRowType } from 'phoenix-common-react';

const PRECISION = 3;

function round(val: number): string {
  return parseFloat(val.toFixed(PRECISION)).toFixed(PRECISION);
}

function applyMeasurementSync(field: string, value: string): Record<string, string> {
  if (value === '') {
    if (field === 'kg') return { lbs: '' };
    if (field === 'lbs') return { kg: '' };
    if (field === 'cbm') return { cbf: '' };
    if (field === 'cbf') return { cbm: '' };
    return {};
  }
  const num = parseFloat(value);
  if (isNaN(num)) return {};
  if (field === 'kg') return { lbs: round(num * 2.20462) };
  if (field === 'lbs') return { kg: round(num / 2.20462) };
  if (field === 'cbm') return { cbf: round(num * 35.3147) };
  if (field === 'cbf') return { cbm: round(num / 35.3147) };
  return {};
}

export const useCfsCargoDetails = () => {
  const { data: packagingOptions } = useGetSelections(packagingSelectionConfig);

  const [cargoRows, setCargoRows] = useState<CargoRowType[]>([
    { ...initialCargoRow },
  ]);

  const updateCargoField = (idx: number, field: string, value: unknown) => {
    if (field === 'sensitiveCargo') {
      setCargoRows((rows) => rows.map((row) => ({ ...row, sensitiveCargo: value as boolean })));
      return;
    }
    setCargoRows((rows) =>
      rows.map((row, i) => (i !== idx ? row : { ...row, [field]: value }))
    );
  };

  const blurCargoField = (idx: number, field: string, value: string) => {
    const sync = applyMeasurementSync(field, value);
    if (Object.keys(sync).length === 0) return;
    setCargoRows((rows) =>
      rows.map((row, i) => (i !== idx ? row : { ...row, ...sync }))
    );
  };

  const addNewCargo = () => {
    const sensitiveCargo = cargoRows.some((r) => r.sensitiveCargo === true);
    setCargoRows((rows) => [...rows, { ...initialCargoRow, sensitiveCargo }]);
  };

  const removeCargo = (idx: number) => {
    setCargoRows((rows) => (rows.length > 1 ? rows.filter((_, i) => i !== idx) : rows));
  };

  const bulkPopulate = (rows: CargoRowType[]) => {
    if (rows.length) setCargoRows(rows);
  };

  return {
    cargoRows,
    updateCargoField,
    blurCargoField,
    addNewCargo,
    removeCargo,
    bulkPopulate,
    packagingOptions,
  };
};
