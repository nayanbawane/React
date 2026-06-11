import {
  BookingQuoteChargeBeanFull,
  ChargesState,
  ChargeType,
  createBlankBeanRow,
  initialCargoRow,
  initialDimRow,
  initialHazRow,
  makeRowId,
  PrepaidCollect,
  RateDetailsFormData,
  RelayFlag,
  RoeRow,
  getInitialFCLTruckingData
} from 'phoenix-common-react';

const joinLines = (...parts: (string | null | undefined)[]): string =>
  parts.filter(Boolean).join('\n');

const parseApiDate = (dateStr: string | null): Date | null => {
  if (!dateStr) return null;
  const months: Record<string, number> = {
    JAN: 0,
    FEB: 1,
    MAR: 2,
    APR: 3,
    MAY: 4,
    JUN: 5,
    JUL: 6,
    AUG: 7,
    SEP: 8,
    OCT: 9,
    NOV: 10,
    DEC: 11,
  };
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const [day, mon, year] = parts;
  const month = months[mon.toUpperCase()];
  if (month === undefined) return null;
  return new Date(Number(year), month, Number(day));
};

const mapDirection = (code: string | null): string => {
  if (code === 'E') return 'Export';
  if (code === 'I') return 'Import';
  return code ?? '';
};

const mapYNToYesNo = (value: string | null): string => {
  if (value === 'Y') return 'Yes';
  if (value === 'N') return 'No';
  return 'No';
};

const mapClauses = (clauses: any[] | null): any[] => {
  if (!clauses?.length) return [];
  return clauses;
};

const cleanStateId = (v: any): string => {
  if (!v) return '';
  const m = String(v).match(/^(\d+)/);
  return m ? m[1] : '';
};
export const quoteChannelConstants = {
    CHANNEL_EMAILS: 'Email',
    CHANNEL_PHONE: 'Phone',
    CHANNEL_CHATAPP: 'Chat App',
    EMAILS: 'P',
    BOOKINGPHONE: 'H',
    CHATAPP: 'C',
    EDIBOOKING: 'EDI',
    STIONLINEBOOKING: 'STI Online',
    SSCONLINEBOOKING: 'SSC Online',
    OMSBOOKING: 'OMS IM',
    GLOBALEXPORTBOOKING: 'G',
    GLOBAL_IM: 'GlobeAssist IM',
    GLOBAL_EXPORT_BOOKING: 'GlobeAssist EX',
    GLOBAL_BOOKING: 'globeassist',
    PHOENIX_CONSTANT: 'P',
    PHOENIX_STRING: 'Phoenix',
    ESERVICE_CONSTANT: 'A',
    ESERVICE_STRING: 'E-Service',
    EDI_CONSTANT: 'E',
    STI_CONSTANT: 'S',
    STI_STRING: 'STI Online',
    ESERVICE_STI_ONLINE_CONSTANT: 'I',
    OMS_BOOKING:'O',
    GA_IM_BOOKING:'F',
    STI_ONLINE_BOOKING:'S',
    WWA_EDI: 'WWA(EDI)',
    WWA_ONLINE: 'WWA(Online)',
    WWAEDI: 'E',
    // WWAONLINE: 'B',
    // { "E" : "WWA(EDI)", "B" : "WWA(Online)" }
} as const;
// STI_ONLINE_BOOKING,SSCONLINEBOOKING,STIONLINEBOOKING,GA_IM_BOOKING,GLOBAL_IM,GLOBALEXPORTBOOKING,GLOBAL_EXPORT_BOOKING,OMS_BOOKING,OMSBOOKING
export const SSC_OFFICE_LIST: string[] = ["ANT","ROT","ROH","LEH","LYO","PAR","MAR","AUH","DXB"];
const quoteChannelCodeToNameMap: Record<string, string> = { 
  'G':     quoteChannelConstants.GLOBAL_EXPORT_BOOKING,
  // 'E':     quoteChannelConstants.EDI_CONSTANT,
  'O':     quoteChannelConstants.OMSBOOKING, 
  'F':     quoteChannelConstants.GLOBAL_IM, 
  'E':     quoteChannelConstants.WWA_EDI,
  // 'B':     quoteChannelConstants.WWA_ONLINE,
};

export const getQuoteChannel = (receivedVia: string, handlingOffice: string): string => {
  if (receivedVia.toUpperCase() === quoteChannelConstants.STI_ONLINE_BOOKING.toUpperCase()) {
    if (SSC_OFFICE_LIST.includes(handlingOffice)) {
      return quoteChannelConstants.SSCONLINEBOOKING; // 'SSC Online'
    } else {
      return quoteChannelConstants.STIONLINEBOOKING; // 'STI Online'
    }
  }
  return quoteChannelCodeToNameMap[receivedVia] ?? receivedVia;
};

