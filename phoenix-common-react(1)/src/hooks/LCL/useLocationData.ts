import { useCallback, useRef, useState } from 'react';

import { ApiService } from '../../core/api/client';
import { COMMON_ENDPOINTS } from '../../core/api/config/common.endpoints';
import type { LoginClientBeanRaw } from '../../core/featureToggles/loginClientBean.types';

export interface LocationDetailBean {
  locationCode: string;
  locationName: string;
  locationCountryName: string;
  locationCountryCode: string;
  locationRegionCode: string;
  unlocationCode: string;
  lclrecievingofficecode: string | null;
  agentCode: string | null;
  fclAgent: string | null;
  impRegion: string | null;
  salesRegion: string | null;
}

export interface LocationDataParams {
  locationDetail: string[];
  loginBean: LoginClientBeanRaw;
}

interface LocationDataApiResponse {
  success: number;
  result: Record<string, LocationDetailBean>;
  message: string;
}

export function findByUnlocationCode(
  locationData: Record<string, LocationDetailBean>,
  unCode: string
): LocationDetailBean | undefined {
  if (!unCode) return undefined;
  const upper = unCode.toUpperCase();
  const values = Object.values(locationData);
  return (
    values.find((bean) => bean.unlocationCode?.toUpperCase() === upper) ??
    values.find((bean) => bean.locationCode?.toUpperCase() === upper)
  );
}

export const useLocationData = () => {
  const [loading, setLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchLocationData = useCallback(
    async (
      params: LocationDataParams
    ): Promise<Record<string, LocationDetailBean> | null> => {
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();
      setLoading(true);
      try {
        const response = await ApiService.post<LocationDataApiResponse>(
          COMMON_ENDPOINTS.LOCATION.GET_LOCATION_DATA,
          {
            requestData: {
              userId: String(params.loginBean.userId),
              locationDetail: params.locationDetail,
              locationType: 'UN',
            },
          },
          { signal: abortControllerRef.current.signal }
        );
        return response.data?.result ?? null;
      } catch (err: unknown) {
        if ((err as { name?: string }).name === 'CanceledError') return null;
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { fetchLocationData, loading };
};
