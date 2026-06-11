import { useState } from 'react';
import { useSelector } from 'react-redux';
import { initialFlags, selectOfficeId, useContainerValidation } from 'phoenix-common-react';
import type { ContainerValidationRecord, DimensionChangePayload, DimensionRowType } from 'phoenix-common-react';

const UNIT_TO_VALIDATION_UNIT: Record<string, string> = {
  CM: 'C', Centimeters: 'C', M: 'C', Meters: 'C',
  IN: 'I', Inches: 'I', FT: 'I', Feet: 'I',
};

function resolveOverWeight(
  rows: DimensionRowType[],
  validationData: ContainerValidationRecord[]
): boolean {
  if (!validationData.length) return false;
  for (const row of rows) {
    const validationUnit = UNIT_TO_VALIDATION_UNIT[row.unit];
    if (!validationUnit) continue;
    const matchingRecords = validationData.filter(r => r.unit === validationUnit);
    if (!matchingRecords.length) continue;
    const minMaxSingleWeight = Math.min(...matchingRecords.map(r => parseFloat(r.maxSingleWeight)));
    const weight = validationUnit === 'C' ? parseFloat(row.kg) : parseFloat(row.lbs);
    if (!isNaN(weight) && !isNaN(minMaxSingleWeight) && weight > minMaxSingleWeight) return true;
  }
  return false;
}

export const useOverWeightButton = () => {
  const [overWeight, setOverWeight] = useState(initialFlags.overWeight);
  const officeId = useSelector(selectOfficeId);
  const { data: validationData } = useContainerValidation(officeId ?? 0);

  const handleToggle = () => setOverWeight(f => !f);

  const handleDimensionChange = (payload: DimensionChangePayload) => {
    setOverWeight(resolveOverWeight(payload.allDimRows, validationData));
  };

  const overWeightBtn = {
    key: 'overWeight',
    label: 'Over Weight',
    handler: handleToggle,
  };

  return { overWeight, overWeightBtn, handleToggle, handleDimensionChange };
};
