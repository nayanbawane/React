import React from 'react';
import { Box, InputAdornment } from '@mui/material';
import {
  PDatePicker,
  PGradientButton,
  PModal,
  PSelect,
  PSingleValueSearchableField,
  PTextField,
} from 'phoenix-react-lib';
import searchIcon from '@/assets/images/search-icon.png';

import PickupAccessories from '../PickupDetails/PickupAccessories';
import POrganizationSearchPage from '../OrganizationSearch/POrganizationSearchPage';
import {
  COUNTRY_FIELD_CONFIG,
  ORG_SEARCH_PROFILES,
  resolveFieldProps,
} from '../OrganizationSearch/organizationSearchConfig';
import styles from '../../../../styles/LCL/TruckingDetails.module.css';
import { DoorDeliveryFormData, PickupCharge } from '@/types';
import {
  DOOR_DELIVERY_ACCESSORIALS,
  SHIPMENT_TYPE_OPTIONS,
} from '../../../../InitialData/LCL';
import {
  buildPickupTruckerData,
  buildPickupTruckerDataForDoorDelivery,
  buildStateSuggestionConfig,
  countrySuggestionConfig,
  SearchByPostalCodeCityConfig,
  useGetSuggestions,
} from '../../../../hooks/LCL';
import { useAppSelector } from '../../../../app/store/hooks';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';
import type { AccessoriesOption } from '../../../../types/LCL/routing/RoutingDetails.types';

const CODE_INPUT_STYLE: React.CSSProperties = {
  height: '20px',
  fontSize: '12px',
  padding: '3px 5px',
  fontFamily: 'Arial, Helvetica, sans-serif',
  width: '100%',
  boxSizing: 'border-box',
};

const COL_WIDTHS = { amt: '45%' };
const ROW_SX = { display: 'flex', width: '80%' };
const DESC_SLOT_PROPS = { htmlInput: { readOnly: true } };

const PF_SX = {
  '& .MuiOutlinedInput-root': {
    height: '22px',
    fontSize: '12px',
    fontFamily: 'Arial, Helvetica, sans-serif',
    borderRadius: 0,
    backgroundColor: '#f5f5f5',
    '& fieldset': { borderColor: '#bdbdbd', borderRadius: 0 },
  },
  '& .MuiOutlinedInput-input': {
    padding: '0 4px',
    fontSize: '12px',
    color: '#555555',
    textAlign: 'right' as const,
  },
};

const PF_DESC_SX = {
  ...PF_SX,
  '& .MuiOutlinedInput-input': {
    ...PF_SX['& .MuiOutlinedInput-input'],
    textAlign: 'left' as const,
  },
};

