import { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  CommonToggleKeys,
  useFeatureToggle,
  localStorageHelper,
  selectOfficeCode,
  selectOfficeId,
  useContainerValidation,
} from 'phoenix-common-react';
import type {
  CargoFlagsType,
  ContainerValidationRecord,
  DimensionChangePayload,
  DimensionRowType,
} from 'phoenix-common-react';

const priortyArr = [
  'fortyContainer',
  'fortyFiveContainer',
  'fiftyThreeTrailer',
  'overLength',
];
const btnMapper: Record<string, string> = {
  '40_CONTR': 'fortyContainer',
  '45_CONTR': 'fortyFiveContainer',
  '53_CONTR': 'fiftyThreeTrailer',
  'CONTAINER_OL': 'overLength',
};
const BUTTON_LABELS: Record<string, string> = {
  fortyContainer: '40 CNTR Required',
  fortyFiveContainer: '45 CNTR Required',
  fiftyThreeTrailer: '53 Trailer Required',
  overLength: 'Over Length',
};
const UNIT_KEY_ALIASES: Record<string, string[]> = {
  Inches: ['Inches', 'IN'],
  Centimeters: ['Centimeters', 'CM'],
  Feet: ['Feet', 'FT'],
  Meters: ['Meters', 'M'],
};
export const useContainerFlagButtons = () => {
  const [activeContainerKey, setActiveContainerKey] = useState<string | null>(null);
  const [overWeight, setOverWeight] = useState(false);
  const { isVisible } = useFeatureToggle();
  const officeCode = useSelector(selectOfficeCode);
  const officeId = useSelector(selectOfficeId);
  const { data: validationData } = useContainerValidation(officeId ?? 0);
  const { data: rawData } = localStorageHelper({
    officeCode: officeCode ?? '',
    groupName: 'CONTAIER_REQUEIRED_SETTING',
    userOfficeId: officeId ?? ''
  });

  const containerMapping = useMemo(
    () => transformContainerMapping({ containerMappingData: rawData }),
    [rawData]
  );

  const activeContainerKeys = useMemo(() => {
    const seen = new Set<string>();
    Object.values(containerMapping).forEach(entries => {
      entries.forEach(({ button }) => {
        const mapped = btnMapper[button];
        if (mapped) seen.add(mapped);
      });
    });
    return priortyArr.filter(k => seen.has(k));
  }, [containerMapping]);

  const flags = useMemo(() => ({
    ...Object.fromEntries(priortyArr.map((k): [string, boolean] => [k, k === activeContainerKey])),
    overWeight,
  }), [activeContainerKey, overWeight]);

  const handleContainerExclusiveToggle = (key: string) => {
    setActiveContainerKey(key);
  };

  const handleSimpleToggle = (key: keyof CargoFlagsType) => {
    if (key === 'overWeight') setOverWeight(f => !f);
  };

  const handleDimensionChange = (payload: DimensionChangePayload) => {
    handleGenBaseChange(payload);
    setOverWeight(resolveOverWeight(payload.allDimRows, validationData));
  };

  const handleGenBaseChange = (payload: DimensionChangePayload) => {
    const exceedButtons: string[] = [];
    payload.allDimRows.forEach((row) => {
      const { unit, length } = row;
      if (!length) return;

      const button = findNearestContainer(containerMapping, unit, parseFloat(length));
      if (!button) return;
      exceedButtons.push(button);
    });

    if (exceedButtons.length === 0) {
      setActiveContainerKey(null);
      return;
    }

    const highPriorityBtn = highPriorityButtonFromLs(exceedButtons);
    setActiveContainerKey(highPriorityBtn ?? null);
  };

  const showContainerBtns = isVisible(
    CommonToggleKeys.OCN_FRGHT_OVER_LENGH_CONTAINER
  );

  const containerBtns = showContainerBtns
    ? [
        ...activeContainerKeys.map(key => ({
          key,
          label: BUTTON_LABELS[key] ?? key,
          handler: () => handleContainerExclusiveToggle(key),
        })),
        { key: 'overWeight', label: 'Over Weight', handler: () => setOverWeight(f => !f) },
      ]
    : [];

  return {
    flags,
    containerBtns,
    handleContainerExclusiveToggle,
    handleSimpleToggle,
    handleDimensionChange,
  };
};
const UNIT_TO_VALIDATION_UNIT: Record<string, string> = {
  CM: 'C', Centimeters: 'C', M: 'C', Meters: 'C',
  IN: 'I', Inches: 'I', FT: 'I', Feet: 'I',
};
function resolveOverWeight(rows: DimensionRowType[], validationData: ContainerValidationRecord[]): boolean {
  if (!validationData.length) return false;
  for (const row of rows) {
    const validationUnit = UNIT_TO_VALIDATION_UNIT[row.unit];
    if (!validationUnit) continue;
    const matching = validationData.filter(r => r.unit === validationUnit);
    if (!matching.length) continue;
    const maxSingle = Math.min(...matching.map(r => parseFloat(r.maxSingleWeight)));
    const weight = validationUnit === 'C' ? parseFloat(row.kg) : parseFloat(row.lbs);
    if (!isNaN(weight) && !isNaN(maxSingle) && weight > maxSingle) return true;
  }
  return false;
}
function transformContainerMapping(payload: {
  containerMappingData?: Array<Record<string, string>>;
}) {
  const result: Record<string, Array<{ button: string; v: string }>> = {};
  if (
    !payload ||
    !payload.containerMappingData ||
    !Array.isArray(payload.containerMappingData)
  ) {
    return result;
  }
  payload.containerMappingData.forEach((obj: Record<string, string>) => {
    if (!obj || typeof obj !== 'object') return;

    const keys = Object.keys(obj);
    if (keys.length === 0) return;

    const originalKey = keys[0];

    const value = obj[originalKey];
    if (!originalKey || value == null) return;

    const parts = originalKey.split('_');
    if (parts.length < 3) return; // invalid format safeguard


    const unit = parts.pop();
    if (!unit) return;

    if (parts[parts.length - 1] === 'IN') {
      parts.pop();
    }

    parts.shift();
    if (parts.length < 2) return; // ensure we have enough parts

    const button = parts.slice(0, 2).join('_');
    if (!result[unit]) {
      result[unit] = [];
    }
    result[unit].push({
      button: button,
      v: value,
    });
  });
  return result;
}
function highPriorityButtonFromLs(inputButtons: string[]) {

  let bestMatch = priortyArr[0];
  let highestIndex = -1;

  for (const btn of inputButtons) {
    if(btn === 'DEFAULT_CONTR')      continue;
    const index = priortyArr.indexOf(btnMapper[btn]);

    if (index > highestIndex) {
      highestIndex = index;
      bestMatch = priortyArr[index];
    }
  }
  if (highestIndex === -1) return undefined;
  return bestMatch;
}
function findNearestContainer(
  config: Record<string, Array<{ button: string; v: string }>>,
  unit: string,
  length: number
): string | undefined {
  if (!config || !unit || length == null) return undefined;

  const configKeys = Object.keys(config);
  let key = configKeys.find(k => k.toUpperCase() === unit.toUpperCase());
  if (!key) {
    for (const aliases of Object.values(UNIT_KEY_ALIASES)) {
      if (aliases.some(a => a.toUpperCase() === unit.toUpperCase())) {
        key = configKeys.find(k => aliases.some(a => a.toUpperCase() === k.toUpperCase()));
        break;
      }
    }
  }
  if (!key) return undefined;

  const entries = config[key];
  if (!Array.isArray(entries) || entries.length === 0) return undefined;

  const sorted = [...entries]
    .map(e => ({ button: e.button, v: parseFloat(e.v) }))
    .filter(e => !isNaN(e.v))
    .sort((a, b) => a.v - b.v);

  if (sorted.length === 0) return undefined;
  const match = sorted.find(e => e.v >= length);
  return match ? match.button : sorted[sorted.length - 1].button;
}