export const mapMainDetailsFromPopulate = (bean: any, isCopyQuote = false) => ({
  type: bean.bookingQuoteType ?? '',
  referenceNumber: isCopyQuote ? 0 : (bean.referenceNumber ?? 0),

  quoteNumber: isCopyQuote ? 0 : (bean.quoteNumber ?? 0),

  rowId: isCopyQuote ? null : (bean.rowId ?? null),
  terms: bean.terms ?? '',
  termName: bean.termName ?? '',
  carrier: mapClauses(bean.carriers), //loop all like clause todo
  carrierBookingNumber: bean.lineBooking ?? '',
  frequency: String(bean.frequency ?? ''),

  userReference: bean.userReference ?? '',
  status: bean.status,
  clauses: mapClauses(bean.clauses),
  pickupNeeded: bean.pickupNeeded,
  prepaidCollect: bean.prepaidCredit,
  controllingEntity: bean.nomination,
  effectiveDate: parseApiDate(bean.effectiveDate),
  expirationDate: parseApiDate(bean.expirationDate),
  quoteChannel: bean.bookingQuoteType === 'F' ? getQuoteChannel(bean.receivedVia ?? '', bean.handlingOffice ?? '') : (bean.receivedVia ?? ''),
  direction: mapDirection(bean.direction),
  pendingFinal: mapYNToYesNo(bean.pendingFinalQuoteStatus),
  truckQuote: mapYNToYesNo(bean.truckQuote),
  quoteType:
    bean.truckQuoteType === 'A'
      ? 'Actual'
      : bean.quoteType === 'LCL Quote'
        ? 'L'
        : bean.truckQuoteType || bean.quoteType || '',
  transitTime: String(bean.transitTime ?? ''),
  billingCompany:
    bean.bookingQuoteCustomerBean?.billingCompany?.toUpperCase() ?? '',
  handlingOffice: bean.handlingOffice ?? '',
  createdBy: bean.takenBy ?? '',
  createdOn: parseApiDate(bean.bookQuoteDate),
  updatedBy: bean.updatedBy ?? '',
  updatedOn: parseApiDate(bean.updatedOn),
  nomination: bean.nomination ?? '',
  rateControllingEntity: bean.rateControllingEntity ?? '',
});

const mapTransshipmentPorts = (list: any[] | null) =>
  (list ?? []).map((r: any, i: number) => ({
    id: String(i),
    portCode: r.transShipmentPortCode ?? '',
    portName: r.transShipmentPortName ?? '',
    eta: parseApiDate(r.eta ?? null),
  }));

const mapManufacturerNames = (bean: any) =>
  (bean?.totalAddedManufacturerNameList ?? []).map((m: any) => m.name ?? m);

