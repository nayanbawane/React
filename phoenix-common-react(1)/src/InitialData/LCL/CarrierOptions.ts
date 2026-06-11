import type { CarrierOptionsFormData } from '../../types/LCL/misc/CarrierOptions.types';

export const initialCarrierOptionsFormData: CarrierOptionsFormData = {
  pickupLocationCode: '',
  pickupZipCode: '',
  deliverToLocationCode: '',
  deliverToZipCode: '',
  pickupAccessorial: [],
  deliverToAccessorial: [],
  alternateGateway: '',
  zipCode: '',
  shipmentType: 'LTL',
  trailerType: '',
};
