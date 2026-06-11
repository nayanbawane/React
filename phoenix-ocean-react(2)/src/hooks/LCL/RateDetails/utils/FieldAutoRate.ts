import { CommonToggleKeys, ToggleKey, useFeatureToggle } from 'phoenix-common-react';

export type FieldAutoRateField =
  | 'ROUTING_ETS'
  | 'ROUTING_LOCATION'
  | 'MEASURE_KG'
  | 'MEASURE_CBM'
  | 'MEASURE_LBS'
  | 'MEASURE_CBF'
  | 'HAZARDOUS'
  | 'CUSTOMER'
  | 'CREATE_ON'
  | 'SAILING_SCHEDULE';

export const AUTORATE_DISABLED_TOGGLE: Record<FieldAutoRateField, ToggleKey> = {
  ROUTING_ETS: CommonToggleKeys.AUTORATE_CFM_DISABLED_ROUTING_ETS,
  ROUTING_LOCATION: CommonToggleKeys.AUTORATE_CFM_DISABLED_ROUTING_LOCATION,
  MEASURE_KG: CommonToggleKeys.AUTORATE_CFM_DISABLED_MEASURE_KG,
  MEASURE_CBM: CommonToggleKeys.AUTORATE_CFM_DISABLED_MEASURE_CBM,
  MEASURE_LBS: CommonToggleKeys.AUTORATE_CFM_DISABLED_MEASURE_LBS,
  MEASURE_CBF: CommonToggleKeys.AUTORATE_CFM_DISABLED_MEASURE_CBF,
  HAZARDOUS: CommonToggleKeys.AUTORATE_CFM_DISABLED_HAZARDOUS,
  CUSTOMER: CommonToggleKeys.AUTORATE_CFM_DISABLED_CUSTOMER,
  CREATE_ON: CommonToggleKeys.AUTORATE_CFM_DISABLED_CREATE_ON,
  SAILING_SCHEDULE: CommonToggleKeys.AUTORATE_CFM_DISABLED_SAILING_SCHEDULE,
};

export const WEIGHT_VOLUME_FIELDS = new Set<FieldAutoRateField>([
  'MEASURE_KG',
  'MEASURE_CBM',
  'MEASURE_LBS',
  'MEASURE_CBF',
]);

export const isWeightVolumeField = (field: FieldAutoRateField): boolean =>
  WEIGHT_VOLUME_FIELDS.has(field);

export const isAutoRateDisabled = (
  field: FieldAutoRateField,
  isVisible: ReturnType<typeof useFeatureToggle>['isVisible']
): boolean => isVisible(AUTORATE_DISABLED_TOGGLE[field]);
