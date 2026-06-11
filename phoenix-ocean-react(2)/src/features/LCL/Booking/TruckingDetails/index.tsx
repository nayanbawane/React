import React from 'react';
import { Box } from '@mui/material';
import { PGradientButton, PModal, PConfirmationModal } from 'phoenix-react-lib';
import warningIcon from '@/assets/images/warning.png';

import {
    TruckingDetails,
    PickupDeliveryDetailsPanel,
    TruckerDetailsPanel,
    PickupChargesSection,
    TruckerOptionsModal,
    CarrierOptionsModal,
    buildTmsCargoDetails,
    useFeatureToggle,
    CommonToggleKeys,
    MODULE_BKG,
    useGetSelections,
    deliveryAlternateGatewaySelectionConfig,
    type DoorDeliveryFormData,
    type InternalCargoRowData,
    type HeaderData,
    type AccessoriesOption,
    type PickupDeliveryFormData,
    type PickupDetailsFormData,
    type CarrierMainDetails,
    type CarrierQuote,
    type TmsBookingContext,
    type TruckerFormData,
    type BookWithTmsResult,
    type PickupCharge,
    type PickupTruckerInfo,
    type CargoMetrics,
    updateBookingMainDetails,
    CargoRowType,
    type TruckRateV1,
} from 'phoenix-common-react';

type TruckerOptionsMode = 'DRCF' | 'DRDR' | 'CFDR';

import { useStatus } from '@/context/statusContext';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';

import {
    usePickupAccordionContent,
    usePickupDeliveryDetailsPanel,
    usePickupDeliveryDetailsPanelCoordinates,
    useTruckerDetailsPanel,
    useTruckerOptionsModal,
    useTruckingDetails,
    useDoorDeliveryAccordionContent,
    useCarrierOptionsModal,
} from '@/hooks/LCL/TruckingDetails/useTruckingDetails';

// --- Field mapping ---

const mapDialogToTrucking = (d: PickupDetailsFormData): Partial<PickupDeliveryFormData> => ({
    postalCodeCity: d.postalCodeCity,
    pickupCargoAtCode: d.pickupCargoAtCode,
    estimatedPickupDate: d.estimatedPickupDate,
    name: d.name,
    instructions: d.instructions,
    streetAddress: d.streetAddress,
    city: d.pickupCity,
    zipCode: d.pickupZipCode,
    state: d.pickupState,
    country: d.pickupCountry,
    contactName1: d.contactName,
    contactPhone1: d.contactPhone,
    contactEmail1: d.contactEmail,
    accessorials: d.accessorials,
    latitude: d.latitude,
    longitude: d.longitude,
});

const mapTruckingToDialog = (t: PickupDeliveryFormData): Partial<PickupDetailsFormData> => ({
    postalCodeCity: t.postalCodeCity,
    pickupCargoAtCode: t.pickupCargoAtCode,
    estimatedPickupDate: t.estimatedPickupDate,
    name: t.name,
    instructions: t.instructions,
    streetAddress: t.streetAddress,
    pickupCity: t.city,
    pickupZipCode: t.zipCode,
    pickupState: t.state,
    pickupCountry: t.country,
    contactName: t.contactName1,
    contactPhone: t.contactPhone1,
    contactEmail: t.contactEmail1,
    accessorials: t.accessorials,
    latitude: t.latitude,
    longitude: t.longitude,
});

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

function formatPickupDate(date: Date | null): string {
    if (!date) return '';
    return `${String(date.getDate()).padStart(2, '0')}-${MONTHS[date.getMonth()]}-${date.getFullYear()}`;
}

function pickupFormToMainDetails(form: PickupDeliveryFormData | null, shipperReferenceNumber?: string): CarrierMainDetails | undefined {
    if (!form) return undefined;
    return {
        shipperReferenceNumber: shipperReferenceNumber || undefined,
        origin: {
            companyName: form.name,
            streetAddress: form.streetAddress,
            city: form.city || undefined,
            state: form.state || undefined,
            contactName: form.contactName1,
            contactPhone: form.contactPhone1,
            contactEmail: form.contactEmail1,
            zipCode: form.zipCode,
            pickupDate: formatPickupDate(form.estimatedPickupDate),
            pickupTimeFrom: form.timeFrom,
            pickupTimeTo: form.timeTo,
            accessorials: form.accessorials.length > 0 ? form.accessorials.join(', ') : undefined,
        },
    };
}

interface PickupFormSectionProps {
    initialData?: Partial<PickupDeliveryFormData>;
    onFormChange?: (partial: Partial<PickupDetailsFormData>) => void;
    onPickupFormDataChange: (data: PickupDeliveryFormData, onHeaderChange: (data: HeaderData) => void) => void;
    onHeaderDataChange: (data: HeaderData) => void;
    pickupIndex: number;
    internalCargoRows: InternalCargoRowData[];
    onCargoRowsChange: (rows: unknown[]) => void;
    onCargoDetailsToggle: () => void;
    isCargoOpen: boolean;
    moduleCode?: string;
    moduleType: string;
    isFCLBooking?: boolean;
    fclHazardousOptions?: { label: string; value: string }[];
    accessorialOptions?: AccessoriesOption[];
    doorAccessorialOptions? : AccessoriesOption[];
}

