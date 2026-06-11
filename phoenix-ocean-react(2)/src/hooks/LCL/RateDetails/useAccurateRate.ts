import { useCallback, useRef } from 'react';
import type {
  LoginClientBeanRaw,
  BookingFormState,
} from 'phoenix-common-react';
import { useAppSelector } from '@/app/store/hooks';
import { useAccurateRateApi } from './useAccurateRateApi';
import { accurateRateConfig } from './accurateRateConfig';

export type AccurateRateDeps = {
  loginClientBean?: LoginClientBeanRaw | null;
  mainDetails?: Partial<BookingFormState>;
  dataRef: React.MutableRefObject<Record<string, unknown>>;
  moduleType?: string;
};

function formatDateToDDMMMYYYY(dateInput: unknown): string {
  const date = new Date(dateInput as string);
  const day = String(date.getDate()).padStart(2, '0');
  const months = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];
  return `${day}-${months[date.getMonth()]}-${date.getFullYear()}`;
}

function isNonEmpty(value: unknown): boolean {
  return value != null && String(value).trim() !== '';
}

function isAccurateProfileEntered(accuRateProfile: unknown): boolean {
  return isNonEmpty(accuRateProfile);
}

function isOriginRoutingEntered(
  routingDetails: Record<string, unknown>
): boolean {
  return (
    isNonEmpty(routingDetails.placeOfReceiptCode) ||
    isNonEmpty(routingDetails.portOfLoadingCode)
  );
}

function isDestinationRoutingEntered(
  routingDetails: Record<string, unknown>
): boolean {
  return (
    isNonEmpty(routingDetails.portOfDischargeCode) ||
    isNonEmpty(routingDetails.deconsolidationCfsCode) ||
    isNonEmpty(routingDetails.destinationCfsCode) ||
    isNonEmpty(routingDetails.placeOfDeliveryCode)
  );
}

function isRoutingDetailsEntered(
  routingDetails: Record<string, unknown>
): boolean {
  return (
    isOriginRoutingEntered(routingDetails) &&
    isDestinationRoutingEntered(routingDetails)
  );
}

function isShipmentDateEntered(shipmentDate: string | null): boolean {
  return isNonEmpty(shipmentDate);
}

function isValidated(
  accuRateProfile: unknown,
  routingDetails: Record<string, unknown>,
  shipmentDate: string | null
): boolean {
  return (
    isAccurateProfileEntered(accuRateProfile) &&
    isRoutingDetailsEntered(routingDetails) &&
    isShipmentDateEntered(shipmentDate)
  );
}

function validateMandatoryFields(
  isOn: (key: string) => boolean,
  prepaidCollect: unknown,
  controllingEntity: unknown,
  onValidationFail?: (field: 'PREPAID_COLLECT' | 'CONTROLLING_ENTITY') => void
): boolean {
  if (isOn('ACCURATE_PREPAID_COLLECT_MANDATORY')) {
    const val = String(prepaidCollect ?? '');
    if (!isNonEmpty(val) || val === '-1') {
      onValidationFail?.('PREPAID_COLLECT');
      return false;
    }
  }
  if (isOn('ACCURATE_CONTROLLING_ENTITY_MANDATORY')) {
    if (!isNonEmpty(controllingEntity)) {
      onValidationFail?.('CONTROLLING_ENTITY');
      return false;
    }
  }
  return true;
}

function resolveShipmentDate(
  moduleType: string,
  routingDetails: Record<string, unknown>,
  isOn: (key: string) => boolean
): string | null {
  const isQuote = moduleType === 'QUO';
  const isBooking = moduleType === 'BKG';
  const useEtd =
    (isQuote && isOn('PULL_ACCURATE_DATA_ETD_QUOTE')) ||
    (isBooking && isOn('PULL_ACCURATE_DATA_ETD_BOOKING'));

  if (useEtd) {
    const etd = routingDetails.placeOfReceiptEtd;
    if (isNonEmpty(etd)) return formatDateToDDMMMYYYY(etd);
    const ets = routingDetails.portOfLoadingEts;
    return isNonEmpty(ets) ? formatDateToDDMMMYYYY(ets) : null;
  }

  const ets = routingDetails.portOfLoadingEts;
  return isNonEmpty(ets) ? formatDateToDDMMMYYYY(ets) : null;
}

