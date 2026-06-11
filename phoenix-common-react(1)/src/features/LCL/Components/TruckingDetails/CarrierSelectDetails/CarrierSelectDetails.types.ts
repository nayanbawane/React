export interface CfsOriginLocation {
  companyName?: string;
  city?: string;
  streetAddress?: string;
  state?: string;
  contactName?: string;
  contactPhone?: string;
  zipCode?: string;
  contactEmail?: string;
  accessorials?: string;
  pickupDate?: string;
  pickupTimeFrom?: string;
  pickupTimeTo?: string;
}

export interface CfsDestinationLocation {
  companyName?: string;
  city?: string;
  streetAddress?: string;
  state?: string;
  contactName?: string;
  contactPhone?: string;
  zipCode?: string;
  contactEmail?: string;
  accessorials?: string;
  deliveryEstimatedDate?: string;
}

export interface CarrierMainDetails {
  customerPoNumber?: string;
  shipperReferenceNumber?: string;
  loadReleaseNumber?: string;
  tmsCarrier?: string;
  origin?: CfsOriginLocation;
  destination?: CfsDestinationLocation;
}

export interface TmsOrderHazardousBean {
  unNumber: string;
  imcoClass: string;
  packagingGroup: string;
  emergencyCotact: string;
}

export interface TmsOrderDimensionBean {
  length: number;
  width: number;
  height: number;
  unit: 'I' | 'F' | 'C' | 'M';
  pieces: number;
  kg: number;
  lbs: number;
  tmsClass: number;
  cbm: number;
  cbf: number;
}

export interface PriceAccessorialBean {
  accessorialCode: string;
  accessorialPrice: number;
  description: string;
}

export interface Commodity {
  packagingType: string;
  additionalMarkings: string;
  piecesTotal?: string;
  piecespackagingType?: string;
}

export interface TmsOrderCargoAndPricingBean {
  commodityDescription: string;
  totalNumberOfPieces: string;
  totalWeightKg: string;
  totalWeightLbs: string;
  hazardous: string;
  stackable: boolean;
  rate: string;
  priceFuelSurcharge: number;
  priceAccessorials: PriceAccessorialBean[];
  priceTotal: number;
  tmsOrderHazardousBean: TmsOrderHazardousBean[];
  tmsOrderDimensionBeans: TmsOrderDimensionBean[];
}

export interface TmsOrderMainBean {
  tmsOrderCargoAndPricingBean: TmsOrderCargoAndPricingBean;
  bookDomesticShipmentInputBean: {
    commodities: Commodity[];
  };
  moduleCode: string;
}

export interface AccordionItem {
  id: string;
  label: string;
  progressValue: number;
  icon: boolean;
  content: React.ReactNode;
}

export interface AccordionProps {
  id: string;
  accordionData: AccordionItem[];
  openItems: string[];
  toggleItem: (id: string) => void;
}

export interface CarrierSelectDetailsProps {
  open: boolean;
  onClose: () => void;
  mainDetails?: CarrierMainDetails;
  cargoDetails?: TmsOrderMainBean;
  is3gTmsEnabled?: boolean;
  isModifyHandlingEnabled?: boolean;
  onBookWithTms?: (editedDetails: CarrierMainDetails) => void;
  isBookingLoading?: boolean;
}
