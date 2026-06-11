import {
  createBlankBeanRow,
  initialCargoRow,
  initialDimRow,
  initialHazRow,
  makeRowId,
  RoeRow,
} from 'phoenix-common-react';

import {
  BookingQuoteChargeBeanFull,
  ChargesState,
  ChargeType,
  RateDetailsFormData,
  RelayFlag,
} from 'phoenix-common-react';

const joinLines = (...parts: (string | null | undefined)[]): string =>
  parts.filter(Boolean).join('\n');

// Spec: PHX-127235 - Value in Pre-Booking after copied from Import Quote
// | Import Quote | Pre-Booking | Result      |
// |--------------|-------------|-------------|
// | CFS/CFS      | DOOR/CFS    | DOOR/CFS    |
// | CFS/DOOR     | DOOR/CFS    | DOOR/DOOR   |
// | DOOR/CFS     | DOOR/CFS    | DOOR/CFS    |
// | DOOR/DOOR    | DOOR/CFS    | DOOR/DOOR   |
// | CFS/CFS      | CFS/DOOR    | CFS/DOOR    |
// | CFS/DOOR     | CFS/DOOR    | CFS/DOOR    |
// | DOOR/CFS     | CFS/DOOR    | DOOR/DOOR   |
// | DOOR/DOOR    | CFS/DOOR    | DOOR/DOOR   |
// | CFS/CFS      | DOOR/DOOR   | DOOR/DOOR   |
// | CFS/DOOR     | DOOR/DOOR   | DOOR/DOOR   |
// | DOOR/CFS     | DOOR/DOOR   | DOOR/DOOR   |
// | DOOR/DOOR    | DOOR/DOOR   | DOOR/DOOR   |
// | CFS/CFS      | CFS/CFS     | CFS/CFS     |
// | CFS/DOOR     | CFS/CFS     | CFS/DOOR    |
// | DOOR/CFS     | CFS/CFS     | DOOR/CFS    |
// | DOOR/DOOR    | CFS/CFS     | DOOR/DOOR   |
export const resolveTermsAfterQuotePopulate = (
  quoteTerms: string,
  prebookTerms: string
): string => {
  const q = (quoteTerms ?? '').toUpperCase();
  const p = (prebookTerms ?? '').toUpperCase();

  if (q === 'CFCF' && p === 'DRCF') return 'DRCF'; // CFS/CFS  + DOOR/CFS  = DOOR/CFS
  if (q === 'CFDR' && p === 'DRCF') return 'DRDR'; // CFS/DOOR + DOOR/CFS  = DOOR/DOOR
  if (q === 'DRCF' && p === 'DRCF') return 'DRCF'; // DOOR/CFS + DOOR/CFS  = DOOR/CFS
  if (q === 'DRDR' && p === 'DRCF') return 'DRDR'; // DOOR/DOOR+ DOOR/CFS  = DOOR/DOOR

  if (q === 'CFCF' && p === 'CFDR') return 'CFDR'; // CFS/CFS  + CFS/DOOR  = CFS/DOOR
  if (q === 'CFDR' && p === 'CFDR') return 'CFDR'; // CFS/DOOR + CFS/DOOR  = CFS/DOOR
  if (q === 'DRCF' && p === 'CFDR') return 'DRDR'; // DOOR/CFS + CFS/DOOR  = DOOR/DOOR
  if (q === 'DRDR' && p === 'CFDR') return 'DRDR'; // DOOR/DOOR+ CFS/DOOR  = DOOR/DOOR

  if (q === 'CFCF' && p === 'DRDR') return 'DRDR'; // CFS/CFS  + DOOR/DOOR = DOOR/DOOR
  if (q === 'CFDR' && p === 'DRDR') return 'DRDR'; // CFS/DOOR + DOOR/DOOR = DOOR/DOOR
  if (q === 'DRCF' && p === 'DRDR') return 'DRDR'; // DOOR/CFS + DOOR/DOOR = DOOR/DOOR
  if (q === 'DRDR' && p === 'DRDR') return 'DRDR'; // DOOR/DOOR+ DOOR/DOOR = DOOR/DOOR

  if (q === 'CFCF' && p === 'CFCF') return 'CFCF'; // CFS/CFS  + CFS/CFS  = CFS/CFS
  if (q === 'CFDR' && p === 'CFCF') return 'CFDR'; // CFS/DOOR + CFS/CFS  = CFS/DOOR
  if (q === 'DRCF' && p === 'CFCF') return 'DRCF'; // DOOR/CFS + CFS/CFS  = DOOR/CFS
  if (q === 'DRDR' && p === 'CFCF') return 'DRDR'; // DOOR/DOOR+ CFS/CFS  = DOOR/DOOR

  return q;
};
function packaging(data: string) {
  if (data == 'DCONTAINERS') {
    return 'ddcontainers';
  } else if (data == 'LIFTVANS') {
    return 'liftvans';
  } else if (data == 'SHRINKWRAPPEDPALLETS') {
    return 'shrinkwrappedpallets';
  } else if (data == 'IBCS') {
    return 'ibcs';
  } else {
    return data.toLowerCase();
    // return data.charAt(0).toUpperCase() + data.slice(1).toLowerCase();
  }
}
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

