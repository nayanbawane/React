import { useCallback } from 'react';

import { ApiService } from '@/core/api/client';
import {
  useFeatureToggle,
  LclToggleKeys,
  CommonToggleKeys,
  COMMON_ENDPOINTS,
} from 'phoenix-common-react';
import type { RoutingFormData } from 'phoenix-common-react';
import type {
  PickupDeliveryFormData,
  DoorDeliveryFormData,
} from 'phoenix-common-react';
import type { LoginClientBeanRaw } from 'phoenix-common-react';

import type {
  GetLotReceivedFlagRequest,
  GetLotReceivedFlagResponse,
  RequestWarehouseBean,
  FindClosestWarehouseRequest,
  FindClosestWarehouseResponse,
  ResponseWarehouseBean,
  TRKWarehouseMappingBean,
  GetWarehouseMappingRequest,
  GetWarehouseMappingResponse,
  TRKWarehouseBean,
} from './warehouseMapping.types';

const PICKUP_NO_VALUES = ['N', 'NO'];

export interface WarehouseMappingCallbacks {
  onWarehouseCodeChanged?: (newCode: string) => void;

  onDocumentDetailsValidation?: () => void;

  onCfsContactChange?: (code: string) => void;

  onCfsIntegrationVisibility?: (code: string, show: boolean) => void;

  onShowDeliveryType?: () => void;

  onDoorDeliveryWarehouseSet?: (
    code: string,
    name: string,
    destinationWarehouseText: string
  ) => void;
}

export interface UseWarehouseMappingHandlerParams {
  routingFormData: RoutingFormData;
  truckingPickupForms: Record<number, PickupDeliveryFormData>;
  doorDeliveryForm: DoorDeliveryFormData;
  showPickupStack: boolean;

  isLotReceived: boolean;
  isShipmentOrderTransmit: boolean;

  moduleType: 'BKG' | 'QUOTE';
  shipmentType: 'LCL' | 'FCL';
  bookingQuoteType: string;
  referenceNumber: number | null;

  loginClientBean: LoginClientBeanRaw | null;

  cargoHazardousValues: string[];

  updateRouting: (updates: Partial<RoutingFormData>) => void;

  callbacks?: WarehouseMappingCallbacks;
}

