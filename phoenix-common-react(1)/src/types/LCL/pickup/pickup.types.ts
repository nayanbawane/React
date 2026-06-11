// ─── Pickup & Door Delivery ───────────────────────────────────────────────────

import type { ControlFlag, YesNo } from "../common.types";
import type { CargoDimensionBean } from "../cargo/cargo.types";
import type { BookingQuoteChargeBean } from "../charges/charges.types";
import type { BookingHazardousBean } from "../hazardous/hazardous.types";

export interface PickupAndDeliveryAttribute {
  [key: string]: unknown;
}

export interface PickupDetailBean {
  controlFlag: ControlFlag;
  quotePickupId: number;
  billToDetail: string;
  pickupAndDeliveryAttributeList: PickupAndDeliveryAttribute[];
  cargoDimensionBeanList: CargoDimensionBean[];
  pickupChargeBeanList: BookingQuoteChargeBean[];
  rowNumber: number;
  weightKg: number;
  cubeCbm: number;
  weightLbs: number;
  cubeCbf: number;
  numberOfPieces: number;
  length: number;
  height: number;
  width: number;
  pieces: number;
  cbm: number;
  cbf: number;
  kg: number;
  lbs: number;
  pickupHazardousBeanList: BookingHazardousBean[];
  isTruckRateFetched: YesNo;
  isEdiTrucker: YesNo;
}

export interface DoorDeliveryDetailsBean {
  truckRateId: number;
  pickupChargeBeanList: BookingQuoteChargeBean[];
  controlFlag: ControlFlag;
  isTruckRateFetched?: YesNo;
  truckRateDetailsFileId: number;
}
