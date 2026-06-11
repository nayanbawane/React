import { Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import imgOceanFreight from '../../../../assets/img_ocean_freight.png';
import imgOriginCharges from '../../../../assets/img_origin_charges.png';
import imgPostLandingCharges from '../../../../assets/img_post_landing_charges.png';
import imgArrowCollapsed from '../../../../assets/rate_arrow_collapsed.png';
import imgArrowExpanded from '../../../../assets/rate_arrow_expanded.png';
import styles from '../../../../styles/LCL/RateDetails.module.css';
import {
  PRateDetailsTotalChargeProps,
  RowData,
  SectionData,
} from '../../../../types/LCL/RateDetails/RateDetails.types';

const getAmount = (section: SectionData, currency: string): number =>
  section.entries.find((e) => e.currency === currency)?.amount ?? 0;

const subtractSection = (
  income: SectionData,
  expense: SectionData,
  currencies: string[]
): SectionData => ({
  entries: currencies.map((currency) => ({
    currency,
    amount: getAmount(income, currency) - getAmount(expense, currency),
  })),
});

const fmt = (n: number): string =>
  n.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const EMPTY_SECTION: SectionData = { entries: [] };

const PRateDetailsTotalCharge: React.FC<PRateDetailsTotalChargeProps> = ({
  incomeData,
  expenseData,
  invoiceCurrency,
}) => {
  const [isTotalsExpanded, setIsTotalsExpanded] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({
    income: false,
    expense: false,
    profitLoss: false,
  });

  const toggleRow = (key: string) =>
    setExpandedRows((prev) => ({ ...prev, [key]: !prev[key] }));

  const hasOCC = useMemo(() => {
    const incOcc = incomeData.commonCharges;
    const expOcc = expenseData.commonCharges;
    return (
      (incOcc?.entries.some((e) => e.amount !== 0) ?? false) ||
      (expOcc?.entries.some((e) => e.amount !== 0) ?? false)
    );
  }, [incomeData.commonCharges, expenseData.commonCharges]);

  const allCurrencies = useMemo(() => {
    const localCurrency = incomeData.oceanFreight.entries[0]?.currency ?? 'USD';
    const set = new Set<string>();
    [incomeData, expenseData].forEach((data) => {
      const sections = [
        data.oceanFreight,
        data.originCharges,
        data.commonCharges,
        data.postLandingCharges,
      ];
      sections.forEach((s) =>
        s?.entries.forEach((e) => {
          if (e.currency) set.add(e.currency);
        })
      );
    });

    const first =
      invoiceCurrency && set.has(invoiceCurrency)
        ? invoiceCurrency
        : localCurrency;
    return [first, ...[...set].filter((c) => c !== first).sort()];
  }, [incomeData, expenseData, invoiceCurrency]);

  const profitLossData: RowData = useMemo(
    () => ({
      oceanFreight: subtractSection(
        incomeData.oceanFreight,
        expenseData.oceanFreight,
        allCurrencies
      ),
      originCharges: subtractSection(
        incomeData.originCharges,
        expenseData.originCharges,
        allCurrencies
      ),
      commonCharges: subtractSection(
        incomeData.commonCharges ?? EMPTY_SECTION,
        expenseData.commonCharges ?? EMPTY_SECTION,
        allCurrencies
      ),
      postLandingCharges: subtractSection(
        incomeData.postLandingCharges,
        expenseData.postLandingCharges,
        allCurrencies
      ),
    }),
    [incomeData, expenseData, allCurrencies]
  );

  const rows = [
    { key: 'income', label: 'Income', data: incomeData },
    { key: 'expense', label: 'Expense', data: expenseData },
    { key: 'profitLoss', label: 'Profit/Loss', data: profitLossData },
  ];

  return (
    <div className={styles.totalsWrapper}>
      <div
        onClick={() => setIsTotalsExpanded((p) => !p)}
        className={
          isTotalsExpanded ? styles.totalsHeaderExpanded : styles.totalsHeader
        }
      >
        {isTotalsExpanded ? (
          <img src={imgArrowExpanded} alt="" />
        ) : (
          <img src={imgArrowCollapsed} alt="" />
        )}
        <Typography className={styles.totalsTitle}>Totals</Typography>
      </div>

      {isTotalsExpanded && (
        <table className={styles.totalsTable}>
          <colgroup>
            <col style={{ width: '18%' }} />
            <col style={{ width: '7%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '8%' }} />
            {hasOCC && <col style={{ width: '5%' }} />}
            {hasOCC && <col style={{ width: '8%' }} />}
            <col style={{ width: '5%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '8%' }} />
            <col style={{ width: '5%' }} />
            <col style={{ width: '8%' }} />
          </colgroup>

          <thead>
            <tr>
              <th className={styles.thBase} />
              <th className={styles.thBase}>Rate Type</th>
              <th colSpan={2} className={styles.thBase}>
                <div className={styles.thImageRow}>
                  <img
                    src={imgOceanFreight}
                    alt=""
                    className={styles.thImage}
                  />
                  <span>Ocean Freight</span>
                </div>
              </th>
              <th colSpan={2} className={styles.thBase}>
                <div className={styles.thImageRow}>
                  <img
                    src={imgOriginCharges}
                    alt=""
                    className={styles.thImage}
                  />
                  <span>Origin Charges (FOB)</span>
                </div>
              </th>
              {hasOCC && (
                <th colSpan={2} className={styles.thBase}>
                  Common Charges
                </th>
              )}
              <th colSpan={2} className={styles.thTotal}>
                Total
              </th>
              <th colSpan={2} className={styles.thBase}>
                <div className={styles.thImageRow}>
                  <img
                    src={imgPostLandingCharges}
                    alt=""
                    className={styles.thImage}
                  />
                  <span>Post Landing Charges</span>
                </div>
              </th>
              <th colSpan={2} className={styles.thTotal}>
                Grand Total
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, rowIndex) => {
              const isExpanded = expandedRows[row.key];
              const displayCurrencies = isExpanded
                ? allCurrencies
                : allCurrencies.slice(0, 1);
              const isNotLastGroup = rowIndex < rows.length - 1;

              return (
                <React.Fragment key={row.key}>
                  {displayCurrencies.map((currency, i) => {
                    const oceanAmt = getAmount(row.data.oceanFreight, currency);
                    const originAmt = getAmount(
                      row.data.originCharges,
                      currency
                    );
                    const occAmt = hasOCC
                      ? getAmount(
                          row.data.commonCharges ?? EMPTY_SECTION,
                          currency
                        )
                      : 0;
                    const postLandAmt = getAmount(
                      row.data.postLandingCharges,
                      currency
                    );
                    const total = oceanAmt + originAmt + occAmt;
                    const grandTotal = total + postLandAmt;

                    const isLastRow = i === displayCurrencies.length - 1;

                    const borderClass = !isLastRow
                      ? styles.tdNoBorder
                      : isNotLastGroup
                        ? styles.tdSectionDivider
                        : '';

                    return (
                      <tr
                        key={`${row.key}-${currency}`}
                        className={styles.tableBodyRow}
                      >
                        {i === 0 && (
                          <td
                            rowSpan={displayCurrencies.length}
                            className={
                              isNotLastGroup
                                ? `${styles.tdExpandCell} ${styles.tdSectionDivider}`
                                : styles.tdExpandCell
                            }
                          >
                            <div
                              onClick={() => toggleRow(row.key)}
                              className={styles.expandToggle}
                            >
                              {isExpanded ? (
                                <img src={imgArrowExpanded} alt="" />
                              ) : (
                                <img src={imgArrowCollapsed} alt="" />
                              )}
                            </div>
                          </td>
                        )}
                        {i === 0 && (
                          <td
                            rowSpan={displayCurrencies.length}
                            className={
                              isNotLastGroup
                                ? `${styles.tdLabelCell} ${styles.tdSectionDivider}`
                                : styles.tdLabelCell
                            }
                          >
                            {row.label}
                          </td>
                        )}

                        <td className={`${styles.tdBase} ${borderClass}`}>
                          {currency}
                        </td>
                        <td className={`${styles.tdBaseRight} ${borderClass}`}>
                          {fmt(oceanAmt)}
                        </td>

                        <td className={`${styles.tdBase} ${borderClass}`}>
                          {currency}
                        </td>
                        <td className={`${styles.tdBaseRight} ${borderClass}`}>
                          {fmt(originAmt)}
                        </td>

                        {hasOCC && (
                          <td className={`${styles.tdBase} ${borderClass}`}>
                            {currency}
                          </td>
                        )}
                        {hasOCC && (
                          <td
                            className={`${styles.tdBaseRight} ${borderClass}`}
                          >
                            {fmt(occAmt)}
                          </td>
                        )}

                        <td
                          className={`${styles.thBaseNoRight} ${borderClass}`}
                        >
                          {currency}
                        </td>
                        <td
                          className={`${styles.thBaseNoRight} ${borderClass}`}
                          style={{ textAlign: 'right' }}
                        >
                          {fmt(total)}
                        </td>

                        <td className={`${styles.tdBase} ${borderClass}`}>
                          {currency}
                        </td>
                        <td className={`${styles.tdBaseRight} ${borderClass}`}>
                          {fmt(postLandAmt)}
                        </td>

                        <td
                          className={`${styles.thBaseNoRight} ${borderClass}`}
                        >
                          {currency}
                        </td>
                        <td
                          className={`${styles.thBaseNoRight} ${borderClass}`}
                          style={{ textAlign: 'right' }}
                        >
                          {fmt(grandTotal)}
                        </td>
                      </tr>
                    );
                  })}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PRateDetailsTotalCharge;
