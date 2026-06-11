import { useCallback, useEffect, useState } from 'react';

import { Box, Divider, IconButton, Tooltip } from '@mui/material';

import {
  PDatePicker,
  PGradientButton,
  PMapCoordinatePicker,
  PModal,
  PMultiValueSearchableField,
  PSelect,
  PSingleValueSearchableField,
  PStatusBar,
  PTextField,
  PConfirmationModal,
} from 'phoenix-react-lib';

import ManufacturerSection from './ManufacturerSection';
import TransshipmentSection from './TransshipmentSection';
import styles from '../../../../styles/LCL/routing-details.module.css';
import PPickupDetailsWarning from '../PickupDetails/PPickupDetailsWarning';
import minusImg from '../../../../assets/images/minus.png';
import plusImg from '../../../../assets/images/plus.png';
import searchIcon from '../../../../assets/images/search-icon.png';
import PickUpDetails from '../PickupDetails/PickUpDetails';
import DoorDeliveryDetails from '../DoorDeliveryDetails/DoorDeliveryDetails';
import { formatTime } from '../../../../core/utils/date.utility';
import {
  ManufacturerEntry,
  RoutingDetailsProps,
  TransshipmentPortRow,
} from '@/types/LCL/routing/RoutingDetails.types';
import { SailingScheduleSearchPage } from '../SailingScheduleSearch';
import { LocationSearchModal } from '../locationSearch';
import {
  useFeatureToggle,
  validateRoutingDate,
  validateTransshipmentDate,
} from '../../../../hooks/LCL';
import type { RoutingDateField } from '../../../../hooks/LCL/routingDateValidation';
import {
  LclToggleKeys,
  CommonToggleKeys,
} from '../../../../core/featureToggles/featureToggle.types';
import { useGetSuggestions } from '../../../../hooks/LCL/useGetSuggestions';
import { ApiService } from '../../../../core/api/client';
import { COMMON_ENDPOINTS } from '../../../../core/api/config/common.endpoints';
import {
  buildWarehouseSuggestionConfig,
  getWarehouseReference,
  docDeliverySuggestionConfig,
  timeSuggestionConfig,
} from '../../../../hooks/LCL/suggestionHelpers';
import { useAppSelector } from '../../../../app/store/hooks';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';
import type {
  ScheduleRow,
  ScheduleGroup,
} from '@/types/LCL/misc/SailingScheduleSearch.types';
import type { LocationResult, RoutingFormData } from '@/types';
import editIcon from '../../../../assets/edit.svg';

const EMBARGO_FIELD_KEYS: Record<string, string> = {
  placeOfReceiptCode: 'Place of Receipt Code',
  consolidationCfsCode: 'Consolidation CFS Code',
  portOfLoadingCode: 'Load Code',
  portOfDischargeCode: 'Discharge Code',
  deconsolidationCfsCode: 'Deconsolidation Code',
  destinationCfsCode: 'Destination CFS Code',
  placeOfDeliveryCode: 'Place of Delivery Code',
};

const EditIcon = () => <img src={editIcon} alt="edit" width={22} height={22} />;

function isDeliveryAppointmentValid(
  fromDate: Date | null,
  toDate: Date | null,
  fromTime: string,
  toTime: string
): boolean {
  if (!fromDate || !toDate) return true;
  const fromDay = new Date(
    fromDate.getFullYear(),
    fromDate.getMonth(),
    fromDate.getDate()
  ).getTime();
  const toDay = new Date(
    toDate.getFullYear(),
    toDate.getMonth(),
    toDate.getDate()
  ).getTime();
  if (fromDay === toDay) {
    if (fromTime && toTime && fromTime > toTime) return false;
  } else if (fromDay > toDay) {
    return false;
  }
  return true;
}

