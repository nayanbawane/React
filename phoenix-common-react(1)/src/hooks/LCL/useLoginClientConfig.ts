import { useMemo } from 'react';
import { useAppSelector } from '../../app/store/hooks';
import {
  selectDecimalCurrencyConfig,
  selectTaxSettingMap,
} from '../../core/featureToggles/featureToggle.selectors';
import { setArTaxBeanMap } from '../../core/utils/tax-calculation.utility';
import type { DecimalCurrencyConfig } from '../../core/utils/utils.types';
import type { TaxBean } from '../../core/utils/tax-calculation.utility';

export function useDecimalCurrencyConfig(): DecimalCurrencyConfig {
  return useAppSelector(selectDecimalCurrencyConfig);
}

export function useArTaxBeanMap(): Record<string, TaxBean> {
  const taxSettingMap = useAppSelector(selectTaxSettingMap);
  return useMemo(
    () => setArTaxBeanMap(taxSettingMap as Record<string, TaxBean>),
    [taxSettingMap]
  );
}
