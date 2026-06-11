import { useCallback } from 'react';

import { ApiService } from '../../core/api/client';
import { COMMON_ENDPOINTS } from '../../core/api/config/common.endpoints';
import { MinifiedLoginClientBean } from '@/core/featureToggles/loginClientBean.types';

export interface LocationDetail {
  name: string;
  region: string;
}

export function useFetchLocationByCode(loginBean: MinifiedLoginClientBean | null | undefined) {
  const fetchLocationByCode = useCallback(
    async (code: string): Promise<LocationDetail> => {
      if (!code) return { name: '', region: '' };
      try {
        const response = await ApiService.post(
          COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
          {
            query: code,
            reference: 'locationCountryCode',
            limit: 20,
            params: { officeSchemaName: loginBean?.schema },
          }
        );
        const result = response?.data?.result as Record<string, unknown> | undefined;
        if (!result) return { name: '', region: '' };
        const normalizedCode = code.trim().toUpperCase();
        const matchKey = Object.keys(result).find((key) => {
          const [itemCode = ''] = key.split('~');
          return itemCode.trim().toUpperCase() === normalizedCode;
        });
        if (!matchKey) return { name: '', region: '' };
        const [, name = '', region = ''] = matchKey.split('~');
        return { name: name.trim(), region: region.trim() };
      } catch {
        return { name: '', region: '' };
      }
    },
    []
  );

  return fetchLocationByCode;
}
