import {
  CommonToggleKeys,
  LclToggleKeys,
  RoutingFormData,
  useFeatureToggle,
} from 'phoenix-common-react';

const SHIPCO_TMS = 'T';
const DOOR_DELIVERY_CODE = 'D';
const PICKUP_NOT_NEEDED = 'N';
const DELIVERY_TYPE_UNSELECTED = '-1';

export interface TermsDeliveryHandlersDeps {
  formData: RoutingFormData;
  showDeliveryType: boolean;
  moduleType: string;
  shipmentType: string;
  isTMSLinked: boolean;
  featureToggle: ReturnType<typeof useFeatureToggle>;
}

export interface TermsDeliveryHandlersActions {
  setFormData: (updater: (prev: RoutingFormData) => RoutingFormData) => void;
  setShowDeliveryType: (visible: boolean) => void;
  setShowPickupStack: (show: boolean) => void;
  setShowDoorDeliverySection: (show: boolean) => void;
  setOpenPickupModal: (open: boolean) => void;
  setDoorDeliveryDialogOpen: (open: boolean) => void;
  setCombinedDialogOpen: (open: boolean) => void;
  clearDoorDelivery: () => void;
  onSaveDoorDeliveryToParams: () => void;
  onShowHideFetchRatesButton: (terms: string, show: boolean) => void;
  onSetMandatoryRoutingStyles: (mandatory: boolean) => void;
  onShowHideStandardDimensions: (show: boolean) => void;
  onMultiCargoTmsDimShowHide: (show: boolean) => void;
  onShowMultStackingType: (show: boolean) => void;
  onModifyUIForQuoteRate: (terms: string) => void;
  onCargoMandatoryStyle: (add: boolean, required: boolean) => void;
  onSetPickupTentativeDateFromCreatedOn: () => void;
  setFromTermsHandlerFlag: (value: boolean) => void;
  onDeliveryTypeTriggered: (deliveryType: string) => void;
  onPickupValueTriggered: (pickupValue: string) => void;
}

