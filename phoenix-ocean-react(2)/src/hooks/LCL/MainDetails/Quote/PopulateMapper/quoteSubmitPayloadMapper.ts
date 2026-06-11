/**
 * quoteSubmitPayloadMapper.ts
 *
 * Transforms frontend form data (mainDetails, customerDetails, routingDetails,
 * cargoDetails, rateDetails) into the exact JSON structure the backend Java API
 * expects for POST /phoenix/api-ocean/1.0/quote/validateAndSaveQuote.
 *
 * Every key present in the working api_testing.json is accounted for here.
 * Dynamic values from the UI are mapped in; everything else defaults to
 * null / "" / 0 / false / [] as appropriate.
 */
import dayjs from "dayjs";
import { CommonToggleKeys, ToggleKey } from "phoenix-common-react";
import { quoteChannelConstants } from "./quotePopulateMapper";

function getFormattedDate(date: Date | null | undefined): string {
  return date ? dayjs(date).format('DD-MMM-YYYY').toUpperCase() : '';
}

// ─── helpers ────────────────────────────────────────────────────────────────

const str = (v: any): string => (v != null ? String(v) : '');
const strOrNull = (v: any): string | null => (v != null && v !== '' ? String(v) : null);
// Oracle NUMBER columns only accept numeric strings — strip non-numeric suffix (e.g. "9405Blank" → "9405"); return null for empty/invalid so NUMBER columns get NULL not ""
const parseStateId = (v: any): string | null => { if (!v) return null; const m = String(v).match(/^(\d+)/); return m ? m[1] : null; };

const fmtTime = (v: any): string => str(v).replace(/\s+([AaPp][Mm])$/, '$1');

