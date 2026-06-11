import React from 'react';
import { Box } from '@mui/material';
import { PGradientButton } from 'phoenix-react-lib';
import minusImg from '@/assets/images/minus.png';
import plusImg from '@/assets/images/plus.png';

import DoorDeliveryAccordionContent from './DoorDeliveryAccordionContent';
import styles from '../../../../styles/LCL/TruckingDetails.module.css';
import { TruckingDetailsProps } from '../../../../types/LCL/misc/TruckingDetails.types';
import { useFeatureToggle } from '../../../../hooks';
import { CommonToggleKeys } from '../../../../core';
import { useStatus } from '@/context/statusContext';
const MONTHS = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC',
];

const formatPickupDate = (date: Date | null): string => {
  if (!date) return '';
  const d = String(date.getDate()).padStart(2, '0');
  const m = MONTHS[date.getMonth()];
  const y = date.getFullYear();
  return `${d}-${m}-${y}`;
};

const TruckingDetails: React.FC<TruckingDetailsProps> = ({
  moduleType,
  collapsedSet,
  onToggleCollapse,
  headerDataMap,
  hasDoorDelivery,
  hasPickups,
  isCombined,
  doorDeliveryCollapsed,
  onSetDoorDeliveryCollapsed,
  pickups,
  onAddPickup,
  onRemovePickup,
  doorDeliveryFormData,
  onDoorDeliveryFormDataChange,
  doorDeliveryChargesState,
  renderPickupContent,
  renderPickupHeaderExtra,
  accessorialOptions,
  doorAccessorialOptions
}) => {
  const { showStatus, hideStatus } = useStatus();
  const { isVisible } = useFeatureToggle();
  const showMultiPickupControls = isVisible(
    CommonToggleKeys.OFR_BKG_ADD_MULTIPLE_PICKUP_INSTRUCTION
  );
  const isPrebooking = moduleType === 'prebooking';

  return (
    <Box className={styles.wrapper}>
      <Box className={styles.accordionContent}>
        {hasPickups &&
          pickups.map((pickupId, index) => {
            const isCollapsed = collapsedSet.has(pickupId);
            const hd = headerDataMap[pickupId];
            const datePart = formatPickupDate(hd?.estimatedPickupDate ?? null);
            const infoParts = [datePart, hd?.city, hd?.zipCode].filter(Boolean);
            const headerLabel =
              infoParts.length > 0
                ? `Pickup ${String(index + 1).padStart(3, '0')} - ${infoParts.join(', ')}`
                : `Pickup ${String(index + 1).padStart(3, '0')}`;

            return (
              <Box
                key={pickupId}
                className={index > 0 ? styles.pickupItemSpacing : undefined}
              >
                <Box
                  className={`${styles.sectionHeaderBar} ${isCollapsed ? styles.sectionHeaderBarCollapsed : styles.sectionHeaderBarExpanded}`}
                >
                  <Box
                    className={`${styles.pickupHeaderLeft} ${isCollapsed ? styles.pickupHeaderLeftCollapsed : styles.pickupHeaderLeftExpanded}`}
                  >
                    <Box component="span" className={styles.headerLabelText}>
                      {headerLabel}
                    </Box>
                    <Box component="span" className={styles.pendingBadge}>
                      Pending Truck Rates
                    </Box>
                  </Box>
                  <Box className={styles.headerControls}>
                    {renderPickupHeaderExtra?.(pickupId)}
                    {showMultiPickupControls && !isPrebooking && (
                      <PGradientButton
                        title="Add"
                        onClick={onAddPickup}
                        className={styles.pickupActionBtn}
                      />
                    )}
                    {showMultiPickupControls && pickups.length > 1 && (
                      <PGradientButton
                        title="Cancel"
                        onClick={() => onRemovePickup?.(index)}
                        className={styles.pickupActionBtn}
                      />
                    )}
                    <Box
                      className={`${styles.collapseToggle} ${isCollapsed ? styles.collapseToggleCollapsed : styles.collapseToggleExpanded}`}
                      onClick={() => onToggleCollapse(pickupId)}
                    >
                      <img
                        src={isCollapsed ? plusImg : minusImg}
                        alt={isCollapsed ? 'expand' : 'collapse'}
                        className={styles.toggleImg}
                      />
                    </Box>
                  </Box>
                </Box>

                <Box
                  className={
                    isCollapsed ? styles.pickupContentHidden : undefined
                  }
                >
                  {renderPickupContent(pickupId, index, isCombined)}
                </Box>
              </Box>
            );
          })}

        {hasDoorDelivery &&
          doorDeliveryFormData &&
          onDoorDeliveryFormDataChange &&
          doorDeliveryChargesState && (
            <Box
              className={
                hasPickups ? styles.doorDeliveryWrapperSpaced : undefined
              }
            >
              <Box
                className={`${styles.sectionHeaderBar} ${doorDeliveryCollapsed ? styles.sectionHeaderBarCollapsed : styles.sectionHeaderBarExpanded}`}
              >
                <Box
                  className={`${styles.doorDeliveryHeaderLabel} ${doorDeliveryCollapsed ? styles.doorDeliveryHeaderLabelCollapsed : styles.doorDeliveryHeaderLabelExpanded}`}
                >
                  Door Delivery Details
                </Box>
                <Box
                  className={`${styles.doorDeliveryCollapseToggle} ${doorDeliveryCollapsed ? styles.collapseToggleCollapsed : styles.collapseToggleExpanded}`}
                  onClick={() =>
                    onSetDoorDeliveryCollapsed(!doorDeliveryCollapsed)
                  }
                >
                  <img
                    src={doorDeliveryCollapsed ? plusImg : minusImg}
                    alt={doorDeliveryCollapsed ? 'expand' : 'collapse'}
                    className={styles.toggleImg}
                  />
                </Box>
              </Box>

              <Box
                className={[
                  doorDeliveryCollapsed
                    ? styles.doorDeliveryContentHidden
                    : undefined,
                  isCombined ? styles.doorDeliveryContentCombined : undefined,
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <DoorDeliveryAccordionContent
                moduleType={moduleType}
                  formData={doorDeliveryFormData}
                  onFormDataChange={onDoorDeliveryFormDataChange}
                  isFetchingRates={doorDeliveryChargesState.isFetchingRates}
                  truckerSearchOpen={doorDeliveryChargesState.truckerSearchOpen}
                  onSetTruckerSearchOpen={
                    doorDeliveryChargesState.onSetTruckerSearchOpen
                  }
                  onFetchTruckRates={doorDeliveryChargesState.onFetchTruckRates}
                  buyTotal={doorDeliveryChargesState.buyTotal}
                  sellTotal={doorDeliveryChargesState.sellTotal}
                  profitLoss={doorDeliveryChargesState.profitLoss}
                  chargeRows={doorDeliveryChargesState.chargeRows}
                  doorAccessorialOptions={doorAccessorialOptions}
                  onWarning={(msg) => (msg ? showStatus('error', [msg]) : hideStatus())}
                />
              </Box>
            </Box>
          )}
      </Box>
    </Box>
  );
};

export default TruckingDetails;
