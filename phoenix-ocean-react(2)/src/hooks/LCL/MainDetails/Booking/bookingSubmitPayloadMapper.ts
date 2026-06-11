import { buildBookingQuoteCargoBean, buildBookingQuoteChargeBeanList, buildBookingQuoteCustomerBean, buildBookingQuoteMultiCargoBeanList, buildBookingQuoteRoutingBean, buildDoorDeliveryDetailsBean, buildMultiCargoBookingQuoteNoteBeans, buildPickupDetailBean, buildMultiplePickupDetailBeanList, buildTransshipmentRoutingBeanList, str, strOrNull, CommonToggleKeys, useFeatureToggle, num, getLongDateTimeFormat, formatDate, ToggleKey, buildImportBookingQuoteCustomerBean } from "phoenix-common-react";

export function buildMainBookingQuoteBean(
main: any, documentDetails: any, customer: any, routing: any, cargo: any, _rate: any, customDetails: any, loginClientBean: any,importBookingNumber?:any,  isVisible?: (key: ToggleKey) => boolean) {

  const isNewEntry = !main?.referenceNumber || num(main?.referenceNumber) === 0;
  const pickupDetailBean = buildPickupDetailBean(
    routing,
    undefined,
      Object.keys(routing?.pickupForms)?.length - 1,
      isNewEntry,
    main?.referenceNumber,
    loginClientBean
  );
  const multiplePickupDetailBeanList = buildMultiplePickupDetailBeanList(
    routing,
    cargo,
    isNewEntry,
    main?.referenceNumber,
    loginClientBean
  );
  return {
    bookingQuoteBean: buildBookingQuoteBean(main, customer, routing, cargo, isNewEntry, customDetails, loginClientBean,importBookingNumber,isVisible),
    bookingQuoteChargeBeanList: buildBookingQuoteChargeBeanList(_rate, isNewEntry, main),
    multiCargoBookingQuoteNoteBeans: buildMultiCargoBookingQuoteNoteBeans(cargo),
    // bookingHazardousBeanList: buildBookingHazardousBeanList(cargo), // PHX-131742: FCL Booking: cargo details section changes - Commented by dhapatel
    
    // PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel
    bookingHazardousBeanList: main?.bookingQuoteType === 'F' ? buildBookingHazardousBeanListFCL(cargo, loginClientBean) : buildBookingHazardousBeanList(cargo),
    // PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel
    pickupDetailBean: pickupDetailBean,
    doorDeliveryDetailsBean: buildDoorDeliveryDetailsBean(
      routing,
      isNewEntry,
      main?.referenceNumber,
      loginClientBean
    ),
    uploadDocumentsBeanList: documentDetails,
    uploadDocumentsOldBeanList: [],
    uploadDocumentsNewBeanList: [],
    transshipmentRoutingBeanList: buildTransshipmentRoutingBeanList(
      routing,
      'BKG'
    ),
    manufacturerDetailBeans: (
      routing?.routingFormData?.manufacturerNames || []
    ).map((m: any) => ({
      manufacturerName: str(m.name),
    })),
    addAutoUploadDocumentsBeanList: [],
    errorFlag: false,
    invoiceBLLists: [],
    invoiceBLListForCustomercode: [],
    setUpdateBlAssociatedBookingsForCustomerCode: false,
    lotNumberMap: null,
    bookingAssociateBlNumbers: [],
    associatedBLNos: [],
    syncedBls: [],
    skipBlRateUpdate: false,
    updateBlAssociatedBookings: false,
    blAssociatedBookingMap: {},
    fmcTypeChargeCodes: [],
    pickupConvertedChargeBeanList: [],
    messageMap: {},
    gateWayResult: null,
    segmentType: null,
    encryptedPreviewURL: null,
    blAssociateBookingNumbers: null,
    isUpdateControllingEntity: false,
    billNumber: null,
    eServiceChangedMainBean: null,
    callEserviceSave: false,
    lostChildQuoteBean: null,
    multiplePickupDetailBeanList: multiplePickupDetailBeanList,
    versionCount: 0,
    amendmentCodeBean: {
      amendmentCode: main?.amendmentCode ?? null,
      bookingNumber: null,
      handlingOffice: null,
      inputUser: null,
      inputDate: null,
      oldAmendmentCode: null,
      reference: null,
      officeId: null,
      module: null,
      siteId: null,
    },
    bookingQuoteCustomerBean: null,
    bookingUploadDocumentsBeanList: null,
    bookingCustomDocumentsBeanList: null,
    genValuedMap: null,
    quoteExpirationDate: null,
    lotExist: null,
    cancelRequestResultList: null,
    cancelPickupList: [],
    emailDocumentBeans: null,
    // PHX-131742: FCL Booking: cargo details section changes - Commented by dhapatel
    // hazardousRuleMap: buildHazardousRuleMap(cargo),
    
    
    // PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel
    hazardousRuleMap: main?.bookingQuoteType === 'F' ? buildHazardousRuleMapFCL(cargo) : buildHazardousRuleMap(cargo),
    // PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel
    doorDeliveryConvertedChargeBeanList: [],
    fileStopOff: null,
    lotReceived: false,
    updateBlAssociatedBookingsForCustomFilingStack: false,
    updateScacCode: false,
    blRelease: false,
    leadBooking: false,
    fromToUS: false,
    removeAutoUploadDocumentsBeanList: [],
    freighReceived: false,
    lotCommentsExternalFromQuote: false,
    convtQuotToBkgButtonClick: false,
    bookingVesselChange: false,
    ratedDocumentSent: false,
    equipmentsDeatilsUpdated: false,
    loadplanPendingFinalized: false,
    fromCopyBooking: false,
    updateControllingEntity: main?.isControllingEntityUpdate ?? false,
    truckingDetailsUpdated: false,
    blreferenceExist: true,
    calledFromSaveButton: false,
    nraAcceptanceEmailSent: false,
    updateAmsBlNumberAndScacCode: false,
    updateRateControllingEntity: main?.isRateControllingEntityUpdate ?? false,
    copyRateFromQuote: false,
    updateAmsBlNumber: false,
    fileSailConfirm: false,
    loadplanFinalized: false,
    lotCommentsInternalFromQuote: false,
    bookingCounterOn: true,
    pendingFinalManuallySetNo: false,
    taskReviewOrApprove: false,
    removeUploadDocumentsBeanList: [],
    addUploadDocumentsBeanList: [],
  };
}

