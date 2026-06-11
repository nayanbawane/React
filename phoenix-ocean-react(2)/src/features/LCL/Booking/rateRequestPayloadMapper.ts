import type {
  BookingFormState,
  CargoDetailsFormData,
  CustomerDetailFormState,
  LoginClientBeanRaw,
  RateRequestBean,
  RoutingFormData,
} from 'phoenix-common-react';

type RateDetailsSubmitData = {
  ratingType?: string;
  [key: string]: unknown;
};

type BookingRateSubmitData = {
  mainDetails?: Partial<BookingFormState>;
  customerDetails?: CustomerDetailFormState;
  routingDetails?: Partial<RoutingFormData>;
  cargoDetails?: CargoDetailsFormData;
  rateDetails?: RateDetailsSubmitData;
};

const toNumber = (value: unknown): number | null => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const getCargoTotals = (cargoDetails?: CargoDetailsFormData) => {
  const cargoRows = cargoDetails?.cargoRows ?? [];
  const firstRow = cargoRows[0];

  const cubeCargo = cargoRows.reduce(
    (sum, row) => sum + (toNumber(row.cbm) ?? 0),
    0
  );
  const weightCargo = cargoRows.reduce(
    (sum, row) => sum + (toNumber(row.kg) ?? 0),
    0
  );
  const cubeCargoInFeet = cargoRows.reduce(
    (sum, row) => sum + (toNumber(row.cbf) ?? 0),
    0
  );

  return {
    cubeCargo: cubeCargo || null,
    weightCargo: weightCargo || null,
    cubeCargoInFeet: cubeCargoInFeet || null,
    uomValue: firstRow?.uom || 'M',
    hazardousFlag: cargoRows.some(
      (row) => !!row.hazardous && row.hazardous !== 'Please Select'
    ),
    overLengthFlag: cargoDetails?.flags?.overLength ?? null,
    overWeightFlag: cargoDetails?.flags?.overWeight ?? null,
    nonStackable: cargoDetails?.flags?.nonStackable ? 'Y' : 'N',
  };
};

const getTranshipmentCode = (
  routingDetails: Partial<RoutingFormData> | undefined,
  index: number
) => {
  const ports = routingDetails?.transshipmentPorts ?? [];
  return ports[index]?.portCode ?? null;
};

function formatDateToDDMMMYYYY(dateInput: any): string {
  const date = new Date(dateInput);

  const day: string = String(date.getDate()).padStart(2, '0');

  const months: string[] = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  const month: string = months[date.getMonth()];

  const year: number = date.getFullYear();

  return `${day}-${month}-${year}`;
}

export const buildRateRequestPayload = (
  formData: BookingRateSubmitData,
  loginClientBean?: LoginClientBeanRaw | null,
  options?: {
    moduleType?: string;
    shipmentDate?: string | null;
  }
): RateRequestBean => {
  const mainDetails = formData.mainDetails ?? {};
  const customerDetails = formData.customerDetails?.lclForm ?? {};
  const routingDetails = formData.routingDetails ?? {};
  const cargoTotals = getCargoTotals(formData.cargoDetails);
  const rateDetails = formData.rateDetails ?? {};
  const moduleType =
    options?.moduleType ?? (formData as any).moduleType ?? 'BKG';
  const toUpperCaseWithNullCheck = (v: unknown) =>
    v != null && String(v).trim() !== '' ? String(v).toUpperCase() : null;

  var controllingEntity = customerDetails.controllingEntity ?? null;
  if (controllingEntity === 'D') {
    controllingEntity = 'DEST';
  } else if (controllingEntity === 'O') {
    controllingEntity = 'ORG';
  }

  var rateControllingEntity = customerDetails.rateControllingEntity ?? null;
  if (rateControllingEntity === 'D') {
    rateControllingEntity = 'DEST';
  } else if (rateControllingEntity === 'O') {
    rateControllingEntity = 'ORG';
  }

  return {
    companyCode: String(loginClientBean?.companyCode ?? ''),
    companyId: String(loginClientBean?.companyId ?? ''),
    locale: String(loginClientBean?.locale ?? ''),
    officeCode: String(
      loginClientBean?.ldapOfficeCode ?? loginClientBean?.office ?? ''
    ),
    officeId: loginClientBean?.officeId ?? null,

    placeOfReceiptCode: toUpperCaseWithNullCheck(routingDetails.placeOfReceiptCode),
    loadCode: toUpperCaseWithNullCheck(routingDetails.portOfLoadingCode),
    dischargeCode: toUpperCaseWithNullCheck(routingDetails.portOfDischargeCode),
    deconsolidationCode: toUpperCaseWithNullCheck(routingDetails.deconsolidationCfsCode),
    finalCfsCode: toUpperCaseWithNullCheck(routingDetails.destinationCfsCode),
    placeOfDeliveryCode: toUpperCaseWithNullCheck(routingDetails.placeOfDeliveryCode),
    originInlandCFSCode: toUpperCaseWithNullCheck(routingDetails.placeOfReceiptCode),
    consolidationCFSCode: toUpperCaseWithNullCheck(routingDetails.consolidationCfsCode),
    portOfLoadingCode: toUpperCaseWithNullCheck(routingDetails.portOfLoadingCode),
    transhipment1Code: toUpperCaseWithNullCheck(getTranshipmentCode(formData.routingDetails, 0)),
    transhipment2Code: toUpperCaseWithNullCheck(getTranshipmentCode(formData.routingDetails, 1)),
    transhipment3Code: toUpperCaseWithNullCheck(getTranshipmentCode(formData.routingDetails, 2)),
    portOfDischargeCode: toUpperCaseWithNullCheck(routingDetails.portOfDischargeCode),
    deconsolidationCFSCode: toUpperCaseWithNullCheck(routingDetails.deconsolidationCfsCode),
    destinationCFSCode: toUpperCaseWithNullCheck(routingDetails.destinationCfsCode),
    originOfRequest: toUpperCaseWithNullCheck(routingDetails.consolidationCfsCode),
    namedAccountCode: String(customerDetails.namedAccount ?? ''),
    cubeCargo: cargoTotals.cubeCargo ?? 0.0,
    weightCargo: cargoTotals.weightCargo ?? 0.0,
    prepaidCollect: String(customerDetails.prepaidCollect ?? ''),
    uomValue: cargoTotals.uomValue,
    overLengthFlag: cargoTotals.overLengthFlag,
    overWeightFlag: cargoTotals.overWeightFlag,
    hazardousFlag: cargoTotals.hazardousFlag,
    rateProfileCode: String(customerDetails.accuRateProfile ?? ''),
    shipmentDate: options?.shipmentDate ?? null,
    controllingEntity: controllingEntity,
    rateControllingEntity: rateControllingEntity,
    module: moduleType,
    cubeCargoInFeet: cargoTotals.cubeCargoInFeet ?? 0,
    ratingType: rateDetails.ratingType ?? null,
    tabNumber: -1,
    nonStackable: cargoTotals.nonStackable,
    terms: routingDetails.terms === '' ? null : (routingDetails.terms ?? null),
    pickupDeliveryFlag:
      routingDetails.pickupNeeded === 'Y' ||
      routingDetails.pickupNeeded === 'T'
        ? 'Y'
        : routingDetails.pickupNeeded
          ? 'N'
          : null,
    destinationCFSNamedAccount: '',
    dimensionBeans: null,
    direction: null,
    dischargeNamedAccount: '',
    aspects: '',
  };
};
