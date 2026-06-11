import { PHOENIX_BASE_URL } from './url-config';

export const PHOENIX_ENDPOINTS = {

  BASE: PHOENIX_BASE_URL,

  BOOKING: {
    POPULATE_DATA:          `${PHOENIX_BASE_URL}/booking/populate`,
    VALIDATE_AND_SAVE_DATA: `${PHOENIX_BASE_URL}/booking/save`,
    CANCEL_ORIGIN_BOOKING: `${PHOENIX_BASE_URL}/booking/cancelOriginBooking`,
    CANCEL_TRK_REQUEST: `${PHOENIX_BASE_URL}/booking/cancelTrkRequest`,
    CANCEL_WAREHOUSE_TRANSMISSION: `${PHOENIX_BASE_URL}/booking/cancelWarehouseTransmission`,
    EXECUTE_PERL_REPORT: `${PHOENIX_BASE_URL}/booking/executePerlReport`,
  },

  TMS: {
    GET_TMS_RATE_QUOTE:     `${PHOENIX_BASE_URL}/tms/rateQuote`,
    BOOK_DOMESTIC_SHIPMENT: `${PHOENIX_BASE_URL}/tms/bookDomesticShipment`,
    FETCH_CARRIER_DETAILS: `${PHOENIX_BASE_URL}/tms/fetchCarrierDetails`,
  },

} as const;
