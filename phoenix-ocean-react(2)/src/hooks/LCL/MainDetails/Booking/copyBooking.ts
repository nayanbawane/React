import { CommonToggleKeys, ToggleKey } from "phoenix-common-react";

interface CopyBookingOptions {
  takenBy?: string | null;
}

const resetRoutingBean = (routingBean: any = {}) => ({
  ...routingBean,
  etdOrigin: null,
  etaDate: null,
  sailDate: null,
  deliveryDate: null,
  deliveryTime: null,
  documentationCutOffTime: null,
  documentCutoffDate: null,
  vessel: null,
  vesselCode: null,
  voyage: null,
  documentDeliveryName: null,
  documentDeliveryAddress1: null,
  documentDeliveryAddress2: null,
  documentDeliveryAddress3: null,
  deConsolidationDate: null,
  etaDestination: null,
  finalCFSDate: null,
  carrierBLCutOffTime: null,
  carrierBLCutoffDate: null,
  aesITNCutOffTime: null,
  aesITNCutoffDate: null,
  autoTitleCutOffTime: null,
  autoTitleCutoffDate: null,
});

const resetMultiCargoBean = (cargoLine: any = {}) => ({
  ...cargoLine,
  uom: null,
  container1: 0,
  container2: 0,
  container3: 0,
  containerSize1: null,
  containerSize2: null,
  containerSize3: null,
  containerType1: null,
  containerType2: null,
  containerType3: null,
  weight: null,
  cube: null,
  actualPieces: null,
  numberOfPieces: null,
  hazardousCode: null,
  dimension: false,
  isDimension: false,
  cargoDimensionBeanList: {
    ...cargoLine.cargoDimensionBeanList,
    kg: null,
    cbm: null,
    lbs: null,
    cbf: null,
    pieces: null,
  },
  bookingMultiCargoHazardousList: [],
  weightLbs: null,
  cubeCbf: null,
});

const resetPickupDetail = (pickupDetail: any = {}) => ({
  ...pickupDetail,
  controlFlag: 'N',
  cargoDimensionBeanList: [],
  pickupHazardousBeanList: [],
  isTruckRateFetched: 'N',
  truckRateId: 0,
  truckRateDetailsFileId: 0,
});

const resetDoorDeliveryDetails = (doorDeliveryDetails: any = {}) => ({
  ...doorDeliveryDetails,
  controlFlag: 'N',
  pickupChargeBeanList: [],
  isTruckRateFetched: 'N',
  truckRateId: 0,
  truckRateDetailsFileId: 0,
});

