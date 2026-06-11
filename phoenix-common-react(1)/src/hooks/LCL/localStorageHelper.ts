import { useState, useEffect, useCallback } from 'react';
import { ApiService } from '../../core/api/client';
import { COMMON_ENDPOINTS } from '../../core/api/config/common.endpoints';

export interface ContainerDimensionRecord {
  CONTAINERHEIGHT: string;
  CONTAINERVOLUME: string;
  CONTAINERLENGTH: string;
  CONTAINERWIDTH: string;
  CONTAINERSIZE: string;
  CONTAINERWEIGHT: string;
  CONTAINERUNIT: string;
}

export interface ContainerMappingRequest {
  groupName: string;
  officeCode: string;
  userOfficeId: string;
}

type ContainerMappingResponse = Array<Record<string, string>>;

interface ResultJson<T> {
  success: number;
  result: T;
  message: string;
  errorCode: string | null;
}

export interface ContainerValidationRecord {
  maxLength: string;
  maxWidth: string;
  maxHeight: string;
  maxSingleWeight: string;
  maxTotalWeight: string;
  maxSingleVolume: string;
  maxTotalVolume: string;
  unit: string;
  weightUnit: string;
  volumeUnit: string;
  deliveryType: string;
}

export const localStorageHelper = (
  request?: ContainerMappingRequest,
  autoFetch: boolean = true
) => {
  const [data, setData] = useState<ContainerMappingResponse>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getContainerMapping = useCallback(async () => {
    if (!request?.officeCode || !request?.groupName) return;
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.post<ResultJson<ContainerMappingResponse>>(
        COMMON_ENDPOINTS.LOCAL_STORAGE.GET_CONTAINER_MAPPING_DATA,
        request
      );
      setData(response.data.result ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load container mapping data';
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [request?.officeCode, request?.groupName, request?.userOfficeId]);

  useEffect(() => {
    if (autoFetch) {
      getContainerMapping();
    }
  }, [autoFetch, getContainerMapping]);

  return {
    data,
    loading,
    error,
    refetch: getContainerMapping,
  };
};

export const useContainerValidation = (officeId: number, autoFetch: boolean = true) => {
  const [data, setData] = useState<ContainerValidationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchContainerValidation = useCallback(async () => {
    if (!officeId) return;
    setLoading(true);
    setError(null);

    try {
      const response = await ApiService.post<ResultJson<ContainerValidationRecord[]>>(
        COMMON_ENDPOINTS.LOCAL_STORAGE.GET_CONTAINER_VALIDATION_DATA,
        { officeId }
      );
      setData(response.data.result ?? []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load container validation data';
      setError(message);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [officeId]);

  useEffect(() => {
    if (autoFetch) {
      fetchContainerValidation();
    }
  }, [autoFetch, fetchContainerValidation]);

  return { data, loading, error, refetch: fetchContainerValidation };
};
