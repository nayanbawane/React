import { useEffect, useMemo, useRef, useState } from 'react';
import styles from '../../../../styles/LCL/PreBookingMainDetails.module.css';
import {
  PSelect,
  PSingleValueSearchableField,
  PMultiValueSearchableField,
  PTextField,
  PToggleButton,
  PConfirmationModal,
  PStatusSelect,
  PGradientButton,
} from 'phoenix-react-lib';

import type { PStatusSelectOption } from '@/types';
import { PreBookingFormData, PreBookingMainDetailsProps } from '@/types';
import { useGetSelections } from '../../../../hooks/LCL/useGetSelections';
import {
  bookingModeOfTransportConfig,
  bookingTypeSuggestionConfig,
  clauseSuggestionConfig,
  getPreBookingOfficeSuggestionConfig,
  officeSuggestionConfig,
  prebookingquoteReferenceSuggestionConfig,
  prebookingRefrenceeSuggestionConfig,
  quoteReferenceSuggestionConfig,
  useFeatureToggle,
  useGetSuggestions,
  userReferenceSuggestionConfig,
} from '../../../../hooks';
import { useAppDispatch, useAppSelector } from '../../../../app/store/hooks';
import { CommonToggleKeys, LclToggleKeys } from '../../../../core';
import {
  setReferenceDisabled,
  setReferenceNoInvalid,
  setImportQuoteNoInvalid,
  updatePreBookingMainDetails,
} from '../../../../app/slices/LCL/PreBooking/preBookingSlice';
import dayjs from 'dayjs';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';

import { getInitialPreBookingFormData } from '../../../../InitialData';

export const DATE_FORMAT = 'DD-MMM-YYYY';
const formatRequestDate = (value: string | null) =>
  value ? dayjs(value).format(DATE_FORMAT).toUpperCase() : null;

type OfficeType = 'ORIGIN' | 'DESTINATION' | 'AGENT';
type StatusAvailability = 'enabled' | 'disabled';

