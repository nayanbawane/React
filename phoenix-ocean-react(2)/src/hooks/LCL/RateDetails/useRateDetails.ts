import {
  BookingQuoteChargeBeanFull,
  CargoMetrics,
  CargoRowsState,
  ChargeType,
  COMMON_ENDPOINTS,
  CommonToggleKeys,
  createBlankBeanRow,
  CustomerDetailFormState,
  GetCurrencyConversionRateRequest,
  GetCurrencyConversionRateResponse,
  GetRateCalcWithFormulaRequest,
  GetRateCalcWithFormulaResponse,
  LCLFormState,
  LoginClientBeanRaw,
  makeRowId,
  MODULE_BKG,
  MODULE_PREBKG,
  MODULE_QUO,
  OceanToggleKeys,
  ORIGIN_CODE,
  RateBasisUtility,
  RateDetailsFormData,
  RoeRow,
  RoutingFormData,
  SelectOption,
  useApi,
  useFeatureToggle,
} from 'phoenix-common-react';
import type { MutableRefObject } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AccurateRateDetailBean } from './accurateRateTypes';
import { mapAccurateRateDetailBeanToRow } from './accurateRateMapper';
import { buildResetRateDetails } from './handlers/resetRateDetails';
import { useChargeRowHandlers } from './handlers/useChargeRowHandlers';
import { useRateUtilityHandlers } from './handlers/useRateUtilityHandlers';
import { useRatingTypeChangeHandler } from './handlers/useRatingTypeChangeHandler';
import { useRatingTypePopulate } from './handlers/useRatingTypePopulate';
import { useRoeHandlers } from './handlers/useRoeHandlers';
import { useVatChargeHandler } from './handlers/useVatChargeHandler';
import { useAccurateRate } from './useAccurateRate';
import { formatSixDecimals } from './utils/rateFormatUtils';

export type RateDetailsDeps = {
  loginClientBean?: LoginClientBeanRaw;
  routingFormData?: RoutingFormData;
  customerFormData?: CustomerDetailFormState;
  cargoFormData?: CargoRowsState;
  mainDetails?: LCLFormState;
  dataRef: MutableRefObject<Record<string, unknown>>;
  moduleType?: string; // 'BKG', 'QUO'
  containerType?: string; // 'L' = LCL, 'F' = FCL
  nraAcceptancePending?: string;
  bookingType?: string;
  isFromCopy?: boolean;
  teu?: number
  pickupCargoMetricsMap?: Record<string, CargoMetrics>;
};