const PickupFormSection: React.FC<PickupFormSectionProps> = ({
    initialData,
    onFormChange,
    onPickupFormDataChange,
    onHeaderDataChange,
    pickupIndex,
    internalCargoRows,
    onCargoRowsChange,
    onCargoDetailsToggle,
    isCargoOpen,
    moduleCode,
    moduleType,
    isFCLBooking,
    fclHazardousOptions,
    accessorialOptions,
    doorAccessorialOptions
}) => {
    const { showStatus, hideStatus } = useStatus();
    const pickupDelivery = usePickupDeliveryDetailsPanel(initialData);
    const coordinates = usePickupDeliveryDetailsPanelCoordinates(
        pickupDelivery.formData,
        (lat, lng) => {
            pickupDelivery.handleChange('latitude', lat);
            pickupDelivery.handleChange('longitude', lng);
        },
    );

    const onHeaderDataChangeRef = React.useRef(onHeaderDataChange);
    React.useEffect(() => {
        onHeaderDataChangeRef.current = onHeaderDataChange;
    });

    React.useEffect(() => {
        onPickupFormDataChange(pickupDelivery.formData, onHeaderDataChangeRef.current);
        onFormChange?.(mapTruckingToDialog(pickupDelivery.formData));
    }, [pickupDelivery.formData]);

    return (
        <PickupDeliveryDetailsPanel
            formData={pickupDelivery.formData}
            orgSearchOpen={pickupDelivery.orgSearchOpen}
            onSetOrgSearchOpen={pickupDelivery.setOrgSearchOpen}
            onChange={pickupDelivery.handleChange as any}
            onAccessorialsChange={pickupDelivery.handleAccessorialsChange}
            onHazardousChange={pickupDelivery.handleHazardousChange}
            onOrgSelect={pickupDelivery.handleOrgSelect}
            internalCargoRows={internalCargoRows}
            onCargoRowsChange={onCargoRowsChange}
            onCargoDetailsToggle={onCargoDetailsToggle}
            isCargoOpen={isCargoOpen}
            coordinatePickerState={{
                locationKey: `map-pickup-${pickupIndex}`,
                latError: coordinates.latError || undefined,
                lngError: coordinates.lngError || undefined,
                onLatBlur: coordinates.handleLatBlur,
                onLngBlur: coordinates.handleLngBlur,
            }}
            moduleCode={moduleCode}
            moduleType={moduleType}
            isFCLBooking={isFCLBooking}
            fclHazardousOptions={fclHazardousOptions}
            accessorialOptions={accessorialOptions}
            onWarning={(msg) => (msg ? showStatus('error', [msg]) : hideStatus())}
            doorAccessorialOptions ={doorAccessorialOptions}
        />
    );
};

// --- PickupAccordionContentWrapper ---

interface PickupAccordionContentWrapperProps {
    pickupIndex: number;
    onHeaderDataChange: (data: HeaderData) => void;
    onTruckingPickupFormSync?: (formData: PickupDeliveryFormData) => void;
    onTruckerFormSync?: (formData: TruckerFormData) => void;
    externalCargoRows?: InternalCargoRowData[];
    hideFetchButton: boolean;
    moduleCode?: string;
    isFCLBooking?: boolean;
    fclHazardousOptions?: { label: string; value: string }[];
    initialPickupFormData?: any;
    initialTruckerFormData?: any;
    initialPickupCharges?: any[];
    moduleType: string;
    accessorialOptions?: AccessoriesOption[];
    doorAccessorialOptions? : AccessoriesOption[];
    confirmedData?: PickupDetailsFormData;
    confirmedVersion?: number;
    onPickupFormChange?: (partial: Partial<PickupDetailsFormData>) => void;
    shipperReference?: string;
    tmsContext?: TmsBookingContext;
    onBookingStatusChange?: (result: BookWithTmsResult) => void;
    doorDeliveryFormData?: DoorDeliveryFormData;
    routingFormData?: any;
    isBkgModule?: boolean;
    cargoDetails?: CargoRowType[];
    onPickupChargesChange?: (charges: PickupCharge[], truckerInfo?: PickupTruckerInfo) => void;
    onCargoMetricsChange?: (metrics: CargoMetrics) => void;
    onSelectDoorDeliveryRate?: (rate: TruckRateV1) => void;
    onRegisterFetchTruckRates?: (fn: () => void) => void;
    mainCargoRows?: CargoRowType[];
    onTrkStatusChange?: (status: string | null) => void;
}

const TRK_HEADER_CSS: Record<string, string> = {
    P: 'trkHeaderPending',
    S: 'trkHeaderSuccess',
    F: 'trkHeaderFailure',
    RP: 'trkHeaderPending',
};

const TRK_HEADER_LABEL: Record<string, string> = {
    P: 'TRK Transmit Pending',
    S: 'TRK Transmit Success',
    F: 'TRK Transmit Failure',
    RP: 'TRK Re-Transmit Pending',
};

const TRK_HEADER_COLORS: Record<string, { backgroundColor: string; color: string }> = {
    trkHeaderPending: { backgroundColor: '#ff0', color: '#000' },
    trkHeaderSuccess: { backgroundColor: '#66c602', color: '#fff' },
    trkHeaderFailure: { backgroundColor: '#d70000', color: '#fff' },
};

const TRK_HEADER_BADGE_SX = {
    fontFamily: 'Arial, Helvetica, sans-serif',
    fontSize: '13px',
    fontWeight: 'normal',
    display: 'inline-block',
    whiteSpace: 'nowrap',
    verticalAlign: 'middle',
    textAlign: 'center' as const,
    borderRadius: '5px',
    pt: '6px',
    pb: '5px',
    pl: '3px',
    pr: '5px',
    mt: '-1px',
    mb: '2px',
    mr: '10px',
    flexShrink: 0,
};

