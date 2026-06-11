import { useState, useCallback } from 'react';
import { ApiService } from '../../core/api/client';
import { COMMON_ENDPOINTS } from '../../core/api/config/common.endpoints';
import type { IncidentTimeApiResponse, IncidentTimeRequestData, IncidentTimeResult } from '../../types/common/incident.types';

export interface UseIncidentTimeReturn {
  data: IncidentTimeResult | null;
  loading: boolean;
  error: string | null;
  fetchIncidentTime: (payload: IncidentTimeRequestData) => Promise<IncidentTimeResult | null>;
}

export const useIncidentTime = (): UseIncidentTimeReturn => {
  const [data, setData] = useState<IncidentTimeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchIncidentTime = useCallback(async (payload: IncidentTimeRequestData): Promise<IncidentTimeResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.post<IncidentTimeApiResponse>(
        COMMON_ENDPOINTS.INCIDENT.GET_INCIDENT_TIME,
        payload,
      );

      if (response.data.success !== 1) {
        throw new Error(response.data.message || 'Failed to fetch incident time');
      }

      setData(response.data.result);
      return response.data.result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch incident time';
      console.error('Error fetching incident time:', err);
      setError(message);
      setData(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, fetchIncidentTime };
};
