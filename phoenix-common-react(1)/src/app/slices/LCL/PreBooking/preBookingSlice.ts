// import { createDefaultDocumentRows, DocumentUploadFormData } from '../../../../features/LCL/Components/DocumentDetails/documentDetails.state';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  defaultRateDetailsFormData,
  getInitialPreBookingFormData,
  getInitialRoutingData,
  initialCargoDetails,
  initialCustomerDetailFormState,
} from '../../../../InitialData';
import { PreBookingFormData } from '../../../../types/LCL/mainDetails/PreBookingMainDetails.types';

import { initialLocationInfo } from '../../../../InitialData/LCL/LocatioInfo';

export interface PreBookingState {
  mainDetails: PreBookingFormData;
  isReferenceDisabled: boolean;
  isReferenceNoInvalid: boolean;
  isImportQuoteNoInvalid: boolean;
  isEuropeOffice: boolean;
  customerType: string;
}

// const initialprebookingMainDetails = getInitialPreBookingFormData();

const initialpreBookingState = {
  mainDetails: getInitialPreBookingFormData(),
  documentDetails: [],
  customerDetails: initialCustomerDetailFormState,
  routingDetails: getInitialRoutingData(),
  cargoDetails: initialCargoDetails,
  rateDetails: defaultRateDetailsFormData('USD', 'USD'),
  locationInformation: initialLocationInfo,

  isReferenceDisabled: false,
  isReferenceNoInvalid: false,
  isImportQuoteNoInvalid: false,
  isEuropeOffice: false,

  customerType: '',
};

export const preBookingSlice = createSlice({
  name: 'preBooking',
  initialState: initialpreBookingState,
  reducers: {
    updatePreBookingMainDetails: (
      state,
      action: PayloadAction<Partial<PreBookingFormData>>
    ) => {
      Object.assign(state.mainDetails, action.payload);
    },
    setReferenceDisabled: (state, action: PayloadAction<boolean>) => {
      state.isReferenceDisabled = action.payload;
    },
    setReferenceNoInvalid: (state, action: PayloadAction<boolean>) => {
      state.isReferenceNoInvalid = action.payload;
    },
    setImportQuoteNoInvalid: (state, action: PayloadAction<boolean>) => {
      state.isImportQuoteNoInvalid = action.payload;
    },
    setIsEuropeOffice: (state, action: PayloadAction<boolean>) => {
      state.isEuropeOffice = action.payload;
    },
    updateCustomerType: (state, action: PayloadAction<string>) => {
      state.customerType = action.payload;
    },

    resetPreBookingForm: () => initialpreBookingState,
  },
});

export const {
  updatePreBookingMainDetails,
  resetPreBookingForm,
  setReferenceDisabled,
  setReferenceNoInvalid,
  setImportQuoteNoInvalid,
  setIsEuropeOffice,
  updateCustomerType,
} = preBookingSlice.actions;

export default preBookingSlice.reducer;
