import { useCallback } from 'react';
import {
  BookingQuoteChargeBeanFull,
  CargoRowsState,
  CommonToggleKeys,
  RateDetailsFormData,
  useFeatureToggle,
} from 'phoenix-common-react';

export interface RatingTypeChangeDeps {
  formData: RateDetailsFormData;
  moduleType: string;
  cargoFormData?: CargoRowsState;
  linkedQuoteRef?: string | number;
}

export interface RatingTypeChangeActions {
  setRatingType: (type: string) => void;
  handleRateDetailsChargesChange: (rows: BookingQuoteChargeBeanFull[]) => void;
  evictPersistedChargesToDeleted: (rows: BookingQuoteChargeBeanFull[]) => void;
  handleToggleButtonChange: (
    key: keyof RateDetailsFormData['toogleButtons'],
    value: boolean
  ) => void;
  triggerAccurateRate: (overrides?: Record<string, unknown>) => void;
  triggerCTCRates?: (ratingType: string) => void;
  triggerGRDBRates?: () => void;
}

const isCargoEntered = (cargoFormData?: CargoRowsState): boolean => {
  if (!cargoFormData?.cargoRows?.length) return false;
  return cargoFormData.cargoRows.some((r: any) => {
    const kg = String(r.kg ?? '').trim();
    const cbm = String(r.cbm ?? '').trim();
    const haz = String(r.hazardous ?? '').trim();
    return (
      kg !== '' &&
      cbm !== '' &&
      haz !== '' &&
      haz !== '-1' &&
      haz.toLowerCase() !== 'please select'
    );
  });
};

const hasLinkedQuoteOfrCharge = (
  rows: BookingQuoteChargeBeanFull[],
  linkedQuoteRef?: string | number
): boolean => {
  if (!linkedQuoteRef) return false;
  return rows.some(
    (r) =>
      r.incomeChargeDetails?.chargeCode?.toUpperCase() === 'OFR' &&
      !r.truckingChargeLinkId
  );
};

const resetAutoFetchedCharges = (
  rows: BookingQuoteChargeBeanFull[]
): BookingQuoteChargeBeanFull[] =>
  rows.filter(
    (r) => r.relayFlag === 'U' || r.relayFlag === 'D'
  );

export const useRatingTypeChangeHandler = (
  deps: RatingTypeChangeDeps,
  actions: RatingTypeChangeActions,
  featureToggle: ReturnType<typeof useFeatureToggle>
) => {
  const { isVisible } = featureToggle;

  const isCommodityAccurateToggle = isVisible(
    CommonToggleKeys.COMMODITY_ACCURATE_SERVICE_CALL
  );

  const onRatingTypeChange = useCallback(
    (selectedRatingType: string) => {
      const { formData, cargoFormData, moduleType, linkedQuoteRef } = deps;

      actions.setRatingType(selectedRatingType);

      if (!selectedRatingType) return;

      if (moduleType !== 'BKG' && moduleType !== 'QUO') return;

      if (
        moduleType === 'BKG' &&
        hasLinkedQuoteOfrCharge(formData.charges.rateDetails, linkedQuoteRef)
      ) {
        return;
      }

      const cargoReady = isCargoEntered(cargoFormData);

      const resetRows = resetAutoFetchedCharges(formData.charges.rateDetails);
      actions.evictPersistedChargesToDeleted(formData.charges.rateDetails);
      actions.handleRateDetailsChargesChange(resetRows);

      if (selectedRatingType === 'A') {
        
        if (!cargoReady) return;
        
        const savedPrintPlc =
        formData.toogleButtons.isPrintPlcConfirmationActive;
        
        actions.triggerAccurateRate({ rateDetails: { ratingType: selectedRatingType } });

        actions.handleToggleButtonChange(
          'isPrintPlcConfirmationActive',
          savedPrintPlc
        );
        return;
      }

      if (selectedRatingType === 'G') {
        if (!cargoReady) return;
        actions.triggerGRDBRates?.();
        return;
      }

      if (selectedRatingType === 'C') {
        if (!cargoReady) return;
        actions.triggerCTCRates?.(selectedRatingType);
        return;
      }

      if (selectedRatingType === 'T') {
        if (!cargoReady) return;
        if (isCommodityAccurateToggle) {
          actions.triggerAccurateRate({ rateDetails: { ratingType: selectedRatingType } });
        } else {
          actions.triggerCTCRates?.(selectedRatingType);
        }
        return;
      }
    },
    [deps, actions, isCommodityAccurateToggle]
  );

  return { onRatingTypeChange };
};
