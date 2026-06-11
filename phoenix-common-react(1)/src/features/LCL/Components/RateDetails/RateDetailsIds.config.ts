import { MODULE_BKG } from '../../../../core';

export interface PickupChargesRowFieldIds {
  incomeChargeNameTextBox: string;
  expenseChargeNameTextBox: string;
  incomeOrgDestListBox: string;
  incomePrepaidCollectListBox: string;
  incomeBasisListBox: string;
  incomeRateTextBox: string;
  expenseRateTextBox: string;
  incomeCurrencyTextBox: string;
  expenseCurrencyTextBox: string;
  calculatedAmtLabel: string;
  expenseVendorTextBox: string;
  expenseVendorRefTextBox: string;
  plusAnchor: string;
  minusAnchor: string;
}

const PICKUP_CHARGES_ROW_FIELD_IDS: Record<string, PickupChargesRowFieldIds> = {
  [MODULE_BKG]: {
    incomeChargeNameTextBox: 'booking_incomeChargeNameTextBox',
    expenseChargeNameTextBox: 'booking_expenseChargeNameTextBox',
    incomeOrgDestListBox: 'booking_incomeOrgDestListBox',
    incomePrepaidCollectListBox: 'booking_incomePrepaidCollectListBox',
    incomeBasisListBox: 'booking_incomeBasisListBox',
    incomeRateTextBox: 'booking_incomeRateTextBox',
    expenseRateTextBox: 'booking_expenseRateTextBox',
    incomeCurrencyTextBox: 'booking_incomeCurrencyTextBox',
    expenseCurrencyTextBox: 'booking_expenseCurrencyTextBox',
    calculatedAmtLabel: 'booking_calculatedAmtLabel',
    expenseVendorTextBox: 'booking_expenseVendorTextBox',
    expenseVendorRefTextBox: 'booking_expenseVendorRefTextBox',
    plusAnchor: 'booking_plusAnchor',
    minusAnchor: 'booking_minusAnchor',
  },
};

export const getPickupChargesRowFieldIds = (
  moduleType: string
): Partial<PickupChargesRowFieldIds> =>
  PICKUP_CHARGES_ROW_FIELD_IDS[moduleType] ?? {};

export interface RateDetailsFieldIds {
  pickupTruckingCollapsibleButton: string;
  pickupTruckingCollapsibleIconButton: string;
  expandShipmentSummaryButton: string;
  expandRateOfExchangeButton: string;
  includePLCButton: string;
  expandChargeDetailsButton: string;
  modifyRatesButton: string;
  rateTypeSelectionListBox: string;
}

const RATE_DETAILS_FIELD_IDS: Record<string, RateDetailsFieldIds> = {
  [MODULE_BKG]: {
    pickupTruckingCollapsibleButton: 'booking_pickupTruckingCollapsibleButton',
    pickupTruckingCollapsibleIconButton:
      'booking_pickupTruckingCollapsibleIconButton',
    expandShipmentSummaryButton: 'booking_expandShipmentSummaryButton',
    expandRateOfExchangeButton: 'booking_expandRateOfExchangeButton',
    includePLCButton: 'booking_includePLCButton',
    expandChargeDetailsButton: 'booking_expandChargeDetailsButton',
    modifyRatesButton: 'booking_modifyRatesButton',
    rateTypeSelectionListBox: 'booking_rateTypeSelectionListBox',
  },
};

export const getRateDetailsFieldIds = (
  moduleType: string
): Partial<RateDetailsFieldIds> => RATE_DETAILS_FIELD_IDS[moduleType] ?? {};


export interface AccordionFieldIds {
  collapsibleButton: string;
  collapsibleIconButton: string;
}

export interface AccordionSectionFieldIds {
  ofrFob: AccordionFieldIds;
  fob: AccordionFieldIds;
  plc: AccordionFieldIds;
  doorDeliveryTrucking: AccordionFieldIds;
}

const ACCORDION_FIELD_IDS: Record<string, AccordionSectionFieldIds> = {
  [MODULE_BKG]: {
    ofrFob: {
      collapsibleButton: 'booking_ofrFobCollapsibleButton',
      collapsibleIconButton: 'booking_ofrFobCollapsibleIconButton',
    },
    fob: {
      collapsibleButton: 'booking_fobCollapsibleButton',
      collapsibleIconButton: 'booking_fobCollapsibleIconButton',
    },
    plc: {
      collapsibleButton: 'booking_plcCollapsibleButton',
      collapsibleIconButton: 'booking_plcCollapsibleIconButton',
    },
    doorDeliveryTrucking: {
      collapsibleButton: 'booking_doorDeliveryTruckingCollapsibleButton',
      collapsibleIconButton:
        'booking_doorDeliveryTruckingCollapsibleIconButton',
    },
  },
};

export const getAccordionSectionFieldIds = (
  moduleType: string
): Partial<AccordionSectionFieldIds> => ACCORDION_FIELD_IDS[moduleType] ?? {};
