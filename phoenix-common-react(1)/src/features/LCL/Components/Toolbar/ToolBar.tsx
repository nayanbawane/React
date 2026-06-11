import React, { useState } from 'react';
import { Box } from '@mui/material';
// @ts-ignore
import videoIcon from '@/assets/video-button-normal.svg';
// @ts-ignore
import bookIcon from '@/assets/book-button-normal.svg';
// @ts-ignore
import saveIcon from '../../../../assets/save.png';
// @ts-ignore
import eDocsButtonIcon from '../../../../assets/e-docs.png';
// @ts-ignore
import notesIcon from '../../../../assets/notes-icon.png';
// @ts-ignore
import eDocsIcon from '../../../../assets/docs-icon.png';

import { PSelect, PGradientButton, ProgressBar } from 'phoenix-react-lib';
import styles from '../../../../styles/LCL/ToolBar.module.css';
import Loader from '../Loader/Loader';
import ShipmentMilestoneTracking from '../ShipmentMilestoneTracking/ShipmentMilestoneTracking';
import type { MilestoneStep } from '../ShipmentMilestoneTracking/ShipmentMilestoneTracking';
import VersionButton from '../BkgEserviceVersion/BkgEserviceVersionButton';
import { useGetSelections } from '../../../../hooks/LCL/useGetSelections';
import { tmsShipmentStatusConfig } from '../../../../hooks/LCL/selectionHelpers';
import { ApiService } from '../../../../core/api/client';
import { COMMON_ENDPOINTS } from '../../../../core/api/config/common.endpoints';
import { useAppSelector } from '@/app/store/hooks';

const BOOKING_ACTION: string[] = ['Copy Booking', 'Cancel Booking'];
const PREBOOKING_ACTION: string[] = ['Copy PreBooking', 'Cancel PreBooking'];
const QUOTE_ACTION: string[] = [
  'Send Document',
  'Copy Quote',
];
const SELECT_ACTION_SX = {
  height: '30px',
  width: '140px',
  '& .phx-PSelect-module-placeholder': {
    color: '#333',
  },

  '& .MuiOutlinedInput-root': {
    height: '30px',
    padding: '0',
    background: 'transparent',

    '& fieldset': {
      border: 'none',
    },
  },

  '& .MuiSelect-select': {
    height: '30px !important',
    display: 'flex',
    alignItems: 'center',
    padding: '0 10px !important',
    paddingRight: '35px !important',
    fontWeight: 600,
    fontSize: '12px',
  },

  '& .MuiSelect-icon': {
    right: '0px',
    width: '26px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
  },
};

interface ToolBarProps {
  tabId?: string;
  onNotesClick?: () => void;
  onDocumentsClick?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  onToggleAll?: () => void;
  isAllOpen?: boolean;
  handleClearAll?: () => void;
  progress: number;
  isSaved?: boolean;
  disableDocuments?: boolean;
  onCancelBooking?: () => void;
  onCopyBooking?: () => void;
  moduleType?: string;
  isCancelled?: boolean;
  onCopyQuote?: () => void;
  isDisplayPreviewButton?: boolean;
  onPreview?: () => void;
  tmsShipmentId?: string;
  oneDocsClick?: () => void;
  showPrintLabelAction?: boolean;
  showTransmitToWarehouseAction?: boolean;
  showReTransmitToWarehouseAction?: boolean;
  transmitToWarehouse?: () => void;
  showCancelToWarehouseAction?: boolean;
  showCancelSOToWarehouseAction?: boolean;
  onPrintLabel?: () => void;
  statusBadgeStatus?: string;
  statusBadgeText?: string;
  referenceNumber?: string;
  isDataPopulated?: boolean;
}

