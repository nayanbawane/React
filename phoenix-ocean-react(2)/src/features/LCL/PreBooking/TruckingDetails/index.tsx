import React from 'react';
import { Box } from '@mui/material';
import { PGradientButton, PModal } from 'phoenix-react-lib';
import warningIcon from '@/assets/images/warning.png';
import { useStatus } from '@/context/statusContext';

import {
  TruckingDetails,
  PickupDeliveryDetailsPanel,
  TruckerDetailsPanel,
  PickupChargesSection,
  TruckerOptionsModal,
  type DoorDeliveryFormData,
  type InternalCargoRowData,
  type HeaderData,
  type TruckerFormData,
} from 'phoenix-common-react';

import {
  usePickupAccordionContent,
  usePickupDeliveryDetailsPanel,
  usePickupDeliveryDetailsPanelCoordinates,
  useTruckerDetailsPanel,
  useTruckerOptionsModal,
  useTruckingDetails,
  useDoorDeliveryAccordionContent,
} from '@/hooks/LCL/TruckingDetails/useTruckingDetails';

interface PickupAccordionContentWrapperProps {
  pickupIndex: number;
  onHeaderDataChange: (data: HeaderData) => void;
  externalCargoRows?: InternalCargoRowData[];
  hideFetchButton: boolean;
  moduleCode?: string;
  isFCLBooking?: boolean;
  fclHazardousOptions?: { label: string; value: string }[];
  initialPickupFormData?: any;
  initialTruckerFormData?: any;
  initialPickupCharges?: any[];
  moduleType: string;
}

const PickupAccordionContentWrapper: React.FC<
  PickupAccordionContentWrapperProps
