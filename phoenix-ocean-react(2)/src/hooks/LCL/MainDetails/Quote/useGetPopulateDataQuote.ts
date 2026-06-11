import { ApiService } from '@/core/api/client';
import { BookingQuoteResponse } from 'phoenix-common-react';
import { useState, useCallback } from 'react';

interface LoginBean {
  officeTimezone: string;
  username: string;
  ldapUsername: string;
  userFullname: string;
  password: string;
  dataSourceName: string;
  userSchemaName: string;
  email: string;
  logFilePathName: string;
  debugModeFlag: number;
  timeZone: string;
  ipAddress: string;
  officeCode: string;
  userCompany: string;
  formInstance: string;
  localCurrency: string;
  userRegionId: number;
  countryCode: string;
  countryName: string;
  userCompanyName: string;
  userSchemaID: number;
  userOfficeID: number;
  userRoleID: number;
  userRole: string;
  userAlternateOffice: string;
  userId:number;
}

interface PopulateDataRequest {
  requestData: {
    userId: number;
    referenceNumber: string;
  };
}

interface UseGetPopulateDataQuoteProps<TResponse> {
  endpoint: string;
  loginBean: LoginBean;
  transformResponse?: (data: any) => TResponse;
}

interface UseGetPopulateDataQuoteReturn<TResponse> {
  data: TResponse | null;
  loading: boolean;
  error: string | null;
  fetchPopulateData: (referenceNumber: string) => Promise<void>;
  reset: () => void;
}

export const useGetPopulateDataQuote = <TResponse = BookingQuoteResponse>({
  endpoint,
  loginBean,
  transformResponse = (data) => data,
}: UseGetPopulateDataQuoteProps<TResponse>): UseGetPopulateDataQuoteReturn<TResponse> => {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopulateData = useCallback(
    async (referenceNumber: string) => {
      if (!referenceNumber) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const payload: PopulateDataRequest = {
          requestData: {
            userId: loginBean.userId,
            referenceNumber,
          },
        };

        const response = await ApiService.post<TResponse>(endpoint, payload);
        const transformedData = transformResponse(response.data);
        setData(transformedData);
      } catch (err: any) {
        console.error('Error fetching populate data:', err);
        setError(err.message || 'Failed to fetch populate data');
        setData(null);
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