export const mapRoutingFromPopulate = (quoteBean: any) => {
  const r = quoteBean?.bookingQuoteRoutingBean;
  if (!r) return {};
  const rawPickup = quoteBean?.pickupNeeded;
  const pickupNeeded =   rawPickup === 'F' ? 'N' : (rawPickup ?? 'N');
  return {
    pickupNeeded,
    terms: quoteBean?.terms ?? '',
    termsLabel: quoteBean?.termName || quoteBean?.terms || '',
    deliveryType: quoteBean?.cfsDeliveryType ?? '',
    preCarriageType: r.preCarriageType ?? '',
    preCarriageBy: r.preCarriageBy ?? '',
    preCarriageEts: parseApiDate(r.preCarriageETS),
    vesselCode: r.vesselCode ?? '',
    vesselName: r.vessel ?? '',
    voyage: r.voyage ?? '',
    carrierCode: quoteBean?.carriers?.[0]?.carrierCode ?? '',
    placeOfReceiptCode: r.originCode ?? '',
    placeOfReceiptName: r.originName ?? '',
    placeOfReceiptEtd: parseApiDate(r.etdOrigin),
    placeOfReceiptRegion: r.originRegionCode ?? '',
    placeOfReceiptPickupFrom: r.placeOfReceiptName1 ?? '',
    placeOfReceiptPickupFromName: r.placeOfReceiptName2 ?? '',
    placeOfReceiptPickupTo: r.placeOfReceiptName3 ?? '',
    placeOfReceiptPickupToName: r.placeOfReceiptName4 ?? '',
    consolidationCfsCode: r.consolidationCFSCode ?? '',
    consolidationCfsName: r.consolidationCFSName ?? '',
    consolidationCfsEtd: parseApiDate(r.consolidationCFSDate),
    consolidationCfsRegion: r.consolidationCFSRegionCode ?? '',
    portOfLoadingCode: r.loadCode ?? '',
    portOfLoadingName: r.loadName ?? '',
    portOfLoadingEts: parseApiDate(r.sailDate),
    portOfLoadingRegion: r.loadRegionCode ?? '',
    transshipmentPorts: mapTransshipmentPorts(
      quoteBean?.bookingQuoteRoutingBeanlist
    ),
    portOfDischargeCode: r.dischargeCode ?? '',
    portOfDischargeName: r.dischargeName ?? '',
    portOfDischargeEta: parseApiDate(r.etaDate),
    portOfDischargeRegion: r.dischargeRegionCode ?? '',
    deconsolidationCfsCode: r.deConsolidationCode ?? '',
    deconsolidationCfsName: r.deConsolidationName ?? '',
    deconsolidationCfsEta: parseApiDate(r.deConsolidationDate),
    deconsolidationCfsRegion: r.deconsolidationRegionCode ?? '',
    destinationCfsCode: r.finalCFSCode ?? '',
    destinationCfsName: r.finalCFSName ?? '',
    destinationCfsEta: parseApiDate(r.finalCFSDate),
    destinationCfsRegion: r.finalCFSRegionCode ?? '',
    placeOfDeliveryCode: r.destinationCode ?? '',
    placeOfDeliveryType: r.placeOfDeliveryName2Selection ?? '',
    placeOfDeliveryName: r.placeOfDeliveryName1 || r.destinationName || '',
    placeOfDeliveryEta: parseApiDate(r.etaDestination),
    placeOfDeliveryRegion: r.destinationRegionCode ?? '',
    manufacturerNames: mapManufacturerNames(r.manufacturerDetailBean),
    warehouse: [r.warehouse, r.warehouseName].filter(Boolean).join('-'),
    warehouseName: r.warehouseName ?? '',
    destinationWarehouse: r.destinationWarehouse ?? '',
    deliveryReference: r.warehouseDeliveryRef ?? '',
    // cargoReadDate: parseApiDate(r.deliveryDate),
    cfsCutoffDate: parseApiDate(r.documentCutoffDate),
    cfsCutoffTime: r.documentationCutOffTime ?? '',
    gatewayCutoffDate: parseApiDate(r.gatewayCutoffDate),
    gatewayCutoffTime: r.gatewayCutoffTime ?? '',
    docDelivery: r.documentDeliveryCode ?? '',
    docContact: r.documentDeliveryContact ?? '',
    // docCutoffDate: parseApiDate(r.documentCutoffDate),
    // docCutoffTime: r.documentationCutOffTime ?? '',
    transitTime: String(quoteBean?.transitTime ?? r?.transitTime ?? ''),
    frequency: String(quoteBean?.frequency ?? r?.frequency ?? ''),

    loadCode: r.loadCode ?? '',
    loadName: r.loadName ?? '',
    loadEts: parseApiDate(r.sailDate),
    loadRegion: r.loadRegionCode ?? '',

    dischargeCode: r.dischargeCode ?? '',
    dischargeName: r.dischargeName ?? '',
    dischargeEta: parseApiDate(r.etaDate),
    dischargeRegion: r.dischargeRegionCode ?? '',

    rampCode: r.deConsolidationCode ?? '',
    rampName: r.deConsolidationName ?? '',
    rampEta: parseApiDate(r.deConsolidationDate),
    rampRegion: r.deconsolidationRegionCode ?? '',
    // "locationInformation": null,
    // "privateLocationInformation": null,
    locationInformationPublic: r.locationInformation ?? '',
    locationInformationPrivate: r.privateLocationInformation ?? '',
  };
};
export const mapCustomerFromPopulate = (quoteBean: any) => {
  const cust = quoteBean?.bookingQuoteCustomerBean;
  if (!cust) return null;

  const s = cust.shipperBean;
  const con = cust.consigneeBean;
  const f = cust.forwarderBean;

  const customerFields = {
    customerCode: s?.shipperCode ?? '',
    customerName: joinLines(
      s?.shipperName,
      s?.shipperName2,
      s?.shipperName3,
      s?.shipperName4,
      s?.shipperName5
    ),
    customerAddress: joinLines(
      s?.shipperAddress1,
      s?.shipperAddress2,
      s?.shipperAddress3
    ),
    customerCity: s?.shipperCity ?? '',
    customerState: s?.shipperState ?? '',
    customerStateId: cleanStateId(s?.shipperStateId),
    customerStateName: s?.shipperStateName ?? '',
    customerZipCode: s?.shipperZip ?? '',
    customerCountry: s?.shipperCountry ?? '',
    customerFax: s?.shipperFax ?? '',
    customerType: quoteBean?.bookingQuoteType == "F" ? cust?.customerType ? cust?.customerType : '' : s?.customerType ? s?.customerType : '-1',
    customersContactName: s?.shipperContact ?? '',
    salesRepresentative: cust?.salesRepresentative ?? '',
    telephoneNumber: s?.shipperTelephone ?? '',
    mobileNumber: s?.shipperCellphone ?? '',
    customerEmail: cust?.customerEmail ?? '',
    customerReference: s?.shipperReference ?? '',
    truckSellRateProfile: cust?.truckSellRateProfile ?? '',
    prepaidCollect: quoteBean?.prepaidCredit ?? '',
    controllingEntity: quoteBean?.nomination ?? '',
    rateControllingEntity: quoteBean?.rateControllingEntity ?? '',
    fcustomerType: s?.customerType?? ''
  };

  return {
    defaultForm: customerFields,
    lclForm: customerFields,
    customerMoreDetails: {
      consigneeCode: con?.consigneeCode ?? '',
      consigneeName: joinLines(con?.consigneeName, con?.consigneeName1),
      consigneeAddress: joinLines(
        con?.consigneeAddress1,
        con?.consigneeAddress2,
        con?.consigneeAddress3
      ),
      consigneeCity: con?.consigeeCity ?? '',
      consigneeState: con?.consigneeState ?? '',
      consigneeStateId: cleanStateId(con?.consigneeStateId),
      consigneeStateName: con?.consigneeStateName ?? '',
      consigneeZipCode: con?.consigneeZipCode ?? '',
      consigneeCountry: con?.consigneeCountry ?? '',
      consigneeContactName: con?.consigneeContact ?? '',
      consigneePhoneNumber: con?.consigneePhone ?? '',
      consigneeEmail: con?.consigneeEmail ?? '',
      consigneeFax: con?.consigneeFax ?? '',
      consigneeReference: con?.consigneeReference ?? '',

      shipperCode: f?.forwarderCode ?? '',
      shipperName: joinLines(
        f?.forwarderName,
        f?.forwarderName2,
        f?.forwarderName3,
        f?.forwarderName4,
        f?.forwarderName5
      ),
      shipperAddress: joinLines(
        f?.forwarderAddress1,
        f?.forwarderAddress2,
        f?.forwarderAddress3
      ),
      shipperCity: f?.forwarderCity ?? '',
      shipperState: f?.forwarderState ?? '',
      shipperStateId: cleanStateId(f?.forwarderStateId),
      shipperStateName: f?.forwarderStateName ?? '',
      shipperZipCode: f?.forwarderZip ?? '',
      shipperCountry: f?.forwarderCountry ?? '',
      shipperContactName: f?.forwarderContact ?? '',
      shipperPhoneNumber: f?.forwarderPhone ?? '',
      shipperEmail: f?.forwarderEmail ?? '',
      shipperFax: f?.forwarderFax ?? '',
      shipperReference: f?.forwarderReference ?? '',
      shipperNamedAccount: f?.namedAccount ?? '',
      shipperEoriNumber: f?.forwarderEoriNumber ?? '',

      trackingCode: [cust?.trackingCustomer1, cust?.trackingCustomer2]
        .filter(Boolean)
        .join('-'),
      wwaReference: cust?.wwaReference ?? '',
      purchaseOrder: cust?.purchaseOrderNumber ?? '',
    },
  };
};

