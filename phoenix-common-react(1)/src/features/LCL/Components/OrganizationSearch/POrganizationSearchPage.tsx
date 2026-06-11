import { useState } from 'react';

import POrganizationSearch from './POrganizationSearch';
import { FORM_TO_RESULT_FIELD } from './organizationSearchConfig';
import type {
    SearchResult,
    POrganizationSearchPageProps,
    POrganizationSearchViewState,
    POrganizationSearchViewHandlers,
} from '@/types';

import { demoOrganizations } from './organizationData';
import { INITIAL_FORM } from '../../../../InitialData/LCL';

function POrganizationSearchPage({
    onSelect,
    onSearch,
    configKey,
    codeFieldConfig,
    aliasFieldConfig,
    stateFieldConfig,
    countryFieldConfig,
    taxIdFieldConfig,
    searchResults: externalResults,
    moduleType,
}: POrganizationSearchPageProps) {
    const [formData, setFormData] = useState(INITIAL_FORM);
    const [internalResults, setInternalResults] = useState<SearchResult[]>([]);
    const [selectedOrgCodes, setSelectedOrgCodes] = useState<Record<string, unknown>[]>([]);
    const [viewMode, setViewMode] = useState<'search' | 'results'>('search');
    const [clearKey, setClearKey] = useState(0);

    const activeResults = externalResults ?? internalResults;

    const handleChange = (field: keyof typeof formData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleGoSearch = () => {
        if (onSearch) {
            onSearch(formData);
            setViewMode('results');
            return;
        }

        const allRecords = demoOrganizations;

        const filtered = allRecords.filter((record) => {
            if (selectedOrgCodes.length > 0) {
                const selectedCodes = selectedOrgCodes.map((o) => String(o['code']).toLowerCase());
                if (!selectedCodes.includes(record.code.toLowerCase())) return false;
            }

            for (const [formField, resultField] of Object.entries(FORM_TO_RESULT_FIELD) as [keyof typeof formData, keyof SearchResult][]) {
                const formValue = formData[formField];
                if (formValue === '') continue;
                if (!String(record[resultField]).toLowerCase().includes(formValue.toLowerCase())) return false;
            }

            return true;
        });

        setInternalResults(filtered);
        setViewMode('results');
    };

    const handleClearAll = () => {
        setFormData(INITIAL_FORM);
        setInternalResults([]);
        setSelectedOrgCodes([]);
        setClearKey((prev) => prev + 1);
    };

    const handleOrgCodeSelect = (item: Record<string, unknown>) => {
        setSelectedOrgCodes((prev) => [...prev, item]);
    };

    const handleBackToSearch = () => {
        setFormData(INITIAL_FORM);
        setInternalResults([]);
        setClearKey((prev) => prev + 1);
        setViewMode('search');
    };

    const viewState: POrganizationSearchViewState = {
        viewMode,
        selectedOrgCodes,
        clearKey,
    };

    const viewHandlers: POrganizationSearchViewHandlers = {
        handleGoSearch,
        handleClearAll,
        handleOrgCodeSelect,
        handleBackToSearch,
    };

    return (
        <POrganizationSearch
            formData={formData}
            onChange={handleChange}
            viewState={viewState}
            viewHandlers={viewHandlers}
            searchResults={activeResults}
            onSelect={onSelect}
            configKey={configKey}
            codeFieldConfig={codeFieldConfig}
            aliasFieldConfig={aliasFieldConfig}
            stateFieldConfig={stateFieldConfig}
            countryFieldConfig={countryFieldConfig}
            taxIdFieldConfig={taxIdFieldConfig}
            moduleType={moduleType}
        />
    );
}

export default POrganizationSearchPage;
