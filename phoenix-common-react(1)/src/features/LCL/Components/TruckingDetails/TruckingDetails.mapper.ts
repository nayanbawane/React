import { parseApiDate } from "../../../../core/utils/date.utility";
import type {
  DoorDeliveryFormData,
  HeaderData,
  InternalCargoRowData,
  PickupCharge,
  PickupDeliveryFormData,
  TruckerFormData,
} from "../../../../types/LCL/misc/TruckingDetails.types";
import {
  makeEmptyCargoRow,
  makeEmptyDimRow,
  makeEmptyHazRow,
} from "../../../../InitialData/LCL/TruckingDetails";
import { joinLines } from "../../../../core/utils/string.utility";

const mapChargeRows = (list: any[] | null | undefined): PickupCharge[] =>
  (list ?? []).map((charge: any, index: number) => ({
    id: index + 1,
    chargeDescription: charge.charge ? `${charge.charge} - ${charge.chargeDescription ?? ""}` : charge.chargeDescription ?? "",
    expenseCurrency: charge.expenseCurrency ?? charge.currency ?? "USD",
    expense: Number(charge.expense ?? 0),
    incomeCurrency: charge.currency ?? charge.expenseCurrency ?? "USD",
    income: Number(charge.income ?? 0),
  }));

const mapDimUnit = (code: string | null): string => {
  const map: Record<string, string> = {
    I: "Inches",
    C: "Centimeters",
    F: "Feet",
    M: "Meters",
  };
  return map[code ?? ""] ?? "Inches";
};

const mapShipmentType = (code: string | null): string => {
  const map: Record<string, string> = { L: "LTL", F: "FTL" };
  return map[code ?? ""] ?? code ?? "LTL";
};

const mapHazardous = (code: string | null): string => {
  if (code === "Y") return "Y - Yes";
  if (code === "N") return "N - No";
  return "Please Select";
};

const mapDimRows = (dims: any[] | null | undefined) => {
  if (!dims?.length) return [{ ...makeEmptyDimRow() }];
  return dims.map((d: any) => ({
    ...makeEmptyDimRow(),
    length: String(d.length ?? ""),
    width: String(d.width ?? ""),
    height: String(d.height ?? ""),
    unit: mapDimUnit(d.unit),
    pieces: String(d.pieces ?? ""),
    cbm: String(d.cbm ?? ""),
    cbf: String(d.cbf ?? ""),
    kg: String(d.kg ?? ""),
    lbs: String(d.lbs ?? ""),
    cls: String(d.tmsClass ?? ""),
    stackable: d.stackable === "Y" ? "Yes" : "No",
    shipmentType: mapShipmentType(d.shipmentType),
    stackingType: d.stackingType ?? "",
  }));
};

const mapHazRows = (list: any[] | null | undefined) => {
  if (!list?.length) return [{ ...makeEmptyHazRow() }];
  return list.map((h: any) => ({
    ...makeEmptyHazRow(),
    imoClass: h.hazardousCode
      ? String(h.hazardousCode).replace(/\.0$/, "")
      : "Please Select",
    imoSubclass: h.imoSubClass ?? "Please Select",
    unNumber: h.unNumber ?? "",
    imoPage: h.imcoPage ?? "",
    pkgGroup: h.packagingGroup ?? "Please Select",
    flashpointC: String(h.flashPointCelsius ?? "0"),
    flashpointF: String(h.flashpointFahrenheit ?? "0"),
    degreeUnit: h.degreeUnit ?? "C",
    pieces: String(h.noOfpieces ?? "0"),
    packaging: h.packaging ?? "",
    weight: String(h.weight ?? "0"),
    properShippingName: h.shipperName1 ?? "",
    technicalName: h.techName1 ?? "",
    placard1: h.plackard1 ?? "",
    placard2: h.plackard2 ?? "",
    emergencyNumber: h.emergencyPhone ?? "",
    emergencyContact: h.emergencyCotact ?? "",
    quantity:
      h.quantity === "L"
        ? "L - Limited Quantity"
        : h.quantity === "E"
          ? "E - Excepted Quantity"
          : "Please Select",
  }));
};

