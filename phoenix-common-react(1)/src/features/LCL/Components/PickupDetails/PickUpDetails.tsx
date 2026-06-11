import { Box } from '@mui/material';
import React from 'react';

import PickupAccessories from './PickupAccessories';
import {
  PDatePicker,
  PModal,
  PSingleValueSearchableField,
  PTextField,
} from 'phoenix-react-lib';
import searchIcon from '@/assets/images/search-icon.png';
import styles from '../../../../styles/LCL/PickupDetails.module.css';
import { PickupDetailsProps } from '@/types/LCL/routing/RoutingDetails.types';
import POrganizationSearchPage from '../OrganizationSearch/POrganizationSearchPage';
import {
  pickupCargoAtcodeSuggestionConfig,
  useGetSuggestions,
  countrySuggestionConfig,
  buildStateSuggestionConfig,
  SearchByPostalCodeCityConfig,
  useFeatureToggle,
} from '../../../../hooks/LCL';
import {
  ORG_SEARCH_PROFILES,
  resolveFieldProps,
} from '../OrganizationSearch/organizationSearchConfig';
import { CommonToggleKeys } from '../../../../core/featureToggles/featureToggle.types';
import { useAppSelector } from '../../../../app/store/hooks';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';
import { useEffect, useState } from 'react';

