// ── Cache API

import { RoutingFormData } from "../routing/RoutingDetails.types";
import {TRKWarehouseBean, TrkWarehouseMapping} from "../warehouseMapping/warehouseMapping.types";

export interface ScheduleLocationItem {
  locationCode: string;
  locationName: string;
}

export interface ScheduleLookUpSearchBean {
  fromDate: string;
  toDate: string;
  origin: string | null;
  resultOriginList: ScheduleLocationItem[];
  resultDestinationList: ScheduleLocationItem[];
  cacheTableIsUpdated: boolean;
  searchInCacheRange: boolean;
}

export interface ScheduleCacheApiRequest {
  scheduleLookUpSearchBean: ScheduleLookUpSearchBean;
  featureToggle: Record<string, boolean>;
}

export interface ScheduleCacheApiResponse {
  success: number;
  result: ScheduleLookUpSearchBean;
}

// ── WebService API

export interface ScheduleRequestDetailsBean {
  limit?: string;
  offset?: string;
  cfsOrigin?: string;
  cfsDestination?: string;
  cutOffDateFrom?: string;
  cutOffDateTo?: string;
}

export interface ScheduleRequestBean {
  ScheduleRequest: {
    type: string;
    version: string;
    senderID: string;
    receiverID: string;
    requestID: string;
    ScheduleRequestDetails: ScheduleRequestDetailsBean;
  };
}

export interface OriginRequestBean {
  ScheduleSearchGetOriginRequest: {
    Type: string;
    Version: string;
    SenderID: string;
    ScheduleSearchGetOriginRequestDetails: {
      FromDate: string;
      ToDate: string;
    };
  };
}

export interface DestinationRequestBean {
  ScheduleSearchGetDestinationRequest: {
    Type: string;
    Version: string;
    SenderID: string;
    ScheduleSearchGetDestinationRequestDetails: {
      originLocationCode: string;
      FromDate: string;
      ToDate: string;
    };
  };
}

export interface ScheduleWebServiceApiRequest {
  url: string;
  wwwaUrl: string;
  schedulebean: { username: string; password: string };
  sailingScheduleRequestBean: ScheduleRequestBean | null;
  originRequestBean: OriginRequestBean | null;
  destinationRequestBean: DestinationRequestBean | null;
  featureToggle: Record<string, boolean>;
}

export interface ScheduleWebServiceApiResponse {
  success: number;
  result: string;
}

export interface RouteInformationDetail {
  RouteOrigin?: string;
  RouteETA?: string;
  RouteType?: string;
  iTransshipment?: number;
}

export interface TransshipmentPortDetail {
  portCode: string;
  portDate: string;
  seq: number;
}

export interface ParsedScheduleDetail {
  IMONumber?: string | number;
  VesselName?: string;
  Voyage?: string;
  CarrierSCAC?: string;
  HouseSCAC?: string;
  CutOffDateTime?: string;
  ETD?: string;
  ETA?: string;
  Origin?: string;
  Destination?: string;
  RoutingVia?: string;
  routingviaPortname?: string;
  PortofDischargecode?: string;
  PortofDischargedate?: string;
  TransitTimeCutoffCFS?: string | number;
  TransitTimePortToPort?: string | number;
  TransitTimePortCFS?: string | number;
  TransitTimeCFSToCFS?: string | number;
  RouteInformation?: RouteInformationDetail[];
  OriginCityname?: string;
  DestinationCityname?: string;
  RoutingviaCityname?: string;
  PortofDischargeCityname?: string;
  [key: string]: unknown;
}

export interface ParsedScheduleResponseDetails {
  count?: number;
  totalCount?: number;
  scheduleDetail?: ParsedScheduleDetail[];
}

export interface ParsedScheduleResponse {
  ScheduleResponse?: {
    ScheduleResponseDetails?: ParsedScheduleResponseDetails;
  };
  [key: string]: unknown;
}

export interface ParsedLocationListResponse {
  resultOriginList?: ScheduleLocationItem[];
  resultDestinationList?: ScheduleLocationItem[];
  [key: string]: unknown;
}

export interface SailingScheduleSearchFormData {
  origin: string;
  destination: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

export interface ScheduleSuggestionItem {
  label: string;
  value: string;
}

export interface ScheduleRow {
  vesselVoyage: string;
  vesselName: string;
  voyageCode: string;
  imoNumber: string;
  carrierScac: string;
  houseCarrierScac: string;
  cutOffDateTime: string;
  etd: string;
  eta: string;
  portOfDischargeDate: string;
  routingVia: string;
  portOfLoadingCode: string;
  portOfLoadingName: string;
  portOfDischargeCode: string;
  scheduleOriginCode: string;
  scheduleDestinationCode: string;
  transitTimeCutoffPort: number | string;
  transitTimePortPort: number | string;
  transitTimePortCfs: number | string;
  transitTimeCfsCfs: number | string;
  transshipmentPorts: TransshipmentPortDetail[];
  originCityName: string;
  portOfDischargeCityName: string;
  destinationCityName: string;
}

export interface ScheduleGroup {
  label: string;
  originCode: string;
  originLabel: string;
  destinationCode: string;
  destinationLabel: string;
  rows: ScheduleRow[];
}

export interface WarehouseMappingResponse {
  success: number;
  result: TRKWarehouseBean;
}

export interface SailingScheduleSearchProps {
  formData: SailingScheduleSearchFormData;
  originSuggestions: ScheduleSuggestionItem[];
  destinationSuggestions: ScheduleSuggestionItem[];
  isDestinationDisabled: boolean;
  onFormChange: (
    field: keyof SailingScheduleSearchFormData,
    value: unknown
  ) => void;
  onOriginSelect: (item: ScheduleSuggestionItem) => void;
  onDestinationSelect: (item: ScheduleSuggestionItem) => void;
  onSearch: () => void;
  onClear: () => void;
  showAccurateRatesToggle?: boolean;
  accurateRatesReset?: boolean;
  onAccurateRatesResetChange?: (val: boolean) => void;
}

export interface SailingScheduleResultsProps {
  groups: ScheduleGroup[];
  isLoading?: boolean;
  originLabel?: string;
  destinationLabel?: string;
  isAccurateRatesReset?: string;
  onBookThis: (row: ScheduleRow, group: ScheduleGroup, isAccurateRatesReset: string) => void;
  onBackToSearch: () => void;
  onShowNearby?: () => void;
}

export interface SailingScheduleSearchPageProps {
  showAccurateRatesToggle?: boolean;
  onBookThis?: (row: ScheduleRow, group: ScheduleGroup, isAccurateRatesReset: string) => void;
  onFetchOrigins?: (
    dateFrom: string,
    dateTo: string
  ) => Promise<ScheduleSuggestionItem[]>;
  onFetchDestinations?: (
    origin: string,
    dateFrom: string,
    dateTo: string
  ) => Promise<ScheduleSuggestionItem[]>;
  onFetchSchedules?: (
    origin: string,
    destination: string,
    dateFrom: string,
    dateTo: string
  ) => Promise<ScheduleGroup[]>;
  onFetchWarehouseMappings?: (
    trkWarehouseMapping: TrkWarehouseMapping
  ) => Promise<TRKWarehouseBean>;
  routingFormData: RoutingFormData;
}
