import { Box, Typography } from "@mui/material";
import styles from "../../../../../styles/LCL/OrganizationSearch.module.css";
import { OrganizationResultDetail } from "@/hooks/LCL/OrganizationSerach/organizationSerachService";
import  headMiscimg  from "../../../../../assets/head-miscellaneous-icon.png";
type Props = {
  data: OrganizationResultDetail;
};

interface MiscRow {
  label: string;
  value: string | number | Date;
}

const formatValue = (value: string | number | Date, label: string) => {
  if (value instanceof Date) return value.toLocaleDateString();
  return value || (label ? "–" : "");
};

export default function POrganizationMiscSection({ data }: Props) {
  const leftRows: MiscRow[] = [
    { label: "Agent", value: data.agent },
    { label: "Broker", value: data.broker },
    { label: "Uninvoiced Prepaid Shipments", value: data.uninvoicedShipment },
    { label: "Shipments in Transit (Counts)", value: data.inTransitShipment },
    { label: "Input By (Date)", value: data.inputBy },
    { label: "", value: data.inputDate },
  ];

  const rightRows: MiscRow[] = [
    {
      label: "EIN Number (Type)",
      value: data.einNumber
        ? `${data.einNumber}${data.einType ? ` (${data.einType})` : ""}`
        : "–",
    },
    { label: "NVOCC Bond", value: data.nvoccBond },
    { label: "FMC Number", value: data.fmcNumber },
    { label: "", value: "" },
    { label: "Update By (Date)", value: data.updateBy },
    { label: "", value: data.updateDate },
  ];

  const rowCount = Math.max(leftRows.length, rightRows.length);

  return (
    <Box className={styles.expandSection}>
      <Box className={styles.expandSectionHeader}>
        <Typography
          component="span"
          className={styles.expandSectionTitle}
        >
          <img
            src={headMiscimg}
            alt="Miscellaneous"
            className={styles.contactSectionHeaderIcon}
          />
          Miscellaneous
        </Typography>
      </Box>

      <Box className={styles.expandSectionBody}>
        <Box className={styles.miscGrid}>
          <Box>
            {leftRows.slice(0, rowCount).map((r, i) => (
              <Box key={i} className={styles.miscRow}>
                <Typography component="span" className={styles.miscLabel}>
                  {r.label}
                </Typography>
                <Typography component="span" className={styles.miscValue}>
                  {formatValue(r.value, r.label)}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box>
            {rightRows.slice(0, rowCount).map((r, i) => (
              <Box key={i} className={styles.miscRow}>
                <Typography component="span" className={styles.miscLabel}>
                  {r.label}
                </Typography>
                <Typography component="span" className={styles.miscValue}>
                  {formatValue(r.value, r.label)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
