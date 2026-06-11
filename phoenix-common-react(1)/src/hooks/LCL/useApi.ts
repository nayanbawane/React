import { useCallback, useRef, useState } from 'react';
import { ApiService } from '../../core/api/client';

export interface UseApiOptions<TRequest, TResponse> {
  endpoint: string;
  transformRequest?: (params: TRequest) => unknown;
  transformResponse?: (data: unknown) => TResponse;
  onSuccess?: (data: TResponse) => void;
  onError?: (error: Error) => void;
}

export interface UseApiResult<TRequest, TResponse> {
  data: TResponse | null;
  loading: boolean;
  error: string | null;
  execute: (params: TRequest) => Promise<TResponse | null>;
  reset: () => void;
}

/**
 * Generic reusable POST hook.
 *
 * Usage:
 *   const { data, loading, error, execute } = useApi<MyRequest, MyResponse>({ endpoint: '/path' });
 *   await execute(myPayload);
 */
export const useApi = <TRequest = unknown, TResponse = unknown>({
  endpoint,
  transformRequest,
  transformResponse,
  onSuccess,
  onError,
}: UseApiOptions<TRequest, TResponse>): UseApiResult<TRequest, TResponse> => {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (params: TRequest): Promise<TResponse | null> => {
      // Cancel any in-flight request before starting a new one
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const payload = transformRequest ? transformRequest(params) : params;

        const response = await ApiService.post<TResponse>(endpoint, payload, {
          signal: abortControllerRef.current.signal,
        });

        const result = transformResponse
          ? transformResponse(response.data)
          : response.data;

        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err: unknown) {
        if ((err as { name?: string }).name === 'CanceledError') return null;

        const message =
          err instanceof Error ? err.message : 'An unexpected error occurred';
        setError(message);
        onError?.(err instanceof Error ? err : new Error(message));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, transformRequest, transformResponse, onSuccess, onError]
  );

  const reset = useCallback(() => {
    abortControllerRef.current?.abort();
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { data, loading, error, execute, reset };
};
