/**
 * Request Payload of Populate Category and Reason metadata in IRP popup
 */
export type RequestData = {
  requestData: {
    loginBean: LoginBean;
    categoryAndReasonRequestBean: CategoryAndReasonRequestBean;
  };
};

export type LoginBean = {
  username: string;
  ldapUsername: string;
  userFullname: string;
  password: string;
  dataSourceName: string;
  userSchemaName: string;
  userID: number;
  userSchemaID: number;
  userOfficeID: number;
  userRoleID: number;
  userRole: string;
  userAlternateOffice: string;
  ipAddress: string;
  timeZone: string;
  debugModeFlag: number;
  logFilePathName: string;
  email: string;
  officeCode: string;
  userCompany: string;
  formInstance: string;
  userRegionId: number;
  localCurrency: string;
  countryCode: string;
  countryName: string;
  userCompanyName: string;
  officeTimezone: string;
};

export type CategoryAndReasonRequestBean = {
  eventCode: string[];
  key: string;
  language: string;
};

/**
 * Response from API after populating Category and Reason metadata in IRP popup
 */

export type ApiResponse = {
  success: number;
  result: Result;
  message: string;
  errorCode: string | null;
  validations: unknown | null;
};

export type Result = {
  categoryAndReasonDataMappingBeans: CategoryAndReasonDataMappingBean[];
  categoryAndReasonList: CategoryAndReasonListItem[];
  categoryAndReasonErrorList: CategoryAndReasonErrorItem[];
};

export type CategoryAndReasonDataMappingBean = {
  causedBy: string;
  incidentCategory: string;
  reason: string;
  office: string;
  emtEventCode: string;
  incidentDetailsKey: string;
  isIncidentReasonMandatory: "Y" | "N"; // constrained based on sample
};

export type CategoryAndReasonListItem = {
  causedBy: string;
  incidentCategory: string;
  reason: string;
  incidentDetails: string;
  incedentOwner: string; // TODO: Backend Response TYPE
  language: string;
};

export type CategoryAndReasonErrorItem = {
  langugae: string; // TODO: Backend Response TYPE
  reasonMessage: string;
  incidentOwnerMessage: string;
  incidentSectionMessage: string;
};

// ─── Incident Time (API 1) ──────────────────────────────────────────────────

export type IncidentTimeRequestData = {
  requestData: {
    loginBean: LoginBean;
    eventList: IncidentTimeEvent[];
  };
};

export type IncidentTimeEvent = {
  referenceNumber: string;
  referenceType: string;
  eventCode: string;
  subReferenceNumber: string | null;
  pickUpId: string | null;
  carrierBLNumber: string | null;
  carrierCodeNumber: string | null;
};

// NOTE: Verify EventEntityBean field names against a live API response
export type IncidentTimeApiResponse = {
  success: number;
  result: IncidentTimeResult;
  message: string;
};

export type IncidentTimeResult = {
  eventEntityResponseChildBean: EventEntityBean[];
};

export type EventEntityBean = {
  referenceNumber: string;
  eventCode: string;
  eventAtOverdueTime: string | null;
  currentTime: string | null;
  status: string;
};

// ─── IRP form data collected on submission ──────────────────────────────────

export type CausedBy = 'Shipco' | 'Customer';

export type IRPFormData = {
  causedBy: CausedBy;
  selectedCategory: string | null;
  selectedReason: string | null;
  incidentDetails: string;
};

// ─── Cancel Booking API ────────────────────────────────────────────────────

export type BookingEntityBean = {
  shipmentType: string;
  referenceNumber: string;
  customerCode: string;
  customerAlias: string;
  customerName: string;
  controllingEntity: string;
  dischargeCode: string;
  portOfLoadingCode: string;
  placeOfDeliveryCode: string;
  eventCompletionTime: number;
  status: number;
  bookingStatus: string;
  failureBecauseOf: string;
  serviceFailureCatagory: string | null;
  delayReason: string | null;
  serviceFailureDetail: string;
  serviceFailureLocalDetails: string;
  eventCompletedUser: string;
  eventCompletedUserOffice: string;
  eventCompletedUserCompany: string;
  reasonProvidedUser: string;
  reasonProvidedUserOffice: string;
  reasonProvidedUserCompany: string;
  schema: string;
  office: string;
  country: string;
  countryCode: string;
  region: string;
  receivedVia: string;
  monitorBkgNrCfsUpdate: boolean;
};

export type ManufacturerDetailsBean = {
  referenceType: string | null;
  referenceNumber: string | null;
  totalAddedManufacturerNameList: unknown[];
  newlyAddedManufacturerNameList: unknown[];
  removedManufacturerNameList: unknown[];
  updatedManufacturerNameMapList: unknown[];
  previousManufacturerNameList: unknown[];
  previousManufacturerNameMap: Record<string, unknown>;
};

export type CancelBookingRoutingBean = {
  originCode: string;
  loadCode: string;
  dischargeCode: string;
  destinationCode: string;
  destinationName: string;
  finalCFSCode: string;
  wwaSchedule: boolean;
  bookingQuoteChargeBeanList: unknown[];
  manufacturerDetailsBean: ManufacturerDetailsBean;
};

export type MultipleBookingEntityBean = {
  bookingEntityBeanList: unknown[];
  emtCustomer: string;
  office: string;
  country: string;
  countryCode: string;
  region: string;
  agent: string;
  entity: string;
  eventType: string;
  eventAction: string;
  isTest: string;
  eventModule: string;
  warehouseCode: string;
  officeTimeZone: string;
  officeName: string;
  messageGenerationTime: number;
};

export type CancelBookingRequestData = {
  requestData: {
    loginBean: LoginBean;
    bookingEntityBean: BookingEntityBean;
    bookingQuoteRoutingBean: CancelBookingRoutingBean;
    multipleBookingEntityBean: MultipleBookingEntityBean;
  };
};

export type CancelBookingApiResponse = {
  success: number;
  result: null;
  message: string;
  errorCode: string | null;
  validations: null;
};