function buildBookingQuoteBean(mainDetails: any, customer: any, routing: any, cargo: any, isNew = true, customDetails: any, loginClientBean: any,  importBookingNumber: any, isVisible: (key: ToggleKey) => boolean) {

  return {
    ...mainDetails,
    transmitToLocation1: mainDetails?.transmitToLocation1 ?? null,
    transmitToLocationName: mainDetails?.transmitToLocationName ?? null,
    terms:
      str(
        routing?.termsCode ||
          routing?.routingFormData?.termsCode ||
          mainDetails?.termsCode ||
          routing?.terms ||
          routing?.routingFormData?.terms ||
          mainDetails?.terms
      ) || '',
    termName: str(
      routing?.termsLabel ||
        routing?.routingFormData?.termsLabel ||
        mainDetails?.termName ||
        ''
    ),
    pickupNeeded: str(routing?.routingFormData?.pickupNeeded) || 'N',
    trackingCustomer1: '',
    trackingCustomer2: '',
    bookingPrefix: null,
    lineBooking: '',
    lineCode:
      routing?.routingFormData?.carrierCode?.split('-')[0].trim() || null,
    faxYn: null,
    purchaseDate: null,
    supplierCode: null,
    supplierAddress1: null,
    supplierAddress2: null,
    supplierAddress3: null,
    supplierContact: null,
    supplierPhone: null,
    forwarderYn: null,
    numberOfPieces: 0,
    ratingType: 'M',
    uom: null,
    remarks1: null,
    remarks2: null,
    transmit: mainDetails?.transmit,
    forwarderFax: null,
    service: null,
    portInformation: null,
    lotNumber: null,
    blNumber: null,
    proNumber: null,
    customRegistrationNumber: null,
    consumerYn: null,
    warehouseZip: null,
    pickAtZip: null,
    nmfc: null,
    discount: 0,
    inputDate: null,
    payorCode: str(mainDetails?.billingCompany),
    prepaidCredit: importBookingNumber
      ? customer?.prepaidCollect || mainDetails?.prepaidCredit || ''
      : customer?.lclForm?.prepaidCollect || mainDetails?.prepaidCredit || '',
    aesAmsFlag: mainDetails?.aesAmsFlag,
    serviceContract: null,
    shipperEmail: mainDetails?.shipperEmail,
    pfm: null,
    intertrackFlag: mainDetails?.intertrackFlag,
    amsScacCode: null,
    amsReference: null,
    amsReferenceQualifire: null,
    communicationReference: null,
    customerEmail2: null,
    transmissionType: null,
    documentCutoffTime: mainDetails?.documentCutoffTime,
    vesselVoyageID: 0,
    wwaReference:  mainDetails?.wwaReference,
    shipmendID: 0,
    truckerAddress: null,
    truckerCity: null,
    truckerZipCode: null,
    carrierCode: null,
    carrierName: null,
    frequency: '',
    transitTime: '17',
    receivedFromCode: null,
    tranShipmentFlag: 'N',
    quoteCustomerFax: null,
    routing: null,
    typeOfUnits: null,
    hazardousClass: null,
    hazardousName: null,
    hazardousName1: null,
    unNumber: null,
    unPageNo: null,
    flashPoint: 0,
    temperatureUnit: null,
    notes: null,
    notes2: null,
    notes3: null,
    notes4: null,
    notes5: null,
    costing1: null,
    costing2: null,
    costing3: null,
    costing4: null,
    costing5: null,
    costing6: null,
    costing7: null,
    costing8: null,
    costing9: null,
    costing10: null,
    costing11: null,
    costing12: null,
    costing13: null,
    costing14: null,
    costing15: null,
    costing16: null,
    costing17: null,
    quoteCustomerEmail: null,
    containerSize: null,
    container1: 0,
    containerSize1: null,
    containerType1: null,
    customerReference: null,
    // quoteType: str(main?.quoteType) || null,
    quoteType: null,
    hazardousAction: mainDetails?.hazardousAction,

    // ── nested sub‑beans ──
    bookingQuoteCustomerBean: importBookingNumber
      ? buildImportBookingQuoteCustomerBean(customer)
      : buildBookingQuoteCustomerBean(customer),
    actualBuyerSellerBean: buildActualBuyerSellerBean(),
    bookingQuoteRoutingBean: buildBookingQuoteRoutingBean(
      routing,
      loginClientBean
    ),
    // PHX-131742: FCL Booking: cargo details section changes - Commented by dhapatel
    // bookingQuoteCargoBean: buildBookingQuoteCargoBean(
    //   cargo,
    //   'BKG',
    //   isNew,
    //   routing,
    //   customDetails,
    //   loginClientBean
    // ),
    // PHX-131742: FCL Booking: cargo details section changes - Commented by dhapatel

    // PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel
    bookingQuoteCargoBean: mainDetails?.bookingQuoteType === 'F'
      ? buildBookingQuoteCargoBeanFCL(
          cargo,
          'BKG',
          isNew,
          routing,
          customDetails,
          loginClientBean
        )
      : buildBookingQuoteCargoBean(
          cargo,
          'BKG',
          isNew,
          routing,
          customDetails,
          loginClientBean
        ),
    // PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel
    bookingEquipmentBean: buildBookingEquipmentBean(),
    shipmentStatusUpdateBean: buildShipmentStatusUpdateBean(customer),
    lstCustomsDetailsBean: null,
    bookingQuoteCustomFilingBean: {
      filingType: '',
      filingBy: '',
      scacCode: '',
      amsNumber: '',
      oldScacCode: null,
      oldAmsNumber: null,
    },

    rowId: null,
    type: 'BKG',
    holdStatus: mainDetails?.status || null,
    posTimeFormat: 0,
    preliminaryBooking: false,
    preliminaryBookingStatus: mainDetails?.preliminaryBookingStatus,
    nomination: importBookingNumber
      ? customer?.controllingEntity || mainDetails?.nomination || ''
      : customer?.lclForm?.controllingEntity || mainDetails?.nomination || '',

    rateControllingEntity:importBookingNumber ?  str(customer?.rateControllingEntity) || ''  :str(customer?.lclForm?.rateControllingEntity) || '',
    aesItnHoldStatusId: 0,
    aesItnHoldStatus: null,
    ucrHoldStatusId: 0,
    ucrHoldStatus: null,
    effectiveDate: '',
    expirationDate: '',
    commission: '',
    carriers: [],
    clauses: (mainDetails?.clauses || []).map((c: any, idx: number) => ({
      clauseCode: str(c.clauseCode),
      clauseName: strOrNull(c.clauseName),
      clauseNameLocale: null,
      clause: strOrNull(c.clause),
      clauseLocale: null,
      clauseDesc: strOrNull(c.clauseDesc),
      clauseDescLocale: null,
      sequence: idx + 1,
    })),
    bookingCustomerDeclaredCargoBeanList: null,
    bookingCargoAdditionalDetailsList: null,
    roeType: 'L',
    includePlcOnDocument: false,
    transmissionService: '',
    purchaseOrderReferenceNumber: '',
    invoiceCurrency: '',
    invoiceExchangeRate: null,
    invoiceToLocalExchangeRate: 1,
    oldReferenceNumber: 0,
    oldStatus: '',
    modifyPLC: false,
    customerChange: false,
    isUpdated: false,
    oldEffectiveDate: null,
    oldCustomerCode:
      customer?.lclForm?.customerCode || mainDetails?.oldCustomerCode || null,
    takenBy: mainDetails?.takenBy ,
    handlingOffice: mainDetails?.handlingOffice || loginClientBean?.officeCode || null,
    updatedBy: loginClientBean?.ldapUser ||loginClientBean?.username,
    ldapUser: null,
    emailAddressFrom: null,
    userPhone: null,
    shipmentType: null,
    gatewayOriginOffice: null,
    tmsShipmentId: null,
    truckerProNumber: '',
    estimatedDeliveryDate: '',
    tmsStatus: '',
    isVip: false,
    shipmentValidityDate: null,
    isVIP: null,
    autoGeneratedDeliveryReference: null,
    linkedBookingNumberWithDeliveryReference: null,
    thirdPartySystem: 'TMS',
    isManualRemoveCustomsHold: false,
    lotList: null,
    tInputDate: formatDate(new Date()),
    errorMessage: '',
    oldCustomsHoldStatus: null,
    quoteFeedbackStatus: null,
    quoteFeedbackCategoryType: null,
    quoteFeedbackNotes: null,
    tbookingNumber: null,
    oldNomination: null,
    transmissionStatus: null,
    direction: 'EO',
    autoSuggestClauseBean: null,
    carrierTerms: null,
    carrierPrepaidCollect: null,
    carrierStatus: null,
    transmittedBookingNumber: null,
    inputUserOffice: null,
    responsiblePersonCode: null,
    responsiblePersonName: null,
    importBookingNumber: importBookingNumber || 0,
    importBookingOffice: null,
    oldIncoTerms: null,
    incoTerms: null,
    bookingCarrierBean: {
      carrierTerms: null,
      carrierInstruction: null,
      carrierContractNumber: null,
      amsFiller: null,
      carrierStatus: null,
      frieghtPayerParty: null,
      containerPrepaidCollcet: null,
      perContainerToggle: null,
      transcationFlag: null,
      carrierBookingOffice: null,
    },
    bookingEdiBeans: [],
    attachedDocument: null,
    emtBolSentHandlingOfficeToggle: null,
    opterShipmentId: null,
    paymentMethodCode: null,
    paymentInstruction: null,
    fillingType: null,
    fillingBy: null,
    fillingByMrn: null,
    specialHandlingCode: null,
    customManifestFeeCollectBy: null,
    cfsLoadPort: null,
    bookingQuoteRoutingBeanlist: [],
    masterQuoteNumber: 0,
    transitDays: null,
    validUntil: null,
    cargoValue: null,
    temperature: null,
    deliveryAppointmentStatus: null,
    onDock: null,
    nraAcceptancePending: null,
    customsTransmissionStatus: null,
    pickupCountry: null,
    customsNumberToggle: null,
    siChannel: null,
    // PHX-131742: FCL Booking: cargo details section changes - Commented by dhapatel
    // bookingQuoteMultiCargoBeanList: buildBookingQuoteMultiCargoBeanList(
    //   cargo,
    //   'BKG',
    //   isNew,
    //   loginClientBean
    // ),
    // PHX-131742: FCL Booking: cargo details section changes - Commented by dhapatel

    // PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel
    bookingQuoteMultiCargoBeanList: mainDetails?.bookingQuoteType === 'F'
      ? []
      : buildBookingQuoteMultiCargoBeanList(
          cargo,
          'BKG',
          isNew,
          loginClientBean
        ),
    // PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel
    multiCargoBookingQuoteNoteBeans:
      buildMultiCargoBookingQuoteNoteBeans(cargo),
    cargoHsCodeNoteBeans: [],
    bookingChannel: null,
    hazaRuleNotes: 'Class 2.3 restricted',
    pendingFinalBooking: false,
    pendingFinalQuoteStatus: mainDetails?.pendingFinalBookingStatus || 'N',
    updateComments: '',
    deleteComments: '',
    updateExpenseComments: '',
    deleteExpenseComments: '',
    addedExpenseComments: '',
    multiCustomHoldStatus: null,
    originChatAppChannel: false,
    doorDeliveryDetailsBean: buildDoorDeliveryDetailsBean(
      routing,
      isNew,
      mainDetails?.referenceNumber,
      loginClientBean
    ),
    cfsDeliveryType: 'D',
    customerTypeChange: false,
    isHazardousPermissionOverride: mainDetails?.isHazardousPermissionOverride,
    pickupUpdatedComment: '',
    pickupDeleteComment: '',
    doorDeliveryDeletedComment: '',
    doorDeliveryUpdatedComment: '',
    truckQuote: '',
    truckQuoteType: '-1',
    amsCustomAdvanceFillingMainBean: {
      deleteAmsCustomAdvanceFillingBeans: [],
      amsCustomAdvanceFillingBeans: [],
    },
    oldamsCustomAdvanceFillingMainBean: {
      deleteAmsCustomAdvanceFillingBeans: [],
      amsCustomAdvanceFillingBeans: [],
    },
    customsno: null,
    toggleValue: null,
    bkgToggleValue: null,
    carrierOffice: null,
    bookingSource: null,
    deliveryType: routing?.routingFormData?.deliveryType || null,
    trkTransmissionStatus: null,
    toggleForShipmentPickedUpEvent: false,
    quoteOldPickUp: null,
    tmsRateFetched: 'N',
    statusCanceled: false,
    legacy: false,
    sensitiveCargoApprovalReceived: false,
    routingUpdated: true,
    bolCreatedForBKG: false,
    bookingTruckingInstrSent: false,
    ratedNonRatedDocSend: false,
    ctcchargeFromQuote: false,
    lotCreatedForBKG: false,
    printDimension: true,
    shipmentOrderTransmit: false,
    autoGeneratedDeliveryReferenceExist: false,
    ediBooking: false,
    cocupdated: false,
    intraCarrier: false,
    vesselUpdate: false,
    quoteChild: false,
    lotCmtFromQuo: false,
    carrCodeRestricted: false,
    transmitted: false,
    multipleLot: false,
    bookingTransmittedtoSaco: false,
    cancelSOTransmitted: false,
    bookingFileFrobCargo: false,
    supplierName: null,
    oldBooking: false,
  };
}