const mapHazRows = (list: any[]) => {
  if (!list?.length) return [{ ...initialHazRow }];
  return list.map((h) => ({
    ...initialHazRow,
    imoClass: h.imcoClass ?? '-1',
    imoSubclass: h.imoSubClass ?? '-1',
    unNumber: h.unNumber ?? '',
    imoPage: h.imcoPage ?? '',
    pkgGroup: h.packagingGroup ?? '-1',
    flashpointC: String(h.flashPointCelsius ?? '0'),
    flashpointF: String(h.flashpointFahrenheit ?? '0'),
    degreeUnit: h.degreeUnit ?? 'C',
    pieces: String(h.noOfpieces ?? '0'),
    packaging: packaging(h.packaging ?? '-1'),
    weight: String(h.weight ?? '0'),
    properShippingName: h.shipperName1 ?? '',
    shippingName: h.shippingName ?? '',
    technicalName: h.techName1 ?? '',
    placard1: h.plackard1 ?? '',
    placard2: h.plackard2 ?? '',
    emergencyNumber: h.emergencyPhone ?? '',
    emergencyContact: h.emergencyCotact ?? '',
    quantity: h.quantity == null ? '-1' : String(h.quantity),
    shipperName1: h.shipperName1 ?? '',
    shipperName2: h.shipperName2 ?? '',
    commodity: h.commodity ?? '',
  }));
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
  if (code === 'E') return 'E';
  if (code === 'I') return 'I';
  return code ?? '';
};

const mapYNToYesNo = (value: string | null): boolean => {
  if (value === 'Y') return true;
  if (value === 'N') return false;
  return false;
};

const mapClauses = (clauses: any[] | null): any[] => {
  if (!clauses?.length) return [];
  return clauses;
};

const mapStatsus = (code: string | null): string => {
  if (code === 'I') return 'Preliminary';
  if (code === 'C') return 'Cancelled';
};

