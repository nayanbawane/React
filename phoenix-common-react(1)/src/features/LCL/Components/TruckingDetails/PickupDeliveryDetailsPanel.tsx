import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { PDatePicker, PModal, PTextField, PSingleValueSearchableField, PMapCoordinatePicker } from 'phoenix-react-lib';

import searchIcon from '../../../../assets/images/search-icon.png';
import POrganizationSearchPage from '../OrganizationSearch/POrganizationSearchPage';
import PickupAccessories from '../PickupDetails/PickupAccessories';
import styles from '../../../../styles/LCL/TruckingDetails.module.css';
import TruckingCargoDetails from './TruckingCargoDetails';
import { resolveFieldProps, ORG_SEARCH_PROFILES } from '../OrganizationSearch/organizationSearchConfig';
import type { TruckingCargoDetailsProps } from './TruckingCargoDetails';
import { PickupDeliveryFormData } from '@/types';
import { buildStateSuggestionConfig, countrySuggestionConfig, pickupCargoAtcodeSuggestionConfig, SearchByPostalCodeCityConfig, timeSuggestionConfig, useFeatureToggle, useGetSuggestions } from '../../../../hooks';
import { MODULE_BKG, CommonToggleKeys } from '../../../../core';
import {  PICKUP_CARGO_ORG_DATA } from '../../../../InitialData';
import type { AccessoriesOption } from '@/types';
import { selectLoginClientBean } from "../../../../core/featureToggles/featureToggle.selectors";
import { useSelector } from 'react-redux';

const CODE_INPUT_STYLE: React.CSSProperties = {
    height: '22px',
    fontSize: '12px',
    padding: '3px 5px',
    fontFamily: 'Arial, Helvetica, sans-serif',
    width: '100%',
    boxSizing: 'border-box',
};

interface OrgSelectPayload {
    code: string;
    name: string;
    address: string;
    city: string;
    state: string;
    stateName?: string;
    country: string;
    zipCode?: string;
    contactName1?: string;
    contactPhone1?: string;
    contactEmail1?: string;
}



interface PickupDeliveryDetailsPanelProps {
    formData: PickupDeliveryFormData;
    orgSearchOpen: boolean;
    onSetOrgSearchOpen: (open: boolean) => void;
    onChange: (field: keyof PickupDeliveryFormData, value: unknown) => void;
    onAccessorialsChange: (selected: string[]) => void;
    onHazardousChange: (isHazardous: boolean) => void;
    onOrgSelect: (org: OrgSelectPayload) => void;
    onCargoDetailsToggle: () => void;
    isCargoOpen: boolean;
    internalCargoRows: NonNullable<TruckingCargoDetailsProps['externalCargoRows']>;
    onCargoRowsChange?: (rows: unknown[]) => void;
    coordinatePickerState?: {
        locationKey?: string;
        mapZoom?: number;
        latError?: string;
        lngError?: string;
        onLatBlur?: () => void;
        onLngBlur?: () => void;
    };
    moduleCode?: string;
    isFCLBooking?: boolean;
    fclHazardousOptions?: { label: string; value: string }[];
    moduleType: String;
    accessorialOptions?: AccessoriesOption[];
    onWarning?: (message: string | null) => void;
}

