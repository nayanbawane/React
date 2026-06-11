import {
  CommonToggleKeys, CommonToggleKeyList,
  OceanToggleKeys, LclToggleKeys,
  FinanceToggleKeys,
  EIToggleKeys,
  AirToggleKeys,
} from './keys';
import type {
  CommonToggleKey,
  OceanToggleKey, LclToggleKey,
  FinanceToggleKey,
  EIToggleKey,
  AirToggleKey,
} from './keys';

export {
  CommonToggleKeys,
  CommonToggleKeyList,
  OceanToggleKeys,
  LclToggleKeys,
  FinanceToggleKeys,
  EIToggleKeys,
  AirToggleKeys,
};

export type {
  CommonToggleKey,
  OceanToggleKey,
  LclToggleKey,
  FinanceToggleKey,
  EIToggleKey,
  AirToggleKey,
};

export type ToggleKey =
  | CommonToggleKey
  | OceanToggleKey
  | LclToggleKey
  | FinanceToggleKey
  | EIToggleKey
  | AirToggleKey;

export interface RawFeatureToggleConfig {
  officeSettings?: Record<string, string>;
  userSettings?: Record<string, string>;
  locationSettings?: Record<string, Record<string, string>>;
  programSettings?: Record<string, Record<string, string>>;
}

export type ResolvedToggles = Record<string, string>;

export interface FeatureToggleContextValue {
  isVisible: (key: ToggleKey) => boolean;
  isMandatory: (key: ToggleKey) => boolean;
  isLoaded: boolean;
}

export const ToggleKeyList: ToggleKey[] = [
  ...CommonToggleKeyList,
  ...Object.values(OceanToggleKeys) as OceanToggleKey[],
  ...Object.values(LclToggleKeys) as LclToggleKey[],
  ...Object.values(FinanceToggleKeys) as FinanceToggleKey[],
  ...Object.values(EIToggleKeys) as EIToggleKey[],
  ...Object.values(AirToggleKeys) as AirToggleKey[],
];
