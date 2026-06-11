import React, { useState } from 'react';
import { Box, Button, CircularProgress } from '@mui/material';
import { PModal } from 'phoenix-react-lib';
import styles from '../../../../styles/LCL/TruckingDetails.module.css';
import informationIconBlack from '../../../../assets/information_icon_black.png';
import informationIconBlue from '../../../../assets/information_icon_blue.png';
import ascSortIconBlue from '../../../../assets/asc_sort_icon_blue.png';
import descSortIconBlue from '../../../../assets/images/trucking/desc_sort_icon_blue.png';
import type {
    TruckerOptionsModalProps,
    SortField,
    SortRule,
    TruckRateV1,
} from '../../../../types/LCL/misc/TruckingDetails.types';
import type { AccessoriesOption } from '../../../../types/LCL/routing/RoutingDetails.types';
import { DEFAULT_ACCESSORY_OPTIONS } from '../../../../InitialData/LCL';

const buildAltGatewaySectionLabel = (
    type: 'Pickup' | 'Door Delivery',
    gateway: string,
    zipCodeOverride: string,
    pieces: number,
    weight: number,
    volume: number,
): string => {
    const city = gateway.split('~')[1]?.trim() ?? '';
    const rawZip = gateway.split('~')[2]?.trim() ?? '';
    const zip = zipCodeOverride || rawZip;
    const base = `Alternative Gateway ${type} Options`;
    const parts: string[] = [];
    const loc = [zip, city].filter(Boolean).join(' – ');
    if (loc) parts.push(loc);
    if (pieces > 0) parts.push(`${pieces} Pieces`);
    if (weight > 0) parts.push(`${weight.toFixed(3)} Lbs`);
    if (volume > 0) parts.push(`${volume.toFixed(3)} Cbf`);
    return parts.length > 0 ? `${base} (${parts.join(', ')})` : base;
};

const buildPickupSectionLabel = (
    pickupIndex: number,
    zip: string,
    city: string,
    pieces: number,
    weight: number,
    volume: number,
): string => {
    const base = `Pickup ${String(pickupIndex + 1).padStart(3, '0')} Trucker Options`;
    const parts: string[] = [];
    const loc = [zip, city].filter(Boolean).join(' – ');
    if (loc) parts.push(loc);
    if (pieces > 0) parts.push(`${pieces} Pieces`);
    if (weight > 0) parts.push(`${weight.toFixed(3)} Lbs`);
    if (volume > 0) parts.push(`${volume.toFixed(3)} Cbf`);
    return parts.length > 0 ? `${base} (${parts.join(', ')})` : base;
};

const buildDoorSectionLabel = (
    zip: string,
    city: string,
    pieces: number,
    weight: number,
    volume: number,
): string => {
    const base = 'Door Delivery Trucker Options';
    const parts: string[] = [];
    const loc = [zip, city].filter(Boolean).join(' – ');
    if (loc) parts.push(loc);
    if (pieces > 0) parts.push(`${pieces} Pieces`);
    if (weight > 0) parts.push(`${weight.toFixed(3)} Lbs`);
    if (volume > 0) parts.push(`${volume.toFixed(3)} Cbf`);
    return parts.length > 0 ? `${base} (${parts.join(', ')})` : base;
};

interface StackableShipmentRowProps {
    stackable: 'yes' | 'no';
    setStackable: (v: 'yes' | 'no') => void;
    shipmentType: string;
    setShipmentType: (v: string) => void;
}

const StackableShipmentRow: React.FC<StackableShipmentRowProps> = ({
    stackable,
    setStackable,
    shipmentType,
}) => (
    <Box className={styles.optionsRow}>
        <Box>
            <Box className={styles.optionLabel}>Stackable</Box>
            <Box className={styles.muiToggleGroup}>
                <Button
                    disableRipple
                    className={`${styles.muiToggleBtn} ${stackable === 'yes' ? styles.muiToggleBtnActive : styles.muiToggleBtnInactive}`}
                    onClick={() => setStackable('yes')}
                >Yes</Button>
                <Button
                    disableRipple
                    className={`${styles.muiToggleBtn} ${stackable === 'no' ? styles.muiToggleBtnActive : styles.muiToggleBtnInactive}`}
                    onClick={() => setStackable('no')}
                >No</Button>
            </Box>
        </Box>
        <Box className={styles.shipmentTypeBox}>
            <Box className={styles.optionLabel}>Shipment Type</Box>
            <select
                className={styles.shipmentSelect}
                value={shipmentType}
                onChange={() => undefined}
                disabled
            >
                <option value="LTL">LTL</option>
                <option value="FTL">FTL</option>
            </select>
        </Box>
    </Box>
);