const currencySlotProps = (currency: string) => ({
  input: {
    readOnly: true,
    startAdornment: (
      <InputAdornment position="start" sx={{ mr: 0 }}>
        <span
          style={{
            fontSize: '12px',
            color: '#555555',
            fontFamily: 'Arial, Helvetica, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          {currency}
        </span>
      </InputAdornment>
    ),
  },
  htmlInput: { readOnly: true },
});

const fmt = (val: number) => val.toFixed(2);

interface DoorDeliveryAccordionContentProps {
  formData: DoorDeliveryFormData;
  onFormDataChange: (field: keyof DoorDeliveryFormData, value: unknown) => void;
  isFetchingRates: boolean;
  truckerSearchOpen: boolean;
  onSetTruckerSearchOpen: (open: boolean) => void;
  onFetchTruckRates?: () => void;
  buyTotal: number;
  sellTotal: number;
  profitLoss: number;
  chargeRows: PickupCharge[];
  hideFetchButton?: boolean;
  moduleType: string;
  doorAccessorialOptions?: AccessoriesOption[];
  onWarning?: (message: string | null) => void;
}

const DoorDeliveryAccordionContent: React.FC<
  DoorDeliveryAccordionContentProps
> = ({
  formData,
  onFormDataChange,
  isFetchingRates,
  truckerSearchOpen,
  onSetTruckerSearchOpen,
  onFetchTruckRates,
  buyTotal,
  sellTotal,
  profitLoss,
  chargeRows,
  hideFetchButton,
  moduleType,
  doorAccessorialOptions,
  onWarning
}) => {
  const handleTruckerSelect = (org: { code: string; name: string }) => {
    onFormDataChange('truckerCode', org.code);
    onFormDataChange('truckerDetails', org.name);
    onSetTruckerSearchOpen(false);
  };
  const isPreBooking = moduleType === 'prebooking';

  const [customerCountryCode, setCustomerCountryCode] = React.useState('');
  const loginClientBean = useAppSelector(selectLoginClientBean);

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

  const {
    data: customerStateData,
    loading: customerStateLoading,
    setQuery: setCustomerStateQuery,
  } = useGetSuggestions(customerStateConfig);

  const {
    data: customerStateCityData,
    loading: customerStateCityLoading,
    setQuery: setCustomerStateCityQuery,
  } = useGetSuggestions(postalCityConfig);

  const { data: pickupTruckerData, setQuery: sethandlePickupTrucker } =
    useGetSuggestions(buildPickupTruckerDataForDoorDelivery(loginClientBean as any));

  const handlePostalCodeKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (!formData.doorDeliveryCountry) {
        e.preventDefault();

        onWarning?.('Please enter Door Delivery Country.');
      }
    },
    [formData.doorDeliveryCountry, onWarning]
  );

  return (
    <Box className={styles.wrapper}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
        }}
      >
        <Box
          className={styles.sectionContainer}
          sx={{
            flex: { xs: '1 1 auto', md: '0 0 65%' },
            width: { xs: '100%', md: '65%' },
          }}
        >
          <span className={styles.title}>Door Delivery Details</span>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <Box className={styles.col}>
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
                    parsed.address1,
                    parsed.address2,
                    parsed.address3,
                  ]
                    .filter(Boolean)
                    .join('\n');

                  onFormDataChange('streetAddress', streetAddress);
                  onFormDataChange('doorDeliveryCity', parsed.address3);
                  onFormDataChange(
                    'doorDeliveryState',
                    parsed.stateName || parsed.address2
                  );
                  onFormDataChange('doorDeliveryZipCode', parsed.name);
                  onFormDataChange('longitude', parsed.longitude ?? '');
                  onFormDataChange('latitude', parsed.latitude ?? '');

                  //   const podName =
                  //     `${parsed.address3} ${parsed.zip} ${stateCode}`.trim();
                }}
                showTooltip={false}
                onKeyDown={handlePostalCodeKeyDown}
              />

              <PTextField
                fullWidth
                label="Street Address"
                value={formData.streetAddress}
                onChange={(e) =>
                  onFormDataChange('streetAddress', e.target.value)
                }
                multiline
                rows={4}
                className={styles.autoHeightField}
                labelSx={{ pb: 0 }}
              />
              <Box className={styles.row3Col}>
                <PTextField
                  fullWidth
                  label="City"
                  value={formData.doorDeliveryCity}
                  onChange={(e) =>
                    onFormDataChange('doorDeliveryCity', e.target.value)
                  }
                  labelSx={{ pb: 0 }}
                />
                {/* <PSingleValueSearchableField
                                    label="State"
                                    labelSx={{ pb: 0, fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#333', lineHeight: '13px' }}
                                    {...resolveFieldProps(ORG_SEARCH_PROFILES['doordelivery'].stateField)}
                                    value={formData.doorDeliveryState}
                                    onChange={(val) => onFormDataChange('doorDeliveryState', val)}
                                    onSelect={(item) => onFormDataChange('doorDeliveryState', String(item['name'] ?? ''))}
                                    showTooltip={false}
                                    inputStyle={CODE_INPUT_STYLE}
                                /> */}
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
                    onFormDataChange(
                      'doorDeliveryState',
                      String(item['name'] ?? '')
                    );
                  }}
                  showTooltip={false}
                  //  inputStyle={CODE_INPUT_STYLE}
                />
                <PSingleValueSearchableField
                  label="Door Delivery Country"
                  {...resolveFieldProps(COUNTRY_FIELD_CONFIG)}
                  data={customerCountryData}
                  loading={customerCountryLoading}
                  value={formData.doorDeliveryCountry}
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
                {/* <PSingleValueSearchableField
                                    label="Country"
                                    labelSx={{ pb: 0, fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#333', lineHeight: '13px' }}
                                    {...resolveFieldProps(ORG_SEARCH_PROFILES['doordelivery'].countryField)}
                                    value={formData.doorDeliveryCountry}
                                    onChange={(val) => onFormDataChange('doorDeliveryCountry', val)}
                                    onSelect={(item) => onFormDataChange('doorDeliveryCountry', String(item['displayName'] ?? ''))}
                                    showTooltip={false}
                                    inputStyle={CODE_INPUT_STYLE}
                                /> */}
              </Box>
              <PTextField
                label="Zip Code"
                value={formData.doorDeliveryZipCode}
                onChange={(e) =>
                  onFormDataChange('doorDeliveryZipCode', e.target.value)
                }
                labelSx={{ pb: 0 }}
                sx={{ width: '130px' }}
              />
            </Box>

            <Box className={styles.col}>
              <Box>
                <label className={styles.fieldLabel}>
                  Estimated Delivery Date
                </label>
                <PDatePicker
                  onChange={(val) =>
                    onFormDataChange('estimatedDeliveryDate', val)
                  }
                  value={formData.estimatedDeliveryDate}
                />
              </Box>
              <PickupAccessories
                selected={formData.accessorials}
                onChange={(selected) =>
                  onFormDataChange('accessorials', selected)
                }
                options={doorAccessorialOptions}
              />
              <Box className={styles.stackableRow}>
                <Box>
                  <label className={styles.fieldLabel}>Stackable</label>
                  <Box className={styles.toggleGroup}>
                    <Box
                      className={`${styles.toggleBtn} ${formData.stackable ? styles.toggleBtnActive : ''}`}
                      onClick={() => onFormDataChange('stackable', true)}
                    >
                      Yes
                    </Box>
                    <Box
                      className={`${styles.toggleBtn} ${!formData.stackable ? styles.toggleBtnActive : ''}`}
                      onClick={() => onFormDataChange('stackable', false)}
                    >
                      No
                    </Box>
                  </Box>
                </Box>
                <Box>
                  <label className={styles.fieldLabel}>Shipment Type</label>
                  <PSelect
                    value={formData.shipmentType}
                    onChange={(val) => onFormDataChange('shipmentType', val)}
                    options={SHIPMENT_TYPE_OPTIONS}
                    placeholder="Select"
                  />
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box
          className={styles.sectionContainer}
          sx={{
            flex: { xs: '1 1 auto', md: '0 0 35%' },
            width: { xs: '100%', md: '35%' },
          }}
        >
          <span className={styles.title}>Door Delivery Trucker Details</span>
          <Box className={styles.col}>
            <Box className={styles.truckerCodeBox}>
              <PSingleValueSearchableField
                label="Trucker Code"
                id="truckerCode"
                data={pickupTruckerData ?? []}
                displayFields={[
                  'Code',
                  'Bill To Code',
                  'Name',
                  'Type',
                  'Alias',
                  'City',
                  'State',
                  'Country',
                ]}
                columnHeaders={[
                  'Code',
                  'Bill To Code',
                  'Name',
                  'Type',
                  'Alias',
                  'City',
                  'State',
                  'Country',
                ]}
                displayValueField="Code"
                value={formData.truckerCode}
                onChange={(value) => {
                  sethandlePickupTrucker(value);
                  onFormDataChange('truckerCode', value);

                  const selected = pickupTruckerData?.find(
                    (item: any) => item.Code === (value?.Code || value)
                  );

                  const raw = selected?.rawDetails || '';

                  const formattedDetails = raw
                    .replace(/~~/g, '\n')
                    .replace(/~/g, '\n')
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean)
                    .join('\n');

                  onFormDataChange('truckerDetails', formattedDetails);
                }}
                extendedStyle={true}
                showTooltip={true}
              />
              <img
                src={searchIcon}
                alt="search"
                className={styles.truckerSearchIcon}
                onClick={() => onSetTruckerSearchOpen(true)}
              />
            </Box>

            {/* <Box className={styles.truckerCodeBox}>
              <PSingleValueSearchableField
                label="Trucker Code"
                labelSx={{
                  pb: 0,
                  fontSize: '12px',
                  fontFamily: 'Arial, Helvetica, sans-serif',
                  color: '#333',
                }}
                {...resolveFieldProps(
                  ORG_SEARCH_PROFILES[''].codeField
                )}
                value={formData.truckerCode}
                onChange={(val) => onFormDataChange('truckerCode', val)}
                onSelect={(item) =>
                  onFormDataChange('truckerCode', String(item['code'] ?? ''))
                }
                showTooltip={true}
                inputStyle={CODE_INPUT_STYLE}
              />
             
            </Box> */}
            <PTextField
              fullWidth
              label="Trucker Details"
              value={formData.truckerDetails}
              onChange={(e) =>
                onFormDataChange('truckerDetails', e.target.value)
              }
              multiline
              rows={4}
              className={styles.autoHeightField}
              labelSx={{ pb: 0 }}
            />
          </Box>
        </Box>
      </Box>

      <Box className={styles.chargesSection}>
        <Box className={styles.chargesTitle}>Door Delivery Charges:</Box>

        {chargeRows.map((charge, index) => (
          <Box key={charge.id} sx={ROW_SX}>
            <Box sx={{ width: COL_WIDTHS.amt }} className={styles.td}>
              <PTextField
                fullWidth
                label={index === 0 ? "Charge Description" : undefined}
                value={charge.chargeDescription}
                sx={PF_DESC_SX}
                slotProps={DESC_SLOT_PROPS}
              />
            </Box>
            <Box sx={{ width: COL_WIDTHS.amt }} className={styles.td}>
              <PTextField
                fullWidth
                label={index === 0 ? "Expense" : undefined}
                value={charge.id === -1 ? '' : fmt(charge.expense)}
                sx={PF_SX}
                slotProps={currencySlotProps(charge.expenseCurrency)}
              />
            </Box>
            <Box sx={{ width: COL_WIDTHS.amt }} className={styles.td}>
              <PTextField
                fullWidth
                label={index === 0 ? "Income" : undefined}
                value={charge.id === -1 ? '' : fmt(charge.income)}
                sx={PF_SX}
                slotProps={currencySlotProps(charge.incomeCurrency)}
              />
            </Box>
          </Box>
        ))}

        <Box className={styles.chargesFooter}>
          <Box className={styles.footerCell}>
            <span className={styles.footerLabel}>Buy Total</span>
            <Box className={styles.footerAmountRow}>
              <span className={styles.footerCurrency}>USD</span>
              <span className={styles.footerValue}>{fmt(buyTotal)}</span>
            </Box>
          </Box>
          <Box className={`${styles.footerCell} ${styles.footerCellBordered}`}>
            <span className={styles.footerLabel}>Sell Total</span>
            <Box className={styles.footerAmountRow}>
              <span className={styles.footerCurrency}>USD</span>
              <span className={styles.footerValue}>{fmt(sellTotal)}</span>
            </Box>
          </Box>
          <Box className={`${styles.footerCell} ${styles.footerCellBordered}`}>
            <span className={styles.footerLabel}>Profit/Loss</span>
            <Box className={styles.footerAmountRow}>
              <span className={styles.footerCurrency}>USD</span>
              <span className={styles.footerValue}>{fmt(profitLoss)}</span>
            </Box>
          </Box>
        </Box>

        {!hideFetchButton && !!onFetchTruckRates && !isPreBooking && (
          <Box className={styles.fetchRatesRow}>
            <PGradientButton
              title="Fetch Truck Rates"
              onClick={isFetchingRates ? undefined : onFetchTruckRates}
              sx={{
                height: '25px',
                borderRadius: '3px',
                fontSize: '13px',
                opacity: isFetchingRates ? 0.6 : 1,
                cursor: isFetchingRates ? 'not-allowed' : 'pointer',
              }}
            />
          </Box>
        )}
      </Box>

      <PModal
        title="Organization Search"
        open={truckerSearchOpen}
        isCloseIcon={true}
        onClose={() => onSetTruckerSearchOpen(false)}
        height={{ xs: '85vh', md: '31rem' }}
        width={{ xs: '95vw', sm: '95vw', md: 1049 }}
        sx={{ backgroundColor: 'white' }}
        contentSx={{ pl: 0 }}
      >
        <Box sx={{ backgroundColor: '#e9f6fe' }}>
          <POrganizationSearchPage onSelect={handleTruckerSelect} />
        </Box>
      </PModal>
    </Box>
  );
};

export default DoorDeliveryAccordionContent;
