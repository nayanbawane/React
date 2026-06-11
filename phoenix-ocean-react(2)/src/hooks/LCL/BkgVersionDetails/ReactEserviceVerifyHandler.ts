import { useEffect, useRef } from 'react';
import {
  applyEserviceChangedHighlights,
  type FieldSelectorFn,
} from './phoenixEserviceMapper';


export interface EServiceChangedDataBean {
  oldValue: string | null;
  newValue: string | null;
  staffValue: string | null;
  identifier: string | null;
  status: string | null;
  version: string | null;
  handlingOffice: string | null;
  timeZone: string | null;
  userName: string | null;
  dateTime: string | null;
  createdOn: string | null;
  fieldName: string | null;
  reasonForReject: string | null;
  handlingOfficeCode: string | null;
}

export interface EServiceChangedMainBean {
  versionNo: number;
  relatedReferance: string | null;
  destinationName: string | null;
  lclFclType: string | null;
  bookingNO: string | null;
  customerRef: string | null;
  shipperName: string | null;
  shipperEmail: string | null;
  fromEmail: string | null;
  cToEmail: string | null;
  cargoListSize: number;
  custName: string | null;
  userFullname: string | null;
  deliveryType: string | null;
  bookingCustomer: string | null;
  shipmentStatus: string | null;
  acceptAllAction: boolean;
  callFromCustAction: boolean;
  destinationCode: string | null;
  localLangType: string | null;
  bookingStation: string | null;
  dcart: boolean;
  fromStiOnline: boolean;
  action: string | null;
  callFromBKGEService: boolean;
  cancelAccepted: boolean;
  cancelRejected: boolean;
  callFromARNDDEService: boolean;
  warehouseCode: string | null;
  lotDeliveryReference: string | null;
  fromWWA: boolean;
  europeRouting: boolean;
  namedAccountMap: Record<string, string> | null;
  countryMap: Record<string, string> | null;
  stateMap: Record<string, string> | null;
  accessorialsMap: Record<string, string> | null;
  changeFieldMap: Record<string, EServiceChangedDataBean>;
  editByUsername?: string | null;
}


export interface ReactEserviceVerifyOptions {
  allowedOrigins?: string[];
  autoApply?: boolean;
  fieldSelector?: FieldSelectorFn;
}


export interface UserContext {
  userFullname: string;
  officeTimezone: string;
  officeCode: string;
  alternateCityName: string;
}

function parseBean(data: unknown): EServiceChangedMainBean | null {
  try {
    if (typeof data === 'string') {
      return JSON.parse(data) as EServiceChangedMainBean;
    }
    if (data && typeof data === 'object') {
      const msg = data as { type?: unknown; payload?: unknown; referenceId?: unknown };

      if (msg.referenceId !== undefined && msg.payload && typeof msg.payload === 'object') {
        const p = msg.payload as Record<string, unknown>;
        if ('changeFieldMap' in p) {
          return p as unknown as EServiceChangedMainBean;
        }
      }

      if (msg.type === 'phoenixReact' && typeof msg.payload === 'string') {
        return JSON.parse(msg.payload) as EServiceChangedMainBean;
      }
      if ('changeFieldMap' in msg) {
        return msg as unknown as EServiceChangedMainBean;
      }
    }
    return null;
  } catch {
    return null;
  }
}


export function useReactEserviceVerifyHandler(
  onBean: (bean: EServiceChangedMainBean) => void,
  userCtx: UserContext,
  options: ReactEserviceVerifyOptions = {},
): void {
  const onBeanRef = useRef(onBean);
  const userCtxRef = useRef(userCtx);
  const optionsRef = useRef(options);

  useEffect(() => { onBeanRef.current = onBean; }, [onBean]);
  useEffect(() => { userCtxRef.current = userCtx; }, [userCtx]);
  useEffect(() => { optionsRef.current = options; }, [options]);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const { allowedOrigins, autoApply = true, fieldSelector } = optionsRef.current;
      const { userFullname, officeTimezone, officeCode, alternateCityName } = userCtxRef.current;

      const trustedOrigins: string[] = allowedOrigins?.length
        ? allowedOrigins
        : [window.location.origin];

      const isTrusted = trustedOrigins.includes(event.origin) || event.origin === window.location.origin;
      if (!isTrusted) {
        return;
      }

      const bean = parseBean(event.data);
      if (!bean || !bean.changeFieldMap) {
        return;
      }

      bean.editByUsername = userFullname;
      Object.values(bean.changeFieldMap).forEach((field) => {
        field.userName = userFullname;
        field.timeZone = officeTimezone;
        field.handlingOfficeCode = officeCode;
        field.handlingOffice = alternateCityName;
      });

      onBeanRef.current(bean);

      if (autoApply) {
        applyEserviceChangedHighlights(bean.changeFieldMap, fieldSelector);
      }
    };

    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);
}
