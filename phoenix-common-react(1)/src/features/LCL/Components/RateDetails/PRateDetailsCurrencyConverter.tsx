import { Typography } from '@mui/material';
import { PSingleValueSearchableField, PTextField } from 'phoenix-react-lib';
import React, { useState } from 'react';
import imgArrows from '../../../../assets/img_arrows.png';
import imgMinusDisable from '../../../../assets/rate_minus_disable.png';
import imgMinusEnable from '../../../../assets/rate_minus_enable.png';
import imgPlusDisable from '../../../../assets/rate_plus_disable.png';
import imgPlusEnable from '../../../../assets/rate_plus_enable.png';
import {
  handlingCurrencySuggestionConfig,
  useGetSuggestions,
} from '../../../../hooks';
import styles from '../../../../styles/LCL/RateDetails.module.css';
import { PRateDetailsCurrencyConverterProps } from '../../../../types/LCL/RateDetails/RateDetails.types';

const PRateDetailsCurrencyConverter: React.FC<
  PRateDetailsCurrencyConverterProps
> = ({
  rows,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
  disabled,
  onCurrencySelect,
  onBlurRow,
  invoiceCurrencyToggle,
  localCurrency,
  invoiceCurrency,
  liveRates,
  roeType,
  roeWarning,
  onClearRoeWarning,
}) => {
  const {
    data: handlingCurrencySuggestions,
    setQuery: setHandlingCurrencySuggestions,
  } = useGetSuggestions(handlingCurrencySuggestionConfig);

  const [currencyDraft, setCurrencyDraft] = useState<Record<string, string>>(
    {}
  );

  const [roeDraft, setRoeDraft] = useState<
    Record<string, { local?: string; invoice?: string }>
  >({});

  const isLocalRow = (currency: string) =>
    currency?.toUpperCase() === localCurrency?.toUpperCase();

  const isInvoiceRow = (currency: string) =>
    invoiceCurrencyToggle &&
    currency?.toUpperCase() === invoiceCurrency?.toUpperCase();

  const isRowDisabled = (currency: string) => disabled || isLocalRow(currency);

  const isFileRow = (isFile?: boolean) => !!isFile;

  const canRemove = (currency: string, index: number, isFile?: boolean) =>
    !disabled &&
    !isLocalRow(currency) &&
    !isInvoiceRow(currency) &&
    !isFileRow(isFile) &&
    rows.length > 1 &&
    index > 0;

  const localRateUnit = (currency: string) =>
    invoiceCurrencyToggle
      ? `${localCurrency}/${currency || ''}`
      : localCurrency;

  const invoiceRateUnit = (currency: string) =>
    `${invoiceCurrency}/${currency || ''}`;

  const rateColLabel = invoiceCurrencyToggle
    ? 'Local Currency Rate Of Exchange'
    : 'Rate Of Exchange';

  const commitCurrency = (rowId: string, code: string) => {
    const patch: Record<string, string | number> = { currency: code };

    if (roeType === 'L' && code && liveRates?.[code] != null) {
      const localROE = liveRates[code];
      patch.localCurrencyROE = String(localROE);

      const isDefaultCase =
        !invoiceCurrency ||
        invoiceCurrency.toUpperCase() === localCurrency.toUpperCase();
      if (isDefaultCase) {
        patch.invoiceCurrencyROE = '1';
      } else {
        const invoiceRate = liveRates[invoiceCurrency] ?? 1;
        patch.invoiceCurrencyROE = String(
          invoiceRate !== 0 ? localROE / invoiceRate : 0
        );
      }
    }

    onCurrencySelect?.(rowId,code);

    setCurrencyDraft((prev) => {
      if (!(rowId in prev)) return prev;
      const next = { ...prev };
      delete next[rowId];
      return next;
    });
  };

  return (
    <div className={styles.converterWrapper}>
      {/* {roeWarning && (
        <Alert
          severity="warning"
          onClose={onClearRoeWarning}
          sx={{ mb: 1, py: 0, fontSize: 12 }}
        >
          {roeWarning}
        </Alert>
      )} */}
      <div className={styles.converterLabelsRow}>
        <div className={styles.converterCurrencyField}>
          <Typography className={styles.converterLabel}>Currency</Typography>
        </div>

        <div className={styles.converterArrow} />

        <div className={styles.converterRateField}>
          <Typography className={styles.converterLabel}>
            {rateColLabel}
          </Typography>
        </div>

        <div className={styles.converterUnitLabel} />

        {invoiceCurrencyToggle && (
          <>
            <div className={styles.converterArrow} />
            <div className={styles.converterRateField}>
              <Typography className={styles.converterLabel}>
                Invoice Currency Rate Of Exchange
              </Typography>
            </div>
            <div className={styles.converterUnitLabel} />
          </>
        )}
      </div>

      {rows.map((row, index) => {
        const rowDisabled =
          isRowDisabled(row.currency) || isFileRow(row.isFile);
        const invLocked = isInvoiceRow(row.currency);
        const removable = canRemove(row.currency, index, row.isFile);

        return (
          <div key={row.id} className={styles.converterRow}>
            <Typography className={styles.converterIndex}>
              {index + 1}
            </Typography>

            <div className={styles.converterCurrencyField}>
              <PSingleValueSearchableField
                disabled={rowDisabled}
                value={currencyDraft[row.id] ?? row.currency}
                data={handlingCurrencySuggestions}
                displayFields={['SUGGEST_VALUE']}
                displayValueField="SUGGEST_KEY"
                columnHeaders={[]}
                onChange={(val: string) => {
                  setHandlingCurrencySuggestions(val);
                  setCurrencyDraft((prev) => ({ ...prev, [row.id]: val }));
                }}
                onSelect={(item) => {
                  const parts = item.SUGGEST_VALUE.split('-');
                  const code = (parts[0] || '').trim();
                  commitCurrency(row.id, code);
                }}
              />
            </div>

            <div className={styles.converterArrow}>
              <img src={imgArrows} alt="" />
            </div>

            <div className={styles.converterRateField}>
              <PTextField
                value={roeDraft[row.id]?.local ?? row.localCurrencyROE}
                onChange={(e) =>
                  setRoeDraft((prev) => ({
                    ...prev,
                    [row.id]: { ...prev[row.id], local: e.target.value },
                  }))
                }
                onBlur={() => {
                  const draft = roeDraft[row.id]?.local;
                  if (draft !== undefined) {
                    onUpdateRow(row.id, { localCurrencyROE: draft });
                    setRoeDraft((prev) => {
                      const next = { ...prev };
                      if (next[row.id]) {
                        const { local: _, ...rest } = next[row.id];
                        if (Object.keys(rest).length === 0) delete next[row.id];
                        else next[row.id] = rest;
                      }
                      return next;
                    });
                  }
                  const committedLocal = draft ?? row.localCurrencyROE;
                  onBlurRow?.(row.id, 'localCurrencyROE', committedLocal);
                }}
                type="number"
                disabled={rowDisabled}
                size="small"
              />
            </div>

            <span className={styles.converterUnitLabel}>
              {localRateUnit(row.currency)}
            </span>

            {invoiceCurrencyToggle && (
              <>
                <div className={styles.converterArrow}>
                  <img src={imgArrows} alt="" />
                </div>

                <div className={styles.converterRateField}>
                  <PTextField
                    value={
                      invLocked
                        ? '1'
                        : (roeDraft[row.id]?.invoice ?? row.invoiceCurrencyROE ?? '')
                    }
                    onChange={(e) =>
                      setRoeDraft((prev) => ({
                        ...prev,
                        [row.id]: { ...prev[row.id], invoice: e.target.value },
                      }))
                    }
                    onBlur={() => {
                      const draft = roeDraft[row.id]?.invoice;
                      if (draft !== undefined) {
                        onUpdateRow(row.id, { invoiceCurrencyROE: draft });
                        setRoeDraft((prev) => {
                          const next = { ...prev };
                          if (next[row.id]) {
                            const { invoice: _, ...rest } = next[row.id];
                            if (Object.keys(rest).length === 0) delete next[row.id];
                            else next[row.id] = rest;
                          }
                          return next;
                        });
                      }
                      const committedInvoice = draft ?? row.invoiceCurrencyROE;
                      onBlurRow?.(row.id, 'invoiceCurrencyROE', committedInvoice);
                    }}
                    type="number"
                    disabled={rowDisabled || invLocked}
                    size="small"
                  />
                </div>

                <span className={styles.converterUnitLabel}>
                  {invoiceRateUnit(row.currency)}
                </span>
              </>
            )}

            <div className={styles.converterButtons}>
              <div onClick={() => !disabled && onAddRow(row.id)}>
                <img src={disabled ? imgPlusDisable : imgPlusEnable} alt="" />
              </div>

              <div onClick={() => removable && onRemoveRow(row.id)}>
                {removable ? (
                  <img src={imgMinusEnable} alt="" />
                ) : (
                  <img src={imgMinusDisable} alt="" />
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PRateDetailsCurrencyConverter;
