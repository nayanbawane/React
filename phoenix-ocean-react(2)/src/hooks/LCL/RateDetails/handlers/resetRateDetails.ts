import {
  BookingQuoteChargeBeanFull,
  RateDetailsFormData,
  RoeRow,
  defaultRateDetailsFormData,
  makeRowId,
} from 'phoenix-common-react';

const AUTO_RATE_RELAY_FLAGS = ['A', 'G', 'C', 'T'] as const;

const applyResetCharges = (
  rows: BookingQuoteChargeBeanFull[],
  isResetButton: boolean
): {
  kept: BookingQuoteChargeBeanFull[];
  deleted: BookingQuoteChargeBeanFull[];
} => {
  const flagsToRemove: string[] = [...AUTO_RATE_RELAY_FLAGS];

  if (!isResetButton) {
    flagsToRemove.push('U');
  }

  const kept: BookingQuoteChargeBeanFull[] = [];
  const deleted: BookingQuoteChargeBeanFull[] = [];

  for (const row of rows) {
    if (row.isTruckingRates) {
      kept.push(row);
      continue;
    }

    const flag = row.relayFlag ?? '';
    if (flagsToRemove.includes(flag)) {
      deleted.push({ ...row, transactionalFlag: 'D' });
    } else {
      kept.push(row);
    }
  }

  return { kept, deleted };
};

const applyDisableAfterReset = (
  rows: BookingQuoteChargeBeanFull[],
  isTruckRateToggle: boolean
): BookingQuoteChargeBeanFull[] =>
  rows.map((row) => {
    const chargeType = row.incomeChargeDetails?.chargeType ?? '';
    const hasChargeCode = !!row.incomeChargeDetails?.chargeCode?.trim();
    const truckGroup = row.truckChargeGroup ?? '';

    const isFobRow = chargeType === 'FOB' && truckGroup !== 'PTC';
    const isPtcRow = truckGroup === 'PTC' && isTruckRateToggle;
    const isDtcRow = truckGroup === 'DTC' && isTruckRateToggle;

    if (hasChargeCode && (isFobRow || isPtcRow || isDtcRow)) {
      return { ...row, isEnableForEdit: false };
    }

    return row;
  });

const buildResetRoeState = (
  localCurrency: string,
  isDefaultLiveRatesToggle: boolean
): RateDetailsFormData['rateOfExchange'] => ({
  rateOfExchangeType: isDefaultLiveRatesToggle ? 'L' : 'M',
  baseCurrency: '',
  baseRoe: 1,
  roeRows: [
    {
      id: makeRowId(),
      currency: localCurrency,
      localCurrencyROE: '1',
      invoiceCurrencyROE: '1',
      isFile: false,
    } as RoeRow,
  ],
});

export interface ResetRateDetailsParams {
  formData: RateDetailsFormData;
  localCurrency: string;
  invoiceCurrency: string;
  moduleType: string;
  containerType: string;
  isTruckRateToggle: boolean;
  isMultiPortQuote: boolean;
  isDefaultLiveRatesToggle: boolean;
  keepOfr?: boolean;
}

export interface ResetRateDetailsResult {
  nextFormData: RateDetailsFormData;
  deletedRows: BookingQuoteChargeBeanFull[];
}

export const buildResetRateDetails = (
  params: ResetRateDetailsParams
): ResetRateDetailsResult => {
  const {
    formData,
    localCurrency,
    invoiceCurrency,
    isTruckRateToggle,
    isMultiPortQuote,
    isDefaultLiveRatesToggle,
    keepOfr,
  } = params;

  const { kept: keptAfterReset } = applyResetCharges(
    formData.charges.rateDetails,
    true
  );

  const allChargesToDelete: BookingQuoteChargeBeanFull[] = formData.charges.rateDetails
    .filter((r: BookingQuoteChargeBeanFull) =>
      !!r.incomeChargeDetails?.chargeCode?.trim() &&
      !r.isTruckingRates &&
      !!r.bookingRateId?.trim()
    )
    .map((r: BookingQuoteChargeBeanFull) => ({ ...r, transactionalFlag: 'D' }));

  const retainOfr = keepOfr !== undefined ? keepOfr : false;

  const ofrRowsToKeep = retainOfr
    ? keptAfterReset.filter(
        (r: BookingQuoteChargeBeanFull) =>
          r.incomeChargeDetails?.chargeType === 'OFR' && !r.isCallFromAccurate
      )
    : [];

  const truckingRowsToKeep = keptAfterReset.filter((r: BookingQuoteChargeBeanFull) => r.isTruckingRates);

  const fresh = defaultRateDetailsFormData(localCurrency, invoiceCurrency);

  const freshNonOfrRows = fresh.charges.rateDetails.filter(
    (r) => r.incomeChargeDetails?.chargeType !== 'OFR'
  );

  const mergedRows: BookingQuoteChargeBeanFull[] = [
    ...ofrRowsToKeep,
    ...truckingRowsToKeep,
    ...freshNonOfrRows,
  ];

  const disabledRows = applyDisableAfterReset(mergedRows, isTruckRateToggle);

  const finalRows = isMultiPortQuote
    ? disabledRows.map((row) => {
        const isOccWithCode =
          row.incomeChargeDetails?.chargeType === 'OCC' &&
          !!row.incomeChargeDetails?.chargeCode?.trim();
        return isOccWithCode ? { ...row, isEnableForEdit: false } : row;
      })
    : disabledRows;

  const freshRoe = buildResetRoeState(localCurrency, isDefaultLiveRatesToggle);

  const nextFormData: RateDetailsFormData = {
    ...fresh,
    ratingType: '',
    rateOfExchange: freshRoe,
    charges: {
      rateDetails: finalRows,
      deletedRateDetails: [
        ...(formData.charges.deletedRateDetails ?? []),
        ...allChargesToDelete,
      ],
    },
    toogleButtons: {
      ...fresh.toogleButtons,
      isModifyRatesActive: false,
      isExpandChargeDetailsActive: false,
      isExpandRateOfExchangeActive: false,
      isPrintPlcConfirmationActive: false,
      isExpandShipmentSummaryDetailsActive: false,
      isPickupExpanded: formData.toogleButtons.isPickupExpanded,
    },
  };

  return { nextFormData, deletedRows: allChargesToDelete };
};
