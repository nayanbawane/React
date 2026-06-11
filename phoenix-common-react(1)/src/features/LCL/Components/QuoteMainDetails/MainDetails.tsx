import {
  QuoteMainDetailsFormData,
  QuoteMainDetailsProps,
} from '@/types/LCL/misc/QuoteMainDetails.types';
import { Box, ButtonBase, Collapse } from '@mui/material';
import editIcon from '../../../../assets/edit.svg';
import saveIcon from '../../../../assets/svg/save.svg';
import {
  PConfirmationModal,
  PDatePicker,
  PMultiValueSearchableField,
  PSelect,
  PSingleValueSearchableField,
  PTextField,
  PToggleButton,
} from 'phoenix-react-lib';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  clauseSuggestionConfig,
  handlingOfficeSuggestionConfig,
  quoteCarrierSuggestionConfig,
  quoteReferenceSuggestionConfig,
  shipmentStatusTypeConfig,
  useGetSelections,
  quoteTermsSuggestionConfig,
  useGetSuggestions,
  userReferenceSuggestionConfig,
  useFeatureToggle,
} from '../../../../hooks/LCL';
import { getFormattedCurrentDate, getFormattedDate, getStringToDate } from '../../../../core/utils/date.utility';
import styles from '../../../../styles/LCL/MainDetails.module.css';
// import { DateValidationBanner } from './DateValidationBanner';
import {
  QUOTE_CHANNEL_OPTIONS,
  QUOTE_TYPE_OPTIONS,
  STATUS_OPTIONS,
  TYPE_OPTIONS,
  FCLQUOTE_MAINDATEAILS_PICKUP_OPUTIONS,
  FCLQUOTE_MAINDATEAILS_PREPAID_COLLECT_OPUTIONS,
  FCLQUOTE_MAINDATEAILS_RATE_CONTROL_ENTITY_OPUTIONS,
  NUMBER_OPTIONS,
} from './dropdowns';
import { useAppSelector } from "@/app/store/hooks.ts";
import { selectLoginClientBean } from "../../../../core/featureToggles/featureToggle.selectors.ts";
import { removeSpaces } from '../../../../core/utils/inputUtils';
import { CommonToggleKeys } from '../../../../core/featureToggles/keys/commonToggleKeys';

