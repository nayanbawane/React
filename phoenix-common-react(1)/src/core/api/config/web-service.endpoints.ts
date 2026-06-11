import { WEB_SERVICE_URL } from './url-config';
export { WEB_SERVICE_URL } from './url-config';

export const WEB_SERVICE_ENDPOINTS = {

    BASE: WEB_SERVICE_URL,

    GEN_CONFIGURATION: {
        GEN_GLOBAL_CONFIGURATION_LIST: `${WEB_SERVICE_URL}/genGlobalConfiguation/getConfigListValues`,
    },
    ESERVICE: {
        FETCH_BKGESERVICE_DATA: `${WEB_SERVICE_URL}/eservice/fetch`,
    },

} as const;
