import { ApiService } from '@/core/api/client';
import { COMMON_ENDPOINTS } from '../../core/api/config/common.endpoints';
import { useState, useEffect, useCallback } from 'react';
import { ContainerDataBean } from '@/types';


export interface ContainerBeanRequest {
  typeOfMove: string;
}

export const useContainerDataBeanApi = (
  request: ContainerBeanRequest,
  autoFetch: boolean = true
) => {
  const [data, setData] = useState<ContainerDataBean[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContainerBean = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
       const response = await ApiService.get(
        COMMON_ENDPOINTS.CONATINER_BEAN.GET_CONATINER_BEAN_PATH,
        {
          params: {
            typeOfMove: request.typeOfMove,
          },
          headers: {
            Authorization: '7ylFhU5IM/ANhixJP3MpnErYL7pLTDcrtiMBdqVkqDY=',
          },
        }
      );
      const result = response?.data?.result || []
      setData(result);
    } catch (err: any) {
      console.error('Error fetching containertype bean:', err.message);
      setError(err.message || 'Failed to containertype bean data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [
    request.typeOfMove
  ]);

  useEffect(() => {
    if (autoFetch) {
      fetchContainerBean();
    }
  }, [autoFetch, fetchContainerBean]);

  return {
    data, 
    loading,
    error,
    refetch: fetchContainerBean,
  };
};