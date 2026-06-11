// currencyRoe.util.ts

import { BookingQuoteChargeBeanFull, RoeRow } from "../../types";

export interface CurrencyRoeContext {
  roeRows: RoeRow[];
  invoiceCurrency: string;
  localCurrency: string;
  liveRates?: Record<string, number>;
}

export const resolveRoe = (
  currency: string,
  ctx: CurrencyRoeContext
): number => {
  const entry = ctx.roeRows.find(
    (r) => r.currency.toUpperCase() === currency.toUpperCase()
  );

  if (!entry) return 0;

  const invoiceROE = Number(entry.invoiceCurrencyROE);
  if (invoiceROE > 0) return invoiceROE;

  return Number(entry.localCurrencyROE) || 0;
};

export const applyCurrencyChange = (
  row: BookingQuoteChargeBeanFull,
  currency: string,
  side: 'income' | 'expense',
  ctx: CurrencyRoeContext
): Partial<BookingQuoteChargeBeanFull> => {
  const roe = resolveRoe(currency, ctx);
  const isIncome = side === 'income';

  if (isIncome) {
    return {
      incomeCurrency: currency,
      incomeROE: roe,
      incomeLocalAmount: (row.incomeAmount || 0) * roe,
    };
  }

  return {
    expenseCurrency: currency,
    expenseROE: roe,
    expenseLocalAmount: (row.expenseAmount || 0) * roe,
  };
};