const mapHazardous = (
  code: string | null,
  shippingType: string | null = 'L'
): string => {
  if (code === 'Y') return shippingType === 'L' ? 'Y - Yes' : 'Y';
  if (code === 'N') return shippingType === 'L' ? 'N - No' : 'N';
  if (code === 'L') return code;
  if (code === 'E') return code;
  return 'Please Select';
};

const mapDimUnit = (code: string | null): string => {
  const map: Record<string, string> = {
    I: 'Inches',
    C: 'Centimeters',
    F: 'Feet',
    M: 'Meters',
  };
  return map[code ?? ''] ?? 'Inches';
};

const mapShipmentType = (code: string | null): string => {
  const map: Record<string, string> = { L: 'LTL', F: 'FTL' };
  return map[code ?? ''] ?? code ?? 'LTL';
};

const mapDimRows = (dims: any[]) => {
  if (!dims?.length) return [];
  return dims.map((d) => ({
    ...initialDimRow,
    length: String(d.length ?? ''),
    width: String(d.width ?? ''),
    height: String(d.height ?? ''),
    unit: mapDimUnit(d.unit),
    pieces: String(d.pieces ?? ''),
    cbm: String(d.cbm ?? ''),
    cbf: String(d.cbf ?? ''),
    kg: String(d.kg ?? ''),
    lbs: String(d.lbs ?? ''),
    cls: String(d.tmsClass ?? ''),
    stackable: d.stackable === 'Y' ? 'Yes' : 'No',
    shipmentType: mapShipmentType(d.shipmentType),
    stackingType: d.stackingType ?? '',
  }));
};

const mapHazRows = (list: any[], shippingType:'F' | 'L' = 'L') => {
  if (!list?.length) return [{ ...initialHazRow }];
  const mappedHazardousList = list.map((h) => ({
    ...initialHazRow,
    imoClass: h.hazardousCode
      ? h.hazardousCode.replace(/\.0$/, '')
      : 'Please Select',
    imoSubclass: h.imoSubClass ?? 'Please Select',
    unNumber: h.unNumber ?? '',
    imoPage: h.imcoPage ?? '',
    pkgGroup: h.packagingGroup ?? 'Please Select',
    flashpointC: String(h.flashPointCelsius ?? '0'),
    flashpointF: String(h.flashpointFahrenheit ?? '0'),
    degreeUnit: h.degreeUnit ?? 'C',
    pieces: String(h.noOfpieces ?? '0'),
    packaging: h.packaging?.toLowerCase(),
    weight: String(h.weight ?? '0'),
    properShippingName: h.shipperName1 ?? '',
    shippingName: h.shippingName ?? '',
    technicalName: h.techName1 ?? '',
    placard1: h.plackard1 ?? '',
    placard2: h.plackard2 ?? '',
    emergencyNumber: h.emergencyPhone ?? '',
    emergencyContact: h.emergencyCotact ?? '',
    quantity:
      h.quantity === 'L'
        ? 'L - Limited Quantity'
        : h.quantity === 'E'
          ? 'E - Excepted Quantity'
          : 'Please Select',
    shipperName1: h.shipperName1 ?? '',
    shipperName2: h.shipperName2 ?? '',
    hrid: h.quoteCargoHazardousId ?? ''
  }))
  return shippingType === 'F' ? mappedHazardousList.sort((a, b) => Number(a.hrid) - Number(b.hrid)) : mappedHazardousList;
};

