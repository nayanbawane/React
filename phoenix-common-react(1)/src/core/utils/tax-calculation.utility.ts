import {
  getAllowedDecimalDigit,
  parseBigDecimal,
  parseBigdecimalToString,
  roundNumber,
} from './decimal-currency.utility';
import type { DecimalCurrencyConfig } from './utils.types';

export interface TaxBean {
  taxCode: string;
  taxPercent: string;
  taxText?: string;
  taxFormula?: string;
}

const AMOUNT_PLACEHOLDER = 'amount';

function getValueReplacedFormula(formula: string, amount: number): string {
  return formula.toLowerCase().replace(AMOUNT_PLACEHOLDER, parseBigdecimalToString(amount));
}

function evaluateFormula(formula: string): number {
  try {
    // eslint-disable-next-line no-new-func
    const result = new Function(`return (${formula})`)();
    return typeof result === 'number' && isFinite(result) ? result : 0;
  } catch {
    return 0;
  }
}

export function setArTaxBeanMap(
  taxSettingMap: Record<string, TaxBean> | null | undefined
): Record<string, TaxBean> {
  const arTaxBeanMap: Record<string, TaxBean> = {};
  if (!taxSettingMap) return arTaxBeanMap;
  for (const taxBean of Object.values(taxSettingMap)) {
    if (taxBean?.taxCode) {
      arTaxBeanMap[taxBean.taxCode] = taxBean;
    }
  }
  return arTaxBeanMap;
}

export function calculateArTax(
  amount: number,
  taxCode: string,
  decimals: number,
  arTaxBeanMap: Record<string, TaxBean>
): number {
  const taxBean = arTaxBeanMap[taxCode];
  if (!taxBean?.taxFormula) return 0;
  const formula = getValueReplacedFormula(taxBean.taxFormula, amount);
  const taxAmount = evaluateFormula(formula);
  return roundNumber(taxAmount, decimals);
}

export function calculateArTaxByCurrency(
  amount: string,
  taxCode: string,
  currency: string,
  arTaxBeanMap: Record<string, TaxBean>,
  config?: DecimalCurrencyConfig
): number {
  const decimals = getAllowedDecimalDigit(currency, config);
  return calculateArTax(parseBigDecimal(amount), taxCode, decimals, arTaxBeanMap);
}

export function calculateArTaxByDecimals(
  amount: string,
  taxCode: string,
  decimals: number,
  arTaxBeanMap: Record<string, TaxBean>
): number {
  return calculateArTax(parseBigDecimal(amount), taxCode, decimals, arTaxBeanMap);
}

export function calculateArTaxFromDouble(
  amount: number,
  taxCode: string,
  decimals: number,
  arTaxBeanMap: Record<string, TaxBean>
): number {
  return calculateArTax(amount, taxCode, decimals, arTaxBeanMap);
}

export function getArTaxDescription(
  taxCode: string,
  arTaxBeanMap: Record<string, TaxBean>
): string {
  return arTaxBeanMap[taxCode]?.taxText ?? '';
}

export function getArTaxFormula(
  taxCode: string,
  arTaxBeanMap: Record<string, TaxBean>
): string {
  return arTaxBeanMap[taxCode]?.taxFormula ?? '';
}

export function getVatChargeDescription(
  shortVatDescription: string,
  taxPercent: string,
  isTaxCalculationFormulaEnabled: boolean
): string {
  if (isTaxCalculationFormulaEnabled) return shortVatDescription;
  return `${shortVatDescription}@${taxPercent}%`;
}