export const useTermsDeliveryHandlers = (
  deps: TermsDeliveryHandlersDeps,
  actions: TermsDeliveryHandlersActions
) => {
  const { formData, moduleType, shipmentType, isTMSLinked, featureToggle } =
    deps;

  const {
    setFormData,
    setShowDeliveryType,
    setShowPickupStack,
    setShowDoorDeliverySection,
    setOpenPickupModal,
    setDoorDeliveryDialogOpen,
    setCombinedDialogOpen,
    clearDoorDelivery,
    onSaveDoorDeliveryToParams,
    onShowHideFetchRatesButton,
    onSetMandatoryRoutingStyles,
    onShowHideStandardDimensions,
    onMultiCargoTmsDimShowHide,
    onShowMultStackingType,
    onModifyUIForQuoteRate,
    onCargoMandatoryStyle,
    onSetPickupTentativeDateFromCreatedOn,
    setFromTermsHandlerFlag,
    onDeliveryTypeTriggered,
    onPickupValueTriggered,
  } = actions;

  const { isVisible } = featureToggle;

  const isTruckingRatesIntegration = isVisible(
    LclToggleKeys.TRUCKING_RATES_INTEGRATION
  );
  const isStandaloneQuoteRate = isVisible(LclToggleKeys.STANDALONE_QUOTE_RATE);
  const isOceanBkgQuoStdDimensions = isVisible(
    CommonToggleKeys.OCEAN_BKG_QUO_STANDARD_DIMENSIONS
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

  const getTermsToShowDefaultDim = (
    pickup: string,
    delivery: string
  ): string => {
    const p = pickup.toUpperCase();
    const d = delivery.toUpperCase();
    if (
      p === 'Y' &&
      (d === DOOR_DELIVERY_CODE || isQuoteDoorDeliveryTms(delivery))
    )
      return 'DRDR';
    if (d === DOOR_DELIVERY_CODE || isQuoteDoorDeliveryTms(delivery))
      return 'CFDR';
    if (p === 'Y') return 'DRCF';
    return '';
  };

  const conditionToShowDefaultDim = (
    pickup: string,
    delivery: string
  ): boolean => {
    const effectiveTerms = getTermsToShowDefaultDim(
      pickup,
      delivery
    ).toUpperCase();
    return (
      effectiveTerms === 'CFDR' ||
      effectiveTerms === 'DRCF' ||
      effectiveTerms === 'DRDR'
    );
  };

  const showHideStandardDimensionsToggle = (
    currentPickup: string,
    currentDelivery: string
  ): void => {
    if (!isOceanBkgQuoStdDimensions) return;
    const showDefaultDimFlag = conditionToShowDefaultDim(
      currentPickup,
      currentDelivery
    );
    onShowHideStandardDimensions(showDefaultDimFlag);
  };

  const removeDataFromPlaceOfDelivery = (): void => {
    setFormData((prev) => ({
      ...prev,
      placeOfDeliveryCode: '',
      placeOfDeliveryName: '',
      placeOfDeliveryRegion: '',
      placeOfDeliveryType: DELIVERY_TYPE_UNSELECTED,
    }));
  };

  const handleTermsSelect = (selectedCode: string): void => {
    if (!selectedCode?.trim()) return;

    const upperCode = selectedCode.toUpperCase();

    onSaveDoorDeliveryToParams();

    setShowDeliveryType(false);
    setFormData((prev) => ({
      ...prev,
      terms: selectedCode,
      deliveryType: DELIVERY_TYPE_UNSELECTED,
      placeOfDeliveryType: DELIVERY_TYPE_UNSELECTED,
    }));

    const currentPickup = formData.pickupNeeded;
    const currentDelivery = formData.deliveryType;

    const isPickupSelected =
      currentPickup.toUpperCase() === 'Y' ||
      currentPickup.toUpperCase() === SHIPCO_TMS ||
      currentPickup.toUpperCase() === 'E';

    const termsIfPickupOrDelivery = formData.terms;

    switch (upperCode) {
      case 'CFDR': {
        setFromTermsHandlerFlag(true);

        if (isPickupSelected) {
          setShowPickupStack(false);
          onPickupValueTriggered(PICKUP_NOT_NEEDED);
        } else {
          if (isTruckingRatesIntegration) {
            onShowHideFetchRatesButton(upperCode, false);
          }
        }

        onMultiCargoTmsDimShowHide(true);
        onShowMultStackingType(true);

        setShowDeliveryType(true);
        setFormData((prev) => ({ ...prev, deliveryType: DOOR_DELIVERY_CODE }));
        onDeliveryTypeTriggered(DOOR_DELIVERY_CODE);

        setDoorDeliveryDialogOpen(true);

        if (isTruckingRatesIntegration && isLcl) {
          onSetMandatoryRoutingStyles(true);
        } else {
          onSetMandatoryRoutingStyles(false);
        }

        if (
          isStandaloneQuoteRate &&
          isQuoteModule &&
          termsIfPickupOrDelivery &&
          (termsIfPickupOrDelivery.toUpperCase() === 'DRCF' ||
            termsIfPickupOrDelivery.toUpperCase() === 'CFDR')
        ) {
          onCargoMandatoryStyle(false, false);
        }
        break;
      }

      case 'DRCF': {
        setFromTermsHandlerFlag(true);

        if (!isPickupSelected) {
          setShowPickupStack(false);
          const newPickupValue = isOceanBookingTMSToggleOn() ? SHIPCO_TMS : 'Y';
          onPickupValueTriggered(newPickupValue);
        } else {
          if (isTruckingRatesIntegration) {
            onShowHideFetchRatesButton(upperCode, false);
          }
          showHideStandardDimensionsToggle(
            currentPickup,
            DELIVERY_TYPE_UNSELECTED
          );
          onModifyUIForQuoteRate(upperCode);
        }

        setShowDoorDeliverySection(false);

        setOpenPickupModal(true);

        if (isQuoteModule) {
          onSetPickupTentativeDateFromCreatedOn();
        }

        removeDataFromPlaceOfDelivery();

        if (isTruckingRatesIntegration && isLcl) {
          onSetMandatoryRoutingStyles(false);
        }

        clearDoorDelivery();

        if (
          isStandaloneQuoteRate &&
          isQuoteModule &&
          termsIfPickupOrDelivery &&
          (termsIfPickupOrDelivery.toUpperCase() === 'DRCF' ||
            termsIfPickupOrDelivery.toUpperCase() === 'CFDR')
        ) {
          onCargoMandatoryStyle(false, false);
        }
        break;
      }

      case 'DRDR': {
        setFromTermsHandlerFlag(true);

        let eventFired = false;

        if (!isPickupSelected) {
          const newPickupValue = isOceanBookingTMSToggleOn() ? SHIPCO_TMS : 'Y';
          setShowPickupStack(false);
          onPickupValueTriggered(newPickupValue);
          eventFired = true;
        } else {
          if (isTruckingRatesIntegration) {
            onShowHideFetchRatesButton(upperCode, false);
          }
          onModifyUIForQuoteRate(upperCode);
        }

        setShowDeliveryType(true);

        const isAlreadyDoorDelivery =
          currentDelivery.toUpperCase() === DOOR_DELIVERY_CODE ||
          isQuoteDoorDeliveryTms(currentDelivery);

        if (!isAlreadyDoorDelivery) {
          const newDelivery = isQuoteDoorDeliveryTms(currentDelivery)
            ? SHIPCO_TMS
            : DOOR_DELIVERY_CODE;
          setFormData((prev) => ({ ...prev, deliveryType: newDelivery }));
          setShowDoorDeliverySection(false);
          onDeliveryTypeTriggered(newDelivery);
          eventFired = true;
        }

        setCombinedDialogOpen(true);

        if (isQuoteModule) {
          onSetPickupTentativeDateFromCreatedOn();
        }

        const effectivePickup = !isPickupSelected
          ? isOceanBookingTMSToggleOn()
            ? SHIPCO_TMS
            : 'Y'
          : currentPickup;

        if (
          isTruckingRatesIntegration &&
          isLcl &&
          effectivePickup.toUpperCase() !== PICKUP_NOT_NEEDED
        ) {
          onSetMandatoryRoutingStyles(true);
        } else {
          onSetMandatoryRoutingStyles(false);
        }

        if (!eventFired) {
          const effectiveDelivery = isAlreadyDoorDelivery
            ? currentDelivery
            : DOOR_DELIVERY_CODE;
          showHideStandardDimensionsToggle(effectivePickup, effectiveDelivery);
        }
        break;
      }

      default: {
        let evntFired = false;

        if (isPickupSelected) {
          setFromTermsHandlerFlag(true);
          onPickupValueTriggered(PICKUP_NOT_NEEDED);
          evntFired = true;
        } else {
          onModifyUIForQuoteRate(upperCode);
        }

        setShowDoorDeliverySection(false);

        clearDoorDelivery();

        removeDataFromPlaceOfDelivery();

        if (isTruckingRatesIntegration && isLcl) {
          onSetMandatoryRoutingStyles(false);
        }

        if (!evntFired) {
          showHideStandardDimensionsToggle(currentPickup, currentDelivery);
        }
        break;
      }
    }
  };

  return { handleTermsSelect };
};
