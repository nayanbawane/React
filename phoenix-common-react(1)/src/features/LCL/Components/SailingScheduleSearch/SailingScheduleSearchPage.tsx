import { useState, useCallback, useEffect } from 'react';

import SailingScheduleSearch from './SailingScheduleSearch';
import SailingScheduleResults from './SailingScheduleResults';
import { useSailingScheduleSearch } from '../../../../hooks/LCL/useSailingScheduleSearch';
import {CommonToggleKeys, useFeatureToggle} from "phoenix-common-react";
import {useAppSelector} from "@/app/store/hooks.ts";
import {ApiService} from "@/core/api/client.ts";
import { COMMON_ENDPOINTS } from '../../../../core/api/config/common.endpoints';
import {TRKWarehouseBean, TrkWarehouseMapping} from '@/types/LCL/warehouseMapping/warehouseMapping.types';
import type {
  SailingScheduleSearchFormData,
  SailingScheduleSearchPageProps,
  ScheduleGroup,
  ScheduleRow,
  ScheduleSuggestionItem,
} from '@/types/LCL/misc/SailingScheduleSearch.types';

const TODAY = new Date();
const SIXTY_DAYS = new Date(TODAY);
SIXTY_DAYS.setDate(SIXTY_DAYS.getDate() + 60);

const INITIAL_FORM: SailingScheduleSearchFormData = {
  origin: '',
  destination: '',
  dateFrom: TODAY,
  dateTo: SIXTY_DAYS,
};

type View = 'search' | 'results';

