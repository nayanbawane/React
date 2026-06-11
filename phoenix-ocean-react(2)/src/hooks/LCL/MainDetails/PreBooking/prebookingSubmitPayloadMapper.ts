import { Commodity } from './../../../../../../phoenix-common-react/src/features/LCL/Components/TruckingDetails/CarrierSelectDetails/CarrierSelectDetails.types';
import { ControlFlag } from './../../../../../../phoenix-common-react/src/types/LCL/common.types';
import dayjs from 'dayjs';

function getFormattedDate(date: Date | string | null | undefined): string {
  if (!date) return '';
  return dayjs(date).format('DD-MMM-YYYY').toUpperCase();
}
const fmtTime = (v: any): string => str(v).replace(/\s+([AaPp][Mm])$/, '$1');

function formateDate(date: Date) {
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');

  const seconds = date.getSeconds().toString().padStart(2, '0');

  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12 || 12;

  return `${month} ${day}, ${year} ${hours}:${minutes}:${seconds} ${ampm}`;
}

export const replacePleaseSelect = (value: string | null): string => {
  return value === 'Please Select' ? '-1' : (value ?? '-1');
};

const extractCountryCode = (v: any): string => {
  const s = str(v);
  if (!s) return '';
  if (s.includes(' - ')) return s.split(' - ')[0].trim();
  const hyphenIdx = s.indexOf('-');
  if (hyphenIdx > 0 && hyphenIdx <= 3) return s.substring(0, hyphenIdx).trim();
  return s.trim();
};
const str = (v: any): string => (v == null ? '' : String(v));

