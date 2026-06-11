import { configureStore } from '@reduxjs/toolkit';
import featureToggleReducer from '../../core/featureToggles/featureToggleSlice';
import loginClientBeanReducer from '../../core/featureToggles/loginClientBeanSlice';
import quoteBookingReducer from '../../app/slices/LCL/QuoteBooking/quoteBookingSlice';
import bookingReducer from '../../app/slices/LCL/Booking/bookingSlice';
import preBookingReducer from '../../app/slices/LCL/PreBooking/preBookingSlice';
import bookingVersionReducer from '../../app/slices/LCL/Booking/bookingVersionSlice';

export const store = configureStore({
  reducer: {
    featureToggle: featureToggleReducer,
    preBooking: preBookingReducer,
    loginClientBean: loginClientBeanReducer,
    booking: bookingReducer,
    quoteBooking: quoteBookingReducer,
    versionbutton: bookingVersionReducer
  },
});
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
