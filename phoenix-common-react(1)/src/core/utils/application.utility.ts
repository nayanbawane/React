import { isFlagOn, isNumeric, isNotNullOrEmpty, getEmptyIfNull } from './string.utility';
import { VAT_CHARGE_CODE } from './application-client-constant.utility';
import { CommonToggleKeys } from '../featureToggles/keys';

/**
 * Server-side configuration map loaded at application startup.
 * Equivalent of the GWT `loadConfigurationData` HashMap<String, String>.
 */
export type AppConfigMap = Record<string, string>;

function getConfigValue(configMap: AppConfigMap | null | undefined, key: string): string {
  return configMap?.[key] ?? '';
}

export function isChangePasswordFlagOn(configMap: AppConfigMap | null | undefined): boolean {
  const key = 'CHANGE_PASSWORD_FUNCTIONALITY_ACTIVATED';
  if (!configMap || !(key in configMap)) return true;
  return isFlagOn(configMap[key]);
}

export function isADFSEnabled(configMap: AppConfigMap | null | undefined): boolean {
  const key = 'IS_ADFS_ENABLED';
  if (!configMap || !(key in configMap)) return false;
  return isFlagOn(configMap[key]);
}

export function isActiveDirectory(configMap: AppConfigMap | null | undefined): boolean {
  const key = 'AD_ACTIVATED';
  if (!configMap || !(key in configMap)) return false;
  return isFlagOn(configMap[key]);
}

export function getChromeVersion(configMap: AppConfigMap | null | undefined): number {
  const raw = getConfigValue(configMap, 'CHROME_VERSION');
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function getPhoenixNotSupportedValue(configMap: AppConfigMap | null | undefined): string {
  return getConfigValue(configMap, 'PHOENIX_NOT_SUPPORTED');
}

export function getCheckChromeVersion(configMap: AppConfigMap | null | undefined): string {
  return getConfigValue(configMap, 'CHECK_CHROME_VERSION');
}

export function getApplicationSetting(
  configMap: AppConfigMap | null | undefined,
  code: string
): string {
  return getConfigValue(configMap, code);
}

export function isCopyMultipleRates(configMap: AppConfigMap | null | undefined): boolean {
  const key = 'COPY_MULTI_RATES_TO_MULTI_COMP_CUST';
  if (!configMap || !(key in configMap)) return false;
  return isFlagOn(configMap[key]);
}

export function isDragDropFeatureEnabled(configMap: AppConfigMap | null | undefined): boolean {
  const key = 'DRAG_DROP_EMAIL_ENABLED';
  if (!configMap || !(key in configMap)) return false;
  return isFlagOn(configMap[key]);
}

/**
 * Returns the Oracle Form plug-in setting value.
 * Defaults to `'N'` when the key is absent.
 */
export function getOracleFormPlugin(configMap: AppConfigMap | null | undefined): string {
  const value = getConfigValue(configMap, 'ORACLE_FORM_PLUGIN');
  return value || 'N';
}

export function isADEnabled(configMap: AppConfigMap | null | undefined): boolean {
  const key = 'ENABLE_AD_SUPPORT_FOR_CUSTOMER';
  if (!configMap || !(key in configMap)) return false;
  return isFlagOn(configMap[key]);
}

export function getTimerSchedule(configMap: AppConfigMap | null | undefined): number {
  const raw = getConfigValue(configMap, 'TIMER_SCHEDULE');
  const parsed = parseInt(raw, 10);
  return isNaN(parsed) ? 30000 : parsed;
}

export function isVatExclude(
  chargeCode: string,
  isFeatureEnabled: (key: string) => boolean
): boolean {
  return !(
    isFeatureEnabled(CommonToggleKeys.RATE_DETAILS_EXCLUDE_VAT_FROM_TOTAL) &&
    VAT_CHARGE_CODE.toLowerCase() === chargeCode.toLowerCase()
  );
}

export function isVatExcludeWithToggle(
  chargeCode: string,
  toggleKey: string,
  isFeatureEnabled: (key: string) => boolean
): boolean {
  return !(
    isFeatureEnabled(toggleKey) &&
    VAT_CHARGE_CODE.toLowerCase() === chargeCode.toLowerCase()
  );
}

export function isDecimalCurrencyToggle(isFeatureEnabled: (key: string) => boolean): boolean {
  return isFeatureEnabled(CommonToggleKeys.OCEAN_CURRENCY_DECIMAL);
}

export function isDecimalCurrencyToggleForAir(isFeatureEnabled: (key: string) => boolean): boolean {
  return isFeatureEnabled(CommonToggleKeys.AIR_CURRENCY_DECIMAL);
}

export function isDisplayRollDelayCheckBoxToggle(
  isFeatureEnabled: (key: string) => boolean
): boolean {
  return !isFeatureEnabled(CommonToggleKeys.OCEAN_CLP_HIDE_SELECT_ALL_ROLL_DELAY);
}

/**
 * @param isFeatureEnabled   Injected feature-toggle checker.
 * @param getToggleValue     Injected toggle-value accessor (used for the
 *                           restricted-countries office setting).
 * @param userMainOfficeCountry  Country code from the logged-in user's bean.
 */
export function restrictGoogleMapServiceCall(
  isFeatureEnabled: (key: string) => boolean,
  getToggleValue: (key: string) => string | undefined,
  userMainOfficeCountry: string | null | undefined
): boolean {
  if (!isFeatureEnabled(CommonToggleKeys.QRLITE_DISABLE_GOOGLE_MAP_SERVICE_CALL)) return false;
  if (!isNotNullOrEmpty(userMainOfficeCountry ?? '')) return false;

  const restrictedCountries = getEmptyIfNull(
    getToggleValue(CommonToggleKeys.QRLITE_DISABLE_GOOGLE_MAP_SERVICE_CALL_COUNTRIES) ?? ''
  );
  return restrictedCountries.includes(userMainOfficeCountry!);
}

export function increaseAmendmentCode(amendmentCode: string): string | null {
  if (!isNumeric(amendmentCode)) return '';
  try {
    const counter = parseInt(amendmentCode, 10) + 1;
    return counter < 10 ? `0${counter}` : String(counter);
  } catch {
    return null;
  }
}