const num = (v: any, fallback = 0): number => {
  if (v === '' || v === null || v === undefined) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const strOrNull = (v: any): string | null =>
  v != null && v !== '' ? String(v) : null;

const normalizeCarrierCode = (val: any) => {
  const v = str(val);
  if (v.includes(' - ')) {
    return v.split(' - ')[0].substring(0, 10);
  }
  return v.substring(0, 10);
};

const normalizeChargeCode = (code: any) => {
  return str(code)
    .replace(/[^A-Za-z0-9]/g, '')
    .substring(0, 4);
};

export const formatName = (v: any) => {
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

const formatAddress = (v: any) => {
  if (
    v == null ||
    (typeof v === 'string' && v.trim() === '') ||
    (Array.isArray(v) && v.length === 0) ||
    (typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0)
  ) {
    return { addr1: '', addr2: '', addr3: '', addr4: '', addr5: '' };
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
    addr1: (lines[0] || '').substring(0, 50),
    addr2: (lines[1] || '').substring(0, 50),
    addr3: (lines[2] || '').substring(0, 50),
    addr4: (lines[3] || '').substring(0, 50),
    addr5: (lines[4] || '').substring(0, 50),
  };
};

function buildShipperBean(
  more: any = {},
  lclForm: any = {},
  customer: any = {}
) {
  const address = formatAddress(customer?.shipperAddress || {});
  const name = formatName(customer?.shipperName || {});

  return {
    shipperReference: str(customer?.shipperReference) || '',
    shipperCode: str(customer?.shipperCode) || '',
    shipperName: name?.name1 || '',

    shipperAddress1: address?.addr1 || '',
    shipperAddress2: address?.addr2 || '',
    shipperAddress3: address?.addr3 || '',

    shipperCity: str(customer?.shipperCity) || '',

    shipperPhone: str(customer?.shipperPhoneNumber) || '',

    shipperEmail: str(customer?.shipperEmail) || '',
    shipperCellphone: str(customer?.shipperCellphone) || '',
    shipperTelephone: str(customer?.shipperPhoneNumber) || '',
    shipperFax: str(customer?.shipperFax) || '',

    shipperContact: str(customer?.shipperContactName) || '',

    namedAccount: str(customer?.namedAccount) || '',
    namedAccountFullName: str(customer?.namedAccountFullName) || '',

    creditHold: str(customer?.creditHold) || 'N',

    shipperState: str(customer?.shipperState) || '',
    shipperZip: str(customer?.shipperZipCode) || '',
    shipperCountry: str(customer?.shipperCountry) || '',

    shipperName2: name?.name2 || '',
    shipperName3: name?.name3 || '',
    shipperName4: name?.name4 || '',
    shipperName5: name?.name5 || '',

    isNewCustomerWidgetShownForCanadaEmanifest:
      customer?.isNewCustomerWidgetShownForCanadaEmanifest ?? false,

    isLicense: customer?.isLicense ?? false,

    customerITNo: str(customer?.customerITNo) || '',

    asAgentForToggle: str(customer?.asAgentForToggle) || 'N',

    isCustomerDetailsFromBooking:
      customer?.isCustomerDetailsFromBooking ?? true,

    shipperStateId: str(customer?.shipperStateId) || '',
    shipperStateName: str(customer?.shipperStateName) || '',

    customerType: str(lclForm?.customerType) || '',
  };
}

function buildConsigneeBean(more: any = {}, customer: any = {}) {
  const address = formatAddress(customer?.consigneeAddress || {});
  const name = formatName(customer?.consigneeName || {});

  return {
    consigneeReference: str(customer?.consigneeReference) || '',
    consigneeCode: str(customer?.consigneeCode) || '',
    consigneeName: name.name1 || '',
    consigneeName1: name.name2 || '',

    consigneeAddress1: address?.addr1 || '',
    consigneeAddress2: address?.addr2 || '',
    consigneeAddress3: address?.addr3 || '',

    consigneePhone: str(customer?.consigneePhoneNumber) || '',
    consigneeFax: str(customer?.consigneeFax) || '',
    consigneeContact: str(customer?.consigneeContactName) || '',

    consigeeCity: str(customer?.consigneeCity) || '',

    consigneeState: str(customer?.consigneeState) || '',
    consigneeCountry: str(customer?.consigneeCountry) || '',
    consigneeZipCode: str(customer?.consigneeZipCode) || '',
    consigneeEmail: str(customer?.consigneeEmail) || '',

    consigneeName3: name.name3 || '',
    consigneeName4: name.name4 || '',
    consigneeName5: name.name5 || '',

    isLicense: customer?.isLicense ?? false,
    isCustomerDetailsFromBooking:
      customer?.isCustomerDetailsFromBooking ?? true,

    consigneeStateName: str(customer?.consigneeStateName) || '',
    consigneeStateId: str(customer?.consigneeStateId) || '',
  };
}

function buildForwarderBean(more: any = {}, customer: any = {}) {
  const address = formatAddress(customer?.forwarderAddress || {});
  const name = formatName(customer?.forwarderName || {});

  return {
    forwarderReference: str(customer?.forwarderReference) || '',
    forwarderCode: str(customer?.forwarderCode) || '',
    forwarderName: name.name1 || '',

    forwarderAddress1: address?.addr1 || '',
    forwarderAddress2: address?.addr2 || '',
    forwarderAddress3: address?.addr3 || '',

    forwarderPhone: str(customer?.forwarderPhoneNumber) || '',
    forwarderFax: str(customer?.forwarderFax) || '',
    forwarderContact: str(customer?.forwarderContactName) || '',

    forwarderName2: name.name2 || '',
    forwarderName3: name.name3 || '',
    forwarderName4: name.name4 || '',
    forwarderName5: name.name5 || '',

    forwarderState: str(customer?.forwarderState) || '',
    forwarderZip: str(customer?.forwarderZipCode) || '',
    forwarderCountry: str(customer?.forwarderCountry) || '',
    forwarderCity: str(customer?.forwarderCity) || '',
    forwarderEmail: str(customer?.forwarderEmail) || '',

    isLicense: customer?.isLicense ?? false,
    isCustomerDetailsFromBooking:
      customer?.isCustomerDetailsFromBooking ?? true,

    forwarderStateId: str(customer?.forwarderStateId) || '',
    forwarderStateName: str(customer?.forwarderStateName) || '',
  };
}

function buildAgentBean(more: any, customer: any) {
  return {
    isLicense: more?.isLicense ?? false,
  };
}

function buildActualForwarderBean(more: any = {}, customer: any = {}) {
  const address = formatAddress(customer?.actualForwarderAddress || {});
  const name = formatName(customer?.actualForwarderName || {});
  return {
    forwarderReference: str(customer?.actualForwarderReference) || '',
    forwarderCode: str(customer?.actualForwarderCode) || '',
    forwarderName: name.name1 || '',

    forwarderAddress1: address?.addr1 || '',
    forwarderAddress2: address?.addr2 || '',
    forwarderAddress3: address?.addr3 || '',

    forwarderPhone: str(customer?.actualForwarderPhone) || '',
    forwarderFax: str(customer?.actualForwarderFax) || '',
    forwarderContact: str(customer?.actualForwarderContact) || '',

    forwarderName2: name.name2 || '',
    forwarderName3: name.name3 || '',
    forwarderName4: name.name4 || '',
    forwarderName5: name.name5 || '',

    forwarderState: str(customer?.actualForwarderState) || '',
    forwarderZip: str(customer?.actualForwarderZip) || '',
    forwarderCountry: str(customer?.actualForwarderCountry) || '',
    forwarderCity: str(customer?.actualForwarderCity) || '',
    forwarderEmail: str(customer?.actualForwarderEmail) || '',

    isLicense: customer?.actualForwarderIsLicense ?? false,
    isCustomerDetailsFromBooking:
      customer?.actualForwarderIsCustomerDetailsFromBooking ?? true,

    forwarderStateId: str(customer?.actualForwarderStateId) || '',
    forwarderStateName: str(customer?.actualForwarderStateName) || '',
  };
}

function buildNotifyBean(customer: any = {}) {
  const address = formatAddress(customer?.notifyPartyAddress || {});
  const name = formatName(customer?.notifyPartyName || {});

  return {
    notifyReference: str(customer?.notifyPartyReference) || '',
    notifyCode: str(customer?.notifyPartyCode) || '',
    notifyName: name.name1 || '',
    notifyName1: name.name2 || '',

    notifyAddress1: address?.addr1 || '',
    notifyAddress2: address?.addr2 || '',
    notifyAddress3: address?.addr3 || '',

    notifyPhone: str(customer?.notifyPartyPhoneNumber) || '',
    notifyFax: str(customer?.notifyPartyFax) || '',

    namedAccount: str(customer?.notifyPartyNamedAccount) || '',
    namedAccountFullName: str(customer?.notifyPartyNamedAccountFullName) || '',

    notifyCity: str(customer?.notifyPartyCity) || '',
    notifyState: str(customer?.notifyPartyState) || '',
    notifyStateName: str(customer?.notifyPartyStateName) || '',
    notifyCountry: str(customer?.notifyPartyCountry) || '',
    notifyZipCode: str(customer?.notifyPartyZipCode) || '',

    notifyConact: str(customer?.notifyPartyContactName) || '',
    notifyEmail: str(customer?.notifyPartyEmail) || '',

    notifyName5: name.name5 || '',
    notifyName3: name.name3 || '',
    notifyName4: name.name4 || '',

    isCustomerDetailsFromBooking:
      customer?.notifyIsCustomerDetailsFromBooking ?? true,

    notifyStateId: str(customer?.notifyPartyStateId) || '',
  };
}

function buildBookingQuoteCustomerBean(customer: any = {}, main: any = {}) {
  const address = formatAddress(customer?.notifyPartyAddress || {});
  const name = formatName(customer?.customerName || {});
  const lclForm = customer?.lclForm ?? {};
  const more = customer?.customerMoreDetails ?? {};

  return {
    customerType: str(customer?.customerType) || 'S',

    salesRepresentative: str(customer?.salesRepresentative) || '',
    customerEmail: str(customer?.customerEmail) || '',

    purchaseOrderNumber: str(more?.purchaseOrder) || '',
    customerNamedAccount: str(customer?.namedAccount) || '',
    customerNamedAccountFullName:
      str(customer?.customerNamedAccountFullName) || '',
    customerCode: str(customer?.customerCode) || '',
    customerName: name.name1 || '',
    customerName2: name.name2 || '',
    customerName3: name.name3 || '',
    customerName4: name.name4 || '',
    customerName5: name.name5 || '',
    customerAddress: address?.addr1 || '',
    customerAddress2: address?.addr2 || '',
    customerAddress3: address?.addr3 || '',
    customerContactName: str(customer?.customersContactName) || '',
    customerReference: str(customer?.customerReference) || '',
    customerEoriNumber: str(customer?.eoriNumber) || '',

    shipperBean: buildShipperBean(more, lclForm, customer),
    consigneeBean: buildConsigneeBean(more, customer),
    forwarderBean: buildForwarderBean(more, customer),
    agentBean: buildAgentBean(more, customer),
    actualforwarderBean: buildActualForwarderBean(more, customer),

    accurateProfile: str(customer?.accuRateProfile) || '',

    wwaReference: str(more?.wwaReference) || '',

    billingCompany: str(main?.billingCompany) || '',

    notifyBean: buildNotifyBean(customer),

    isEnableTrackAndPrintUrlToggBtn:
      lclForm?.isEnableTrackAndPrintUrlToggBtn ?? false,

    truckSellRateProfile: str(lclForm?.truckSellRateProfile) || '',
  };
}

function buildBookingQuoteRoutingBean(routing: any = {}, loginbean: any = {}) {
  const r = routing?.routingFormData || {};

  return {
    agentName: str(r?.agentName) || '',
    agentEmail: str(r?.agentEmail) || '',
    preCarriageType: str(r?.preCarriageType) || '-1',
    preCarriageBy: str(r?.preCarriageBy) || '',
    vesselCode: str(r?.vesselCode) || '',
    vessel: str(r?.vesselName) || '',
    voyage: str(r?.voyage) || '',
    carrierCode: normalizeCarrierCode(str(r?.carrierCode)) || '',

    originCode: str(r?.placeOfReceiptCode) || '',
    originName:
      str(r?.placeOfReceiptName) || str(r?.placeOfReceiptPickupToName) || '',
    loadName: str(r?.portOfLoadingName) || '',
    loadCode: str(r?.portOfLoadingCode) || '',
    dischargeCode: str(r?.portOfDischargeCode) || '',
    dischargeName: str(r?.portOfDischargeName) || '',
    destinationCode: str(r?.placeOfDeliveryCode) || '',
    destinationName: str(r?.placeOfDeliveryName) || '',
    finalCFSCode: str(r?.destinationCfsCode) || '',
    finalCFSName: str(r?.destinationCfsName) || '',

    placeOfReceiptName1: str(r?.placeOfReceiptPickupFrom) || '',
    placeOfReceiptName2: str(r?.placeOfReceiptPickupFromName) || '',
    placeOfReceiptName3: str(r?.placeOfReceiptPickupTo) || '',
    placeOfReceiptName4:
      str(r?.placeOfReceiptPickupToName) || str(r?.placeOfReceiptName) || '',

    placeOfReceiptOrgEtdDate: getFormattedDate(r?.placeOfReceiptEtd) || '',
    portOfLoadingOrgEtsDate: getFormattedDate(r?.portOfLoadingEts) || '',
    etaDate: getFormattedDate(r?.portOfDischargeEta) || '',
    etaDestination: getFormattedDate(r?.placeOfDeliveryEta) || '',
    finalCFSDate: getFormattedDate(r?.destinationCfsEta) || '',
    placeOfDeliveryName1: str(r?.placeOfDeliveryName) || '',
    placeOfDeliveryName2Selection: str(r?.placeOfDeliveryType) || '-1',
    cargoReadDate: getFormattedDate(r.cargoReadDate) || '',

    originUncode: str(r?.placeOfReceiptUnCode) || '',
    loadUnCode: str(r?.portOfLoadingUnCode) || '',
    dischargeUnCode: str(r?.portOfDischargeUnCode) || '',
    destinationUnCode: str(r?.placeOfDeliveryUnCode) || '',
    finalCFSUNCode: str(r?.destinationCfsUnCode) || '',
    placeOfDeliveryUnCode: str(r?.placeOfDeliveryUnCode) || '',

    deliveryDate: getFormattedDate(r?.destinationCfsEta) || '',
    deliveryTime: str(r?.cfsCutoffTime) || '',

    warehouse: str(r?.warehouse) || '',
    sailDate: getFormattedDate(r?.sailDate) || '',
    documentCutoffDate: getFormattedDate(r?.docCutoffDate) || '',
    documentationCutOffTime: str(r?.docCutoffTime) || '',

    warehouseName: str(r?.warehouseName) || '',

    originRegionCode: str(r?.placeOfReceiptRegion) || '',
    deconsolidationRegionCode: str(r?.deconsolidationCfsRegion) || '',
    finalCFSRegionCode: str(r?.destinationCfsRegion) || '',

    wwaScheudle: r?.wwaScheudle ?? false,

    warehouseDeliveryRef: str(r?.deliveryReference) || '',

    documentDeliveryCode: str(r?.docDelivery) || '',
    documentDeliveryName: str(r?.documentDeliveryName) || '',
    documentDeliveryAddress1: str(r?.documentDeliveryAddress1) || '',
    documentDeliveryAddress2: str(r?.documentDeliveryAddress2) || '',
    documentDeliveryAddress3: str(r?.documentDeliveryAddress3) || '',
    documentDeliveryContact: str(r?.docContact) || '',

    locationInformation: str(r?.locationInformation) || '',
    privateLocationInformation: str(r?.privateLocationInformation) || '',

    deConsolidationCode: str(r?.deconsolidationCfsCode) || '',
    deConsolidationName: str(r?.deconsolidationCfsName) || '',
    deConsolidationDate: getFormattedDate(r?.deconsolidationCfsEta) || '',

    consolidationCFSCode: str(r?.consolidationCfsCode) || '',
    consolidationCFSName: str(r?.consolidationCfsName) || '',

    consolidationCFSDate: getFormattedDate(r?.consolidationCfsEtd) || '',
    consolidationCFSRegionCode: str(r?.consolidationCfsRegion) || '',

    customsDeclaration: str(r?.customsDeclaration) || '',
    customsCutoffDate: str(r?.customsCutoffDate) || '',
    customsCutoffTime: str(r?.customsCutoffTime) || '',

    quoteNumber: num(r?.quoteNumber) ?? 0,
    rowNumber: num(r?.rowNumber) ?? 0,

    bookingQuoteChargeBeanList: [],

    manufacturerDetailsBean: {},

    oldVesselCode: str(r?.oldVesselCode) || '',
    oldVesselName: str(r?.oldVesselName) || '',
    oldVoyage: str(r?.oldVoyage) || '',

    preCarriageETS: getFormattedDate(r?.preCarriageEts) || '',

    isPrintSailingScheduleInConfirmationDocument:
      r?.isPrintSailingScheduleInConfirmationDocument ?? 'N',

    destinationCfsOrgEtaDate: str(r?.destinationCfsOrgEtaDate) || '',

    gatewayCutoffDate: str(r?.gatewayCutoffDate) || '',
    gatewayCutoffTime: str(r?.gatewayCutoffTime) || '',
  };
}

function buildCargoDimensionBeanList(dimRows: any[] = []) {
  if (!Array.isArray(dimRows) || dimRows.length === 0)
    return [
      {
        dimensionId: null,
        length: 0,
        width: 0,
        height: 0,
        unit: '',
        pieces: 0,
        cbm: 0,
        cbf: 0,
        kg: 0,
        lbs: 0,
        stackable: 'N',
        shipmentType: '',
        StackingType: '',
      },
    ];

  return dimRows.map((d: any) => ({
    dimensionId: d?.dimensionId ?? null,
    length: num(d?.length) ?? 0,
    width: num(d?.width) ?? 0,
    height: num(d?.height) ?? 0,
    unit: (str(d?.unit) || '').charAt(0) || '',
    pieces: num(d?.pieces) ?? 0,
    cbm: num(d?.cbm) ?? 0,
    cbf: num(d?.cbf) ?? 0,
    kg: num(d?.kg) ?? 0,
    lbs: num(d?.lbs) ?? 0,
    stackable: (str(d?.stackable) || '').charAt(0) || 'N',
    shipmentType: str(d?.shipmentType === 'FTL' ? 'F' : 'L') || 'L',
    StackingType: str(d?.stackingType) || '',
  }));
}

export function buildBookingQuoteCargoBean(c: any, moduleType: string) {
  const cargoRows = c?.cargoRows || c?.cargoState?.cargoRows || [];
  const firstRow = cargoRows[0] || {};
  const flags = c?.flags || c?.flagState?.flags || {};
  const instructions = c?.instructionState || c || {};
  const lotRows = c?.lotRows || c?.lotState?.lotRows || [];  

  return {
    container1: num(firstRow.numberOfContainer1),
    containerSize1: firstRow.containerType1.split('-')[0],
    containerType1: firstRow.containerType1.split('-')[1],
    container2: num(firstRow.numberOfContainer2),
    containerSize2: firstRow.containerType2.split('-')[0],
    containerType2: firstRow.containerType2.split('-')[1],
    container3: num(firstRow.numberOfContainer3),
    containerSize3: firstRow.containerType3.split('-')[0],
    containerType3: firstRow.containerType3.split('-')[1],
    commodity1: formatAddress(firstRow.descriptionOfGoods).addr1,
    commodity2: formatAddress(firstRow.descriptionOfGoods).addr2,
    commodity3: formatAddress(firstRow.descriptionOfGoods).addr3,
    commodity4: formatAddress(firstRow.descriptionOfGoods).addr4,
    commodity5: formatAddress(firstRow.descriptionOfGoods).addr5,
    weight: num(firstRow.kg),
    cube: num(firstRow.cbm),
    weightLbs: num(firstRow.lbs),
    cubeCbf: num(firstRow.cbf),
    hazardousCode:
      str(firstRow.hazardous) === '-1'
        ? ''
        : str(firstRow.hazardous).startsWith('Y')
          ? 'Y'
          : str(firstRow.hazardous).startsWith('N')
            ? 'N'
            : str(firstRow.hazardous),
    numberOfPieces: num(firstRow.pieces),
    uom: str(firstRow.uom),
    marks: str(firstRow.marks),
    actualPieces: num(firstRow.pieces),
    packaging: str(firstRow.packaging),
    genAesFilingBean: {
      referenceNumber: '0',
      scacCode: null,
      itnNumber: null,
      filingType: null,
      type: moduleType,
      description: null,
      rowid: null,
      controlFlag: cargoRows.controlFlag,
      inputUser: 'pnqpb_nyc',
      updateUser: null,
      oldUcrNumber: null,
      mrnNumber: null,
      oldMrnNumber: null,
      filingBy: null,
    },
    documentReferences: str(firstRow.docRef),
    bookingCustomerDeclaredCargoBeanList: (
      c?.customsRows ||
      c?.customsState?.customsRows ||
      []
    ).map((row: any, rowIdx: number) => ({
      commodity1: str(row.description),
      weight: num(row.kg),
      cube: num(row.cbm),
      weightLbs: num(row.lbs),
      cubeCbf: num(row.cbf),
      hazardousCode:
        str(row.hazardous) === '-1'
          ? ''
          : str(row.hazardous).startsWith('Y')
            ? 'Y'
            : str(row.hazardous).startsWith('N')
              ? 'N'
              : str(row.hazardous),
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
      bookingMultiCargoHazardousList: (row.hazRows || []).map(
        (h: any, idx: number) => ({
          shipperName1: str(h.properShippingName),
          techName1: str(h.technicalName),
          noOfpieces: num(h.pieces),
          packaging: str(h.packaging),
          weight: num(h.weight),
          imcoClass: str(h.imoClass),
          unNumber: str(h.unNumber),
          imoPage: str(h.imoPage),
        })
      ),
    })),
    bookingCustomerDeclaredHazardousBeanList: null,
    bookingAdditionalCargoInfoHazardousBeanList: null,
    recordSequence: 0,
    status: 0,
    bookingNumber: null,
    customerDeclaredId: null,
    commodity: null,
    controlFlag: '\u0000', // Pending Flag
    cargoDimensionBeanList: (firstRow.dimRows || []).map((d: any) => ({
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
    lotCommentsValue: str(instructions.internalComment),
    oldLotCommentsValue: '',
    externalLotComments:
      lotRows.length > 0 &&
      lotRows[0].controlFlag == 'N' &&
      lotRows[0].details == '' &&
      lotRows[0].type == '-1'
        ? []
        : lotRows.map((l: any) => ({
            commentId: l.commentId ?? null,
            module: moduleType,
            reference: null,
            code: str(l.type),
            name: str(l.type),
            value: str(l.details),
            description: str(l.details),
            inputUserName: null,
            inputDate: null,
            updateUserName: null,
            updateDate: null,
            transactionFlagStatus: l.controlFlag || 'N',
            oldCode: null,
            oldName: null,
            oldValue: null,
            oldDescription: null,
            fromQuote: true,
          })),
    commodityDescription6: '',
    commodityDescription7: '',
    commodityDescription8: '',
    commodityDescription9: '',
    commodityDescription10: '',
    commodityDescription11: '',
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
    length: null,
    height: null,
    width: null,
    unit: null,
    airFlow: null,
    relativeHumidity: null,
    ventSetting: null,
    dehumificationCode: null,
    genSetCode: null,
    tempratureInstruction: null,
    containerTypeAndSize: null,
    containerSize: null,
    totalKg: num(firstRow.kg),
    totalLbs: num(firstRow.lbs),
    totalCbm: num(firstRow.cbm),
    totalCbf: num(firstRow.cbf),
    hazardouValue:
      firstRow.hazardous === '-1'
        ? ''
        : firstRow.hazardous?.startsWith('Y')
          ? 'Y'
          : firstRow.hazardous?.startsWith('N')
            ? 'N'
            : firstRow.hazardous,
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
    bookingMultiCargoHazardousList: (firstRow.hazRows || []).map(
      (h: any, idx: number) => ({
        rowId: h.hrid ?? '',
        referenceNumber: 0,
        shipperName1: str(h.properShippingName),
        shipperName2: str(h.shipperName2),
        shippingName: str(h.shippingName),
        techName1: str(h.technicalName),
        techName2: null,
        noOfpieces: num(h.pieces),
        packaging: str(h.packaging === 'Please Select' ? '-1' : h.packaging),
        weight: num(h.weight),
        imcoClass: str(h.imoClass),
        unNumber: str(h.unNumber),
        imcoPage: str(h.imoPage),
        flashPointCelsius: num(h.flashpointC),
        flashpointFahrenheit: num(h.flashpointF),
        degrees: str(h.degreeUnit),
        packagingGroup: str(h.pkgGroup === 'Please Select' ? '-1' : h.pkgGroup),
        plackard1: str(h.placard1),
        plackard2: str(h.placard2),
        emergencyPhone: str(h.emergencyNumber),
        emergencyCotact: str(h.emergencyContact),
        hazardousCode:
          str(h.hazardous) === '-1'
            ? ''
            : str(h.hazardous).startsWith('Y')
              ? 'Y'
              : str(h.hazardous).startsWith('N')
                ? 'N'
                : str(h.hazardous),
        hazarDousCount: 0,
        quantity: str(h.quantity) === '-1' ? '' : str(h.quantity) || '',
        controlFlag: h.controlFlag, // Flag
        inputUpdateUser: 'pnqpb_nyc',
        recordNumber: idx + 1,
        quoteCargoHazardousId: 0,
        imoSubClass: str(h.imoSubclass),
        customerDeclaredCargoId: null,
        bookingNumber: null,
        customerDeclaredHazardouId: '',
        customerDeclaredHazardousTransactionFlag: 'N',
        pickupId: null,
        commodity: str(h.commodity),
      })
    ),
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
    container1: 0,
    containerSize1: null,
    containerType1: null,
    container2: 0,
    containerSize2: null,
    containerType2: null,
    container3: 0,
    containerSize3: null,
    containerType3: null,
    commodity1: str(row.description),
    commodity2: '',
    commodity3: '',
    commodity4: '',
    commodity5: '',
    weight: num(row.kg),
    cube: num(row.cbm),
    weightLbs: num(row.lbs),
    cubeCbf: num(row.cbf),
    hazardousCode:
      str(row.hazardous) === '-1'
        ? ''
        : str(row.hazardous).startsWith('Y')
          ? 'Y'
          : str(row.hazardous).startsWith('N')
            ? 'N'
            : str(row.hazardous),
    numberOfPieces: num(row.pieces),
    uom: str(row.uom),
    marks: str(row.marks),
    actualPieces: num(row.pieces),
    packaging: str(row.packaging),
    genAesFilingBean: {
      referenceNumber: null,
      scacCode: null,
      itnNumber: null,
      filingType: null,
      type: null,
      description: null,
      rowid: null,
      controlFlag: row?.controlFlag || 'N', // Pending Flag
      inputUser: null,
      updateUser: null,
      oldUcrNumber: null,
      mrnNumber: null,
      oldMrnNumber: null,
      filingBy: null,
    },
    documentReferences: str(row.docRef),
    bookingCustomerDeclaredHazardousBeanList: null,
    bookingAdditionalCargoInfoHazardousBeanList: null,
    recordSequence: row.crid || rowIdx + 1,
    status: 0,
    bookingNumber: null,
    customerDeclaredId: null,
    commodity: null,
    controlFlag: row.controlFlag, // Pending Flag
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
    length: null,
    height: null,
    width: null,
    unit: null,
    airFlow: null,
    relativeHumidity: null,
    ventSetting: null,
    dehumificationCode: null,
    genSetCode: null,
    tempratureInstruction: null,
    containerTypeAndSize: null,
    containerSize: null,
    totalKg: num(row.kg),
    totalLbs: num(row.lbs),
    totalCbm: num(row.cbm),
    totalCbf: num(row.cbf),
    hazardouValue:
      row.hazardous === '-1'
        ? ''
        : row.hazardous?.startsWith('Y')
          ? 'Y'
          : row.hazardous?.startsWith('N')
            ? 'N'
            : row.hazardous,
    requiredContainerType: null,
    customsNumber: null,
    cargoInsurence: null,
    assuredParty: null,
    commercialValue: null,
    bookingMultiCargoHazardousList: (row.hazRows || []).map(
      (h: any, idx: number) => ({
        rowId: h.hrid ?? '',
        referenceNumber: 0,
        shipperName1: str(h.properShippingName),
        shipperName2: str(h.shipperName2),
        techName1: str(h.technicalName),
        techName2: null,
        noOfpieces: num(h.pieces),
        packaging: str(h.packaging),
        weight: num(h.weight),
        imcoClass: str(h.imoClass),
        unNumber: str(h.unNumber),
        imcoPage: str(h.imoPage),
        flashPointCelsius: num(h.flashpointC),
        flashpointFahrenheit: num(h.flashpointF),
        degrees: str(h.degreeUnit),
        packagingGroup: str(h.pkgGroup === 'Please Select' ? '-1' : h.pkgGroup),
        plackard1: str(h.placard1),
        plackard2: str(h.placard2),
        emergencyPhone: str(h.emergencyNumber),
        emergencyCotact: str(h.emergencyContact),
        hazardousCode:
          str(row.hazardous) === '-1'
            ? ''
            : str(row.hazardous).startsWith('Y')
              ? 'Y'
              : str(row.hazardous).startsWith('N')
                ? 'N'
                : str(row.hazardous),
        hazarDousCount: 0,
        quantity: str(h.quantity) === '-1' ? '' : str(h.quantity) || '',
        controlFlag: h.controlFlag, // Flag
        inputUpdateUser: 'pnqpb_nyc',
        recordNumber: idx + 1,
        quoteCargoHazardousId: 0,
        imoSubClass: str(h.imoSubclass),
        customerDeclaredCargoId: null,
        bookingNumber: null,
        customerDeclaredHazardouId: '',
        customerDeclaredHazardousTransactionFlag: 'N',
        pickupId: null,
        commodity: str(h.commodity),
      })
    ),
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

  return cargoRows.flatMap((row: any) => {
    const hazRows = row.hazRows || [];
    const dimRows = row.dimRows || [];

    const dimString =
      dimRows.length > 0
        ? dimRows
            .map(
              (d: any) =>
                `${d.pieces} @ ${d.length}x${d.width}x${d.height} ${str(
                  d.unit
                ).charAt(0)}`
            )
            .join(', ')
        : '';

    const hazardsToUse =
      row.hazardous === 'Y' && hazRows.length ? hazRows : [null];

    return hazardsToUse.map((h: any, idx: number) => {
      let hazString = '';

      if (h) {
        hazString =
          `<b>Hazardous Details:</b><br/>` +
          `Proper Shipping Name: ${
            h.properShippingName == '' || h.properShippingName == null
              ? 'NA'
              : h.properShippingName
          }<br/>HAZ: Yes,Haz Class: ${replacePleaseSelect(
            h.imoClass
          )},Sub Risk: ${replacePleaseSelect(h.imoSubclass)},UN No.: ${
            h.unNumber == '' || h.unNumber == null ? 'NA' : h.unNumber
          },Flash Point: ${
            h.flashpointC == '' || h.flashpointC == null ? 'NA' : h.flashpointC
          },Pkg Group: ${
            !h.pkgGroup || h.pkgGroup === 'Please Select' || h.pkgGroup === '-1'
              ? 'NA'
              : h.pkgGroup
          }<br/><br/>`;
      }

      return {
        added: true,
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
        cargoHsCode: str(row.hazardous),
        cargoLineSeq: idx + 1,
        containerSelected: false,
        overLimitCargoDims: false,
        volumeExceeded: false,
        contUnSelected: false,
        modifiedCargo: false,
      };
    });
  });
}

function buildShipmentStatusUpdateBean(
  customer: any,
  main: any,
  rate: any,
  loginBean: any
) {
  const rateComment = buildRateAddedComment(rate);

  return {
    objectCode: str(main?.referenceObjectCode) || 'PREBKG',
    referenceNumber: 0,
    shipmentType: 'L',
    userSchemaId: 0,
    officeId: 0,
    eventList: [
      {
        eventName: 'HAZ_OVERRIDE_APPLIED',
        comment: str(main?.hazOverrideComment) || '',
        commentParams: {},
      },
      {
        eventName: 'HAZ_OVERRIDE_PERMISSION',
        commentParams: {
          SHIPMENT_ALLOWED: str(main?.hazShipmentAllowed) || '',
          CARRIER_APPROVAL_REQUIRE: str(main?.hazCarrierApprovalRequire) || '',
          SHIP_RESTRICT: str(main?.hazShipRestrict) || '',
          DEST_APRROVE: str(main?.hazDestApprove) || '',
          REMARK: str(main?.hazRemark) || '',
        },
      },
      {
        eventName: 'CREATED',
        commentParams: {
          BOOKING_NUMBER: str(main?.reference) || '',
        },
      },
      { commentParams: {} },
      { commentParams: {} },
      {
        eventName: 'RATE-ADDED',
        comment: rateComment,
        commentParams: {},
      },
    ],
    relatedType: [],
    relatedRerefence: [],
    deletedType: [],
    deletedReference: [],
    documentHistoryId: num(main?.documentHistoryId) || 0,
    statusLocationUncode:
      str(main?.statusLocationUncode) ||
      (str(main?.handlingOffice) ? `US${str(main?.handlingOffice)}` : ''),
    isCobProcess: main?.isCobProcess ?? false,
  };
}

function buildRateAddedComment(rate: any): string {
  const charges: any[] = rate?.bookingQuoteChargeBeanList || [];
  if (charges.length === 0) return '';

  let comment = 'The following Rates have been updated.<br><br>';
  charges.forEach((c: any) => {
    const payType = str(c?.payType) || 'P';
    const chargeType = str(c?.chargeType) || 'OFR';
    const code = normalizeChargeCode(str(c?.chargeCode)) || 'OFR';
    const basis = str(c?.sellBasis) || 'WM';
    const currency = str(c?.sellCurrency) || 'USD';
    const rate = num(c?.sellRate) || 0;
    const amount = num(c?.sellAmount) || 0;
    comment += `${chargeType} ${payType} ${code} ${basis} ${currency} ${rate} ${amount}.00 (A) <br>`;
  });
  return comment;
}

function buildBookingQuoteCustomFilingBean(main: any) {
  return {
    filingType: str(main?.customFilingType) || '',
    filingBy: str(main?.customFilingBy) || '',
    scacCode: str(main?.customFilingScacCode) || '',
    amsNumber: str(main?.customFilingAmsNumber) || '',
  };
}

function buildBookingCustomerDeclaredCargoBeanList(cargo: any) {
  const rows = cargo?.customerDeclaredCargoRows || [];
  if (rows.length === 0) {
    return [
      {
        container1: 0,
        container2: 0,
        container3: 0,
        weight: 0,
        cube: 0,
        weightLbs: 0.0,
        cubeCbf: 0.0,
        hazardousCode: '',
        numberOfPieces: 0,
        uom: 'M',
        marks: '',
        actualPieces: 0,
        packaging: '-1',
        genAesFilingBean: { controlFlag: 'N' }, // Pending Flag
        documentReferences: '-1',
        recordSequence: 0,
        status: 0,
        commodity: '',
        controlFlag: 'N', // Pending Flag
        cargoDimensionBeanList: [],
        isOverLength: false,
        isOverWeight: false,
        isDimension: false,
        oldLotCommentDesc: '',
        externalLotComments: [],
        isInstructions: false,
        nonStackable: false,
        doDimensionsExceed: false,
        doesVolumeExceeds: false,
      },
    ];
  }
  return rows.map((row: any, idx: number) => ({
    container1: num(row?.container1),
    container2: num(row?.container2),
    container3: num(row?.container3),
    weight: num(row?.weight),
    cube: num(row?.cube),
    weightLbs: 0.0,
    cubeCbf: 0.0,
    hazardousCode:
      str(row.hazardous) === '-1'
        ? ''
        : str(row.hazardous).startsWith('Y')
          ? 'Y'
          : str(row.hazardous).startsWith('N')
            ? 'N'
            : str(row.hazardous) || '',
    numberOfPieces: num(row?.numberOfPieces),
    uom: str(row?.uom) || 'M',
    marks: str(row?.marks) || '',
    actualPieces: num(row?.actualPieces),
    packaging: str(row?.packaging) || '-1',
    genAesFilingBean: { controlFlag: row.controlFlag || 'N' }, // Pending Flag
    documentReferences: str(row?.documentReferences) || '-1',
    recordSequence: row.crid || idx + 1,
    status: num(row?.status),
    commodity: str(row?.commodity) || '',
    controlFlag: str(row?.controlFlag) || 'N', // Pending Flag
    cargoDimensionBeanList: buildCargoDimensionBeanList(row?.dimRows),
    isOverLength: row?.isOverLength ?? false,
    isOverWeight: row?.isOverWeight ?? false,
    isDimension: row?.isDimension ?? false,
    oldLotCommentDesc: str(row?.oldLotCommentDesc) || '',
    externalLotComments: [],
    isInstructions: row?.isInstructions ?? false,
    nonStackable: row?.nonStackable ?? false,
    doDimensionsExceed: row?.doDimensionsExceed ?? false,
    doesVolumeExceeds: row?.doesVolumeExceeds ?? false,
  }));
}

function buildPreBookingBean(
  main: any,
  customer: any,
  routing: any,
  cargo: any,
  loginBean: any,
  rate: any,
  status: any
) {
  const isNewPreBooking = !main?.reference || num(main?.reference) === 0;

  return {
    rowId: strOrNull(main?.rowId) || '',
    bookQuoteDate: getFormattedDate(main?.createdOn),
    bookingQuoteType: 'L',
    handlingOffice: str(main?.handlingOffice) || '',
    hazardousAction: str(main?.hazardousAction) || '',
    referenceNumber: num(main?.reference) || null,
    hold: main?.hold == true ? 'Y' : 'N',
    quoteNumber: num(main?.importQuoteNumber) || null,
    userReference: str(main?.userReference) || '',
    takenBy: str(main?.takenBy) || str(loginBean?.ldapUsername) || '',
    wwaBlNumber: str(main?.wwablnumber) || '',
    agentBooking: main?.agentBooking == true ? 'Y' : 'N',
    status: status,
    // str(main?.status) === 'Preliminary'
    //   ? 'I'
    //   : str(main?.status) === 'Cancelled'
    //     ? 'C'
    //     : '',
    importQuoteNumber: num(main?.importQuoteNumber) || null,
    exportQuoteNumber: num(main?.exportQuoteNumber) || null,
    exportBookingNumber: main?.exportBookingNumber || null,
    importBookingStatus: str(main?.importBookingStatus) || '-1',
    importBookingStatusList: Array.isArray(main?.importBookingStatusList)
      ? main.importBookingStatusList
      : [],
    prebookingSaveActionFlag: str(main?.prebookingSaveActionFlag) || '',
    additionalRemark: str(main?.additionalRemark) || '',
    truckQuoteNumber: num(main?.truckQuoteNumber) || null,
    transmitToLocation1: str(main?.transmitToLocation1) || '',
    terms: str(routing?.routingFormData?.terms || ''),
    pickupNeeded: str(routing?.routingFormData?.pickupNeeded) || 'N',
    lineBooking: str(main?.lineBooking) || '',
    lineCode: str(main?.lineCode) || '',
    numberOfPieces: num(main?.numberOfPieces) || 0,
    ratingType: str(rate?.ratingType) || '',
    discount: num(main?.discount) || 0,
    prepaidCredit: str(customer?.prepaidCollect) || '',
    aesAmsFlag: str(main?.aesAmsFlag) || 'N',
    receivedVia:
      str(
        main?.preBookingChannel == 'Please Select'
          ? ''
          : main?.preBookingChannel
      ) || '',
    vesselVoyageID: num(main?.vesselVoyageID) || 0,
    shipmendID: num(main?.shipmendID) || 0,
    frequency: str(main?.frequency) || '',
    transitTime: str(main?.transitTime) || '0',
    receivedFromName: str(main?.bookingOffice) || '',
    tranShipmentFlag: str(main?.tranShipmentFlag) || 'N',
    flashPoint: num(main?.flashPoint) || 0,
    container1: num(main?.container1) || 0,
    bookingQuoteCustomerBean: buildBookingQuoteCustomerBean(customer, main),
    actualBuyerSellerBean: main?.actualBuyerSellerBean ?? {},
    bookingQuoteRoutingBean: buildBookingQuoteRoutingBean(routing, loginBean),
    bookingQuoteCargoBean: buildBookingQuoteCargoBean(cargo, 'PREBKG'),
    bookingEquipmentBean: main?.bookingEquipmentBean ?? {},
    shipmentStatusUpdateBean: buildShipmentStatusUpdateBean(
      customer,
      main,
      rate,
      loginBean
    ),
    bookingQuoteCustomFilingBean: buildBookingQuoteCustomFilingBean(main),
    type: 'PREBKG',
    posTimeFormat: num(main?.posTimeFormat) || 12,
    controlFlag: isNewPreBooking ? 'N' : 'U', // Flag
    preliminaryBooking: str(main?.status) === 'Preliminary' ? true : false,
    preliminaryBookingStatus: str(main?.preliminaryBookingStatus) || '',
    termName: str(routing?.routingFormData?.termsLabel || ''),
    nomination: str(customer?.controllingEntity) || '',
    rateControllingEntity: str(customer?.rateControllingEntity) || '',
    updatedBy: loginBean?.ldapUsername,
    isCTCChargeFromQuote: main?.isCTCChargeFromQuote ?? false,
    aesItnHoldStatusId: num(main?.aesItnHoldStatusId),
    ucrHoldStatusId: num(main?.ucrHoldStatusId),
    isOldBooking: main?.isOldBooking ?? false,
    commission: str(main?.commission) || '',
    carriers: main?.carriers ?? [],
    clauses: (main?.clauses || []).map((c: any, idx: number) => ({
      clauseCode: str(c.clauseCode),
      clauseName: strOrNull(c.clauseName),
      clauseNameLocale: null,
      clause: strOrNull(c.clause),
      clauseLocale: null,
      clauseDesc: strOrNull(c.clauseDesc),
      clauseDescLocale: null,
      sequence: idx + 1,
    })),
    bookingCustomerDeclaredCargoBeanList:
      buildBookingCustomerDeclaredCargoBeanList(cargo),
    roeType: str(rate?.rateOfExchange?.rateOfExchangeType) || 'L',
    includePlcOnDocument: main?.includePlcOnDocument ?? false,
    transmissionService: str(main?.transmissionService) || '',
    transmitToLocationName: str(main?.transmitToLocationName) || '',
    purchaseOrderReferenceNumber: str(main?.purchaseOrderReferenceNumber) || '',
    invoiceCurrency: str(main?.invoiceCurrency) || '',
    invoiceToLocalExchangeRate: 0 || num(main?.invoiceToLocalExchangeRate, 1),
    oldReferenceNumber: 0 || num(main?.oldReferenceNumber),
    oldStatus: str(main?.oldStatus) || '',
    modifyPLC: main?.modifyPLC ?? false,
    customerChange: main?.customerChange ?? false,
    isUpdated: main?.isUpdated ?? false,
    isShipmentOrderTransmit: main?.isShipmentOrderTransmit ?? false,
    isTransmitted: main?.isTransmitted ?? false,
    isCancelSOTransmitted: main?.isCancelSOTransmitted ?? false,
    isVip: main?.isVip ?? false,
    isAutoGeneratedDeliveryReferenceExist:
      main?.isAutoGeneratedDeliveryReferenceExist ?? false,
    thirdPartySystem: str(main?.thirdPartySystem) || 'TMS',
    isManualRemoveCustomsHold: main?.isManualRemoveCustomsHold ?? false,
    isLotCreatedForBKG: main?.isLotCreatedForBKG ?? false,
    isBolCreatedForBKG: main?.isBolCreatedForBKG ?? false,
    isCustomerOwnCFSAgreement: str(main?.isCustomerOwnCFSAgreement) || 'N',
    isEdiBooking: main?.isEdiBooking ?? false,
    modeOfTransport: str(main?.modeOfTransport) || 'V',
    directLoading: str(main?.directLoading) || 'N',
    tInputDate: formateDate(new Date()),
    errorMessage: str(main?.errorMessage) || '',
    isSensitiveCargoApprovalReceived:
      main?.isSensitiveCargoApprovalReceived ?? false,
    direction: str(main?.direction) || 'EO',
    vid: str(main?.vid) || 'N',
    importBookingNumber: num(main?.importBookingNumber),
    bookingCarrierBean: main?.bookingCarrierBean ?? {},
    isIntraCarrier: main?.isIntraCarrier ?? false,
    bookingEdiBeans: main?.bookingEdiBeans ?? [],
    isPrintDimension: main?.isPrintDimension ?? false,
    fillingByMrn: str(main?.fillingByMrn) || 'FB1',
    bookingQuoteRoutingBeanlist: main?.bookingQuoteRoutingBeanlist ?? [],
    masterQuoteNumber: num(main?.masterQuoteNumber),
    isQuoteChild: main?.isQuoteChild ?? false,
    onDock: str(main?.onDock) || 'N',
    bookingQuoteMultiCargoBeanList: buildBookingQuoteMultiCargoBeanList(
      cargo
      // 'PREBKG',
      // loginBean
    ),
    multiCargoBookingQuoteNoteBeans:
      buildMultiCargoBookingQuoteNoteBeans(cargo),
    cargoHsCodeNoteBeans: main?.cargoHsCodeNoteBeans ?? [],
    isRoutingUpdated: main?.isRoutingUpdated ?? false,
    pendingFinalBookingStatus:
      str(main?.pendingFinal == false ? 'N' : 'Y') || 'N',

    followUpFlag: str(main?.followUp == false ? 'N' : 'Y') || 'N',
    pendingFinalQuoteStatus: str(main?.pendingFinal) || 'N',
    hazaRuleNotes: str(main?.hazaRuleNotes) || '',
    pendingFinalBooking: main?.pendingFinal ?? false,
    isRatedNonRatedDocSend: main?.isRatedNonRatedDocSend ?? false,
    isBookingTransmittedtoSaco: main?.isBookingTransmittedtoSaco ?? false,
    isBookingTruckingInstrSent: main?.isBookingTruckingInstrSent ?? false,
    updateComments: str(main?.updateComments) || '',
    deleteComments: str(main?.deleteComments) || '',
    updateExpenseComments: str(main?.updateExpenseComments) || '',
    deleteExpenseComments: str(main?.deleteExpenseComments) || '',
    addedExpenseComments: str(main?.addedExpenseComments) || '',
    multiCustomHoldStatus: str(main?.multiCustomHoldStatus) || '',
    isCarrCodeRestricted: main?.isCarrCodeRestricted ?? false,
    originChatAppChannel: main?.originChatAppChannel ?? false,
    doorDeliveryDetailsBean: buildDoorDeliveryDetailsBean(
      routing,
      isNewPreBooking,
      main?.reference
    ),

    cfsDeliveryType: strOrNull(
      routing?.deliveryType || routing?.routingFormData?.deliveryType
    ),
    deliveryType: strOrNull(
      routing?.deliveryType || routing?.routingFormData?.deliveryType
    ),
    customerTypeChange: main?.customerTypeChange ?? false,
    isHazardousPermissionOverride:
      str(main?.isHazardousPermissionOverride) || 'Y',
    pickupUpdatedComment: str(main?.pickupUpdatedComment) || '',
    pickupDeleteComment: str(main?.pickupDeleteComment) || '',
    doorDeliveryDeletedComment: str(main?.doorDeliveryDeletedComment) || '',
    doorDeliveryUpdatedComment: str(main?.doorDeliveryUpdatedComment) || '',
    amsCustomAdvanceFillingMainBean: {
      AmsCustomAdvanceFillingBeans:
        main?.amsCustomAdvanceFillingMainBean?.AmsCustomAdvanceFillingBeans ??
        [],
      deleteAmsCustomAdvanceFillingBeans:
        main?.amsCustomAdvanceFillingMainBean
          ?.deleteAmsCustomAdvanceFillingBeans ?? [],
    },
    oldamsCustomAdvanceFillingMainBean: {
      AmsCustomAdvanceFillingBeans:
        main?.oldamsCustomAdvanceFillingMainBean
          ?.AmsCustomAdvanceFillingBeans ?? [],
      deleteAmsCustomAdvanceFillingBeans:
        main?.oldamsCustomAdvanceFillingMainBean
          ?.deleteAmsCustomAdvanceFillingBeans ?? [],
    },
    isVesselUpdate: main?.isVesselUpdate ?? false,
    isMultipleLot: main?.isMultipleLot ?? false,
    isLotCmtFromQuo: main?.isLotCmtFromQuo ?? false,
    toggleForShipmentPickedUpEvent:
      main?.toggleForShipmentPickedUpEvent ?? false,
    routed: str(main?.routed) || 'N',
    isLegacy: main?.isLegacy ?? false,
    isCOCUpdated: main?.isCOCUpdated ?? false,
    isBookingFileFrobCargo: main?.isBookingFileFrobCargo ?? false,
    tmsRateFetched: str(main?.tmsRateFetched) || 'N',
    customerOwnContainerToggle: str(main?.customerOwnContainerToggle) || 'N',
  };
}

function buildBookingHazardousBeanList(cargo: any, main: any) {
  const cargoRows = cargo?.cargoState?.cargoRows || [];
  const allHazRows: any[] = [];

  cargoRows.forEach((row: any) => {
    if (Array.isArray(row?.hazRows)) {
      row.hazRows.forEach((h: any) =>
        allHazRows.push({ ...h, rowRef: main?.reference })
      );
    }
  });

  if (allHazRows.length === 0) {
    return [
      {
        rowId: '',
        referenceNumber: 0,
        noOfpieces: 0,
        weight: 0,
        flashPointCelsius: 0,
        flashpointFahrenheit: 0,
        hazardousCode: '',
        hazarDousCount: 0,
        controlFlag: 'N', // Flag
        recordNumber: 0,
        quoteCargoHazardousId: 0,
        imoSubClass: '-1',

        bookingNumber: '',
        customerDeclaredHazardousTransactionFlag: ' ',
      },
    ];
  }

  return allHazRows.map((h: any, idx: number) => ({
    rowId: h.hrid || '',
    referenceNumber: 0,
    noOfpieces: num(h?.pieces),
    weight: num(h?.weight),
    flashPointCelsius: num(h?.flashpointC),
    flashpointFahrenheit: num(h?.flashpointF),
    hazardousCode:
      str(h.hazardous) === '-1'
        ? ''
        : str(h.hazardous).startsWith('Y')
          ? 'Y'
          : str(h.hazardous).startsWith('N')
            ? 'N'
            : str(h.hazardous),
    hazarDousCount: 0,
    controlFlag: h?.controlFlag || 'N', // Flag
    recordNumber: idx,
    quoteCargoHazardousId: 0,
    imoSubClass: str(h?.imoSubclass) || '-1',

    bookingNumber: '',

    customerDeclaredHazardousTransactionFlag:
      str(h?.customerDeclaredHazardousTransactionFlag) || ' ',
  }));
}

export function buildPickupDetailBean(
  r: any,
  cargo: any,
  pickupIndex?: number,
  isNew = true,
  refNum?: any,
  loginClientBean?: any
) {
  const pickupForms = r?.pickupForms || {};
  const pickupTruckerForms = r?.pickupTruckerForms || {};
  const values = Object.values(pickupForms);
  const truckerValues = Object.values(pickupTruckerForms);
  const pickup =
    pickupIndex !== undefined
      ? pickupForms[pickupIndex]
      : values[values.length - 1];

  const trucker: any =
    pickupIndex !== undefined
      ? truckerValues[pickupIndex]
      : truckerValues[truckerValues.length - 1];
  const name = formatName(pickup?.instructions || {});
  const address = formatAddress(pickup?.streetAddress);
  const address1 = formatAddress(trucker?.truckerDetails);

  const cargoRows = cargo?.cargoRows || [];
  const firstCargoRow = Array.isArray(cargoRows) ? cargoRows[0] : null;
  const main = r?.routingFormData || {};
  const pickupAccessorialCodes = mapAccessorialsToCodes(pickup?.accessorials);
  const pickUpId = formatSequenceNumber(pickupIndex + 1, 3);

  return {
    pickupAtCargoCode: str(pickup?.pickupCargoAtCode),
    pickupAtCargoName: str(pickup?.name),
    pickupAtCargoName1: null,
    pickupAtCargoAddress1: address.addr1,
    pickupAtCargoAddress2: address.addr2,
    pickupAtCargoAddress3: address.addr3,
    pickupAtCargoAddress4: address.addr4,
    pickerContact: str(pickup?.contactName1 || pickup?.contactName),
    pickerPhone: str(pickup?.contactPhone1 || pickup?.contactPhone),
    pickerFax: null,
    pickupState: str(pickup?.state || pickup?.pickupState).includes(' - ')
      ? str(pickup?.state || pickup?.pickupState).split(' - ')[1]
      : str(pickup?.state || pickup?.pickupState),
    pickupCity: str(pickup?.city),
    pickupZipCode: str(pickup?.zipCode || pickup?.pickupZipCode),
    pickupEmail: str(pickup?.contactEmail1 || pickup?.contactEmail),
    truckerCode: str(trucker?.truckerCode),
    truckerName: str(pickup?.name),
    truckerAddress1: address1.addr1,
    truckerAddress2: address1.addr2,
    truckerAddress3: address1.addr3,
    truckerContact: str(pickup?.truckerContact),
    truckerPhone: str(pickup?.truckerPhone),
    truckerFax: str(pickup?.truckerFax),
    truckerEmail: str(pickup?.truckerEmail),
    pickupDate: getFormattedDate(pickup?.estimatedPickupDate),
    pickupTime: pickup?.timeFrom || '',
    pickupTimeTo: pickup?.timeTo || '',
    deliveryDate: getFormattedDate(pickup?.deliveryDate),
    deliveryTime: fmtTime(pickup?.deliveryTime),
    pickupInstruction1: name.name1,
    pickupInstruction2: name.name2,
    pickupInstruction3: name.name3,
    pickupInstruction4: name.name4,
    pickupInstruction5: name.name5,
    pickupInstruction6: name.name6,
    pickupInstruction7: name.name7,
    pickupType: null,
    referenceNumber: isNew ? '0' : str(refNum || '0'),
    controlFlag: isNew ? 'N' : 'U', // Flag
    rowId: null,
    inputUpdateUser: loginClientBean?.username,
    inputUpdateDate: null,
    quotePickupId: 0,
    returnChasisCode: null,
    returnChasisDetail: null,
    deliveryTimeTo: '',
    deliveryInstructions: '',
    pickupAccessorial: pickupAccessorialCodes,
    deliverToAccessorial: [],
    pickupAccessorialString: pickupAccessorialCodes.join(','),
    billToDetail: '',
    pickupCountry: extractCountryCode(pickup?.country),
    emptyPositioningDate: null,
    emptyPositioningFromTime: null,
    emptyPositioningToTime: null,
    loadMeter: '',
    opterTransmissionStatus: '',
    pickupAndDeliveryAttributeList: [],
    cargoDimensionBeanList: mapCargoDimensionBeans(
      firstCargoRow?.dimRows,
      pickUpId
    ),
    // pickupChargeBeanList: mapPickupChargeBeans(charges, pickupIndex, userCompany),
    deliverCode: null,
    deliverName: null,
    deliverAddress1: null,
    deliverAddress2: null,
    deliverAddress3: null,
    deliverContact: null,
    deliverPhone: null,
    deliverFax: null,
    truckingInstruction1: str(trucker?.truckerDetails || ''),
    rowNumber: 0,
    truckerProNumber: str(trucker?.truckerProNumber),
    truckerStatus: str(trucker?.status),
    pickupLatitude: str(pickup?.latitude),
    pickupLongitude: str(pickup?.longitude),
    pickupContact2: str(pickup?.contactPhone2),
    pickupName2: str(pickup?.contactName2),
    pickupEmail2: str(pickup?.contactEmail2),
    pickupId: pickUpId,
    estimatedDeliveryDate: getFormattedDate(trucker?.estimatedDeliveryDate),
    tmsStatus: null,
    descriptionofGoods: str(firstCargoRow?.description),
    weightKg: Number(firstCargoRow?.kg) || 0,
    cubeCbm: Number(firstCargoRow?.cbm) || 0,
    weightLbs: Number(firstCargoRow?.lbs) || 0,
    cubeCbf: Number(firstCargoRow?.cbf) || 0,
    numberOfPieces: Number(firstCargoRow?.pieces) || 0,
    uom: null,
    length: 0,
    height: 0,
    deliverToAccessorialString: null,
    actualPickUpDate: null,
    pickupReference: str(pickup?.pickupReference),
    width: 0,
    packaging: str(firstCargoRow?.packaging),
    unit: null,
    pieces: 0,
    cbm: 0,
    cbf: 0,
    kg: 0,
    lbs: 0,
    hazardous:
      firstCargoRow?.hazardous === 'Y - Yes'
        ? 'Y'
        : firstCargoRow?.hazardous === 'N - No'
          ? 'N'
          : null,
    pickupChannel: null,
    pickupHazardousBeanList: mapHazardousBeans(
      firstCargoRow?.hazRows,
      pickUpId
    ),
    trkTransmitStatus: null,
    truckerQuoteNumber: str(trucker?.truckerQuote),
    truckerReferenceNumber: str(trucker?.truckerReference),
    pickupStateName: str(pickup?.state).includes(' - ')
      ? str(pickup?.state).split(' - ').slice(1).join(' - ').trim()
      : null,
    residential: (pickup?.accessorials || []).includes('residential')
      ? 'Y'
      : 'N',
    lattitude: str(pickup?.latitude),
    longitude: str(pickup?.longitude),
    unLocationCode: '',
    // isTruckRateFetched: charges && charges.length > 0 ? "Y" : "N",
    truckerCodeToggleValue: null,
    isEdiTrucker: 'N',
    truckerFlag: null,
    pickupStackName: null,
  };
}
const mapHazardousBeans = (hazRows: any[] | undefined, pickupId?: string) => {
  if (!hazRows || !Array.isArray(hazRows)) return [];
  return hazRows
    .filter((row) => row && (row.unNumber || row.imoClass || row.shippingName))
    .map((row) => ({
      rowId: row.hrid || '',
      referenceNumber: 0,
      shipperName1: str(row.properShippingName),
      shipperName2: str(row.shipperName2),
      techName1: str(row.technicalName),
      techName2: null,
      noOfpieces: Number(row.pieces) || 0,
      packaging: replacePleaseSelect(str(row.packaging)),
      weight: Number(row.weight) || 0,
      imcoClass: replacePleaseSelect(str(row.imoClass)),
      unNumber: str(row.unNumber),
      imcoPage: str(row.imoPage),
      flashPointCelsius: Number(row.flashpointC) || 0,
      flashpointFahrenheit: Number(row.flashpointF) || 0,
      degrees: null,
      packagingGroup: replacePleaseSelect(str(row.pkgGroup)),
      plackard1: str(row.placard1),
      plackard2: str(row.placard2),
      emergencyPhone: str(row.emergencyNumber),
      emergencyCotact: str(row.emergencyContact),
      hazardousCode:
        str(row.hazardous) === '-1'
          ? ''
          : str(row.hazardous).startsWith('Y')
            ? 'Y'
            : str(row.hazardous).startsWith('N')
              ? 'N'
              : str(row.hazardous),
      hazarDousCount: 0,
      quantity: str(row.quantity) === '-1' ? '' : row.quantity || '',
      controlFlag: row.controlFlag || 'N', // Pending Flag
      inputUpdateUser: null,
      recordNumber: 0,
      quoteCargoHazardousId: 0,
      imoSubClass: replacePleaseSelect(str(row.imoSubclass)),
      customerDeclaredCargoId: null,
      bookingNumber: null,
      customerDeclaredHazardouId: null,
      customerDeclaredHazardousTransactionFlag: ' ',
      pickupId: pickupId,
      commodity: str(row.commodity),
    }));
};

const mapCargoDimensionBeans = (
  cargoRows: any[] | undefined,
  pickupId?: string
) => {
  if (!cargoRows || !Array.isArray(cargoRows)) return [];
  return cargoRows
    .filter(
      (row) => row && (row.length || row.width || row.height || row.pieces)
    )
    .map((row) => ({
      dimensionId: null,
      length: Number(row.length) || 0,
      width: Number(row.width) || 0,
      height: Number(row.height) || 0,
      unit:
        row.unit === 'Centimeters'
          ? 'C'
          : row.unit === 'Feet'
            ? 'F'
            : row.unit === 'Meters'
              ? 'M'
              : 'I',
      pieces: Number(row.pieces) || 0,
      cbm: Number(row.cbm) || 0,
      cbf: Number(row.cbf) || 0,
      kg: Number(row.kg) || 0,
      lbs: Number(row.lbs) || 0,
      tmsClass: Number(row.cls) || 0,
      isDummyRowForTms: '',
      stackable:
        row.stackable === 'Yes' ? 'Y' : row.stackable === 'No' ? 'N' : '',
      pickupId: pickupId,
      shipmentType:
        row.shipmentType === 'FTL'
          ? 'F'
          : row.shipmentType === 'LTL'
            ? 'L'
            : '',
      receivedVia: null,
      standardDimensionsFlag: 'N',
      maxsinglevolume: 0.0,
      maxsingleweight: 0.0,
      maxtotalvolume: 0.0,
      maxtotalweight: 0.0,
      maxlength: 0.0,
      maxwidth: 0.0,
      maxheight: 0.0,
      deliveryType: null,
      weightUnit: null,
      volumeUnit: null,
      crgId: null,
      stackingType: null,
    }));
};

const PICKUP_ACCESSORIAL_INVERSE_MAP: Record<string, string> = {
  appointment: 'APPTP',
  'hazardous-material': 'HAZMAT',
  liftgate: 'LFTD',
  residential: 'RESIDENTAP',
};

export function formatSequenceNumber(value: number, padding: number): string {
  const finalValue = !value ? 1 : value;
  return finalValue.toString().padStart(padding, '0');
}

const mapAccessorialsToCodes = (
  accessorials: string[] | undefined
): string[] => {
  if (!accessorials || !Array.isArray(accessorials)) return [];
  return accessorials
    .map((a) => PICKUP_ACCESSORIAL_INVERSE_MAP[a] || a)
    .filter(Boolean);
};

const PICKUP_ACCESSORIAL_TO_CODE: Record<string, string> = {
  'hazardous-material': 'HAZMAT',
  liftgate: 'LFTD',
  appointment: 'APPT',
  residential: 'RESIDENT',
};

const DOOR_ACCESSORIAL_TO_CODE: Record<string, string> = {
  liftgate: 'LFTD',
  appointment: 'APPTD',
  'hazardous-material': 'HAZP',
  residential: 'RESIDENTD',
};

const DOOR_DELIVERY_ACCESSORIAL_INVERSE_MAP: Record<string, string> = {
  appointment: 'APPTD',
  'hazardous-material': 'HAZP',
  liftgate: 'LFTD',
  residential: 'RESIDENTD',
};

const mapDoorDeliveryAccessorialsToCodes = (
  accessorials: string[] | undefined
): string[] => {
  if (!accessorials || !Array.isArray(accessorials)) return [];
  return accessorials
    .map((a) => DOOR_DELIVERY_ACCESSORIAL_INVERSE_MAP[a] || a)
    .filter(Boolean);
};

const mapDoorDeliveryChargeBeans = (
  charges: any[] | undefined,
  userCompany?: string
) => {
  if (!charges || !Array.isArray(charges)) return [];
  return charges.map((charge, idx) => ({
    expensesId: 0,
    moduleId: 0,
    reference: null,
    referenceExtension: null,
    company: userCompany,
    vendor: null,
    charge: charge.chargeDescription?.split(' - ')[0] || '',
    expense: Number(charge.expense) || 0,
    income: Number(charge.income) || 0,
    currency: charge.expenseCurrency || 'USD',
    inputUser: null,
    inputDate: null,
    updateUser: null,
    updateDate: null,
    controlFlag: 'N', // Pending Flag // pending based on not applicatble for prebooking
    rowId: null,
    rateOfExchange: 1.0,
    chargeDescription: charge.chargeDescription?.split(' - ')[1] || '',
    localeChargeDescription: null,
    expenseIdPk: 0,
    localCurrency: null,
    localIncomeAmount: Number(charge.income) || 0,
    localExpenseAmount: Number(charge.expense) || 0,
    quotePickupChargeId: 0,
    recordNumber: 0,
    applyVat: null,
    payType: null,
    invoiceDate: null,
    invoiceNumber: null,
    chargeType: null,
    prepaidCollect: 'P',
    pickupId: formatSequenceNumber(idx + 1, 3),
    truckerRateExpired: '',
    truckChargeGroup: null,
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
    expenseRateOfExchange: 1.0,
    rateCompanyId: 0,
    taxAmount: null,
    taxLocalAmount: null,
    bookingQuoteChargeRowId: null,
    expenseCurrency: charge.expenseCurrency || 'USD',
    taxText: null,
    taxPercent: null,
    taxCode: null,
    relayFlag: null,
    spotRateFlag: 0,
    minimum: 0.0,
    maximum: null,
  }));
};

export function buildDoorDeliveryDetailsBean(
  r: any,
  isNew = true,
  refNum?: any,
  loginClientBean?: any
) {
  const door = r?.pickupState?.doorDeliveryForm || r?.doorDeliveryForm || {};
  const charges =
    r?.pickupState?.doorDeliveryChargeRows || r?.doorDeliveryChargeRows || [];
  const main = r?.routingFormData || {};
  const userCompany = loginClientBean?.userCompany || r?.userCompany;

  const deliveryAccessorialCodes = mapDoorDeliveryAccessorialsToCodes(
    door?.accessorials
  );

  const truckerLines = str(door.truckerDetails).split('\n');

  return {
    doorDeliveryState: str(door.doorDeliveryState)?.includes(' - ')
      ? str(door.doorDeliveryState).split(' - ')[1]
      : str(door.doorDeliveryState),
    doorDeliveryZipCode: str(door.doorDeliveryZipCode),
    doorDeliveryCountry: str(door.doorDeliveryCountry)?.includes(' - ')
      ? str(door.doorDeliveryCountry).split(' - ')[0]
      : str(door.doorDeliveryCountry),
    doorDeliveryAddress1: str(door.streetAddress),
    doorDeliveryAddress2: '',
    doorDeliveryAddress3: '',
    doorDeliveryAddress4: null,
    doorDeliveryCity: str(door.doorDeliveryCity),
    tentativeDeliveryDate: getFormattedDate(door?.estimatedDeliveryDate),
    truckerCode: str(door.truckerCode),
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
      (a: string) => DOOR_DELIVERY_ACCESSORIAL_INVERSE_MAP[a] || a.toUpperCase()
    ),
    deliveryAccessorialString: deliveryAccessorialCodes.join(','),
    stackable: door?.stackable !== false ? 'Y' : 'N',
    shipmentType:
      door?.shipmentType === 'FTL'
        ? 'F'
        : door?.shipmentType === 'LTL'
          ? 'L'
          : 'L',
    pickupChargeBeanList: mapDoorDeliveryChargeBeans(charges, userCompany), //Not applicable for prebooking
    referenceNumber: isNew ? '0' : str(refNum || '0'),
    controlFlag: isNew ? 'N' : 'U', // Flag
    rowId: null,
    inputUpdateUser: null,
    inputUpdateDate: null,
    billToDetail: null,
    residential: door?.accessorials?.includes('residential') ? 'Y' : 'N',
    pickupId: null,
    isTruckRateFetched: charges && charges.length > 0 ? 'Y' : 'N',
    latitude: door?.latitude,
    longitude: door?.longitude,
    unLocationCode: '',
    warehouseCode: null,
    warehouseName: null,
    destinationWarehouse: null,
    truckerCodeToggleValue: '',
    truckerFlag: null,
    truckRateDetailsFileId: 0,
    deliveryToCode: str(door.deliveryToCode),
    deliveryToName: str(door.name),
    deliveryToAddress1: str(door.streetAddress),
    deliveryToAddress2: '',
    deliveryToAddress3: '',
    deliveryToCity: str(door.doorDeliveryCity),
    deliveryToZip: str(door.doorDeliveryZipCode),
    deliveryToCountry: str(door.doorDeliveryCountry),
    deliveryToState: str(door.doorDeliveryState),
    deliveryToPhone: str(door.contactPhone),
    deliveryToFax: '',
    deliveryToContact: str(door.contactName),
    deliveryToEmail: str(door.contactEmail),
    deliveryInstructions: str(door.instructions),
    deliveryReference: '',
  };
}

function buildHazardousRuleMap(main: any) {
  const ruleMap = main?.hazardousRuleMap;
  if (ruleMap && typeof ruleMap === 'object') return ruleMap;

  const key = String(main?.hazRuleIndex ?? 0);

  return {
    [key]: {
      DocumentList: str(main?.hazDocumentList) || '',
      ACTION: str(main?.hazAction) || '',
      MULTI_ACTION: str(main?.hazMultiAction) || '',
      REMARKS: str(main?.hazaRuleNotes) || '',
      IMO_CLASS: str(main?.hazardousCode) || '',
    },
  };
}

function buildAmendmentCodeBean(main: any, loginBean: any) {
  return {
    amendmentCode: str(main?.amendmentCode) || '00',
    bookingNumber: str(main?.amendmentBookingNumber) || '',
    handlingOffice: str(main?.handlingOffice) || '',

    receivedFromName: str(main?.bookingOffice) || '',
    reference: num(main?.reference) || '0',
    officeId: 0,
    module: str(main?.amendmentModule) || 'BKG',
    siteId: num(loginBean?.userSchemaID) || 0,
  };
}

const RELAY_FLAG_TO_CODE: Record<string, string> = {
  MANUAL: 'U',
  ACCURATE: 'A',
  GRDB: 'G',
  TARIFF: 'T',
  CTC: 'C',
  IMPORT: 'I',
  TRK: 'D',
};

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
    relayFlag: RELAY_FLAG_TO_CODE[str(row.relayFlag)] || 'U',
    company: '01',
    dueAccount: null,
    rateClass: null,
    vendor: strOrNull(row.vendor),
    originalAmount: null,
    truckingChargeLinkId: num(row.truckingChargeLinkId),
    chargeDescription: str(row.incomeChargeDetails?.chargeDescription),
    localeChargeDescription: null,
    rowId: strOrNull(row.rowId),
    controlFlag: row?.rowId != '' ? 'U' : 'N', // Pending Flag
    type: null,
    bookingQuoteRateId: num(row.bookingRateId),
    equipmentDetail: strOrNull(row.equipmentDetails),
    dirty: false,
    expense: null,
    code: null,
    applyVat: str(row.incomeVAT) === 'Y' ? 'Y' : 'N',
    description: null,
    oldInvoiceNumber: null,
    oldVendor: null,
    localCurrency: null,
    originDestination: str(row.originDestination) || '',
    payType: str(row.prepaidCollect) || '',
    exchangeRate: null,
    currency: null,
    bookingPrepaid: 0,
    bookingCollect: 0,
    rate: null,
    invoiceDate: strOrNull(row.invoiceDate),
    invoiceNumber: strOrNull(row.invoiceNumber),
    chargeType: str(row.incomeChargeDetails?.chargeType) || '',
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

function buildPreBookingChargeBeanList(rate?: any, isNewEntry = false) {
  const asInsert = (r: any) => ({ ...r, controlFlag: 'N', rowId: null }); // Pending Flag
  const frontendRows = rate?.charges?.rateDetails;
  if (Array.isArray(frontendRows) && frontendRows.length > 0) {
    if (frontendRows[0].chargeCode != null) {
      return isNewEntry ? frontendRows.map(asInsert) : frontendRows;
    }
    return frontendRows
      .filter((r: any) => !r.isVatBean)
      .map((row: any, idx: number) => {
        const mapped = mapChargeBeanRowToApi(row, idx);
        return isNewEntry ? asInsert(mapped) : mapped;
      });
  }
  if (
    Array.isArray(rate?.bookingQuoteChargeBeanList) &&
    rate.bookingQuoteChargeBeanList.length > 0
  ) {
    return isNewEntry
      ? rate.bookingQuoteChargeBeanList.map(asInsert)
      : rate.bookingQuoteChargeBeanList;
  }

  return [];
}

function buildIncidentReasonDetailBean(main: any = {}) {
  const incidents = Array.isArray(main?.incidentReasonDetail)
    ? main.incidentReasonDetail
    : [main?.incidentReasonDetail ?? {}];

  return incidents.map((incident: any) => ({
    eventEntityResponceBean: {
      eventEntityResponseChildBean:
        incident?.eventEntityResponseChildBean ?? [],
      eventActivityList: incident?.eventActivityList ?? [],
      officeSettingBean: incident?.officeSettingBean ?? {},
      isShowIRP: incident?.isShowIRP ?? false,
      isCaptureDefaultReason: incident?.isCaptureDefaultReason ?? false,
      isShowGoDateColn: incident?.isShowGoDateColn ?? false,
      isShowStorageDateColn: incident?.isShowStorageDateColn ?? false,
    },

    categoryReasonDataMappingBean: {
      causedBy: str(incident?.causedBy) || '',
      incidentCategory: str(incident?.incidentCategory) || '',
      reason: str(incident?.reason) || '',
      office: str(incident?.office) || '',
      emtEventCode: str(incident?.emtEventCode) || '',
      incidentDetailsKey: str(incident?.incidentDetailsKey) || '',
      isIncidentReasonMandatory: str(incident?.isIncidentReasonMandatory) || '',
    },

    incidentOwner: str(incident?.incidentOwner) || '',
    incidentDetail: str(incident?.incidentDetail) || '',
    incidentOpenVia: str(incident?.incidentOpenVia) || '',
    referenceNumber: 0 || num(incident?.referenceNumber),
    referenceType: str(incident?.referenceType) || '',

    serviceFailureLocalDetails: str(incident?.serviceFailureLocalDetails) || '',

    isThroughIncidentReason: incident?.isThroughIncidentReason ?? true,
    reasonProvidedFlag: incident?.reasonProvidedFlag ?? false,

    subActionflag: str(incident?.subActionflag) || '',
    pickUpId: str(incident?.pickUpId) || '',

    isPRCSelected: incident?.isPRCSelected ?? false,

    incidentOwnerMainCompanyName:
      str(incident?.incidentOwnerMainCompanyName) || '',
    incidentOwnerFullName: str(incident?.incidentOwnerFullName) || '',
  }));
}
function buildUploadDocumentsBeanList(docs?: any) {
  if (Array.isArray(docs) && docs.length > 0) {
    return docs;
  }
  return [];
}

function buildMainPreBookingBean(
  main: any,
  document: any,
  customer: any,
  routing: any,
  cargo: any,
  rate: any,
  loginBean: any,
  status: any
) {
  const isNewEntry = !main?.reference || num(main?.reference) === 0;
  return {
    bookingQuoteBean: buildPreBookingBean(
      main,
      customer,
      routing,
      cargo,
      loginBean,
      rate,
      status
    ),
    bookingQuoteChargeBeanList: buildPreBookingChargeBeanList(rate, isNewEntry),
    bookingHazardousBeanList: buildBookingHazardousBeanList(cargo, main),
    multiCargoBookingQuoteNoteBeans:
      buildMultiCargoBookingQuoteNoteBeans(cargo),
    pickupDetailBean:
      routing?.routingFormData?.pickupNeeded == 'N'
        ? {}
        : buildPickupDetailBean(
            routing,
            cargo,
            Object.keys(routing?.pickupForms)?.length - 1,
            isNewEntry,
            main?.reference,
            loginBean
          ),
    doorDeliveryDetailsBean: buildDoorDeliveryDetailsBean(
      routing,
      isNewEntry,
      main?.reference
    ),

    uploadDocumentsBeanList: buildUploadDocumentsBeanList(document),
    uploadDocumentsOldBeanList: document?.uploadDocumentsOldBeanList ?? [],
    uploadDocumentsNewBeanList: document?.uploadDocumentsNewBeanList ?? [],
    transshipmentRoutingBeanList: [],
    addAutoUploadDocumentsBeanList:
      document?.addAutoUploadDocumentsBeanList ?? [],
    RemoveAutoUploadDocumentsBeanList:
      document?.RemoveAutoUploadDocumentsBeanList ?? [],
    RemoveUploadDocumentsBeanList:
      document?.RemoveUploadDocumentsBeanList ?? [],
    AddUploadDocumentsBeanList: document?.AddUploadDocumentsBeanList ?? [],
    errorFlag: main?.errorFlag ?? false,
    isBookingCounter: main?.isBookingCounter ?? true,
    isFromToUS: main?.isFromToUS ?? false,
    invoiceBLLists: main?.invoiceBLLists ?? [],
    invoiceBLListForCustomercode: main?.invoiceBLListForCustomercode ?? [],
    setUpdateBlAssociatedBookingsForCustomerCode:
      main?.setUpdateBlAssociatedBookingsForCustomerCode ?? false,
    bookingAssociateBlNumbers: main?.bookingAssociateBlNumbers ?? [],
    UpdateBlAssociatedBookingsForCustomFilingStack:
      main?.UpdateBlAssociatedBookingsForCustomFilingStack ?? false,
    associatedBLNos: main?.associatedBLNos ?? [],
    syncedBls: main?.syncedBls ?? [],
    isFreighReceived: main?.isFreighReceived ?? false,
    skipBlRateUpdate: main?.skipBlRateUpdate ?? false,
    updateBlAssociatedBookings: main?.updateBlAssociatedBookings ?? false,
    blAssociatedBookingMap: main?.blAssociatedBookingMap ?? {},
    fmcTypeChargeCodes: main?.fmcTypeChargeCodes ?? [],
    pickupConvertedChargeBeanList: main?.pickupConvertedChargeBeanList ?? [],
    messageMap: main?.messageMap ?? {},
    isFileSailConfirm: main?.isFileSailConfirm ?? false,
    isBlRelease: main?.isBlRelease ?? false,
    isLoadplanFinalized: main?.isLoadplanFinalized ?? false,
    isLoadplanPendingFinalized: main?.isLoadplanPendingFinalized ?? false,
    isBookingVesselChange: main?.isBookingVesselChange ?? false,
    isUpdateControllingEntity: main?.isUpdateControllingEntity ?? false,
    isUpdateRateControllingEntity: main?.isUpdateRateControllingEntity ?? false,
    isLeadBooking: main?.isLeadBooking ?? false,
    callEserviceSave: main?.callEserviceSave ?? false,
    isEquipmentsDeatilsUpdated: main?.isEquipmentsDeatilsUpdated ?? false,
    isTruckingDetailsUpdated: main?.isTruckingDetailsUpdated ?? false,
    isNraAcceptanceEmailSent: main?.isNraAcceptanceEmailSent ?? false,
    multiplePickupDetailBeanList: main?.multiplePickupDetailBeanList ?? [],
    versionCount: num(main?.versionCount),
    isTaskReviewOrApprove: main?.isTaskReviewOrApprove ?? false,
    isUpdateScacCode: main?.isUpdateScacCode ?? false,
    amendmentCodeBean: buildAmendmentCodeBean(main, loginBean),
    isRatedDocumentSent: main?.isRatedDocumentSent ?? false,
    isBLReferenceExist: main?.isBLReferenceExist ?? true,
    cancelPickupList: main?.cancelPickupList ?? [],
    isFromCopyBooking: main?.isFromCopyBooking ?? false,
    isLotReceived: main?.isLotReceived ?? false,
    isCalledFromSaveButton: main?.isCalledFromSaveButton ?? false,
    hazardousRuleMap: buildHazardousRuleMap(main),
    isUpdateAmsBlNumber: main?.isUpdateAmsBlNumber ?? false,
    isUpdateAmsBlNumberAndScacCode:
      main?.isUpdateAmsBlNumberAndScacCode ?? false,
    isCopyRateFromQuote: main?.isCopyRateFromQuote ?? false,
    isLotCommentsInternalFromQuote:
      main?.isLotCommentsInternalFromQuote ?? false,
    isLotCommentsExternalFromQuote:
      main?.isLotCommentsExternalFromQuote ?? false,
    isConvtQuotToBkgButtonClick: main?.isConvtQuotToBkgButtonClick ?? false,
    doorDeliveryConvertedChargeBeanList:
      main?.doorDeliveryConvertedChargeBeanList ?? [],
  };
}

export function buildPreBookingSubmitPayload(
  loginBean: any,
  mainDetails: any,
  documentDetails: any,
  customerDetails: any,
  routingDetails: any,
  cargoDetails: any,
  rateDetails: any,
  status: any
) {
  return {
    requestData: {
      userId: loginBean?.userId,
      mainBookingQuoteBean: buildMainPreBookingBean(
        mainDetails,
        documentDetails,
        customerDetails,
        routingDetails,
        cargoDetails,
        rateDetails,
        loginBean,
        status
      ),
      incidentReasonDetailBean: buildIncidentReasonDetailBean(mainDetails),
    },
  };
}