function RoutingDetails({
  formData,
  onChange,
  moduleType,
  pickupState,
  pickupHandlers,
  tempData,
  onFieldsChange,
  onRegisterFields,
  handlePickupFormDataChange,
  termsSuggestion,
  vesselSuggestion,
  voyageInputRef,
  handleVesselCodeSelect,
  carrierSuggestion,
  handleCarrierCodeSelect,
  locationSuggestions,
  handleLocationCodeSelect,
  handleWarehouseSelect,
  scheduleSearchOpen,
  onOpenScheduleSearch,
  onCloseScheduleSearch,
  onScheduleBookThis,
  rateDetails,
  accessorialOptions,
  doorAccessorialOptions,
  mainDetailsValue,
  onTruckQuoteReset,
  onWarning,
  disableRoutingFields,
  showBannerError,
  hideAddPickup = false,
}: RoutingDetailsProps) {
  const TRACKED_FIELDS: string[] = [
    'terms',
    'pickupNeeded',
    'vesselCode',
    'vesselName',
    'voyage',
    'placeOfReceiptCode',
    'placeOfReceiptName',
    'placeOfReceiptEtd',
    'portOfLoadingEts',
    'portOfDischargeCode',
    'portOfDischargeName',
    'portOfDischargeEta',
    'cargoReadDate',
  ];
  const [editableFields, setEditableFields] = useState<Set<string>>(new Set());
  const { isVisible, isMandatory } = useFeatureToggle();
  const showManufacturerSection = isVisible(
    LclToggleKeys.SHOW_MANUFACTURER_NAME
  );
  const showMultipleManufacturers = isVisible(
    LclToggleKeys.MULTIPLE_MANUFACTURER_NAMES
  );
  const showCustomCutoff = isVisible(LclToggleKeys.SHOW_CUSTOM_CUTOFF);
  const showCblTextbox = isVisible(LclToggleKeys.SHOW_CBL_TEXTBOX);
  const routingMandatory = isVisible(LclToggleKeys.ROUTING_MANDATORY);
  const podNonMandatory = isVisible(LclToggleKeys.POD_NON_MANDATORY);
  const deconCodeNameMandatory = isVisible(
    LclToggleKeys.DECON_CODE_NAME_MANDATORY
  );
  const deconEtaMandatory = isVisible(LclToggleKeys.DECON_ETA_MANDATORY);
  const destCfsCodeNameMandatory = isVisible(
    LclToggleKeys.DEST_CFS_CODE_NAME_MANDATORY
  );
  const destCfsEtaMandatory = isVisible(LclToggleKeys.DEST_CFS_ETA_MANDATORY);
  const showPreCarriageEts = isVisible(LclToggleKeys.PRE_CARRIAGE_ETS_DATE);
  const vesselCodeNotRequired =
    isVisible(LclToggleKeys.VALIDATE_RATES_BY_QUOTE) && moduleType === 'QUOTE';
  const disablePlaceOfDelivery = isVisible(
    LclToggleKeys.DISABLE_PLACE_OF_DELIVERY
  );
  const hidePodSameAsDestCfs = isVisible(
    LclToggleKeys.HIDE_POD_SAME_AS_DEST_CFS
  );
  const truckingRatesIntegration = isVisible(
    LclToggleKeys.TRUCKING_RATES_INTEGRATION
  );
  const showWarehouseMapPin = isVisible(LclToggleKeys.SHOW_WAREHOUSE_MAP_PIN);
  const showCfsCutoff = isVisible(LclToggleKeys.SHOW_CFS_CUTOFF);
  const showGatewayCutoff = isVisible(LclToggleKeys.SHOW_GATEWAY_CUTOFF);
  const customsCutoffMandatory =
    showCustomCutoff && isVisible(LclToggleKeys.CUSTOM_CUTOFF_MANDATORY);
  const docCutoffMandatory = isVisible(LclToggleKeys.DOC_CUTOFF_MANDATORY);
  const showBkgRedesignRouting =
    isVisible(LclToggleKeys.REDESIGN_ROUTING) && moduleType === 'BKG';
  const rateFetchOnCfsCutoff =
    isVisible(LclToggleKeys.RATE_FETCH_ON_CFS_CUTOFF) &&
    (moduleType === 'QUOTE' || showBkgRedesignRouting);
  const showCfsContactName = isVisible(LclToggleKeys.SHOW_CFS_CONTACT_NAME);
  const cfsContactNameMandatory = isVisible(
    LclToggleKeys.CFS_CONTACT_NAME_MANDATORY
  );
  const showCfsContactPhone = isVisible(LclToggleKeys.SHOW_CFS_CONTACT_PHONE);
  const cfsContactPhoneMandatory = isVisible(
    LclToggleKeys.CFS_CONTACT_PHONE_MANDATORY
  );
  const showCustomsBroker = isVisible(LclToggleKeys.CUSTOMS_BROKER_SUGGESTION);
  const showDeliveryAppointment = isVisible(LclToggleKeys.DELIVERY_APPOINTMENT);
  const showTmsPickup = isVisible(LclToggleKeys.TMS_PICKUP);
  const standaloneQuoteHideVessel =
    isVisible(LclToggleKeys.STANDALONE_QUOTE_RATE) &&
    moduleType === 'QUOTE' &&
    (formData.terms === 'DRCF' || formData.terms === 'CFDR');
  const vesselNameCharLimit = isVisible(LclToggleKeys.VESSEL_NAME_CHAR_LIMIT);
  const isTermCFDROrDRDR =
    formData.terms === 'CFDR' || formData.terms === 'DRDR';
  const destCfsRequired =
    truckingRatesIntegration && moduleType === 'BKG'
      ? isTermCFDROrDRDR
      : destCfsCodeNameMandatory;


  const destCfsEtaRequired = truckingRatesIntegration && moduleType === 'BKG' && destCfsEtaMandatory;

  const loginBean = useAppSelector(selectLoginClientBean);
  const officeid = loginBean?.officeId ?? 0;
  const siteid = loginBean?.siteId ?? 0;

  const oceanTms =
    (isVisible(LclToggleKeys.OCEAN_QUOTE_TMS_ENABLED) &&
      moduleType === 'QUOTE') ||
    (isVisible(LclToggleKeys.OCEAN_BOOKING_TMS_ENABLED) &&
      moduleType === 'BKG');

  const [warehouseLatitude, setWarehouseLatitude] = useState<number | null>(
    null
  );
  const [warehouseLongitude, setWarehouseLongitude] = useState<number | null>(
    null
  );

  const toggleBaiduMaps = isVisible(CommonToggleKeys.MAPS_ENABLE_BAIDU_MAPS);
  const effectiveMapType = toggleBaiduMaps ? 'baidu' : 'google';
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    message: string;
    key?: 'PICKUP_DELIVERY';
  }>({
    open: false,
    message: '',
  });

  const showAccurateRatesToggle =
    isVisible(
      CommonToggleKeys.RESTRICT_ACCURATE_RATES_RESET_BY_SAILING_SCHEDULE
    ) &&
    !!mainDetailsValue?.referenceNumber &&
    (moduleType === 'BKG' || moduleType === 'QUOTE');

  const effectiveLatitude = warehouseLatitude ?? Number(loginBean?.latitude);
  const effectiveLongitude = warehouseLongitude ?? Number(loginBean?.longitude);
  const warehouseReference = getWarehouseReference(
    showWarehouseMapPin,
    isVisible(LclToggleKeys.USER_DEFAULT_WAREHOUSE),
    moduleType
  );
  const warehouseConfig = buildWarehouseSuggestionConfig(
    officeid,
    siteid,
    warehouseReference,
    loginBean as any
  );
  const { data: internalWarehouseData, setQuery: setInternalWarehouseQuery } =
    useGetSuggestions<unknown, Record<string, unknown>>({
      endpoint: warehouseConfig.endpoint,
      minChars: warehouseConfig.minChars,
      debounceMs: warehouseConfig.debounceMs,
      transformRequest: warehouseConfig.transformRequest,
      transformResponse: warehouseConfig.transformResponse,
    });

  const {
    data: internalDocDeliveryData,
    setQuery: setInternalDocDeliveryQuery,
  } = useGetSuggestions<unknown, Record<string, unknown>>(
    docDeliverySuggestionConfig(loginBean as any)
  );

  const { getToggleValue } = useFeatureToggle();

  const {
    data: cfsCutoffTimeData,
    setQuery: setCfsCutoffTimeQuery,
  } = useGetSuggestions<unknown, Record<string, unknown>>(
    timeSuggestionConfig(Number(getToggleValue(CommonToggleKeys.TIME_FORMAT)))
  );

  const destWarehouseConfig = buildWarehouseSuggestionConfig(officeid, siteid, 'warehouse', loginBean as any);
  const { data: destWarehouseData, setQuery: setDestWarehouseQuery } =
    useGetSuggestions<unknown, Record<string, unknown>>({
      endpoint: destWarehouseConfig.endpoint,
      minChars: destWarehouseConfig.minChars,
      debounceMs: destWarehouseConfig.debounceMs,
      transformRequest: destWarehouseConfig.transformRequest,
      transformResponse: destWarehouseConfig.transformResponse,
    });

  const parseScheduleDate = (dateStr: string): Date | null => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? null : d;
  };

  const handleScheduleBookThis = useCallback(
    async (
      row: ScheduleRow,
      group: ScheduleGroup,
      isAccurateRatesReset: string
    ) => {
      onCloseScheduleSearch?.();

      onChange('placeOfReceiptCode', '');
      onChange('placeOfReceiptName', '');
      onChange('placeOfReceiptRegion', '');
      onChange('portOfLoadingCode', '');
      onChange('portOfLoadingName', '');
      onChange('portOfLoadingRegion', '');
      onChange('portOfDischargeCode', '');
      onChange('portOfDischargeName', '');
      onChange('portOfDischargeRegion', '');
      onChange('destinationCfsCode', '');
      onChange('destinationCfsName', '');
      onChange('destinationCfsRegion', '');
      onChange('destinationCfsEta', null);
      onChange('placeOfDeliveryCode', '');
      onChange('placeOfDeliveryName', '');
      onChange('placeOfDeliveryRegion', '');

      onChange('vesselCode', row.imoNumber);
      onChange('vesselName', row.vesselName);
      onChange('voyage', row.voyageCode ? row.voyageCode.slice(0, 10) : '');
      onChange('carrierCode', row.carrierScac);

      onChange('portOfLoadingEts', parseScheduleDate(row.etd));

      const showDestInDischarge = isVisible(
        LclToggleKeys.SHOW_DESTINATION_IN_DISCHARGE
      );
      onChange(
        'portOfDischargeEta',
        parseScheduleDate(
          showDestInDischarge ? row.eta : row.portOfDischargeDate || row.eta
        )
      );

      if (row.cutOffDateTime && row.cutOffDateTime.trim().length > 0) {
        const spaceIdx = row.cutOffDateTime.indexOf(' ');
        const datePart =
          spaceIdx > -1
            ? row.cutOffDateTime.slice(0, spaceIdx)
            : row.cutOffDateTime;
        const timePart =
          spaceIdx > -1 ? row.cutOffDateTime.slice(spaceIdx + 1).trim() : '';
        const cutoffDate = parseScheduleDate(datePart);
        onChange('cfsCutoffDate', cutoffDate);
        onChange('docCutoffDate', cutoffDate);
        if (timePart) {
          const formattedTime = formatTime(timePart, Number(getToggleValue(CommonToggleKeys.TIME_FORMAT)) === 12);
          onChange('cfsCutoffTime', formattedTime);
          onChange('docCutoffTime', formattedTime);
        }
      }

      if (row.carrierScac && loginBean?.schema) {
        try {
          type CarrierSuggestionResult = Record<string, string[]>;
          type CarrierSuggestionResponse = {
            success: number;
            result: CarrierSuggestionResult;
          };
          const carrierRes = await ApiService.post<CarrierSuggestionResponse>(
            COMMON_ENDPOINTS.SUGGESTION_BOX.GET_SUGGESTION_DATA,
            {
              query: '%%%%',
              reference: 'carrierQuote',
              params: { officeSchemaName: loginBean.schema },
            }
          );
          const resultMap = carrierRes.data?.result ?? {};
          const matchedDescription = Object.keys(resultMap).find((desc) =>
            resultMap[desc]?.some(
              (code) => code.toUpperCase() === row.carrierScac.toUpperCase()
            )
          );
          if (matchedDescription) {
            carrierSuggestion?.setQuery(matchedDescription);
          }
        } catch { }
      }

      onScheduleBookThis?.(row, group, isAccurateRatesReset);
    },
    [
      loginBean,
      onChange,
      onCloseScheduleSearch,
      onScheduleBookThis,
      isVisible,
      carrierSuggestion,
    ]
  );

  const {
    openPickupModal,
    pickups,
    openDialog,
    collapsedSet,
    doorDeliveryDialogOpen,
    combinedDialogOpen,
    doorDeliveryCollapsed,
    showPickupStack,
    doorDeliveryForm,
    orgSearchOpenSet,
    isCFSDoor,
    pickupForms,
    pickupValidationMessages,
  } = pickupState;
  const {
    handlePickupChange,
    handleAddPickup,
    handleRemovePickup,
    handleConfirmRemove,
    handleToggleCollapse,
    closePickupModal,
    setPickupNeeded,
    setCombinedDialogOpen,
    handleDoorDeliveryFieldChange,
    handleOrgSearchOpen,
    handleOrgSearchClose,
    handlePickupDialogClose,
    handlePickupDialogConfirm,
    handleDoorDeliveryDialogClose,
    handleDoorDeliveryDialogOk,
    handleCombinedDialogClose,
    handleCombinedDialogOk,
    handleCancelRemove,
    setDoorDeliveryCollapsed,
    setShowPickupStack,
    setDoorDeliveryDialogOpen,
    handlePickupAccessorialsChange,
    clearPickupValidation,
    setPickupValidationMessages
  } = pickupHandlers;

  const isQuoteMode = moduleType === 'QUOTE';

  const isTruckQuoteDoorToCFS =
    isQuoteMode &&
    mainDetailsValue?.truckQuote === 'Yes' &&
    formData.terms === 'DRCF' &&
    (formData.pickupNeeded === 'Y' || formData.pickupNeeded === 'T');

  const isTruckQuoteCFSToDoor =
    isQuoteMode &&
    mainDetailsValue?.truckQuote === 'Yes' &&
    formData.terms === 'CFDR' &&
    formData.pickupNeeded === 'N';

  const isTruckQuoteRouting = isTruckQuoteDoorToCFS || isTruckQuoteCFSToDoor;

  const podTypeSelected = !!formData.placeOfDeliveryType;

  const triggerAccurateOrConfirm =
    rateDetails?.accurateRate?.triggerAccurateOrConfirm;
  const isAccurateRatingType =
    rateDetails?.defaultState?.isAccurateServiceActive ?? false;

  const handleEditToggle = (key: string) => {
    setEditableFields((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleTermsChange = (val: string) => {
    onChange('termsLabel', val as never);
    termsSuggestion?.setQuery(val);
  };

  const handleTermsSelect = (val: string, label: string) => {
    onChange('terms', val as never);
    onChange('termsLabel', label as never);

    if (mainDetailsValue?.truckQuote === 'Yes' && val !== 'CFDR' && val !== 'DRCF') {
      onTruckQuoteReset?.();
    }

    const pickupValue = oceanTms ? 'T' : 'Y';

    switch (val) {
      case 'CFDR':
        setDoorDeliveryDialogOpen?.(true);
        break;
      case 'DRCF':
        handlePickupChange(pickupValue);
        break;
      case 'DRDR':
        setPickupNeeded?.(pickupValue);
        setCombinedDialogOpen?.(true);
        break;
    }
  };

  const handlePickupNeededManualChange = (value: string) => {
    if (value === 'Y' || value === 'T') {
      if (formData.terms === 'CFDR') {
        setPickupNeeded?.(value);
        setDoorDeliveryDialogOpen?.(false);
        setCombinedDialogOpen?.(true);
      } else {
        handlePickupChange(value);
      }
    } else {
      handlePickupChange(value);
      setShowPickupStack?.(false);
    }
  };

  const handleDateChange = (field: RoutingDateField, val: Date | null) => {
    if (!val) {
      onChange(field, null as never);
      return;
    }
    const result = validateRoutingDate(field, val, formData, {
      disablePlaceOfDelivery,
    });
    if (!result.valid) {
      onWarning?.(result.message ?? null);
      onChange(field, null as never);
    } else {
      onWarning?.(null);
      onChange(field, val as never);
      if (result.autoCopy) {
        onChange(result.autoCopy.field, result.autoCopy.value as never);
      }
    }
  };

  const handleCfsCutoffDateChange = (val: Date | null) => {
    if (!val) {
      onChange('cfsCutoffDate', null as never);
      return;
    }

    const n = parseInt(
      loginBean?.officeSettingMap?.PERIOD_OF_DAYS?.[0] ?? '90',
      10
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const beforeDate = new Date(today);
    beforeDate.setDate(today.getDate() - n);
    const afterDate = new Date(today);
    afterDate.setDate(today.getDate() + n);

    let warning: string | null = null;
    let cleared = false;

    if (formData.portOfLoadingEts && val > formData.portOfLoadingEts) {
      warning = showCfsCutoff
        ? 'CFS Cutoff Date should be less than or equal to the ETS.'
        : 'The Delivery Date should be less than or equal to the ETS.';
      cleared = true;
    }

    if (val < beforeDate || val > afterDate) {
      warning = showCfsCutoff
        ? `CFS Cutoff Date should be within ${n} days from today.`
        : `The Delivery Date should be within ${n} days from today.`;
      cleared = true;
    }

    if (cleared) {
      onWarning?.(warning);
      onChange('cfsCutoffDate', null as never);
      return;
    }

    onWarning?.(null);
    const prevCfsCutoff = formData.cfsCutoffDate;
    const dateChanged =
      val?.getTime() !== (prevCfsCutoff ? new Date(prevCfsCutoff as any).getTime() : undefined);
    onChange('cfsCutoffDate', val);
    if (rateFetchOnCfsCutoff && isAccurateRatingType && dateChanged) {
      triggerAccurateOrConfirm?.();
    }
  };

  const handleGatewayCutoffDateChange = (val: Date | null) => {
    onChange('gatewayCutoffDate', val as never);
  };

  const handleDocCutoffDateChange = (val: Date | null) => {
    onChange('docCutoffDate', val as never);
  };

  const handleDeliveryAppointmentDateChange = (
    field: 'deliveryAppointmentDateFrom' | 'deliveryAppointmentDateTo',
    val: Date | null
  ) => {
    const newFromDate =
      field === 'deliveryAppointmentDateFrom'
        ? val
        : formData.deliveryAppointmentDateFrom;
    const newToDate =
      field === 'deliveryAppointmentDateTo'
        ? val
        : formData.deliveryAppointmentDateTo;
    onChange(field, val as never);
    if (
      !isDeliveryAppointmentValid(
        newFromDate,
        newToDate,
        formData.deliveryAppointmentTimeFrom,
        formData.deliveryAppointmentTimeTo
      )
    ) {
      onWarning?.(
        'Delivery Date/Time From should be less than or equal to the Delivery Date/Time To.'
      );
      onChange('deliveryAppointmentDateTo', null as never);
    } else {
      onWarning?.(null);
    }
  };

  const handleDeliveryAppointmentTimeChange = (
    field: 'deliveryAppointmentTimeFrom' | 'deliveryAppointmentTimeTo',
    val: string
  ) => {
    const newFromTime =
      field === 'deliveryAppointmentTimeFrom'
        ? val
        : formData.deliveryAppointmentTimeFrom;
    const newToTime =
      field === 'deliveryAppointmentTimeTo'
        ? val
        : formData.deliveryAppointmentTimeTo;
    onChange(field, val as never);
    if (
      !isDeliveryAppointmentValid(
        formData.deliveryAppointmentDateFrom,
        formData.deliveryAppointmentDateTo,
        newFromTime,
        newToTime
      )
    ) {
      onWarning?.(
        'Delivery Date/Time From should be less than or equal to the Delivery Date/Time To.'
      );
      onChange('deliveryAppointmentTimeTo', '' as never);
    } else {
      onWarning?.(null);
    }
  };

  const handleTransshipmentChange = (newRows: TransshipmentPortRow[]) => {
    const oldRows = formData.transshipmentPorts;
    let etaValidationRan = false;

    for (const newRow of newRows) {
      const oldRowIndex = oldRows.findIndex((r) => r.id === newRow.id);
      if (
        oldRowIndex >= 0 &&
        newRow.eta !== oldRows[oldRowIndex].eta &&
        newRow.eta !== null
      ) {
        etaValidationRan = true;
        const result = validateTransshipmentDate(
          oldRowIndex,
          newRow.eta,
          formData,
          { disablePlaceOfDelivery }
        );
        if (!result.valid) {
          onWarning?.(result.message ?? null);
          onChange(
            'transshipmentPorts',
            newRows.map((r) =>
              r.id === newRow.id ? { ...r, eta: null } : r
            ) as never
          );
          return;
        }
      }
    }

    if (etaValidationRan) onWarning?.(null);
    onChange('transshipmentPorts', newRows as never);
  };

  const handleLocationSelectWithEmbargoCheck = async (
    item: Record<string, unknown>,
    codeField: keyof RoutingFormData,
    nameField: keyof RoutingFormData,
    regionField: keyof RoutingFormData
  ) => {
    handleLocationCodeSelect?.(item, codeField, nameField, regionField);

    const code = String(item.code ?? '');
    if (!code) return;

    const fieldLabel = EMBARGO_FIELD_KEYS[codeField as string];
    if (!fieldLabel) return;

    const embargoLocationSetting =
      loginBean?.officeSettingMap?.['EMBARGO_LOCATION']?.[0];
    const isEmbargoLocation = embargoLocationSetting?.toUpperCase() !== 'N';
    const officeCode = loginBean?.office ?? '';

    try {
      type EmbargoResponse = {
        success: number;
        result: Record<string, string>;
      };
      const res = await ApiService.post<EmbargoResponse>(
        COMMON_ENDPOINTS.LOCATION.VALIDATE_EMBARGO_ROUTING_CODES,
        {
          requestData: {
            routingCodeValidationBean: {
              routingcodesMap: { [fieldLabel]: code },
              loginBean: { officeCode },
              isEmbargoLocation,
            },
          },
        }
      );
      const result = res.data?.result ?? {};
      if (Object.keys(result).length > 0) {
        const msg = Object.entries(result)
          .map(
            ([key, val]) =>
              `Embargo Location in ${key} ${val} In Routing Detail`
          )
          .join('\n');
        onWarning?.(msg);
        onChange(codeField, '' as never);
        onChange(nameField, '' as never);
        onChange(regionField, '' as never);
      }
    } catch {
      // Fail silently — do not block user if endpoint is unavailable
    }
  };

  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [locationModalKey, setLocationModalKey] = useState(0);

  const handleOpenLocationModal = (field: string) => {
    setActiveField(field);
    setLocationModalKey((prev) => prev + 1);
    setLocationModalOpen(true);
  };

  const handleLocationSelect = (loc: LocationResult) => {
    if (!activeField) return;

    const locAsRecord = loc as unknown as Record<string, unknown>;

    const codeFieldMap: Record<string, keyof RoutingFormData> = {
      placeOfReceipt: 'placeOfReceiptCode',
      consolidationCfs: 'consolidationCfsCode',
      portOfLoading: 'portOfLoadingCode',
      portOfDischarge: 'portOfDischargeCode',
      deconsolidationCfs: 'deconsolidationCfsCode',
      destinationCfs: 'destinationCfsCode',
      placeOfDelivery: 'placeOfDeliveryCode',
    };
    const codeField = codeFieldMap[activeField];
    const prevCode = codeField ? String(formData[codeField] ?? '') : '';
    const codeChanged = loc.code !== prevCode;

    switch (activeField) {
      case 'placeOfReceipt':
        onChange('placeOfReceiptCode', loc.code);
        onChange('placeOfReceiptName', loc.name);
        handleLocationCodeSelect?.(
          locAsRecord,
          'placeOfReceiptCode',
          'placeOfReceiptName',
          'placeOfReceiptRegion'
        );
        break;
      case 'consolidationCfs':
        onChange('consolidationCfsCode', loc.code);
        onChange('consolidationCfsName', loc.name);
        break;
      case 'portOfLoading':
        onChange('portOfLoadingCode', loc.code);
        onChange('portOfLoadingName', loc.name);
        handleLocationCodeSelect?.(
          locAsRecord,
          'portOfLoadingCode',
          'portOfLoadingName',
          'portOfLoadingRegion'
        );
        break;
      case 'portOfDischarge':
        onChange('portOfDischargeCode', loc.code);
        onChange('portOfDischargeName', loc.name);
        handleLocationCodeSelect?.(
          locAsRecord,
          'portOfDischargeCode',
          'portOfDischargeName',
          'portOfDischargeRegion'
        );
        break;
      case 'deconsolidationCfs':
        onChange('deconsolidationCfsCode', loc.code);
        onChange('deconsolidationCfsName', loc.name);
        break;
      case 'destinationCfs':
        onChange('destinationCfsCode', loc.code);
        onChange('destinationCfsName', loc.name);
        handleLocationCodeSelect?.(
          locAsRecord,
          'destinationCfsCode',
          'destinationCfsName',
          'destinationCfsRegion'
        );
        break;
      case 'placeOfDelivery':
        onChange('placeOfDeliveryCode', loc.code);
        onChange('placeOfDeliveryName', loc.name);
        break;
    }
    if (codeChanged) {
      triggerAccurateOrConfirm?.();
    }
  };

  const confirmModalOnClose = () => {
    if (confirmModal.key === 'PICKUP_DELIVERY') {
      if (typeof handleCombinedDialogClose === 'function') {
        handleCombinedDialogClose();
      }
    }

    // Common code to reset the modal state
    setConfirmModal({ message: '', open: false });
  };

  const locationOptions = tempData.locationOptions;
  const locationDisplayFields = locationOptions.length
    ? Object.keys(locationOptions[0])
    : [];

  const showError = (errorMessage: string, variant: 'bar' | 'modal' = 'bar') => {
    showBannerError([errorMessage], 3000, variant);
  }

  useEffect(() => {
    onRegisterFields?.(TRACKED_FIELDS);
  }, []);

  useEffect(() => {
    onFieldsChange?.(formData);
  }, [formData]);

  const [showPickupError, setShowPickupError] = useState(false);

  const hasPTCCharge = rateDetails.formData.charges.rateDetails.some(
  (row) => row.truckChargeGroup === 'PTC' && row.isTruckingRates 
    && row.incomeRate != 0);
  const PICKUP_NO_VALUES = ['N', 'NO'];
  const [warehouseWarningPopup, showWarehouseWarningPopup] = useState(false);
  
  const showWarehouseWarning = (item: any) => {
    showWarehouseWarningPopup(false);
    if (!PICKUP_NO_VALUES.includes(
          (formData.pickupNeeded ?? '').toUpperCase())
        && hasPTCCharge) {
     showWarehouseWarningPopup(true);
    }
  };

  useEffect(() => {
    if ((pickupValidationMessages?.length ?? 0) > 0) {
      setShowPickupError(true);

      const timer = setTimeout(() => {
        setShowPickupError(false);
      }, 5000); 

      return () => clearTimeout(timer);
    }
  }, [pickupValidationMessages]);

  return (
    <div className="routing-details-container enterprise-form">
      <Box className={styles.pad4x8}>
        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Terms"
              onInvalidValueSelected={() => {
                showError(`Please enter a valid Terms.`)
                handleTermsChange('');
              }}
              required
              data={termsSuggestion?.data ?? []}
              displayFields={['label']}
              value={formData.termsLabel}
              columnHeaders={[]}
              onChange={(val) => {
                handleTermsChange(val);
              }}
              onSelect={(item: any) => {
                handleTermsSelect(item.value, item.label);
              }}
              usePortal
            />
          </Box>
          <Box className={styles.colSpan4} data-eservice-field="PICKUP">
            <PSelect
              label="Pickup Needed"
              defaultValue="N"
              required
              value={formData.pickupNeeded}
              onChange={handlePickupNeededManualChange}
              options={[
                { label: 'N - No', value: 'N' },
                ...(showTmsPickup
                  ? [{ label: 'Y - Shipco TMS', value: 'T' }]
                  : []),
                { label: 'Y - Yes', value: 'Y' },
              ]}
            />
          </Box>

          {showCblTextbox && (
            <Box className={styles.colSpan3}>
              <PTextField
                label="CBL"
                value={formData.cbl}
                onChange={(e) => onChange('cbl', e.target.value)}
                className={styles.textField}
              />
            </Box>
          )}
          {isCFSDoor && (
            <Box className={styles.colSpan4}>
              <PSelect
                label="Delivery Type"
                value={formData.deliveryType}
                onChange={(val) => onChange('deliveryType', val)}
                options={[
                  { label: 'Please Select', value: '' },
                  { label: 'D - Door Delivery', value: 'D' },
                ]}
              />
            </Box>
          )}
        </Box>

        {!isTruckQuoteRouting && (isQuoteMode ? (
          <Box className={styles.grid}>
            <Box className={styles.colSpan3}>
              <PSelect
                label="Transit Time"
                value={formData.transitTime}
                onChange={(val) => onChange('transitTime', val)}
                options={[
                  { label: 'Select', value: '' },
                  ...Array.from({ length: 100 }, (_, i) => ({
                    label: String(i),
                    value: String(i),
                  })),
                ]}
              />
            </Box>
            <Box className={`${styles.colSpan6} ${styles.searchWrap}`}>
              <PMultiValueSearchableField
                label="Carrier"
                data={carrierSuggestion?.data ?? []}
                displayFields={['label']}
                columnHeaders={[]}
                maxSelectionAllowed={1}
                allowDragging={false}
                initialSelectedItems={
                  formData.carrierCode ? [{ label: formData.carrierCode }] : []
                }
                onSearch={(val) => carrierSuggestion?.setQuery(val)}
                onSelect={(item) =>
                  handleCarrierCodeSelect?.(item as Record<string, unknown>)
                }
                onRemove={() => onChange('carrierCode', '')}
              />
            </Box>
            <Box className={styles.colSpan3}>
              <PTextField
                label="Frequency"
                value={formData.frequency}
                onChange={(e) => onChange('frequency', e.target.value)}
                className={styles.textField}
              />
            </Box>
          </Box>
        ) : (
          <Box className={styles.grid}>
            <Box className={styles.colSpan3}>
              <PSelect
                label="Pre-Carriage Type"
                value={formData.preCarriageType}
                onChange={(val) => onChange('preCarriageType', val)}
                options={tempData.preCarriageTypes}
              />
            </Box>

            <Box className={styles.colSpan9}>
              <PTextField
                label="Pre-Carriage By"
                value={formData.preCarriageBy}
                onChange={(e) => onChange('preCarriageBy', e.target.value)}
                className={styles.textField}
              />
            </Box>

            {showPreCarriageEts && (
              <Box className={`${styles.colSpan4} ${styles.ml40}`}>
                <PDatePicker
                  id="preCarriageEts"
                  label="ETS"
                  value={formData.preCarriageEts}
                  onChange={(val) => onChange('preCarriageEts', val ?? null)}
                />
              </Box>
            )}
          </Box>
        ))}

        {!isTruckQuoteRouting && !standaloneQuoteHideVessel && (
          <Box className={styles.grid}>
            <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
              <PSingleValueSearchableField
                label="Vessel Code"
                required={!vesselCodeNotRequired}
                value={formData.vesselCode}
                data={vesselSuggestion?.data ?? []}
                displayFields={['label']}
                columnHeaders={[]}
                onChange={(val) => {
                  onChange('vesselCode', val);
                  vesselSuggestion?.setQuery(val);
                }}
                onSelect={(item) =>
                  handleVesselCodeSelect?.(item as Record<string, unknown>)
                }
                onInvalidValueSelected={() => {

                  showError(`Please enter a valid Vessel Code.`)
                  handleVesselCodeSelect?.({} as Record<string, unknown>)
                }}
              />
              <Box className={styles.searchIcon}>
                <img
                  src={searchIcon}
                  alt="search"
                  className={styles.searchImg}
                  onClick={onOpenScheduleSearch}
                />
              </Box>
            </Box>
            <Box className={styles.colSpan6} data-eservice-field="VESSEL">
              <PTextField
                label="Vessel Name"
                disabled
                value={formData.vesselName}
                onChange={(e) => onChange('vesselName', e.target.value)}
                className={styles.textField}
                inputProps={{ maxLength: vesselNameCharLimit ? 35 : 50 }}
              />
            </Box>
            <Box className={styles.colSpan3} data-eservice-field="VOYAGE">
              <PTextField
                label="Voyage"
                required={!isQuoteMode}
                value={formData.voyage}
                onChange={(e) => onChange('voyage', e.target.value)}
                // className={styles.textField}
                inputRef={voyageInputRef}
              />
            </Box>

            {/* <Box sx={editBtnCellSx}></Box> */}

            {!isQuoteMode && (
              <Box
                className={`${styles.colSpan4} ${styles.searchWrap} ${styles.ml40}`}
              >
                <PSingleValueSearchableField
                  label="Carrier Code"
                  value={formData.carrierCode}
                  data={carrierSuggestion?.data ?? []}
                  displayFields={['label']}
                  columnHeaders={[]}
                  onChange={(val) => {
                    onChange('carrierCode', val);
                    carrierSuggestion?.setQuery(val);
                  }}
                  onSelect={(item) =>
                    handleCarrierCodeSelect?.(item as Record<string, unknown>)
                  }
                />
              </Box>
            )}
          </Box>
        )}

        {!isTruckQuoteRouting && <hr className={`${styles.routingDivider}`} />}

        {!isTruckQuoteCFSToDoor && (
        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Place of Receipt Code"
              onInvalidValueSelected={() => {
                showError("Please enter a valid Place of Receipt Code.");
                handleLocationSelectWithEmbargoCheck({}, 'placeOfReceiptCode', 'placeOfReceiptName', 'placeOfReceiptRegion');
              }}
              required={routingMandatory}
              value={formData.placeOfReceiptCode}
              data={locationSuggestions?.placeOfReceipt.data ?? locationOptions}
              displayFields={['code', 'name', 'locode', 'country']}
              columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
              onChange={(val) => {
                onChange('placeOfReceiptCode', val);
                locationSuggestions?.placeOfReceipt.setQuery(val);
              }}
              onSelect={(item) => {
                onChange('placeOfReceiptUnCode', item.locode);
                handleLocationSelectWithEmbargoCheck(
                  item as Record<string, unknown>,
                  'placeOfReceiptCode',
                  'placeOfReceiptName',
                  'placeOfReceiptRegion'
                );
                if (isAccurateRatingType) triggerAccurateOrConfirm?.();
              }}
              usePortal
            />
            <Box className={styles.searchIcon}>
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchImg}
                onClick={() => handleOpenLocationModal('placeOfReceipt')}
              />
            </Box>
          </Box>
          <Box className={styles.colSpan9}>
            <Box className={styles.mb4_font12_bold}>Place of Receipt Name</Box>

            <Box className={styles.gridColsFour}>
              {(() => {
                const isPorSelected = !!(
                  formData.placeOfReceiptCode && formData.placeOfReceiptName
                );
                return formData.pickupNeeded === 'Y' ||
                  formData.pickupNeeded === 'T' ? (
                  <>
                    <PTextField
                      value={'DOOR'}
                      onChange={(e) =>
                        onChange('placeOfReceiptPickupFrom', e.target.value)
                      }
                      disabled
                      required
                      error={!formData.placeOfReceiptPickupFrom}
                      className={styles.textField}
                    />

                    <PTextField
                      value={formData.placeOfReceiptPickupFromName}
                      onChange={(e) =>
                        onChange('placeOfReceiptPickupFromName', e.target.value)
                      }
                      disabled={
                        !isPorSelected &&
                        !editableFields.has('placeOfReceiptName')
                      }
                      className={styles.textField}
                    />

                    <PTextField
                      value={'TO CFS'}
                      onChange={(e) =>
                        onChange('placeOfReceiptPickupTo', e.target.value)
                      }
                      disabled
                      required
                      error={!formData.placeOfReceiptPickupTo}
                      className={styles.textField}
                    />

                    <PTextField
                      value={formData.placeOfReceiptPickupToName}
                      onChange={(e) =>
                        onChange('placeOfReceiptPickupToName', e.target.value)
                      }
                      disabled={
                        !isPorSelected &&
                        !editableFields.has('placeOfReceiptName')
                      }
                      className={styles.textField}
                    />
                  </>
                ) : (
                  <Box className={styles.colSpan24}>
                    <PTextField
                      value={formData.placeOfReceiptName}
                      onChange={(e) =>
                        onChange('placeOfReceiptName', e.target.value)
                      }
                      disabled={!editableFields.has('placeOfReceiptName')}
                      required={routingMandatory}
                      className={styles.textField}
                      error={routingMandatory && !formData.placeOfReceiptName}
                    />
                  </Box>
                );
              })()}
            </Box>
          </Box>
          <Box className={styles.editBtnCell}>
            <IconButton
              size="small"
              onClick={() => handleEditToggle('placeOfReceiptName')}
              className={`${styles.editBtn} ${editableFields.has('placeOfReceiptName') ? styles.editBtnActive : ''}`}
            >
              <EditIcon />
            </IconButton>
          </Box>
          <Box className={`${styles.colSpan3} ${styles.mlNeg25}`} data-eservice-field="PLACE_OF_RECEIPT_ETD">
            <PDatePicker
              id="placeOfReceiptEtd"
              label="ETD"
              required={routingMandatory}
              value={formData.placeOfReceiptEtd}
              onChange={(val) =>
                handleDateChange('placeOfReceiptEtd', val ?? null)
              }
            />
          </Box>
        </Box>
        )}

        {!isTruckQuoteRouting && (
        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Consolidation CFS Code"
              value={formData.consolidationCfsCode}
              data={
                locationSuggestions?.consolidationCfs.data ?? locationOptions
              }
              displayFields={['code', 'name', 'locode', 'country']}
              columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
              onChange={(val) => {
                onChange('consolidationCfsCode', val);
                locationSuggestions?.consolidationCfs.setQuery(val);
              }}
              onInvalidValueSelected={() => {
                showError("Please enter a valid Consolidation CFS Code.", 'modal');
                handleLocationSelectWithEmbargoCheck(
                  {},
                  'consolidationCfsCode',
                  'consolidationCfsName',
                  'consolidationCfsRegion'
                )
              }}
              onSelect={(item) => {
                onChange('consolidationCfsUnCode', item.locode);
                handleLocationSelectWithEmbargoCheck(
                  item as Record<string, unknown>,
                  'consolidationCfsCode',
                  'consolidationCfsName',
                  'consolidationCfsRegion'
                );
                if (isAccurateRatingType) triggerAccurateOrConfirm?.();
              }}
              usePortal
            />
            <Box className={styles.searchIcon}>
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchImg}
                onClick={() => handleOpenLocationModal('consolidationCfs')}
              />
            </Box>
          </Box>
          <Box className={styles.colSpan9}>
            <PTextField
              label="Consolidation CFS Name"
              value={formData.consolidationCfsName}
              onChange={(e) => onChange('consolidationCfsName', e.target.value)}
              disabled={!editableFields.has('consolidationCfsName')}
              className={styles.textField}
            />
          </Box>
          <Box className={styles.editBtnCell}>
            <IconButton
              size="small"
              onClick={() => handleEditToggle('consolidationCfsName')}
              className={`${styles.editBtn} ${editableFields.has('consolidationCfsName') ? styles.editBtnActive : ''}`}
            >
              <EditIcon />
            </IconButton>
          </Box>
          <Box className={`${styles.colSpan3} ${styles.mlNeg25}`}>
            <PDatePicker
              id="consolidationCfsEtd"
              label="ETD"
              value={formData.consolidationCfsEtd}
              onChange={(val) =>
                handleDateChange('consolidationCfsEtd', val ?? null)
              }
            />
          </Box>
        </Box>
        )}

        {!isTruckQuoteRouting && (
        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Port of Loading Code"
              required
              value={formData.portOfLoadingCode}
              data={locationSuggestions?.portOfLoading.data ?? locationOptions}
              displayFields={['code', 'name', 'locode', 'country']}
              columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
              onChange={(val) => {
                onChange('portOfLoadingCode', val);
                locationSuggestions?.portOfLoading.setQuery(val);
              }}
              onInvalidValueSelected={() => {
                handleLocationSelectWithEmbargoCheck({}, 'portOfLoadingCode', 'portOfLoadingName', 'portOfLoadingRegion');
                showError("Please enter a valid Port of Loading Code.");
              }}
              onSelect={(item) => {
                onChange('portOfLoadingUnCode', item.locode);
                handleLocationSelectWithEmbargoCheck(
                  item as Record<string, unknown>,
                  'portOfLoadingCode',
                  'portOfLoadingName',
                  'portOfLoadingRegion'
                );
                if (isAccurateRatingType) triggerAccurateOrConfirm?.();
              }}
              usePortal
            />
            <Box className={styles.searchIcon}>
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchImg}
                onClick={() => handleOpenLocationModal('portOfLoading')}
              />
            </Box>
          </Box>
          <Box className={styles.colSpan9}>
            <PTextField
              label="Port of Loading Name"
              value={formData.portOfLoadingName}
              onChange={(e) => onChange('portOfLoadingName', e.target.value)}
              disabled={!editableFields.has('portOfLoadingName')}
              className={styles.textField}
              required
              error={!formData.portOfLoadingName}
            />
          </Box>
          <Box className={styles.editBtnCell}>
            <IconButton
              size="small"
              onClick={() => handleEditToggle('portOfLoadingName')}
              className={`${styles.editBtn} ${editableFields.has('portOfLoadingName') ? styles.editBtnActive : ''}`}
            >
              <EditIcon />
            </IconButton>
          </Box>
          <Box className={`${styles.colSpan3} ${styles.mlNeg25}`} data-eservice-field="PORT_OF_LOADING_ETS">
            <PDatePicker
              id="portOfLoadingEts"
              label="ETS"
              required={moduleType !== 'QUOTE'}
              value={formData.portOfLoadingEts}
              onChange={(val) => {
                handleDateChange('portOfLoadingEts', val ?? null);
                if (isAccurateRatingType) triggerAccurateOrConfirm?.();
              }}
            />
          </Box>
        </Box>
        )}

        {!isTruckQuoteRouting && <hr className={`${styles.routingDivider}`} />}

        {!isTruckQuoteRouting && (
        <TransshipmentSection
          rows={formData.transshipmentPorts}
          onChange={handleTransshipmentChange}
          locationOptions={locationOptions}
          showError={showError}
        />
        )}

        {!isTruckQuoteRouting && <hr className={`${styles.routingDivider}`} />}

        {!isTruckQuoteRouting && (
        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Port of Discharge Code"
              required={!podNonMandatory}
              disabled={disablePlaceOfDelivery}
              value={formData.portOfDischargeCode}
              data={
                locationSuggestions?.portOfDischarge.data ?? locationOptions
              }
              displayFields={['code', 'name', 'locode', 'country']}
              columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
              onChange={(val) => {
                onChange('portOfDischargeCode', val);
                locationSuggestions?.portOfDischarge.setQuery(val);
              }}
              onInvalidValueSelected={() => {
                showError('Please enter a valid Port of Discharge Code.');
                onChange('portOfDischargeCode', '');
                locationSuggestions?.portOfDischarge.setQuery('');

              }}
              onSelect={(item) => {
                onChange('portOfDischargeUnCode', item.locode);
                handleLocationSelectWithEmbargoCheck(
                  item as Record<string, unknown>,
                  'portOfDischargeCode',
                  'portOfDischargeName',
                  'portOfDischargeRegion'
                );
                if (isAccurateRatingType) triggerAccurateOrConfirm?.();
              }}
              usePortal
            />
            <Box className={styles.searchIcon}>
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchImg}
                onClick={() => handleOpenLocationModal('portOfDischarge')}
              />
            </Box>
          </Box>
          <Box className={styles.colSpan9}>
            <PTextField
              label="Port of Discharge Name"
              value={formData.portOfDischargeName}
              onChange={(e) => onChange('portOfDischargeName', e.target.value)}
              disabled={
                disablePlaceOfDelivery ||
                !editableFields.has('portOfDischargeName')
              }
              required={!podNonMandatory}
              className={styles.textField}
              error={
                !podNonMandatory &&
                !formData.portOfDischargeName &&
                !(
                  hidePodSameAsDestCfs &&
                  formData.portOfDischargeCode === formData.destinationCfsCode
                )
              }
            />
          </Box>
          <Box className={styles.editBtnCell}>
            <IconButton
              size="small"
              onClick={() => handleEditToggle('portOfDischargeName')}
              className={`${styles.editBtn} ${editableFields.has('portOfDischargeName') ? styles.editBtnActive : ''}`}
              disabled={disablePlaceOfDelivery}
            >
              <EditIcon />
            </IconButton>
          </Box>
          <Box className={`${styles.colSpan3} ${styles.mlNeg25}`} data-eservice-field="PORT_OF_DISCHARGE_ETA">
            <PDatePicker
              id="portOfDischargeEta"
              label="ETA"
              disabled={disablePlaceOfDelivery}
              value={formData.portOfDischargeEta}
              onChange={(val) =>
                handleDateChange('portOfDischargeEta', val ?? null)
              }
            />
          </Box>
        </Box>
        )}

        {!isTruckQuoteRouting && (
        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Deconsolidation CFS Code"
              required={deconCodeNameMandatory}
              value={formData.deconsolidationCfsCode}
              onInvalidValueSelected={() => {
                showError("Please enter a valid Deconsolidation CFS Code.");
                handleLocationSelectWithEmbargoCheck(
                  {},
                  'deconsolidationCfsCode',
                  'deconsolidationCfsName',
                  'deconsolidationCfsRegion'
                )
              }}
              data={
                locationSuggestions?.deconsolidationCfs.data ?? locationOptions
              }
              displayFields={['code', 'name', 'locode', 'country']}
              columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
              onChange={(val) => {
                onChange('deconsolidationCfsCode', val);
                locationSuggestions?.deconsolidationCfs.setQuery(val);
              }}
              onSelect={(item) => {
                handleLocationSelectWithEmbargoCheck(
                  item as Record<string, unknown>,
                  'deconsolidationCfsCode',
                  'deconsolidationCfsName',
                  'deconsolidationCfsRegion'
                );
                if (isAccurateRatingType) triggerAccurateOrConfirm?.();
              }}
              usePortal
            />
            <Box className={styles.searchIcon}>
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchImg}
                onClick={() => handleOpenLocationModal('deconsolidationCfs')}
              />
            </Box>
          </Box>
          <Box className={styles.colSpan9}>
            <PTextField
              label="Deconsolidation CFS Name"
              value={formData.deconsolidationCfsName}
              onChange={(e) =>
                onChange('deconsolidationCfsName', e.target.value)
              }
              disabled={!editableFields.has('deconsolidationCfsName')}
              required={deconCodeNameMandatory}
              error={deconCodeNameMandatory && !formData.deconsolidationCfsName}
              className={styles.textField}
            />
          </Box>
          <Box className={styles.editBtnCell}>
            <IconButton
              size="small"
              onClick={() => handleEditToggle('deconsolidationCfsName')}
              className={`${styles.editBtn} ${editableFields.has('deconsolidationCfsName') ? styles.editBtnActive : ''}`}
            >
              <EditIcon />
            </IconButton>
          </Box>
          <Box className={`${styles.colSpan3} ${styles.mlNeg25}`}>
            <PDatePicker
              id="deconsolidationCfsEta"
              label="ETA"
              required={deconEtaMandatory}
              value={formData.deconsolidationCfsEta}
              onChange={(val) =>
                handleDateChange('deconsolidationCfsEta', val ?? null)
              }
            />
          </Box>
        </Box>
        )}

        {!isTruckQuoteRouting && (
        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Destination CFS Code"
              required={destCfsRequired}
              onInvalidValueSelected={() => {
                showError("Please enter a valid Destination CFS Code.");
                handleLocationSelectWithEmbargoCheck(
                  {},
                  'destinationCfsCode',
                  'destinationCfsName',
                  'destinationCfsRegion'
                )
              }}
              value={formData.destinationCfsCode}
              data={locationSuggestions?.destinationCfs.data ?? locationOptions}
              displayFields={['code', 'name', 'locode', 'country']}
              columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
              onChange={(val) => {
                onChange('destinationCfsCode', val);
                locationSuggestions?.destinationCfs.setQuery(val);
              }}
              onSelect={(item) => {
                onChange('destinationCfsUnCode', item.locode);
                handleLocationSelectWithEmbargoCheck(
                  item as Record<string, unknown>,
                  'destinationCfsCode',
                  'destinationCfsName',
                  'destinationCfsRegion'
                );
                if (isAccurateRatingType) triggerAccurateOrConfirm?.();
              }}
              usePortal
            />
            <Box className={styles.searchIcon}>
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchImg}
                onClick={() => handleOpenLocationModal('destinationCfs')}
              />
            </Box>
          </Box>
          <Box className={styles.colSpan9}>
            <PTextField
              label="Destination CFS Name"
              value={formData.destinationCfsName}
              onChange={(e) => onChange('destinationCfsName', e.target.value)}
              disabled={!editableFields.has('destinationCfsName')}
              required={destCfsRequired}
              error={destCfsRequired && !formData.destinationCfsName}
              className={styles.textField}
            />
          </Box>
          <Box className={styles.editBtnCell}>
            <IconButton
              size="small"
              onClick={() => handleEditToggle('destinationCfsName')}
              className={`${styles.editBtn} ${editableFields.has('destinationCfsName') ? styles.editBtnActive : ''}`}
            >
              <EditIcon />
            </IconButton>
          </Box>
          <Box className={`${styles.colSpan3} ${styles.mlNeg25}`}>
            <PDatePicker
              id="destinationCfsEta"
              label="ETA"
              required={destCfsEtaRequired}
              value={formData.destinationCfsEta}
              onChange={(val) =>
                handleDateChange('destinationCfsEta', val ?? null)
              }
            />
          </Box>
        </Box>
        )}

        {!isTruckQuoteDoorToCFS && (
        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Place of Delivery Code"
              onInvalidValueSelected={() => {
                showError("Please enter a valid Place of Delivery Code.");
                handleLocationSelectWithEmbargoCheck(
                  {},
                  'placeOfDeliveryCode',
                  'placeOfDeliveryName',
                  'placeOfDeliveryRegion'
                )
              }}
              required={podTypeSelected}
              value={formData.placeOfDeliveryCode}
              data={
                locationSuggestions?.placeOfDelivery.data ?? locationOptions
              }
              displayFields={['code', 'name', 'locode', 'country']}
              columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
              onChange={(val) => {
                onChange('placeOfDeliveryCode', val);
                locationSuggestions?.placeOfDelivery.setQuery(val);
              }}
              onSelect={(item) => {
                onChange('placeOfDeliveryUnCode', item.locode);
                handleLocationSelectWithEmbargoCheck(
                  item as Record<string, unknown>,
                  'placeOfDeliveryCode',
                  'placeOfDeliveryName',
                  'placeOfDeliveryRegion'
                );
                if (isAccurateRatingType) triggerAccurateOrConfirm?.();
              }}
              usePortal
            />
            <Box className={styles.searchIcon}>
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchImg}
                onClick={() => handleOpenLocationModal('placeOfDelivery')}
              />
            </Box>
          </Box>
          <Box className={styles.colSpan2}>
            <PSelect
              label="Place of Delivery Name"
              value={formData.placeOfDeliveryType}
              onChange={(val) => onChange('placeOfDeliveryType', val)}
              options={tempData.placeOfDeliveryTypeOptions}
              disabled={isCFSDoor}
              error={
                (!!formData.placeOfDeliveryCode ||
                  !!formData.placeOfDeliveryName) &&
                !formData.placeOfDeliveryType &&
                formData.placeOfDeliveryCode !== formData.destinationCfsCode
              }
            />
          </Box>
          <Box className={styles.colSpan7} data-eservice-field="PLACE_OF_DELIVERY">
            <PTextField
              value={formData.placeOfDeliveryName}
              onChange={(e) => onChange('placeOfDeliveryName', e.target.value)}
              disabled={!editableFields.has('placeOfDeliveryName')}
              required={podTypeSelected}
              error={podTypeSelected && !formData.placeOfDeliveryName}
              inputProps={{ maxLength: 40 }}
              className={styles.textField}
            />
          </Box>

          {/* <Box sx={{ gridColumn: 'span 9' }}>
            <PTextField
              label="Deconsolidation CFS Name"
              value={formData.deconsolidationCfsName}
              onChange={(e) =>
                onChange('deconsolidationCfsName', e.target.value)
              }
              disabled={!editableFields.has('deconsolidationCfsName')}
              sx={textFieldSx}
            />
          </Box> */}

          <Box className={styles.editBtnCell}>
            <IconButton
              size="small"
              onClick={() => handleEditToggle('placeOfDeliveryName')}
              className={`${styles.editBtn} ${editableFields.has('placeOfDeliveryName') ? styles.editBtnActive : ''}`}
            >
              <EditIcon />
            </IconButton>
          </Box>
          <Box className={`${styles.colSpan3} ${styles.mlNeg25}`} data-eservice-field="PLACE_OF_DELIVERY_ETA">
            <PDatePicker
              id="placeOfDeliveryEta"
              label="ETA"
              value={formData.placeOfDeliveryEta}
              onChange={(val) =>
                handleDateChange('placeOfDeliveryEta', val ?? null)
              }
            />
          </Box>
        </Box>
        )}

        {!isTruckQuoteDoorToCFS && <hr className={`${styles.routingDivider}`} />}

        {!isQuoteMode &&
          (isVisible(LclToggleKeys.SHOW_OUTPORT_WAREHOUSE) ||
            showManufacturerSection ||
            showMultipleManufacturers) && (
            <Box
              className={`${styles.flex} ${styles.flex_gap_8} ${styles.flex_align_end} ${styles.mb4}`}
            >
              {isVisible(LclToggleKeys.SHOW_OUTPORT_WAREHOUSE) && (
                <Box className={`${styles.w260} ${styles.searchWrap}`}>
                  <PSingleValueSearchableField
                    label="Outport Warehouse"
                    value={formData.destinationWarehouse}
                    data={tempData.destinationWarehouses ?? []}
                    displayFields={
                      (tempData.destinationWarehouses ?? []).length
                        ? Object.keys((tempData.destinationWarehouses ?? [])[0])
                        : []
                    }
                    columnHeaders={[]}
                    onChange={(val) => onChange('destinationWarehouse', val)}
                    disabled={disableRoutingFields?.isOutportWarehouse}
                    onInvalidValueSelected={() => {
                      showError(`Please enter a valid Terms.`)
                      handleTermsChange('');
                    }}
                  />
                </Box>
              )}
              {(showManufacturerSection || showMultipleManufacturers) && (
                <ManufacturerSection
                  entries={formData.manufacturerNames}
                  onChange={(entries: ManufacturerEntry[]) =>
                    onChange('manufacturerNames', entries)
                  }
                  multiple={showMultipleManufacturers}
                />
              )}
            </Box>
          )}

        <Box className={styles.grid}>
          <Box
            className={`${styles.colSpan3} ${styles.flex} ${styles.flex_gap_4} ${styles.flex_align_end}`}
          >
            <Box className={styles.flex1}>
              <PSingleValueSearchableField
                label="Warehouse"
                value={
                  formData.warehouse && formData.warehouseName
                    ? `${formData.warehouse} - ${formData.warehouseName}`
                    : formData.warehouse
                }
                required={truckingRatesIntegration}
                data={internalWarehouseData}
                displayFields={['code', 'name', 'type', 'address', 'state']}
                columnHeaders={['Code', 'Name', 'Type', 'Address', 'State']}
                onChange={(val) => {
                  onChange('warehouse', val);
                  if (formData.warehouseName) onChange('warehouseName', '');
                  setInternalWarehouseQuery(val);
                }}
                onSelect={(item) => {
                  const code = String(item.code ?? '');
                  const name = String(item.name ?? '');
                  onChange('warehouse', code);
                  onChange('warehouseName', name);
                  handleWarehouseSelect?.(item);
                  showWarehouseWarning(item);
                }}
                usePortal
                disabled={disableRoutingFields?.isWarehouse}
                onInvalidValueSelected={() => {
                  showError(`Please enter a valid Warehouse.`)
                  onChange('warehouse', '');
                  onChange('warehouseName', '');
                  handleWarehouseSelect?.({ code: '', name: '' });
                }}
              />
            </Box>
            {showWarehouseMapPin && (
              <Box className={styles.pb4_flex_center}>
                <PMapCoordinatePicker
                  latitude={effectiveLatitude}
                  longitude={effectiveLongitude}
                  onCoordinateChange={(lat, lng) => {
                    setWarehouseLatitude(lat);
                    setWarehouseLongitude(lng);
                  }}
                  mapType={effectiveMapType}
                />
              </Box>
            )}
          </Box>
          {!isQuoteMode && (
            <Box className={styles.colSpan3}>
              <PTextField
                label="Delivery Reference"
                value={formData.deliveryReference}
                onChange={(e) => onChange('deliveryReference', e.target.value)}
                className={styles.textField}
                disabled={disableRoutingFields?.isDeliveryReference}
              />
            </Box>
          )}
          {/* <Box className={styles.colSpan3}>
            <PDatePicker
              id="cargoReadDate"
              label="Cargo Read Date"
              value={formData.cargoReadDate}
              required
              onChange={(val) =>
                onChange('cargoReadDate', (val ?? null) as never)
              }
            />
          </Box> */}

          {(showCfsCutoff || isQuoteMode) && !isTruckQuoteCFSToDoor && (
            <>
              <Box className={styles.colSpan3} data-eservice-field="CFS_CUT_OFF_DATE">
                <PDatePicker
                  id="cfsCutoffDate"
                  label="CFS Cutoff Date"
                  value={formData.cfsCutoffDate}
                  onChange={(val) => handleCfsCutoffDateChange(val ?? null)}
                  required={true}
                />
              </Box>
              <Box className={`${styles.colSpan3} ${styles.searchWrap}`} data-eservice-field="CFS_CUT_OFF_TIME">
                <PSingleValueSearchableField
                  label="CFS Cutoff Time"
                  data={cfsCutoffTimeData}
                  onInvalidValueSelected={() => {
                    // showError('Please enter a valid CFS Cutoff Time.');
                    // onChange('cfsCutoffTime', '');
                    // if (isQuoteMode) setCfsCutoffTimeQuery('');
                  }}
                  value={formData.cfsCutoffTime}
                  displayFields={['time']}
                  columnHeaders={[]}
                  required={true}
                  onChange={(val) => {
                    setCfsCutoffTimeQuery(val);
                    onChange('cfsCutoffTime', val);
                  }}
                  usePortal
                />
              </Box>
            </>
          )}
          {!isQuoteMode && showGatewayCutoff && (
            <>
              <Box className={styles.colSpan3}>
                <PDatePicker
                  id="gatewayCutoffDate"
                  label="Gateway Cutoff Date"
                  value={formData.gatewayCutoffDate}
                  onChange={(val) => handleGatewayCutoffDateChange(val ?? null)}
                />
              </Box>
              <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
                <PSingleValueSearchableField
                  label="Gateway Cutoff Time"
                  data={cfsCutoffTimeData}
                  value={formData.gatewayCutoffTime}
                  displayFields={['time']}
                  columnHeaders={[]}
                  onChange={(val) => {
                    setCfsCutoffTimeQuery(val);
                    onChange('gatewayCutoffTime', val)
                  }}
                  usePortal
                />
              </Box>
            </>
          )}
          {(truckingRatesIntegration || isQuoteMode) && (
            <Box className={styles.colSpan3}>
              <PSingleValueSearchableField
                label="Destination Warehouse"
                value={formData.destinationWarehouse}
                data={tempData.destinationWarehouses ?? []}
                displayFields={
                  (tempData.destinationWarehouses ?? []).length
                    ? Object.keys((tempData.destinationWarehouses ?? [])[0])
                    : []
                }
                onInvalidValueSelected={() => {
                  showError('Please enter a valid Destination Warehouse.');
                  onChange('destinationWarehouse', "");
                }}

                columnHeaders={[]}
                onChange={(val) => onChange('destinationWarehouse', val)}
                disabled
              />
            </Box>
          )}
        </Box>

        {!isQuoteMode && showDeliveryAppointment && (
          <Box className={styles.grid}>
            <Box className={styles.colSpan3}>
              <PDatePicker
                id="deliveryAppointmentDateFrom"
                label="Delivery Date From"
                value={formData.deliveryAppointmentDateFrom}
                onChange={(val) =>
                  handleDeliveryAppointmentDateChange(
                    'deliveryAppointmentDateFrom',
                    val ?? null
                  )
                }
              />
            </Box>
            <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
              <PSingleValueSearchableField
                label="Delivery Time From"
                data={cfsCutoffTimeData}
                value={formData.deliveryAppointmentTimeFrom}
                displayFields={['time']}
                columnHeaders={[]}
                onChange={(val) => {
                  setCfsCutoffTimeQuery(val);
                  handleDeliveryAppointmentTimeChange(
                    'deliveryAppointmentTimeFrom',
                    val as string
                  )
                }}
                usePortal
              />
            </Box>
            <Box className={styles.colSpan3}>
              <PDatePicker
                id="deliveryAppointmentDateTo"
                label="Delivery Date To"
                value={formData.deliveryAppointmentDateTo}
                onChange={(val) =>
                  handleDeliveryAppointmentDateChange(
                    'deliveryAppointmentDateTo',
                    val ?? null
                  )
                }
              />
            </Box>
            <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
              <PSingleValueSearchableField
                label="Delivery Time To"
                data={cfsCutoffTimeData}
                value={formData.deliveryAppointmentTimeTo}
                displayFields={['time']}
                columnHeaders={[]}
                onChange={(val) => {
                  setCfsCutoffTimeQuery(val);
                  handleDeliveryAppointmentTimeChange(
                    'deliveryAppointmentTimeTo',
                    val as string
                  )
                }}
                usePortal
              />
            </Box>
          </Box>
        )}

        {!isQuoteMode && (
          <Box className={styles.grid}>
            <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
              <PSingleValueSearchableField
                label="Doc. Delivery"
                data={internalDocDeliveryData}
                value={formData.docDelivery}
                displayFields={[
                  'code',
                  'name',
                  'address1',
                  'address2',
                  'address3',
                  'contact',
                ]}
                columnHeaders={[
                  'Code',
                  'Name',
                  'Address1',
                  'Address2',
                  'Address3',
                  'Contact',
                ]}
                onChange={(val) => {
                  onChange('docDelivery', val);
                  setInternalDocDeliveryQuery(val);
                }}
                onSelect={(item) => {
                  onChange('docDelivery', String(item.code ?? ''));
                  onChange('docContact', String(item.contact ?? ''));
                }}
                usePortal
              />
            </Box>
            <Box className={styles.colSpan3}>
              <PTextField
                label="Doc. Contact"
                value={formData.docContact}
                onChange={(e) => onChange('docContact', e.target.value)}
                className={styles.textField}
              />
            </Box>
            <Box className={styles.colSpan3}>
              <PDatePicker
                id="docCutoffDate"
                label="Doc. Cutoff Date"
                required={docCutoffMandatory}
                value={formData.docCutoffDate}
                onChange={(val) => handleDocCutoffDateChange(val ?? null)}
              />
            </Box>
            <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
              <PSingleValueSearchableField
                label="Doc. Cutoff Time"
                required={docCutoffMandatory}
                data={cfsCutoffTimeData}
                value={formData.docCutoffTime}
                displayFields={['time']}
                columnHeaders={[]}
                onChange={(val) => {
                  setCfsCutoffTimeQuery(val);
                  onChange('docCutoffTime', val)
                }
                }
                usePortal
              />
            </Box>
            {showCustomCutoff && (
              <>
                {showCfsContactName && (
                  <Box className={styles.colSpan3}>
                    <PTextField
                      label="CFS Contact Name"
                      required={cfsContactNameMandatory}
                      value={formData.cfsContactName}
                      onChange={(e) =>
                        onChange('cfsContactName', e.target.value)
                      }
                      error={
                        cfsContactNameMandatory && !formData.cfsContactName
                      }
                      className={styles.textField}
                    />
                  </Box>
                )}
                <Box
                  className={`${styles.colSpan3} ${!showCfsContactPhone && showCustomsBroker ? styles.searchWrap : ''}`}
                >
                  {showCfsContactPhone ? (
                    <PTextField
                      label="CFS Contact Phone"
                      required={cfsContactPhoneMandatory}
                      value={formData.cfsContactPhone}
                      onChange={(e) =>
                        onChange('cfsContactPhone', e.target.value)
                      }
                      error={
                        cfsContactPhoneMandatory && !formData.cfsContactPhone
                      }
                      className={styles.textField}
                    />
                  ) : showCustomsBroker ? (
                    <PSingleValueSearchableField
                      label="Customs Broker / Contact"
                      value={formData.customsBroker}
                      data={tempData.warehouses}
                      displayFields={
                        tempData.warehouses.length
                          ? Object.keys(tempData.warehouses[0])
                          : []
                      }
                      columnHeaders={[]}
                      onChange={(val) => onChange('customsBroker', val)}
                    />
                  ) : (
                    <PTextField
                      label="Customs Broker / Contact"
                      value={formData.customsBroker}
                      onChange={(e) =>
                        onChange('customsBroker', e.target.value)
                      }
                      className={styles.textField}
                    />
                  )}
                </Box>
                <Box className={styles.colSpan3}>
                  <PDatePicker
                    id="customsCutoffDate"
                    label="Customs Cutoff Date"
                    required={customsCutoffMandatory}
                    value={formData.customsCutoffDate}
                    onChange={(val) =>
                      onChange('customsCutoffDate', (val ?? null) as never)
                    }
                  />
                </Box>
                <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
                  <PSingleValueSearchableField
                    label="Customs Cutoff Time"
                    required={customsCutoffMandatory}
                    data={cfsCutoffTimeData}
                    value={formData.customsCutoffTime}
                    displayFields={['time']}
                    columnHeaders={[]}
                    onChange={(val) => {
                      setCfsCutoffTimeQuery(val);
                      onChange('customsCutoffTime', val);
                    }}
                    usePortal
                  />
                </Box>
              </>
            )}
          </Box>
        )}

        <PModal
          open={openPickupModal}
          onClose={handlePickupDialogClose ?? closePickupModal}
          title="Pickup Details"
          isCloseIcon={true}
          width={{ xs: '95vw', sm: 600, md: 741 }}
          height={{ xs: '85vh', sm: 500 }}
        >
          <Box className={styles.modalColumn}>
            {showPickupError && (
              <PStatusBar
                type="error"
                messages={pickupValidationMessages ?? []}
                isVisible={true}
                onClose={() => {
                  setShowPickupError(false);
                  clearPickupValidation;
                }
                }
              />
            )}
            {pickups.map((pickupId, index) => {
              const isCollapsed = collapsedSet.has(pickupId);
              return (
                <Box key={pickupId}>
                  {formData.pickupNeeded === 'T'
                    ? formData.deliveryType == 'N'
                    : formData.pickupNeeded === 'Y' && (
                      <Box
                        className={`${styles.panelHeader} ${isCollapsed ? styles.panelHeaderCollapsed : styles.panelHeaderExpanded}`}
                      >
                        <Box
                          className={`${styles.panelHeaderTitle} ${isCollapsed ? styles.panelHeaderTitleCollapsed : styles.panelHeaderTitleExpanded}`}
                        >
                          Pickup Details
                        </Box>
                        <Box className={styles.pickupCtrlRow}>
                          {pickupState.pickUpValue !== 'T' && <Box className={styles.pickupCtrlRow}>
                            {!hideAddPickup && (
                              <Box className={styles.pickupAddRow}>
                                <PGradientButton
                                  title="Add"
                                  onClick={handleAddPickup}
                                  className={styles.btnPickupAction}
                                />
                              </Box>
                            )}
                            <Box className={styles.pickupRemoveRow}>
                              {pickups.length > 1 && (
                                <Tooltip title="Remove this pickup">
                                  <PGradientButton
                                    onClick={() => handleRemovePickup(index)}
                                    title="Cancel"
                                    className={`${styles.btnPickupAction} ${styles.btnPickupCancel}`}
                                  />
                                </Tooltip>
                              )}
                            </Box>
                          </Box>}
                          <Box
                            className={`${styles.pickupCollapseCtrl} ${isCollapsed ? styles.pickupCollapseCtrlCollapsed : styles.pickupCollapseCtrlExpanded}`}
                            onClick={() => handleToggleCollapse(pickupId)}
                          >
                            <img
                              src={isCollapsed ? plusImg : minusImg}
                              alt={isCollapsed ? 'expand' : 'collapse'}
                              className={styles.collapseImg}
                            />
                          </Box>
                        </Box>
                      </Box>
                    )}
                  {!isCollapsed &&
                    pickupForms &&
                    handlePickupFormDataChange && (
                      <PickUpDetails
                        index={pickupId}
                        formData={pickupForms[pickupId]}
                        onFormDataChange={(field, val) =>
                          handlePickupFormDataChange(pickupId, field, val)
                        }
                        orgSearchOpen={orgSearchOpenSet?.has(pickupId)}
                        onOrgSearchOpen={() => handleOrgSearchOpen?.(pickupId)}
                        onOrgSearchClose={() =>
                          handleOrgSearchClose?.(pickupId)
                        }
                        onAccessorialsChange={(selected) =>
                          handlePickupAccessorialsChange?.(pickupId, selected)
                        }
                        accessorialOptions={accessorialOptions}
                        pickupValidationMessage={pickupValidationMessages}
                        setPickupValidationMessage={setPickupValidationMessages}
                      />
                    )}
                  {index < pickups.length - 1 && (
                    <Divider className={styles.dividerNoMargin} />
                  )}
                </Box>
              );
            })}
            <Box className={styles.modalActions}>
              <PGradientButton
                title="OK"
                onClick={
                  handlePickupDialogConfirm ??
                  handlePickupDialogClose ??
                  closePickupModal
                }
              // className={styles.buttonSmallEnd}
              />
            </Box>
          </Box>
        </PModal>

        <PModal
          open={openDialog}
          title="Warning"
          onClose={handleCancelRemove ?? (() => { })}
          isCloseIcon={false}
          height={200}
          width={380}
        >
          <Box className={styles.warningContent}>
            <Box>
              <PPickupDetailsWarning
                onYes={handleConfirmRemove}
                onNo={handleCancelRemove ?? (() => { })}
              />
            </Box>
          </Box>
        </PModal>

        <PModal
          open={doorDeliveryDialogOpen ?? false}
          title="Door Delivery Details"
          isCloseIcon={true}
          onClose={handleDoorDeliveryDialogClose ?? (() => { })}
          width={{ xs: '95vw', sm: 600, md: 741 }}
          height={{ xs: '65vh', sm: 350 }}
        >
          <Box className={styles.modalColumn}>
            {showPickupError && (
              <PStatusBar
                type="error"
                messages={pickupValidationMessages ?? []}
                isVisible={true}
                onClose={() => {
                  setShowPickupError(false);
                  clearPickupValidation;
                }
                }
              />
            )}
            {doorDeliveryForm && handleDoorDeliveryFieldChange && (
              <DoorDeliveryDetails
                formData={doorDeliveryForm}
                onFormDataChange={handleDoorDeliveryFieldChange}
                setPickupValidationMessage={setPickupValidationMessages}
                doorAccessorialOptions={doorAccessorialOptions}
              />
            )}
            <Box className={styles.modalActions}>
              <PGradientButton
                title="OK"
                onClick={handleDoorDeliveryDialogOk ?? (() => { })}
              // className={styles.buttonSmall}
              />
            </Box>
          </Box>
        </PModal>

        <PModal
          open={combinedDialogOpen ?? false}
          title="Pickup and Door Delivery Details"
          isCloseIcon={true}
          onClose={() =>
            setConfirmModal({
              message:
                'Changes made will not be saved. Close Pickup and Door Delivery Details pop-up?',
              open: true,
              key: 'PICKUP_DELIVERY',
            })
          }
          width={{ xs: '95vw', sm: 700, md: 741 }}
          height={{ xs: '90vh', sm: 700 }}
        >
          <Box className={styles.modalColumnNoX}>
            {showPickupError && (
              <PStatusBar
                type="error"
                messages={pickupValidationMessages ?? []}
                isVisible={true}
                onClose={() => {
                  setShowPickupError(false);
                  clearPickupValidation;
                }
                }
              />
            )}
            <Box className={styles.modalColumn}>
              {pickups.map((pickupId, index) => {
                const isCollapsed = collapsedSet.has(pickupId);
                return (
                  <Box key={pickupId}>
                    <Box
                      className={`${styles.panelHeader} ${isCollapsed ? styles.panelHeaderCollapsed : styles.panelHeaderExpanded}`}
                    >
                      <Box
                        className={`${styles.panelHeaderTitle} ${isCollapsed ? styles.panelHeaderTitleCollapsed : styles.panelHeaderTitleExpanded}`}
                      >
                        Pickup Details
                      </Box>
                      <Box
                        className={`${styles.flex} ${styles.flex_align_center} ${styles.flex_gap_4}`}
                      >
                        {pickupState.pickUpValue !== 'T' && <Box>
                        {!hideAddPickup && (
                          <PGradientButton
                            title="Add"
                            onClick={handleAddPickup}
                            className={styles.btnPickupAction}
                          />
                        )}
                        {pickups.length > 1 && (
                          <Tooltip title="Remove this pickup">
                            <PGradientButton
                              title="Cancel"
                              onClick={() => handleRemovePickup(index)}
                              className={`${styles.btnPickupAction} ${styles.btnPickupCancel}`}
                            />
                          </Tooltip>
                        )}
                        </Box>
                        }
                        <Box
                          className={`${styles.flex} ${styles.flex_align_center} ${isCollapsed ? styles.borderLeftGray : styles.borderLeftWhite}`}
                          onClick={() => handleToggleCollapse(pickupId)}
                        >
                          <img
                            src={isCollapsed ? plusImg : minusImg}
                            alt={isCollapsed ? 'expand' : 'collapse'}
                            className={styles.collapseImg}
                          />
                        </Box>
                      </Box>
                    </Box>
                    {!isCollapsed &&
                      pickupForms &&
                      handlePickupFormDataChange && (
                        <PickUpDetails
                          index={pickupId}
                          formData={pickupForms[pickupId]}
                          onFormDataChange={(field, val) =>
                            handlePickupFormDataChange(pickupId, field, val)
                          }
                          orgSearchOpen={orgSearchOpenSet?.has(pickupId)}
                          onOrgSearchOpen={() =>
                            handleOrgSearchOpen?.(pickupId)
                          }
                          onOrgSearchClose={() =>
                            handleOrgSearchClose?.(pickupId)
                          }
                          onAccessorialsChange={(selected) =>
                            handlePickupAccessorialsChange?.(pickupId, selected)
                          }
                          accessorialOptions={accessorialOptions}
                          pickupValidationMessage={pickupValidationMessages}
                          setPickupValidationMessage={setPickupValidationMessages}
                        />
                      )}
                    {index < pickups.length - 1 && (
                      <Divider className={styles.dividerNoMargin} />
                    )}
                  </Box>
                );
              })}
            </Box>

            <Box
              className={`${styles.panelHeader} ${doorDeliveryCollapsed ? styles.panelHeaderCollapsed : styles.panelHeaderExpanded} ${styles.mx5}`}
            >
              <Box
                className={`${styles.panelHeaderTitle} ${doorDeliveryCollapsed ? styles.panelHeaderTitleCollapsed : styles.panelHeaderTitleExpanded}`}
              >
                Door Delivery Details
              </Box>
              <Box
                className={`${styles.flex} ${styles.flex_align_center} ${doorDeliveryCollapsed ? styles.borderLeftGray : styles.borderLeftWhite}`}
                onClick={() => setDoorDeliveryCollapsed?.((prev) => !prev)}
              >
                <img
                  src={doorDeliveryCollapsed ? plusImg : minusImg}
                  alt={doorDeliveryCollapsed ? 'expand' : 'collapse'}
                  className={styles.collapseImg}
                />
              </Box>
            </Box>

            {/* Door Delivery form */}
            {!doorDeliveryCollapsed &&
              doorDeliveryForm &&
              handleDoorDeliveryFieldChange && (
                <Box className={styles.panelBoxInner}>
                  <DoorDeliveryDetails
                    formData={doorDeliveryForm}
                    onFormDataChange={handleDoorDeliveryFieldChange}
                    setPickupValidationMessage={setPickupValidationMessages}
                    doorAccessorialOptions ={doorAccessorialOptions}
                  />
                </Box>
              )}

            <Box className={styles.modalActions}>
              <PGradientButton
                title="OK"
                onClick={handleCombinedDialogOk ?? (() => { })}
              // className={styles.buttonSmall}
              />
            </Box>
          </Box>
        </PModal>
        <PModal
          open={scheduleSearchOpen ?? false}
          onClose={onCloseScheduleSearch ?? (() => { })}
          title="Schedule"
          isCloseIcon={true}
          width={970}
          height={500}
        >
          <SailingScheduleSearchPage
            onBookThis={handleScheduleBookThis}
            showAccurateRatesToggle={showAccurateRatesToggle}
            routingFormData={formData}
          />
        </PModal>

        <LocationSearchModal
          key={locationModalKey}
          open={locationModalOpen}
          onClose={() => setLocationModalOpen(false)}
          onSelect={handleLocationSelect}
        />

        {/* Common Confirmation Modal */}

        <PConfirmationModal
          message={confirmModal.message}
          open={confirmModal.open}
          sx={{ width: '35rem' }}
          primaryAction={{
            label: 'Yes',
            onClick: () => {
              confirmModalOnClose();
            },
          }}
          secondaryAction={{
            label: 'No',
            onClick: () => setConfirmModal({ message: '', open: false }),
          }}
          onClose={() => setConfirmModal({ message: '', open: false })}
        />
        <PConfirmationModal
          open={warehouseWarningPopup}
          title="Warning"
          message="You are changing the warehouse, which will have an impact on 
                the trucking rates. Rates may not be filed for this routing."
          variant="warning"
          width="50%"
          primaryAction={{
            label: 'Yes',
            onClick: () =>  showWarehouseWarningPopup(false),
          }}
         onClose={() =>  showWarehouseWarningPopup(false)}
        />
      </Box>
    </div>
  );
}

export default RoutingDetails;