export const useRateDetails = (deps: RateDetailsDeps) => {
  const featureToggle = useFeatureToggle();
  const { isVisible, getToggleValue } = featureToggle;

  const [resetKey, setResetKey] = useState(0);
  const [isAccuRatePopulated, setIsAccuRatePopulated] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isKeepOfrDialogOpen, setIsKeepOfrDialogOpen] = useState(false);
  const [isRatingLegendVisible, setIsRatingLegendVisible] = useState(false);
  const [isAccurateConfirmDialogOpen, setIsAccurateConfirmDialogOpen] = useState(false);
  const pendingRatingTypeRef = useRef<string | null>(null);
  const pendingRoeRowRef = useRef<RoeRow | null>(null);
  const isAccurateServiceOpenRef = useRef(false);
  const shouldCallAccurateRef = useRef<boolean | null>(null);

  const [duplicateChargeDialog, setDuplicateChargeDialog] = useState<{
    open: boolean;
    chargeCode: string;
    pendingRows: BookingQuoteChargeBeanFull[];
    pendingRoeRows: RoeRow[];
    rowIdToRemove: string;
  }>({
    open: false,
    chargeCode: '',
    pendingRows: [],
    pendingRoeRows: [],
    rowIdToRemove: '',
  });

  const [localCurrency, setLocalCurrency] = useState(
    deps.loginClientBean?.localCurrency || 'USD'
  );
  const [invoiceCurrency, setInvoiceCurrency] = useState(
    deps.loginClientBean?.localCurrency || 'USD'
  );
  const [isVATEnable, setIsVATEnable] = useState(
    isVisible(OceanToggleKeys.VAT_CALCULATE)
  );
  const [chargeTypeToShowExpense, setChargeTypeToShowExpense] = useState([]);

  useEffect(() => {
    const chargeTypes = getToggleValue(
      OceanToggleKeys.OCN_RATES_SHOW_EXPENSE_BY_CHARGE_TYPE
    );
    if (chargeTypes) {
      setChargeTypeToShowExpense(
        chargeTypes.split(',').map((s: string) => s.trim())
      );
    }
  }, [getToggleValue(OceanToggleKeys.OCN_RATES_SHOW_EXPENSE_BY_CHARGE_TYPE)]);

  const [chargeWarning, setChargeWarning] = useState<string | undefined>(
    undefined
  );
  const [equipmentDetailsList, setEquipmentDetailsList] = useState<SelectOption[]>([]);

  const isDefaultLiveRatesToggle = isVisible(
    CommonToggleKeys.OCEAN_DEFAULT_LIVE_RATES
  );

  const isCommodityAccurateToggle = isVisible(
    CommonToggleKeys.COMMODITY_ACCURATE_SERVICE_CALL
  );

  const CTC_RATE_DISABLE_KEY = 'CTC_RATE_DISABLE';
  const ARN_DEFAULT_RATING_TYPE_KEY = 'ARN_DEFAULT_RATING_TYPE';

  const getOfficeSetting = (key: string): string | null => {
    const val = deps.loginClientBean?.officeSettingMap?.[key]?.[0];
    return val != null && val !== '' ? val : null;
  };

  const ratingOptions = useMemo(() => {
    const moduleCode = deps.moduleType ?? '';
    const isLotOrFileSetup =
      moduleCode === 'LOT' || moduleCode === 'FILE_SETUP';
    const isArrivalNotice = moduleCode === 'ARN';
    const ctcDisabled =
      getOfficeSetting(CTC_RATE_DISABLE_KEY)?.toUpperCase() === 'Y';

    const options: { label: string; value: string }[] = [
      { label: 'Please select', value: '' },
    ];

    if (!isLotOrFileSetup && !isArrivalNotice) {
      if (!ctcDisabled) {
        options.push({ label: 'Carrier - To - Carrier', value: 'C' });
      }
      options.push({ label: 'For Commodity Tariff', value: 'T' });
    }

    if (!isLotOrFileSetup && isArrivalNotice) {
      options.push({ label: 'Import Rates', value: 'I' });
    }

    options.push({ label: 'Manual Rating', value: 'M' });

    if (!isLotOrFileSetup) {
      options.push({ label: 'GRDB Rates', value: 'G' });
    }

    if (!isLotOrFileSetup && !isArrivalNotice) {
      options.push({ label: 'AccuRate', value: 'A' });
    }

    return options;
  }, [
    deps.moduleType,
    deps.loginClientBean?.officeSettingMap?.[CTC_RATE_DISABLE_KEY],
  ]);

  type TaxEntry = {
    taxCode?: string;
    taxPercent?: string;
    taxText?: string;
    taxDescription?: string;
  };

  const vatOptions = useMemo((): { label: string; value: string }[] => {
    const taxMap = deps.loginClientBean?.taxSettingMap as
      | Record<string, TaxEntry>
      | undefined;
    const options: { label: string; value: string }[] = [];

    if (taxMap) {
      const entries = Object.entries(taxMap);
      if (entries.length >= 2) {
        for (const [key, taxBean] of entries) {
          const label = `${taxBean.taxDescription ?? taxBean.taxText ?? ''}-${taxBean.taxPercent ?? ''}%`;
          options.push({ label, value: `Y~${key}` });
        }
      } else if (entries.length === 1) {
        const [key, taxBean] = entries[0];
        let resolvedKey = key;
        if (
          taxBean.taxCode?.toUpperCase() === 'VAT' &&
          taxBean.taxPercent === '0'
        ) {
          const arVatPct =
            deps.loginClientBean?.officeSettingMap?.['VAT_PERCENTAGE']?.[0];
          if (arVatPct) {
            resolvedKey = `${taxBean.taxCode}^${arVatPct}^${taxBean.taxText ?? ''}`;
          }
        }
        options.push({ label: 'Y-Yes', value: `Y~${resolvedKey}` });
      } else {
        options.push({ label: 'Y-Yes', value: 'Y' });
      }
    } else {
      options.push({ label: 'Y-Yes', value: 'Y' });
    }

    options.push({ label: 'N-No', value: 'N' });
    return options;
  }, [
    deps.loginClientBean?.taxSettingMap,
    deps.loginClientBean?.officeSettingMap,
  ]);

  const updatePlcToggle = (): boolean => {
    return (
      (deps.moduleType === MODULE_BKG &&
        isVisible(CommonToggleKeys.OCEAN_UPDATE_PLC_CHARGE_BKG)) ||
      (deps.moduleType === MODULE_QUO &&
        isVisible(CommonToggleKeys.OCEAN_UPDATE_PLC_CHARGE_QUO)) ||
      (deps.moduleType === MODULE_PREBKG &&
        isVisible(CommonToggleKeys.OCEAN_UPDATE_PLC_CHARGE_BKG))
    );
  };

  const updatePlcCondition = (): boolean => {
    const controllingEntity = deps.customerFormData?.lclForm.controllingEntity;

    const userPermission = isVisible(
      CommonToggleKeys.UPDATE_PLC_CHARGES_BKG_QUO_BOL
    );

    return (
      userPermission ||
      controllingEntity?.toUpperCase() === ORIGIN_CODE ||
      controllingEntity?.toUpperCase() === 'O' ||
      (deps?.moduleType === "QUO" && deps?.mainDetails?.type === "F")
    );
  };

  const [formData, setFormData] = useState<RateDetailsFormData>({
    ratingType: '',
    rateOfExchange: {
      rateOfExchangeType: isDefaultLiveRatesToggle ? 'L' : 'M',
      baseCurrency: '',
      baseRoe: 1,
      roeRows: [
        {
          id: makeRowId(),
          currency: invoiceCurrency,
          localCurrencyROE: '1',
          invoiceCurrencyROE: '1',
          isFile: false,
        },
      ],
    },
    shipmentSummary: {
      billToCustomer: {
        code: deps.customerFormData?.lclForm.customerCode ?? '',
        name: deps.customerFormData?.lclForm.customerCode ?? '',
      },
      placeOfReceipt: {
        code: deps.routingFormData?.placeOfReceiptCode ?? '',
        name: deps.routingFormData?.placeOfReceiptName ?? '',
      },
      portOfLoad: {
        code: deps.routingFormData?.portOfLoadingCode ?? '',
        name: deps.routingFormData?.portOfLoadingName ?? '',
      },
      portOfDischarge: {
        code: deps.routingFormData?.portOfDischargeCode ?? '',
        name: deps.routingFormData?.portOfDischargeName ?? '',
      },
      placeOfDelivery: {
        code: deps.routingFormData?.placeOfDeliveryCode ?? '',
        name: deps.routingFormData?.placeOfDeliveryName ?? '',
      },
      placeOfDeconsolidation: {
        code: deps.routingFormData?.placeOfDeliveryCode ?? '',
        name: deps.routingFormData?.placeOfDeliveryName ?? '',
      },
    },
    charges: {
      rateDetails: [],
      deletedRateDetails: [],
    },
    totals: {
      incomeData: null,
      expenseData: null,
      invoiceCurrency: '',
    },
    toogleButtons: {
      isPickupExpanded: true,
      isExpandShipmentSummaryDetailsActive: false,
      isExpandRateOfExchangeActive: false,
      isPrintPlcConfirmationActive: false,
      isExpandChargeDetailsActive: false,
      isModifyRatesActive: false,
    },
  });

  const showPickupSection =
    deps.routingFormData?.pickupNeeded === 'Y' ||
    deps.routingFormData?.pickupNeeded === 'T';
  const showDoorDeliverySection =
    deps.routingFormData?.terms === 'CFDR' ||
    deps.routingFormData?.terms === 'DRCF' ||
    deps.routingFormData?.terms === 'DRDR';

  const isMounted = useRef(false);
  useEffect(() => {
    isMounted.current = true;
  }, []);

  const suppressRatingTypePopulateRef = useRef(false);

  useEffect(() => {
    if (!isMounted.current) return;
    setFormData((prev) => {
      const isPTC = (r: BookingQuoteChargeBeanFull) =>
        r.incomeChargeDetails?.chargeType === 'FOB' && (r.truckChargeGroup ?? '') === 'PTC';

      if (showPickupSection) {
        const hasPTC = prev.charges.rateDetails.some(isPTC);
        if (hasPTC) return prev;
        return {
          ...prev,
          charges: {
            ...prev.charges,
            rateDetails: [...prev.charges.rateDetails, createBlankBeanRow('PTC', localCurrency)],
          },
        };
      } else {
        const hasPTC = prev.charges.rateDetails.some(isPTC);
        if (!hasPTC) return prev;
        return {
          ...prev,
          charges: {
            ...prev.charges,
            rateDetails: prev.charges.rateDetails.filter((r) => !isPTC(r)),
          },
        };
      }
    });
  }, [showPickupSection]);

  useEffect(() => {
    if (!isMounted.current) return;
    setFormData((prev) => {
      const isDTC = (r: BookingQuoteChargeBeanFull) =>
        r.incomeChargeDetails?.chargeType === 'PLC' && (r.truckChargeGroup ?? '') === 'DTC';

      if (showDoorDeliverySection) {
        const hasDTC = prev.charges.rateDetails.some(isDTC);
        if (hasDTC) return prev;
        return {
          ...prev,
          charges: {
            ...prev.charges,
            rateDetails: [...prev.charges.rateDetails, createBlankBeanRow('DTC', localCurrency)],
          },
        };
      } else {
        const hasDTC = prev.charges.rateDetails.some(isDTC);
        if (!hasDTC) return prev;
        return {
          ...prev,
          charges: {
            ...prev.charges,
            rateDetails: prev.charges.rateDetails.filter((r) => !isDTC(r)),
          },
        };
      }
    });
  }, [showDoorDeliverySection]);

  const chargeCalcKey = useMemo(() => {
    return formData.charges.rateDetails
      .map((row) =>
        [
          row.rowId,
          row.incomeRate,
          row.expenseRate,
          row.incomeBasis,
          row.expenseBasis,
          row.incomeCurrency,
          row.expenseCurrency,
          row.incomeAmount,
          row.expenseAmount,
          row.equipmentDetails
        ].join('|')
      )
      .join(';');
  }, [formData, deps.cargoFormData?.cargoRows]);

  const vatCalcKey = useMemo(() => {
    return formData.charges.rateDetails
      .map((row) =>
        [
          row.incomeChargeDetails.chargeCode,
          row.prepaidCollect,
          row.incomeBasis,
          row.expenseBasis,
          row.incomeCurrency,
          row.expenseCurrency,
          row.incomeRate,
          row.expenseRate,
          row.vatPercent,
          row.incomeVAT,
          row.taxKey,
          row.incomeLocalAmount,
          row.expenseLocalAmount,
          invoiceCurrency,
          row.equipmentDetails,
        ].join('|')
      )
      .join(';');
  }, [formData.charges.rateDetails, invoiceCurrency]);

  const roeKey = useMemo(() => {
    return formData.rateOfExchange.roeRows
      .map(
        (r: RoeRow) =>
          `${r.currency}|${r.invoiceCurrencyROE}|${r.localCurrencyROE}`
      )
      .join(';');
  }, [formData.rateOfExchange.roeRows]);

  const cargoDeps = useMemo(() => {
    return JSON.stringify(
      deps.cargoFormData?.cargoRows?.map((r: any) => ({
        kg: r.kg,
        cbm: r.cbm,
        hazardous: r.hazardous,
        reCalculateTEURate: r.reCalculateTEURate
      }))
    );
  }, [deps.cargoFormData?.cargoRows]);

  const pickupCargoDeps = useMemo(() => {
    return JSON.stringify(deps.pickupCargoMetricsMap);
  }, [deps.pickupCargoMetricsMap]);

  const isSameRows = (
    a: BookingQuoteChargeBeanFull[],
    b: BookingQuoteChargeBeanFull[]
  ) => {
    if (a.length !== b.length) return false;
    return a.every((row, i) => {
      const r = b[i];
      return (
        row.rowId === r.rowId &&
        row.isVatBean === r.isVatBean &&
        row.vatPercent === r.vatPercent &&
        row.incomeAmount === r.incomeAmount &&
        row.incomeLocalAmount === r.incomeLocalAmount
      );
    });
  };

  const { data: liveRateData, execute: executeRoeFetch } = useApi<
    GetCurrencyConversionRateRequest,
    GetCurrencyConversionRateResponse
  >({
    endpoint: COMMON_ENDPOINTS.RATE_DETAILS.GET_CURRENCY_CONVERSION_RATE,
    onError: (err) => {
      console.error('Failed to fetch live ROE rates:', err.message);
    },
  });

  const {
    data: formulaDataDetailed,
    execute: executeFormulaDataDetailedFetch,
  } = useApi<GetRateCalcWithFormulaRequest, GetRateCalcWithFormulaResponse>({
    endpoint: COMMON_ENDPOINTS.RATE_DETAILS.GET_RATE_CALC_WITH_FORMULA,
    onError: (err) => {
      console.error('Failed to fetch rate formula data:', err.message);
    },
  });

  const { isLoading, error, accurateRateData, handleAccurateRate: _handleAccurateRate } =
    useAccurateRate({
      loginClientBean: deps?.loginClientBean ?? null,
      mainDetails: deps?.mainDetails as any,
      dataRef: deps.dataRef,
      moduleType: deps.moduleType,
    });

  const handleAccurateRate = useCallback(
    async (
      overrides?: { rateDetails?: Record<string, unknown>; routingDetails?: Record<string, unknown> },
      onValidationFail?: (field: 'PREPAID_COLLECT' | 'CONTROLLING_ENTITY') => void,
      onDefaultRatesFetched?: () => void,
    ) => {
      if (isAccurateServiceOpenRef.current) return;
      isAccurateServiceOpenRef.current = true;
      try {
        await _handleAccurateRate(overrides, onValidationFail, onDefaultRatesFetched);
      } finally {
        isAccurateServiceOpenRef.current = false;
      }
    },
    [_handleAccurateRate]
  );

  useEffect(() => {
    if(deps.loginClientBean?.localCurrency){
      setLocalCurrency(deps.loginClientBean?.localCurrency)
      setInvoiceCurrency(deps.loginClientBean?.localCurrency)
    }
  }, [deps.loginClientBean]);

  useEffect(() => {
    executeRoeFetch({
      schemaName: deps.loginClientBean?.schema ?? '',
      company: deps.loginClientBean?.company ?? '',
      localCurrency: deps.loginClientBean?.localCurrency ?? '',
    });
    executeFormulaDataDetailedFetch({});
  }, [deps.loginClientBean?.schema, deps.loginClientBean?.company, deps.loginClientBean?.localCurrency]);

  useEffect(() => {
    updateAmountInLocalOrInvoiceCurrency();
  }, [chargeCalcKey, roeKey, invoiceCurrency]);

  useEffect(() => {
    const vatCalculate = isVisible(OceanToggleKeys.VAT_CALCULATE);
    if (vatCalculate) setIsVATEnable(vatCalculate);
  }, [isVisible(OceanToggleKeys.VAT_CALCULATE)]);

  useEffect(() => {
    if (!isVATEnable) return;
    setFormData((prev: RateDetailsFormData) => {
      const rows = prev.charges.rateDetails;
      const updated = computeVatRows(rows);
      if (isSameRows(rows, updated)) return prev;
      return { ...prev, charges: { ...prev.charges, rateDetails: updated } };
    });
  }, [vatCalcKey, isVATEnable]);

  const addRemovePlcBlankRow = () => {
    if (!updatePlcToggle()) return;
    setFormData((prev) => {
      const plcRows = prev.charges.rateDetails.filter(
        (r) =>
          r.incomeChargeDetails?.chargeType === 'PLC' &&
          r.truckChargeGroup !== 'DTC'
      );

      let updatedRows: BookingQuoteChargeBeanFull[];

      if (updatePlcCondition()) {
        if (plcRows.length === 0) {
          updatedRows = [
            ...prev.charges.rateDetails,
            createBlankBeanRow('PLC', localCurrency),
          ];
        } else {
          return prev;
        }
      } else {
        updatedRows = prev.charges.rateDetails.filter(
          (r) =>
            !(
              r.incomeChargeDetails?.chargeType === 'PLC' &&
              r.truckChargeGroup !== 'DTC' &&
              !r.incomeChargeDetails?.chargeCode?.trim()
            )
        );
      }

      return {
        ...prev,
        charges: { ...prev.charges, rateDetails: updatedRows },
      };
    });
  };

  useEffect(() => {
   if(!(deps?.moduleType === "QUO" && deps?.mainDetails?.type === "F" && deps?.mainDetails?.referenceNumber > 0))
    {
      addRemovePlcBlankRow();
    }
  }, [
    deps.customerFormData?.lclForm.controllingEntity,
    deps.customerFormData?.lclForm.rateControllingEntity,
    deps?.mainDetails?.type
  ]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      shipmentSummary: {
        ...prev.shipmentSummary,
        billToCustomer: {
          code: deps.customerFormData?.lclForm.customerCode ?? '',
          name:
            deps.customerFormData?.lclForm.customerName?.split('\n')[0] ?? '',
        },
        placeOfReceipt: {
          code: deps.routingFormData?.placeOfReceiptCode ?? '',
          name: deps.routingFormData?.placeOfReceiptName ?? '',
        },
        portOfLoad: {
          code: deps.routingFormData?.portOfLoadingCode ?? '',
          name: deps.routingFormData?.portOfLoadingName ?? '',
        },
        portOfDischarge: {
          code: deps.routingFormData?.portOfDischargeCode ?? '',
          name: deps.routingFormData?.portOfDischargeName ?? '',
        },
        placeOfDelivery: {
          code: deps.routingFormData?.placeOfDeliveryCode ?? '',
          name: deps.routingFormData?.placeOfDeliveryName ?? '',
        },
        placeOfDeconsolidation: {
          code: deps.routingFormData?.placeOfDeliveryCode ?? '',
          name: deps.routingFormData?.placeOfDeliveryName ?? '',
        },
      },
    }));
  }, [
    deps.customerFormData?.lclForm.customerCode,
    deps.customerFormData?.lclForm.customerName,
    deps.routingFormData?.placeOfReceiptCode,
    deps.routingFormData?.placeOfReceiptName,
    deps.routingFormData?.portOfLoadingCode,
    deps.routingFormData?.portOfLoadingName,
    deps.routingFormData?.portOfDischargeCode,
    deps.routingFormData?.portOfDischargeName,
    deps.routingFormData?.placeOfDeliveryCode,
    deps.routingFormData?.placeOfDeliveryName,
  ]);

  useEffect(() => {
    const newPrepaidCollect = deps.customerFormData?.lclForm?.prepaidCollect;
    if (!newPrepaidCollect) return;
    setFormData((prev: RateDetailsFormData) => {
      const updatedRows = prev.charges.rateDetails.map(
        (row: BookingQuoteChargeBeanFull) => {
          const chargeType = row.incomeChargeDetails?.chargeType;
          if (chargeType !== 'FOB' && chargeType !== 'OFR') return row;
          if (row.prepaidCollect === newPrepaidCollect) return row;
          return { ...row, prepaidCollect: newPrepaidCollect };
        }
      );
      return {
        ...prev,
        charges: { ...prev.charges, rateDetails: updatedRows },
      };
    });
  }, [deps.customerFormData?.lclForm?.prepaidCollect]);

  const findDuplicateCharge = (
    rows: BookingQuoteChargeBeanFull[]
  ): { chargeCode: string; rowIdToRemove: string } | null => {
    for (let i = 0; i < rows.length; i++) {
      for (let j = i + 1; j < rows.length; j++) {
        const a = rows[i];
        const b = rows[j];
        const codeA = a.incomeChargeDetails?.chargeCode?.trim();
        const codeB = b.incomeChargeDetails?.chargeCode?.trim();
        if (
          codeA &&
          codeA === codeB &&
          a.incomeChargeDetails?.chargeType ===
            b.incomeChargeDetails?.chargeType &&
          a.truckChargeGroup === b.truckChargeGroup &&
          a.incomeBasis !== b.incomeBasis
        ) {
          const rowIdToRemove =
            (a.incomeAmount ?? 0) <= (b.incomeAmount ?? 0) ? a.rowId : b.rowId;
          return { chargeCode: codeA, rowIdToRemove };
        }
      }
    }
    return null;
  };

  useEffect(() => {
    if (!accurateRateData) return;

    const beanList: AccurateRateDetailBean[] = accurateRateData?.rateDetailBeans ?? [];
    const chargeDescEnglish: Record<string, string> =
      accurateRateData?.chargeDescEnglish ?? {};

    const isInvoiceCurrencyActive =
      deps.moduleType === 'QUO'
        ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_QUOTE)
        : deps.moduleType === 'BKG'
          ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_OCEAN_BOOKING)
          : false;

    const rates = liveRateData?.result ?? {};
    const invoiceRate = rates[invoiceCurrency] ?? 1;
    const localRate = rates[localCurrency] ?? 1;

    const nonAccurateRows = formData.charges.rateDetails.filter(
      (r: BookingQuoteChargeBeanFull) => r.relayFlag !== 'A'
    );

    const allCurrencies = Array.from(
      new Set(
        [
          localCurrency,
          invoiceCurrency,
          ...nonAccurateRows.flatMap((r: BookingQuoteChargeBeanFull) =>
            [r.incomeCurrency, r.expenseCurrency].filter(Boolean)
          ),
          ...beanList
            .filter(Boolean)
            .flatMap((bean: any) => [bean.currencyCode].filter(Boolean)),
        ].filter(Boolean)
      )
    );

    const newRoeRows: RoeRow[] = allCurrencies.map((currency) => {
      const currencyRate = rates[currency] ?? 1;
      const localROE = localRate !== 0 ? currencyRate / localRate : 0;
      const invoiceROE = invoiceRate !== 0 ? currencyRate / invoiceRate : 0;
      return {
        id: makeRowId(),
        currency,
        localCurrencyROE: formatSixDecimals(localROE),
        invoiceCurrencyROE: formatSixDecimals(invoiceROE),
      };
    });

    const getRoe = (currency: string): number => {
      const entry = newRoeRows.find(
        (r) => r.currency?.toUpperCase() === currency?.toUpperCase()
      );
      return Number(entry?.invoiceCurrencyROE ?? 0);
    };

    const filteredBeans = beanList.filter(Boolean);
    const accurateRows: BookingQuoteChargeBeanFull[] = [];
    for (let i = 0; i < filteredBeans.length; i++) {
      const baseRow = mapAccurateRateDetailBeanToRow(
        filteredBeans[i],
        chargeDescEnglish,
        i
      );
      const incomeAmount = Math.max(
        calculateAmountForRows(baseRow.incomeBasis, baseRow.incomeRate, accurateRows),
        baseRow.incomeMinimumRate ?? 0
      );
      const expenseAmount = Math.max(
        calculateAmountForRows(baseRow.expenseBasis, baseRow.expenseRate, accurateRows),
        baseRow.expenseMinimumRate ?? 0
      );
      const incomeSellROE = getRoe(baseRow.incomeCurrency);
      const expenseSellROE = getRoe(baseRow.expenseCurrency);
      const incomeLocalAmount = incomeAmount * incomeSellROE;
      const expenseLocalAmount = expenseAmount * expenseSellROE;
      accurateRows.push({
        ...baseRow,
        incomeAmount,
        expenseAmount,
        incomeLocalAmount,
        expenseLocalAmount,
        incomeMinimumRate: baseRow.incomeMinimumRate ,
        expenseMinimumRate: baseRow.expenseMinimumRate,
        ...(isInvoiceCurrencyActive
          ? {
              invoiceSellAmount: incomeLocalAmount,
              invoiceExpenseAmount: expenseLocalAmount,
              invoiceCurrency: invoiceCurrency,
              invoiceSellRateOfExchange: incomeSellROE,
              invoiceExpenseRateOfExchange: expenseSellROE,
            }
          : {}),
      });
    }

    const isOFR    = (r: BookingQuoteChargeBeanFull) => r.incomeChargeDetails?.chargeType === 'OFR';
    const isFOB    = (r: BookingQuoteChargeBeanFull) => r.incomeChargeDetails?.chargeType === 'FOB' && (r.truckChargeGroup ?? '') !== 'PTC';
    const isPickup = (r: BookingQuoteChargeBeanFull) => r.incomeChargeDetails?.chargeType === 'FOB' && (r.truckChargeGroup ?? '') === 'PTC';
    const isPLC    = (r: BookingQuoteChargeBeanFull) => r.incomeChargeDetails?.chargeType === 'PLC' && (r.truckChargeGroup ?? '') !== 'DTC';
    const isDTC    = (r: BookingQuoteChargeBeanFull) => r.incomeChargeDetails?.chargeType === 'PLC' && (r.truckChargeGroup ?? '') === 'DTC';

    const accurateHasOFR    = accurateRows.some(isOFR);
    const accurateHasFOB    = accurateRows.some(isFOB);
    const accurateHasPickup = accurateRows.some(isPickup);
    const accurateHasPLC    = accurateRows.some(isPLC);
    const accurateHasDTC    = accurateRows.some(isDTC);

    const isBlank = (r: BookingQuoteChargeBeanFull) => !r.incomeChargeDetails?.chargeCode?.trim();
    const filteredNonAccurate = nonAccurateRows.filter((r) => {
      if (isOFR(r)    && accurateHasOFR    && isBlank(r)) return false;
      if (isFOB(r)    && accurateHasFOB    && isBlank(r)) return false;
      if (isPickup(r) && accurateHasPickup && isBlank(r)) return false;
      if (isPLC(r)    && accurateHasPLC    && isBlank(r)) return false;
      if (isDTC(r)    && accurateHasDTC    && isBlank(r)) return false;
      return true;
    });

    let mergedRows: BookingQuoteChargeBeanFull[] = [...filteredNonAccurate, ...accurateRows];

    const hasSection = (rows: BookingQuoteChargeBeanFull[], matcher: (r: BookingQuoteChargeBeanFull) => boolean): boolean =>
      rows.some((r: BookingQuoteChargeBeanFull) => matcher(r));

    if (!hasSection(mergedRows, isOFR)) {
      mergedRows = [...mergedRows, createBlankBeanRow('OFR', localCurrency)];
    }
    if (!hasSection(mergedRows, isFOB)) {
      mergedRows = [...mergedRows, createBlankBeanRow('FOB', localCurrency)];
    }

    if (showPickupSection && !hasSection(mergedRows, isPickup)) {
      mergedRows = [...mergedRows, createBlankBeanRow('PTC', localCurrency)];
    }

    if (updatePlcCondition() && !hasSection(mergedRows, isPLC)) {
      mergedRows = [...mergedRows, createBlankBeanRow('PLC', localCurrency)];
    }

    if (showDoorDeliverySection && !hasSection(mergedRows, isDTC)) {
      mergedRows = [...mergedRows, createBlankBeanRow('DTC', localCurrency)];
    }

    const duplicate = findDuplicateCharge(mergedRows);
    if (duplicate) {
      setDuplicateChargeDialog({
        open: true,
        chargeCode: duplicate.chargeCode,
        pendingRows: mergedRows,
        pendingRoeRows: newRoeRows,
        rowIdToRemove: duplicate.rowIdToRemove,
      });
      return;
    }

    setIsAccuRatePopulated(true);

    setFormData((prev) => {
      const evictedAccurateRows = prev.charges.rateDetails
        .filter(
          (r: BookingQuoteChargeBeanFull) =>
            r.relayFlag === 'A' &&
            !!r.incomeChargeDetails?.chargeCode?.trim() &&
            !!r.bookingRateId?.trim()
        )
        .map((r: BookingQuoteChargeBeanFull) => ({ ...r, transactionalFlag: 'D' as const }));

      return {
        ...prev,
        ratingType: prev.ratingType,
        rateOfExchange: {
          ...prev.rateOfExchange,
          baseCurrency: localCurrency,
          baseRoe: 1,
          rateOfExchangeType: 'L',
          roeRows: newRoeRows,
        },
        charges: {
          rateDetails: mergedRows,
          deletedRateDetails: [
            ...prev.charges.deletedRateDetails,
            ...evictedAccurateRows,
          ],
        },
      };
    });
  }, [accurateRateData]);

  const triggerAccurateOrConfirm = useCallback(() => {
    if (!isAccuRatePopulated) {
    handleAccurateRate();
      return;
    }
    if (shouldCallAccurateRef.current === true) {
    handleAccurateRate();
    } else if (shouldCallAccurateRef.current === null) {
      setIsAccurateConfirmDialogOpen(true);
    }
  }, [isAccuRatePopulated, handleAccurateRate]);

  const detailedFormulaMap = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(formulaDataDetailed?.result ?? {}).map(
          ([key, entry]) => [
            key,
            {
              formula: (entry as any).formula ?? '',
              weightFormular: (entry as any).weightFormular,
              cubeFormular: (entry as any).cubeFormular,
              description: (entry as any).description,
            },
          ]
        )
      ),
    [formulaDataDetailed]
  );

  const rateUtil = useMemo(
    () => new RateBasisUtility(detailedFormulaMap),
    [detailedFormulaMap]
  );

  const handleROEFieldsChange = (
    key: keyof RateDetailsFormData['rateOfExchange'],
    value: any
  ) => {
    setFormData((prev) => ({
      ...prev,
      rateOfExchange: { ...prev.rateOfExchange, [key]: value },
    }));
  };

  const enforceRoeOrder = (rows: RoeRow[]): RoeRow[] => {
    const localRow = rows.find(
      (r) => r.currency?.toUpperCase() === localCurrency?.toUpperCase()
    );
    const invoiceRow =
      invoiceCurrency &&
      invoiceCurrency.toUpperCase() !== localCurrency?.toUpperCase()
        ? rows.find(
            (r) => r.currency?.toUpperCase() === invoiceCurrency.toUpperCase()
          )
        : undefined;
    const rest = rows.filter((r) => r !== localRow && r !== invoiceRow);
    return [
      ...(localRow ? [localRow] : []),
      ...(invoiceRow ? [invoiceRow] : []),
      ...rest,
    ];
  };

  const handleROERowsChange = (roeRows: RoeRow[]) => {
    const ordered = enforceRoeOrder(roeRows);
    setFormData((prev) => ({
      ...prev,
      rateOfExchange: { ...prev.rateOfExchange, roeRows: ordered },
    }));
  };

  const handleRateDetailsChargesChange = (
    rows: BookingQuoteChargeBeanFull[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      charges: { ...prev.charges, rateDetails: rows },
    }));
  };

  const handleRateDetailsChargesPopulate = (
    rows: BookingQuoteChargeBeanFull[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      charges: { rateDetails: rows, deletedRateDetails: [] },
    }));
  };

  const evictPersistedChargesToDeleted = (rows: BookingQuoteChargeBeanFull[]) => {
    const toDelete = rows.filter(
      (r) =>
        !!r.incomeChargeDetails?.chargeCode?.trim() &&
        !!r.bookingRateId?.trim()
    ).map((r) => ({ ...r, transactionalFlag: 'D' as const }));

    if (toDelete.length === 0) return;

    setFormData((prev) => ({
      ...prev,
      charges: {
        ...prev.charges,
        deletedRateDetails: [
          ...prev.charges.deletedRateDetails,
          ...toDelete,
        ],
      },
    }));
  };

  const handleToggleButtonChange = (
    key: keyof RateDetailsFormData['toogleButtons'],
    value: boolean
  ) => {
    setFormData((prev) => {
      const newToggles = { ...prev.toogleButtons, [key]: value };

      if (key !== 'isModifyRatesActive') {
        return { ...prev, toogleButtons: newToggles };
      }

      const isNowActive = value;
      const moduleType = deps.moduleType ?? '';
      const mainDetails = deps.mainDetails as any;
      let rateDetails = prev.charges.rateDetails;

      if (isVisible(OceanToggleKeys.STANDALONE_QUOTE_RATE)) {
        const truckQuote = mainDetails?.bookingQuoteMain?.truckQuote as
          | string
          | undefined;
        const isFCLQuote: boolean = mainDetails?.isFCLQuote ?? false;
        const isQuoteWithTruck = moduleType === 'QUO' && truckQuote === 'Y';
        const isBooking = moduleType === 'BKG';

        const hasTruckingRows = rateDetails.some(
          (r: BookingQuoteChargeBeanFull) =>
            r.truckChargeGroup === 'PTC' || r.truckChargeGroup === 'DTC'
        );

        if ((isQuoteWithTruck || isBooking) && !isFCLQuote && hasTruckingRows) {
          rateDetails = rateDetails.map((r: BookingQuoteChargeBeanFull) => {
            if (r.truckChargeGroup !== 'PTC' && r.truckChargeGroup !== 'DTC')
              return r;
            return { ...r, isEnableForEdit: isNowActive };
          });
        }
      }

      if (
        isVisible(CommonToggleKeys.COMMON_EXPENSE_STACK) &&
        isVisible(CommonToggleKeys.INTERMODAL_BUY_RATE) &&
        isVisible(CommonToggleKeys.INTERMODAL_FILE_EXPENSE_RATES) &&
        !prev.ratingType &&
        moduleType === 'FILE_SETUP'
      ) {
        newToggles.isModifyRatesActive = false;
        rateDetails = rateDetails.map((r: BookingQuoteChargeBeanFull) => ({
          ...r,
          isEnableForEdit: false,
        }));
      }

      return {
        ...prev,
        toogleButtons: newToggles,
        charges: { ...prev.charges, rateDetails },
      };
    });
  };

  const calculateAmountForRows = (
    basis: string,
    rate: number,
    rows: BookingQuoteChargeBeanFull[],
    updatedRow?: BookingQuoteChargeBeanFull
  ): number => {
    if (!rateUtil) return 0;

    const ofrTotal = rows
      .filter(
        (r) => r.incomeChargeDetails?.chargeType === 'OFR' && !r.isVatBean
      )
      .reduce((sum, r) => sum + (r.incomeAmount ?? 0), 0);
    const inlTotal = rows
      .filter(
        (r) => r.incomeChargeDetails?.chargeType === 'FOB' && !r.isVatBean
      )
      .reduce((sum, r) => sum + (r.incomeAmount ?? 0), 0);
    const dlcTotal = rows
      .filter(
        (r) =>
          ['PLC', 'DTC'].includes(r.incomeChargeDetails?.chargeType ?? '') &&
          !r.isVatBean
      )
      .reduce((sum, r) => sum + (r.incomeAmount ?? 0), 0);

    return rateUtil.calculate({
      basis,
      uom: getUOM(),
      rate,
      moduleType: getModuleType(),
      weight: getTotalWeight(),
      cube: getTotalCube(),
      pieces: getPiecesForBasis(basis, updatedRow),
      totalTEU: (deps.teu as number) ?? 0,
      ofrAmount: ofrTotal,
      inlAmount: inlTotal,
      dlcAmount: dlcTotal,
    });
  };

  const calculateAmountOnFieldChange = (basis: string, rate: number, updatedRow: BookingQuoteChargeBeanFull): number =>
    calculateAmountForRows(basis, rate, formData.charges.rateDetails ?? [], updatedRow);

  const calculateAmountForPickupRows = (
    basis: string,
    rate: number,
    rows: BookingQuoteChargeBeanFull[],
    metrics: CargoMetrics
  ): number => {
    if (!rateUtil) return 0;
    const ofrTotal = rows.filter(r => r.incomeChargeDetails?.chargeType === 'OFR' && !r.isVatBean)
        .reduce((s, r) => s + (r.incomeAmount ?? 0), 0);
    const inlTotal = rows.filter(r => r.incomeChargeDetails?.chargeType === 'FOB' && !r.isVatBean)
        .reduce((s, r) => s + (r.incomeAmount ?? 0), 0);
    const dlcTotal = rows.filter(r => ['PLC','DTC'].includes(r.incomeChargeDetails?.chargeType ?? '') && !r.isVatBean)
        .reduce((s, r) => s + (r.incomeAmount ?? 0), 0);
    return rateUtil.calculate({
        basis, uom: getUOM(), rate, moduleType: getModuleType(),
        weight:  metrics.weight  ?? 0,
        cube:    metrics.cube    ?? 0,
        pieces:  metrics.pieces  ?? 0,
        ofrAmount: ofrTotal, inlAmount: inlTotal, dlcAmount: dlcTotal,
    });
  };

  useEffect(() => {
    if (!isMounted.current) return;
    if (!rateUtil) return;

    const isInvoiceCurrencyActive =
      deps.moduleType === 'QUO'
        ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_QUOTE)
        : deps.moduleType === 'BKG'
          ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_OCEAN_BOOKING)
          : false;

    setFormData((prev: RateDetailsFormData) => {
      if (prev.ratingType === 'A') return prev;
      if (!prev.charges.rateDetails.length) return prev;

      let hasChanged = false;
      const updatedRows = prev.charges.rateDetails.map(
        (
          row: BookingQuoteChargeBeanFull,
          _idx: number,
          allRows: BookingQuoteChargeBeanFull[]
        ) => {
          if (row.isVatBean) return row;
          const incomeAmount = Math.max(
            calculateAmountForRows(row.incomeBasis, row.incomeRate, allRows, row),
            row.incomeMinimumRate ?? 0
          );
          const expenseAmount = Math.max(
            calculateAmountForRows(row.expenseBasis, row.expenseRate, allRows, row),
            row.expenseMinimumRate ?? 0
          );
          const incomeRoeEntry = prev.rateOfExchange.roeRows.find(
            (r: RoeRow) =>
              r.currency?.toUpperCase() === row.incomeCurrency?.toUpperCase()
          );
          const expenseRoeEntry = prev.rateOfExchange.roeRows.find(
            (r: RoeRow) =>
              r.currency?.toUpperCase() === row.expenseCurrency?.toUpperCase()
          );
          const incomeROE = Number(
            isInvoiceCurrencyActive
              ? (incomeRoeEntry?.invoiceCurrencyROE ?? 0)
              : (incomeRoeEntry?.localCurrencyROE ?? 0)
          );
          const expenseROE = Number(
            isInvoiceCurrencyActive
              ? (expenseRoeEntry?.invoiceCurrencyROE ?? 0)
              : (expenseRoeEntry?.localCurrencyROE ?? 0)
          );
          const incomeLocalAmount = incomeAmount * incomeROE;
          const expenseLocalAmount = expenseAmount * expenseROE;
          if (
            row.incomeAmount === incomeAmount &&
            row.expenseAmount === expenseAmount &&
            row.incomeLocalAmount === incomeLocalAmount &&
            row.expenseLocalAmount === expenseLocalAmount
          ) {
            return row;
          }
          hasChanged = true;
          return {
            ...row,
            incomeAmount,
            expenseAmount,
            incomeLocalAmount,
            expenseLocalAmount,
            incomeROE,
            expenseROE,
            ...(isInvoiceCurrencyActive
              ? {
                  invoiceSellAmount: incomeLocalAmount,
                  invoiceExpenseAmount: expenseLocalAmount,
                  invoiceSellRateOfExchange: incomeROE,
                  invoiceExpenseRateOfExchange: expenseROE,
                }
              : {}),
          };
        }
      );

      if (!hasChanged) return prev;
      return {
        ...prev,
        charges: { ...prev.charges, rateDetails: updatedRows },
      };
    });
  }, [cargoDeps, rateUtil]);

  useEffect(() => {
    if (!isMounted.current) return;
    if (!rateUtil) return;
    const metricsMap = deps.pickupCargoMetricsMap;
    if (!metricsMap || Object.keys(metricsMap).length === 0) return;

    const isInvoiceCurrencyActive =
      deps.moduleType === 'QUO'
        ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_QUOTE)
        : deps.moduleType === 'BKG'
          ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_OCEAN_BOOKING)
          : false;

    setFormData((prev: RateDetailsFormData) => {
      if (prev.ratingType === 'A') return prev;
      const hasPtc = prev.charges.rateDetails.some(r => r.truckChargeGroup === 'PTC');
      if (!hasPtc) return prev;

      let hasChanged = false;
      const updatedRows = prev.charges.rateDetails.map(
        (row: BookingQuoteChargeBeanFull, _idx: number, allRows: BookingQuoteChargeBeanFull[]) => {
          if (row.truckChargeGroup !== 'PTC') return row;
          if (row.isVatBean) return row;

          const metrics = metricsMap[row.pickupId ?? ''] ?? Object.values(metricsMap)[0];
          if (!metrics) return row;

          const incomeAmount = Math.max(
            calculateAmountForPickupRows(row.incomeBasis, row.incomeRate, allRows, metrics),
            row.incomeMinimumRate ?? 0
          );
          const expenseAmount = Math.max(
            calculateAmountForPickupRows(row.expenseBasis, row.expenseRate, allRows, metrics),
            row.expenseMinimumRate ?? 0
          );
          const incomeRoeEntry = prev.rateOfExchange.roeRows.find(
            (r: RoeRow) => r.currency?.toUpperCase() === row.incomeCurrency?.toUpperCase()
          );
          const expenseRoeEntry = prev.rateOfExchange.roeRows.find(
            (r: RoeRow) => r.currency?.toUpperCase() === row.expenseCurrency?.toUpperCase()
          );
          const incomeROE = Number(
            isInvoiceCurrencyActive
              ? (incomeRoeEntry?.invoiceCurrencyROE ?? 0)
              : (incomeRoeEntry?.localCurrencyROE ?? 0)
          );
          const expenseROE = Number(
            isInvoiceCurrencyActive
              ? (expenseRoeEntry?.invoiceCurrencyROE ?? 0)
              : (expenseRoeEntry?.localCurrencyROE ?? 0)
          );
          const incomeLocalAmount = incomeAmount * incomeROE;
          const expenseLocalAmount = expenseAmount * expenseROE;

          if (
            row.incomeAmount === incomeAmount &&
            row.expenseAmount === expenseAmount &&
            row.incomeLocalAmount === incomeLocalAmount &&
            row.expenseLocalAmount === expenseLocalAmount
          ) return row;

          hasChanged = true;
          return {
            ...row,
            incomeAmount,
            expenseAmount,
            incomeLocalAmount,
            expenseLocalAmount,
            incomeROE,
            expenseROE,
          };
        }
      );

      if (!hasChanged) return prev;
      return { ...prev, charges: { ...prev.charges, rateDetails: updatedRows } };
    });
  }, [pickupCargoDeps, rateUtil]);

  const handleRoeTypeChange = (type: string) => {
    setFormData((prev) => {
      let updatedRows = prev.rateOfExchange.roeRows;
      if (type === 'L') {
        const rates = liveRateData?.result ?? {};
        const invoiceRate = rates[invoiceCurrency] ?? 1;
        const localRate = rates[localCurrency] ?? 1;
        updatedRows = updatedRows.map((row) => {
          const currencyRate = rates[row.currency] ?? 1;
          const localROE = currencyRate != 0 ? currencyRate / localRate : 0;
          const invoiceROE = invoiceRate !== 0 ? currencyRate / invoiceRate : 0;
          return {
            ...row,
            localCurrencyROE: formatSixDecimals(localROE),
            invoiceCurrencyROE: formatSixDecimals(invoiceROE),
          };
        });
      }
      return {
        ...prev,
        rateOfExchange: {
          ...prev.rateOfExchange,
          rateOfExchangeType: type,
          roeRows: updatedRows,
        },
      };
    });
  };

  const handleChargeRowUpdate = (
    id: string,
    isIncome: boolean,
    patch: Partial<BookingQuoteChargeBeanFull>
  ) => {
    const row = formData.charges.rateDetails.find((r) => r.rowId === id);
    if (!row) return;

    let normalizedPatch = { ...patch };

    if ('incomeBasis' in patch) {
      normalizedPatch.incomeRate = patch.incomeRate ?? row.incomeRate ?? 0;
    }
    if ('expenseBasis' in patch) {
      normalizedPatch.expenseRate = patch.expenseRate ?? row.expenseRate ?? 0;
    }
    if ('incomeVAT' in normalizedPatch) {
      if (normalizedPatch.incomeVAT === 'Y' && normalizedPatch.vatPercent) {
        const taxMap = deps.loginClientBean?.taxSettingMap ?? {};
        const matchedKey = Object.keys(taxMap).find(
          (key) =>
            taxMap[key].taxPercent === normalizedPatch.vatPercent &&
            taxMap[key].applyFor === 'AR'
        );
        if (matchedKey) {
          const taxInfo = taxMap[matchedKey];
          normalizedPatch.taxKey = matchedKey;
          normalizedPatch.taxCode = taxInfo.taxCode ?? '';
          normalizedPatch.taxText = taxInfo.taxText ?? '';
          normalizedPatch.applyFor = taxInfo.applyFor ?? 'AR';
          normalizedPatch.glCode = taxInfo.glCode ?? '';
        }
      } else if (normalizedPatch.incomeVAT === 'N') {
        normalizedPatch.taxKey = '';
        normalizedPatch.taxCode = '';
        normalizedPatch.taxText = '';
      }
    }

    const updatedRow = { ...row, ...normalizedPatch };
    const rawAmount = calculateAmountOnFieldChange(
      isIncome ? updatedRow.incomeBasis : updatedRow.expenseBasis,
      isIncome ? updatedRow.incomeRate : updatedRow.expenseRate,
      updatedRow
    );

    const isAccurateRow = updatedRow.relayFlag === 'A';
    let amount: number;
    if (isAccurateRow) {
      const minimumRate = isIncome
        ? (updatedRow.incomeMinimumRate ?? 0)
        : (updatedRow.expenseMinimumRate ?? 0);
      amount = Math.max(rawAmount, minimumRate);
    } else {
      if (isIncome) {
        const newMinimum = 'incomeMinimumRate' in normalizedPatch
          ? (normalizedPatch.incomeMinimumRate ?? updatedRow.incomeRate ?? 0)
          : (updatedRow.incomeMinimumRate ?? updatedRow.incomeRate ?? 0);
        normalizedPatch.incomeMinimumRate = newMinimum;
        amount = Math.max(rawAmount, newMinimum);
      } else {
        normalizedPatch.expenseMinimumRate = updatedRow.expenseRate ?? 0;
        amount = rawAmount;
      }
    }

    const pending = pendingRoeRowRef.current;
    pendingRoeRowRef.current = null;

    const isInvoiceCurrencyToggle =
      deps.moduleType === 'QUO'
        ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_QUOTE)
        : deps.moduleType === 'BKG'
          ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_OCEAN_BOOKING)
          : false;

    const getRoe = (currency: string): number => {
      const rows = formData.rateOfExchange.roeRows;
      const entry =
        rows.find(
          (r) => r.currency?.toUpperCase() === currency?.toUpperCase()
        ) ??
        (pending?.currency?.toUpperCase() === currency?.toUpperCase()
          ? pending
          : undefined);
      return Number(
        isInvoiceCurrencyToggle
          ? (entry?.invoiceCurrencyROE ?? 0)
          : (entry?.localCurrencyROE ?? 0)
      );
    };

    const incomeROEValue = getRoe(updatedRow.incomeCurrency);
    const expenseROEValue = getRoe(updatedRow.expenseCurrency);

    const effectiveIncomeAmount = isIncome
      ? amount
      : (updatedRow.incomeAmount ?? 0);
    const effectiveExpenseAmount = isIncome
      ? (updatedRow.expenseAmount ?? 0)
      : amount;
    const incomeLocalAmount = effectiveIncomeAmount * incomeROEValue;
    const expenseLocalAmount = effectiveExpenseAmount * expenseROEValue;

    const computedPatch: Partial<BookingQuoteChargeBeanFull> = {
      ...normalizedPatch,
      ...(isIncome ? { incomeAmount: amount } : { expenseAmount: amount }),
      incomeLocalAmount,
      expenseLocalAmount,
      incomeROE: incomeROEValue,
      expenseROE: expenseROEValue,
      ...(isInvoiceCurrencyToggle
        ? {
            invoiceSellAmount: incomeLocalAmount,
            invoiceExpenseAmount: expenseLocalAmount,
            invoiceCurrency: invoiceCurrency,
            invoiceSellRateOfExchange: incomeROEValue,
            invoiceExpenseRateOfExchange: expenseROEValue,
          }
        : {}),
    };

    const updatedRows = formData.charges.rateDetails.map((r) =>
      r.rowId === id ? { ...r, ...computedPatch } : r
    );
    handleRateDetailsChargesChange(updatedRows);
  };

  const handleChargeRowAdd = (
    afterId: string,
    rowValues?: Partial<BookingQuoteChargeBeanFull>
  ) => {
    const rows = formData.charges.rateDetails;
    const source = rows.find((r) => r.rowId === afterId);
    if (!source) return;

    let chargeType: ChargeType;
    if (source.truckChargeGroup === 'PTC') chargeType = 'PTC';
    else if (source.truckChargeGroup === 'DTC') chargeType = 'DTC';
    else chargeType = source.incomeChargeDetails.chargeType as ChargeType;

    for (const row of rows) {
      if (row.incomeChargeDetails?.chargeCode?.trim()) {
        if (row.incomeRate === null) {
          setChargeWarning('Please enter the rate');
          return;
        }
        if (!row.incomeCurrency?.trim()) {
          setChargeWarning('Please enter the currency');
          return;
        }
      }
    }

    const newRow: BookingQuoteChargeBeanFull = {
      ...createBlankBeanRow(chargeType, localCurrency),
      ...(rowValues || {}),
    };

    const mainPC = deps.customerFormData?.lclForm?.prepaidCollect as
      | string
      | undefined;
    if (chargeType === 'OFR' && mainPC) newRow.prepaidCollect = mainPC as any;
    if (chargeType === 'FOB') {
      if (isVisible(CommonToggleKeys.BKG_FOB_PREPAID_COLLECT) && mainPC) {
        newRow.prepaidCollect = mainPC as any;
      } else if (isVisible(CommonToggleKeys.EDI_OCEAN_PREPAID_COLLECT)) {
        newRow.prepaidCollect = 'P';
      }
    }

    const isTruckToggle =
      isVisible(CommonToggleKeys.BKG_QUOTE_TRUCKING_RATES_INTEGRATION) ||
      isVisible(CommonToggleKeys.OCN_BKG_QUOTE_PICKUP_RATES_INTEGRATION);

    if (chargeType === 'OFR' && !newRow.originDestination)
      newRow.originDestination = 'O';
    if (
      chargeType === 'FOB' &&
      !newRow.originDestination &&
      isVisible(CommonToggleKeys.COMMODITY_ACCURATE_SERVICE_CALL)
    )
      newRow.originDestination = 'O';
    if (chargeType === 'PTC' && isTruckToggle && !newRow.originDestination)
      newRow.originDestination = 'O';
    if (chargeType === 'DTC' && isTruckToggle && !newRow.originDestination)
      newRow.originDestination = 'D';

    const index = rows.findIndex((r) => r.rowId === afterId);
    const updated = [...rows];
    if (index >= 0) updated.splice(index + 1, 0, newRow);
    else updated.push(newRow);

    handleRateDetailsChargesChange(updated);
  };

  const handleChargeRowRemove = (id: string) => {
    const rowToRemove = formData.charges.rateDetails.find(
      (r) => r.rowId === id
    );
    if (!rowToRemove) return;

    const updatedRows = formData.charges.rateDetails.filter(
      (row) => row.rowId !== id
    );

    const removedType: ChargeType =
      rowToRemove.truckChargeGroup === 'PTC'
        ? 'PTC'
        : rowToRemove.truckChargeGroup === 'DTC'
          ? 'DTC'
          : (rowToRemove.incomeChargeDetails?.chargeType as ChargeType);

    const sectionStillHasRows = updatedRows.some((r) => {
      if (r.isVatBean) return false;
      if (removedType === 'PTC') return r.truckChargeGroup === 'PTC';
      if (removedType === 'DTC') return r.truckChargeGroup === 'DTC';
      return r.incomeChargeDetails?.chargeType === removedType;
    });

    if (!sectionStillHasRows)
      updatedRows.push(createBlankBeanRow(removedType, localCurrency));

    const isPersisted = !!rowToRemove.bookingRateId?.trim();

    setFormData((prev: RateDetailsFormData) => ({
      ...prev,
      charges: {
        rateDetails: updatedRows,
        deletedRateDetails: isPersisted
          ? [...prev.charges.deletedRateDetails, { ...rowToRemove, transactionalFlag: 'D' }]
          : prev.charges.deletedRateDetails,
      },
    }));
  };

  const handleCurrencyChangeRecalculate = (newInvoiceCurrency: string) => {
    setFormData((prev) => {
      const roeType = prev.rateOfExchange.rateOfExchangeType;
      let updatedRoeRows = prev.rateOfExchange.roeRows;

      if (roeType === 'L') {
        const rates = liveRateData?.result ?? {};
        const invoiceRate = rates[newInvoiceCurrency] ?? 1;
        const localRate = rates[localCurrency] ?? 1;
        updatedRoeRows = prev.rateOfExchange.roeRows.map((row) => {
          const currencyRate = rates[row.currency] ?? 1;
          const localROE = currencyRate != 0 ? currencyRate / localRate : 0;
          const invoiceROE = invoiceRate !== 0 ? currencyRate / invoiceRate : 0;
          return {
            ...row,
            localCurrencyROE: formatSixDecimals(localROE),
            invoiceCurrencyROE: formatSixDecimals(invoiceROE),
          };
        });
      }

      const getInvoiceRoe = (currency: string): number => {
        const entry = updatedRoeRows.find(
          (r) => r.currency?.toUpperCase() === currency?.toUpperCase()
        );
        return Number(entry?.invoiceCurrencyROE ?? 0);
      };

      const updatedChargeRows = prev.charges.rateDetails.map((row) => {
        if (row.isVatBean) return row;
        return {
          ...row,
          invoiceCurrency: newInvoiceCurrency,
          invoiceSellAmount:
            (row.incomeAmount ?? 0) * getInvoiceRoe(row.incomeCurrency),
          invoiceExpenseAmount:
            (row.expenseAmount ?? 0) * getInvoiceRoe(row.expenseCurrency),
        };
      });

      return {
        ...prev,
        rateOfExchange: { ...prev.rateOfExchange, roeRows: updatedRoeRows },
        charges: { ...prev.charges, rateDetails: updatedChargeRows },
      };
    });
  };

  const resetRateDetails = (keepOfr?: boolean) => {
    const isTruckToggle =
      isVisible(CommonToggleKeys.BKG_QUOTE_TRUCKING_RATES_INTEGRATION) ||
      isVisible(CommonToggleKeys.OCN_BKG_QUOTE_PICKUP_RATES_INTEGRATION);

    const isMultiPortQuote =
      deps.moduleType === 'QUO' &&
      isVisible(CommonToggleKeys.SHOW_MULTIPORT_PAIR_IN_QUOTE);

    const { nextFormData } = buildResetRateDetails({
      formData,
      localCurrency,
      invoiceCurrency,
      moduleType: deps.moduleType ?? '',
      containerType: deps.containerType ?? '',
      isTruckRateToggle: isTruckToggle,
      isMultiPortQuote,
      isDefaultLiveRatesToggle,
      keepOfr,
    });

    setFormData(nextFormData);
    setResetKey((prev) => prev + 1);
  };

  useEffect(() => {
    if (!isMounted.current) return;
    const pending = pendingRatingTypeRef.current;
    if (pending == null) return;
    pendingRatingTypeRef.current = null;
    onRatingTypeChange(pending);
  }, [resetKey]);

  const handleResetConfirm = () => {
    setIsResetDialogOpen(false);

    const showOfrPrompt = isVisible(
      CommonToggleKeys.SHOW_CONFIRM_TO_KEEP_OFR_INC_EXP
    );

    if (showOfrPrompt) {
      resetRateDetails();
      pendingRatingTypeRef.current = resolveRatingType();
      setIsKeepOfrDialogOpen(true);
    } else {
      const { pendingRatingType } = ratingTypePopulate(true, false);
      if (pendingRatingType != null) {
        pendingRatingTypeRef.current = pendingRatingType;
      }
    }
  };

  const handleKeepOfrDecision = (keepOfr: boolean) => {
    setIsKeepOfrDialogOpen(false);
    resetRateDetails(keepOfr);
    const pendingType = pendingRatingTypeRef.current;
    pendingRatingTypeRef.current = null;
    if (pendingType != null) {
      onRatingTypeChange(pendingType);
    }
  };

  const handleDuplicateChargeConfirm = () => {
    const { pendingRows, pendingRoeRows, rowIdToRemove } =
      duplicateChargeDialog;
    const filteredRows = pendingRows.filter((r) => r.rowId !== rowIdToRemove);
    setDuplicateChargeDialog((prev) => ({ ...prev, open: false }));
    setFormData((prev: RateDetailsFormData) => ({
      ...prev,
      rateOfExchange: {
        ...prev.rateOfExchange,
        baseCurrency: localCurrency,
        baseRoe: 1,
        rateOfExchangeType: 'L',
        roeRows: pendingRoeRows,
      },
      charges: { rateDetails: filteredRows, deletedRateDetails: [] },
    }));
  };

  const handleDuplicateChargeCancel = () => {
    const { pendingRows, pendingRoeRows } = duplicateChargeDialog;
    setDuplicateChargeDialog((prev) => ({ ...prev, open: false }));
    setFormData((prev: RateDetailsFormData) => ({
      ...prev,
      rateOfExchange: {
        ...prev.rateOfExchange,
        baseCurrency: localCurrency,
        baseRoe: 1,
        rateOfExchangeType: 'L',
        roeRows: pendingRoeRows,
      },
      charges: { rateDetails: pendingRows, deletedRateDetails: [] },
    }));
  };

  const recalculateInvoiceROE = (
    invoiceCurrencyCode: string,
    localCurrencyCode: string
  ): RoeRow[] => {
    const isDefaultCase =
      !invoiceCurrencyCode ||
      invoiceCurrencyCode.toUpperCase() === localCurrencyCode.toUpperCase();

    return formData.rateOfExchange.roeRows.map((row) => {
      if (isDefaultCase) {
        return { ...row, invoiceCurrencyROE: row.localCurrencyROE };
      }
      const invoiceRate = liveRateData?.result[invoiceCurrencyCode] ?? 1;
      const localROE = Number(row.localCurrencyROE) || 1;
      const invoiceROE = invoiceRate !== 0 ? localROE / invoiceRate : 0;
      return {
        ...row,
        localCurrencyROE: String(localROE),
        invoiceCurrencyROE: String(invoiceROE),
      };
    });
  };

  const updateAmountInLocalOrInvoiceCurrency = useCallback(() => {
    const isInvoiceCurrencyActive =
      deps.moduleType === 'QUO'
        ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_QUOTE)
        : deps.moduleType === 'BKG'
          ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_OCEAN_BOOKING)
          : false;

    setFormData((prev: RateDetailsFormData) => {
      if (!prev.charges.rateDetails.length) return prev;

      let hasChanged = false;
      const updatedRows = prev.charges.rateDetails.map(
        (row: BookingQuoteChargeBeanFull) => {
          if (row.isVatBean) return row;

          const incomeRoeEntry = prev.rateOfExchange.roeRows.find(
            (r: RoeRow) =>
              r.currency?.toUpperCase() === row.incomeCurrency?.toUpperCase()
          );
          const expenseRoeEntry = prev.rateOfExchange.roeRows.find(
            (r: RoeRow) =>
              r.currency?.toUpperCase() === row.expenseCurrency?.toUpperCase()
          );
          const incomeROE = isInvoiceCurrencyActive
            ? (incomeRoeEntry?.invoiceCurrencyROE ?? 0)
            : (incomeRoeEntry?.localCurrencyROE ?? 0);
          const expenseROE = isInvoiceCurrencyActive
            ? (expenseRoeEntry?.invoiceCurrencyROE ?? 0)
            : (expenseRoeEntry?.localCurrencyROE ?? 0);

          const incomeLocalAmount =
            (row.incomeAmount ?? 0) * Number(incomeROE || 0);
          const expenseLocalAmount =
            (row.expenseAmount ?? 0) * Number(expenseROE || 0);

          const incomeROENum = Number(incomeROE || 0);
          const expenseROENum = Number(expenseROE || 0);
          if (
            row.incomeLocalAmount !== incomeLocalAmount ||
            row.expenseLocalAmount !== expenseLocalAmount
          ) {
            hasChanged = true;
            return {
              ...row,
              incomeLocalAmount,
              expenseLocalAmount,
              incomeROE: incomeROENum,
              expenseROE: expenseROENum,
              ...(isInvoiceCurrencyActive
                ? {
                    invoiceSellAmount: incomeLocalAmount,
                    invoiceExpenseAmount: expenseLocalAmount,
                    invoiceSellRateOfExchange: incomeROENum,
                    invoiceExpenseRateOfExchange: expenseROENum,
                  }
                : {}),
            };
          }
          return row;
        }
      );

      if (!hasChanged) return prev;
      return {
        ...prev,
        charges: { ...prev.charges, rateDetails: updatedRows },
      };
    });
  }, [deps.moduleType, isVisible]);

  const {
    isRateOverrideAllow,
    shouldTriggerAutoVat,
    getTotalCube,
    getModuleType,
    getTotalPieces,
    getTotalWeight,
    getUOM,
    getPiecesForBasis
  } = useRateUtilityHandlers({
    ratingType: formData.ratingType,
    loginClientBean: deps.loginClientBean,
    cargoFormData: deps.cargoFormData,
    moduleType: deps.moduleType,
    featureToggle,
  });

  const {
    handleChargeNameChange,
    handleChargeNameClear,
    handlePrepaidCollectChange,
    handleIncomeBasisChange,
    handleExpenseBasisChange,
    handleVendorCommit,
    handleCurrencyChangeWithRoeCheck,
    handleIncomeRateChange,
    handleExpenseRateChange,
  } = useChargeRowHandlers(
    {
      ratingType: formData.ratingType,
      roeRows: formData.rateOfExchange.roeRows,
      roeType: formData.rateOfExchange.rateOfExchangeType,
      featureToggle,
      localCurrency,
      moduleType: deps.moduleType ?? '',
      isRateOverrideAllow,
      nraAcceptancePending: deps.nraAcceptancePending ?? '',
      bookingType: deps.mainDetails?.type,
      taxSettingMap: deps.loginClientBean?.taxSettingMap as any,
      officeId: deps.loginClientBean?.officeId,
      locale: deps.loginClientBean?.locale ?? '',
      defaultPrepaidCollect: getOfficeSetting(
        `${deps.moduleType}_DEFAULT_PREPAID_COLLECT`
      ),
    },
    { handleChargeRowUpdate, onWarning: setChargeWarning }
  );

  const {
    handleRoeRowAdd,
    handleRoeRowRemove,
    handleRoeRowUpdate,
    handleRoeRowBlur,
    handleCurrencySelectFromRoeRow,
  } = useRoeHandlers(
    {
      roeRows: formData.rateOfExchange.roeRows,
      chargeRows: formData.charges.rateDetails,
      invoiceCurrency,
      localCurrency,
      liveRates: liveRateData?.result ?? {},
      roeType: formData.rateOfExchange.rateOfExchangeType,
    },
    { handleROERowsChange, onWarning: setChargeWarning }
  );

  const { computeVatRows } = useVatChargeHandler(
    {
      invoiceCurrency,
      isVATEnable,
      localCurrency,
      roeRows: formData.rateOfExchange.roeRows,
      taxSettingMap: deps.loginClientBean?.taxSettingMap,
    },
    featureToggle
  );

  const { onRatingTypeChange } = useRatingTypeChangeHandler(
    {
      formData,
      moduleType: deps.moduleType ?? '',
      cargoFormData: deps.cargoFormData,
      linkedQuoteRef:
        (deps.mainDetails as any)?.quoteNumber ||
        (deps.mainDetails as any)?.importQuoteNumber ||
        undefined,
    },
    {
      setRatingType: (type: string) => {
        setIsAccuRatePopulated(false);
        shouldCallAccurateRef.current = null;
        setFormData((prev: RateDetailsFormData) => ({
          ...prev,
          ratingType: type,
        }));
      },
      handleRateDetailsChargesChange,
      evictPersistedChargesToDeleted,
      handleToggleButtonChange,
      triggerAccurateRate: (overrides) => handleAccurateRate(overrides as any),
    },
    featureToggle
  );

  const handleRatingTypeChange = (value: string) => onRatingTypeChange(value);

  const handleAccurateConfirm = useCallback(() => {
    setIsAccurateConfirmDialogOpen(false);
    shouldCallAccurateRef.current = true;
    handleAccurateRate();
  }, [handleAccurateRate]);

  const handleAccurateCancel = useCallback(() => {
    setIsAccurateConfirmDialogOpen(false);
    shouldCallAccurateRef.current = false;
  }, []);

  useEffect(() => {
    if (
      deps.moduleType === 'ARN' &&
      isVisible(CommonToggleKeys.SHIPMENT_TRANSFER_ARN_ACCURATE_CALL)
    ) {
      const arnDefault = getOfficeSetting(ARN_DEFAULT_RATING_TYPE_KEY);
      if (arnDefault) {
        onRatingTypeChange(arnDefault);
      }
    }
  }, []);

  const { ratingTypePopulate, resolveRatingType } = useRatingTypePopulate(
    {
      loginClientBean: deps.loginClientBean,
      moduleType: deps.moduleType ?? '',
      containerType: deps.containerType ?? '',
      customerType: deps.customerFormData?.lclForm?.customerType,
      isFromCopy: deps.isFromCopy,
    },
    { onRatingTypeChange, resetRateDetails },
    featureToggle
  );

  useEffect(() => {
    if (!isMounted.current) return;
    if (suppressRatingTypePopulateRef.current) {
      suppressRatingTypePopulateRef.current = false;
      return;
    }
    const { pendingRatingType } = ratingTypePopulate(false, true);
    if (pendingRatingType != null) {
      pendingRatingTypeRef.current = pendingRatingType;
    }
  }, [deps.customerFormData?.lclForm?.customerType]);

  const handleCurrencySelectFromChargeRow = (selectedCurrency: string) => {
    handleCurrencyChangeWithRoeCheck(selectedCurrency, (currency) => {
      const roeType = formData.rateOfExchange.rateOfExchangeType;
      const existingRows = formData.rateOfExchange.roeRows;
      const rates = liveRateData?.result ?? {};

      if (existingRows.some((row: RoeRow) => row.currency === currency)) return;

      let localROE = 0;
      let invoiceROE = 0;

      if (roeType === 'L') {
        const currencyRate = rates[currency] ?? 0;
        const invoiceRate = rates[invoiceCurrency] ?? 1;
        localROE = currencyRate;
        invoiceROE = invoiceRate !== 0 ? currencyRate / invoiceRate : 0;
      }

      const newRoeRow: RoeRow = {
        id: makeRowId(),
        currency,
        localCurrencyROE: localROE === 0 ? '' : formatSixDecimals(localROE),
        invoiceCurrencyROE: invoiceROE === 0 ? '' : formatSixDecimals(invoiceROE),
      };

      pendingRoeRowRef.current = newRoeRow;
      handleROERowsChange([...existingRows, newRoeRow]);
    });
  };

  const handleCurrencySelectFromInvoiceCurrency = (
    selectedCurrency: string
  ) => {
    if (!selectedCurrency?.trim()) return;

    const roeType = formData.rateOfExchange.rateOfExchangeType;
    const existingRows = formData.rateOfExchange.roeRows;
    const rates = liveRateData?.result ?? {};

    let localROE = 0;
    let invoiceROE = 0;

    if (roeType === 'L') {
      const currencyRate = rates[selectedCurrency] ?? 0;
      const invoiceRate = rates[invoiceCurrency] ?? 1;
      localROE = currencyRate;
      invoiceROE = invoiceRate !== 0 ? currencyRate / invoiceRate : 0;
    }

    const existingIndex = existingRows.findIndex(
      (row: RoeRow) => row.currency === selectedCurrency
    );
    const updatedRows = [...existingRows];

    if (existingIndex === -1) {
      updatedRows.splice(1, 0, {
        id: makeRowId(),
        currency: selectedCurrency,
        localCurrencyROE: localROE === 0 ? '' : formatSixDecimals(localROE),
        invoiceCurrencyROE: invoiceROE === 0 ? '' : formatSixDecimals(invoiceROE),
      });
    } else {
      const [existing] = updatedRows.splice(existingIndex, 1);
      updatedRows.splice(1, 0, {
        ...existing,
        localCurrencyROE: localROE === 0 ? '' : formatSixDecimals(localROE),
        invoiceCurrencyROE: invoiceROE === 0 ? '' : formatSixDecimals(invoiceROE),
      });
    }

    handleROERowsChange(updatedRows);
  };

  return {
    formData,
    setFormData,
    resetKey,
    defaultState: {
      isAccuRatePopulated,
      isAccurateConfirmDialogOpen,
      isAccurateLoading: isLoading,
      isResetDialogOpen,
      ratingType: formData.ratingType,
      roeType: formData.rateOfExchange.rateOfExchangeType,
      localCurrency,
      invoiceCurrency,
      isPickupExpanded: formData.toogleButtons.isPickupExpanded,
      isExpandShipmentSummaryDetailsActive:
        formData.toogleButtons.isExpandShipmentSummaryDetailsActive,
      isExpandRateOfExchangeActive:
        formData.toogleButtons.isExpandRateOfExchangeActive,
      isPrintPlcConfirmationActive:
        formData.toogleButtons.isPrintPlcConfirmationActive,
      isExpandChargeDetailsActive:
        formData.toogleButtons.isExpandChargeDetailsActive,
      isModifyRatesActive: formData.toogleButtons.isModifyRatesActive,
      isVATEnable,
      rateUtil,
      liveRateData,
      isKeepOfrDialogOpen,
      chargeWarning,
      isRatingLegendVisible,
      showPickupSection,
      showDoorDeliverySection,
      showPlcSection: updatePlcCondition(),
      duplicateChargeDialog,
      ratingOptions,
      vatOptions,
      setEquipmentDetailsList,
      equipmentDetailsList,
      chargeTypeToShowExpense,
      isAccurateServiceActive:
        formData.ratingType === 'A' ||
        (formData.ratingType === 'T' && isCommodityAccurateToggle),
    },
    handlers: {
      setIsResetDialogOpen,
      setLocalCurrency,
      setInvoiceCurrency,
      setIsVATEnable,
      handleRatingTypeChange,
      handleROEFieldsChange,
      handleROERowsChange,
      handleRateDetailsChargesChange,
      handleRateDetailsChargesPopulate,
      handleToggleButtonChange,
      handleCurrencySelectFromChargeRow,
      handleCurrencySelectFromRoeRow,
      handleCurrencySelectFromInvoiceCurrency,
      handleRoeRowAdd,
      handleRoeRowRemove,
      handleRoeRowUpdate,
      handleRoeRowBlur,
      handleRoeTypeChange,
      clearRoeWarning: () => setChargeWarning(undefined),
      handleChargeRowAdd,
      handleChargeRowRemove,
      handleChargeRowUpdate,
      handleChargeNameChange,
      handleChargeNameClear,
      handlePrepaidCollectChange,
      handleIncomeBasisChange,
      handleExpenseBasisChange,
      handleVendorCommit,
      handleIncomeRateChange,
      handleExpenseRateChange,
      clearChargeWarning: () => setChargeWarning(undefined),
      handleToggleRatingLegend: () => setIsRatingLegendVisible((v) => !v),
      resetRateDetails,
      handleResetConfirm,
      handleKeepOfrDecision,
      recalculateInvoiceROE,
      handleCurrencyChangeRecalculate,
      isRateOverrideAllow,
      shouldTriggerAutoVat,
      handleDuplicateChargeConfirm,
      handleDuplicateChargeCancel,
      handleAccurateConfirm,
      handleAccurateCancel,
      suppressRatingTypePopulate: () => {
        suppressRatingTypePopulateRef.current = true;
      },
    },
    accurateRate: {
      handleAccurateRate,
      triggerAccurateOrConfirm,
      isLoading,
      accurateRateData,
      error,
    },
  };
};
