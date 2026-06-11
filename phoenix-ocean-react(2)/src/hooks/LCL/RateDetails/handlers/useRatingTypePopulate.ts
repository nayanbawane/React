import {
  CommonToggleKeys,
  LoginClientBeanRaw,
  useFeatureToggle,
} from 'phoenix-common-react';

const NOTIFY_LCL_RATING_TYPE = 'LCL_BKG_RATINGTYPE_FOR_NOTIFY';
const DEFAULT_RATING_TYPE = 'LCL_BKG_DEFAULT_RATINGTYPE';
const CTC_RATE_DISABLE = 'CTC_RATE_DISABLE';

const isNotifyCustomerType = (customerType: string | null | undefined): boolean =>
  ['N', 'H', 'A'].some((t) => t.toLowerCase() === customerType?.toLowerCase());

const getOfficeSetting = (
  loginClientBean: LoginClientBeanRaw | null | undefined,
  key: string
): string | null => {
  const val = loginClientBean?.officeSettingMap?.[key]?.[0];
  return val != null && val !== '' ? val : null;
};

const applyCtcDisableGuard = (
  ratingType: string,
  loginClientBean: LoginClientBeanRaw | null | undefined
): string => {
  const ctcDisabled = getOfficeSetting(loginClientBean, CTC_RATE_DISABLE);
  if (ctcDisabled?.toUpperCase() === 'Y' && ratingType?.toUpperCase() === 'C') {
    return '';
  }
  return ratingType;
};

const isLCL = (containerType: string | null | undefined): boolean =>
  (containerType ?? '').toUpperCase() === 'L';

const isBookingForm = (moduleType: string): boolean =>
  moduleType.toUpperCase() === 'BKG';

const isQuoteForm = (moduleType: string): boolean =>
  moduleType.toUpperCase() === 'QUO';

export interface RatingTypePopulateDeps {
  loginClientBean: LoginClientBeanRaw | null | undefined;
  moduleType: string;
  containerType: string | null | undefined;
  customerType: string | null | undefined;
  isFromCopy?: boolean;
}

export interface RatingTypePopulateActions {
  onRatingTypeChange: (ratingType: string) => void;
  resetRateDetails: (keepOfr?: boolean) => void;
}

export const useRatingTypePopulate = (
  deps: RatingTypePopulateDeps,
  actions: RatingTypePopulateActions,
  featureToggle: ReturnType<typeof useFeatureToggle>
) => {
  const { isVisible } = featureToggle;

  const resolveRatingType = (): string | null => {
    const { loginClientBean, moduleType, containerType, customerType } = deps;

    const isLclShipment = isLCL(containerType);
    const isBkgOrQuo = isBookingForm(moduleType) || isQuoteForm(moduleType);
    if (!isLclShipment || !isBkgOrQuo || customerType == null) return null;

    let ratingType: string | null = null;
    if (isNotifyCustomerType(customerType)) {
      ratingType =
        getOfficeSetting(loginClientBean, NOTIFY_LCL_RATING_TYPE) ??
        getOfficeSetting(loginClientBean, DEFAULT_RATING_TYPE);
    } else {
      ratingType = getOfficeSetting(loginClientBean, DEFAULT_RATING_TYPE);
    }

    if (ratingType == null) return null;
    return applyCtcDisableGuard(ratingType, loginClientBean);
  };

  const ratingTypePopulate = (
    isResetRate: boolean,
    isCustomerEnter: boolean
  ): { pendingRatingType: string | null } => {
    const { loginClientBean, moduleType, containerType, customerType, isFromCopy } = deps;

    const isCopyQuoteToggle = isVisible(CommonToggleKeys.OCEAN_COPY_QUOTE_RATE_DETAILS);
    const resetcall = !(isCopyQuoteToggle && isFromCopy && isQuoteForm(moduleType) && !isResetRate);

    const isLclShipment = isLCL(containerType);

    const isBkgOrQuoForm = isBookingForm(moduleType) || isQuoteForm(moduleType);

    if (customerType != null) {

      if (isBkgOrQuoForm && isLclShipment) {

        let ratingType: string | null = null;

        if (isNotifyCustomerType(customerType)) {
          ratingType =
            getOfficeSetting(loginClientBean, NOTIFY_LCL_RATING_TYPE) ??
            getOfficeSetting(loginClientBean, DEFAULT_RATING_TYPE);
        } else {
          ratingType = getOfficeSetting(loginClientBean, DEFAULT_RATING_TYPE);
        }

        let didReset = false;
        if (resetcall) {
          const showOfrToggle = isVisible(CommonToggleKeys.SHOW_CONFIRM_TO_KEEP_OFR_INC_EXP);
          const shouldReset = !showOfrToggle || !isCustomerEnter;
          if (shouldReset) {
            actions.resetRateDetails();
            didReset = true;
          }
        }

        if (ratingType != null) {
          const effectiveRatingType = applyCtcDisableGuard(ratingType, loginClientBean);
          if (didReset) {
            return { pendingRatingType: effectiveRatingType };
          }
          actions.onRatingTypeChange(effectiveRatingType);
        }

      } else if (isLclShipment && !isResetRate) {
          if(!(moduleType.toUpperCase() === 'PREBKG' )){
        actions.resetRateDetails();
          }

      } else {
        if (isResetRate) {
          actions.resetRateDetails();
        }
      }

    } else {
      const showOfrToggle = isVisible(CommonToggleKeys.SHOW_CONFIRM_TO_KEEP_OFR_INC_EXP);
      const shouldReset = !showOfrToggle || !isCustomerEnter;
      if (shouldReset) {
        actions.resetRateDetails();
      }
    }

    return { pendingRatingType: null };
  };

  return { ratingTypePopulate, resolveRatingType };
};