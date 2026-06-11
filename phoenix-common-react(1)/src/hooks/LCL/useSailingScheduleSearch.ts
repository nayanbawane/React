import { useCallback } from 'react';
import { useSelector } from 'react-redux';

import { ApiService } from '../../core/api/client';
import { COMMON_ENDPOINTS } from '../../core/api/config/common.endpoints';
import { LclToggleKeys } from '../../core/featureToggles/keys/oceanToggleKeys';
import { selectLoginClientBean } from '../../core/featureToggles/featureToggle.selectors';
import { useFeatureToggle } from './useFeatureToggle';
import type {
  ScheduleLocationItem,
  ScheduleSuggestionItem,
  ScheduleGroup,
  ScheduleRow,
  TransshipmentPortDetail,
  ScheduleCacheApiRequest,
  ScheduleCacheApiResponse,
  ScheduleRequestBean,
  OriginRequestBean,
  DestinationRequestBean,
  ScheduleWebServiceApiRequest,
  ScheduleWebServiceApiResponse,
  ParsedScheduleDetail,
  ParsedScheduleResponse,
  ParsedLocationListResponse,
  WarehouseMappingResponse,
} from '../../types/LCL/misc/SailingScheduleSearch.types';
import { TRKWarehouseBean, TrkWarehouseMapping } from '@/types/LCL/warehouseMapping/warehouseMapping.types';

const SAILING_TYPE = 'SailingScheduleSearch';
const SAILING_ORIGIN_TYPE = 'ScheduleSearchGetOriginRequest';
const SAILING_DESTINATION_TYPE = 'ScheduleSearchGetDestinationRequest';
const RECEIVER_ID = 'WWA';
const REQUEST_ID = '4725';
const OFFSET = '0';

function getSetting(map: Record<string, string[]>, key: string): string {
  return map[key]?.[0] ?? '';
}

function buildWwaUrl(
  settings: Record<string, string[]>,
  pathKey: string
): string {
  const base = getSetting(settings, 'WWA_BASE_URL_SCHEDULE');
  const path = getSetting(settings, pathKey);
  return base + path;
}

function buildRequestBean(
  type: string,
  version: string,
  senderID: string,
  details: ScheduleRequestBean['ScheduleRequest']['ScheduleRequestDetails']
): ScheduleRequestBean {
  return {
    ScheduleRequest: {
      type,
      version,
      senderID,
      receiverID: RECEIVER_ID,
      requestID: REQUEST_ID,
      ScheduleRequestDetails: details,
    },
  };
}

function buildOriginRequestBean(
  version: string,
  senderID: string,
  dateFrom: string,
  dateTo: string
): OriginRequestBean {
  return {
    ScheduleSearchGetOriginRequest: {
      Type: SAILING_ORIGIN_TYPE,
      Version: version,
      SenderID: senderID,
      ScheduleSearchGetOriginRequestDetails: {
        FromDate: dateFrom,
        ToDate: dateTo,
      },
    },
  };
}

function buildDestinationRequestBean(
  version: string,
  senderID: string,
  originCode: string,
  dateFrom: string,
  dateTo: string
): DestinationRequestBean {
  return {
    ScheduleSearchGetDestinationRequest: {
      Type: SAILING_DESTINATION_TYPE,
      Version: version,
      SenderID: senderID,
      ScheduleSearchGetDestinationRequestDetails: {
        originLocationCode: originCode,
        FromDate: dateFrom,
        ToDate: dateTo,
      },
    },
  };
}

function parseWebServiceOriginResult(raw: string): ScheduleLocationItem[] {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;

    const originDetails = (
      parsed['ScheduleSearchGetOriginResponse'] as Record<string, unknown>
    )?.['ScheduleSearchGetOriginResponseDetails'] as
      | Record<string, unknown>
      | undefined;
    if (originDetails) {
      const rows = originDetails['result'] as Array<Record<string, unknown>> | undefined;
      return (rows ?? []).map((r) => ({
        locationCode: String(r['cOriginLocationCode'] ?? ''),
        locationName: String(r['cOriginCityName'] ?? ''),
      }));
    }

    const destDetails = (
      parsed['ScheduleSearchGetDestinationResponse'] as Record<string, unknown>
    )?.['ScheduleSearchGetDestinationResponseDetails'] as
      | Record<string, unknown>
      | undefined;
    if (destDetails) {
      const rows = destDetails['result'] as Array<Record<string, unknown>> | undefined;
      return (rows ?? []).map((r) => ({
        locationCode: String(r['cDestinationcode'] ?? ''),
        locationName: String(r['cDestinationCityName'] ?? ''),
      }));
    }

    const legacy = parsed as ParsedLocationListResponse;
    return legacy.resultOriginList ?? legacy.resultDestinationList ?? [];
  } catch {
    return [];
  }
}

