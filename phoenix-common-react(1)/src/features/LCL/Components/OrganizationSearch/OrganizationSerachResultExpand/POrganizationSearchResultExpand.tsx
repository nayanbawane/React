import POrganizationContactSection from "./POrganizationContactSection";
import POrganizationAccountingSection from "./POrganizationAccountingSection";
import POrganizationSalesSection from "./POrganizationSalesSection";
import POrganizationMiscSection from "./POrganizationMiscSection";
import POrganizationShipmentSection from "./POrganizationShipmentSection";
import styles from "../../../../../styles/LCL/OrganizationSearch.module.css";
import { OrganizationResultDetail, ShipmentStatisticBean } from "@/hooks/LCL/OrganizationSerach/organizationSerachService";
import type { ShipmentStatistic, ShipmentMetric } from "../../../../../types/LCL/organizationSearch/organizationSerachResultExpand/organizationSerachResultExpand.types";

const BOOKING_CAT = "Bookings";
const BOL_CATS = new Set(["Bills Of Lading", "Air Way Bills"]);

const fmt = (n: number) =>
  Number(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function buildMetric(
  bean: ShipmentStatisticBean | undefined,
  value: number,
  indicator: boolean,
  percent: number
): ShipmentMetric {
  if (!bean) return { value: "0.00", indicator: "right", percent: "0.00%" };
  return {
    value: fmt(value),
    indicator: percent === 0 ? "right" : indicator ? "up" : "down",
    percent: `${fmt(percent)}%`,
  };
}

function transformShipments(beans: ShipmentStatisticBean[]): ShipmentStatistic[] {
  const seen = new Set<string>();
  const docTypes: string[] = [];
  for (const b of beans) {
    const key = String(b.docType);
    if (!seen.has(key)) { seen.add(key); docTypes.push(key); }
  }

  return docTypes.map(docType => {
    const bkg = beans.find(b => String(b.docType) === docType && String(b.docCategory) === BOOKING_CAT);
    const bol = beans.find(b => String(b.docType) === docType && BOL_CATS.has(String(b.docCategory)));
    const an  = beans.find(b => String(b.docType) === docType && String(b.docCategory) !== BOOKING_CAT && !BOL_CATS.has(String(b.docCategory)));

    return {
      type: docType,
      bookingCount:  buildMetric(bkg, Number(bkg?.currentCount  ?? 0), Boolean(bkg?.countIndicator),  Number(bkg?.countPercent  ?? 0)),
      bookingVolume: buildMetric(bkg, Number(bkg?.currentVolume ?? 0), Boolean(bkg?.volumeIndicator), Number(bkg?.volumePercent ?? 0)),
      bookingWeight: buildMetric(bkg, Number(bkg?.currentWeight ?? 0), Boolean(bkg?.weightIndicator), Number(bkg?.weightPercent ?? 0)),
      bolCount:      buildMetric(bol, Number(bol?.currentCount  ?? 0), Boolean(bol?.countIndicator),  Number(bol?.countPercent  ?? 0)),
      bolVolume:     buildMetric(bol, Number(bol?.currentVolume ?? 0), Boolean(bol?.volumeIndicator), Number(bol?.volumePercent ?? 0)),
      bolWeight:     buildMetric(bol, Number(bol?.currentWeight ?? 0), Boolean(bol?.weightIndicator), Number(bol?.weightPercent ?? 0)),
      anCount:       buildMetric(an,  Number(an?.currentCount   ?? 0), Boolean(an?.countIndicator),   Number(an?.countPercent   ?? 0)),
      anVolume:      buildMetric(an,  Number(an?.currentVolume  ?? 0), Boolean(an?.volumeIndicator),  Number(an?.volumePercent  ?? 0)),
      anWeight:      buildMetric(an,  Number(an?.currentWeight  ?? 0), Boolean(an?.weightIndicator),  Number(an?.weightPercent  ?? 0)),
    };
  });
}

type Props = {
  data: OrganizationResultDetail
};

export default function POrganizationSearchResultExpand({ data }: Props) {
  return (
    <div className={styles.expandPanel}>
      <POrganizationContactSection contacts={data.contactDetailBeanList} />

      <div className={styles.expandThreePanel}>
        <POrganizationAccountingSection data={data} />
        <POrganizationSalesSection data={data} />
        <POrganizationMiscSection data={data} />
      </div>

      <POrganizationShipmentSection shipments={transformShipments(data.shipmentStatisticBeanList ?? [])} />

    </div>
  );
}