export const mapCargoFromPopulate = (result: any) => {
  const multiList =
    result?.bookingQuoteBean?.bookingQuoteMultiCargoBeanList ?? [];

  const cargoBean = result?.bookingQuoteBean?.bookingQuoteCargoBean;
  const hzardousList = result?.bookingHazardousBeanList ?? [];

  const cargoRows = multiList.map((c: any) => ({
    ...initialCargoRow,
    container1: c.container1 ?? '',
    containerType1: c.containerType1 ?? '',
    containerSize1: c.containerSize1 ?? '',
    container2: c.container2 ?? '',
    containerType2: c.containerType2 ?? '',
    containerSize2: c.containerSize2 ?? '',
    container3: c.container3 ?? '',
    containerType3: c.containerType3 ?? '',
    containerSize3: c.containerSize3 ?? '',
    marks: c.marks ?? '',
    pieces: String(c.numberOfPieces ?? ''),
    packaging: c.packaging ?? '-1',
    description: joinLines(
      c.commodity1,
      c.commodity2,
      c.commodity3,
      c.commodity4,
      c.commodity5
    ),
    kg: String(c.weight ?? ''),
    lbs: String(c.weightLbs ?? ''),
    cbm: String(c.cube ?? ''),
    cbf: String(c.cubeCbf ?? ''),
    hazardous: mapHazardous(c.hazardousCode),
    uom: c.uom ?? 'M',
    docRef: c.documentReferences ?? '-1',
    isDimension: c.dimension ?? false,
    overLengthTransmit: c.overLengthTransmit ?? false,
    overWeightTransmit: c.overWeightTransmit ?? false,
    hsCode: c.cargoHsCode ?? '',
    sensitiveCargo: c.sensitiveCargo ?? false,
    dimRows: mapDimRows(c.cargoDimensionBeanList),
    hazRows: mapHazRows(c.bookingMultiCargoHazardousList),
    crid: c.multiCargoDetailId != null ? String(c.multiCargoDetailId) : undefined,
  }));

  // NEW single cargo row
  const fclCargoRows = [
    {
      ...initialCargoRow,

      numberOfContainer1: String(cargoBean?.container1 > 0 ? cargoBean?.container1 : ''),
      containerType1: `${cargoBean?.containerSize1 ?? ''}-${cargoBean?.containerType1 ?? '1'}`,
      // containerSize1: cargoBean?.containerSize1 ?? '',

      numberOfContainer2: String(cargoBean?.container2 > 0 ? cargoBean?.container2 : ''),
      containerType2: `${cargoBean?.containerSize2 ?? ''}-${cargoBean?.containerType2 ?? '1'}`,
      // containerSize2: cargoBean?.containerSize2 ?? '',

      numberOfContainer3: String(cargoBean?.container3 > 0 ? cargoBean?.container3 : ''),
      containerType3: `${cargoBean?.containerSize3 ?? ''}-${cargoBean?.containerType3 ?? '1'}`,
      // containerSize3: cargoBean?.containerSize3 ?? '',

      marks: cargoBean?.marks ?? '',
      pieces: String(cargoBean?.numberOfPieces ?? ''),
      packaging: cargoBean?.packaging ?? '-1',

      descriptionOfGoods: joinLines(
        cargoBean?.commodity1,
        cargoBean?.commodity2,
        cargoBean?.commodity3,
        cargoBean?.commodity4,
        cargoBean?.commodity5
      ),

      kg: String(cargoBean?.weight ?? ''),
      lbs: String(cargoBean?.weightLbs ?? ''),
      cbm: String(cargoBean?.cube ?? ''),
      cbf: String(cargoBean?.cubeCbf ?? ''),

      hazardous: mapHazardous(cargoBean?.hazardousCode, 'F'),

      uom: cargoBean?.uom ?? 'M',
      docRef: cargoBean?.documentReferences ?? '-1',

      isDimension: cargoBean?.dimension ?? false,
      overLengthTransmit: cargoBean?.overLengthTransmit ?? false,
      overWeightTransmit: cargoBean?.overWeightTransmit ?? false,

      hsCode: cargoBean?.cargoHsCode ?? '',
      sensitiveCargo: cargoBean?.sensitiveCargo ?? false,

      dimRows: mapDimRows(cargoBean?.cargoDimensionBeanList),
      hazRows: mapHazRows(hzardousList, 'F'),

      // hazRows1: hzardousList.map((h: any) =>
      //   ({
      //   shippingName: h.shipperName1 ?? '',
      //   shipperName2: h.shipperName2 ?? '',

      //   technicalName: h.techName1 ?? '',
      //   // techName2: h.techName2 ?? '',

      //   pieces: String(h.noOfpieces ?? ''),
      //   packaging: h.packaging ?? '',

      //   weight: String(h.weight ?? ''),

      //   unNumber: h.unNumber ?? '',
      //   imoPage: h.imcoPage ?? '',

      //   flashpointC: String(h.flashPointCelsius ?? ''),
      //   flashpointF: String(h.flashpointFahrenheit ?? ''),

      //   pkgGroup: h.packagingGroup ?? '',

      //   placard1: h.plackard1 ?? '',
      //   placard2: h.plackard2 ?? '',

      //   emergencyNumber: h.emergencyPhone ?? '',
      //   emergencyContact: h.emergencyCotact ?? '',

      //   hazardous: h.hazardousCode ?? '',
      //   imoSubclass: h.imoSubClass ?? '',
      // })),
    },
  ];

  return {
    // cargoRows: cargoRows.length ? cargoRows : [{ ...initialCargoRow }],
    cargoRows:
      result?.bookingQuoteBean?.bookingQuoteType === 'F'
        ? fclCargoRows.length
          ? fclCargoRows
          : [{ ...initialCargoRow }]
        : cargoRows.length
          ? cargoRows
          : [{ ...initialCargoRow }],

    internalComment: cargoBean?.lotCommentsValue ?? '',
    oldInternalComment: cargoBean?.lotCommentsValue ?? '',
    //  internalComment: multiList[0]?.lotCommentsValue ?? '',
    lotRows: (cargoBean.externalLotComments ?? []).map((item: any) => ({
      type: item.code ?? '-1',
      details: item.description ?? '',
      commentId: item.commentId,
      module: item.module,
      reference: item.reference,
      code: item.code,
      name: item.name,
      freeTextInput: item.value,
      description: item.description,
      inputUserName: item.inputUserName,
      inputDate: item.inputDate,
      updateUserName: item.updateUserName,
      updateDate: item.updateDate,
      transactionFlagStatus: item.transactionFlagStatus,
      oldCode: item.oldCode,
      oldName: item.oldName,
      oldValue: item.oldValue,
      fromQuote: item.fromQuote,
      _origType: item.code ?? '-1',
      _origDetails: item.description ?? '',
    })),
  };
};

