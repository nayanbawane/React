import type { OrganizationSearchFormData } from '../../types/LCL/misc/POrganizationSearch.types';

export const INITIAL_FORM: OrganizationSearchFormData = {
    organizationCode: '',
    organizationName: '',
    alias: '',
    taxId: '',
    address: '',
    state: '',
    city: '',
    country: '',
    postalCode: '',
    email: '',
    organizationType: '-1',
    organizationStatus: '1',
    salesPerson: '',
};

export const ORGANIZATION_TYPE_OPTIONS = [
    { label: 'Please Select', value: '-1' },
    { label: 'Type 1', value: 'type1' },
    { label: 'Type 2', value: 'type2' },
];

export const ORGANIZATION_STATUS_OPTIONS = [
    { label: 'Active', value: '1' },
    { label: 'Inactive', value: '2' },
];
