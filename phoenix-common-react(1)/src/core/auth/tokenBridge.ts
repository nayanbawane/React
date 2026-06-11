import type { RawFeatureToggleConfig } from '@/core/featureToggles/featureToggle.types';

const TOKEN_STORAGE_KEY = 'token';
const TOKEN_MESSAGE_TYPES = new Set(['GWT_AUTH_TOKEN', 'PHOENIX_AUTH_TOKEN']);
const TOGGLE_MESSAGE_TYPES = new Set(['GWT_FEATURE_TOGGLES', 'PHOENIX_FEATURE_TOGGLES']);

let inMemoryToken: string | null = null;
let inMemoryToggles: RawFeatureToggleConfig | null = null;
let isBridgeInitialized = false;
let onTogglesReceivedCallback: ((toggles: RawFeatureToggleConfig) => void) | null = null;

export const onTogglesReceived = (cb: (toggles: RawFeatureToggleConfig) => void): (() => void) => {
  onTogglesReceivedCallback = cb;
  return () => { onTogglesReceivedCallback = null; };
};

const getQueryToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const params = new URLSearchParams(window.location.search);
  return (
    params.get('token') ||
    params.get('authToken') ||
    params.get('access_token') ||
    null
  );
};

export const getAuthToken = (): string | null => {
  if (inMemoryToken) {
    return inMemoryToken;
  }

  if (typeof window === 'undefined') {
    return null;
  }

  const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
  if (stored) {
    inMemoryToken = stored;
  }
  return stored;
};

export const setAuthToken = (token: string | null): void => {
  inMemoryToken = token;

  if (typeof window === 'undefined') {
    return;
  }

  if (!token) {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    return;
  }

  localStorage.setItem(TOKEN_STORAGE_KEY, token);
};

export const getTogglesFromBridge = (): RawFeatureToggleConfig | null => inMemoryToggles;

const resolveTogglesFromMessage = (data: unknown): RawFeatureToggleConfig | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const message = data as {
    type?: unknown;
    toggles?: unknown;
    payload?: { toggles?: unknown };
  };

  const type = typeof message.type === 'string' ? message.type : '';
  if (!TOGGLE_MESSAGE_TYPES.has(type)) {
    return null;
  }

  if (message.toggles && typeof message.toggles === 'object') {
    return message.toggles as RawFeatureToggleConfig;
  }

  if (message.payload?.toggles && typeof message.payload.toggles === 'object') {
    return message.payload.toggles as RawFeatureToggleConfig;
  }

  return null;
};

const resolveTokenFromMessage = (data: unknown): string | null => {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const message = data as {
    type?: unknown;
    token?: unknown;
    payload?: { token?: unknown };
  };

  const type = typeof message.type === 'string' ? message.type : '';
  if (!TOKEN_MESSAGE_TYPES.has(type)) {
    return null;
  }

  if (typeof message.token === 'string' && message.token.trim()) {
    return message.token;
  }

  if (
    message.payload &&
    typeof message.payload.token === 'string' &&
    message.payload.token.trim()
  ) {
    return message.payload.token;
  }

  return null;
};

export const initializeGwtTokenBridge = (): void => {
  if (isBridgeInitialized || typeof window === 'undefined') {
    return;
  }

  isBridgeInitialized = true;

  const tokenFromQuery = getQueryToken();
  if (tokenFromQuery) {
    setAuthToken(tokenFromQuery);
  }

  const trustedOrigin = import.meta.env.VITE_GWT_PARENT_ORIGIN;

  window.addEventListener('message', (event) => {
    if (trustedOrigin && event.origin !== trustedOrigin) {
      return;
    }

    const token = resolveTokenFromMessage(event.data);
    if (token) {
      setAuthToken(token);
    }

    const toggles = resolveTogglesFromMessage(event.data);
    if (toggles) {
      inMemoryToggles = toggles;
      onTogglesReceivedCallback?.(toggles);
    }
  });

  window.setPhoenixToken = (token: string) => {
    setAuthToken(token);
  };

  window.setPhoenixToggles = (toggles: RawFeatureToggleConfig) => {
    inMemoryToggles = toggles;
    onTogglesReceivedCallback?.(toggles);
  };
};

declare global {
  interface Window {
    setPhoenixToken?: (token: string) => void;
    setPhoenixToggles?: (toggles: RawFeatureToggleConfig) => void;
  }
}
