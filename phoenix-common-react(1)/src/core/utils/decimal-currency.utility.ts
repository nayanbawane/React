import type { DecimalCurrencyConfig } from './utils.types';

export type { DecimalCurrencyConfig };

export const NO_DECIMAL_PATTERN = '#,##0';

function getIsoDecimalDigit(currency: string): number {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency })
      .resolvedOptions().maximumFractionDigits ?? 2;
  } catch {
    return 2;
  }
}

export function getAllowedDecimalDigit(currency: string, config?: DecimalCurrencyConfig): number {
  if (!config) return getIsoDecimalDigit(currency);
  const cur = currency || config.localCurrency;
  return config.currencyDecimalMap[cur] ?? config.currencyDecimalMap[config.localCurrency] ?? 2;
}

export function roundNumber(number: number, scale: number): number {
  if (number == null) return 0;
  return parseFloat(number.toFixed(scale));
}

export function roundNumberByCurrency(number: number, currency: string, config?: DecimalCurrencyConfig): number {
  return roundNumber(number ?? 0, getAllowedDecimalDigit(currency, config));
}

export function roundNumberString(text: string, scale: number): string {
  return roundNumber(parseBigDecimal(text), scale).toString();
}

export function calculateAmount(
  currency: string,
  amount: number,
  roe: number,
  config?: DecimalCurrencyConfig
): number {
  const effectiveRoe = roe ?? 1;
  const effectiveAmount = amount ?? 0;
  return roundNumberByCurrency(effectiveAmount * effectiveRoe, currency, config);
}

export function calculateAmountUsingDivide(
  currency: string,
  amount: number,
  roe: number,
  config?: DecimalCurrencyConfig
): number {
  const effectiveRoe = roe && roe !== 0 ? roe : 1;
  return roundNumberByCurrency((amount ?? 0) / effectiveRoe, currency, config);
}

export function calculateTaxAmount(
  currency: string,
  amount: number,
  percentage: number,
  config?: DecimalCurrencyConfig
): number {
  const taxAmount = ((amount ?? 0) * (percentage ?? 0)) / 100;
  return roundNumberByCurrency(taxAmount, currency, config);
}

export function formatNumber(currency: string, amount: number, config?: DecimalCurrencyConfig): string {
  const decimals = getAllowedDecimalDigit(currency, config);
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount ?? 0);
}

export function parseBigDecimal(textAmount: string | null | undefined): number {
  try {
    if (!textAmount) return 0;
    return parseFloat(textAmount.replace(/,/g, '').trim()) || 0;
  } catch {
    return 0;
  }
}

export function parseBigDecimalNumber(amount: number): number {
  try {
    return amount ?? 0;
  } catch {
    return 0;
  }
}

export function parseBigDecimalWithScale(amount: number, scale: number): number {
  try {
    return roundNumber(amount ?? 0, scale);
  } catch {
    return 0;
  }
}

export function parseDouble(textAmount: string | null | undefined): number {
  try {
    if (!textAmount) return 0;
    return parseFloat(textAmount.replace(/,/g, '')) || 0;
  } catch {
    return 0;
  }
}

export function parseBigdecimalToString(amount: number | null | undefined): string {
  if (amount == null) return '0';
  try {
    return String(amount);
  } catch {
    return '0';
  }
}

export function parseDoubleToString(amount: number | null | undefined): string {
  if (amount == null) return '0';
  try {
    return String(amount);
  } catch {
    return '0';
  }
}

export function getZeroIfNull(amount: number | null | undefined): number {
  return amount ?? 0;
}

export function roundUpToDecimals(value: number): string {
  return roundNumber(value, 2).toFixed(2);
}
