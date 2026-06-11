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
  userId: number;
}

interface PopulateDataRequest {
  requestData: {
    loginBean: {
      username: string;
      userOfficeID: string;
      userSchemaID: string;
    };
    mainBookingQuoteBean: {
      bookingQuoteBean: {
        referenceNumber: string;
        type: string;
      };
    };
  };
}

interface UseGetPopulateDataPrebookingProps<TResponse> {
  endpoint: string;
  loginBean: LoginBean;
  transformResponse?: (data: any) => TResponse;
}

interface UseGetPopulateDataPrebookingReturn<TResponse> {
  data: TResponse | null;
  loading: boolean;
  error: string | null;
  fetchPopulateBookingData: (
    referenceNumber: string,
    options?: { updateState?: boolean }
  ) => Promise<TResponse | null>;
  reset: () => void;
}

export const useGetPopulateDataPrebooking = <TResponse = BookingQuoteResponse>({
  endpoint,
  loginBean,
  transformResponse = (data) => data,
}: UseGetPopulateDataPrebookingProps<TResponse>): UseGetPopulateDataPrebookingReturn<TResponse> => {
  const [data, setData] = useState<TResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPopulateBookingData = useCallback(
    async (referenceNumber: string,   options?: { updateState?: boolean }) => {
      if (!referenceNumber) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const payload = {
          requestData: {
            userId: loginBean.userId.toString(),
            mainBookingQuoteBean: {
              bookingQuoteBean: {
                referenceNumber: referenceNumber,
                type: 'PREBKG',
              },
            },
          },
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
    fetchPopulateBookingData,
    reset,
  };
};