// Per spec PHX-131769 section 8 — Destination / Origin / Agent columns
const IMPORT_BOOKING_STATUS_RULES: {
  label: string;
  value: string;
  origin: StatusAvailability;
  destination: StatusAvailability;
  agent: StatusAvailability;
  hasIndicator: boolean;
}[] = [
  {
    label: 'Pre-Booking Request Received',
    value: 'PBREQRECV',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'disabled',
    hasIndicator: false,
  },
  {
    label: 'Pre-Booking Created',
    value: 'PBCREATED',
    origin: 'enabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: false,
  },
  {
    label: 'Pre-Booking Incomplete',
    value: 'PBINCOMP',
    origin: 'enabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: false,
  },
  {
    label: 'Pre-Booking Updated',
    value: 'PBUPD',
    origin: 'disabled',
    destination: 'enabled',
    agent: 'enabled',
    hasIndicator: false,
  },
  {
    label: 'Shipper Contacted',
    value: 'SHIPCONT',
    origin: 'enabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'No Response from Shipper',
    value: 'NORESP',
    origin: 'enabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Shipment is Unknown by Shipper',
    value: 'SHIPUNK',
    origin: 'enabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Cargo Not Ready',
    value: 'CARGONR',
    origin: 'enabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Document Not Ready',
    value: 'DOCNR',
    origin: 'enabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Booking Confirmed',
    value: 'BCF',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Booking Updated',
    value: 'BU',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Cargo Picked up',
    value: 'CPU',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Received in Warehouse',
    value: 'RW',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Lot terminated',
    value: 'LT',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Container Loaded and Sealed',
    value: 'CLS',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Confirmed on Board',
    value: 'COB',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Bill of Lading Printed',
    value: 'BLP',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Arrived at Transshipment Port',
    value: 'ATP',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Container Loaded and Sealed at Transshipment Port',
    value: 'CLSTP',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Confirmed on Board at Transshipment Port',
    value: 'CBTP',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Arrival Notice Sent',
    value: 'ANS',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Devanned at deconsolidation CFS',
    value: 'DDC',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Freight Released',
    value: 'FR',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Picked up by Customer',
    value: 'PUC',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Picked up for Delivery',
    value: 'PUD',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
  {
    label: 'Delivered',
    value: 'DL',
    origin: 'disabled',
    destination: 'disabled',
    agent: 'enabled',
    hasIndicator: true,
  },
];

export function PreBookingMainDetails({
  onFieldsChange,
  onRegisterFields,
  showStatus,
  onPopulateData,
  onPopulateQuoteData,
  onsaveExportBooking,
  isShipmentConfirmed = false,
  suggestClauseIconClick,
  onResetCustomer,
}: PreBookingMainDetailsProps) {
  const formState = useAppSelector((state) => state.preBooking.mainDetails);

  const customerType = useAppSelector((state) => state.preBooking.customerType);
  const INTERCOMPANY = 'I';
  const TRACKED_FIELDS: string[] = ['type', 'preBookingChannel', 'createdBy'];
  const [showMore, setShowMore] = useState(true);
  const [exportBookingPopup, setExportBookingPopup] = useState({
    open: false,
    oldValue: formState.exportBookingNumber,
    newValue: '',
  });
  const [indicatorToggles, setIndicatorToggles] = useState<
    Record<string, boolean>
  >({});
  useEffect(() => {
    onRegisterFields?.(TRACKED_FIELDS);
  }, []);

  const MULTISELECT_FIELD_MAXLIMIT = {
    clauses: 15,
  };

  const { isVisible, isLoaded: isTogglesLoaded } = useFeatureToggle();

  // Map each indicator status value to its office-level toggle key (PHX-131769 §8)
  const STATUS_TOGGLE_KEY_MAP: Record<string, string> = {
    PBREQRECV: LclToggleKeys.PREBKG_STATUS_TOGGLE_PRE_BOOKING_REQUEST_RECEIVED,
    PBCREATED: LclToggleKeys.PREBKG_STATUS_TOGGLE_PRE_BOOKING_CREATED,
    PBINCOMP: LclToggleKeys.PREBKG_STATUS_TOGGLE_PRE_BOOKING_INCOMPLETE,
    PBUPD: LclToggleKeys.PREBKG_STATUS_TOGGLE_PRE_BOOKING_UPDATED,
    SHIPCONT: LclToggleKeys.PREBKG_STATUS_TOGGLE_SHIPPER_CONTACTED,
    NORESP: LclToggleKeys.PREBKG_STATUS_TOGGLE_NO_RESPONSE_FROM_SHIPPER,
    SHIPUNK: LclToggleKeys.PREBKG_STATUS_TOGGLE_SHIPMENT_UNKNOWN,
    CARGONR: LclToggleKeys.PREBKG_STATUS_TOGGLE_CARGO_NOT_READY,
    DOCNR: LclToggleKeys.PREBKG_STATUS_TOGGLE_DOC_NOT_READY,
    BCF: LclToggleKeys.PREBKG_STATUS_TOGGLE_BOOKING_CONFIRMED,
    BU: LclToggleKeys.PREBKG_STATUS_TOGGLE_BOOKING_UPDATED,
    CPU: LclToggleKeys.PREBKG_STATUS_TOGGLE_CARGO_PICKED_UP,
    RW: LclToggleKeys.PREBKG_STATUS_TOGGLE_RECEIVED_IN_WAREHOUSE,
    LT: LclToggleKeys.PREBKG_STATUS_TOGGLE_LOT_TERMINATED,
    CLS: LclToggleKeys.PREBKG_STATUS_TOGGLE_CONTAINER_LOADED_SEALED,
    COB: LclToggleKeys.PREBKG_STATUS_TOGGLE_CONFIRMED_ON_BOARD,
    BLP: LclToggleKeys.PREBKG_STATUS_TOGGLE_BOL_PRINTED,
    ATP: LclToggleKeys.PREBKG_STATUS_TOGGLE_ARRIVED_TRANSSHIPMENT,
    CLSTP: LclToggleKeys.PREBKG_STATUS_TOGGLE_CLS_TRANSSHIPMENT,
    CBTP: LclToggleKeys.PREBKG_STATUS_TOGGLE_COB_TRANSSHIPMENT,
    ANS: LclToggleKeys.PREBKG_STATUS_TOGGLE_ARRIVAL_NOTICE_SENT,
    DDC: LclToggleKeys.PREBKG_STATUS_TOGGLE_DEVANNED_DECON_CFS,
    FR: LclToggleKeys.PREBKG_STATUS_TOGGLE_FREIGHT_RELEASED,
    PUC: LclToggleKeys.PREBKG_STATUS_TOGGLE_PICKED_UP_CUSTOMER,
    PUD: LclToggleKeys.PREBKG_STATUS_TOGGLE_PICKED_UP_DELIVERY,
    DL: LclToggleKeys.PREBKG_STATUS_TOGGLE_DELIVERED,
  };

  // Derive office-level default indicator values from feature toggles
  // Recomputes once isTogglesLoaded becomes true so isVisible reads correct values
  const officeIndicatorDefaults = useMemo(
    () =>
      Object.fromEntries(
        IMPORT_BOOKING_STATUS_RULES.filter((r) => r.hasIndicator).map((r) => [
          r.value,
          isVisible(STATUS_TOGGLE_KEY_MAP[r.value] as any),
        ])
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isTogglesLoaded]
  );

  // Seed indicatorToggles: prefer saved toggleValue from backend list, fall back to office-level defaults
  useEffect(() => {
    if (!isTogglesLoaded) return; // wait until feature toggle values are available
    const listFromBackend = formState.importBookingStatusList;
    if (Array.isArray(listFromBackend) && listFromBackend.length > 0) {
      // Backend returned saved list — restore toggle state from it
      const fromBackend = Object.fromEntries(
        listFromBackend
          .filter((item) => item.isToggleApplicable === 'Y')
          .map((item) => [item.statusCode, item.toggleValue === 'Y'])
      );
      setIndicatorToggles({ ...officeIndicatorDefaults, ...fromBackend });
    } else {
      // Backend returned empty list — seed local state AND Redux with office defaults
      setIndicatorToggles(officeIndicatorDefaults);
      if (Object.keys(officeIndicatorDefaults).length > 0) {
        const defaultList = IMPORT_BOOKING_STATUS_RULES.map((rule) => ({
          statusCode: rule.value,
          statusName: rule.label,
          isToggleApplicable: (rule.hasIndicator ? 'Y' : 'N') as 'Y' | 'N',
          toggleValue: (rule.hasIndicator
            ? officeIndicatorDefaults[rule.value]
              ? 'Y'
              : 'N'
            : '') as 'Y' | 'N' | '',
        }));
        handleChange('importBookingStatusList', defaultList);
      }
    }
  }, [
    formState.importBookingStatusList,
    officeIndicatorDefaults,
    isTogglesLoaded,
  ]);
  const loginClientBean = useAppSelector(selectLoginClientBean);
  const dispatch = useAppDispatch();

  const userReferenceSuggConfigParam: Record<string, unknown> = {
    schemaOffice: loginClientBean?.office,
    handlingOffice: formState?.handlingOffice || loginClientBean?.office,
    schemaName: loginClientBean?.schema,
  };

  useEffect(() => {
    if (loginClientBean && !formState.createdBy) {
      dispatch(
        updatePreBookingMainDetails(
          getInitialPreBookingFormData(loginClientBean)
        )
      );
    }
  }, [loginClientBean]);

  const { data: bookingModeOfTransportSelections } = useGetSelections(
    bookingModeOfTransportConfig
  );

  const modeOfTransportOptions = bookingModeOfTransportSelections.map(
    (item: any) => ({
      label: item?.label ?? '',
      value: item?.value ?? '',
    })
  );
  const { data: bookingTypeSuggestions, setQuery: setBookingTypeQuery } =
    useGetSuggestions(bookingTypeSuggestionConfig(loginClientBean as any));

  const { data: userReferenceSuggestions, setQuery: setUserReferenceQuery } =
    useGetSuggestions(
      userReferenceSuggestionConfig(
        userReferenceSuggConfigParam as Record<string, unknown>
      )
    );

  const { data: clauseSuggestions, setQuery: setClauseQuery } =
    useGetSuggestions(clauseSuggestionConfig(loginClientBean as any));

  const {
    data: prebookingRefrenceSuggestions,
    setQuery: setReferenceQuery,
    loading: isReferenceLoading,
  } = useGetSuggestions(
    prebookingRefrenceeSuggestionConfig(loginClientBean as any)
  );

  const { data: officeSuggestions, setQuery: setOfficeQuery } =
    useGetSuggestions(officeSuggestionConfig);

  const { data: quoteReferenceSuggestions, setQuery: setQuoteReferenceQuery } =
    useGetSuggestions(
      prebookingquoteReferenceSuggestionConfig(loginClientBean as any)
    );

  const initialOffice = loginClientBean?.office ?? '';

  const compareHandlingOffice = (selectedValue: string): boolean => {
    const initial = initialOffice;
    const selected = (selectedValue ?? '').trim();
    const result = selected === initial;
    return result;
  };

  const compareBookingOffice = (selectedValue: string): boolean => {
    const initial = initialOffice;
    const selected = (selectedValue ?? '').trim();
    const result = selected === initial;
    return result;
  };

  const requestOfficeConfig = getPreBookingOfficeSuggestionConfig(
    loginClientBean?.office ?? ''
  );
  const [previousBookingOffice, setPreviousBookingOffice] = useState(
    loginClientBean?.office ?? ''
  );

  const { data: bookingOfficeSuggestion, setQuery: setBookingOfficeQuery } =
    useGetSuggestions<unknown, Record<string, unknown>>({
      endpoint: requestOfficeConfig.endpoint,
      minChars: requestOfficeConfig.minChars,
      debounceMs: requestOfficeConfig.debounceMs,
      transformRequest: requestOfficeConfig.transformRequest,
      transformResponse: requestOfficeConfig.transformResponse,
    });

  const validateReferenceAfterApiRef = useRef(false);

  const isReferenceDisabled = useAppSelector(
    (state) => state.preBooking.isReferenceDisabled
  );

  const isReferenceNoInvalid = useAppSelector(
    (state) => state.preBooking.isReferenceNoInvalid
  );

  const isImportQuoteNoInvalid = useAppSelector(
    (state) => state.preBooking.isImportQuoteNoInvalid
  );

  const handleChange = (field: keyof PreBookingFormData, value: any) => {
    let nextValue = value;
    dispatch(
      updatePreBookingMainDetails({
        [field]: nextValue,
      } as Partial<PreBookingFormData>)
    );
  };

  const handleExportBookingOk = () => {
    setExportBookingPopup((prev) => ({
      ...prev,
      open: false,
      oldValue: prev.newValue,
    }));
    dispatch(
      updatePreBookingMainDetails({
        exportBookingNumber: exportBookingPopup.newValue,
      } as Partial<PreBookingFormData>)
    );
  };
  const handleExportBookingCancel = () => {
    setExportBookingPopup((prev) => ({
      ...prev,
      open: false,
    }));
    dispatch(
      updatePreBookingMainDetails({
        exportBookingNumber: exportBookingPopup?.oldValue,
      } as Partial<PreBookingFormData>)
    );
  };

  useEffect(() => {
    if (
      formState.reference &&
      prebookingRefrenceSuggestions &&
      prebookingRefrenceSuggestions.length === 0
    ) {
      setReferenceNoInvalid(true);
    } else {
      setReferenceNoInvalid(false);
    }
  }, [prebookingRefrenceSuggestions, formState.reference]);

  useEffect(() => {
    if (
      formState.importQuoteNumber &&
      quoteReferenceSuggestions &&
      quoteReferenceSuggestions.length === 0
    ) {
      setImportQuoteNoInvalid(true);
    } else {
      setImportQuoteNoInvalid(false);
    }
  }, [quoteReferenceSuggestions, formState.importQuoteNumber]);

  useEffect(() => {
    if (modeOfTransportOptions.length > 0 && !formState.modeOfTransport) {
      // set default value (example: "O")
      const defaultOption =
        modeOfTransportOptions.find((opt) => opt.value === 'O') ||
        modeOfTransportOptions[0]; // fallback

      handleChange('modeOfTransport', defaultOption.value);
    }
  }, [modeOfTransportOptions]);

  const isImportBookingStatusDisabled =
    !formState.reference ||
    !formState.reference.trim() ||
    formState.reference.includes('%') ||
    (!!formState.pendingFinal && !formState.agentBooking);

  // const referenceValue = formState.reference?.trim() || '';

  // const isReferenceDisabled =
  //   /^\d+$/.test(referenceValue) &&
  //   Number(referenceValue) > 0 &&
  //   referenceValue.length >= 8;

  // useEffect(() => {
  //   if (!value) return;
  //   dispatch(updatePreBookingMainDetails(value));
  // }, [dispatch, value]);

  // useEffect(() => {
  //   if (value?.receivedVia) return;
  //   const hasValidSelection = receivedViaOptions.some(
  //     (option) => option.value === formState.receivedVia
  //   );
  //   if (!hasValidSelection || !formState.receivedVia) {
  //     handleChange('receivedVia', defaultReceivedVia);
  //   }
  // }, [
  //   defaultReceivedVia,
  //   formState.receivedVia,
  //   receivedViaOptions,
  //   value?.receivedVia,
  // ]);

  useEffect(() => {
    onRegisterFields?.(TRACKED_FIELDS);
    onFieldsChange?.({
      ...formState,
      createdOn: formatRequestDate(formState.createdOn),
      updatedOn: formatRequestDate(formState.updatedOn),
    });
  }, [formState]);

  const isChatAppEnabled = isVisible(
    CommonToggleKeys.OCN_QUO_BKG_SHOW_CHATAPP_CHANNEL
  );
  const receivedViaOptions = useMemo(() => {
    const options = [
      { label: 'Please Select', value: '' },
      { label: 'Email', value: 'E' },
      { label: 'Phone', value: 'P' },
    ];
    if (isChatAppEnabled) {
      options.push({ label: 'Chat App', value: 'C' });
    }
    return options;
  }, [isChatAppEnabled]);

  const officeType: OfficeType = useMemo(() => {
    if (!formState.isReferencePopulated) return 'ORIGIN';
    if (formState.agentBooking) return 'AGENT';
    const bookingMatch = compareBookingOffice(formState.bookingOffice ?? '');
    const handlingMatch = compareHandlingOffice(formState.handlingOffice ?? '');
    return bookingMatch ? 'DESTINATION' : handlingMatch ? 'ORIGIN' : 'ORIGIN';
  }, [
    formState.isReferencePopulated,
    formState.agentBooking,
    formState.bookingOffice,
    formState.handlingOffice,
    initialOffice,
  ]);

  const indicatorColor =
    officeType === 'ORIGIN'
      ? '#42a5f5'
      : officeType === 'DESTINATION'
        ? '#0d47a1'
        : '#1976d2';

  const IMPORT_BOOKING_STATUS = useMemo((): PStatusSelectOption[] => {
    if (!formState.isReferencePopulated) return [];
    const key = officeType.toLowerCase() as 'origin' | 'destination' | 'agent';
    // Indicator is interactive only for: AGENT, DESTINATION (10.K), or ORIGIN when agentBooking=true (PHX-131769 §8)
    // Locked when shipment is confirmed (Point 10.J)
    const canEditIndicators =
      !isShipmentConfirmed &&
      (officeType === 'AGENT' ||
        officeType === 'DESTINATION' ||
        (officeType === 'ORIGIN' && !!formState.agentBooking));

    // Point 6 — all statuses beyond PBREQRECV/PBCREATED are locked until current status reaches PBCREATED
    const currentStatus = formState.importBookingStatus;
    const hasReachedPBCreated =
      currentStatus !== 'PBREQRECV' &&
      currentStatus !== '-1' &&
      currentStatus !== '';

    return IMPORT_BOOKING_STATUS_RULES.map((rule) => {
      const officeDisabled = rule[key] === 'disabled';
      // Lock all statuses except PBREQRECV and PBCREATED until PBCREATED has been reached (Point 6)
      const notYetUnlocked =
        !hasReachedPBCreated &&
        rule.value !== 'PBREQRECV' &&
        rule.value !== 'PBCREATED';
      // Point 10.F — NORESP only selectable when current status is SHIPCONT (Point 10.F sub-point i)
      const norespLocked =
        rule.value === 'NORESP' && currentStatus !== 'SHIPCONT';
      return {
        label: rule.label,
        value: rule.value,
        disabled: officeDisabled || notYetUnlocked || norespLocked,
        hasIndicator: rule.hasIndicator,
        indicatorChecked: rule.hasIndicator
          ? (indicatorToggles[rule.value] ??
            officeIndicatorDefaults[rule.value] ??
            true)
          : undefined,
        indicatorColor: indicatorColor,
        indicatorInteractive:
          rule.hasIndicator && !notYetUnlocked && canEditIndicators,
      };
    });
  }, [
    formState.isReferencePopulated,
    formState.importBookingStatus,
    formState.agentBooking,
    officeType,
    indicatorToggles,
    officeIndicatorDefaults,
    indicatorColor,
    isShipmentConfirmed,
  ]);

  useEffect(() => {
    if (!validateReferenceAfterApiRef.current) return;

    if (isReferenceLoading) return;

    validateReferenceAfterApiRef.current = false;

    const referenceValue = formState.reference?.trim();

    if (!referenceValue) return;
    const hasAlphanumeric = /[a-zA-Z0-9]/.test(referenceValue);

    if (!hasAlphanumeric) return;
    if (
      !prebookingRefrenceSuggestions ||
      prebookingRefrenceSuggestions.length === 0
    ) {
      dispatch(setReferenceNoInvalid(true));
    } else {
      dispatch(setReferenceNoInvalid(false));

      onPopulateData?.(prebookingRefrenceSuggestions[0].value as string);
    }
  }, [isReferenceLoading, prebookingRefrenceSuggestions, formState.reference]);
  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.field}>
          <PSelect
            label="Type"
            value={formState.type}
            onChange={(val: any) => handleChange('type', val)}
            required
            options={[
              { label: 'Please Select', value: '' },
              { label: 'LCL Booking', value: 'L' },
            ]}
          />
        </div>

        <div className={styles.field}>
          <PSingleValueSearchableField
            label="Reference"
            id="referenceNumber"
            data={prebookingRefrenceSuggestions}
            displayFields={['label']}
            columnHeaders={[]}
            usePortal
            value={formState.reference || ''}
            disabled={isReferenceDisabled}
            onChange={(value) => {
              setReferenceQuery(value);
              handleChange('reference', value);
            }}
            onSelect={(item) => {
              dispatch(setReferenceDisabled(true));
              dispatch(setReferenceNoInvalid(false));
              onPopulateData?.(item.value as string);

              return handleChange('reference', item.value);
            }}
            onBlur={() => {
              validateReferenceAfterApiRef.current = true;
            }}
          />
        </div>

        <div className={styles.field}>
          {/* <PTextField
            label="Import Quote Number"
            value={formState.importQuoteNumber}
            onChange={(e) => handleChange('importQuoteNumber', e.target.value)}
          /> */}

          <PSingleValueSearchableField
            label="Import Quote Number"
            id="Import Quote Number"
            data={quoteReferenceSuggestions}
            displayFields={['SUGGEST_VALUE']}
            displayValueField="SUGGEST_KEY"
            columnHeaders={[]}
            value={formState?.importQuoteNumber || ''}
            onChange={(val) => {
              setQuoteReferenceQuery(val);
              handleChange('importQuoteNumber', val);
            }}
            onSelect={(item) => {
              dispatch(setImportQuoteNoInvalid(false));
              onPopulateQuoteData?.(item.SUGGEST_KEY as string);
              return handleChange('importQuoteNumber', item.SUGGEST_KEY);
            }}
            onBlur={() => {
              const quoteValue = formState.importQuoteNumber?.trim();
              if (!quoteValue) return;
              const hasAlphanumeric = /[a-zA-Z0-9]/.test(quoteValue);
              if (!hasAlphanumeric) return;
              if (quoteReferenceSuggestions?.length === 0) {
                dispatch(setImportQuoteNoInvalid(true));
              }
            }}
          />
        </div>

        <div className={styles.field}>
          <PSingleValueSearchableField
            label="User Reference"
            id="userReference"
            value={formState.userReference || ''}
            data={userReferenceSuggestions}
            displayFields={['displayValue']}
            columnHeaders={[]}
            onChange={(value) => {
              setUserReferenceQuery(value);
              handleChange('userReference', value);
            }}
            onSelect={(value) => handleChange('userReference', value.code)}
          />
        </div>

        <div className={styles.field}>
          <PSelect
            label="Mode Of Transport"
            value={formState.modeOfTransport}
            onChange={(val) => handleChange('modeOfTransport', val)}
            options={modeOfTransportOptions}
          />
        </div>

        <div className={styles.field}>
          <PSelect
            label="Routed"
            value={formState.routed}
            onChange={(val) => {
              const previousRouted = formState.routed;

              const shouldClearCustomer =
                previousRouted === 'CT' &&
                val !== 'CT' &&
                customerType === INTERCOMPANY;

              if (shouldClearCustomer) {
                onResetCustomer?.();
              }

              handleChange('routed', val);
            }}
            defaultValue="Y"
            options={[
              { label: 'Yes', value: 'Y' },
              { label: 'No', value: 'N' },
              { label: 'Cross Trade', value: 'CT' },
            ]}
          />
        </div>
      </div>

      <div className={styles.row2}>
        <div className={`${styles.field} ${styles.col1to2}`}>
          <PMultiValueSearchableField
            label="Clauses"
            id="clauses"
            data={clauseSuggestions}
            maxSelectionAllowed={MULTISELECT_FIELD_MAXLIMIT.clauses}
            initialSelectedItems={
              formState?.clauses?.map((c) => ({
                code: c.clauseCode,
                name: c.clauseName ?? '',
                description: c.clauseDesc ?? '',
              })) || []
            }
            displayFields={['code', 'name', 'description']}
            suggestClausesIcon={formState.type === 'L'}
            columnHeaders={[]}
            onSearch={(val: string) => setClauseQuery(val)}
            onSelect={(item) => {
              const currentClauses = Array.isArray(formState?.clauses)
                ? formState.clauses
                : [];
              const alreadyAdded = currentClauses.some(
                (c: any) => c.clauseCode === item.code
              );
              if (!alreadyAdded) {
                handleChange('clauses', [
                  ...currentClauses,
                  {
                    clauseCode: item.code,
                    clauseName: item.name ?? null,
                    clauseDesc: item.description ?? null,
                  },
                ]);
              }
            }}
            onRemove={(removedItem) => {
              const currentClauses = Array.isArray(formState?.clauses)
                ? formState.clauses
                : [];
              handleChange(
                'clauses',
                currentClauses.filter((c) => c.clauseCode !== removedItem.code)
              );
            }}
            onValidationError={(type) => {
              if (type === 'duplicate') {
                showStatus('warning', ['Duplicate Item are not allowed']);
              }
              // if (type === 'maxLimit') {
              //   showStatus('warning', [
              //     `Only ${MULTISELECT_FIELD_MAXLIMIT.clauses} item(s) allowed.`,
              //   ]);
              // }
            }}
            handleClauseIconClick={suggestClauseIconClick}
          />
        </div>
        <div className={styles.field}>
          <PSingleValueSearchableField
            disabled={isShipmentConfirmed}
            label="Export Booking Number"
            id="exportBookingNumber"
            value={formState?.exportBookingNumber || ''}
            data={bookingTypeSuggestions}
            displayFields={['label']}
            columnHeaders={[]}
            onChange={(value) => {
              setBookingTypeQuery(value);
              handleChange('exportBookingNumber', value);
            }}
            onSelect={(item) => {
              if (formState?.reference != null) {
                setExportBookingPopup((prev) => ({
                  ...prev,
                  open: true,
                  newValue: item.value,
                }));
              }
              onPopulateData?.(item.value as string);
              handleChange('exportBookingNumber', item.value);
            }}
          />
        </div>
        <div className={styles.field}>
          <PTextField
            label="Export Quote Number"
            disabled
            value={formState.exportQuoteNumber}
            onChange={(e) => handleChange('exportQuoteNumber', e.target.value)}
          />
        </div>

        <div className={`${styles.field} ${styles.col5}`}>
          <PSelect
            label="Pre-Booking Channel"
            value={formState.preBookingChannel}
            required
            onChange={(val) => handleChange('preBookingChannel', val)}
            options={receivedViaOptions}
          />
        </div>

        <div className={`${styles.field} ${styles.col6}`}>
          <PStatusSelect
            label="Import Pre-Booking Status"
            value={
              formState.importBookingStatus === '-1'
                ? ''
                : formState.importBookingStatus
            }
            onChange={(val) => handleChange('importBookingStatus', val)}
            options={IMPORT_BOOKING_STATUS}
            placeholder="Please Select"
            disabled={isShipmentConfirmed || isImportBookingStatusDisabled}
            onIndicatorChange={(optVal: string, checked: boolean) => {
              setIndicatorToggles((prev) => {
                const next = { ...prev, [optVal]: checked };
                const updatedList = IMPORT_BOOKING_STATUS_RULES.map((rule) => ({
                  statusCode: rule.value,
                  statusName: rule.label,
                  isToggleApplicable: (rule.hasIndicator ? 'Y' : 'N') as
                    | 'Y'
                    | 'N',
                  toggleValue: (rule.hasIndicator
                    ? next[rule.value]
                      ? 'Y'
                      : 'N'
                    : '') as 'Y' | 'N' | '',
                }));
                handleChange('importBookingStatusList', updatedList);
                return next;
              });
            }}
            menuHeight={180}
            menuGap={2}
            size="small"
          />
        </div>
      </div>

      <div className={styles.cmnRow}>
        <div className={`${styles.field} ${styles.cmnColumn}`}>
          <div className={`${styles.field} ${styles.TruckQuoteNumber}`}>
            <PTextField
              label="Truck Quote Number"
              disabled
              value={formState.truckQuoteNumber}
              onChange={(e) => handleChange('truckQuoteNumber', e.target.value)}
            />
          </div>
          <PToggleButton
            label="Pending Final"
            value={formState.pendingFinal}
            disabled={
              formState.agentBooking ||
              formState.importBookingStatus === 'PBCREATED'
            }
            onChange={(val) => {
              handleChange('pendingFinal', val);
              // Point 10.B.III — auto-set PBCREATED when pendingFinal toggled to No on existing booking
              if (
                formState.isReferencePopulated &&
                !val &&
                formState.handlingOffice
              ) {
                handleChange('importBookingStatus', 'PBCREATED');
              }
            }}
          />

          <PToggleButton
            label="Hold"
            value={formState.hold}
            onChange={(val) => handleChange('hold', val)}
          />
        </div>

        <div className={styles.cmnColumn}>
          <div>
            <PToggleButton
              label="Follow Up"
              value={formState.followUp}
              onChange={(val) => handleChange('followUp', val)}
            />
          </div>
        </div>
        <div className={styles.cmnColumn}>
          <div>
            <PToggleButton
              label="Agent Booking"
              value={formState.agentBooking}
              onChange={(val) => {
                handleChange('agentBooking', val);
                if (val) {
                  setPreviousBookingOffice(formState.bookingOffice || '');
                  handleChange('bookingOffice', '');
                  handleChange('pendingFinal', false);
                  handleChange('handlingOffice', loginClientBean?.office);
                } else {
                  handleChange('bookingOffice', previousBookingOffice);
                  handleChange('handlingOffice', '');
                }
              }}
            />
          </div>
        </div>
        <div className={styles.cmnColumn}>
          <PTextField
            label="WWA BL Number"
            inputProps={{ maxLength: 25 }}
            value={formState.wwablnumber}
            onChange={(e) => handleChange('wwablnumber', e.target.value)}
          />
        </div>
        {compareHandlingOffice(formState.handlingOffice ?? '') && (
          <div
            className={`${styles.cmnColumn} ${styles.field} ${styles.shipmentConfirm} `}
          >
            <PGradientButton
              title={'Shipment Confirmed'}
              disabled={
                isShipmentConfirmed ||
                formState.importBookingStatus !== 'PBCREATED'
              }
              onClick={() => onsaveExportBooking(formState.reference)}
            />
          </div>
        )}
      </div>

      <div
        className={styles.moreDetailsToggle}
        onClick={() => setShowMore(!showMore)}
      >
        {showMore ? '▼' : '▶'} More Details
      </div>

      {showMore && (
        <div className={styles.moreDetailsSection}>
          <div className={styles.moreDetailsGrid}>
            {/* <div className={`${styles.field} ${styles.colBillingCompany}`}>
              <PTextField
                label="Billing Company"
                value={formState.billingCompany}
                onChange={(e) => handleChange('billingCompany', e.target.value)}
              />
            </div> */}
            <div className={`${styles.field} ${styles.colHandlingOffice}`}>
              {/* <PTextField
                label="Handling Office"
                value={formState.handlingOffice}
                onChange={(e) => handleChange('handlingOffice', e.target.value)}
              /> */}

              <PSingleValueSearchableField
                label="Handling Office"
                id="handlingOffice"
                usePortal
                data={officeSuggestions}
                displayFields={['label']}
                required
                columnHeaders={[]}
                value={formState.handlingOffice || ''}
                onChange={(value) => {
                  setOfficeQuery(value);
                  handleChange('handlingOffice', value);
                }}
                onSelect={(value) => {
                  compareHandlingOffice(value.value as string);
                  handleChange('handlingOffice', value.value);
                  // Point 10.B.III — auto-set PBCREATED when handling office updated and pendingFinal=No
                  if (
                    formState.isReferencePopulated &&
                    !formState.pendingFinal
                  ) {
                    handleChange('importBookingStatus', 'PBCREATED');
                  }
                }}
              />
            </div>
            <div className={`${styles.field} ${styles.colStatus}`}>
              <PTextField
                label="Status"
                disabled
                value={formState.status}
                onChange={(e) => handleChange('status', e.target.value)}
              />
            </div>
            <div className={`${styles.field} ${styles.colBookingOffice}`}>
              {/* <PTextField
                label="Booking Office"
                value={formState.bookingOffice}
                onChange={(e) => handleChange('bookingOffice', e.target.value)}
              /> */}

              <PSingleValueSearchableField
                label="Booking Office"
                id="receivedFromName"
                value={formState?.bookingOffice || ''}
                data={bookingOfficeSuggestion}
                displayFields={['label']}
                usePortal
                columnHeaders={[]}
                onChange={(value) => {
                  setBookingOfficeQuery(value);
                  handleChange('bookingOffice', value);
                }}
                // onSelect={(item) => handleChange('bookingOffice', item.value)}
                onSelect={(value) => {
                  compareBookingOffice(value.value as string);
                  handleChange('bookingOffice', value.value);
                }}
              />
            </div>
          </div>

          <div className={styles.moreDetailsGrid}>
            <div className={`${styles.field} ${styles.colCreatedBy}`}>
              <PTextField
                disabled
                label="Created By"
                value={formState.createdBy}
                required
                onChange={(e) => handleChange('createdBy', e.target.value)}
              />
            </div>
            <div className={`${styles.field} ${styles.colCreatedOn}`}>
              <PTextField
                disabled
                label="Created On"
                value={
                  formState.createdOn
                    ? dayjs(formState.createdOn)
                        .format(DATE_FORMAT)
                        .toUpperCase()
                    : dayjs().format(DATE_FORMAT).toUpperCase()
                }
                onChange={(newDate: Date | null) =>
                  handleChange(
                    'createdOn',
                    newDate ? dayjs(newDate).toISOString() : null
                  )
                }
              />
            </div>
            <div className={`${styles.field} ${styles.colUpdatedBy}`}>
              <PTextField
                disabled
                label="Updated By"
                value={formState.updatedBy}
                onChange={(e) => handleChange('updatedBy', e.target.value)}
              />
            </div>

            <div className={`${styles.field} ${styles.colUpdatedOn}`}>
              <PTextField
                disabled
                label="Updated On"
                value={
                  formState.updatedOn
                    ? dayjs(formState.updatedOn)
                        .format(DATE_FORMAT)
                        .toUpperCase()
                    : dayjs().format(DATE_FORMAT).toUpperCase()
                }
                onChange={(newDate: Date | null) =>
                  handleChange(
                    'updatedOn',
                    newDate ? dayjs(newDate).toISOString() : null
                  )
                }
              />
            </div>
          </div>
        </div>
      )}

      <PConfirmationModal
        open={isReferenceNoInvalid}
        title="Error"
        message="Please enter a Valid Reference."
        variant="warning"
        buttonAlign="end"
        secondaryAction={{
          label: 'Close',
          onClick: () => {
            // false;
            dispatch(setReferenceNoInvalid(false));
            handleChange('reference', '');
          },
        }}
      />

      <PConfirmationModal
        open={isImportQuoteNoInvalid}
        title="Error"
        message="Please enter a Valid Import Quote Number."
        variant="warning"
        buttonAlign="end"
        secondaryAction={{
          label: 'Close',
          onClick: () => {
            dispatch(setImportQuoteNoInvalid(false));
            handleChange('importQuoteNumber', '');
          },
        }}
      />

      <PConfirmationModal
        open={exportBookingPopup.open}
        title="Confirmation"
        message="Are you sure you want to update the Export Booking Number?"
        variant="warning"
        buttonAlign="end"
        primaryAction={{
          label: 'Ok',
          onClick: () => {
            handleExportBookingOk();
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            handleExportBookingCancel();
          },
        }}
      />
    </div>
  );
}

export default PreBookingMainDetails;
