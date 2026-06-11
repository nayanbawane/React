import { Box, Tooltip, Typography } from "@mui/material";
import type {
  ShipmentStatistic,
  ShipmentMetric,
} from "../../../../../types/LCL/organizationSearch/organizationSerachResultExpand/organizationSerachResultExpand.types";
import styles from "../../../../../styles/LCL/OrganizationSearch.module.css";
import shipmentIcon from "../../../../../assets/img_origin_charges.png";
import countIcon from "../../../../../assets/ficcount.png";
import weightIcon from "../../../../../assets/fucweight.png";
import typeIcon from "../../../../../assets/fictype.png";
import upArrowIcon from "../../../../../assets/faerogreenup.png";
import rightArrowIcon from "../../../../../assets/faeroyellowright.png";
import downArrowIcon from "../../../../../assets/faeroreddown.png";

const INDICATOR_ICONS: Record<string, string> = {
  up: upArrowIcon,
  right: rightArrowIcon,
  down: downArrowIcon
};

const TOOLTIP_THRESHOLD = 7;

function truncate(text: string): string {
  return text.length > TOOLTIP_THRESHOLD ? text.slice(0, TOOLTIP_THRESHOLD) + "..." : text;
}

type Props = {
  shipments: ShipmentStatistic[];
};

function MetricCell({ metric }: { metric: ShipmentMetric }) {
  const valueOverflows = metric.value.length > TOOLTIP_THRESHOLD;
  const percentOverflows = metric.percent.length > TOOLTIP_THRESHOLD;

  return (
    <td className={styles.shipmentMetricTd}>
      <Box className={styles.shipmentMetricInner}>
        {valueOverflows ? (
          <Tooltip title={metric.value}  placement="bottom-start"
      arrow
      slotProps={{
        tooltip: {
          sx: {
            backgroundColor: "white",
            color: "#333",
            border: "1px solid #d8d8d8",
            boxShadow: "0 3px 10px rgba(0,0,0,0.14)",
            borderRadius: "15px",
            px: "10px",
            py: "18px",
            maxWidth: "220px",
          },
        },
        arrow: {
          sx: { color: "white", "&::before": { border: "1px solid #d8d8d8" } },
        },
      }}>
            <Typography component="span" className={styles.shipmentPercent}>
              {truncate(metric.value)}
            </Typography>
          </Tooltip>
        ) : (
          <>
            <Typography component="span" className={styles.shipmentPercent}>
              {metric.value}
            </Typography>
            <img
              src={INDICATOR_ICONS[metric.indicator] ?? rightArrowIcon}
              alt={metric.indicator}
              className={styles.shipmentIndicatorIcon}
            />
          </>
        )}
        {percentOverflows ? (
          <Tooltip title={metric.percent} placement="top">
            <Typography component="span" className={styles.shipmentPercent}>
              {truncate(metric.percent)}
            </Typography>
          </Tooltip>
        ) : (
          <Typography component="span" className={styles.shipmentPercent}>
            {metric.percent}
          </Typography>
        )}
      </Box>
    </td>
  );
}

export default function POrganizationShipmentSection({ shipments }: Props) {
  return (
    <Box className={styles.expandSection}>
      <Box className={styles.expandSectionHeader}>
        <Typography component="span" className={styles.expandSectionTitle}>
          <img src={shipmentIcon} alt="" className={styles.shipmentSectionHeaderIcon} />
          Shipment{" "}
          <Typography component="span" sx={{ fontWeight: 400, fontSize: "11px" }}>
            (Change Compared to Previous Year)
          </Typography>
        </Typography>
      </Box>
      <Box className={styles.expandShipmentSectionBody}>
        <table className={styles.shipmentTable}>
          <thead>
            <tr>
              <th className={styles.shipmentType} rowSpan={2}>
                <span className={styles.shipmentTypeTdInner}>
                  <img src={typeIcon} alt="" className={styles.shipmentThIcon} />
                  Type
                </span>
              </th>
              <th className={styles.shipmentGroupTh} colSpan={3}>Bookings</th>
              <th className={styles.shipmentGroupTh} colSpan={3}>Bills of Lading / Air Way Bills</th>
              <th className={styles.shipmentGroupTh} colSpan={3}>Arrival Notices</th>
            </tr>
            <tr>
              <th className={styles.shipmentSubTh}>
                <span className={styles.shipmentThInner}>
                  <img src={countIcon} alt="" className={styles.shipmentThIcon} />Count
                </span>
              </th>
              <th className={styles.shipmentSubTh}>
                <span className={styles.shipmentThInner}>
                  <img src={typeIcon} alt="" className={styles.shipmentThIcon} />Volume
                </span>
              </th>
              <th className={styles.shipmentSubTh}>
                <span className={styles.shipmentThInner}>
                  <img src={weightIcon} alt="" className={styles.shipmentThIcon} />Weight
                </span>
              </th>
              <th className={styles.shipmentSubTh}>
                <span className={styles.shipmentThInner}>
                  <img src={countIcon} alt="" className={styles.shipmentThIcon} />Count
                </span>
              </th>
              <th className={styles.shipmentSubTh}>
                <span className={styles.shipmentThInner}>
                  <img src={typeIcon} alt="" className={styles.shipmentThIcon} />Volume
                </span>
              </th>
              <th className={styles.shipmentSubTh}>
                <span className={styles.shipmentThInner}>
                  <img src={weightIcon} alt="" className={styles.shipmentThIcon} />Weight
                </span>
              </th>
              <th className={styles.shipmentSubTh}>
                <span className={styles.shipmentThInner}>
                  <img src={countIcon} alt="" className={styles.shipmentThIcon} />Count
                </span>
              </th>
              <th className={styles.shipmentSubTh}>
                <span className={styles.shipmentThInner}>
                  <img src={typeIcon} alt="" className={styles.shipmentThIcon} />Volume
                </span>
              </th>
              <th className={styles.shipmentSubTh}>
                <span className={styles.shipmentThInner}>
                  <img src={weightIcon} alt="" className={styles.shipmentThIcon} />Weight
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((row) => (
              <tr key={row.type}>
                <td className={styles.shipmentTypeTd}>{row.type}</td>
                <MetricCell metric={row.bookingCount} />
                <MetricCell metric={row.bookingVolume} />
                <MetricCell metric={row.bookingWeight} />
                <MetricCell metric={row.bolCount} />
                <MetricCell metric={row.bolVolume} />
                <MetricCell metric={row.bolWeight} />
                <MetricCell metric={row.anCount} />
                <MetricCell metric={row.anVolume} />
                <MetricCell metric={row.anWeight} />
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
    </Box>
  );
}
