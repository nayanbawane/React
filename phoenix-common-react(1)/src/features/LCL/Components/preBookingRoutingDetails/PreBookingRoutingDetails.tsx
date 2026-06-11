import { useEffect, useRef, useState } from 'react';

import { Box, Divider, IconButton, Tooltip } from '@mui/material';

import {
  PDatePicker,
  PGradientButton,
  PModal,
  PSelect,
  PSingleValueSearchableField,
  PConfirmationModal,
  PTextField,
  checkDateValidation,
} from 'phoenix-react-lib';
import styles from '../../../../styles/LCL/routing-details.module.css';
import PPickupDetailsWarning from '../PickupDetails/PPickupDetailsWarning';
import minusImg from '../../../../assets/images/minus.png';
import plusImg from '../../../../assets/images/plus.png';
import searchIcon from '../../../../assets/images/search-icon.png';
import PickUpDetails from '../PickupDetails/PickUpDetails';
import DoorDeliveryDetails from '../DoorDeliveryDetails/DoorDeliveryDetails';
import { RoutingDetailsProps } from '@/types/LCL/routing/RoutingDetails.types';
import { LocationSearchModal } from '../locationSearch';
import { SailingScheduleSearchPage } from '../SailingScheduleSearch';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import {
  setIsEuropeOffice,
  updatePreBookingMainDetails,
} from '../../../../app/slices/LCL/PreBooking/preBookingSlice';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';
import { RoutingDateField } from '../../../../hooks/LCL/preBookingRoutingDateValidation';
import { validatePreBookingRoutingDate } from '../../../../hooks/LCL/preBookingRoutingDateValidation';
import EditNoteicon from '../../../../assets/edit.svg';

