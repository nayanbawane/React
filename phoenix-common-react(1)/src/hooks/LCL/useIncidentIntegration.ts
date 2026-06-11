import { useState, useCallback } from 'react';
import { ApiService } from '../../core/api/client';
import { COMMON_ENDPOINTS } from '../../core/api/config/common.endpoints';
import type { ApiResponse, RequestData, Result } from '../../types/common/incident.types';

export interface UseIncidentIntegrationReturn {
  data: Result | null;
  loading: boolean;
  error: string | null;
  fetchCategoryReason: (payload: RequestData) => Promise<void>;
}

export const useIncidentIntegration = (): UseIncidentIntegrationReturn => {
  const [data, setData] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategoryReason = useCallback(async (payload: RequestData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.post<ApiResponse>(
        COMMON_ENDPOINTS.INCIDENT.GET_CATEGORY_REASON,
        payload,
      );

      if (response.data.success !== 1) {
        throw new Error(response.data.message || 'Failed to fetch category & reason');
      }

      setData(response.data.result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch category & reason';
      console.error('Error fetching category & reason:', err);
      setError(message);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchCategoryReason };
};
