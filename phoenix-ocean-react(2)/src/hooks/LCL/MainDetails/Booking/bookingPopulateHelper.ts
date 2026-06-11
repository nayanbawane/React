
import { PHOENIX_ENDPOINTS } from '@/core/api/config/phoenix.endpoints';
import { BookingQuoteResponse } from 'phoenix-common-react';

export const bookingPopulateConfig = {
  endpoint: PHOENIX_ENDPOINTS.BOOKING.POPULATE_DATA,
  transformResponse: (data: any): BookingQuoteResponse => {
    const responseData =  {
      mainBookingQuoteBean: data,
      incidentReasonDetailBean: [],
    };
    return responseData;
  }, 
};
