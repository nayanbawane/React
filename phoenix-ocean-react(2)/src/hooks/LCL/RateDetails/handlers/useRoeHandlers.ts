import {
  BookingQuoteChargeBeanFull,
  createBlankRoeRow,
  RoeRow,
} from 'phoenix-common-react';
import { formatSixDecimals } from '../utils/rateFormatUtils';

export interface RoeHandlersDeps {
  roeRows: RoeRow[];
  chargeRows: BookingQuoteChargeBeanFull[];
  invoiceCurrency: string;
  localCurrency: string;
  liveRates: Record<string, number>;
  roeType: string;
}

export interface RoeHandlersActions {
  handleROERowsChange: (rows: RoeRow[]) => void;
  onWarning: (msg: string) => void;
}

const cascadeInvoiceCurrencyRoe = (
  rows: RoeRow[],
  changedRowId: string,
  invoiceCurrency: string,
  localCurrency: string
): RoeRow[] => {

  
  const changedRow = rows.find((r) => r.id === changedRowId);
  if (
    !changedRow ||
    changedRow.currency.toUpperCase() !== invoiceCurrency.toUpperCase()
  ) {
    return rows;
  }
  
  const invoiceLocalROE = parseFloat(changedRow.localCurrencyROE) || 0;

  return rows.map((r) => {
    if (r.id === changedRowId) return r;

    if (r.currency.toUpperCase() === localCurrency.toUpperCase()) {
      return {
        ...r,
        invoiceCurrencyROE:
          invoiceLocalROE === 0 ? '0' : formatSixDecimals(1 / invoiceLocalROE),
      };
    }

    const rowLocalROE = parseFloat(r.localCurrencyROE) || 0;
    return {
      ...r,
      invoiceCurrencyROE:
        invoiceLocalROE === 0
          ? '0'
          : formatSixDecimals(rowLocalROE / invoiceLocalROE),
    };
  });
};

