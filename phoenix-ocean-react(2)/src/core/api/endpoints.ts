/**
 * Centralized API Endpoints Configuration
 * This file contains all API endpoints used in the application
 * Benefits:
 * - Single source of truth for all API routes
 * - Easy to update endpoints across the entire app
 * - Type-safe endpoint generation with TypeScript
 * - Clear overview of all API interactions
 */

export const API_ENDPOINTS = {
  // Booking endpoints
  BOOKING: {
    POPULATE_DATA: '/phoenix/1.0/booking/populate',
    VALIDATE_AND_SAVE_DATA: '/phoenix/1.0/booking/save',
    CANCEL_BOOKING: '/phoenix/1.0/booking/cancel',
    TRANSMIT_TO_WAREHOUSE: '/phoenix/1.0/booking/transmitToWarehouse',
    CML_CFS_BLP_STATUS: '/phoenix/1.0/booking/cmlCfsBlpStatus',
    GET_DEFAULT_CLAUSES_BEAN: '/phoenix/1.0/booking/defaultClauses',
    GET_SUGGESTED_CLAUSES: '/phoenix/1.0/booking/suggestedClauses',
  },

  // Import booking endpoints
  IMPORT_BOOKING: {
    VALIDATE_AND_SAVE_DATA: '/phoenix/api-ocean/1.0/prebooking/save',
     POPULATE_DATA: '/phoenix/api-ocean/1.0/prebooking/get',
     
    CANCEL_PREBOOKING: '/phoenix/api-ocean/1.0/prebooking/cancel',
  },

  // Accurate Rate endpoints
  ACCURATE_RATE: {
    SET_UN_CODES: '/phoenix/api-common/1.0/accurate-rate/set-un-codes',
    POPULATE_ACCURATE_RATES: '/phoenix/api-common/1.0/accurate-rate/populate-accurate-rates',
  },

  // Customer Rate Setting endpoints
  CUSTOMER_RATE_SETTING: {
    GET_CUSTOMER_RATE_SETTING: '/phoenix/api-ocean/1.0/customerratesetting/getCustomerRateSetting',
    GET_CUSTOMER_PATTERNS: '/phoenix/api-ocean/1.0/customerratesetting/getCustomerPatterns',
  },

  QUOTE: {
    POPULATE_DATA: '/phoenix/api-ocean/1.0/quote/populateQuote',
    VALIDATE_AND_SAVE_DATA: '/phoenix/api-ocean/1.0/quote/validateAndSaveQuote',
  },

  INCIDENT: {
    CANCEL_BOOKING: '/phoenix/api-ocean/1.0/emt-imt/cancelBooking',
  },

  TMS:{
    GET_TMS_RATE_QUOTE: '/phoenix/1.0/tms/rateQuote',
  },
  EDOCS: {
    POPULATE_EDOCS: '/phoenix/1.0/commonOceanServicesController/edocsResult',
  },

  GEN_CONFIGURATION: {
    GEN_GLOBAL_CONFIGURATION_LIST: '/phoenix/api/1.0/genGlobalConfiguation/getConfigListValues',
  }

} as const;

/**
 * Helper function to build query strings
 * Usage: buildQueryString({ page: 1, limit: 10 }) => "?page=1&limit=10"
 */
export const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Helper function to build URLs with path parameters and query strings
 * Usage: buildUrl('/users/:id', { id: '123' }, { page: 1 })
 */
export const buildUrl = (
  path: string,
  pathParams?: Record<string, string>,
  queryParams?: Record<string, unknown>
): string => {
  let url = path;

  // Replace path parameters
  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    });
  }

  // Add query parameters
  if (queryParams) {
    url += buildQueryString(queryParams);
  }

  return url;
};
