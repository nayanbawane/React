import { useState, useCallback, useRef } from 'react';
import type { LoginClientBeanRaw } from 'phoenix-common-react';
import { apiClient } from '@/core/api/client';
import type { AccurateRateConfig } from './accurateRateConfig';
import type { AccurateRateRequestBean, AccurateRateResponseBean } from './accurateRateTypes';

export const useAccurateRateApi = <TResult = AccurateRateResponseBean>(
  config: AccurateRateConfig<TResult>
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TResult | null>(null);

  const configRef = useRef(config);
  configRef.current = config;

  const execute = useCallback(
    async (
      formData: Record<string, unknown>,
      loginClientBean?: LoginClientBeanRaw | null,
      payloadOverrides?: Partial<AccurateRateRequestBean>,
      spotRateFlag?: number,
    ): Promise<TResult | null> => {
      setIsLoading(true);
      setError(null);

      try {
        const initialPayload: AccurateRateRequestBean = {
          ...configRef.current.transformRequest(formData, loginClientBean),
          ...(payloadOverrides ?? {}),
        };

        const setUnCodesResponse = await apiClient.post<AccurateRateRequestBean>(
          configRef.current.endpoints.setUnCodes,
          initialPayload,
          { headers: { Authorization: configRef.current.authorization } },
        );

        const populatePayload: AccurateRateRequestBean =
          spotRateFlag !== undefined
            ? { ...setUnCodesResponse.data, spotRateFlag }
            : setUnCodesResponse.data;

        const response = await apiClient.post<AccurateRateResponseBean>(
          configRef.current.endpoints.populateAccurateRates,
          populatePayload,
          { headers: { Authorization: configRef.current.authorization } },
        );

        const transformed = configRef.current.transformResponse(response.data) as TResult;
        setResult(transformed);
        return transformed;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch accurate rates');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return { isLoading, error, result, execute };
};
