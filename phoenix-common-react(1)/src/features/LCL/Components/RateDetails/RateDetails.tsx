import { Box, Button, CircularProgress, Collapse, Typography } from '@mui/material';
import {
  PConfirmationModal,
  PModal,
  PRippleButton,
  PSelect,
  PSingleValueSearchableField,
} from 'phoenix-react-lib';
import React, { useEffect, useMemo, useState } from 'react';
import imgOFR from '../../../../assets/img_ocean_freight.png';
import imgFOB from '../../../../assets/img_origin_charges.png';
import imgPLC from '../../../../assets/img_post_landing_charges.png';
import imgArrowCollapsed from '../../../../assets/rate_arrow_collapsed.png';
import imgArrowExpanded from '../../../../assets/rate_arrow_expanded.png';

import imgRateReset from '../../../../assets/rate_reset.png';
import { CommonToggleKeys, MODULE_BKG, MODULE_PREBKG, MODULE_QUO, OceanToggleKeys } from '../../../../core';
import {
  handlingCurrencySuggestionConfig,
  useDecimalCurrencyConfig,
  useFeatureToggle,
  useGetSuggestions,
} from '../../../../hooks';
import styles from '../../../../styles/LCL/RateDetails.module.css';
import {
  BookingQuoteChargeBeanFull,
  ChargeType,
  CurrencyEntry,
  RateDetailsProps,
  ReferenceOption,
  RowData,
  SectionData,
} from '../../../../types/LCL/RateDetails/RateDetails.types';
import { createBlankBeanRow } from '../../../../types/LCL/RateDetails/rateDetailsHelper';
import PRateDetailsAccordion from './PRateDetailsAccordian';
import PRateDetailsCurrencyConverter from './PRateDetailsCurrencyConverter';
import PRateDetailsPickupChargesRow from './PRateDetailsPickupChargesRow';
import PRateDetailsShipmentSummery from './PRateDetailsShipmentSummery';
import PRateDetailsTotalCharge from './PRateDetailsTotalCharge';
import { getAccordionSectionFieldIds, getRateDetailsFieldIds } from './RateDetailsIds.config';

export const formatReferenceDisplay = (item: ReferenceOption): string =>
  `${item.code} - ${item.name}`;

const buildRoeMap = (
  rows: BookingQuoteChargeBeanFull[]
): Record<string, number> => {
  const map: Record<string, number> = {};
  rows.forEach((r) => {
    if (r.transactionalFlag === 'D') return;
    if (r.incomeCurrency && r.incomeAmount > 0) {
      map[r.incomeCurrency] = r.incomeLocalAmount / r.incomeAmount;
    }
    if (r.expenseCurrency && r.expenseAmount > 0) {
      map[r.expenseCurrency] = r.expenseLocalAmount / r.expenseAmount;
    }
  });
  return map;
};

const sumIncomeLocal = (rows: BookingQuoteChargeBeanFull[]): number =>
  rows.reduce((acc, r) => acc + (r.incomeLocalAmount || 0), 0);

const sumExpenseLocal = (rows: BookingQuoteChargeBeanFull[]): number =>
  rows.reduce((acc, r) => acc + (r.expenseLocalAmount || 0), 0);

const buildEntries = (
  localTotal: number,
  localCurrency: string,
  invoiceCurrency: string,
  roeMap: Record<string, number>
): CurrencyEntry[] => {
  const entries: CurrencyEntry[] = [];

  const invoiceROE = roeMap[invoiceCurrency];
  const invoiceAmount =
    invoiceCurrency === localCurrency
      ? localTotal
      : invoiceROE > 0
        ? localTotal / invoiceROE
        : 0;

  entries.push({
    currency: invoiceCurrency,
    amount: invoiceAmount,
  });

  if (localCurrency !== invoiceCurrency) {
    entries.push({
      currency: localCurrency,
      amount: localTotal,
    });
  }

  Object.keys(roeMap)
    .filter((c) => c !== localCurrency && c !== invoiceCurrency)
    .sort()
    .forEach((currency) => {
      const roe = roeMap[currency];
      entries.push({
        currency,
        amount: roe > 0 ? localTotal / roe : 0,
      });
    });

  return entries;
};