function PreBookingRoutingDetails({
  formData,
  onChange,
  isAgentBooking,
  pickupState,
  pickupHandlers,
  tempData,
  termsSuggestion,
  vesselSuggestion,
  handleVesselCodeSelect,
  locationSuggestions,
  handleLocationCodeSelect,
  carrierSuggestion,
  handleCarrierCodeSelect,
  scheduleSearchOpen,
  onOpenScheduleSearch,
  onCloseScheduleSearch,
  onScheduleBookThis,
  onFieldsChange,
  onRegisterFields,
  handlePickupFormDataChange,
  moduleType,
  rateDetails,
  showStatus,
  validateLocationOnTab,
  validateTermsOnTab,
  validateVesselOnTab,
}: RoutingDetailsProps) {
  const TRACKED_FIELDS_NOPICKUP: string[] = [
    'terms',
    'placeOfReceiptCode',
    'placeOfReceiptName',
    'destinationCfsCode',
    'destinationCfsName',
    'destinationCfsEta',
  ];
  const TRACKED_FIELDS_WITHPICKUP: string[] = [
    'terms',
    'placeOfReceiptCode',
    'placeOfReceiptPickupToName',
    'placeOfReceiptPickupTo',
    'placeOfReceiptPickupFromName',
    'placeOfReceiptPickupFrom',
    'destinationCfsCode',
    'destinationCfsName',
    'destinationCfsEta',
  ];

  const HANDLING_OFFICE_SOURCE = {
    POR: 'placeOfReceiptCode',
    POD: 'portOfDischargeCode',
    DCFS: 'destinationCfsCode',
  } as const;

  const isPreBooking = moduleType === 'prebooking';
  // const accurateRate = rateDetails.defaultState.accurateRate;
  const [editableFields, setEditableFields] = useState<Set<string>>(new Set());
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [skipNextBlurValidation, setSkipNextBlurValidation] = useState(false);
  const [updateHandlingOfficeConfirmBox, setupdateHandlingOfficeConfirmBox] =
    useState({
      open: false,
      selectedValue: '',
      oldValue: '',
    });
  const [movePickupFocus, setMovePickupFocus] = useState(false);
  const loginClientBean = useAppSelector(selectLoginClientBean);
  const [error, setError] = useState({ showErrorModal: false, message: '' });

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
  } = pickupState;
  const {
    handleAgentNameSelect,
    handleAgentNameChange,
    handleAgentEmailChange,
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
  } = pickupHandlers;

  const dispatch = useAppDispatch();
  const preBookingMailDetailsData = useAppSelector(
    (state) => state.preBooking.mainDetails
  );
  const handleEditToggle = (keys: string | string[]) => {
    const keyArray = Array.isArray(keys) ? keys : [keys];
    setEditableFields((prev) => {
      const next = new Set(prev);
      keyArray.forEach((key) => {
        if (next.has(key)) next.delete(key);
        else next.add(key);
      });
      return next;
    });
  };
  const skipBlurRef = useRef<Record<string, boolean>>({});
  const previousTermRef = useRef('');
  const refs = {
    nextVesselFieldRef: useRef<HTMLInputElement>(null),
    nextFieldTermRef: useRef<HTMLInputElement>(null),
    placeOfRecept: useRef<HTMLInputElement>(null),
    portOfLoading: useRef<HTMLInputElement>(null),
    portOfDischarge: useRef<HTMLInputElement>(null),
    destinationCFS: useRef<HTMLInputElement>(null),
    placeOfDelivery: useRef<HTMLInputElement>(null),
  };
  const handleTermsChange = (val: string) => {
    onChange('termsLabel', val as never);
    termsSuggestion?.setQuery(val);
    if (val === 'DRDR' || val === 'CFDR') {
      onChange('placeOfDeliveryType', 'DOOR');
    }
  };

  const handleTermsSelect = (val: string, label: string) => {
    onChange('terms', val as never);
    onChange('termsLabel', label as never);

    switch (val) {
      case 'CFDR':
        setDoorDeliveryDialogOpen?.(true);
        break;
      case 'DRCF':
        handlePickupChange('T');
        break;
      case 'DRDR':
        setPickupNeeded?.('T');
        onChange('placeOfReceiptPickupTo', 'TO CFS');
        onChange('placeOfReceiptPickupFrom', 'DOOR');
        setCombinedDialogOpen?.(true);
        break;
    }
  };

  const handlePickupNeededManualChange = (value: string) => {
    if (value === 'Y' || value === 'T') {
      onChange('placeOfReceiptPickupTo', 'TO CFS');
      onChange('placeOfReceiptPickupFrom', 'DOOR');
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

  const handleOpenLocationModal = (field: string) => {
    setActiveField(field);
    setLocationModalOpen(true);
  };

  const handleLocationSelect = (loc: any) => {
    if (!activeField) return;

    switch (activeField) {
      case 'placeOfReceipt':
        onChange('placeOfReceiptCode', loc.code);
        onChange('placeOfReceiptName', loc.name);
        break;

      case 'portOfLoading':
        onChange('portOfLoadingCode', loc.code);
        onChange('portOfLoadingName', loc.name);
        break;

      case 'portOfDischarge':
        onChange('portOfDischargeCode', loc.code);
        onChange('portOfDischargeName', loc.name);
        break;

      case 'destinationCfs':
        onChange('destinationCfsCode', loc.code);
        onChange('destinationCfsName', loc.name);
        break;

      case 'placeOfDelivery':
        onChange('placeOfDeliveryCode', loc.code);
        onChange('placeOfDeliveryName', loc.name);
        break;
    }
  };

  const formatDate = (date: any) => {
    if (date instanceof Date) {
      const day = date.getDate().toString().padStart(2, '0');
      const month = date
        .toLocaleString('en-US', { month: 'short' })
        .toUpperCase();
      const year = date.getFullYear();

      return `${day}-${month}-${year}`;
    }

    return date;
  };

  const handleDateSelection = (
    field: RoutingDateField,
    val: Date | string | null
  ): void => {
    if (!val) {
      onChange(field, null as never);
      return;
    }
    let dates;
    if (
      checkDateValidation({
        dateString: val,
        setInputValue: (val: any) => {
          dates = val;
        },
        setErrorMessage: (val) => {
          setError({ showErrorModal: true, message: val });
          onChange(field, '' as never);
        },
      })
    ) {
      const result = validatePreBookingRoutingDate(
        field,
        formatDate(dates),
        formData
      );
      if (!result.valid) {
        showStatus('warning', [`${result.message}`]);
        setTimeout(() => onChange(field, '' as never), 0);
      } else {
        onChange(field, formatDate(dates) as never);
      }
    }
  };

  useEffect(() => {
    onRegisterFields?.(
      formData.pickupNeeded === 'Y' || formData.pickupNeeded === 'T'
        ? TRACKED_FIELDS_WITHPICKUP
        : TRACKED_FIELDS_NOPICKUP
    );
  }, []);

  useEffect(() => {
    onFieldsChange?.(formData);
  }, [formData]);

  useEffect(() => {
    if (!movePickupFocus) return;
    refs.nextFieldTermRef.current?.focus();
    setMovePickupFocus(false);
  }, [movePickupFocus]);

  // const changeMainDeatilsHandlingoffice = (code: string): any => {
  //   dispatch(
  //     updatePreBookingMainDetails({
  //       handlingOffice: code,
  //     })
  //   );
  // };

  const updateHandlingOffice = (
    selectedField: string,
    selectedValue: string
  ) => {
    if (!preBookingMailDetailsData.agentBooking) {
      const configuredField = HANDLING_OFFICE_SOURCE['POR'];

      if (selectedField === configuredField) {
        dispatch(
          updatePreBookingMainDetails({
            handlingOffice: selectedValue || '',
          })
        );
        const oldValue = preBookingMailDetailsData.handlingOffice || '';

        if (!oldValue || oldValue === selectedValue) {
          dispatch(
            updatePreBookingMainDetails({
              handlingOffice: selectedValue || '',
            })
          );

          return;
        }

        setupdateHandlingOfficeConfirmBox({
          open: true,
          selectedValue: selectedValue || '',
          oldValue,
        });
      }
    }
  };

  useEffect(() => {
    const europeOffices = loginClientBean?.europeOfficeMap?.europeOffices || [];

    const isEuropeOfficeMatched = [
      formData.destinationCfsCode,
      formData.portOfDischargeCode,
      formData.placeOfDeliveryCode,
    ].some((code) => europeOffices.includes(code));

    dispatch(setIsEuropeOffice(isEuropeOfficeMatched));
  }, [
    formData.destinationCfsCode,
    formData.portOfDischargeCode,
    formData.placeOfDeliveryCode,
  ]);

  useEffect(() => {
    if (
      typeof formData.placeOfDeliveryCode === 'string' &&
      !formData.placeOfDeliveryCode.trim()
    ) {
      dispatch(
        updatePreBookingMainDetails({
          handlingOffice: loginClientBean?.office,
        })
      );
    }
  }, [formData.placeOfDeliveryCode]);

  return (
    <div className="routing-details-container enterprise-form">
      <Box className={styles.pad4x8}>
        <Box className={styles.grid}>
          <Box className={`${styles.colSpan6} ${styles.searchWrap}`}>
            {/* <PSingleValueSearchableField
              label="Agent Name"
              disabled={!!formData.destinationCfsCode}
              data={tempData.agentData}
              displayFields={
                tempData.agentData.length
                  ? Object.keys(tempData.agentData[0])
                  : []
              }
              value={formData.agentName || ''}
              columnHeaders={[]}
              onChange={handleAgentNameChange}
              onSelect={handleAgentNameSelect}
            /> */}
            <PTextField
              fullWidth
              label="Agent Name"
              disabled={!!formData.destinationCfsCode || !isAgentBooking}
              value={formData.agentName}
              onChange={(e) => onChange('agentName', e.target.value)}
            />
          </Box>
          <Box className={`${styles.colSpan6} ${styles.searchWrap}`}>
            <PTextField
              label="Agent Email"
              disabled={!!formData.destinationCfsCode || !isAgentBooking}
              value={formData.agentEmail || ''}
              onChange={(e) => handleAgentEmailChange(e.target.value)}
            />
          </Box>
        </Box>
        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Terms"
              required
              data={termsSuggestion?.data ?? []}
              displayFields={['label']}
              value={formData?.termsLabel || ''}
              columnHeaders={[]}
              onChange={(val) => {
                handleTermsChange(val);
              }}
              onSelect={(item: any) => {
                skipBlurRef.current.nextFieldTermRef = true;
                handleTermsSelect(item.value, item.label);
                previousTermRef.current = item.label;
                setTimeout(() => setMovePickupFocus(true), 0);
              }}
              onKeyDown={(e: any) => {
                if (e.key === 'Tab') {
                  if (previousTermRef.current === formData?.termsLabel) {
                    refs.nextFieldTermRef.current?.focus();
                    return;
                  }
                  refs.nextFieldTermRef.current?.focus();
                  validateTermsOnTab({
                    value: formData?.termsLabel || '',
                    data: termsSuggestion?.data ?? [],
                    onChange,
                    showStatus,
                  });
                  previousTermRef.current = formData?.termsLabel || '';
                }
              }}
              onBlur={() => {
                setTimeout(() => {
                  if (skipBlurRef.current.nextFieldTermRef) {
                    skipBlurRef.current.nextFieldTermRef = false;
                    return;
                  }
                  if (previousTermRef.current === formData?.termsLabel) {
                    return;
                  }
                  validateTermsOnTab({
                    value: formData?.termsLabel || '',
                    data: termsSuggestion?.data ?? [],
                    onChange,
                    showStatus,
                  });
                  previousTermRef.current = formData?.termsLabel || '';
                }, 150);
              }}
            />
          </Box>

          <Box className={styles.colSpan3}>
            <PSelect
              inputRef={refs.nextFieldTermRef}
              label="Pickup Needed"
              defaultValue="N"
              value={formData.pickupNeeded}
              onChange={handlePickupNeededManualChange}
              options={[
                { label: 'N - No', value: 'N' },
                { label: 'Y - Shipco TMS', value: 'T' },
                { label: 'Y - Yes', value: 'Y' },
              ]}
            />
          </Box>

          {isCFSDoor ? (
            <Box className={styles.colSpan3}>
              <PSelect
                label="Delivery Type"
                value={formData.deliveryType}
                onChange={(val) => onChange('deliveryType', val)}
                options={[
                  { label: 'Please Select', value: '-1' },
                  { label: 'D - Door Delivery', value: 'D' },
                ]}
              />
            </Box>
          ) : (
            <Box className={styles.colSpan3} />
          )}
          <Box className={styles.colSpan3} />

          <Box className={`${styles.colSpan4} ${styles.ml40}`}>
            <PDatePicker
              id="cargoReadDate"
              label="Cargo Ready Date"
              value={formData.cargoReadDate}
              onChange={(val) =>
                onChange('cargoReadDate', (val ?? null) as never)
              }
            />
          </Box>
        </Box>

        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Vessel Code"
              required
              value={formData.vesselCode}
              data={vesselSuggestion?.data ?? []}
              displayFields={['label']}
              columnHeaders={[]}
              usePortal
              onChange={(val) => {
                onChange('vesselCode', val);
                vesselSuggestion?.setQuery(val);
              }}
              onSelect={(item) => {
                skipBlurRef.current.vessel = true;
                handleVesselCodeSelect?.(item as Record<string, unknown>);
              }}
              onKeyDown={(e: any) => {
                if (e.key === 'Tab') {
                  refs.nextVesselFieldRef.current?.focus();
                  validateVesselOnTab({
                    value: formData.vesselCode || '',
                    data: vesselSuggestion?.data ?? [],
                    onChange,
                    showStatus,
                  });
                }
              }}
              onBlur={() => {
                setTimeout(() => {
                  // skip only selection blur
                  if (skipBlurRef.current.vessel) {
                    skipBlurRef.current.vessel = false;
                    return;
                  }
                  validateVesselOnTab({
                    value: formData.vesselCode || '',
                    data: vesselSuggestion?.data ?? [],
                    onChange,
                    showStatus,
                  });
                }, 150);
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
          <Box className={styles.colSpan6}>
            <PTextField
              label="Vessel Name"
              disabled
              inputRef={refs.nextVesselFieldRef}
              value={formData.vesselName}
              onChange={(e) => onChange('vesselName', e.target.value)}
            />
          </Box>
          <Box className={styles.colSpan3}>
            <PTextField
              label="Voyage"
              value={formData.voyage}
              onChange={(e) => onChange('voyage', e.target.value)}
            />
          </Box>

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
        </Box>

        <hr className={`${styles.routingDivider}`} />

        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Place Of Receipt Code"
              required
              usePortal
              value={formData.placeOfReceiptCode}
              data={locationSuggestions?.placeOfReceipt.data}
              displayFields={['code', 'name', 'locode', 'country']}
              columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
              onChange={(val) => {
                onChange('placeOfReceiptCode', val);
                // if (!val) {
                //   updateHandlingOffice('placeOfReceiptCode', '');
                // }

                locationSuggestions?.placeOfReceipt.setQuery(val);
              }}
              onSelect={(item) => {
                skipBlurRef.current.placeOfRecept = true;
                onChange('placeOfReceiptUnCode', item.locode);
                updateHandlingOffice(
                  'placeOfReceiptCode',
                  String(item.code || '')
                );
                handleLocationCodeSelect?.(
                  item as Record<string, unknown>,
                  'placeOfReceiptCode',
                  'placeOfReceiptName',
                  'placeOfReceiptRegion'
                );
              }}
              onBlur={() => {
                setTimeout(() => {
                  // skip only selection blur
                  if (skipBlurRef.current.placeOfRecept) {
                    skipBlurRef.current.placeOfRecept = false;
                    return;
                  }
                  validateLocationOnTab({
                    value: formData.placeOfReceiptCode,
                    data: locationSuggestions?.placeOfReceipt.data,
                    codeKey: 'placeOfReceiptCode',
                    nameKey: 'placeOfReceiptName',
                    label: 'Place Of Receipt Code',
                    regionKey: 'placeOfReceiptRegion',
                    unCodeKey: 'placeOfReceiptUnCode',
                    onChange,
                    onSelect: handleLocationCodeSelect,
                    showStatus,
                    updateHandlingOffice,
                  });
                }, 150);
              }}
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
              {formData.pickupNeeded === 'Y' ||
              formData.pickupNeeded === 'T' ? (
                <>
                  <PTextField
                    value={formData.placeOfReceiptPickupFrom}
                    onChange={(e) =>
                      onChange('placeOfReceiptPickupFrom', e.target.value)
                    }
                    disabled
                    required
                    error={!formData.placeOfReceiptPickupFrom}
                  />

                  <PTextField
                    value={formData.placeOfReceiptPickupFromName}
                    onChange={(e) =>
                      onChange('placeOfReceiptPickupFromName', e.target.value)
                    }
                    disabled={
                      !editableFields.has('placeOfReceiptPickupFromName')
                    }
                  />

                  <PTextField
                    value={formData.placeOfReceiptPickupTo}
                    onChange={(e) =>
                      onChange('placeOfReceiptPickupTo', e.target.value)
                    }
                    disabled
                    required
                    error={!formData.placeOfReceiptPickupTo}
                  />

                  <PTextField
                    value={
                      formData.placeOfReceiptPickupToName ||
                      formData?.placeOfReceiptName
                    }
                    onChange={(e) =>
                      onChange('placeOfReceiptPickupToName', e.target.value)
                    }
                    required
                    disabled={!editableFields.has('placeOfReceiptPickupToName')}
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
                    required
                    error={!formData.placeOfReceiptName}
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Box className={styles.editBtnCell}>
            <IconButton
              onClick={() => {
                let fields: any = ['placeOfReceiptName'];

                if (formData?.pickupNeeded === 'T') {
                  fields = [
                    'placeOfReceiptPickupFromName',
                    'placeOfReceiptPickupToName',
                  ];
                } else if (formData?.pickupNeeded === 'Y') {
                  fields = ['placeOfReceiptPickupToName'];
                }

                handleEditToggle(fields);
              }}
              className={`${styles.editBtn} ${editableFields.has('placeOfReceiptName') ? styles.editBtnActive : ''}`}
            >
              <Box component="img" src={EditNoteicon} />
            </IconButton>
          </Box>
          <Box className={`${styles.colSpan3} ${styles.mlNeg25}`}>
            <PDatePicker
              inputRef={refs.placeOfRecept}
              id="placeOfReceiptEtd"
              label="ETD"
              value={formData.placeOfReceiptEtd}
              onChange={(val) => {
                setSkipNextBlurValidation(true);
                onChange('placeOfReceiptEtd', val ?? null);
              }}
              onDateSelection={(val) => {
                handleDateSelection(
                  'placeOfReceiptEtd',
                  formatDate(val) ?? null
                );
              }}
              onBlur={(val) => {
                handleDateSelection(
                  'placeOfReceiptEtd',
                  val.target.value ?? null
                );
              }}
              skipNextBlurValidation={skipNextBlurValidation}
            />
          </Box>
        </Box>

        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Port Of Loading Code"
              value={formData.portOfLoadingCode}
              data={locationSuggestions?.portOfLoading.data}
              displayFields={['code', 'name', 'locode', 'country']}
              columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
              onChange={(val) => {
                onChange('portOfLoadingCode', val);
                locationSuggestions?.portOfLoading.setQuery(val);
              }}
              usePortal
              onSelect={(item) => {
                skipBlurRef.current.portOfLoading = true;
                onChange('portOfLoadingUnCode', item.locode);
                handleLocationCodeSelect?.(
                  item as Record<string, unknown>,
                  'portOfLoadingCode',
                  'portOfLoadingName',
                  'portOfLoadingRegion'
                );
              }}
              onBlur={() => {
                setTimeout(() => {
                  // skip only selection blur
                  if (skipBlurRef.current.portOfLoading) {
                    skipBlurRef.current.portOfLoading = false;
                    return;
                  }
                  validateLocationOnTab({
                    value: formData.portOfLoadingCode,
                    data: locationSuggestions?.portOfLoading.data,
                    codeKey: 'portOfLoadingCode',
                    nameKey: 'portOfLoadingName',
                    label: 'Port Of Loading Code',
                    regionKey: 'portOfLoadingRegion',
                    unCodeKey: 'portOfLoadingUnCode',
                    onChange,
                    onSelect: handleLocationCodeSelect,
                    showStatus,
                  });
                }, 150);
              }}
            />
            <Box className={styles.searchIcon}>
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchImg}
                onClick={() => handleOpenLocationModal('portOfLoadingCode')}
              />
            </Box>
          </Box>
          <Box className={styles.colSpan9}>
            <PTextField
              label="Port of Loading Name"
              value={formData.portOfLoadingName}
              onChange={(e) => onChange('portOfLoadingName', e.target.value)}
              disabled={!editableFields.has('portOfLoadingName')}
              error={!formData.portOfLoadingName}
            />
          </Box>
          <Box className={styles.editBtnCell}>
            <IconButton
              size="small"
              onClick={() => handleEditToggle('portOfLoadingName')}
              className={`${styles.editBtn} ${editableFields.has('portOfLoadingName') ? styles.editBtnActive : ''}`}
            >
              <Box component="img" src={EditNoteicon} />
            </IconButton>
          </Box>
          <Box className={`${styles.colSpan3} ${styles.mlNeg25}`}>
            <PDatePicker
              inputRef={refs.portOfLoading}
              id="portOfLoadingEts"
              label="ETS"
              value={formData.portOfLoadingEts}
              onChange={(val) => {
                onChange('portOfLoadingEts', val ?? null);
                setSkipNextBlurValidation(true);
              }}
              onDateSelection={(val: Date | null) => {
                handleDateSelection(
                  'portOfLoadingEts',
                  formatDate(val) ?? null
                );
              }}
              onBlur={(val) => {
                handleDateSelection(
                  'portOfLoadingEts',
                  val.target.value ?? null
                );
              }}
              skipNextBlurValidation={skipNextBlurValidation}
            />
          </Box>
        </Box>

        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Port Of Discharge Code"
              usePortal
              value={formData.portOfDischargeCode}
              data={locationSuggestions?.portOfDischarge.data}
              displayFields={['code', 'name', 'locode', 'country']}
              columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
              onChange={(val) => {
                onChange('portOfDischargeCode', val);
                locationSuggestions?.portOfDischarge.setQuery(val);
                // if (!val) {
                //   updateHandlingOffice('portOfDischargeCode', '');
                // }
              }}
              onBlur={() => {
                setTimeout(() => {
                  // skip only selection blur
                  if (skipBlurRef.current.portOfDischarge) {
                    skipBlurRef.current.portOfDischarge = false;
                    return;
                  }
                  validateLocationOnTab({
                    value: formData.portOfDischargeCode,
                    data: locationSuggestions?.portOfDischarge.data,
                    codeKey: 'portOfDischargeCode',
                    nameKey: 'portOfDischargeName',
                    label: 'Port Of Discharge Code',
                    regionKey: 'portOfDischargeRegion',
                    unCodeKey: 'portOfDischargeUnCode',
                    onChange,
                    onSelect: handleLocationCodeSelect,
                    showStatus,
                    updateHandlingOffice,
                  });
                }, 150);
              }}
              onSelect={(item) => {
                skipBlurRef.current.portOfDischarge = true;
                onChange('portOfDischargeUnCode', item.locode);
                handleLocationCodeSelect?.(
                  item as Record<string, unknown>,
                  'portOfDischargeCode',
                  'portOfDischargeName',
                  'portOfDischargeRegion'
                );

                updateHandlingOffice(
                  'portOfDischargeCode',
                  String(item.code || '')
                );
              }}
            />
            <Box className={styles.searchIcon}>
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchImg}
                onClick={() => handleOpenLocationModal('portOfDischargeCode')}
              />
            </Box>
          </Box>
          <Box className={styles.colSpan9}>
            <PTextField
              label="Port of Discharge Name"
              value={formData.portOfDischargeName}
              onChange={(e) => onChange('portOfDischargeName', e.target.value)}
              disabled={!editableFields.has('portOfDischargeName')}
              error={!formData.portOfDischargeName}
            />
          </Box>
          <Box className={styles.editBtnCell}>
            <IconButton
              size="small"
              onClick={() => handleEditToggle('portOfDischargeName')}
              className={`${styles.editBtn} ${editableFields.has('portOfDischargeName') ? styles.editBtnActive : ''}`}
            >
              <Box component="img" src={EditNoteicon} />
            </IconButton>
          </Box>
          <Box className={`${styles.colSpan3} ${styles.mlNeg25}`}>
            <PDatePicker
              inputRef={refs.portOfDischarge}
              id="portOfDischargeEta"
              label="ETA"
              value={formData.portOfDischargeEta}
              onChange={(val) => {
                onChange('portOfDischargeEta', val ?? null);
                setSkipNextBlurValidation(true);
              }}
              onDateSelection={(val: Date | null) => {
                handleDateSelection(
                  'portOfDischargeEta',
                  formatDate(val) ?? null
                );
              }}
              onBlur={(val) => {
                handleDateSelection(
                  'portOfDischargeEta',
                  val.target.value ?? null
                );
              }}
              skipNextBlurValidation={skipNextBlurValidation}
            />
          </Box>
        </Box>

        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Destination CFS Code"
              required
              value={formData.destinationCfsCode}
              data={locationSuggestions?.destinationCfs.data}
              displayFields={['code', 'name', 'locode', 'country']}
              columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
              onChange={(val) => {
                onChange('destinationCfsCode', val);
                locationSuggestions?.destinationCfs.setQuery(val);
                //    if (!val) {
                //   updateHandlingOffice('destinationCfsCode', '');
                // }
              }}
              usePortal
              onBlur={() => {
                setTimeout(() => {
                  // skip only selection blur
                  if (skipBlurRef.current.destinationCFS) {
                    skipBlurRef.current.destinationCFS = false;
                    return;
                  }
                  validateLocationOnTab({
                    value: formData.destinationCfsCode,
                    data: locationSuggestions?.destinationCfs.data,
                    codeKey: 'destinationCfsCode',
                    nameKey: 'destinationCfsName',
                    label: 'Destination CFS Code',
                    regionKey: 'destinationCfsRegion',
                    unCodeKey: 'destinationCfsUnCode',
                    onChange,
                    onSelect: handleLocationCodeSelect,
                    showStatus,
                    updateHandlingOffice,
                  });
                }, 150);
              }}
              onSelect={(item) => {
                skipBlurRef.current.destinationCFS = true;
                onChange('destinationCfsUnCode', item.locode);
                handleLocationCodeSelect?.(
                  item as Record<string, unknown>,
                  'destinationCfsCode',
                  'destinationCfsName',
                  'destinationCfsRegion'
                );

                updateHandlingOffice(
                  'destinationCfsCode',
                  String(item.code || '')
                );
              }}
            />
            <Box className={styles.searchIcon}>
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchImg}
                onClick={() => handleOpenLocationModal('destinationCfsCode')}
              />
            </Box>
          </Box>
          <Box className={styles.colSpan9}>
            <PTextField
              label="Destination CFS Name"
              value={formData.destinationCfsName}
              required
              onChange={(e) => onChange('destinationCfsName', e.target.value)}
              disabled={!editableFields.has('destinationCfsName')}
            />
          </Box>
          <Box className={styles.editBtnCell}>
            <IconButton
              size="small"
              onClick={() => handleEditToggle('destinationCfsName')}
              className={`${styles.editBtn} ${editableFields.has('destinationCfsName') ? styles.editBtnActive : ''}`}
            >
              <Box component="img" src={EditNoteicon} />
            </IconButton>
          </Box>
          <Box className={`${styles.colSpan3} ${styles.mlNeg25}`}>
            <PDatePicker
              inputRef={refs.destinationCFS}
              id="destinationCfsEta"
              label="ETA"
              required
              value={formData.destinationCfsEta}
              onChange={(val) => {
                onChange('destinationCfsEta', val ?? null);
                setSkipNextBlurValidation(true);
              }}
              onDateSelection={(val: Date | null) => {
                handleDateSelection(
                  'destinationCfsEta',
                  formatDate(val) ?? null
                );
              }}
              onBlur={(val) => {
                handleDateSelection(
                  'destinationCfsEta',
                  val.target.value ?? null
                );
              }}
              skipNextBlurValidation={skipNextBlurValidation}
            />
          </Box>
        </Box>

        <Box className={styles.grid}>
          <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
            <PSingleValueSearchableField
              label="Place Of Delivery Code"
              value={formData.placeOfDeliveryCode}
              data={locationSuggestions?.placeOfDelivery.data}
              displayFields={['code', 'name', 'locode', 'country']}
              columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
              usePortal
              onChange={(val) => {
                onChange('placeOfDeliveryCode', val);
                // changeMainDeatilsHandlingoffice(val);

                locationSuggestions?.placeOfDelivery.setQuery(val);
              }}
              onBlur={() => {
                setTimeout(() => {
                  // skip only selection blur
                  if (skipBlurRef.current.placeOfDelivery) {
                    skipBlurRef.current.placeOfDelivery = false;
                    return;
                  }
                  validateLocationOnTab({
                    value: formData.placeOfDeliveryCode,
                    data: locationSuggestions?.placeOfDelivery.data,
                    codeKey: 'placeOfDeliveryCode',
                    nameKey: 'placeOfDeliveryName',
                    label: 'Place Of Delivery Code',
                    regionKey: 'placeOfDeliveryRegion',
                    unCodeKey: 'placeOfDeliveryUnCode',
                    onChange,
                    onSelect: handleLocationCodeSelect,
                    showStatus,
                  });
                }, 150);
              }}
              onSelect={(item) => {
                skipBlurRef.current.placeOfDelivery = true;
                onChange('placeOfDeliveryUnCode', item.locode);
                // changeMainDeatilsHandlingoffice(item.code);
                handleLocationCodeSelect?.(
                  item as Record<string, unknown>,
                  'placeOfDeliveryCode',
                  'placeOfDeliveryName',
                  'placeOfDeliveryRegion'
                );
              }}
            />
            <Box className={styles.searchIcon}>
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchImg}
                onClick={() => handleOpenLocationModal('placeOfDeliveryCode')}
              />
            </Box>
          </Box>
          <Box className={styles.colSpan2}>
            <PSelect
              label="Place of Delivery Name"
              value={formData.placeOfDeliveryType || '-1'}
              onChange={(val) => onChange('placeOfDeliveryType', val)}
              options={tempData.placeOfDeliveryTypeOptions}
              disabled={
                formData.terms == 'CFDR' ||
                formData.terms == 'DRDR' ||
                formData.pickupNeeded == 'Y'
              }
              // MenuProps={sharedMenuProps}
              // sx={{ width: '100%', backgroundColor: 'white' }}
            />
          </Box>
          <Box className={styles.colSpan7}>
            <PTextField
              value={formData.placeOfDeliveryName}
              onChange={(e) => onChange('placeOfDeliveryName', e.target.value)}
              disabled={
                !editableFields.has('placeOfDeliveryName') ||
                formData.terms == 'CFDR' ||
                formData.terms == 'DRDR' ||
                formData.pickupNeeded == 'Y'
              }
            />
          </Box>

          <Box className={styles.editBtnCell}>
            <IconButton
              size="small"
              onClick={() => handleEditToggle('placeOfDeliveryName')}
              className={`${styles.editBtn} ${editableFields.has('placeOfDeliveryName') ? styles.editBtnActive : ''}`}
            >
              <Box component="img" src={EditNoteicon} />
            </IconButton>
          </Box>
          <Box className={`${styles.colSpan3} ${styles.mlNeg25}`}>
            <PDatePicker
              inputRef={refs.placeOfDelivery}
              id="placeOfDeliveryEta"
              label="ETA"
              value={formData.placeOfDeliveryEta}
              onChange={(val) => {
                onChange('placeOfDeliveryEta', val ?? null);
                setSkipNextBlurValidation(true);
              }}
              onDateSelection={(val: Date | null) => {
                handleDateSelection(
                  'placeOfDeliveryEta',
                  formatDate(val) ?? null
                );
              }}
              onBlur={(val) => {
                handleDateSelection(
                  'placeOfDeliveryEta',
                  val.target.value ?? null
                );
              }}
              skipNextBlurValidation={skipNextBlurValidation}
            />
          </Box>
        </Box>

        <PModal
          open={openPickupModal}
          onClose={handlePickupDialogClose ?? closePickupModal}
          title="Pickup Details"
          isCloseIcon={true}
          width={{ xs: '95vw', sm: 600, md: 741 }}
          height={{ xs: '85vh', sm: 500 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              mt: '6px',
              mx: '5px',
            }}
          >
            {pickups.map((pickupId, index) => {
              const isCollapsed = collapsedSet.has(pickupId);
              return (
                <Box key={pickupId}>
                  {formData.pickupNeeded === 'T'
                    ? formData.deliveryType == 'N'
                    : formData.pickupNeeded === 'Y' && (
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: isCollapsed ? 'white' : '#0097d6',
                            borderRadius: '6px 6px 0 0',
                            height: '26px',
                            border: isCollapsed ? '1px solid #d7d7d7' : 'none',
                          }}
                        >
                          <Box
                            sx={{
                              fontWeight: 600,
                              fontSize: '13px',
                              color: isCollapsed ? '#0097d6' : '#ffffff',
                              pl: '5px',
                              fontFamily: 'Arial, sans-serif',
                            }}
                          >
                            Pickup Details
                          </Box>
                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Box
                              sx={{
                                display: 'flex',
                                gap: 0.5,
                                pt: isCollapsed ? 0.1 : 0.3,
                              }}
                            >
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <PGradientButton
                                  title="Add"
                                  onClick={handleAddPickup}
                                  sx={{
                                    minWidth: '0px',
                                    height: '14px',
                                    borderRadius: '2px',
                                  }}
                                  disabled={isPreBooking}
                                ></PGradientButton>
                              </Box>
                              <Box sx={{ display: 'grid', gap: 1 }}>
                                {pickups.length > 1 && (
                                  <Tooltip title="Remove this pickup">
                                    <PGradientButton
                                      onClick={() => handleRemovePickup(index)}
                                      size="small"
                                      color="error"
                                      sx={{
                                        minWidth: '0px',
                                        height: '18px',
                                        borderRadius: '2px',
                                      }}
                                      title="Cancel"
                                    ></PGradientButton>
                                  </Tooltip>
                                )}
                              </Box>
                            </Box>
                            <Box
                              sx={{
                                display: 'grid',
                                gap: 1,
                                pr: 0.3,
                                pl: 0.3,
                                borderLeft: isCollapsed
                                  ? '1px solid #d7d7d7'
                                  : '1px solid white',
                              }}
                              onClick={() => handleToggleCollapse(pickupId)}
                            >
                              {isCollapsed ? (
                                <img
                                  src={plusImg}
                                  alt="expand"
                                  style={{
                                    width: 15,
                                    height: 15,
                                    cursor: 'pointer',
                                    margin: '6px 4px 0px 4px',
                                  }}
                                />
                              ) : (
                                <img
                                  src={minusImg}
                                  alt="collapse"
                                  style={{
                                    width: 15,
                                    height: 15,
                                    cursor: 'pointer',
                                    margin: '6px 4px 0px 3px',
                                  }}
                                />
                              )}
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
                sx={{
                  alignSelf: 'flex-end',
                  minWidth: '70px',
                  height: '25px',
                  borderRadius: '3px',
                  fontSize: '14px',
                }}
              />
            </Box>
          </Box>
        </PModal>

        <PModal
          open={openDialog}
          title="Warning"
          onClose={handleCancelRemove ?? (() => {})}
          isCloseIcon={false}
          height={200}
          width={380}
        >
          <Box sx={{ p: 1, fontFamily: 'Arial, Helvetica, sans-serif' }}>
            <Box>
              <PPickupDetailsWarning
                onYes={handleConfirmRemove}
                onNo={handleCancelRemove ?? (() => {})}
              />
            </Box>
          </Box>
        </PModal>

        {/* ── Door-delivery-only dialog (CFS / DOOR) ── */}
        <PModal
          open={doorDeliveryDialogOpen ?? false}
          title="Door Delivery Details"
          isCloseIcon={true}
          onClose={handleDoorDeliveryDialogClose ?? (() => {})}
          width={{ xs: '95vw', sm: 600, md: 741 }}
          height={{ xs: '65vh', sm: 350 }}
        >
          <Box className={styles.modalColumn}>
            {doorDeliveryForm && handleDoorDeliveryFieldChange && (
              <DoorDeliveryDetails
                formData={doorDeliveryForm}
                onFormDataChange={handleDoorDeliveryFieldChange}
              />
            )}
            <Box className={styles.modalActions}>
              <PGradientButton
                title="OK"
                onClick={handleDoorDeliveryDialogOk ?? (() => {})}
                sx={{
                  minWidth: '70px',
                  height: '25px',
                  borderRadius: '3px',
                  fontSize: '14px',
                }}
              />
            </Box>
          </Box>
        </PModal>

        <PModal
          open={combinedDialogOpen ?? false}
          title="Pickup and Door Delivery Details"
          isCloseIcon={true}
          onClose={handleCombinedDialogClose ?? (() => {})}
          width={{ xs: '95vw', sm: 700, md: 741 }}
          height={{ xs: '90vh', sm: 700 }}
        >
          <Box className={styles.modalColumnNoX}>
            {/* Pickup section */}
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
                        <PGradientButton
                          title="Add"
                          onClick={handleAddPickup}
                          disabled={isPreBooking}
                          sx={{
                            minWidth: '0px',
                            height: '18px',
                            borderRadius: '2px',
                          }}
                        />
                        {pickups.length > 1 && (
                          <Tooltip title="Remove this pickup">
                            <PGradientButton
                              title="Cancel"
                              onClick={() => handleRemovePickup(index)}
                              sx={{
                                minWidth: '0px',
                                height: '18px',
                                borderRadius: '2px',
                              }}
                            />
                          </Tooltip>
                        )}
                        <Box
                          className={`${styles.flex} ${styles.flex_align_center} ${isCollapsed ? styles.borderLeftGray : styles.borderLeftWhite}`}
                          onClick={() => handleToggleCollapse(pickupId)}
                        >
                          <img
                            src={isCollapsed ? plusImg : minusImg}
                            alt={isCollapsed ? 'expand' : 'collapse'}
                            style={{
                              width: 15,
                              height: 15,
                              margin: '6px 4px 0 4px',
                            }}
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
                  style={{ width: 15, height: 15, margin: '6px 4px 0 4px' }}
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
                  />
                </Box>
              )}

            {/* OK button */}
            <Box className={styles.modalActions}>
              <PGradientButton
                title="OK"
                onClick={handleCombinedDialogOk ?? (() => {})}
                sx={{
                  minWidth: '70px',
                  height: '25px',
                  borderRadius: '3px',
                  fontSize: '14px',
                }}
              />
            </Box>
          </Box>
        </PModal>
      </Box>
      <LocationSearchModal
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelect={handleLocationSelect}
      />

      <PModal
        open={scheduleSearchOpen ?? false}
        onClose={onCloseScheduleSearch ?? (() => {})}
        title="Schedule"
        isCloseIcon={true}
        width={970}
        height={500}
      >
        <SailingScheduleSearchPage onBookThis={onScheduleBookThis} />
      </PModal>

      <PConfirmationModal
        open={updateHandlingOfficeConfirmBox.open}
        title="Confirmation"
        message="Routing is updated Do you want to  update the  Handling office."
        variant="warning"
        buttonAlign="end"
        primaryAction={{
          label: 'OK',
          onClick: () => {
            dispatch(
              updatePreBookingMainDetails({
                handlingOffice:
                  updateHandlingOfficeConfirmBox.selectedValue || '',
              })
            );
            setupdateHandlingOfficeConfirmBox({
              open: false,
              selectedValue: '',
              oldValue: '',
            });
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            dispatch(
              updatePreBookingMainDetails({
                handlingOffice: updateHandlingOfficeConfirmBox.oldValue || '',
              })
            );
            setupdateHandlingOfficeConfirmBox({
              open: false,
              selectedValue: '',
              oldValue: '',
            });
          },
        }}
      />
      <PConfirmationModal
        open={error?.showErrorModal ?? false}
        title="Error"
        variant="danger"
        buttonAlign="end"
        message={error?.message}
        secondaryAction={{
          label: 'Close',
          onClick: () => {
            setError({ showErrorModal: false, message: '' });
            setSkipNextBlurValidation?.(false);
          },
        }}
      />
    </div>
  );
}

export default PreBookingRoutingDetails;
