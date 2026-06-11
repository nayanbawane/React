import { getFormattedDate } from "../../../../core/utils/date.utility";
import { formatSequenceNumber, str } from "../../../../core/utils/string.utility";

const DOOR_DELIVERY_ACCESSORIAL_INVERSE_MAP: Record<string, string> = {
  appointment: "APPTD",
  "hazardous-material": "HAZP",
  liftgate: "LFTD",
  residential: "RESIDENTD",
};

const mapDoorDeliveryAccessorialsToCodes = (accessorials: string[] | undefined): string[] => {
  if (!accessorials || !Array.isArray(accessorials)) return [];
  return accessorials
    .map((a) => DOOR_DELIVERY_ACCESSORIAL_INVERSE_MAP[a] || a)
    .filter(Boolean);
};

const mapDoorDeliveryChargeBeans = (charges: any[] | undefined, userCompany?: string) => {
  if (!charges || !Array.isArray(charges)) return [];
  return charges.map((charge, idx) => ({
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
    prepaidCollect: "P",
    pickupId: formatSequenceNumber(idx + 1, 3),
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

export function buildDoorDeliveryDetailsBean(r: any, isNew = true, refNum?: any, loginClientBean?: any) {
  const door = r?.pickupState?.doorDeliveryForm || r?.doorDeliveryForm || {};
  const charges = r?.pickupState?.doorDeliveryChargeRows || r?.doorDeliveryChargeRows || [];
  const main = r?.routingFormData || {};
  const userCompany = loginClientBean?.userCompany || r?.userCompany;

  const deliveryAccessorialCodes = mapDoorDeliveryAccessorialsToCodes(door?.accessorials);

  const truckerLines = str(door.truckerDetails).split('\n');
  let warehouse = str(main?.destinationWarehouse || main?.warehouse);
  warehouse = warehouse ? warehouse.split(' - ')[0] : '';

  return {
    doorDeliveryState: str(door.doorDeliveryState)?.includes(" - ") ? str(door.doorDeliveryState).split(" - ")[1] : str(door.doorDeliveryState),
    doorDeliveryZipCode: str(door.doorDeliveryZipCode),
    doorDeliveryCountry: str(door.doorDeliveryCountry)?.includes(" - ") ? str(door.doorDeliveryCountry).split(" - ")[0] : str(door.doorDeliveryCountry),
    doorDeliveryAddress1: str(door.streetAddress),
    doorDeliveryAddress2: "",
    doorDeliveryAddress3: "",
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
    deliveryAccessorialString: deliveryAccessorialCodes.join(","),
    stackable: door?.stackable !== false ? "Y" : "N",
    shipmentType: door?.shipmentType === "FTL" ? "F" : door?.shipmentType === "LTL" ? "L" : "L",
    pickupChargeBeanList: mapDoorDeliveryChargeBeans(charges, userCompany),
    referenceNumber: isNew ? '0' : str(refNum || '0'),
    controlFlag: isNew ? "N" : "U",
    rowId: null,
    inputUpdateUser: null,
    inputUpdateDate: null,
    billToDetail: null,
    residential: door?.accessorials?.includes("residential") ? "Y" : "N",
    pickupId: null,
    isTruckRateFetched: charges && charges.length > 0 ? "Y" : "N",
    latitude: door?.latitude,
    longitude: door?.longitude,
    unLocationCode: "",
    warehouseCode: null,
    warehouseName: null,
    destinationWarehouse: warehouse,
    truckerCodeToggleValue: "",
    truckerFlag: null,
    truckRateDetailsFileId: 0,
    deliveryToCode: str(door.deliveryToCode),
    deliveryToName: str(door.name),
    deliveryToAddress1: str(door.streetAddress),
    deliveryToAddress2: "",
    deliveryToAddress3: "",
    deliveryToCity: str(door.doorDeliveryCity),
    deliveryToZip: str(door.doorDeliveryZipCode),
    deliveryToCountry: str(door.doorDeliveryCountry),
    deliveryToState: str(door.doorDeliveryState),
    deliveryToPhone: str(door.contactPhone),
    deliveryToFax: "",
    deliveryToContact: str(door.contactName),
    deliveryToEmail: str(door.contactEmail),
    deliveryInstructions: str(door.instructions),
    deliveryReference: "",
  };
}