const PickUpDetails: React.FC<PickupDetailsProps> = ({
  index: _index,
  formData,
  onFormDataChange,
  orgSearchOpen = false,
  onOrgSearchOpen,
  onOrgSearchClose,
  onAccessorialsChange,
  accessorialOptions,
  doorAccessorialOptions,
  pickupValidationMessage,
  setPickupValidationMessage,
}) => {
  const selectedCountryCode = formData.pickupCountry?.split(' - ')[0] ?? '';
  const { isVisible } = useFeatureToggle();
  const loginBean = useAppSelector(selectLoginClientBean);
  const defaultCountry = `${loginBean?.countryCode}-${loginBean?.country}`;
  const [isTouched, setIsTouched] = useState(false);

  const handlePickupCargoAtCodeSelect = React.useCallback(
    (item: Record<string, unknown>) => {
      const raw = item['SUGGEST_VALUE'];
      const values: string[] = Array.isArray(raw) ? (raw as string[]) : [];
      const get = (idx: number): string =>
        (values[idx] as string | undefined) ?? '';

      onFormDataChange('pickupCargoAtCode', String(item['code'] ?? ''));
      onFormDataChange('name', get(0));
      onFormDataChange(
        'streetAddress',
        [get(2), get(3)].filter(Boolean).join('\n')
      );
      onFormDataChange('pickupCity', get(4));
      onFormDataChange('pickupZipCode', get(6));
      onFormDataChange('contactName', get(7));
      onFormDataChange('contactPhone', get(8));
      onFormDataChange('contactEmail', get(11));
      onFormDataChange('stateCode', get(5));
      onFormDataChange('stateId', get(13));

      if (isVisible(CommonToggleKeys.OCEAN_IMP_TRK_SHOW_COUNTRY_FIELD)) {
        onFormDataChange('pickupCountry', get(12));
      }

      onFormDataChange(
        'pickupState',
        isVisible(CommonToggleKeys.OCEAN_DISPLAY_STATE_NAME)
          ? (get(14) || String(item['state'] ?? '') || get(5))
          : get(5)
      );
    },
    [onFormDataChange, isVisible]
  );

  const {
    data: pickupCargoAtcodeSuggestions,
    setQuery: setPickupCargoAtcodeQuery,
  } = useGetSuggestions(pickupCargoAtcodeSuggestionConfig(loginBean as any));

  const { data: pickupCountrySuggestions, setQuery: setPickupCountryQuery } =
    useGetSuggestions(countrySuggestionConfig(loginBean as any));

  const { data: pickupStateSuggestions, setQuery: setPickupStateQuery } =
    useGetSuggestions(buildStateSuggestionConfig(selectedCountryCode, loginBean as any));

  const postalCityConfig = React.useMemo(
    () => SearchByPostalCodeCityConfig(selectedCountryCode, loginBean as any),
    [selectedCountryCode, loginBean]
  );

  const {
    data: customerStateCityData,
    loading: customerStateCityLoading,
    setQuery: setCustomerStateCityQuery,
  } = useGetSuggestions(postalCityConfig);

  const handlePostalCodeKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!formData.pickupCountry) {
        e.preventDefault();
        setPickupValidationMessage?.([
          'Please enter Pickup Country.',
        ]);
        return;
      }

      setPickupValidationMessage?.([]);
    },
    [
      formData.pickupCountry,
      setPickupValidationMessage,
    ]
  );

  return (
    <Box className={styles.container}>
      <Box className={styles.countryDateRow}>
        <PSingleValueSearchableField
          label="Pickup Country"
          labelSx={{ lineHeight: '14px' }}
          data={pickupCountrySuggestions}
          displayFields={['country']}
          columnHeaders={['Country']}
          value={!isTouched &&
            !formData.pickupCountry
            ? onFormDataChange('pickupCountry', defaultCountry)
            : formData.pickupCountry}
          onChange={(val) => {
            setIsTouched(true);
            setPickupCountryQuery(val);
            onFormDataChange('pickupCountry', val);
            onFormDataChange('pickupState', '');
            onFormDataChange('stateId', '');
            onFormDataChange('stateCode', '');
          }}
          showTooltip={true}
          onSelect={(item: Record<string, unknown>) => {
            onFormDataChange('pickupCountry', String(item['country']));
            onFormDataChange('pickupState', '');
            onFormDataChange('stateId', '');
            onFormDataChange('stateCode', '');
          }}
        />
        {/* <PTextField
          fullWidth
          label="Search by Postal Code/City"
          value={formData.postalCodeCity}
          onChange={(e) => onFormDataChange('postalCodeCity', e.target.value)}
          labelSx={{ pb: 0, lineHeight: '17px' }}
        /> */}
        <PSingleValueSearchableField
          label="Search by Postal Code/City"
          {...resolveFieldProps(
            ORG_SEARCH_PROFILES({}).doordelivery.postalCodeField
          )}
          data={customerStateCityData}
          loading={customerStateCityLoading}
          value={formData.postalCodeCity}
          onChange={(val) => {
            onFormDataChange('postalCodeCity', val);
            setCustomerStateCityQuery(val);
          }}
          onSelect={(item: Record<string, unknown>) => {
            const parsed = item?.data as Record<string, string> | undefined;
            if (!parsed) return;

            const streetAddress = [
              parsed.phone,
              parsed.fax,
              parsed.activeFlag,
              parsed.email,
            ]
              .filter(Boolean)
              .join('\n');

            onFormDataChange(
              'postalCodeCity',
              String(item['displayName'] ?? '')
            );
            onFormDataChange('pickupZipCode', parsed.name ?? '');
            onFormDataChange('pickupCity', parsed.address3 ?? '');
            onFormDataChange('streetAddress', streetAddress);
            onFormDataChange(
              'pickupState',
              isVisible(CommonToggleKeys.OCEAN_DISPLAY_STATE_NAME)
                ? (parsed.stateName || parsed.address2 || '')
                : (parsed.address1 ?? '')
            );
            onFormDataChange('stateCode', parsed.address1 ?? '');
            onFormDataChange('longitude', parsed.longitude ?? '');
            onFormDataChange('latitude', parsed.latitude ?? '');

            if (isVisible(CommonToggleKeys.OCEAN_DISPLAY_STATE_NAME)) {
              onFormDataChange('stateId', parsed.stateId ?? '');
            }
          }}
          showTooltip={false}
          onKeyDown={handlePostalCodeKeyDown}

        />
        <Box>
          <PDatePicker
            label="Estimated Pickup Date"
            onChange={(val) => onFormDataChange('estimatedPickupDate', val)}
            value={formData.estimatedPickupDate}
            required
          />
        </Box>
      </Box>

      <Box className={styles.cargoInstructionsRow}>
        <Box className={styles.gridBox}>
          <Box className={styles.relativeBox}>
            <PSingleValueSearchableField
              label="Pickup Cargo At Code"
              labelSx={{ lineHeight: '17px' }}
              data={pickupCargoAtcodeSuggestions}
              displayFields={[
                'code',
                'billToCode',
                'name',
                'type',
                'alias',
                'city',
                'state',
                'country',
              ]}
              columnHeaders={[
                'Code',
                'Bill to Code',
                'Name',
                'Type',
                'Alias',
                'City',
                'State',
                'Country',
              ]}
              showTooltip={true}
              value={formData.pickupCargoAtCode}
              onSelect={handlePickupCargoAtCodeSelect}
              onChange={(val) => {
                setPickupCargoAtcodeQuery(val);
                onFormDataChange('pickupCargoAtCode', val);
              }}
            />
            <img
              src={searchIcon}
              alt="search"
              className={styles.searchIcon}
              onClick={() => onOrgSearchOpen?.()}
            />
          </Box>
          <PTextField
            fullWidth
            label="Name"
            value={formData.name}
            onChange={(e) => onFormDataChange('name', e.target.value)}
            labelSx={{ pb: 0 }}
          />
        </Box>
        <PTextField
          fullWidth
          label="Instructions"
          value={formData.instructions}
          onChange={(e) => onFormDataChange('instructions', e.target.value)}
          multiline
          rows={3.5}
          className={styles.autoHeightField}
          labelSx={{ pb: 0 }}
        />
      </Box>

      <Box className={styles.streetAddressRow}>
        <PTextField
          fullWidth
          label="Street Address"
          value={formData.streetAddress}
          onChange={(e) => onFormDataChange('streetAddress', e.target.value)}
          multiline
          rows={5}
          className={styles.autoHeightField}
          labelSx={{ pb: 0 }}
        />
        <PickupAccessories
          selected={formData.accessorials}
          onChange={
            onAccessorialsChange ??
            ((selected) => onFormDataChange('accessorials', selected))
          }
          options={accessorialOptions}
        />
      </Box>

      <Box className={styles.cityStateRow}>
        <PTextField
          fullWidth
          label="Pickup City"
          value={formData.pickupCity}
          onChange={(e) => onFormDataChange('pickupCity', e.target.value)}
          labelSx={{ pb: 0 }}
        />
        <PTextField
          fullWidth
          label="Pickup Zip Code"
          value={formData.pickupZipCode}
          onChange={(e) => onFormDataChange('pickupZipCode', e.target.value)}
          labelSx={{ pb: 0, lineHeight: '13px' }}
        />
        <PSingleValueSearchableField
          label="Pickup State"
          labelSx={{ lineHeight: '10px' }}
          data={pickupStateSuggestions}
          displayFields={['code', 'name', 'countryCode']}
          columnHeaders={['Code', 'Name', 'Country Code']}
          showTooltip={true}
          value={formData.pickupState}
          onChange={(val) => {
            setPickupStateQuery(val);
            onFormDataChange('pickupState', val);
            onFormDataChange('stateId', '');
            onFormDataChange('stateCode', '');
          }}
          onSelect={(item) => {
            const displayVal =
              isVisible(CommonToggleKeys.OCEAN_DISPLAY_STATE_NAME) && item['name']
                ? String(item['name'])
                : String(item['code'] ?? '');
            onFormDataChange('pickupState', displayVal);
            onFormDataChange('stateCode', String(item['code'] ?? ''));
          }}
        />
      </Box>

      <Box className={styles.contactRow}>
        <PTextField
          fullWidth
          label="Contact Name"
          value={formData.contactName}
          onChange={(e) => onFormDataChange('contactName', e.target.value)}
          labelSx={{ pb: 0 }}
        />
        <PTextField
          fullWidth
          label="Contact Phone"
          value={formData.contactPhone}
          onChange={(e) => onFormDataChange('contactPhone', e.target.value)}
          type="tel"
          labelSx={{ pb: 0 }}
        />
        <PTextField
          fullWidth
          label="Contact Email"
          value={formData.contactEmail}
          onChange={(e) => onFormDataChange('contactEmail', e.target.value)}
          type="email"
          labelSx={{ pb: 0 }}
        />
      </Box>

      <PModal
        title="Organization Search"
        open={orgSearchOpen}
        isCloseIcon={true}
        onClose={() => onOrgSearchClose?.()}
        height="50vh"
        width={1049}
        sx={{ backgroundColor: 'white' }}
        contentSx={{ pl: 0 }}
      >
        <Box className={styles.orgSearchContent}>
          <POrganizationSearchPage />
        </Box>
      </PModal>
    </Box>
  );
};

export default PickUpDetails;