export const mapMainDetailsFromPopulate = (bean: any) => ({
  type: bean.bookingQuoteType ?? '',
  reference: bean.referenceNumber ? String(bean.referenceNumber) : '',
  userReference: bean.userReference ?? '',
  // ? { code: bean.userReference, name: bean.userReference, displayValue: bean.userReference }
  // : null,
  status: mapStatsus(bean.status) ?? '',
  clauses: mapClauses(bean.clauses),
  hold: mapYNToYesNo(bean.hold),
  followUp: mapYNToYesNo(bean.followUpFlag),
  preBookingChannel: bean.receivedVia,
  direction: mapDirection(bean.direction),
  pendingFinal: mapYNToYesNo(bean.pendingFinalBookingStatus),
  truckQuote: mapYNToYesNo(bean.truckQuote),
  quoteType: bean.quoteType === 'LCL Quote' ? 'L' : (bean.quoteType ?? ''),
  billingCompany: bean.bookingQuoteCustomerBean?.billingCompany ?? '',
  handlingOffice: bean.handlingOffice ?? '',
  bookingOffice: bean.receivedFromName ?? '',
  createdBy: bean.takenBy ?? '',
  createdOn: bean.bookQuoteDate,
  routed: bean.routed === 'Y' ? 'Y' : bean.routed === 'N' ? 'N' : 'N',
  modeOfTransport: bean.modeOfTransport ?? '',
  updatedBy: bean.updatedBy ?? '',
  updatedOn: bean.updatedOn,
  importBookingStatus: bean.importBookingStatus ?? '',
  importBookingStatusList: Array.isArray(bean.importBookingStatusList)
    ? bean.importBookingStatusList
    : [],
  agentBooking: mapYNToYesNo(bean.agentBooking),
  exportBookingNumber: bean.exportBookingNumber,
  wwablnumber: bean.wwaBlNumber ?? '',
  importQuoteNumber: bean.importQuoteNumber ?? '',
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

  return {
    pickupNeeded: quoteBean.pickupNeeded ?? '',
    terms: quoteBean?.terms ?? '',
    termsLabel: quoteBean?.termName || '',
    deliveryType: quoteBean?.cfsDeliveryType ?? '',
    preCarriageType: r.preCarriageType ?? '',
    preCarriageBy: r.preCarriageBy ?? '',
    preCarriageEts: r.preCarriageETS ? new Date(r.preCarriageETS) : null,
    vesselCode: r.vesselCode ?? '',
    vesselName: r.vessel ?? '',
    voyage: r.voyage ?? '',
    carrierCode: r.carrierCode ?? '',
    placeOfReceiptCode: r.originCode ?? '',
    placeOfReceiptUnCode: r.originUncode ?? '',
    placeOfReceiptName: r.placeOfReceiptName4 ?? '',
    placeOfReceiptEtd: r.placeOfReceiptOrgEtdDate
      ? new Date(r.placeOfReceiptOrgEtdDate)
      : null,
    placeOfReceiptRegion: r.originRegionCode ?? '',
    placeOfReceiptPickupFrom: r.placeOfReceiptName1 ?? '',
    placeOfReceiptPickupFromName: r.placeOfReceiptName2 ?? '',
    placeOfReceiptPickupTo: r.placeOfReceiptName3 ?? '',
    placeOfReceiptPickupToName: r.placeOfReceiptName4 ?? '',
    consolidationCfsCode: r.consolidationCFSCode ?? '',
    consolidationCfsUnCode: r.consolidationCFSUNCode ?? '',
    consolidationCfsName: r.consolidationCFSName ?? '',
    consolidationCfsEtd: r.consolidationCFSDate
      ? new Date(r.consolidationCFSDate)
      : null,
    consolidationCfsRegion: r.consolidationCFSRegionCode ?? '',
    portOfLoadingCode: r.loadCode ?? '',
    portOfLoadingUnCode: r.loadUnCode ?? '',
    portOfLoadingName: r.loadName ?? '',
    portOfLoadingEts: r.portOfLoadingOrgEtsDate
      ? new Date(r.portOfLoadingOrgEtsDate)
      : null,
    portOfLoadingRegion: r.loadRegionCode ?? '',
    transshipmentPorts: mapTransshipmentPorts(
      quoteBean?.bookingQuoteRoutingBeanlist
    ),
    portOfDischargeCode: r.dischargeCode ?? '',
    portOfDischargeUnCode: r.dischargeUnCode ?? '',
    portOfDischargeName: r.dischargeName ?? '',
    portOfDischargeEta: r.etaDate ? new Date(r.etaDate) : null,
    portOfDischargeRegion: r.dischargeRegionCode ?? '',
    deconsolidationCfsCode: r.deConsolidationCode ?? '',
    deconsolidationCfsUnCode: r.deConsolidationUNCode ?? '',
    deconsolidationCfsName: r.deConsolidationName ?? '',
    deconsolidationCfsEta: r.deConsolidationDate
      ? new Date(r.deConsolidationDate)
      : null,
    deconsolidationCfsRegion: r.deconsolidationRegionCode ?? '',
    destinationCfsCode: r.finalCFSCode ?? '',
    destinationCfsUnCode: r.finalCFSUNCode ?? '',
    destinationCfsName: r.finalCFSName ?? '',
    destinationCfsEta: r.finalCFSDate ? new Date(r.finalCFSDate) : null,
    destinationCfsRegion: r.finalCFSRegionCode ?? '',
    placeOfDeliveryCode: r.destinationCode ?? '',
    placeOfDeliveryUnCode: r.destinationUnCode ?? r.placeOfDeliveryUnCode ?? '',
    placeOfDeliveryType: r.placeOfDeliveryName2Selection ?? '',
    placeOfDeliveryName: r.placeOfDeliveryName1 ?? '',
    placeOfDeliveryEta: r.etaDestination ? new Date(r.etaDestination) : null,
    placeOfDeliveryRegion: r.destinationRegionCode ?? '',
    manufacturerNames: mapManufacturerNames(r.manufacturerDetailBean),
    cargoReadDate: new Date(r.cargoReadDate),
    agentName: r.agentName,
    agentEmail: r.agentEmail,
    warehouse: r.warehouse ?? '',
    destinationWarehouse: r.warehouse ?? '',
    deliveryReference: r.warehouseDeliveryRef ?? '',
    cfsCutoffDate: r.documentCutoffDate ? new Date(r.documentCutoffDate) : null,
    cfsCutoffTime: r.documentationCutOffTime ?? '',
    gatewayCutoffDate: r.gatewayCutoffDate
      ? new Date(r.gatewayCutoffDate)
      : null,
    gatewayCutoffTime: r.gatewayCutoffTime ?? '',
    docDelivery: r.documentDeliveryCode ?? '',
    docContact: r.documentDeliveryContact ?? '',
  };
};

export const mapCustomerFromPopulate = (quoteBean: any) => {
  const cust = quoteBean?.bookingQuoteCustomerBean;
  const bookingQuoteBean = quoteBean;

  if (!cust) return null;

  const s = cust.shipperBean;

  const con = cust.consigneeBean;
  const n = cust.notifyBean;
  const f = cust.forwarderBean;
  const customerFields = {
    customerCode: cust.customerCode ?? '',
    customerName: joinLines(
      cust?.customerName,
      cust?.customerName2,
      cust?.customerName3,
      cust?.customerName4,
      cust?.customerName5
    ),
    customerAddress: joinLines(
      cust?.customerAddress,
      cust?.customerAddress2,
      cust?.customerAddress3
    ),
    eoriNumber: cust?.customerEoriNumber ?? '',
    namedAccount: cust?.customerNamedAccount ?? '',
    accuRateProfile: cust?.accurateProfile ?? '',
    prepaidCollect: bookingQuoteBean?.prepaidCredit ?? '',
    rateControllingEntity: bookingQuoteBean?.rateControllingEntity ?? '',
    controllingEntity: bookingQuoteBean?.nomination ?? '',
    customerType: cust?.customerType ?? '',
    customersContactName: cust?.customerContactName ?? '',
    salesRepresentative: cust?.salesRepresentative ?? '',
    customerEmail: cust?.customerEmail ?? '',
    customerReference: cust?.customerReference ?? '',
    truckSellRateProfile: cust?.truckSellRateProfile ?? '',

    consigneeName: joinLines(
      con?.consigneeName,
      con?.consigneeName1,
      con?.consigneeName3,
      con?.consigneeName4,
      con?.consigneeName5
    ),
    consigneeAddress: joinLines(
      con?.consigneeAddress1,
      con?.consigneeAddress2,
      con?.consigneeAddress3
    ),

    consigneeEmail: con?.consigneeEmail ?? '',
    consigneeContactName: con?.consigneeContact ?? '',
    consigneeReference: con?.consigneeReference ?? '',
    consigneePhoneNumber: con?.consigneePhone ?? '',

    // consigneeName: s?.consigneeName ?? '',
    // consigneeAddress: s?.customerEmail ?? '',
    // consigneeEmail: s?.customerEmail ?? '',
    // consigneeContactName: s?.customerEmail ?? '',

    // consigneePhoneNumber: s?.customerEmail ?? '',
  };

  return {
    defaultForm: customerFields,
    lclForm: customerFields,
    customerMoreDetails: {
      consigneeCode: con?.consigneeCode ?? '',
      consigneeName: joinLines(
        con?.consigneeName,
        con?.consigneeName1,
        con?.consigneeName3,
        con?.consigneeName4,
        con?.consigneeName5
      ),
      consigneeAddress: joinLines(
        con?.consigneeAddress1,
        con?.consigneeAddress2,
        con?.consigneeAddress3
      ),
      consigneeCity: con?.consigeeCity ?? '',
      consigneeState: con?.consigneeState ?? '',
      consigneeZipCode: con?.consigneeZipCode ?? '',
      consigneeCountry: con?.consigneeCountry ?? '',
      consigneeContactName: con?.consigneeContact ?? '',
      consigneePhoneNumber: con?.consigneePhone ?? '',
      consigneeEmail: con?.consigneeEmail ?? '',
      consigneeFax: con?.consigneeFax ?? '',
      consigneeReference: con?.consigneeReference ?? '',

      notifyPartyName: joinLines(
        n?.notifyName,
        n?.notifyName1,
        n?.notifyName3,
        n?.notifyName3,
        n?.notifyName5
      ),
      notifyPartyAddress: joinLines(
        n?.notifyAddress1,
        n?.notifyAddress2,
        n?.notifyAddress3
      ),

      notifyPartyEmail: n?.notifyEmail ?? '',
      notifyPartyContactName: n?.notifyConact ?? '',
      notifyPartyReference: n?.notifyReference ?? '',
      notifyPartyPhoneNumber: n?.notifyPhone ?? '',

      shipperName: joinLines(
        s?.shipperName,
        s?.shipperName2,
        s?.shipperName3,
        s?.shipperName4,
        s?.shipperName5
      ),
      shipperAddress: joinLines(
        s?.shipperAddress1,
        s?.shipperAddress2,
        s?.shipperAddress3
      ),

      shipperEmail: s?.shipperEmail ?? '',
      shipperContactName: s?.shipperContact ?? '',

      shipperReference: s?.shipperReference ?? '',

      shipperPhoneNumber: s?.shipperPhone ?? '',

      trackingCode: [cust?.trackingCustomer1, cust?.trackingCustomer2]
        .filter(Boolean)
        .join('-'),
      wwaReference: cust?.wwaReference ?? '',
      purchaseOrder: cust?.purchaseOrderNumber ?? '',
    },
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

const VALID_RELAY_FLAGS = new Set<RelayFlag>(['U', 'A', 'G', 'T', 'C', 'I', 'D']);

const toRelayFlag = (code: string | undefined): RelayFlag => {
  const upper = (code ?? '').toUpperCase() as RelayFlag;
  return VALID_RELAY_FLAGS.has(upper) ? upper : 'U';
};

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
    incomeChargeDetails: {
      chargeCode: bean.chargeCode,
      chargeDescription: bean.chargeDescription,
      chargeType: bean.chargeType,
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
    prepaidCollect: bean.payType ?? '',
    vendor: bean.vendor ?? '',
    vendorReference: bean.expenseVendorReference ?? '',
    invoiceNumber: bean.invoiceNumber ?? '',
    invoiceDate: bean.invoiceDate ?? '',
    rateOfExchangeType: '',
    rowId: bean.rowId,
    equipmentDetails: bean.equipmentDetail ?? '',
    numberOfContainer: 0,
    pnlExpense: 0,
    cfsFee: '',

    isLinkedWithPhoenix: bean.linked ?? false,
    rowSequence: bean.recordNumber ?? 0,
    relayFlag: bean.relayFlag,
    isPrintOnDocument: bean.printOndocument === 'Y',
    transactionalFlag: bean.controlFlag,
    isVatBean: false,
    isEnableForEdit: true,
    isFiltered: false,
    isZeroAllowed: true,
    isTruckingRates: false,
    additionalRatingFlags: {},
    transmittedFlag: '',

    actualLenght: 0,
    fromLenght: 0,
    actualWeight: 0,
    fromWeight: 0,

    isOldRate: bean.oldRate ?? false,
    isCalculatedZero: false,
    isOFRAccurate: false,
    isFileROE: false,

    vatPercent: bean.taxPercent ?? '0',
    vatType: '',
    vatAmount: bean.vatAmount ?? 0,
    taxKey: bean.taxKey ?? '',
    taxCode: bean.taxCode ?? '',
    taxText: bean.taxText ?? '',
    applyFor: bean.applyFor ?? '',
    glCode: bean.glCode ?? '',

    overridden: bean.overridden ?? false,

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

    userDefineChargeDescription: bean.userDefineChargeDescription ?? '',

    measureFrom: '',
    measureTo: '',
    aspect: bean.aspect ?? '',

    companyId: bean.company ?? '',
    bookingRateId: String(bean.bookingQuoteRateId ?? ''),
    truckingChargeLinkId: bean.truckingChargeLinkId ?? 0,
    rateCompanyId: bean.rateCompanyId ?? 0,
    lotRateId: '',

    spotRateDetailsId: bean.spotRateDetailsId ?? '',
    rateDetailId: String(bean.bookingQuoteRateId ?? ''),
    spotRateKey: bean.spotRateKey ?? '',
    spotRateFlag: bean.spotRateFlag ?? 0,
    spotRateEfftectiveDate: '',
    ExpirationDate: '',
    accurateSpotRateKey: bean.accurateSpotRateKey ?? '',
    isChargeRest: bean.chargeRest ?? false,
    sprKey: bean.sprKey ?? '',

    fmcChargeType: bean.fmcChargeType ?? '',
    tabNumber: 0,
    bookingType: '',
    isAdditionalInvCharge: '',
    oinvoiceNumber: '',
    isNewlyAddedRow: false,
    isFocusSet: false,
    rateTypeFlag: 0,
    isCallFromAccurate: bean.isCallFromAccurate ?? null,
    isFirstTimeRatesAdded: null,
    taxAmount: bean.taxAmount ?? null,
    taxLocalAmount: bean.taxLocalAmount ?? null,

    truckerRateExpired: bean.truckerRateExpired ?? '',
    truckChargeGroup: bean.truckChargeGroup ?? '',
    truckCity: bean.truckCity ?? '',
    truckZipCountry: bean.truckZipCountry ?? '',
    truckChargeNotes: bean.truckChargeNotes ?? '',
    truckerName: bean.truckerName ?? '',
    truckRateId: bean.truckRateId ?? 0,
    cfsName: bean.cfsName ?? '',
    doorCountry: bean.doorCountry ?? '',
    euVatRuleId: bean.euVatRuleId ?? 0,
    pickupId: bean.pickupId ?? '',
    expensePickupId: bean.expensePickupId ?? bean.pickupId ?? '',
    truckRate: bean.truckRate ?? {},
    truckRateDetailsFileId: bean.truckRateDetailsFileId ?? 0,
  };
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
    packaging: packaging(c.packaging ?? '-1'),
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
    hazardous: c.hazardousCode ?? '-1',
    uom: c.uom ?? 'M',
    docRef: c.documentReferences ?? '-1',
    isDimension: c.dimension ?? false,
    overLengthTransmit: c.overLengthTransmit ?? false,
    overWeightTransmit: c.overWeightTransmit ?? false,
    hsCode: c.cargoHsCode ?? '',
    sensitiveCargo: c.sensitiveCargo ?? false,
    dimRows: mapDimRows(c.cargoDimensionBeanList),
    hazRows: mapHazRows(c.bookingMultiCargoHazardousList),
  }));

  // NEW single cargo row
  const fclCargoRows = [
    {
      ...initialCargoRow,

      numberOfContainer1: String(cargoBean?.container1 ?? ''),
      containerType1: `${cargoBean?.containerSize1 ?? ''}-${cargoBean?.containerType1 ?? ''}`,
      // containerSize1: cargoBean?.containerSize1 ?? '',

      numberOfContainer2: String(cargoBean?.container2 ?? ''),
      containerType2: `${cargoBean?.containerSize2 ?? ''}-${cargoBean?.containerType2 ?? ''}`,
      // containerSize2: cargoBean?.containerSize2 ?? '',

      numberOfContainer3: String(cargoBean?.container3 ?? ''),
      containerType3: `${cargoBean?.containerSize3 ?? ''}-${cargoBean?.containerType3 ?? ''}`,
      // containerSize3: cargoBean?.containerSize3 ?? '',

      marks: cargoBean?.marks ?? '',
      pieces: String(cargoBean?.numberOfPieces ?? ''),
      packaging: packaging(cargoBean.packaging ?? '-1'),

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

      hazardous: cargoBean?.hazardousCode ? cargoBean?.hazardousCode : '-1',

      uom: cargoBean?.uom ?? 'M',
      docRef: cargoBean?.documentReferences ?? '-1',

      isDimension: cargoBean?.dimension ?? false,
      overLengthTransmit: cargoBean?.overLengthTransmit ?? false,
      overWeightTransmit: cargoBean?.overWeightTransmit ?? false,

      hsCode: cargoBean?.cargoHsCode ?? '',
      sensitiveCargo: cargoBean?.sensitiveCargo ?? false,

      dimRows: mapDimRows(cargoBean?.cargoDimensionBeanList),
      hazRows: mapHazRows(hzardousList),

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

    internalComment: multiList[0]?.lotCommentsValue ?? '',
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
    })),
  };
};

export interface MappedRateDetailsPopulate {
  charges: ChargesState;
  ratingType: string;
  roeType: string;
  rateOfExchange: RateDetailsFormData['rateOfExchange'];
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
    if (!hasPlc) finalRows.push(createBlankBeanRow('PLC', currency));
  }

  return {
    charges: {
      rateDetails: rows,
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
  };
};