const formatName = (v: any) => {
  if (
    v == null ||
    (typeof v === 'string' && v.trim() === '') ||
    (Array.isArray(v) && v.length === 0) ||
    (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
  ) {
    return {
      name1: '',
      name2: '',
      name3: '',
      name4: '',
      name5: '',
      name6: '',
      name7: '',
    };
  }

  let value = '';

  if (typeof v === 'object') {
    value = Object.values(v).join(' ');
  } else {
    value = String(v);
  }

  const lines = value
    .split(/\r?\n/)
    .map((l: string) => l.trim())
    .filter(Boolean);

  return {
    name1: (lines[0] || '').substring(0, 50),
    name2: (lines[1] || '').substring(0, 50),
    name3: (lines[2] || '').substring(0, 50),
    name4: (lines[3] || '').substring(0, 50),
    name5: (lines[4] || '').substring(0, 50),
    name6: (lines[5] || '').substring(0, 50),
    name7: (lines[6] || '').substring(0, 50),
  };
};

const formatAddress = (v: any, max:number) => {
  const lines = (v == null ? '' : String(v))
    .split(/\r?\n/)
    .map(l => l.trim())
    .filter(Boolean);
  return {
    addr1: (lines[0] || '').substring(0, max),
    addr2: (lines[1] || '').substring(0, max),
    addr3: (lines[2] || '').substring(0, max),
    addr4: (lines[2] || '').substring(0, max),
    addr5: (lines[2] || '').substring(0, max),

  };
};

const extractCountryCode = (v: any): string => {
  const s = str(v);
  if (!s) return '';
  if (s.includes(' - ')) return s.split(' - ')[0].trim();
  const hyphenIdx = s.indexOf('-');
  if (hyphenIdx > 0 && hyphenIdx <= 3) return s.substring(0, hyphenIdx).trim();
  return s.trim();
};

const num = (v: any, fallback = 0): number => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

function getPrepaidCollectText(payType: string | null | undefined): string {
  if (payType === 'P') return 'PP';
  if (payType === 'C') return 'CC';
  return '-';
}

function formatChargeValue(charge: any): string {
  const basis = str(charge.sellBasis).trim() || '-';
  const rate = charge.sellRate != null ? String(parseFloat(String(charge.sellRate))) : '0';
  const amount = charge.localAmount ?? 0;
  const payType = getPrepaidCollectText(charge.payType);
  const rateType = charge.isCallFromAccurate ? 'A' : (num(charge.spotRateFlag) > 0 ? 'S' : 'M');
  return `${payType} ${str(charge.chargeCode)} ${basis} ${str(charge.sellCurrency)} ${rate} ${amount} (${rateType}) <br>`;
}

function isChargeModified(oldBean: any, newBean: any): boolean {
  return (
    num(oldBean.sellRate) !== num(newBean.sellRate) ||
    str(oldBean.sellBasis) !== str(newBean.sellBasis) ||
    str(oldBean.sellCurrency) !== str(newBean.sellCurrency) ||
    str(oldBean.chargeCode) !== str(newBean.chargeCode) ||
    str(oldBean.chargeType) !== str(newBean.chargeType) ||
    num(oldBean.localAmount) !== num(newBean.localAmount)
  );
}

function computeRateChangeComments(rate: any, isNewEntry: boolean): { updateComments: string; deleteComments: string } {
  if (isNewEntry || !Array.isArray(rate?.originalBookingQuoteChargeBeanList) || rate.originalBookingQuoteChargeBeanList.length === 0) {
    return { updateComments: '', deleteComments: '' };
  }

  const currentCharges = buildBookingQuoteChargeBeanList(rate, false);

  const oldMap = new Map<string, any>();
  for (const bean of rate.originalBookingQuoteChargeBeanList) {
    if (bean.rowId) oldMap.set(String(bean.rowId), bean);
  }

  const currentByRowId = new Map<string, any>();
  for (const bean of currentCharges) {
    if (bean.rowId) currentByRowId.set(String(bean.rowId), bean);
  }

  const updateLines: string[] = [];
  const deleteLines: string[] = [];

  for (const [rowId, oldBean] of oldMap.entries()) {
    const newBean = currentByRowId.get(rowId);
    if (newBean) {
      if (isChargeModified(oldBean, newBean)) {
        updateLines.push(`From ${formatChargeValue(oldBean)} To ${formatChargeValue(newBean)}`);
      }
    } else {
      deleteLines.push(formatChargeValue(oldBean));
    }
  }

  return {
    updateComments: updateLines.join('\n'),
    deleteComments: deleteLines.join('\n'),
  };
}

const truckingDetails = (data: string) => {
  const pickupDetails = data?.split('\n') || [];
    while (pickupDetails.length <= 6) {
    pickupDetails.push('');
  }
  return pickupDetails;
}
const quoteChannelNameToCodeMap: Record<string, string> = {
  [quoteChannelConstants.GLOBAL_EXPORT_BOOKING]: 'G',
  // [quoteChannelConstants.EDI_CONSTANT]: 'E',
  [quoteChannelConstants.OMSBOOKING]: 'O',
  [quoteChannelConstants.GLOBAL_IM]: 'F',
  [quoteChannelConstants.WWA_EDI]: '',
  // [quoteChannelConstants.WWA_ONLINE]: 'B',
};
export const getQuoteChannelCode = (
  quoteChannel: string,
): string => {
  if (
    quoteChannel === quoteChannelConstants.SSCONLINEBOOKING ||
    quoteChannel === quoteChannelConstants.STIONLINEBOOKING
  ) {
    return quoteChannelConstants.STI_ONLINE_BOOKING; // return original code
  }

  return quoteChannelNameToCodeMap[quoteChannel] ?? quoteChannel;
};
// ─── bookingQuoteBean (lines 33‑1249 of api_testing.json) ───────────────────

function buildBookingQuoteBean(main: any, customer: any, routing: any, cargo: any, rate: any, loginBean: any, isVisible: (key: ToggleKey) => boolean) {
  const isNewQuote = !main?.referenceNumber || num(main?.referenceNumber) === 0;
  const rateChangeComments = computeRateChangeComments(rate, isNewQuote);
  return {
    // ── main‑details fields the API expects ──
    referenceNumber: num(main?.referenceNumber),
    bookQuoteDate: dayjs().format('DD-MMM-YYYY').toUpperCase(),
    bookingQuoteType: (main?.type).slice(0, 1),
    handlingOffice: str(main?.handlingOffice) || 'NYC',
    quoteNumber: num(main?.quoteNumber || main?.referenceNumber),
    userReference: str(main?.userReference),
    takenBy: main?.createdBy,
    status: str(main?.status),
    transmitToLocation1: null,
    transmitToLocation2: null,
    transmitToLocation3: null,
    terms: str(main?.type === 'L' ? (routing?.termsCode || routing?.routingFormData?.termsCode || routing?.terms || routing?.routingFormData?.terms) : main?.terms) || "",
    trackingCustomer1: strOrNull(main?.trackingCustomer1),
    trackingCustomer2: strOrNull(main?.trackingCustomer2),
    pickupNeeded: str( main?.type === 'L' ? (routing?.pickupNeeded || routing?.routingFormData?.pickupNeeded) : main?.pickupNeeded),
    bookingPrefix: null,
    lineBooking: str(main?.carrierBookingNumber) || '',
    lineCode: '',
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
    ratingType: rate?.ratingType,
    uom: null,
    remarks1: null,
    remarks2: null,
    transmit: null,
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
    payorCode: str(main?.type === 'L' ? (customer?.lclForm?.billingCompany) : (main?.billingCompany)) || null,
    prepaidCredit: str(main?.type === 'L' ? (customer?.lclForm?.prepaidCollect) : str(main?.prepaidCollect)),
    aesAmsFlag: null,
    serviceContract: null,
    shipperEmail: null,
    pfm: null,
    intertrackFlag: null,
    amsScacCode: null,
    amsReference: null,
    amsReferenceQualifire: null,
    agentCode: strOrNull(main?.agentCode || "SSCANT"),
    receivedVia: main?.type === 'F' ? getQuoteChannelCode(strOrNull(main?.quoteChannel)) : strOrNull(main?.quoteChannel),
    communicationReference: null,
    customerEmail2: null,
    transmissionType: null,
    documentCutoffTime: null,
    vesselVoyageID: 0,
    wwaReference: null,
    shipmendID: 0,
    truckerAddress: null,
    truckerCity: null,
    truckerZipCode: null,
    carrierCode: null,
    carrierName: null,
    frequency: str(main?.type === 'L' ? (routing?.routingFormData?.frequency || routing?.frequency) : main?.frequency) || '',
    transitTime: strOrNull(main?.type === 'L' ? (routing?.routingFormData?.transitTime || routing?.transitTime) : main?.transitTime) || "17",
    receivedFromName: '',
    receivedFromCode: null,
    tranShipmentFlag: (routing?.transshipmentPorts?.length || routing?.routingFormData?.transshipmentPorts?.length) ? 'Y' : 'N',
    quoteCustomerFax: null, //TODO: need to add customer FAX
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
    quoteType: (main?.quoteType || '').slice(0, 1) || null,
    hazardousAction: 'SHIPMENT_RESTRICTED',

    // ── nested sub‑beans ──
    bookingQuoteCustomerBean: buildBookingQuoteCustomerBean(customer, main?.type),
    actualBuyerSellerBean: buildActualBuyerSellerBean(),
    bookingQuoteRoutingBean: buildBookingQuoteRoutingBean(routing, main?.type),
    bookingQuoteCargoBean: buildBookingQuoteCargoBean(cargo,"QUO", main?.type),
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


    rowId: strOrNull(main?.rowId),
    type: 'QUO',
    holdStatus: null,
    posTimeFormat: 0,
    controlFlag: main?.isCopyQuote
          ? 'N'
          : isNewQuote
            ? 'N'
            : 'U',
    preliminaryBooking: false,
    preliminaryBookingStatus: '',
    termName: str( (main?.type === 'L' ? (routing?.termsLabel || routing?.routingFormData?.termsLabel) : main?.termName) || ''),
    nomination: str((main?.type === 'L' ? customer?.lclForm?.controllingEntity : main?.controllingEntity) || ''),
    rateControllingEntity: str((main?.type === 'L' ? (customer?.lclForm?.rateControllingEntity) : (main?.rateControllingEntity)) || ''),
    updatedBy:  isVisible(CommonToggleKeys.OCN_IMPORT_QUOTE_ENHANCEMENT)  ? loginBean?.ldapUsername: loginBean?.username,
    updatedOn: main?.updatedOn ? (typeof main.updatedOn === 'string' ? main.updatedOn : getFormattedDate(main.updatedOn)) : dayjs().format('DD-MMM-YYYY').toUpperCase(),
    aesItnHoldStatusId: 0,
    aesItnHoldStatus: null,
    ucrHoldStatusId: 0,
    ucrHoldStatus: null,
    effectiveDate: getFormattedDate(main?.effectiveDate) || "",
    expirationDate: getFormattedDate(main?.expirationDate) || "",
    commission: '',
    carriers: ((routing?.carrierCode || routing?.routingFormData?.carrierCode) && (main?.type).slice(0, 1) === 'L') ? [{ carrierCode: str(routing?.carrierCode || routing?.routingFormData?.carrierCode).split(' - ')[0].trim() }] : Array.isArray(main?.carrier) ? main.carrier.map((carrier) => ({
      // quoteNum: carrier.code,
      carrierCode: carrier.carrierCode,
      carrierName: carrier.carrierName.split(' - ')[1]
    })): [],
    clauses: (main?.clauses || []).map((c: any, idx: number) => ({
      clauseCode: str(c.clauseCode),
      clauseName: strOrNull(c.clauseName),
      clauseNameLocale: null,
      clause: strOrNull(c.clause),
      clauseLocale: null,
      clauseDesc: strOrNull(c.clauseDesc),
      clauseDescLocale: null,
      sequence: idx + 1
    })),
    bookingCustomerDeclaredCargoBeanList: null,
    bookingCargoAdditionalDetailsList: null,
    roeType: rate?.rateOfExchange?.rateOfExchangeType,
    includePlcOnDocument: false,
    transmissionService: '',
    transmitToLocationName: null,
    purchaseOrderReferenceNumber: '',
    invoiceCurrency: '',
    invoiceExchangeRate: null,
    invoiceToLocalExchangeRate: 1,
    oldReferenceNumber: 0,
    oldStatus: '',
    modifyPLC: false,
    customerChange: !isNewQuote,
    isUpdated: false,
    oldEffectiveDate: isNewQuote ? null : (getFormattedDate(main?.effectiveDate) || null),
    oldCustomerCode: isNewQuote ? null : strOrNull(customer?.lclForm?.customerCode || customer?.defaultForm?.customerCode),
    controlNumber: null,
    ldapUser: null,
    emailAddressFrom: null,
    userPhone: null,
    shipmentType: null,
    gatewayOriginOffice: null,
    tmsShipmentId: str(main?.tmsShipmentId) || '',
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
    isCustomerOwnCFSAgreement: null,
    modeOfTransport: 'V',
    directLoading: 'N',
    tInputDate: null,
    errorMessage: '',
    oldCustomsHoldStatus: null,
    quoteFeedbackStatus: null,
    quoteFeedbackCategoryType: null,
    quoteFeedbackNotes: null,
    tbookingNumber: null,
    oldNomination: isNewQuote ? null : strOrNull(main?.type === 'L' ? (customer?.lclForm?.controllingEntity) : (main?.controllingEntity)),
    transmissionStatus: null,
    direction: str(main?.direction) === 'Import' ? 'I' : 'E',
    autoSuggestClauseBean: null,
    carrierTerms: null,
    carrierPrepaidCollect: null,
    carrierStatus: null,
    transmittedBookingNumber: null,
    inputUserOffice: null,
    responsiblePersonCode: null,
    responsiblePersonName: null,
    vid: 'N',
    importBookingNumber: 0,
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
    attachedDocument: [],
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
    bookingQuoteRoutingBeanlist: buildTransshipmentRoutingBeanList(routing),
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
    bookingQuoteMultiCargoBeanList: main?.type === 'L' ? buildBookingQuoteMultiCargoBeanList(cargo) : [],
    multiCargoBookingQuoteNoteBeans: main?.type === 'L' ? buildMultiCargoBookingQuoteNoteBeans(cargo): [],
    cargoHsCodeNoteBeans: [],
    bookingChannel: null,
    pendingFinalBookingStatus: 'N',
    pendingFinalQuoteStatus: str(main?.pendingFinal) === 'Yes' ? 'Y' : 'N',
    hazaRuleNotes: "Class 2.3 restricted",
    pendingFinalBooking: false,
    updateComments: rateChangeComments.updateComments,
    deleteComments: rateChangeComments.deleteComments,
    updateExpenseComments: '',
    deleteExpenseComments: '',
    addedExpenseComments: '',
    multiCustomHoldStatus: null,
    originChatAppChannel: false,
    doorDeliveryDetailsBean: buildDoorDeliveryDetailsBean(routing, isNewQuote, main?.referenceNumber),
    cfsDeliveryType: "D",
    customerTypeChange: false,
    isHazardousPermissionOverride: 'Y',
    pickupUpdatedComment: '',
    pickupDeleteComment: '',
    doorDeliveryDeletedComment: '',
    doorDeliveryUpdatedComment: '',
    truckQuote: str(main?.truckQuote) === 'Yes' ? 'Y' : 'N',
    truckQuoteType: (str(main?.quoteType)).slice(0, 1) || '',
    amsCustomAdvanceFillingMainBean: { deleteAmsCustomAdvanceFillingBeans: [], amsCustomAdvanceFillingBeans: [] },
    oldamsCustomAdvanceFillingMainBean: { deleteAmsCustomAdvanceFillingBeans: [], amsCustomAdvanceFillingBeans: [] },
    customsno: null,
    toggleValue: null,
    bkgToggleValue: null,
    carrierOffice: null,
    bookingSource: null,
    deliveryType: strOrNull(routing?.deliveryType || routing?.routingFormData?.deliveryType),
    trkTransmissionStatus: null,
    toggleForShipmentPickedUpEvent: false,
    routed: null,
    quoteOldPickUp: null,
    tmsRateFetched: 'N',
    customerOwnContainerToggle: 'N',
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

// ─── bookingQuoteCustomerBean ───────────────────────────────────────────────

function buildBookingQuoteCustomerBean(customer: any, shippingType?: string) {
  const lclForm = customer?.lclForm ?? {};
  const more = customer?.customerMoreDetails ?? {};

  return {
    customerType: str(lclForm?.customerType) || null,
    salesRepresentative: str(lclForm?.salesRepresentative),
    customerEmail: str(lclForm?.customerEmail),
    purchaseOrderNumber: str(more?.purchaseOrder),
    shipperBean: {
      shipperReference: str(lclForm?.customerReference),
      shipperCode: str(lclForm?.customerCode),
      shipperName: formatName(lclForm?.customerName).name1,
      shipperAddress1: formatAddress(lclForm?.customerAddress,50).addr1,
      shipperAddress2: formatAddress(lclForm?.customerAddress,50).addr2,
      shipperAddress3: formatAddress(lclForm?.customerAddress,50).addr3,
      shipperCity: str(lclForm?.customerCity),
      shipperPhone: str(lclForm?.telephoneNumber),
      shipperCellphone: str(lclForm?.mobileNumber),
      shipperTelephone: str(lclForm?.telephoneNumber),
      shipperFax: str(lclForm?.customerFax),
      shipperContact: str(lclForm?.customersContactName),
      customerReference: '',
      namedAccount: str(lclForm?.customerNamedAccount),
      wwaCustomer: null,
      customerAlias: null,
      creditHold: "H",
      namedAccountFullName: '',
      shipperState: str(lclForm?.customerState),
      shipperZip: str(lclForm?.customerZipCode),
      shipperCountry: extractCountryCode(lclForm?.customerCountry),
      shipperNewName: null,
      shipperNewAddress: null,
      shipperName2: formatName(lclForm?.customerName).name2,
      shipperName3: formatName(lclForm?.customerName).name3,
      shipperName4: formatName(lclForm?.customerName).name4,
      shipperName5: formatName(lclForm?.customerName).name5,
      shipperEmail: str(lclForm?.customerEmail),
      oldCustomerReference: null,
      customerITNo: str(lclForm?.customerIt),
      namedAccountListMap: null,
      asAgentForBkg: str(lclForm?.asAgentFor),
      asAgentForToggle: (lclForm?.asAgentFor) ? 'Y' : 'N',
      shipperStateId: parseStateId(lclForm?.customerStateId),
      shipperStateName: str(lclForm?.customerStateName),
      shipperEoriNumber: str(lclForm?.customerEoriNumber),
      shipperCombinedDetails: null,
      customerType: shippingType == 'F'? str(lclForm?.fcustomerType || '') : str(lclForm?.customerType || '-1'),
      shipperMpciPartyIdNumber: null,
      customerContact: null,
      customerDetailsFromBooking: true,
    },
    consigneeBean: {
      consigneeReference: str(more?.consigneeReference),
      consigneeCode: str(more?.consigneeCode),
      consigneeName: formatName(more?.consigneeName).name1,
      consigneeName1: formatName(more?.consigneeName).name2,
      consigneeAddress1: formatAddress(more?.consigneeAddress,50).addr1,
      consigneeAddress2: formatAddress(more?.consigneeAddress,50).addr2,
      consigneeAddress3: formatAddress(more?.consigneeAddress,50).addr3,
      consigneePhone: str(more?.consigneePhoneNumber),
      consigneeFax: str(more?.consigneeFax),
      consigneeContact: str(more?.consigneeContactName),
      consigeeCity: str(more?.consigneeCity),
      consigneeState: str(more?.consigneeState),
      consigneeCountry: extractCountryCode(more?.consigneeCountry),
      consigneeTelephone: null,
      consigneeZipCode: str(more?.consigneeZipCode),
      consigneeNewName: null,
      consigneeNewAddress: null,
      namedAccount: str(more?.consigneeNamedAccount),
      namedAccountFullName: '',
      consigneeEmail: str(more?.consigneeEmail),
      consigneeName3: '',
      consigneeName4: '',
      consigneeName5: '',
      consigneeStateName: str(more?.consigneeStateName),
      consigneeStateId: parseStateId(more?.consigneeStateId),
      consigneeEoriNumber: str(more?.consigneeEoriNumber),
      consigneeCombinedDetails: null,
      consigneeMpciPartyIdNumber: null,
      customerDetailsFromBooking: true,
    },
    forwarderBean: {
      forwarderReference: str(more?.shipperReference),
      forwarderCode: str(more?.shipperCode),
      forwarderName: formatName(more?.shipperName).name1,
      forwarderAddress1: formatAddress(more?.shipperAddress,50).addr1,
      forwarderAddress2: formatAddress(more?.shipperAddress,50).addr2,
      forwarderAddress3: formatAddress(more?.shipperAddress,50).addr3,
      forwarderPhone: str(more?.shipperPhoneNumber),
      forwarderFax: str(more?.shipperFax),
      forwarderContact: str(more?.shipperContactName),
      forwarderNameAccount: str(more?.shipperNamedAccount),
      forwarderNamedAccountFullName: '',
      forwarderName2: formatName(more?.shipperName).name2,
      forwarderName3: formatName(more?.shipperName).name3,
      forwarderName4: formatName(more?.shipperName).name4,
      forwarderName5: formatName(more?.shipperName).name5,
      forwarderState: str(more?.shipperState),
      forwarderZip: str(more?.shipperZipCode),
      forwarderCountry: extractCountryCode(more?.shipperCountry),
      forwarderCity: str(more?.shipperCity),
      forwarderEmail: str(more?.shipperEmail),
      forwarderStateId: parseStateId(more?.shipperStateId),
      forwarderStateName: str(more?.shipperStateName),
      forwarderEoriNumber: str(more?.shipperEoriNumber),
      forwarderCombinedDetails: null,
      forwarderMpciPartyIdNumber: null,
      customerDetailsFromBooking: true,
    },
    agentBean: {
      agentReference: null,
      agentCode: str(lclForm?.agentCode),
      agentName: str(lclForm?.agentName),
      agentAddress1: null,
      agentAddress2: null,
      agentAddress3: null,
      agentPhone: null,
      agentFax: null,
      agentContact: null,
      agentNameAccount: null,
      agentNamedAccountFullName: null,
      agentName2: null,
      agentName3: null,
      agentName4: null,
      agentName5: null,
      agentState: null,
      agentZip: null,
      agentCountry: null,
      agentCity: null,
      agentEmail: str(lclForm?.agentEmail),
      agentTelephone: null,
      license: false,
    },
    actualforwarderBean: {
      forwarderReference: '',
      forwarderCode: '',
      forwarderName: '',
      forwarderAddress1: '',
      forwarderAddress2: '',
      forwarderAddress3: '',
      forwarderPhone: '',
      forwarderFax: '',
      forwarderContact: '',
      forwarderNameAccount: '',
      forwarderNamedAccountFullName: '',
      forwarderName2: "",
      forwarderName3: "",
      forwarderName4: "",
      forwarderName5: "",
      forwarderState: '',
      forwarderZip: '',
      forwarderCountry: '',
      forwarderCity: '',
      forwarderEmail: '',
      forwarderStateId: parseStateId(more?.forwarderStateId),
      forwarderStateName: str(more?.forwarderStateName),
      forwarderEoriNumber: '',
      forwarderCombinedDetails: null,
      forwarderMpciPartyIdNumber: null,
      customerDetailsFromBooking: true,
    },
    notifyBean: {
      notifyReference: str(more?.notifyPartyReference),
      notifyCode: str(more?.notifyPartyCode),
      notifyName: formatName(more?.notifyPartyName).name1,
      notifyName1:formatName(more?.notifyPartyName).name2,
      notifyAddress1: formatAddress(more?.notifyPartyAddress,50).addr1,
      notifyAddress2: formatAddress(more?.notifyPartyAddress,50).addr2,
      notifyAddress3: formatAddress(more?.notifyPartyAddress,50).addr3,
      notifyPhone: str(more?.notifyPartyPhoneNumber),
      notifyFax: str(more?.notifyPartyFax),
      namedAccount: str(more?.notifyPartyNamedAccount),
      namedAccountFullName: '',
      notifyCity: str(more?.notifyPartyCity),
      notifyState: str(more?.notifyPartyState),
      notifyCountry: extractCountryCode(more?.notifyPartyCountry),
      notifyTelephone: null,
      notifyZipCode: str(more?.notifyPartyZipCode),
      notifyConact: str(more?.notifyPartyContactName),
      notifyNewName: null,
      notifyNewAddress: null,
      notifyEmail: str(more?.notifyPartyEmail),
      notifyStateName: str(more?.notifyStateName),
      notifyStateId: parseStateId(more?.notifyStateId),
      notifyEoriNumber: str(more?.notifyPartyEoriNumber),
      notifyCombinedDetails: null,
      notifyMpciPartyIdNumber: null,
      customerDetailsFromBooking: true,
    },
    wwaCustomer: str(more?.wwaCustomer),
    rateProfile: null,
    additinoalProfile: null,
    customerAlias: null,
    accurateProfile: str(lclForm?.accuRateProfile) || '',
    trackingCustomer1: strOrNull(more?.trackingCode?.split('-')?.[0]),
    trackingCustomer2: strOrNull(more?.trackingCode?.split('-')?.[1]),
    wwaReference: str(more?.wwaReference),
    billingCompany: str(lclForm?.billingCompany || "01 - SHIPCO TRANSPORT INC"),
    customerEoriNumber: str(lclForm?.customerEoriNumber),
    truckSellRateProfile: str(lclForm?.truckSellRateProfile),
    truckSellNamedAccount: null,
    customerMpciPartyIdNumber: null,
    enableTrackAndPrintUrlToggBtn: false,
  };
}

// ─── actualBuyerSellerBean ──────────────────────────────────────────────────

function buildActualBuyerSellerBean() {
  return {
    actualBuyerName: null, actualBuyerAddress: null, actualBuyerCity: null,
    actualBuyerState: null, actualBuyerZipCode: null, actualBuyerCountry: null,
    actualBuyerEoriNumber: null,
    actualSellerName: null, actualSellerAddress: null, actualSellerCity: null,
    actualSellerState: null, actualSellerZipCode: null, actualSellerCountry: null,
    actualSellerEoriNumber: null,
    declarantName: null, declarantAddress: null, declarantCity: null,
    declarantState: null, declarantZipCode: null, declarantCountry: null,
    declarantEoriNumber: null,
    actualSellerStateId: null, actualBuyerStateId: null,
    actualSellerCountryCode: null, actualBuyerCountryCode: null,
  };
}

// ─── bookingQuoteRoutingBean ────────────────────────────────────────────────

function buildBookingQuoteRoutingBean(r: any, shippingType?: string) {
  const routing = r?.routingFormData || r || {};
  return {
    preCarriageType: str(routing?.preCarriageType) || '-1',
    preCarriageBy: str(routing?.preCarriageBy) || '',
    bookingNo: null,
    bookingQuoteType: null,
    handlingOfficeUnCode: null,
    vesselCode: str(routing?.vesselCode),
    vessel: str(routing?.vesselName),
    voyage: str(routing?.voyage),
    warehouse: strOrNull(routing?.warehouse?.split('-')?.[0]) || '',
    deliveryDate: getFormattedDate(routing?.cargoReadDate || routing?.routingFormData?.cargoReadDate) || "",
    deliveryTime: fmtTime(routing?.cfsCutoffTime || routing?.routingFormData?.cfsCutoffTime),
    deliveryTimeTo: null,
    originCode: str(routing?.placeOfReceiptCode),
    originName: str(routing?.placeOfReceiptName),
    loadCode: str(shippingType === 'L' ? (routing?.portOfLoadingCode) : (routing.loadCode)),
    loadName: str(shippingType === 'L' ? (routing?.portOfLoadingName) : (routing.loadName)),
    dischargeCode: str(shippingType === 'L' ? ( routing?.portOfDischargeCode) : (routing.dischargeCode)),
    dischargeName: str(shippingType === 'L' ? (routing?.portOfDischargeName) : (routing.dischargeName)),
    destinationCode: str(routing?.placeOfDeliveryCode),
    destinationName: str(routing?.placeOfDeliveryName),
    sailDate: getFormattedDate(shippingType === 'L' ? (routing?.portOfLoadingEts) : (routing.loadEts)),
    etdOrigin: getFormattedDate(routing?.placeOfReceiptEtd) || "",
    etaDate: getFormattedDate(shippingType === 'L' ? (routing?.portOfDischargeEta) : (routing.dischargeEta)) || "",
    documentCutoffDate: getFormattedDate(routing?.cfsCutoffDate || routing?.routingFormData?.cfsCutoffDate),
    documentationCutOffTime: fmtTime(routing?.cfsCutoffTime || routing?.routingFormData?.cfsCutoffTime),
    warehouseName: strOrNull(routing?.warehouseName),
    fromRegionCode: null,
    toRegionCode: null,
    viaRegionCode: null,
    originUncode: str(shippingType === 'L' ? (routing?.placeOfReceiptRegion || routing?.placeOfReceiptCode) : (routing?.originUncode)),
    loadUnCode: str(shippingType === 'L' ? (routing?.portOfLoadingRegion || routing?.portOfLoadingCode) : (routing.loadUnCode)),
    dischargeUnCode: str(shippingType === 'L' ? (routing?.portOfDischargeRegion || routing?.portOfDischargeCode) : (routing?.dischargeUnCode)),
    destinationUnCode: str(routing?.destinationCfsRegion || routing?.destinationCfsCode || routing?.destinationUnCode),
    deConsolidationUNCode: str(shippingType === 'L' ? (routing?.deconsolidationCfsRegion || routing?.deconsolidationCfsCode) : (routing.deConsolidationUNCode)),
    finalCFSUNCode: str(routing?.destinationCfsRegion || routing?.destinationCfsCode),
    consolidationCFSUNCode: str(routing?.consolidationCfsRegion || routing?.consolidationCfsCode),
    placeOfDeliveryUnCode: str(shippingType === 'L' ? (routing?.placeOfDeliveryRegion || routing?.placeOfDeliveryCode) : (routing?.placeOfDeliveryUnCode)),
    transshipmentPortUnCode: null,
    originRegionCode: str(routing?.placeOfReceiptRegion),
    loadRegionCode: str(shippingType === 'L' ? (routing?.portOfLoadingRegion) : (routing.loadRegion)),
    dischargeRegionCode: str(shippingType === 'L' ? (routing?.portOfDischargeRegion) : (routing.dischargeRegion)),
    destinationRegionCode: str(shippingType === 'L' ? (routing?.destinationCfsRegion) : (routing.placeOfDeliveryRegion)),
    deconsolidationRegionCode: str(shippingType === 'L' ? (routing?.deconsolidationCfsRegion) : (routing?.rampRegion)),
    finalCFSRegionCode: str(routing?.destinationCfsRegion),
    wwaScheudle: false,
    etaDestination: getFormattedDate(routing?.placeOfDeliveryEta),
    warehouseAddress1: null,
    warehouseAddress2: null,
    warehouseAddress3: null,
    warehouseState: null,
    warehouseZipcode: null,
    warehousePhone: null,
    warehouseContact: null,
    warehouseDeliveryRef: str(routing?.deliveryReference || routing?.routingFormData?.deliveryReference) || '',
    documentDeliveryCode: str(routing?.docDelivery || routing?.routingFormData?.docDelivery) || '',
    documentDeliveryName: '',
    documentDeliveryAddress1: '',
    documentDeliveryAddress2: '',
    documentDeliveryAddress3: '',
    documentDeliveryContact: str(routing?.docContact || routing?.routingFormData?.docContact) || '',
    locationInformation: str(routing.locationInformationPublic) || '',
    privateLocationInformation: str(routing.locationInformationPrivate) || '',
    deConsolidationCode: str(shippingType === 'L' ? (routing?.deconsolidationCfsCode) : (routing?.rampCode)),
    deConsolidationName: str(shippingType === 'L' ? (routing?.deconsolidationCfsName) : (routing?.rampName)),
    deConsolidationDate: getFormattedDate(shippingType === 'L' ? (routing?.deconsolidationCfsEta) : (routing?.rampEta)),
    finalCFSCode: str(routing?.destinationCfsCode),
    finalCFSName: str(routing?.destinationCfsName),
    finalCFSDate: getFormattedDate(routing?.destinationCfsEta),
    oldOriginCode: null,
    oldLoadName: null,
    consolidationCFSCode: str(routing?.consolidationCfsCode),
    consolidationCFSName: str(routing?.consolidationCfsName),
    consolidationCFSDate: getFormattedDate(routing?.consolidationCfsEtd),
    consolidationCFSRegionCode: str(routing?.consolidationCfsRegion),
    originalVesselCode: null,
    originalVesselName: null,
    originalVoyage: null,
    originalEts: null,
    outportWarehouseCode: null,
    outportWarehouseName: null,
    placeOfReceiptOrgEtdDate: null,
    placeOfReceiptActualAtdDate: null,
    consolidationCfsOrgEtdDate: null,
    consolidationCfsActualAtdDate: null,
    portOfLoadingOrgEtsDate: getFormattedDate(routing?.loadEts) || null,
    portOfLoadingActualAtsDate: null,
    portOfDischargeOrgEtaDate: null,
    portOfDischargeActualAtaDate: null,
    deconsolidationCfsOrgEtaDate: null,
    deconsolidationCfsActualAtaDate: null,
    destinationCfsOrgEtaDate: null,
    destinationCfsActualAtaDate: null,
    placeOfDeliveryOrgEtaDate: null,
    placeOfDeliveryActualAtaDate: null,
    oldWarehouse: null,
    carrierBLCutoffDate: null,
    carrierBLCutOffTime: null,
    autoTitleCutoffDate: null,
    autoTitleCutOffTime: null,
    aesITNCutoffDate: null,
    aesITNCutOffTime: null,
    onCarriageType: null,
    onCarriageBy: null,
    carrierPlaceOfReceiptCode: null,
    carrierPlaceOfReceitName: null,
    carrierPlaceOfReceiptDate: null,
    carrierPlaceOfReceiptRegion: null,
    vgmCutoffDate: null,
    vgmCutOffTime: null,
    dischargCodeCountry: null,
    placeOfDelieveryCodeCountry: null,
    loadCodeCountry: null,
    finalCFSCodeCountry: null,
    manufactureName: null,
    customsDeclaration: '',
    customsContact: null,
    customsCutoffDate: getFormattedDate(routing?.docCutoffDate || routing?.routingFormData?.docCutoffDate),
    customsCutoffTime: fmtTime(routing?.docCutoffTime || routing?.routingFormData?.docCutoffTime),
    carrierPlaceOfDeliveryCode: null,
    carrierPlaceOfDeliveryName: null,
    carrierPlaceOfDeliveryDate: null,
    carrierPlaceOfDeliveryRegion: null,
    carrierCode: str(routing?.carrierCode).split(' - ')[0].trim(),
    terms: strOrNull(routing?.termsCode || routing?.routingFormData?.termsCode),
    termName: shippingType === 'L' ? strOrNull(routing?.termsLabel || routing?.routingFormData?.termsLabel) : null,
    transitDays: null,
    validUntil: null,
    clauses: null,
    cargoValue: null,
    notes: null,
    quoteNumber: 0,
    rowId: null,
    rowNumber: 0,
    notes2: null,
    notes3: null,
    notes4: null,
    notes5: null,
    carriers: null,
    bookingQuoteChargeBeanList: [],
    ratingType: null,
    deliveryAppointmentDateFrom: null,
    deliveryAppointmentDateTo: null,
    deliveryAppointmentTimeFrom: null,
    deliveryAppointmentTimeTo: null,
    warehouseLatitude: '40.66522',
    warehouseLongitude: '-74.17187',
    warehouseAddressForLatLong: null,
    manufacturerDetailBeans: (routing?.manufacturerNames || routing?.routingFormData?.manufacturerNames || []).map((m: any) => ({
      manufacturerName: str(m.name),
    })),
    oldVesselCode: '',
    oldVesselName: '',
    oldVoyage: '',
    cfsContactNameChinese: null,
    cfsContactNameEnglish: null,
    cfsContactPhone: null,
    oldIncoTerms: null,
    incoTerms: null,
    placeOfReceiptName1: str(routing?.placeOfReceiptPickupFrom),
    placeOfReceiptName2: str(routing?.placeOfReceiptPickupFromName),
    placeOfReceiptName3: str(routing?.placeOfReceiptPickupTo),
    placeOfReceiptName4: str(routing?.placeOfReceiptPickupToName),
    placeOfDeliveryName1: str(routing?.placeOfDeliveryName),
    placeOfDeliveryName2Selection: str(routing?.placeOfDeliveryType),
    preCarriageETS: getFormattedDate(routing?.preCarriageEts),
    transitTime: strOrNull(routing?.transitTime),
    carrierList: null,
    frequency: str(routing?.frequency || ''),
    isPrintSailingScheduleInConfirmationDocument: 'Y',
    gatewayCutoffDate: getFormattedDate(routing?.gatewayCutoffDate),
    gatewayCutoffTime: fmtTime(routing?.gatewayCutoffTime),
    portToPortCo2Emission: null,
    manufacturerDetailBean: {
      referenceType: null,
      referenceNumber: null,
      totalAddedManufacturerNameList: (routing?.manufacturerNames || routing?.routingFormData?.manufacturerNames || []).map((m: any) => ({
        name: str(m.name),
      })),
      newlyAddedManufacturerNameList: [],
      removedManufacturerNameList: [],
      updatedManufacturerNameMapList: [],
      previousManufacturerNameList: [],
      previousManufacturerNameMap: {},
    },
  };
}

// ─── bookingQuoteCargoBean ──────────────────────────────────────────────────

export function buildBookingQuoteCargoBean(c: any, moduleType: string, shippingType?: string) {
  const cargoRows = c?.cargoRows || c?.cargoState?.cargoRows || [];
  const firstRow = cargoRows[0] || {};
  const flags = c?.flags || c?.flagState?.flags || {};
  const instructions = c?.instructionState || c || {};
  const lotRows = c?.allLotRows || c?.lotRows || c?.lotState?.lotRows || [];

  return {
    container1: num(firstRow.numberOfContainer1), containerSize1: str(firstRow.containerType1).split("-")[0] || '', containerType1: str(firstRow.containerType1).split("-")[1] || '',
    container2: num(firstRow.numberOfContainer2), containerSize2: str(firstRow.containerType2).split("-")[0] || '', containerType2: str(firstRow.containerType2).split("-")[1] || '',
    container3: num(firstRow.numberOfContainer3), containerSize3: str(firstRow.containerType3).split("-")[0] || '', containerType3: str(firstRow.containerType3).split("-")[1] || '',
    commodity1: formatAddress(firstRow.descriptionOfGoods, 35).addr1,
    commodity2: formatAddress(firstRow.descriptionOfGoods, 35).addr2,
    commodity3: formatAddress(firstRow.descriptionOfGoods, 35).addr3,
    commodity4: formatAddress(firstRow.descriptionOfGoods, 35).addr4,
    commodity5: formatAddress(firstRow.descriptionOfGoods, 35).addr5,
    weight: num(firstRow.kg),
    cube: num(firstRow.cbm),
    weightLbs: num(firstRow.lbs),
    cubeCbf: num(firstRow.cbf),
    hazardousCode: str(firstRow.hazardous) === 'Please Select' ? '-1' : str(firstRow.hazardous).startsWith('Y') ? 'Y' : str(firstRow.hazardous).startsWith('N') ? 'N': str(firstRow.hazardous),
    numberOfPieces: num(firstRow.pieces),
    uom: str(firstRow.uom),
    marks: str(firstRow.marks),
    actualPieces: num(firstRow.pieces),
    packaging: str(firstRow.packaging),
    genAesFilingBean: {
      referenceNumber: '0', scacCode: null, itnNumber: null, filingType: null,
      type: moduleType, description: null, rowid: null, controlFlag: 'N',
      inputUser: "pnqpb_nyc",
      updateUser: null, oldUcrNumber: null,
      mrnNumber: null, oldMrnNumber: null, filingBy: null,
    },
    documentReferences: str(firstRow.docRef),
    bookingCustomerDeclaredCargoBeanList: shippingType === 'L' ? (c?.customsRows || c?.customsState?.customsRows || []).map((row: any, rowIdx: number) => ({
      commodity1: str(row.description),
      weight: num(row.kg),
      cube: num(row.cbm),
      weightLbs: num(row.lbs),
      cubeCbf: num(row.cbf),
      hazardousCode: str(row.hazardous) === 'Please Select' ? '-1' : str(row.hazardous).startsWith('Y') ? 'Y' : str(row.hazardous).startsWith('N') ? 'N': str(row.hazardous),
      numberOfPieces: num(row.pieces),
      uom: str(row.uom),
      marks: str(row.marks),
      packaging: str(row.packaging),
      recordSequence: rowIdx + 1,
      cargoDimensionBeanList: (row.dimRows || []).map((d: any) => ({
        length: num(d.length),
        width: num(d.width),
        height: num(d.height),
        unit: str(d.unit).charAt(0),
        pieces: num(d.pieces),
        cbm: num(d.cbm),
        cbf: num(d.cbf),
        kg: num(d.kg),
        lbs: num(d.lbs),
      })),
      bookingMultiCargoHazardousList: (row.hazRows || []).map((h: any, idx: number) => ({
        shipperName1: str(h.shipperName1),
        techName1: str(h.technicalName),
        noOfpieces: num(h.pieces),
        packaging: str(h.packaging),
        weight: num(h.weight),
        imcoClass: str(h.imoClass),
        unNumber: str(h.unNumber),
        imoPage: str(h.imoPage),
      })),
    })) : [],
    bookingCustomerDeclaredHazardousBeanList: null,
    bookingAdditionalCargoInfoHazardousBeanList: null,
    recordSequence: 0,
    status: 0,
    bookingNumber: null,
    customerDeclaredId: null,
    commodity: null,
    controlFlag: '\u0000',
    cargoDimensionBeanList: shippingType === 'L' ? (firstRow.dimRows || []).map((d: any) => ({
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
      tmsClass: num(d.cls),
      stackable: str(d.stackable).charAt(0) || 'Y',
      shipmentType: str(d.shipmentType === 'FTL' ? 'F' : 'L') || 'L',
      StackingType: str(d.stackingType) || '-1',
    })) : [],
    lotComments: null,
    lotCommentsDesc: null,
    oldLotCommentDesc: '',
    lotCommentsValue: str(instructions.internalComment),
    oldLotCommentsValue: str(c?.oldInternalComment ?? ''),
    externalLotComments: shippingType === 'L' ? (() => {
      const activeOnly = lotRows.filter((l: any) => l.controlFlag !== 'D');
      if (activeOnly.length > 0 &&
        activeOnly[0].controlFlag === 'N' &&
        activeOnly[0].details === '' &&
        activeOnly[0].type === '-1') {
        return [];
      }
      return lotRows
        .filter((l: any) => l.controlFlag !== undefined || l.commentId != null)
        .map((l: any) => ({
          commentId: l.commentId ?? null,
          module: moduleType,
          reference: null,
          code: str(l.type),
          name: str(l.type),
          value: str(l.details),
          description: `${str(l.type)}-${str(l.details)}`,
          inputUserName: null,
          inputDate: null,
          updateUserName: null,
          updateDate: null,
          transactionFlagStatus: l.controlFlag === 'D'
            ? 'D'
            : l.commentId != null
              ? (str(l.type) !== str(l._origType) || str(l.details) !== str(l._origDetails) ? 'U' : null)
              : 'N',
          oldCode: l._origType != null ? str(l._origType) : null,
          oldName: l._origType != null ? str(l._origType) : null,
          oldValue: l._origDetails != null ? str(l._origDetails) : null,
          oldDescription: l._origType != null && l._origDetails != null
            ? `${str(l._origType)}-${str(l._origDetails)}`
            : null,
          fromQuote: true,
        }));
    })() : [],
    commodityDescription6: '', commodityDescription7: '', commodityDescription8: '',
    commodityDescription9: '', commodityDescription10: '', commodityDescription11: '',
    commodityDescription12: '',
    stackable: flags.nonStackable ? 'N' : 'Y',
    tmsShipmentType: 'LTL',
    trailerType: null,
    sensitiveCargo: firstRow.sensitiveCargo ? 'Y' : 'N',
    loadingInstruction: str(instructions.loadingInstruction),
    warehouseInstruction: str(instructions.warehouseInstruction),
    hsCode: str(firstRow.hsCode),
    descriptionOfGood: str(firstRow.description),
    oogCode: null,
    refeerCode: null,
    socCode: null,
    noOfContainers: null,
    containerType: null,
    cargoAdditionalInfoId: null,
    temprature: null,
    length: null, height: null, width: null, unit: null,
    airFlow: null, relativeHumidity: null, ventSetting: null,
    dehumificationCode: null, genSetCode: null, tempratureInstruction: null,
    containerTypeAndSize: null, containerSize: null,
    totalKg: num(firstRow.kg), totalLbs: num(firstRow.lbs),
    totalCbm: num(firstRow.cbm), totalCbf: num(firstRow.cbf),
    hazardouValue:  firstRow.hazardous === 'Please Select' ? '-1' : firstRow.hazardous?.startsWith('Y') ? 'Y' : firstRow.hazardous?.startsWith('N') ? 'N' : firstRow.hazardous,
    requiredContainerType: (() => {
      if (flags.fortyContainer) return '40';
      if (flags.fortyFiveContainer) return '45';
      if (flags.fiftyThreeTrailer) return '53';
      return null;
    })(),
    customsNumber: null,
    cargoInsurence: 'Y',
    assuredParty: '',
    commercialValue: '',
    bookingMultiCargoHazardousList: shippingType === 'L' ? (firstRow.hazRows || []).map((h: any, idx: number) => ({
      rowId: h.rowId ?? "", referenceNumber: 0,
      shipperName1: str(h.shipperName1), shipperName2: str(h.shipperName2),
      properShippingName: str(h.properShippingName), shippingName: str(h.shippingName),
      techName1: str(h.technicalName), techName2: null,
      noOfpieces: num(h.pieces), packaging: str(h.packaging === "Please Select" ? "-1" : h.packaging),
      weight: num(h.weight), imcoClass: str(h.imoClass),
      unNumber: str(h.unNumber), imcoPage: str(h.imoPage),
      flashPointCelsius: num(h.flashpointC), flashpointFahrenheit: num(h.flashpointF),
      degrees: str(h.degreeUnit),
      packagingGroup: str(h.pkgGroup === "Please Select" ? "-1" : h.pkgGroup),
      plackard1: str(h.placard1), plackard2: str(h.placard2),
      emergencyPhone: str(h.emergencyNumber), emergencyCotact: str(h.emergencyContact),
      hazardousCode: str(h.imoClass),
      hazarDousCount: 0, quantity: (str(h.quantity)).slice(0,  1), controlFlag:h.rowId != ""? "U" :'N'  ,
      inputUpdateUser: 'pnqpb_nyc', recordNumber: idx + 1, quoteCargoHazardousId: 0,
      imoSubClass: str(h.imoSubclass), customerDeclaredCargoId: null,
      bookingNumber: null, customerDeclaredHazardouId: '',
      customerDeclaredHazardousTransactionFlag: 'N', pickupId: null,
      commodity: null,
    })): [],
    multiCargoDetailId: null,
    nonStackable: flags.nonStackable,
    multiCargoDimFlag: null,
    cargoHsCode: str(firstRow.hsCode),
    maxContainerSize: null,
    overLength: flags.overLength,
    dimension: flags.printDimension,
    instructions: true,
    overWeight: flags.overWeight,
  };
}

export function buildBookingQuoteMultiCargoBeanList(c: any) {
  const cargoRows = c?.cargoRows || c?.cargoState?.cargoRows || [];
  const flags = c?.flags || c?.flagState?.flags || {};

  return cargoRows.map((row: any, rowIdx: number) => ({
    container1: 0, containerSize1: null, containerType1: null,
    container2: 0, containerSize2: null, containerType2: null,
    container3: 0, containerSize3: null, containerType3: null,
    commodity1: str(row.description),
    commodity2: '',
    commodity3: '',
    commodity4: '',
    commodity5: '',
    weight: num(row.kg),
    cube: num(row.cbm),
    weightLbs: num(row.lbs),
    cubeCbf: num(row.cbf),
    hazardousCode: str(row.hazardous) === 'Please Select' ? '-1' : str(row.hazardous).startsWith('Y') ? 'Y' : str(row.hazardous).startsWith('N') ? 'N': str(row.hazardous),
    numberOfPieces: num(row.pieces),
    uom: str(row.uom),
    marks: str(row.marks),
    actualPieces: num(row.pieces),
    packaging: str(row.packaging),
    genAesFilingBean: {
      referenceNumber: null, scacCode: null, itnNumber: null, filingType: null,
      type: null, description: null, rowid: null, controlFlag: 'N',
      inputUser: null, updateUser: null, oldUcrNumber: null,
      mrnNumber: null, oldMrnNumber: null, filingBy: null,
    },
    documentReferences: str(row.docRef),
    bookingCustomerDeclaredHazardousBeanList: null,
    bookingAdditionalCargoInfoHazardousBeanList: null,
    recordSequence: rowIdx + 1,
    status: 0,
    bookingNumber: null,
    customerDeclaredId: null,
    commodity: null,
    controlFlag: '\u0000',
    cargoDimensionBeanList: (row.dimRows || []).map((d: any) => ({
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
      tmsClass: num(d.cls),
      stackable: str(d.stackable).charAt(0) || 'Y',
      shipmentType: str(d.shipmentType === 'FTL' ? 'F' : 'L') || 'L',
      StackingType: str(d.stackingType) || '-1',
    })),
    lotComments: null,
    lotCommentsDesc: null,
    oldLotCommentDesc: '',
    lotCommentsValue: str(c?.internalComment),
    oldLotCommentsValue: null,
    externalLotComments: [],
    commodityDescription6: null,
    commodityDescription7: null,
    commodityDescription8: null,
    commodityDescription9: null,
    commodityDescription10: null,
    commodityDescription11: null,
    commodityDescription12: null,
    stackable: flags.nonStackable ? 'N' : 'Y',
    tmsShipmentType: 'LTL',
    trailerType: null,
    sensitiveCargo: row.sensitiveCargo ? 'Y' : 'N',
    loadingInstruction: null,
    warehouseInstruction: null,
    hsCode: str(row.hsCode),
    descriptionOfGood: str(row.description),
    oogCode: null,
    refeerCode: null,
    socCode: null,
    noOfContainers: null,
    containerType: null,
    cargoAdditionalInfoId: null,
    temprature: null,
    length: null, height: null, width: null, unit: null,
    airFlow: null, relativeHumidity: null, ventSetting: null,
    dehumificationCode: null, genSetCode: null, tempratureInstruction: null,
    containerTypeAndSize: null, containerSize: null,
    totalKg: num(row.kg), totalLbs: num(row.lbs),
    totalCbm: num(row.cbm), totalCbf: num(row.cbf),
    hazardouValue: row.hazardous === 'Please Select' ? '-1' : row.hazardous?.startsWith('Y') ? 'Y' : row.hazardous?.startsWith('N') ? 'N' : row.hazardous,
    requiredContainerType: null,
    customsNumber: null,
    cargoInsurence: null,
    assuredParty: null,
    commercialValue: null,
    bookingMultiCargoHazardousList: (row.hazRows || []).map((h: any, idx: number) => ({
      rowId: h.rowId ?? "", referenceNumber: 0, shipperName1: str(h.shipperName1), shipperName2: str(h.shipperName2),
      techName1: str(h.technicalName), techName2: null, noOfpieces: num(h.pieces), packaging: str(h.packaging),
      weight: num(h.weight), imcoClass: str(h.imoClass), unNumber: str(h.unNumber), imcoPage: str(h.imoPage),
      flashPointCelsius: num(h.flashpointC), flashpointFahrenheit: num(h.flashpointF), degrees: str(h.degreeUnit),
      packagingGroup: str(h.pkgGroup === "Please Select" ?  "-1" : h.pkgGroup), plackard1: str(h.placard1), plackard2: str(h.placard2),
      emergencyPhone: str(h.emergencyNumber), emergencyCotact: str(h.emergencyContact), hazardousCode: str(h.imoClass),
      hazarDousCount: 0, quantity: (str(h.quantity) === "please select" ?  "-1" :str(h.quantity).slice(0,  1)), controlFlag: h.rowId != ""? "U" :'N',
      inputUpdateUser: 'pnqpb_nyc', recordNumber: idx + 1, quoteCargoHazardousId: 0,
      imoSubClass: str(h.imoSubclass), customerDeclaredCargoId: null,
      bookingNumber: null, customerDeclaredHazardouId: '',
      customerDeclaredHazardousTransactionFlag: 'N', pickupId: null,
      commodity: null,
    })),
    multiCargoDetailId: null,
    nonStackable: flags.nonStackable,
    multiCargoDimFlag: null,
    cargoHsCode: str(row.hsCode),
    maxContainerSize: null,
    overLength: flags.overLength,
    dimension: flags.printDimension,
    instructions: false,
    overWeight: flags.overWeight,
  }));
}

function buildMultiCargoBookingQuoteNoteBeans(c: any) {
  const cargoRows = c?.cargoRows || c?.cargoState?.cargoRows || [];

  return cargoRows
    .map((row: any, idx: number) => ({ row, idx }))
    // .filter(({ row }: { row: any }) => {
    //   if (row.controlFlag === 'D') return true;
    //   if (row.controlFlag === 'N') {
    //     return !!(
    //       num(row.pieces) || num(row.kg) || num(row.lbs) || num(row.cbm) || num(row.cbf) ||
    //       str(row.marks).trim() || str(row.description).trim()
    //     );
    //   }
    //   return false;
    // })
    .map(({ row, idx }: { row: any; idx: number }) => {
      const hazRows = row.hazRows || [];
      let hazString = '';
      const haz = str(row.hazardous);
      const isHazardousSelected = haz === 'Y' || haz.startsWith('Y') || haz === 'L' || haz === 'E';
      if (isHazardousSelected && hazRows.length > 0) {
        hazString = '<b>Hazardous Details:</b><br/>';
        hazRows.forEach((h: any) => {
          hazString += `Proper Shipping Name: ${h.properShippingName}<br/>HAZ: ${h.quantity}, Haz Class: ${h.imoClass}, Sub Risk: ${h.imoSubclass}, UN No.: ${h.unNumber}, Flash Point: ${h.flashpointC}, Pkg Group: ${h.pkgGroup}, Commodity: ${h.Commodity}<br/>`;
        });
      }

      const dimRows = row.dimRows || [];
      let dimString = '';
      if (dimRows.length > 0) {
        dimString = dimRows.map((d: any) => `${d.pieces} @ ${d.length}x${d.width}x${d.height} ${str(d.unit).charAt(0)}`).join(', ');
      }

      return {
        added: row.controlFlag !== 'D',
        title: null,
        pieces: str(row.pieces),
        weight: str(row.kg),
        cube: str(row.cbm),
        weightLbs: str(row.lbs),
        cubeCbf: str(row.cbf),
        marksAndNumbers: str(row.marks),
        goodsAndDescriptions: str(row.description),
        dimensions: dimString,
        haz: hazString,
        cargoHsCode: str(row.hsCode),
        cargoLineSeq: idx + 1,
        containerSelected: false,
        overLimitCargoDims: false,
        volumeExceeded: false,
        contUnSelected: false,
        modifiedCargo: false,
      };
    });
}

// ─── bookingEquipmentBean ───────────────────────────────────────────────────

function buildBookingEquipmentBean() {
  return {
    pickupContainerCode: null, pickupContainerName: null,
    pickupContainerAddress1: null, pickupContainerAddress2: null, pickupContainerAddress3: null,
    pickupContainerState: null, pickupContainerZipcode: null,
    pickupContainerPhone: null, pickupContainerDate: null,
    pickupContainerTime: null, pickupContainerTimeTo: null,
    pickupChassisCode: null, pickupChassisName: null,
    pickupChassisAddress1: null, pickupChassisAddress2: null, pickupChassisAddress3: null,
    pickupChassisState: null, pickupChassisZipcode: null,
    pickupChassisPhone: null, pickupChassisDate: null,
    pickupChassisTime: null, pickupChassisTimeTo: null,
    returnChassisCode: null, returnChassisName: null,
    returnChassisAddress1: null, returnChassisAddress2: null, returnChassisAddress3: null,
    returnChassisState: null, returnChassisZipCode: null,
    returnChassisPhone: null, returnChassisDate: null,
    returnChassisTime: null, returnChassisTimeTo: null,
    latestReturnDate: null, latestReturnToTime: null, latestReturnFromTime: null,
  };
}

// ─── shipmentStatusUpdateBean ───────────────────────────────────────────────

function buildShipmentStatusUpdateBean(customer?: any) {
  const defaultForm = customer?.defaultForm ?? {};
  return {
    shipmentId: null, objectCode: null, referenceNumber: null,
    shipmentType: null, clausesText: null,
    userSchemaId: 0, officeId: 0,
    eventList: [],
    relatedType: [null], relatedRerefence: [null],
    deletedType: [null], deletedReference: [null],
    notesShownOnCodes: null, documentHistoryId: 0,
    statusLocationUncode: null, bookingNo: null,
    alias: null, stmt_cycle: null,
    addNoteToggleButton: null, addNoteStmtCycleButton: null,
    etsDate: null, publicPrivateType: null, cobProcess: false,
  };
}

// const RELAY_FLAG_TO_CODE: Record<string, string> = {
//   U: 'U', A: 'A', G: 'G', T: 'T',
//   C: 'C', I: 'I', D: 'D',
// };

// ─── mainBookingQuoteBean (the outer wrapper) ───────────────────────────────

function mapChargeBeanRowToApi(row: any, idx: number) {
  return {
    bookingQuoteNumber: 0,
    recordNumber: idx,
    chargeCode: str(row.incomeChargeDetails?.chargeCode),
    comp: 0,
    tariffNumber: 0,
    commodityNumber: null,
    tariffSequence: 0,
    uom: 'M',
    sellRate: num(row.incomeRate),
    sellBasis: str(row.incomeBasis),
    sellAmount: num(row.incomeAmount),
    buyRate: num(row.expenseRate),
    buyBasis: str(row.expenseBasis),
    buyAmount: num(row.expenseAmount),
    comments: null,
    sellCurrency: str(row.incomeCurrency) || 'USD',
    prepaidCreditFlag: null,
    rateOfExchange: num(row.incomeROE) || 1,
    localAmount: num(row.incomeLocalAmount),
    relayFlag: str(row.relayFlag),
    company: '01',
    dueAccount: null,
    rateClass: null,
    vendor: strOrNull(row.vendor),
    originalAmount: null,
    truckingChargeLinkId: num(row.truckingChargeLinkId),
    chargeDescription: str(row.incomeChargeDetails?.chargeDescription) || '',
    localeChargeDescription: null,
    rowId: strOrNull(row.rowId),
    controlFlag: str(row.transactionalFlag) || 'N',
    type: null,
    bookingQuoteRateId: num(row.bookingRateId),
    equipmentDetail: strOrNull(row.equipmentDetails),
    dirty: false,
    expense: (row.expenseAmount != null && row.expenseAmount !== 0) ? String(row.expenseAmount) : null,
    code: null,
    applyVat: str(row.incomeVAT) === 'Y' ? 'Y' : 'N',
    description: null,
    oldInvoiceNumber: null,
    oldVendor: null,
    localCurrency: null,
    originDestination: str(row.originDestination) || 'O',
    payType: str(row.prepaidCollect) || '\u0000',
    exchangeRate: null,
    currency: null,
    bookingPrepaid: 0,
    bookingCollect: 0,
    rate: null,
    invoiceDate: strOrNull(row.invoiceDate),
    invoiceNumber: strOrNull(row.invoiceNumber),
    chargeType: str(row.incomeChargeDetails?.chargeType) || 'OFR',
    oldCharge: null,
    oldCurrency: null,
    oldBasis: str(row.incomeOldBasis),
    checkAgainstBasis: null,
    expenseCurrency: str(row.expenseCurrency) || 'USD',
    expenseRateOfExchange: num(row.expenseROE) || 1,
    expenseLocalAmount: num(row.expenseLocalAmount),
    expenseVat: str(row.expenseVAT) === 'Y' ? 1 : 0,
    expenseVendorReference: strOrNull(row.vendorReference),
    expenseOldBasis: strOrNull(row.expenseOldBasis),
    printOndocument: row.isPrintOnDocument ? 'Y' : 'N',
    oldBookingQuoteChargeBean: null,
    taxPercent: '0',
    taxCode: strOrNull(row.taxCode),
    taxText: strOrNull(row.taxText),
    applyFor: strOrNull(row.applyFor),
    glCode: strOrNull(row.glCode),
    maximum: row.incomeMaximumRate ?? null,
    expenseMaximum: row.expenseMaximumRate ?? null,
    expenseMinimum: row.expenseMinimumRate ?? null,
    minimum: row.incomeMinimumRate ?? null,
    overridden: row.overridden ?? false,
    invoiceCurrency: strOrNull(row.invoiceCurrency),
    invoiceExchangeRate: num(row.invoiceCurrencyROE),
    invoiceSellRateOfExchange: num(row.invoiceSellRateOfExchange),
    invoiceExpenseRateOfExchange: num(row.invoiceExpenseRateOfExchange),
    invoiceSellAmount: num(row.invoiceSellAmount),
    invoiceExpenseAmount: num(row.invoiceExpenseAmount),
    invToLocalCurrencyExchangeRate: num(row.invToLocalCurrencyROE) || 1,
    userDefineChargeDescription: str(row.userDefineChargeDescription),
    spotRateDetailsId: strOrNull(row.spotRateDetailsId),
    spotRateKey: str(row.spotRateKey),
    spotRateFlag: num(row.spotRateFlag),
    accurateSpotRateKey: str(row.accurateSpotRateKey),
    sprKey: strOrNull(row.sprKey),
    rateCompanyId: num(row.rateCompanyId),
    fmcChargeType: strOrNull(row.fmcChargeType),
    rowNumber: 0,
    aspect: strOrNull(row.aspect),
    isFmcChargeUpdated: null,
    isCallFromAccurate: row.isCallFromAccurate ?? null,
    taxAmount: row.taxAmount ?? null,
    taxLocalAmount: row.taxLocalAmount ?? null,
    truckerRateExpired: strOrNull(row.truckerRateExpired),
    truckChargeGroup: strOrNull(row.truckChargeGroup),
    truckCity: strOrNull(row.truckCity),
    truckZipCountry: strOrNull(row.truckZipCountry),
    truckChargeNotes: strOrNull(row.truckChargeNotes),
    truckerName: strOrNull(row.truckerName),
    truckRateId: num(row.truckRateId),
    cfsName: strOrNull(row.cfsName),
    pickupId: str(row.pickupId),
    doorCountry: strOrNull(row.doorCountry),
    euVatRuleId: num(row.euVatRuleId),
    truckRate: row.truckRate ?? { header: null, charges: null },
    truckRateDetailsFileId: num(row.truckRateDetailsFileId),
    vatPercentage: null,
    chargeAspectOFR: false,
    chargeRest: row.isChargeRest ?? false,
    taxKey: strOrNull(row.taxKey),
    linked: row.isLinkedWithPhoenix ?? true,
    focusSet: row.isFocusSet ?? false,
    vatAmount: num(row.vatAmount),
    rateReset: false,
    oldRate: row.isOldRate ?? false,
    rateResetByQuote: false,
  };
}

function resolveChargeFlags(row: any): any {
  const isAccurate = str(row.relayFlag) === 'A';
  if (isAccurate) {
    const spotRateFlag = num(row.spotRateFlag) === 2 ? 2 : 1;
    return { ...row, relayFlag: 'A', spotRateFlag };
  }
  return { ...row, relayFlag: 'U', spotRateFlag: 0 };
}

function buildBookingQuoteChargeBeanList(rate?: any, isNewEntry = false) {
  
  const asInsert = (r: any) => ({ ...r, controlFlag: 'N', rowId: null });

  // 1. Frontend BookingQuoteChargeBeanFull rows (from charges.rateDetails)
  const frontendRows = rate?.charges?.rateDetails;
  if (Array.isArray(frontendRows) && frontendRows.length > 0) {
    // Check if these are already in API format (have chargeCode at top level)
    if (frontendRows[0].chargeCode != null) {
      const activeRows = isNewEntry ? frontendRows.map(asInsert) : frontendRows;
      const activeRowIds = new Set(activeRows.map((r: any) => r.rowId).filter(Boolean));
      const deletedMapped = (rate?.charges?.deletedRateDetails ?? [])
        .filter((r: any) => !r.isVatBean && r.chargeCode != null && !activeRowIds.has(r.rowId))
        .map((r: any) => ({ ...r, controlFlag: 'D' }));
      return [...activeRows, ...deletedMapped];
    }
    // Otherwise map from frontend format to API format
    const activeRows = frontendRows
      .filter((r: any) => r.incomeChargeDetails.chargeCode &&r.incomeChargeDetails.chargeCode != '' && r.incomeChargeDetails.chargeDescription && r.incomeChargeDetails.chargeDescription !== '')
      .filter((r: any) => !r.isVatBean)
      .map((row: any, idx: number) => {
        const mapped = mapChargeBeanRowToApi(resolveChargeFlags(row), idx);
        return isNewEntry ? asInsert(mapped) : mapped;
      });
    const activeBookingRateIds = new Set(
      frontendRows
        .filter((r: any) => r.bookingRateId?.trim())
        .map((r: any) => r.bookingRateId.trim())
    );
    const deletedMapped = (rate?.charges?.deletedRateDetails ?? [])
      .filter((r: any) => !r.isVatBean && !activeBookingRateIds.has(r.bookingRateId?.trim()))
      .map((row: any, idx: number) => ({
        ...mapChargeBeanRowToApi(resolveChargeFlags(row), idx),
        controlFlag: 'D',
      }));
    return [...activeRows, ...deletedMapped];
  }
  // 2. Already in API format
  if (Array.isArray(rate?.bookingQuoteChargeBeanList) && rate.bookingQuoteChargeBeanList.length > 0) {
    return isNewEntry ? rate.bookingQuoteChargeBeanList.map(asInsert) : rate.bookingQuoteChargeBeanList;
  }
  
  return [];
}

function buildPickupDetailBean(r: any, isNew = true, refNum?: any, fclTruckingDetails?: any, loginBean?: any, isVisible?: (key: ToggleKey) => boolean, mainDetails?: any) {
  const pickup = Object.values(r?.pickupForms || {})[0] as any;
  const trucker = Object.values(r?.pickupTruckerForms || {})[0] as any;
  const main = r?.routingFormData || {};
  const fclPickupDetails = truckingDetails(fclTruckingDetails.pickupAtCargoDetails);
  const fclTruckerDetails = truckingDetails(fclTruckingDetails.truckerCodeDetails);

  return {
    pickupAtCargoCode: str(mainDetails?.type === 'L' ? (pickup?.pickupCargoAtCode) : (str(fclTruckingDetails.pickupAtCargoCode))),
    pickupAtCargoName: str( mainDetails?.type === 'L' ? (pickup?.name) : (fclPickupDetails[0])) || '',
    pickupAtCargoName1: null,
    pickupAtCargoAddress1: str( mainDetails?.type === 'L' ? (pickup?.streetAddress) : str(fclPickupDetails[1])) || '',
    pickupAtCargoAddress2: str(fclTruckingDetails.pickupAtCargoAddress2) || str(fclPickupDetails[2]) || '',
    pickupAtCargoAddress3: str(pickup?.city) || str(fclPickupDetails[3]) || '',
    pickupAtCargoAddress4: '',
    pickerContact: str( mainDetails?.type === 'L' ? (pickup?.contactName1) : (isVisible(CommonToggleKeys.OCN_FCL_BOOKING_RESTRUCTURING) ? fclTruckingDetails?.pickerContact : str(fclPickupDetails[4])))  || '', // fclTruckingDetails?.locationContactName 
    pickerPhone: str(mainDetails?.type === 'L' ? (pickup?.contactPhone1) : (isVisible(CommonToggleKeys.OCN_FCL_BOOKING_RESTRUCTURING) ? fclTruckingDetails?.pickerPhone :str(fclPickupDetails[5]))) || '',
    pickerFax: str(fclPickupDetails[6]) || '',
    pickupState: extractCountryCode(str(mainDetails?.type === 'L' ? pickup?.state : '')),
    pickupZipCode: str(mainDetails?.type === 'L' ? pickup?.zipCode : ''),
    pickupEmail: str(mainDetails?.type === 'L' ? (pickup?.contactEmail1) : (isVisible(CommonToggleKeys.OCN_FCL_BOOKING_RESTRUCTURING) && fclTruckingDetails?.pickupEmail)) || "",
    truckerCode: str(mainDetails?.type === 'L' ? (trucker?.truckerCode) : str(fclTruckingDetails.truckerCode)) || '',
    truckerName: str(mainDetails?.type === 'L' ? (trucker?.truckerDetails) : str(fclTruckerDetails[0])) || '',
    truckerAddress1: mainDetails?.type === 'F' ? str(fclTruckerDetails[1]) : '',
    truckerAddress2:  mainDetails?.type === 'F' ? str(fclTruckerDetails[2]) : '',
    truckerAddress3:  mainDetails?.type === 'F' ? str(fclTruckerDetails[3]) : '',
    truckerContact:  mainDetails?.type === 'F' ? isVisible(CommonToggleKeys.OCN_FCL_BOOKING_RESTRUCTURING) ? fclTruckingDetails?.truckerContact : str(fclTruckerDetails[4]) : '',
    truckerPhone: mainDetails?.type === 'F' ? isVisible(CommonToggleKeys.OCN_FCL_BOOKING_RESTRUCTURING) ? fclTruckingDetails?.truckerPhone : str(fclTruckerDetails[5]) : '',
    truckerFax: mainDetails?.type === 'F' ? str(fclTruckerDetails[6]) : '',
    truckerEmail: mainDetails?.type === 'F' ? (isVisible(CommonToggleKeys.OCN_FCL_BOOKING_RESTRUCTURING) && fclTruckingDetails?.truckerEmail) : "",
    pickupDate: mainDetails?.type === 'L' ? getFormattedDate(pickup?.estimatedPickupDate) : getFormattedDate(fclTruckingDetails.pickupDate),
    pickupTime: mainDetails?.type === 'L' ? fmtTime(pickup?.timeFrom) : fmtTime(fclTruckingDetails?.pickupTime),
    pickupTimeTo: mainDetails?.type === 'L' ? fmtTime(pickup?.timeTo) : fmtTime(fclTruckingDetails?.pickupTimeTo),
    deliveryDate: mainDetails?.type === 'L' ? getFormattedDate(pickup?.deliveryDate) : '',
    deliveryTime: mainDetails?.type === 'L' ? fmtTime(pickup?.deliveryTime) : '',
    pickupInstruction1: (mainDetails?.type === 'L' ? (str(pickup?.instructions) || str(main?.pickupInstruction1)) : str(fclTruckingDetails.pickupInstruction)) ||"",
    pickupInstruction2: "",
    pickupInstruction3: "",
    pickupInstruction4: "",
    pickupInstruction5: "",
    pickupInstruction6: "",
    pickupInstruction7: "",
    pickupType: null,
    referenceNumber: isNew ? "0" : str(refNum || "0"),
    controlFlag: mainDetails?.type === 'L' ? isNew ? "N" : "U" : (pickup?.quotePickupId ?? 0) == 0 ? "N" : "U",
    rowId: null,
    inputUpdateUser: loginBean?.username,
    inputUpdateDate: null,
    quotePickupId: pickup?.quotePickupId || 0,
    returnChasisCode: null,
    returnChasisDetail: null,
    deliveryTimeTo: "",
    deliveryInstructions: "",
    pickupAccessorial: mainDetails?.type === 'L' ? (pickup?.accessorials || []).map(
      (a: string) => PICKUP_ACCESSORIAL_TO_CODE[a] || a.toUpperCase()
    ) : [],
    deliverToAccessorial: [],
    pickupAccessorialString: null,
    billToDetail: "",
    pickupCountry: extractCountryCode(pickup?.country || main?.pickupCountry),
    emptyPositioningDate: null,
    emptyPositioningFromTime: null,
    emptyPositioningToTime: null,
    loadMeter: "",
    opterTransmissionStatus: null,
    pickupAndDeliveryAttributeList: [],
    cargoDimensionBeanList: [],
    pickupChargeBeanList: mainDetails?.pickupNeeded === 'Y' ? (fclTruckingDetails?.charges ?? [])
    .filter((charge: any) => charge.chargeDescription?.trim())
    .map((charge) => ({
      expensesId: 0,
      moduleId: 0,
      reference: refNum,
      referenceExtension: null,
      company: loginBean.userCompany,
      vendor: null,
      charge: str(charge.chargeDescription).split(' - ')[0] || '',
      expense: num(charge.expense),
      income: num(charge.income),
      currency: str(charge.currency).split(' - ')[0],
      inputUser: null,
      inputDate: null,
      updateUser: null,
      updateDate: null,
      controlFlag: mainDetails?.type === 'L' ? isNew ? "N" : "U" : (charge?.quotePickupChargeId ?? 0) == 0 ? "N" : "U",
      rowId: null,
      rateOfExchange: 1.0,
      chargeDescription: str(charge.chargeDescription).split(' - ')[1] || '',
      localeChargeDescription: '',
      expenseIdPk: 0,
      localCurrency: null,
      localIncomeAmount: num(charge.income),
      localExpenseAmount: num(charge.expense),
      quotePickupChargeId: charge?.quotePickupChargeId ?? 0,
      recordNumber: 0,
      applyVat: null,
      payType: null,
      invoiceDate: null,
      invoiceNumber: null,
      chargeType: null,
      truckerRateExpired: null,
      truckChargeGroup: '',
      truckCity: null,
      truckZipCountry: null,
      truckChargeNotes: null,
      truckerName: null,
      truckRateId: 0,
      cfsName: null,
      doorCountry: null,
      originDestination: null,
      incomBasis: null,
      expenseBasis: null,
      incomeRate: 0.0,
      expenseRate: 0.0,
      uom: null,
      expenseRateOfExchange: 0.0,
      rateCompanyId: 0,
      taxAmount: null,
      taxLocalAmount: null,
      bookingQuoteChargeRowId: null,
      prepaidCollect: '',
      pickupId: null,
      expenseCurrency: null,
      relayFlag: null,
      spotRateFlag: 0,
      taxText: null,
      taxPercent: null,
      taxCode: null,
      minimum: 0.0,
      maximum: null
    })) : [],
    deliverCode: null,
    deliverName: null,
    deliverAddress1: null,
    deliverAddress2: null,
    deliverAddress3: null,
    deliverContact: null,
    deliverPhone: null,
    deliverFax: null,
    truckingInstruction1: null,
    rowNumber: 0,
    truckerProNumber: null,
    truckerStatus: null,
    pickupLatitude: str(pickup?.latitude) || null,
    pickupLongitude: str(pickup?.longitude) || null,
    pickupContact2: "",
    pickupName2: "",
    pickupEmail2: "",
    pickupId: null,
    estimatedDeliveryDate: null,
    tmsStatus: null,
    descriptionofGoods: null,
    weightKg: 0,
    cubeCbm: 0,
    weightLbs: 0,
    cubeCbf: 0,
    numberOfPieces: 0,
    uom: null,
    length: 0,
    height: 0,
    deliverToAccessorialString: null,
    actualPickUpDate: null,
    pickupReference: "",
    width: 0,
    packaging: null,
    unit: null,
    pieces: 0,
    cbm: 0,
    cbf: 0,
    kg: 0,
    lbs: 0,
    hazardous: null,
    pickupChannel: null,
    pickupHazardousBeanList: [],
    trkTransmitStatus: null,
    truckerQuoteNumber: "",
    truckerReferenceNumber: "",
    pickupStateId: "38590",
    pickupStateName: str(pickup?.state).includes(' - ') ? str(pickup?.state).split(' - ').slice(1).join(' - ').trim() : null,
    residential: (pickup?.accessorials || []).includes('residential') ? 'Y' : 'N',
    lattitude: "",
    longitude: "",
    unLocationCode: "",
    isTruckRateFetched: "N",
    truckerCodeToggleValue: null,
    isEdiTrucker: "N",
    truckerFlag: null,
    pickupStackName: null,
  };
}

function buildUploadDocumentsBeanList(docs?: any) {
  if (Array.isArray(docs) && docs.length > 0) {
    return docs;
  }
  return [];
}

function buildTransshipmentRoutingBeanList(r: any) {
  const ports = r?.transshipmentPorts || r?.routingFormData?.transshipmentPorts || [];
  if (ports.length === 0) {
    return [];
  }

  return ports.map((p: any, idx: number) => ({
    referenceNumber: '',
    moduleCode: 'QUO',
    transshipmentPortSeq: idx + 1,
    transshipmentPortCode: str(p.portCode),
    transshipmentPortName: str(p.portName),
    transshipmentPortDate: getFormattedDate(p.eta),
    transshipmentPortRegionCode: null,
    transshipmentPortOrgEta: null,
    transshipmentPortActulAta: null,
    transshipmentPortUnCode: str(p.portCode),
  }));
}

const PICKUP_ACCESSORIAL_TO_CODE: Record<string, string> = {
  'hazardous-material': 'HAZMAT',
  'liftgate': 'LFTD',
  'appointment': 'APPT',
  'residential': 'RESIDENT',
};

const DOOR_ACCESSORIAL_TO_CODE: Record<string, string> = {
  'liftgate': 'LFTD',
  'appointment': 'APPTD',
  'hazardous-material': 'HAZP',
  'residential': 'RESIDENTD',
};

function buildDoorDeliveryDetailsBean(r: any, isNew = true, refNum?: any) {
  const door = r?.doorDeliveryForm || {};
  const truckerLines = str(door.truckerDetails).split('\n');

  return {
    doorDeliveryState: str(door.doorDeliveryState),
    doorDeliveryZipCode: str(door.doorDeliveryZipCode),
    doorDeliveryCountry: extractCountryCode(door.doorDeliveryCountry),
    doorDeliveryAddress1: str(door.streetAddress),
    doorDeliveryAddress2: '',
    doorDeliveryAddress3: '',
    doorDeliveryAddress4: null,
    doorDeliveryCity: str(door.doorDeliveryCity),
    tentativeDeliveryDate: getFormattedDate(door.estimatedDeliveryDate) || '',
    truckerCode: strOrNull(door.truckerCode),
    truckerRateExpired: null,
    truckChargeGroup: null,
    truckCity: null,
    truckZipCountry: null,
    truckChargeNotes: null,
    truckerName: truckerLines[0] || null,
    truckRateId: 0,
    cfsName: null,
    doorCountry: null,
    truckerAddress1: truckerLines[1] || '',
    truckerAddress2: truckerLines[2] || '',
    truckerAddress3: truckerLines[3] || '',
    truckerAddress4: truckerLines[4] || '',
    truckerAddress5: truckerLines[5] || '',
    deliveryAccessorials: (door.accessorials || []).map(
      (a: string) => DOOR_ACCESSORIAL_TO_CODE[a] || a.toUpperCase()
    ),
    deliveryAccessorialString: null,
    stackable: door.stackable === false ? 'N' : 'Y',
    shipmentType: door.shipmentType === 'FTL' ? 'F' : 'L',
    pickupChargeBeanList: [],
    referenceNumber: isNew ? '0' : str(refNum || '0'),
    controlFlag: 'N',
    rowId: null,
    inputUpdateUser: 'pnqpb_nyc',
    inputUpdateDate: null,
    billToDetail: '',
    residential: (door.accessorials || []).includes('residential') ? 'Y' : 'N',
    pickupId: '0',
    isTruckRateFetched: 'N',
    latitude: str(door.latitude) || '0',
    longitude: str(door.longitude) || '0',
    unLocationCode: '',
    warehouseCode: '',
    warehouseName: '',
    destinationWarehouse: '',
    truckerCodeToggleValue: null,
    truckerFlag: null,
    truckRateDetailsFileId: 0,
  };
}

function buildIncidentReasonDetailBeanList() {
  return [
    {
      eventEntityResponceBean: {
        eventEntityResponseChildBean: [],
        eventActivityList: [],
        officeSettingBean: {},
        isShowIRP: false,
        isCaptureDefaultReason: false,
        isShowGoDateColn: false,
        isShowStorageDateColn: false,
      },
      categoryReasonDataMappingBean: {
        causedBy: "",
        incidentCategory: "",
        reason: "",
        office: "",
        emtEventCode: "",
        incidentDetailsKey: "",
        isIncidentReasonMandatory: "",
      },
      incidentOwner: "",
      incidentDetail: "",
      incidentOpenVia: "",
      referenceNumber: 0,
      referenceType: "",
      serviceFailureLocalDetails: "",
      isThroughIncidentReason: true,
      reasonProvidedFlag: false,
      subActionflag: "",
      pickUpId: "",
      isPRCSelected: false,
      incidentOwnerMainCompanyName: "",
      incidentOwnerFullName: "",
    },
  ];
}

function buildBookingHazardousBeanList(hazardousList: any[], isNew: boolean, referenceNum?: number) {
  return hazardousList?.flatMap((cargoRow) => {
    const haz = str(cargoRow.hazardous);
    const isHazardousSelected = haz === 'Y' || haz.startsWith('Y') || haz === 'L' || haz === 'E';
    if (!isHazardousSelected) return [];
    return (cargoRow.hazRows || []).map((haz: any) => ({
      rowId: haz.hrid ?? 0,
      referenceNumber: isNew ? null : referenceNum,
      shipperName1: str(haz.properShippingName),
      shipperName2: null,
      techName1: str(haz.technicalName),
      techName2:null,
      noOfpieces: str(haz.pieces),
      packaging: str(haz.packaging),
      weight: num(haz.weight),
      imcoClass: null,
      unNumber: str(haz.unNumber),
      imcoPage: str(haz.imoPage),
      flashPointCelsius: num(haz.flashpointC),
      flashpointFahrenheit: num(haz.flashpointF),
      degrees: str(haz.degreeUnit) || null,
      packagingGroup: str(haz.pkgGroup),
      plackard1: str(haz.placard1),
      plackard2: str(haz.placard2),
      emergencyPhone: str(haz.emergencyNumber),
      emergencyCotact: str(haz.emergencyContact),
      hazardousCode: str(haz.imoClass),
      hazarDousCount: 0,
      controlFlag: haz.hrid ? "U" : "N",
      inputUpdateUser: null,
      recordNumber: 0,
      quoteCargoHazardousId: haz.hrid ?? 0,
      imoSubClass: str(haz.imoSubclass),
      customerDeclaredCargoId: null,
      bookingNumber: null,
      customerDeclaredHazardouId: null,
      customerDeclaredHazardousTransactionFlag: ' ',
      pickupId: null,
      crgId: null,
      quantity: haz.quantity || null,
      commodity: str(haz.commodity) || null
    }));
  });
}

function buildMainBookingQuoteBean(
main: any, customer: any, routing: any, cargo: any, rate: any, loginBean: any, documentDetails?: any, isVisible?: (key: ToggleKey) => boolean, fclTruckingDetails?:any) {
  const isNewEntry = !main?.referenceNumber || num(main?.referenceNumber) === 0;
    return {
    bookingQuoteBean: buildBookingQuoteBean(main, customer, routing, cargo, rate,loginBean,isVisible),
    bookingQuoteChargeBeanList: buildBookingQuoteChargeBeanList(rate, isNewEntry),
    multiCargoBookingQuoteNoteBeans: buildMultiCargoBookingQuoteNoteBeans(cargo),
    bookingHazardousBeanList: buildBookingHazardousBeanList(cargo.cargoState?.cargoRows,isNewEntry, num(main?.quoteNumber || main?.referenceNumber)),
    // pickupDetailBean: buildPickupDetailBean(routing, isNewEntry, main?.referenceNumber, fclTruckingDetails, loginBean, isVisible, main),
    pickupDetailBean: (main?.type === 'L' || (main?.pickupNeeded === 'Y' && main?.type === 'F'))
    ? buildPickupDetailBean(
        routing,
        isNewEntry,
        main?.referenceNumber,
        fclTruckingDetails,
        loginBean,
        isVisible,
        main
      )
    : {},
    doorDeliveryDetailsBean: buildDoorDeliveryDetailsBean(routing, isNewEntry, main?.referenceNumber),
    uploadDocumentsBeanList: buildUploadDocumentsBeanList(documentDetails),
    uploadDocumentsOldBeanList: [],
    uploadDocumentsNewBeanList: [],
    transshipmentRoutingBeanList: buildTransshipmentRoutingBeanList(routing),
    manufacturerDetailBeans: (routing?.manufacturerNames || routing?.routingFormData?.manufacturerNames || []).map((m: any) => ({
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
    multiplePickupDetailBeanList: [],
    versionCount: 0,
    amendmentCodeBean: {
      amendmentCode: null, bookingNumber: null, handlingOffice: null,
      inputUser: null, inputDate: null, oldAmendmentCode: null,
      reference: null, officeId: null, module: null, siteId: null,
    },
    bookingQuoteCustomerBean: buildBookingQuoteCustomerBean(customer, main?.type),
    bookingUploadDocumentsBeanList: null,
    bookingCustomDocumentsBeanList: null,
    genValuedMap: null,
    quoteExpirationDate: null,
    lotExist: null,
    cancelRequestResultList: null,
    cancelPickupList: [],
    emailDocumentBeans: null,
    hazardousRuleMap: {
      "0": {
        "DocumentList": "",
        "ACTION": "SHIPMENT_RESTRICTED",
        "MULTI_ACTION": "SHIPMENT_RESTRICTED",
        "REMARKS": "Class 2.3 restricted",
        "IMO_CLASS": "2.3"
      }
    },
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
    lotCommentsExternalFromQuote: true,
    convtQuotToBkgButtonClick: false,
    bookingVesselChange: false,
    ratedDocumentSent: false,
    equipmentsDeatilsUpdated: false,
    loadplanPendingFinalized: false,
    fromCopyBooking: false,
    updateControllingEntity: false,
    truckingDetailsUpdated: false,
    blreferenceExist: true,
    calledFromSaveButton: false,
    nraAcceptanceEmailSent: false,
    updateAmsBlNumberAndScacCode: false,
    updateRateControllingEntity: false,
    copyRateFromQuote: false,
    updateAmsBlNumber: false,
    fileSailConfirm: false,
    loadplanFinalized: false,
    lotCommentsInternalFromQuote: true,
    bookingCounterOn: true,
    pendingFinalManuallySetNo: false,
    taskReviewOrApprove: false,
    removeUploadDocumentsBeanList: [],
    addUploadDocumentsBeanList: [],
  };
}

// ─── PUBLIC: build full payload ─────────────────────────────────────────────

export function buildQuoteSubmitPayload(
loginBean: any, mainDetails: any, customerDetails: any, routingDetails: any, cargoDetails: any, rateDetails: any, documentDetails: any, isVisible: (key: ToggleKey) => boolean, fclTruckingDetails?: any
) {
  return {
    requestData: {
      userId: loginBean.userId,
      mainBookingQuoteBean: buildMainBookingQuoteBean(
        mainDetails,
        customerDetails,
        routingDetails,
        cargoDetails,
        rateDetails,
        loginBean, 
        documentDetails,
        isVisible,
        fclTruckingDetails
      ),
      incidentReasonDetailBean: buildIncidentReasonDetailBeanList(),
    },
  };
}
