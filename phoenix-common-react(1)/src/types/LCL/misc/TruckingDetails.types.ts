import type { ReactNode } from 'react';
import type { AccessoriesOption } from '../routing/RoutingDetails.types';

export type SortField = 'transitTime' | 'buyTotal' | 'sellTotal';
export type SortDir = 'asc' | 'desc';

export interface SortRule {
    field: SortField;
    asc: boolean;
}

export interface TruckerFormData {
    truckerCode: string;
    truckerDetails: string;
    truckerProNumber: string;
    estimatedDeliveryDate: Date | null;
    status: string;
    truckerQuote: string;
    truckerReference: string;
}

export interface DoorDeliveryChargesState {
    isFetchingRates: boolean;
    truckerSearchOpen: boolean;
    onSetTruckerSearchOpen: (open: boolean) => void;
    onFetchTruckRates?: () => void;
    buyTotal: number;
    sellTotal: number;
    profitLoss: number;
    chargeRows: PickupCharge[];
}

export type TruckerOptionsMode = 'DRCF' | 'CFDR' | 'DRDR';

export interface TruckerOptionsModalProps {
    open: boolean;
    onClose: () => void;
    mode?: TruckerOptionsMode;
    onRefreshRates?: () => void;

    alternateGateway?: string;
    onSetAlternateGateway?: (v: string) => void;
    alternateGatewayZipCode?: string;
    onSetAlternateGatewayZipCode?: (v: string) => void;
    alternateGatewayOptions?: { label: string; value: string }[];

    deliveryAlternateGateway?: string;
    onSetDeliveryAlternateGateway?: (v: string) => void;
    deliveryAlternateGatewayZipCode?: string;
    onSetDeliveryAlternateGatewayZipCode?: (v: string) => void;
    deliveryAlternateGatewayOptions?: { label: string; value: string }[];

    pickupCity: string;
    onSetPickupCity?: (v: string) => void;
    pickupZipCode: string;
    onSetPickupZipCode?: (v: string) => void;
    deliveryLocationCode: string;
    deliveryZipCode: string;
    onSetDeliveryZipCode?: (v: string) => void;

    onSetDoorDeliveryCity?: (v: string) => void;
    onSetDoorDeliveryZipCode?: (v: string) => void;

    pickupAccessorials?: string[];
    onTogglePickupAccessorial?: (code: string) => void;
    doorDeliveryAccessorials?: string[];
    onToggleDoorDeliveryAccessorial?: (code: string) => void;
    availableAccessorials?: { label: string; value: string }[];
    availableDeliveryAccessorials?: { label: string; value: string }[];
    accessorialOptions?: AccessoriesOption[];
    doorAccessorialOptions?: AccessoriesOption[];
    piecesTotal: number;
    weightTotal: number;
    volumeTotal: number;
    pickupIndex: number;

    stackable: 'yes' | 'no';
    setStackable: (v: 'yes' | 'no') => void;
    shipmentType: string;
    setShipmentType: (v: string) => void;

    // Pickup rates
    rates: TruckRateV1[];
    isFetching: boolean;
    onSelectRate: (rate: TruckRateV1) => void;

    // Main Details accordion
    mainOpen: boolean;
    setMainOpen: (v: boolean) => void;

    // Pickup rates accordion
    ratesOpen: boolean;
    setRatesOpen: (v: boolean) => void;

    // Pickup rates table state
    sortRules: SortRule[];
    expandedRows: Set<number>;
    displayCount: number;
    setDisplayCount: (fn: (c: number) => number) => void;
    allOpen: boolean;
    handleSort: (field: SortField) => void;
    handleToggleRow: (idx: number) => void;
    sortedRates: TruckRateV1[];
    displayedRates: TruckRateV1[];
    hasMore: boolean;

    // Door delivery Main Details panel 
    doorDeliveryLocationCode?: string;
    doorDeliveryZipCode?: string;
    doorDeliveryCity?: string;
    doorDeliveryStackable?: 'yes' | 'no';
    onSetDoorDeliveryStackable?: (v: 'yes' | 'no') => void;
    doorDeliveryShipmentType?: string;
    onSetDoorDeliveryShipmentType?: (v: string) => void;

