import {
  BookingQuoteChargeBeanFull,
  ChargeDetails,
  CommonToggleKeys,
  MODULE_ARN,
  MODULE_BKG,
  MODULE_BOL,
  MODULE_QUO,
  RELAY_FLAG_ACCURATE,
  RELAY_FLAG_TRK,
  RoeRow,
  useFeatureToggle,
} from 'phoenix-common-react';
import { useDefaultRates } from './useDefaultRates';

export interface ChargeRowHandlersDeps {
  ratingType: string;
  roeRows: RoeRow[];
  roeType: string;
  featureToggle: ReturnType<typeof useFeatureToggle>;
  localCurrency: string;
  moduleType: string;
  isRateOverrideAllow: (relayFlag?: string) => boolean;
  nraAcceptancePending?: string;
  bookingType?: string;
  taxSettingMap?: Record<
    string,
    { taxCode: string; taxPercent: string; taxText?: string }
  > | null;
  officeId?: number;
  locale?: string;
  defaultPrepaidCollect?: string | null;
}

export interface ChargeRowHandlersActions {
  handleChargeRowUpdate: (
    id: string,
    isIncome: boolean,
    patch: Partial<BookingQuoteChargeBeanFull>
  ) => void;
  onWarning: (msg: string) => void;
}

const computeSpotRateFlagChange = (
  row: BookingQuoteChargeBeanFull,
  moduleType: string,
  isNotesChangedToggle: boolean
): number | undefined => {
  const isTruckingRow =
    row.truckChargeGroup === 'PTC' || row.truckChargeGroup === 'DTC';

  if (isNotesChangedToggle && (moduleType === MODULE_BKG || moduleType === MODULE_QUO)) {
    if (row.relayFlag === RELAY_FLAG_ACCURATE && row.spotRateFlag === 1) return 2;
    if (isTruckingRow && row.relayFlag === RELAY_FLAG_TRK) return 2;
  } else if (moduleType === MODULE_ARN || moduleType === MODULE_BOL) {
    if (isTruckingRow && row.relayFlag === RELAY_FLAG_TRK) return 2;
  }
  return row.spotRateFlag;
};

const computeTaxKey = (incomeVAT: string): string => {
  if (incomeVAT?.includes('Y') && incomeVAT?.includes('~')) {
    const parts = incomeVAT.split('~');
    if (parts.length > 1) return parts[1];
  }
  return '0';
};

