import type { RateRequestBean, LoginClientBeanRaw } from 'phoenix-common-react';
import { COMMON_ENDPOINTS } from 'phoenix-common-react';
import { buildRateRequestPayload } from '@/features/LCL/Booking/rateRequestPayloadMapper';
import type { AccurateRateRequestBean, AccurateRateResponseBean } from './accurateRateTypes';

export interface AccurateRateConfig<TResult = AccurateRateResponseBean> {
  authorization: string;
  endpoints: {
    setUnCodes: string;
    populateAccurateRates: string;
  };
  transformRequest: (
    formData: Record<string, unknown>,
    loginClientBean?: LoginClientBeanRaw | null
  ) => AccurateRateRequestBean;
  transformResponse: (data: AccurateRateResponseBean) => TResult;
}

export const accurateRateConfig: AccurateRateConfig<AccurateRateResponseBean> = {
  authorization: 'Basic c3RpdXNhZG1pbjpzdGl1c2FkbWlu',
  endpoints: {
    setUnCodes:           COMMON_ENDPOINTS.ACCURATE_RATE.SET_UN_CODES,
    populateAccurateRates: COMMON_ENDPOINTS.ACCURATE_RATE.POPULATE_ACCURATE_RATES,
  },
  transformRequest: (formData, loginClientBean) =>
    buildRateRequestPayload(formData as any, loginClientBean) as AccurateRateRequestBean,
  transformResponse: (data) => data,
};
