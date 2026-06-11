import { BookingFormState, createDefaultMainDetailsState } from '../../../../features/LCL/Components/BookingMainDetails/mainDetails.state';
import { createDefaultDocumentRows, DocumentUploadFormData } from '../../../../features/LCL/Components/DocumentDetails/documentDetails.state';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface BookingState {
    mainDetails: BookingFormState;
    documentDetails: DocumentUploadFormData[];
}

const initialMainDetails = createDefaultMainDetailsState();
const initialDocumentDetails = createDefaultDocumentRows();

const initialBookingState: BookingState = {
    mainDetails: initialMainDetails,
    documentDetails: initialDocumentDetails,
};

export const bookingSlice = createSlice({
    name: 'booking',
    initialState: initialBookingState,
    reducers: {
        updateBookingMainDetails: (state, action: PayloadAction<Partial<BookingFormState>>) => {
            Object.assign(state.mainDetails, action.payload);
        },
        updateBookingDocumentDetails: (state, action: PayloadAction<DocumentUploadFormData[]>) => {
            state.documentDetails = action.payload;
        },
        resetBookingForm: (state) => {
            const bookingQuoteType = state.mainDetails.bookingQuoteType;

            state.mainDetails = {
                ...createDefaultMainDetailsState(),
                bookingQuoteType,
            };

            state.documentDetails = createDefaultDocumentRows();
        },
    },
});

export const { updateBookingMainDetails, updateBookingDocumentDetails, resetBookingForm } =
    bookingSlice.actions;

export default bookingSlice.reducer;