function buildActualBuyerSellerBean() {
  return {
    actualBuyerName: null,
    actualBuyerAddress: null,
    actualBuyerCity: null,
    actualBuyerState: null,
    actualBuyerZipCode: null,
    actualBuyerCountry: null,
    actualBuyerEoriNumber: null,
    actualSellerName: null,
    actualSellerAddress: null,
    actualSellerCity: null,
    actualSellerState: null,
    actualSellerZipCode: null,
    actualSellerCountry: null,
    actualSellerEoriNumber: null,
    declarantName: null,
    declarantAddress: null,
    declarantCity: null,
    declarantState: null,
    declarantZipCode: null,
    declarantCountry: null,
    declarantEoriNumber: null,
    actualSellerStateId: null,
    actualBuyerStateId: null,
    actualSellerCountryCode: null,
    actualBuyerCountryCode: null,
  };
}

function buildBookingEquipmentBean() {
  return {
    pickupContainerCode: null,
    pickupContainerName: null,
    pickupContainerAddress1: null,
    pickupContainerAddress2: null,
    pickupContainerAddress3: null,
    pickupContainerState: null,
    pickupContainerZipcode: null,
    pickupContainerPhone: null,
    pickupContainerDate: null,
    pickupContainerTime: null,
    pickupContainerTimeTo: null,
    pickupChassisCode: null,
    pickupChassisName: null,
    pickupChassisAddress1: null,
    pickupChassisAddress2: null,
    pickupChassisAddress3: null,
    pickupChassisState: null,
    pickupChassisZipcode: null,
    pickupChassisPhone: null,
    pickupChassisDate: null,
    pickupChassisTime: null,
    pickupChassisTimeTo: null,
    returnChassisCode: null,
    returnChassisName: null,
    returnChassisAddress1: null,
    returnChassisAddress2: null,
    returnChassisAddress3: null,
    returnChassisState: null,
    returnChassisZipCode: null,
    returnChassisPhone: null,
    returnChassisDate: null,
    returnChassisTime: null,
    returnChassisTimeTo: null,
    latestReturnDate: null,
    latestReturnToTime: null,
    latestReturnFromTime: null,
  };
}