> = ({
  pickupIndex,
  onHeaderDataChange,
  externalCargoRows,
  hideFetchButton,
  moduleCode,
  isFCLBooking,
  fclHazardousOptions,
  initialPickupFormData,
  initialTruckerFormData,
  initialPickupCharges,
  moduleType,
}) => {
  const { showStatus, hideStatus } = useStatus();
  const pickupDelivery = usePickupDeliveryDetailsPanel(initialPickupFormData);
  const truckerPanel = useTruckerDetailsPanel(initialTruckerFormData);
  const pickupAccordion = usePickupAccordionContent(
    externalCargoRows,
    moduleCode,
    initialPickupCharges,
    undefined,
    undefined,
    (data: Partial<TruckerFormData>) => truckerPanel.setFormData(prev => ({ ...prev, ...data })),
    undefined,
    undefined,
    undefined,
    undefined,
    () => truckerPanel.setIsUnlocked(false),
  );
  const coordinates = usePickupDeliveryDetailsPanelCoordinates(
    pickupDelivery.formData,
    (lat, lng) => {
      pickupDelivery.handleChange('latitude', lat);
      pickupDelivery.handleChange('longitude', lng);
    }
  );
  const truckerModal = useTruckerOptionsModal(pickupAccordion.truckerRates);

  const onHeaderDataChangeRef = React.useRef(onHeaderDataChange);
  React.useEffect(() => {
    onHeaderDataChangeRef.current = onHeaderDataChange;
  });

  React.useEffect(() => {
    pickupAccordion.handlePickupFormDataChange(
      pickupDelivery.formData,
      onHeaderDataChangeRef.current
    );
  }, [pickupDelivery.formData]);

  return (
    <Box>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
        <Box sx={{ flex: 1 }}>
          <PickupDeliveryDetailsPanel
            formData={pickupDelivery.formData}
            orgSearchOpen={pickupDelivery.orgSearchOpen}
            onSetOrgSearchOpen={pickupDelivery.setOrgSearchOpen}
            onChange={pickupDelivery.handleChange as any}
            onAccessorialsChange={pickupDelivery.handleAccessorialsChange}
            onHazardousChange={pickupDelivery.handleHazardousChange}
            onOrgSelect={pickupDelivery.handleOrgSelect}
            internalCargoRows={pickupAccordion.internalCargoRows}
            onCargoRowsChange={pickupAccordion.handleCargoRowsChange}
            onCargoDetailsToggle={() =>
              pickupAccordion.setCargoOpen((prev) => !prev)
            }
            isCargoOpen={pickupAccordion.cargoOpen}
            coordinatePickerState={{
              locationKey: `map-pickup-${pickupIndex}`,
              latError: coordinates.latError || undefined,
              lngError: coordinates.lngError || undefined,
              onLatBlur: coordinates.handleLatBlur,
              onLngBlur: coordinates.handleLngBlur,
            }}
            moduleCode={moduleCode}
            isFCLBooking={isFCLBooking}
            fclHazardousOptions={fclHazardousOptions}
            moduleType={moduleType}
            onWarning={(msg) => (msg ? showStatus('error', [msg]) : hideStatus())}
          />
        </Box>
        <Box sx={{ flex: '0 0 auto' }}>
          <TruckerDetailsPanel
            formData={truckerPanel.formData}
            orgSearchOpen={truckerPanel.orgSearchOpen}
            onSetOrgSearchOpen={truckerPanel.setOrgSearchOpen}
            onChange={truckerPanel.handleChange}
            onOrgSelect={truckerPanel.handleOrgSelect}
            isUnlocked={truckerPanel.isUnlocked}
            onSetUnlocked={truckerPanel.setIsUnlocked}
            onFetchTruckRates={pickupAccordion.handleFetchTruckRates}
            isFetchingRates={pickupAccordion.isFetchingRates}
            hideFetchButton={hideFetchButton}
            moduleCode={moduleCode}
            isFCLBooking={isFCLBooking}
          />
        </Box>
      </Box>

      <PickupChargesSection charges={pickupAccordion.pickupCharges} moduleType={moduleType}/>

      <PModal
        open={pickupAccordion.validationOpen}
        title="Validation Error"
        isCloseIcon={false}
        onClose={() => pickupAccordion.setValidationOpen(false)}
        width={620}
        height={340}
      >
        <Box
          sx={{
            backgroundColor: '#fef9e4',
            border: '1px solid #e6d96b',
            borderRadius: '3px',
            p: '10px 12px',
            m: '8px 4px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start',
            height: '200px',
          }}
        >
          <img
            src={warningIcon}
            alt="warning"
            style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }}
          />
          <Box
            sx={{
              fontFamily: 'Arial, Helvetica, sans-serif',
              fontSize: '12px',
              color: '#333',
            }}
          >
            {pickupAccordion.validationErrors.map((msg) => (
              <Box key={msg}>{msg}</Box>
            ))}
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            pr: '4px',
            pt: '6px',
          }}
        >
          <PGradientButton
            title="Ok"
            onClick={() => pickupAccordion.setValidationOpen(false)}
            sx={{
              minWidth: '60px',
              height: '25px',
              borderRadius: '3px',
              fontSize: '13px',
            }}
          />
        </Box>
      </PModal>

      <TruckerOptionsModal
        open={pickupAccordion.truckerOptionsOpen}
        onClose={() => pickupAccordion.setTruckerOptionsOpen(false)}
        pickupCity={pickupAccordion.truckerCity}
        pickupZipCode={pickupAccordion.truckerZip}
        deliveryLocationCode={pickupAccordion.deliveryLocationCode}
        deliveryZipCode={pickupAccordion.deliveryZipCode}
        piecesTotal={pickupAccordion.piecesTotal}
        weightTotal={pickupAccordion.weightTotal}
        volumeTotal={pickupAccordion.volumeTotal}
        pickupIndex={pickupIndex}
        rates={pickupAccordion.truckerRates}
        isFetching={pickupAccordion.isFetchingRates}
        onSelectRate={pickupAccordion.handleSelectRate}
        pickupAccessorials={pickupAccordion.currentPickupFormData?.accessorials ?? []}
        mainOpen={truckerModal.mainOpen}
        setMainOpen={truckerModal.setMainOpen}
        ratesOpen={truckerModal.ratesOpen}
        setRatesOpen={truckerModal.setRatesOpen}
        stackable={truckerModal.stackable}
        setStackable={truckerModal.setStackable}
        shipmentType={truckerModal.shipmentType}
        setShipmentType={truckerModal.setShipmentType}
        sortRules={truckerModal.sortRules}
        expandedRows={truckerModal.expandedRows}
        displayCount={truckerModal.displayCount}
        setDisplayCount={truckerModal.setDisplayCount}
        allOpen={truckerModal.allOpen}
        handleSort={truckerModal.handleSort}
        handleToggleRow={truckerModal.handleToggleRow}
        sortedRates={truckerModal.sortedRates}
        displayedRates={truckerModal.displayedRates}
        hasMore={truckerModal.hasMore}
      />
    </Box>
  );
};