const RateDetails: React.FC<RateDetailsProps> = ({
  defaultState,
  formData,
  handlers,
  moduleType,
  containerType,
  cargoMetrics,
  pickupCargoMetricsMap,
  onFieldsChange,
  onRegisterFields,
  shippingType,
  shipmentDirection,
}) => {
  const {
    setIsResetDialogOpen,
    setLocalCurrency,
    setInvoiceCurrency,
    setIsVATEnable,
    handleRatingTypeChange,
    handleROEFieldsChange,
    handleROERowsChange,
    handleRateDetailsChargesChange,
    handleToggleButtonChange,
    handleCurrencySelectFromChargeRow,
    handleCurrencySelectFromRoeRow,
    handleCurrencySelectFromInvoiceCurrency,
    handleRoeRowAdd,
    handleRoeRowRemove,
    handleRoeTypeChange,
    handleRoeRowUpdate,
    handleRoeRowBlur,
    clearRoeWarning,
    handleChargeRowAdd,
    handleChargeRowRemove,
    handleChargeRowUpdate,
    handleChargeNameChange,
    handleChargeNameClear,
    handlePrepaidCollectChange,
    handleIncomeBasisChange,
    handleExpenseBasisChange,
    handleIncomeRateChange,
    handleExpenseRateChange,
    handleVendorCommit,
    clearChargeWarning,
    resetRateDetails,
    handleResetConfirm,
    handleKeepOfrDecision,
    recalculateInvoiceROE,
    handleCurrencyChangeRecalculate,
    handleDuplicateChargeConfirm,
    handleDuplicateChargeCancel,
    handleAccurateConfirm,
    handleAccurateCancel,
  } = handlers;

  const {
    isAccuRatePopulated,
    isAccurateConfirmDialogOpen,
    isAccurateLoading,
    isResetDialogOpen,
    ratingType,
    roeType,
    localCurrency,
    invoiceCurrency,
    isPickupExpanded,
    isExpandShipmentSummaryDetailsActive,
    isExpandRateOfExchangeActive,
    isPrintPlcConfirmationActive,
    isExpandChargeDetailsActive,
    isModifyRatesActive,
    isVATEnable,
    rateUtil,
    liveRateData,
    roeWarning,
    isKeepOfrDialogOpen,
    chargeWarning,
    showPickupSection,
    showDoorDeliverySection,
    duplicateChargeDialog,
    ratingOptions,
    equipmentDetailsList,
    chargeTypeToShowExpense,
  } = defaultState;


  const [invoiceCurrencyDraft, setInvoiceCurrencyDraft] = useState<
    string | null
  >(null);

  const pageLoadFirstTime = React.useRef(true);
  useEffect(() => {
    if(shippingType === "F")
    {
      pageLoadFirstTime.current = true;
    }
  },[shippingType])

  const decimalCurrencyConfig = useDecimalCurrencyConfig();

  // ****** Feature Toggle Start **********
  const featureToggle = useFeatureToggle();
  const { isVisible, getToggleValue } = featureToggle;

  const isTruckingRateToggle =
    isVisible(CommonToggleKeys.BKG_QUOTE_TRUCKING_RATES_INTEGRATION) ||
    isVisible(CommonToggleKeys.OCN_BKG_QUOTE_PICKUP_RATES_INTEGRATION);

  const showExpenseForChargeType = (chargeType: string): boolean =>
    chargeTypeToShowExpense.length > 0
      ? chargeTypeToShowExpense.includes(chargeType)
      : isVisible(CommonToggleKeys.OCN_RATES_SHOW_EXPENSE);

  const isUpdatePlcToggle =
    moduleType === MODULE_BKG
      ? isVisible(CommonToggleKeys.OCEAN_UPDATE_PLC_CHARGE_BKG)
      : moduleType === MODULE_QUO
        ? isVisible(CommonToggleKeys.OCEAN_UPDATE_PLC_CHARGE_QUO)
        : moduleType === MODULE_PREBKG
          ? true
          : false;

  const isMultiPortQuote =
    moduleType === MODULE_QUO &&
    isVisible(CommonToggleKeys.SHOW_MULTIPORT_PAIR_IN_QUOTE);

  // ****** Feature Toggle End **********
  const {
    data: handlingCurrencySuggestions,
    setQuery: setHandlingCurrencySuggestions,
  } = useGetSuggestions(handlingCurrencySuggestionConfig);

  const printPLCButtonTitle =
    moduleType === MODULE_QUO
      ? 'Print PLC in Quote Confirmation'
      : moduleType === MODULE_BKG
        ? 'Print PLC in Booking Confirmation'
        : 'Print PLC in Quote Confirmation';

  const selectedRatingType = formData?.ratingType ?? ratingType;

  const allRows: BookingQuoteChargeBeanFull[] = formData?.charges?.rateDetails;
  const pickupRows = allRows.filter((r) => r.truckChargeGroup === 'PTC');

  const doorDeliveryRows = allRows.filter((r) => r.truckChargeGroup === 'DTC');

  const fobOriginRows = allRows.filter(
    (r) =>
      r.incomeChargeDetails?.chargeType === 'FOB' &&
      r.truckChargeGroup !== 'PTC'
  );

  const oceanFreightRows = allRows.filter(
    (r) => r.incomeChargeDetails?.chargeType === 'OFR'
  );

  const plcRows = allRows.filter(
    (r) =>
      r.incomeChargeDetails?.chargeType === 'PLC' &&
      r.truckChargeGroup !== 'DTC'
  );

  const occRows = allRows.filter(
    (r) => r.incomeChargeDetails?.chargeType === 'OCC'
  );

  const pickupIdSetKey = useMemo(
    () => Object.keys(pickupCargoMetricsMap ?? {}).sort().join(','),
    [pickupCargoMetricsMap]
  );

  const pickupOptions = useMemo(() => {
    const ids = pickupIdSetKey ? pickupIdSetKey.split(',') : [];
    const labelMap: Record<string, string> = {};
    pickupRows.forEach((r) => {
      if (r.pickupId && !labelMap[r.pickupId]) {
        const lbl = [r.truckCity, r.truckZipCountry].filter(Boolean).join(' ');
        if (lbl) labelMap[r.pickupId] = lbl;
      }
    });
    return ids.map((id) => ({
      value: id,
      label: labelMap[id] || `Pickup ${id}`,
    }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickupIdSetKey]);

  const roeMap = useMemo(() => {
    const map: Record<string, number> = {};
    formData.rateOfExchange.roeRows.forEach((r) => {
      if (r.currency) {
        map[r.currency.toUpperCase()] = Number(r.invoiceCurrencyROE) || 0;
      }
    });
    return map;
  }, [formData.rateOfExchange.roeRows]);

  const incomeData = useMemo<RowData>(() => {
    const buildSection = (
      groups: BookingQuoteChargeBeanFull[]
    ): SectionData => ({
      entries: buildEntries(
        sumIncomeLocal(groups),
        localCurrency,
        invoiceCurrency,
        roeMap
      ),
    });
    return {
      oceanFreight: buildSection(oceanFreightRows),
      originCharges: buildSection([...pickupRows, ...fobOriginRows]),
      commonCharges: buildSection(occRows),
      postLandingCharges: buildSection([...plcRows, ...doorDeliveryRows]),
    };
  }, [
    oceanFreightRows,
    pickupRows,
    fobOriginRows,
    occRows,
    plcRows,
    doorDeliveryRows,
    localCurrency,
    invoiceCurrency,
    roeMap,
  ]);

  const expenseData = useMemo<RowData>(() => {
    const buildSection = (
      groups: BookingQuoteChargeBeanFull[]
    ): SectionData => ({
      entries: buildEntries(
        sumExpenseLocal(groups),
        localCurrency,
        invoiceCurrency,
        roeMap
      ),
    });
    return {
      oceanFreight: buildSection(oceanFreightRows),
      originCharges: buildSection([...pickupRows, ...fobOriginRows]),
      commonCharges: buildSection(occRows),
      postLandingCharges: buildSection([...plcRows, ...doorDeliveryRows]),
    };
  }, [
    oceanFreightRows,
    pickupRows,
    fobOriginRows,
    occRows,
    plcRows,
    doorDeliveryRows,
    localCurrency,
    invoiceCurrency,
    roeMap,
  ]);

  useEffect(() => {
    onRegisterFields?.([]);
  }, []);

  useEffect(() => {
    onFieldsChange?.(formData);
  }, [formData]);

  const isRoeDisabled = ratingType === '' || !isModifyRatesActive;

  const isInvoiceCurrencyToggle =
    moduleType === MODULE_QUO
      ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_QUOTE)
      : moduleType === MODULE_BKG
        ? isVisible(OceanToggleKeys.INVOICE_CURRENCY_OCEAN_BOOKING)
        : moduleType === MODULE_PREBKG
          ? false
          : false;


  const roeOptions = [
    { label: 'Please Select', value: '' },
    { label: 'Manual', value: 'M' },
    { label: 'Live Rates', value: 'L' },
  ];

  const handleRatingTypeSelection = (value: string) => {
    if (value === selectedRatingType) return;

    if (value === 'M') {
      handleToggleButtonChange('isModifyRatesActive', true);
    } 

    handleRatingTypeChange(value);
  };

  const seedingInFlight = React.useRef(false);

  useEffect(() => {
    if (seedingInFlight.current) {
      seedingInFlight.current = false;
      return;
    }

    const currentRows = formData?.charges?.rateDetails;

    const panelsToCheck: Array<{
      type: ChargeType;
      rows: BookingQuoteChargeBeanFull[];
    }> = [
      ...(isTruckingRateToggle && showPickupSection
        ? [
            {
              type: 'PTC' as ChargeType,
              rows: currentRows.filter(
                (r) =>
                  r.incomeChargeDetails?.chargeType === 'FOB' &&
                  r.truckChargeGroup === 'PTC'
              ),
            },
          ]
        : []),
      {
        type: 'FOB' as ChargeType,
        rows: currentRows.filter(
          (r) =>
            r.incomeChargeDetails?.chargeType === 'FOB' &&
            r.truckChargeGroup !== 'PTC'
        ),
      },
      {
        type: 'OFR' as ChargeType,
        rows: currentRows.filter(
          (r) => r.incomeChargeDetails?.chargeType === 'OFR'
        ),
      },
      ...(showDoorDeliverySection
        ? [
            {
              type: 'DTC' as ChargeType,
              rows: currentRows.filter(
                (r) =>
                  r.incomeChargeDetails?.chargeType === 'PLC' &&
                  r.truckChargeGroup === 'DTC'
              ),
            },
          ]
        : []),
    ];

    // const missing = panelsToCheck.filter((p) => p.rows.length === 0);
    // if (missing.length === 0) return;

    // const seededRows = [
    //   ...currentRows,
    //   ...missing.map((p) => createBlankBeanRow(p.type)),
    // ];
const rowsToAdd: BookingQuoteChargeBeanFull[] = [];

  panelsToCheck.forEach((panel) => {
    // Special case for OFR in FCL
    if (shippingType === 'F' && panel.type === 'OFR' && pageLoadFirstTime.current) {
      const requiredRows = 5;
      const missingCount = requiredRows - panel.rows.length;
      if (missingCount > 0) {
        for (let i = 0; i < missingCount; i++) {
          rowsToAdd.push(createBlankBeanRow('OFR'));
        }
      }
      pageLoadFirstTime.current = false;
    } else {
      // Default behavior → minimum 1 row
      if (panel.rows.length === 0) {
        rowsToAdd.push(createBlankBeanRow(panel.type));
      }
    }
  });

  if (rowsToAdd.length === 0) return;

  const seededRows = [...currentRows, ...rowsToAdd];
    seedingInFlight.current = true;
    handleRateDetailsChargesChange(seededRows);
  }, [
    formData?.charges?.rateDetails,
    showPickupSection,
    showDoorDeliverySection,
    isTruckingRateToggle,
    shippingType
  ]);

  const prevPrintPlcRef = React.useRef(isPrintPlcConfirmationActive);
  useEffect(() => {
    if (prevPrintPlcRef.current === isPrintPlcConfirmationActive) return;
    prevPrintPlcRef.current = isPrintPlcConfirmationActive;
    const updated = formData.charges.rateDetails.map((r) =>
      r.incomeChargeDetails?.chargeType === 'PLC'
        ? { ...r, isPrintOnDocument: isPrintPlcConfirmationActive }
        : r
    );
    handleRateDetailsChargesChange(updated);
  }, [isPrintPlcConfirmationActive]);

  const firstVisibleSection: 'PTC' | 'FOB' | 'OFR' | 'PLC' | 'DTC' =
    isTruckingRateToggle && showPickupSection ? 'PTC' : 'FOB';

  const fieldIds = getRateDetailsFieldIds(moduleType);
  const accordionIds = getAccordionSectionFieldIds(moduleType);

  return (
    <div className={styles.wrapper}>
      {isExpandRateOfExchangeActive && (
        <div className={styles.roeSection}>
          <Typography className={styles.roeTitle}>Rate Of Exchange</Typography>
          <div className={styles.roeFieldsRow}>
            <Box>
              <PSelect
                value={roeType}
                onChange={handleRoeTypeChange}
                options={roeOptions}
                displayEmpty
                disabled={isRoeDisabled}
                label="Rate of Exchange Type"
              />
            </Box>
          </div>
          <div className={styles.roeCurrencyRow}>
            <PRateDetailsCurrencyConverter
              rows={formData.rateOfExchange.roeRows}
              onUpdateRow={handleRoeRowUpdate}
              onAddRow={handleRoeRowAdd}
              onRemoveRow={handleRoeRowRemove}
              onBlurRow={handleRoeRowBlur}
              disabled={isRoeDisabled}
              liveRates={liveRateData?.result ?? undefined}
              roeType={roeType}
              onCurrencySelect={(rowId: string, currency: string) => {
                handleCurrencySelectFromRoeRow(rowId, currency);
              }}
              localCurrency={localCurrency}
              invoiceCurrency={invoiceCurrency}
              invoiceCurrencyToggle={isInvoiceCurrencyToggle}
              roeWarning={roeWarning}
              onClearRoeWarning={clearRoeWarning}
            />
          </div>
        </div>
      )}

      {isExpandShipmentSummaryDetailsActive && (
        <PRateDetailsShipmentSummery
          moduleType={moduleType}
          data={formData.shipmentSummary}
        />
      )}

      <div className={styles.controlsRow}>
        <div className={styles.controlsWrapper}>
          <div className={styles.controlsTop}>
            <div
              id={fieldIds.pickupTruckingCollapsibleButton}
              onClick={() =>
                handleToggleButtonChange('isPickupExpanded', !isPickupExpanded)
              }
              className={styles.pickupToggle}
            >
              <div id={fieldIds.pickupTruckingCollapsibleIconButton} className={styles.pickupArrowContainer}>
                {isPickupExpanded ? (
                  <img src={imgArrowExpanded} alt="" />
                ) : (
                  <img src={imgArrowCollapsed} alt="" />
                )}
              </div>
              <Typography className={styles.accordionTitle}>
                Pickup Charges
              </Typography>
            </div>

            <div className={styles.rippleButtonsRow}>
              <PRippleButton
                id={fieldIds.expandShipmentSummaryButton}
                onClick={() =>
                  handleToggleButtonChange(
                    'isExpandShipmentSummaryDetailsActive',
                    !isExpandShipmentSummaryDetailsActive
                  )
                }
                title={'Expand Shipment Summary Details'}
                active={isExpandShipmentSummaryDetailsActive}
              />
              <PRippleButton
                id={fieldIds.expandRateOfExchangeButton}
                onClick={() =>
                  handleToggleButtonChange(
                    'isExpandRateOfExchangeActive',
                    !isExpandRateOfExchangeActive
                  )
                }
                title={'Expand Rate of Exchange'}
                active={isExpandRateOfExchangeActive}
              />
              <PRippleButton
                id={fieldIds.includePLCButton}
                onClick={() =>
                  handleToggleButtonChange(
                    'isPrintPlcConfirmationActive',
                    !isPrintPlcConfirmationActive
                  )
                }
                title={printPLCButtonTitle}
                active={isPrintPlcConfirmationActive}
              />
              <PRippleButton
                id={fieldIds.expandChargeDetailsButton}
                onClick={() =>
                  handleToggleButtonChange(
                    'isExpandChargeDetailsActive',
                    !isExpandChargeDetailsActive
                  )
                }
                title={'Expand Charge Details'}
                active={isExpandChargeDetailsActive}
              />
              <PRippleButton
                id={fieldIds.modifyRatesButton}
                onClick={() =>
                  handleToggleButtonChange(
                    'isModifyRatesActive',
                    !isModifyRatesActive
                  )
                }
                title={'Modify Rates'}
                active={isModifyRatesActive}
              />
            </div>

            <div>
              {isInvoiceCurrencyToggle && (
                <PSingleValueSearchableField
                  label="Invoice Currency"
                  id="reference"
                  data={handlingCurrencySuggestions}
                  displayFields={['SUGGEST_VALUE']}
                  displayValueField="SUGGEST_KEY"
                  columnHeaders={[]}
                  value={invoiceCurrencyDraft ?? invoiceCurrency}
                  onChange={(val: string) => {
                    setHandlingCurrencySuggestions(val);
                    setInvoiceCurrencyDraft(val);
                  }}
                  onSelect={(item) => {
                    const parts = item.SUGGEST_VALUE.split('-');
                    const code = (parts[0] || '').trim();
                    setInvoiceCurrencyDraft(null);
                    handleCurrencySelectFromInvoiceCurrency(code);
                    setInvoiceCurrency(code);
                    handleCurrencyChangeRecalculate(code);
                  }}
                />
              )}
            </div>
          </div>

          <div className={styles.ratingRow}>
            <Typography className={styles.ratingLabel}>Rating Type</Typography>
            <PSelect
              id={fieldIds.rateTypeSelectionListBox}
              value={selectedRatingType}
              onChange={(e: string) => {
                handleRatingTypeSelection(e);
              }}
              displayEmpty
              size="small"
              options={ratingOptions}
              required
            />
            <div
              onClick={() => setIsResetDialogOpen(true)}
              className={styles.resetBtn}
            >
              <img src={imgRateReset} alt="" />
            </div>
          </div>
        </div>
      </div>

      {isTruckingRateToggle && showPickupSection && (
        <Collapse in={isPickupExpanded}>
          <Box>
            <PRateDetailsPickupChargesRow
              chargeType="PTC"
              rows={pickupRows}
              onUpdateRow={handleChargeRowUpdate}
              onAddRow={handleChargeRowAdd}
              onRemoveRow={handleChargeRowRemove}
              onCurrencySelect={handleCurrencySelectFromChargeRow}
              chargeTypeImg={imgFOB}
              isExpanded={isExpandChargeDetailsActive}
              showHeader={firstVisibleSection === 'PTC'}
              showExpenseRow={showExpenseForChargeType('PTC')}
              showTruckerRow
              isModifyRatesActive={isModifyRatesActive}
              isVATEnable={isVATEnable}
              allRows={allRows}
              pickupOptions={pickupOptions}
              cargoMetrics={cargoMetrics}
              pickupCargoMetricsMap={pickupCargoMetricsMap}
              rateUtil={rateUtil}
              roeRows={formData.rateOfExchange.roeRows}
              localCurrency={localCurrency}
              invoiceCurrency={invoiceCurrency}
              featureToggle={featureToggle}
              moduleType={moduleType}
              decimalCurrencyConfig={decimalCurrencyConfig}
              onChargeNameChange={handleChargeNameChange}
              onChargeNameClear={handleChargeNameClear}
              onPrepaidCollectChange={handlePrepaidCollectChange}
              onIncomeBasisChange={handleIncomeBasisChange}
              onExpenseBasisChange={handleExpenseBasisChange}
              onIncomeRateChange={handleIncomeRateChange}
              onExpenseRateChange={handleExpenseRateChange}
              onVendorCommit={handleVendorCommit}
              shippingType={shippingType}
              equipmentDetailsList={equipmentDetailsList}
              shipmentDirection={shipmentDirection}
            />
          </Box>
        </Collapse>
      )}

      <div className={styles.accordionStack}>
        <PRateDetailsAccordion
          title="Origin Charges (FOB)"
          forceExpanded={isAccuRatePopulated}
          buttonId={accordionIds.fob?.collapsibleButton}
          iconButtonId={accordionIds.fob?.collapsibleIconButton}
        >
          <Box>
            <PRateDetailsPickupChargesRow
              chargeType="FOB"
              rows={fobOriginRows}
              onUpdateRow={handleChargeRowUpdate}
              onAddRow={handleChargeRowAdd}
              onRemoveRow={handleChargeRowRemove}
              onCurrencySelect={handleCurrencySelectFromChargeRow}
              chargeTypeImg={imgFOB}
              isExpanded={isExpandChargeDetailsActive}
              showHeader={firstVisibleSection === 'FOB'}
              showExpenseRow={showExpenseForChargeType('FOB')}
              showTruckerRow={false}
              isModifyRatesActive={isModifyRatesActive}
              hideAddRemove={isAccuRatePopulated}
              isVATEnable={isVATEnable}
              allRows={allRows}
              cargoMetrics={cargoMetrics}
              rateUtil={rateUtil}
              roeRows={formData.rateOfExchange.roeRows}
              localCurrency={localCurrency}
              invoiceCurrency={invoiceCurrency}
              featureToggle={featureToggle}
              moduleType={moduleType}
              decimalCurrencyConfig={decimalCurrencyConfig}
              onChargeNameChange={handleChargeNameChange}
              onChargeNameClear={handleChargeNameClear}
              onPrepaidCollectChange={handlePrepaidCollectChange}
              onIncomeBasisChange={handleIncomeBasisChange}
              onExpenseBasisChange={handleExpenseBasisChange}
              onIncomeRateChange={handleIncomeRateChange}
              onExpenseRateChange={handleExpenseRateChange}
              onVendorCommit={handleVendorCommit}
              shippingType={shippingType}
              equipmentDetailsList={equipmentDetailsList}
              shipmentDirection={shipmentDirection}
            />
          </Box>
        </PRateDetailsAccordion>
        <PRateDetailsAccordion
          title="Ocean Freight (OFR) Charges"
          forceExpanded={isAccuRatePopulated}
          buttonId={accordionIds.ofrFob?.collapsibleButton}
          iconButtonId={accordionIds.ofrFob?.collapsibleIconButton}
        >
          <Box>
            <PRateDetailsPickupChargesRow
              chargeType="OFR"
              rows={oceanFreightRows}
              onUpdateRow={handleChargeRowUpdate}
              onAddRow={handleChargeRowAdd}
              onRemoveRow={handleChargeRowRemove}
              onCurrencySelect={handleCurrencySelectFromChargeRow}
              chargeTypeImg={imgOFR}
              isExpanded={isExpandChargeDetailsActive}
              showHeader={false}
              showExpenseRow={showExpenseForChargeType('OFR')}
              showTruckerRow={false}
              isModifyRatesActive={isModifyRatesActive}
              hideAddRemove={isAccuRatePopulated}
              isVATEnable={isVATEnable}
              allRows={allRows}
              cargoMetrics={cargoMetrics}
              rateUtil={rateUtil}
              roeRows={formData.rateOfExchange.roeRows}
              localCurrency={localCurrency}
              invoiceCurrency={invoiceCurrency}
              featureToggle={featureToggle}
              moduleType={moduleType}
              decimalCurrencyConfig={decimalCurrencyConfig}
              onChargeNameChange={handleChargeNameChange}
              onChargeNameClear={handleChargeNameClear}
              onPrepaidCollectChange={handlePrepaidCollectChange}
              onIncomeBasisChange={handleIncomeBasisChange}
              onExpenseBasisChange={handleExpenseBasisChange}
              onIncomeRateChange={handleIncomeRateChange}
              onExpenseRateChange={handleExpenseRateChange}
              onVendorCommit={handleVendorCommit}
              shippingType={shippingType}
              equipmentDetailsList={equipmentDetailsList}
              shipmentDirection={shipmentDirection}
            />
          </Box>
        </PRateDetailsAccordion>
        <PRateDetailsAccordion
          title="Post Landing Charges"
          forceExpanded={isAccuRatePopulated}
          buttonId={accordionIds.plc?.collapsibleButton}
          iconButtonId={accordionIds.plc?.collapsibleIconButton}
        >
          <Box>
            <PRateDetailsPickupChargesRow
              chargeType="PLC"
              rows={plcRows}
              onUpdateRow={handleChargeRowUpdate}
              onAddRow={handleChargeRowAdd}
              onRemoveRow={handleChargeRowRemove}
              onCurrencySelect={handleCurrencySelectFromChargeRow}
              chargeTypeImg={imgPLC}
              isExpanded={isExpandChargeDetailsActive}
              showHeader={false}
              showExpenseRow={showExpenseForChargeType('PLC')}
              showTruckerRow={false}
              isModifyRatesActive={isModifyRatesActive && isUpdatePlcToggle}
              hideAddRemove={isAccuRatePopulated}
              isVATEnable={isVATEnable}
              allRows={allRows}
              cargoMetrics={cargoMetrics}
              rateUtil={rateUtil}
              roeRows={formData.rateOfExchange.roeRows}
              localCurrency={localCurrency}
              invoiceCurrency={invoiceCurrency}
              featureToggle={featureToggle}
              moduleType={moduleType}
              decimalCurrencyConfig={decimalCurrencyConfig}
              onChargeNameChange={handleChargeNameChange}
              onChargeNameClear={handleChargeNameClear}
              onPrepaidCollectChange={handlePrepaidCollectChange}
              onIncomeBasisChange={handleIncomeBasisChange}
              onExpenseBasisChange={handleExpenseBasisChange}
              onIncomeRateChange={handleIncomeRateChange}
              onExpenseRateChange={handleExpenseRateChange}
              onVendorCommit={handleVendorCommit}
              shippingType={shippingType}
              equipmentDetailsList={equipmentDetailsList}
              shipmentDirection={shipmentDirection}
            />
          </Box>
        </PRateDetailsAccordion>

        {isMultiPortQuote && (
          <PRateDetailsAccordion title="Other Carrier Charges (OCC)">
            <Box>
              <PRateDetailsPickupChargesRow
                chargeType="OCC"
                rows={occRows}
                onUpdateRow={handleChargeRowUpdate}
                onAddRow={handleChargeRowAdd}
                onRemoveRow={handleChargeRowRemove}
                onCurrencySelect={handleCurrencySelectFromChargeRow}
                chargeTypeImg={imgOFR}
                isExpanded={isExpandChargeDetailsActive}
                showHeader={false}
                showExpenseRow={showExpenseForChargeType('OCC')}
                showTruckerRow={false}
                isModifyRatesActive={isModifyRatesActive}
                isVATEnable={isVATEnable}
                allRows={allRows}
                cargoMetrics={cargoMetrics}
                rateUtil={rateUtil}
                roeRows={formData.rateOfExchange.roeRows}
                localCurrency={localCurrency}
                invoiceCurrency={invoiceCurrency}
                featureToggle={featureToggle}
                moduleType={moduleType}
                decimalCurrencyConfig={decimalCurrencyConfig}
                onChargeNameChange={handleChargeNameChange}
                onChargeNameClear={handleChargeNameClear}
                onPrepaidCollectChange={handlePrepaidCollectChange}
                onIncomeBasisChange={handleIncomeBasisChange}
                onExpenseBasisChange={handleExpenseBasisChange}
                onIncomeRateChange={handleIncomeRateChange}
                onExpenseRateChange={handleExpenseRateChange}
                onVendorCommit={handleVendorCommit}
                shippingType={shippingType}
                equipmentDetailsList={equipmentDetailsList}
              />
            </Box>
          </PRateDetailsAccordion>
        )}

        {showDoorDeliverySection && (
          <PRateDetailsAccordion
            title="Door Delivery Charges"
            buttonId={accordionIds.doorDeliveryTrucking?.collapsibleButton}
            iconButtonId={accordionIds.doorDeliveryTrucking?.collapsibleIconButton}
          >
            <Box>
              <PRateDetailsPickupChargesRow
                chargeType="DTC"
                rows={doorDeliveryRows}
                onUpdateRow={handleChargeRowUpdate}
                onAddRow={handleChargeRowAdd}
                onRemoveRow={handleChargeRowRemove}
                onCurrencySelect={handleCurrencySelectFromChargeRow}
                chargeTypeImg={imgPLC}
                isExpanded={isExpandChargeDetailsActive}
                showHeader={false}
                showExpenseRow={showExpenseForChargeType('DTC')}
                showTruckerRow
                isModifyRatesActive={isModifyRatesActive}
                isVATEnable={isVATEnable}
                allRows={allRows}
                cargoMetrics={cargoMetrics}
                rateUtil={rateUtil}
                roeRows={formData.rateOfExchange.roeRows}
                localCurrency={localCurrency}
                invoiceCurrency={invoiceCurrency}
                featureToggle={featureToggle}
                moduleType={moduleType}
                decimalCurrencyConfig={decimalCurrencyConfig}
                onChargeNameChange={handleChargeNameChange}
                onChargeNameClear={handleChargeNameClear}
                onPrepaidCollectChange={handlePrepaidCollectChange}
                onIncomeBasisChange={handleIncomeBasisChange}
                onExpenseBasisChange={handleExpenseBasisChange}
                onIncomeRateChange={handleIncomeRateChange}
                onExpenseRateChange={handleExpenseRateChange}
                onVendorCommit={handleVendorCommit}
                shippingType={shippingType}
                equipmentDetailsList={equipmentDetailsList}
              />
            </Box>
          </PRateDetailsAccordion>
        )}

        <Box>
          <PRateDetailsTotalCharge
            incomeData={incomeData}
            expenseData={expenseData}
            invoiceCurrency={invoiceCurrency}
          />
        </Box>
      </div>

      <PConfirmationModal
        open={!!isAccurateConfirmDialogOpen}
        title="Confirmation"
        message="Do you want to re-call Accurate?"
        variant="warning"
        primaryAction={{
          label: 'Yes',
          onClick: () => handleAccurateConfirm?.(),
        }}
        secondaryAction={{
          label: 'No',
          onClick: () => handleAccurateCancel?.(),
        }}
        onClose={() => handleAccurateCancel?.()}
      />

      <PConfirmationModal
        open={duplicateChargeDialog.open}
        title="Please Confirm"
        message={`We have two same charge codes (${duplicateChargeDialog.chargeCode}) with different sell basis. Do you want to delete the charge with the lower amount?`}
        variant="warning"
        primaryAction={{
          label: 'Ok',
          onClick: handleDuplicateChargeConfirm,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: handleDuplicateChargeCancel,
        }}
        onClose={handleDuplicateChargeCancel}
      />

      <PConfirmationModal
        open={isResetDialogOpen}
        title="Please Confirm"
        message="Do you want to reset the Rating Type?"
        variant="warning"
        primaryAction={{
          label: 'Ok',
          onClick: () => {
            handleResetConfirm();
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            setIsResetDialogOpen(false);
          },
        }}
        onClose={() => {
          setIsResetDialogOpen(false);
        }}
      />
      <PModal
        open={!!isKeepOfrDialogOpen}
        title="Please confirm"
        onClose={() => handleKeepOfrDecision?.(false)}
        height={170}
        width={420}
        isCloseIcon={false}
      >
        <div className={styles.modalContent}>
          <Typography className={styles.confirmText}>
            Do you want to keep the OFR income/expense rates?
          </Typography>
          <div className={styles.modalActions}>
            <Button
              className={styles.confirmBtn}
              onClick={() => handleKeepOfrDecision?.(true)}
            >
              Yes
            </Button>
            <Button
              className={styles.cancelBtn}
              onClick={() => handleKeepOfrDecision?.(false)}
            >
              No
            </Button>
          </div>
        </div>
      </PModal>

      {isAccurateLoading && (
        <div className={styles.accurateLoaderBackdrop}>
          <CircularProgress size={48} thickness={4}  />
        </div>
      )}
    </div>
  );
};

export default RateDetails;
