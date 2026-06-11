import React, { useEffect, useMemo } from 'react';
import { CircularProgress, MenuItem, Select, SelectChangeEvent, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { NotebookPen } from 'lucide-react';
import { PGradientButton, PModal, PTextField } from 'phoenix-react-lib';
import { useAppSelector } from '../../app/store/hooks';
import { selectLoginClientBean } from '../../core/featureToggles/featureToggle.selectors';
import { useIncidentIntegration } from '../../hooks/LCL/useIncidentIntegration';
import type { LoginBean, CausedBy } from '../../types/common/incident.types';
import type { LoginClientBeanRaw } from '../../core/featureToggles/loginClientBean.types';
import styles from '../../styles/LCL/IRPPopup.module.css';

export type { CausedBy };

export interface IRPPopupProps {
    open: boolean;
    onClose: () => void;
    title: string;

    eventCode: string[];

    causedBy: CausedBy;
    onCausedByChange: (value: CausedBy) => void;

    selectedCategory: string | null;
    onCategoryChange: (value: string) => void;

    selectedReason: string | null;
    onReasonChange: (value: string) => void;

    incidentOwner: string;
    incidentDetails: string;
    onIncidentDetailsChange: (value: string) => void;
    maxIncidentDetailsLength?: number;

    onSubmit: () => void;

    language?: string;
    onLanguageChange?: (lang: string) => void;
    languageOptions?: { label: string; value: string }[];
}

const DEFAULT_LANGUAGE_OPTIONS = [
    { label: 'English (US)', value: 'en-US' },
    { label: 'English (UK)', value: 'en-GB' },
];

function buildLoginBean(raw: LoginClientBeanRaw): LoginBean {
    return {
        username: raw.username,
        ldapUsername: raw.ldapUser,
        userFullname: raw.userName,
        password: '',
        dataSourceName: raw.schema,
        userSchemaName: raw.schema,
        userID: raw.userId,
        userSchemaID: raw.siteId,
        userOfficeID: raw.officeId,
        userRoleID: raw.userRoleID,
        userRole: raw.userRole,
        userAlternateOffice: raw.userAlternateOffice ?? '',
        ipAddress: '127.0.0.1',
        timeZone: raw.timeZone ?? '',
        debugModeFlag: 0,
        logFilePathName: '',
        email: raw.email,
        officeCode: raw.office,
        userCompany: raw.company,
        formInstance: '',
        userRegionId: raw.userRegionId ?? 0,
        localCurrency: raw.localCurrency,
        countryCode: raw.countryCode,
        countryName: raw.country,
        userCompanyName: raw.companyName,
        officeTimezone: raw.officeTimezone,
    };
}

export const IRPPopup: React.FC<IRPPopupProps> = ({
    open,
    onClose,
    title,
    eventCode,
    causedBy,
    onCausedByChange,
    selectedCategory,
    onCategoryChange,
    selectedReason,
    onReasonChange,
    incidentOwner,
    incidentDetails,
    onIncidentDetailsChange,
    maxIncidentDetailsLength = 255,
    onSubmit,
    language = 'en-US',
    onLanguageChange,
    languageOptions = DEFAULT_LANGUAGE_OPTIONS,
}) => {
    const raw = useAppSelector(selectLoginClientBean);
    const { data, loading, error, fetchCategoryReason } = useIncidentIntegration();

    const languageCode = language.split('-')[0];

    useEffect(() => {
        if (!open || !raw) return;
        fetchCategoryReason({
            requestData: {
                loginBean: buildLoginBean(raw),
                categoryAndReasonRequestBean: { eventCode, key: '', language: languageCode },
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open, languageCode]);

    const mappingBeans = data?.categoryAndReasonDataMappingBeans ?? [];
    const columnLabels = data?.categoryAndReasonList?.[0];
    const errorMessages = data?.categoryAndReasonErrorList?.[0];

    const availableCategories = useMemo(
        () => [...new Set(mappingBeans.filter((b) => b.causedBy === causedBy).map((b) => b.incidentCategory))],
        [mappingBeans, causedBy],
    );

    const availableReasons = useMemo(
        () =>
            mappingBeans
                .filter((b) => b.causedBy === causedBy && b.incidentCategory === selectedCategory)
                .map((b) => b.reason),
        [mappingBeans, causedBy, selectedCategory],
    );

    const matchedBean = useMemo(
        () =>
            mappingBeans.find(
                (b) =>
                    b.causedBy === causedBy &&
                    b.incidentCategory === selectedCategory &&
                    b.reason === selectedReason,
            ),
        [mappingBeans, causedBy, selectedCategory, selectedReason],
    );

    const isDetailsMandatory = matchedBean?.isIncidentReasonMandatory === 'Y';
    const charsRemaining = maxIncidentDetailsLength - incidentDetails.length;
    const isFormComplete =
        !!selectedCategory &&
        !!selectedReason &&
        (!isDetailsMandatory || incidentDetails.trim().length > 0);

    const handleCategoryChange = (_: React.MouseEvent<HTMLElement>, value: string | null) => {
        if (value !== null) onCategoryChange(value);
    };

    const handleReasonChange = (_: React.MouseEvent<HTMLElement>, value: string | null) => {
        if (value !== null) onReasonChange(value);
    };

    const handleLanguageChange = (e: SelectChangeEvent) => {
        onLanguageChange?.(e.target.value);
    };

    const languageSelector = (
        <Select
            value={language}
            onChange={handleLanguageChange}
            size="small"
            className={styles.langSelect}
        >
            {languageOptions.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 12 }}>
                    {opt.label}
                </MenuItem>
            ))}
        </Select>
    );

    return (
        <PModal
            open={open}
            onClose={onClose}
            title={title}
            width="90%"
            height="auto"
            headerAction={languageSelector}
        >
            <div className={styles.body}>

                {loading && (
                    <div className={styles.loadingOverlay}>
                        <CircularProgress size={20} thickness={4} />
                    </div>
                )}

                {error && !loading && (
                    <div className={styles.errorBanner}>{error}</div>
                )}

                {/* Caused By */}
                <div className={styles.fieldGroup}>
                    <span className={styles.sectionLabel}>{columnLabels?.causedBy ?? 'Caused By'}</span>
                    <div className={styles.causedByToggle}>
                        <ToggleButtonGroup
                            exclusive
                            value={causedBy}
                            onChange={(_: React.MouseEvent<HTMLElement>, value: CausedBy | null) => {
                                if (value !== null) onCausedByChange(value);
                            }}
                        >
                            <ToggleButton value="Shipco" disableRipple classes={{ selected: styles.chipSelected }}>Shipco</ToggleButton>
                            <ToggleButton value="Customer" disableRipple classes={{ selected: styles.chipSelected }}>Customer</ToggleButton>
                        </ToggleButtonGroup>
                    </div>
                </div>

                {/* Incident Category */}
                <div className={styles.fieldGroup}>
                    <span className={styles.sectionLabel}>{columnLabels?.incidentCategory ?? 'Incident Category'}</span>
                    <ToggleButtonGroup
                        exclusive
                        value={selectedCategory}
                        onChange={handleCategoryChange}
                        className={styles.chipGroup}
                    >
                        {availableCategories.map((cat) => (
                            <ToggleButton
                                key={cat}
                                value={cat}
                                disableRipple
                                className={styles.chip}
                                classes={{ selected: styles.chipSelected }}
                            >
                                {cat}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </div>

                {/* Reason */}
                <div className={styles.fieldGroup}>
                    <span className={styles.sectionLabel}>{columnLabels?.reason ?? 'Reason'}</span>
                    <ToggleButtonGroup
                        exclusive
                        value={selectedReason}
                        onChange={handleReasonChange}
                        className={styles.chipGroup}
                    >
                        {availableReasons.map((reason) => (
                            <ToggleButton
                                key={reason}
                                value={reason}
                                disableRipple
                                className={styles.chip}
                                classes={{ selected: styles.chipSelected }}
                            >
                                {reason}
                            </ToggleButton>
                        ))}
                    </ToggleButtonGroup>
                </div>

                {/* Incident Owner */}
                <div className={styles.ownerRow}>
                    <span className={styles.ownerLabel}>{columnLabels?.incedentOwner ?? 'Incident Owner'}</span>
                    <div className={styles.ownerField}>
                        {/* @ts-ignore */}
                        <PTextField
                            label=""
                            value={incidentOwner}
                            disabled
                            onChange={() => {}}
                        />
                    </div>
                </div>

                {/* Incident Details */}
                <div className={styles.fieldGroup}>
                    <div className={styles.detailsLabelRow}>
                        <NotebookPen className={styles.detailsIcon} />
                        <span className={styles.fieldLabel}>{columnLabels?.incidentDetails ?? 'Incident Details'}</span>
                    </div>
                    <textarea
                        className={styles.textarea}
                        value={incidentDetails}
                        onChange={(e) => onIncidentDetailsChange(e.target.value)}
                        maxLength={maxIncidentDetailsLength}
                        rows={5}
                    />
                    <span className={styles.charCount}>{charsRemaining} characters remaining</span>
                    {isDetailsMandatory && !!selectedReason && !incidentDetails.trim() && (
                        <span className={styles.errorText}>
                            {errorMessages?.incidentSectionMessage ?? 'Incident Details section is required'}
                        </span>
                    )}
                </div>

                {/* Footer */}
                <div className={styles.footer}>
                    {/* @ts-ignore */}
                    <PGradientButton title="Go" onClick={onSubmit} disabled={!isFormComplete || loading} />
                </div>

            </div>
        </PModal>
    );
};

export default IRPPopup;
