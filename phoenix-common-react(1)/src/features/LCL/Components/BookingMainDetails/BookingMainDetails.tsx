import dayjs from 'dayjs';
import { PDatePicker, PMultiValueSearchableField, PSelect, PSingleValueSearchableField, PTextField, PToggleButton } from 'phoenix-react-lib';
import React, { useEffect, useMemo, useState } from 'react';
import { useFeatureToggle } from '../../../../hooks/LCL/useFeatureToggle';
import './main-details.style.css';
import { CommonToggleKeys } from '../../../../core/featureToggles';
import { useGetSuggestions } from '../../../../hooks/LCL/useGetSuggestions';
import { bookingTypeSuggestionConfig, clauseSuggestionConfig, ediDestinationSuggestionConfig, officeSuggestionConfig, quoteByTypeSuggestionConfig, userReferenceSuggestionConfig } from '../../../../hooks/LCL/suggestionHelpers';
import { BookingFormState } from './mainDetails.state';
import { useAppDispatch, useAppSelector } from '../../../../app/store/hooks';
import { updateBookingMainDetails } from './../../../../app/slices/LCL/Booking/bookingSlice';
import { useGetSelections } from '../../../../hooks/LCL/useGetSelections';
import { bookingModeOfTransportConfig } from '../../../../hooks/LCL/selectionHelpers';
import { StatusType } from '../../../../types/LCL/misc/commonTypes';

export interface BookingMainDetailsProps {
    onRegisterFields?: (fields: string[]) => void;
    onFieldsChange?: (formData: any) => void;
    onPopulateData?: (referenceNumber: string, quoteNumber: string) => void;
    value?: Partial<BookingFormState>;
    showStatus: (type: StatusType, messages: string[]) => void;
    preloadedClauseSuggestions?: Array<{ code: string; name: string; description: string }>;
    suggestClauseIconClick?: () => void;
}

export const DATE_FORMAT = 'DD-MMM-YYYY';

const formatRequestDate = (value: string | null) =>
    value ? dayjs(value).format(DATE_FORMAT).toUpperCase() : null;

const typeOptions = [
    { label: "FCL Booking", value: "F" },
    { label: "LCL Booking", value: "L" },
];

const routedOptions = [
    { label: "Yes", value: "Y" },
    { label: "No", value: "N" },
];

function setDefaultBookingChannelAsPerOffice(officeSetting: string | undefined) {
    if ("p" === officeSetting?.toLowerCase()) {
        return "Email";
    } else if ("h" === officeSetting?.toLowerCase()) {
        return "Phone";
    } else if ("c" === officeSetting?.toLowerCase()) {
        return "Chat App";
    }
}

