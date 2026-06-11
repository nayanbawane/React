import { SelectOption } from "@/types";

export const TYPE_OPTIONS: SelectOption[] = [
  { label: "Please Select", value: "-1" },
  { label: "LCL Quote", value: "L" },
  { label: "FCL Quote", value: "F" },
];

export const STATUS_OPTIONS: SelectOption[] = [

  { label: "Please Select", value: "" },
  { label: "Accepted", value: "A" },
  { label: "Cancelled", value: "C" },
  { label: "Pending", value: "P" },
  { label: "Preliminary", value: "I" },
  { label: "Rejected", value: "R" }, 
];


export const QUOTE_CHANNEL_OPTIONS: SelectOption[] = [
  { label: "Please Select", value: '' },
  { label: "Email", value: "P" },
  { label: "Phone", value: "H" },
];

export const QUOTE_TYPE_OPTIONS: SelectOption[] = [
  { label: "Please Select", value: "" },
  { label: "Actual", value: "Actual" },
];

export const DIRECTION_OPTIONS: SelectOption[] = [
  { label: "Export", value: "Export" },
  { label: "Import", value: "Import" },
];

export const PENDING_FINAL_OPTIONS: SelectOption[] = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

export const TRUCK_QUOTE_OPTIONS: SelectOption[] = [
  { label: "Yes", value: "Yes" },
  { label: "No", value: "No" },
];

export const LOCATION_TYPE_OPTIONS: SelectOption[] = [
  { label: "Select", value: "-1" },
  { label: "City", value: "0" },
  { label: "Port", value: "1" },
  { label: "State", value: "2" },
  { label: "Country", value: "3" },
  { label: "Group", value: "4" },
];

export const LOCATION_STATUS_OPTIONS: SelectOption[] = [
  { label: "Active", value: "ACTIVE" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "All", value: "ALL" },
];

/* PHX-125266 Nilam 16-04-2026*/
export const FCLQUOTE_MAINDATEAILS_PICKUP_OPUTIONS = [
    { label: 'Y - Yes', value: 'Y' },
    { label: 'N - No', value: 'N' }
];
export const FCLQUOTE_MAINDATEAILS_PREPAID_COLLECT_OPUTIONS = [
    { label: 'Select', value: '' },
    { label: 'Prepaid', value: 'P' },
    { label: 'Collect', value: 'C' }
];

export const FCLQUOTE_MAINDATEAILS_RATE_CONTROL_ENTITY_OPUTIONS = [
    { label: 'Please Select', value: '' },
    { label: 'Origin', value: 'ORG' },
    { label: 'Destination', value: 'DEST' },
    { label: 'WWA', value: 'WWA' }
    
];
export const NUMBER_OPTIONS = Array.from({ length: 100 }, (_, index) => ({
    label: index.toString(),
    value: index.toString(),
}));
/* PHX-125266 Nilam 16-04-2026*/