export const useRoeHandlers = (
  deps: RoeHandlersDeps,
  actions: RoeHandlersActions
) => {
  const {
    roeRows,
    chargeRows,
    invoiceCurrency,
    localCurrency,
    liveRates,
    roeType,
  } = deps;
  const { handleROERowsChange, onWarning } = actions;

  const handleRoeRowAdd = (afterId?: string) => {
    const next = [...roeRows];
    const idx = afterId ? next.findIndex((r) => r.id === afterId) : -1;
    const blank = createBlankRoeRow();
    if (idx >= 0) next.splice(idx + 1, 0, blank);
    else next.push(blank);
    handleROERowsChange(next);
  };

  const handleRoeRowRemove = (id: string) => {
    if (roeRows.length > 0 && roeRows[0].id === id) return;

    const rowToRemove = roeRows.find((r) => r.id === id);
    if (!rowToRemove) return;

    const currencyInUse = chargeRows.some(
      (row) =>
        row.transactionalFlag !== 'D' &&
        (row.incomeCurrency?.toUpperCase() ===
          rowToRemove.currency?.toUpperCase() ||
          row.expenseCurrency?.toUpperCase() ===
            rowToRemove.currency?.toUpperCase())
    );

    if (currencyInUse) {
      onWarning(
        `Currency ${rowToRemove.currency} is currently used in charge rows and cannot be removed.`
      );
      return;
    }

    handleROERowsChange(roeRows.filter((r) => r.id !== id));
  };

  const handleRoeRowUpdate = (id: string, patch: Partial<RoeRow>) => {
    let updatedRows = roeRows.map((row) =>
      row.id === id ? { ...row, ...patch } : row
    );

    if ('localCurrencyROE' in patch) {
      updatedRows = cascadeInvoiceCurrencyRoe(
        updatedRows,
        id,
        invoiceCurrency,
        localCurrency
      );

      const changedRow = updatedRows.find((r) => r.id === id);
      const isInvoiceCurrencyRow =
        changedRow?.currency?.toUpperCase() === invoiceCurrency?.toUpperCase();

      if (!isInvoiceCurrencyRow && changedRow) {
        const invoiceRow = updatedRows.find(
          (r) => r.currency?.toUpperCase() === invoiceCurrency?.toUpperCase()
        );
        const invoiceLocalROE = parseFloat(invoiceRow?.localCurrencyROE ?? '0') || 0;
        const newLocalROE = parseFloat(changedRow.localCurrencyROE) || 0;
        const newInvoiceROE =
          invoiceLocalROE === 0 ? '0' : formatSixDecimals(newLocalROE / invoiceLocalROE);

        updatedRows = updatedRows.map((r) =>
          r.id === id ? { ...r, invoiceCurrencyROE: newInvoiceROE } : r
        );
      }
    }

    handleROERowsChange(updatedRows);
  };

  const handleRoeRowBlur = (
    id: string,
    field: 'localCurrencyROE' | 'invoiceCurrencyROE',
    committedValue?: string
  ) => {
    if (committedValue === undefined) return;

    const row = roeRows.find((r) => r.id === id);
    if (!row) return;

    const isLocal =
      row.currency?.toUpperCase() === localCurrency?.toUpperCase();
    if (isLocal) return;

    const value = parseFloat(committedValue) || 0;
    if (value <= 0) {
      onWarning(
        `Rate of exchange for ${row.currency} must be greater than zero.`
      );
      handleROERowsChange(
        roeRows.map((r) => (r.id === id ? { ...r, [field]: '1' } : r))
      );
    }
  };

  const handleCurrencySelectFromRoeRow = (
    rowId: string,
    selectedCurrency: string
  ) => {
    if (!selectedCurrency?.trim()) return;

    const exists = roeRows.some(
      (row) =>
        row.id !== rowId &&
        row.currency?.toUpperCase() === selectedCurrency.toUpperCase()
    );

    if (exists) {
      const dupIdx = roeRows.findIndex((r) => r.id === rowId);
      const withBlank = [...roeRows];
      withBlank.splice(dupIdx, 1, createBlankRoeRow());
      handleROERowsChange(withBlank);
      onWarning(
        `Currency ${selectedCurrency} already exists in the rate of exchange table.`
      );
      return;
    }

    const currentRow = roeRows.find((r) => r.id === rowId);
    if (currentRow?.currency) {
      const oldCurrency = currentRow.currency;
      const currencyInUse = chargeRows.some(
        (row) =>
          row.transactionalFlag !== 'D' &&
          (row.incomeCurrency?.toUpperCase() === oldCurrency.toUpperCase() ||
            row.expenseCurrency?.toUpperCase() === oldCurrency.toUpperCase())
      );
      if (currencyInUse) {
        onWarning(
          `Currency ${oldCurrency} is currently used in charge rows and cannot be changed.`
        );
        return;
      }
    }

    let localROE = 0;
    let invoiceROE = 0;

    if (roeType === 'L') {
      const currencyRate = liveRates[selectedCurrency] ?? 0;
      const invoiceRate = liveRates[invoiceCurrency] ?? 1;
      localROE = currencyRate;
      invoiceROE = invoiceRate !== 0 ? currencyRate / invoiceRate : 0;
    }

    const updatedRows = roeRows.map((row) => {
      if (row.id !== rowId) return row;
      return {
        ...row,
        currency: selectedCurrency,
        localCurrencyROE: localROE === 0 ? '' : formatSixDecimals(localROE),
        invoiceCurrencyROE: invoiceROE === 0 ? '' : formatSixDecimals(invoiceROE),
      };
    });

    handleROERowsChange(updatedRows);
  };

  return {
    handleRoeRowAdd,
    handleRoeRowRemove,
    handleRoeRowUpdate,
    handleRoeRowBlur,
    handleCurrencySelectFromRoeRow,
  };
};
