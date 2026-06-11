import {
  CommonToggleKeys,
  LclToggleKeys,
  RoutingFormData,
  useFeatureToggle,
} from 'phoenix-common-react';

const SHIPCO_TMS = 'T';
const DOOR_DELIVERY_CODE = 'D';
const DOOR_VALUE = 'DOOR';
const DELIVERY_TYPE_UNSELECTED = '-1';

export interface DeliveryTypeChangeHandlersDeps {
  formData: RoutingFormData;
  moduleType: string;
  shipmentType: string;
  isTMSLinked: boolean;
  isFromTermsHandlerRef: { current: boolean };
  featureToggle: ReturnType<typeof useFeatureToggle>;
}

export interface DeliveryTypeChangeHandlersActions {
  setFormData: (updater: (prev: RoutingFormData) => RoutingFormData) => void;
  setShowDoorDeliverySection: (show: boolean) => void;
  setDoorDeliveryDialogOpen: (open: boolean) => void;
  setCombinedDialogOpen: (open: boolean) => void;
  clearDoorDelivery: () => void;
  onShowHideStandardDimensions: (show: boolean) => void;
  onSaveDoorDeliveryToParams: () => void;
  onModifyUIForQuoteRate: (terms: string) => void;
  onShowHideFetchRatesButton: (terms: string, isFromPopulate: boolean) => void;
  onSetPickupTentativeDateFromCreatedOn: () => void;
  onPlaceOfDeliveryLocationSearch: (locationCode: string) => void;
  setFromTermsHandlerFlag: (value: boolean) => void;
}

export const useDeliveryTypeChangeHandlers = (
  deps: DeliveryTypeChangeHandlersDeps,
  actions: DeliveryTypeChangeHandlersActions
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
    setShowDoorDeliverySection,
    setDoorDeliveryDialogOpen,
    setCombinedDialogOpen,
    clearDoorDelivery,
    onShowHideStandardDimensions,
    onSaveDoorDeliveryToParams,
    onModifyUIForQuoteRate,
    onShowHideFetchRatesButton,
    onSetPickupTentativeDateFromCreatedOn,
    onPlaceOfDeliveryLocationSearch,
    setFromTermsHandlerFlag,
  } = actions;

  const { isVisible } = featureToggle;

  const isTruckingRatesIntegration = isVisible(
    LclToggleKeys.TRUCKING_RATES_INTEGRATION
  );
  const isOceanBkgQuoStdDimensions = isVisible(
    CommonToggleKeys.OCEAN_BKG_QUO_STANDARD_DIMENSIONS
  );
  const isRedesignRouting = isVisible(LclToggleKeys.REDESIGN_ROUTING);
  const isTmsPickupQuote = isVisible(LclToggleKeys.TMS_PICKUP);

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

  const removeDataFromPlaceOfDelivery = (): void => {
    setFormData((prev) => ({
      ...prev,
      placeOfDeliveryCode: '',
      placeOfDeliveryName: '',
      placeOfDeliveryRegion: '',
      placeOfDeliveryType: DELIVERY_TYPE_UNSELECTED,
    }));
    if (isRedesignRouting) {
      onPlaceOfDeliveryLocationSearch('');
    }
  };

  const setDoorValueToPlaceOfDelivery = (value: string): void => {
    if (!value || value.toUpperCase() !== DOOR_VALUE) {
      setFormData((prev) => ({
        ...prev,
        placeOfDeliveryCode: '',
        placeOfDeliveryName: '',
        placeOfDeliveryRegion: '',
        placeOfDeliveryType: DELIVERY_TYPE_UNSELECTED,
      }));
      return;
    }

    setFormData((prev) => ({
      ...prev,
      placeOfDeliveryType: DOOR_DELIVERY_CODE,
      placeOfDeliveryName: DOOR_VALUE,
    }));

    if (isRedesignRouting) {
      onPlaceOfDeliveryLocationSearch(DOOR_DELIVERY_CODE);
    }
  };

  const handleDeliveryTypeChange = (inputValue: string): void => {
    const currentPickup = formData.pickupNeeded;

    if (isOceanBkgQuoStdDimensions) {
      showHideStandardDimensionsToggle(currentPickup, inputValue);
    }

    const terms = getTermsFromPickupDelivery(currentPickup, inputValue);

    onSaveDoorDeliveryToParams();

    setDoorValueToPlaceOfDelivery('');

    if (isQuoteModule) {
      const normalizedPickup =
        isVisible(CommonToggleKeys.OCEAN_QUOTE_TMS_ENABLED) &&
        currentPickup.toUpperCase() === SHIPCO_TMS
          ? 'Y'
          : currentPickup;
      onModifyUIForQuoteRate(
        getTermsFromPickupDelivery(normalizedPickup, inputValue)
      );
    }

    const isDeliveryDoor =
      inputValue.trim() !== '' &&
      (inputValue.toUpperCase() === DOOR_DELIVERY_CODE ||
        isQuoteDoorDeliveryTms(inputValue));

    if (isDeliveryDoor) {
      if (terms.toUpperCase() === 'CFDR' || terms.toUpperCase() === 'DRDR') {
        setDoorValueToPlaceOfDelivery(DOOR_VALUE);
      }

      clearDoorDelivery();
      setShowDoorDeliverySection(true);

      if (isTruckingRatesIntegration) {
        if (terms.toUpperCase() === 'DRDR') {
          const isBookingTmsPath =
            !isQuoteModule &&
            currentPickup.toUpperCase() === SHIPCO_TMS &&
            isOceanBookingTMSToggleOn();

          if (isBookingTmsPath) {
            onShowHideFetchRatesButton(terms, false);
          } else {
            onShowHideFetchRatesButton(terms, false);
          }
        } else {
          onShowHideFetchRatesButton(terms, false);
        }
      }

      if (!isFromTermsHandlerRef.current) {
        const pickupIsActive =
          currentPickup.toUpperCase() === 'Y' ||
          currentPickup.toUpperCase() === SHIPCO_TMS ||
          currentPickup.toUpperCase() === 'E';

        if (pickupIsActive) {
          setCombinedDialogOpen(true);
          if (isQuoteModule) {
            onSetPickupTentativeDateFromCreatedOn();
          }
        } else {
          setDoorDeliveryDialogOpen(true);
          if (isQuoteModule) {
            onSetPickupTentativeDateFromCreatedOn();
          }
        }
      }
    } else {
      if (isTruckingRatesIntegration && terms.toUpperCase() !== 'DRDR') {
        onShowHideFetchRatesButton(terms, false);
      }

      removeDataFromPlaceOfDelivery();

      clearDoorDelivery();
      setShowDoorDeliverySection(false);

      setFormData((prev) => ({ ...prev, destinationWarehouse: '' }));
    }

    if (isFromTermsHandlerRef.current) {
      setFromTermsHandlerFlag(false);
    }
  };

  return { handleDeliveryTypeChange };
};
