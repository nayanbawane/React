import {
  CommonToggleKeys,
  LclToggleKeys,
  RoutingFormData,
  useFeatureToggle,
} from 'phoenix-common-react';

const SHIPCO_TMS = 'T';
const EDI_PICKUP_CODE = 'E';
const PICKUP_NOT_NEEDED = 'N';
const DOOR_DELIVERY_CODE = 'D';

export interface PickupChangeHandlersDeps {
  formData: RoutingFormData;
  moduleType: string;
  shipmentType: string;
  isTMSLinked: boolean;
  isFromTermsHandlerRef: { current: boolean };
  featureToggle: ReturnType<typeof useFeatureToggle>;
}

export interface PickupChangeHandlersActions {
  setFormData: (updater: (prev: RoutingFormData) => RoutingFormData) => void;
  setPickUpValue: (value: string) => void;
  setShowPickupStack: (show: boolean) => void;
  setShowDoorDeliverySection: (show: boolean) => void;
  setOpenPickupModal: (open: boolean) => void;
  setCombinedDialogOpen: (open: boolean) => void;
  setShowTruckingDetails: (show: boolean) => void;
  clearPickupDetails: () => void;
  onShowHideStandardDimensions: (show: boolean) => void;
  onMultiCargoTmsDimShowHide: (show: boolean) => void;
  onShowMultStackingType: (show: boolean) => void;
  onModifyUIForQuoteRate: (terms: string) => void;
  onSetMandatoryRoutingStyles: (mandatory: boolean) => void;
  onShowHideFetchRatesButton: (terms: string, isFromPopulate: boolean) => void;
  onCargoMandatoryStyle: (add: boolean, required: boolean) => void;
  onSetPickupTentativeDateFromCreatedOn: () => void;
  onShowUnlockTruckerButton: (show: boolean) => void;
  setFromTermsHandlerFlag: (value: boolean) => void;
}

