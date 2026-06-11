import React, { useState, useCallback } from 'react';

import { LocationSearchWidget } from './LocationSearchWidget';
import LocationResultTable from './LocationResultTable';
import NoFilterPopup from './NoFilterPopup';
import type { LocationSearchFormValues, LocationSearchView } from './types';
import { LocationResult } from '@/types';
import { ApiService } from '../../../../core/api/client';
import { COMMON_ENDPOINTS } from '../../../../core/api/config/common.endpoints';
import { useAppSelector } from '../../../../app/store/hooks';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';

const INITIAL_FORM: LocationSearchFormValues = {
  code: '',
  name: '',
  country: '',
  unCode: '',
  locationType: '-1',
  status: 'ACTIVE',
  exportRegion: '',
  importRegion: '',
  lclAgent: '',
  fclAgent: '',
  deconsolidationPoint: '',
};

interface Props {
  onSelect?: (loc: LocationResult) => void;
}

interface LocationApiItem {
  code: string;
  name: string;
  exportRegion: string;
  importRegion: string;
  unCode: string;
  lclAgent: string;
  fclAgent: string;
  deconsolidationPoint: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string;
  country: string;
  warehouse: string;
  codeType: string;
  locationType: string;
  pier: string;
  externalInfo: string;
  internalInfo: string;
  fclExternalInfo: string;
  fclInternalInfo: string;
  inputUser: string;
  inputDate: string;
  updateUser: string;
  updateDate: string;
}

interface LocationApiResponse {
  success: number;
  result: LocationApiItem[];
  message: string;
}

function toLocationResult(item: LocationApiItem, idx: number): LocationResult {
  return {
    id: `${item.code ?? ''}_${idx}`,
    code: item.code ?? '',
    name: item.name ?? '',
    exportRegion: item.exportRegion ?? '',
    importRegion: item.importRegion ?? '',
    unCode: item.unCode ?? '',
    lclAgent: item.lclAgent ?? '',
    fclAgent: item.fclAgent ?? '',
    deconsolidationPoint: item.deconsolidationPoint ?? '',
    city: item.city ?? '',
    state: item.state ?? '',
    postalCode: item.postalCode ?? '',
    countryCode: item.countryCode ?? '',
    country: item.country ?? '',
    warehouse: item.warehouse ?? '',
    codeType: item.codeType ?? '',
    locationType: item.locationType ?? '',
    pier: item.pier ?? '',
    lclExternalInfo: item.externalInfo ?? '',
    lclInternalInfo: item.internalInfo ?? '',
    fclExternalInfo: item.fclExternalInfo ?? '',
    fclInternalInfo: item.fclInternalInfo ?? '',
    inputUser: item.inputUser ?? '',
    inputDate: item.inputDate ?? '',
    updateUser: item.updateUser ?? '',
    updateDate: item.updateDate ?? '',
  };
}

export const LocationSearch: React.FC<Props> = ({ onSelect }) => {
  const [view, setView] = useState<LocationSearchView>('search');
  const [formValues, setFormValues] = useState<LocationSearchFormValues>(INITIAL_FORM);
  const [results, setResults] = useState<LocationResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [noFilterOpen, setNoFilterOpen] = useState(false);

  const loginBean = useAppSelector(selectLoginClientBean);

  const handleChange = useCallback(
    (field: keyof LocationSearchFormValues, value: string) => {
      setFormValues((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const hasAtLeastOneFilter = (values: LocationSearchFormValues): boolean => {
    const textFilters = [
      values.code,
      values.name,
      values.unCode,
      values.country,
      values.exportRegion,
      values.importRegion,
      values.lclAgent,
      values.fclAgent,
      values.deconsolidationPoint,
    ];
    return textFilters.some((v) => (v ?? '').trim().length > 0);
  };

  const handleSearch = useCallback(async () => {
    if (!hasAtLeastOneFilter(formValues)) {
      setNoFilterOpen(true);
      return;
    }

    setLoading(true);
    try {
      const res = await ApiService.post<LocationApiResponse>(
        COMMON_ENDPOINTS.LOCATION.COMMON_LOCATION_INFORMATION,
        {
          requestData: {
            officeCode: loginBean?.ldapOfficeCode ?? '',
            locationSearchBean: {
              code: formValues.code,
              name: formValues.name,
              unCode: formValues.unCode,
              country: formValues.country,
              exportRegion: formValues.exportRegion,
              importRegion: formValues.importRegion,
              lclAgent: formValues.lclAgent,
              fclAgent: formValues.fclAgent,
              deconsolidationPoint: formValues.deconsolidationPoint,
              status: formValues.status,
              locationTypeList: formValues.locationType !== '-1' ? [formValues.locationType] : [],
            },
          },
        }
      );
      const items = res.data?.result ?? [];
      setResults(items.map(toLocationResult));
      setView('results');
    } finally {
      setLoading(false);
    }
  }, [formValues, loginBean]);

  const handleReset = useCallback(() => {
    setFormValues({ ...INITIAL_FORM, locationType: formValues.locationType });
    setResults([]);
    setView('search');
  }, [formValues.locationType]);

  const handleSelect = useCallback(
    (loc: LocationResult) => {
      onSelect?.(loc);
    },
    [onSelect]
  );

  return (
    <>
      {view === 'search' && (
        <LocationSearchWidget
          values={formValues}
          onChange={handleChange}
          onSearch={handleSearch}
          onReset={handleReset}
          loading={loading}
        />
      )}

      {view === 'results' && (
        <LocationResultTable
          results={results}
          onSelect={handleSelect}
          onBackToSearch={() => setView('search')}
        />
      )}

      <NoFilterPopup open={noFilterOpen} onClose={() => setNoFilterOpen(false)} />
    </>
  );
};

export default LocationSearch;
