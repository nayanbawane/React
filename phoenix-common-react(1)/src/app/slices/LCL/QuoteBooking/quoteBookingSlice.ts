import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { 
  QuoteBookingData, 
  LocationInformationData,
  CargoDetailsState,
  LCLFormState,
} from '../../../../types/LCL/misc/commonTypes';

const initialMainDetails: LCLFormState = {
  type: '',
  referenceNumber: 0,
  userReference: '',
  status: '',
  clauses: [],
  effectiveDate: null,
  expirationDate: null,
  quoteChannel: '',
  direction: 'Export',
  pendingFinal: '',
  truckQuote: '',
  quoteType: 'Actual',
  billingCompany: '',
  handlingOffice: '',
  createdBy: '',
  createdOn: null,
  updatedBy: '',
  updatedOn: null,
  Terms: '',
  carrier: [],
  carrierBookingNumber: '',
  frequency: '',
  pickupNeeded: 'N',
  prepaidCollect: '',
  controllingEntity: 'Origin',
  transitTime: '0'
};

const initialLocationInfo: LocationInformationData = {
  publicInfo: '',
  privateInfo: '',
};

const initialCargoDetails: CargoDetailsState = {
  flags: {
    fortyContainer: false,
    fortyFiveContainer: false,
    fiftyThreeTrailer: false,
    overLength: false,
    overWeight: false,
    nonStackable: false,
    printDimension: false,
  },
  lotRows: [{ type: 'Please Select', details: '' }],
  internalComment: '',
  cargoRows: [],
  customsRows: [],
};

const initialState: QuoteBookingData = {
  mainDetails: initialMainDetails,
  documentDetails: [],
  cargoDetails: initialCargoDetails,
  locationInformation: initialLocationInfo,
};

export const quoteBookingSlice = createSlice({
  name: 'quoteBooking',
  initialState,
  reducers: {
    updateMainDetails: (state, action: PayloadAction<Partial<LCLFormState>>) => {
      Object.assign(state.mainDetails, action.payload);
    },
    updateLocationInformation: (state, action: PayloadAction<Partial<LocationInformationData>>) => {
      Object.assign(state.locationInformation, action.payload);
    },
    updateCargoDetails: (state, action: PayloadAction<Partial<CargoDetailsState>>) => {
      Object.assign(state.cargoDetails, action.payload);
    },
    resetForm: (state) => {
      const bookingQuoteType = state.mainDetails?.type;

      state.mainDetails = {
        ...initialMainDetails,
        type: bookingQuoteType ?? '',
      };
      state.documentDetails = [];
      state.cargoDetails = {
        ...initialCargoDetails,
        flags: { ...initialCargoDetails.flags },
        lotRows: initialCargoDetails.lotRows.map((row) => ({ ...row })),
        cargoRows: [],
        customsRows: [],
      };
      state.locationInformation = { ...initialLocationInfo };
    },
  },
});

export const {
  updateMainDetails,
  updateLocationInformation,
  updateCargoDetails,
  resetForm,
} = quoteBookingSlice.actions;

export default quoteBookingSlice.reducer;
