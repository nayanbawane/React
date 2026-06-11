import type { RawFeatureToggleConfig, ResolvedToggles, CommonToggleKey } from './featureToggle.types';
import { CommonToggleKeys } from './featureToggle.types';
import { ShipmentStatusConstants } from '../shipmentStatus/ShipmentStatusConstants';
import type { LoginClientBeanRaw } from './loginClientBean.types';

export function resolveToggles(raw: RawFeatureToggleConfig): ResolvedToggles {
  return {
    ...raw.officeSettings,
    ...raw.userSettings,
  };
}


export function isEnabled(resolved: ResolvedToggles, key: string): boolean {
  const value = resolved[key];
  return typeof value === 'string' && value.toUpperCase() === 'Y';
}

export function isUserEnabled(raw: RawFeatureToggleConfig, key: string): boolean {
  const value = raw.userSettings?.[key];
  return typeof value === 'string' && value.toUpperCase() === 'Y';
}

export function isLocationEnabled(
  raw: RawFeatureToggleConfig,
  location: string,
  key: string
): boolean {
  const value = raw.locationSettings?.[location]?.[key];
  return typeof value === 'string' && value.toUpperCase() === 'Y';
}

export function getToggleValue(resolved: ResolvedToggles, key: string): string | undefined {
  return resolved[key];
}

export function adaptLoginClientBeanToToggles(bean: LoginClientBeanRaw): RawFeatureToggleConfig {
  const pick0 = (map: Record<string, string[]> = {}): Record<string, string> =>
    Object.fromEntries(
      Object.entries(map).flatMap(([k, v]) => (v[0] != null ? [[k, v[0]]] : []))
    );

  const pickNested0 = (
    map: Record<string, Record<string, string[]>> = {}
  ): Record<string, Record<string, string>> =>
    Object.fromEntries(Object.entries(map).map(([prog, inner]) => [prog, pick0(inner)]));

  return {
    officeSettings: pick0(bean?.officeSettingMap),
    userSettings: pick0(bean?.userSettingMap),
    programSettings: pickNested0(bean?.programSettingMap),
    locationSettings: pickNested0(bean?.locationSettingMap),
  };
}

export function getSaveTempNoteByModule(module: string): CommonToggleKey {
  const m = module.toUpperCase();
  if (m === ShipmentStatusConstants.QUO_MODULE || m === 'QUOTE') return CommonToggleKeys.SAVE_TEMP_NOTE_QUO;
  if (m === ShipmentStatusConstants.BKG_MODULE || m === 'BOOKING') return CommonToggleKeys.SAVE_TEMP_NOTE_BKG;
  if (m === ShipmentStatusConstants.LOT_MODULE) return CommonToggleKeys.SAVE_TEMP_NOTE_LOT;
  if (m === ShipmentStatusConstants.ARN_MODULE) return CommonToggleKeys.SAVE_TEMP_NOTE_ARN;
  return CommonToggleKeys.SAVE_TEMP_NOTE;
}
