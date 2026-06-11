import {
  useFeatureToggle,
  CommonToggleKeys,
  COMMON_ENDPOINTS,
} from 'phoenix-common-react';
import type {
  CargoRowType,
  HazardousRowType,
  RoutingFormData,
} from 'phoenix-common-react';
import { ApiService } from '@/core/api/client';

interface HazRuleApiBean {
  imoClass: string;
  imoSubClass: string;
  company: string;
  unNumber: string;
  flashPointCelsius: number | null;
  weightKg: number;
  commodity: string;
}

interface HazRuleCargoDetails {
  cargoLineId: number;
  hazRuleBeanList: HazRuleApiBean[];
}

interface HazRuleMainBean {
  referenceNumber: string;
  shipmentType: string;
  placeOfReceiptCode: string;
  portOfLoadingCode: string;
  portOfDischargeCode: string;
  destinationCfsCode: string;
  placeOfDeliveryCode: string;
  carrier: string;
  cargoDetails: HazRuleCargoDetails[];
}

interface HazRuleRequest {
  head: { version: string };
  requestData: HazRuleMainBean[];
}

interface HazRuleResponseBean {
  imoClass: string;
  imoSubClass: string;
  unNumber: string;
  flashPointCelsius: number | null;
  weightKg: number;
  commodity: string;
  restrictionAction: string;
  remarks: string;
}

interface HazRuleResponseCargoDetails {
  cargoLineId: number;
  hazRuleBeanList: HazRuleResponseBean[];
}

interface HazRuleResponseMainBean {
  referenceNumber: string;
  action: string;
  cargoDetails: HazRuleResponseCargoDetails[];
}

interface HazRuleApiResponse {
  success: number;
  result: HazRuleResponseMainBean[] | null;
  message: string;
  errorCode: string | null;
}

const HAZ_ACTION = {
  SHIPMENT_RESTRICTED: 'SHIPMENT_RESTRICTED',
  CARRIER_APPROVAL_REQUIRE: 'CARRIER_APPROVAL_REQUIRE',
  DESTINATION_APPROVAL_REQUIRE: 'DESTINATION_APPROVAL_REQUIRE',
  SHIPMENT_ALLOWED: 'SHIPMENT_ALLOWED',
} as const;

function normalizeAction(action: string | null | undefined): string {
  const upper = (action ?? '').toUpperCase().trim();
  if (
    upper === 'DESTINATION_APPROVAL_REQUIRE' ||
    upper === 'DESTINATION_APPROVAL_REQUIRED'
  ) {
    return HAZ_ACTION.DESTINATION_APPROVAL_REQUIRE;
  }
  if (
    upper === 'CARRIER_APPROVAL_REQUIRE' ||
    upper === 'CARRIER_APPROVAL_REQUIRED'
  ) {
    return HAZ_ACTION.CARRIER_APPROVAL_REQUIRE;
  }
  return upper;
}

export type HazActionType =
  | 'SHIPMENT_RESTRICTED'
  | 'REQUIRES_APPROVAL'
  | 'SHIPMENT_ALLOWED';

export interface HazValidationResult {
  action: HazActionType;
  messages: string[];
  rawRemarks: string[];
  hazardousAction: string;
  hazaRuleNotes: string;
}

function isDeletedRow(controlFlag: string | null | undefined): boolean {
  return (controlFlag ?? '').toUpperCase() === 'D';
}

function isValidHazRow(haz: HazardousRowType | null | undefined): boolean {
  if (!haz) return false;
  if (isDeletedRow(haz.controlFlag)) return false;
  const imoClass = haz.imoClass?.trim();
  if (!imoClass || imoClass === '-1') return false;
  return true;
}

function mapHazRowToApiBean(haz: HazardousRowType): HazRuleApiBean {
  const cleanStr = (val: string | undefined): string =>
    !val || val.trim() === '-1' ? '' : val.trim();

  const fpRaw = haz.flashpointC?.trim();
  const flashPointCelsius: number | null =
    fpRaw !== '' && fpRaw !== undefined && !isNaN(parseFloat(fpRaw))
      ? parseFloat(fpRaw)
      : null;

  const wRaw = haz.weight?.trim();
  const weightKg: number =
    wRaw !== '' && wRaw !== undefined && !isNaN(parseFloat(wRaw))
      ? parseFloat(wRaw)
      : 0;

  return {
    imoClass: cleanStr(haz.imoClass),
    imoSubClass: cleanStr(haz.imoSubclass),
    company: '',
    unNumber: cleanStr(haz.unNumber),
    flashPointCelsius,
    weightKg,
    commodity: cleanStr(haz.commodity),
  };
}

