function loadUrlConfig(): Record<string, string> {
  try {
    if (typeof window !== 'undefined' &&
        typeof window.parent?.passPhoenixConfigurationDataToReactForUrlConstant === 'function') {
      const raw = window.parent.passPhoenixConfigurationDataToReactForUrlConstant();
      const parsed = JSON.parse(raw) ?? {};
     
      return parsed;
    } else {
      console.warn('[URL-Config] passPhoenixConfigurationDataToReactForUrlConstant is not available — using fallback relative URLs');
    }
  } catch (e) {
    console.error('[URL-Config] Failed to load URL config from GWT bridge:', e);
  }
  return {};
}

const urlConfig = loadUrlConfig();

export const APPLICATION_URL           = urlConfig.APPLICATION_URL           ?? '';
export const WEB_SERVICE_URL           = urlConfig.WEB_SERVICE_URL           ?? '/phoenix/api/1.0';
export const COMMON_WEB_SERVICE_URL    = urlConfig.COMMON_WEB_SERVICE_URL    ?? '/phoenix/api-common/1.0';
export const WEB_SERVICE_URL_FOR_OCEAN = urlConfig.WEB_SERVICE_URL_FOR_OCEAN ?? '/phoenix/api-ocean/1.0';
export const PHOENIX_BASE_URL          = urlConfig.APPLICATION_URL
  ? `${urlConfig.APPLICATION_URL}/phoenix/1.0`
  : '/phoenix/1.0';

