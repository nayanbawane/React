const TOKEN_STORAGE_KEY = 'token';
const TOKEN_MESSAGE_TYPES = new Set(['GWT_AUTH_TOKEN', 'PHOENIX_AUTH_TOKEN']);

let inMemoryToken: string | null = null;
let isBridgeInitialized = false;

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
  });

  window.setPhoenixToken = (token: string) => {
    setAuthToken(token);
  };
};

declare global {
  interface Window {
    setPhoenixToken?: (token: string) => void;
  }
}