// GWT ScheduleRequest.java uses DateTimeFormat("yyyy-MM-dd") for all API dates
function formatDateForApi(date: Date | null): string {
  if (!date) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocationLabel(text: string): string {
  if (!text) return '';
  const idx = text.indexOf('-');
  if (idx === -1) return text;
  return `${text.substring(0, idx)}: ${text.substring(idx + 1)}`;
}

function buildGroupLabel(originText: string, destText: string): string {
  return `${formatLocationLabel(originText)} ${formatLocationLabel(destText)}`.trim();
}

function SailingScheduleSearchPage({
  onBookThis,
  onFetchOrigins,
  onFetchDestinations,
  onFetchSchedules,
  onFetchWarehouseMappings,
  showAccurateRatesToggle,
  routingFormData,
}: SailingScheduleSearchPageProps) {
  const loginClientBean = useAppSelector((state: any) => state.loginClientBean?.data);
  const bookingMainDetails = useAppSelector((state) => state.booking.mainDetails);
  const { isVisible } = useFeatureToggle();
  const scheduleApi = useSailingScheduleSearch();

  const resolvedFetchOrigins = onFetchOrigins ?? scheduleApi.fetchOrigins;
  const resolvedFetchDestinations =
    onFetchDestinations ?? scheduleApi.fetchDestinations;
  const resolvedFetchSchedules = onFetchSchedules ?? scheduleApi.fetchSchedules;
  const resolvedWarehouseMappings = onFetchWarehouseMappings ?? scheduleApi.fetchWarehouseMappings;

  const [view, setView] = useState<View>('search');
  const [formData, setFormData] =
    useState<SailingScheduleSearchFormData>(INITIAL_FORM);
  const [originSuggestions, setOriginSuggestions] = useState<
    ScheduleSuggestionItem[]
  >([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState<
    ScheduleSuggestionItem[]
  >([]);
  const [groups, setGroups] = useState<ScheduleGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [originCode, setOriginCode] = useState('');
  const [destinationCode, setDestinationCode] = useState('');
  const [isDestinationDisabled, setIsDestinationDisabled] = useState(false);
  // GWT default: toggleYes is the first item = "YES" (reset rates by default)
  const [accurateRatesReset, setAccurateRatesReset] = useState(true);

  const loadOrigins = useCallback(
    async (dateFrom: Date | null, dateTo: Date | null) => {
      const items = await resolvedFetchOrigins(
        formatDateForApi(dateFrom),
        formatDateForApi(dateTo)
      );
      setOriginSuggestions(items);
      setIsDestinationDisabled(true);
      setDestinationSuggestions([]);
      if(isVisible(CommonToggleKeys.BKG_QUT_SCHD_SET_ORIGIN_DEST) &&
          bookingMainDetails?.bookingQuoteType === 'L' &&
          (routingFormData.terms === 'DRDR' || routingFormData.terms === 'DRCF')) {
        const warehouseMapping = {
          warehouseCode: routingFormData.warehouse
        } as TrkWarehouseMapping
        setPickupUnLocation(warehouseMapping);
      }
    },
    [resolvedFetchOrigins]
  );

  useEffect(() => {
    void loadOrigins(INITIAL_FORM.dateFrom, INITIAL_FORM.dateTo);
  }, [loadOrigins]);

  const handleFormChange = (
    field: keyof SailingScheduleSearchFormData,
    value: unknown
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'dateFrom' || field === 'dateTo') {
        loadOrigins(
          field === 'dateFrom' ? (value as Date | null) : prev.dateFrom,
          field === 'dateTo' ? (value as Date | null) : prev.dateTo
        );
      }
      if (field === 'origin') {
        setIsDestinationDisabled(!(value as string));
        if (!(value as string)) setDestinationCode('');
      }
      return updated;
    });
  };

  const handleOriginSelect = useCallback(
    async (item: ScheduleSuggestionItem) => {
      const code = item.value.split('-')[0].trim();
      setOriginCode(code);
      setFormData((prev) => ({ ...prev, origin: item.label, destination: '' }));
      setDestinationCode('');
      setIsDestinationDisabled(false);
      const items = await resolvedFetchDestinations(
        code,
        formatDateForApi(formData.dateFrom),
        formatDateForApi(formData.dateTo)
      );
      if(isVisible(CommonToggleKeys.BKG_QUT_SCHD_SET_ORIGIN_DEST) &&
          bookingMainDetails?.bookingQuoteType === 'L' &&
          (routingFormData.terms === 'DRDR' || routingFormData.terms === 'CFDR')) {
        loadDestinations(code);
      }else {
        setDestinationSuggestions(items);
      }
    },
    [formData.dateFrom, formData.dateTo, resolvedFetchDestinations]
  );

  const handleDestinationSelect = useCallback(
    (item: ScheduleSuggestionItem) => {
      const code = item.value.split('-')[0].trim();
      setDestinationCode(code);
      setFormData((prev) => ({ ...prev, destination: item.label }));
    },
    []
  );

  const handleSearch = useCallback(async () => {
    const originText = formData.origin || 'Origin';
    const destText = formData.destination || 'Destination';
    const groupLabel = buildGroupLabel(originText, destText);

    const loadingGroups: ScheduleGroup[] = [
      {
        label: groupLabel,
        originCode: originCode || originText.split('-')[0],
        originLabel: originText,
        destinationCode: destinationCode || destText.split('-')[0],
        destinationLabel: destText,
        rows: [],
      },
    ];
    setGroups(loadingGroups);
    setIsLoading(true);
    setView('results');

    try {
      const result = await resolvedFetchSchedules(
        originCode || originText.split('-')[0].trim(),
        destinationCode || destText.split('-')[0].trim(),
        formatDateForApi(formData.dateFrom),
        formatDateForApi(formData.dateTo)
      );

      if (result.length > 0) {
        const labeled: ScheduleGroup[] = result.map((g) => ({
          ...g,
          label: groupLabel,
          originLabel: originText,
          destinationLabel: destText,
        }));
        setGroups(labeled);
      } else {
        setGroups([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [originCode, destinationCode, formData, resolvedFetchSchedules]);

  const handleClear = () => {
    setFormData((prev) => ({ ...prev, origin: '', destination: '' }));
    setOriginCode('');
    setDestinationCode('');
    setOriginSuggestions([]);
    setDestinationSuggestions([]);
    setIsDestinationDisabled(false);
  };

  const handleBookThis = (row: ScheduleRow, group: ScheduleGroup, isAccurateRatesReset: string) => {
    onBookThis?.(row, group, isAccurateRatesReset);
  };

  const handleBackToSearch = () => {
    setView('search');
    setGroups([]);
    setIsLoading(false);
  };

  const loadDestinations = useCallback(
    async (orginCode: string) => {
      const items = await resolvedFetchDestinations(
        orginCode,
        formatDateForApi(formData.dateFrom),
        formatDateForApi(formData.dateTo)
      );
      if(items && items.length > 0) {
        setDestinationSuggestions(items);
        if(isVisible(CommonToggleKeys.BKG_QUT_SCHD_SET_ORIGIN_DEST) &&
            bookingMainDetails?.bookingQuoteType === 'L' &&
            (routingFormData.terms === 'DRDR' || routingFormData.terms === 'CFDR')) {
          setDoorUnLocationCode(items);
        }
      }
    },
    [resolvedFetchDestinations]
  );

  const setPickupUnLocation = useCallback(
      async (trkWarehouseMapping:TrkWarehouseMapping) => {
        const warehouseMapping: TRKWarehouseBean = await resolvedWarehouseMappings(
            trkWarehouseMapping,
        );
        if(warehouseMapping) {
          const unLocation = warehouseMapping.unLocationCode;
          const locationCodeInput = unLocation + " - " + warehouseMapping.unLocationName;
          setFormData((prev) => ({...prev, origin: locationCodeInput}));
          if(formData?.destination) {
            formData.destination = "";
          }
          setIsDestinationDisabled(false);
          loadDestinations(unLocation)
        }
      },
      [resolvedWarehouseMappings]
  )

  const setDoorUnLocationCode = async (items: ScheduleSuggestionItem[]) => {
    let warehouse = routingFormData?.destinationWarehouse || '';
    let unLocationCode = '';

    if (warehouse) {
      if (warehouse.includes('-')) {
        unLocationCode = warehouse.split('-')[0].trim();
      } else {
        unLocationCode = warehouse.trim();
      }
    }
    let scheduleSuggestionItem = items.find(value => value.label.split('-')[0].trim() === unLocationCode);
    if(scheduleSuggestionItem && scheduleSuggestionItem.value) {
      setFormData((prev) => ({ ...prev, destination: scheduleSuggestionItem.value }));
    }
  };

  if (view === 'results') {
    return (
      <SailingScheduleResults
        groups={groups}
        isLoading={isLoading}
        isAccurateRatesReset={accurateRatesReset ? 'YES' : 'NO'}
        onBookThis={handleBookThis}
        onBackToSearch={handleBackToSearch}
      />
    );
  }

  return (
    <SailingScheduleSearch
      formData={formData}
      originSuggestions={originSuggestions}
      destinationSuggestions={destinationSuggestions}
      isDestinationDisabled={isDestinationDisabled}
      onFormChange={handleFormChange}
      onOriginSelect={handleOriginSelect}
      onDestinationSelect={handleDestinationSelect}
      onSearch={handleSearch}
      onClear={handleClear}
      showAccurateRatesToggle={showAccurateRatesToggle}
      accurateRatesReset={accurateRatesReset}
      onAccurateRatesResetChange={setAccurateRatesReset}
    />
  );
}

export default SailingScheduleSearchPage;
