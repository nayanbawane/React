import { useEffect, useState } from 'react';
import { Box, Button, ButtonBase, Collapse } from '@mui/material';

import searchIcon from '../../../../assets/images/search-icon.png';
import styles from '../../../../styles/LCL/CustomerDetails.module.css';
import pbStyles from '../../../../styles/LCL/PreBookingCustomerDetails.module.css';
import {
  PTextField,
  PSelect,
  PSingleValueSearchableField,
  PModal,
  AutoTextarea,
} from 'phoenix-react-lib';

import CustomerMoredetails from './CustomerMoredetails';
import POrganizationSearchPage from '../OrganizationSearch/POrganizationSearchPage';
import {
  COUNTRY_FIELD_CONFIG,
  ORG_SEARCH_PROFILES,
  resolveFieldProps,
} from '../OrganizationSearch/organizationSearchConfig';

import type {
  CustomerMoreDetailsForm,
  LclBookingDetailsForm,
  OrgCodeSuggestionItem,
  EoriPortConditions,
  CustomerDetailsSuggestions,
} from '../../../../types/LCL/misc/CustomerDetails.types';

import { useFeatureToggle } from '../../../../hooks/LCL/useFeatureToggle';
import { CommonToggleKeys } from '../../../../core/featureToggles/keys/commonToggleKeys';
import { LclToggleKeys } from '../../../../core/featureToggles/keys/oceanToggleKeys';
import { useGetSelections } from '../../../../hooks/LCL/useGetSelections';
import { namedAccountConfig } from '../../../../hooks/LCL/selectionHelpers';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';
import POrganizationSearch from '../OrganizationSearch/POrganizationSearch';
import {
  OrgRow,
  SelectedOrganization,
} from '@/types/LCL/misc/POrganizationSearch.types';
import { OrganizationResultDetail } from '@/hooks/LCL/OrganizationSerach/organizationSerachService';
import { useAppSelector } from '@/app/store/hooks';
import { MODULE_BKG } from '../../../../core';
interface LclBookingDetailsProps {
  form: LclBookingDetailsForm;
  onFieldChange: (field: keyof LclBookingDetailsForm, value: string) => void;
  customerMoreDetails: CustomerMoreDetailsForm;
  onMoreDetailsChange: (
    field: keyof CustomerMoreDetailsForm,
    value: string
  ) => void;
  suggestions?: CustomerDetailsSuggestions;
  portOfDischarge?: string;
  eoriPortConditions?: EoriPortConditions;
  moduleType?: string;
  containerType?: string;
  namedAccountOptions?: Array<{ label: string; value: string }>;
  onCustomerCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onShipperCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onConsigneeCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onForwarderCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onNotifyPartyCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  rateDetails?: any;
  accuRateProfile?: string;
  moreDetailsRef?: React.MutableRefObject<HTMLInputElement | null>;
  trackingCodeRef?: React.MutableRefObject<HTMLInputElement | null>;
  onMoreDetailsFlagValue?: (item: boolean) => void;
  shipmentType?: string;
  showBannerError?: (messages: string[], autoHideMs?: number, variant?: 'bar' | 'modal') => void;
}

const CUSTOMER_TYPE_OPTIONS = [
  { label: 'Please Select', value: '' },
  { label: 'Forwarder', value: 'F' },
  { label: 'Direct Customer', value: 'D' },
];

const PREPAID_COLLECT_OPTIONS = [
  { label: 'Select', value: '' },
  { label: 'Prepaid', value: 'P' },
  { label: 'Collect', value: 'C' },
];

const CONTROLLING_ENTITY_OPTIONS = [
  { label: 'Please Select', value: '' },
  { label: 'Origin', value: 'ORG' },
  { label: 'Destination', value: 'DEST' },
  { label: 'WWA Global Customer', value: 'WWA' },
];
const RATE_CONTROLLING_ENTITY_OPTIONS = [
  { label: 'Please Select', value: '' },
  { label: 'Origin', value: 'ORG' },
  { label: 'Destination', value: 'DEST' },
  { label: 'WWA', value: 'WWA' },
];