export const usePickupChangeHandlers = (
  deps: PickupChangeHandlersDeps,
  actions: PickupChangeHandlersActions
) => {
  const {
    formData,
    moduleType,
    shipmentType,
    isTMSLinked,
    isFromTermsHandlerRef,
    featureToggle,
  } = deps;

  const {
    setFormData,
    setPickUpValue,
    setShowPickupStack,
    setShowDoorDeliverySection,
    setOpenPickupModal,
    setCombinedDialogOpen,
    setShowTruckingDetails,
    clearPickupDetails,
    onShowHideStandardDimensions,
    onMultiCargoTmsDimShowHide,
    onShowMultStackingType,
    onModifyUIForQuoteRate,
    onSetMandatoryRoutingStyles,
    onShowHideFetchRatesButton,
    onCargoMandatoryStyle,
    onSetPickupTentativeDateFromCreatedOn,
    onShowUnlockTruckerButton,
    setFromTermsHandlerFlag,
  } = actions;

  const { isVisible } = featureToggle;

  const isTruckingRatesIntegration = isVisible(
    LclToggleKeys.TRUCKING_RATES_INTEGRATION
  );
  const isStandaloneQuoteRate = isVisible(LclToggleKeys.STANDALONE_QUOTE_RATE);
  const isOceanBkgQuoStdDimensions = isVisible(
    CommonToggleKeys.OCEAN_BKG_QUO_STANDARD_DIMENSIONS
  );
  const isShowStackingType = isVisible(
    CommonToggleKeys.SHOW_STACKING_TYPE_FOR_QUOTE_BKG
  );

  const isQuoteModule = moduleType.toUpperCase() === 'QUOTE';
  const isLcl = shipmentType === 'LCL';

  const isOceanBookingTMSToggleOn = (): boolean => {
    if (shipmentType === 'FCL') return false;
    const tmsToggle = isQuoteModule
      ? isVisible(CommonToggleKeys.OCEAN_QUOTE_TMS_ENABLED)
      : isVisible(CommonToggleKeys.OCEAN_BOOKING_TMS_ENABLED);
    return tmsToggle && isTMSLinked;
  };

  const isQuoteDoorDeliveryTms = (deliveryType: string): boolean =>
    isQuoteModule && deliveryType.toUpperCase() === SHIPCO_TMS;

  const getTermsFromPickupDelivery = (
    pickup: string,
    delivery: string
  ): string => {
    const p = pickup.toUpperCase();
    const d = delivery.toUpperCase();
    const pickupIsY = p === 'Y';
    const pickupIsTmsQuote = isQuoteModule && p === SHIPCO_TMS;
    const deliveryIsDoor =
      d === DOOR_DELIVERY_CODE || isQuoteDoorDeliveryTms(delivery);

    if ((pickupIsY || pickupIsTmsQuote) && deliveryIsDoor) return 'DRDR';
    if (deliveryIsDoor) return 'CFDR';
    if (pickupIsY || pickupIsTmsQuote) return 'DRCF';
    return '';
  };

  const conditionToShowDefaultDim = (
    pickup: string,
    delivery: string
  ): boolean => {
    const t = getTermsFromPickupDelivery(pickup, delivery).toUpperCase();
    return t === 'CFDR' || t === 'DRCF' || t === 'DRDR';
  };

  const showHideStandardDimensionsToggle = (
    currentPickup: string,
    currentDelivery: string
  ): void => {
    if (!isOceanBkgQuoStdDimensions) return;
    onShowHideStandardDimensions(
      conditionToShowDefaultDim(currentPickup, currentDelivery)
    );
  };

  const getTermsIfPickupOrDelivery = (newPickup: string): string => {
    if (!isQuoteModule) return '';
    const normalized =
      isVisible(CommonToggleKeys.OCEAN_QUOTE_TMS_ENABLED) &&
      newPickup.toUpperCase() === SHIPCO_TMS
        ? 'Y'
        : newPickup;
    return getTermsFromPickupDelivery(normalized, formData.deliveryType);
  };

  const showHideTMSFieldsForLcl = (pickupType: string): void => {
    const p = pickupType.toUpperCase();
    if (p !== PICKUP_NOT_NEEDED) {
      if (p === 'Y') {
        onMultiCargoTmsDimShowHide(isTruckingRatesIntegration);
        if (isShowStackingType) onShowMultStackingType(true);
      } else if (p === EDI_PICKUP_CODE) {
        onMultiCargoTmsDimShowHide(false);
        if (isShowStackingType) onShowMultStackingType(true);
      } else {
        onMultiCargoTmsDimShowHide(true);
        if (isShowStackingType) onShowMultStackingType(false);
      }
    } else {
      onMultiCargoTmsDimShowHide(false);
      if (isShowStackingType) onShowMultStackingType(true);
    }
  };

  const handlePickupChange = (newPickup: string): void => {
    setPickUpValue(newPickup);
    setFormData((prev) => ({ ...prev, pickupNeeded: newPickup }));

    const currentDelivery = formData.deliveryType;
    const p = newPickup.toUpperCase();

    const termsIfPickupOrDelivery = getTermsIfPickupOrDelivery(newPickup);
    onModifyUIForQuoteRate(termsIfPickupOrDelivery);

    if (isOceanBkgQuoStdDimensions) {
      showHideStandardDimensionsToggle(newPickup, currentDelivery);
    }

    if (isLcl) {
      showHideTMSFieldsForLcl(newPickup);
    }

    const pickupIsActive =
      p === 'Y' || p === SHIPCO_TMS || p === EDI_PICKUP_CODE;

    if (
      p === 'Y' ||
      (!isOceanBookingTMSToggleOn() && p === SHIPCO_TMS) ||
      (!isOceanBookingTMSToggleOn() && p === EDI_PICKUP_CODE)
    ) {
      setShowPickupStack(true);
    } else if (p === PICKUP_NOT_NEEDED) {
      clearPickupDetails();
      setShowPickupStack(false);
      setShowTruckingDetails(false);
      setShowDoorDeliverySection(false);
    } else if (
      (isOceanBookingTMSToggleOn() && p === SHIPCO_TMS) ||
      (isOceanBookingTMSToggleOn() && p === EDI_PICKUP_CODE)
    ) {
      setShowPickupStack(true);
      showHideTMSFieldsForLcl(newPickup);
    }

    if (isTruckingRatesIntegration && isQuoteModule && isLcl) {
      const terms = getTermsFromPickupDelivery(newPickup, currentDelivery);
      if (p !== PICKUP_NOT_NEEDED && (terms === 'CFDR' || terms === 'DRDR')) {
        onSetMandatoryRoutingStyles(true);
      } else {
        onSetMandatoryRoutingStyles(false);
      }
      if (p === 'Y') {
        onShowUnlockTruckerButton(true);
      } else {
        onShowUnlockTruckerButton(false);
      }
    }

    if (pickupIsActive && !isFromTermsHandlerRef.current) {
      const isDeliveryDoor =
        currentDelivery.toUpperCase() === DOOR_DELIVERY_CODE ||
        isQuoteDoorDeliveryTms(currentDelivery);

      if (isTruckingRatesIntegration && isLcl && isDeliveryDoor) {
        setCombinedDialogOpen(true);
        if (isQuoteModule) {
          onSetPickupTentativeDateFromCreatedOn();
        }
      } else {
        setOpenPickupModal(true);
        if (isTruckingRatesIntegration && isLcl && isQuoteModule) {
          onSetPickupTentativeDateFromCreatedOn();
        }
      }
    }

    if (isTruckingRatesIntegration && isLcl) {
      if (isFromTermsHandlerRef.current) {
        setFromTermsHandlerFlag(false);
      }

      const terms = getTermsFromPickupDelivery(newPickup, currentDelivery);
      onShowHideFetchRatesButton(terms, false);
    }

    if (
      isStandaloneQuoteRate &&
      isQuoteModule &&
      termsIfPickupOrDelivery &&
      (termsIfPickupOrDelivery === 'DRCF' || termsIfPickupOrDelivery === 'CFDR')
    ) {
      onCargoMandatoryStyle(false, false);
    }
  };

  return { handlePickupChange };
};
