import { getFormattedDate } from "../../../../core/utils/date.utility";
import { formatSequenceNumber, replacePleaseSelect, str } from "../../../../core/utils/string.utility";

const PICKUP_ACCESSORIAL_INVERSE_MAP: Record<string, string> = {
  appointment: "APPTP",
  "hazardous-material": "HAZMAT",
  liftgate: "LFTD",
  residential: "RESIDENTAP",
};

const mapAccessorialsToCodes = (accessorials: string[] | undefined): string[] => {
  if (!accessorials || !Array.isArray(accessorials)) return [];
  return accessorials
    .map((a) => PICKUP_ACCESSORIAL_INVERSE_MAP[a] || a)
    .filter(Boolean);
};

const mapCargoDimensionBeans = (cargoRows: any[] | undefined, pickupId?: string) => {
  if (!cargoRows || !Array.isArray(cargoRows)) return [];
  return cargoRows
    .filter((row) => row && (row.length || row.width || row.height || row.pieces))
    .map((row) => ({
      dimensionId: null,
      length: Number(row.length) || 0,
      width: Number(row.width) || 0,
      height: Number(row.height) || 0,
      unit: row.unit === "Centimeters" ? "C" : row.unit === "Feet" ? "F" : row.unit === "Meters" ? "M" : "I",
      pieces: Number(row.pieces) || 0,
      cbm: Number(row.cbm) || 0,
      cbf: Number(row.cbf) || 0,
      kg: Number(row.kg) || 0,
      lbs: Number(row.lbs) || 0,
      tmsClass: Number(row.cls) || 0,
      isDummyRowForTms: "",
      stackable: row.stackable === "Yes" ? "Y" : row.stackable === "No" ? "N" : "",
      pickupId: pickupId,
      shipmentType: row.shipmentType === "FTL" ? "F" : row.shipmentType === "LTL" ? "L" : "",
      receivedVia: null,
      standardDimensionsFlag: "N",
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

const mapHazardousBeans = (hazRows: any[] | undefined, pickupId?: string, isNew?: boolean) => {
  if (!hazRows || !Array.isArray(hazRows)) return [];
  return hazRows
    .filter((row) => row && (row.unNumber || row.imoClass || row.shippingName))
    .map((row) => ({
      rowId: null,
      referenceNumber: 0,
      shipperName1: str(row.shipperName1),
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
      hazardousCode: replacePleaseSelect(str(row.imoClass)),
      hazarDousCount: 0,
      quantity: row.quantity === "L - Limited Quantity" ? "L" : row.quantity === "E - Excepted Quantity" ? "E" : "",
      controlFlag: isNew ? "N" : "U",
      inputUpdateUser: null,
      recordNumber: 0,
      quoteCargoHazardousId: 0,
      imoSubClass: replacePleaseSelect(str(row.imoSubclass)),
      customerDeclaredCargoId: null,
      bookingNumber: null,
      customerDeclaredHazardouId: null,
      customerDeclaredHazardousTransactionFlag: " ",
      pickupId: pickupId,
      commodity: str(row.commodity),
    }));
};

const mapPickupChargeBeans = (charges: any[] | undefined, pickupId?: number | number, userCompany?: string) => {
  if (!charges || !Array.isArray(charges)) return [];
  return charges.map((charge) => ({
    expensesId: 0,
    moduleId: 0,
    reference: null,
    referenceExtension: null,
    company: userCompany,
    vendor: null,
    charge: charge.chargeDescription?.split(" - ")[0] || "",
    expense: Number(charge.expense) || 0,
    income: Number(charge.income) || 0,
    currency: charge.expenseCurrency || "USD",
    inputUser: null,
    inputDate: null,
    updateUser: null,
    updateDate: null,
    controlFlag: "U",
    rowId: null,
    rateOfExchange: 1.0,
    chargeDescription: charge.chargeDescription?.split(" - ")[1] || "",
    localeChargeDescription: null,
    expenseIdPk: charge?.expenseIdPk,
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
    prepaidCollect: "P",
    pickupId: formatSequenceNumber(pickupId, 3),
    truckerRateExpired: "",
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
    expenseCurrency: charge.expenseCurrency || "USD",
    taxText: null,
    taxPercent: null,
    taxCode: null,
    relayFlag: null,
    spotRateFlag: 0,
    minimum: 0.0,
    maximum: null,
  }));
};

export function buildPickupDetailBean(r: any, cargo: any, pickupIndex?: number, isNew = true, refNum?: any, loginClientBean?: any) {
  const pickupForms = r?.pickupForms || {};
  const pickupTruckerForms = r?.pickupTruckerForms || {};
  const values = Object.values(pickupForms);
  const truckerValues = Object.values(pickupTruckerForms);

  const pickup =
  pickupIndex !== undefined
    ? pickupForms[pickupIndex]
    : values[values.length - 1];

  const trucker =
  pickupIndex !== undefined
    ? truckerValues[pickupIndex]
    : truckerValues[truckerValues.length - 1];

  const cargoRows = cargo?.cargoRows || [];
  const firstCargoRow = Array.isArray(cargoRows) ? cargoRows[0] : null;
  const main = r?.routingFormData || {};
  const pickupAccessorialCodes = mapAccessorialsToCodes(pickup?.accessorials);
  const pickUpId = formatSequenceNumber(pickupIndex + 1, 3);

  return {
    pickupAtCargoCode: str(pickup?.pickupCargoAtCode),
    pickupAtCargoName: str(pickup?.name),
    pickupAtCargoName1: null,
    pickupAtCargoAddress1: str(pickup?.streetAddress),
    pickupAtCargoAddress2: "",
    pickupAtCargoAddress3: str(pickup?.city || pickup?.pickupCity),
    pickupAtCargoAddress4: null,
    pickerContact: str(pickup?.contactName1 || pickup?.contactName),
    pickerPhone: str(pickup?.contactPhone1 || pickup?.contactPhone),
    pickerFax: null,
    pickupState: str(pickup?.state || pickup?.pickupState).includes(' - ') ? str(pickup?.state || pickup?.pickupState).split(' - ')[1] : str(pickup?.state || pickup?.pickupState),
    pickupZipCode: str(pickup?.zipCode || pickup?.pickupZipCode),
    pickupEmail: str(pickup?.contactEmail1 || pickup?.contactEmail),
    truckerCode: str(trucker?.truckerCode),
    truckerName: str(pickup?.name),
    truckerAddress1: str(pickup?.truckerAddress1),
    truckerAddress2: "",
    truckerAddress3: "",
    truckerContact: str(pickup?.truckerContact),
    truckerPhone: str(pickup?.truckerPhone),
    truckerFax: str(pickup?.truckerFax),
    truckerEmail: str(pickup?.truckerEmail),
    pickupDate: getFormattedDate(pickup?.estimatedPickupDate),
    pickupTime: pickup?.timeFrom || "",
    pickupTimeTo: pickup?.timeTo || "",
    deliveryDate: getFormattedDate(pickup?.deliveryDate),
    deliveryTime: pickup?.deliveryTime || "",
    pickupInstruction1: str(pickup?.instructions) || str(main?.pickupInstruction1) || "",
    pickupInstruction2: "",
    pickupInstruction3: "",
    pickupInstruction4: "",
    pickupInstruction5: "",
    pickupInstruction6: "",
    pickupInstruction7: "",
    pickupType: null,
    referenceNumber: isNew ? "0" : str(refNum || "0"),
    controlFlag: isNew ? "N" : "U",
    rowId: null,
    inputUpdateUser: loginClientBean?.username,
    inputUpdateDate: null,
    quotePickupId: 0,
    returnChasisCode: null,
    returnChasisDetail: null,
    deliveryTimeTo: "",
    deliveryInstructions: "",
    pickupAccessorial: pickupAccessorialCodes,
    deliverToAccessorial: [],
    pickupAccessorialString: pickupAccessorialCodes.join(","),
    billToDetail: "",
    pickupCountry: extractCountryCode(pickup?.pickupCountry || main?.pickupCountry),
    emptyPositioningDate: null,
    emptyPositioningFromTime: null,
    emptyPositioningToTime: null,
    loadMeter: "",
    opterTransmissionStatus: "",
    pickupAndDeliveryAttributeList: [],
    cargoDimensionBeanList: mapCargoDimensionBeans(firstCargoRow?.dimRows, pickUpId),
    // pickupChargeBeanList: mapPickupChargeBeans(charges, pickupIndex, userCompany),
    deliverCode: null,
    deliverName: null,
    deliverAddress1: null,
    deliverAddress2: null,
    deliverAddress3: null,
    deliverContact: null,
    deliverPhone: null,
    deliverFax: null,
    truckingInstruction1: str(trucker?.truckerDetails || ""),
    rowNumber: 0,
    truckerProNumber: str(trucker?.truckerProNumber),
    truckerStatus: str(trucker?.status),
    pickupLatitude: str(pickup?.latitude),
    pickupLongitude: str(pickup?.longitude),
    pickupContact2: str(pickup?.contactName2 || pickup?.contactName),
    pickupName2: str(pickup?.contactName2 || pickup?.name),
    pickupEmail2: str(pickup?.contactEmail2 || pickup?.contactEmail),
    pickupId: pickUpId,
    estimatedDeliveryDate: null,
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
    hazardous: firstCargoRow?.hazardous === "Y - Yes" ? "Y" : firstCargoRow?.hazardous === "N - No" ? "N" : null,
    pickupChannel: null,
    pickupHazardousBeanList: mapHazardousBeans(firstCargoRow?.hazRows, pickUpId, isNew),
    trkTransmitStatus: null,
    truckerQuoteNumber: str(trucker?.truckerQuote),
    truckerReferenceNumber: str(trucker?.truckerReference),
    pickupStateName: str(pickup?.state).includes(' - ')
      ? str(pickup?.state).split(' - ').slice(1).join(' - ').trim()
      : null,
    residential: (pickup?.accessorials || []).includes('residential') ? 'Y' : 'N',
    lattitude: str(pickup?.latitude),
    longitude: str(pickup?.longitude),
    unLocationCode: "",
    // isTruckRateFetched: charges && charges.length > 0 ? "Y" : "N",
    truckerCodeToggleValue: null,
    isEdiTrucker: "N",
    truckerFlag: null,
    pickupStackName: null,
  };
}

export function buildMultiplePickupDetailBeanList(r: any, cargo: any, isNew = true, refNum?: any, loginClientBean?: any): any[] {
  const pickupState = r?.pickupState || {};
  const pickupForms = pickupState?.truckingPickupForms || r?.truckingPickupForms || pickupState?.pickupForms || r?.pickupForms || {};
  const indices = Object.keys(pickupForms).map(Number).filter((k) => !isNaN(k));
  
  if (indices.length === 0) return [];
  
  return indices.map((index) => buildPickupDetailBean(r, cargo, index, isNew, refNum, loginClientBean));
}

const extractCountryCode = (v: any): string => {
  const s = str(v);
  if (!s) return '';
  if (s.includes(' - ')) return s.split(' - ')[0].trim();
  const hyphenIdx = s.indexOf('-');
  if (hyphenIdx > 0 && hyphenIdx <= 3) return s.substring(0, hyphenIdx).trim();
  return s.trim();
};