export const carrierOptionsPaths = {
  GET_ORIGIN_AND_DESTINATION_CITY_STATE:
    '/phoenix/api-common/1.0/trucking/getOriginAndDestinationCityState',
  BOOK_DOMESTIC_SHIPMENT:
    '/phoenix/1.0/tms/bookDomesticShipment',
  GET_WAREHOUSE_DETAILS:
    '/phoenix/api-common/1.0/warehouse/details',

  FETCH_TRUCK_RATES:
    '/phoenix/api-common/1.0/truckrate/fetchTruckRates',
  GET_WAREHOUSE_DETAILS_BY_CODE:
    '/phoenix/api-common/1.0/warehouse/detailsByCode',
  GET_RATE_MAPPING:
    '/phoenix/api-common/1.0/truckrate/chargesByKeys',
} as const;