interface SelectedAccessorialsDisplayProps {
    label: string;
    selectedCodes: string[];
    options?: AccessoriesOption[];
}

const SelectedAccessorialsDisplay: React.FC<SelectedAccessorialsDisplayProps> = ({
    label,
    selectedCodes,
    options = DEFAULT_ACCESSORY_OPTIONS,
}) => {
    const selected = options.filter(opt => selectedCodes.includes(opt.id));
    if (selected.length === 0) return null;
    return (
        <Box className={styles.optionsRow}>
            <Box>
                <Box className={styles.optionLabel}>{label}</Box>
                <Box className={styles.accessorialsButtons}>
                    {selected.map(opt => (
                        <Button
                            key={opt.id}
                            disableRipple
                            tabIndex={-1}
                            className={styles.accessorialBtnDisplay}
                        >
                            {opt.label}
                        </Button>
                    ))}
                </Box>
            </Box>
        </Box>
    );
};

interface AlternateGatewayPanelProps {
    gateway: string;
    onSetGateway?: (v: string) => void;
    zipCode: string;
    onSetZipCode?: (v: string) => void;
    options: { label: string; value: string }[];
}

const AlternateGatewayPanel: React.FC<AlternateGatewayPanelProps> = ({
    gateway, onSetGateway, zipCode, onSetZipCode, options,
}) => (
    <Box className={styles.altGatewayPanelFields}>
        <Box className={styles.altGatewayInlineRow}>
            <Box>
                <Box className={styles.optionLabel}>Alternate Gateway</Box>
                <select
                    className={styles.altGatewaySelect}
                    value={gateway}
                    onChange={e => {
                        const val = e.target.value;
                        onSetGateway?.(val);
                        onSetZipCode?.(val ? (val.split('~')[2] ?? '') : '');
                    }}
                >
                    <option value="">Please Select</option>
                    {options.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </Box>
            <Box>
                <Box className={styles.optionLabel}>Zip Code</Box>
                <input
                    className={styles.altGatewayZipInput}
                    value={zipCode}
                    readOnly
                    placeholder="Zipcode"
                />
            </Box>
        </Box>
    </Box>
);

interface LocationFieldsProps {
    cityLabel: string;
    cityValue: string;
    onCityChange?: (v: string) => void;
    zipLabel: string;
    zipValue: string;
    onZipChange?: (v: string) => void;
}

const LocationFields: React.FC<LocationFieldsProps> = ({
    cityLabel,
    cityValue,
    onCityChange,
    zipLabel,
    zipValue,
    onZipChange,
}) => (
    <Box className={styles.locationFieldsGrid}>
        <Box className={styles.locationLabelsRow}>
            <span className={styles.readonlyLabel}>{cityLabel}</span>
            <span className={styles.readonlyLabel}>{zipLabel}</span>
        </Box>
        <Box className={styles.locationInputsRow}>
            <input
                className={onCityChange ? styles.editableInput : styles.readonlyInput}
                readOnly={!onCityChange}
                value={cityValue}
                onChange={onCityChange ? e => onCityChange(e.target.value) : undefined}
            />
            <input
                className={`${onZipChange ? styles.editableInput : styles.readonlyInput} ${styles.locationZipInput}`}
                readOnly={!onZipChange}
                value={zipValue}
                onChange={onZipChange ? e => onZipChange(e.target.value) : undefined}
            />
        </Box>
    </Box>
);

interface RatesTableProps {
    sectionLabel: string;
    sectionOpen: boolean;
    onToggleSection: () => void;
    isFetching: boolean;
    displayedRates: TruckRateV1[];
    sortRules: SortRule[];
    expandedRows: Set<number>;
    hasMore: boolean;
    sortedRates: TruckRateV1[];
    onSort: (field: SortField) => void;
    onToggleRow: (idx: number) => void;
    onSelectRate: (rate: TruckRateV1) => void;
    onLoadMore: () => void;
}

const RatesTable: React.FC<RatesTableProps> = ({
    sectionLabel,
    sectionOpen,
    onToggleSection,
    isFetching,
    displayedRates,
    sortRules,
    expandedRows,
    hasMore,
    onSort,
    onToggleRow,
    onSelectRate,
    onLoadMore,
}) => {
    const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

    const sortIndicator = (field: SortField) => {
        const rule = sortRules.find(r => r.field === field);
        if (rule && !rule.asc) {
            return <img src={descSortIconBlue} alt="desc" className={styles.sortIconImg} />;
        }
        return <img src={ascSortIconBlue} alt="asc" className={styles.sortIconImg} />;
    };

    const handleSelectRate = (rate: TruckRateV1, idx: number) => {
        setSelectedIdx(idx);
        onSelectRate(rate);
    };

    return (
        <>
            <Box className={`${styles.sectionHeader} ${!sectionOpen ? styles.sectionHeaderCollapsed : ''}`} onClick={onToggleSection}>
                <span style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sectionLabel}</span>
                <span className={styles.toggleIcon} style={{ flexShrink: 0 }}>{sectionOpen ? '–' : '+'}</span>
            </Box>
            {sectionOpen && (
                <Box sx={{
                    border: '1px solid #d7d7d7',
                    p: 1,
                    pt: 0,
                    backgroundColor: '#fff',
                }}>                    {isFetching ? (
                    <Box className={styles.loadingRow}>Fetching rates&hellip;</Box>
                ) : (
                    <>
                        <table className={styles.ratesTable}>
                            <colgroup>
                                <col style={{ width: '14%' }} />
                                <col style={{ width: '23%' }} />
                                <col style={{ width: '23%' }} />
                                <col style={{ width: '23%' }} />
                                <col style={{ width: '3%' }} />
                                <col style={{ width: '14%' }} />
                            </colgroup>
                            <thead>
                                <tr>
                                    <th className={styles.modalTh}>Carrier</th>
                                    <th className={styles.thSort} onClick={() => onSort('transitTime')}>
                                        <Box className={styles.thSortInner}>
                                            <span>Transit Time</span>
                                            {sortIndicator('transitTime')}
                                        </Box>
                                    </th>
                                    <th className={styles.thSort} onClick={() => onSort('buyTotal')}>
                                        <Box className={styles.thSortInner}>
                                            <span>Buy Total</span>
                                            {sortIndicator('buyTotal')}
                                        </Box>
                                    </th>
                                    <th className={styles.thSort} onClick={() => onSort('sellTotal')}>
                                        <Box className={styles.thSortInner}>
                                            <span>Sell Total</span>
                                            {sortIndicator('sellTotal')}
                                        </Box>
                                    </th>
                                    <th className={styles.modalTh}></th>
                                    <th className={styles.modalTh}></th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedRates.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className={styles.noRecords}>No Trucking Rates Found.</td>
                                    </tr>
                                ) : (
                                    displayedRates.map((rate, idx) => (
                                        <React.Fragment key={`${rate.header.carrierName}-${idx}`}>
                                            <tr className={idx % 2 === 0 ? styles.rateRowEven : styles.rateRowOdd}>
                                                <td className={styles.modalTd} rowSpan={expandedRows.has(idx) ? 2 : 1}>{rate.header.carrierName}</td>
                                                <td className={styles.modalTd}>{rate.header.transitTime} days</td>
                                                <td className={styles.amtTd}>
                                                    <Box className={styles.amtInner}>
                                                        <span className={styles.amtCurrency}>{rate.header.buyCurrency}</span>
                                                        <span>{rate.header.buyTotal.toFixed(2)}</span>
                                                    </Box>
                                                </td>
                                                <td className={styles.amtTd}>
                                                    <Box className={styles.amtInner}>
                                                        <span className={styles.amtCurrency}>{rate.header.sellCurrency}</span>
                                                        <span>{rate.header.sellTotal.toFixed(2)}</span>
                                                    </Box>
                                                </td>
                                                <td className={styles.tdCenter} rowSpan={expandedRows.has(idx) ? 2 : 1}>
                                                    <button
                                                        className={styles.infoBtn}
                                                        onClick={() => onToggleRow(idx)}
                                                        title="View charge breakdown"
                                                    >
                                                        <img
                                                            src={expandedRows.has(idx) ? informationIconBlack : informationIconBlue}
                                                            alt="charge breakdown"
                                                            className={styles.infoBtnIcon}
                                                        />
                                                    </button>
                                                </td>
                                                <td className={styles.tdCenter} rowSpan={expandedRows.has(idx) ? 2 : 1}>
                                                    <button
                                                        className={`${styles.trkSelectBtn} ${selectedIdx === idx ? styles.trkSelectBtnSelected : ''}`}
                                                        onClick={() => handleSelectRate(rate, idx)}
                                                    >Select</button>
                                                </td>
                                            </tr>
                                            {expandedRows.has(idx) && (
                                                <tr>
                                                    <td colSpan={3} className={styles.chargeBreakdownCell}>
                                                        {rate.charges.length === 0 ? (
                                                            <span className={styles.noCharges}>No charge details available.</span>
                                                        ) : (
                                                            <table className={styles.chargeTable}>
                                                                <thead>
                                                                    <tr>
                                                                        <th className={styles.chTh}>Charge Code</th>
                                                                        <th className={styles.chTh}>Rate Basis</th>
                                                                        <th className={styles.chThNum}>Buy Rate</th>
                                                                        <th className={styles.chThNum}>Buy Amount</th>
                                                                        <th className={styles.chThNum}>Sell Rate</th>
                                                                        <th className={styles.chThNum}>Sell Amount</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {rate.charges.map((c, ci) => (
                                                                        <React.Fragment key={ci}>
                                                                            <tr className={ci % 2 === 0 ? styles.chRowEven : styles.chRowOdd}>
                                                                                <td className={styles.chTd}>{c.chargeCode}</td>
                                                                                <td className={styles.chTd}>{c.basis}</td>
                                                                                <td className={styles.chTdNum}>{(c.rate ?? 0).toFixed(2)}</td>
                                                                                <td className={styles.chTdNum}>{(c.calculatedBuyAmount ?? 0).toFixed(2)}</td>
                                                                                <td className={styles.chTdNum}>{(c.sellRate ?? 0).toFixed(2)}</td>
                                                                                <td className={styles.chTdNum}>{(c.calculatedSellAmount ?? 0).toFixed(2)}</td>
                                                                            </tr>
                                                                            {c.notes && (
                                                                                <tr className={styles.chRowOdd}>
                                                                                    <td colSpan={6} className={`${styles.chTd} ${styles.notesTd}`}>
                                                                                        <strong>NOTES:</strong> {c.notes}
                                                                                    </td>
                                                                                </tr>
                                                                            )}
                                                                        </React.Fragment>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        )}
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))
                                )}
                            </tbody>
                        </table>
                        {hasMore && (
                            <Box className={styles.loadMoreRow}>
                                <button className={styles.loadMoreBtn} onClick={onLoadMore}>
                                    Load More
                                </button>
                            </Box>
                        )}
                    </>
                )}
                </Box>
            )}
        </>
    );
};

const TruckerOptionsModal: React.FC<TruckerOptionsModalProps> = ({
    open,
    onClose,
    mode = 'DRCF',
    onRefreshRates,
    alternateGateway = '',
    onSetAlternateGateway,
    alternateGatewayZipCode = '',
    onSetAlternateGatewayZipCode,
    alternateGatewayOptions = [],
    deliveryAlternateGateway = '',
    onSetDeliveryAlternateGateway,
    deliveryAlternateGatewayZipCode = '',
    onSetDeliveryAlternateGatewayZipCode,
    deliveryAlternateGatewayOptions = [],
    pickupCity,
    onSetPickupCity,
    onSetPickupZipCode,
    onSetDeliveryZipCode,
    onSetDoorDeliveryCity,
    onSetDoorDeliveryZipCode,
    pickupAccessorials = [],
    onTogglePickupAccessorial,
    doorDeliveryAccessorials = [],
    onToggleDoorDeliveryAccessorial,
    availableAccessorials = [],
    availableDeliveryAccessorials = [],
    accessorialOptions,
    pickupZipCode,
    deliveryLocationCode,
    deliveryZipCode,
    piecesTotal,
    weightTotal,
    volumeTotal,
    pickupIndex,
    isFetching,
    onSelectRate,
    mainOpen,
    setMainOpen,
    ratesOpen,
    setRatesOpen,
    stackable,
    setStackable,
    shipmentType,
    setShipmentType,
    sortRules,
    expandedRows,
    setDisplayCount,
    allOpen,
    handleSort,
    handleToggleRow,
    sortedRates,
    displayedRates,
    hasMore,
    doorDeliveryLocationCode = '',
    doorDeliveryZipCode = '',
    doorDeliveryCity = '',
    doorDeliveryStackable = 'yes',
    onSetDoorDeliveryStackable,
    doorDeliveryShipmentType = 'LTL',
    onSetDoorDeliveryShipmentType,
    doorDeliveryIsFetching = false,
    onSelectDoorDeliveryRate,
    doorDeliveryRatesOpen = true,
    setDoorDeliveryRatesOpen,
    doorDeliverySortRules,
    doorDeliveryExpandedRows = new Set(),
    setDoorDeliveryDisplayCount,
    handleDoorDeliverySort,
    handleDoorDeliveryToggleRow,
    doorDeliverySortedRates = [],
    doorDeliveryDisplayedRates = [],
    doorDeliveryHasMore = false,
    altGatewayIsFetching = false,
    altGatewayRates = [],
    onSelectAltGatewayRate,
    altGatewayRatesOpen = true,
    setAltGatewayRatesOpen,
    altGatewaySortRules,
    altGatewayExpandedRows = new Set(),
    setAltGatewayDisplayCount,
    handleAltGatewaySort,
    handleAltGatewayToggleRow,
    altGatewaySortedRates = [],
    altGatewayDisplayedRates = [],
    altGatewayHasMore = false,
    deliveryAltGatewayIsFetching = false,
    deliveryAltGatewayRates = [],
    onSelectDeliveryAltGatewayRate,
    deliveryAltGatewayRatesOpen = true,
    setDeliveryAltGatewayRatesOpen,
    deliveryAltGatewaySortRules,
    deliveryAltGatewayExpandedRows = new Set(),
    setDeliveryAltGatewayDisplayCount,
    handleDeliveryAltGatewaySort,
    handleDeliveryAltGatewayToggleRow,
    deliveryAltGatewaySortedRates = [],
    deliveryAltGatewayDisplayedRates = [],
    deliveryAltGatewayHasMore = false,
}) => {
    const [pickupRateSelected, setPickupRateSelected] = useState(false);

    const handleOpenAll = () => {
        const newState = !allOpen;
        setMainOpen(newState);
        setRatesOpen(newState);
        setDoorDeliveryRatesOpen?.(newState);
        setAltGatewayRatesOpen?.(newState);
        setDeliveryAltGatewayRatesOpen?.(newState);
    };

    const handlePickupRateSelect = (rate: TruckRateV1) => {
        setPickupRateSelected(true);
        setRatesOpen(false);
        onSelectRate(rate);
    };

    const pickupSectionLabel = buildPickupSectionLabel(
        pickupIndex, pickupZipCode, pickupCity, piecesTotal, weightTotal, volumeTotal,
    );
    const doorSectionLabel = buildDoorSectionLabel(
        doorDeliveryZipCode, doorDeliveryCity, piecesTotal, weightTotal, volumeTotal,
    );

    const modalWidth = Math.max(900, typeof window !== 'undefined' ? window.innerWidth - 300 : 1320);

    const headerButtons = (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {onRefreshRates && (alternateGatewayOptions.length > 0 || deliveryAlternateGatewayOptions.length > 0) && (
                (altGatewayIsFetching || deliveryAltGatewayIsFetching) ? (
                    <Box className={styles.refreshLoading}>
                        <CircularProgress size={14} thickness={4} sx={{ color: '#ffffff' }} />
                        <span className={styles.refreshLoadingText}></span>
                    </Box>
                ) : (
                    <button className={styles.headerBtn} onClick={onRefreshRates}>
                        Refresh Rates
                    </button>
                )
            )}
            <button className={styles.headerBtn} onClick={handleOpenAll}>
                {allOpen ? 'Close All' : 'Open All'}
            </button>
        </Box>
    );

    return (
        <PModal
            title="Trucker Options"
            open={open}
            isCloseIcon={true}
            onClose={onClose}
            width={{ xs: '95vw', md: modalWidth } as any}
            height={{ xs: '90vh', md: '88vh' } as any}
            sx={{ backgroundColor: 'white' }}
            contentSx={{ pt: '0px', px: '0px', pb: '4px' }}
            headerAction={headerButtons}
        >
            <Box className={styles.modalWrapper}>
                <Box className={`${styles.sectionHeader} ${!mainOpen ? styles.sectionHeaderCollapsed : ''}`} onClick={() => setMainOpen(!mainOpen)}>
                    <span>Main Details</span>
                    <span className={styles.toggleIcon}>{mainOpen ? '–' : '+'}</span>
                </Box>

                {mainOpen && (
                    <>
                        <Box className={styles.mainDetailsGrid}>
                            <Box className={styles.detailsPanel}>
                                <Box className={styles.panelTitle}>
                                    {mode === 'CFDR' ? 'CFS Import Pickup Details' : 'Pickup Details'}
                                </Box>
                                <Box className={styles.panelFields}>
                                    {mode === 'CFDR' ? (
                                        <LocationFields
                                            cityLabel="Pickup Location Code"
                                            cityValue={deliveryLocationCode}
                                            zipLabel="Pickup Zip Code"
                                            zipValue={deliveryZipCode}
                                            onZipChange={onSetDeliveryZipCode}
                                        />
                                    ) : (
                                        <>
                                            <LocationFields
                                                cityLabel="Pickup City"
                                                cityValue={pickupCity}
                                                onCityChange={onSetPickupCity}
                                                zipLabel="Pickup Zip Code"
                                                zipValue={pickupZipCode}
                                                onZipChange={onSetPickupZipCode}
                                            />
                                            {mode === 'DRDR' && alternateGatewayOptions.length > 0 && (
                                                <AlternateGatewayPanel
                                                    gateway={alternateGateway}
                                                    onSetGateway={onSetAlternateGateway}
                                                    zipCode={alternateGatewayZipCode}
                                                    onSetZipCode={onSetAlternateGatewayZipCode}
                                                    options={alternateGatewayOptions}
                                                />
                                            )}
                                            {mode === 'DRDR' && (
                                                <StackableShipmentRow
                                                    stackable={stackable}
                                                    setStackable={setStackable}
                                                    shipmentType={shipmentType}
                                                    setShipmentType={setShipmentType}
                                                />
                                            )}
                                            <SelectedAccessorialsDisplay
                                                label="Accessorials"
                                                selectedCodes={pickupAccessorials}
                                                options={accessorialOptions}
                                            />
                                        </>
                                    )}
                                </Box>
                            </Box>

                            <Box className={`${styles.detailsPanel} ${styles.detailsPanelBordered}`}>
                                <Box className={styles.panelTitle}>
                                    {mode === 'CFDR' ? 'Door Delivery Details' : 'CFS Export Delivery Details'}
                                </Box>
                                <Box className={styles.panelFields}>
                                    {mode === 'CFDR' ? (
                                        <>
                                            <LocationFields
                                                cityLabel="Door Delivery Location Code"
                                                cityValue={doorDeliveryLocationCode}
                                                onCityChange={onSetDoorDeliveryCity}
                                                zipLabel="Door Delivery Zip Code"
                                                zipValue={doorDeliveryZipCode}
                                                onZipChange={onSetDoorDeliveryZipCode}
                                            />
                                            {onSetDoorDeliveryStackable && onSetDoorDeliveryShipmentType && (
                                                <StackableShipmentRow
                                                    stackable={doorDeliveryStackable}
                                                    setStackable={onSetDoorDeliveryStackable}
                                                    shipmentType={doorDeliveryShipmentType}
                                                    setShipmentType={onSetDoorDeliveryShipmentType}
                                                />
                                            )}
                                            <SelectedAccessorialsDisplay
                                                label="Accessorials"
                                                selectedCodes={doorDeliveryAccessorials}
                                                options={accessorialOptions}
                                            />
                                        </>
                                    ) : (
                                        <>
                                            <LocationFields
                                                cityLabel="Delivery Location Code"
                                                cityValue={deliveryLocationCode}
                                                zipLabel="Delivery Zip Code"
                                                zipValue={deliveryZipCode}
                                                onZipChange={onSetDeliveryZipCode}
                                            />
                                            {mode === 'DRCF' && (
                                                <StackableShipmentRow
                                                    stackable={stackable}
                                                    setStackable={setStackable}
                                                    shipmentType={shipmentType}
                                                    setShipmentType={setShipmentType}
                                                />
                                            )}
                                        </>
                                    )}
                                </Box>
                            </Box>

                            {mode === 'DRDR' ? (
                                <Box className={`${styles.detailsPanel} ${styles.detailsPanelBordered}`}>
                                    <Box className={styles.panelTitle}>Door Delivery Details</Box>
                                    <Box className={styles.panelFields}>
                                        <LocationFields
                                            cityLabel="Door Delivery Location Code"
                                            cityValue={doorDeliveryLocationCode}
                                            onCityChange={onSetDoorDeliveryCity}
                                            zipLabel="Door Delivery Zip Code"
                                            zipValue={doorDeliveryZipCode}
                                            onZipChange={onSetDoorDeliveryZipCode}
                                        />
                                        {deliveryAlternateGatewayOptions.length > 0 && (
                                            <AlternateGatewayPanel
                                                gateway={deliveryAlternateGateway}
                                                onSetGateway={onSetDeliveryAlternateGateway}
                                                zipCode={deliveryAlternateGatewayZipCode}
                                                onSetZipCode={onSetDeliveryAlternateGatewayZipCode}
                                                options={deliveryAlternateGatewayOptions}
                                            />
                                        )}
                                        {onSetDoorDeliveryStackable && onSetDoorDeliveryShipmentType && (
                                            <StackableShipmentRow
                                                stackable={doorDeliveryStackable}
                                                setStackable={onSetDoorDeliveryStackable}
                                                shipmentType={doorDeliveryShipmentType}
                                                setShipmentType={onSetDoorDeliveryShipmentType}
                                            />
                                        )}
                                        <SelectedAccessorialsDisplay
                                            label="Accessorials"
                                            selectedCodes={doorDeliveryAccessorials}
                                            options={accessorialOptions}
                                        />
                                    </Box>
                                </Box>
                            ) : mode === 'DRCF' ? (
                                <Box className={`${styles.detailsPanel} ${styles.detailsPanelBordered}`}>
                                    {alternateGatewayOptions.length > 0 && (
                                        <>
                                            <Box className={styles.panelTitle}>Alternate Gateway</Box>
                                            <Box className={styles.panelFields}>
                                                <AlternateGatewayPanel
                                                    gateway={alternateGateway}
                                                    onSetGateway={onSetAlternateGateway}
                                                    zipCode={alternateGatewayZipCode}
                                                    onSetZipCode={onSetAlternateGatewayZipCode}
                                                    options={alternateGatewayOptions}
                                                />
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            ) : (
                                <Box className={`${styles.detailsPanel} ${styles.detailsPanelBordered}`}>
                                    {deliveryAlternateGatewayOptions.length > 0 && (
                                        <>
                                            <Box className={styles.panelTitle}>Alternate Gateway</Box>
                                            <Box className={styles.panelFields}>
                                                <AlternateGatewayPanel
                                                    gateway={deliveryAlternateGateway}
                                                    onSetGateway={onSetDeliveryAlternateGateway}
                                                    zipCode={deliveryAlternateGatewayZipCode}
                                                    onSetZipCode={onSetDeliveryAlternateGatewayZipCode}
                                                    options={deliveryAlternateGatewayOptions}
                                                />
                                            </Box>
                                        </>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </>
                )}

                {(mode === 'DRCF' || mode === 'DRDR') && (

                    <RatesTable
                        sectionLabel={pickupSectionLabel}
                        sectionOpen={ratesOpen}
                        onToggleSection={() => setRatesOpen(!ratesOpen)}
                        isFetching={isFetching}
                        displayedRates={displayedRates}
                        sortRules={sortRules}
                        expandedRows={expandedRows}
                        hasMore={hasMore}
                        sortedRates={sortedRates}
                        onSort={handleSort}
                        onToggleRow={handleToggleRow}
                        onSelectRate={mode === 'DRDR' ? handlePickupRateSelect : onSelectRate}
                        onLoadMore={() => setDisplayCount(c => c + 5)}
                    />
                )}

                {(mode === 'CFDR' || mode === 'DRDR') &&
                    handleDoorDeliverySort &&
                    handleDoorDeliveryToggleRow &&
                    onSelectDoorDeliveryRate &&
                    setDoorDeliveryRatesOpen &&
                    setDoorDeliveryDisplayCount && (
                        <RatesTable
                            sectionLabel={doorSectionLabel}
                            sectionOpen={doorDeliveryRatesOpen}
                            onToggleSection={() => setDoorDeliveryRatesOpen(!doorDeliveryRatesOpen)}
                            isFetching={doorDeliveryIsFetching}
                            displayedRates={doorDeliveryDisplayedRates}
                            sortRules={doorDeliverySortRules ?? []}
                            expandedRows={doorDeliveryExpandedRows}
                            hasMore={doorDeliveryHasMore}
                            sortedRates={doorDeliverySortedRates}
                            onSort={handleDoorDeliverySort}
                            onToggleRow={handleDoorDeliveryToggleRow}
                            onSelectRate={onSelectDoorDeliveryRate}
                            onLoadMore={() => setDoorDeliveryDisplayCount(c => c + 5)}
                        />
                    )}

                {altGatewayRates.length > 0 &&
                    handleAltGatewaySort &&
                    handleAltGatewayToggleRow &&
                    onSelectAltGatewayRate &&
                    setAltGatewayRatesOpen &&
                    setAltGatewayDisplayCount && (
                        <RatesTable
                            sectionLabel={buildAltGatewaySectionLabel('Pickup', alternateGateway, alternateGatewayZipCode, piecesTotal, weightTotal, volumeTotal)}
                            sectionOpen={altGatewayRatesOpen}
                            onToggleSection={() => setAltGatewayRatesOpen(!altGatewayRatesOpen)}
                            isFetching={altGatewayIsFetching}
                            displayedRates={altGatewayDisplayedRates}
                            sortRules={altGatewaySortRules ?? []}
                            expandedRows={altGatewayExpandedRows}
                            hasMore={altGatewayHasMore}
                            sortedRates={altGatewaySortedRates}
                            onSort={handleAltGatewaySort}
                            onToggleRow={handleAltGatewayToggleRow}
                            onSelectRate={onSelectAltGatewayRate}
                            onLoadMore={() => setAltGatewayDisplayCount(c => c + 5)}
                        />
                    )}

                {deliveryAltGatewayRates.length > 0 &&
                    handleDeliveryAltGatewaySort &&
                    handleDeliveryAltGatewayToggleRow &&
                    onSelectDeliveryAltGatewayRate &&
                    setDeliveryAltGatewayRatesOpen &&
                    setDeliveryAltGatewayDisplayCount && (
                        <RatesTable
                            sectionLabel={buildAltGatewaySectionLabel('Door Delivery', deliveryAlternateGateway, deliveryAlternateGatewayZipCode, piecesTotal, weightTotal, volumeTotal)}
                            sectionOpen={deliveryAltGatewayRatesOpen}
                            onToggleSection={() => setDeliveryAltGatewayRatesOpen(!deliveryAltGatewayRatesOpen)}
                            isFetching={deliveryAltGatewayIsFetching}
                            displayedRates={deliveryAltGatewayDisplayedRates}
                            sortRules={deliveryAltGatewaySortRules ?? []}
                            expandedRows={deliveryAltGatewayExpandedRows}
                            hasMore={deliveryAltGatewayHasMore}
                            sortedRates={deliveryAltGatewaySortedRates}
                            onSort={handleDeliveryAltGatewaySort}
                            onToggleRow={handleDeliveryAltGatewayToggleRow}
                            onSelectRate={onSelectDeliveryAltGatewayRate}
                            onLoadMore={() => setDeliveryAltGatewayDisplayCount(c => c + 5)}
                        />
                    )}
            </Box>
        </PModal>
    );
};

export default TruckerOptionsModal;
