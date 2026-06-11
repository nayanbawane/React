import { Tooltip, Typography } from '@mui/material';
import { InfoIcon } from 'lucide-react';
import {
  PSelect,
  PSingleValueSearchableField,
  PTextField,
} from 'phoenix-react-lib';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import imgExpense from '../../../../assets/img_expense.png';
import imgIncome from '../../../../assets/img_income.png';
import imgArrowCollapsed from '../../../../assets/rate_arrow_collapsed.png';
import imgArrowExpanded from '../../../../assets/rate_arrow_expanded.png';
import imgChargeA from '../../../../assets/rate_charge_row_accurate.png';
import imgChargeM from '../../../../assets/rate_charge_row_manual.png';
import imgMinusEnable from '../../../../assets/rate_charge_row_minus_enable.png';
import imgChargeO from '../../../../assets/rate_charge_row_o.png';
import imgPlusEnable from '../../../../assets/rate_charge_row_plus_enable.png';
import imgChargeS from '../../../../assets/rate_charge_row_spot.png';
import imgChargeT from '../../../../assets/rate_charge_row_truck.png';
import {
  CommonToggleKeys,
  CurrencyUtilityBean,
  EXPORT,
  formatAmountWithCurrencyDecimal,
  IMPORT,
  MODULE_BKG,
  MODULE_BOL,
  MODULE_PREBKG,
  MODULE_QUO,
  OceanToggleKeys,
  TYPE_LCL,
} from '../../../../core';
import {
  basisConfig,
  handlingChargeNameSuggestionConfig,
  handlingCurrencySuggestionConfig,
  handlingVendorSuggestionConfig,
  useGetSelections,
  useGetSuggestions
} from '../../../../hooks/LCL';
import { useAppSelector } from '../../../../app/store/hooks';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';
import styles from '../../../../styles/LCL/RateDetails.module.css';
import {
  BookingQuoteChargeBeanFull,
  PRateDetailsPickupChargesRowProps,
  RateType,
} from '../../../../types/LCL/RateDetails/RateDetails.types';
import { getPickupChargesRowFieldIds } from './RateDetailsIds.config';

const originDestinationOptions = [
  { label: 'Please Select', value: '-1' },
  { label: 'Origin', value: 'O' },
  { label: 'Destination', value: 'D' },
];

const prepaidCollectOptions = [
  { label: 'Select', value: '-1' },
  { label: 'Prepaid', value: 'P' },
  { label: 'Collect', value: 'C' },
];

const VATOptions = [
  { label: 'VAT 0%-0%', value: 'Y~0' },
  { label: 'Value Added tax-8%', value: 'Y~8' },
  { label: 'Value Added Tax-23%', value: 'Y~23' },
  { label: 'Value Added tax-5%', value: 'Y~5' },
  { label: 'N-No', value: 'N' },
];

const PRateDetailsPickupChargesRow: React.FC<
  PRateDetailsPickupChargesRowProps
