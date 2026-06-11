import { configureStore } from '@reduxjs/toolkit';
import { featureToggleReducer, bookingReducer, loginClientBeanReducer, quoteBookingReducer, preBookingReducer, bookingVersionReducer } from 'phoenix-common-react';

export const store = configureStore({
  reducer: {
    featureToggle: featureToggleReducer,
    booking: bookingReducer,
    loginClientBean: loginClientBeanReducer,
    quoteBooking: quoteBookingReducer,
    preBooking:preBookingReducer,
    versionbutton:bookingVersionReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