function mapLocationsToSuggestions(
  items: ScheduleLocationItem[],
  deduplicate: boolean
): ScheduleSuggestionItem[] {
  const seen = new Set<string>();
  const result: ScheduleSuggestionItem[] = [];
  for (const item of items) {
    const value = `${item.locationCode}-${item.locationName}`;
    if (deduplicate && seen.has(value)) continue;
    seen.add(value);
    result.push({
      label: `${item.locationCode} - ${item.locationName}`,
      value,
    });
  }
  return result;
}

function buildTransshipmentPorts(
  detail: ParsedScheduleDetail
): TransshipmentPortDetail[] {
  const routeInfo = detail.RouteInformation;
  if (!routeInfo?.length) return [];

  const typeSPorts: TransshipmentPortDetail[] = [];
  const typeTPorts: TransshipmentPortDetail[] = [];

  for (const leg of routeInfo) {
    if ((leg.iTransshipment ?? 0) <= 0) continue;
    const entry: TransshipmentPortDetail = {
      portCode: leg.RouteOrigin ?? '',
      portDate: leg.RouteETA ?? '',
      seq: 0,
    };
    if (leg.RouteType === 'S') {
      typeSPorts.push(entry);
    } else if (leg.RouteType === 'T') {
      typeTPorts.push(entry);
    }
  }

  const ports = typeSPorts.length > 0 ? typeSPorts : typeTPorts;
  return ports.map((p, i) => ({ ...p, seq: i + 1 }));
}

function mapDetailToRow(detail: ParsedScheduleDetail): ScheduleRow {
  const portOfDischargeCode = detail.PortofDischargecode
    ? String(detail.PortofDischargecode)
    : String(detail.Destination ?? '');

  const vesselName = detail.VesselName ?? '';
  const voyageCode = detail.Voyage ?? '';

  return {
    vesselVoyage: [vesselName, voyageCode].filter(Boolean).join(' / '),
    vesselName,
    voyageCode,
    imoNumber: String(detail.IMONumber ?? ''),
    carrierScac: detail.CarrierSCAC ?? '',
    houseCarrierScac: detail.HouseSCAC ?? '',
    cutOffDateTime: detail.CutOffDateTime ?? '',
    etd: detail.ETD ?? '',
    eta: detail.ETA ?? '',
    portOfDischargeDate: detail.PortofDischargedate ?? '',
    routingVia: typeof detail.routingviaPortname === 'string'
      ? detail.routingviaPortname
      : '',
    portOfLoadingCode:
      typeof detail.RoutingVia === 'string' ? detail.RoutingVia : '',
    portOfLoadingName:
      typeof detail.routingviaPortname === 'string'
        ? detail.routingviaPortname
        : '',
    portOfDischargeCode,
    scheduleOriginCode: String(detail.Origin ?? ''),
    scheduleDestinationCode: String(detail.Destination ?? ''),
    transitTimeCutoffPort: detail.TransitTimeCFSToCFS ?? '',
    transitTimePortPort: detail.TransitTimePortToPort ?? '',
    transitTimePortCfs: detail.TransitTimePortCFS ?? '',
    transitTimeCfsCfs: detail.TransitTimeCFSToCFS ?? '',
    transshipmentPorts: buildTransshipmentPorts(detail),
    originCityName: String(detail.OriginCityname ?? ''),
    portOfDischargeCityName: String(detail.PortofDischargeCityname ?? ''),
    destinationCityName: String(detail.DestinationCityname ?? ''),
  };
}

