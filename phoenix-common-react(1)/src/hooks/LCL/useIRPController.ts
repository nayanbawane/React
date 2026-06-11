import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppSelector } from '../../app/store/hooks';
import { selectLoginClientBean } from '../../core/featureToggles/featureToggle.selectors';
import { useIncidentTime } from './useIncidentTime';
import type { IRPPopupProps, CausedBy } from '../../features/common/IRPPopup';
import type {
  IRPFormData,
  IncidentTimeRequestData,
  LoginBean,
} from '../../types/common/incident.types';
import type { LoginClientBeanRaw } from '../../core/featureToggles/loginClientBean.types';

const IRP_PROCESSING_STATUSES = new Set([
  'EVENT_PROCESSING',
  'EVENT_COMPLETED_BEFORE_RISK',
  'EVENT_COMPLETED_AT_RISK',
  'CRN_SENT_BEFORE_AT_RISK',
  'CRN_SENT_AT_RISK',
]);

const ALWAYS_IRP = new Set([
  'PRE_BOOKING_CANCELLED',
  'PRE_BOOKING_HANDLING_OFFICE_UPDATED',
  'EXPORT_BOOKING_UNLINKED'
])

const EMPTY_FORM: IRPFormData = {
  causedBy: 'Shipco',
  selectedCategory: null,
  selectedReason: null,
  incidentDetails: '',
};
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

export interface UseIRPControllerOptions {
  eventCode: string[];
  referenceNumber: string | null;
  referenceType: string;
  title: string;
  onConfirmed: (formData: IRPFormData) => void | Promise<void>;
  prefetch?: boolean;
}

export interface UseIRPControllerReturn {
  openIRP: (referenceNumber?: string) => void;
  isPreFetching: boolean;
  irpPopupProps: IRPPopupProps;
}

export const useIRPController = ({
  eventCode,
  referenceNumber,
  referenceType,
  title,
  onConfirmed,
  prefetch = true,
}: UseIRPControllerOptions): UseIRPControllerReturn => {
  const raw = useAppSelector(selectLoginClientBean);
  const { data: incidentTimeData, loading: isPreFetching, fetchIncidentTime } = useIncidentTime();

  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState<IRPFormData>({ ...EMPTY_FORM });
  const [language, setLanguage] = useState('en-US');

  // Keep a ref to the latest incidentTimeData so openIRP() always sees current value
  const incidentTimeDataRef = useRef(incidentTimeData);
  useEffect(() => { incidentTimeDataRef.current = incidentTimeData; }, [incidentTimeData]);

  const buildIncidentTimePayload = useCallback(
    (raw: LoginClientBeanRaw, refNumber: string): IncidentTimeRequestData => ({
      requestData: {
        loginBean: buildLoginBean(raw),
        eventList: eventCode.map((code) => ({
          referenceNumber: refNumber,
          referenceType,
          eventCode: code,
          subReferenceNumber: null,
          pickUpId: null,
          carrierBLNumber: null,
          carrierCodeNumber: null,
        })),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [eventCode.join(','), referenceType],
  );

  // Pre-fetch incident-time data when reference number becomes available
  useEffect(() => {
    if (!prefetch || !referenceNumber || !raw) return;
    fetchIncidentTime(buildIncidentTimePayload(raw, referenceNumber));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefetch, referenceNumber]);

  const isValidToOpen = useCallback(
   (data: typeof incidentTimeData, refNumber: string): boolean => {
         if (!data?.eventEntityResponseChildBean?.length) return false;
         const bean = data.eventEntityResponseChildBean.find(
           (b) => b.referenceNumber === refNumber && eventCode.includes(data?.eventType),
         );
         if (!bean  || !bean.eventAtOverdueTime) return false;
         if(bean && ALWAYS_IRP.has(data?.eventType)) return true;
         return (
           new Date() > new Date(bean.eventAtOverdueTime)
         );
       },
       // eslint-disable-next-line react-hooks/exhaustive-deps
       [eventCode.join(',')],
  );

  const openIRP = useCallback(async (overrideReferenceNumber?: string) => {
    // No login data — can't do anything
    const currentReferenceNumber =
        overrideReferenceNumber ?? referenceNumber;
    if (!raw) return;

    // No reference number — skip incident-time check, open popup directly
    if (!currentReferenceNumber) {
      setIsOpen(true);
      return;
    }

    let data = incidentTimeDataRef.current;

    if (!prefetch || !data) {
      data = await fetchIncidentTime(buildIncidentTimePayload(raw, currentReferenceNumber));
    }

    if (isValidToOpen(data, currentReferenceNumber)) {
      setIsOpen(true);
    } else {
      // Timing condition not met — proceed directly without popup
      await onConfirmed({ ...EMPTY_FORM });
    }
  }, [referenceNumber, raw, prefetch, fetchIncidentTime, buildIncidentTimePayload, isValidToOpen, onConfirmed]);

  const closeIRP = useCallback(() => {
    setIsOpen(false);
    setForm({ ...EMPTY_FORM });
  }, []);

  const handleCausedByChange = useCallback((value: CausedBy) => {
    setForm((prev) => ({ ...prev, causedBy: value, selectedCategory: null, selectedReason: null }));
  }, []);

  const handleCategoryChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, selectedCategory: value, selectedReason: null }));
  }, []);

  const handleReasonChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, selectedReason: value }));
  }, []);

  const handleDetailsChange = useCallback((value: string) => {
    setForm((prev) => ({ ...prev, incidentDetails: value }));
  }, []);

  const handleSubmit = useCallback(async () => {
    await onConfirmed({ ...form });
    closeIRP();
  }, [form, onConfirmed, closeIRP]);

  const irpPopupProps: IRPPopupProps = {
    open: isOpen,
    onClose: closeIRP,
    title,
    eventCode,
    causedBy: form.causedBy,
    onCausedByChange: handleCausedByChange,
    selectedCategory: form.selectedCategory,
    onCategoryChange: handleCategoryChange,
    selectedReason: form.selectedReason,
    onReasonChange: handleReasonChange,
    incidentOwner: raw?.userName ?? '',
    incidentDetails: form.incidentDetails,
    onIncidentDetailsChange: handleDetailsChange,
    onSubmit: handleSubmit,
    language,
    onLanguageChange: setLanguage,
  };

  return { openIRP, isPreFetching, irpPopupProps };
};
