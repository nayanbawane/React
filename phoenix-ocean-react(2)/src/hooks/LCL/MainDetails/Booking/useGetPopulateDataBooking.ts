import { ApiService } from '@/core/api/client';
import { BookingQuoteResponse } from 'phoenix-common-react';
import { useState, useCallback } from 'react';
import { LoginBean } from "../Quote/PopulateMapper/populateLoginBeanMapper";

interface UseGetPopulateDataBookingProps<TResponse> {
  endpoint: string;
  loginBean: LoginBean;
  transformResponse?: (data: any) => TResponse;
}

interface UseGetPopulateDataBookingReturn<TResponse> {
  data: TResponse | null;
  loading: boolean;
  error: string | null;
  fetchPopulateData: (
    referenceNumber: string,
    options?: { updateState?: boolean }
  ) => Promise<TResponse | null>;
  reset: () => void;
}

export const useGetPopulateDataBooking = <TResponse = BookingQuoteResponse>({
  endpoint,
  loginBean,
  transformResponse = (data) => data,
}: UseGetPopulateDataBookingProps<TResponse>): UseGetPopulateDataBookingReturn<TResponse> => {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopulateData = useCallback(
    async (
      referenceNumber: string,
      options?: { updateState?: boolean }
    ) => {
      if (!referenceNumber) {
        return null;
      }

      setLoading(true);
      setError(null);

      try {
        const payload = {
            loginBean: loginBean,
            referenceNumber: referenceNumber,
        };

        const response = await ApiService.post<TResponse>(endpoint, payload);
        const transformedData = transformResponse(response.data);
        if (options?.updateState !== false) {
          setData(transformedData);
        }
        return transformedData;
      } catch (err: any) {
        console.error('Error fetching populate data:', err);
        setError(err.message || 'Failed to fetch populate data');
        if (options?.updateState !== false) {
          setData(null);
        }
        return null;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, loginBean, transformResponse]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    fetchPopulateData,
    reset,
  };
};