function buildShipmentStatusUpdateBean(customer?: any) {
  const defaultForm = customer?.defaultForm ?? {};
  return {
    shipmentId: null,
    objectCode: null,
    referenceNumber: null,
    shipmentType: null,
    clausesText: null,
    userSchemaId: 0,
    officeId: 0,
    eventList: [
      {
        eventName: 'CUSTOMER-CREDIT-HOLD',
        comment: null,
        commentParams: {
          CUSTOMER_NAME: str(defaultForm?.customerCode) || 'TESTNIMP',
        },
      },
      {
        eventName: 'HAZ_OVERRIDE_PERMISSION',
        comment: null,
        commentParams: {
          SHIPMENT_ALLOWED: '',
          CARRIER_APPROVAL_REQUIRE: '',
          SHIP_RESTRICT: 'Shipment Restricted - Class 2.3 restricted<br>',
          DEST_APRROVE: '',
          REMARK: '122223',
        },
      },
    ],
    relatedType: [null],
    relatedRerefence: [null],
    deletedType: [null],
    deletedReference: [null],
    notesShownOnCodes: null,
    documentHistoryId: 0,
    statusLocationUncode: null,
    bookingNo: null,
    alias: null,
    stmt_cycle: null,
    addNoteToggleButton: null,
    addNoteStmtCycleButton: null,
    etsDate: null,
    publicPrivateType: null,
    cobProcess: false,
  };
}

