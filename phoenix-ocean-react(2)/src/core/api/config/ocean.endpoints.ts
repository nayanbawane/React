import { WEB_SERVICE_URL_FOR_OCEAN } from 'phoenix-common-react';

export const OCEAN_ENDPOINTS = {

  BASE: WEB_SERVICE_URL_FOR_OCEAN,

  IMPORT_BOOKING: {
    POPULATE_DATA:          `${WEB_SERVICE_URL_FOR_OCEAN}/prebooking/get`,
    VALIDATE_AND_SAVE_DATA: `${WEB_SERVICE_URL_FOR_OCEAN}/prebooking/save`,
    CANCEL_PREBOOKING:      `${WEB_SERVICE_URL_FOR_OCEAN}/prebooking/cancel`,
  },

  QUOTE: {
    POPULATE_DATA:          `${WEB_SERVICE_URL_FOR_OCEAN}/quote/populateQuote`,
    VALIDATE_AND_SAVE_DATA: `${WEB_SERVICE_URL_FOR_OCEAN}/quote/validateAndSaveQuote`,
  },

  CUSTOMER_RATE_SETTING: {
    GET_CUSTOMER_RATE_SETTING: `${WEB_SERVICE_URL_FOR_OCEAN}/customerratesetting/getCustomerRateSetting`,
    GET_CUSTOMER_PATTERNS:     `${WEB_SERVICE_URL_FOR_OCEAN}/customerratesetting/getCustomerPatterns`,
  },

  INCIDENT: {
    GET_CATEGORY_REASON: `${WEB_SERVICE_URL_FOR_OCEAN}/emt-imt/categoryReason`,
    GET_INCIDENT_TIME:   `${WEB_SERVICE_URL_FOR_OCEAN}/emt-imt/incidentTime`,
    CANCEL_BOOKING:      `${WEB_SERVICE_URL_FOR_OCEAN}/emt-imt/cancelBooking`,
  },

  LOCATION: {
    GET_LOCATION_INFORMATION:    `${WEB_SERVICE_URL_FOR_OCEAN}/location/get/information`,
    GET_LOCATION_DATA:           `${WEB_SERVICE_URL_FOR_OCEAN}/location/get/data`,
    COMMON_LOCATION_INFORMATION: `${WEB_SERVICE_URL_FOR_OCEAN}/location/common/information`,
  },

} as const;
