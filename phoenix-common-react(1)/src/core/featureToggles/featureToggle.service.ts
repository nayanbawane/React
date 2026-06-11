import { getTogglesFromBridge } from '../../core/auth/tokenBridge';
import type { RawFeatureToggleConfig } from './featureToggle.types';
import type { LoginClientBeanRaw } from './loginClientBean.types';
import { adaptLoginClientBeanToToggles } from './featureToggle.utils';

let _cachedBean: LoginClientBeanRaw | null = null;

export async function fetchLoginClientBean(): Promise<LoginClientBeanRaw | null> {
  if (_cachedBean) return _cachedBean;

  try {
    const parentFn = (window.parent as any).passPhoenixConfigurationDataToReactForBookingLCL;
    if (typeof parentFn === 'function') {
      
      const raw: unknown = parentFn();
      if (raw) {
        _cachedBean = typeof raw === 'string'
          ? (JSON.parse(raw) as LoginClientBeanRaw)
          : (raw as LoginClientBeanRaw);
        return _cachedBean;
      }
    }
  } catch {
    console.error('No GWT bridge available for feature toggles');
  }

  if (import.meta.env.DEV || import.meta.env.VITE_USE_FIXTURE_TOGGLES === 'true') {
    const fixture = await import('./LoginClientBean.json');
    _cachedBean = fixture.default as LoginClientBeanRaw;
    return _cachedBean;
  }

  return null;
}

/**
 * Fetches feature toggles.
 */
export async function fetchFeatureToggles(): Promise<RawFeatureToggleConfig> {
  const bean = await fetchLoginClientBean();
  if (bean) return adaptLoginClientBeanToToggles(bean);

  const fromBridge = getTogglesFromBridge();
  if (fromBridge) return fromBridge;

  if (import.meta.env.DEV || import.meta.env.VITE_USE_FIXTURE_TOGGLES === 'true') {
    const fixture = await import('./featureToggles.fixture.json');
    return fixture.default as RawFeatureToggleConfig;
  }

  return {};
}
