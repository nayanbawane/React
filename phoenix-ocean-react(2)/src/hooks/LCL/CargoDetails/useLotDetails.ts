import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import {
  initialLotRow,
  initialDimRow,
} from 'phoenix-common-react';
import type {
  CargoRowType,
  LotRowData,
  LotState,
  LotHandlers,
} from 'phoenix-common-react';
import { useCargoHeaderButtons } from './useCargoHeaderButtons';

interface UseLotDetailsParams {
  moduleCode?: 'BKG' | 'QUO' | 'PREBKG';
  showStatus?: (type: unknown, messages: string[]) => void;
  cargoRows: CargoRowType[];
  setCargoRows: Dispatch<SetStateAction<CargoRowType[]>>;
}

const getActiveRows = (rows: LotRowData[]) => rows.filter((r) => r.controlFlag !== 'D');

// Maps a UI (filtered) index to its actual position in the full rows array
const toActualIndex = (rows: LotRowData[], filteredIdx: number): number => {
  let count = -1;
  for (let i = 0; i < rows.length; i++) {
    if (rows[i].controlFlag !== 'D') {
      count++;
      if (count === filteredIdx) return i;
    }
  }
  return -1;
};

export const useLotDetails = ({
  moduleCode,
  showStatus,
  cargoRows,
  setCargoRows,
}: UseLotDetailsParams) => {
  const [lotRows, setLotRows] = useState<LotRowData[]>([{ ...initialLotRow }]);

  const { flagState, flagHandlers, nonStackableLotIdx, clearNonStackable } = useCargoHeaderButtons({
    moduleCode,
    lotRows,
    setLotRows,
  });

  const updateLotField = (lotIndex: number, field: string, value: unknown) => {
    const actualIdx = toActualIndex(lotRows, lotIndex);
    if (actualIdx === -1) return;

    if (field === 'type' && value !== 'Please Select') {
      const isDuplicate = getActiveRows(lotRows).some((r, i) => i !== lotIndex && r.type === value);
      if (isDuplicate) {
        showStatus?.('warning', ['Lot Comment is already selected.']);
        setLotRows((rows) => [...rows]);
        return;
      }
    }
    setLotRows((rows) =>
      rows.map((row, i) => (i === actualIdx ? { ...row, [field]: value } : row))
    );
    if (field === 'type' && value === 'ODM') {
      setCargoRows((rows) => {
        if (!rows.length) return rows;
        const firstRow = rows[0];
        if (firstRow.dimRows && firstRow.dimRows.length > 0) return rows;
        return [
          { ...firstRow, isDimension: true, dimRows: [{ ...initialDimRow }] },
          ...rows.slice(1),
        ];
      });
      const existingDim = cargoRows[0]?.dimRows?.[0];
      if (existingDim?.length && existingDim?.width && existingDim?.height) {
        const dimSummary = `Odd Dims-${existingDim.length}*${existingDim.width}*${existingDim.height}`;
        setLotRows((rows) =>
          rows.map((r, i) => (i === actualIdx ? { ...r, details: dimSummary } : r))
        );
      }
    }
  };

  const addNewLot = (afterFilteredIndex: number) => {
    const active = getActiveRows(lotRows);
    const types = active.map((r) => r.type.trim()).filter((t) => t !== '' && t !== 'Please Select');
    const hasDuplicate = types.length !== new Set(types).size;
    if (hasDuplicate) {
      showStatus?.('warning', ['Lot Comment is already selected.']);
      return;
    }
    const actualAfterIdx = toActualIndex(lotRows, afterFilteredIndex);
    setLotRows((rows) => {
      const newRows = [...rows];
      const insertAt = actualAfterIdx === -1 ? rows.length : actualAfterIdx + 1;
      newRows.splice(insertAt, 0, { ...initialLotRow });
      return newRows;
    });
  };

  const removeLot = (filteredIndex: number) => {
    if (getActiveRows(lotRows).length <= 1) {
      return;
    }

    const actualIdx = toActualIndex(lotRows, filteredIndex);
    if (actualIdx === -1) return;

    if (actualIdx === nonStackableLotIdx) {
      clearNonStackable();
    }
    setLotRows((rows) => {
      const row = rows[actualIdx];
      if (row.controlFlag === 'U') {
        return rows.map((r, i) => (i === actualIdx ? { ...r, controlFlag: 'D' as const } : r));
      }
      return rows.filter((_, i) => i !== actualIdx);
    });
  };

  return {
    lotRows,
    setLotRows,
    lotState: { lotRows: getActiveRows(lotRows) } as LotState,
    lotHandlers: { updateLotField, addNewLot, removeLot } as LotHandlers,
    flagState,
    flagHandlers,
  };
};
