import { useState } from 'react';
import { Box, ButtonBase, Collapse } from '@mui/material';

import searchIcon from '../../../../assets/images/search-icon.png';
import styles from '../../../../styles/LCL/CustomerDetails.module.css';

import {
  PModal,
  PTextField,
  PSelect,
  PSingleValueSearchableField,
  AutoTextarea,
} from 'phoenix-react-lib';

import CustomerMoredetails from './CustomerMoredetails';
import POrganizationSearchPage from '../OrganizationSearch/POrganizationSearchPage';
import {
  CustomerDetailsSuggestions,
  CustomerFormData,
  CustomerMoreDetailsForm,
  OrgCodeSuggestionItem,
} from '@/types';
import {
  COUNTRY_FIELD_CONFIG,
  ORG_SEARCH_PROFILES,
  resolveFieldProps,
} from '../OrganizationSearch/organizationSearchConfig';
import { OrganizationResultDetail } from './../../../../hooks/LCL/OrganizationSerach/organizationSerachService';

interface CustomerInitialPageProps {
  form: CustomerFormData;
  onFieldChange: (field: keyof CustomerFormData, value: string) => void;
  customerMoreDetails: CustomerMoreDetailsForm;
  onMoreDetailsChange: (
    field: keyof CustomerMoreDetailsForm,
    value: string
  ) => void;
  suggestions?: CustomerDetailsSuggestions;
  onCustomerCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onShipperCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onConsigneeCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onForwarderCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onNotifyPartyCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  rateDetails: any;
  accuRateProfile?: string;
  moduleType?: string;
}

const CUSTOMER_TYPE_OPTIONS = [
  { label: 'Please Select', value: '' },
  { label: 'Forwarder', value: 'F' },
  { label: 'Direct Customer', value: 'D' },
];

const sharedMenuProps = {
  disableScrollLock: true,
  PaperProps: {
    className: styles.sharedMenuPaper,
  },
};