    // Door delivery rates section 
    doorDeliveryRates?: TruckRateV1[];
    doorDeliveryIsFetching?: boolean;
    onSelectDoorDeliveryRate?: (rate: TruckRateV1) => void;
    doorDeliveryRatesOpen?: boolean;
    setDoorDeliveryRatesOpen?: (v: boolean) => void;
    doorDeliverySortRules?: SortRule[];
    doorDeliveryExpandedRows?: Set<number>;
    doorDeliveryDisplayCount?: number;
    setDoorDeliveryDisplayCount?: (fn: (c: number) => number) => void;
    handleDoorDeliverySort?: (field: SortField) => void;
    handleDoorDeliveryToggleRow?: (idx: number) => void;
    doorDeliverySortedRates?: TruckRateV1[];
    doorDeliveryDisplayedRates?: TruckRateV1[];
    doorDeliveryHasMore?: boolean;

    // Alternate gateway rates section (pickup)
    altGatewayIsFetching?: boolean;
    altGatewayRates?: TruckRateV1[];
    onSelectAltGatewayRate?: (rate: TruckRateV1) => void;
    altGatewayRatesOpen?: boolean;
    setAltGatewayRatesOpen?: (v: boolean) => void;
    altGatewaySortRules?: SortRule[];
    altGatewayExpandedRows?: Set<number>;
    altGatewayDisplayCount?: number;
    setAltGatewayDisplayCount?: (fn: (c: number) => number) => void;
    handleAltGatewaySort?: (field: SortField) => void;
    handleAltGatewayToggleRow?: (idx: number) => void;
    altGatewaySortedRates?: TruckRateV1[];
    altGatewayDisplayedRates?: TruckRateV1[];
    altGatewayHasMore?: boolean;

    // Delivery alternate gateway rates section
    deliveryAltGatewayIsFetching?: boolean;
    deliveryAltGatewayRates?: TruckRateV1[];
    onSelectDeliveryAltGatewayRate?: (rate: TruckRateV1) => void;
    deliveryAltGatewayRatesOpen?: boolean;
    setDeliveryAltGatewayRatesOpen?: (v: boolean) => void;
    deliveryAltGatewaySortRules?: SortRule[];
    deliveryAltGatewayExpandedRows?: Set<number>;
    deliveryAltGatewayDisplayCount?: number;
    setDeliveryAltGatewayDisplayCount?: (fn: (c: number) => number) => void;
    handleDeliveryAltGatewaySort?: (field: SortField) => void;
    handleDeliveryAltGatewayToggleRow?: (idx: number) => void;
    deliveryAltGatewaySortedRates?: TruckRateV1[];
    deliveryAltGatewayDisplayedRates?: TruckRateV1[];
    deliveryAltGatewayHasMore?: boolean;
}

export interface RateCharge {
    tariffType: string;
    zone: number;
    countryCode: string;
    state: string;
    cityName: string;
    zipCode: string;

    chargeName: string;
    chargeCode: string;
    aspect: string;
    currency: string;

    rate: number;
    basis: string;
    basisDescription: string;

    minimum: number;
    maximum: number | null;

    effectiveDate: string;
    expirationDate: string;

    scaleUom: string;
    from: string;
    to: string;

    notes: string;
    conditional: string;
    vat: string;
    routingPort: string;

    sellRate: number;
    calculatedBuyAmount: number;
    calculatedSellAmount: number;

    truckerCode: string;
    trkRateId: number;

    companyCode: string;
    customerCode: string;
    nacCode: string;

    sellBasis: string;
    sellBasisDescription: string;
}
export interface RateHeader {
    carrier: string;
    carrierName: string;
    carrierType: string;

    transitTime: number;

    buyTotal: number;
    sellTotal: number;

    buyCurrency: string;
    sellCurrency: string;
}

export interface TruckRateV1 {
    header: RateHeader;
    charges: RateCharge[];
}

export interface DoorDeliveryFormData {
    doorDeliveryCountry: string;
    postalCodeCity: string;
    estimatedDeliveryDate: Date | null;
    streetAddress: string;
    accessorials: string[];
    doorDeliveryCity: string;
    doorDeliveryZipCode: string;
    doorDeliveryState: string;
    stackable: boolean;
    shipmentType: string;
    truckerCode: string;
    truckerDetails: string;
    latitude: string;
    longitude: string;
    residential: string;
    truckerName: string;
    doorDeliveryStateCode: string;
}