function buildHazCargoDetails(
  cargoRows: CargoRowType[],
  shipmentType: string
): HazRuleCargoDetails[] {
  const type = shipmentType?.charAt(0)?.toUpperCase();

  if (type === 'F') {
    const allHazBeans: HazRuleApiBean[] = cargoRows
      .filter((c) => !isDeletedRow(c.controlFlag))
      .flatMap((c) =>
        (c.hazRows ?? []).filter(isValidHazRow).map(mapHazRowToApiBean)
      );

    return allHazBeans.length > 0
      ? [{ cargoLineId: 1, hazRuleBeanList: allHazBeans }]
      : [];
  }

  return cargoRows
    .filter((c) => !isDeletedRow(c.controlFlag))
    .map(
      (c, idx): HazRuleCargoDetails => ({
        cargoLineId: idx + 1,
        hazRuleBeanList: (c.hazRows ?? [])
          .filter(isValidHazRow)
          .map(mapHazRowToApiBean),
      })
    )
    .filter((cd) => cd.hazRuleBeanList.length > 0);
}

function buildHazRuleMainBean(
  routingFormData: RoutingFormData,
  cargoRows: CargoRowType[],
  shipmentType: string,
  referenceNumber: string
): HazRuleMainBean {
  return {
    referenceNumber,
    shipmentType: shipmentType?.charAt(0)?.toUpperCase() || 'L',
    placeOfReceiptCode: routingFormData.placeOfReceiptUnCode ?? '',
    portOfLoadingCode: routingFormData.portOfLoadingUnCode ?? '',
    portOfDischargeCode: routingFormData.portOfDischargeUnCode ?? '',
    destinationCfsCode: routingFormData.destinationCfsUnCode ?? '',
    placeOfDeliveryCode: routingFormData.placeOfDeliveryUnCode ?? '',
    carrier: routingFormData.carrierCode?.split('-')[0].trim() ?? '',
    cargoDetails: buildHazCargoDetails(cargoRows, shipmentType),
  };
}

function buildHazRuleRequest(bean: HazRuleMainBean): HazRuleRequest {
  return {
    head: { version: '2.0' },
    requestData: [bean],
  };
}

function processHazResponse(
  result: HazRuleResponseMainBean[]
): HazValidationResult {
  let isRestricted = false;
  let isApprovalRequired = false;
  let topLevelAction = '';
  const messages: string[] = [];
  const remarkParts: string[] = [];

  for (const bean of result) {
    const beanAction = normalizeAction(bean.action);
    if (!topLevelAction && bean.action)
      topLevelAction = normalizeAction(bean.action);

    if (beanAction === HAZ_ACTION.SHIPMENT_RESTRICTED) {
      isRestricted = true;
    } else if (
      beanAction === HAZ_ACTION.CARRIER_APPROVAL_REQUIRE ||
      beanAction === HAZ_ACTION.DESTINATION_APPROVAL_REQUIRE
    ) {
      isApprovalRequired = true;
    }

    for (const cargo of bean.cargoDetails ?? []) {
      for (const haz of cargo.hazRuleBeanList ?? []) {
        const rowAction = normalizeAction(haz.restrictionAction);
        if (rowAction !== HAZ_ACTION.SHIPMENT_ALLOWED && haz.remarks?.trim()) {
          remarkParts.push(haz.remarks.trim());

          if (rowAction === HAZ_ACTION.CARRIER_APPROVAL_REQUIRE) {
            messages.push(`Carrier Approval Required - ${haz.remarks.trim()}`);
          } else if (rowAction === HAZ_ACTION.DESTINATION_APPROVAL_REQUIRE) {
            messages.push(
              `Destination Approval Required - ${haz.remarks.trim()}`
            );
          } else {
            // Spec: "Pre-Booking cannot be saved - {remark}"
            messages.push(
              `Pre-Booking cannot be saved - ${haz.remarks.trim()}`
            );
          }
        }
      }
    }
  }

  const hazaRuleNotes = remarkParts.join('~');

  if (isRestricted) {
    return {
      action: 'SHIPMENT_RESTRICTED',
      messages:
        messages.length > 0
          ? messages
          : [
              'Pre-Booking cannot be saved - This shipment contains restricted hazardous cargo.',
            ],
      rawRemarks:
        remarkParts.length > 0
          ? remarkParts
          : ['This shipment contains restricted hazardous cargo.'],
      hazardousAction: HAZ_ACTION.SHIPMENT_RESTRICTED,
      hazaRuleNotes,
    };
  }

  if (isApprovalRequired) {
    return {
      action: 'REQUIRES_APPROVAL',
      messages:
        messages.length > 0
          ? messages
          : ['This shipment requires carrier or destination approval.'],
      rawRemarks: remarkParts,
      hazardousAction: topLevelAction || HAZ_ACTION.CARRIER_APPROVAL_REQUIRE,
      hazaRuleNotes,
    };
  }

  return {
    action: 'SHIPMENT_ALLOWED',
    messages: [],
    rawRemarks: [],
    hazardousAction: HAZ_ACTION.SHIPMENT_ALLOWED,
    hazaRuleNotes: '',
  };
}

