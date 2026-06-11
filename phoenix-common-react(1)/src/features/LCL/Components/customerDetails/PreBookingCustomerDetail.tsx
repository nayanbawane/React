import { useEffect, useState } from 'react';
import { Box, ButtonBase } from '@mui/material';

import searchIcon from '../../../../assets/images/search-icon.png';
import styles from '../../../../styles/LCL/CustomerDetails.module.css';
import pbStyles from '../../../../styles/LCL/PreBookingCustomerDetails.module.css';
import { CommonToggleKeys } from '../../../../core/featureToggles/keys/commonToggleKeys';
import {
  PTextField,
  PSelect,
  PSingleValueSearchableField,
  PModal,
  AutoTextarea,
} from 'phoenix-react-lib';

import type {
  LclBookingDetailsForm,
  OrgCodeSuggestionItem,
  PreBookingDetailsProps,
} from '@/types';
import POrganizationSearchPage from '../OrganizationSearch/POrganizationSearchPage';
import { useFeatureToggle } from '../../../../hooks/LCL/useFeatureToggle';
import { useGetSelections } from '../../../../hooks/LCL/useGetSelections';
import { namedAccountConfig } from '../../../../hooks/LCL/selectionHelpers';
import { useAppSelector } from '../../../../app/store/hooks';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store/store';
import { useEmailValidation } from '../../../../hooks/LCL/usevalidateEmailField';
import { MODULE_QUO } from '../../../../core';
import { OrganizationResultDetail } from '@/hooks/LCL/OrganizationSerach/organizationSerachService';

const PREPAID_COLLECT_OPTIONS = [
  { label: 'Please Select', value: '' },
  { label: 'Prepaid', value: 'P' },
  { label: 'Collect', value: 'C' },
];

const CONTROLLING_ENTITY_OPTIONS = [
  { label: 'Please Select', value: '-1' },
  { label: 'Origin', value: 'O' },
  { label: 'Destination', value: 'D' },
  { label: 'WWA Global Customer', value: 'WWA' },
];

const RATE_CONTROLLING_ENTITY_OPTIONS = [
  { label: 'Please Select', value: '-1' },
  { label: 'Origin', value: 'O' },
  { label: 'Destination', value: 'D' },
  { label: 'WWA', value: 'WWA' },
];

const sharedMenuProps = {
  disableScrollLock: true,
  PaperProps: {
    className: styles.sharedMenuPaper,
  },
};