export const useAccurateRate = (deps: AccurateRateDeps) => {
  const depsRef = useRef(deps);
  depsRef.current = deps;

  const {
    isLoading,
    error,
    result: accurateRateData,
    execute,
  } = useAccurateRateApi(accurateRateConfig);

  const resolved = useAppSelector(
    (state: any) => state.featureToggle?.resolved ?? {}
  );
  const isOn = useCallback(
    (key: string) => resolved[key]?.toUpperCase() === 'Y',
    [resolved]
  );
  const isOnRef = useRef(isOn);
  isOnRef.current = isOn;

  const lastRouteRef = useRef({ origin: '', destination: '' });
  const isAccurateShownRef = useRef(false);

  const handleAccurateRate = useCallback(
    async (
      overrides?: {
        rateDetails?: Record<string, unknown>;
        routingDetails?: Record<string, unknown>;
      },
      onValidationFail?: (
        field: 'PREPAID_COLLECT' | 'CONTROLLING_ENTITY'
      ) => void,
      onDefaultRatesFetched?: () => void
    ) => {
      const { loginClientBean, mainDetails, dataRef, moduleType } =
        depsRef.current;
      const fn = isOnRef.current;

      const lclForm = (dataRef.current?.customerDetails as any)?.lclForm ?? {};
      const routingDetails: Record<string, unknown> = {
        ...((dataRef.current as any)?.routingDetails ?? {}),
        ...overrides?.routingDetails,
      };

      const resolvedModuleType =
        moduleType ?? String((dataRef.current as any)?.moduleType ?? '');

      const shipmentDate = resolveShipmentDate(
        resolvedModuleType,
        routingDetails,
        fn
      );
      const accuRateProfile = lclForm.accuRateProfile ?? '';
      if (!isValidated(accuRateProfile, routingDetails, shipmentDate)) {
        return;
      }

      if (
        !validateMandatoryFields(
          fn,
          lclForm.prepaidCollect,
          lclForm.controllingEntity,
          onValidationFail
        )
      ) {
        return;
      }

      const payloadOverrides: Record<string, unknown> = {
        shipmentDate,
        ...(fn('CUST_RATES_IF_NAC_RATES_NOT_PRSNT')
          ? { nacRatesAvailable: true }
          : {}),
      };

      const spotRateFlag =
        fn('SPOT_RATES_WITH_ACCURATE') && fn('VIEW_SPOT_RATE_PERMISSION')
          ? 1
          : undefined;

      const apiPayload = {
        ...(dataRef.current as any),
        mainDetails: (dataRef.current as any).mainDetails ?? mainDetails,
        moduleType: resolvedModuleType,
        ...(overrides?.rateDetails
          ? {
              rateDetails: {
                ...(dataRef.current as any).rateDetails,
                ...overrides.rateDetails,
              },
            }
          : {}),
        routingDetails,
      };

      const result = await execute(
        apiPayload,
        loginClientBean,
        payloadOverrides,
        spotRateFlag
      );

      if (
        result != null &&
        fn('CUST_RATES_IF_NAC_RATES_NOT_PRSNT') &&
        String(accuRateProfile).toUpperCase() !== 'STANDARD' &&
        isNonEmpty(lclForm.namedAccount) &&
        result.nacRatesAvailable === false
      ) {
        const currentOrigin = String(routingDetails.placeOfReceiptCode ?? '');
        const currentDestination = String(
          routingDetails.destinationCfsCode ?? ''
        );
        const routeChanged =
          !isAccurateShownRef.current ||
          lastRouteRef.current.origin.toLowerCase() !==
            currentOrigin.toLowerCase() ||
          lastRouteRef.current.destination.toLowerCase() !==
            currentDestination.toLowerCase();

        if (routeChanged) {
          isAccurateShownRef.current = true;
          lastRouteRef.current = {
            origin: currentOrigin,
            destination: currentDestination,
          };
          onDefaultRatesFetched?.();
        }
      }

      lastRouteRef.current = {
        origin: String(routingDetails.placeOfReceiptCode ?? ''),
        destination: String(routingDetails.destinationCfsCode ?? ''),
      };
    },
    [execute]
  );

  return {
    isLoading,
    error,
    accurateRateData,
    handleAccurateRate,
  };
};
