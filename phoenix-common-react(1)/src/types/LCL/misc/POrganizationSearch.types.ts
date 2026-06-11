import { OrganizationResultDetail } from '@/hooks/LCL/OrganizationSerach/organizationSerachService';
import type { OrgSearchConfigKey } from '../../../features/LCL/Components/OrganizationSearch/organizationSearchConfig';

export interface OrganizationSearchFormData {
    organizationCode: string;
    organizationName: string;
    alias: string;
    taxId: string;
    address: string;
    state: string;
    city: string;
    country: string;
    postalCode: string;
    email: string;
    organizationType: string;
    organizationStatus: string;
    salesPerson: string;
}

export interface SearchResult {
    id: string;
    code: string;
    name: string;
    alias: string;
    taxId: string;
    address: string;
    state: string;
    city: string;
    country: string;
    postal: string;
    email: string;
    phone?: string;
    type: string;
    status: string;
}

export interface OrgSearchProfile {
    codeField?: SearchableFieldConfig;
    aliasField?: SearchableFieldConfig;
    stateField?: SearchableFieldConfig;
    countryField?: SearchableFieldConfig;
    taxIdField?: SearchableFieldConfig;
    salesPersonField?: SearchableFieldConfig;
    postalCodeField?: SearchableFieldConfig;
}

export interface SearchSection {
    title?: string;
    data: Record<string, unknown>[];
    displayFields: string[];
}

export interface SearchableFieldConfig {
    columnHeaders: string[];
    sections: [SearchSection, SearchSection?, SearchSection?];
    displayValueField?: string;

    suggestionConfig?: any;
  useApiSuggestions?: boolean;
  useMultiPanelSuggestions?: boolean;
}

export interface OrgRow {
    id: string | number;
   organizationResultDetail:OrganizationResultDetail;

    expandData: OrganizationResultDetail
}


export interface FilterState {
    inTransit: boolean;
    uninvoiced: boolean;
    onHold: boolean;
    selectedOrgCodes: string[];
    selectedSalesReps: string[];
}

export interface SelectedOrganization {
    code: string;
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    email?: string;
    fax?: string;
    contactPerson?: string;
    eoriNumber?: string;
    fmcLicense?: string;
}

export interface POrganizationSearchViewState {
    viewMode: 'search' | 'results';
    selectedOrgCodes: Record<string, unknown>[];
    clearKey: number;
}

export interface POrganizationSearchViewHandlers {
    handleGoSearch: () => void;
    handleClearAll: () => void;
    handleOrgCodeSelect: (item: Record<string, unknown>) => void;
    handleBackToSearch: () => void;
}

export interface POrganizationSearchProps {
    formData: OrganizationSearchFormData;
    onChange: (field: keyof OrganizationSearchFormData, value: string) => void;
    viewState: POrganizationSearchViewState;
    viewHandlers: POrganizationSearchViewHandlers;
    searchResults: OrganizationResultDetail[];
    onSelect?: (org: OrganizationResultDetail) => void;
    configKey?: OrgSearchConfigKey;
    codeFieldConfig?: SearchableFieldConfig;
    aliasFieldConfig?: SearchableFieldConfig;
    stateFieldConfig?: SearchableFieldConfig;
    countryFieldConfig?: SearchableFieldConfig;
    taxIdFieldConfig?: SearchableFieldConfig;
    salesPersonFieldConfig?: SearchableFieldConfig;
    moduleType?: string;
}

export interface POrganizationWidgetHeaderProps {
    title: string;
    actionLabel: string;
    onAction: () => void;
}

export interface POrganizationSearchPageProps {
    onSelect?: (org: SelectedOrganization) => void;
    onSearch?: (form: OrganizationSearchFormData) => void;
    configKey?: OrgSearchConfigKey;
    codeFieldConfig?: SearchableFieldConfig;
    aliasFieldConfig?: SearchableFieldConfig;
    stateFieldConfig?: SearchableFieldConfig;
    countryFieldConfig?: SearchableFieldConfig;
    taxIdFieldConfig?: SearchableFieldConfig;
    searchResults?: SearchResult[];
    moduleType?: string;
}