function buildBookingHazardousBeanList(cargo?: any): any[] {
  const multiCargoList = cargo?.bookingQuoteMultiCargoBeanList || [];
  const hazardousBeans: any[] = [];

  for (const multiCargo of multiCargoList) {
    const hazList = multiCargo?.bookingMultiCargoHazardousList || [];
    for (const haz of hazList) {
      hazardousBeans.push({
        rowId: haz.rowId || null,
        referenceNumber: 0,
        shipperName1: str(haz.shipperName1 || haz.commodity),
        shipperName2: null,
        techName1: str(haz.techName1),
        techName2: null,
        noOfpieces: Number(haz.noOfpieces) || 0,
        packaging: str(haz.packaging),
        weight: Number(haz.weight) || 0,
        imcoClass: null,
        unNumber: str(haz.unNumber),
        imcoPage: str(haz.imcoPage),
        flashPointCelsius: Number(haz.flashPointCelsius) || 0,
        flashpointFahrenheit: Number(haz.flashpointFahrenheit) || 0,
        degrees: null,
        packagingGroup: str(haz.packagingGroup),
        plackard1: str(haz.plackard1),
        plackard2: str(haz.plackard2),
        emergencyPhone: str(haz.emergencyPhone),
        emergencyCotact: str(haz.emergencyCotact),
        hazardousCode: str(haz.hazardousCode),  
        hazarDousCount: 0,
        quantity: str(haz.quantity),
        controlFlag: 'U',
        inputUpdateUser: null,
        recordNumber: 0,
        quoteCargoHazardousId: 0,
        imoSubClass: str(haz.imoSubClass),
        customerDeclaredCargoId: null,
        bookingNumber: null,
        customerDeclaredHazardouId: null,
        customerDeclaredHazardousTransactionFlag: ' ',
        pickupId: null,
        commodity: str(haz.commodity),
      });
    }
  }

  return hazardousBeans;
}

