import { useCallback, useEffect, useState, useRef } from 'react';
import {
    PSelect,
    PTextField,
    PSingleValueSearchableField,
    PDatePicker,
    AutoTextarea,
    PModal,
    PConfirmationModal
} from 'phoenix-react-lib';

import { Box, IconButton } from '@mui/material';
import styles from '../../../../styles/LCL/routing-details.module.css';
import searchIcon from '../../../../assets/images/search-icon.png';
import editIcon from '../../../../assets/edit.png';
import { LocationSearchModal } from '../locationSearch/index';
import { RoutingDetailsProps, RoutingRow, RoutingFormData } from '../../../../types/LCL/routing/RoutingDetails.types';
import { SailingScheduleSearchPage } from '../SailingScheduleSearch';
import type {
    ScheduleRow,
    ScheduleGroup,
} from '@/types/LCL/misc/SailingScheduleSearch.types';
import type { LocationResult } from '@/types';
import {
    useFeatureToggle
} from '../../../../hooks/LCL';
import {
    CommonToggleKeys,
} from '../../../../core/featureToggles/featureToggle.types';
import { useAppSelector } from '../../../../app/store/hooks';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';
import { ApiService } from '../../../../core/api/client';
import { COMMON_ENDPOINTS } from '../../../../core/api/config/common.endpoints';
import EditNoteicon from '../../../../assets/edit.svg';

const EMBARGO_FIELD_KEYS: Record<string, string> = {
    placeOfReceiptCode: 'Place of Receipt Code',
    loadCode: 'Load Code',
    dischargeCode: 'Discharge Code',
    rampCode: 'Ramp Code',
    placeOfDeliveryCode: 'Place of Delivery Code',
};

const EditIcon = () => (
    <svg
        width="11"
        height="11"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path
            d="M1 9L7.5 2.5L9.5 4.5L3 11H1V9Z"
            stroke="#444"
            strokeWidth="1.2"
            strokeLinejoin="round"
        />
        <line x1="6" y1="4" x2="8" y2="6" stroke="#444" strokeWidth="1.2" />
    </svg>
);

const routingRows = [
    {
        code: "Place Of Receipt Code",
        name: "Place of Receipt Name",
        date: "ETD",
        codeRequired: false,
        nameRequired: false,
        dateRequired: false,
        region: "Place Of Receipt Region",
        codeName: "placeOfReceiptCode",
        fieldName: "placeOfReceiptName",
        dataName: "placeOfReceiptEtd",
        regionName: "placeOfReceiptRegion",
        field: "placeOfReceipt"
    },
    {
        code: "Load Code",
        name: "Load Name",
        date: "ETS",
        codeRequired: true,
        nameRequired: true,
        dateRequired: false,
        region: "Load Port Region",
        codeName: "loadCode",
        fieldName: "loadName",
        dataName: "loadEts",
        regionName: "loadRegion",
        field: "load"
    },
    {
        code: "Discharge Code",
        name: "Discharge Name",
        date: "ETA",
        codeRequired: true,
        nameRequired: true,
        dateRequired: false,
        region: "Discharge Port Region",
        codeName: "dischargeCode",
        fieldName: "dischargeName",
        dataName: "dischargeEta",
        regionName: "dischargeRegion",
        field: "discharge"
    },
    {
        code: "Ramp Code",
        name: "Ramp Name",
        date: "ETA",
        codeRequired: false,
        nameRequired: false,
        dateRequired: false,
        region: "Deconsolidation Region",
        codeName: "rampCode",
        fieldName: "rampName",
        dataName: "rampEta",
        regionName: "rampRegion",
        field: "ramp"
    },
    {
        code: "Place of Delivery Code",
        name: "Place of Delivery Name",
        date: "ETA",
        codeRequired: false,
        nameRequired: false,
        dateRequired: false,
        region: "Place Of Delivery Region",
        codeName: "placeOfDeliveryCode",
        fieldName: "placeOfDeliveryName",
        dataName: "placeOfDeliveryEta",
        regionName: "placeOfDeliveryRegion",
        field: "placeOfDelivery"
    }
] as const satisfies readonly RoutingRow[];