const formatApiDateToISO = (dateStr: string | null): string => {
  const date = parseApiDate(dateStr);
  if (!date) return '';
  return date.toISOString().split('T')[0] ?? '';
};

const normalizeApiTime = (timeStr: string | null): string => {
  if (!timeStr) return '';
  const match = timeStr.match(/^(\d{1,2}):(\d{2})(AM|PM)?$/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1]);
  const minutes = match[2];
  const meridiem = match[3]?.toUpperCase();
  if (meridiem === 'PM' && hours !== 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;
  return `${String(hours).padStart(2, '0')}:${minutes}`;
};

export const mapDocumentDetailsFromPopulate = (
  beanList: any[] | null | undefined
): any[] => {
  if (!beanList?.length) return [];

  return beanList.map((bean: any) => ({
    documentType: bean.documentTypeName ?? bean.documentType ?? '',
    documentReferenceNumber: bean.documentReferenceNumber ?? '',
    documentRequiredDate: formatApiDateToISO(bean.documentRequiredDate),
    documentRequiredTime: normalizeApiTime(bean.documentRequiredTime),
    documentReceivedDate: formatApiDateToISO(bean.documentReceivedDate),
    documentReceivedTime: normalizeApiTime(bean.documentReceivedTime),
    documentExpirationDate: formatApiDateToISO(bean.documentExpirationDate),
    documentCustomsOffice: bean.documentCustomsOffice ?? '',
    channel: bean.channel ?? '',
    documentCarrier: bean.documentCarrier ?? '',
    documentShipper: bean.documentShipper ?? '',
    agent: bean.agent ?? '',
    comments: bean.comments ?? '',
    active: bean.active === '1' ? 'Yes' : bean.active === '0' ? 'No' : 'Yes',
  }));
};

// const VALID_RELAY_FLAGS = new Set<RelayFlag>(['U', 'A', 'G', 'T', 'C', 'I', 'D']);

// const toRelayFlag = (code: string | undefined): RelayFlag => {
//   const upper = (code ?? '').toUpperCase() as RelayFlag;
//   return VALID_RELAY_FLAGS.has(upper) ? upper : 'U';
// };

const VALID_CHARGE_TYPES: ChargeType[] = [
  'OFR',
  'FOB',
  'PLC',
  'OCC',
  'PTC',
  'DTC',
  'EXP',
];

const toChargeType = (code: string | undefined): ChargeType => {
  if (!code) return 'OFR';
  const up = code.toUpperCase();
  return (VALID_CHARGE_TYPES.find((t) => t === up) as ChargeType) ?? 'OFR';
};

