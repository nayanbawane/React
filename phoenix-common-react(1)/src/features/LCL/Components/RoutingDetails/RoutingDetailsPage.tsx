import { useState } from 'react';

import RoutingDetails from './RoutingDetails';
import {
  RoutingFormData,
  pickupState,
  pickupHandlers,
} from '@/types/LCL/routing/RoutingDetails.types';

const STUB_PICKUP_STATE: pickupState = {
  pickUpValue: '',
  openPickupModal: false,
  pickups: [],
  openDialog: false,
  collapsedSet: new Set(),
  isCFSDoor: false,
};

const noop = () => {};

const STUB_PICKUP_HANDLERS: pickupHandlers = {
  handlePickupChange: noop,
  handleAddPickup: noop,
  handleRemovePickup: noop,
  handleConfirmRemove: noop,
  handleToggleCollapse: noop,
  closePickupModal: noop,
  handleAgentNameSelect: noop,
  handleAgentNameChange: noop,
  handleAgentEmailChange: noop,
};

const STUB_RATE_DETAILS = { defaultState: { accurateRate: false } };

const tempData = {
  termsOptions: [
    { code: 'CFR', name: 'Cost and Freight' },
    { code: 'CIF', name: 'Cost, Insurance and Freight' },
    { code: 'EXW', name: 'Ex Works' },
    { code: 'FOB', name: 'Free on Board' },
    { code: 'CFS / DOOR', name: 'Cost and Freight' },
  ],
  pickupNeededOptions: [
    { label: 'N - No', value: 'N' },
    { label: 'Y - Shipco TMS', value: 'T' },
    { label: 'Y - Yes', value: 'Y' },
  ],
  preCarriageTypes: [
    { label: 'Select', value: '' },
    { label: 'Vessel', value: 'Vessel' },
    { label: 'Truck', value: 'Truck' },
    { label: 'Rail', value: 'Rail' },
  ],
  locationOptions: [
    { code: 'DRI', name: 'DEL RIO, TX', unCode: 'USDRT', country: 'US' },
    { code: 'DRM', name: 'DURHAM, NC', unCode: 'USDUR', country: 'US' },
    { code: 'DRN', name: 'DUREN', unCode: 'DEDUE', country: 'DE' },
    { code: 'DRO', name: 'DROITWICH', unCode: 'GBDRO', country: 'GB' },
  ],
  vesselCodes: [
    { code: '500', name: 'NO VESSEL' },
    { code: '5069269', name: 'FATSA' },
    { code: '5209429', name: 'FARSA I' },
    { code: '5318177', name: 'FAZLURRAHMAN' },
  ],
  carrierCodes: [
    { code: '11WJ', name: 'Shanghai Jinjiang Shipping' },
    { code: 'ACL', name: 'Advance Container Line' },
    { code: 'ACLU', name: 'ACL' },
    { code: 'ALP', name: 'Alpine Shipping Ltd.' },
  ],
  cutoffTimes: [
    { time: '10:00 AM' },
    { time: '10:00 PM' },
    { time: '11:00 AM' },
    { time: '11:00 PM' },
  ],
  placeOfDeliveryTypeOptions: [
    { label: 'Please Select', value: '' },
    { label: 'DOOR', value: 'DOOR' },
    { label: 'CFS', value: 'CFS' },
  ],
  docDeliveryOptions: [
    { code: 'AEPLAI', name: 'AEP PRO SERV', contact: '' },
    { code: 'ccc', name: 'CANME CCC', contact: 'User_contact12' },
    { code: 'ddd', name: 'DDD DOC NAME', contact: 'User_contact1' },
  ],
};

const initialFormData: RoutingFormData = {
  agentName: '',
  shipmentDate: '',
  agentEmail: '',
  terms: '',
  pickupNeeded: '',
  preCarriageType: '',
  preCarriageBy: '',
  preCarriageEts: null,
  vesselCode: '',
  vesselName: '',
  voyage: '',
  carrierCode: '',
  placeOfReceiptCode: '',
  placeOfReceiptName: '',
  placeOfReceiptEtd: null,
  placeOfReceiptRegion: '',
  consolidationCfsCode: '',
  consolidationCfsName: '',
  consolidationCfsEtd: null,
  consolidationCfsRegion: '',
  portOfLoadingCode: '',
  portOfLoadingName: '',
  portOfLoadingEts: null,
  portOfLoadingRegion: '',
  transshipmentPorts: [
    { id: 1, portCode: '', portName: '', eta: null },
  ],
  portOfDischargeCode: '',
  portOfDischargeName: '',
  portOfDischargeEta: null,
  portOfDischargeRegion: '',
  deconsolidationCfsCode: '',
  deconsolidationCfsName: '',
  deconsolidationCfsEta: null,
  deconsolidationCfsRegion: '',
  destinationCfsCode: '',
  destinationCfsName: '',
  destinationCfsEta: null,
  destinationCfsRegion: '',
  placeOfReceiptPickupFrom: '',
  placeOfReceiptPickupFromName: '',
  placeOfReceiptPickupTo: '',
  placeOfReceiptPickupToName: '',
  placeOfDeliveryCode: '',
  placeOfDeliveryType: '',
  placeOfDeliveryName: '',
  placeOfDeliveryEta: null,
  placeOfDeliveryRegion: '',
  manufacturerNames: [{ id: crypto.randomUUID(), name: '' }],
  warehouse: '',
  warehouseName: '',
  deliveryReference: '',
  cfsCutoffDate: null,
  cfsCutoffTime: '',
  gatewayCutoffDate: null,
  gatewayCutoffTime: '',
  destinationWarehouse: '',
  docDelivery: '',
  docContact: '',
  docCutoffDate: null,
  docCutoffTime: '',
  customsCutoffDate: null,
  customsCutoffTime: '',
  cargoReadDate: null,
  deliveryType: '',
  cbl: '',
  direction: '',
  cfsContactName: '',
  cfsContactPhone: '',
  customsBroker: '',
  deliveryAppointmentDateFrom: null,
  deliveryAppointmentTimeFrom: '',
  deliveryAppointmentDateTo: null,
  deliveryAppointmentTimeTo: '',
};

function RoutingDetailsPage() {
  const [formData, setFormData] = useState<RoutingFormData>(initialFormData);

  const handleChange = <K extends keyof RoutingFormData>(
    field: K,
    value: RoutingFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleWarehouseSelect = (item: Record<string, unknown>) => {
    const code = String(item.code ?? '');
    const name = String(item.name ?? '');
    handleChange('warehouse', code);
    handleChange('warehouseName', name);
  };

  return (
    <RoutingDetails
      moduleType="BKG"
      formData={formData}
      onChange={handleChange}
      tempData={tempData}
      pickupState={STUB_PICKUP_STATE}
      pickupHandlers={STUB_PICKUP_HANDLERS}
      rateDetails={STUB_RATE_DETAILS}
      onRegisterFields={noop}
      onFieldsChange={noop}
      handleWarehouseSelect={handleWarehouseSelect}
    />
  );
}

export default RoutingDetailsPage;