const sharedMenuProps = {
  disableScrollLock: true,
  PaperProps: {
    className: styles.sharedMenuPaper,
  },
};

export default function LclBookingDetails({
  form,
  onFieldChange,
  customerMoreDetails,
  onMoreDetailsChange,
  suggestions,
  portOfDischarge = '',
  eoriPortConditions = {},
  moduleType,
  componentType,
  namedAccountOptions = [],
  onCustomerCodeSelect,
  onShipperCodeSelect,
  onConsigneeCodeSelect,
  onForwarderCodeSelect,
  onNotifyPartyCodeSelect,
  accuRateProfile = '',
  moreDetailsRef,
  trackingCodeRef,
  onMoreDetailsFlagValue,
  shipmentType,
  rateDetails,
  showBannerError
}: LclBookingDetailsProps) {

  const { accurateRate } = rateDetails;
  const { triggerAccurateOrConfirm } = accurateRate;
  const isAccurateRatingType = rateDetails?.defaultState?.isAccurateServiceActive ?? false;


  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [orgSearchOpen, setOrgSearchOpen] = useState(false);
  const [creditHoldDialogOpen, setCreditHoldDialogOpen] = useState(false);
  const [hasNamedAccounts, setHasNamedAccounts] = useState(false);
  const direction = useAppSelector(
    state => state.quoteBooking.mainDetails.direction
  )

  const loginClientBean = useAppSelector(selectLoginClientBean);
  const { isVisible, getToggleValue } = useFeatureToggle();
  const showAgentDetails = isVisible(
    CommonToggleKeys.OCEAN_FREIGHT_BOOKING_SHOW_AGENT_DETAILS
  );
  const { data: namedAccountData, refetch: refetchNamedAccount } =
    useGetSelections(
      namedAccountConfig(form.customerCode,loginClientBean?.companyId ?? '0',loginClientBean)
    );

  useEffect(() => {
    if (form.customerCode) {
      refetchNamedAccount();
    } else {
      setHasNamedAccounts(false);
    }
  }, [form.customerCode]);


  useEffect(() => {
    setHasNamedAccounts(namedAccountData.length > 0);
  }, [namedAccountData]);

  const showRateControlling = (isVisible(LclToggleKeys.SHOW_RATE_CONTROLLING) || isVisible(CommonToggleKeys.ACRT_RATE_CONTROLLING_ENTITY)) && shipmentType?.toUpperCase() === 'L';  
  const showTruckProfile = isVisible(CommonToggleKeys.OCEAN_SHOW_TRUCK_PROFILE) && shipmentType === 'L';

  const showCustomerOrgType =
    isVisible(CommonToggleKeys.OCN_ORG_CUSTOMER_TYPE) &&
    isVisible(CommonToggleKeys.ORG_CUSTOMER_TYPE);
  const emailMandatory = isVisible(
    CommonToggleKeys.MANDATORY_CUSTOMER_EMAIL_ADDRESS
  );
  const removeWwaOption = isVisible(
    CommonToggleKeys.BOOKING_REMOVE_WWA_AS_CONTROLLING_ENTITY
  );
  const disableCtrlForWwa = isVisible(
    CommonToggleKeys.OCEAN_CONTROLLING_ENTITY_DISABLE_FOR_WWA_CUSTOMER
  );
  const nonMandatoryFields = isVisible(LclToggleKeys.NON_MANDATORY_FIELDS);
  const ctrlEntityLabel =
    getToggleValue(
      CommonToggleKeys.OCEAN_BOOKING_CONTROLLING_ENTITY_OTHER_LANGAUGE
    ) ?? 'Controlling Entity';
  const maxEmailLength = getToggleValue(CommonToggleKeys.MAX_CUST_EMAIL_LENGTH)
    ? Number(getToggleValue(CommonToggleKeys.MAX_CUST_EMAIL_LENGTH))
    : undefined;
  const showCopyPasteEmail = isVisible(
    CommonToggleKeys.OCEAN_BOOKING_ALLOW_COPY_AND_PASTE_CUST_EMAIL
  );
  const showCustomsIntegration = isVisible(
    CommonToggleKeys.OCN_EXP_CUSTOMS_INTEGRATION
  );
  const showAsAgentFor = isVisible(
    CommonToggleKeys.OCN_BKG_BL_SHOW_AS_AGENT_FOR
  );
  const agentForCustTypes =
    getToggleValue(CommonToggleKeys.OCN_BKG_BOL_AS_AGENT_FOR_CUST_TYPES) ?? '';
  const euVatAddressMandatory =
    isVisible(CommonToggleKeys.OCN_APPLY_EU_VAT) && showCustomerOrgType;
  const showEuVatSs = isVisible(CommonToggleKeys.OCN_APPLY_EU_VAT_SS);


  const rateControllingDefaultCheck = loginClientBean?.officeSettingMap?.BKG_CONTROLLING_ENTITY;

  const {
    isPortOfLoadInEurope = false,
    isDischargePortInEurope = false,
    isFrobCargo = false,
    isDestinationInEurope = false,
  } = eoriPortConditions;
  const ics2Enabled =
    isVisible(CommonToggleKeys.OCN_ICS2_MAIN) &&
    isVisible(CommonToggleKeys.OCN_ICS2_BKG_SHOW_CUSTOMER_EORI_NUMBER_UI);
  const showEori =
    ics2Enabled &&
    !isPortOfLoadInEurope &&
    (isDischargePortInEurope || isFrobCargo || isDestinationInEurope);
  const showNamedAccount =
    isVisible(CommonToggleKeys.NEW_CUSTOMER_LOOK_UP) &&
    isVisible(CommonToggleKeys.NEW_CUSTOMER_LOOK_UP_QUO) &&
    isVisible(CommonToggleKeys.NEW_CUSTOMER_LOOK_UP_BKG) &&
    hasNamedAccounts;
  shipmentType === 'L';

  const isWwaCustomer =
    form.customerCode !== '' &&
    disableCtrlForWwa &&
    customerMoreDetails.wwaCustomer === 'Y';

  const controllingEntityOptions = CONTROLLING_ENTITY_OPTIONS.filter(
    (opt) => !(removeWwaOption && opt.value === 'WWA')
  ).map((opt) => {
    if (moduleType === 'QUO' && opt.value === 'DEST')
      opt.value = 'D'
    return opt;
  });

  const rateControllingEntityOptions = RATE_CONTROLLING_ENTITY_OPTIONS.filter(
    (opt) => !(removeWwaOption && opt.value === 'WWA')
  ).map((opt) => {
    if (moduleType === 'QUO' && opt.value === 'DEST')
      opt.value = 'D'
    return opt;
  });

  const handleToggleMoreDetails = () => { setShowMoreDetails((prev) => !prev); onMoreDetailsFlagValue?.(!showMoreDetails) };

  const mapOrganizationToSuggestion = (
    org: OrganizationResultDetail
  ): OrgCodeSuggestionItem => {
    return {
      code: org.organizationCode ?? '',
      billToCode: org.billToCode ?? '',
      name: org.organizationName ?? '',
      type: org.organizationType ?? '',
      alias: org.organizationAliasCode ?? '',
      city: org.city ?? '',
      state: org.state ?? '',
      country:
        org.countryCode && org.country
          ? `${org.countryCode}-${org.country}`
          : '',
      count: '',
      detailName: org.organizationName ?? '',
      detailName2: org.name1 ?? '',
      addressLine1: org.organizationAddress ?? '',
      addressLine2: org.organizationAddress2 ?? '',
      addressLine3: org.organizationAddress3 ?? '',
      contactName: org.contactPerson ?? '',
      phoneNumber: org.phoneNumber ?? '',
      fax: org.fax ?? '',
      wwaCustomer: org.wwaCustomer ?? '',
      stateCode: org.state ?? '',
      zipCode: org.postalCode ?? '',
      email: org.email ?? '',
      fmcLicensed: org.fmcLicense ?? '',
      stateId: '',
      stateName: org.state ?? '',
      creditHold: '',
      salesRep: org.salesRepresentative ?? '',
      cellPhone: org.cellPhone ?? '',
      eoriNumber: org.eoriNumber ?? '',
      customerType: '',
      custName1: org.fmcAddress1 ?? '',
      custName2: org.fmcAddress2 ?? '',
      custName3: org.fmcAddress3 ?? '',
      custName4: org.fmcAddress4 ?? '',
      custName5: org.fmcAddress5 ?? '',
    };
  };

  const handleCustomerCodeSelect = (org: OrganizationResultDetail) => {
    const cusData = mapOrganizationToSuggestion(org);
    if (onCustomerCodeSelect) {
      onCustomerCodeSelect(cusData);
    } else {
      onFieldChange('customerCode', org.organizationCode ?? '');
    }
    setOrgSearchOpen(false);
  };

  const handleCustomerSuggestionSelect = (item: OrgCodeSuggestionItem) => {
    const hold = item.creditHold?.toUpperCase();
    if ((hold === 'H' || hold === 'Y') && direction === 'Export') {
      setCreditHoldDialogOpen(true);
    }
    if (onCustomerCodeSelect) {
      onCustomerCodeSelect(item);
    } else {
      onFieldChange('customerCode', item.code);
    }
  };

  const showError = (errorMessage: string, variant: 'bar' | 'modal' = 'bar') => {
    showBannerError([errorMessage], 3000, variant);
  }

  return (
    <Box className={styles.pageWrapper}>
      <Box className={styles.twoColGrid}>
        <Box>
          <Box className={styles.customerCodeAccurateRow}>
            <Box className={styles.relativeWrapper}>
              <PSingleValueSearchableField
                label="Customer Code"
                columnHeaders={[
                  'Code',
                  'Bill to Code',
                  'Name',
                  'Type',
                  'Alias',
                  'City',
                  'State',
                  'Country',
                  'Count',
                ]}
                displayFields={[
                  'code',
                  'billToCode',
                  'name',
                  'type',
                  'alias',
                  'city',
                  'state',
                  'country',
                  'count',
                ]}
                title="Recently Used Customer Codes"
                data={suggestions?.lclForm.customerCode.data ?? []}
                displayFields1={[
                  'code',
                  'billToCode',
                  'name',
                  'type',
                  'alias',
                  'city',
                  'state',
                  'country',
                  'count',
                ]}
                title1="Recently Used Customer Codes in Login Office"
                data1={suggestions?.lclForm.customerCode.data1 ?? []}
                displayFields2={[
                  'code',
                  'billToCode',
                  'name',
                  'type',
                  'alias',
                  'city',
                  'state',
                  'country',
                  'count',
                ]}
                title2="All Other Customer Codes - In Ascending Order of City"
                data2={suggestions?.lclForm.customerCode.data2 ?? []}
                displayValueField="code"
                value={form.customerCode}
                onChange={(val) => {
                  suggestions?.lclForm.customerCode.setQuery(val);
                  onFieldChange('customerCode', val);
                }}
                onSelect={(item) => {
                  const newCode = String((item as OrgCodeSuggestionItem).code ?? '');
                  const codeChanged = newCode !== form.customerCode;
                  handleCustomerSuggestionSelect(item as OrgCodeSuggestionItem);
                  if (isAccurateRatingType && codeChanged) triggerAccurateOrConfirm?.();
                }}
                showTooltip={true}
                onInvalidValueSelected={() => {
                  showError(`Please enter a valid Customer Code.`)
                  onFieldChange('customerCode', '');
                }}
              />
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchIcon}
                onClick={() => setOrgSearchOpen(true)}
              />
            </Box>

            {shipmentType === 'L' && (
              <PTextField
                fullWidth
                label="AccuRate Profile"
                value={form.accuRateProfile}
                onChange={(e) =>
                  onFieldChange('accuRateProfile', e.target.value)
                }
                disabled
              />
            )}

            {showNamedAccount && (
              <Box className={styles.fullWidthBox}>
                <PSelect
                  label="Named Account"
                  MenuProps={sharedMenuProps}
                  disabled={!form.customerCode}
                  className={`${styles.selectFormControl} ${pbStyles.pbFullWidthSelect}`}
                  labelSx={{ pb: 0 }}
                  value={(form as any).namedAccount ?? ''}
                  onChange={(val) => {
                    const namedAccountChanged = String(val) !== String((form as any).namedAccount ?? '');
                    onFieldChange('namedAccount', String(val));
                    if (isAccurateRatingType && namedAccountChanged) triggerAccurateOrConfirm?.();
                  }}
                  options={namedAccountData}
                />
              </Box>
            )}
          </Box>

          <Box className={styles.lclFieldGroup}>
            {/* <PTextField
              fullWidth
              label="Customer Name"
              value={form.customerName}
              onChange={(e) => onFieldChange('customerName', e.target.value)}
              multiline
              rows={5}
              required
              className={styles.autoHeightField}
            /> */}

            <AutoTextarea
              fullWidth
              label="Customer Name"
              value={form.customerName}
              required
              onChange={(e) =>
                onFieldChange('customerName', e.target.value)
              }
              autoSize={false}
              totalLines={5}
              charPerLine={50}
              height={'85px'}
            />
          </Box>

          <Box className={styles.lclFieldGroup}>
            {/* <PTextField
              fullWidth
              label="Customer Address"
              value={form.customerAddress}
              onChange={(e) => onFieldChange('customerAddress', e.target.value)}
              multiline
              rows={3}
              className={styles.autoHeightField}
              required={!nonMandatoryFields || euVatAddressMandatory}
            /> */}

            <AutoTextarea
              fullWidth
              label="Customer Address"
              value={form.customerAddress}
              onChange={(e) =>
                onFieldChange('customerAddress', e.target.value)
              }
              autoSize={false}
              totalLines={3}
              charPerLine={50}
              height={'51px'}
              required={!nonMandatoryFields || euVatAddressMandatory}
            />
          </Box>

          <Box className={styles.lclTwoColFieldGroup}>
            <PTextField
              fullWidth
              label="Customer City"
              value={form.customerCity}
              onChange={(e) => onFieldChange('customerCity', e.target.value)}
              maxLength={20}
            />
            <PSingleValueSearchableField
              label="Customer State"
              {...resolveFieldProps(
                ORG_SEARCH_PROFILES({}).customer.stateField
              )}
              data={
                suggestions?.lclForm?.customerState?.data ??
                resolveFieldProps(ORG_SEARCH_PROFILES({}).customer.stateField)
                  .data
              }
              value={form.customerState}
              onChange={(val) => {
                onFieldChange('customerState', val);
                suggestions?.lclForm?.customerState?.setQuery(val);
              }}
              onSelect={(item) => {
                if (suggestions?.lclForm?.customerState?.onSelect) {
                  suggestions.lclForm.customerState.onSelect(item);
                } else {
                  onFieldChange('customerState', String(item['name'] ?? ''));
                }
              }}
              showTooltip={true}
              inputClassName={styles.codeInputField}
            />
          </Box>

          <Box className={styles.lclTwoColFieldGroup}>
            <PTextField
              fullWidth
              label="Customer Zip Code"
              value={form.customerZipCode}
              onChange={(e) => onFieldChange('customerZipCode', e.target.value)}
              maxLength={18}
            />
            <PSingleValueSearchableField
              label="Customer Country"
              {...resolveFieldProps(COUNTRY_FIELD_CONFIG)}
              data={
                suggestions?.lclForm?.customerCountry?.data ??
                resolveFieldProps(COUNTRY_FIELD_CONFIG).data
              }
              value={form.customerCountry}
              onChange={(val) => {
                onFieldChange('customerCountry', val);
                suggestions?.lclForm?.customerCountry?.setQuery(val);
              }}
              onSelect={(item) => {
                if (suggestions?.lclForm?.customerCountry?.onSelect) {
                  suggestions.lclForm.customerCountry.onSelect(item);
                } else {
                  onFieldChange(
                    'customerCountry',
                    String(item['displayName'] ?? '')
                  );
                }
              }}
              showTooltip={true}
              inputClassName={styles.codeInputField}
            />
          </Box>

          <Box className={styles.lclTwoColFieldGroup}>
            <PTextField
              fullWidth
              label="Customer Fax"
              value={form.customerFax}
              onChange={(e) => onFieldChange('customerFax', e.target.value)}
              maxLength={20}
            />
            {showEori && (
              <PTextField
                fullWidth
                label="EORI Number"
                value={form.customerEoriNumber}
                onChange={(e) =>
                  onFieldChange('customerEoriNumber', e.target.value)
                }
              />
            )}
          </Box>

          {showCustomerOrgType && (
            <Box className={styles.lclFieldGroup}>
              <Box
                className={`${styles.fullWidthBox} ${styles.selectFormControl}`}
              >
                <PSelect
                  label="Customer Type"
                  value={shipmentType === 'F' ? form.fcustomerType : form.customerType}
                  onChange={(val) => { shipmentType === 'F' ? onFieldChange('fcustomerType', String(val)) : onFieldChange('customerType', String(val)) }}
                  options={CUSTOMER_TYPE_OPTIONS}
                  MenuProps={sharedMenuProps}
                  className={styles.quarterWidthSelect}
                />
              </Box>
            </Box>
          )}
        </Box>

        <Box>
          {showTruckProfile && (
            <Box className={styles.lclFieldGroup}>
              <PTextField
                label="Truck Sell Rate Profile"
                value={form.truckSellRateProfile}
                onChange={(e) =>
                  onFieldChange('truckSellRateProfile', e.target.value)
                }
                sx={{ width: '32%' }}
                disabled
              />
            </Box>
          )}

          <Box className={styles.lclThreeColFieldGroup}>
            {shipmentType === 'L' && (
              <>
                  <Box
                      className={`${styles.fullWidthBox} ${styles.selectFormControl}`}
                      data-eservice-field="PREPAID_COLLECT"
                    >
                      <PSelect
                        label="Prepaid/Collect"
                        value={form.prepaidCollect}
                        onChange={(val) => {
                          const prepaidChanged = String(val) !== String(form.prepaidCollect ?? '');
                          onFieldChange('prepaidCollect', String(val));
                          if (isAccurateRatingType && prepaidChanged) triggerAccurateOrConfirm?.();
                        }}
                        options={PREPAID_COLLECT_OPTIONS}
                        MenuProps={sharedMenuProps}
                      />
                    </Box>
                    <Box
                      className={`${styles.fullWidthBox} ${styles.selectFormControl}`}
                    >
                      <PSelect
                        label={ctrlEntityLabel}
                        value={isWwaCustomer ? 'WWA' : form.controllingEntity}
                        onChange={(val) => {
                          const controllingChanged = String(val) !== String(form.controllingEntity ?? '');
                          onFieldChange('controllingEntity', String(val));
                          if (isAccurateRatingType && moduleType === MODULE_BKG && controllingChanged) triggerAccurateOrConfirm?.();
                        }}
                        options={controllingEntityOptions}
                        MenuProps={sharedMenuProps}
                        required
                        disabled={isWwaCustomer}
                      />
                    </Box>
              </>
            )}

            {showRateControlling && (
              <Box
                className={`${styles.fullWidthBox} ${styles.selectFormControl}`}
              >
                <PSelect
                  label="Rate Controlling Entity"
                  value={form.rateControllingEntity}
                  onChange={(val) => {
                    const rateControllingChanged = String(val) !== String(form.rateControllingEntity ?? '');
                    onFieldChange('rateControllingEntity', String(val));
                    if (isAccurateRatingType && moduleType === MODULE_BKG && rateControllingChanged) triggerAccurateOrConfirm?.();
                  }}
                  options={rateControllingEntityOptions}
                  MenuProps={sharedMenuProps}
                  required
                />
              </Box>
            )}
          </Box>

          <Box className={styles.lclFieldGroup}>
            <PTextField
              fullWidth
              label="Customer's Contact Name"
              value={form.customersContactName}
              onChange={(e) =>
                onFieldChange('customersContactName', e.target.value)
              }
              maxLength={40}
            />
          </Box>

          <Box className={styles.lclThreeColFieldGroup}>
            <PTextField
              fullWidth
              label="Sales Representative"
              value={form.salesRepresentative}
              onChange={(e) =>
                onFieldChange('salesRepresentative', e.target.value)
              }
              disabled
            />
            <PTextField
              fullWidth
              label="Telephone Number"
              value={form.telephoneNumber}
              onChange={(e) => onFieldChange('telephoneNumber', e.target.value)}
              type="tel"
              maxLength={20}
            />
            <PTextField
              fullWidth
              label="Mobile Number"
              value={form.mobileNumber}
              onChange={(e) => onFieldChange('mobileNumber', e.target.value)}
              type="tel"
              maxLength={20}
            />
          </Box>

          <Box className={styles.lclFieldGroup}>
            <Box className={styles.emailLabelRow}>
              <span className={styles.fieldLabel}>
                Customer Email
                {emailMandatory && <span style={{ color: 'red' }}> *</span>}
              </span>
              {showCopyPasteEmail && (
                <span className={styles.charCount}>
                  {form.customerEmail?.length} character(s)
                </span>
              )}
            </Box>
            <PTextField
              fullWidth
              value={form.customerEmail}
              onChange={(e) => onFieldChange('customerEmail', e.target.value)}
              type="email"
              required={emailMandatory}
              inputProps={
                maxEmailLength ? { maxLength: maxEmailLength } : undefined
              }
            />
          </Box>

          <Box className={styles.lclFieldGroup}>
            {showCustomsIntegration ? (
              <Box className={styles.lclTwoColFieldGroup}>
                <PTextField
                  fullWidth
                  label="Customer Reference"
                  value={form.customerReference}
                  onChange={(e) => {
                    onFieldChange('customerReference', e.target.value);
                    onMoreDetailsChange('forwarderReference', e.target.value);
                  }}
                  maxLength={80}
                />
                <PTextField
                  fullWidth
                  label="Customer IT No"
                  value={form.customerIt}
                  onChange={(e) => onFieldChange('customerIt', e.target.value)}
                  inputProps={{ maxLength: 9 }}
                />
              </Box>
            ) : showEuVatSs ? (
              <Box className={styles.lclTwoColFieldGroup}>
                <PTextField
                  fullWidth
                  label="Customer Reference"
                  value={form.customerReference}
                  onChange={(e) => {
                    onFieldChange('customerReference', e.target.value);
                    onMoreDetailsChange('forwarderReference', e.target.value);
                  }}
                />
                <PTextField
                  fullWidth
                  label="Customer Type"
                  value={form.customerType}
                  disabled
                />
              </Box>
            ) : (
              <PTextField
                fullWidth
                label="Customer Reference"
                value={form.customerReference}
                onChange={(e) => {
                  onFieldChange('customerReference', e.target.value);
                  onMoreDetailsChange('forwarderReference', e.target.value);
                }}
              />
            )}
          </Box>

          {showAgentDetails &&
            (() => {
              const showAsAgentForField =
                showAsAgentFor &&
                agentForCustTypes
                  .split(',')
                  .map((t) => t.trim())
                  .includes(form.customerType);
              return (
                <Box
                  className={
                    showAsAgentForField
                      ? styles.lclThreeColFieldGroup
                      : styles.lclTwoColFieldGroup
                  }
                >
                  <PTextField
                    fullWidth
                    label="Agent Name"
                    value={form.agentName}
                    onChange={(e) => onFieldChange('agentName', e.target.value)}
                  />
                  <PTextField
                    fullWidth
                    label="Agent Email"
                    value={form.agentEmail}
                    onChange={(e) =>
                      onFieldChange('agentEmail', e.target.value)
                    }
                    type="email"
                  />
                  {showAsAgentForField && (
                    <PTextField
                      fullWidth
                      label="As Agent for"
                      value={form.asAgentFor}
                      onChange={(e) =>
                        onFieldChange('asAgentFor', e.target.value)
                      }
                      inputProps={{ maxLength: 35 }}
                      required
                    />
                  )}
                </Box>
              );
            })()}
        </Box>
      </Box>

      {/* <Box className={styles.moreDetailsToggleWrapper}>
        <ButtonBase
          ref={moreDetailsRef}
          aria-expanded={showMoreDetails}
          aria-controls="lcl-more-details-panel"
          onClick={handleToggleMoreDetails}
          className={styles.moreDetailsToggleBtn}
        >
          <Box
            className={`${styles.arrowIcon}${showMoreDetails ? ` ${styles.arrowIconOpen}` : ''}`}
          />
          <span className={styles.moreDetailsLabel}>More Details</span>
        </ButtonBase>
      </Box> */}
      <Box className={styles.moreDetailsToggleWrapper}>
        <ButtonBase
          ref={moreDetailsRef}
          aria-expanded={showMoreDetails}
          aria-controls="lcl-more-details-panel"
          onClick={handleToggleMoreDetails}
          className={styles.moreDetailsToggleBtn}
        >
          <Box className={styles.iconWrapper}>
            <Box
              className={`${styles.arrowIcon}${showMoreDetails ? ` ${styles.arrowIconOpen}` : ''}`}
            />
          </Box>

          <span className={styles.moreDetailsLabel}>More Details</span>
        </ButtonBase>
      </Box>

      <Collapse in={showMoreDetails} id="lcl-more-details-panel">
        <CustomerMoredetails
          form={customerMoreDetails}
          onFieldChange={onMoreDetailsChange}
          suggestions={suggestions}
          portOfDischarge={portOfDischarge}
          eoriPortConditions={eoriPortConditions}
          moduleType={moduleType}
          componentType={componentType}
          onShipperCodeSelect={onShipperCodeSelect}
          onConsigneeCodeSelect={onConsigneeCodeSelect}
          onForwarderCodeSelect={onForwarderCodeSelect}
          onNotifyPartyCodeSelect={onNotifyPartyCodeSelect}
          trackingCodeRef={trackingCodeRef}
        />
      </Collapse>

      <PModal
        title="Organization Search"
        open={orgSearchOpen}
        onClose={() => setOrgSearchOpen(false)}
        height={{ xs: '85vh', md: '31rem' }}
        width={{ xs: '95vw', sm: '95vw', md: 1049 }}
        backgroundColor="white"
        contentSx={{ pl: 0 }}
      >
        <Box className={styles.orgSearchContent}>
          <POrganizationSearchPage
            configKey="customer"
            onSelect={handleCustomerCodeSelect}
            moduleType={moduleType}
          />
        </Box>
      </PModal>

      <PModal
        title="Shipper Notification"
        open={creditHoldDialogOpen}
        height={{ xs: '6vh', md: '8rem' }}
        width={{ xs: '45vw', sm: '45vw', md: 500 }}
        backgroundColor="white"
        isCloseIcon={false}
      >
        <Box>
          <p className={styles.creditHoldMessage}>Shipper is on hold.</p>
          <Box className={styles.creditHoldActions}>
            <Button
              variant="contained"
              size="small"
              onClick={() => setCreditHoldDialogOpen(false)}
            >
              Close
            </Button>
          </Box>
        </Box>
      </PModal>
    </Box>
  );
}