const PickupAccordionContentWrapper: React.FC<PickupAccordionContentWrapperProps> = ({
    pickupIndex,
    onHeaderDataChange,
    onTruckingPickupFormSync,
    onTruckerFormSync,
    externalCargoRows,
    hideFetchButton,
    moduleCode,
    isFCLBooking,
    fclHazardousOptions,
    moduleType,
    accessorialOptions,
    doorAccessorialOptions,
    tmsContext,
    initialPickupFormData,
    initialTruckerFormData,
    initialPickupCharges,
    confirmedData,
    confirmedVersion = 0,
    onPickupFormChange,
    shipperReference,
    onBookingStatusChange,
    doorDeliveryFormData,
    routingFormData,
    isBkgModule,
    cargoDetails,
    onPickupChargesChange,
    onCargoMetricsChange,
    onSelectDoorDeliveryRate,
    onRegisterFetchTruckRates,
    mainCargoRows,
    onTrkStatusChange,
}) => {
    const [showTransmitButton, setShowTransmitButton] = React.useState(false);

    const handleTrkStatusChange = React.useCallback((status: string | null) => {
        onTrkStatusChange?.(status);
    }, [onTrkStatusChange]);

    const handleShowTransmitButton = React.useCallback((show: boolean) => {
        setShowTransmitButton(show);
    }, []);
    const { showStatus } = useStatus();
    const loginClientBean = useAppSelector((state: any) => state.loginClientBean?.data);
    const truckerInfoRef = React.useRef<PickupTruckerInfo>({ truckerName: '', truckCity: '', truckZipCountry: '' });

    const truckerPanel = useTruckerDetailsPanel(initialTruckerFormData);
    const pickupDelivery = usePickupDeliveryDetailsPanel(initialPickupFormData);
    const truckerHandleChangeRef = React.useRef(truckerPanel.handleChange);
    truckerInfoRef.current.truckerName = truckerPanel.formData.truckerCode ?? '';

    React.useEffect(() => {
        onTruckerFormSync?.(truckerPanel.formData);
    }, [truckerPanel.formData, onTruckerFormSync]);

    const pickupAccordion = usePickupAccordionContent(
        externalCargoRows,
        moduleCode,
        initialPickupCharges,
        tmsContext,
        (data: Partial<PickupDeliveryFormData>) =>
            pickupDelivery.setFormData(prev => ({ ...prev, ...data })),
        (data: Partial<TruckerFormData>) => {
            if (data.truckerCode !== undefined) {
                truckerInfoRef.current.truckerName = data.truckerCode;
            }
            truckerPanel.setFormData(prev => ({ ...prev, ...data }));
        },
        routingFormData,
        undefined,
        doorDeliveryFormData,
        { routing: routingFormData, isBkgModule, cargoRows: cargoDetails ?? [] },
        () => truckerPanel.setIsUnlocked(false),
        onPickupChargesChange
            ? (charges: PickupCharge[]) => onPickupChargesChange(charges, { ...truckerInfoRef.current })
            : undefined,
        mainCargoRows,
    );

    React.useEffect(() => {
        onCargoMetricsChange?.(pickupAccordion.cargoMetrics);
    }, [pickupAccordion.cargoMetrics]);

    const fetchTruckRatesRef = React.useRef(pickupAccordion.handleFetchTruckRates);
    React.useEffect(() => { fetchTruckRatesRef.current = pickupAccordion.handleFetchTruckRates; });
    React.useEffect(() => {
        onRegisterFetchTruckRates?.(() => fetchTruckRatesRef.current());
    }, [onRegisterFetchTruckRates]);

    React.useEffect(() => {
        if (pickupAccordion.tmsNotification.open) {
            showStatus(pickupAccordion.tmsNotification.type, [pickupAccordion.tmsNotification.message]);
            pickupAccordion.setTmsNotification(prev => ({ ...prev, open: false }));
        }
    }, [pickupAccordion.tmsNotification]);
    const handleBookWithTmsResult = React.useCallback((result: BookWithTmsResult) => {
        if (result.success) {
            if (result.carrierSCAC) truckerHandleChangeRef.current('truckerCode', result.carrierSCAC);
            if (result.tmsCarrier) truckerHandleChangeRef.current('truckerDetails', result.tmsCarrier);
            if (result.truckerProNumber) truckerHandleChangeRef.current('truckerProNumber', result.truckerProNumber);
            if (result.tmsStatus) truckerHandleChangeRef.current('status', result.tmsStatus);
            if (result.updatedCharges?.length) setPickupChargesRef.current(result.updatedCharges);
        }
        onBookingStatusChangeRef.current?.(result);
    }, []);

    const carrierOptions = useCarrierOptionsModal(pickupAccordion.carrierOptionsFormContext,
        handleBookWithTmsResult, loginClientBean);
    const truckerModal = useTruckerOptionsModal(
        pickupAccordion.truckerRates,
        pickupAccordion.doorDeliveryRatesForModal,
        pickupAccordion.altGatewayRates,
        pickupAccordion.deliveryAltGatewayRates,
    );
    const truckingMode: TruckerOptionsMode = doorDeliveryFormData ? 'DRDR' : 'DRCF';

    const handlePickupModalSelectDoorDelivery = React.useCallback((rate: TruckRateV1) => {
        onSelectDoorDeliveryRate?.(rate);
        pickupAccordion.setTruckerOptionsOpen(false);
    }, [onSelectDoorDeliveryRate, pickupAccordion.setTruckerOptionsOpen]);

    const setPickupChargesRef = React.useRef(pickupAccordion.handleSetCharges);
    const onBookingStatusChangeRef = React.useRef(onBookingStatusChange);




    return (
        <Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' } }}>
                <Box sx={{ flex: 1 }}>
                    <PickupFormSection
                        key={confirmedVersion}
                        initialData={confirmedData ? mapDialogToTrucking(confirmedData) : initialPickupFormData }
                        onFormChange={onPickupFormChange}
                        onPickupFormDataChange={(data, onHeaderChange) => {
                            truckerInfoRef.current.truckCity = data.city ?? '';
                            truckerInfoRef.current.truckZipCountry = [data.zipCode, data.country].filter(Boolean).join(' ');
                            onTruckingPickupFormSync?.(data);
                            pickupAccordion.handlePickupFormDataChange(data, onHeaderChange);
                        }}
                        onHeaderDataChange={onHeaderDataChange}
                        pickupIndex={pickupIndex}
                        internalCargoRows={pickupAccordion.internalCargoRows}
                        onCargoRowsChange={pickupAccordion.handleCargoRowsChange}
                        onCargoDetailsToggle={() => pickupAccordion.setCargoOpen(prev => !prev)}
                        isCargoOpen={pickupAccordion.cargoOpen}
                        moduleCode={moduleCode}
                        moduleType={moduleType}
                        isFCLBooking={isFCLBooking}
                        fclHazardousOptions={fclHazardousOptions}
                        accessorialOptions={accessorialOptions}
                        doorAccessorialOptions ={doorAccessorialOptions}
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
                        deliveryType={routingFormData?.deliveryType === 'D' ? 'DOOR' : ''}
                        onTrkStatusChange={handleTrkStatusChange}
                        onShowTransmitButton={handleShowTransmitButton}
                    />
                </Box>
            </Box>

            <PickupChargesSection
                charges={pickupAccordion.pickupCharges}
                onModifyTmsBooking={pickupAccordion.handleFetchQuoteFromTms}
                fetchTmsButtonState={pickupAccordion.fetchTmsButtonState}
                moduleType={moduleType}
                onChargeChange={pickupAccordion.handleChargeChange}
                onAddCharge={pickupAccordion.handleAddCharge}
                onRemoveCharge={pickupAccordion.handleRemoveCharge}
                showTransmitToTrk={showTransmitButton}
            />

            <PConfirmationModal
                open={pickupAccordion.validationOpen}
                title="Validation Error"
                variant="warning"
                sx={{ width: '450px' }}
                message={pickupAccordion.validationErrors.join('\n')}
                onClose={() => pickupAccordion.setValidationOpen(false)}
                primaryAction={{
                    label: 'Ok',
                    onClick: () => pickupAccordion.setValidationOpen(false),
                }}
                buttonAlign="end"
            />

            <PConfirmationModal
                open={pickupAccordion.modifyConfirmOpen}
                sx={{ width: '35rem' }}
                message="Are you sure you want to modify this TMS booking? This will update the existing TMS order."
                onClose={pickupAccordion.handleModifyConfirmNo}
                primaryAction={{
                    label: 'Yes',
                    onClick: pickupAccordion.handleModifyConfirmYes,
                }}
                secondaryAction={{
                    label: 'No',
                    onClick: pickupAccordion.handleModifyConfirmNo,
                }}
            />

            <CarrierOptionsModal
                open={pickupAccordion.carrierOptionsOpen}
                onClose={pickupAccordion.handleCloseCarrierOptions}
                formData={carrierOptions.formData}
                quotes={pickupAccordion.carrierQuotes.map(q => ({ ...q, errorMessage: q.errorMessage ?? '' }))}
                handlers={{
                    ...carrierOptions.handlers,
                    onSelectQuote: (_quote: CarrierQuote) => {},
                    onRefreshOptions: pickupAccordion.handleRefreshOptions,
                }}
                uiState={carrierOptions.uiState}
                uiHandlers={carrierOptions.uiHandlers}
                moduleCode={moduleCode}
                isModifyBooking={pickupAccordion.isModifyBooking}
                mainDetails={pickupFormToMainDetails(pickupAccordion.currentPickupFormData, shipperReference)}
                cargoDetails={buildTmsCargoDetails(mainCargoRows ?? pickupAccordion.internalCargoRows, moduleCode ?? '')}
                alternateGatewayOptions={carrierOptions.alternateGatewayOptions}
                suggestions={carrierOptions.suggestions}
                availableAccessorials={accessorialOptions}
            />

            <TruckerOptionsModal
                open={pickupAccordion.truckerOptionsOpen}
                onClose={() => pickupAccordion.setTruckerOptionsOpen(false)}
                mode={truckingMode}
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
                onRefreshRates={
                    truckingMode === 'DRDR'
                        ? (pickupAccordion.alternateGatewayOptions?.length > 0 || pickupAccordion.deliveryAlternateGatewayOptions?.length > 0)
                            ? () => {
                                if (pickupAccordion.alternateGateway) pickupAccordion.handleRefreshRates();
                                if (pickupAccordion.deliveryAlternateGateway) pickupAccordion.handleRefreshDoorDeliveryRates();
                            }
                            : undefined
                        : pickupAccordion.alternateGatewayOptions?.length > 0 ? pickupAccordion.handleRefreshRates : undefined
                }
                alternateGateway={pickupAccordion.alternateGateway}
                onSetAlternateGateway={pickupAccordion.setAlternateGateway}
                alternateGatewayZipCode={pickupAccordion.alternateGatewayZipCode}
                onSetAlternateGatewayZipCode={pickupAccordion.setAlternateGatewayZipCode}
                alternateGatewayOptions={pickupAccordion.alternateGatewayOptions}
                deliveryAlternateGateway={pickupAccordion.deliveryAlternateGateway}
                onSetDeliveryAlternateGateway={pickupAccordion.setDeliveryAlternateGateway}
                deliveryAlternateGatewayZipCode={pickupAccordion.deliveryAlternateGatewayZipCode}
                onSetDeliveryAlternateGatewayZipCode={pickupAccordion.setDeliveryAlternateGatewayZipCode}
                deliveryAlternateGatewayOptions={pickupAccordion.deliveryAlternateGatewayOptions}
                pickupAccessorials={pickupAccordion.currentPickupFormData?.accessorials ?? []}
                accessorialOptions={accessorialOptions}
                doorAccessorialOptions ={doorAccessorialOptions}
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
                altGatewayIsFetching={pickupAccordion.isFetchingAltGatewayRates}
                altGatewayRates={pickupAccordion.altGatewayRates}
                onSelectAltGatewayRate={pickupAccordion.handleSelectRate}
                altGatewayRatesOpen={truckerModal.altGatewayRatesOpen}
                setAltGatewayRatesOpen={truckerModal.setAltGatewayRatesOpen}
                altGatewaySortRules={truckerModal.altGatewaySortRules}
                altGatewayExpandedRows={truckerModal.altGatewayExpandedRows}
                altGatewayDisplayCount={truckerModal.altGatewayDisplayCount}
                setAltGatewayDisplayCount={truckerModal.setAltGatewayDisplayCount}
                handleAltGatewaySort={truckerModal.handleAltGatewaySort}
                handleAltGatewayToggleRow={truckerModal.handleAltGatewayToggleRow}
                altGatewaySortedRates={truckerModal.altGatewaySortedRates}
                altGatewayDisplayedRates={truckerModal.altGatewayDisplayedRates}
                altGatewayHasMore={truckerModal.altGatewayHasMore}
                deliveryAltGatewayIsFetching={pickupAccordion.isFetchingDeliveryAltGatewayRates}
                deliveryAltGatewayRates={pickupAccordion.deliveryAltGatewayRates}
                onSelectDeliveryAltGatewayRate={truckingMode === 'DRDR' ? handlePickupModalSelectDoorDelivery : undefined}
                deliveryAltGatewayRatesOpen={truckerModal.deliveryAltGatewayRatesOpen}
                setDeliveryAltGatewayRatesOpen={truckingMode === 'DRDR' ? truckerModal.setDeliveryAltGatewayRatesOpen : undefined}
                deliveryAltGatewaySortRules={truckerModal.deliveryAltGatewaySortRules}
                deliveryAltGatewayExpandedRows={truckerModal.deliveryAltGatewayExpandedRows}
                deliveryAltGatewayDisplayCount={truckerModal.deliveryAltGatewayDisplayCount}
                setDeliveryAltGatewayDisplayCount={truckingMode === 'DRDR' ? truckerModal.setDeliveryAltGatewayDisplayCount : undefined}
                handleDeliveryAltGatewaySort={truckingMode === 'DRDR' ? truckerModal.handleDeliveryAltGatewaySort : undefined}
                handleDeliveryAltGatewayToggleRow={truckingMode === 'DRDR' ? truckerModal.handleDeliveryAltGatewayToggleRow : undefined}
                deliveryAltGatewaySortedRates={truckerModal.deliveryAltGatewaySortedRates}
                deliveryAltGatewayDisplayedRates={truckerModal.deliveryAltGatewayDisplayedRates}
                deliveryAltGatewayHasMore={truckerModal.deliveryAltGatewayHasMore}
                doorDeliveryLocationCode={doorDeliveryFormData?.doorDeliveryCity ?? ''}
                doorDeliveryZipCode={doorDeliveryFormData?.doorDeliveryZipCode ?? ''}
                doorDeliveryCity={doorDeliveryFormData?.doorDeliveryCity ?? ''}
                doorDeliveryStackable={truckerModal.doorDeliveryStackable}
                onSetDoorDeliveryStackable={truckingMode === 'DRDR' ? truckerModal.setDoorDeliveryStackable : undefined}
                doorDeliveryShipmentType={truckerModal.doorDeliveryShipmentType}
                onSetDoorDeliveryShipmentType={truckingMode === 'DRDR' ? truckerModal.setDoorDeliveryShipmentType : undefined}
                doorDeliveryRates={pickupAccordion.doorDeliveryRatesForModal}
                doorDeliveryIsFetching={pickupAccordion.isFetchingDoorDeliveryRates}
                onSelectDoorDeliveryRate={truckingMode === 'DRDR' ? handlePickupModalSelectDoorDelivery : undefined}
                doorDeliveryRatesOpen={truckerModal.doorDeliveryRatesOpen}
                setDoorDeliveryRatesOpen={truckingMode === 'DRDR' ? truckerModal.setDoorDeliveryRatesOpen : undefined}
                doorDeliverySortRules={truckerModal.doorDeliverySortRules}
                doorDeliveryExpandedRows={truckerModal.doorDeliveryExpandedRows}
                doorDeliveryDisplayCount={truckerModal.doorDeliveryDisplayCount}
                setDoorDeliveryDisplayCount={truckingMode === 'DRDR' ? truckerModal.setDoorDeliveryDisplayCount : undefined}
                handleDoorDeliverySort={truckingMode === 'DRDR' ? truckerModal.handleDoorDeliverySort : undefined}
                handleDoorDeliveryToggleRow={truckingMode === 'DRDR' ? truckerModal.handleDoorDeliveryToggleRow : undefined}
                doorDeliverySortedRates={truckerModal.doorDeliverySortedRates}
                doorDeliveryDisplayedRates={truckerModal.doorDeliveryDisplayedRates}
                doorDeliveryHasMore={truckerModal.doorDeliveryHasMore}
                doorDeliveryAccessorials={doorDeliveryFormData?.accessorials ?? []}
            />
        </Box>
    );
};

