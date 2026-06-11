import { Box, Typography } from "@mui/material";
import styles from "../../../../../styles/LCL/OrganizationSearch.module.css";
import { OrganizationResultDetail } from "@/hooks/LCL/OrganizationSerach/organizationSerachService";
import accoutingIcon from "../../../../../assets/head-account-icon.png";
import agingIcon from "../../../../../assets/date_disable.png";

import { useSelector } from "react-redux";
import { selectLoginClientBean } from "../../../../../core/featureToggles/featureToggle.selectors";

type Props = {
  data: OrganizationResultDetail;
};

const fmt = (n: number | Number | undefined | null): string =>
  n != null ? Number(n).toFixed(2) : "–";

export default function POrganizationAccountingSection({ data }: Props) {
  const col1 = [
    { label: "On Hold", value: data.onHoldStatus },
    { label: "Bill to Code", value: data.billToCode },
    { label: "Collection Office", value: data.collectionOffice },
    { label: "Terms", value: data.creditTerm },
    { label: "Chaser Status", value: data.chaserStatus },
  ];

  const col2 = [
    { label: "Statement Cycle", value: data.statementCycle },
    { label: "A/R Statement", value: data.arStatement },
    { label: "Credit Limit", value: data.creditLimit },
    { label: "Credit Over 30", value: data.creditOverAmount },
    { label: "Credit on Import", value: data.paymentIndicator },
  ];

  const getBarColor = (interval: string | undefined) => {
    return interval === "CURRENT" ? styles.green : styles.red;
  };

  const loginClientBean = useSelector(selectLoginClientBean);

  return (
    <Box className={styles.expandSection}>
      <Box className={styles.expandSectionHeader}>
        <Typography component="span" className={styles.expandSectionTitle}>
          <img src={accoutingIcon} alt="" className={styles.contactSectionHeaderIcon} />
          Accounting
        </Typography>
        {loginClientBean?.localCurrency && (
          <Typography component="span" className={styles.expandSectionCurrency}>
            All amounts in {loginClientBean.localCurrency}
          </Typography>
        )}
      </Box>

      <Box className={styles.expandSectionBody}>
        <Box className={styles.accountingBodyFlex}>

          <Box className={styles.accountingTwoColBlock}>
            <Box>
              {col1.map((r, i) => (
                <Box key={i} className={styles.accountingStackedField}>
                  <Typography component="div" className={styles.accountingStackedLabel}>
                    {r.label}
                  </Typography>
                  <Typography component="div" className={styles.accountingStackedValue}>
                    {r.value || "–"}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Box>
              {col2.map((r, i) => (
                <Box key={i} className={styles.accountingStackedField}>
                  <Typography component="div" className={styles.accountingStackedLabel}>
                    {r.label}
                  </Typography>
                  <Typography component="div" className={styles.accountingStackedValue}>
                    {r.value || "–"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Box className={styles.accountingAgingBlock}>
            <Box className={styles.agingSubHeader}>
                        <img src={agingIcon} alt="" className={styles.agingSectionHeaderIcon} />

              Aging Details</Box>
            <Box className={styles.main}>
              <table className={styles.agingTable}>
                <thead>
                  <tr>
                    <th className={styles.agingTh}>Interval (Days)</th>
                    <th className={`${styles.agingTh} ${styles.agingTdRight}`}>Amount</th>
                    <th className={`${styles.agingTh} ${styles.agingStatus}`}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.agingMainBean?.agingWidgetBeanList ?? []).map((row, i) => {
                    const interval = row.intervalRange || row.newInterval  ||"";
                    const pct = Math.min(100, Math.max(0, Number(row.statusPercent) || 0));
                    return (
                      <tr key={i}>
                        <td className={styles.agingTd}>{interval || "–"}</td>
                        <td className={styles.agingTdRight}>{fmt(row.unPaidamount as number)}</td>
                        <td className={`${styles.agingTd} ${styles.agingStatus}`}>
                          <span className={styles.agingStatusBox}>
                            <span
                              className={`${styles.agingStatusBarFill} ${getBarColor(interval)}`}
                              style={{ width: `${pct}%` }}
                            />
                            <span className={styles.agingStatusBarText}>
                              {fmt(row.statusPercent)}%
                            </span>
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className={styles.agingDivider}>
                    <td colSpan={3}></td>
                  </tr>
                  <tr>
                    <td className={styles.agingTd}> Unapplied Amount</td>
                    <td className={styles.agingTdRight}>{fmt(data.agingMainBean?.unappliedAmount as number)}</td>
                    <td className={styles.agingStatus}></td>
                  </tr>
                  <tr className={styles.agingtotal}>
                    <td className={styles.agingFooterTd}> Total</td>
                    <td className={styles.agingTdRight}>{fmt(data.agingMainBean?.totalAmount as number)}</td>
                    <td className={styles.agingStatus}></td>
                  </tr>
                  <tr className={styles.agingtotalAmount}>
                    <td className={styles.agingFooterTd}> Total Amount</td>
                    <td className={styles.agingTdRight}>{fmt(data.agingMainBean?.totalOverdueAmount as number)}</td>
                    <td className={styles.agingStatus}></td>
                  </tr>
                </tbody>
              </table>
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
