import { useState } from 'react';
import { Box } from '@mui/material';
import searchIcon from '../../../../assets/images/search-icon.png';
import styles from '../../../../styles/LCL/CustomerDetails.module.css';
import {
  PTextField,
  PSingleValueSearchableField,
  PModal,
  PMultiValueSearchableField,
  AutoTextarea,
  PSelect,
} from 'phoenix-react-lib';
import { useFeatureToggle } from '../../../../hooks/LCL/useFeatureToggle';
import { CommonToggleKeys } from '../../../../core/featureToggles/keys/commonToggleKeys';
import { useGetSuggestions, organizationTrackingCodeSuggestionConfig } from '../../../../hooks/LCL';
import {
  ORG_SEARCH_PROFILES,
  resolveFieldProps,
} from '../OrganizationSearch/organizationSearchConfig';
import {
  CustomerDetailsSuggestions,
  CustomerMoreDetailsForm,
  EoriPortConditions,
  OrgCodeSuggestionItem,
} from '@/types';
import POrganizationSearchPage from '../OrganizationSearch/POrganizationSearchPage';
import { OrganizationResultDetail } from '@/hooks/LCL/OrganizationSerach/organizationSerachService';

type NamedAccountOption = { label: string; value: string };

interface MoreDetailsNamedAccountOptions {
  shipper?: NamedAccountOption[];
  consignee?: NamedAccountOption[];
  forwarder?: NamedAccountOption[];
  notifyParty?: NamedAccountOption[];
}

interface CustomerMoreDetailsProps {
  form: CustomerMoreDetailsForm;
  onFieldChange: (field: keyof CustomerMoreDetailsForm, value: string) => void;
  suggestions?: CustomerDetailsSuggestions;
  portOfDischarge?: string;
  eoriPortConditions?: EoriPortConditions;
  moduleType?: string;
  containerType?: string;
  namedAccountOptions?: MoreDetailsNamedAccountOptions;
  onShipperCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onConsigneeCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onForwarderCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  onNotifyPartyCodeSelect?: (item: OrgCodeSuggestionItem) => void;
  componentType?: string;
  trackingCodeRef?: React.MutableRefObject<HTMLInputElement | null>;
}

const nacMenuProps = {
  disableScrollLock: true,
  PaperProps: {
    className: styles.sharedMenuPaper,
  },
};

