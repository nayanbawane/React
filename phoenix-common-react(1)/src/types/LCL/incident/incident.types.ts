// ─── Incident ─────────────────────────────────────────────────────────────────

export interface EventEntityResponceBean {
  eventEntityResponseChildBean: Record<string, unknown>[];
  eventActivityList: unknown[];
  officeSettingBean: Record<string, unknown>;
  isShowIRP: boolean;
  isCaptureDefaultReason: boolean;
  isShowGoDateColn: boolean;
  isShowStorageDateColn: boolean;
}

export interface CategoryReasonDataMappingBean {
  causedBy: string;
  incidentCategory: string;
  reason: string;
  office: string;
  emtEventCode: string;
  incidentDetailsKey: string;
  isIncidentReasonMandatory: string;
}

export interface IncidentReasonDetailBean {
  eventEntityResponceBean: EventEntityResponceBean;
  categoryReasonDataMappingBean: CategoryReasonDataMappingBean;
  incidentOwner: string;
  incidentDetail: string;
  incidentOpenVia: string;
  referenceNumber: string;
  referenceType: string;
  serviceFailureLocalDetails: string;
  isThroughIncidentReason: boolean;
  reasonProvidedFlag: boolean;
  subActionflag: string;
  pickUpId: string;
  isPRCSelected: boolean;
  incidentOwnerMainCompanyName: string;
  incidentOwnerFullName: string;
}