const mapBookingChargeBeanToRow = (bean: any): BookingQuoteChargeBeanFull => {
  return {
    rowId: bean.rowId ?? makeRowId(),
    rowSequence: bean.recordNumber ?? 0,

    incomeChargeDetails: {
      chargeCode: bean.chargeCode ?? '',
      chargeDescription: bean.chargeDescription ?? '',
      chargeType: toChargeType(bean.chargeType),
    },
    incomeRate: bean.sellRate ?? 0,
    incomeCurrency: bean.sellCurrency ?? '',
    incomeBasis: bean.sellBasis ?? '',
    incomeAmount: bean.sellAmount ?? 0,
    incomeROE: bean.rateOfExchange ?? 0,
    incomeLocalAmount: bean.localAmount ?? 0,
    incomeVAT: bean.applyVat === 'Y' ? 'Y' : 'N',
    incomeOldBasis: bean.oldBasis ?? '',
    incomeMaximumRate: bean.maximum ?? null,
    incomeMinimumRate: bean.minimum ?? null,
    incomeCFSFee: '',
    incomeOldBasisMinByKgCbm: '',

    expenseRate: bean.buyRate ?? 0,
    expenseCurrency: bean.expenseCurrency ?? '',
    expenseBasis: bean.buyBasis ?? '',
    expenseAmount: bean.buyAmount ?? 0,
    expenseROE: bean.expenseRateOfExchange ?? 0,
    expenseLocalAmount: bean.expenseLocalAmount ?? 0,
    expenseVAT: bean.expenseVat ? 'Y' : 'N',
    expenseOldBasis: bean.expenseOldBasis ?? '',
    expenseMaximumRate: bean.expenseMaximum ?? null,
    expenseMinimumRate: bean.expenseMinimum ?? null,
    expenseCFSFee: '',

    originDestination: bean.originDestination ?? '',
    // prepaidCollect: bean.payType ?? '-1',
    prepaidCollect: bean.payType == "\u0000"? '' : bean.payType,
    vendor: bean.vendor ?? '',
    vendorReference: bean.expenseVendorReference ?? '',
    invoiceNumber: bean.invoiceNumber ?? '',
    invoiceDate: bean.invoiceDate ?? '',
    rateOfExchangeType: '',
    equipmentDetails: bean.equipmentDetail ?? '',
    numberOfContainer: 0,
    pnlExpense: 0,
    cfsFee: '',

    isLinkedWithPhoenix: bean.linked ?? false,
    relayFlag: bean.relayFlag,
    isPrintOnDocument: bean.printOndocument === 'Y',
    transactionalFlag: bean.controlFlag ?? '',
    isVatBean: false,
    isEnableForEdit: true,
    isFiltered: false,
    isZeroAllowed: true,
    isTruckingRates:
      bean.truckChargeGroup === 'PTC' || bean.truckChargeGroup === 'DTC',
    additionalRatingFlags: {},
    transmittedFlag: '',

    actualLenght: 0,
    fromLenght: 0,
    actualWeight: 0,
    fromWeight: 0,
    measureFrom: '',
    measureTo: '',

    isOldRate: bean.oldRate ?? false,
    isCalculatedZero: false,
    isOFRAccurate: false,
    isFileROE: false,
    isCallFromAccurate: bean.isCallFromAccurate ?? null,
    isFirstTimeRatesAdded: null,
    isNewlyAddedRow: false,
    isFocusSet: false,
    rateTypeFlag: 0,
    isChargeRest: bean.chargeRest ?? false,
    overridden: bean.overridden ?? false,

    vatPercent: bean.vatPercent ?? 'N',
    vatType: '',
    vatAmount: bean.vatAmount ?? 0,
    taxKey: bean.taxKey ?? '',
    taxCode: bean.taxCode ?? '',
    taxText: bean.taxText ?? '',
    taxAmount: bean.taxAmount ?? null,
    taxLocalAmount: bean.taxLocalAmount ?? null,
    applyFor: bean.applyFor ?? '',
    glCode: bean.glCode ?? '',

    invoiceCurrency: bean.invoiceCurrency ?? '',
    invoiceCurrencyROE: bean.invoiceExchangeRate ?? 0,
    invoiceCurrencyTotalAmount: 0,
    invoiceSellRateOfExchange: bean.invoiceSellRateOfExchange ?? 0,
    invoiceExpenseRateOfExchange: bean.invoiceExpenseRateOfExchange ?? 0,
    invoiceSellAmount: bean.invoiceSellAmount ?? 0,
    invoiceExpenseAmount: bean.invoiceExpenseAmount ?? 0,
    invToLocalCurrencyROE: 0,
    invoiceCurrencyROEViewOnly: 0,
    invToLocalCurrencyROEViewOnly: 0,

    spotRateDetailsId: bean.spotRateDetailsId ?? '',
    rateDetailId: String(bean.bookingQuoteRateId ?? ''),
    spotRateKey: bean.spotRateKey ?? '',
    spotRateFlag: bean.spotRateFlag ?? 0,
    spotRateEfftectiveDate: '',
    ExpirationDate: '',
    accurateSpotRateKey: bean.accurateSpotRateKey ?? '',
    sprKey: bean.sprKey ?? '',

    companyId: bean.company ?? '',
    bookingRateId: String(bean.bookingQuoteRateId ?? ''),
    rateCompanyId: bean.rateCompanyId ?? 0,
    lotRateId: '',
    truckingChargeLinkId: bean.truckingChargeLinkId ?? 0,

    aspect: bean.aspect ?? '',
    fmcChargeType: bean.fmcChargeType ?? '',
    tabNumber: 0,
    bookingType: '',
    isAdditionalInvCharge: '',
    oinvoiceNumber: '',
    userDefineChargeDescription: bean.userDefineChargeDescription ?? '',

    // Trucking
    truckerRateExpired: bean.truckerRateExpired ?? '',
    truckChargeGroup: bean.truckChargeGroup ?? '',
    truckCity: bean.truckCity ?? '',
    truckZipCountry: bean.truckZipCountry ?? '',
    truckChargeNotes: bean.truckChargeNotes ?? '',
    truckerName: bean.truckerName ?? '',
    truckRateId: bean.truckRateId ?? 0,
    truckRate: bean.truckRate ?? {},
    truckRateDetailsFileId: bean.truckRateDetailsFileId ?? 0,
    pickupId: bean.pickupId ?? '',
    expensePickupId: bean.expensePickupId ?? bean.pickupId ?? '',

    cfsName: bean.cfsName ?? '',
    doorCountry: bean.doorCountry ?? '',
    euVatRuleId: bean.euVatRuleId ?? 0,
  };
};

export interface MappedRateDetailsPopulate {
  charges: ChargesState;
  ratingType: string;
  roeType: string;
  rateOfExchange: RateDetailsFormData['rateOfExchange'];
  originalBookingQuoteChargeBeanList: any[];
}

export interface PopulateSectionFlags {
  showPickupSection?: boolean;
  showDoorDeliverySection?: boolean;
  showPlcSection?: boolean;
  localCurrency?: string;
}

