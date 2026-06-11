import { Box } from '@mui/material';
import React from 'react';

import PickupAccessories from '../PickupDetails/PickupAccessories';
import {
  PDatePicker,
  PSingleValueSearchableField,
  PTextField,
} from 'phoenix-react-lib';
import {
  COUNTRY_FIELD_CONFIG,
  ORG_SEARCH_PROFILES,
  resolveFieldProps,
} from '../OrganizationSearch/organizationSearchConfig';
import styles from '../../../../styles/LCL/TruckingDetails.module.css';
import { DoorDeliveryDetailsProps } from '@/types';
import { DOOR_DELIVERY_ACCESSORIALS } from '../../../../InitialData/LCL';
import {
  buildStateSuggestionConfig,
  countrySuggestionConfig,
  SearchByPostalCodeCityConfig,
} from '../../../../hooks/LCL/suggestionHelpers';
import { useGetSuggestions } from '../../../../hooks/LCL/useGetSuggestions';
import { useFeatureToggle } from '../../../../hooks/LCL';
import { CommonToggleKeys } from '../../../../core/featureToggles/featureToggle.types';
import { useAppSelector } from '../../../../app/store/hooks';
import { selectCountryMap, selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';

// const CODE_INPUT_STYLE: React.CSSProperties = {
//     height: '20px',
//     fontSize: '12px',
//     padding: '3px 5px',
//     fontFamily: 'Arial, Helvetica, sans-serif',
//     width: '100%',
//     boxSizing: 'border-box',
// };

// const SEARCHABLE_LABEL_SX = {
//     pb: 0,
//     fontSize: '14px',
//     fontFamily: 'Arial, Helvetica, sans-serif',
//     color: '#333',
//     lineHeight: '13px',
// };

const DoorDeliveryDetails: React.FC<DoorDeliveryDetailsProps> = ({
  formData,
  onFormDataChange,
  setPickupValidationMessage,
  doorAccessorialOptions,
}) => {
  const [customerCountryCode, setCustomerCountryCode] = React.useState('');
  const loginClientBean = useAppSelector(selectLoginClientBean);
  const { isVisible } = useFeatureToggle();

  const customerStateConfig = React.useMemo(
    () => buildStateSuggestionConfig(customerCountryCode, loginClientBean as any),
    [customerCountryCode, loginClientBean]
  );

  const postalCityConfig = React.useMemo(
    () => SearchByPostalCodeCityConfig(customerCountryCode, loginClientBean as any),
    [customerCountryCode, loginClientBean]
  );

  const {
    data: customerCountryData,
    loading: customerCountryLoading,
    setQuery: setCustomerCountryQuery,
  } = useGetSuggestions(countrySuggestionConfig(loginClientBean as any));

  //State suggestion hooks
  const {
    data: customerStateData,
    loading: customerStateLoading,
    setQuery: setCustomerStateQuery,
  } = useGetSuggestions(customerStateConfig);

  //State suggestion hooks
  const {
    data: customerStateCityData,
    loading: customerStateCityLoading,
    setQuery: setCustomerStateCityQuery,
  } = useGetSuggestions(postalCityConfig);
  
  const countryMap = useAppSelector(selectCountryMap);

  let doorDeliveryCountry = formData?.doorDeliveryCountry || "";

  if (
    doorDeliveryCountry &&
    !doorDeliveryCountry.includes("-") &&
    countryMap?.[doorDeliveryCountry]
  ) {
    doorDeliveryCountry = `${doorDeliveryCountry} - ${countryMap[doorDeliveryCountry]}`;
  }

  const handlePostalCodeKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!formData.doorDeliveryCountry) {
        e.preventDefault();
        setPickupValidationMessage?.([
          'Please enter Door Delivery Country.',
        ]);
        return;
      }

      setPickupValidationMessage?.([]);
    },
    [
      formData.doorDeliveryCountry,
      setPickupValidationMessage,
    ]
  );

  return (
    <Box className={styles.container}>
      <Box className={styles.countryDateRow}>
        <PSingleValueSearchableField
          label="Door Delivery Country"
          {...resolveFieldProps(COUNTRY_FIELD_CONFIG)}
          data={customerCountryData}
          loading={customerCountryLoading}
          value={doorDeliveryCountry}
          onChange={(val) => {
            onFormDataChange('doorDeliveryCountry', val);
            setCustomerCountryQuery(val);
          }}
          onSelect={(item) => {
            setCustomerCountryCode(String(item.code ?? ''));
            onFormDataChange(
              'doorDeliveryCountry',
              String(item['displayName'] ?? '')
            );
          }}
          showTooltip={true}
        />

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
          onSelect={(item: any) => {
            const parsed = item?.data;
            if (!parsed) return;

            const streetAddress = [
              parsed.phone,
              parsed.fax,
              parsed.activeFlag,
              parsed.email,
            ]
              .filter(Boolean)
              .join('\n');

            onFormDataChange('streetAddress', streetAddress);
            onFormDataChange('doorDeliveryCity', parsed.address3 ?? '');
            onFormDataChange(
              'doorDeliveryState',
              isVisible(CommonToggleKeys.OCEAN_DISPLAY_STATE_NAME)
                ? (parsed.stateName || parsed.address2 || '')
                : (parsed.address1 ?? '')
            );
            onFormDataChange('doorDeliveryZipCode', parsed.name ?? '');
            onFormDataChange('longitude', parsed.longitude ?? '');
            onFormDataChange('latitude', parsed.latitude ?? '');
            onFormDataChange('doorDeliveryStateCode', parsed.address1 ?? '');
          }}
          showTooltip={false}
          onKeyDown={handlePostalCodeKeyDown}
        />

        <Box>
          <PDatePicker
            label="Estimated Delivery Date"
            onChange={(val) => onFormDataChange('estimatedDeliveryDate', val)}
            value={formData.estimatedDeliveryDate}
          />
        </Box>
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
          onChange={(selected) => onFormDataChange('accessorials', selected)}
          options={doorAccessorialOptions}
        />
      </Box>

      <Box className={styles.cityStateRow}>
        <PTextField
          fullWidth
          label="Door Delivery City"
          value={formData.doorDeliveryCity}
          onChange={(e) => onFormDataChange('doorDeliveryCity', e.target.value)}
          labelSx={{ pb: 0 }}
        />
        <PTextField
          fullWidth
          label="Door Delivery Zip Code"
          value={formData.doorDeliveryZipCode}
          onChange={(e) =>
            onFormDataChange('doorDeliveryZipCode', e.target.value)
          }
          labelSx={{ pb: 0 }}
        />

        <PSingleValueSearchableField
          label="Door Delivery State"
          {...resolveFieldProps(
            ORG_SEARCH_PROFILES({}).doordelivery.stateField
          )}
          data={customerStateData}
          loading={customerStateLoading}
          value={formData.doorDeliveryState}
          onChange={(val) => {
            onFormDataChange('doorDeliveryState', val);
            setCustomerStateQuery(val);
          }}
          onSelect={(item) => {
            onFormDataChange('doorDeliveryStateCode', String(item['code'] ?? ''));
            onFormDataChange(
              'doorDeliveryState',
              isVisible(CommonToggleKeys.OCEAN_DISPLAY_STATE_NAME) && item['name']
                ? String(item['name'])
                : String(item['code'] ?? '')
            );
          }}
          showTooltip={false}
          //  inputStyle={CODE_INPUT_STYLE}
        />

        {/* <PSingleValueSearchableField
          label="Door Delivery State"
          // labelSx={SEARCHABLE_LABEL_SX}
          {...resolveFieldProps(ORG_SEARCH_PROFILES['doordelivery'].stateField)}
          value={formData.doorDeliveryState}
          onChange={(val) => onFormDataChange('doorDeliveryState', val)}
          onSelect={(item) =>
            onFormDataChange('doorDeliveryState', String(item['name'] ?? ''))
          }
          showTooltip={false}
          // inputStyle={CODE_INPUT_STYLE}
        /> */}
      </Box>
    </Box>
  );
};

export default DoorDeliveryDetails;