> = ({
  chargeType,
  rows,
  onUpdateRow,
  onAddRow,
  onRemoveRow,
  onCurrencySelect,
  showHeader,
  isExpanded,
  chargeTypeImg,
  isVATEnable,
  showExpenseRow,
  showTruckerRow,
  isModifyRatesActive,
  cargoMetrics,
  pickupCargoMetricsMap,
  allRows,
  pickupOptions: pickupOptionsProp,
  rateUtil,
  roeRows,
  localCurrency,
  invoiceCurrency,
  moduleType,
  decimalCurrencyConfig,
  featureToggle,
  onChargeNameChange,
  onChargeNameClear,
  onPrepaidCollectChange,
  onIncomeBasisChange,
  onIncomeRateChange,
  onExpenseBasisChange,
  onExpenseRateChange,
  onVendorCommit,
  isBolInvoiceGenerated = false,
  shippingType,
  equipmentDetailsList = [],
  shipmentDirection,
}) => {
  const loginClientBean = useAppSelector(selectLoginClientBean);

  // ******  Feature Toggle Start ********
  const { isVisible, getToggleValue } = featureToggle;
  const isMultiPickupToggle = isVisible(
    CommonToggleKeys.OCEAN_BKG_TRK_MULTI_PICKUP
  );
  const isVatForTruckingToggle = isVisible(
    CommonToggleKeys.OCN_ENABLE_VAT_FOR_TRUCKING_CHARGES
  );
  const isSplitVatToggle = isVisible(
    CommonToggleKeys.SPLIT_INV_VAT_FOR_LOCAL_CURR
  );
  const isAutoVatToggle = isVisible(CommonToggleKeys.AUTOVAT_CHARGE_ENABLE);
  const isPrepaidCollectRetainBkgToggle = isVisible(
    CommonToggleKeys.OCEAN_BKG_PREPAID_COLLECT_RETAIN
  );
  const isPrepaidCollectRetainQuoToggle = isVisible(
    CommonToggleKeys.QUO_ENABLE_PRE_COLL_TRK_CHRG
  );
  const isInvoiceForeignCurrencyToggle = isVisible(
    CommonToggleKeys.INVOICE_DOCUMENT_IN_FOREIGN_CURRENCY
  );
  const isUserDefinedChargeDescToggle = isVisible(
    CommonToggleKeys.ALLOW_USER_DEFINED_CHARGE_DESCRIPTION
  );
  const isFobPrepaidCollectToggle = isVisible(
    CommonToggleKeys.BKG_FOB_PREPAID_COLLECT
  );
  const isTruckerSliderToggle = isVisible(
    CommonToggleKeys.OCEAN_TRK_BKG_QUO_TRUCKER_SLIDER
  );
  const isNraApprovalToggle = isVisible(
    CommonToggleKeys.OCEAN_NRA_APPROVAL_PROCESS
  );
  const isRatingNotesChangedToggle = isVisible(
    CommonToggleKeys.OCEAN_RATING_DETAILS_NOTES_CHANGED
  );
  const isExpenseNotesChangedToggle = isVisible(
    CommonToggleKeys.OCEAN_RATING_DETAILS_EXPENSE_NOTES_CHANGED
  );
  const isAddNotesPickupDeliveryToggle = isVisible(
    CommonToggleKeys.OCN_ADD_NOTES_FOR_PICKUP_DELIVERY
  );
  const isInvoiceCurrencyToggle =
    moduleType === MODULE_QUO
      ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_QUOTE)
      : moduleType === MODULE_BKG
        ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_OCEAN_BOOKING)
        : moduleType === MODULE_PREBKG
          ? false
          : false;

  const isDecimalCurrencyToggle = isVisible(
    CommonToggleKeys.OCEAN_CURRENCY_DECIMAL
  );
  const isNoRoundupForeignCurrency = isVisible(
    CommonToggleKeys.NO_ROUNDUP_FOREIGN_CURRENCY
  );
  const isOceanImportQuoteEnhancement = isVisible(
    CommonToggleKeys.OCN_IMPORT_QUOTE_ENHANCEMENT
  );
  const isNhcChargeForExportToggle = isVisible(
    CommonToggleKeys.OCEAN_ENABLE_NHC_CHARGE_FOR_EXPORT
  );
  // ******  Feature Toggle End ********

  const isNhcChargeForExportEnabled =
    isNhcChargeForExportToggle &&
    (moduleType === MODULE_BKG || moduleType === MODULE_BOL) &&
    !isBolInvoiceGenerated;

  useEffect(() => {
    if (!isNhcChargeForExportEnabled) return;
    rows.forEach((row) => {
      if (
        row.incomeChargeDetails?.chargeCode?.toUpperCase() === 'NH' &&
        row.prepaidCollect !== 'P'
      ) {
        onUpdateRow(row.rowId, true, { prepaidCollect: 'P' });
      }
    });
  }, [isNhcChargeForExportEnabled, rows]);

  const [rowExpanded, setRowExpanded] = useState<Record<string, boolean>>({});
  const prevIsExpandedRef = useRef(isExpanded);

  useEffect(() => {
    if (prevIsExpandedRef.current !== isExpanded) {
      prevIsExpandedRef.current = isExpanded;
      setRowExpanded({});
    }
  }, [isExpanded]);

  const isRowExpanded = (id: string): boolean => rowExpanded[id] ?? isExpanded;

  const toggleRow = (id: string) =>
    setRowExpanded((prev) => ({ ...prev, [id]: !isRowExpanded(id) }));

  const {
    data: handlingChargeNameSuggestions,
    setQuery: setHandlingChargeNameSuggestions,
  } = useGetSuggestions(handlingChargeNameSuggestionConfig(loginClientBean as any));

  const {
    data: handlingCurrencySuggestions,
    setQuery: setHandlingCurrencySuggestions,
  } = useGetSuggestions(handlingCurrencySuggestionConfig);

  const {
    data: handlingVendorSuggestions,
    setQuery: setHandlingVendorSuggestions,
  } = useGetSuggestions(handlingVendorSuggestionConfig(loginClientBean as any));

  const { data: basisOptions } = useGetSelections(basisConfig);

  const pickupOptionsFromRows = useMemo(() => {
    const seen = new Set<string>();
    const opts: { label: string; value: string }[] = [];
    (allRows ?? []).forEach((r) => {
      const id = r.pickupId;
      if (id && r.truckChargeGroup === 'PTC' && !seen.has(id)) {
        seen.add(id);
        const label = [r.truckCity, r.truckZipCountry]
          .filter(Boolean)
          .join(' ') || `Pickup ${id}`;
        opts.push({ label, value: id });
      }
    });
    return opts;
  }, [allRows]);

  const pickupOptions = pickupOptionsProp ?? pickupOptionsFromRows;

  const expenseBasisRefMap = useRef<Record<string, HTMLElement | null>>({});
  const plusButtonRefMap = useRef<Record<string, HTMLElement | null>>({});

  const [currencyDraft, setCurrencyDraft] = useState<Record<string, string>>(
    {}
  );

  const [chargeNameDraft, setChargeNameDraft] = useState<
    Record<string, string>
  >({});

  const getBasisDescription = (basisValue: string): string => {
    if (!basisValue) return '';
    const option = basisOptions.find((o) => o.value === basisValue);
    if (!option) return '';
    const parts = option.label.split('-');
    return parts.length > 1 ? parts[1].trim() : option.label.trim();
  };

  const getBasisLabel = (value: string): string => {
    if (!value) return '';
    const opt = basisOptions.find((o) => o.value === value);
    return opt ? opt.label : value;
  };

    const getEquipmentLabel = (value: string): string => {
      const opt = equipmentDetailsList.find((o) => o.value === value);
      return opt ? opt.label : value;
    };

  const getOriginDestinationLabel = (value: string): string => {
    const opt = originDestinationOptions.find((o) => o.value === value);
    return opt && opt.value !== '-1' ? opt.label : value || '';
  };

  const getPrepaidCollectLabel = (value: string): string => {
    const opt = prepaidCollectOptions.find((o) => o.value === value);
    return opt && opt.value !== '-1' ? opt.label : value || '';
  };

  const getVATLabel = (row: BookingQuoteChargeBeanFull): string => {
    const key = row.incomeVAT?.startsWith('Y')
      ? `Y~${row.vatPercent && row.vatPercent !== 'N' ? row.vatPercent : '0'}`
      : 'N';
    const opt = VATOptions.find((o) => o.value === key);
    return opt ? opt.label : key;
  };

  const draftKey = (rowId: string, side: 'income' | 'expense') =>
    `${rowId}:${side}`;

  const fieldIds = getPickupChargesRowFieldIds(moduleType);

  const getRoeForCurrency = useCallback(
    (currency: string): number => {
      if (!roeRows?.length || !currency) return 0;
      const entry = roeRows.find(
        (r) => r.currency.trim().toUpperCase() === currency.trim().toUpperCase()
      );
      if (!entry) return 0;
      const invoiceROE = Number(entry.invoiceCurrencyROE) || 0;
      return invoiceROE > 0 ? invoiceROE : Number(entry.localCurrencyROE) || 0;
    },
    [roeRows]
  );

  const onCurrencyTyping = useCallback(
    (
      row: BookingQuoteChargeBeanFull,
      newText: string,
      side: 'income' | 'expense'
    ) => {
      setCurrencyDraft((prev) => ({
        ...prev,
        [draftKey(row.rowId, side)]: newText,
      }));
    },
    []
  );

  const onCurrencyCommit = useCallback(
    (
      row: BookingQuoteChargeBeanFull,
      newCurrency: string,
      side: 'income' | 'expense'
    ) => {
      const trimmed = (newCurrency || '').trim();

      const isIncome = side === 'income';

      const patch: Partial<BookingQuoteChargeBeanFull> = isIncome
        ? { incomeCurrency: trimmed }
        : { expenseCurrency: trimmed };

      onUpdateRow(row.rowId, isIncome, patch);
      setCurrencyDraft((prev) => {
        const k = draftKey(row.rowId, side);
        if (!(k in prev)) return prev;
        const { [k]: _, ...next } = prev;
        return next;
      });
    },
    [onUpdateRow, onCurrencySelect, getRoeForCurrency]
  );

  const onChargeNameTyping = useCallback(
    (row: BookingQuoteChargeBeanFull, newText: string) => {
      setChargeNameDraft((prev) => ({ ...prev, [row.rowId]: newText }));
    },
    []
  );

  const onChargeNameCommit = useCallback(
    (row: BookingQuoteChargeBeanFull, value: any) => {
      const parts = value.SUGGEST_VALUE.split('-');
      const code = (parts[0] || '').trim();
      const description = (parts[1] || '').trim();

      const rawKeyParts = (value.SUGGEST_KEY ?? '').split('~');
      const fmcChargeType = (rawKeyParts[2] ?? '').trim();

      setChargeNameDraft((prev) => {
        const next = { ...prev };
        delete next[row.rowId];
        return next;
      });

      if (onChargeNameChange) {
        onChargeNameChange(
          row.rowId,
          { chargeCode: code, chargeDescription: description, fmcChargeType },
          row
        );
      }
    },
    [onChargeNameChange]
  );

  const buildFormularInput = (
    row: BookingQuoteChargeBeanFull,
    isIncome: boolean
  ) => {
    const basis = isIncome ? row.incomeBasis : row.expenseBasis;
    const rate = isIncome ? row.incomeRate : row.expenseRate;
    const rows = allRows ?? [];
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

    const effectivePickupId = isIncome ? row.pickupId : row.expensePickupId;
    const rowCargoMetrics =
      pickupCargoMetricsMap && effectivePickupId
        ? (pickupCargoMetricsMap[effectivePickupId] ?? cargoMetrics)
        : cargoMetrics;

    // PC Basis Logic
    let Equipemtpieces = rowCargoMetrics?.pieces; // default

    if (basis === 'PC') {
      const equipmentValue = row.equipmentDetails ?? '';
      const match = equipmentValue.match(/^(\d+)\s*X\s*(.+)$/i);
      const fromEquipment = match ? Number(match[1]) : 0;

      Equipemtpieces = fromEquipment > 0 ? fromEquipment : rowCargoMetrics?.pieces;
    }

    return {
      moduleType: 'O' as const,
      basis: basis ?? '',
      uom: 'M',
      rate: rate ?? 0,
      weight: rowCargoMetrics?.weight,
      cube: rowCargoMetrics?.cube,
      pieces: Equipemtpieces, //rowCargoMetrics?.pieces,
      totalTEU: rowCargoMetrics?.teu,
      ofrAmount: ofrTotal,
      inlAmount: inlTotal,
      dlcAmount: dlcTotal,
    };
  };

  const getToolTipDescription = (
    row: BookingQuoteChargeBeanFull,
    _basis: string,
    _rate: number,
    isIncome: boolean
  ): string => {
    if (isIncome && !row.incomeBasis) return '';
    if (!isIncome && !row.expenseBasis) return '';
    if (!rateUtil) return '';

    const input = buildFormularInput(row, isIncome);
    const formulaDesc = rateUtil.calculateFormular(input);

    if (row.isVatBean) {
      const actualFormula = rateUtil.getFormula(input) || '';
      return `This is the formula for TAX Calculation: ${rateUtil.showFormula(actualFormula)}`;
    }

    return formulaDesc.popupDescription;
  };

  function getRateType(row: BookingQuoteChargeBeanFull): RateType {
    let flag = row.spotRateFlag ?? 0;

    const isFmc = !!row.fmcChargeType;
    const relay = row.relayFlag;
    const isTruck =
      row.truckChargeGroup === 'DTC' || row.truckChargeGroup === 'PTC';

    if (isFmc && relay === 'A' && flag !== 2 && flag !== 3) {
      flag = 1;
    }

    if (row.fmcChargeType === 'Y' && flag === 0 && relay === 'A') {
      flag = 1;
    }

    if (isNraApprovalToggle && isFmc && flag === 0) {
      flag = 1;
    }

    if (flag === 1) return 'A';
    if (flag === 2) return 'S';
    if (flag === 3) return 'O';

    if (isTruck) {
      if (relay === 'U') return 'M';
      return 'T';
    }

    return 'M';
  }

  function getRateIcon(type: RateType) {
    switch (type) {
      case 'A':
        return imgChargeA;
      case 'S':
        return imgChargeS;
      case 'O':
        return imgChargeO;
      case 'T':
        return imgChargeT;
      case 'M':
      default:
        return imgChargeM;
    }
  }

  const getAmountAfterAbs = (value: number): number => {
    const rounding = 2;

    if (value == null || isNaN(value)) return 0;

    let amount = parseFloat(value.toFixed(rounding));

    if (amount < 0) {
      amount = Math.abs(amount);
      amount = Math.round(amount) * -1;
    } else {
      amount = Math.round(amount);
    }

    return amount;
  };

  const getDisplayAmount = (
    row: BookingQuoteChargeBeanFull,
    isIncome: boolean
  ): string => {
    if (!isDecimalCurrencyToggle || !row.isZeroAllowed) return '';
    const util: CurrencyUtilityBean = formatAmountWithCurrencyDecimal(
      {
        amount: isIncome ? row.incomeAmount : row.expenseAmount,
        currency: isIncome ? row.incomeCurrency : row.expenseCurrency,
      },
      decimalCurrencyConfig
    );
      return util.formattedAmountString ?? '';
    };

    const getDisplayLocalAmount = (
      row: BookingQuoteChargeBeanFull,
      isIncome: boolean
    ): string => {
      if (!row.isZeroAllowed) return '';

      if (isDecimalCurrencyToggle) {
        let amt = isIncome ? row.incomeLocalAmount : row.expenseLocalAmount;
        let currency = localCurrency;
        if (isInvoiceCurrencyToggle) {
          amt = isIncome ? row.invoiceSellAmount : row.invoiceExpenseAmount;
          currency = row.invoiceCurrency;
        }
        if (row.isVatBean) {
          amt = isIncome ? row.incomeLocalAmount : row.expenseLocalAmount;
          currency = isIncome ? row.incomeCurrency : row.expenseCurrency;
        }
        const util: CurrencyUtilityBean = formatAmountWithCurrencyDecimal(
          {
            amount: amt,
            currency,
          },
          decimalCurrencyConfig
        );
        return util.formattedAmountString ?? '';
      }

      if (isInvoiceCurrencyToggle) {
        if (isIncome) {
          if (isNoRoundupForeignCurrency) {
            if (
              localCurrency?.toLowerCase() === row.incomeCurrency?.toLowerCase()
            ) {
              return localCurrency?.toLowerCase() !==
                row.invoiceCurrency?.toLowerCase()
                ? String(row.invoiceSellAmount)
                : String(getAmountAfterAbs(row.invoiceSellAmount));
            }
            return String(row.invoiceSellAmount);
          }
          return String(getAmountAfterAbs(row.invoiceSellAmount));
        }
        return String(getAmountAfterAbs(row.invoiceExpenseAmount));
      }

      if (isIncome) return String(getAmountAfterAbs(row.incomeLocalAmount));
      return String(getAmountAfterAbs(row.expenseLocalAmount));
    };

  const renderDataCells = (
    row: BookingQuoteChargeBeanFull,
    idx: number,
    effectiveShowExpense = false
  ) => {
      const isIncome = idx <= 2;
      const rate = isIncome ? row.incomeRate : row.expenseRate;
      const currency = isIncome ? row.incomeCurrency : row.expenseCurrency;
      const basis = isIncome ? row.incomeBasis : row.expenseBasis;
      const amount = getDisplayAmount(row, isIncome);
      const localAmount = getDisplayLocalAmount(row, isIncome);

      const chargeCode = row.incomeChargeDetails.chargeCode;
      const chargeDescription = row.incomeChargeDetails.chargeDescription;
    const isChargeSelected = isIncome && !!chargeCode?.trim() && !row.isVatBean;

    const editDisabled = !isModifyRatesActive || row.isVatBean;

      const isTruckingRow =
        row.truckChargeGroup === 'PTC' || row.truckChargeGroup === 'DTC';

    const effectiveVATEnable =
      isVatForTruckingToggle && !row.isVatBean && moduleType === MODULE_BKG;

    const isVatDisabledByForeignCurrency =
      isSplitVatToggle &&
      !!row.incomeCurrency &&
      !!localCurrency &&
      row.incomeCurrency.toUpperCase() !== localCurrency.toUpperCase();

      const isVatDisabledByCollect =
        isAutoVatToggle && row.prepaidCollect === 'C';

    const vatDisabled = editDisabled;
    //  || isVatDisabledByForeignCurrency || isVatDisabledByCollect;

    const isPrepaidCollectRetainToggle =
      moduleType === MODULE_BKG
        ? isPrepaidCollectRetainBkgToggle
        : moduleType === MODULE_QUO
          ? isPrepaidCollectRetainQuoToggle
          : moduleType === MODULE_PREBKG
            ? false
            : false;

      const prepaidCollectDisabled =
        editDisabled &&
        !(isTruckingRow && row.isVatBean && isPrepaidCollectRetainToggle);

      const isFobChargeType = chargeType === 'FOB';
      const fobPrepaidCollectDisabled =
        isFobChargeType && !isFobPrepaidCollectToggle;
      const effectivePrepaidCollectDisabled =
        fobPrepaidCollectDisabled || prepaidCollectDisabled;

    const isNhcPrepaidCollectRequired =
      isNhcChargeForExportEnabled &&
      row.incomeChargeDetails?.chargeCode?.toUpperCase() === 'NHC';

    const canEditDescription =
      isInvoiceForeignCurrencyToggle && isUserDefinedChargeDescToggle;

      if ([0, 3].includes(idx)) {
        return (
          <>
            <td className={styles.iconCell}>
              <div className={styles.calculatedAmountCell}>
                {isIncome &&
                  (() => {
                    const rateType = getRateType(row);
                    const icon = getRateIcon(rateType);

                    return (
                      <img src={icon} alt={rateType} width={16} height={16} />
                    );
                  })()}
              </div>
            </td>

            {/* Name */}
            <td className={styles.cell}>
            {isModifyRatesActive ? (
              <PSingleValueSearchableField
                disabled={!isIncome || editDisabled}
                id={isIncome ? fieldIds.incomeChargeNameTextBox : fieldIds.expenseChargeNameTextBox}
                data={handlingChargeNameSuggestions}
                displayFields={['SUGGEST_VALUE']}
                displayValueField="SUGGEST_KEY"
                columnHeaders={[]}
                value={(() => {
                  const draft = chargeNameDraft[row.rowId];
                  if (draft !== undefined) return draft;
                  return chargeDescription || chargeCode || '';
                })()}
                onChange={(val: string) => {
                  setHandlingChargeNameSuggestions(val);
                  onChargeNameTyping(row, val);
                  if (!val.trim() && onChargeNameClear) {
                    onChargeNameClear(row.rowId, row);
                  }
                }}
                onSelect={(item: any) => {
                  onChargeNameCommit(row, item);
                }}
              />
            ) : (
              <Typography className={styles.cellText}>
                {chargeDescription || chargeCode || ''}
              </Typography>
            )}
            </td>

            {/* Origin/Destination */}
            <td className={styles.cell}>
              {isIncome ? (
              isModifyRatesActive ? (
                <PSelect
                  disabled={editDisabled}
                  id={fieldIds.incomeOrgDestListBox}
                  value={row.originDestination || '-1'}
                  onChange={(e: string) =>
                    onUpdateRow(row.rowId, isIncome, {
                      originDestination: e === '-1' ? ('' as any) : (e as any),
                    })
                  }
                  options={originDestinationOptions}
                  displayEmpty
                  size="small"
                />
              ) : (
                <Typography className={styles.cellText}>
                  {getOriginDestinationLabel(row.originDestination)}
                </Typography>
              )
            ) : (
                <></>
              )}
            </td>

            {/* Prepaid/Collect */}
            <td className={styles.cell}>
              {isIncome ? (
              isModifyRatesActive ? (
                <PSelect
                  disabled={effectivePrepaidCollectDisabled}
                  id={fieldIds.incomePrepaidCollectListBox}
                  required={isNhcPrepaidCollectRequired}
                  value={
                    isNhcPrepaidCollectRequired
                      ? 'P'
                      : fobPrepaidCollectDisabled && !row.prepaidCollect
                        ? 'P'
                        : row.prepaidCollect || '-1'
                  }
                  onChange={(e: string) => {
                    const val = e === '-1' ? '' : e;
                    if (onPrepaidCollectChange) {
                      onPrepaidCollectChange(row.rowId, val, row);
                    } else {
                      onUpdateRow(row.rowId, isIncome, {
                        prepaidCollect: val as any,
                      });
                    }
                  }}
                  options={prepaidCollectOptions}
                  displayEmpty
                  size="small"
                />
              ) : (
                <Typography className={styles.cellText}>
                  {getPrepaidCollectLabel(
                    isNhcPrepaidCollectRequired
                      ? 'P'
                      : fobPrepaidCollectDisabled && !row.prepaidCollect
                        ? 'P'
                        : row.prepaidCollect
                  )}
                </Typography>
              )
            ) : (
                <></>
              )}
            </td>

            {/* Basis */}
            <td className={styles.cell}>
            {isModifyRatesActive ? (
              <PSelect
                disabled={editDisabled}
                id={fieldIds.incomeBasisListBox}
                value={basis}
                required={isChargeSelected}
                inputRef={
                  !isIncome
                    ? (el: HTMLElement | null) => {
                        expenseBasisRefMap.current[row.rowId] = el;
                      }
                    : undefined
                }
                onChange={(e: string) => {
                  const patch: Partial<BookingQuoteChargeBeanFull> = isIncome
                    ? {
                      incomeBasis: e,
                      incomeOldBasis: row.incomeBasis,
                      expenseBasis: e,
                      expenseOldBasis: row.expenseBasis,
                      overridden: true,
                    }
                    : {
                      expenseBasis: e,
                      expenseOldBasis: row.expenseBasis,
                      overridden: true,
                    };

                  if (isIncome) {
                    if (onIncomeBasisChange) {
                      onIncomeBasisChange(row.rowId, isIncome, patch, row);
                    }
                  } else {
                    if (onExpenseBasisChange) {
                      onExpenseBasisChange(row.rowId, isIncome, patch, row);
                    }
                  }
                }}
                options={basisOptions}
                displayEmpty
                size="small"
              />
) : (
              <Typography className={styles.cellText}>
                {getBasisLabel(basis)}
              </Typography>
            )}
            </td>

            {/* Equipment Details */}
            {
              shippingType === 'F' && (
                <td className={styles.cell}>
                  {isIncome ? (
                    isModifyRatesActive ? (
                      <PSelect
                        disabled={!(row.incomeBasis === 'PC') || editDisabled}
                        value={row.equipmentDetails}
                        onChange={(e: string) => {
                          onUpdateRow(row.rowId, isIncome, {
                            equipmentDetails: e as any,
                          });
                        }}
                        options={equipmentDetailsList}
                        displayEmpty
                        size="small"
                      />
                    ) : (
                      <Typography className={styles.cellText}>
                        {getEquipmentLabel(row.equipmentDetails)}
                      </Typography>
                    )
                  ) : (
                    <></>
                  )}
                </td>
              )}

            {/* Rate */}
            <td className={styles.cellRight}>
            {isModifyRatesActive ? (
              <div className={styles.numericInput}>
                <PTextField
                  type="number"
                  id={isIncome ? fieldIds.incomeRateTextBox : fieldIds.expenseRateTextBox}
                  value={rate}
                  disabled={editDisabled}
                  required={isChargeSelected}
                  onChange={(e) => {
                    const val = e.target.value;
                    const numeric = val === '' ? 0 : Number(val);

                    if (isIncome) {
                      if (onIncomeRateChange) {
                        onIncomeRateChange(row.rowId, numeric, row);
                      } else {
                        onUpdateRow(row.rowId, isIncome, {
                          incomeRate: numeric,
                        });
                        }
                    } else {
                      if (onExpenseRateChange) {
                        onExpenseRateChange(row.rowId, numeric, row);
                      } else {
                        onUpdateRow(row.rowId, isIncome, {
                          expenseRate: numeric,
                        });
                      }
                        }
                  }}
                />
              </div>
            ) : (
              <div className={styles.calculatedAmountCell}>
                <Typography className={styles.cellTextMuted}>
                  {currency ? `${currency} ` : ``}
                </Typography>
                <Typography className={styles.cellText}>{rate}</Typography>
              </div>
            )}
            </td>

          {/* Currency */}
          {isModifyRatesActive && (
            <td className={styles.cell}>
              <PSingleValueSearchableField
                disabled={editDisabled}
                id={isIncome ? fieldIds.incomeCurrencyTextBox : fieldIds.expenseCurrencyTextBox}
                data={handlingCurrencySuggestions}
                displayFields={['SUGGEST_VALUE']}
                displayValueField="SUGGEST_KEY"
                columnHeaders={[]}
                required={isChargeSelected}
                  value={(() => {
                    const draft =
                      currencyDraft[
                      draftKey(row.rowId, isIncome ? 'income' : 'expense')
                      ];
                    if (draft !== undefined) return draft;
                    return currency || '';
                  })()}
                  onChange={(val: string) => {
                    setHandlingCurrencySuggestions(val);
                    onCurrencyTyping(row, val, isIncome ? 'income' : 'expense');
                  }}
                  onSelect={(item) => {
                    const parts = item.SUGGEST_VALUE.split('-');
                    const code = (parts[0] || '').trim();
                    onCurrencySelect(code);
                    onCurrencyCommit(row, code, isIncome ? 'income' : 'expense');
                  }}
                />
              </td>
            )}

          {/* Minimum */}
          {(
            (isOceanImportQuoteEnhancement && moduleType === MODULE_QUO && shippingType === TYPE_LCL) ||
            (moduleType === MODULE_PREBKG && shippingType === TYPE_LCL) ||
            (moduleType === MODULE_BKG && shippingType === TYPE_LCL)
          ) &&
            (() => {
              const isAccurateRow = row.relayFlag === 'A';
              const minimumRate = isIncome
                ? (row.incomeMinimumRate ?? 0)
                : (row.expenseMinimumRate ?? 0);
              const showMinimumAsDisplay =
                !isModifyRatesActive || !isIncome || isAccurateRow;
              return (
                <td className={styles.cell}>
                  {!showMinimumAsDisplay ? (
                    <div className={styles.numericInput}>
                      <PTextField
                        type="number"
                        value={minimumRate ?? ''}
                        disabled={editDisabled}
                        onChange={(e) => {
                          const val = e.target.value;
                          const numeric = val === '' ? null : Number(val);
                          onUpdateRow(row.rowId, isIncome, {
                            incomeMinimumRate: numeric,
                          });
                        }}
                      />
                    </div>
                  ) : (
                    <div className={styles.calculatedAmountCell}>
                      <Typography className={styles.cellTextMuted}>
                        {currency ? `${currency} ` : ``}
                      </Typography>
                      <Typography className={styles.cellText}>
                        {minimumRate ?? ''}
                      </Typography>
                    </div>
                  )}
                </td>
              );
            })()}

          {/* Calculated amount */}
          <td className={styles.cell}>
            <div className={styles.calculatedAmountCell}>
              <Typography className={styles.cellTextMuted}>
                {currency ? `${currency} ` : ``}
              </Typography>
              <Typography id={fieldIds.calculatedAmtLabel} className={styles.cellText}>{amount}</Typography>
            </div>
          </td>

            {/* Amount in local currency */}
            <td className={styles.cellRight}>
              <Typography className={styles.cellTextPaddedRight}>
                {localAmount}
              </Typography>
            </td>

            {/* Vendor */}
            <td className={styles.cell}>
              {!isIncome ? (
              isModifyRatesActive ? (
                <PSingleValueSearchableField
                  disabled={editDisabled}
                  id={fieldIds.expenseVendorTextBox}
                  data={handlingVendorSuggestions}
                  displayFields={['SUGGEST_KEY']}
                  columnHeaders={[]}
                  value={row.vendor || ''}
                  onChange={(val: string) => {
                    setHandlingVendorSuggestions(val);
                    if (onVendorCommit) {
                      onVendorCommit(row.rowId, isIncome, val);
                    }
                  }}
                  onSelect={(item) => {
                    const vendorVal = (item as any).SUGGEST_VALUE || '';
                    if (onVendorCommit) {
                      onVendorCommit(row.rowId, isIncome, vendorVal);
                    }
                  }}
                />
              ) : (
                <Typography className={styles.cellText}>
                  {row.vendor || ''}
                </Typography>
              )
            ) : (
                <Typography className={styles.cellText} />
              )}
            </td>

            {/* Vendor reference */}
            <td
              className={
                isVATEnable
                  ? styles.cell
                  : isModifyRatesActive
                    ? styles.cellNoRightBorder
                    : styles.cellLastBorder
              }
            >
              {!isIncome ? (
              isModifyRatesActive ? (
                <PTextField
                  disabled={editDisabled}
                  id={fieldIds.expenseVendorRefTextBox}
                  value={row.vendorReference || ''}
                  onChange={(val) =>
                    onUpdateRow(row.rowId, isIncome, {
                      vendorReference: val.target.value,
                    })
                  }
                  onKeyDown={(e: React.KeyboardEvent) => {
                    if (!e.shiftKey && e.key === 'Tab') {
                      e.preventDefault();
                      e.stopPropagation();
                      plusButtonRefMap.current[row.rowId]?.focus();
                    }
                  }}
                />
              ) : (
                <Typography className={styles.cellText}>
                  {row.vendorReference || ''}
                </Typography>
              )
            ) : (
                <Typography className={styles.cellText} />
              )}
            </td>

          {/* VAT */}
          {isVATEnable && (
            <td
              className={
                isModifyRatesActive
                  ? styles.cellNoRightBorder
                  : styles.cellLastBorder
              }
            >
              {isIncome && isVATEnable ? (
                isModifyRatesActive ? (
                  <PSelect
                    disabled={vatDisabled}
                    value={
                      row.incomeVAT?.startsWith('Y')
                        ? `Y~${row.vatPercent && row.vatPercent !== 'N' ? row.vatPercent : '0'}`
                        : 'N'
                    }
                    onChange={(e: any) => {
                      if (e === 'N') {
                        onUpdateRow(row.rowId, isIncome, {
                          incomeVAT: 'N',
                          vatPercent: 'N',
                        });
                      } else {
                        const pct = String(e).split('~')[1] ?? '0';
                        onUpdateRow(row.rowId, isIncome, {
                          incomeVAT: 'Y',
                          vatPercent: pct,
                        });
                      }
                    }}
                    onKeyDown={(e: React.KeyboardEvent) => {
                      if (!e.shiftKey && e.key === 'Tab') {
                        e.preventDefault();
                        e.stopPropagation();
                        if (effectiveShowExpense) {
                          expenseBasisRefMap.current[row.rowId]?.focus();
                        } else {
                          plusButtonRefMap.current[row.rowId]?.focus();
                        }
                      }
                    }}
                    options={VATOptions}
                    displayEmpty
                    size="small"
                  />
                ) : (
                  <Typography className={styles.cellText}>
                    {getVATLabel(row)}
                  </Typography>
                )
              ) : (
                  <Typography className={styles.cellText}>&nbsp;</Typography>
                )}
              </td>
            )}
          </>
        );
      }

      if ([1, 4].includes(idx)) {
        return (
          <>
            <td colSpan={4} className={styles.descriptionCell}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                <Typography className={styles.cellTextBold}>
                  Description:
                </Typography>
                {canEditDescription && !editDisabled ? (
                  <PTextField
                    value={row.userDefineChargeDescription || ''}
                    onChange={(e) =>
                      onUpdateRow(row.rowId, isIncome, {
                        userDefineChargeDescription: e.target.value,
                      })
                    }
                    size="small"
                  />
                ) : (
                  <Typography className={styles.cellText}>
                    {getBasisDescription(
                      isIncome ? row.incomeBasis : row.expenseBasis
                    )}
                  </Typography>
                )}
              </div>
            </td>
            <td
              colSpan={
              (isModifyRatesActive
                ? isVATEnable
                  ? 8
                  : 7
                : isVATEnable
                  ? 7
                  : 6) +
              ((isOceanImportQuoteEnhancement && moduleType === MODULE_QUO && shippingType === TYPE_LCL) ||
               (moduleType === MODULE_PREBKG && shippingType === TYPE_LCL) ||
               (moduleType === MODULE_BKG && shippingType === TYPE_LCL)
                ? 1
                : 0)
            }
            className={
              isModifyRatesActive
                ? styles.descriptionCell
                : styles.descriptionCellLast
            }
          >
            <div
              className={styles.calculatedAmountCell}
              style={{ display: 'flex', justifyContent: 'start' }}
            >
              <Typography className={styles.cellTextBold}>
                Calculation:
              </Typography>
              <Tooltip
                title={
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {getToolTipDescription(row, basis, rate, isIncome)}
                  </div>
                }
                placement="bottom"
                  arrow
                >
                  <InfoIcon size={14} className={styles.infoIcon} />
                </Tooltip>
                <Typography className={styles.cellText}>
                  {rateUtil?.getFormulaForUI(buildFormularInput(row, isIncome)) ??
                    ''}
                </Typography>
              </div>
            </td>
          </>
        );
      }

      if ([2, 5].includes(idx)) {
        const pickupText = [
          (row.truckCity ?? '').trim(),
          (row.truckZipCountry ?? '').trim(),
        ]
          .filter(Boolean)
          .join(' ');

        const notesFull = row.truckChargeNotes ?? '';
        const TRUNCATE_AT = 90;
        const isTruncated = notesFull.length > TRUNCATE_AT;
        const notesDisplay = isTruncated
          ? `${notesFull.substring(0, TRUNCATE_AT)}...`
          : notesFull;

        const isTruckingChargeRow =
          row.truckChargeGroup === 'PTC' || row.truckChargeGroup === 'DTC';
        const canEditTruckNotes =
          !editDisabled && isTruckingChargeRow && isAddNotesPickupDeliveryToggle;
        const canEditIncomeNotes =
          !editDisabled && isRatingNotesChangedToggle && !isTruckingChargeRow;
        const canEditExpenseNotes =
          !editDisabled && isExpenseNotesChangedToggle && !isTruckingChargeRow;
        const canEditRowNotes = isIncome
          ? canEditIncomeNotes || canEditTruckNotes
          : canEditExpenseNotes || canEditTruckNotes;

        return (
          <>
            <td colSpan={3} className={styles.descriptionCell}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                <Typography className={styles.cellTextBold}>Trucker:</Typography>
                {isTruckerSliderToggle && !editDisabled ? (
                  <PSingleValueSearchableField
                    id="trucker-name"
                    data={handlingVendorSuggestions}
                    displayFields={['SUGGEST_KEY']}
                    columnHeaders={[]}
                    value={row.truckerName || ''}
                    onChange={(val: string) => {
                      setHandlingVendorSuggestions(val);
                      onUpdateRow(row.rowId, isIncome, { truckerName: val });
                    }}
                    onSelect={(item: any) => {
                      onUpdateRow(row.rowId, isIncome, {
                        truckerName: (item as any).SUGGEST_VALUE || '',
                      });
                    }}
                  />
                ) : (
                  <Typography className={styles.cellText}>
                    {row.truckerName || ' '}
                  </Typography>
                )}
              </div>
            </td>

            {/* Pickup details */}
            <td colSpan={3} className={styles.descriptionCell}>
              <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                <Typography className={styles.cellTextBold}>
                  Pickup Details:
                </Typography>
                {isMultiPickupToggle ? (
                  <PSelect
                    disabled={editDisabled}
                  value={
                    isIncome
                      ? (row.pickupId || '')
                      : (row.expensePickupId || '')
                  }
                    onChange={(val: string) =>
                    onUpdateRow(
                      row.rowId,
                      isIncome,
                      isIncome
                        ? { pickupId: val }
                        : { expensePickupId: val }
                    )
                    }
                  options={[
                    { label: 'Please Select', value: '' },
                    ...pickupOptions,
                  ]}
                    displayEmpty
                    size="small"
                  />
                ) : (
                  <Typography className={styles.cellText}>
                    {pickupText || ' '}
                  </Typography>
                )}
              </div>
            </td>

            <td
              colSpan={
              (isModifyRatesActive
                ? isVATEnable
                  ? 6
                  : 5
                : isVATEnable
                  ? 5
                  : 4) +
              ((isOceanImportQuoteEnhancement && moduleType === MODULE_QUO && shippingType === TYPE_LCL) ||
               (moduleType === MODULE_PREBKG && shippingType === TYPE_LCL) ||
               (moduleType === MODULE_BKG && shippingType === TYPE_LCL)
                ? 1
                : 0)
            }
            className={
              isModifyRatesActive
                ? styles.descriptionCell
                : styles.descriptionCellLast
            }
          >
            <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
              <Typography className={styles.cellTextBold}>Notes:</Typography>
              {canEditRowNotes ? (
                <PTextField
                  value={notesFull}
                  onChange={(e) =>
                    onUpdateRow(row.rowId, isIncome, {
                      truckChargeNotes: e.target.value,
                    })
                  }
                  size="small"
                />
              ) : isTruncated ? (
                <Tooltip
                  title={
                    <div style={{ whiteSpace: 'pre-line', maxWidth: 400 }}>
                      {notesFull}
                    </div>
                  }
                  placement="top"
                  arrow
                >
                    <Typography
                      className={styles.cellText}
                      style={{ cursor: 'help' }}
                    >
                      {notesDisplay}
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography className={styles.cellText}>
                    {notesDisplay || ' '}
                  </Typography>
                )}
              </div>
            </td>
          </>
        );
      }

      return null;
    };

    return (
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <colgroup>
          <col style={{ width: '1.5%' }} />
          <col style={{ width: '1.5%' }} />
          <col style={{ width: '1.5%' }} />
          <col style={{ width: '1.5%' }} />
          <col style={{ width: '11%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
          <col style={{ width: '10%' }} />
            {shippingType === 'F' && <col style={{ width: '10%' }} />}
          {isModifyRatesActive ? (
            <col style={{ width: '5%' }} />
          ) : (
            <col style={{ width: '11%' }} />
          )}
          {isModifyRatesActive && <col style={{ width: '6%' }} />}
          {(
            (isOceanImportQuoteEnhancement && moduleType === MODULE_QUO && shippingType === TYPE_LCL) ||
            (moduleType === MODULE_PREBKG && shippingType === TYPE_LCL) ||
            (moduleType === MODULE_BKG && shippingType === TYPE_LCL)
          ) && (
            <col style={{ width: '12%' }} />
          )}
          <col style={{ width: '12%' }} />
          <col style={{ width: '12%' }} />
          <col style={{ width: '11%' }} />
          <col
            style={{
              width:
                isVATEnable && isModifyRatesActive
                  ? '8%'
                  : isVATEnable && !isModifyRatesActive
                    ? '11%'
                    : !isVATEnable && isModifyRatesActive
                      ? '13%'
                      : '16%',
            }}
          />
          {isVATEnable && <col style={{ width: '5%' }} />}
            {isModifyRatesActive && (
              <>
              <col style={{ width: '1.5%' }} />
              <col style={{ width: '1.5%' }} />
              </>
            )}
          </colgroup>

          {showHeader && (
            <thead>
              <tr>
                <th className={styles.headerCornerLeft} />
                <th className={styles.headerNoLeft} />
                <th className={styles.headerCell} />
                <th className={styles.headerCell} />
                <th className={styles.headerCell}>Name</th>
                <th className={styles.headerCell}>Origin/Destination</th>
                <th className={styles.headerCell}>Prepaid/Collect</th>
                <th className={styles.headerCell}>Basis</th>
                {shippingType === 'F' && <th className={styles.headerCell}>Equipment Details</th>}
                <th className={styles.headerCell}>Rate</th>
                {isModifyRatesActive && (
                  <th className={styles.headerCell}>Currency</th>
                )}
              {(
                (isOceanImportQuoteEnhancement && moduleType === MODULE_QUO && shippingType === TYPE_LCL) ||
                (moduleType === MODULE_PREBKG && shippingType === TYPE_LCL) ||
                (moduleType === MODULE_BKG && shippingType === TYPE_LCL)
              ) && (
                <th className={styles.headerCell}>Minimum</th>
              )}
                <th className={styles.headerCell}>Calculated Amount</th>
                <th className={styles.headerCell}>
                  {isInvoiceCurrencyToggle
                    ? `Amount (In ${invoiceCurrency})`
                    : `Amount In Local Currency`}
                </th>
                <th className={styles.headerCell}>Vendor</th>
                <th
                  className={
                    isVATEnable ? styles.headerCell : styles.headerCellNoRight
                  }
                >
                  Vendor Reference
                </th>
                {isVATEnable && <th className={styles.headerCellNoRight}>VAT</th>}
                {isModifyRatesActive && (
                  <>
                    <th className={styles.headerCellBorderLeft} />
                    <th className={styles.headerCornerRight} />
                  </>
                )}
              </tr>
            </thead>
          )}

          <tbody>
            {rows.map((row) => {
              const expanded = isRowExpanded(row.rowId);
              const effectiveShowTrucker =
                showTruckerRow && !row.incomeVAT?.startsWith('Y');
              const effectiveShowExpense = showExpenseRow && !row.isVatBean;
              const incomeRowCount = effectiveShowTrucker ? 3 : 2;
              const expenseRowCount = effectiveShowExpense
                ? effectiveShowTrucker
                  ? 3
                  : 2
                : 0;
              const totalExpandedRowSpan = incomeRowCount + expenseRowCount;

              return (
                <React.Fragment key={row.rowId}>
                  {expanded ? (
                    <>
                      <tr className={styles.tableRow}>
                        <td
                          rowSpan={totalExpandedRowSpan}
                          className={styles.iconCell}
                        >
                          <div onClick={() => toggleRow(row.rowId)}>
                            <img src={imgArrowExpanded} alt="" />
                          </div>
                        </td>
                        <td
                          rowSpan={totalExpandedRowSpan}
                          className={styles.iconCell}
                        >
                          <img
                            src={chargeTypeImg}
                            alt=""
                            width={16}
                            height={16}
                          />
                        </td>
                        <td rowSpan={incomeRowCount} className={styles.iconCell}>
                          <img src={imgIncome} width={16} alt="" />
                        </td>
                      {renderDataCells(row, 0, effectiveShowExpense)}
                      {isModifyRatesActive && (
                        <>
                          <td
                            rowSpan={totalExpandedRowSpan}
                            id={fieldIds.plusAnchor}
                            className={styles.actionCell}
                            tabIndex={0}
                            ref={(el) => {
                              plusButtonRefMap.current[row.rowId] = el;
                            }}
                            onClick={() => onAddRow(row.rowId)}
                          >
                            <img src={imgPlusEnable} alt="" />
                          </td>
                          <td
                            rowSpan={totalExpandedRowSpan}
                            id={fieldIds.minusAnchor}
                            className={
                              row.isVatBean
                                ? styles.actionCellDisabled
                                : styles.actionCell
                            }
                            onClick={() =>
                              !row.isVatBean && onRemoveRow(row.rowId)
                            }
                          >
                            <img src={imgMinusEnable} alt="" />
                          </td>
                        </>
                      )}
                    </tr>

                      <tr className={styles.tableRow}>
                        {renderDataCells(row, 1)}
                      </tr>

                      {effectiveShowTrucker && (
                        <tr className={styles.tableRow}>
                          {renderDataCells(row, 2)}
                        </tr>
                      )}

                      {effectiveShowExpense && (
                        <>
                          <tr className={styles.tableRow}>
                            <td
                              rowSpan={expenseRowCount}
                              className={styles.iconCell}
                            >
                              <img src={imgExpense} width={16} alt="" />
                            </td>
                            {renderDataCells(row, 3)}
                          </tr>

                          <tr className={styles.tableRow}>
                            {renderDataCells(row, 4)}
                          </tr>

                          {effectiveShowTrucker && (
                            <tr className={styles.tableRow}>
                              {renderDataCells(row, 5)}
                            </tr>
                          )}
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <tr className={styles.tableRow}>
                        <td
                          rowSpan={effectiveShowExpense ? 2 : 1}
                          className={styles.iconCell}
                        >
                          <div onClick={() => toggleRow(row.rowId)}>
                            <img src={imgArrowCollapsed} alt="" />
                          </div>
                        </td>
                        <td
                          rowSpan={effectiveShowExpense ? 2 : 1}
                          className={styles.iconCell}
                        >
                          <img
                            src={chargeTypeImg}
                            alt=""
                            width={16}
                            height={16}
                          />
                        </td>
                        <td className={styles.iconCell}>
                          <img
                            src={imgIncome}
                            className={styles.imgSmall}
                            alt=""
                          />
                        </td>
                      {renderDataCells(row, 0, effectiveShowExpense)}
                      {isModifyRatesActive && (
                        <>
                          <td
                            rowSpan={effectiveShowExpense ? 2 : 1}
                            id={fieldIds.plusAnchor}
                            className={styles.actionCell}
                            tabIndex={0}
                            ref={(el) => {
                              plusButtonRefMap.current[row.rowId] = el;
                            }}
                            onClick={() => onAddRow(row.rowId)}
                          >
                            <img src={imgPlusEnable} alt="" />
                          </td>
                          <td
                            rowSpan={effectiveShowExpense ? 2 : 1}
                            id={fieldIds.minusAnchor}
                            className={
                              row.isVatBean
                                ? styles.actionCellDisabled
                                : styles.actionCell
                            }
                            onClick={() =>
                              !row.isVatBean && onRemoveRow(row.rowId)
                            }
                          >
                            <img src={imgMinusEnable} alt="" />
                          </td>
                        </>
                      )}
                    </tr>

                      {effectiveShowExpense && (
                        <tr className={`${styles.tableRow} ${styles.expenseRow}`}>
                          <td className={styles.iconCell}>
                            <img src={imgExpense} width={16} alt="" />
                          </td>
                          {renderDataCells(row, 3)}
                        </tr>
                      )}
                    </>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

export default PRateDetailsPickupChargesRow;