export interface AccordionItem {
    label: string;
    content: ReactNode;
    progress: boolean;
    icon: boolean;
    progressValue: number;
    onIconClick?: () => void;
}

export interface CargoDimRow {
    length: string;
    width: string;
    height: string;
    pieces: string;
}

export interface CargoRow {
    description: string;
    pieces: string;
    packaging: string;
    kg: string;
    dimRows: CargoDimRow[];
}

export interface HeaderData {
    estimatedPickupDate: Date | null;
    city: string;
    zipCode: string;
}

export interface PickupDeliveryFormData {
    postalCodeCity: string;
    pickupCargoAtCode: string;
    estimatedPickupDate: Date | null;
    timeFrom: string;
    timeTo: string;
    name: string;
    instructions: string;
    streetAddress: string;
    deliveryDate: Date | null;
    deliveryTime: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    contactName1: string;
    contactPhone1: string;
    contactEmail1: string;
    contactName2: string;
    contactPhone2: string;
    contactEmail2: string;
    pickupReference: string;
    latitude: string;
    longitude: string;
    accessorials: string[];
    quotePickupId?: number;
}

export interface DimRowData {
    length: string;
    width: string;
    height: string;
    unit: string;
    pieces: string;
    cbm: string;
    cbf: string;
    kg: string;
    lbs: string;
    cls: string;
    shipmentType: string;
    stackingType: string;
    packageType: string;
    flag:boolean;
}

export interface HazRowData {
    imoClass: string;
    imoSubclass: string;
    unNumber: string;
    imoPage: string;
    pkgGroup: string;
    flashpointC: string;
    flashpointF: string;
    pieces: string;
    packaging: string;
    weight: string;
    properShippingName: string;
    technicalName: string;
    placard1: string;
    placard2: string;
    emergencyNumber: string;
    emergencyContact: string;
    quantity: string;
}

export interface InternalCargoRowData {
    marks: string;
    pieces: string;
    packaging: string;
    description: string;
    kg: string;
    lbs: string;
    cbm: string;
    cbf: string;
    hazardous: string;
    docRef: string;
    useStandardDimensions?: boolean;
    dimRows: DimRowData[];
    hazRows: HazRowData[];
}

export interface PickupCharge {
    id: number;
    chargeDescription: string;
    expenseCurrency: string;
    expense: number;
    incomeCurrency: string;
    income: number;
    flag?: 'TRK' | 'MANUAL';
    pickupId?: number;
    notes?: string;
}

export interface FetchTmsButtonState {
    show: boolean;
    disabled: boolean;
    loading: boolean;
    label: 'Fetch Quote from TMS' | 'Modify TMS Booking' | 'Fetch TMS Rates' | 'Modify TMS Quote';
}

export interface TmsBookingContext {
    pickupType: string;
    bookingStatus: string;
    tmsShipmentId: string;
    pendingFinalBookingStatus: string;
    moduleType: string;
    referenceNumber: string;
    deliveryLocationCode: string;
    deliveryZipCode: string;
    countryCode: string;
    profitPercentage: number;
    onSave?: () => void;
}

export interface TmsCommodityBean {
    piecesTotal: number;
    handlingQuantity: number;
    packagingType: string;
    length: number;
    width: number;
    height: number;
    weightTotal: number;
    cbm: number;
    hazardousMaterial: boolean;
    freightClass: string;
    nmfc: string;
    description: string;
    additionalMarkings:string;
    unNumber:string;
    packingGroup: string;
    hazardClass: string;
    cbf: number;
    hazmatEmergencyContactNumber: string;
    piecespackagingType: string;
}

export interface GetRateQuoteInputBean {
    authenticationKey:string
    originZipCode: string;
    originCountry: string;
    destinationZipCode: string;
    destinationCountry: string;
    commodities: TmsCommodityBean[];
    accessorialCodes: string[];
    dimensionUnits: string;
    weightUnits: string;
    referenceNumber?: string;
    pickupId:string;
    stackable:string;
}

export interface PriceAccessorialBean {
    accessorialCode: string;
    accessorialPrice: number;
    description: string;
}

