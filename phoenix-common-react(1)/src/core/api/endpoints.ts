/**
 * Centralized API Endpoints Configuration
 * This file contains all API endpoints used in the application
 * Benefits:
 * - Single source of truth for all API routes
 * - Easy to update endpoints across the entire app
 * - Type-safe endpoint generation with TypeScript
 * - Clear overview of all API interactions
 */

import {
  bookingPaths,
  importBookingPaths,
  rateDetailsPaths,
  suggestionBoxPaths,
  objectStoragePaths,
  incidentPaths,
  organizationSearchPaths,
  carrierOptionsPaths,
  conatinerBeanPaths
} from './paths';

import { locationPaths } from './paths/locationPaths';
import { termsAndConditionsPaths } from './paths/termsAndConditionsPaths';
import { localStoragePaths } from './paths/localStorage.path';

export const API_ENDPOINTS = {
  // Booking endpoints
  BOOKING: bookingPaths,

  // Import booking endpoints
  IMPORT_BOOKING: importBookingPaths,

  // Incident reason/category endpoints
  INCIDENT: incidentPaths,

  // Suggestion endpoints
  SUGGESTION_BOX: suggestionBoxPaths,

  RATE_DETAILS: rateDetailsPaths,

  // Object Storage endpoints
  OBJECT_STORAGE: objectStoragePaths,
  TERMS_AND_CONDITIONS: termsAndConditionsPaths,
  LOCATION: locationPaths,

  //Organization Search endpoints
  ORGANIZATION_SEARCH: organizationSearchPaths,

  LOCAL_STORAGE: localStoragePaths,

  CARRIER_OPTIONS: carrierOptionsPaths, 
  
  CONATINER_BEAN: conatinerBeanPaths

} as const;

/**
 * Helper function to build query strings
 * Usage: buildQueryString({ page: 1, limit: 10 }) => "?page=1&limit=10"
 */
export const buildQueryString = (params: Record<string, unknown>): string => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Helper function to build URLs with path parameters and query strings
 * Usage: buildUrl('/users/:id', { id: '123' }, { page: 1 })
 */
export const buildUrl = (
  path: string,
  pathParams?: Record<string, string>,
  queryParams?: Record<string, unknown>
): string => {
  let url = path;

  // Replace path parameters
  if (pathParams) {
    Object.entries(pathParams).forEach(([key, value]) => {
      url = url.replace(`:${key}`, encodeURIComponent(value));
    });
  }

  // Add query parameters
  if (queryParams) {
    url += buildQueryString(queryParams);
  }

  return url;
};
