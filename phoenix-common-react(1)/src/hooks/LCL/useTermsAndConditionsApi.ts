import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../../core/api/client';
import { COMMON_ENDPOINTS } from '../../core/api/config/common.endpoints';

export interface TermsRequest {
  moduleCode: string;
  officeId: number;
  tokenKey: string;
  localeCode: string;
}

export const useTermsAndConditionsApi = (
  request: TermsRequest,
  autoFetch: boolean = true
) => {
  const [data, setData] = useState<string>(''); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTerms = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.post(
        COMMON_ENDPOINTS.TERMS_AND_CONDITIONS.GET_TERMS_AND_CONDITIONS,
        {
          requestData: request,
        }
      );

      const result = response?.data?.result;

      const termsText = result?.VALUE || '';

      setData(termsText);
    } catch (err: any) {
      console.error('Error fetching terms:', err);
      setError(err.message || 'Failed to fetch terms');
      setData('');
    } finally {
      setLoading(false);
    }
  }, [
    request.moduleCode,
    request.officeId,
    request.tokenKey,
    request.localeCode,
  ]);

  useEffect(() => {
    if (autoFetch) {
      fetchTerms();
    }
  }, [autoFetch, fetchTerms]);

  return {
    data, 
    loading,
    error,
    refetch: fetchTerms,
  };
};