export interface TmsCarrierQuoteResult {
    errorMessage: string | null;
    carrierName: string;
    carrierSCAC: string;
    serviceLevel: string;
    transitTime: number;
    newLiabilityCoverage: number;
    usedLiabilityCoverage: number;
    priceLineHaul: number;
    priceFuelSurcharge: number;
    priceAccessorials: PriceAccessorialBean[];
    priceTotal: number;
    tsaCompliance: string;
    pricingInstructions: string;
    tariffDescription: string;
    chargeCodeMap: Record<string, string>;
    rate?: string;
}

export interface TmsOrderMainBean {
    tmsShipmentId: string;
    tmsStatus: string;
    tmsCarrier: string;
    truckerProNumber: string;
    pickupLocationCode: string;
    pickupAccessorialButtons: string[];
    deliverToAccessorial: string[];
    alternateGateway: string;
    chargeDescription: string;
    localeChargeDescription: string;
    chargeCodeMap: Record<string, string>;
    tmsOrderCargoAndPricingBean: {
        priceTotal: number;
        priceFuelSurcharge: number;
        priceAccessorials: PriceAccessorialBean[];
        rate?: string;
    };
    bookDomesticShipmentInputBean: {
        carrierSCAC: string;
    } | null;
    originBean: {
        companyName: string;
        streetAddress: string;
        streetAddressTwo: string;
        city: string;
        state: string;
        zipCode: string;
        contactName: string;
        phone: string;
        email: string;
    };
}

export interface DoorDeliveryDetailsProps {
    formData: DoorDeliveryFormData;
    onFormDataChange: (field: keyof DoorDeliveryFormData, value: unknown) => void;
    setPickupValidationMessage?: (messages: string[]) => void;
    doorAccessorialOptions?: AccessoriesOption[];

}

export interface TruckingDetailsProps {
    moduleType: String;
    outerOpenItems: string[];
    onToggleOuter: (id: string) => void;
    collapsedSet: Set<number>;
    onToggleCollapse: (pickupId: number) => void;
    headerDataMap: Record<number, HeaderData>;
    hasDoorDelivery: boolean;
    hasPickups: boolean;
    isCombined: boolean;
    doorDeliveryCollapsed: boolean;
    onSetDoorDeliveryCollapsed: (v: boolean) => void;
    pickups: number[];
    onAddPickup?: () => void;
    onRemovePickup?: (index: number) => void;
    showMultiPickupControls: boolean;
    renderPickupContent: (pickupId: number, pickupIndex: number, isCombined: boolean) => ReactNode;
    renderPickupHeaderExtra?: (pickupId: number) => ReactNode;
    doorDeliveryFormData?: DoorDeliveryFormData;
    onDoorDeliveryFormDataChange?: (field: keyof DoorDeliveryFormData, value: unknown) => void;
    doorDeliveryChargesState?: DoorDeliveryChargesState;
    routing : any;
    accessorialOptions?: AccessoriesOption[];
    doorAccessorialOptions?: AccessoriesOption[];
}

export interface WarehouseDetailsBean {
    code: string;
    name: string;
    name1: string;
    address1: string;
    address2: string;
    address3: string;
    address4: string;
    address5: string;
    phone: string;
    email: string;
    state: string;
    contactPerson: string;
    longitude: string;
    latitude: string;
    countryCode: string;
    unLocationCode: string;
}

export interface CommodityPayload {
    pieces: number;
    length: number;
    width: number;
    height: number;
    dimensionUnits: string;
    cbm: number;
    cbf: number;
    kg: number;
    lbs: number;
    description: string;
    freightClass: string;
    hazardClass: string;
    unNumber: string;
    packingGroup: string;
    additionalMarkings: string;
    packagingType: string;
}

export interface TruckRateRequestPayload {
    requestedBy: string;
    rateType: 'P' | 'D';
    officeCode: string;
    truckSellProfileCode: string;
    namedAccountCode: string;
    originCity: string;
    originZipCode: string;
    originCountryCode: string;
    originUnlocation: string;
    destinationCity: string;
    destinationZipCode: string;
    destinationCountryCode: string;
    destUnlocation: string;
    tentativeDate: string;
    uom: string;
    packagingType: string;
    shipmentType: string;
    piecesTotal: number;
    weightTotal: number;
    volumeTotal: number;
    hazardousMaterial: boolean;
    commodities: CommodityPayload[];
    accessorialCodes: string[];
    stackable: string;
    scaleRate: string;
    truckerResponseFileId: number;
}

