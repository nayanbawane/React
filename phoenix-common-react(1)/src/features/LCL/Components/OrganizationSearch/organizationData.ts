import { SearchResult } from '@/types';
import data from './orgSearchData.json';


export const demoCountries = data.countries as Array<{ code: string; name: string }>;

export const demoOrganizations = data.organizations as SearchResult[];

export const orgAliasData = data.aliases as Array<{
    code: string; name: string; type: string;
    alias: string; city: string; state: string; country: string;
}>;

export const orgCodeData = data.codes as Array<{
    code: string; billToCode: string; name: string; type: string;
    alias: string; city: string; state: string; country: string;
    status: string; lastInvoice: string; openAr: string;
}>;

export const orgPostalCodeData = data.postalCodes as Array<{
    postalCode: string; city: string; district: string; region: string; country: string;
}>;

export const orgStateData = data.states as Array<{
    code: string; name: string; country: string;
}>;

export const orgTaxIdData = data.taxIds as Array<{
    code: string; billToCode: string; name: string; type: string;
    alias: string; taxId: string;
}>;