const RoutingDetails = ({
    formData = {} as RoutingFormData,
    onChange = () => { },
    onFieldsChange = () => { },
    onRegisterFields = () => { },
    tempData = {},
    vesselSuggestion,
    handleVesselCodeSelect = () => { },
    handlePreCarriageBySelect = () => { },
    locationSuggestions,
    handleLocationCodeSelect = () => { },
    scheduleSearchOpen,
    onOpenScheduleSearch = () => { },
    onCloseScheduleSearch = () => { },
    onScheduleBookThis = () => { },
    carriageListBoxAddKeyDownHandler = () => { },
    rateDetails,
    moduleType,
    routingRef,
    datePickerKeyDownHandler = () => { },
    dateSelectionHandler = () => { },
    datePickerOnBlurHandler = () => { },
    error,
    voyageInputRef,
    mainDetailsValue,
    onWarning,
    showStatus,
    validateLocationOnTab,
    validateVesselOnTab,
    skipNextBlurValidation,
    setSkipNextBlurValidation
}: RoutingDetailsProps) => {
    const [editableFields, setEditableFields] = useState<Set<string>>(new Set(["placeOfReceiptName", "rampName", "placeOfDeliveryName"]));
    const [showLocationSearchPopup, toggleLocationSearchPopup] = useState<boolean>(false);
    const TRACKED_FIELDS: string[] = ["loadCode", "dischargeCode", "loadName", "dischargeName"];
    const { isVisible, isMandatory } = useFeatureToggle();
    const skipBlurRef = useRef<Record<string, boolean>>({});
    const [fieldName, setFieldName] = useState<string>("");

    const accurateRate = rateDetails?.defaultState?.accurateRate;
    useEffect(() => {
        onRegisterFields?.(TRACKED_FIELDS);
    }, []);

    useEffect(() => {
        onFieldsChange?.(formData);
    }, [formData]);

    const handleEditToggle = (key: string) => {
        setEditableFields((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const locationOptions = tempData.locationOptions;

    const renderSearchIcon = (label: string) => (
        <Box className={styles.searchIconFCL} onClick={() => { (label != "VesselCode") ? handleOpenLocationModal(label) : onOpenScheduleSearch() }}>
            <img src={searchIcon} alt="search" className={styles.searchImg} />
        </Box>
    );

    const selectInputRef = (codeFieldName: string) => {
        const refMap: Record<string, any> = {
            placeOfReceiptCode: routingRef?.placeOfReceiptInputLocationSelectionRef,
            loadCode: routingRef?.loadInputLocationSelectionRef,
            placeOfDeliveryCode: routingRef?.destinationInputLocationSelectionRef,
            rampCode: routingRef?.deConsolidationCodeInputLocationSelectionRef,
            dischargeCode: routingRef?.dischargeInputLocationSelectionRef,
            placeOfReceiptEtd: routingRef?.origineEtdDateRef,
            loadEts: routingRef?.etsDateRef,
            dischargeEta: routingRef?.etaDateRef,
            placeOfDeliveryEta: routingRef?.etaDestinationDateRef,
        };

        return refMap[codeFieldName] || null;
    };

    const [activeField, setActiveField] = useState<string | null>(null);
    const [locationModalKey, setLocationModalKey] = useState(0);

    const handleOpenLocationModal = (field: string) => {
        setActiveField(field);
        setLocationModalKey((prev) => prev + 1);
        toggleLocationSearchPopup(true);
    };

    const handleLocationSelect = (loc: LocationResult) => {
        if (!activeField) return;

        switch (activeField) {
            case 'placeOfReceipt':
                onChange('placeOfReceiptCode', loc.code);
                onChange('placeOfReceiptName', loc.name);
                onChange('placeOfReceiptRegion', loc.exportRegion);
                break;
            case 'load':
                onChange('loadCode', loc.code);
                onChange('loadName', loc.name);
                onChange('loadRegion', loc.exportRegion);
                break;
            case 'discharge':
                onChange('dischargeCode', loc.code);
                onChange('dischargeName', loc.name);
                onChange('dischargeRegion', loc.exportRegion);
                break;
            case 'ramp':
                onChange('rampCode', loc.code);
                onChange('rampName', loc.name);
                onChange('rampRegion', loc.exportRegion);
                break;
            case 'placeOfDelivery':
                onChange('placeOfDeliveryCode', loc.code);
                onChange('placeOfDeliveryName', loc.name);
                onChange('placeOfDeliveryRegion', loc.exportRegion);
                break;
        }
    };

    const loginBean = useAppSelector(selectLoginClientBean);

    const showAccurateRatesToggle =
        isVisible(
            CommonToggleKeys.RESTRICT_ACCURATE_RATES_RESET_BY_SAILING_SCHEDULE
        ) &&
        !!mainDetailsValue?.referenceNumber &&
        (moduleType === 'BKG' || moduleType === 'QUOTE');

    const parseScheduleDate = (dateStr: string): Date | null => {
        if (!dateStr) return null;
        const d = new Date(dateStr);
        return isNaN(d.getTime()) ? null : d;
    };

    const handleScheduleBookThis = useCallback(
        async (
            row: ScheduleRow,
            group: ScheduleGroup,
            isAccurateRatesReset: string
        ) => {
            onCloseScheduleSearch?.();

            onChange('placeOfReceiptCode', '');
            onChange('placeOfReceiptName', '');
            onChange('placeOfReceiptRegion', '');
            onChange('loadCode', '');
            onChange('loadName', '');
            onChange('loadRegion', '');
            onChange('dischargeCode', '');
            onChange('dischargeName', '');
            onChange('dischargeRegion', '');
            onChange('rampCode', '');
            onChange('rampName', '');
            onChange('rampRegion', '');
            onChange('placeOfDeliveryCode', '');
            onChange('placeOfDeliveryName', '');
            onChange('placeOfDeliveryRegion', '');

            onChange('vesselCode', row.imoNumber);
            onChange('vesselName', row.vesselName);
            onChange('voyage', row.voyageCode ? row.voyageCode.slice(0, 10) : '');
            onChange('carrierCode', row.carrierScac);

            onChange('loadEts', parseScheduleDate(row.etd));
            onChange('dischargeEta', parseScheduleDate(row.eta));

            onScheduleBookThis?.(row, group, isAccurateRatesReset);
        },
        [
            loginBean,
            onChange,
            onCloseScheduleSearch,
            onScheduleBookThis,
            isVisible,
        ]
    );

    const handleLocationSelectWithEmbargoCheck = async (
        item: Record<string, unknown>,
        codeField: keyof RoutingFormData,
        nameField: keyof RoutingFormData,
        regionField: keyof RoutingFormData
    ) => {
        handleLocationCodeSelect?.(item, codeField, nameField, regionField);

        const code = String(item.code ?? '');
        if (!code) return;

        const fieldLabel = EMBARGO_FIELD_KEYS[codeField as string];
        if (!fieldLabel) return;

        const embargoLocationSetting = loginBean?.officeSettingMap?.['EMBARGO_LOCATION']?.[0];
        const isEmbargoLocation = embargoLocationSetting?.toUpperCase() !== 'N';
        const officeCode = loginBean?.office ?? '';

        try {
            type EmbargoResponse = {
                success: number;
                result: Record<string, string>;
            };
            const res = await ApiService.post<EmbargoResponse>(
                COMMON_ENDPOINTS.LOCATION.VALIDATE_EMBARGO_ROUTING_CODES,
                {
                    requestData: {
                        routingCodeValidationBean: {
                            routingcodesMap: { [fieldLabel]: code },
                            loginBean: { officeCode },
                            isEmbargoLocation,
                        },
                    },
                }
            );
            const result = res.data?.result ?? {};
            if (Object.keys(result).length > 0) {
                const msg = Object.entries(result)
                    .map(([key, val]) => `Embargo Location in ${key} ${val} In Routing Detail`)
                    .join('\n');
                onWarning?.(msg);
                onChange(codeField, '' as never);
                onChange(nameField, '' as never);
                onChange(regionField, '' as never);
            }
        } catch {
            // Fail silently — do not block user if endpoint is unavailable
        }
    };

    return (
        <div className="routing-details-container enterprise-form">
            <Box className={styles.pad4x8}>
                <Box className={styles.grid}>
                    <Box className={styles.colSpan3}>
                        <PSelect
                            label="Pre-Carriage Type"
                            value={formData.preCarriageType}
                            options={tempData.preCarriageTypes}
                            onChange={(val) => {
                                onChange('preCarriageType', val);
                                // onChange('preCarriageBy', "");
                                // setTimeout(() => {
                                //     preCarriageByRef.current?.focus();
                                // }, 0);
                            }}
                            onKeyDown={carriageListBoxAddKeyDownHandler}
                        />
                    </Box>

                    <Box className={styles.colSpan14}>
                        {formData.preCarriageType === "VESSEL" ?
                            <PSingleValueSearchableField
                                label="Pre-Carriage By"
                                data={vesselSuggestion?.data ?? []}
                                value={formData.preCarriageBy}
                                inputRef={routingRef?.preCarriageByRef}
                                columnHeaders={[]}
                                displayFields={['label']}
                                onChange={(val) => {
                                    onChange('preCarriageBy', val);
                                    vesselSuggestion?.setQuery(val);
                                }}
                                onSelect={(val: any) => {
                                    handlePreCarriageBySelect?.(val as Record<string, unknown>)
                                    onChange('preCarriageBy', val?.name);
                                }}
                                maxlength={60}
                                usePortal
                            />
                            :
                            <PTextField
                                label="Pre-Carriage By"
                                value={formData.preCarriageBy}
                                onChange={(e) => { onChange('preCarriageBy', e.target.value) }}
                                inputRef={routingRef?.preCarriageByRef}
                                maxlength={60}
                            />
                        }
                    </Box>
                </Box>

                <Box className={styles.grid}>
                    <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
                        <PSingleValueSearchableField
                            label="Vessel Code"
                            data={vesselSuggestion?.data ?? []}
                            value={formData.vesselCode}
                            columnHeaders={[]}
                            displayFields={['label']}
                            inputRef={routingRef.vesselCodeInputSelectionRef}
                            onChange={(val) => {
                                skipBlurRef.current.vessel = true;
                                onChange('vesselCode', val);
                                vesselSuggestion?.setQuery(val);
                            }}
                            onSelect={(val: Record<string, unknown>) => {
                                handleVesselCodeSelect?.(val as Record<string, unknown>)
                                // setTimeout(() => {
                                //     voyageRef.current?.focus();
                                // }, 0);
                            }}
                            usePortal
                            onKeyDown={(e: any) => {
                                if (e.key === 'Tab') {
                                    routingRef.vesselCodeInputSelectionRef.current?.focus();
                                    validateVesselOnTab({
                                        value: formData.vesselCode || '',
                                        data: vesselSuggestion?.data ?? [],
                                        onChange,
                                        showStatus,
                                    });
                                }
                            }}
                            onBlur={() => {
                                setTimeout(() => {
                                    if (skipBlurRef.current.vessel) {
                                        skipBlurRef.current.vessel = false;
                                        return;
                                    }
                                    validateVesselOnTab({
                                        value: formData.vesselCode || '',
                                        data: vesselSuggestion?.data ?? [],
                                        onChange,
                                        showStatus,
                                    });
                                }, 150);
                            }}
                        />
                        {renderSearchIcon("VesselCode")}
                    </Box>

                    <Box className={styles.colSpan14}>
                        <PTextField
                            label="Vessel Name"
                            disabled
                            value={formData.vesselName}
                            onChange={(e) => onChange('vesselName', e.target.value)}
                        />
                    </Box>

                    <Box className={`${styles.colSpan4} ${styles.ml10}`}>
                        <PTextField
                            label="Voyage"
                            value={formData.voyage}
                            onChange={(e) => onChange('voyage', e.target.value.slice(0, 10))}
                            // maxlength={10}
                            inputRef={voyageInputRef}
                        />
                    </Box>
                </Box>

                <hr className={`${styles.routingDivider}`} />

                {
                    routingRows.map((row, index) => (
                        <Box key={index} className={styles.grid}>
                            <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
                                <PSingleValueSearchableField
                                    label={row.code}
                                    required={row.codeRequired}
                                    displayFields={['code', 'name', 'locode', 'country']}
                                    columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
                                    onChange={(value) => {
                                        // setlocationCountryCodeQuery(value);
                                        locationSuggestions?.locationCountryCodeData.setQuery(value);
                                        onChange(row.codeName, value);
                                        if (value === "") {
                                            onChange(row.fieldName, value);
                                            onChange(row.regionName, value);
                                        }
                                    }}
                                    onSelect={(val: any) => {
                                        skipBlurRef.current.location = true;
                                        handleLocationSelectWithEmbargoCheck?.(
                                            val as Record<string, unknown>,
                                            row.codeName,
                                            row.fieldName,
                                            row.regionName
                                        )
                                    }}
                                    data={locationSuggestions?.locationCountryCodeData.data ?? locationOptions}
                                    value={formData[row.codeName]}
                                    inputRef={selectInputRef(row.codeName)}
                                    usePortal
                                // onBlur={() => {
                                //     setTimeout(() => {
                                //         if (skipBlurRef.current.location) {
                                //             skipBlurRef.current.location = false;
                                //             return;
                                //         }
                                //         validateLocationOnTab({
                                //             value: formData[row.codeName],
                                //             data: locationSuggestions?.locationCountryCodeData.data,
                                //             codeKey: row.codeName,
                                //             nameKey: row.fieldName,
                                //             label: row.code,
                                //             regionKey: row.regionName,
                                //             unCodeKey: 'originUncode',
                                //             onChange,
                                //             onSelect: handleLocationCodeSelect,
                                //             showStatus
                                //         });
                                //     }, 150);
                                // }}
                                />
                                {renderSearchIcon(row.field)}
                            </Box>
                            <Box className={styles.colSpan14}>
                                <PTextField
                                    label={row.name}
                                    value={formData[row.fieldName]}
                                    onChange={(e) => onChange(row.fieldName, e.target.value.slice(0, 40))}
                                    disabled={!editableFields.has(row.fieldName)}
                                    required={row.nameRequired}
                                    // maxlength={40}
                                />
                            </Box>
                            <Box className={styles.editBtnCell}>
                                <IconButton
                                    size="small"
                                    onClick={() => handleEditToggle(row.fieldName)}
                                    className={`${styles.editBtn} ${editableFields.has(row.fieldName) ? styles.editBtnActive : ''}`}
                                >
                                    {/* <EditIcon /> */}
                                    <Box component="img" src={EditNoteicon} />
                                    {/* <img src={editIcon} alt="Edit" className={styles.editImg} /> */}
                                </IconButton>
                            </Box>
                            <Box className={`${styles.colSpan3} ${styles.mlNeg21}`}>
                                <PDatePicker
                                    id="portOfLoadingEts"
                                    label={row.date}
                                    required={row.dateRequired}
                                    value={formData[row.dataName]}
                                    onChange={(val) =>{
                                        onChange(row.dataName, (val ?? null) as never)
                                        setSkipNextBlurValidation?.(true);
                                        setFieldName(row.dataName);}
                                    }
                                    onkeydown={(event) => {
                                        datePickerKeyDownHandler(event as React.KeyboardEvent<HTMLInputElement>, row.dataName);
                                    }}
                                    onDateSelection={(val: Date | null) => {
                                        dateSelectionHandler(val, row.dataName);
                                    }}
                                    onBlur={(event) => {
                                        datePickerOnBlurHandler(event as React.KeyboardEvent<HTMLInputElement>, row.dataName);
                                    }}
                                    inputRef={selectInputRef(row.dataName)}
                                    skipNextBlurValidation={skipNextBlurValidation}
                                />
                            </Box>
                            <Box className={`${styles.colSpan3} ${styles.mr20}`}>
                                <PTextField
                                    label={row.region}
                                    value={formData[row.regionName]}
                                    disabled
                                />
                            </Box>

                        </Box>
                    ))}

                <hr className={`${styles.routingDivider}`} />
                <Box className={styles.grid}>
                    <Box className={styles.colSpan10}>
                        <AutoTextarea
                            label="Location Information (Public)"
                            value={formData.locationInformationPublic}
                            autoSize
                            disabled
                        />
                    </Box>

                    <Box className={styles.colSpan11}>
                        <AutoTextarea
                            label="Location Information (Private)"
                            value={formData.locationInformationPrivate}
                            autoSize
                            disabled
                        />
                    </Box>
                </Box>
            </Box>
            {showLocationSearchPopup && (
                <LocationSearchModal key={locationModalKey} open={showLocationSearchPopup} onClose={() => { toggleLocationSearchPopup(!showLocationSearchPopup) }} onSelect={handleLocationSelect} />
            )}
            <PModal
                open={scheduleSearchOpen ?? false}
                onClose={onCloseScheduleSearch ?? (() => { })}
                title="Schedule"
                isCloseIcon={true}
                width={970}
                height={500}
            >
                <SailingScheduleSearchPage onBookThis={handleScheduleBookThis} showAccurateRatesToggle={showAccurateRatesToggle} />
            </PModal>
            <PConfirmationModal
                open={error?.showErrorModal ?? false}
                title='Error'
                variant='danger'
                buttonAlign="end"
                message={error?.message}
                secondaryAction={{
                    label: "Close",
                    onClick: () => {
                        error?.onClose(fieldName);
                        setSkipNextBlurValidation?.(false);
                    }
                }} />
        </div>
    );
};

export default RoutingDetails;