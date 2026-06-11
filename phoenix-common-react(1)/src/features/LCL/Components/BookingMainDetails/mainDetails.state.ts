

import { AmendmentCodeBean, Clause, YesNo } from "@/types";
import { CommonToggleKeys, ToggleKey, useFeatureToggle } from 'phoenix-common-react';
import dayjs from "dayjs";

export interface BookingFormState {
  bookingQuoteType: string;
  referenceNumber: number | null;
  quoteNumber: number | null;
  userReference: string;
  modeOfTransport: string;
  routed: string;
  controlNumber: string;
  isCustomerOwnCFSAgreement: YesNo;
  directLoading: YesNo;
  vid: YesNo;
  transmitToLocationName: string;
  customerOwnContainerToggle: YesNo;
  clauses: Clause[];
  receivedVia: string;
  siChannel: string;
  pendingFinalBookingStatus: YesNo;
  billingCompany: string;
  handlingOffice: string;
  status: string;
  receivedFromName: string;
  takenBy: string;
  bookQuoteDate: string | null;
  updatedBy: string;
  updatedOn: string | null;
  controlFlag?: string;
  agentCode?: string;
  hazardousAction?: string;
  isHazardousPermissionOverride?: string;
  lineCode?: string;
  nomination?: string;
  preliminaryBookingStatus?: string;
  rateControllingEntity?: string;
  transmitToLocation1?: string;
  tmsShipmentId?: string;
  truckerProNumber?: string;
  isLotReceived: boolean;
  isShipmentOrderTransmit: boolean;
  amendmentCodeBean?: AmendmentCodeBean;
  transmit?:string;
  shipperEmail?:string;
  intertrackFlag?:string;
  aesAmsFlag:YesNo;
  documentCutoffTime:string;
  wwaReference:string
}


export const createDefaultMainDetailsState = (loginBean?: any | null, isVisible?: (key: ToggleKey) => boolean): BookingFormState => {

  const today = dayjs();
  const handlingOffice = loginBean?.officeCode || "NYC";
  const takenBy = isVisible?.(CommonToggleKeys.OCN_IMPORT_QUOTE_ENHANCEMENT)
    ? (loginBean?.ldapUsername ?? loginBean?.username)
    : loginBean?.username;
  const billingCompany = loginBean?.userCompany || "";
  const receivedFromName = loginBean?.userFullname || "";

  return {
    bookingQuoteType: "",
    referenceNumber: null,
    quoteNumber: null,
    userReference: "",
    modeOfTransport: "V",
    routed: "",
    controlNumber: "",
    isCustomerOwnCFSAgreement: "N",
    directLoading: "N",
    vid: "N",
    transmitToLocationName: "",
    customerOwnContainerToggle: "N",
    clauses: [],
    receivedVia: "",
    siChannel: "",
    pendingFinalBookingStatus: "N",
    billingCompany: billingCompany,
    handlingOffice: handlingOffice,
    status: "",
    receivedFromName: receivedFromName,
    takenBy: takenBy,
    bookQuoteDate: today.toISOString(),
    updatedBy: '',
    updatedOn: today.toISOString(),
    controlFlag: "N",
    tmsShipmentId: '',
    truckerProNumber: '',
    isLotReceived: false,
    isShipmentOrderTransmit: false,
  };
};
