import { useState, useEffect, useCallback, useRef } from 'react';
import { ApiService } from '../../core/api/client';

export interface UseGetListBoxProps<TRequest, TResponse> {
  endpoint: string;
  debounceMs?: number;
  transformRequest?: () => TRequest;
  transformResponse?: (data: any) => TResponse[];
  autoFetch?: boolean;
}

export const useGetListBox = <TRequest = any, TResponse = unknown>({
  endpoint,
  debounceMs = 0,
  transformRequest,
  transformResponse = (data) => data as TResponse[],
  autoFetch = true,
}: UseGetListBoxProps<TRequest, TResponse>) => {
  const [data, setData] = useState<TResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transformRequestRef = useRef(transformRequest);
  const transformResponseRef = useRef(transformResponse);

  // Update refs when functions change (without triggering effect)
  useEffect(() => {
    transformRequestRef.current = transformRequest;
    transformResponseRef.current = transformResponse;
  }, [transformRequest, transformResponse]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = transformRequestRef.current
        ? transformRequestRef.current()
        : ({} as TRequest);

      const response = await ApiService.post(endpoint, payload);
      const transformedData = transformResponseRef.current(response.data);
      setData(transformedData);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to fetch list box data';
      console.error('Error fetching list box data:', err);
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    if (!autoFetch) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (debounceMs > 0) {
      timeoutRef.current = setTimeout(() => {
        fetchData();
      }, debounceMs);
    } else {
      fetchData();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [autoFetch, debounceMs, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  };
};