interface BookingTruckingDetailsProps {
  pickups: number[];
  onAddPickup?: () => void;
  onRemovePickup?: (index: number) => void;
  externalCargoRows?: InternalCargoRowData[];
  doorDeliveryFormData?: DoorDeliveryFormData;
  onDoorDeliveryFormDataChange?: (
    field: keyof DoorDeliveryFormData,
    value: unknown
  ) => void;
  moduleCode?: string;
  isFCLBooking?: boolean;
  fclHazardousOptions?: { label: string; value: string }[];
  doorDeliveryRaw?: ReturnType<typeof useDoorDeliveryAccordionContent>;
  showMultiPickupControls?: boolean;
  routing?: any;
  moduleType: string;
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (formData: any) => void;
}

const PreBookingTruckingDetails: React.FC<BookingTruckingDetailsProps> = ({
  moduleType,
  pickups,
  onAddPickup,
  onRemovePickup,
  externalCargoRows,
  doorDeliveryFormData,
  onDoorDeliveryFormDataChange,
  moduleCode,
  isFCLBooking,
  fclHazardousOptions,
  doorDeliveryRaw,
  showMultiPickupControls,
  routing,
  onRegisterFields,
  onFieldsChange,
}) => {
  const truckingState = useTruckingDetails(
    pickups,
    doorDeliveryFormData,
    onDoorDeliveryFormDataChange,
    routing?.pickupState?.headerDataMap ?? {}
  );

  return (
    <TruckingDetails
      moduleType={moduleType}
      pickups={pickups}
      outerOpenItems={truckingState.outerOpenItems}
      onToggleOuter={truckingState.handleToggleOuter}
      collapsedSet={truckingState.collapsedSet}
      onToggleCollapse={truckingState.handleToggleCollapse}
      headerDataMap={truckingState.headerDataMap}
      hasDoorDelivery={truckingState.hasDoorDelivery}
      hasPickups={truckingState.hasPickups}
      isCombined={truckingState.isCombined}
      doorDeliveryCollapsed={truckingState.doorDeliveryCollapsed}
      onSetDoorDeliveryCollapsed={truckingState.setDoorDeliveryCollapsed}
      onAddPickup={onAddPickup}
      onRemovePickup={onRemovePickup}
      routing={routing}
      showMultiPickupControls={!!showMultiPickupControls}
      doorDeliveryFormData={doorDeliveryFormData}
      onDoorDeliveryFormDataChange={onDoorDeliveryFormDataChange}
      doorDeliveryChargesState={
        doorDeliveryRaw
          ? {
              isFetchingRates: doorDeliveryRaw.isFetchingRates,
              truckerSearchOpen: doorDeliveryRaw.truckerSearchOpen,
              onSetTruckerSearchOpen: doorDeliveryRaw.setTruckerSearchOpen,
              onFetchTruckRates: doorDeliveryRaw.handleFetchTruckRates,
              buyTotal: doorDeliveryRaw.buyTotal,
              sellTotal: doorDeliveryRaw.sellTotal,
              profitLoss: doorDeliveryRaw.profitLoss,
              chargeRows: doorDeliveryRaw.chargeRows,
            }
          : undefined
      }
      renderPickupContent={(pickupId, pickupIndex, isCombined) => (
        <PickupAccordionContentWrapper
          pickupIndex={pickupIndex}
          onHeaderDataChange={(data) =>
            truckingState.handleHeaderDataChange(pickupId, data)
          }
          externalCargoRows={
            routing?.pickupState?.truckingCargoRowsMap?.[pickupId] ??
            externalCargoRows
          }
          hideFetchButton={isCombined}
          moduleCode={moduleCode}
          isFCLBooking={isFCLBooking}
          fclHazardousOptions={fclHazardousOptions}
          initialPickupFormData={routing?.pickupState?.truckingPickupForms?.[pickupId]}
          initialTruckerFormData={routing?.pickupState?.pickupTruckerForms?.[pickupId]}
          initialPickupCharges={routing?.pickupState?.pickupChargeMap?.[pickupId] ?? []}
          moduleType={moduleType}
        />
      )}
    />
  );
};

export default PreBookingTruckingDetails;