export interface TruckRateApiResponse {
    success: number;
    message: string;
    result: { rates: TruckRateV1[] };
}


export interface TruckRateRequestBean {
    truckRateSearchRequest: TruckRateRequestPayload;
    lDapUsername: string;
}
export interface FCLTruckingDetailsProps {
    formData: FCLTruckerFormData;
    onChange: <K extends keyof FCLTruckerFormData>(
        field: K,
        value: FCLTruckerFormData[K]
    ) => void;
    onChargesChange: <K extends keyof FCLChargeItem>(
        field: K,
        value: FCLChargeItem[K],
        index: number
    ) => void;
    tempData: any;
    pickupCodeSuggestion?: {
        data: Record<string, unknown>[];
        setQuery: (query: string) => void;
    };
    handlePickupCodeSelect?: (item: Record<string, unknown>) => void;
    truckerCodeSuggestion?: {
        data: Record<string, unknown>[];
        setQuery: (query: string) => void;
    };
    handleTruckerCodeSelect?: (item: Record<string, unknown>) => void;
    timeSuggestion?: {
        data: Record<string, unknown>[];
        setQuery: (query: string) => void;
    };
    handleTimeSelection?: (item: Record<string, unknown>, fieldName: string) => void;
    onAdd?: (item: Number) => void;
    onRemove?: (item: Number) => void;
    chargeDescriptionSuggestion?: {
        data: Record<string, unknown>[];
        setQuery: (query: string) => void;
    };
    handleChargeDescriptionSelection?: (item: Record<string, unknown>, index : number) => void;
    currencySuggestion?: {
        data: Record<string, unknown>[];
        setQuery: (query: string) => void;
    };
    handleCurrencySelection?: (item: Record<string, unknown>, index : number) => void;
    datePickerOnBlurHandler?: (event: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => void;
    error?: error;
    datePickerKeyDownHandler: (event: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => void;
    dateSelectionHandler: (value: Date | null, fieldName: string) => void;
    handleOrganizationSearch: (value: any, fieldName: string) => void;
    timePickerOnBlurHandler?: (event: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => void;
    pickUpDateRef: React.MutableRefObject<HTMLInputElement | null>;
    pickupTimeRef: React.MutableRefObject<HTMLInputElement | null>;
    pickupTimeToRef: React.MutableRefObject<HTMLInputElement | null>;
    chargeDescriptionRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
    openSearch: boolean;
    toggleSearch:() => void;
    onRegisterFields: (fields: string[]) => void;
    onFieldsChange: (data: any) => void;
}
export interface FCLTruckerFormData {
    pickupDate: Date | null;
    pickupTime: string | null;
    pickupTimeTo: string | null;
    truckerCode: string | null;
    truckerName: string | null;
    truckerAddress1: string | null;
    truckerAddress2: string | null;
    truckerAddress3: string | null;
    truckerContact: string | null;
    pickupInstruction: string | null
    charges: FCLChargeItem[];
    pickupAtCargoCode: string | null;
    pickupAtCargoName: string | null;
    pickupAtCargoName1: string | null
    pickupAtCargoAddress1: string | null;
    pickupAtCargoAddress2: string | null;
    pickupAtCargoAddress3: string | null;
    pickupAtCargoAddress4: string | null;
    pickerContact: string | null;
    totalIncome: number;
    totalExpense: number;
    profitOrLoss: number;
    pickupAtCargoDetails: string;
    truckerCodeDetails: string;
    pickerPhone: string;
    truckerPhone: string;

    //Change by Nayan
    //Pick Up
    pickupContactName?: string;
    pickupPhoneNumber?: string;
    pickupEmail?: string;


    //Change by Nayan
    //Trucker
    truckerContactName?: string;
    truckerPhoneNumber?: string;
    truckerEmail?: string;
}

export type FCLChargeItem = {
    expense: Number;
    income: Number;
    currency: string;
    charge: string;
    chargeDescription: string;
    rateOfExchange?: number;
};

export type error = {
  showErrorModal: boolean;
  onClose: () => void;
  message: string | React.ReactNode;
}
