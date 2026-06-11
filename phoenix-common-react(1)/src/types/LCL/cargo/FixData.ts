export const STACKING_OPTIONS = [
  { label: 'Please Select', value: '-1' },
  { label: 'Stackable – Oversize Dims', value: 'OD' },
  { label: 'Stackable – Standard Dims', value: 'SD' },
  { label: 'Top Load Only', value: 'TL' },
  { label: 'Non-Stackable', value: 'NS' },
];

export const FIELD_LABELS: Record<string, string> = {
  length: 'Length', width: 'Width', height: 'Height',
  pieces: 'Pieces', cbm: 'Cbm', cbf: 'Cbf', kg: 'Kg', lbs: 'Lbs', cls: 'Class',
};
