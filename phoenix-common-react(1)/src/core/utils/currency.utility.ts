import type { CurrencyUtilityBean, DecimalCurrencyConfig } from './utils.types';
import type { TaxBean } from './tax-calculation.utility';
import {
  calculateAmount,
  calculateTaxAmount as dcuCalculateTaxAmount,
  formatNumber,
} from './decimal-currency.utility';
import {
  setArTaxBeanMap,
  calculateArTaxByCurrency,
} from './tax-calculation.utility';

export type { CurrencyUtilityBean };
export type { CurrencyInput } from './utils.types';
export type { TaxEntry } from './utils.types';

export function formatAmountWithCurrencyDecimal(
  bean: CurrencyUtilityBean,
  config?: DecimalCurrencyConfig
): CurrencyUtilityBean {
  return bean.calculateAmount
    ? calculateAndFormatAmount(bean, config)
    : formatAmount(bean, config);
}

export function calculateAndFormatAmount(
  bean: CurrencyUtilityBean,
  config?: DecimalCurrencyConfig
): CurrencyUtilityBean {
  const roe = (bean.rateOfExchange ?? 0) > 0 ? bean.rateOfExchange! : 1;
  const formattedAmountDouble = calculateAmount(bean.currency, bean.amount, roe, config);
  const formattedAmountString = formatNumber(bean.currency, formattedAmountDouble, config)
    .replace(/,/g, '');
  return { ...bean, formattedAmountDouble, formattedAmountString };
}


export function calculateTaxAmount(
  bean: CurrencyUtilityBean,
  useFormulaToggle: boolean,
  arTaxBeanMap: Record<string, TaxBean> = {},
  config?: DecimalCurrencyConfig
): CurrencyUtilityBean {
  let formattedAmountDouble = 0;

  if (useFormulaToggle) {
    // Mirror GWT: iterate arTaxBeanMap values, find taxCode whose taxPercent matches bean.percentage
    let taxCode: string | null = null;
    const percentage = bean.percentage ?? 0;
    for (const taxBean of Object.values(arTaxBeanMap)) {
      if (taxBean?.taxPercent?.toLowerCase() === String(percentage).toLowerCase()) {
        taxCode = taxBean.taxCode;
      }
    }
    if (taxCode) {
      formattedAmountDouble = calculateArTaxByCurrency(
        String(bean.amount),
        taxCode,
        bean.currency,
        arTaxBeanMap,
        config
      );
    }
  } else {
    formattedAmountDouble = dcuCalculateTaxAmount(
      bean.currency,
      bean.amount,
      bean.percentage ?? 0,
      config
    );
  }

  return { ...bean, formattedAmountDouble };
}

export function formatAmount(
  bean: CurrencyUtilityBean,
  config?: DecimalCurrencyConfig
): CurrencyUtilityBean {
  const formattedAmountString = formatNumber(bean.currency, bean.amount, config)
    .replace(/,/g, '');
  return {
    ...bean,
    formattedAmountDouble: getDoubleValue(formattedAmountString),
    formattedAmountString,
  };
}

export function getDoubleValue(input: string | null | undefined): number {
  return input != null && isNumeric(input) ? parseFloat(input) : 0;
}

function isNumeric(str: string): boolean {
  return !isNaN(parseFloat(str)) && isFinite(Number(str));
}


export { setArTaxBeanMap };
export type { TaxBean };