export default function PreBookingCustomerDetail({
  form,
  onFieldChange,
  customerMoreDetails,
  onMoreDetailsChange,
  suggestions,
  onCustomerCodeSelect,
  onFieldsChange,
  onRegisterFields,
  rateDetails,
  accuRateProfile = '',
  moduleType,
  showStatus,
}: PreBookingDetailsProps) {
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false);
  const { validateEmail } = useEmailValidation(showStatus);

  // const { handleAccurateRate } = rateDetails?.accurateRate ?? {};
  // const {
  //   isPortOfLoadInEurope = false,
  //   isDischargePortInEurope = false,
  //   isFrobCargo = false,
  //   isDestinationInEurope = false,
  // } = eoriPortConditions;
  const TRACKED_FIELDS: string[] = [
    'customerCode',
    'controllingEntity',
    'rateControllingEntity',
    'shipperName',
    'shipperEmail',
    'customerName',
    'customerEmail',
  ];

  useEffect(() => {
    onRegisterFields?.(TRACKED_FIELDS);
  }, []);

  useEffect(() => {
    onFieldsChange?.({
      ...form,
      ...customerMoreDetails,
    });
  }, [form, customerMoreDetails]);

  const { isVisible, getToggleValue } = useFeatureToggle();
  const loginClientBean = useAppSelector(selectLoginClientBean);

  const isEuropeOffice = useAppSelector(
    (state) => state.preBooking.isEuropeOffice
  );
  const disableCtrlForWwa = isVisible(
    CommonToggleKeys.OCEAN_CONTROLLING_ENTITY_DISABLE_FOR_WWA_CUSTOMER
  );

  const removeWwaOption = isVisible(
    CommonToggleKeys.BOOKING_REMOVE_WWA_AS_CONTROLLING_ENTITY
  );

  const { data: namedAccountData, refetch: refetchNamedAccount } =
    useGetSelections(
      namedAccountConfig(
        form.customerCode,
        loginClientBean?.companyId ?? '0',
        loginClientBean
      )
    );

  // const mainDetails = useSelector(
  //   (state: RootState) => state.preBooking.mainDetails
  // );

  const ics2Enabled =
    isVisible(CommonToggleKeys.OCN_ICS2_MAIN) &&
    isVisible(CommonToggleKeys.OCN_ICS2_BKG_SHOW_CUSTOMER_EORI_NUMBER_UI);
  const showEori = ics2Enabled && isEuropeOffice;

  useEffect(() => {
    if (form.customerCode) {
      refetchNamedAccount();
    }
  }, [form.customerCode]);

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
    setCustomerSearchOpen(false);
  };

  const copyFromCustomer = (type: 'consignee' | 'notifyParty') => {
    onMoreDetailsChange(`${type}Name`, form.customerName);
    onMoreDetailsChange(`${type}Address`, form.customerAddress);
    onMoreDetailsChange(`${type}Email`, form.customerEmail);
    onMoreDetailsChange(`${type}ContactName`, form.customersContactName);
    onMoreDetailsChange(`${type}Reference`, form.customerReference);
  };

  const isWwaCustomer =
    form.customerCode !== '' &&
    disableCtrlForWwa &&
    customerMoreDetails.wwaCustomer === 'Y';

  const controllingEntityOptions = CONTROLLING_ENTITY_OPTIONS.filter(
    (opt) => !(removeWwaOption && opt.value === 'WWA')
  );

  useEffect(() => {
    if (!form.controllingEntity) {
      onFieldChange('controllingEntity', 'Destination');
    }

    if (!isWwaCustomer && !form.rateControllingEntity) {
      onFieldChange('rateControllingEntity', 'Destination');
    }
  }, [isWwaCustomer]);

  useEffect(() => {
    if (
      moduleType === MODULE_QUO &&
      isVisible(CommonToggleKeys.OCN_IMPORT_QUOTE_ENHANCEMENT)
    ) {
      if (form.customerCode !== '') {
        if (isWwaCustomer) {
          onFieldChange('controllingEntity', 'WWA');
          onFieldChange('rateControllingEntity', 'D');
        } else {
          onFieldChange('controllingEntity', 'D');
          onFieldChange('rateControllingEntity', 'D');
        }
      } else {
        onFieldChange('controllingEntity', '-1');
        onFieldChange('rateControllingEntity', '-1');
      }
    }
  }, [form.customerCode]);

  return (
    <Box className={styles.pageWrapper}>
      <Box className={pbStyles.pbTwoColGrid}>
        <Box>
          <Box className={pbStyles.pbThreeColTopRow}>
            <Box className={pbStyles.pbRelativeWrapper}>
              <PSingleValueSearchableField
                label="Customer Code"
                required
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
                  onCustomerCodeSelect
                    ? onCustomerCodeSelect(item as OrgCodeSuggestionItem)
                    : onFieldChange('customerCode', String(item['code'] ?? ''));

                  // handleAccurateRate({
                  //   rateDetails: { rateProfileCode: accuRateProfile },
                  // });
                }}
                showTooltip={true}
              />
              <img
                src={searchIcon}
                alt="search"
                className={styles.searchIcon}
                onClick={() => setCustomerSearchOpen(true)}
              />
            </Box>

            <PTextField
              fullWidth
              label="AccuRate Profile"
              value={form.accuRateProfile}
              onChange={(e) => onFieldChange('accuRateProfile', e.target.value)}
              disabled
            />

            <Box className={styles.fullWidthBox}>
              <PSelect
                label="Named Account"
                MenuProps={sharedMenuProps}
                disabled={!form.customerCode}
                className={`${styles.selectFormControl} ${pbStyles.pbFullWidthSelect}`}
                labelSx={{ pb: 0 }}
                value={(form as any).namedAccount ?? ''}
                onChange={(val) => onFieldChange('namedAccount', String(val))}
                options={namedAccountData}
              />
            </Box>
          </Box>

          <Box className={pbStyles.pbFieldGroup}>
            <AutoTextarea
              id="customerName"
              value={form.customerName}
              label="Customer Name"
              required
              charPerLine={50}
              totalLines={5}
              onChange={(e) => onFieldChange('customerName', e.target.value)}
              autoSize={false}
              maxLength={254}
              height={'85px'}
            />
          </Box>
          <Box className={pbStyles.pbFieldGroup}>
            <AutoTextarea
              id="customerAddress"
              value={form.customerAddress}
              label="Customer Address"
              charPerLine={50}
              totalLines={3}
              onChange={(e) => onFieldChange('customerAddress', e.target.value)}
              autoSize={false}
              maxLength={152}
              height={'55px'}
            />
          </Box>

          <Box className={pbStyles.pbFieldGroup}>
            <Box>
              <Box className={pbStyles.pbEmailLabelRow}>
                <span className={pbStyles.pbFieldLabel}>Customer Email</span>
                <span className={pbStyles.pbCharCount}>
                  {form.customerEmail.length} character(s)
                </span>
              </Box>
              <PTextField
                fullWidth
                value={form.customerEmail}
                required
                onChange={(e) => onFieldChange('customerEmail', e.target.value)}
                onBlur={() => {
                  validateEmail(form.customerEmail, () =>
                    onFieldChange('customerEmail', '')
                  );
                }}
                type="email"
              />
            </Box>
          </Box>
          <Box className={pbStyles.pbFieldGroup}>
            <Box>
              <PTextField
                fullWidth
                label="Customer's Contact Name"
                value={form.customersContactName}
     
                 maxLength={40}
                onChange={(e) =>
                  onFieldChange('customersContactName', e.target.value)
                }
              />
            </Box>
          </Box>

          <Box className={pbStyles.pbContactEoriRow}>
            <PTextField
              fullWidth
              label="Customer Reference"
              value={form.customerReference}          
               maxLength={80}
              onChange={(e) =>
                onFieldChange('customerReference', e.target.value)
              }
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

          <Box className={pbStyles.pbSectionDivider} />

          <Box className={pbStyles.pbCopyRow}>
            <span className={pbStyles.pbFieldLabel}>Consignee Name</span>
            <ButtonBase
              className={pbStyles.pbCopyLink}
              onClick={() => copyFromCustomer('consignee')}
            >
              Copy From&nbsp;
              <span className={pbStyles.pbCopyLinkUnderline}>Customer</span>
            </ButtonBase>
          </Box>

          <Box className={pbStyles.pbFieldGroup}>
            <AutoTextarea
              id="consigneeName"
              value={customerMoreDetails.consigneeName}
              label=""
              charPerLine={50}
              totalLines={5}
              onChange={(e) =>
                onMoreDetailsChange('consigneeName', e.target.value)
              }
              autoSize={false}
              maxLength={254}
              height={'85px'}
            />
          </Box>

          <Box className={pbStyles.pbFieldGroup}>
            <AutoTextarea
              id="consigneeAddress"
              value={customerMoreDetails.consigneeAddress}
              label="Consignee Address"
              charPerLine={50}
              totalLines={3}
              onChange={(e) =>
                onMoreDetailsChange('consigneeAddress', e.target.value)
              }
              autoSize={false}
              maxLength={152}
              height={'55px'}
            />
          </Box>

          <Box className={pbStyles.pbFieldGroup}>
            <PTextField
              fullWidth
              label="Consignee Email"
              value={customerMoreDetails.consigneeEmail}
              onChange={(e) =>
                onMoreDetailsChange('consigneeEmail', e.target.value)
              }
              onBlur={() => {
                validateEmail(customerMoreDetails.consigneeEmail, () =>
                  onMoreDetailsChange('consigneeEmail', '')
                );
              }}
              type="email"
            />
          </Box>

          <Box className={pbStyles.pbFieldGroup}>
            <PTextField
              fullWidth
              label="Consignee Contact Name"
              maxLength={40}
              value={customerMoreDetails.consigneeContactName}
              onChange={(e) =>
                onMoreDetailsChange('consigneeContactName', e.target.value)
              }
            />
          </Box>

          <Box className={pbStyles.pbRefPhoneRow}>
            <PTextField
              fullWidth
              label="Consignee Reference"
              value={customerMoreDetails.consigneeReference}
              maxLength={80}
              onChange={(e) =>
                onMoreDetailsChange('consigneeReference', e.target.value)
              }
            />
            <PTextField
              fullWidth
              label="Consignee Phone Number"
              value={customerMoreDetails.consigneePhoneNumber}
              maxLength={20}
              onChange={(e) =>
                onMoreDetailsChange('consigneePhoneNumber', e.target.value)
              }
              type="tel"
            />
          </Box>
        </Box>

        <Box>
          <Box className={pbStyles.pbThreeColRow}>
            <Box className={styles.fullWidthBox}>
              <PSelect
                label="Prepaid/Collect"
                value={form.prepaidCollect}
                onChange={(val) => onFieldChange('prepaidCollect', String(val))}
                options={PREPAID_COLLECT_OPTIONS}
                className={`${styles.selectFormControl} ${pbStyles.pbFullWidthSelect}`}
              />
            </Box>

            <Box className={styles.fullWidthBox}>
              <PSelect
                label="Controlling Entity"
                value={isWwaCustomer ? 'WWA' : form.controllingEntity}
                onChange={(val) =>
                  onFieldChange('controllingEntity', String(val))
                }
                options={controllingEntityOptions}
                disabled={isWwaCustomer}
                className={`${styles.selectFormControl} ${pbStyles.pbFullWidthSelect}`}
                required
              />
            </Box>
            <Box className={styles.fullWidthBox}>
              <PSelect
                label="Rate Controlling Entity"
                value={form.rateControllingEntity}
                onChange={(val) =>
                  onFieldChange('rateControllingEntity', String(val))
                }
                options={RATE_CONTROLLING_ENTITY_OPTIONS}
                className={`${styles.selectFormControl} ${pbStyles.pbFullWidthSelect}`}
                required
              />
            </Box>
          </Box>
          <Box className={pbStyles.pbFieldGroup}>
            <AutoTextarea
              id="shipperName"
              value={customerMoreDetails.shipperName}
              label="Shipper Name"
              required
              onChange={(e) =>
                onMoreDetailsChange('shipperName', e.target.value)
              }
              autoSize={false}
              charPerLine={50}
              totalLines={5}
              height={'85px'}
            />
          </Box>

          <Box className={pbStyles.pbFieldGroup}>
            <AutoTextarea
              id="shipperAddress"
              value={customerMoreDetails.shipperAddress}
              label="Shipper Address"
              charPerLine={50}
              totalLines={3}
              onChange={(e) =>
                onMoreDetailsChange('shipperAddress', e.target.value)
              }
              autoSize={false}
              maxLength={152}
              height={'55px'}
            />
          </Box>

          <Box className={pbStyles.pbFieldGroup}>
            <PTextField
              fullWidth
              label="Shipper Email"
              value={customerMoreDetails.shipperEmail}
              onChange={(e) =>
                onMoreDetailsChange('shipperEmail', e.target.value)
              }
              onBlur={() => {
                validateEmail(customerMoreDetails.shipperEmail, () =>
                  onMoreDetailsChange('shipperEmail', '')
                );
              }}
              required
              type="email"
            />
          </Box>

          <Box className={pbStyles.pbFieldGroup}>
            <PTextField
              fullWidth
              label="Shipper Contact Name"
              value={customerMoreDetails.shipperContactName}
              maxLength={40}
              onChange={(e) =>
                onMoreDetailsChange('shipperContactName', e.target.value)
              }
            />
          </Box>

          <Box className={pbStyles.pbContactEoriRow}>
            <PTextField
              fullWidth
              label="Shipper Reference"
              value={customerMoreDetails.shipperReference}
              maxLength={80}
              onChange={(e) =>
                onMoreDetailsChange('shipperReference', e.target.value)
              }
            />
            <PTextField
              fullWidth
              label="Shipper Phone Number"
              value={customerMoreDetails.shipperPhoneNumber}
              maxLength={20}
              onChange={(e) =>
                onMoreDetailsChange('shipperPhoneNumber', e.target.value)
              }
              type="tel"
            />
          </Box>

          <Box className={pbStyles.pbSectionDivider} />

          <Box className={pbStyles.pbCopyRow}>
            <span className={pbStyles.pbFieldLabel}>Notify Party Name</span>
            <ButtonBase
              className={pbStyles.pbCopyLink}
              onClick={() => copyFromCustomer('notifyParty')}
            >
              Copy From&nbsp;
              <span className={pbStyles.pbCopyLinkUnderline}>Customer</span>
            </ButtonBase>
          </Box>

          <Box className={pbStyles.pbFieldGroup}>
            <AutoTextarea
              id="notifyPartyName"
              value={customerMoreDetails.notifyPartyName}
              label=""
              onChange={(e) =>
                onMoreDetailsChange('notifyPartyName', e.target.value)
              }
              charPerLine={50}
              totalLines={5}
              autoSize={false}
              maxLength={254}
              height={'85px'}
            />
          </Box>

          <Box className={pbStyles.pbFieldGroup}>
            <AutoTextarea
              id="notifyPartyAddress"
              value={customerMoreDetails.notifyPartyAddress}
              label="Notify Party Address"
              onChange={(e) =>
                onMoreDetailsChange('notifyPartyAddress', e.target.value)
              }
              autoSize={false}
              charPerLine={50}
              totalLines={5}
              height={'55px'}
            />
          </Box>

          <Box className={pbStyles.pbFieldGroup}>
            <PTextField
              fullWidth
              label="Notify Party Email"
              value={customerMoreDetails.notifyPartyEmail}
              onChange={(e) =>
                onMoreDetailsChange('notifyPartyEmail', e.target.value)
              }
              onBlur={() => {
                validateEmail(customerMoreDetails.notifyPartyEmail, () =>
                  onMoreDetailsChange('notifyPartyEmail', '')
                );
              }}
              type="email"
            />
          </Box>

          <Box className={pbStyles.pbFieldGroup}>
            <PTextField
              fullWidth
              label="Notify Party Contact Name"
              value={customerMoreDetails.notifyPartyContactName}
              maxLength={40}
              onChange={(e) =>
                onMoreDetailsChange('notifyPartyContactName', e.target.value)
              }
            />
          </Box>

          <Box className={pbStyles.pbRefPhoneRow}>
            <PTextField
              fullWidth
              label="Notify Party Reference"
              value={customerMoreDetails.notifyPartyReference}
              maxLength={80}
              onChange={(e) =>
                onMoreDetailsChange('notifyPartyReference', e.target.value)
              }
            />
            <PTextField
              fullWidth
              label="Notify Party Phone Number"
              value={customerMoreDetails.notifyPartyPhoneNumber}
              maxLength={20}
              onChange={(e) =>
                onMoreDetailsChange('notifyPartyPhoneNumber', e.target.value)
              }
              type="tel"
            />
          </Box>
        </Box>
      </Box>

      <PModal
        title="Organization Search"
        open={customerSearchOpen}
        onClose={() => setCustomerSearchOpen(false)}
        height={{ xs: '85vh', md: '31rem' }}
        width={{ xs: '95vw', sm: '95vw', md: 1049 }}
        sx={{ backgroundColor: 'white' }}
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
    </Box>
  );
}