function isHazardousInfoDiffLCL(
  oldCargoBeans: any[],
  newCargoRows: CargoRowType[]
): boolean {
  const str = (v: any): string => String(v ?? '').trim();

  const oldHazRows: any[] = (oldCargoBeans ?? [])
    .flatMap((c: any) => c?.bookingMultiCargoHazardousList ?? [])
    .filter((h: any) => h != null);

  const newHazRows = (newCargoRows ?? [])
    .filter((c) => !isDeletedRow(c.controlFlag))
    .flatMap((c) => c.hazRows ?? [])
    .filter(
      (h): h is HazardousRowType => h != null && !isDeletedRow(h.controlFlag)
    );

  if (oldHazRows.length === 0) return true;

  if (oldHazRows.length !== newHazRows.length) return true;

  let isHazChanged = true;

  for (let i = 0; i < oldHazRows.length; i++) {
    const o = oldHazRows[i];
    const n = newHazRows[i];

    if (!o || !n) return false;

    const oldImo = str(o.hazardousCode);
    const newImo = str(n.imoClass);

    if (oldImo.toLowerCase() !== newImo.toLowerCase()) {
      return true;
    }

    const oldFp = Number(o.flashPointCelsius ?? 0);
    const newFpRaw = n.flashpointC?.trim();
    const newFp =
      newFpRaw && !isNaN(parseFloat(newFpRaw)) ? parseFloat(newFpRaw) : 0;

    if (
      str(o.unNumber) !== str(n.unNumber) ||
      oldFp !== newFp ||
      str(o.imoSubClass) !== str(n.imoSubclass) ||
      str(o.commodity) !== str(n.commodity)
    ) {
      return true;
    }

    isHazChanged = false;
  }

  return isHazChanged;
}

function hasHazardousDetailsChanged(
  savedBean: any,
  newRouting: RoutingFormData,
  newCargoRows: CargoRowType[],
  shipmentType: string,
  currentStatus: string
): boolean {
  if (!savedBean) return true;

  const str = (v: any): string => String(v ?? '').trim();

  const oldStatus = str(savedBean.status);
  const newIsPreliminary =
    currentStatus === 'Preliminary' || currentStatus === 'I';
  if (oldStatus === 'I' && !newIsPreliminary && currentStatus !== '') {
    return true;
  }

  const r = savedBean.bookingQuoteRoutingBean;
  if (!r) return true;

  if (
    str(r.originUncode) !== str(newRouting.placeOfReceiptUnCode) ||
    str(r.loadUnCode) !== str(newRouting.portOfLoadingUnCode) ||
    str(r.dischargeUnCode) !== str(newRouting.portOfDischargeUnCode) ||
    str(r.finalCFSUNCode) !== str(newRouting.destinationCfsUnCode) ||
    str(r.destinationUnCode) !== str(newRouting.placeOfDeliveryUnCode)
  ) {
    return true;
  }

  const oldCargoBeans: any[] = savedBean.bookingQuoteMultiCargoBeanList ?? [];
  return isHazardousInfoDiffLCL(oldCargoBeans, newCargoRows);
}

export interface ValidateHazRulesParams {
  cargoRows: CargoRowType[];
  routingFormData: RoutingFormData;
  shipmentType: string;
  referenceNumber: string | number | undefined;
  savedBean?: any;
  currentStatus?: string;
}

export interface UseHazRuleValidationReturn {
  validateHazRules: (
    params: ValidateHazRulesParams
  ) => Promise<HazValidationResult | null>;
}

export function useHazRuleValidation(): UseHazRuleValidationReturn {
  const { isVisible } = useFeatureToggle();

  const validateHazRules = async (
    params: ValidateHazRulesParams
  ): Promise<HazValidationResult | null> => {
    const {
      cargoRows,
      routingFormData,
      shipmentType,
      referenceNumber,
      savedBean,
      currentStatus = '',
    } = params;

    if (!isVisible(CommonToggleKeys.OCN_APPLY_HAZ_RULE)) {
      return null;
    }

    const hasAnyValidHazRow = cargoRows.some(
      (c) =>
        !isDeletedRow(c.controlFlag) &&
        c.hazardous?.charAt(0) === 'Y' &&
        (c.hazRows ?? []).some(isValidHazRow)
    );
    if (!hasAnyValidHazRow) {
      return null;
    }

    const refStr = String(referenceNumber ?? 0);
    const isUpdate = refStr !== '0' && !!savedBean;
    if (isUpdate) {
      const changed = hasHazardousDetailsChanged(
        savedBean,
        routingFormData,
        cargoRows,
        shipmentType,
        currentStatus
      );
      if (!changed) {
        return null;
      }
    }
    const hazBean = buildHazRuleMainBean(
      routingFormData,
      cargoRows,
      shipmentType,
      refStr
    );
    const requestPayload = buildHazRuleRequest(hazBean);

    const response = (await ApiService.post(
      COMMON_ENDPOINTS.HAZ_RULE.FETCH_HAZ_RULES,
      requestPayload
    )) as { data: HazRuleApiResponse };

    const { success, result } = response.data;

    if (
      success === 404 ||
      result === null ||
      (Array.isArray(result) && result.length === 0)
    ) {
      return null;
    }

    if (success === 500) {
      throw new Error(
        response.data.message || 'Hazardous rule validation returned an error.'
      );
    }

    return processHazResponse(result);
  };

  return { validateHazRules };
}
