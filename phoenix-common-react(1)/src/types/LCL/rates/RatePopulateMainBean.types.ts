import type { RateDetailBean } from './RateDetailBean.types';

/**
 * RatePopulateMainBean - Response DTO for AccuRate API
 */
export interface RatePopulateMainBean {
  rateDetailBeans: RateDetailBean[] | null;
  chargeDescEnglish: Record<string, string> | null;
  chargeDescLocale: Record<string, string> | null;
  nacRatesAvailable: boolean;
}