const mapPickupCargoRows = (pickup: any): InternalCargoRowData[] => [
  {
    ...makeEmptyCargoRow(),
    pieces: String(pickup?.numberOfPieces ?? ""),
    packaging: pickup?.packaging ?? "Please Select",
    description: pickup?.descriptionofGoods ?? "",
    kg: String(pickup?.weightKg ?? pickup?.kg ?? ""),
    lbs: String(pickup?.weightLbs ?? pickup?.lbs ?? ""),
    cbm: String(pickup?.cubeCbm ?? pickup?.cbm ?? ""),
    cbf: String(pickup?.cubeCbf ?? pickup?.cbf ?? ""),
    hazardous: mapHazardous(pickup?.hazardous ?? null),
    dimRows: mapDimRows(pickup?.cargoDimensionBeanList),
    hazRows: mapHazRows(pickup?.pickupHazardousBeanList),
  },
];


const mapPickupForm = (pickup: any): PickupDeliveryFormData => ({
  postalCodeCity: "",
  pickupCargoAtCode: pickup?.pickupAtCargoCode ?? "",
  estimatedPickupDate: parseApiDate(pickup?.pickupDate ?? null),
  timeFrom: pickup?.pickupTime,
  timeTo: pickup?.pickupTimeTo,
  name: pickup?.pickupAtCargoName ?? "",
  instructions: pickup?.pickupInstruction1 ?? "",
  streetAddress: joinLines(
      pickup?.pickupAtCargoAddress1,
      pickup?.pickupAtCargoAddress2,
      pickup?.pickupAtCargoAddress3,
      pickup?.pickupAtCargoAddress4,
    ),
  deliveryDate: parseApiDate(pickup?.deliveryDate ?? null),
  deliveryTime: pickup?.deliveryTime,
  city: pickup?.pickupAtCargoAddress3 ?? "",
  state: pickup?.pickupStateName && pickup?.pickupState
    ? `${pickup.pickupStateName}`
    : pickup?.pickupStateName ?? pickup?.pickupState ?? "",
  country: pickup?.pickupCountry ?? "",
  zipCode: pickup?.pickupZipCode ?? "",
  contactName1: pickup?.pickerContact ?? "",
  contactPhone1: pickup?.pickerPhone ?? "",
  contactEmail1: pickup?.pickupEmail ?? "",
  contactName2: pickup?.pickupName2 ?? "",
  contactPhone2: pickup?.pickupContact2 ?? "",
  contactEmail2: pickup?.pickupEmail2 ?? "",
  pickupReference: pickup?.pickupReference ?? "",
  latitude: pickup?.pickupLatitude ?? pickup?.lattitude ?? "",
  longitude: pickup?.pickupLongitude ?? pickup?.longitude ?? "",
  accessorials:  pickup?.pickupAccessorial || [],
  quotePickupId: pickup?.quotePickupId ?? 0,
});

const mapPickupTruckerForm = (pickup: any): TruckerFormData => ({
  truckerCode: pickup?.truckerCode ?? "",
  truckerDetails: pickup?.truckerName ?? "",
  truckerProNumber: pickup?.truckerProNumber ?? "",
  estimatedDeliveryDate: parseApiDate(pickup?.estimatedDeliveryDate ?? null),
  status: pickup?.truckerStatus ?? pickup?.tmsStatus ?? "",
  truckerQuote: pickup?.truckerQuoteNumber ?? "",
  truckerReference: pickup?.truckerReferenceNumber ?? "",
});

const mapHeaderData = (pickupForm: PickupDeliveryFormData): HeaderData => ({
  estimatedPickupDate: pickupForm.estimatedPickupDate,
  city: pickupForm.city,
  zipCode: pickupForm.zipCode,
});