export default function CustomerMoredetails({
  form,
  onFieldChange,
  suggestions,
  portOfDischarge = '',
  eoriPortConditions = {},
  moduleType,
  componentType: _componentType,
  namedAccountOptions = {},
  onShipperCodeSelect,
  onConsigneeCodeSelect,
  onForwarderCodeSelect,
  onNotifyPartyCodeSelect,
  trackingCodeRef
}: CustomerMoreDetailsProps) {
  const isQuoteMode = moduleType === 'QUO';
  const [shipperSearchOpen, setShipperSearchOpen] = useState(false);
  const [forwarderSearchOpen, setForwarderSearchOpen] = useState(false);
  const [consigneeSearchOpen, setConsigneeSearchOpen] = useState(false);
  const [notifyPartySearchOpen, setNotifyPartySearchOpen] = useState(false);

  const { isVisible } = useFeatureToggle();
  const showAgentDetails = isVisible(
    CommonToggleKeys.OCEAN_FREIGHT_BOOKING_SHOW_AGENT_DETAILS
  );
  const showNotifyParty = isVisible(
    CommonToggleKeys.OCEAN_BKG_SHOW_NOTIFY_PARTY_DETAILS
  );
  const disableWwaReference = isVisible(
    CommonToggleKeys.OCEAN_EMT_IMT_DISABLE_WWA_REFERENCE
  );
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
    !isQuoteMode &&
    ics2Enabled &&
    !isPortOfLoadInEurope &&
    (isDischargePortInEurope || isFrobCargo || isDestinationInEurope);
  const showFmc =
    !isQuoteMode &&
    isVisible(CommonToggleKeys.OCN_QUOTE_BKG_SHOW_FMC_ORGANIZATION_DETAIL);

  const shipperNacOpts = namedAccountOptions.shipper ?? [];
  const consigneeNacOpts = namedAccountOptions.consignee ?? [];
  const forwarderNacOpts = namedAccountOptions.forwarder ?? [];
  const notifyPartyNacOpts = namedAccountOptions.notifyParty ?? [];

  const showNotifyPartySection = !isQuoteMode && !showAgentDetails && showNotifyParty;

  const { data: trackingCodeSuggestions, setQuery: setTrackingCodeQuery } =
    useGetSuggestions(organizationTrackingCodeSuggestionConfig);

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
      stateId: org.stateId ?? '',
      stateName: org.state ?? '',
      creditHold: '',
      salesRep: org.salesRepresentative ?? '',
      cellPhone: org.cellPhone ?? '',
      eoriNumber: org.eoriNumber ?? '',
      customerType: '',
    };
  };

  const handleShipperCodeSelect = (org: OrganizationResultDetail) => {
    const cusData = mapOrganizationToSuggestion(org);
    if (onShipperCodeSelect) {
      onShipperCodeSelect(cusData);
    } else {
      onFieldChange('shipperCode', org.organizationCode ?? '');
    }
    setShipperSearchOpen(false);
  };

  const handleForwarderCodeSelect = (org: OrganizationResultDetail) => {
    const cusData = mapOrganizationToSuggestion(org);
    if (onForwarderCodeSelect) {
      onForwarderCodeSelect(cusData);
    } else {
      onFieldChange('forwarderCode', org.organizationCode ?? '');
    }
    setForwarderSearchOpen(false);
  };

  const handleConsigneeCodeSelect = (org: OrganizationResultDetail) => {
    const cusData = mapOrganizationToSuggestion(org);
    if (onConsigneeCodeSelect) {
      onConsigneeCodeSelect(cusData);
    } else {
      onFieldChange('consigneeCode', org.organizationCode);
    }
    setConsigneeSearchOpen(false);
  };

  const handleNotifyPartyCodeSelect = (org: OrganizationResultDetail) => {
    const cusData = mapOrganizationToSuggestion(org);
    if (onNotifyPartyCodeSelect) {
      onNotifyPartyCodeSelect(cusData);
    } else {
      onFieldChange('notifyPartyCode', org.organizationCode);
    }
    setNotifyPartySearchOpen(false);
  };

  return (
    <Box className={styles.moreDetailsWrapper}>
      <Box className={styles.twoColGrid}>
        <Box>
          <Box className={styles.customerCodeWrapper}>
            <PSingleValueSearchableField
              label="Shipper Code"
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
              data={suggestions?.moreDetails.shipperCode.data ?? []}
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
              data1={suggestions?.moreDetails.shipperCode.data1 ?? []}
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
              data2={suggestions?.moreDetails.shipperCode.data2 ?? []}
              displayValueField="code"
              value={form.shipperCode}
              onChange={(val) => {
                suggestions?.moreDetails.shipperCode.setQuery(val);
                onFieldChange('shipperCode', val);
              }}
              onSelect={(item) =>
                onShipperCodeSelect
                  ? onShipperCodeSelect(item as OrgCodeSuggestionItem)
                  : onFieldChange('shipperCode', String(item['code'] ?? ''))
              }
              showTooltip={true}
            />
            <img
              src={searchIcon}
              alt="search"
              className={styles.searchIconOnField}
              onClick={() => setShipperSearchOpen(true)}
            />
          </Box>

          {shipperNacOpts.length > 0 && !isQuoteMode && (
            <Box className={`${styles.fieldGroup} ${styles.selectFormControl}`}>
              <PSelect
                label="Named Account"
                value={form.shipperNamedAccount}
                onChange={(val) =>
                  onFieldChange('shipperNamedAccount', String(val))
                }
                options={shipperNacOpts}
                labelSx={{ pb: 0 }}
                MenuProps={nacMenuProps}
              />
            </Box>
          )}

          <Box className={styles.fieldGroup} data-eservice-field="SHIP_NAME">
            <AutoTextarea
              id="shipperName"
              value={form.shipperName}
              label="Shipper Name"
              required={false}
              onChange={(e) => onFieldChange('shipperName', e.target.value)}
              autoSize={false}
              totalLines={5}
              charPerLine={50}
              height={'100px'}
              // minRows={5}
            />
          </Box>

          <Box className={styles.fieldGroup} data-eservice-field="SHIP_ADDRESS">
            <AutoTextarea
              id="shipperAddress"
              value={form.shipperAddress}
              label="Shipper Address"
              required={false}
              onChange={(e) => onFieldChange('shipperAddress', e.target.value)}
              autoSize={false}
              totalLines={3}
              charPerLine={50}
              // minRows={3}
              height={'60px'}
            />
          </Box>

          <Box
            className={`${styles.twoColFieldGroup} ${styles.overflowVisible}`}
          >
            <Box className={styles.fieldTopOffset} data-eservice-field="SHIP_CITY">
              <PTextField
                fullWidth
                label="Shipper City"
                value={form.shipperCity}
                onChange={(e) => onFieldChange('shipperCity', e.target.value)}
                maxLength={20}
              />
            </Box>
            <Box data-eservice-field="SHIP_STATE">
              <PSingleValueSearchableField
                label="Shipper State"
                {...resolveFieldProps(ORG_SEARCH_PROFILES({}).shipper.stateField)}
                data={
                  suggestions?.moreDetails?.shipperState?.data ??
                  resolveFieldProps(ORG_SEARCH_PROFILES({}).shipper.stateField)
                    .data
                }
                value={form.shipperState}
                onChange={(val) => {
                  onFieldChange('shipperState', val);
                  suggestions?.moreDetails?.shipperState?.setQuery(val);
                }}
                onSelect={(item) => {
                  if (suggestions?.moreDetails?.shipperState?.onSelect) {
                    suggestions.moreDetails.shipperState.onSelect(item);
                  } else {
                    onFieldChange('shipperState', String(item['name'] ?? ''));
                  }
                }}
                showTooltip={true}
              />
            </Box>
          </Box>

          <Box className={styles.twoColFieldGroup}>
            <Box className={styles.fieldTopOffset} data-eservice-field="SHIP_ZIP">
              <PTextField
                fullWidth
                label="Shipper Zip Code"
                value={form.shipperZipCode}
                onChange={(e) =>
                  onFieldChange('shipperZipCode', e.target.value)
                }
                maxLength={18}
                // labelSx={{ pb: 0 }}
              />
            </Box>
            <Box data-eservice-field="SHIP_COUNTRY">
              <PSingleValueSearchableField
                label="Shipper Country"
                {...resolveFieldProps(
                  ORG_SEARCH_PROFILES({}).shipper.countryField
                )}
                data={
                  suggestions?.moreDetails?.shipperCountry?.data ??
                  resolveFieldProps(ORG_SEARCH_PROFILES({}).shipper.countryField)
                    .data
                }
                value={form.shipperCountry}
                onChange={(val) => {
                  onFieldChange('shipperCountry', val);
                  suggestions?.moreDetails?.shipperCountry?.setQuery(val);
                }}
                onSelect={(item) => {
                  if (suggestions?.moreDetails?.shipperCountry?.onSelect) {
                    suggestions.moreDetails.shipperCountry.onSelect(item);
                  } else {
                    onFieldChange('shipperCountry', String(item['name'] ?? ''));
                  }
                }}
                showTooltip={true}
              />
            </Box>
          </Box>

          <Box className={styles.twoColFieldGroup}>
            <Box data-eservice-field="SHIP_CONTACT">
              <PTextField
                fullWidth
                label="Shipper Contact Name"
                value={form.shipperContactName}
                onChange={(e) =>
                  onFieldChange('shipperContactName', e.target.value)
                }
              />
            </Box>
            <Box data-eservice-field="SHIP_PHONE">
              <PTextField
                fullWidth
                label="Shipper Phone Number"
                value={form.shipperPhoneNumber}
                onChange={(e) =>
                  onFieldChange('shipperPhoneNumber', e.target.value)
                }
                type="tel"
              />
            </Box>
          </Box>

          <Box className={styles.twoColFieldGroup}>
            <Box data-eservice-field="SHIP_EMAIL">
              <PTextField
                fullWidth
                label="Shipper Email"
                value={form.shipperEmail}
                onChange={(e) => onFieldChange('shipperEmail', e.target.value)}
                type="email"
              />
            </Box>
            <Box data-eservice-field="SHIP_FAX">
              <PTextField
                fullWidth
                label="Shipper Fax"
                value={form.shipperFax}
                onChange={(e) => onFieldChange('shipperFax', e.target.value)}
              />
            </Box>
          </Box>

          <Box
            className={showEori ? styles.twoColFieldGroup : styles.fieldGroup}
          >
            <PTextField
              fullWidth
              label="Shipper Reference"
              value={form.shipperReference}
              onChange={(e) =>
                onFieldChange('shipperReference', e.target.value)
              }
              maxLength={80}
            />
            {showEori && (
              <Box data-eservice-field="SHIP_EORI">
                <PTextField
                  fullWidth
                  label="EORI Number"
                  value={form.shipperEoriNumber}
                  onChange={(e) =>
                    onFieldChange('shipperEoriNumber', e.target.value)
                  }
                />
              </Box>
            )}
          </Box>

          {showFmc && (
            <Box className={styles.fieldGroup}>
              <PTextField
                fullWidth
                label="Shipper FMC Licensed"
                value={form.shipperFmcLicensed}
                onChange={(e) =>
                  onFieldChange('shipperFmcLicensed', e.target.value)
                }
                disabled
              />
            </Box>
          )}

          {!isQuoteMode && (<>
          <Box className={styles.fieldGroupRelative}>
            <PSingleValueSearchableField
              label="Forwarder Code"
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
              data={suggestions?.moreDetails.forwarderCode.data ?? []}
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
              data1={suggestions?.moreDetails.forwarderCode.data1 ?? []}
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
              data2={suggestions?.moreDetails.forwarderCode.data2 ?? []}
              displayValueField="code"
              value={form.forwarderCode}
              onChange={(val) => {
                suggestions?.moreDetails.forwarderCode.setQuery(val);
                onFieldChange('forwarderCode', val);
              }}
              onSelect={(item) =>
                onForwarderCodeSelect
                  ? onForwarderCodeSelect(item as OrgCodeSuggestionItem)
                  : onFieldChange('forwarderCode', String(item['code'] ?? ''))
              }
              showTooltip={true}
            />
            <img
              src={searchIcon}
              alt="search"
              className={styles.searchIconOnField}
              onClick={() => setForwarderSearchOpen(true)}
            />
          </Box>

          {showAgentDetails && forwarderNacOpts.length > 0 && (
            <Box className={`${styles.fieldGroup} ${styles.selectFormControl}`}>
              <PSelect
                label="Named Account"
                value={form.forwarderNamedAccount}
                onChange={(val) =>
                  onFieldChange('forwarderNamedAccount', String(val))
                }
                options={forwarderNacOpts}
                labelSx={{ pb: 0 }}
                MenuProps={nacMenuProps}
              />
            </Box>
          )}

          <Box className={styles.fieldGroup} data-eservice-field="FORW_NAME">
            <AutoTextarea
              id="forwarderName"
              value={form.forwarderName}
              label="Forwarder Name"
              required={false}
              onChange={(e) => onFieldChange('forwarderName', e.target.value)}
              autoSize={false}
              maxLength={254}
              height={'100px'}
              // minRows={5}
            />
          </Box>

          <Box className={styles.fieldGroup} data-eservice-field="FORW_ADDRESS">
            <AutoTextarea
              id="forwarderAddress"
              value={form.forwarderAddress}
              label="Forwarder Address"
              required={false}
              onChange={(e) =>
                onFieldChange('forwarderAddress', e.target.value)
              }
              autoSize={false}
              maxLength={152}
              // minRows={3}
              height={'60px'}
            />
          </Box>

          <Box className={styles.twoColFieldGroup}>
            <Box data-eservice-field="FORW_CITY">
              <PTextField
                fullWidth
                label="Forwarder City"
                value={form.forwarderCity}
                onChange={(e) => onFieldChange('forwarderCity', e.target.value)}
                labelSx={{ pb: 0 }}
              />
            </Box>
            <Box data-eservice-field="FORW_STATE">
              <PSingleValueSearchableField
                label="Forwarder State"
                {...resolveFieldProps(
                  ORG_SEARCH_PROFILES({}).forwarder.stateField
                )}
                data={
                  suggestions?.moreDetails?.forwarderState?.data ??
                  resolveFieldProps(ORG_SEARCH_PROFILES({}).forwarder.stateField)
                    .data
                }
                value={form.forwarderState}
                onChange={(val) => {
                  onFieldChange('forwarderState', val);
                  suggestions?.moreDetails?.forwarderState?.setQuery(val);
                }}
                onSelect={(item) => {
                  if (suggestions?.moreDetails?.forwarderState?.onSelect) {
                    suggestions.moreDetails.forwarderState.onSelect(item);
                  } else {
                    onFieldChange('forwarderState', String(item['name'] ?? ''));
                  }
                }}
                showTooltip={true}
              />
            </Box>
          </Box>

          <Box className={styles.twoColFieldGroup}>
            <Box data-eservice-field="FORW_ZIP">
              <PTextField
                fullWidth
                label="Forwarder Zip Code"
                value={form.forwarderZipCode}
                onChange={(e) =>
                  onFieldChange('forwarderZipCode', e.target.value)
                }
                labelSx={{ pb: 0 }}
              />
            </Box>
            <Box data-eservice-field="FORW_COUNTRY">
              <PSingleValueSearchableField
                label="Forwarder Country"
                {...resolveFieldProps(
                  ORG_SEARCH_PROFILES({}).forwarder.countryField
                )}
                data={
                  suggestions?.moreDetails?.forwarderCountry?.data ??
                  resolveFieldProps(ORG_SEARCH_PROFILES({}).forwarder.countryField)
                    .data
                }
                value={form.forwarderCountry}
                onChange={(val) => {
                  onFieldChange('forwarderCountry', val);
                  suggestions?.moreDetails?.forwarderCountry?.setQuery(val);
                }}
                onSelect={(item) => {
                  if (suggestions?.moreDetails?.forwarderCountry?.onSelect) {
                    suggestions.moreDetails.forwarderCountry.onSelect(item);
                  } else {
                    onFieldChange('forwarderCountry', String(item['name'] ?? ''));
                  }
                }}
                showTooltip={true}
              />
            </Box>
          </Box>

          <Box className={styles.twoColFieldGroup}>
            <Box data-eservice-field="FORW_CONTACT">
              <PTextField
                fullWidth
                label="Forwarder Contact Name"
                value={form.forwarderContactName}
                onChange={(e) =>
                  onFieldChange('forwarderContactName', e.target.value)
                }
                // labelSx={{ pb: 0 }}
              />
            </Box>
            <Box data-eservice-field="FORW_PHONE">
              <PTextField
                fullWidth
                label="Forwarder Phone Number"
                value={form.forwarderPhoneNumber}
                onChange={(e) =>
                  onFieldChange('forwarderPhoneNumber', e.target.value)
                }
                type="tel"
                labelSx={{ pb: 0 }}
              />
            </Box>
          </Box>

          <Box className={styles.twoColFieldGroup}>
            <Box data-eservice-field="FORW_EMAIL">
              <PTextField
                fullWidth
                label="Forwarder Email"
                value={form.forwarderEmail}
                onChange={(e) => onFieldChange('forwarderEmail', e.target.value)}
                type="email"
                labelSx={{ pb: 0 }}
              />
            </Box>
            <Box data-eservice-field="FORW_FAX">
              <PTextField
                fullWidth
                label="Forwarder Fax"
                value={form.forwarderFax}
                onChange={(e) => onFieldChange('forwarderFax', e.target.value)}
                labelSx={{ pb: 0 }}
              />
            </Box>
          </Box>

          <Box
            className={showEori ? styles.twoColFieldGroup : styles.fieldGroup}
          >
            <PTextField
              fullWidth
              label="Forwarder Reference"
              value={form.forwarderReference}
              onChange={(e) =>
                onFieldChange('forwarderReference', e.target.value)
              }
              labelSx={{ pb: 0 }}
            />
            {showEori && (
              <Box data-eservice-field="FORW_EORI">
                <PTextField
                  fullWidth
                  label="EORI Number"
                  value={form.forwarderEoriNumber}
                  onChange={(e) =>
                    onFieldChange('forwarderEoriNumber', e.target.value)
                  }
                  labelSx={{ pb: 0 }}
                />
              </Box>
            )}
          </Box>

          {showFmc && (
            <Box className={styles.fieldGroup}>
              <PTextField
                fullWidth
                label="Forwarder FMC Licensed"
                value={form.forwarderFmcLicensed}
                onChange={(e) =>
                  onFieldChange('forwarderFmcLicensed', e.target.value)
                }
                labelSx={{ pb: 0 }}
                disabled
              />
            </Box>
          )}
          </>)}

          <Box className={styles.fieldGroup}>
            <PTextField
              fullWidth
              label="Purchase Order"
              value={form.purchaseOrder}
              onChange={(e) => onFieldChange('purchaseOrder', e.target.value)}
              labelSx={{ pb: 0 }}
              inputProps={{ maxLength: 20 }}
              // sx={{top:'5px'}}
              maxLength={20}
            />
          </Box>
        </Box>

        <Box>
          <Box className={styles.customerCodeWrapper}>
            <PSingleValueSearchableField
              label="Consignee Code"
              labelSx={{
                pb: 0,
                fontSize: '12px',
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
              data={suggestions?.moreDetails.consigneeCode.data ?? []}
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
              data1={suggestions?.moreDetails.consigneeCode.data1 ?? []}
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
              data2={suggestions?.moreDetails.consigneeCode.data2 ?? []}
              displayValueField="code"
              value={form.consigneeCode}
              onChange={(val) => {
                suggestions?.moreDetails.consigneeCode.setQuery(val);
                onFieldChange('consigneeCode', val);
              }}
              onSelect={(item) =>
                onConsigneeCodeSelect
                  ? onConsigneeCodeSelect(item as OrgCodeSuggestionItem)
                  : onFieldChange('consigneeCode', String(item['code'] ?? ''))
              }
              showTooltip={true}
            />
            <img
              src={searchIcon}
              alt="search"
              className={styles.searchIconOnField}
              onClick={() => setConsigneeSearchOpen(true)}
            />
          </Box>

          {consigneeNacOpts.length > 0 && !isQuoteMode && (
            <Box className={`${styles.fieldGroup} ${styles.selectFormControl}`}>
              <PSelect
                label="Named Account"
                value={form.consigneeNamedAccount}
                onChange={(val) =>
                  onFieldChange('consigneeNamedAccount', String(val))
                }
                options={consigneeNacOpts}
                labelSx={{ pb: 0 }}
                MenuProps={nacMenuProps}
              />
            </Box>
          )}

          <Box className={styles.fieldGroup} data-eservice-field="CONS_NAME">
            <AutoTextarea
              id="consigneeName"
              value={form.consigneeName}
              label="Consignee Name"
              required={false}
              onChange={(e) => onFieldChange('consigneeName', e.target.value)}
              autoSize={false}
              totalLines={5}
              charPerLine={50}
              height={'100px'}
              // minRows={5}
            />
          </Box>

          <Box className={styles.fieldGroup} data-eservice-field="CONS_ADDRESS">
            <AutoTextarea
              id="consigneeAddress"
              value={form.consigneeAddress}
              label="Consignee Address"
              required={false}
              onChange={(e) =>
                onFieldChange('consigneeAddress', e.target.value)
              }
              autoSize={false}
              totalLines={3}
              charPerLine={50}
              // minRows={3}
              height={'60px'}
            />
          </Box>

          <Box className={styles.twoColFieldGroup}>
            <Box className={styles.fieldTopOffset} data-eservice-field="CONS_CITY">
              <PTextField
                fullWidth
                label="Consignee City"
                value={form.consigneeCity}
                onChange={(e) => onFieldChange('consigneeCity', e.target.value)}
                labelSx={{ pb: 0 }}
                maxLength={20}
              />
            </Box>
            <Box data-eservice-field="CONS_STATE">
              <PSingleValueSearchableField
                label="Consignee State"
                {...resolveFieldProps(
                  ORG_SEARCH_PROFILES({}).consignee.stateField
                )}
                data={
                  suggestions?.moreDetails?.consigneeState?.data ??
                  resolveFieldProps(ORG_SEARCH_PROFILES({}).consignee.stateField)
                    .data
                }
                value={form.consigneeState}
                onChange={(val) => {
                  onFieldChange('consigneeState', val);
                  suggestions?.moreDetails?.consigneeState?.setQuery(val);
                }}
                onSelect={(item) => {
                  if (suggestions?.moreDetails?.consigneeState?.onSelect) {
                    suggestions.moreDetails.consigneeState.onSelect(item);
                  } else {
                    onFieldChange('consigneeState', String(item['name'] ?? ''));
                  }
                }}
                showTooltip={true}
              />
            </Box>
          </Box>

          <Box className={styles.twoColFieldGroup}>
            <Box className={styles.fieldTopOffset} data-eservice-field="CONS_ZIP">
              <PTextField
                fullWidth
                label="Consignee Zip Code"
                value={form.consigneeZipCode}
                onChange={(e) =>
                  onFieldChange('consigneeZipCode', e.target.value)
                }
                // labelSx={{ pb: 0 }}
                maxLength={18}
              />
            </Box>
            <Box data-eservice-field="CONS_COUNTRY">
              <PSingleValueSearchableField
                label="Consignee Country"
                labelSx={{
                  pb: 0,
                  fontSize: '14px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  color: '#333',
                }}
                {...resolveFieldProps(
                  ORG_SEARCH_PROFILES({}).consignee.countryField
                )}
                data={
                  suggestions?.moreDetails?.consigneeCountry?.data ??
                  resolveFieldProps(ORG_SEARCH_PROFILES({}).consignee.countryField)
                    .data
                }
                value={form.consigneeCountry}
                onChange={(val) => {
                  onFieldChange('consigneeCountry', val);
                  suggestions?.moreDetails?.consigneeCountry?.setQuery(val);
                }}
                onSelect={(item) => {
                  if (suggestions?.moreDetails?.consigneeCountry?.onSelect) {
                    suggestions.moreDetails.consigneeCountry.onSelect(item);
                  } else {
                    onFieldChange('consigneeCountry', String(item['name'] ?? ''));
                  }
                }}
                showTooltip={true}
              />
            </Box>
          </Box>

          <Box className={styles.twoColFieldGroup}>
            <Box data-eservice-field="CONS_CONTACT">
              <PTextField
                fullWidth
                label="Consignee Contact Name"
                value={form.consigneeContactName}
                onChange={(e) =>
                  onFieldChange('consigneeContactName', e.target.value)
                }
                labelSx={{ pb: 0 }}
              />
            </Box>
            <Box data-eservice-field="CONS_PHONE">
              <PTextField
                fullWidth
                label="Consignee Phone Number"
                value={form.consigneePhoneNumber}
                onChange={(e) =>
                  onFieldChange('consigneePhoneNumber', e.target.value)
                }
                type="tel"
                labelSx={{ pb: 0 }}
              />
            </Box>
          </Box>

          <Box className={styles.twoColFieldGroup}>
            <Box data-eservice-field="CONS_EMAIL">
              <PTextField
                fullWidth
                label="Consignee Email"
                value={form.consigneeEmail}
                onChange={(e) => onFieldChange('consigneeEmail', e.target.value)}
                type="email"
                labelSx={{ pb: 0 }}
              />
            </Box>
            <Box data-eservice-field="CONS_FAX">
              <PTextField
                fullWidth
                label="Consignee Fax"
                value={form.consigneeFax}
                onChange={(e) => onFieldChange('consigneeFax', e.target.value)}
                labelSx={{ pb: 0 }}
              />
            </Box>
          </Box>

          <Box
            className={showEori ? styles.twoColFieldGroup : styles.fieldGroup}
          >
            <PTextField
              fullWidth
              label="Consignee Reference"
              value={form.consigneeReference}
              onChange={(e) =>
                onFieldChange('consigneeReference', e.target.value)
              }
              labelSx={{ pb: 0 }}
              maxLength={80}
            />
            {showEori && (
              <Box data-eservice-field="CONS_EORI">
                <PTextField
                  fullWidth
                  label="EORI Number"
                  value={form.consigneeEoriNumber}
                  onChange={(e) =>
                    onFieldChange('consigneeEoriNumber', e.target.value)
                  }
                  labelSx={{ pb: 0 }}
                />
              </Box>
            )}
          </Box>

          {showFmc && (
            <Box className={styles.fieldGroup}>
              <PTextField
                fullWidth
                label="Consignee FMC Licensed"
                value={form.consigneeFmcLicensed}
                onChange={(e) =>
                  onFieldChange('consigneeFmcLicensed', e.target.value)
                }
                labelSx={{ pb: 0 }}
                disabled
              />
            </Box>
          )}

          {showNotifyPartySection && (
            <>
              <Box className={styles.customerCodeWrapper}>
                <PSingleValueSearchableField
                  label="Notify Party Code"
                  labelSx={{
                    pb: 0,
                    fontSize: '12px',
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
                  data={suggestions?.moreDetails.notifyPartyCode.data ?? []}
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
                  data1={suggestions?.moreDetails.notifyPartyCode.data1 ?? []}
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
                  data2={suggestions?.moreDetails.notifyPartyCode.data2 ?? []}
                  displayValueField="code"
                  value={form.notifyPartyCode}
                  onChange={(val) => {
                    suggestions?.moreDetails.notifyPartyCode.setQuery(val);
                    onFieldChange('notifyPartyCode', val);
                  }}
                  onSelect={(item) =>
                    onNotifyPartyCodeSelect
                      ? onNotifyPartyCodeSelect(item as OrgCodeSuggestionItem)
                      : onFieldChange(
                          'notifyPartyCode',
                          String(item['code'] ?? '')
                        )
                  }
                  showTooltip={true}
                />
                <img
                  src={searchIcon}
                  alt="search"
                  className={styles.searchIconOnField}
                  onClick={() => setNotifyPartySearchOpen(true)}
                />
              </Box>

              {notifyPartyNacOpts.length > 0 && (
                <Box
                  className={`${styles.fieldGroup} ${styles.selectFormControl}`}
                >
                  <PSelect
                    label="Named Account"
                    value={form.notifyPartyNamedAccount}
                    onChange={(val) =>
                      onFieldChange('notifyPartyNamedAccount', String(val))
                    }
                    options={notifyPartyNacOpts}
                    labelSx={{ pb: 0 }}
                    MenuProps={nacMenuProps}
                  />
                </Box>
              )}

              <Box className={styles.fieldGroup} data-eservice-field="NOTI_NAME">
                <AutoTextarea
                  id="notifyPartyName"
                  value={form.notifyPartyName}
                  label="Notify Party Name"
                  required={false}
                  onChange={(e) =>
                    onFieldChange('notifyPartyName', e.target.value)
                  }
                  autoSize={false}
                  maxLength={254}
                  height={'100px'}
                />
              </Box>

              <Box className={styles.fieldGroup} data-eservice-field="NOTI_ADDRESS">
                <AutoTextarea
                  id="notifyPartyAddress"
                  value={form.notifyPartyAddress}
                  label="Notify Party Address"
                  required={false}
                  onChange={(e) =>
                    onFieldChange('notifyPartyAddress', e.target.value)
                  }
                  autoSize={false}
                  maxLength={152}
                  height={'60px'}
                />
              </Box>

              <Box className={styles.twoColFieldGroup}>
                <Box className={styles.fieldTopOffset} data-eservice-field="NOTI_CITY">
                  <PTextField
                    fullWidth
                    label="Notify Party City"
                    value={form.notifyPartyCity}
                    onChange={(e) =>
                      onFieldChange('notifyPartyCity', e.target.value)
                    }
                  />
                </Box>
                <Box data-eservice-field="NOTI_STATE">
                  <PSingleValueSearchableField
                    label="Notify Party State"
                    {...resolveFieldProps(
                      ORG_SEARCH_PROFILES({}).notifyParty.stateField
                    )}
                    data={
                      suggestions?.moreDetails?.notifyPartyState?.data ??
                      resolveFieldProps(
                        ORG_SEARCH_PROFILES({}).notifyParty.stateField
                      ).data
                    }
                    value={form.notifyPartyState}
                    onChange={(val) => {
                      onFieldChange('notifyPartyState', val);
                      suggestions?.moreDetails?.notifyPartyState?.setQuery(val);
                    }}
                    onSelect={(item) => {
                      if (suggestions?.moreDetails?.notifyPartyState?.onSelect) {
                        suggestions.moreDetails.notifyPartyState.onSelect(item);
                      } else {
                        onFieldChange(
                          'notifyPartyState',
                          String(item['name'] ?? '')
                        );
                      }
                    }}
                    showTooltip={true}
                  />
                </Box>
              </Box>

              <Box className={styles.twoColFieldGroup}>
                <Box className={styles.fieldTopOffset} data-eservice-field="NOTI_ZIP">
                  <PTextField
                    fullWidth
                    label="Notify Party Zip Code"
                    value={form.notifyPartyZipCode}
                    onChange={(e) =>
                      onFieldChange('notifyPartyZipCode', e.target.value)
                    }
                    labelSx={{ pb: 0 }}
                  />
                </Box>
                <Box data-eservice-field="NOTI_COUNTRY">
                  <PSingleValueSearchableField
                    label="Notify Party Country"
                    {...resolveFieldProps(
                      ORG_SEARCH_PROFILES({}).notifyParty.countryField
                    )}
                    data={
                      suggestions?.moreDetails?.notifyPartyCountry?.data ??
                      resolveFieldProps(
                        ORG_SEARCH_PROFILES({}).notifyParty.countryField
                      ).data
                    }
                    value={form.notifyPartyCountry}
                    onChange={(val) => {
                      onFieldChange('notifyPartyCountry', val);
                      suggestions?.moreDetails?.notifyPartyCountry?.setQuery(val);
                    }}
                    onSelect={(item) => {
                      if (
                        suggestions?.moreDetails?.notifyPartyCountry?.onSelect
                      ) {
                        suggestions.moreDetails.notifyPartyCountry.onSelect(item);
                      } else {
                        onFieldChange(
                          'notifyPartyCountry',
                          String(item['name'] ?? '')
                        );
                      }
                    }}
                    showTooltip={true}
                  />
                </Box>
              </Box>

              <Box className={styles.twoColFieldGroup}>
                <Box data-eservice-field="NOTI_CONTACT">
                  <PTextField
                    fullWidth
                    label="Notify Party Contact Name"
                    value={form.notifyPartyContactName}
                    onChange={(e) =>
                      onFieldChange('notifyPartyContactName', e.target.value)
                    }
                  />
                </Box>
                <Box data-eservice-field="NOTI_PHONE">
                  <PTextField
                    fullWidth
                    label="Notify Party Phone Number"
                    value={form.notifyPartyPhoneNumber}
                    onChange={(e) =>
                      onFieldChange('notifyPartyPhoneNumber', e.target.value)
                    }
                    type="tel"
                  />
                </Box>
              </Box>

              <Box className={styles.twoColFieldGroup}>
                <Box data-eservice-field="NOTI_EMAIL">
                  <PTextField
                    fullWidth
                    label="Notify Party Email"
                    value={form.notifyPartyEmail}
                    onChange={(e) =>
                      onFieldChange('notifyPartyEmail', e.target.value)
                    }
                    type="email"
                  />
                </Box>
                <Box data-eservice-field="NOTI_FAX">
                  <PTextField
                    fullWidth
                    label="Notify Party Fax"
                    value={form.notifyPartyFax}
                    onChange={(e) =>
                      onFieldChange('notifyPartyFax', e.target.value)
                    }
                  />
                </Box>
              </Box>

              <Box
                className={
                  showEori ? styles.twoColFieldGroup : styles.fieldGroup
                }
              >
                <PTextField
                  fullWidth
                  label="Notify Party Reference"
                  value={form.notifyPartyReference}
                  onChange={(e) =>
                    onFieldChange('notifyPartyReference', e.target.value)
                  }
                />
                {showEori && (
                  <Box data-eservice-field="NOTI_EORI">
                    <PTextField
                      fullWidth
                      label="EORI Number"
                      value={form.notifyPartyEoriNumber}
                      onChange={(e) =>
                        onFieldChange('notifyPartyEoriNumber', e.target.value)
                      }
                      labelSx={{ pb: 0 }}
                    />
                  </Box>
                )}
              </Box>

              {showFmc && (
                <Box className={styles.fieldGroup}>
                  <PTextField
                    fullWidth
                    label="Notify Party FMC Licensed"
                    value={form.notifyPartyFmcLicensed}
                    onChange={(e) =>
                      onFieldChange('notifyPartyFmcLicensed', e.target.value)
                    }
                    disabled
                  />
                </Box>
              )}
            </>
          )}

          <Box className={styles.twoColFieldGroup}>
            <PMultiValueSearchableField
              label="Tracking Code"
              id="trackingCode"
              data={trackingCodeSuggestions}
              columnHeaders={['Code', 'Name']}
              displayFields={['code', 'name']}
              displayValueField="code"
              maxSelectionAllowed={2}
              showTooltip={true}
              initialSelectedItems={
                form.trackingCode
                ? form.trackingCode.split('-').filter(Boolean).map((code) => ({
                  code,
                  name: code,
                }))
                : []
              }
              onSearch={(val: string) => setTrackingCodeQuery(val)}
              onSelect={(item) => {
                const currentCodes = form.trackingCode
                ? form.trackingCode.split('-').filter(Boolean)
                : [];
                const selectedCode = String(item['code'] ?? '');
                if (selectedCode && !currentCodes.includes(selectedCode)) {
                  onFieldChange('trackingCode', [...currentCodes, selectedCode].join('-'));
                }
              }}
              onRemove={(removedItem) => {
                const currentCodes = form.trackingCode
                ? form.trackingCode.split('-').filter(Boolean)
                : [];
                onFieldChange(
                  'trackingCode',
                  currentCodes.filter((c) => c !== String(removedItem['code'] ?? '')).join('-')
                );
              }}
              inputRef={trackingCodeRef}
              />
            <PTextField
              fullWidth
              label="WWA Reference"
              value={form.wwaReference}
              onChange={(e) => onFieldChange('wwaReference', e.target.value)}
              disabled={disableWwaReference}
              maxLength={30}
            />
          </Box>
        </Box>
      </Box>

      <PModal
        title="Organization Search"
        open={shipperSearchOpen}
        onClose={() => setShipperSearchOpen(false)}
        height={{ xs: '85vh', md: '31rem' }}
        width={{ xs: '95vw', sm: '95vw', md: 1049 }}
        backgroundColor="white"
        contentSx={{ pl: 0 }}
      >
        <Box className={styles.orgSearchContent}>
          <POrganizationSearchPage
            configKey="shipper"
            onSelect={handleShipperCodeSelect}
            moduleType={moduleType}
          />
        </Box>
      </PModal>

      <PModal
        title="Organization Search"
        open={forwarderSearchOpen}
        onClose={() => setForwarderSearchOpen(false)}
        height={{ xs: '85vh', md: '31rem' }}
        width={{ xs: '95vw', sm: '95vw', md: 1049 }}
        backgroundColor="white"
        contentSx={{ pl: 0 }}
      >
        <Box className={styles.orgSearchContent}>
          <POrganizationSearchPage
            configKey="forwarder"
            onSelect={handleForwarderCodeSelect}
            moduleType={moduleType}
          />
        </Box>
      </PModal>

      <PModal
        title="Organization Search"
        open={consigneeSearchOpen}
        onClose={() => setConsigneeSearchOpen(false)}
        height={{ xs: '85vh', md: '31rem' }}
        width={{ xs: '95vw', sm: '95vw', md: 1049 }}
        backgroundColor="white"
        contentSx={{ pl: 0 }}
      >
        <Box className={styles.orgSearchContent}>
          <POrganizationSearchPage
            configKey="consignee"
            onSelect={handleConsigneeCodeSelect}
            moduleType={moduleType}
          />
        </Box>
      </PModal>

      <PModal
        title="Organization Search"
        open={notifyPartySearchOpen}
        onClose={() => setNotifyPartySearchOpen(false)}
        height={{ xs: '85vh', md: '31rem' }}
        width={{ xs: '95vw', sm: '95vw', md: 1049 }}
        backgroundColor="white"
        contentSx={{ pl: 0 }}
      >
        <Box className={styles.orgSearchContent}>
          <POrganizationSearchPage
            configKey="notifyParty"
            onSelect={handleNotifyPartyCodeSelect}
            moduleType={moduleType}
          />
        </Box>
      </PModal>
    </Box>
  );
}