function buildHazardousRuleMap(cargo?: any): Record<string, any> {
  const multiCargoList = cargo?.bookingQuoteMultiCargoBeanList || [];
  const hasHazardous = multiCargoList.some(
    (mc: any) =>
      mc?.bookingMultiCargoHazardousList &&
      mc.bookingMultiCargoHazardousList.length > 0
  );

  if (!hasHazardous) {
    return {};
  }

  const ruleMap: Record<string, any> = {};
  let index = 0;

  for (const multiCargo of multiCargoList) {
    const hazList = multiCargo?.bookingMultiCargoHazardousList || [];
    for (const haz of hazList) {
      const imoClass = str(haz.imoClass || haz.hazardousCode);
      if (imoClass) {
        ruleMap[String(index)] = {
          DocumentList: '',
          ACTION: 'SHIPMENT_RESTRICTED',
          MULTI_ACTION: 'SHIPMENT_RESTRICTED',
          REMARKS: `Class ${imoClass} restricted`,
          IMO_CLASS: imoClass,
        };
        index++;
      }
    }
  }

  return ruleMap;
}

// PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel
const isReeferContainer = (typeValue: string): boolean => {
  if (!typeValue) return false;
  const val = String(typeValue).toUpperCase();
  return val.includes('RF') || 
         val.includes('RH') || 
         val.includes('RE') ||
         val.includes('REEFER') || 
         val.includes('REFRIGERATED');
};

