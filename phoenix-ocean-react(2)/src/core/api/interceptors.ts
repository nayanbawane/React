import { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { apiClient } from './client';
import { getAuthToken } from '@/core/auth/tokenBridge';

/**
 * Request Interceptor
 * Adds authentication token, request metadata, and logging.
 */
const onRequest = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const token = getAuthToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  config.headers['X-Request-Time'] = new Date().toISOString();
  config.headers['X-Request-ID'] = crypto.randomUUID();

  if (import.meta.env.DEV) {
    console.group(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    console.groupEnd();
  }

  return config;
};

const onRequestError = (error: AxiosError): Promise<AxiosError> => {
  console.error('Request error:', error);
  return Promise.reject(error);
};

/**
 * Response Interceptor
 * Handles successful responses and logs them.
 */
const onResponse = (response: AxiosResponse): AxiosResponse => {
  if (import.meta.env.DEV) {
    const duration = response.config.headers['X-Request-Time']
      ? Date.now() - new Date(response.config.headers['X-Request-Time'] as string).getTime()
      : 0;

    console.group(`API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`);
    console.groupEnd();
  }

  return response;
};

/**
 * Response Error Interceptor
 * Handles global error scenarios.
 */
const onResponseError = async (error: AxiosError): Promise<never> => {
  if (import.meta.env.DEV) {
    console.group('API Error');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.message);
    console.error('Data:', error.response?.data);
    console.groupEnd();
  }

  if (error.response?.status === 401) {
    console.error('Unauthorized request. Token may be missing or expired.');
  }

  if (error.response?.status === 403) {
    console.error('Forbidden request.');
  }

  if (error.response?.status === 404) {
    console.error('Resource not found');
  }

  if (error.response?.status === 429) {
    console.error('Too many requests. Please try again later.');
  }

  if (error.response?.status === 500) {
    console.error('Server error occurred:', error.response.data);
  }

  if (error.response?.status === 503) {
    console.error('Service temporarily unavailable');
  }

  if (!error.response) {
    console.error('Network error. Please check your internet connection.');
  }

  if (error.code === 'ECONNABORTED') {
    console.error('Request timeout. Please try again.');
  }

  return Promise.reject(error);
};

/**
 * Setup all interceptors
 * Call this function once when your app initializes.
 */
export const setupInterceptors = (): void => {
  apiClient.interceptors.request.use(onRequest, onRequestError);
  apiClient.interceptors.response.use(onResponse, onResponseError);
};

/**
 * Remove all interceptors
 * Useful for testing or cleanup.
 */
export const clearInterceptors = (): void => {
  apiClient.interceptors.request.clear();
  apiClient.interceptors.response.clear();
};
