import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../../core/api/client';
import { COMMON_ENDPOINTS } from '../../core/api/config/common.endpoints';

interface LocationRequest {
  locationCode: string;
  officeCode: string;
}

interface LocationInfo {
  publicInfo: string;
  privateInfo: string;
  fclPublicInfo: string;
  fclPrivateInfo: string;
}

export const    useLocationInformation = (
  request: LocationRequest,
  autoFetch: boolean = true
) => {
  const [data, setData] = useState<LocationInfo>({
    publicInfo: '',
    privateInfo: '',
    fclPublicInfo: '',
    fclPrivateInfo: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLocationInfo = useCallback(async () => {
    if (!request.locationCode) return;

    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.post(
        COMMON_ENDPOINTS.LOCATION.GET_LOCATION_INFORMATION,
        {
          requestData: request,
        }
      );

      const result = response?.data?.result;

      if (!result) {
        setData({
          publicInfo: '',
          privateInfo: '',
          fclPublicInfo: '',
          fclPrivateInfo: ''
        });
        return;
      }

      setData({
        publicInfo: result.LOCATION_PUBLIC_INFO || '',
        privateInfo: result.LOCATION_PRIVATE_INFO || '',
        fclPublicInfo: result.FCL_PUBLIC_INFO || '',
        fclPrivateInfo: result.FCL_PRIVATE_INFO || '',
      });
    } catch (err: any) {
      console.error('Error fetching location info:', err);
      setError(err.message || 'Failed to fetch location info');
      setData({
        publicInfo: '',
        privateInfo: '',
        fclPublicInfo: '',
        fclPrivateInfo: ''
      });
    } finally {
      setLoading(false);
    }
  }, [request.locationCode, request.officeCode]);

  useEffect(() => {
    if (autoFetch && request.locationCode) {
      fetchLocationInfo();
    }
  }, [autoFetch, request.locationCode, fetchLocationInfo]);

  return {
    data,
    loading,
    error,
    refetch: fetchLocationInfo,
  };
};