export const ToolBar: React.FC<ToolBarProps> = ({
  tabId,
  onNotesClick,
  onDocumentsClick,
  onSubmit,
  isSubmitting = false,
  onToggleAll,
  isAllOpen = false,
  handleClearAll,
  progress = 1,
  isSaved = false,
  disableDocuments = true,
  onCancelBooking,
  onCopyBooking,
  moduleType = 'BOOKING',
  isDisplayPreviewButton = true,
  isCancelled,
  onCopyQuote,
  onPreview,
  tmsShipmentId,
  oneDocsClick,
  showPrintLabelAction,
  showTransmitToWarehouseAction,
  showReTransmitToWarehouseAction,
  transmitToWarehouse,
  showCancelToWarehouseAction,
  showCancelSOToWarehouseAction,
  onPrintLabel,
  statusBadgeStatus,
  statusBadgeText,
  referenceNumber,
  isDataPopulated
}) => {
  const [action, setAction] = useState('');
  const { data: tmsStatusData } = useGetSelections({ ...tmsShipmentStatusConfig('BKG') });
  const tmsStatusOptions = (tmsStatusData ?? []).filter(opt => opt.value !== '-1');

  const tmsSteps: MilestoneStep[] = tmsStatusOptions.map(opt => {
    const raw = opt.value as string;
    return { label: raw.includes('~') ? raw.split('~')[0] : raw };
  });

  const tmsMatchMap: Record<string, string> = Object.fromEntries(
    tmsStatusOptions.map(opt => {
      const raw = opt.value as string;
      const displayLabel = raw.includes('~') ? raw.split('~')[0] : raw;
      return [displayLabel, opt.value as string];
    })
  );

  const [localTmsOpen, setLocalTmsOpen] = useState(false);
  const [localTmsLoading, setLocalTmsLoading] = useState(false);
  const [localTmsSteps, setLocalTmsSteps] = useState<MilestoneStep[] | undefined>(undefined);

  const handleTmsTrackingClickInternal = async () => {
    if (localTmsOpen) {
      setLocalTmsOpen(false);
      return;
    }

    if (!tmsShipmentId) {
      setLocalTmsOpen(true);
      return;
    }

    setLocalTmsLoading(true);
    try {
      const response = await ApiService.post(
        COMMON_ENDPOINTS.CARRIER_OPTIONS.GET_SHIPMENT_STATUS_HISTORY,
        {
          authenticationKey: '',
          moduleCode: 'BKG',
          shipmentIDs: [tmsShipmentId],
          referenceNumbers: referenceNumber ? [referenceNumber] : [],
        }
      );

      const responseData = response?.data || response;
      const activityHistory: any[] = responseData?.activityHistory ?? responseData?.result?.activityHistory ?? [];

      const mergedSteps: MilestoneStep[] = tmsSteps.map((step: MilestoneStep) => {
        const matchKey = tmsMatchMap[step.label] ?? step.label;
        const match = activityHistory.find((item: any) =>
          item.activityDescription?.toLowerCase().includes(matchKey.toLowerCase())
        );
        if (!match) return step;
        const [activeDate = '', activeTime = ''] = match.activityDate?.split(' ') ?? [];
        return { label: step.label, isActive: true, activeDate, activeTime };
      });

      setLocalTmsSteps(mergedSteps);
    } catch {
      setLocalTmsSteps(undefined);
    } finally {
      setLocalTmsLoading(false);
      setLocalTmsOpen(true);
    }
  };

  const toggleAllLabel = isAllOpen ? 'Close All' : 'Open All';

  const badgeBgMap: Record<string, string> = {
    wait: '#ffa500',
    success: '#66c602',
    failure: '#d70000',
    pending: '#ff0',
  };
  const badgeBg = badgeBgMap[statusBadgeStatus] ?? badgeBgMap.pending;

  const handleActionChange = (value: string) => {
    setAction(value);
    if (value === 'Cancel Booking' || value === 'Cancel PreBooking') {
      onCancelBooking?.();
    }
    if (value === 'Copy Booking' || value === 'Copy PreBooking') {
      onCopyBooking?.();
    }
    if (value === 'Copy Quote') {
      onCopyQuote?.();
    }
    if (value === 'Transmit to Warehouse' || value === 'Re-Transmit to Warehouse') {
      transmitToWarehouse?.();
    }
    if (value === 'Print Label') {
      onPrintLabel?.();
    }
  };

  const bookingActions = [
    ...BOOKING_ACTION,
    ...(showPrintLabelAction ? ['Print Label'] : []),
    ...(showTransmitToWarehouseAction ? ['Transmit to Warehouse'] : []),
    ...(showReTransmitToWarehouseAction ? ['Re-Transmit to Warehouse'] : []),
    ...(showCancelToWarehouseAction ? ['Cancel to Warehouse'] : []),
    ...(showCancelSOToWarehouseAction ? ['Cancel SO to Warehouse'] : []),
  ];

  const actionOptions = isCancelled
    ? []
    : (
      moduleType === 'PREBKG'
        ? PREBOOKING_ACTION
        : moduleType === 'QUO'
          ? QUOTE_ACTION
          : bookingActions
    ).map((item) => ({
      label: item,
      value: item,
    }));

  const showBkgVersionButton =
    useAppSelector(
      state => state.versionbutton?.doDisplayVersionButton
    );

  return (
    <>
      <Box className={styles.toolbar}>
        {/* ===== LEFT GROUP: Notes & Documents ===== */}
        <Box className={styles.leftGroup}>
          {/*@ts-ignore*/}
          <PGradientButton
            title="Notes"
            icon={<img src={notesIcon} alt="Notes" />}
            className={`${styles.toolbarButton} ${styles.notesButton}`}
            onClick={onNotesClick}
            disabled={moduleType === "QUO" ? !isDataPopulated : false}
          />
          {/*@ts-ignore*/}
          <PGradientButton
            title="Documents"
            icon={<img src={eDocsIcon} alt="Documents" />}
            className={`${styles.toolbarButton} ${styles.documentsButton}`}
            onClick={onDocumentsClick}
            disabled={isSubmitting || disableDocuments || isCancelled}
          />
        </Box>

        {/* ===== SPACER ===== */}
        <Box sx={{ flex: 1 }} />

        {statusBadgeText && (
          <Box component="span" className={styles.statusBadge} style={{ backgroundColor: badgeBg }}>
            {statusBadgeText}
          </Box>
        )}

        {/* ===== TMS TRACKING BUTTON ===== */}
        {tmsShipmentId &&
          (localTmsLoading ? (
            <Loader />
          ) : (
            <PGradientButton
              title={`TMS Tracking ${tmsShipmentId}`}
              className={`${styles.toolbarButton} ${styles.tmsTrackingButton}`}
              onClick={handleTmsTrackingClickInternal}
              disabled={isSubmitting}
            />
          ))}

        {/* ===== ICON BUTTONS (Video, Book) ===== */}
        <Box className={styles.iconGrouping}>
          <button id="video_icon" className={styles.svgIconButton}>
            <img src={videoIcon} alt="Video" />
          </button>
          <button id="book_icon" className={styles.svgIconButton}>
            <img src={bookIcon} alt="Book" />
          </button>
        </Box>

      {/* ===== ACTION BUTTONS (Close All, Clear All, Preview, Save, eDocs) ===== */}
      <Box className={styles.actionButtons}>
        {/*@ts-ignore*/}
        <PGradientButton
          title={toggleAllLabel}
          className={`${styles.toolbarButton} ${styles.closeAllButton}`}
          onClick={onToggleAll}
          disabled={isSubmitting}
        />
        {/*@ts-ignore*/}
        <PGradientButton
          title="Clear All"
          className={`${styles.toolbarButton} ${styles.clearAllButton}`}
          onClick={handleClearAll}
        />
        {/*@ts-ignore*/}
        <VersionButton showVersionButton={showBkgVersionButton} tabId={tabId} />

          {isDisplayPreviewButton ? (
            <PGradientButton
              title="Preview"
              className={`${styles.toolbarButton} ${styles.previewButton}`}
              onClick={onPreview}
            />
          ) : (
            ''
          )}
          {/*@ts-ignore*/}

          {isSubmitting ? (
            <Loader />
          ) : (
            <PGradientButton
              title="Save"
              icon={<img src={saveIcon} alt="Save" />}
              className={`${styles.toolbarButton} ${styles.saveButton}`}
              onClick={onSubmit}
              disabled={isSubmitting || isCancelled}
            />
          )}

          {/*@ts-ignore*/}
          <PGradientButton
            title="eDocs"
            icon={<img src={eDocsButtonIcon} alt="eDocs" />}
            className={`${styles.toolbarButton} ${styles.eDocsButton}`}
            onClick={oneDocsClick}
          />
        </Box>

        {/* ===== SELECT ACTION DROPDOWN ===== */}
        <Box className={styles.selectWrapper}>
          {/*@ts-ignore*/}
          <PSelect
            onChange={handleActionChange}
            options={actionOptions}
            value={isCancelled ? '' : action}
            placeholder="Select Action"
            disabled={isSubmitting || isCancelled}
            sx={SELECT_ACTION_SX}
          />
        </Box>

        {/* ===== FORM COMPLETED + PROGRESS (Top Right) ===== */}
        {progress && (
          <Box className={styles.formCompletedContainer}>
            <Box className={styles.formCompletedLabel}>Form Completed</Box>
            <Box className={styles.formCompletedProgressRow}>
              <Box className={styles.progressBar}>
                <ProgressBar progressValue={progress} />
              </Box>
              <span className={styles.formCompletedPercentage}>
                {progress}%
              </span>
            </Box>
          </Box>
        )}
      </Box>
      {tmsShipmentId && localTmsOpen && (
        <ShipmentMilestoneTracking
          steps={localTmsSteps ?? tmsSteps}
        />
      )}
    </>
  );
};

export default ToolBar;