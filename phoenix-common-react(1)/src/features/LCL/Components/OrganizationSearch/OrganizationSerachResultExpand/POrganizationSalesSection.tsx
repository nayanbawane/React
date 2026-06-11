import { Box, Typography } from "@mui/material";
import styles from "../../../../../styles/LCL/OrganizationSearch.module.css";
import { OrganizationResultDetail } from "@/hooks/LCL/OrganizationSerach/organizationSerachService";
import saleIcon from "../../../../../assets/head-sale-icon.png";

type Props = {
  data: OrganizationResultDetail;
};

interface SalesRow {
  label: string;
  value: string;
}

export default function POrganizationSalesSection({ data }: Props) {
  const rows: SalesRow[] = [
    {
      label: "Type / Account Class",
      value:
        [data.organizationType, data.accountClass].filter(Boolean).join(" / ") || "–",
    },
    { label: "Vessel Schedule", value: data.vesselSchedule },
    {
      label: "Sales Person / Date Assigned",
      value:
        [data.salesRepresentative, data.dateAssigned].filter(Boolean).join(" / ") || "–",
    },
    {
      label: "Call Cycle / Booking Cycle",
      value:
        [data.callCycle, data.bookingCycle].filter(Boolean).join(" / ") || "–",
    },
    { label: "AccuRate Profile", value: data.accuRateProfile },
    { label: "Truck Sell Rate Profile", value: data.truckerSellRateProfile },
  ];

  return (
    <Box className={styles.expandSaleSection}>
      <Box className={styles.expandSectionHeader}>
        <Typography component="span" className={styles.expandSectionTitle}>
          <img src={saleIcon} alt="" className={styles.contactSectionHeaderIcon} />
          Sales
        </Typography>
      </Box>

      <Box className={styles.expandSectionBody}>
        {rows.map((r) => (
          <Box key={r.label} className={styles.salesRow}>
            <Typography component="span" className={styles.salesLabel}>
              {r.label}
            </Typography>
            <Typography component="span" className={styles.salesValue}>
              {r.value || "–"}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
