
import { OCEAN_ENDPOINTS } from '@/core/api/config/ocean.endpoints';
import { BookingQuoteResponse } from 'phoenix-common-react';

export const prebookingPopulateConfig = {
  endpoint: OCEAN_ENDPOINTS.IMPORT_BOOKING.POPULATE_DATA,
  
  transformResponse: (data: any): BookingQuoteResponse => {
    return data;
  }, 
};
