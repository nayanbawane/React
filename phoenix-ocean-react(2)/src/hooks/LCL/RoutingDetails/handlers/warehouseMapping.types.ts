export interface GetLotReceivedFlagRequest {
  requestData: {
    lotReceivedFlagBean: {
      bookingNumber: string;
      params: {
        officeSchemaName: string;
      };
    };
  };
}

export interface GetLotReceivedFlagResponse {
  success: number;
  result: boolean;
  message: string;
  errorCode: string | null;
}

export interface RequestWarehouseBean {
  direction: string;
  countryCode: string;
  unLocationCode: string;
  latitude: number;
  longitude: number;
  source?: string;
  originUnCode?: string;
  rateProfile?: string;
  namedAccount?: string;
  rateDate?: string;
  officeCode?: string;
}

export interface FindClosestWarehouseRequest {
  requestData: {
    requestWarehouseBean: RequestWarehouseBean;
  };
}

export interface ResponseWarehouseBean {
  code: string;
  name: string;
  countryCode: string;
  state: string;
  city: string;
  postalCode: string;
  unLocation: string;
  latitude: number;
  longitude: number;
  unLocationName: string;
  routingCode: string;
  routingName: string;
  ratesFound: string | null;
}

export interface FindClosestWarehouseResponse {
  success: number;
  result: ResponseWarehouseBean | null;
  message: string;
  errorCode: string | null;
}

export interface TRKWarehouseMappingBean {
  direction: string;
  fromCountryCode: string;
  fromPOR: string;
  fromPOL: string;
  fromPickupState: string;
  fromPickupZip: string;
  toCountryCode: string;
  toDestCFS: string;
  toPOD: string;
  toDoorDeliveryState: string;
  toDoorDeliveryZip: string;
  hazardousCode: string;
  carrierCode: string;
  warehouseCode?: string;
  warehouseUnLocation?: string;
  fetchFromShipcoLocation?: boolean;
}

export interface GetWarehouseMappingRequest {
  requestData: {
    trkWarehouseMappingBean: TRKWarehouseMappingBean;
  };
}

export interface TRKWarehouseBean {
  code: string;
  name: string;
  name1: string | null;
  address1: string;
  address2: string;
  address3: string;
  address4: string | null;
  address5: string | null;
  phone: string | null;
  email: string | null;
  state: string | null;
  contactPerson: string | null;
  latitude: string;
  longitude: string;
  countryCode: string;
  unLocationCode: string;
  unLocationName: string;
  routingCode: string;
  routingName: string;
}

export interface GetWarehouseMappingResponse {
  success: number;
  result: TRKWarehouseBean | null;
  message: string;
  errorCode: string | null;
}
