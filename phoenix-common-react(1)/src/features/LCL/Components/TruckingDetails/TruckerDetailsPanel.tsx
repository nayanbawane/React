import React from 'react';
import { Box } from '@mui/material';
import {
  PDatePicker,
  PGradientButton,
  PModal,
  PSingleValueSearchableField,
  PTextField,
} from 'phoenix-react-lib';
import searchIcon from '@/assets/images/search-icon.png';
import POrganizationSearchPage from '../OrganizationSearch/POrganizationSearchPage';
import styles from '../../../../styles/LCL/TruckingDetails.module.css';
import { TruckerFormData } from '../../../../types/LCL/misc/TruckingDetails.types';
import {
  buildPickupTruckerData,
  useFeatureToggle,
  useGetSuggestions,
} from '../../../../hooks/LCL';
import { CommonToggleKeys, MODULE_BKG } from '../../../../core';
import { useAppSelector } from '../../../../app/store/hooks';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';

const TOGGLE_BTN_SX = {
  minWidth: '36px',
  height: '20px',
  borderRadius: '2px',
  fontSize: '11px',
  px: '6px',
} as const;

interface TruckerDetailsPanelProps {
  formData: TruckerFormData;
  orgSearchOpen: boolean;
  onSetOrgSearchOpen: (open: boolean) => void;
  onChange: (field: keyof TruckerFormData, value: unknown) => void;
  onOrgSelect: (org: { code: string; name: string }) => void;
  isUnlocked: boolean;
  onSetUnlocked: (v: boolean) => void;
  onFetchTruckRates?: () => void;
  isFetchingRates?: boolean;
  hideFetchButton?: boolean;
  moduleCode?: string;
  isFCLBooking?: boolean;
  isShipcoTms?: boolean;
  deliveryType?: string;
  onTrkStatusChange?: (status: string | null) => void;
  onShowTransmitButton?: (show: boolean) => void;
}