export const useChargeRowHandlers = (
  deps: ChargeRowHandlersDeps,
  actions: ChargeRowHandlersActions
) => {
  const {
    ratingType,
    roeRows,
    roeType,
    featureToggle,
    localCurrency,
    moduleType,
    isRateOverrideAllow,
    nraAcceptancePending,
    bookingType,
    taxSettingMap,
    officeId,
    locale,
    defaultPrepaidCollect,
  } = deps;
  const { handleChargeRowUpdate, onWarning } = actions;
  const { isVisible } = featureToggle;
  const { fetchDefaultRates } = useDefaultRates();

  const isTruckRateToggle =
    isVisible(CommonToggleKeys.BKG_QUOTE_TRUCKING_RATES_INTEGRATION) ||
    isVisible(CommonToggleKeys.OCN_BKG_QUOTE_PICKUP_RATES_INTEGRATION);

  const isNotesChangedToggle = isVisible(
    CommonToggleKeys.OCEAN_RATING_DETAILS_NOTES_CHANGED
  );

  const handleChargeNameChange = async (
    rowId: string,
    chargeDetails: ChargeDetails,
    currentRow: BookingQuoteChargeBeanFull
  ) => {
    const newSpotRateFlag = computeSpotRateFlagChange(
      currentRow,
      moduleType,
      isNotesChangedToggle
    );
    const spotPatch =
      newSpotRateFlag !== undefined ? { spotRateFlag: newSpotRateFlag } : {};

    const nhcPatch: Partial<BookingQuoteChargeBeanFull> = {};
    if (
      moduleType === MODULE_BKG &&
      isVisible(CommonToggleKeys.OCEAN_ENABLE_NHC_CHARGE_FOR_EXPORT)
    ) {
      nhcPatch.prepaidCollect =
        chargeDetails.chargeCode?.toUpperCase() === 'NHC' ? 'P' : '';
    }

    // if (
    //   ratingType === 'A' &&
    //   chargeDetails.chargeCode?.toLowerCase() === 'ofr'
    // ) {
    //   onWarning('OFR charge should come from CTC/ACCURATE.');
    //   handleChargeRowUpdate(rowId, true, {
    //     incomeChargeDetails: {
    //       ...currentRow.incomeChargeDetails,
    //       chargeCode: '',
    //       chargeDescription: '',
    //     },
    //     ...spotPatch,
    //   });
    //   return;
    // }

    if (
      moduleType === MODULE_BKG &&
      isVisible(CommonToggleKeys.OCEAN_NRA_APPROVAL_PROCESS)
    ) {
      const fmcType = chargeDetails.fmcChargeType ?? '';
      if (
        nraAcceptancePending?.toUpperCase() === 'Y' &&
        fmcType.toUpperCase() === 'Y'
      ) {
        handleChargeRowUpdate(rowId, true, {
          incomeChargeDetails: {
            ...currentRow.incomeChargeDetails,
            chargeCode: '',
            chargeDescription: '',
          },
          originDestination: '',
          prepaidCollect: '',
          incomeBasis: '',
          incomeRate: 0,
          expenseBasis: '',
          expenseRate: 0,
          fmcChargeType: fmcType,
          ...spotPatch,
        });
        onWarning('NRA acceptance is pending. You cannot add this charge.');
        return;
      }
    }

    if (!isRateOverrideAllow(currentRow.relayFlag)) {
      const deniedPatch = { ...spotPatch, ...nhcPatch };
      if (Object.keys(deniedPatch).length > 0) {
        handleChargeRowUpdate(rowId, true, deniedPatch);
      }
      return;
    }

    const nraBkgPatch: Partial<BookingQuoteChargeBeanFull> =
      moduleType === MODULE_BKG &&
      isVisible(CommonToggleKeys.OCEAN_NRA_APPROVAL_PROCESS)
        ? {
            fmcChargeType: chargeDetails.fmcChargeType ?? '',
            ...(bookingType ? { bookingType } : {}),
          }
        : {};

    handleChargeRowUpdate(rowId, true, {
      incomeChargeDetails: {
        ...currentRow.incomeChargeDetails,
        chargeCode: chargeDetails.chargeCode,
        chargeDescription: chargeDetails.chargeDescription,
      },
      ...spotPatch,
      ...nhcPatch,
      ...nraBkgPatch,
    });

    if (chargeDetails.chargeCode?.trim() && officeId && moduleType) {
      const defaultPatch = await fetchDefaultRates(
        chargeDetails.chargeCode,
        moduleType,
        officeId,
        locale ?? ''
      );

      if (defaultPatch) {
        handleChargeRowUpdate(rowId, true, {
          incomeChargeDetails: {
            ...currentRow.incomeChargeDetails,
            chargeCode: chargeDetails.chargeCode,
            chargeDescription: chargeDetails.chargeDescription,
          },
          originDestination: defaultPatch.originDestination as any,
          incomeBasis: defaultPatch.incomeBasis,
          incomeRate: defaultPatch.incomeRate,
          incomeAmount: defaultPatch.incomeAmount,
          incomeLocalAmount: defaultPatch.incomeLocalAmount,
          ...(defaultPrepaidCollect
            ? { prepaidCollect: defaultPrepaidCollect as any }
            : {}),
        });
      }
    }
  };

  const handleChargeNameClear = (
    rowId: string,
    currentRow: BookingQuoteChargeBeanFull
  ) => {
    handleChargeRowUpdate(rowId, true, {
      incomeChargeDetails: {
        ...currentRow.incomeChargeDetails,
        chargeCode: '',
        chargeDescription: '',
      },
      originDestination: '',
      prepaidCollect: '',
      incomeBasis: '',
      incomeRate: 0,
      expenseBasis: '',
      expenseRate: 0,
    });
  };

  const handleIncomeBasisChange = (
    rowId: string,
    isIncome: boolean,
    patch: Partial<BookingQuoteChargeBeanFull>,
    currentRow: BookingQuoteChargeBeanFull
  ) => {
    const isTruckingRelay =
      isTruckRateToggle &&
      (currentRow.truckChargeGroup === 'PTC' ||
        currentRow.truckChargeGroup === 'DTC') &&
      currentRow.relayFlag === RELAY_FLAG_TRK;

    const enrichedPatch =
      patch.incomeBasis === '%'
        ? { ...patch, incomeCurrency: localCurrency }
        : patch;

    if (isTruckingRelay) {
      const { expenseBasis, expenseOldBasis, ...withoutExpenseSync } =
        enrichedPatch;
      handleChargeRowUpdate(rowId, isIncome, withoutExpenseSync);
    } else {
      handleChargeRowUpdate(rowId, isIncome, enrichedPatch);
    }
  };

  const handleExpenseBasisChange = (
    rowId: string,
    isIncome: boolean,
    patch: Partial<BookingQuoteChargeBeanFull>,
    currentRow: BookingQuoteChargeBeanFull
  ) => {
    const finalPatch = !currentRow.incomeBasis?.trim()
      ? { ...patch, incomeBasis: '' }
      : patch;

    handleChargeRowUpdate(rowId, isIncome, finalPatch);
  };

  const handleVendorCommit = (
    rowId: string,
    isIncome: boolean,
    vendor: string
  ) => {
    if (vendor === 'removeIt') {
      handleChargeRowUpdate(rowId, isIncome, { isFiltered: true });
      return;
    }
    handleChargeRowUpdate(rowId, isIncome, { vendor });
  };

  // GWT: incomePrepaidOrCollectSelection.addChangeHandler
  const handlePrepaidCollectChange = (
    rowId: string,
    prepaidCollect: string,
    currentRow: BookingQuoteChargeBeanFull
  ) => {
    // GWT: changeAccurateFlag()
    const newSpotRateFlag = computeSpotRateFlagChange(
      currentRow,
      moduleType,
      isNotesChangedToggle
    );
    const spotPatch =
      newSpotRateFlag !== undefined ? { spotRateFlag: newSpotRateFlag } : {};

    const taxKey = computeTaxKey(currentRow.incomeVAT ?? '');
    const taxInfo = taxSettingMap?.[taxKey];
    const taxKeyPatch: Partial<BookingQuoteChargeBeanFull> = taxInfo
      ? {
          taxKey,
          taxCode: taxInfo.taxCode,
          vatPercent: taxInfo.taxPercent,
          taxText: taxInfo.taxText ?? '',
        }
      : { taxKey, taxCode: '', vatPercent: '', taxText: '' };

    const vatResetPatch: Partial<BookingQuoteChargeBeanFull> = {};
    const pc = prepaidCollect?.toUpperCase();
    if (
      pc === 'C' &&
      (moduleType === MODULE_BKG || moduleType === MODULE_QUO || moduleType === MODULE_BOL)
    ) {
      vatResetPatch.incomeVAT = 'N';
    } else if (pc === 'P' && moduleType === MODULE_ARN  ) {
      vatResetPatch.incomeVAT = 'N';
    }

    handleChargeRowUpdate(rowId, true, {
      prepaidCollect: prepaidCollect as any,
      ...spotPatch,
      ...taxKeyPatch,
      ...vatResetPatch,
    });
  };

  const handleIncomeRateChange = (
    rowId: string,
    newRate: number,
    currentRow: BookingQuoteChargeBeanFull
  ) => {
    const newSpotRateFlag = computeSpotRateFlagChange(
      currentRow,
      moduleType,
      isNotesChangedToggle
    );
    const spotPatch =
      newSpotRateFlag !== undefined ? { spotRateFlag: newSpotRateFlag } : {};

    if (!isRateOverrideAllow(currentRow.relayFlag)) {
      if (Object.keys(spotPatch).length > 0) {
        handleChargeRowUpdate(rowId, true, spotPatch);
      }
      return;
    }

    handleChargeRowUpdate(rowId, true, {
      incomeRate: newRate,
      incomeMinimumRate: newRate,
      ...spotPatch,
    });
  };

  const handleExpenseRateChange = (
    rowId: string,
    newRate: number,
    currentRow: BookingQuoteChargeBeanFull
  ) => {
    handleChargeRowUpdate(rowId, false, {
      expenseRate: newRate,
      expenseMinimumRate: newRate,
    });
  };

  const handleCurrencyChangeWithRoeCheck = (
    currency: string,
    onAddToRoe: (currency: string) => void
  ) => {
    if (!currency?.trim()) return;

    const existsInRoe = roeRows.some(
      (r) => r.currency?.toUpperCase() === currency.toUpperCase()
    );

    if (!existsInRoe && roeType !== 'L') {
      onWarning(`Please enter rate of exchange for ${currency}`);
    }

    onAddToRoe(currency);
  };

  return {
    handleChargeNameChange,
    handleChargeNameClear,
    handlePrepaidCollectChange,
    handleIncomeBasisChange,
    handleExpenseBasisChange,
    handleVendorCommit,
    handleCurrencyChangeWithRoeCheck,
    handleIncomeRateChange,
    handleExpenseRateChange,
  };
};