const PickupDeliveryDetailsPanel: React.FC<PickupDeliveryDetailsPanelProps> = ({
    formData,
    orgSearchOpen,
    onSetOrgSearchOpen,
    onChange,
    onAccessorialsChange,
    onHazardousChange,
    onOrgSelect,
    onCargoDetailsToggle,
    isCargoOpen,
    internalCargoRows,
    onCargoRowsChange,
    coordinatePickerState,
    moduleCode,
    isFCLBooking,
    fclHazardousOptions,
    moduleType,
    accessorialOptions,
    onWarning,
}) => {
    const { isVisible } = useFeatureToggle();
    const isPrebooking = moduleType === 'prebooking';
    const loginClientBean = useSelector(selectLoginClientBean);

    const showPickupReference = isVisible(CommonToggleKeys.OCEAN_BKG_TRK_PICKUP_REFERENCE_ENABLE);
    const showCoordinates = isVisible(CommonToggleKeys.OCEAN_BOOKING_SHOW_PICKUP_COORDINATES) && moduleCode === MODULE_BKG;
    const toggleBaiduMaps = isVisible(CommonToggleKeys.MAPS_ENABLE_BAIDU_MAPS);
    const countryZipEnabled = isVisible(CommonToggleKeys.OCN_EXPORT_QUO_SHOW_BOOK_BUTTON);
    const effectiveMapType = (toggleBaiduMaps ? 'baidu' : 'google');

    const effectiveLatitude = (formData?.latitude != null && formData?.latitude !== '')
        ? Number(formData?.latitude)
        : Number(loginClientBean?.latitude);
    const effectiveLongitude = (formData?.longitude != null && formData?.longitude !== '')
        ? Number(formData?.longitude)
        : Number(loginClientBean?.longitude);

    const selectedCountryCode =
    formData?.country?.split(' - ')[0] ?? '';

    const { data: pickupCargoAtcodeSuggestions, setQuery: setPickupCargoAtcodeQuery } =
        useGetSuggestions(pickupCargoAtcodeSuggestionConfig(loginClientBean as any));

    const { data: postalCodeCitySuggestions, setQuery: setPostalCodeCityQuery } =
        useGetSuggestions(SearchByPostalCodeCityConfig(selectedCountryCode, loginClientBean as any));

    const { data: pickupCountrySuggestions, setQuery: setPickupCountryQuery } =
        useGetSuggestions(countrySuggestionConfig(loginClientBean as any));

    const { data: pickupStateSuggestions, setQuery: setPickupStateQuery, } =
        useGetSuggestions(buildStateSuggestionConfig(selectedCountryCode, loginClientBean as any));

    const {
        data: timeSuggestions,
        setQuery: setTimeQuery,
        loading: isTimeLoading,
      } = useGetSuggestions(timeSuggestionConfig());
    const [localTime, setLocalTime] = React.useState({
      timeFrom: '',
      timeTo: '',
      deliveryTime: '',
    });
         const handleTimeChange = (
      field: 'timeFrom' | 'timeTo' | 'deliveryTime',
      rawValue: any
    ) => {
      const value = extractTime(rawValue);
      setLocalTime((prev) => ({
        ...prev,
        [field]: value,
      }));

      let cleaned = value
        .replace(/[^0-9:%]/g, '') 
        .slice(0, 5);

      if (cleaned.includes('%')) {
        onChange(field, cleaned);
        return;
      }
      if (cleaned.length > 2 && !cleaned.includes(':')) {
        cleaned = cleaned.slice(0, 2) + ':' + cleaned.slice(2);
      }
      if (cleaned.includes(':')) {
        const [h, m] = cleaned.split(':');

        if ((h && Number(h) > 23) || (m && Number(m) > 59)) {
          return;
        }
      }

      onChange(field, cleaned);
    };

    const extractTime = (value: any): string => {
      if (!value) return '';
      if (typeof value === 'object' && value.time) {
        return value.time;
      }
      if (typeof value === 'string') {
        return value;
      }

      return '';
    };

    useEffect(() => {
      setLocalTime({
        timeFrom: formData.timeFrom || '',
        timeTo: formData.timeTo || '',
        deliveryTime: formData.deliveryTime || '',
      });
    }, [formData]);

    const handlePostalCodeKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (!formData.country) {
                e.preventDefault();

                onWarning?.('Please enter Pickup Country.');
            }
        },
        [formData.country, onWarning]
    );

    return (
        <Box className={styles.panelContainer}>
            <span className={styles.title}>Pickup Details</span>

            <Box className={styles.mainGrid}>
                <Box className={styles.leftCol}>
                    <PSingleValueSearchableField
                        label="Search by Postal Code/City"
                        data={postalCodeCitySuggestions}
                        displayFields={['displayName']}
                        columnHeaders={['Postal Code / City']}
                        value={formData.postalCodeCity}
                        onChange={(val) => {
                            setPostalCodeCityQuery(val);
                            onChange('postalCodeCity', val);
                        }}
                        onSelect={(item: Record<string, unknown>) => {
                            const d = (item['data'] as Record<string, string>) ?? {};
                            onChange('postalCodeCity', String(item['displayName'] ?? ''));
                            onChange('city', d.address3 ?? '');
                            onChange(
                                'state',
                                isVisible(CommonToggleKeys.OCEAN_DISPLAY_STATE_NAME)
                                    ? (d.stateName || d.address2 || '')
                                    : (d.address1 ?? '')
                            );
                            onChange('zipCode', d.name ?? '');
                            if (d.longitude) onChange('longitude', d.longitude);
                            if (d.latitude) onChange('latitude', d.latitude);
                        }}
                        showTooltip={false}
                        labelSx={{ pb: 0 }}
                        onKeyDown={handlePostalCodeKeyDown}
                    />

                    <Box className={styles.relativeBox}>
                        <PSingleValueSearchableField
                            label="Pickup Cargo At Code"
                            labelSx={{ lineHeight: '17px' }}
                            data={pickupCargoAtcodeSuggestions}
                            displayFields={['code', 'name', 'city']}
                            columnHeaders={['Code', 'Name', 'City']}
                            showTooltip
                            value={formData.pickupCargoAtCode}
                            onSelect={(item: Record<string, unknown>) => {
                                const sv = (item['SUGGEST_VALUE'] as string[]) ?? [];
                                onChange('pickupCargoAtCode', String(item['code'] ?? ''));
                                onChange('name', sv[0] ?? String(item['name'] ?? ''));
                                const addr1 = sv[2] ?? '';
                                const addr2 = sv[3] ?? '';
                                onChange('streetAddress', addr2 ? `${addr1}\n${addr2}` : addr1);
                                onChange('city', sv[4] ?? String(item['city'] ?? ''));
                                onChange(
                                    'state',
                                    isVisible(CommonToggleKeys.OCEAN_DISPLAY_STATE_NAME)
                                        ? (sv[14] || sv[5] || String(item['state'] ?? ''))
                                        : (sv[5] ?? String(item['state'] ?? ''))
                                );
                                onChange('zipCode', sv[6] ?? '');
                                onChange('contactName1', sv[7] ?? '');
                                onChange('contactPhone1', sv[8] ?? '');
                                onChange('contactEmail1', sv[11] ?? '');
                                onChange('country', sv[12] ?? String(item['country'] ?? ''));
                            }}
                            onChange={(val) => {
                                setPickupCargoAtcodeQuery(val);
                                onChange('pickupCargoAtCode', val);
                            }}
                        />
                        <img src={searchIcon} alt="search" className={styles.searchIcon} onClick={() => onSetOrgSearchOpen(true)} />
                    </Box>

                    <Box data-eservice-field="PICKUP_COMPANY_NAME">
                        <PTextField
                            fullWidth
                            label="Name"
                            value={formData.name}
                            onChange={(e) => onChange('name', e.target.value)}
                            required={!isPrebooking}
                            labelSx={{ pb: 0 }}
                        />
                    </Box>

                    <Box data-eservice-field="PICKUP_ADDRESS">
                        <PTextField
                            fullWidth
                            label="Street Address"
                            value={formData.streetAddress}
                            onChange={(e) => onChange('streetAddress', e.target.value)}
                            multiline
                            rows={4}
                            className={styles.customerNameField}
                            labelSx={{ pb: 0 }}
                        />
                    </Box>

                    <Box className={styles.row3Col}>
                        <Box data-eservice-field="PICKUP_CITY">
                            <PTextField
                                fullWidth
                                label="City"
                                value={formData.city}
                                onChange={(e) => onChange('city', e.target.value)}
                                required={!isPrebooking}
                                labelSx={{ pb: 0,lineHeight: '22px' }}
                            />
                        </Box>
                        <Box data-eservice-field="PICKUP_STATE">
                            <PSingleValueSearchableField
                                label="State"
                                labelSx={{ pb: 0, fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#333', lineHeight: '22px' }}
                                value={formData.state}
                                data={pickupStateSuggestions}
                                displayFields={['code', 'name', 'countryCode']}
                                columnHeaders={['Code', 'Name', 'Country Code']}
                                onSelect={(item: Record<string, unknown>) => {
                                    const displayVal =
                                        isVisible(CommonToggleKeys.OCEAN_DISPLAY_STATE_NAME) && item['name']
                                            ? String(item['name'])
                                            : String(item['code'] ?? '');
                                    onChange('state', displayVal);
                                }}
                                onChange={(val) => {
                                    setPickupStateQuery(val);
                                    onChange('state', val);
                                }}
                                showTooltip={false}
                            />
                        </Box>
                        <Box data-eservice-field="PICKUP_COUNTRY">
                            <PSingleValueSearchableField
                                label="Country"
                                labelSx={{ pb: 0, fontSize: '12px', fontFamily: 'Arial, Helvetica, sans-serif', color: '#333', lineHeight: '22px' }}
                                value={formData.country}
                                data={pickupCountrySuggestions}
                                displayFields={['country']}
                                columnHeaders={['Country']}
                                onSelect={(item: Record<string, unknown>) => {
                                    onChange('country', String(item['displayName']));
                                }}
                                onChange={(val) => {
                                    setPickupCountryQuery(val);
                                    onChange('country', val);
                                }}
                                showTooltip={false}
                                required={countryZipEnabled || !isPrebooking}
                            />
                        </Box>
                    </Box>

                    <Box className={styles.row2Col}>
                        <Box data-eservice-field="PICKUP_ZIP_CODE">
                            <PTextField
                                fullWidth
                                label="Zip Code"
                                value={formData.zipCode}
                                onChange={(e) => onChange('zipCode', e.target.value)}
                                required={!isPrebooking}
                                labelSx={{ pb: 0 }}
                            />
                        </Box>
                        <Box data-eservice-field="PICKUP_CONTACT_NAME">
                            <PTextField
                                fullWidth
                                label="Contact Name 1"
                                value={formData.contactName1}
                                onChange={(e) => onChange('contactName1', e.target.value)}
                                labelSx={{ pb: 0,lineHeight: '15px' }}
                            />
                        </Box>
                    </Box>

                    <Box className={styles.row2Col}>
                        <Box data-eservice-field="PICKUP_PHONE_NUMBER">
                            <PTextField
                                fullWidth
                                label="Contact Phone 1"
                                value={formData.contactPhone1}
                                onChange={(e) => onChange('contactPhone1', e.target.value)}
                                type="tel"
                                labelSx={{ pb: 0 }}
                            />
                        </Box>
                        <Box data-eservice-field="PICKUP_EMAIL">
                            <PTextField
                                fullWidth
                                label="Contact Email 1"
                                value={formData.contactEmail1}
                                onChange={(e) => onChange('contactEmail1', e.target.value)}
                                type="email"
                                labelSx={{ pb: 0 }}
                            />
                        </Box>
                    </Box>

                    <Box className={styles.row2Col}>
                        <PTextField
                            fullWidth
                            label="Contact Name 2"
                            value={formData.contactName2}
                            onChange={(e) => onChange('contactName2', e.target.value)}
                            labelSx={{ pb: 0 }}
                        />
                        <PTextField
                            fullWidth
                            label="Contact Phone 2"
                            value={formData.contactPhone2}
                            onChange={(e) => onChange('contactPhone2', e.target.value)}
                            type="tel"
                            labelSx={{ pb: 0 }}
                        />
                    </Box>

                    <Box className={styles.row2Col}>
                        <PTextField
                            fullWidth
                            label="Contact Email 2"
                            value={formData.contactEmail2}
                            onChange={(e) => onChange('contactEmail2', e.target.value)}
                            type="email"
                            labelSx={{ pb: 0 }}
                        />
                        {showPickupReference && (
                            <Box data-eservice-field="PICKUP_REFERENCE">
                                <PTextField
                                    fullWidth
                                    label="Pickup Reference"
                                    value={formData.pickupReference}
                                    onChange={(e) => onChange('pickupReference', e.target.value)}
                                    labelSx={{ pb: 0 }}
                                />
                            </Box>
                        )}
                    </Box>

                    {showCoordinates && coordinatePickerState && (
                        <Box className={styles.row2Col}>
                            <PTextField
                                fullWidth
                                label="Latitude"
                                value={effectiveLatitude}
                                onChange={(e) => onChange('latitude', e.target.value)}
                                onBlur={coordinatePickerState?.onLatBlur}
                                labelSx={{ pb: 0 }}
                            />
                            <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
                                <PTextField
                                    fullWidth
                                    label="Longitude"
                                    value={effectiveLongitude}
                                    onChange={(e) => onChange('longitude', e.target.value)}
                                    onBlur={coordinatePickerState?.onLngBlur}
                                    labelSx={{ pb: 0 }}
                                />
                                <PMapCoordinatePicker
                                    latitude={effectiveLatitude}
                                    longitude={effectiveLongitude}
                                    onCoordinateChange={(lat, lng) => {
                                        onChange('latitude', String(lat));
                                        onChange('longitude', String(lng));
                                    }}
                                    mapType={effectiveMapType}
                                    mapZoom={coordinatePickerState.mapZoom}
                                />
                            </Box>
                        </Box>
                    )}
                </Box>

                <Box className={styles.rightCol}>
                    <Box className={styles.dateTimeRow}>
                        <Box data-eservice-field="PICKUP_DATE">
                            <PDatePicker
                                label='Estimated Pickup Date'
                                value={formData.estimatedPickupDate}
                                onChange={(val) => onChange('estimatedPickupDate', val)}
                            />
                        </Box>
                        <Box>
                            <label className={styles.fieldLabel}>Time</label>
                            <Box className={styles.timeRow}>
                                <Box data-eservice-field="PICKUP_TIME_FROM">
                                    <PSingleValueSearchableField
                                        sx={{ width: '100%' }}
                                        id="timeFrom"
                                        data={timeSuggestions}
                                        value={localTime.timeFrom}
                                        displayFields={['time']}
                                        columnHeaders={[]}
                                        onChange={(value) => {
                                          setTimeQuery(value);
                                          handleTimeChange('timeFrom', value);
                                        }}
                                        required={!isPrebooking}
                                    />
                                </Box>
                                <Box data-eservice-field="PICKUP_TIME_TO">
                                    <PSingleValueSearchableField
                                        sx={{ width: '100%' }}
                                        id="timeTo"
                                        data={timeSuggestions}
                                        value={localTime.timeTo}
                                        displayFields={['time']}
                                        columnHeaders={[]}
                                        onChange={(value) => {
                                          setTimeQuery(value);
                                          handleTimeChange('timeTo', value);
                                        }}
                                        required={!isPrebooking}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    </Box>

                    <Box data-eservice-field="PICKUP_INSTRUCTIONS">
                        <PTextField
                            fullWidth
                            label="Instructions"
                            value={formData.instructions}
                            onChange={(e) => onChange('instructions', e.target.value)}
                            multiline
                            rows={5}
                            className={styles.customerNameField}
                            labelSx={{ pb: 0 }}
                        />
                    </Box>

                    <Box>
                        <PDatePicker
                            value={formData.deliveryDate}
                            onChange={(val) => onChange('deliveryDate', val)}
                            label='Delivery Date'
                        />
                    </Box>

                    {/* <PTextField
                        fullWidth
                        label="Delivery Time"
                        value={formData.deliveryTime}
                        onChange={(e) => onChange('deliveryTime', e.target.value)}
                        labelSx={{ pb: 0 }}
                        sx={{ width: '30%' }}
                    /> */}
                    <PSingleValueSearchableField
                        sx={{ width: '30%' }}
                        label="Delivery Time"
                        id="deliveryTime"
                        data={timeSuggestions}
                        value={localTime.deliveryTime}
                        displayFields={['time']}
                        columnHeaders={[]}
                        onChange={(value) => {
                          setTimeQuery(value);
                          handleTimeChange('deliveryTime', value);
                        }}
                       
                    />
		  

                    <PickupAccessories
                        selected={formData.accessorials}
                        onChange={onAccessorialsChange}
                        options={accessorialOptions}
                    />
                </Box>
            </Box>

            {moduleType !== 'QUO' && (
                <>
                    <Box className={styles.cargoToggle} onClick={onCargoDetailsToggle}>
                        <span className={styles.cargoArrow}>{isCargoOpen ? '▼' : '▶'}</span>
                        <span>Cargo Details</span>
                    </Box>

                    {isCargoOpen && (
                        <Box>
                            <TruckingCargoDetails
                                moduleType={moduleType}
                                externalCargoRows={internalCargoRows}
                                onHazardousChange={onHazardousChange}
                                onCargoRowsChange={onCargoRowsChange}
                                isFCLBooking={isFCLBooking}
                                fclHazardousOptions={fclHazardousOptions}
                            />
                        </Box>
                    )}
                </>
            )}

            <PModal
                title="Organization Search"
                open={orgSearchOpen}
                isCloseIcon={true}
                onClose={() => onSetOrgSearchOpen(false)}
                height={{ xs: "85vh", md: "31rem" }}
                width={{ xs: "95vw", sm: "95vw", md: 1049 }}
                sx={{ backgroundColor: 'white' }}
                contentSx={{ pl: 0 }}
            >
                <Box className={styles.orgSearchContent}>
                    <POrganizationSearchPage
                        onSelect={(org) => {
                            // POrganizationSearch passes OrganizationResultDetail at runtime
                            const d = org as unknown as Record<string, string>;
                            const addr1 = d['organizationAddress'] ?? '';
                            const addr2 = d['organizationAddress2'] ?? '';
                            onOrgSelect({
                                code: d['organizationCode'] ?? d['custCode'] ?? '',
                                name: d['organizationName'] ?? '',
                                address: addr2 ? `${addr1}\n${addr2}` : addr1,
                                city: org.city ?? '',
                                state: org.state ?? '',
                                country: org.country ?? '',
                                zipCode: d['postalCode'] ?? org.postalCode ?? '',
                                contactName1: d['contactPerson'] ?? org.contactPerson ?? '',
                                contactPhone1: d['phoneNumber'] ?? org.phone ?? '',
                                contactEmail1: d['email'] ?? org.email ?? '',
                            });
                        }}
                    />
                </Box>
            </PModal>

        </Box>
    );
};

export default PickupDeliveryDetailsPanel;