export const copyBooking = (
  mainBookingQuoteBean: any,
  loginClientBean: any,
  isVisible?: (key: ToggleKey) => boolean,
  options: CopyBookingOptions = {}
) => {
  if (!mainBookingQuoteBean) {
    return null;
  }

  const copiedBooking = JSON.parse(JSON.stringify(mainBookingQuoteBean));
  const bookingQuoteBean = copiedBooking?.bookingQuoteBean ?? {};
  const bookingQuoteRoutingBean = bookingQuoteBean?.bookingQuoteRoutingBean ?? {};
  const bookingQuoteCargoBean = bookingQuoteBean?.bookingQuoteCargoBean ?? {};
  const bookingEquipmentBean = bookingQuoteBean?.bookingEquipmentBean ?? {};
  const resolvedTakenBy =
    options.takenBy ?? bookingQuoteBean?.takenBy ?? null;
  const isOptimizeCopyBookingEnabled = isVisible ? isVisible(CommonToggleKeys.OPTIMIZE_OCEAN_COPY_BOOKING) : false;
  const isBookingRedesignCargoEnable = isVisible ? isVisible(CommonToggleKeys.BOOKING_REDESIGN_CARGO_DETAIL_CHANGE) : false;
  const siChannelOnBooking = isVisible ? isVisible(CommonToggleKeys.OCN_ADD_BOOKING_SI_CHANNEL_ON_BOOKING) : false;
  const isPendingFinalBooking = isVisible ? isVisible(CommonToggleKeys.OCEAN_FREIGHT_EMT_IMT_BOOKING_PENDING_FINAL) : false;

  const isShipCo = loginClientBean?.config_environment_customer === 'SHIPCO';

  copiedBooking.bookingQuoteBean = {
    ...bookingQuoteBean,
    referenceNumber: null,
    controlFlag: 'N',
    status: null,
    pendingFinalBookingStatus: isPendingFinalBooking ? 'N' : bookingQuoteBean?.pendingFinalBookingStatus ?? null,
    pendingFinalQuoteStatus: 'N',
    pendingFinalBooking: false,
    transmittedBookingNumber: null,
    transmissionStatus: null,
    customsTransmissionStatus: null,
    trkTransmissionStatus: null,
    isShipmentOrderTransmit: false,
    isTransmitted: false,
    isCancelSOTransmitted: false,
    transmitToLocation1: null,
    transmitToLocationName: null,
    tmsShipmentId: null,
    truckerProNumber: '',
    bookQuoteDate: null,
    updatedOn: null,
    updatedBy: null,
    takenBy: resolvedTakenBy,
    amendmentCode: null,
    shipmentStatusUpdateBean: {},
    bookingQuoteRoutingBean: resetRoutingBean(bookingQuoteRoutingBean),
    bookingEquipmentBean: {
      ...bookingEquipmentBean,
      latestReturnDate: null,
      latestReturnFromTime: null,
      latestReturnToTime: null,
    },
    siChannel: siChannelOnBooking ? null : bookingQuoteBean?.siChannel ?? null,
    terms: null,
    termName: null,
    pickupNeeded: null,
    receivedVia: null,
  };

  if (isBookingRedesignCargoEnable) {
    copiedBooking.bookingQuoteBean.bookingQuoteMultiCargoBeanList = (
      bookingQuoteBean?.bookingQuoteMultiCargoBeanList ?? []
    ).map((cargoLine: any) => resetMultiCargoBean(cargoLine));
    copiedBooking.bookingQuoteBean.bookingQuoteCargoBean = {
      ...bookingQuoteCargoBean,
      genAesFilingBean: {},
    };
  } else {
    copiedBooking.bookingQuoteBean.bookingQuoteCargoBean = {
      ...bookingQuoteCargoBean,
      uom: null,
      container1: 0,
      container2: 0,
      container3: 0,
      containerSize1: null,
      containerSize2: null,
      containerSize3: null,
      containerType1: null,
      containerType2: null,
      containerType3: null,
      weight: 0,
      cube: 0,
      actualPieces: 0,
      genAesFilingBean: {},
      hazardousCode: isOptimizeCopyBookingEnabled ? null : bookingQuoteCargoBean?.hazardousCode ?? null,
      stackable: bookingQuoteCargoBean?.stackable ?? null,
      bookingMultiCargoBeanList: [],
      numberOfPieces: isOptimizeCopyBookingEnabled ? 0 : bookingQuoteCargoBean?.numberOfPieces ?? 0,
      dimension: false,
    }
  }


  copiedBooking.bookingQuoteChargeBeanList = [];
  copiedBooking.pickupConvertedChargeBeanList = [];
  copiedBooking.doorDeliveryConvertedChargeBeanList = [];
  copiedBooking.pickupDetailBean = resetPickupDetail(copiedBooking.pickupDetailBean);
  if(isShipCo){
    copiedBooking.pickupDetailBean = {
      ...copiedBooking.pickupDetailBean,
      pickupDate: '',
      pickupTime: '',
      pickupTimeTo: '',
      deliveryDate: '',
      deliveryTime: '',
    }
  }

  copiedBooking.multiplePickupDetailBeanList = (
    copiedBooking.multiplePickupDetailBeanList ?? []
  ).map((pickupDetail: any) => resetPickupDetail(pickupDetail));
  copiedBooking.doorDeliveryDetailsBean = resetDoorDeliveryDetails(
    copiedBooking.doorDeliveryDetailsBean
  );
  copiedBooking.amendmentCodeBean = undefined;
  copiedBooking.uploadDocumentsBeanList = [];
  copiedBooking.uploadDocumentsOldBeanList = [];
  copiedBooking.uploadDocumentsNewBeanList = [];
  copiedBooking.addAutoUploadDocumentsBeanList = [];
  copiedBooking.RemoveAutoUploadDocumentsBeanList = [];
  copiedBooking.RemoveUploadDocumentsBeanList = [];
  copiedBooking.AddUploadDocumentsBeanList = [];
  copiedBooking.encryptedPreviewURL = '';
  copiedBooking.versionCount = 0;
  copiedBooking.isFromCopyBooking = true;
  copiedBooking.doorDeliveryDetailsBean = {}

  if (isVisible(CommonToggleKeys.SHP_SHIPMENT_UNIQUE_REFERENCE)) {
    copiedBooking.bookingQuoteBean.bookingQuoteCustomerBean.wwaReference = '';
  }

  if (isVisible(CommonToggleKeys.OPTIMIZE_OCEAN_COPY_BOOKING)) {
    copiedBooking.bookingQuoteChargeBeanList = copiedBooking.bookingQuoteChargeBeanList.filter(
      (chargeBean: any) => {
        const isMatchingPickupCharge = copiedBooking.pickupDetailBean?.pickupChargeBeanList?.some(
          (pickupCharge: any) =>
            pickupCharge.charge === chargeBean.chargeCode &&
            pickupCharge.income === chargeBean.sellAmount &&
            pickupCharge.expense === chargeBean.buyAmount
        );
        const isMatchingDoorDeliveryCharge = copiedBooking.doorDeliveryDetailsBean?.pickupChargeBeanList?.some(
          (doorCharge: any) =>
            doorCharge.charge === chargeBean.chargeCode &&
            doorCharge.income === chargeBean.sellAmount &&
            doorCharge.expense === chargeBean.buyAmount
        );
        return !isMatchingPickupCharge && !isMatchingDoorDeliveryCharge;
      }
    );
  }

  // understand the condition from prashant
  if(isVisible && 
    (!isVisible(CommonToggleKeys.MODIFY_TRUCKING_RATES_AFTER_COPY_BOOKING_FOR_FCL)
        || isVisible(CommonToggleKeys.MODIFY_TRUCKING_RATES_AFTER_COPY_BOOKING_FOR_FCL))
    && isOptimizeCopyBookingEnabled
  ) {
    copiedBooking.pickupDetailBean.pickupChargeBeanList = [];
  }

  if(isVisible && isVisible(CommonToggleKeys.OFR_BKG_ADD_MULTIPLE_PICKUP_INSTRUCTION)) {
    copiedBooking.multiplePickupDetailBeanList = [];
  }

  if(isVisible && isVisible(CommonToggleKeys.BOOKING_TRANSSHIPMENT_PORT)) {
    copiedBooking.bookingQuoteBean.bookingQuoteRoutingBean.warehouseDeliveryRef = null;
    copiedBooking.bookingQuoteBean.bookingQuoteRoutingBean.documentDeliveryCode = null;
    copiedBooking.bookingQuoteBean.bookingQuoteRoutingBean.documentDeliveryContact = null;
    copiedBooking.bookingQuoteBean.bookingQuoteRoutingBean.customsDeclaration = null;
    copiedBooking.bookingQuoteBean.bookingQuoteRoutingBean.customsContact = null;
    copiedBooking.bookingQuoteBean.bookingQuoteRoutingBean.customsCutoffDate = null;
    copiedBooking.bookingQuoteBean.bookingQuoteRoutingBean.customsCutoffTime = null;
    copiedBooking.bookingQuoteBean.bookingQuoteRoutingBean.manufacturerDetailBeans = [];
  }else{
    copiedBooking.bookingQuoteBean.bookingQuoteRoutingBean.warehouseDeliveryRef = null;
    copiedBooking.bookingQuoteBean.bookingQuoteRoutingBean.documentDeliveryCode = null;
    copiedBooking.bookingQuoteBean.bookingQuoteRoutingBean.documentDeliveryContact = null;
  }

  if(isVisible && isVisible(CommonToggleKeys.OCEAN_BOOKING_TMS_ENABLED)) {
    copiedBooking.multiplePickupDetailBeanList.map((pickupDetail: any) => ({
      ...pickupDetail,
      tmsPickupId: null,
      truckerProNumber: null,
    }));
    copiedBooking.bookingQuoteBean.tmsShipmentId = null;
    copiedBooking.pickupDetailBean = {};
  }

  if(isVisible && isVisible(CommonToggleKeys.OCEAN_BOOKING_SHOW_CFS_INTEGRATION_DETAILS)) {
    // update yiyun cfs integration details no data in populate booking
  }

  return copiedBooking;
};
