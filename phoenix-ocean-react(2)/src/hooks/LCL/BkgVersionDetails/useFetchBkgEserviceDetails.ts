import { useState, useCallback, useEffect } from 'react';
import { WEB_SERVICE_ENDPOINTS } from 'phoenix-common-react';
import { apiClient } from '@/core/api/client';

interface Request {
  module: string;
  shipmenttype: string;
  referenceNumber: string;
  shouldFetch: boolean;
  commonBean: {
    userSchemaName: string;
    officeCode: string;
    userFullname: string;
  };
}

interface ApiResponse {
  result: any;
}

export const useFetchBkgEserviceDetails = ({
  module,
  shipmenttype,
  referenceNumber,
  shouldFetch,
  commonBean
}: Request) => {
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);

  const fetchBkgEserviceDetails = useCallback(async () => {
    setLoading(true);

    try {

      const response = await apiClient.post<ApiResponse>(
        `${WEB_SERVICE_ENDPOINTS.ESERVICE.FETCH_BKGESERVICE_DATA}/${module}/${shipmenttype}/${referenceNumber}`,
        commonBean
      );

      setData(response.data.result ?? {});

    } catch {
      setData({});
    } finally {
      setLoading(false);
    }
  }, [module,
    shipmenttype,
    referenceNumber,
    commonBean.userSchemaName,
    commonBean.officeCode,
    commonBean.userFullname]);

  useEffect(() => {
    if (!shouldFetch || !referenceNumber) {
      return;
    }
    fetchBkgEserviceDetails();
  }, [fetchBkgEserviceDetails, shouldFetch, referenceNumber]);

  return {
    data,
    loading,
    refetch: fetchBkgEserviceDetails,
  };
};