const mapDoorDeliveryForm = (door: any): DoorDeliveryFormData => ({
  doorDeliveryCountry: door?.doorDeliveryCountry ?? "",
  postalCodeCity: "",
  estimatedDeliveryDate: parseApiDate(door?.tentativeDeliveryDate ?? null) as any,
  streetAddress: door?.doorDeliveryAddress1 ?? "",
  accessorials: door?.deliveryAccessorials ?? [],
  doorDeliveryCity: door?.doorDeliveryCity ?? "",
  doorDeliveryZipCode: door?.doorDeliveryZipCode ?? "",
  doorDeliveryState: door?.doorDeliveryState ?? "",
  stackable: door?.stackable !== "N",
  shipmentType:
    door?.shipmentType === "F"
      ? "FTL"
      : door?.shipmentType === "L"
        ? "LTL"
        : door?.shipmentType ?? "LTL",
  truckerCode: door?.truckerCode ?? "",
  truckerDetails: [
    door?.truckerName,
    door?.truckerAddress1,
    door?.truckerAddress2,
    door?.truckerAddress3,
    door?.truckerAddress4,
    door?.truckerAddress5,
  ]
    .filter(Boolean)
    .join("\n"),
    latitude: door?.latitude,
    longitude: door?.longitude,
    residential: door?.residential,
    truckerName: door?.truckerName,
});

export const mapTruckingFromPopulate = (mainBookingQuoteBean: any) => {
  const terms = mainBookingQuoteBean?.bookingQuoteBean?.terms ?? '';
  const doorDeliveryBean = mainBookingQuoteBean?.doorDeliveryDetailsBean;
  const pickupNeeded =
  mainBookingQuoteBean?.bookingQuoteBean?.pickupNeeded??'N';

  const deliveryNeeded =
  mainBookingQuoteBean?.bookingQuoteBean?.cfsDeliveryType??'';

  const multiplePickups: any[] = mainBookingQuoteBean?.multiplePickupDetailBeanList ?? [];
  const singlePickup = mainBookingQuoteBean?.pickupDetailBean;
  const pickupList = multiplePickups.length > 0
    ? multiplePickups
    : singlePickup
      ? [singlePickup]
      : [];

  const pickups = pickupList.map((_: unknown, index: number) => index);
  const pickupForms = Object.fromEntries(
    pickupList.map((pickup: any, index: number) => [index, mapPickupForm(pickup)])
  ) as Record<number, PickupDeliveryFormData>;
  const pickupTruckerForms = Object.fromEntries(
    pickupList.map((pickup: any, index: number) => [
      index,
      mapPickupTruckerForm(pickup),
    ])
  ) as Record<number, TruckerFormData>;
  const pickupChargeMap = Object.fromEntries(
    pickupList.map((pickup: any, index: number) => [
      index,
      mapChargeRows(pickup?.pickupChargeBeanList),
    ])
  ) as Record<number, PickupCharge[]>;
  const truckingCargoRowsMap = Object.fromEntries(
    pickupList.map((pickup: any, index: number) => [
      index,
      mapPickupCargoRows(pickup),
    ])
  ) as Record<number, InternalCargoRowData[]>;
  const headerDataMap = Object.fromEntries(
    pickups.map((pickupId) => [pickupId, mapHeaderData(pickupForms[pickupId])])
  ) as Record<number, HeaderData>;

  return {
    showPickupStack:   
      (pickupNeeded === 'Y' || pickupNeeded === 'T'),
    showDoorDeliverySection: (terms === "DRDR" || terms === "CFDR")&&(deliveryNeeded==='D' || deliveryNeeded==='T'),
    pickups,
    pickupForms,
    pickupTruckerForms,
    pickupChargeMap,
    truckingCargoRowsMap: multiplePickups.length > 0 ? truckingCargoRowsMap : {},
    headerDataMap,
    doorDeliveryForm: doorDeliveryBean
      ? mapDoorDeliveryForm(doorDeliveryBean)
      : undefined,
    doorDeliveryChargeRows: mapChargeRows(doorDeliveryBean?.pickupChargeBeanList),
  };
};
