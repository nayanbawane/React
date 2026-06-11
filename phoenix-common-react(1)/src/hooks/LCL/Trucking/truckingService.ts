export interface GetOriginAndDestinationCityStateRequest {
  originZipCode: string;
  destinationZipCode: string;
  moduleCode: string;
  officeId: number;
}

interface GetOriginAndDestinationCityStateResult {
  originCityState: string;
  destinationCityState: string;
}

export interface GetOriginAndDestinationCityStateResponse {
  success: number;
  result: GetOriginAndDestinationCityStateResult;
  message: string;
  errorCode: string | null;
}

export function parseCityState(raw: string): { city: string; state: string } {
  if (!raw) return { city: '', state: '' };
  const clean = raw.replace(/"/g, '');
  const parts = clean.split(',');
  if (parts.length < 2) return { city: '', state: '' };
  return { city: parts[0].trim(), state: parts[1].trim() };
}