// --- BookingTruckingDetails ---

interface BookingTruckingDetailsProps {
    pickups: number[];
    onAddPickup?: () => void;
    onRemovePickup?: (index: number) => void;
    externalCargoRows?: InternalCargoRowData[];
    doorDeliveryFormData?: DoorDeliveryFormData;
    onDoorDeliveryFormDataChange?: (field: keyof DoorDeliveryFormData, value: unknown) => void;
    moduleCode?: string;
    isFCLBooking?: boolean;
    fclHazardousOptions?: { label: string; value: string }[];
    accessorialOptions?: AccessoriesOption[];
    doorAccessorialOptions? : AccessoriesOption[]
    doorDeliveryRaw?: ReturnType<typeof useDoorDeliveryAccordionContent>;
    moduleType?: string;
    onRegisterFields?: (fields: string[]) => void;
    onFieldsChange?: (formData: any) => void;
    routing?: any;
    shipperReference?: string;
    tmsContext?: TmsBookingContext;
    onPopulateReference?: (referenceNumber: string) => void;
    onSuccess?: (shipmentId: string) => void;
    cargoDetails?: CargoRowType[];
    onPickupChargesChange?: (pickupId: number, charges: PickupCharge[], truckerInfo?: PickupTruckerInfo) => void;
    onPickupCargoMetricsChange?: (pickupId: number, metrics: CargoMetrics) => void;
    onDoorDeliveryChargesChange?: (charges: PickupCharge[]) => void;
    mainCargoRows?: InternalCargoRowData[];
    onTrkStatusChange?: (status: string | null) => void;
}

