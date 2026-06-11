import type { BookingFormState } from './mainDetails.state';
import { createDefaultMainDetailsState } from './mainDetails.state';
import { toYesNo, YesNo } from '../../../../types/LCL/common.types';
import { getFormattedDate } from '../../../../core/utils/date.utility';
import {
  BookingQuoteBean,
  Clause,
} from '../../../../types/LCL/booking/booking.types';
import {
  EDI_CONSTANT,
  EDIBOOKING,
  ESERVICE_CONSTANT,
  ESERVICE_STI_ONLINE_CONSTANT,
  ESERVICE_STRING,
  GLOBAL_EXPORT_BOOKING,
  GLOBALEXPORTBOOKING,
  PHOENIX_CONSTANT,
  PHOENIX_STRING,
  SSCOFFICElIST,
  SSCONLINEBOOKING,
  STI_CONSTANT,
  STI_STRING,
} from '../../../../core/utils/application-client-constant.utility';
import { AmendmentCodeBean } from '@/types';

export type MainDetailsFormPayload = BookingFormState;

const isYesNo = (value: unknown): value is YesNo =>
  value === 'Y' || value === 'N';

const normalizeYesNo = (value: unknown): YesNo | undefined => {
  if (isYesNo(value)) return value;
  if (value === true) return 'Y';
  if (value === false) return 'N';
  return undefined;
};

export const mapMainDetailsToBookingQuoteBean = (
  form: MainDetailsFormPayload | undefined
): Partial<BookingQuoteBean> => {
  if (!form) return {};

  const isNewBooking = form.referenceNumber === null || form.referenceNumber === undefined || form.referenceNumber === 0;

  const result: Partial<BookingQuoteBean> = {
    bookingQuoteType: form.bookingQuoteType,
    referenceNumber: form.referenceNumber,
    quoteNumber: form.quoteNumber,
    userReference: form.userReference,
    modeOfTransport: form.modeOfTransport,
    routed: toYesNo(form.routed),
    controlNumber: form.controlNumber,
    isCustomerOwnCFSAgreement: form.isCustomerOwnCFSAgreement,
    directLoading: form.directLoading,
    vid: form.vid,
    transmitToLocationName: form.transmitToLocationName,
    transmitToLocation1:form.transmitToLocation1,
    customerOwnContainerToggle: form.customerOwnContainerToggle,
    clauses: form.clauses,
    receivedVia: form.receivedVia,
    pendingFinalBookingStatus: form.pendingFinalBookingStatus,
    handlingOffice: form.handlingOffice,
    status: form.status,
    receivedFromName: form.receivedFromName,
    takenBy: form.takenBy,
    bookQuoteDate: getFormattedDate(form.bookQuoteDate),
    updatedBy: form.updatedBy,
    updatedOn: getFormattedDate(form.updatedOn),
    controlFlag: isNewBooking ? 'N' : 'U',
    agentCode: form.agentCode,
    tmsShipmentId: form.tmsShipmentId,
    truckerProNumber: form.truckerProNumber,
    transmit:form.transmit,
    shipperEmail:form.shipperEmail,
    intertrackFlag:form.intertrackFlag,
    aesAmsFlag:form.aesAmsFlag,
    documentCutoffTime:form.documentCutoffTime,
    wwaReference:form.wwaReference,
  };

  const routed = normalizeYesNo(form.routed);
  if (routed) {
    result.routed = routed;
  }

  if (form.referenceNumber !== null) {
    result.referenceNumber = form.referenceNumber;
  }
  if (form.quoteNumber !== null) {
    result.quoteNumber = form.quoteNumber;
  }
  if (form.bookQuoteDate) {
    result.bookQuoteDate = getFormattedDate(form.bookQuoteDate);
  }
  if (form.updatedOn) {
    result.updatedOn = getFormattedDate(form.updatedOn);
  }

  return result;
};