export const useWarehouseMappingHandler = (
  params: UseWarehouseMappingHandlerParams
) => {
  const {
    routingFormData,
    truckingPickupForms,
    doorDeliveryForm,
    isLotReceived,
    isShipmentOrderTransmit,
    moduleType,
    shipmentType,
    bookingQuoteType,
    referenceNumber,
    loginClientBean,
    cargoHazardousValues,
    updateRouting,
    callbacks = {},
  } = params;

  const featureToggle = useFeatureToggle();
  const { isVisible } = featureToggle;

  const getUsOfficeSet = useCallback((): Set<string> => {
    const raw = loginClientBean?.usOfficeMap;
    if (!raw || typeof raw !== 'object') return new Set();
    const map = raw as {
      usOffices?: string[];
      usTerritoriesOffices?: string[];
      usIntermodelOffices?: string[];
    };
    return new Set([
      ...(map.usOffices ?? []),
      ...(map.usTerritoriesOffices ?? []),
      ...(map.usIntermodelOffices ?? []),
    ]);
  }, [loginClientBean]);

  const getPortOfReceipt = useCallback((): string => {
    return (
      routingFormData.placeOfReceiptCode?.trim().toUpperCase() ||
      routingFormData.portOfLoadingCode?.trim().toUpperCase() ||
      ''
    );
  }, [routingFormData.placeOfReceiptCode, routingFormData.portOfLoadingCode]);

  const getDestinationCFS = useCallback((): string => {
    return (
      routingFormData.destinationCfsCode?.trim().toUpperCase() ||
      routingFormData.portOfDischargeCode?.trim().toUpperCase() ||
      ''
    );
  }, [routingFormData.destinationCfsCode, routingFormData.portOfDischargeCode]);

  const isNotFromUsRouting = useCallback((): boolean => {
    const originCode = getPortOfReceipt();
    if (!originCode) return false;
    const usSet = getUsOfficeSet();
    if (usSet.size > 0) return !usSet.has(originCode);
    return false;
  }, [getPortOfReceipt, getUsOfficeSet]);

  const isNotToUsRouting = useCallback((): boolean => {
    const destCode = getDestinationCFS();
    if (!destCode) return false;
    const usSet = getUsOfficeSet();
    if (usSet.size > 0) return !usSet.has(destCode);
    return false;
  }, [getDestinationCFS, getUsOfficeSet]);

  const isBlankCountry = useCallback(
    (direction: string): boolean => {
      if (direction.toUpperCase() === 'EO') {
        const pickupCountry = truckingPickupForms[0]?.country ?? '';
        return !pickupCountry.trim();
      }
      return !doorDeliveryForm.doorDeliveryCountry?.trim();
    },
    [truckingPickupForms, doorDeliveryForm]
  );

  const isFromUsCountry = useCallback((): boolean => {
    const form = truckingPickupForms[0];
    if (!form) return true;
    const raw = form.country ?? '';
    const code = raw.split('-')[0].trim().toUpperCase();
    return code === 'US';
  }, [truckingPickupForms]);

  const isImportQuote = useCallback((): boolean => {
    return (
      isVisible(LclToggleKeys.SHOW_DIRECTION) &&
      moduleType === 'QUOTE' &&
      routingFormData.direction?.toUpperCase() === 'I'
    );
  }, [isVisible, moduleType, routingFormData.direction]);

  const checkRoutingForCallRoutingGuide = useCallback(
    (direction: string): boolean => {
      if (direction.toUpperCase() === 'EO') {
        const porCode = getPortOfReceipt();
        const blankCntry = isBlankCountry('EO');
        const pickupNo = PICKUP_NO_VALUES.includes(
          (routingFormData.pickupNeeded ?? '').toUpperCase()
        );

        if (!blankCntry && !isFromUsCountry() && !!porCode) return true;
        if (blankCntry && !!porCode && isNotFromUsRouting()) return true;
        if (pickupNo && isNotFromUsRouting()) return true;
        return false;
      }

      const destCode = getDestinationCFS();
      const notToUs = isNotToUsRouting();

      if (!!destCode && notToUs) return true;
      return false;
    },
    [
      getPortOfReceipt,
      getDestinationCFS,
      isBlankCountry,
      isFromUsCountry,
      isNotFromUsRouting,
      isNotToUsRouting,
      routingFormData.pickupNeeded,
    ]
  );

  const resolveHazardousCode = useCallback((): string => {
    const hasHaz = cargoHazardousValues.some(
      (v) => v && v.toUpperCase().startsWith('Y')
    );
    return hasHaz ? 'Y' : 'N';
  }, [cargoHazardousValues]);

  const buildRequestBeanForPickup = useCallback((): RequestWarehouseBean => {
    const form = truckingPickupForms[0];
    const raw = form?.country ?? '';
    const code = raw ? raw.split('-')[0].trim() : '';

    const isMultiPickupOn = isVisible(
      CommonToggleKeys.OCEAN_BKG_TRK_MULTI_PICKUP
    );
    if (moduleType === 'BKG' && isMultiPickupOn && !form?.latitude?.trim()) {
      return {
        direction: 'EO',
        countryCode: '',
        unLocationCode: '',
        latitude: 0,
        longitude: 0,
      };
    }

    const lat = parseFloat(form?.latitude ?? '0') || 0;
    const lng = parseFloat(form?.longitude ?? '0') || 0;
    return {
      direction: 'EO',
      countryCode: code,
      unLocationCode: '',
      latitude: lat,
      longitude: lng,
    };
  }, [truckingPickupForms, moduleType, isVisible]);

  const buildTRKMappingBean = useCallback(
    (direction: string): TRKWarehouseMappingBean => {
      const isDoorDelivery = routingFormData.deliveryType === 'D';

      const toDeliveryRaw = isDoorDelivery
        ? (doorDeliveryForm.doorDeliveryCountry ?? '')
        : '';
      const toCountryCode = toDeliveryRaw
        ? toDeliveryRaw.split('-')[0].trim()
        : '';

      const hasPickup = !PICKUP_NO_VALUES.includes(
        (routingFormData.pickupNeeded ?? '').toUpperCase()
      );
      const isMultiPickupOn = isVisible(
        CommonToggleKeys.OCEAN_BKG_TRK_MULTI_PICKUP
      );
      const hasValidPickup =
        hasPickup &&
        (moduleType !== 'BKG' ||
          !isMultiPickupOn ||
          !!truckingPickupForms[0]?.latitude?.trim());

      const fromPickupRaw = hasPickup
        ? (truckingPickupForms[0]?.country ?? '')
        : '';
      const fromCountryCode = hasPickup
        ? fromPickupRaw.split('-')[0].trim()
        : '';

      const displayStateName = isVisible(
        CommonToggleKeys.OCEAN_DISPLAY_STATE_NAME
      );
      const rawPickupState = hasPickup
        ? (truckingPickupForms[0]?.state ?? '')
        : '';
      const fromPickupState = hasPickup
        ? displayStateName
          ? rawPickupState.split(' - ')[0].trim()
          : rawPickupState
        : '';

      return {
        direction,
        fromCountryCode,
        fromPOR: getPortOfReceipt(),
        fromPOL: routingFormData.portOfLoadingCode?.trim().toUpperCase() ?? '',
        fromPickupState,
        fromPickupZip: hasPickup
          ? (truckingPickupForms[0]?.zipCode ?? '')
          : '',
        toCountryCode,
        toDestCFS: getDestinationCFS(),
        toPOD: routingFormData.portOfDischargeCode?.trim().toUpperCase() ?? '',
        toDoorDeliveryState: isDoorDelivery
          ? (doorDeliveryForm.doorDeliveryState ?? '')
          : '',
        toDoorDeliveryZip: isDoorDelivery
          ? (doorDeliveryForm.doorDeliveryZipCode ?? '')
          : '',
        hazardousCode: resolveHazardousCode(),
        carrierCode: routingFormData.carrierCode 
          ? routingFormData.carrierCode.split(' - ')[0].trim()
          : '',
      };
    },
    [
      getPortOfReceipt,
      getDestinationCFS,
      routingFormData.portOfLoadingCode,
      routingFormData.portOfDischargeCode,
      routingFormData.deliveryType,
      routingFormData.pickupNeeded,
      truckingPickupForms,
      doorDeliveryForm,
      moduleType,
      isVisible,
      resolveHazardousCode,
    ]
  );

  const applyPickupWarehouseResult = useCallback(
    (
      result: ResponseWarehouseBean | TRKWarehouseBean,
      isTrkGuideResult: boolean
    ) => {
      const newCode = result.code?.trim() ?? '';
      const newName = result.name?.trim() ?? '';
      const oldCode = routingFormData.warehouse?.trim() ?? '';

      updateRouting({ warehouse: newCode, warehouseName: newName });

      const showDeliveryType = isVisible(LclToggleKeys.SHOW_DELIVERY_TYPE);
      const transmitToThirdParty = isVisible(
        CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY
      );
      const isLcl = shipmentType === 'LCL';
      if (transmitToThirdParty && showDeliveryType && isLcl) {
        const transmitSetting =
          loginClientBean?.locationSettingMap?.[newCode]?.[
            'TRANSMIT_BOOKING_DATA_TO_WAREHOUSE'
          ]?.[0];
        if (transmitSetting?.toUpperCase() === 'YES') {
          callbacks.onShowDeliveryType?.();
        }
      }
      if (showDeliveryType && isLcl) {
        const loadPlanSetting =
          loginClientBean?.locationSettingMap?.[newCode]?.[
            'OCN_CRG_TRANSMIT_LOAD_PLAN_DATA_TO_WAREHOUSE'
          ]?.[0];
        if (loadPlanSetting?.toUpperCase() === 'YES') {
          callbacks.onShowDeliveryType?.();
        }
      }

      if (
        isVisible(CommonToggleKeys.OCEAN_BOOKING_SHOW_CFS_INTEGRATION_DETAILS)
      ) {
        const isBkg = moduleType === 'BKG';
        const cfsIntegrationSetting =
          loginClientBean?.locationSettingMap?.[newCode]?.[
            'OCEAN_FREIGHT_BOOKING_SHOW_CFS_INTEGRATION_DETAILS'
          ]?.[0];
        const hasWarehouseToggle =
          cfsIntegrationSetting?.toUpperCase() === 'YES';
        callbacks.onCfsIntegrationVisibility?.(
          newCode,
          isBkg && !!newCode && isLcl && hasWarehouseToggle
        );
      }

      const warehouseChanged = oldCode.toLowerCase() !== newCode.toLowerCase();
      if (warehouseChanged) {
        callbacks.onWarehouseCodeChanged?.(newCode);
      }

      if (
        isVisible(CommonToggleKeys.OCEAN_ENABLE_DOCUMENT_DETAILS_SETTING) &&
        moduleType === 'BKG' &&
        !referenceNumber
      ) {
        callbacks.onDocumentDetailsValidation?.();
      }

      if (!isTrkGuideResult || warehouseChanged) {
        callbacks.onCfsContactChange?.(newCode);
      }
    },
    [
      routingFormData.warehouse,
      updateRouting,
      isVisible,
      shipmentType,
      moduleType,
      referenceNumber,
      loginClientBean,
      callbacks,
    ]
  );

  const applyTruckQuoteRouting = useCallback(
    (
      direction: string,
      routingCode: string,
      routingName: string,
      bookingQuoteType: string
    ) => {
      if (!isVisible(LclToggleKeys.STANDALONE_QUOTE_RATE)) return;
      if (bookingQuoteType?.toUpperCase() !== 'LCLQUO') return;

      if (direction.toUpperCase() === 'EO') {
        if (!routingFormData.placeOfReceiptCode?.trim()) {
          updateRouting({
            placeOfReceiptCode: routingCode,
            placeOfReceiptName: routingName,
          });
        }
      } else {
        if (!routingFormData.placeOfDeliveryCode?.trim()) {
          updateRouting({
            placeOfDeliveryCode: routingCode,
            placeOfDeliveryName: routingName,
          });
        }
      }
    },
    [isVisible, routingFormData, updateRouting]
  );
  // 3rd API
  const updateWarehouseBasedOnPOR = useCallback(
    async (warehouseOnPOR: boolean): Promise<void> => {
      if ( !routingFormData.placeOfReceiptCode?.trim()) {
        return;
      }

      const request = {
        requestData: {
          locationCode: routingFormData.placeOfReceiptUnCode,
          officeCode: loginClientBean.office,
          direction: 'EO',
        },
      };

      const response = await ApiService.post(
        COMMON_ENDPOINTS.WAREHOUSE_MAPPING.GET_WAREHOUSE_BY_UNCODE,
        request
      );

      if (response.data.success === 1) {
        const newCode = response.data.result.warehouseCode?.trim() ?? '';
        const newName = response.data.result.warehouseName?.trim() ?? '';

        updateRouting({ warehouse: newCode, warehouseName: newName, });
      }
    },
    [routingFormData, loginClientBean, updateRouting]
  );
  // ─── 2nd API

  const callRoutingGuideRPCForPickup = useCallback(
    async (
      direction: string,
      bookingQuoteType: string,
      warehouseOnPOR: boolean = false
    ): Promise<void> => {
      const bean = buildTRKMappingBean(direction);
      const request: GetWarehouseMappingRequest = {
        requestData: { trkWarehouseMappingBean: bean },
      };

      try {
        const response = await ApiService.post<GetWarehouseMappingResponse>(
          COMMON_ENDPOINTS.WAREHOUSE_MAPPING.GET_TRK_WAREHOUSE_MAPPING,
          request
        );
        const result: TRKWarehouseBean | null = response.data?.result ?? null;

        if (result) {
          applyPickupWarehouseResult(result, true);
          applyTruckQuoteRouting(
            direction,
            result.routingCode,
            result.routingName,
            bookingQuoteType
          );
        } else {
            if(warehouseOnPOR &&
              isVisible(CommonToggleKeys.OCN_BKG_UPDATE_WAR_BASED_ON_POR)){
              await updateWarehouseBasedOnPOR(warehouseOnPOR);
            }
        }
      } catch {
        //onFailure
      }
    },
    [buildTRKMappingBean, applyPickupWarehouseResult, applyTruckQuoteRouting,updateWarehouseBasedOnPOR]
  );

  const setPickupWarehouseByMapping = useCallback(
    async (direction: string, warehouseOnPOR: boolean = false): Promise<void> => {
      if (isLotReceived) return;

      if (isShipmentOrderTransmit) return;

      if (referenceNumber) {
        try {
          const lotRequest: GetLotReceivedFlagRequest = {
            requestData: {
              lotReceivedFlagBean: {
                bookingNumber: String(referenceNumber),
                params: {
                  officeSchemaName: loginClientBean?.schema ?? '',
                },
              },
            },
          };
          const lotResponse = await ApiService.post<GetLotReceivedFlagResponse>(
            COMMON_ENDPOINTS.WAREHOUSE_MAPPING.GET_LOT_RECEIVED_FLAG,
            lotRequest
          );
          if (lotResponse.data?.result === true) return;
        } catch {
          //failure
        }
      }

      const useClosestWarehouse =
        isVisible(CommonToggleKeys.OCN_BKG_QUOTE_GET_CLOSEST_CFS) ||
        isImportQuote() ||
        (!PICKUP_NO_VALUES.includes(
          (routingFormData.pickupNeeded ?? '').toUpperCase()
        ) &&
          isFromUsCountry());

      if (useClosestWarehouse) {
        const requestBean = buildRequestBeanForPickup();

        if (!requestBean) {
          return;
        }

        const findRequest: FindClosestWarehouseRequest = {
          requestData: { requestWarehouseBean: requestBean },
        };

        try {
          const findResponse =
            await ApiService.post<FindClosestWarehouseResponse>(
              COMMON_ENDPOINTS.WAREHOUSE_MAPPING.FIND_CLOSEST_WAREHOUSE,
              findRequest
            );
          const result: ResponseWarehouseBean | null =
            findResponse.data?.result ?? null;

          if (result) {
            applyPickupWarehouseResult(result, false);
            applyTruckQuoteRouting(
              direction,
              result.routingCode,
              result.routingName,
              bookingQuoteType
            );

            if (checkRoutingForCallRoutingGuide(direction)) {
              await callRoutingGuideRPCForPickup(
                direction,
                bookingQuoteType,
                warehouseOnPOR
              );
            }
          } else {
            // GWT: result == null → check routing guide anyway
            if (checkRoutingForCallRoutingGuide(direction)) {
              await callRoutingGuideRPCForPickup(
                direction,
                bookingQuoteType,
                warehouseOnPOR
              );
            } else {
              if(warehouseOnPOR &&
                isVisible(CommonToggleKeys.OCN_BKG_UPDATE_WAR_BASED_ON_POR)){
              await updateWarehouseBasedOnPOR(warehouseOnPOR);
            }
            }
          }
        } catch {}
      } else {
        if (checkRoutingForCallRoutingGuide(direction)) {
          await callRoutingGuideRPCForPickup(
            direction,
            bookingQuoteType,
            warehouseOnPOR
          );
        } else {
          if(warehouseOnPOR 
            && isVisible(CommonToggleKeys.OCN_BKG_UPDATE_WAR_BASED_ON_POR)){
              await updateWarehouseBasedOnPOR(warehouseOnPOR);
            }
        }
      }
    },
    [
      isLotReceived,
      isShipmentOrderTransmit,
      bookingQuoteType,
      referenceNumber,
      loginClientBean,
      isVisible,
      isImportQuote,
      isFromUsCountry,
      routingFormData.pickupNeeded,
      buildRequestBeanForPickup,
      applyPickupWarehouseResult,
      applyTruckQuoteRouting,
      checkRoutingForCallRoutingGuide,
      callRoutingGuideRPCForPickup,
      updateWarehouseBasedOnPOR,
    ]
  );

  const buildRequestBeanForDD = useCallback((): RequestWarehouseBean => {
    const raw = doorDeliveryForm.doorDeliveryCountry ?? '';
    const code = raw ? raw.split('-')[0].trim() : '';
    const lat = parseFloat(doorDeliveryForm.latitude ?? '0') || 0;
    const lng = parseFloat(doorDeliveryForm.longitude ?? '0') || 0;

    return {
      direction: 'IO',
      countryCode: code,
      unLocationCode: '',
      latitude: lat,
      longitude: lng,
    };
  }, [doorDeliveryForm]);

  const applyDoorDeliveryWarehouseResult = useCallback(
    (result: ResponseWarehouseBean | TRKWarehouseBean) => {
      const code = result.code?.trim() ?? '';
      const name = result.name?.trim() ?? '';
      const unLocCode =
        ('unLocationCode' in result
          ? result.unLocationCode
          : result.unLocation
        )?.trim() ?? '';
      const unLocName = result.unLocationName?.trim() ?? '';
      const destinationWarehouseText = unLocCode
        ? `${unLocCode} - ${unLocName}`
        : '';

      updateRouting({ destinationWarehouse: destinationWarehouseText });
      callbacks.onDoorDeliveryWarehouseSet?.(
        code,
        name,
        destinationWarehouseText
      );
    },
    [callbacks, updateRouting]
  );

  const callRoutingGuideRPCForDD = useCallback(
    async (direction: string): Promise<void> => {
      const bean = buildTRKMappingBean(direction);
      const request: GetWarehouseMappingRequest = {
        requestData: { trkWarehouseMappingBean: bean },
      };

      try {
        const response = await ApiService.post<GetWarehouseMappingResponse>(
          COMMON_ENDPOINTS.WAREHOUSE_MAPPING.GET_TRK_WAREHOUSE_MAPPING,
          request
        );
        const result: TRKWarehouseBean | null = response.data?.result ?? null;

        if (result && result.code?.toUpperCase() !== 'NONE') {
          applyDoorDeliveryWarehouseResult(result);
          applyTruckQuoteRouting(
            'IO',
            result.routingCode,
            result.routingName,
            bookingQuoteType
          );
        }
      } catch {
        //onFailure
      }
    },
    [
      buildTRKMappingBean,
      applyDoorDeliveryWarehouseResult,
      applyTruckQuoteRouting,
      bookingQuoteType,
    ]
  );

  const setDoorDeliveryWarehouseByMapping = useCallback(
    async (direction: string): Promise<void> => {
      const deliveryType = routingFormData.deliveryType ?? '';
      const isDoorOrTms =
        deliveryType.toUpperCase() === 'D' ||
        deliveryType.toUpperCase() === 'T';

      if (!isDoorOrTms) return;

      const requestBean = buildRequestBeanForDD();
      const findRequest: FindClosestWarehouseRequest = {
        requestData: { requestWarehouseBean: requestBean },
      };

      try {
        const findResponse =
          await ApiService.post<FindClosestWarehouseResponse>(
            COMMON_ENDPOINTS.WAREHOUSE_MAPPING.FIND_CLOSEST_WAREHOUSE,
            findRequest
          );
        const result: ResponseWarehouseBean | null =
          findResponse.data?.result ?? null;

        if (result) {
          applyDoorDeliveryWarehouseResult(result);
          applyTruckQuoteRouting(
            'IO',
            result.routingCode,
            result.routingName,
            bookingQuoteType
          );
          if (checkRoutingForCallRoutingGuide(direction)) {
            await callRoutingGuideRPCForDD(direction);
          }
        } else {
          if (checkRoutingForCallRoutingGuide(direction)) {
            await callRoutingGuideRPCForDD(direction);
          }
        }
      } catch {
        //onFailure
      }
    },
    [
      routingFormData.deliveryType,
      bookingQuoteType,
      buildRequestBeanForDD,
      applyDoorDeliveryWarehouseResult,
      applyTruckQuoteRouting,
      checkRoutingForCallRoutingGuide,
      callRoutingGuideRPCForDD,
    ]
  );

  const triggerWarehouseMapping = useCallback(
    (direction: string,
      warehouseOnPOR: boolean = false
    ): void => {
      if (direction.toUpperCase() === 'EO') {
        setPickupWarehouseByMapping(direction,warehouseOnPOR);
      } else {
        setDoorDeliveryWarehouseByMapping(direction);
      }
    },
    [setPickupWarehouseByMapping, setDoorDeliveryWarehouseByMapping]
  );

  return {
    setPickupWarehouseByMapping,
    setDoorDeliveryWarehouseByMapping,
    triggerWarehouseMapping,
  };
};
