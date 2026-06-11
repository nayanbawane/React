import type { RootState } from '../../app/store/store';
import { isEnabled, isUserEnabled, isLocationEnabled, getToggleValue } from './featureToggle.utils';
import type { ToggleKey } from './featureToggle.types';
import type { LoginClientBeanState } from './loginClientBeanSlice';
import type { DecimalCurrencyConfig, TaxInfo } from '../utils/utils.types';

export const selectResolved = (state: RootState) => state.featureToggle.resolved;
export const selectRaw = (state: RootState) => state.featureToggle.raw;
export const selectIsLoaded = (state: RootState) => state.featureToggle.isLoaded;

// isFeatureEnabled — checks merged office+user settings
export const selectIsVisible = (key: ToggleKey) => (state: RootState) =>
    isEnabled(state.featureToggle.resolved, key);

// isFeatureEnabled
export const selectIsMandatory = (key: ToggleKey) => (state: RootState) =>
    isEnabled(state.featureToggle.resolved, key);

// isUserFeatureEnabled — checks userSettings only
export const selectIsUserEnabled = (key: ToggleKey) => (state: RootState) =>
    isUserEnabled(state.featureToggle.raw, key);

// isLocationFeatureEnabled — checks locationSettings[location][key]
export const selectIsLocationEnabled = (location: string, key: ToggleKey) => (state: RootState) =>
    isLocationEnabled(state.featureToggle.raw, location, key);

// getOfficeSettingValue — returns raw string instead of boolean
export const selectToggleValue = (key: ToggleKey) => (state: RootState) =>
    getToggleValue(state.featureToggle.resolved, key);

// LoginClientBean selectors — accept any state that has a loginClientBean key
export const selectLoginClientBean = (state: { loginClientBean: LoginClientBeanState }) =>
  state.loginClientBean.data;

export const selectLoginClientBeanLoaded = (state: { loginClientBean: LoginClientBeanState }) =>
  state.loginClientBean.isLoaded;

export const selectUserOffice = (state: { loginClientBean: LoginClientBeanState }) =>
  state.loginClientBean.data?.office;

export const selectUserId = (state: { loginClientBean: LoginClientBeanState }) =>
  state.loginClientBean.data?.userId;

export const selectPhoenixApiUrl = (state: { loginClientBean: LoginClientBeanState }) =>
  state.loginClientBean.data?.phoenixApiUrl;

export const selectCountryMap = (state: { loginClientBean: LoginClientBeanState }) =>
  state.loginClientBean.data?.countryMap;

export const selectOfficeCode = (state: { loginClientBean: LoginClientBeanState }) =>
  state.loginClientBean.data?.ldapOfficeCode;

export const selectOfficeId = (state: { loginClientBean: LoginClientBeanState }) =>
  state.loginClientBean.data?.officeId;

export const selectCurrencyDecimalMap = (state: { loginClientBean: LoginClientBeanState }): Record<string, number> =>
  (state.loginClientBean.data?.currencyDecimalMap ?? {}) as Record<string, number>;

export const selectTaxSettingMap = (state: { loginClientBean: LoginClientBeanState }): Record<string, TaxInfo> =>
  (state.loginClientBean.data?.taxSettingMap ?? {}) as Record<string, TaxInfo>;

export const selectDecimalCurrencyConfig = (state: { loginClientBean: LoginClientBeanState }): DecimalCurrencyConfig => ({
  currencyDecimalMap: (state.loginClientBean.data?.currencyDecimalMap ?? {}) as Record<string, number>,
  localCurrency: state.loginClientBean.data?.localCurrency ?? 'USD',
});