export function useSailingScheduleSearch() {
  const loginBean = useSelector(selectLoginClientBean);
  const { isVisible } = useFeatureToggle();

  const wwaEnabled = isVisible(LclToggleKeys.SAILING_SCHEDULE_SEARCH);
  const fromMondayEnabled = isVisible(
    LclToggleKeys.SAILING_SCHEDULE_FROM_MONDAY
  );
  const removeDuplicateEnabled = isVisible(
    LclToggleKeys.SAILING_SCHEDULE_REMOVE_DUPLICATE
  );

  const fetchOrigins = useCallback(
    async (
      dateFrom: string,
      dateTo: string
    ): Promise<ScheduleSuggestionItem[]> => {
      const settings = loginBean?.officeSettingMap ?? {};

      try {
        const cacheReq: ScheduleCacheApiRequest = {
          scheduleLookUpSearchBean: {
            fromDate: dateFrom,
            toDate: dateTo,
            origin: null,
            resultOriginList: [],
            resultDestinationList: [],
            cacheTableIsUpdated: false,
            searchInCacheRange: false,
          },
          featureToggle: {
            [LclToggleKeys.SAILING_SCHEDULE_FROM_MONDAY]: fromMondayEnabled,
          },
        };
        const cacheRes = await ApiService.post<ScheduleCacheApiResponse>(
          COMMON_ENDPOINTS.SAILING_SCHEDULE.GET_ORIGIN_LIST_FROM_CACHE,
          cacheReq
        );
        if (
          cacheRes.data.success === 1 &&
          cacheRes.data.result?.resultOriginList?.length
        ) {
          return mapLocationsToSuggestions(
            cacheRes.data.result.resultOriginList,
            removeDuplicateEnabled
          );
        }
      } catch {
        // cache unavailable — fall through to webservice
      }

      if (!wwaEnabled) return [];

      const username = getSetting(settings, 'WWA_WEBSERVICE_USERNAME');
      const version = getSetting(
        settings,
        'WEBSERVICE_SCHEDULE_ORIGIN_VERSION_WWA'
      );
      const wsReq: ScheduleWebServiceApiRequest = {
        url: getSetting(settings, 'WWA_BASE_TOKEN_URL'),
        wwwaUrl: buildWwaUrl(settings, 'WWA_SCHEDULE_ORIGIN_REQUEST_URL_WWA'),
        schedulebean: {
          username,
          password: getSetting(settings, 'WWA_WEBSERVICE_PASSWORD'),
        },
        sailingScheduleRequestBean: null,
        originRequestBean: buildOriginRequestBean(
          version,
          username,
          dateFrom,
          dateTo
        ),
        destinationRequestBean: null,
        featureToggle: { [LclToggleKeys.SAILING_SCHEDULE_SEARCH]: wwaEnabled },
      };

      try {
        const wsRes = await ApiService.post<ScheduleWebServiceApiResponse>(
          COMMON_ENDPOINTS.SAILING_SCHEDULE.GET_DATA_FROM_WEBSERVICE,
          wsReq
        );
        if (!wsRes.data.result) return [];
        return mapLocationsToSuggestions(
          parseWebServiceOriginResult(wsRes.data.result),
          removeDuplicateEnabled
        );
      } catch {
        return [];
      }
    },
    [loginBean, wwaEnabled, fromMondayEnabled, removeDuplicateEnabled]
  );

  const fetchDestinations = useCallback(
    async (
      originCode: string,
      dateFrom: string,
      dateTo: string
    ): Promise<ScheduleSuggestionItem[]> => {
      const settings = loginBean?.officeSettingMap ?? {};

      try {
        const cacheReq: ScheduleCacheApiRequest = {
          scheduleLookUpSearchBean: {
            fromDate: dateFrom,
            toDate: dateTo,
            origin: originCode,
            resultOriginList: [],
            resultDestinationList: [],
            cacheTableIsUpdated: false,
            searchInCacheRange: false,
          },
          featureToggle: {
            [LclToggleKeys.SAILING_SCHEDULE_FROM_MONDAY]: fromMondayEnabled,
          },
        };
        const cacheRes = await ApiService.post<ScheduleCacheApiResponse>(
          COMMON_ENDPOINTS.SAILING_SCHEDULE.GET_DESTINATION_LIST_FROM_CACHE,
          cacheReq
        );
        if (
          cacheRes.data.success === 1 &&
          cacheRes.data.result?.resultDestinationList?.length
        ) {
          return mapLocationsToSuggestions(
            cacheRes.data.result.resultDestinationList,
            removeDuplicateEnabled
          );
        }
      } catch {
        // cache unavailable — fall through to webservice
      }

      if (!wwaEnabled) return [];

      const username = getSetting(settings, 'WWA_WEBSERVICE_USERNAME');
      const version = getSetting(
        settings,
        'WEBSERVICE_SCHEDULE_ORIGIN_VERSION_WWA'
      );
      const wsReq: ScheduleWebServiceApiRequest = {
        url: getSetting(settings, 'WWA_BASE_TOKEN_URL'),
        wwwaUrl: buildWwaUrl(
          settings,
          'WWA_SCHEDULE_DESTINATION_REQUEST_URL_WWA'
        ),
        schedulebean: {
          username,
          password: getSetting(settings, 'WWA_WEBSERVICE_PASSWORD'),
        },
        sailingScheduleRequestBean: null,
        originRequestBean: null,
        destinationRequestBean: buildDestinationRequestBean(
          version,
          username,
          originCode,
          dateFrom,
          dateTo
        ),
        featureToggle: { [LclToggleKeys.SAILING_SCHEDULE_SEARCH]: wwaEnabled },
      };

      try {
        const wsRes = await ApiService.post<ScheduleWebServiceApiResponse>(
          COMMON_ENDPOINTS.SAILING_SCHEDULE.GET_DATA_FROM_WEBSERVICE,
          wsReq
        );
        if (!wsRes.data.result) return [];
        return mapLocationsToSuggestions(
          parseWebServiceOriginResult(wsRes.data.result),
          removeDuplicateEnabled
        );
      } catch {
        return [];
      }
    },
    [loginBean, wwaEnabled, fromMondayEnabled, removeDuplicateEnabled]
  );

  const fetchSchedules = useCallback(
    async (
      originCode: string,
      destinationCode: string,
      dateFrom: string,
      dateTo: string
    ): Promise<ScheduleGroup[]> => {
      if (!wwaEnabled) return [];

      const settings = loginBean?.officeSettingMap ?? {};
      const username = getSetting(settings, 'WWA_WEBSERVICE_USERNAME');
      const limit = getSetting(settings, 'WWA_SCHEDULE_PAGE_LIMIT') || '10';

      const wsReq: ScheduleWebServiceApiRequest = {
        url: getSetting(settings, 'WWA_BASE_TOKEN_URL'),
        wwwaUrl: buildWwaUrl(settings, 'WWA_SCHEDULE_REQUEST_URL_WWA'),
        schedulebean: {
          username,
          password: getSetting(settings, 'WWA_WEBSERVICE_PASSWORD'),
        },
        sailingScheduleRequestBean: buildRequestBean(
          SAILING_TYPE,
          getSetting(settings, 'WEBSERVICE_SCHEDULE_VERSION_WWA'),
          username,
          {
            limit,
            offset: OFFSET,
            cfsOrigin: originCode,
            cfsDestination: destinationCode,
            cutOffDateFrom: dateFrom,
            cutOffDateTo: dateTo,
          }
        ),
        originRequestBean: null,
        destinationRequestBean: null,
        featureToggle: { [LclToggleKeys.SAILING_SCHEDULE_SEARCH]: wwaEnabled },
      };

      try {
        const wsRes = await ApiService.post<ScheduleWebServiceApiResponse>(
          COMMON_ENDPOINTS.SAILING_SCHEDULE.GET_DATA_FROM_WEBSERVICE,
          wsReq
        );
        if (!wsRes.data.result) return [];
        const parsed: ParsedScheduleResponse = JSON.parse(wsRes.data.result);
        const details =
          parsed.ScheduleResponse?.ScheduleResponseDetails?.scheduleDetail ??
          [];
        if (!details.length) return [];
        return [
          {
            label: '',
            originCode,
            originLabel: originCode,
            destinationCode,
            destinationLabel: destinationCode,
            rows: details.map(mapDetailToRow),
          },
        ];
      } catch {
        return [];
      }
    },
    [loginBean, wwaEnabled]
  );

  const fetchWarehouseMappings = useCallback(
    async (trkwarehouseMapping: TrkWarehouseMapping): Promise<TRKWarehouseBean> => {
      try {
        const requestWarehouseBean: TrkWarehouseMapping = {
            warehouseCode: trkwarehouseMapping.warehouseCode,
            direction: '',
            fromRegion: '',
            fromCountryCode: '',
            fromUnLocation: '',
            fromPOR: '',
            fromPOL: '',
            fromPickupState: '',
            fromPickupZip: '',
            toRegion: '',
            toCountryCode: '',
            toUnLocation: '',
            toDestCFS: '',
            toPOD: '',
            toDoorDeliveryState: '',
            toDoorDeliveryZip: '',
            hazardousCode: '',
            carrierCode: '',
            warehouseUnLocation: '',
            fetchFromShipcoLocation: false
        };
        const response = await ApiService.post<WarehouseMappingResponse>(
          COMMON_ENDPOINTS.WAREHOUSE_MAPPING.GET_WAREHOUSE_MAPPING,
            requestWarehouseBean
        );
        if (!response.data.success) return undefined;

        return response.data.result;
      } catch {
        return undefined;
      }
    },
    []
  );

  return { fetchOrigins, fetchDestinations, fetchSchedules, fetchWarehouseMappings };
}
