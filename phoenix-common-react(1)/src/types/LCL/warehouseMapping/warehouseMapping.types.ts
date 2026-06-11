export interface TrkWarehouseMapping {
    direction :string,
    fromRegion :string,
    fromCountryCode :string,
    fromUnLocation :string,
    fromPOR :string,
    fromPOL :string,
    fromPickupState :string,
    fromPickupZip :string,
    toRegion :string,
    toCountryCode :string,
    toUnLocation :string,
    toDestCFS :string,
    toPOD :string,
    toDoorDeliveryState :string,
    toDoorDeliveryZip :string,
    hazardousCode :string,
    carrierCode :string,
    warehouseCode :string,
    warehouseUnLocation :string,
    fetchFromShipcoLocation :boolean,
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