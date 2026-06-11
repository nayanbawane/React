import {
  COMMON_ENDPOINTS,
  useApi
} from 'phoenix-common-react';
import { useCallback } from 'react';

export interface DefaultRatesRequest {
  chargeCode: string;
  objectCode: string;
  officeId: number;
  locale: string;
}

export interface DefaultRatesResponse {
  result: {
    chargeId: number;
    shipObjectId: number;
    officeId: number;
    chargeCode: string;
    objectCode: string;
    originDestination: string;
    sellRate: number;
    basis: string;
    sellAmount: number;
    localAmount: number;
    locale: string;
  } | null;
}

export interface DefaultRatesPatch {
  originDestination: string;
  incomeBasis: string;
  incomeRate: number;
  incomeAmount: number;
  incomeLocalAmount: number;
}

export const useDefaultRates = () => {
  const { execute, error, isLoading } = useApi<DefaultRatesRequest, DefaultRatesResponse>({
    endpoint: COMMON_ENDPOINTS.RATE_DETAILS.GET_DEFAULT_CHARGES,
    onError: (err) => {
      console.error(
        '[useDefaultRates] Failed to fetch default charges:',
        err.message
      );
    },
  });

  const fetchDefaultRates = useCallback(
    async (
      chargeCode: string,
      moduleCode: string,
      officeId: number,
      locale: string
    ): Promise<DefaultRatesPatch | null> => {
      if (!chargeCode?.trim() || !moduleCode?.trim() || !officeId) return null;

      const result = await execute({
        chargeCode: chargeCode.trim(),
        objectCode: moduleCode,
        officeId,
        locale: locale ?? '',
      });

      if (!result?.result) return null;

      const { originDestination, basis, sellRate, sellAmount, localAmount } =
        result.result;

      return {
        originDestination: originDestination ?? '',
        incomeBasis: basis ?? '',
        incomeRate: sellRate ?? 0,
        incomeAmount: sellAmount ?? 0,
        incomeLocalAmount: localAmount ?? 0,
      };
    },
    [execute]
  );

  return {
    fetchDefaultRates,
    isLoadingDefaults: isLoading,
    defaultRatesError: error,
  };
};
