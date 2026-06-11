export { default as CustomerDetails } from "./CustomerDetails";
export { default as CustomerInitialPage } from "./CustomerInitialPage";
export { default as CustomerMoredetails } from "./CustomerMoredetails";
export { default as LclBookingDetails } from "./LclBookingDetails";
export { default as PreBookingCustomerDetail } from "./PreBookingCustomerDetail";
export * from "./CustomerDetails.mapper";

export type {
  CustomerDetailFormState,
  CustomerFormData,
  LclBookingDetailsForm,
  CustomerMoreDetailsForm,
} from '../../../../types/LCL/misc/CustomerDetails.types';