const BookingTruckingDetails: React.FC<BookingTruckingDetailsProps> = ({
    pickups,
    onAddPickup,
    onRemovePickup,
    externalCargoRows,
    doorDeliveryFormData,
    onDoorDeliveryFormDataChange,
    moduleCode,
    isFCLBooking,
    fclHazardousOptions,
    accessorialOptions,
    doorAccessorialOptions,
    doorDeliveryRaw: _doorDeliveryRaw,
    routing,
    moduleType = 'booking',
    shipperReference,
    tmsContext,
    cargoDetails,
    onPopulateReference,
    onSuccess,
    onPickupChargesChange,
    onPickupCargoMetricsChange,
    onDoorDeliveryChargesChange,
    mainCargoRows,
    onTrkStatusChange,
}) => {
    const { showStatus } = useStatus();

    const dispatch = useAppDispatch();

    const handleBookingStatusChange = React.useCallback((result: BookWithTmsResult) => {
        if (result.success) {
            showStatus('success', [result.message]);
            dispatch(updateBookingMainDetails({
                tmsShipmentId: result.tmsShipmentId,
                truckerProNumber: result.truckerProNumber
            }));
            if (onSuccess) {
                onSuccess(result.tmsShipmentId);
            }
        } else if (result.closeModal) {
            showStatus('error', [result.message]);
        }
    }, [showStatus, dispatch, onSuccess]);

    const truckingState = useTruckingDetails(
        pickups,
        doorDeliveryFormData,
        onDoorDeliveryFormDataChange,
        routing?.pickupState?.headerDataMap ?? {},
    );

    const [trkStatusMap, setTrkStatusMap] = React.useState<Record<number, string | null>>({});

    React.useEffect(() => {
        const anyStatus = Object.values(trkStatusMap).find(s => s !== null) ?? null;
        onTrkStatusChange?.(anyStatus);
    }, [trkStatusMap]);

    const doorDeliveryRaw = useDoorDeliveryAccordionContent(
        truckingState.isCombined,
        routing?.pickupState?.doorDeliveryChargeRows ?? [],
        {
            routing: routing?.routingFormData,
            cargoRows: cargoDetails ?? [],
            isBkgModule: moduleCode === MODULE_BKG,
        },
        (truckerCode, truckerDetails) => {
            onDoorDeliveryFormDataChange?.('truckerCode', truckerCode);
            onDoorDeliveryFormDataChange?.('truckerDetails', truckerDetails);
        },
    );

    const prevDoorDeliveryChargesKey = React.useRef<string>('');
    React.useEffect(() => {
        const realCharges = doorDeliveryRaw.chargeRows.filter(c => c.id !== -1);
        const key = realCharges.map(c => `${c.id}:${c.income}:${c.expense}`).join('|');
        if (key !== prevDoorDeliveryChargesKey.current) {
            prevDoorDeliveryChargesKey.current = key;
            onDoorDeliveryChargesChange?.(realCharges);
        }
    }, [doorDeliveryRaw.chargeRows]);

    const { isVisible } = useFeatureToggle();
    const showMultiPickupControls = isVisible(CommonToggleKeys.OFR_BKG_ADD_MULTIPLE_PICKUP_INSTRUCTION);
    const isTrkRatesEnabled = isVisible(CommonToggleKeys.BKG_QUOTE_TRUCKING_RATES_INTEGRATION);

    const mode: TruckerOptionsMode = truckingState.isCombined
        ? 'DRDR'
        : truckingState.hasDoorDelivery
        ? 'CFDR'
        : 'DRCF';

    const isAltGatewayToggleOn = isVisible(CommonToggleKeys.TRK_ALTERNATE_GATEWAY_SELECTION);
    const isDeliveryToUS = (doorDeliveryFormData?.doorDeliveryCountry ?? '').split('-')[0].trim().toUpperCase() === 'US';
    const { data: rawDeliveryAltGWOptions } = useGetSelections(deliveryAlternateGatewaySelectionConfig());
    const deliveryAlternateGatewayOptions = isAltGatewayToggleOn && isDeliveryToUS ? (rawDeliveryAltGWOptions ?? []) : [];
    const [deliveryAlternateGateway, setDeliveryAlternateGateway] = React.useState('');
    const [deliveryAlternateGatewayZipCode, setDeliveryAlternateGatewayZipCode] = React.useState('');

    const doorModal = useTruckerOptionsModal([], doorDeliveryRaw.doorDeliveryRates, [], doorDeliveryRaw.deliveryAltGatewayRates);

    const drdrPickupFetchRef = React.useRef<(() => void) | null>(null);

    const doorDeliveryChargesState = {
        isFetchingRates:        doorDeliveryRaw.isFetchingRates,
        truckerSearchOpen:      doorDeliveryRaw.truckerSearchOpen,
        onSetTruckerSearchOpen: doorDeliveryRaw.setTruckerSearchOpen,
        onFetchTruckRates:      isTrkRatesEnabled
            ? mode === 'DRDR' && pickups.length === 1
                ? () => drdrPickupFetchRef.current?.()
                : () => doorDeliveryRaw.handleFetchTruckRates(doorDeliveryFormData)
            : undefined,
        buyTotal:               doorDeliveryRaw.buyTotal,
        sellTotal:              doorDeliveryRaw.sellTotal,
        profitLoss:             doorDeliveryRaw.profitLoss,
        chargeRows:             doorDeliveryRaw.chargeRows,
    };

    const confirmedPickupForms: Record<number, PickupDetailsFormData> | undefined =
        routing?.pickupState?.confirmedPickupForms;
    const confirmedVersions: Record<number, number> | undefined =
        routing?.pickupState?.confirmedVersions;

    const truckingPickupForm = routing?.pickupState?.truckingPickupForms?.[pickups[0]];
    const dialogPickupForm = routing?.pickupState?.pickupForms?.[pickups[0]];
    const firstPickupCity = truckingPickupForm?.city || dialogPickupForm?.pickupCity || '';
    const firstPickupZip = truckingPickupForm?.zipCode || dialogPickupForm?.pickupZipCode || '';

    return (
        <>
            <TruckingDetails
                moduleType={moduleType}
                routing={routing}
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
                pickups={pickups}
                onAddPickup={onAddPickup}
                onRemovePickup={onRemovePickup}
                showMultiPickupControls={showMultiPickupControls}
                doorDeliveryFormData={doorDeliveryFormData}
                onDoorDeliveryFormDataChange={onDoorDeliveryFormDataChange}
                doorDeliveryChargesState={doorDeliveryChargesState}
                accessorialOptions={accessorialOptions}
                doorAccessorialOptions ={doorAccessorialOptions}
                renderPickupContent={(pickupId, pickupIndex, isCombined) => (
                    <PickupAccordionContentWrapper
                        pickupIndex={pickupIndex}
                        onHeaderDataChange={(data) => truckingState.handleHeaderDataChange(pickupId, data)}
                        externalCargoRows={
                            routing?.pickupState?.truckingCargoRowsMap?.[pickupId] ??
                            externalCargoRows
                        }
                        hideFetchButton={!isTrkRatesEnabled || (isCombined && pickups.length === 1)}
                        moduleCode={moduleCode}
                        moduleType={moduleType}
                        isFCLBooking={isFCLBooking}
                        fclHazardousOptions={fclHazardousOptions}
                        accessorialOptions={accessorialOptions}
                        doorAccessorialOptions ={doorAccessorialOptions}
                        initialPickupFormData={routing?.pickupState?.truckingPickupForms?.[pickupId]}
                        initialTruckerFormData={routing?.pickupState?.pickupTruckerForms?.[pickupId]}
                        initialPickupCharges={routing?.pickupState?.pickupChargeMap?.[pickupId] ?? []}
                        confirmedData={confirmedPickupForms?.[pickupId]}
                        confirmedVersion={confirmedVersions?.[pickupId] ?? 0}
                        onPickupFormChange={(partial) =>
                            routing?.pickupHandlers?.handlePickupFormSync?.(pickupId, partial)
                        }
                        shipperReference={shipperReference}
                        tmsContext={tmsContext}
                        onBookingStatusChange={handleBookingStatusChange}
                        doorDeliveryFormData={pickups.length === 1 ? doorDeliveryFormData : undefined}
                        routingFormData={routing?.routingFormData}
                        isBkgModule={moduleCode === MODULE_BKG}
                        cargoDetails={cargoDetails}
                        mainCargoRows={mainCargoRows}
                        onSelectDoorDeliveryRate={doorDeliveryRaw.handleSelectDoorDeliveryRate}
                        onPickupChargesChange={onPickupChargesChange
                            ? (charges, truckerInfo) => onPickupChargesChange(pickupId, charges, truckerInfo)
                            : undefined}
                        onRegisterFetchTruckRates={mode === 'DRDR' ? (fn) => { drdrPickupFetchRef.current = fn; } : undefined}
                        onTrkStatusChange={(status) =>
                            setTrkStatusMap(prev => ({ ...prev, [pickupId]: status }))
                        }
                    />
                )}
                renderPickupHeaderExtra={(pickupId) => {
                    const status = trkStatusMap[pickupId];
                    if (!status) return null;
                    const cssKey = TRK_HEADER_CSS[status] ?? 'trkHeaderPending';
                    const label = TRK_HEADER_LABEL[status] ?? 'TRK Transmit Pending';
                    return (
                        <Box
                            component="span"
                            sx={{ ...TRK_HEADER_BADGE_SX, ...(TRK_HEADER_COLORS[cssKey] ?? TRK_HEADER_COLORS.trkHeaderPending) }}
                        >
                            {label}
                        </Box>
                    );
                }}
            />

            <PModal
                open={doorDeliveryRaw.validationOpen}
                title="Validation Error"
                isCloseIcon={false}
                onClose={() => doorDeliveryRaw.setValidationOpen(false)}
                width={620}
                height={340}
            >
                <Box sx={{
                    backgroundColor: '#fef9e4',
                    border: '1px solid #e6d96b',
                    borderRadius: '3px',
                    p: '10px 12px',
                    m: '8px 4px',
                    display: 'flex',
                    gap: '10px',
                    alignItems: 'flex-start',
                    height: '200px',
                }}>
                    <img src={warningIcon} alt="warning" style={{ width: 20, height: 20, marginTop: 2, flexShrink: 0 }} />
                    <Box sx={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '12px', color: '#333' }}>
                        {doorDeliveryRaw.validationErrors.map((msg) => (
                            <Box key={msg}>{msg}</Box>
                        ))}
                    </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: '4px', pt: '6px' }}>
                    <PGradientButton
                        title="Ok"
                        onClick={() => doorDeliveryRaw.setValidationOpen(false)}
                        sx={{ minWidth: '60px', height: '25px', borderRadius: '3px', fontSize: '13px' }}
                    />
                </Box>
            </PModal>

            {mode !== 'DRCF' && (
                <TruckerOptionsModal
                    open={doorDeliveryRaw.truckerOptionsOpen}
                    onClose={() => doorDeliveryRaw.setTruckerOptionsOpen(false)}
                    mode={pickups.length > 1 ? 'CFDR' : mode}
                    pickupCity={firstPickupCity}
                    pickupZipCode={firstPickupZip}
                    deliveryLocationCode={doorDeliveryRaw.originCfsLocationCode}
                    deliveryZipCode={doorDeliveryRaw.originCfsZipCode}
                    piecesTotal={doorDeliveryRaw.cfsPiecesTotal}
                    weightTotal={doorDeliveryRaw.cfsWeightTotal}
                    volumeTotal={doorDeliveryRaw.cfsVolumeTotal}
                    pickupIndex={0}
                    rates={[]}
                    isFetching={doorDeliveryRaw.isFetchingRates}
                    onSelectRate={() => {}}
                    mainOpen={doorModal.mainOpen}
                    setMainOpen={doorModal.setMainOpen}
                    ratesOpen={doorModal.ratesOpen}
                    setRatesOpen={doorModal.setRatesOpen}
                    stackable={doorModal.stackable}
                    setStackable={doorModal.setStackable}
                    shipmentType={doorModal.shipmentType}
                    setShipmentType={doorModal.setShipmentType}
                    sortRules={doorModal.sortRules}
                    expandedRows={doorModal.expandedRows}
                    displayCount={doorModal.displayCount}
                    setDisplayCount={doorModal.setDisplayCount}
                    allOpen={doorModal.allOpen}
                    handleSort={doorModal.handleSort}
                    handleToggleRow={doorModal.handleToggleRow}
                    sortedRates={doorModal.sortedRates}
                    displayedRates={doorModal.displayedRates}
                    hasMore={doorModal.hasMore}
                    doorDeliveryLocationCode={doorDeliveryRaw.doorDeliveryCity}
                    doorDeliveryZipCode={doorDeliveryRaw.doorDeliveryZip}
                    doorDeliveryCity={doorDeliveryRaw.doorDeliveryCity}
                    doorDeliveryStackable={doorModal.doorDeliveryStackable}
                    onSetDoorDeliveryStackable={doorModal.setDoorDeliveryStackable}
                    doorDeliveryShipmentType={doorModal.doorDeliveryShipmentType}
                    onSetDoorDeliveryShipmentType={doorModal.setDoorDeliveryShipmentType}
                    doorDeliveryRates={doorDeliveryRaw.doorDeliveryRates}
                    doorDeliveryIsFetching={doorDeliveryRaw.isFetchingRates}
                    onSelectDoorDeliveryRate={doorDeliveryRaw.handleSelectDoorDeliveryRate}
                    doorDeliveryRatesOpen={doorModal.doorDeliveryRatesOpen}
                    setDoorDeliveryRatesOpen={doorModal.setDoorDeliveryRatesOpen}
                    doorDeliverySortRules={doorModal.doorDeliverySortRules}
                    doorDeliveryExpandedRows={doorModal.doorDeliveryExpandedRows}
                    doorDeliveryDisplayCount={doorModal.doorDeliveryDisplayCount}
                    setDoorDeliveryDisplayCount={doorModal.setDoorDeliveryDisplayCount}
                    handleDoorDeliverySort={doorModal.handleDoorDeliverySort}
                    handleDoorDeliveryToggleRow={doorModal.handleDoorDeliveryToggleRow}
                    doorDeliverySortedRates={doorModal.doorDeliverySortedRates}
                    doorDeliveryDisplayedRates={doorModal.doorDeliveryDisplayedRates}
                    doorDeliveryHasMore={doorModal.doorDeliveryHasMore}
                    deliveryAlternateGateway={deliveryAlternateGateway}
                    onSetDeliveryAlternateGateway={setDeliveryAlternateGateway}
                    deliveryAlternateGatewayZipCode={deliveryAlternateGatewayZipCode}
                    onSetDeliveryAlternateGatewayZipCode={setDeliveryAlternateGatewayZipCode}
                    deliveryAlternateGatewayOptions={deliveryAlternateGatewayOptions}
                    onRefreshRates={
                        deliveryAlternateGateway
                            ? () => doorDeliveryRaw.handleRefreshAltGatewayRates(
                                deliveryAlternateGateway,
                                deliveryAlternateGatewayZipCode,
                                doorDeliveryFormData,
                              )
                            : undefined
                    }
                    deliveryAltGatewayRates={doorDeliveryRaw.deliveryAltGatewayRates}
                    onSelectDeliveryAltGatewayRate={doorDeliveryRaw.handleSelectDoorDeliveryRate}
                    deliveryAltGatewayRatesOpen={doorModal.deliveryAltGatewayRatesOpen}
                    setDeliveryAltGatewayRatesOpen={doorModal.setDeliveryAltGatewayRatesOpen}
                    deliveryAltGatewaySortRules={doorModal.deliveryAltGatewaySortRules}
                    deliveryAltGatewayExpandedRows={doorModal.deliveryAltGatewayExpandedRows}
                    setDeliveryAltGatewayDisplayCount={doorModal.setDeliveryAltGatewayDisplayCount}
                    handleDeliveryAltGatewaySort={doorModal.handleDeliveryAltGatewaySort}
                    handleDeliveryAltGatewayToggleRow={doorModal.handleDeliveryAltGatewayToggleRow}
                    deliveryAltGatewaySortedRates={doorModal.deliveryAltGatewaySortedRates}
                    deliveryAltGatewayDisplayedRates={doorModal.deliveryAltGatewayDisplayedRates}
                    deliveryAltGatewayHasMore={doorModal.deliveryAltGatewayHasMore}
                    doorDeliveryAccessorials={doorDeliveryFormData?.accessorials ?? []}
                    accessorialOptions={accessorialOptions}
                    doorAccessorialOptions ={doorAccessorialOptions}
                    initialPickupFormData={routing?.pickupState?.truckingPickupForms?.[pickups[0]]}
                    initialTruckerFormData={routing?.pickupState?.pickupTruckerForms?.[pickups[0]]}
                    initialPickupCharges={routing?.pickupState?.pickupChargeMap?.[pickups[0]] ?? []}
                    confirmedData={confirmedPickupForms?.[pickups[0]]}
                    confirmedVersion={confirmedVersions?.[pickups[0]] ?? 0}
                    onPickupFormChange={(partial) =>
                        routing?.pickupHandlers?.handlePickupFormSync?.(pickups[0], partial)
                    }
                    shipperReference={shipperReference}
                    tmsContext={tmsContext}
                    onBookingStatusChange={handleBookingStatusChange}
                    onPickupChargesChange={onPickupChargesChange
                        ? (charges, truckerInfo) => onPickupChargesChange(pickups[0], charges, truckerInfo)
                        : undefined
                    }
                    onCargoMetricsChange={onPickupCargoMetricsChange
                        ? (metrics) => onPickupCargoMetricsChange(pickups[0], metrics)
                        : undefined}
                />
            )}
        </>
    );
};

export default BookingTruckingDetails;
