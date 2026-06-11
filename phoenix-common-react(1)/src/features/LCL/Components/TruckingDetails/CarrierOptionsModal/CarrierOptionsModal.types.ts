import type { CarrierOptionsFormData, CarrierQuote, RefreshOptionsParams, RefreshOptionsResult } from '@/types';
import type { CarrierMainDetails, TmsOrderMainBean } from '../CarrierSelectDetails/CarrierSelectDetails.types';
import type { PickupCharge } from '../../../../../types/LCL/misc/TruckingDetails.types';

export interface BookWithTmsResult {
  success: boolean;
  message: string;
  closeModal: boolean;
  tmsShipmentId?: string;
  tmsStatus?: string;
  truckerProNumber?: string;
  tmsCarrier?: string;
  carrierSCAC?: string;
  priceTotal?: number;
  updatedCharges?: PickupCharge[];
}

export interface CarrierOptionsHandlers {
  onPickupAccessorialToggle: (code: string) => void;
  onDeliverToAccessorialToggle: (code: string) => void;
  onSelectQuote: (quote: CarrierQuote) => void;
  onPickupLocationCodeChange: (value: string) => void;
  onPickupZipCodeChange: (value: string) => void;
  onDeliverToLocationCodeChange: (value: string) => void;
  onDeliverToZipCodeChange: (value: string) => void;
  onAlternateGatewayChange: (value: string) => void;
  onZipCodeChange: (value: string) => void;
  onRefreshOptions?: (params: RefreshOptionsParams) => Promise<RefreshOptionsResult | null>;
  onBookWithTmsResult: (result: BookWithTmsResult) => void;
}

export interface CarrierLocationSuggestion {
  data: Record<string, unknown>[];
  setQuery: (q: string) => void;
}

export interface CarrierOptionsLocationSuggestions {
  pickupLocationCode: CarrierLocationSuggestion;
  deliverToLocationCode: CarrierLocationSuggestion;
}

export interface CarrierOptionsUiState {
  mainDetailsOpen: boolean;
  pricingOpen: boolean;
  guaranteedOnly: boolean;
}

export interface CarrierOptionsUiHandlers {
  onToggleMainDetails: () => void;
  onTogglePricing: () => void;
  onToggleGuaranteed: () => void;
  onSetAllOpen: (open: boolean) => void;
}

export interface CarrierOptionsModalProps {
  open: boolean;
  onClose: () => void;
  formData: CarrierOptionsFormData;
  quotes: CarrierQuote[];
  handlers: CarrierOptionsHandlers;
  uiState: CarrierOptionsUiState;
  uiHandlers: CarrierOptionsUiHandlers;
  mainDetails?: CarrierMainDetails;
  cargoDetails?: TmsOrderMainBean;
  moduleCode?: string;
  suggestions?: CarrierOptionsLocationSuggestions;
  alternateGatewayOptions?: { label: string; value: string }[];
  availableAccessorials?: { id: string; label: string }[];
  isModifyBooking?: boolean;
  onPopulateReference?: (referenceNumber: string) => void;
  onSuccess?: (shipmentId: string) => void;
}