export const mapBookingQuoteBeanToMainDetails = (
  bean: Partial<BookingQuoteBean> | undefined,
  amendmentCodeBean: AmendmentCodeBean | undefined,
  loginBean: any,
  fallback: BookingFormState = createDefaultMainDetailsState()
): BookingFormState => {
  if (!bean) return fallback;

  const bookQuoteDate =
    getFormattedDate(bean.bookQuoteDate) ?? fallback.bookQuoteDate;
  const updatedOn = getFormattedDate(bean.updatedOn ?? fallback.updatedOn);

    return {
        ...fallback,
        bookingQuoteType: bean.bookingQuoteType ?? fallback.bookingQuoteType,
        referenceNumber: bean.referenceNumber ?? fallback.referenceNumber,
        quoteNumber: bean.quoteNumber ?? fallback.quoteNumber,
        userReference: bean.userReference ?? fallback.userReference,
        modeOfTransport: bean.modeOfTransport ?? fallback.modeOfTransport,
        routed: (bean.routed ?? fallback.routed) as string,
        isCustomerOwnCFSAgreement: bean.isCustomerOwnCFSAgreement ?? fallback.isCustomerOwnCFSAgreement,
        directLoading: bean.directLoading ?? fallback.directLoading,
        vid: bean.vid ?? fallback.vid,
        transmitToLocationName: bean.transmitToLocationName ?? fallback.transmitToLocationName,
        customerOwnContainerToggle: bean.customerOwnContainerToggle ?? fallback.customerOwnContainerToggle,
        clauses: mapClauses(bean.clauses) ?? fallback.clauses,
        receivedVia: bean.receivedVia ?? fallback.receivedVia,
        siChannel: setSIChannelText(bean?.siChannel, bean),
        pendingFinalBookingStatus: bean.pendingFinalBookingStatus ?? fallback.pendingFinalBookingStatus,
        billingCompany: bean?.bookingQuoteCustomerBean?.billingCompany ?? fallback.billingCompany,
        handlingOffice: bean.handlingOffice ?? fallback.handlingOffice,
        status: bean.status ?? fallback.status,
        receivedFromName: bean.receivedFromName ?? fallback.receivedFromName,
        takenBy: bean.takenBy ?? fallback.takenBy,
        bookQuoteDate,
        updatedBy: bean.updatedBy ?? fallback.updatedBy,
        updatedOn,
        controlFlag: bean.controlFlag ?? fallback.controlFlag,
        agentCode: bean.agentCode ?? fallback.agentCode,
        hazardousAction: bean.hazardousAction ?? fallback.hazardousAction,
        isHazardousPermissionOverride: bean.isHazardousPermissionOverride ?? fallback.isHazardousPermissionOverride,
        lineCode: bean.lineCode ?? fallback.lineCode,
        nomination: bean.nomination ?? fallback.nomination,
        preliminaryBookingStatus: bean.preliminaryBookingStatus ?? fallback.preliminaryBookingStatus,
        rateControllingEntity: bean.rateControllingEntity ?? fallback.rateControllingEntity,
        transmitToLocation1: bean.transmitToLocation1 ?? fallback.transmitToLocation1,
        isLotReceived: fallback.isLotReceived,
        isShipmentOrderTransmit: bean.isShipmentOrderTransmit ?? fallback.isShipmentOrderTransmit,
        tmsShipmentId: bean.tmsShipmentId ?? fallback.tmsShipmentId,
        truckerProNumber: bean.truckerProNumber ?? fallback.truckerProNumber,
        transmit:bean.transmit,
        shipperEmail:bean.shipperEmail,
        intertrackFlag:bean.intertrackFlag,
        aesAmsFlag:bean.aesAmsFlag,
        documentCutoffTime:bean.documentCutoffTime,
        wwaReference:bean.wwaReference,
        amendmentCodeBean: {
          amendmentCode: amendmentCodeBean?.amendmentCode ?? "",
          bookingNumber: amendmentCodeBean?.bookingNumber ?? "",
          handlingOffice: amendmentCodeBean?.handlingOffice ?? "",
          inputUser: amendmentCodeBean?.inputUser ?? "",
          inputDate: amendmentCodeBean?.inputDate ?? "",
          oldAmendmentCode: amendmentCodeBean?.oldAmendmentCode ?? "",
          reference: amendmentCodeBean?.reference ?? "",
          officeId: amendmentCodeBean?.officeId ?? 0,
          module: amendmentCodeBean?.module ?? "",
          siteId: amendmentCodeBean?.siteId ?? 0,
        }
     
    };
};

const mapClauses = (clauses: Clause[] | undefined): Clause[] => {
  if (!clauses?.length) return [];
  return clauses.map((clause) => ({
    clauseCode: clause.clauseCode,
    clauseName: clause.clauseName,
    clauseDesc: clause.clauseDesc,
    clauseDescLocale: clause.clauseDescLocale,
    clauseLocale: clause.clauseLocale,
    clauseNameLocale: clause.clauseNameLocale,
    sequence: clause.sequence,
  }));
};

function setSIChannelText(
  channelValue: string | undefined,
  bookingQuoteBean: any
): string {
  const handlingOffice = bookingQuoteBean?.handlingOffice ?? '';

  if (PHOENIX_CONSTANT.toLowerCase() === channelValue?.toLowerCase()) {
    return PHOENIX_STRING;
  } else if (
    ESERVICE_CONSTANT.toLowerCase() === channelValue?.toLowerCase() ||
    ESERVICE_STI_ONLINE_CONSTANT.toLowerCase() === channelValue?.toLowerCase()
  ) {
    return ESERVICE_STRING;
  } else if (STI_CONSTANT.toLowerCase() === channelValue?.toLowerCase()) {
    if (SSCOFFICElIST.includes(handlingOffice)) {
      return SSCONLINEBOOKING;
    } else {
      return STI_STRING;
    }
  } else if (EDI_CONSTANT.toLowerCase() === channelValue?.toLowerCase()) {
    return EDIBOOKING;
  } else if (
    GLOBALEXPORTBOOKING.toLowerCase() === channelValue?.toLowerCase()
  ) {
    return GLOBAL_EXPORT_BOOKING;
  }
  return '';
}

export const mapMainDetailsToPreBookingQuoteBean = (form) => {

  if (!form) return {};

  const result = {
    bookingQuoteType: form.type,
    referenceNumber: form.reference,
    quoteNumber: form.importQuoteNumber || 0,
    userReference: form.userReference,
    modeOfTransport: form.modeOfTransport,
    routed: form.routed,
    clauses: form.clauses,
    receivedVia: form.preBookingChannel,
    handlingOffice: form.handlingOffice,
    status: 'I',
    receivedFromName: form.receivedFromName,
    takenBy: form.createdBy,
    bookQuoteDate: getFormattedDate(form.createdOn),
    updatedBy: form.updatedBy,
    updatedOn: getFormattedDate(form.updatedOn),
    agentCode: form.agentCode,
    tmsShipmentId: form.tmsShipmentId,
    truckerProNumber: form.truckerProNumber,

    controlNumber: form.controlNumber,
    isCustomerOwnCFSAgreement: "N",
    directLoading: "N",
    vid:"N",
    transmitToLocationName: form.transmitToLocationName,
    customerOwnContainerToggle: form.customerOwnContainerToggle,
    controlFlag: "N",
    pendingFinalBookingStatus:"N",
  };

  if (form.bookQuoteDate) {
    result.bookQuoteDate = getFormattedDate(form.bookQuoteDate);
  }
  if (form.updatedOn) {
    result.updatedOn = getFormattedDate(form.updatedOn);
  }

  return result;
};