function buildBookingQuoteCargoBeanFCL(
  c: any,
  moduleType: any,
  isNew = true,
  routing: any,
  customDetails?: any,
  loginClientBean?: any
) {
  const cargoRows = c?.cargoRows || [];
  const row0 = cargoRows[0] || {};
  const row1 = cargoRows[1] || {};
  const row2 = cargoRows[2] || {};
  const reeferRow = cargoRows.find((row: any) => isReeferContainer(row.containerType1)) || row0;
  const genAesFilingBean = customDetails || {};

  const allDescriptions = cargoRows
    .map((row: any) => str(row.descriptionOfGoods || row.description || ''))
    .filter((desc: string) => desc.trim() !== '')
    .join('\n');

  const commodity: Record<string, string> = {};
  allDescriptions
    .split('\n')
    .filter((item: string) => item.trim() !== '')
    .slice(0, 5)
    .forEach((item: string, index: number) => {
      commodity[`commodity${index + 1}`] = item.trim();
    });

  let totalKg = 0;
  let totalLbs = 0;
  let totalCbm = 0;
  let totalCbf = 0;
  let totalPieces = 0;
  let anyHazardous = 'N';

  cargoRows.forEach((row: any) => {
    totalKg += num(row.kg);
    totalLbs += num(row.lbs);
    totalCbm += num(row.cbm);
    totalCbf += num(row.cbf);
    totalPieces += num(row.pieces);
    if (str(row.hazardous).startsWith('Y')) {
      anyHazardous = 'Y';
    }
  });

  const combinedDimRows: any[] = [];
  cargoRows.forEach((row: any) => {
    const dimRows = row.dimRows || [];
    dimRows.forEach((d: any) => {
      combinedDimRows.push({
        dimensionId: null,
        length: num(d.length),
        width: num(d.width),
        height: num(d.height),
        unit: str(d.unit).charAt(0),
        pieces: num(d.pieces),
        cbm: num(d.cbm),
        cbf: num(d.cbf),
        kg: num(d.kg),
        lbs: num(d.lbs),
        stackable: str(d.stackable).charAt(0) || 'Y',
        shipmentType: 'F',
        stackingType: str(d.stackingType) || '-1',
        tmsClass: num(d.cls),
      });
    });
  });

  const combinedHazList: any[] = [];
  cargoRows.forEach((row: any) => {
    if (str(row.hazardous).startsWith('Y')) {
      const hazRows = row.hazRows || [];
      hazRows.forEach((h: any) => {
        combinedHazList.push({
          rowId: '',
          referenceNumber: 0,
          shipperName1: str(h.properShippingName || h.commodity || h.shipperName1 || ''), 
          shipperName2: str(h.shipperName2 || ''),
          techName1: str(h.technicalName || h.techName1 || ''),
          techName2: null,
          noOfpieces: num(h.pieces),
          packaging: str(h.packaging || ''),
          weight: num(h.weight),
          imcoClass: str(h.imoClass || ''),
          unNumber: str(h.unNumber || ''),
          imcoPage: str(h.imoPage || ''),
          flashPointCelsius: num(h.flashpointC),
          flashpointFahrenheit: num(h.flashpointF),
          degrees: str(h.degreeUnit || ''),
          packagingGroup: str(h.pkgGroup || ''),
          plackard1: str(h.placard1 || ''),
          plackard2: str(h.placard2 || ''),
          emergencyPhone: str(h.emergencyNumber || ''),
          emergencyCotact: str(h.emergencyContact || ''),
          hazardousCode: str(h.imoClass || ''),
          hazarDousCount: 0,
          quantity: h.quantity === "L - Limited Quantity" || h.quantity === "L" ? "L" : h.quantity === "E - Excepted Quantity" || h.quantity === "E" ? "E" : "",
          controlFlag: isNew ? 'N' : 'U',
          inputUpdateUser: loginClientBean?.username || '',
          recordNumber: combinedHazList.length + 1,
          quoteCargoHazardousId: Number(h.hrid) || 0,
          imoSubClass: str(h.imoSubclass || h.imoSubClass || ''),
          customerDeclaredCargoId: null,
          bookingNumber: null,
          customerDeclaredHazardouId: '',
          customerDeclaredHazardousTransactionFlag: isNew ? 'N' : 'U',
        });
      });
    }
  });

  return {
    container1: num(row0.numberOfContainer1),
    containerSize1: str(row0.containerType1).split('-')[0] || '',
    containerType1: str(row0.containerType1).split('-')[1] || '',
    container2: num(row1.numberOfContainer1),
    containerSize2: str(row1.containerType1).split('-')[0] || '',
    containerType2: str(row1.containerType1).split('-')[1] || '',
    container3: num(row2.numberOfContainer1),
    containerSize3: str(row2.containerType1).split('-')[0] || '',
    containerType3: str(row2.containerType1).split('-')[1] || '',
    ...commodity,
    weight: totalKg,
    cube: totalCbm,
    weightLbs: totalLbs,
    cubeCbf: totalCbf,
    hazardousCode: anyHazardous,
    numberOfPieces: totalPieces,
    uom: str(row0.uom || 'M'),
    marks: str(row0.marks || ''),
    actualPieces: totalPieces,
    packaging: str(row0.packaging || ''),
    genAesFilingBean: {
      referenceNumber: genAesFilingBean?.referenceNumber,
      scacCode: genAesFilingBean?.SCACCodeText || routing?.routingFormData?.carrierCode?.split('-')[0].trim() || null,
      itnNumber: genAesFilingBean?.ITNNumber,
      filingType: genAesFilingBean?.fillingType ?? 'N',
      type: moduleType,
      description: genAesFilingBean?.description,
      rowid: genAesFilingBean?.rowid,
      controlFlag: isNew ? 'N' : 'U',
      inputUser: genAesFilingBean?.inputUser ?? loginClientBean?.username,
      updateUser: genAesFilingBean?.updateUser,
      oldUcrNumber: genAesFilingBean?.oldUcrNumber,
      mrnNumber: genAesFilingBean?.mrnNumber,
      oldMrnNumber: genAesFilingBean?.oldMrnNumber,
      filingBy: genAesFilingBean?.filingBy,
    },
    documentReferences: str(row0.docRef || '-1'),
    bookingCustomerDeclaredCargoBeanList: null,
    bookingAdditionalCargoInfoHazardousBeanList: null,
    recordSequence: 0,
    status: 0,
    bookingNumber: null,
    customerDeclaredId: null,
    commodity: null,
    controlFlag: isNew ? 'N' : 'U',
    cargoDimensionBeanList: combinedDimRows,
    lotComments: null,
    lotCommentsDesc: null,
    oldLotCommentDesc: '',
    lotCommentsValue: str(c?.internalComment),
    oldLotCommentsValue: '',
    externalLotComments: (c?.lotRows || []).map((l: any, _idx: number) => ({
      commentId: l.commentId,
      module: moduleType,
      reference: l.reference,
      code: str(l.type),
      name: str(l.details),
      value: str(l.freeTextInput),
      description: l.details,
      inputUserName: l.inputUserName,
      inputDate: l.inputDate,
      updateUserName: loginClientBean?.username,
      updateDate: l.updateDate,
      transactionFlagStatus: isNew ? 'N' : 'U',
      oldCode: l.oldCode,
      oldName: l.oldName,
      oldValue: l.oldValue,
      fromQuote: l.fromQuote,
    })),
    commodityDescription6: '',
    commodityDescription7: '',
    commodityDescription8: '',
    commodityDescription9: '',
    commodityDescription10: '',
    commodityDescription11: '',
    commodityDescription12: '',
    stackable: c?.stackable,
    tmsShipmentType: c?.tmsShipmentType,
    trailerType: null,
    sensitiveCargo: c?.sensitiveCargo,
    loadingInstruction: str(c?.loadingInstruction),
    warehouseInstruction: str(c?.warehouseInstruction),
    hsCode: str(row0.hsCode || ''),
    descriptionOfGood: allDescriptions,
    oogCode: null,
    refeerCode: isReeferContainer(reeferRow.containerType1) ? 'Y' : 'N',
    socCode: null,
    noOfContainers: null,
    containerType: null,
    cargoAdditionalInfoId: null,
    temprature: isReeferContainer(reeferRow.containerType1)
      ? (reeferRow.temperatureC !== '' && reeferRow.temperatureC !== '-' ? num(reeferRow.temperatureC) : null)
      : null,
    length: null,
    height: null,
    width: null,
    unit: null,
    airFlow: null,
    relativeHumidity: null,
    ventSetting: isReeferContainer(reeferRow.containerType1) ? reeferRow.ventSetting : null,
    dehumificationCode: null,
    genSetCode: isReeferContainer(reeferRow.containerType1)
      ? (reeferRow.generatorSet === 'Yes' ? 'Y' : 'N')
      : null,
    tempratureInstruction: isReeferContainer(reeferRow.containerType1)
      ? (reeferRow.temperatureC !== '' && reeferRow.temperatureC !== '-' ? 'C' : null)
      : null,
    containerTypeAndSize: null,
    containerSize: null,
    totalKg: totalKg,
    totalLbs: totalLbs,
    totalCbm: totalCbm,
    totalCbf: totalCbf,
    hazardouValue: anyHazardous,
    requiredContainerType: null,
    customsNumber: null,
    cargoInsurence: 'Y',
    assuredParty: '',
    commercialValue: '',
    bookingMultiCargoHazardousList: combinedHazList,
  };
}