export const mapRateDetailsFromPopulate = (
  chargeBeanList: any[] | undefined | null,
  mainBean: any,
  sectionFlags?: PopulateSectionFlags
): MappedRateDetailsPopulate => {
  const rows: BookingQuoteChargeBeanFull[] = (chargeBeanList ?? [])
    .filter(Boolean)
    .map(mapBookingChargeBeanToRow);

  const currencyRoeMap = new Map<
    string,
    { localCurrencyROE: string; invoiceCurrencyROE: string }
  >();

  (chargeBeanList ?? []).filter(Boolean).forEach((bean: any) => {
    if (bean.sellCurrency?.trim()) {
      currencyRoeMap.set(bean.sellCurrency, {
        localCurrencyROE: String(bean.rateOfExchange ?? 0),
        invoiceCurrencyROE: String(
          bean.invoiceSellRateOfExchange ?? bean.rateOfExchange ?? 0
        ),
      });
    }
    if (bean.expenseCurrency?.trim()) {
      currencyRoeMap.set(bean.expenseCurrency, {
        localCurrencyROE: String(bean.expenseRateOfExchange ?? 0),
        invoiceCurrencyROE: String(
          bean.invoiceExpenseRateOfExchange ?? bean.expenseRateOfExchange ?? 0
        ),
      });
    }
  });

  const roeRows: RoeRow[] = Array.from(currencyRoeMap.entries()).map(
    ([currency, roe]) => ({
      id: makeRowId(),
      currency,
      localCurrencyROE: roe.localCurrencyROE,
      invoiceCurrencyROE: roe.invoiceCurrencyROE,
    })
  );

  const currency =
    sectionFlags?.localCurrency ?? mainBean?.localCurrency ?? 'USD';
  const finalRows = [...rows];

  if (sectionFlags?.showPickupSection) {
    const hasPickup = rows.some(
      (r) =>
        r.incomeChargeDetails?.chargeType === 'FOB' &&
        r.truckChargeGroup === 'PTC'
    );
    if (!hasPickup) finalRows.push(createBlankBeanRow('PTC', currency));
  }

  if (sectionFlags?.showDoorDeliverySection) {
    const hasDoorDelivery = rows.some(
      (r) =>
        r.incomeChargeDetails?.chargeType === 'PLC' &&
        r.truckChargeGroup === 'DTC'
    );
    if (!hasDoorDelivery) finalRows.push(createBlankBeanRow('DTC', currency));
  }

  if (sectionFlags?.showPlcSection) {
    const hasPlc = rows.some(
      (r) =>
        r.incomeChargeDetails?.chargeType === 'PLC' &&
        r.truckChargeGroup !== 'DTC'
    );
    // if (!hasPlc) finalRows.push(createBlankBeanRow('PLC', currency));
    if (!hasPlc && (mainBean.bookingQuoteType != 'F')) finalRows.push(createBlankBeanRow('PLC', currency));
  }

  return {
    charges: {
      rateDetails: finalRows,
      deletedRateDetails: [],
    },
    ratingType: mainBean?.ratingType ?? mainBean?.selectedRatingType ?? '',
    roeType: mainBean?.roeType ?? mainBean?.rateOfExchangeType ?? '',
    rateOfExchange: {
      baseCurrency: mainBean?.localCurrency ?? 'USD',
      baseRoe: 1,
      rateOfExchangeType:
        mainBean?.roeType ?? mainBean?.rateOfExchangeType ?? '',
      roeRows,
    },
    originalBookingQuoteChargeBeanList: (chargeBeanList ?? []).filter(Boolean),
  };
};

export const mapFCLTruckingFromPopulate = (quoteBean: any, loginBean: any) => {
  const joinNonEmpty = (fields: any[]) =>
    fields.filter((item) => item != null && item !== '').join('\n');
  let initialFCLTruckingData = getInitialFCLTruckingData();
  (((initialFCLTruckingData.charges ??= [])[0] ??= {} as any).currency = loginBean.localCurrency);

  return {
    pickupAtCargoCode: quoteBean?.pickupAtCargoCode || '',
    pickupAtCargoName: quoteBean?.pickupAtCargoName || '',
    pickupAtCargoName1: quoteBean?.pickupAtCargoName1 || '',

    pickupAtCargoDetails: joinNonEmpty([
      quoteBean?.pickupAtCargoName,
      quoteBean?.pickupAtCargoAddress1,
      quoteBean?.pickupAtCargoAddress2,
      quoteBean?.pickupAtCargoAddress3,
      quoteBean?.pickupAtCargoAddress4,
      quoteBean?.pickerContact,
      quoteBean?.pickerPhone,
    ]),

    truckerCode: quoteBean?.truckerCode || '',
    truckerName: quoteBean?.truckerName || '',

    truckerCodeDetails: joinNonEmpty([
      quoteBean?.truckerName,
      quoteBean?.truckerAddress1,
      quoteBean?.truckerAddress2,
      quoteBean?.truckerAddress3,
      quoteBean?.truckerContact,
      quoteBean?.truckerPhone,
    ]),

    pickupTime: quoteBean?.pickupTime || '',
    pickupTimeTo: quoteBean?.pickupTimeTo || '',
    pickupDate: quoteBean?.pickupDate || '',

    pickupInstruction: joinNonEmpty([
      quoteBean?.pickupInstruction1,
      quoteBean?.pickupInstruction2,
      quoteBean?.pickupInstruction3,
      quoteBean?.pickupInstruction4,
      quoteBean?.pickupInstruction5,
      quoteBean?.pickupInstruction6,
      quoteBean?.pickupInstruction7,
    ]),
    charges: quoteBean?.pickupChargeBeanList?.length > 0? quoteBean?.pickupChargeBeanList : initialFCLTruckingData.charges,
    // .map((charge) => ({
    //   expensesId: 0,
    //   moduleId: 0,
    //   charge: String(charge.charge) || '',
    //   expense: Number(charge.expense),
    //   income: Number(charge.income),
    //   currency: String(charge.currency),
    // }))
  };
};