export const QuoteMainDetails: React.FC<QuoteMainDetailsProps> = ({
  formData,
  setFormData,
  onFieldsChange,
  onRegisterFields,
  onPopulateData,
  onKeyDown,
  showStatus,
  datePickerKeyDownHandler = () => { },
  dateSelectionHandler = () => { },
  datePickerOnBlurHandler = () => { },
  error,
  isQuotePopulated = false,
  showBannerError
}) => {

  const loginClientBean = useAppSelector(selectLoginClientBean);
  const [showDateWarning, setShowDateWarning] = useState<boolean>(false);
  const [isMoreDetailsOpen, setIsMoreDetailsOpen] = useState<boolean>(true);
  const [dateEditMode, setDateEditMode] = useState<{ effectiveDate: boolean; expirationDate: boolean }>({
    effectiveDate: false,
    expirationDate: false,
  });

  useEffect(() => {
    const img = new Image();
    img.src = saveIcon;
  }, []);
  const referenceNumberRef = useRef<HTMLInputElement | null>(null);
  const referenceSelectedFromDropdownRef = useRef<boolean>(false);
  const billingCompanyRef = useRef<HTMLInputElement | null>(null);
  const addMoreDetailBtnRef = useRef<HTMLInputElement | null>(null);
  const transitTimeRef = useRef<HTMLInputElement | null>(null);
  const userReferenceValidationTimeoutRef = useRef<ReturnType<typeof window.setTimeout> | null>(null);
  const userReferenceFocusValueRef = useRef<string>("");
  const [showErrorMessageModal, toggleErrorMessageModal] = useState<boolean>(false);
  const [userReferenceErrorMessage, setUserReferenceErrorMessage] = useState<string>("");
  const [shouldValidateUserReference, setShouldValidateUserReference] = useState<boolean>(false);
  const [userReferenceValidationTick, setUserReferenceValidationTick] = useState<number>(0);
  const [selectedUserReference, setSelectedUserReference] = useState<string>("");
  const [skipNextBlurValidation, setSkipNextBlurValidation] = useState<boolean>(false);
  // const ocnMaximumClauseSize = CommonToggleKeys?.OCN_MAXIMUM_CLAUSE_SIZE;
  const { isVisible, getToggleValue } = useFeatureToggle();
  const getMaximumClausesSize = getToggleValue(CommonToggleKeys?.OCN_MAXIMUM_CLAUSE_SIZE)
  const showPendingFinal =
    isVisible(CommonToggleKeys.OCN_APPLY_HAZ_RULE) &&
    isVisible(CommonToggleKeys.OCEAN_FREIGHT_EMT_IMT_BOOKING_PENDING_FINAL);
  const isFCLDirectionEnable = isVisible(CommonToggleKeys?.OCEAN_FCL_QUOTE_SHOW_DIRECTION)
  const isLCLDirectionEnable = isVisible(CommonToggleKeys?.OCEAN_LCL_QUOTE_SHOW_DIRECTION)
  const isQuoteSIChannel = isVisible(CommonToggleKeys.OCN_QUOTE_SHOW_RECEIVED_CHANNEL)
  let showchannel : boolean;
  if(isQuoteSIChannel && (formData?.quoteChannel === 'WWA(EDI)') || formData?.quoteChannel === 'STI Online' || formData?.quoteChannel === 'SSC Online' ||
    formData?.quoteChannel === 'OMS IM' || formData?.quoteChannel === 'GlobeAssist IM' ||
    formData?.quoteChannel === 'GlobeAssist EX'
  ){
    showchannel = true;
  }

  const MULTISELECT_FIELD_MAXLIMIT = {
    clauses: getMaximumClausesSize
      ? Number(getMaximumClausesSize)
      : 5,
  };

  const userReferenceSuggConfigParam: Record<string, unknown> = {
    schemaOffice: loginClientBean?.office,
    handlingOffice: formData?.handlingOffice || loginClientBean?.office,
    schemaName: loginClientBean?.schema,
  }

  const {
    data: userReferenceSuggestions,
    loading: userReferenceSuggestionsLoading,
    setQuery: setUserReferenceQuery,
  } =
    useGetSuggestions(userReferenceSuggestionConfig(userReferenceSuggConfigParam as Record<string, unknown>));

  const { data: clauseSuggestions, setQuery: setClauseQuery } =
    useGetSuggestions(clauseSuggestionConfig(loginClientBean as any));

  const { data: quoteReferenceSuggestions, setQuery: setQuoteReferenceQuery } =
    useGetSuggestions(quoteReferenceSuggestionConfig(formData?.type || '', loginClientBean as any));

  const { data: statusOptions } = useGetSelections(shipmentStatusTypeConfig('QUO'));

  const { data: quoteTermsSuggestions, setQuery: setQuoteTermsQuery } =
    useGetSuggestions(quoteTermsSuggestionConfig);

  const { data: quoteCarrierSuggestions, setQuery: setQuoteCarrierQuery } =
    useGetSuggestions(quoteCarrierSuggestionConfig);

  const { data: handlingOfficeSuggestions, setQuery: setHandlingOfficeQuery } =
    useGetSuggestions(handlingOfficeSuggestionConfig);

  const handleChange = (field: keyof QuoteMainDetailsFormData, value: any) => {
    const updatedValue =
      (field === 'effectiveDate' || field === 'expirationDate') && value
        ? value instanceof Date
          ? value
          : typeof value === 'string'
            ? value
            : null
        : value;

    onFieldsChange?.({ ...formData, [field]: updatedValue });
  };

  // const handleTermsChange = (val: string) => {
  //   handleChange('termName', val as never);
  //   setQuoteTermsQuery(val);
  // };

  const handleTermsChange = (val: string) => {
    onFieldsChange?.({
      ...formData,
      termName: val,
      terms: val ? formData?.terms : '',
    });

    setQuoteTermsQuery(val);
  };

  const handleTermsSelect = (val: string, label: string) => {
    onFieldsChange?.({
      ...formData,
      terms: val,
      termName: label,
    });
  };

  useEffect(() => {
    if (formData) {
      const updates: Partial<QuoteMainDetailsFormData> = {};
      let effective = formData.effectiveDate;

      if (!effective) {
        effective = new Date();
        updates.effectiveDate = effective;
      }

      if (!formData.expirationDate) {
        const baseDate = effective instanceof Date ? effective : getStringToDate(effective as string);
        if (baseDate) {
          const expiration = new Date(baseDate);
          expiration.setDate(expiration.getDate() + 29);
          updates.expirationDate = expiration;
        }
      }

      if (Object.keys(updates).length > 0) {
        onFieldsChange?.({ ...formData, ...updates });
      }
    }
  }, []);

  //   useEffect(() => {
  //   if (!formData) return;
  //   const { effectiveDate, expirationDate } = formData;
  //   if (effectiveDate && expirationDate) {
  //     setShowDateWarning(effectiveDate > expirationDate);
  //     //   setFormData((prev) => ({
  //     //   ...prev,
  //     //   expirationDate: '',
  //     // }));
  //   } else {
  //     setShowDateWarning(false);
  //   }
  // }, [formData?.effectiveDate, formData?.expirationDate]);

  const getDatePickerValue = (value: Date | String | null): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;

    const parsedValue = getStringToDate(value.toString());
    if (parsedValue) return parsedValue;

    const fallbackDate = new Date(value.toString());
    return Number.isNaN(fallbackDate.getTime()) ? null : fallbackDate;
  };

  const normalizeDateForComparison = (value: Date | null): Date | null => {
    if (!value) return null;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  };

  const clearInvalidDateRange = (
    field: 'effectiveDate' | 'expirationDate' | 'updatedOn',
    message: string
  ) => {
    showStatus('warning', [message]);
    onFieldsChange?.({
      ...formData,
      [field]: null,
    });
  };

  const handleDateChange = (
    field: 'effectiveDate' | 'expirationDate' | 'updatedOn',
    value: Date | string | null
  ): boolean => {
    const nextValue = value ?? null;
    const nextDate = getDatePickerValue(nextValue);
    const effectiveDate = normalizeDateForComparison(
      field === 'effectiveDate'
        ? nextDate
        : getDatePickerValue(formData?.effectiveDate || null)
    );
    const expirationDate = normalizeDateForComparison(
      field === 'expirationDate'
        ? nextDate
        : getDatePickerValue(formData?.expirationDate || null)
    );

    if (effectiveDate && expirationDate && effectiveDate > expirationDate) {
      clearInvalidDateRange(
        field,
        field === 'effectiveDate'
          ? 'The Effective Date should be less than or equal to the Expiration Date'
          : 'The Expiration Date should be greater than or equal to the Effective Date'
      );
      return false;
    }
    handleChange(field, nextValue);
    return true;
  };

  const handleDateBlur = (
    event: React.KeyboardEvent<HTMLInputElement>,
    field: 'effectiveDate' | 'expirationDate' | 'updatedOn'
  ) => {
    const inputValue = (event.target as HTMLInputElement).value;
    const parsedDate = inputValue ? getDatePickerValue(inputValue) : null;

    if (parsedDate && !handleDateChange(field, parsedDate)) {
      return;
    }

    datePickerOnBlurHandler(event, field);
  };

  const renderDateField = (
    field: 'effectiveDate' | 'expirationDate',
    required: boolean
  ) => {
    const isEditing = dateEditMode[field];

    if (!isEditing) {
      return (
        <div className={styles.dateFieldRow}>
          <div className={styles.dateReadOnly}>
            {getFormattedDate(getDatePickerValue(formData?.[field] || null))}
          </div>
          <button
            className={styles.dateEditBtn}
            title="Edit date"
            onClick={() => setDateEditMode((prev) => ({ ...prev, [field]: true }))}
          >
            <img src={editIcon} alt="edit" width={22} height={22} />
          </button>
        </div>
      );
    }

    return (
      <div className={styles.dateFieldRow}>
        <div className={styles.datePickerWrapper}>
          <PDatePicker
            value={getDatePickerValue(formData?.[field] || null)}
            onChange={(newValue) => {
              // handleDateChange(field, newValue ?? null)
              // handleChange(field, newValue ?? null)
              setSkipNextBlurValidation(true);
            }}
            required={required}
            onkeydown={(event) => {
              datePickerKeyDownHandler(event as React.KeyboardEvent<HTMLInputElement>, field);
            }}
            onDateSelection={(val: Date | null) => {
              if (handleDateChange(field, val)) {
                dateSelectionHandler(val, field);
              }
            }}
            onBlur={(event) => {
              // datePickerOnBlurHandler(event as React.KeyboardEvent<HTMLInputElement>, field);
              handleDateBlur(event as React.KeyboardEvent<HTMLInputElement>, field);
            }}
            skipNextBlurValidation={skipNextBlurValidation}
          />
        </div>
        <button
          className={styles.dateEditBtn}
          title="Save date"
          onClick={() => setDateEditMode((prev) => ({ ...prev, [field]: false }))}
        >
          <img src={saveIcon} alt="save" width={18} height={18} />
        </button>
      </div>
    );
  };

  const handleOnBlur = (field: keyof QuoteMainDetailsFormData, value: any) => {
    const updatedValue = removeSpaces(value);
    if (updatedValue !== value) {
      onFieldsChange?.({
        ...formData,
        [field]: updatedValue,
      });
    }
  }
  const focusReferenceField = () => {
    window.setTimeout(() => {
      referenceNumberRef.current?.focus();
    }, 0);
  };
  // const mappedCarrierSuggestions = quoteCarrierSuggestions?.map((item) => ({
  //   code: item.SUGGEST_KEY,
  //   name: item.SUGGEST_VALUE,
  //   description: item.SUGGEST_VALUE
  // }));

  useEffect(() => {
    if (formData?.type === 'L') {
      onRegisterFields?.(['type', 'effectiveDate', 'expirationDate', 'quoteChannel']);
    } else {
      onRegisterFields?.(['type', 'Terms', 'controllingEntity', 'effectiveDate', 'expirationDate', 'quoteChannel', 'createdBy']);
    }
  }, []);

  const isMatchingUserReferenceSuggestion = useCallback((value: string) => {
    const normalizedValue = value.trim().toLowerCase();
    if (!normalizedValue) return true;

    return userReferenceSuggestions?.some((item) =>
      [item?.code, item?.name, item?.displayValue]
        .filter(Boolean)
        .some((suggestionValue) =>
          String(suggestionValue).trim().toLowerCase() === normalizedValue
        )
    );
  }, [userReferenceSuggestions]);

  const validateUserReference = useCallback(() => {
    const userReference = formData?.userReference?.trim();
    if (!userReference) return;
    if (
      selectedUserReference &&
      userReference.toLowerCase() === selectedUserReference.trim().toLowerCase()
    ) return;

    if (!isMatchingUserReferenceSuggestion(userReference)) {
      toggleErrorMessageModal(true);
      setUserReferenceErrorMessage("Please enter a valid User Reference.");
      setFormData((prev) => ({
        ...prev,
        userReference: '',
      }));
      setUserReferenceQuery('');
    }
  }, [
    formData?.userReference,
    isMatchingUserReferenceSuggestion,
    selectedUserReference,
    setFormData,
    setUserReferenceQuery,
  ]);

  const queueUserReferenceValidation = useCallback(() => {
    const userReference = formData?.userReference?.trim() || "";
    if (userReference === userReferenceFocusValueRef.current) return;

    if (userReferenceValidationTimeoutRef.current) {
      window.clearTimeout(userReferenceValidationTimeoutRef.current);
    }
    userReferenceValidationTimeoutRef.current = window.setTimeout(() => {
      setShouldValidateUserReference(true);
      setUserReferenceValidationTick((prev) => prev + 1);
    }, 600);
  }, [formData?.userReference]);

  useEffect(() => {
    if (!shouldValidateUserReference || userReferenceSuggestionsLoading) return;
    setShouldValidateUserReference(false);
    validateUserReference();
  }, [
    shouldValidateUserReference,
    userReferenceSuggestionsLoading,
    userReferenceSuggestions,
    userReferenceValidationTick,
    validateUserReference,
  ]);

  useEffect(() => () => {
    if (userReferenceValidationTimeoutRef.current) {
      window.clearTimeout(userReferenceValidationTimeoutRef.current);
    }
  }, []);

  const closeErrorMessageHandler = () => {
    toggleErrorMessageModal(false);
    setUserReferenceErrorMessage("");
  };

  const showError = (errorMessage: string, variant: 'bar' | 'modal' = 'bar') => {
    showBannerError([errorMessage], 3000, variant);
  }

  return (
    <div className={styles.container}>
      {/* <DateValidationBanner
        visible={showDateWarning}
        onClose={() => setShowDateWarning(false)}       
      /> */}

      <div className={styles.card}>
        <div className={styles.content}>
          <div className={formData?.type === 'F' ? styles.fclmainGrid : styles.mainGrid}>
            {/* Row 1 */}
            <PSelect
              label="Type"
              value={formData?.type || ''}
              onChange={(value) => {
                handleChange('type', value);
                focusReferenceField();
              }}
              options={TYPE_OPTIONS}
              required
            />

            <PSingleValueSearchableField
              label="Reference"
              id="referenceNumber"
              data={quoteReferenceSuggestions}
              displayFields={['SUGGEST_VALUE']}
              displayValueField="SUGGEST_KEY"
              columnHeaders={[]}
              inputRef={referenceNumberRef}
              value={formData?.referenceNumber || ''}
              disabled={isQuotePopulated}
              onChange={(val) => {
                setQuoteReferenceQuery(val);
                handleChange('referenceNumber', val);
              }}
              onSelect={(item) => {
                referenceSelectedFromDropdownRef.current = true;
                onPopulateData?.(item.SUGGEST_KEY as string);
                return handleChange('referenceNumber', item.SUGGEST_KEY);
              }}
              onBlur={() => {
                if (referenceSelectedFromDropdownRef.current) {
                  referenceSelectedFromDropdownRef.current = false;
                  return;
                }
                const refValue = String(formData?.referenceNumber || '').trim();
                if (refValue) {
                  onPopulateData?.(refValue);
                }
              }}
            />
            {/* {(formData?.type !== 'F' && formData?.type !== 'L' && false)&& (
              <>
                <Box>
                  <PSingleValueSearchableField
                    label='Terms'
                    id='terms'
                    onChange={(val) => {
                      handleTermsChange(val);
                    }}
                    required={true}
                    disabled={false}
                    data={quoteTermsSuggestions}
                    displayFields={['SUGGEST_VALUE']}
                    displayValueField="SUGGEST_VALUE"
                    columnHeaders={[]}
                    value={formData?.termName}
                    onSelect={(item) => {
                      handleTermsSelect(item.SUGGEST_KEY, item.SUGGEST_VALUE);
                    }}
                    onInvalidValueSelected={() => {
                      showError(`Please enter a valid Terms.`)
                      onFieldsChange?.({
                        ...formData,
                        terms: '',
                        termName: '',
                      });
                    }}
                  />
                </Box>
                {/* <Box> }
                <PMultiValueSearchableField
                  label="Carrier"
                  id="carrier"
                  data={quoteCarrierSuggestions}
                  initialSelectedItems={
                    formData?.carrier?.map((c) => {
                      return {
                        code: c.carrierCode,
                        name: c.carrierName ?? '',
                        displayName: c.carrierName ?? '',
                      }
                    }) || []
                  }
                  displayFields={['displayName']}
                  displayValueField="displayName"
                  columnHeaders={[]}
                  onSearch={(val: string) => setQuoteCarrierQuery(val)}
                  onSelect={(item) => {
                    const currentCarriers = Array.isArray(formData?.carrier)
                      ? formData.carrier
                      : [];

                    const alreadyAdded = currentCarriers.some(
                      (c: any) => c.carrierCode === item.code
                    );

                    if (!alreadyAdded) {
                      handleChange('carrier', [
                        ...currentCarriers,
                        {
                          carrierCode: item.code,
                          carrierName: item.name ?? '',
                        },
                      ]);
                    }
                  }}
                  onRemove={(removedItem, _updatedItems) => {
                    const currentCarriers = Array.isArray(formData?.carrier)
                      ? formData.carrier
                      : [];

                    handleChange(
                      'carrier',
                      currentCarriers.filter(
                        (c) => c.carrierCode !== removedItem.code
                      )
                    );
                  }}
                  onValidationError={(type) => {
                    if (type === 'duplicate') {
                      showStatus('warning', ['Duplicate Item are not allowed']);
                    }
                    // if (type === 'maxLimit') {
                    //     showStatus('warning', [
                    //     `Only ${MULTISELECT_FIELD_MAXLIMIT.clauses} item(s) allowed.`,
                    //     ]);
                    // }
                  }}
                  showTooltip={false}
                  isHoverIndexTooltip={false}
                />
                {/* </Box> }
                <Box>
                  <PTextField
                    label="Carrier Booking Number"
                    onChange={(e) => handleChange('carrierBookingNumber', e.target.value)}
                    onKeyUp={(e) => handleOnBlur('carrierBookingNumber', e.target.value)}
                    onBlur={(e) => handleOnBlur('carrierBookingNumber', e.target.value)}
                    maxLength={20}
                    required={false}
                    disabled={false}
                    value={formData?.carrierBookingNumber || ''}
                  />
                </Box>
                <Box>
                  <PTextField
                    label="Frequency"
                    onChange={(e) => handleChange('frequency', e.target.value)}
                    maxLength={20}
                    required={false}
                    disabled={false}
                    value={formData?.frequency || ''}
                  />
                </Box>
              </>
            )} */}

            <PSingleValueSearchableField
              label="User Reference"
              id="user-reference"
              data={userReferenceSuggestions}
              displayFields={['displayValue']}
              columnHeaders={[]}
              value={formData?.userReference || ''}
              onFocus={() => {
                userReferenceFocusValueRef.current = formData?.userReference?.trim() || "";
              }}
              onChange={(val) => {
                if (userReferenceValidationTimeoutRef.current) {
                  window.clearTimeout(userReferenceValidationTimeoutRef.current);
                }
                setShouldValidateUserReference(false);
                if (val.trim().toLowerCase() !== selectedUserReference.trim().toLowerCase()) {
                  setSelectedUserReference("");
                }
                setUserReferenceQuery(val);
                handleChange('userReference', val);
              }}
              onSelect={(item) => {
                if (userReferenceValidationTimeoutRef.current) {
                  window.clearTimeout(userReferenceValidationTimeoutRef.current);
                }
                setShouldValidateUserReference(false);
                setSelectedUserReference(item.code);
                handleChange('userReference', item.code);
              }}
              onBlur={queueUserReferenceValidation}
            />

            {/* <PSelect
              label="Status"
              value={formData?.status || ''}
              onChange={(value) => handleChange('status', value)}
              options={statusOptions}
              disabled
            /> */}
            
            <PSelect
                label="Status"
                value={formData?.status || ''}
                onChange={(value) => handleChange('status', value)}
                options={STATUS_OPTIONS}
                disabled
            />
            
            <Box className={styles.clausesBox}
              key={JSON.stringify(formData?.clauses || [])}>
              <PMultiValueSearchableField
                label="Clauses"
                id="clauses"
                data={clauseSuggestions}
                maxSelectionAllowed={MULTISELECT_FIELD_MAXLIMIT.clauses}
                // maxSelectionAllowed={5}
                initialSelectedItems={
                  formData?.clauses?.map((c) => ({
                    code: c.clauseCode,
                    name: c.clauseName ?? '',
                    description: c.clauseDesc ?? '',
                  }))
                  // || 'GULF - WAR RISK'
                }
                displayFields={['code', 'name', 'description']}
                columnHeaders={["Code", "Name", "Description"]}
                onSearch={(val: string) => setClauseQuery(val)}
                onSelect={(item) => {
                  const currentClauses = Array.isArray(formData?.clauses)
                    ? formData.clauses
                    : [];
                  const alreadyAdded = currentClauses.some(
                    (c: any) => c.clauseCode === item.code
                  );
                  if (!alreadyAdded) {
                    handleChange('clauses', [
                      ...currentClauses,
                      { clauseCode: item.code, clauseName: item.name ?? null, clauseDesc: item.description ?? null },
                    ]);
                  }
                }}
                onRemove={(removedItem, _updatedItems) => {
                  const currentClauses = Array.isArray(formData?.clauses)
                    ? formData.clauses
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
                  if (type === 'maxLimit') {
                    showStatus('warning', [
                      `Only ${MULTISELECT_FIELD_MAXLIMIT.clauses} item(s) allowed.`,
                    ]);
                  }
                }}
                showTooltip={false}

                onInvalidValueSelected={() => {
                  const currentClauses = Array.isArray(formData?.clauses)
                    ? formData.clauses
                    : [];
                  setClauseQuery('');
                  handleChange('clauses', currentClauses);
                  showError('Enter a valid Clause');
                }}
              />
            </Box>
            { (formData?.type !== 'L' )&& (
              <>
                <Box>
                  <PSelect
                    label="Pickup Needed"
                    options={FCLQUOTE_MAINDATEAILS_PICKUP_OPUTIONS}
                    onChange={(value) => handleChange('pickupNeeded', value)}
                    required={false}
                    value={formData?.pickupNeeded || 'N'}
                  />
                </Box>
                <Box>
                  <PSelect
                    label="Prepaid/Collect"
                    options={FCLQUOTE_MAINDATEAILS_PREPAID_COLLECT_OPUTIONS}
                    onChange={(value) => handleChange('prepaidCollect', value)}
                    required={false}
                    value={formData?.prepaidCollect || ''}
                  />
                </Box>
                <Box>
                  <PSelect
                    label="Controlling Entity"
                    options={FCLQUOTE_MAINDATEAILS_RATE_CONTROL_ENTITY_OPUTIONS}
                    onChange={(value) => handleChange('controllingEntity', value)}
                    required={true}
                    value={formData?.controllingEntity || 'ORG'}
                  />
                </Box>
              </>
            )}
            {/* Row 2 */}
            {(formData?.type === 'L' || formData?.type === 'F' ) && (
              <>
                <Box>
                  <label className={styles.fieldLabel}>Effective Date</label>
                  {renderDateField('effectiveDate', true)}
                </Box>

                <Box>
                  <label className={styles.fieldLabel}>Expiration Date</label>
                  {renderDateField('expirationDate', true)}
                </Box>
              </>
            )}

            {formData?.type === 'F' ? (
              <>
                {showchannel ? (
                  <>
                    <PTextField
                    label="Quote Channel"
                    value={formData?.quoteChannel === 'WWA(EDI)' ? '' : formData?.quoteChannel || ''}
                    disabled
                    required
                  />
                  
                  </>
              ) : 
                (
                  <>
                    <PSelect
                      label="Quote Channel"
                      value={formData?.quoteChannel || ''}
                      onChange={(value) => handleChange('quoteChannel', value)}
                      options={QUOTE_CHANNEL_OPTIONS}
                      required
                      disabled={!!formData?.referenceNumber}
                    />
                  </>
                )}
                
                <div className={styles.toggleRow}>
                  {isFCLDirectionEnable && (
                    <Box>
                      <PToggleButton
                        label="Direction"
                        value={formData?.direction === 'Export'}
                        onChange={(val) =>
                          handleChange('direction', val ? 'Export' : 'Import')
                        }
                        yesTitle='Export'
                        noTitle='Import'
                        // disabled={isQuotePopulated}
                      />
                    </Box>
                  )}
                </div>
                

              </>
            ) : (
              <>
                <PSelect
                  label="Quote Channel"
                  value={formData?.quoteChannel || ''}
                  onChange={(value) => handleChange('quoteChannel', value)}
                  options={QUOTE_CHANNEL_OPTIONS}
                  required={true}
                />
                <div className={styles.toggleRow}>
                  {isLCLDirectionEnable && (
                    <Box>
                      <PToggleButton
                        label="Direction"
                        value={formData?.direction === 'Export'}
                        onChange={(val) =>
                          handleChange('direction', val ? 'Export' : 'Import')
                        }
                        yesTitle='Export'
                        noTitle='Import'
                        disabled={isQuotePopulated}
                      />
                    </Box>
                  )}
                  {formData?.type === 'L' && showPendingFinal && (
                    <Box>
                      <PToggleButton
                        label="Pending Final"
                        value={formData?.pendingFinal === 'Yes'}
                        onChange={(val) =>
                          handleChange('pendingFinal', val ? 'Yes' : 'No')
                        }
                      />
                    </Box>
                  )}
                  {formData?.type === 'L' && !showPendingFinal && (
                    <Box>
                      <PToggleButton
                        label="Truck Quote"
                        value={formData?.truckQuote === 'Yes'}
                        onChange={(val) =>
                          handleChange('truckQuote', val ? 'Yes' : 'No')
                        }
                      />
                    </Box>
                  )}
                </div>
              </>
            )}
            {/* <div className={styles.toggleRow}>
              {formData?.type === 'L' && showPendingFinal && (
                <Box>
                  <PToggleButton
                    label="Pending Final"
                    value={formData?.pendingFinal === 'Yes'}
                    onChange={(val) =>
                      handleChange('pendingFinal', val ? 'Yes' : 'No')
                    }
                  />
                </Box>
              )}
            </div> */}

            <div className={styles.truckQuoteRow}>
              {formData?.type === 'L' && showPendingFinal && (
                <Box>
                  <PToggleButton
                    label="Truck Quote"
                    value={formData?.truckQuote === 'Yes'}
                    onChange={(val) =>
                      handleChange('truckQuote', val ? 'Yes' : 'No')
                    }
                  />
                </Box>
              )}

              {formData?.truckQuote === 'Yes' && (
                <div className={styles.truckQuoteTypeField}>
                  <PSelect
                    label="Quote Type"
                    labelSx={{ marginBottom: '5px' }}
                    value={formData?.quoteType || ''}
                    onChange={(value) => handleChange('quoteType', value)}
                    options={QUOTE_TYPE_OPTIONS}
                  />
                </div>
              )}
            </div>
          </div>

          <Box className={styles.moreDetailsToggleWrapper}>
            <ButtonBase
              ref={addMoreDetailBtnRef}
              tabIndex={0}
              aria-expanded={isMoreDetailsOpen}
              onClick={() => setIsMoreDetailsOpen(!isMoreDetailsOpen)}
              className={styles.moreDetailsToggleBtn}
            >
              <div className={styles.arrowWrapper}>
                <Box
                  className={`${styles.arrowIcon}${isMoreDetailsOpen ? ` ${styles.arrowIconOpen}` : ""}`}
                />
              </div>
              <span className={styles.moreTitle}>More Details</span>
            </ButtonBase>
          </Box>

          <Collapse in={isMoreDetailsOpen}>
            <div className={styles.moreGrid}>
              {/* {(formData?.type !== 'F' && formData?.type !== 'L' && false)&& (
                <>
                  <PSelect
                    label="Transit Time"
                    ref={transitTimeRef}
                    value={formData?.transitTime || '0'}
                    onChange={(value) => handleChange('transitTime', value)}
                    onKeyDown={(e) => onKeyDown?.(e, billingCompanyRef, 2, true, false)}
                    options={NUMBER_OPTIONS}
                    placeholder="Please Select"
                    required={false}
                  />
                  <Box>
                    <label className={styles.fieldLabel}>Effective Date</label>
                    {renderDateField('effectiveDate', true)}
                  </Box>
                  <Box>
                    <label className={styles.fieldLabel}>Expiration Date</label>
                    {renderDateField('expirationDate', true)}
                  </Box>
                </>
              )} */}
              {/* <div ref={billingCompanyRef}> */}
              {formData?.type !== 'F' && (<PTextField
                ref={billingCompanyRef}
                label="Billing Company"
                value={formData?.billingCompany || ''}
                onChange={(e) => handleChange('billingCompany', e.target.value)}
                onKeyDown={(e) => onKeyDown?.(e, addMoreDetailBtnRef, undefined, false, true)}
                size="small"
              />
              )}
              {/* </div> */}
              <PSingleValueSearchableField
                label="Handling Office"
                id="handling-office"
                data={handlingOfficeSuggestions}
                displayFields={['displayValue']}
                columnHeaders={[]}
                value={formData?.handlingOffice || ''}
                onChange={(val) => {
                  setHandlingOfficeQuery(val);
                  handleChange('handlingOffice', val);
                }}
                onSelect={(item) => handleChange('handlingOffice', item?.name)}
                onInvalidValueSelected={() => {
                  showError(`Please enter a valid Customer Code.`)
                  handleChange('handlingOffice', '');
                }}
              />

              {/* {formData?.type === 'F' && (
                <PSelect
                  label="Status"
                  value={formData?.status || ''}
                  onChange={(value) => handleChange('status', value)}
                  options={STATUS_OPTIONS}
                  required={false}
                  disabled
                />
              )} */}
              <PTextField
                label="Created By"
                value={formData?.createdBy || ''}
                onChange={(e) => handleChange('createdBy', e.target.value)}
                size="small"
                required
                disabled={false}
              />

              <Box>
                <label className={styles.fieldLabel}>Created On</label>
                <PTextField
                  value={getFormattedDate(formData?.createdOn) || getFormattedCurrentDate()}
                  size="small"
                  disabled
                />
              </Box>

              <PTextField
                label="Updated By"
                value={formData?.updatedBy || ''}
                onChange={(e) => handleChange('updatedBy', e.target.value)}
                size="small"
                disabled={false}
              />

              <Box>
                <label className={styles.fieldLabel}>Updated On</label>
                <PTextField
                  value={typeof formData?.updatedOn === 'string' ? formData.updatedOn : (getFormattedDate(formData?.updatedOn as Date) || getFormattedCurrentDate())}
                  size="small"
                  onChange={(e) => handleChange('updatedOn', e.target.value)}
                  maxLength={11}
                  disabled={false}
                  onBlur={(event) => {
                    // datePickerOnBlurHandler(event as React.KeyboardEvent<HTMLInputElement>, field);
                    handleDateBlur(event as React.KeyboardEvent<HTMLInputElement>, 'updatedOn');
                  }}
                />
              </Box>
            </div>
          </Collapse>
        </div>
      </div>
      <PConfirmationModal
        open={showErrorMessageModal ?? false}
        title='Error'
        variant='warning'
        buttonAlign="end"
        message={userReferenceErrorMessage}
        secondaryAction={{
          label: "Close",
          onClick: () => {
            closeErrorMessageHandler();
          }
        }} />
      <PConfirmationModal
        open={error?.showErrorModal ?? false}
        title='Error'
        variant='danger'
        buttonAlign="end"
        message={error?.message}
        secondaryAction={{
          label: "Close",
          onClick: () => {
            error?.onClose();
            setSkipNextBlurValidation(false);
          }
        }} />
    </div>
  );
};

export default QuoteMainDetails;