function buildBookingHazardousBeanListFCL(cargo?: any, loginClientBean?: any): any[] {
  const cargoRows = cargo?.cargoRows || [];
  const hazardousBeans: any[] = [];
  const username = loginClientBean?.username || '';

  for (const row of cargoRows) {
    if (str(row.hazardous).startsWith('Y')) {
      const hazList = row.hazRows || [];
      for (const h of hazList) {
        hazardousBeans.push({
          rowId: h.rowId || null,
          referenceNumber: 0,
          shipperName1: str(h.properShippingName || h.commodity || h.shipperName1 || ''),
          shipperName2: str(h.shipperName2 || ''),
          techName1: str(h.technicalName || h.techName1 || ''),
          techName2: null,
          noOfpieces: Number(h.pieces) || 0,
          packaging: str(h.packaging || ''),
          weight: Number(h.weight) || 0,
          imcoClass: str(h.imoClass || ''),
          unNumber: str(h.unNumber || ''),
          imcoPage: str(h.imoPage || ''),
          flashPointCelsius: Number(h.flashpointC) || 0,
          flashpointFahrenheit: Number(h.flashpointF) || 0,
          degrees: str(h.degreeUnit || ''),
          packagingGroup: str(h.pkgGroup || ''),
          plackard1: str(h.placard1 || ''),
          plackard2: str(h.placard2 || ''),
          emergencyPhone: str(h.emergencyNumber || ''),
          emergencyCotact: str(h.emergencyContact || ''),
          hazardousCode: str(h.imoClass || ''),
          hazarDousCount: 0,
          quantity: h.quantity === "L - Limited Quantity" || h.quantity === "L" ? "L" : h.quantity === "E - Excepted Quantity" || h.quantity === "E" ? "E" : "",
          controlFlag: 'U',
          inputUpdateUser: username,
          recordNumber: hazardousBeans.length + 1,
          quoteCargoHazardousId: Number(h.hrid) || 0,
          imoSubClass: str(h.imoSubclass || h.imoSubClass || ''),
          customerDeclaredCargoId: null,
          bookingNumber: null,
          customerDeclaredHazardouId: null,
          customerDeclaredHazardousTransactionFlag: ' ',
          pickupId: null,
          commodity: str(h.commodity || ''),
        });
      }
    }
  }
  return hazardousBeans;
}

function buildHazardousRuleMapFCL(cargo?: any): Record<string, any> {
  const cargoRows = cargo?.cargoRows || [];
  const ruleMap: Record<string, any> = {};
  let index = 0;

  for (const row of cargoRows) {
    if (str(row.hazardous).startsWith('Y')) {
      const hazList = row.hazRows || [];
      for (const h of hazList) {
        const imoClass = str(h.imoClass || h.hazardousCode);
        if (imoClass && imoClass !== 'Please Select') {
          ruleMap[String(index)] = {
            DocumentList: '',
            ACTION: 'SHIPMENT_RESTRICTED',
            MULTI_ACTION: 'SHIPMENT_RESTRICTED',
            REMARKS: `Class ${imoClass} restricted`,
            IMO_CLASS: imoClass,
          };
          index++;
        }
      }
    }
  }
  return ruleMap;
}
// PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
