import { useState, useCallback, useRef } from 'react';
import { apiClient } from '@/core/api/client';
import { OCEAN_ENDPOINTS } from '@/core/api/config/ocean.endpoints';
import { useAppSelector } from '@/app/store/hooks';
import type {
  CustomerRateSettingResult,
  CustomerPattern,
  CustomerSettingsApiResponse,
} from './customerSettingsTypes';

export const useCustomerSettingsApi = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customerRateSetting, setCustomerRateSetting] =
    useState<CustomerRateSettingResult | null>(null);
  const [customerPatterns, setCustomerPatterns] = useState<CustomerPattern[]>(
    []
  );

  const loginClientBean = useAppSelector(
    (state: any) => state.loginClientBean?.data
  );

  const schemaRef = useRef<string>('');
  schemaRef.current = loginClientBean?.schema;

  const fetchCustomerSettings = useCallback(async (customerCode: string) => {
    const officeSchemaName = schemaRef.current;
    if (!customerCode) return;

    setIsLoading(true);
    setError(null);

    try {
      const [rateSettingRes, patternsRes] = await Promise.all([
        apiClient.post<CustomerSettingsApiResponse<CustomerRateSettingResult>>(
          OCEAN_ENDPOINTS.CUSTOMER_RATE_SETTING.GET_CUSTOMER_RATE_SETTING,
          { customerCode, officeSchemaName }
        ),
        apiClient.post<CustomerSettingsApiResponse<CustomerPattern[]>>(
          OCEAN_ENDPOINTS.CUSTOMER_RATE_SETTING.GET_CUSTOMER_PATTERNS,
          { customerAlias: customerCode, officeSchemaName }
        ),
      ]);

      if (rateSettingRes.data.success === 1) {
        setCustomerRateSetting(rateSettingRes.data.result);
      }
      if (patternsRes.data.success === 1) {
        setCustomerPatterns(patternsRes.data.result);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Failed to fetch customer settings';
      console.error('[CustomerSettings] error:', err);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    customerRateSetting,
    customerPatterns,
    isLoading,
    error,
    fetchCustomerSettings,
  };
};
