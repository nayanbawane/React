import type { DimRowData, HazRowData, InternalCargoRowData, PickupDeliveryFormData, FCLTruckerFormData } from '../../types/LCL/misc/TruckingDetails.types';

export const TRUCK_BOOKING_AUTO_FETCH_RATES = true;

export const makeEmptyDimRow = (): DimRowData => ({
    length: '', width: '', height: '',
    unit: 'Inches', pieces: '', cbm: '', cbf: '',
    kg: '', lbs: '', cls: '',
    shipmentType: 'LTL', stackingType: '-1',
    packageType: '-1', flag: false,
});

export const makeEmptyHazRow = (): HazRowData => ({
  imoClass: '-1',
  imoSubclass: '-1',
  unNumber: '',
  imoPage: '',
  pkgGroup: '-1',
  flashpointC: '0',
  flashpointF: '0',
  pieces: '0',
  packaging: '-1',
  weight: '0',
  properShippingName: '',
  technicalName: '',
  placard1: '',
  placard2: '',
  emergencyNumber: '',
  emergencyContact: '',
  quantity: '-1',
});

export const makeEmptyCargoRow = (): InternalCargoRowData => ({
    marks: '', pieces: '', packaging: '-1',
    description: '', kg: '', lbs: '', cbm: '', cbf: '',
    hazardous: '-1', docRef: '-1',
    dimRows: [makeEmptyDimRow()],
    hazRows: [makeEmptyHazRow()],
});

export const defaultPickupDeliveryFormData: PickupDeliveryFormData = {
    postalCodeCity: '',
    pickupCargoAtCode: '',
    estimatedPickupDate: null,
    timeFrom: '',
    timeTo: '',
    name: '',
    instructions: '',
    streetAddress: '',
    deliveryDate: null,
    deliveryTime: '',
    city: '',
    state: '',
    country: '',
    zipCode: '',
    contactName1: '',
    contactPhone1: '',
    contactEmail1: '',
    contactName2: '',
    contactPhone2: '',
    contactEmail2: '',
    pickupReference: '',
    latitude: '',
    longitude: '',
    accessorials: [],
};

export const defaultTruckerFormData = {
    truckerCode: '',
    truckerDetails: '',
    truckerProNumber: '',
    estimatedDeliveryDate: null as Date | null,
    status: '',
    truckerQuote: '',
    truckerReference: '',
    pickupDate: new Date(),
    pickupTime: "",
    pickupTimeTo: "",
    pickupInstruction: "",
    charges:[
        {
            charge: "",
            expense: "",
            income: "",
            currency: "",
            chargeDescription: "",
        }
    ],
    pickupAtCargoCode: "",
    pickupAtCargoName: "",
    pickupAtCargoName1: null,
    pickupAtCargoAddress1: "",
    pickupAtCargoAddress2: "",
    pickupAtCargoAddress3: "",
    pickupAtCargoAddress4: null,
    pickerContact: "",

};

export const PICKUP_CARGO_ORG_DATA = [
    { code: 'PERFELUY', name: 'PERFEL SA', city: 'MONTEVIDEO - UY' },
    { code: '00JAS', name: 'JAS UK LIMITED', city: 'STANWELL, MIDDL...' },
    { code: '00WILSON', name: 'WILSON LOGISTICS UK LTD.', city: 'MIDDLESEX' },
    { code: '0LUSA', name: 'OL USA LLC DBA CONFLO LINES...', city: '' },
];

export const HAZARDOUS_OPTIONS = [
  { label: 'Please Select', value: '-1' },
  { label: 'Y - Yes', value: 'Y' },
  { label: 'N - No', value: 'N' }
];

export const PACKAGING_OPTIONS = [
    { label: 'Please Select', value: '-1' },
    { label: 'Pallets', value: 'Pallets' },
    { label: 'Cartons', value: 'Cartons' },
    { label: 'Cases', value: 'Cases' },
    { label: 'Packages', value: 'Packages' },
    { label: 'Crates', value: 'Crates' },
    { label: 'Skids', value: 'Skids' },
    { label: 'Shrink Wrapped Pallets', value: 'Shrink Wrapped Pallets' },
    { label: 'Rolls', value: 'Rolls' },
    { label: 'Bags', value: 'Bags' },
    { label: 'Pieces', value: 'Pieces' },
    { label: 'Boxes', value: 'Boxes' },
    { label: 'Bales', value: 'Bales' },
    { label: 'Bundles', value: 'Bundles' },
    { label: 'Cans', value: 'Cans' },
    { label: 'D-Containers', value: 'D-Containers' },
    { label: 'Drums', value: 'Drums' },
    { label: 'IBCs', value: 'IBCs' },
    { label: 'Jerricans', value: 'Jerricans' },
    { label: 'Lift Vans', value: 'Lift Vans' },
    { label: 'Racks', value: 'Racks' },
    { label: 'Totes', value: 'Totes' },
    { label: 'Tubes', value: 'Tubes' },
    { label: 'Units', value: 'Units' },
];

export const DOOR_DELIVERY_ACCESSORIALS = [
    { id: 'appointment', label: 'Appointment' },
    { id: 'hazardous-material', label: 'Hazardous Material' },
    { id: 'liftgate', label: 'Liftgate' },
    { id: 'residential', label: 'Residential' },
];

export const SHIPMENT_TYPE_OPTIONS = [
    { label: 'LTL', value: 'LTL' },
    { label: 'FTL', value: 'FTL' },
];
export const getInitialFCLTruckingData = (): FCLTruckerFormData => (
{
    pickupDate: null,
    pickupTime: "",
    pickupTimeTo: "",
    truckerCode: "",
    truckerName: "",
    truckerAddress1: "",
    truckerAddress2: "",
    truckerAddress3: "",
    truckerContact: "",
    pickupInstruction: "",
    charges: [{
        expense: 0, income: 0, currency: "", chargeDescription: "", charge: ''
    }],
    pickupAtCargoCode: "",
    pickupAtCargoName: "",
    pickupAtCargoName1: "",
    pickupAtCargoAddress1: "",
    pickupAtCargoAddress2: "",
    pickupAtCargoAddress3: "",
    pickupAtCargoAddress4: "",
    pickerContact: "",
    totalIncome: 0,
    totalExpense: 0,
    profitOrLoss: 0,
    truckerCodeDetails:"",
    pickupAtCargoDetails:"",
    pickerPhone: "",
    truckerPhone:""
});