export const BookingMainDetailsSection: React.FC<BookingMainDetailsProps> = ({ onRegisterFields, onFieldsChange, onPopulateData, value, showStatus, preloadedClauseSuggestions, suggestClauseIconClick }) => {

    const MANDATORY_FIELDS: string[] = ["bookingQuoteType", "receivedVia", "takenBy"] as const;
    // const [isExpanded, setIsExpanded] = useState(true);
    const [showMore, setShowMore] = useState(true);
    const { isVisible, getToggleValue } = useFeatureToggle();
    const dispatch = useAppDispatch();
    const loginClientBean = useAppSelector((state: any) => state.loginClientBean?.data);
    const formState = useAppSelector((state) => state.booking.mainDetails);
    const getMaximumClausesSize = getToggleValue(CommonToggleKeys?.OCN_MAXIMUM_CLAUSE_SIZE)
    const MULTISELECT_FIELD_MAXLIMIT = {
        clauses: getMaximumClausesSize
            ? Number(getMaximumClausesSize)
            : 3,
    };
    const userReferenceSuggConfigParam : Record<string,unknown> = {
        schemaOffice : loginClientBean?.office,
        handlingOffice : formState?.handlingOffice || loginClientBean?.office,
        schemaName : loginClientBean?.schema,
    }

    const {
        data: bookingTypeSuggestions,
        setQuery: setBookingTypeQuery,
    } = useGetSuggestions(bookingTypeSuggestionConfig(loginClientBean as any));

    const {
        data: quoteNumberSuggestions,
        setQuery: setQuoteNumberQuery,
    } = useGetSuggestions(quoteByTypeSuggestionConfig(loginClientBean as any));

    const {
        data: userReferenceSuggestions,
        setQuery: setUserReferenceQuery,
    } = useGetSuggestions(userReferenceSuggestionConfig(userReferenceSuggConfigParam as Record<string, unknown>));
    const {
        data: transmitToSuggestions,
        setQuery: setTransmitToQuery,
    } = useGetSuggestions(ediDestinationSuggestionConfig(loginClientBean as any));

    const {
        data: clauseSuggestions,
        setQuery: setClauseQuery,
    } = useGetSuggestions(clauseSuggestionConfig(loginClientBean as any));

    const {
        data: officeSuggestions,
        setQuery: setOfficeQuery,
    } = useGetSuggestions(officeSuggestionConfig);

    const {
        data: bookingModeOfTransportSelections,
    } = useGetSelections(bookingModeOfTransportConfig);

    const modeOfTransportOptions = bookingModeOfTransportSelections.map((item: any) => ({
        label: item?.label ?? '',
        value: item?.value ?? '',
    }));

    const isChatAppEnabled = isVisible(CommonToggleKeys.OCN_QUO_BKG_SHOW_CHATAPP_CHANNEL);
    const receivedViaOptions = useMemo(() => {
        const options = [
            { label: "Email", value: "P" },
            { label: "Phone", value: "H" },
        ];
        if (isChatAppEnabled) {
            options.push({ label: "Chat App", value: "Chat App" });
        }
        return options;
    }, [isChatAppEnabled]);

    const bookingChannelDefaultValue = getToggleValue(CommonToggleKeys.OCN_SHOW_BOOKING_CHANNEL_DEFAULT_VALUE);
    const defaultReceivedVia = setDefaultBookingChannelAsPerOffice(bookingChannelDefaultValue);

    useEffect(() => {
        if (!value) return;
        dispatch(updateBookingMainDetails(value));
    }, [dispatch, value]);

    useEffect(() => {
        onRegisterFields?.(MANDATORY_FIELDS);
        onFieldsChange?.({
            ...formState,
            bookQuoteDate: formatRequestDate(formState.bookQuoteDate),
            updatedOn: formatRequestDate(formState.updatedOn),
        });
    }, [formState]);

    useEffect(() => {
        if (value?.receivedVia) return;
        const hasValidSelection = receivedViaOptions.some((option) => option.value === formState.receivedVia);
        if (!hasValidSelection || !formState.receivedVia) {
            handleChange('receivedVia', defaultReceivedVia);
        }
    }, [defaultReceivedVia, formState.receivedVia, receivedViaOptions, value?.receivedVia]);

    const handleChange = (field: keyof BookingFormState, value: any) => {
        let nextValue = value;

        if (
            field === 'isCustomerOwnCFSAgreement' ||
            field === 'directLoading' ||
            field === 'vid' ||
            field === 'customerOwnContainerToggle' ||
            field === 'pendingFinalBookingStatus'
        ) {
            if (typeof value === 'boolean') {
                nextValue = value ? 'Y' : 'N';
            } else if (value === 'Yes' || value === 'No') {
                nextValue = value === 'Yes' ? 'Y' : 'N';
            }
        }

        dispatch(updateBookingMainDetails({ [field]: nextValue } as Partial<BookingFormState>));
    };

    return (
        <div className="main-details-container enterprise-form">
            <div className="main-details-content">
                <div>
                    <div className='main-details-grid grid-cols-24'>
                        <div key='bookingQuoteType' className='col-span-4'>
                            <PSelect
                                label='Type'
                                placeholder='Please Select'
                                value={formState.bookingQuoteType}
                                onChange={(val) => handleChange('bookingQuoteType', val)}
                                options={typeOptions}
                                required={true}
                            />
                        </div>
                        <div key='referenceNumber' className={formState?.amendmentCodeBean?.amendmentCode && formState?.amendmentCodeBean?.amendmentCode !== '00' ? 'col-span-3' : 'col-span-4'}>
                            <PSingleValueSearchableField
                                label='Reference'
                                id='referenceNumber'
                                value={formState?.referenceNumber || ''}
                                data={bookingTypeSuggestions}
                                displayFields={['label']}
                                columnHeaders={[]}
                                onChange={(value) => {
                                    setBookingTypeQuery(value);
                                    handleChange('referenceNumber', value);
                                }}
                                onSelect={(item) => {
                                    onPopulateData?.(item.value as string, undefined);
                                    handleChange('referenceNumber', item.value);
                                }}
                            />
                        </div>
                        {formState?.amendmentCodeBean?.amendmentCode && formState?.amendmentCodeBean?.amendmentCode !== '00' && (
                            <div key='amendmentCode' className='col-span-1'>
                                <PTextField
                                    label=' '
                                    value={formState?.amendmentCodeBean?.amendmentCode}
                                    disabled
                                    sx={{ mt: 1.7 }}
                                />
                            </div>
                        )}
                        <div key='quoteNumber' className='col-span-4'>
                            <PSingleValueSearchableField
                                label='Quote Number'
                                id='quoteNumber'
                                value={formState?.quoteNumber || ''}
                                data={quoteNumberSuggestions}
                                displayFields={['label']}
                                columnHeaders={[]}
                                onChange={(value) => {
                                    setQuoteNumberQuery(value)
                                    handleChange('quoteNumber', value);
                                }}
                                onSelect={(item) => {
                                    onPopulateData?.(undefined, item.value as string);
                                    handleChange('quoteNumber', item.value);
                                }}
                            />
                        </div>
                        <div key='userReference' className='col-span-4' data-eservice-field="CUSTOMER_REFERENCE">
                            <PSingleValueSearchableField
                                label='User Reference'
                                id='userReference'
                                value={formState?.userReference || ''}
                                data={userReferenceSuggestions}
                                displayFields={['displayValue']}
                                columnHeaders={[]}
                                onChange={(value) => {
                                    setUserReferenceQuery(value);
                                    handleChange('userReference', value);
                                }}
                                onSelect={(item) => handleChange('userReference', item.code)}
                            />
                        </div>
                        <div key='modeOfTransport' className='col-span-4'>
                            <PSelect
                                label='Mode Of Transport'
                                value={formState.modeOfTransport}
                                onChange={(val) => handleChange('modeOfTransport', val)}
                                options={modeOfTransportOptions}
                            />
                        </div>
                        <div key='routed' className='col-span-4'>
                            <PSelect
                                label='Routed'
                                placeholder='Please Select'
                                value={formState.routed}
                                onChange={(val) => handleChange('routed', val)}
                                options={routedOptions}
                            />
                        </div>
                    </div>
                    <div className='main-details-grid grid-cols-24'>
                        {isVisible(CommonToggleKeys.OCEAN_BKG_AUTO_SEND_CUST_OWN_CFS_AGR_FOR_JYD_WH) && (
                            <div key='isCustomerOwnCFSAgreement' className='col-span-4'>
                                <PToggleButton
                                    label='Customer Own CFS Agreement'
                                    value={formState.isCustomerOwnCFSAgreement === 'Y'}
                                    onChange={(val) => handleChange('isCustomerOwnCFSAgreement', val)}
                                    yesTitle={'Yes'}
                                    noTitle={'No'} />
                            </div>
                        )}
                        {isVisible(CommonToggleKeys.WMA_TRUCKER_SCREEN) && (
                            <div key='controlNumber' className='col-span-4'>
                                <PTextField
                                    label='Control Number'
                                    value={formState.controlNumber}
                                    onChange={(e) => handleChange('controlNumber', e.target.value)}
                                />
                            </div>
                        )}
                        <div key='directLoading' className='col-span-2'>
                            <PToggleButton
                                label='Direct Loading'
                                value={formState.directLoading === 'Y'}
                                onChange={(val) => handleChange('directLoading', val)}
                                yesTitle={'Yes'}
                                noTitle={'No'} />
                        </div>
                        <div key='vid' className='col-span-2'>
                            <PToggleButton
                                label='No Origin VID'
                                value={formState.vid === 'Y'}
                                onChange={(val) => handleChange('vid', val)}
                                yesTitle={'Yes'}
                                noTitle={'No'} />
                        </div>
                        <div key='transmitToLocationName' className='col-span-4'>
                            <PSingleValueSearchableField
                                label='Transmit To'
                                id='transmitTo'
                                value={formState?.transmitToLocationName || ''}
                                data={transmitToSuggestions}
                                displayFields={['label']}
                                columnHeaders={[]}
                                onChange={(value) => {
                                    setTransmitToQuery(value);
                                    handleChange('transmitToLocationName', value);
                                }}
                                onSelect={(item) => {
                                    const locationName = item.label.replace(` - ${item.value}`, '');
                                    handleChange('transmitToLocationName', locationName);
                                    handleChange('transmitToLocation1', item.value);
                                }}
                            />
                        </div>
                        <div key='customerOwnContainerToggle' className='col-span-4'>
                            <PToggleButton
                                label='Customer Own Container'
                                value={formState.customerOwnContainerToggle === 'Y'}
                                onChange={(val) => handleChange('customerOwnContainerToggle', val)}
                                yesTitle={'Yes'}
                                noTitle={'No'} />
                        </div>
                        <div key='clauses' className='col-span-8'>
                            <PMultiValueSearchableField
                                label="Clauses"
                                id="clauses"
                                data={clauseSuggestions.length > 0 ? clauseSuggestions : (preloadedClauseSuggestions ?? [])}
                                maxSelectionAllowed={MULTISELECT_FIELD_MAXLIMIT.clauses}
                                initialSelectedItems={
                                    formState?.clauses?.map((c) => ({
                                        code: c.clauseCode,
                                        name: c.clauseName ?? '',
                                        description: c.clauseDesc ?? '',
                                    })) || []
                                }
                                displayFields={['code', 'name', 'description']}
                                suggestClausesIcon={formState?.bookingQuoteType === 'L'}
                                columnHeaders={[]}
                                onSearch={(val: string) => setClauseQuery(val)}
                                onSelect={(item) => {
                                const currentClauses = Array.isArray(formState?.clauses)
                                    ? formState.clauses
                                    : [];
                                const alreadyAdded = currentClauses.some(
                                    (c: any) => c.clauseCode === item.code
                                );
                                if (!alreadyAdded) {
                                    handleChange('clauses', [
                                    ...currentClauses,
                                    {
                                        clauseCode: item.code,
                                        clauseName: item.name ?? null,
                                        clauseDesc: item.description ?? null,
                                    },
                                    ]);
                                }
                                }}
                                onRemove={(removedItem) => {
                                    const currentClauses = Array.isArray(formState?.clauses)
                                        ? formState.clauses
                                        : [];
                                    handleChange(
                                        'clauses',
                                        currentClauses.filter((c) => c.clauseCode !== removedItem.code)
                                    );
                                }}
                                onValidationError={(type) => {
                                    if (type === 'duplicate') {
                                        showStatus('warning', ['Duplicate Item are not allowed']);
                                    }
                                    if (type === 'maxLimit') {
                                        showStatus('warning', [
                                        `Only ${MULTISELECT_FIELD_MAXLIMIT.clauses} item(s) allowed.`,
                                        ]);
                                    }
                                }}
                                handleClauseIconClick={suggestClauseIconClick}
                            />
                        </div>
                    </div>
                    <div className='main-details-grid grid-cols-24'>
                        <div key='receivedVia' className='col-span-4'>
                            <PSelect
                                label='Booking Channel'
                                value={formState.receivedVia}
                                onChange={(val) => handleChange('receivedVia', val)}
                                options={receivedViaOptions}
                                 placeholder="Please Select"
                                required
                            />
                        </div>
                        <div key='siChannel' className='col-span-4'>
                            <PTextField
                                label='SI Channel'
                                value={formState.siChannel}
                                onChange={(e) => handleChange('siChannel', e.target.value)}
                                disabled
                            />
                        </div>
                        <div key='pendingFinalBookingStatus' className='col-span-2'>
                            <PToggleButton
                                label='Pending Final'
                                value={formState.pendingFinalBookingStatus === 'Y'}
                                onChange={(val) => handleChange('pendingFinalBookingStatus', val)}
                                yesTitle={'Yes'}
                                noTitle={'No'} />
                        </div>
                    </div>
                </div>

                {/* <div className="more-details-wrapper"> */}
                {/* <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="more-details-toggle"
                    >
                        <span className="more-details-arrow">
                            {isExpanded ? '▼' : '▶'}
                        </span>
                        More Details
                    </button> */}
                <div
                    className="more-details-toggle"
                    onClick={() => setShowMore(!showMore)}
                >
                    {showMore ? '▼' : '▶'} More Details
                </div>

                {showMore && (
                    <div className="more-details-content animate-fade-slide-down">
                        <div className={`main-details-grid grid-cols-28`}>
                            <div key='billingCompany' className='col-span-7'>
                                <PTextField
                                    label='Billing Company'
                                    value={formState.billingCompany}
                                    onChange={(e) => handleChange('billingCompany', e.target.value)}
                                />
                            </div>
                            <div key='handlingOffice' className='col-span-7'>
                                <PSingleValueSearchableField
                                    label='Handling Office'
                                    id='handlingOffice'
                                    data={officeSuggestions}
                                    displayFields={['label']}
                                    columnHeaders={[]}
                                    value={formState.handlingOffice || ''}
                                    onChange={(value) => {
                                        setOfficeQuery(value);
                                        handleChange('handlingOffice', value);
                                    }}
                                    onSelect={(item) => handleChange('handlingOffice', item.value)}
                                />
                            </div>
                            <div key='status' className='col-span-7'>
                                <PTextField
                                    label='Status'
                                    value={formState.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    disabled
                                />
                            </div>
                            <div key='receivedFromName' className='col-span-7'>
                                <PSingleValueSearchableField
                                    label='Requesting Office'
                                    id='receivedFromName'
                                    value={formState?.receivedFromName || ''}
                                    data={officeSuggestions}
                                    displayFields={['label']}
                                    columnHeaders={[]}
                                    onChange={(value) => {
                                        setOfficeQuery(value);
                                        handleChange('receivedFromName', value);
                                    }}
                                    onSelect={(item) => handleChange('receivedFromName', item.value)}
                                />
                            </div>
                        </div>

                        <div className={`main-details-grid grid-cols-24`}>
                            <div key='takenBy' className='col-span-3'>
                                <PTextField
                                    label='Created By'
                                    value={formState.takenBy}
                                    onChange={(e) => handleChange('takenBy', e.target.value)}
                                    required
                                    disabled
                                />
                            </div>
                            <div key='bookQuoteDate' className='col-span-3'>
                                <PDatePicker
                                    label='Created on'
                                    value={formState.bookQuoteDate ? dayjs(formState.bookQuoteDate).toDate() : null}
                                    onChange={(newDate: Date | null) => handleChange('bookQuoteDate', newDate ? dayjs(newDate).toISOString() : null)}
                                    disabled
                                />
                            </div>
                            <div key='updatedBy' className='col-span-6'>
                                <PTextField
                                    label='Updated By'
                                    value={formState.updatedBy}
                                    onChange={(e) => handleChange('updatedBy', e.target.value)}
                                    disabled
                                />
                            </div>
                            <div key='updatedOn' className='col-span-6'>
                                <PDatePicker
                                    label='Updated on'
                                    value={formState.updatedOn ? dayjs(formState.updatedOn).toDate() : null}
                                    onChange={(newDate: Date | null) => handleChange('updatedOn', newDate ? dayjs(newDate).toISOString() : null)}
                                    disabled
                                />
                            </div>
                            {!!formState.tmsShipmentId && (
                                <>
                                    <div key='tmsShipmentId' className='col-span-3'>
                                        <PTextField
                                            label='TMS Shipment ID'
                                            value={formState.tmsShipmentId}
                                            onChange={(e) => handleChange('tmsShipmentId', e.target.value)}
                                            disabled
                                        />
                                    </div>
                                    <div key='truckerProNumber' className='col-span-3'>
                                        <PTextField
                                            label='Trucker Pro Number'
                                            value={formState.truckerProNumber}
                                            onChange={(e) => handleChange('truckerProNumber', e.target.value)}
                                            disabled
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}
                {/* </div> */}
            </div>
        </div>
    );
};

export default BookingMainDetailsSection;
