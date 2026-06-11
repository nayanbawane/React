import {
  COMMON_WEB_SERVICE_URL, PHOENIX_BASE_URL,
  WEB_SERVICE_URL_FOR_OCEAN,
} from './url-config';

export const COMMON_ENDPOINTS = {
  BASE: COMMON_WEB_SERVICE_URL,

  SUGGESTION_BOX: {
    GET_SUGGESTION_DATA: `${COMMON_WEB_SERVICE_URL}/suggestionbox/common/getSuggestData`,
    GET_SELECTION_DATA: `${COMMON_WEB_SERVICE_URL}/selectionbox/common/getSelectionData`,
    GET_MULTI_PANEL_SUGGEST_DATA: `${COMMON_WEB_SERVICE_URL}/suggestionbox/common/getMultiPanelSuggestData`,
    GET_LISTBOX_DATA: `${COMMON_WEB_SERVICE_URL}/commonlistbox/common/getCommonListBoxData`,
    GET_GEN_BASIS_DATA: `${COMMON_WEB_SERVICE_URL}/genBasis/displayGenBasisData`,
    GET_SUGGESTION_DATA_FROM_API: `${COMMON_WEB_SERVICE_URL}/suggestionbox/common/getSuggestDataFromApi`,
  },

  RATE_DETAILS: {
    GET_CURRENCY_CONVERSION_RATE: `${COMMON_WEB_SERVICE_URL}/currency/getCurrencyConversionRate`,
    GET_RATE_CALC_WITH_FORMULA: `${COMMON_WEB_SERVICE_URL}/rates/getRateCalcWithFormula`,
    GET_RATE_CALC: `${COMMON_WEB_SERVICE_URL}/rates/getRateCalculation`,
    GET_DEFAULT_CHARGES: `${COMMON_WEB_SERVICE_URL}/defaultRates/getDefaultCharges`,
  },

  SAILING_SCHEDULE: {
    GET_ORIGIN_LIST_FROM_CACHE: `${COMMON_WEB_SERVICE_URL}/sailingschedule/getOriginListFromCache`,
    GET_DESTINATION_LIST_FROM_CACHE: `${COMMON_WEB_SERVICE_URL}/sailingschedule/getDestinationListFromCache`,
    GET_DATA_FROM_WEBSERVICE: `${COMMON_WEB_SERVICE_URL}/sailingschedule/getDataFromWebService`,
  },

  OBJECT_STORAGE: {
    UPLOAD: `${COMMON_WEB_SERVICE_URL}/eservice/objectStarage`,
  },

  ORGANIZATION_SEARCH: {
    GET_ROW_COUNT: `${COMMON_WEB_SERVICE_URL}/organizationserach/getRowCount`,
    GET_ORGANIZATION_SEARCH_PAGINATION_DATA: `${COMMON_WEB_SERVICE_URL}/organizationserach/getPaginationData`,
    GET_ORGANIZATION_SEARCH_EXPAND_DATA: `${COMMON_WEB_SERVICE_URL}/organizationserach/getOrganizationMoreDetail`,
  },

  TERMS_AND_CONDITIONS: {
    GET_TERMS_AND_CONDITIONS: `${COMMON_WEB_SERVICE_URL}/termsandconditions/get`,
  },

  LOCAL_STORAGE: {
    GET_CONTAINER_MAPPING_DATA: `${COMMON_WEB_SERVICE_URL}/localstorage/common/getContainerMappingData`,
    GET_CONTAINER_VALIDATION_DATA: `${COMMON_WEB_SERVICE_URL}/localstorage/common/getContainerValidationData`,
  },

  CARRIER_OPTIONS: {
    GET_ORIGIN_AND_DESTINATION_CITY_STATE: `${COMMON_WEB_SERVICE_URL}/trucking/getOriginAndDestinationCityState`,
    GET_WAREHOUSE_DETAILS:                 `${COMMON_WEB_SERVICE_URL}/warehouse/details`,
    GET_SHIPMENT_STATUS_HISTORY:  `${COMMON_WEB_SERVICE_URL}/trucking/tmsShipmentStatusHistory`,
    GET_WAREHOUSE_DETAILS_BY_CODE:         `${COMMON_WEB_SERVICE_URL}/warehouse/detailsByCode`,
    FETCH_TRUCK_RATES:                     `${COMMON_WEB_SERVICE_URL}/truckrate/fetchTruckRates`,
    GET_RATE_MAPPING:                      `${COMMON_WEB_SERVICE_URL}/truckrate/chargesByKeys`,
  },

  ACCURATE_RATE: {
    SET_UN_CODES: `${COMMON_WEB_SERVICE_URL}/accurate-rate/set-un-codes`,
    POPULATE_ACCURATE_RATES: `${COMMON_WEB_SERVICE_URL}/accurate-rate/populate-accurate-rates`,
  },


  HAZ_RULE: {
    FETCH_HAZ_RULES: `${COMMON_WEB_SERVICE_URL}/hazrule/fetchHazRules`,
  },

  INCIDENT: {
    GET_CATEGORY_REASON: `${WEB_SERVICE_URL_FOR_OCEAN}/emt-imt/categoryReason`,
    GET_INCIDENT_TIME: `${WEB_SERVICE_URL_FOR_OCEAN}/emt-imt/incidentTime`,
    CANCEL_BOOKING: `${WEB_SERVICE_URL_FOR_OCEAN}/emt-imt/cancelBooking`,
  },

  LOCATION: {
    GET_LOCATION_INFORMATION: `${WEB_SERVICE_URL_FOR_OCEAN}/location/get/information`,
    GET_LOCATION_DATA: `${WEB_SERVICE_URL_FOR_OCEAN}/location/get/data`,
    COMMON_LOCATION_INFORMATION: `${WEB_SERVICE_URL_FOR_OCEAN}/location/common/information`,
    VALIDATE_EMBARGO_ROUTING_CODES: `${COMMON_WEB_SERVICE_URL}/routingCodeValidation/getValidateForEmbargoRoutingCodes`,
  },

  WAREHOUSE_MAPPING: {
    GET_LOT_RECEIVED_FLAG: `${COMMON_WEB_SERVICE_URL}/bookingQuotePopulate/getLotRecievedFlag`,
    FIND_CLOSEST_WAREHOUSE: `${COMMON_WEB_SERVICE_URL}/trkWarehouse/findClosestWarehouse`,
    GET_TRK_WAREHOUSE_MAPPING: `${COMMON_WEB_SERVICE_URL}/trkWarehouse/getTrkWarehouseMapping`,
    GET_WAREHOUSE_MAPPING: `${COMMON_WEB_SERVICE_URL}/trkWarehouse/getWarehouseMapping`,
    GET_WAREHOUSE_BY_UNCODE: `${COMMON_WEB_SERVICE_URL}/trkWarehouse/getWarehouseByUNCode`,
  },
  
  CONATINER_BEAN: {
    GET_CONATINER_BEAN_PATH:   `${PHOENIX_BASE_URL}/fetch/teu/json`,
  }

} as const;
