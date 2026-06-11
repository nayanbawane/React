import dayjs from 'dayjs';
import { PreBookingFormData } from '../../types/LCL/mainDetails/PreBookingMainDetails.types';

const formatDate = (date: Date): string => {
  return date
    .toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .replace(/ /g, '-')
    .toUpperCase();
};

const today = formatDate(new Date());

export const getInitialPreBookingFormData = (
  loginClientBean?: any
): PreBookingFormData => {
  const today = dayjs();
  const bookingOffice =
    loginClientBean?.isUserPRC === 'Y' ? '' : (loginClientBean?.office ?? '');

  return {
    type: 'L',
    reference: '',
    importQuoteNumber: '',
    userReference: null,
    modeOfTransport: '',
    routed: 'Y',
    clauses: [],
    preBookingChannel: '',
    exportBookingNumber: '',
    exportQuoteNumber: '',
    followUp: false,
    agentBooking: false,
    wwablnumber: '',
    hold: false,
    importBookingStatus: '-1',
    importBookingStatusList: [],
    truckQuoteNumber: '',
    pendingFinal: false,
    billingCompany: '',
    handlingOffice: '',
    status: '',
    bookingOffice: bookingOffice,
    createdBy: loginClientBean?.ldapUser ?? '',
    createdOn: today.toISOString(),
    updatedBy: '',
    updatedOn: today.toISOString(),

    isReferencePopulated: false,
  };
};