export default function CustomerInitialPage({
  form,
  onFieldChange,
  customerMoreDetails,
  onMoreDetailsChange,
  suggestions,
  onCustomerCodeSelect,
  onShipperCodeSelect,
  onConsigneeCodeSelect,
  onForwarderCodeSelect,
  onNotifyPartyCodeSelect,
  rateDetails,
  accuRateProfile = '',
  moduleType,
}: CustomerInitialPageProps) {
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [openSearch, setOpenSearch] = useState(false);

  const handleToggleMoreDetails = () => setShowMoreDetails((prev) => !prev);

  const { handleAccurateRate } = rateDetails?.accurateRate ?? {};

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
    setOpenSearch(false);
  };

  return (
    <Box className={styles.pageWrapper}>
      <Box className={styles.twoColGrid}>
        <Box>
          <Box className={styles.customerCodeWrapper}>
            <PSingleValueSearchableField
              label="Customer Code"
              labelSx={{
                pb: 0,
                fontSize: '14px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                color: '#333',
              }}
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

                handleAccurateRate({
                  rateDetails: { rateProfileCode: accuRateProfile },
                });
              }}
              showTooltip={true}
              className={styles.inputField}
            />
            <img
              src={searchIcon}
              alt="search"
              className={styles.searchIconOnField}
              onClick={() => setOpenSearch(true)}
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <AutoTextarea
              id="customerName"
              value={form.customerName}
              label="Customer Name"
              required={true}
              onChange={(e) => onFieldChange('customerName', e.target.value)}
              autoSize={false}
              maxLength={254}
              height={'100px'}
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <AutoTextarea
              id="customerAddress"
              value={form.customerAddress}
              label="Customer Address"
              required={true}
              onChange={(e) => onFieldChange('customerAddress', e.target.value)}
              autoSize={false}
              maxLength={152}
              height={'60px'}
            />
          </Box>

          <Box className={styles.twoColFieldGroup}>
            <PTextField
              fullWidth
              label="Customer City"
              value={form.customerCity}
              onChange={(e) => onFieldChange('customerCity', e.target.value)}
            />
            <PSingleValueSearchableField
              label="Customer State"
              labelSx={{
                pb: 0,
                fontSize: '14px',
                fontFamily: 'Arial, Helvetica, sans-serif',
                color: '#333',
              }}
              {...resolveFieldProps(ORG_SEARCH_PROFILES({}).customer.stateField)}
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
              className={styles.inputField}
            />
          </Box>

          <Box className={styles.twoColFieldGroup}>
            <PTextField
              fullWidth
              label="Customer Zip Code"
              value={form.customerZipCode}
              onChange={(e) => onFieldChange('customerZipCode', e.target.value)}
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
              className={styles.inputField}
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <PTextField
              label="Customer Fax"
              value={form.customerFax}
              onChange={(e) => onFieldChange('customerFax', e.target.value)}
              className={styles.halfWidthField}
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <Box className={styles.fullWidthBox}>
              <PSelect
                label="Customer Type"
                value={form.customerType}
                onChange={(val) => onFieldChange('customerType', String(val))}
                options={CUSTOMER_TYPE_OPTIONS}
                MenuProps={sharedMenuProps}
                className={`${styles.quarterWidthSelect} ${styles.selectFormControl}`}
              />
            </Box>
          </Box>
        </Box>

        <Box>
          <Box className={styles.fieldGroup}>
            <PTextField
              fullWidth
              label="Customer's Contact Name"
              value={form.customersContactName}
              onChange={(e) =>
                onFieldChange('customersContactName', e.target.value)
              }
              labelSx={{ pb: 0 }}
            />
          </Box>

          <Box className={styles.threeColFieldGroup}>
            <PTextField
              fullWidth
              label="Sales Representative"
              value={form.salesRepresentative}
              onChange={(e) =>
                onFieldChange('salesRepresentative', e.target.value)
              }
              labelSx={{ pb: 0 }}
              disabled
            />
            <PTextField
              fullWidth
              label="Telephone Number"
              value={form.telephoneNumber}
              onChange={(e) => onFieldChange('telephoneNumber', e.target.value)}
              type="tel"
              labelSx={{ pb: 0 }}
            />
            <PTextField
              fullWidth
              label="Mobile Number"
              value={form.mobileNumber}
              onChange={(e) => onFieldChange('mobileNumber', e.target.value)}
              type="tel"
              labelSx={{ pb: 0 }}
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <Box className={styles.emailLabelRow}>
              <span
                className={`${styles.fieldLabel}`}
              >
                Customer Email
              </span>
              <span className={styles.charCount}>
                {form.customerEmail?.length ?? 0} character(s)
              </span>
            </Box>
            <PTextField
              fullWidth
              value={form.customerEmail}
              onChange={(e) => onFieldChange('customerEmail', e.target.value)}
              type="email"
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <PTextField
              fullWidth
              label="Customer Reference"
              value={form.customerReference}
              onChange={(e) =>
                onFieldChange('customerReference', e.target.value)
              }
              labelSx={{ pb: 0 }}
            />
          </Box>

          <Box className={styles.fieldGroup}>
            <PTextField
              label="Truck Sell Rate Profile"
              value={form.truckSellRateProfile}
              onChange={(e) =>
                onFieldChange('truckSellRateProfile', e.target.value)
              }
              className={styles.sixtyWidthField}
              labelSx={{ pb: 0 }}
            />
          </Box>
        </Box>
      </Box>

      <Box className={styles.moreDetailsToggleWrapper}>
        <ButtonBase
          aria-expanded={showMoreDetails}
          aria-controls="customer-initial-more-details"
          onClick={handleToggleMoreDetails}
          className={styles.moreDetailsToggleBtn}
        >
          <Box
            component="span"
            className={`${styles.arrowIcon}${showMoreDetails ? ` ${styles.arrowIconOpen}` : ''}`}
          />
          <span className={styles.moreDetailsLabel}>More Details</span>
        </ButtonBase>
      </Box>

      <Collapse in={showMoreDetails} id="customer-initial-more-details">
        <CustomerMoredetails
          form={customerMoreDetails}
          onFieldChange={onMoreDetailsChange}
          suggestions={suggestions}
          onShipperCodeSelect={onShipperCodeSelect}
          onConsigneeCodeSelect={onConsigneeCodeSelect}
          onForwarderCodeSelect={onForwarderCodeSelect}
          onNotifyPartyCodeSelect={onNotifyPartyCodeSelect}
          moduleType={moduleType}
        />
      </Collapse>

      <PModal
        title="Organization Search"
        open={openSearch}
        isCloseIcon
        onClose={() => setOpenSearch(false)}
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
    </Box>
  );
}