const TruckerDetailsPanel: React.FC<TruckerDetailsPanelProps> = ({
  formData,
  orgSearchOpen,
  onSetOrgSearchOpen,
  onChange,
  onOrgSelect,
  isUnlocked,
  onSetUnlocked,
  onFetchTruckRates,
  isFetchingRates = false,
  hideFetchButton = false,
  moduleCode,
  isFCLBooking = false,
  isShipcoTms = false,
  deliveryType = '',
  onTrkStatusChange,
  onShowTransmitButton,
}) => {
  const { isVisible } = useFeatureToggle();
  const loginClientBean = useAppSelector(selectLoginClientBean);

  const showTrkInstrTransmit = isVisible(CommonToggleKeys.OCEAN_IMP_TRK_INSTR_TRANSMIT);

  const isEDIPath =
    isVisible(CommonToggleKeys.OCEAN_TRK_ARN_REMOVE_EDI) &&
    isVisible(CommonToggleKeys.OPTER_BKG_TRANSMISSION_ENABLE);

  const showTruckerSlider = isVisible(
    CommonToggleKeys.OCEAN_TRK_BKG_QUO_TRUCKER_SLIDER
  );
  const fieldsDisabled = showTruckerSlider && !isUnlocked;

  const showFetchButton =
    !hideFetchButton &&
    isVisible(CommonToggleKeys.BKG_QUOTE_TRUCKING_RATES_INTEGRATION);
  const showTruckerQuoteFields =
    isVisible(CommonToggleKeys.OCN_BKG_TRUCKING_INSTRUCTION_REDESIGN) &&
    moduleCode === MODULE_BKG;
  const showConfirmButton =
    isVisible(CommonToggleKeys.OFR_BKG_ADD_MULTIPLE_PICKUP_INSTRUCTION) &&
    isVisible(
      CommonToggleKeys.OCEAN_FREIGHT_EMT_SHIPMENT_PICKUP_COMP_FROM_BKG
    ) &&
    isVisible(
      CommonToggleKeys.OCN_FRGHT_SHIPMENT_STATUS_UPDATE_SHIPMENT_PICKUP
    ) &&
    moduleCode === MODULE_BKG &&
    !isFCLBooking;

  const handleTruckerOrgSelect = (org: { code: string; name: string }) => {
    onOrgSelect(org);
    if (showTruckerSlider && !isShipcoTms) {
      onSetUnlocked(true);
    }
  };

  const { data: pickupTruckerData, setQuery: sethandlePickupTrucker } =
    useGetSuggestions(buildPickupTruckerData(loginClientBean as any));

  return (
    <Box className={styles.truckerContainer}>
      <span className={styles.title}>Trucker Details</span>

      {showTruckerSlider && (
        <Box
          sx={{ display: 'flex', alignItems: 'center', gap: '4px', mb: '6px' }}
        >
          <span
            style={{
              fontSize: '12px',
              fontFamily: 'Arial, Helvetica, sans-serif',
              color: '#333',
            }}
          >
            Unlock Trucker
          </span>
          <PGradientButton
            title="Yes"
            onClick={() => {
              if (!isShipcoTms) onSetUnlocked(true);
            }}
            sx={{ ...TOGGLE_BTN_SX, opacity: isUnlocked ? 1 : 0.45 }}
          />
          <PGradientButton
            title="No"
            onClick={() => onSetUnlocked(false)}
            sx={{ ...TOGGLE_BTN_SX, opacity: !isUnlocked ? 1 : 0.45 }}
          />
        </Box>
      )}

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
            onChange('truckerCode', value);


            const selected = pickupTruckerData?.find(
              (item: any) => item.Code === (value?.Code || value)
            );

            const raw = selected?.rawDetails || '';

            const segments = raw.split('~');
            const isIntegratedTrucker =
              segments.length > 14 && segments[14]?.toUpperCase() === 'Y';

            const isEDITrucker = isEDIPath && isIntegratedTrucker;

            const shouldShowTrk =
              isIntegratedTrucker &&
              !isEDITrucker &&
              showTrkInstrTransmit &&
              !isFCLBooking &&
              deliveryType.toUpperCase() === 'DOOR';
            if (shouldShowTrk) {
              onTrkStatusChange?.('P');
              onShowTransmitButton?.(true);
            } else {
              onTrkStatusChange?.(null);
              onShowTransmitButton?.(false);
            }

            const formattedDetails = raw
              .replace(/~~/g, '\n')
              .replace(/~/g, '\n')
              .split('\n')
              .map((line) => line.trim())
              .filter(Boolean)
              .join('\n');

            onChange('truckerDetails', formattedDetails);
          }}
          extendedStyle={true}
          showTooltip={true}
        />
        <img
          src={searchIcon}
          alt="search"
          className={styles.truckerSearchIcon}
          onClick={() => {
            if (!fieldsDisabled) onSetOrgSearchOpen(true);
          }}
        />
      </Box>

      <PTextField
        fullWidth
        label="Trucker Details"
        value={formData.truckerDetails}
        onChange={(e) => onChange('truckerDetails', e.target.value)}
        multiline
        rows={5}
        labelSx={{ pb: 0 }}
        className={styles.customerNameField}
        required
        disabled={fieldsDisabled}
      />

      <PTextField
        fullWidth
        label="Trucker Pro Number"
        value={formData.truckerProNumber}
        onChange={(e) => onChange('truckerProNumber', e.target.value)}
        labelSx={{ pb: 0 }}
        disabled={fieldsDisabled}
      />

      <Box>
        <PDatePicker
          onChange={(val) => onChange('estimatedDeliveryDate', val)}
          value={formData.estimatedDeliveryDate}
          label="Estimated Delivery Date"
        />
      </Box>

      <PTextField
        fullWidth
        label="Status"
        value={formData.status}
        onChange={(e) => onChange('status', e.target.value)}
        labelSx={{ pb: 0 }}
        disabled
      />

      {showTruckerQuoteFields && (
        <Box>
          <PTextField
            fullWidth
            label="Trucker Quote"
            value={formData.truckerQuote}
            onChange={(e) => onChange('truckerQuote', e.target.value)}
            labelSx={{ pb: 0 }}
            disabled={fieldsDisabled}
          />
          <PTextField
            fullWidth
            label="Trucker Reference"
            value={formData.truckerReference}
            onChange={(e) => onChange('truckerReference', e.target.value)}
            labelSx={{ pb: 0 }}
            disabled={fieldsDisabled}
          />
        </Box>
      )}

      {showConfirmButton && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-start', pt: '8px' }}>
          <PGradientButton
            title="Pick Up Confirm"
            sx={{ height: '25px', borderRadius: '3px', fontSize: '13px' }}
          />
        </Box>
      )}

      {showFetchButton && moduleCode !== "PREBKG" && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: '20px' }}>
          <PGradientButton
            title={isFetchingRates ? 'Fetching...' : 'Fetch Truck Rates'}
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

      <PModal
        title="Organization Search"
        open={orgSearchOpen}
        isCloseIcon={true}
        onClose={() => onSetOrgSearchOpen(false)}
        height={{ xs: '85vh', md: '31rem' }}
        width={{ xs: '95vw', sm: '95vw', md: 1049 }}
        sx={{ backgroundColor: 'white' }}
        contentSx={{ pl: 0 }}
      >
        <Box sx={{ backgroundColor: '#e9f6fe' }}>
          <POrganizationSearchPage onSelect={handleTruckerOrgSelect} />
        </Box>
      </PModal>
    </Box>
  );
};

export default TruckerDetailsPanel;
