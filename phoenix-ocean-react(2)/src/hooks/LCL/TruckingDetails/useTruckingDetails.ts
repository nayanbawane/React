import { useState, useRef, useEffect } from 'react';
import { PHOENIX_ENDPOINTS } from '@/core/api/config/phoenix.endpoints';
import { CargoRowType, COMMON_ENDPOINTS, FCLChargeItem, MinifiedLoginClientBean } from 'phoenix-common-react';
import {
    ApiService,
    CargoRow,
    CommodityPayload,
    TruckRateRequestBean,
    WarehouseDetailsBean,
    defaultPickupDeliveryFormData,
    defaultTruckerFormData,
    DoorDeliveryFormData,
    DOOR_DELIVERY_ACCESSORIALS,
    FetchTmsButtonState,
    GetRateQuoteInputBean,
    HeaderData,
    InternalCargoRowData,
    PickupCharge,
    PickupDeliveryFormData,
    PICKUP_CARGO_ORG_DATA,
    SHIPMENT_TYPE_OPTIONS,
    TRUCK_BOOKING_AUTO_FETCH_RATES,
    TmsBookingContext,
    TmsCarrierQuoteResult,
    TmsCommodityBean,
    makeEmptyCargoRow,
    useFeatureToggle,
    CommonToggleKeys,
    MODULE_BKG,
    TruckRateV1,
    TruckerFormData,
    initialCarrierOptionsFormData,
    useGetSuggestions,
    useGetSelections,
    tmsLocationCodeSuggestionConfig,
    alternateGatewaySelectionConfig,
    deliveryAlternateGatewaySelectionConfig,
    pickupACCESSORIALS,
    type CarrierOptionsFormData,
    type CarrierQuote,
    type BookWithTmsResult,
    type RefreshOptionsParams,
    type RefreshOptionsResult,
    FCLTruckerFormData,
    getInitialFCLTruckingData,
    fclQuotePickupAndTruckerCodeSuggestionConfig,
    timeSuggestionConfig,
    fclQuoteChargeDescriptionSuggestionConfig,
    handlingCurrencySuggestionConfig,
    type CargoMetrics,
    type DimRowData,
} from 'phoenix-common-react';
import { validateLatitude, validateLongitude } from '@/hooks/Map/map';
import { checkDateValidation } from 'phoenix-react-lib';
import { useAppSelector } from '@/app/store/hooks';
type FetchTruckRatesResponse = {
    success: number;
    result: {
        success: number;
        result: { rates: TruckRateV1[] };
        message: string;
        errorCode: string | null;
    };
    message: string;
    errorCode: string | null;
};

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

const formatTentativeDate = (date: Date | string | null | undefined): string => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return `${String(d.getDate()).padStart(2, '0')}-${MONTHS[d.getMonth()]}-${d.getFullYear()}`;
};

import { useStatus } from '../../../context/statusContext';
import { API_ENDPOINTS, GetCurrencyConversionRateRequest, GetCurrencyConversionRateResponse, useApi } from 'phoenix-common-react';
export type { PickupDeliveryFormData, TruckerFormData };
export { PICKUP_CARGO_ORG_DATA, DOOR_DELIVERY_ACCESSORIALS, SHIPMENT_TYPE_OPTIONS };
const EMPTY_PICKUP_CHARGES: PickupCharge[] = [];
const EMPTY_DOOR_DELIVERY_CHARGES: PickupCharge[] = [];
const EMPTY_HEADER_MAP: Record<number, HeaderData> = {};

const isCountryUs = (country: string): boolean =>
    country.split('-')[0].trim().toUpperCase() === 'US';

const CLOSED_STATUS_CODE = 'C';

let rateMapData: Record<string, string> | null = null;
let rateMapDataPromise: Promise<Record<string, string> | null> | null = null;

export const fetchRateMapping = async (): Promise<Record<string, string> | null> => {
    try {
        const response = await ApiService.post<Record<string, string>>(
            COMMON_ENDPOINTS.CARRIER_OPTIONS.GET_RATE_MAPPING
        );
        rateMapData = response.data;

        return rateMapData;
    } catch (error) {
        console.error('Failed to fetch rate mapping', error);
        return null;
    }
};

export const getRateMapData = () => rateMapData;

export const getOrFetchRateMapData = async (): Promise<Record<string, string> | null> => {
    if (rateMapData) return rateMapData;
    if (!rateMapDataPromise) {
        rateMapDataPromise = fetchRateMapping().finally(() => {
            rateMapDataPromise = null;
        });
    }
    return rateMapDataPromise;
};

export const getExpenseForCharges = (income: number, profitPercentage: number): number => {
    let expense = 0;

    if (profitPercentage > 0) {
        const profit = (income * profitPercentage) / 100;
        expense = income - profit;
    }

    return expense;
};

const findChargeMapping = (map: Record<string, string> | null, key: string): string[] => {
    if (!map || !map[key]) return [];
    return map[key].split('^');
};

const formatChargeName = (parts: string[], fallback: string): string => {
    if (parts.length >= 2) return `${parts[0]} - ${parts[1].toUpperCase()}`;
    return fallback;
};

const buildTmsPayload = (
    rows: CargoRow[],
    originZip: string,
    originCountry: string,
    destinationZip: string,
    destinationCountry: string,
    accessorials: string[],
): { mainBean: GetRateQuoteInputBean; moduleCode: string } => {
    const commodities: TmsCommodityBean[] = rows.map(row => {
        const dim = row.dimRows[0] ?? {} as any;
        const haz = row.hazRows[0];
        return {
            piecesTotal: parseFloat(row.pieces) || 0,
            handlingQuantity: parseFloat(row.pieces) || 0,
            packagingType: row.packaging ?? '',
            length: parseFloat(dim.length ?? '0') || 0,
            width: parseFloat(dim.width ?? '0') || 0,
            height: parseFloat(dim.height ?? '0') || 0,
            weightTotal: parseFloat(row.kg) || 0,
            cbm: parseFloat(row.cbm) || 0,
            cbf: parseFloat(row.cbf) || 0,
            hazardousMaterial: row.hazardous === 'Y',
            freightClass: dim.cls ?? '',
            nmfc: '',
            description: row.description ?? '',
            additionalMarkings: row.marks ?? '',
            unNumber: haz?.unNumber ?? '',
            packingGroup: haz?.pkgGroup ?? '',
            hazardClass: haz?.imoClass ?? '',
            hazmatEmergencyContactNumber: haz?.emergencyNumber ?? '',
            piecespackagingType: row.packaging ?? '',
        };
    });
    return {
        mainBean: {
            authenticationKey: '',
            originZipCode: originZip,
            originCountry: originCountry.split('-')[0].trim(),
            destinationZipCode: destinationZip,
            destinationCountry: destinationCountry.split('-')[0].trim(),
            commodities,
            accessorialCodes: accessorials,
            dimensionUnits: 'in',
            weightUnits: 'LBS',
            pickupId: '0',
            stackable: 'Y',
            referenceNumber: ''
        },
        moduleCode: MODULE_BKG,
    };
};

const convertTmsRates = (
    quotes: TmsCarrierQuoteResult[],
    rateMapData: Record<string, string> | null,
    profitPercentage: number,
    rateType: string,
): TruckRateV1[] =>
    quotes
        .filter(q => !q.errorMessage)
        .map(q => {
            const charges: TruckRateV1['charges'] = [];

            const inlDapKey = rateType === 'D' ? 'DAP' : 'INL';
            const inlDapFallback = rateType === 'D' ? 'DAP - DELIVERY AT PLACE' : 'INL - INLAND FREIGHT';
            const inlDapParts = findChargeMapping(rateMapData, inlDapKey);
            const inlDapCode = inlDapParts[0] || inlDapKey;
            const inlDapName = formatChargeName(inlDapParts, inlDapFallback);
            charges.push({
                chargeCode: inlDapCode, chargeName: inlDapName,
                calculatedSellAmount: q.priceLineHaul,
                calculatedBuyAmount: getExpenseForCharges(q.priceLineHaul, profitPercentage),
                currency: 'USD',
                tariffType: '', zone: 0, countryCode: '', state: '', cityName: '',
                zipCode: '', aspect: '', rate: getExpenseForCharges(q.priceLineHaul, profitPercentage), basis: 'LS', basisDescription: 'LUMPSUM',
                minimum: 0, maximum: null, effectiveDate: '', expirationDate: '',
                scaleUom: '', from: '', to: '', notes: '', conditional: '', vat: '',
                routingPort: '', sellRate: q.priceLineHaul, truckerCode: '', trkRateId: 0,
                companyCode: '', customerCode: '', nacCode: '',
                sellBasis: 'LS', sellBasisDescription: 'LUMPSUM',
            });

            if (q.priceFuelSurcharge > 0) {
                const fueParts = findChargeMapping(rateMapData, 'FUE');
                const fueCode = fueParts[0] || 'FUE';
                const fueName = formatChargeName(fueParts, 'FUE - FUEL SURCHARGE');
                charges.push({
                    chargeCode: fueCode, chargeName: fueName,
                    calculatedSellAmount: q.priceFuelSurcharge,
                    calculatedBuyAmount: getExpenseForCharges(q.priceFuelSurcharge, profitPercentage),
                    currency: 'USD',
                    tariffType: '', zone: 0, countryCode: '', state: '', cityName: '',
                    zipCode: '', aspect: '', rate: getExpenseForCharges(q.priceFuelSurcharge, profitPercentage), basis: 'LS', basisDescription: 'LUMPSUM',
                    minimum: 0, maximum: null, effectiveDate: '', expirationDate: '',
                    scaleUom: '', from: '', to: '', notes: '', conditional: '', vat: '',
                    routingPort: '', sellRate: q.priceFuelSurcharge, truckerCode: '', trkRateId: 0,
                    companyCode: '', customerCode: '', nacCode: '',
                    sellBasis: 'LS', sellBasisDescription: 'LUMPSUM',
                });
            }

            if (q.priceAccessorials && q.priceAccessorials.length > 0) {
                let misTotal = 0;
                for (const acc of q.priceAccessorials) {
                    const accParts = findChargeMapping(rateMapData, acc.accessorialCode);
                    if (accParts.length > 0) {
                        charges.push({
                            chargeCode: accParts[0],
                            chargeName: formatChargeName(accParts, 'ADD - ADDITIONALS'),
                            calculatedSellAmount: acc.accessorialPrice,
                            calculatedBuyAmount: getExpenseForCharges(acc.accessorialPrice, profitPercentage),
                            currency: 'USD',
                            tariffType: '', zone: 0, countryCode: '', state: '', cityName: '',
                            zipCode: '', aspect: '', rate: getExpenseForCharges(acc.accessorialPrice, profitPercentage), basis: 'LS', basisDescription: 'LUMPSUM',
                            minimum: 0, maximum: null, effectiveDate: '', expirationDate: '',
                            scaleUom: '', from: '', to: '', notes: '', conditional: '', vat: '',
                            routingPort: '', sellRate: acc.accessorialPrice, truckerCode: '', trkRateId: 0,
                            companyCode: '', customerCode: '', nacCode: '',
                            sellBasis: 'LS', sellBasisDescription: 'LUMPSUM',
                        });
                    } else {
                        misTotal += Number(acc.accessorialPrice ?? 0);
                    }
                }
                if (misTotal > 0) {
                    const addParts = findChargeMapping(rateMapData, 'ADD');
                    const addCode = addParts[0] || 'ADD';
                    const addName = formatChargeName(addParts, 'ADD - ADDITIONALS');
                    charges.push({
                        chargeCode: addCode, chargeName: addName,
                        calculatedSellAmount: misTotal,
                        calculatedBuyAmount: getExpenseForCharges(misTotal, profitPercentage),
                        currency: 'USD',
                        tariffType: '', zone: 0, countryCode: '', state: '', cityName: '',
                        zipCode: '', aspect: '', rate: getExpenseForCharges(misTotal, profitPercentage), basis: 'LS', basisDescription: 'LUMPSUM',
                        minimum: 0, maximum: null, effectiveDate: '', expirationDate: '',
                        scaleUom: '', from: '', to: '', notes: '', conditional: '', vat: '',
                        routingPort: '', sellRate: misTotal, truckerCode: '', trkRateId: 0,
                        companyCode: '', customerCode: '', nacCode: '',
                        sellBasis: 'LS', sellBasisDescription: 'LUMPSUM',
                    });
                }
            }

            if (charges.length > 0 && q.pricingInstructions != null) {
                charges[charges.length - 1].notes = q.pricingInstructions;
            }
            return {
                header: {
                    carrier: q.carrierSCAC,
                    carrierName: q.carrierName,
                    carrierType: '',
                    transitTime: q.transitTime,
                    buyTotal: getExpenseForCharges(q.priceTotal, profitPercentage),
                    sellTotal: q.priceTotal,
                    buyCurrency: 'USD',
                    sellCurrency: 'USD',
                },
                charges,
            } as TruckRateV1;
        });


const CARRIER_DETAILS_RESERVED_KEYS = new Set(['SUGGEST_KEY', 'SUGGEST_CODE', 'LOCAL_SUGGEST_CODE']);

const parseCarrierDetailsResponse = (
    carrier: string,
    details: Record<string, string>,
): { truckerCode: string; truckerDetails: string } => {
    const suggestKey = details['SUGGEST_KEY'] ?? '';
    const suggestCode = details['SUGGEST_CODE'] ?? '';
    const localSuggestCode = details['LOCAL_SUGGEST_CODE'] ?? '';
    const carrierLower = carrier.toLowerCase();

    let resolvedCode = carrier;
    let detailText = '';

    if (suggestKey && suggestKey.toLowerCase().includes(carrierLower)) {
        resolvedCode = suggestKey.split('~')[1]?.trim() || carrier;
        detailText = localSuggestCode || suggestCode;
    } else {
        for (const [key, value] of Object.entries(details)) {
            if (CARRIER_DETAILS_RESERVED_KEYS.has(key)) continue;
            if (value && value.toLowerCase().includes(carrierLower)) {
                resolvedCode = key.split('~')[1]?.trim() || carrier;
                detailText = value;
                break;
            }
        }
    }

    const truckerDetails = detailText
        .split('~')
        .filter(s => s.trim().length > 0)
        .join('\n');

    return { truckerCode: resolvedCode || carrier, truckerDetails };
};

const fetchAndResolveCarrierDetails = async (
    carrierCode: string,
    carrierName: string,
): Promise<{ truckerCode: string; truckerDetails: string }> => {
    if (!carrierCode.trim()) {
        return { truckerCode: carrierName, truckerDetails: carrierName };
    }
    try {
        const response = await ApiService.post<Record<string, string>>(
            PHOENIX_ENDPOINTS.TMS.FETCH_CARRIER_DETAILS,
            { carrierCode },
        );
        const resolved = parseCarrierDetailsResponse(carrierCode, response.data);
        return {
            truckerCode: resolved.truckerCode,
            truckerDetails: resolved.truckerDetails || carrierName,
        };
    } catch (error) {
        console.error('[fetchCarrierDetails] failed, falling back to rate header:', error);
        return { truckerCode: carrierCode || carrierName, truckerDetails: carrierName };
    }
};

const DIMENSION_UNIT_MAP: Record<string, string> = {
    Inches: 'in',
    Feet: 'ft',
    Centimeters: 'cm',
    Meters: 'm',
};

const TMS_PACKAGING_TYPE_MAP: Record<string, string> = {
    Bags: 'Bags', Bales: 'Bales', Boxes: 'Box', Bundles: 'Bundle',
    Cans: 'Cans', Cartons: 'Carton', Cases: 'Case', Crates: 'Crate',
    'D-Containers': 'Case', Drums: 'Drum', IBCs: 'Totes', Jericans: 'Jerricans',
    'Lift Vans': 'Lift Van', Packages: 'Package', Pallets: 'Pallet', Pieces: 'Piece',
    Racks: 'Racks', Rolls: 'Roll', 'Shrink Wrapped Pallets': 'Pallet',
    Skids: 'Skid', Totes: 'Totes', Tubes: 'Tube', Units: 'Unit',
};

const convertPackingGroup = (group: string): string => {
    const g = group.toUpperCase();
    if (g === '0') return '0';
    if (g === 'I') return '1';
    if (g === 'II') return '2';
    if (g === 'III') return '3';
    return '';
};

export const usePickupAccordionContent = (
    externalCargoRows?: InternalCargoRowData[],
    moduleCode?: string,
    initialPickupCharges: PickupCharge[] = EMPTY_PICKUP_CHARGES,
    tmsContext?: TmsBookingContext,
    onPopulatePickupDelivery?: (data: Partial<PickupDeliveryFormData>) => void,
    onPopulateTruckerData?: (data: Partial<TruckerFormData>) => void,
    routing?: any,
    pickupId: number = 0,
    doorDeliveryFormData?: DoorDeliveryFormData,
    doorDeliveryContext?: {
        routing?: any;
        isBkgModule?: boolean;
        destinationCfsCode?: string;
        cargoRows?: CargoRow[];
    },
    onRateSelected?: () => void,
    onPickupChargesChange?: (charges: PickupCharge[]) => void,
    mainCargoRows?: CargoRowType[],
) => {
    const onPickupChargesChangeRef = useRef(onPickupChargesChange);
    useEffect(() => { onPickupChargesChangeRef.current = onPickupChargesChange; });

    const [cargoOpen, setCargoOpen] = useState(true);
    const [internalCargoRows, setInternalCargoRows] = useState<InternalCargoRowData[]>(() => [makeEmptyCargoRow()]);
    const [validationOpen, setValidationOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [pickupCharges, setPickupCharges] = useState<PickupCharge[]>(initialPickupCharges);
    const hasManualChargesRef = useRef(false);

    const [currentPickupFormData, setCurrentPickupFormData] = useState<PickupDeliveryFormData | null>(null);

    const [truckerOptionsOpen, setTruckerOptionsOpen] = useState(false);
    const [carrierOptionsOpen, setCarrierOptionsOpen] = useState(false);
    const [isModifyBooking, setIsModifyBooking] = useState(false);
    const [isFetchingRates, setIsFetchingRates] = useState(false);
    const [isFetchingDoorDeliveryRates, setIsFetchingDoorDeliveryRates] = useState(false);
    const [isFetchingAltGatewayRates, setIsFetchingAltGatewayRates] = useState(false);
    const [isFetchingDeliveryAltGatewayRates, setIsFetchingDeliveryAltGatewayRates] = useState(false);
    const [truckerRates, setTruckerRates] = useState<TruckRateV1[]>([]);
    const [truckerCity, setTruckerCity] = useState('');
    const [truckerZip, setTruckerZip] = useState('');
    const [deliveryLocationCode, setDeliveryLocationCode] = useState('');
    const [deliveryZipCode, setDeliveryZipCode] = useState('');
    const [piecesTotal, setPiecesTotal] = useState(0);
    const [weightTotal, setWeightTotal] = useState(0);
    const [volumeTotal, setVolumeTotal] = useState(0);
    const [alternateGateway, setAlternateGateway] = useState('');
    const [alternateGatewayZipCode, setAlternateGatewayZipCode] = useState('');
    const [altGatewayRates, setAltGatewayRates] = useState<TruckRateV1[]>([]);
    const [deliveryAlternateGateway, setDeliveryAlternateGateway] = useState('');
    const [deliveryAlternateGatewayZipCode, setDeliveryAlternateGatewayZipCode] = useState('');
    const [doorDeliveryRatesForModal, setDoorDeliveryRatesForModal] = useState<TruckRateV1[]>([]);
    const [deliveryAltGatewayRates, setDeliveryAltGatewayRates] = useState<TruckRateV1[]>([]);
    const [retainManualDialogOpen, setRetainManualDialogOpen] = useState(false);
    const [retainManualPayload, setRetainManualPayload] = useState<{
        newCharges: PickupCharge[];
        truckerCode: string;
        truckerDetails: string;
    } | null>(null);
    const [cargoMetrics, setCargoMetrics] = useState<CargoMetrics>({ weight: 0, cube: 0, pieces: 0 });

    const [isFetchingCarrierDetails, setIsFetchingCarrierDetails] = useState(false);
    const [isFetchingTmsQuote, setIsFetchingTmsQuote] = useState(false);
    const [carrierQuotes, setCarrierQuotes] = useState<TmsCarrierQuoteResult[]>([]);
    const [carrierOptionsFormContext, setCarrierOptionsFormContext] = useState<{
        pickupLocationCode: string;
        pickupZipCode: string;
        pickupAccessorial: string[];
        deliverToLocationCode: string;
        deliverToZipCode: string;
    }>({ pickupLocationCode: '', pickupZipCode: '', pickupAccessorial: [], deliverToLocationCode: '', deliverToZipCode: '' });
    const [tmsNotification, setTmsNotification] = useState<{ open: boolean; message: string; type: 'success' | 'error' | 'warning' }>({ open: false, message: '', type: 'success' });
    const [modifyConfirmOpen, setModifyConfirmOpen] = useState(false);
    const modifyConfirmResolverRef = useRef<((proceed: boolean) => void) | null>(null);

    const pickupFormRef = useRef<PickupDeliveryFormData | null>(null);
    const cargoRowsRef = useRef<CargoRow[]>([]);
    const liveCargoRowsRef = useRef<InternalCargoRowData[]>([makeEmptyCargoRow()]);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const fieldMapRef = useRef<Record<string, string>>({});
    const updateFieldMap = () => {
        const form = pickupFormRef.current;
        fieldMapRef.current = {
            city: form?.city ?? '',
            zipCode: form?.zipCode ?? '',
            country: form?.country ?? '',
            pickupCargoAtCode: form?.pickupCargoAtCode ?? '',
            estimatedPickupDate: form?.estimatedPickupDate
                ? (form.estimatedPickupDate instanceof Date
                    ? form.estimatedPickupDate.toISOString()
                    : String(form.estimatedPickupDate))
                : '',
        };
    };
    const { isVisible } = useFeatureToggle();

    const loginClientBean = useAppSelector(
        (state: any) => state.loginClientBean?.data
    );

    const ldapuserName = loginClientBean?.ldapUsername ?? '';

    const officeCountryCode = useAppSelector((state: any) => state.loginClientBean?.data?.countryCode ?? '');
    const isOfficeUs = officeCountryCode.toUpperCase() === 'US';
    const { data: rawAlternateGatewayOptions } = useGetSelections(alternateGatewaySelectionConfig());
    const { data: rawDeliveryAlternateGatewayOptions } = useGetSelections(deliveryAlternateGatewaySelectionConfig());
    const { data: availablePickupAccessorials } = useGetSelections(pickupACCESSORIALS);
    const { data: availableDeliveryAccessorials } = useGetSelections(DOOR_DELIVERY_ACCESSORIALS);
    const isAltGatewayToggleOn = isVisible(CommonToggleKeys.TRK_ALTERNATE_GATEWAY_SELECTION);
    const isPickupFromUS = isCountryUs(currentPickupFormData?.country ?? '');
    const isDeliveryToUS = isCountryUs(doorDeliveryFormData?.doorDeliveryCountry ?? '');
    const alternateGatewayOptions = isAltGatewayToggleOn && isPickupFromUS ? (rawAlternateGatewayOptions ?? []) : [];
    const deliveryAlternateGatewayOptions = isAltGatewayToggleOn && isDeliveryToUS ? (rawDeliveryAlternateGatewayOptions ?? []) : [];
    const isTrkRatesIntegration = isVisible(CommonToggleKeys.BKG_QUOTE_TRUCKING_RATES_INTEGRATION);
    const isPickupRatesIntegration = isVisible(CommonToggleKeys.OCN_BKG_QUOTE_PICKUP_RATES_INTEGRATION);
    const isSjuMultiPickup = isVisible(CommonToggleKeys.OCN_BKG_MULTI_PICKUP_SJU);
    const isPendingFinalOn = isVisible(CommonToggleKeys.OCEAN_FREIGHT_EMT_IMT_BOOKING_PENDING_FINAL);
    const isOcnTrkQuoteTms = isVisible(CommonToggleKeys.OCN_TRK_QUOTE_ADD_PICKUP_TMS);
    const isMultiRates = isVisible(CommonToggleKeys.OCEAN_SHOW_TMS_MULTI_RATES);
    const isOceanMultiPickup = isVisible(CommonToggleKeys.OCEAN_BKG_TRK_MULTI_PICKUP);
    const is3gTmsEnabled = isVisible(CommonToggleKeys.OCN_AIR_BKG_ARN_3G_TMS_ENABLED);
    const isIntegrationMonitoringEnabled = isVisible(CommonToggleKeys.INTEGRATION_MONITORING_ENABLE);

    const chargesMode: 'PICKUP' | 'DEFAULT' = (isTrkRatesIntegration || isPickupRatesIntegration) ? 'PICKUP' : 'DEFAULT';

    const { getToggleValue } = useFeatureToggle();

    const profitPercentage = Number(
        getToggleValue(CommonToggleKeys.TMS_PROFIT_PERCENTAGE) ?? 0
    );

    const isQuoteMode = tmsContext?.moduleType?.toUpperCase() === 'QUOTE';
    const hasShipmentId = !!tmsContext?.tmsShipmentId;

    const fetchTmsButtonLabel: FetchTmsButtonState['label'] = (() => {
        if (hasShipmentId) {
            return isOcnTrkQuoteTms && isQuoteMode ? 'Modify TMS Quote' : 'Modify TMS Booking';
        }
        return isOcnTrkQuoteTms && isQuoteMode ? 'Fetch TMS Rates' : 'Fetch Quote from TMS';
    })();

    const fetchTmsButtonState: FetchTmsButtonState = {
        show: (isTrkRatesIntegration || isPickupRatesIntegration) && tmsContext?.pickupType?.toUpperCase() === 'T',
        disabled:
            !tmsContext?.referenceNumber ||
            tmsContext?.bookingStatus?.toUpperCase() === CLOSED_STATUS_CODE ||
            (isPendingFinalOn && tmsContext?.pendingFinalBookingStatus?.toUpperCase() === 'YES'),
        loading: isFetchingTmsQuote,
        label: fetchTmsButtonLabel,
    };

    const validateWarehouse = (): string => {
        if (!tmsContext?.deliveryLocationCode?.trim()) {
            return 'Please enter a warehouse/delivery location before fetching TMS rates.';
        }
        return '';
    };

    const validateTruckingWarehouse = (): string => {
        if (!routing?.warehouse?.trim()) {
            return 'Warehouse is mandatory.';
        }
        return '';
    };

    const validateDescriptionOfGoods = (): string => {
        const shouldValidate = isOcnTrkQuoteTms && tmsContext?.pickupType?.toUpperCase() === 'T';
        if (shouldValidate) {
            const rows = mainCargoRows ?? liveCargoRowsRef.current;
            const hasDescription = rows.some(r => r.description?.trim());
            if (!hasDescription) {
                return 'Description of goods is required for TMS pickup.';
            }
        }
        return '';
    };

    const validateCargoDimensions = (): boolean => {
        if (isOcnTrkQuoteTms && tmsContext?.pickupType?.toUpperCase() === 'T') {
            const rows = mainCargoRows ?? liveCargoRowsRef.current;
            return rows.every(row =>
                row.dimRows.every(d =>
                    d.length?.trim() && d.width?.trim() && d.height?.trim() &&
                    d.pieces?.trim() && d.cbm?.trim() && d.cbf?.trim() &&
                    d.kg?.trim() && d.lbs?.trim()
                )
            );
        }
        return true;
    };

    const showTmsError = (message: string) =>
        setTmsNotification({ open: true, message, type: 'error' });

    const showTmsSuccess = (message: string) =>
        setTmsNotification({ open: true, message, type: 'success' });

    const showTmsWarning = (message: string) =>
        setTmsNotification({ open: true, message, type: 'warning' });

    const showModifyConfirmDialog = (): Promise<boolean> =>
        new Promise(resolve => {
            modifyConfirmResolverRef.current = resolve;
            setModifyConfirmOpen(true);
        });

    const handleModifyConfirmYes = () => {
        setModifyConfirmOpen(false);
        modifyConfirmResolverRef.current?.(true);
    };

    const handleModifyConfirmNo = () => {
        setModifyConfirmOpen(false);
        modifyConfirmResolverRef.current?.(false);
    };

    const buildWarehouseRequestPayload = (
        warehouseCode: string
    ) => {
        return {
            loginBean: {
                officeId: loginClientBean?.officeId ?? 0,
                siteId: loginClientBean?.siteId ?? 0,
            },
            warehouseCode,
        };
    };

    const buildRateQuoteInputBean = (destinationZipCode: string): GetRateQuoteInputBean => {
        const rows = mainCargoRows ?? liveCargoRowsRef.current;
        const firstDim = rows[0]?.dimRows[0];
        const dimensionUnits = DIMENSION_UNIT_MAP[firstDim?.unit ?? ''] ?? 'in';
        const weightUnits = dimensionUnits === 'cm' ? 'KG' : 'LBS';

        const commodities: TmsCommodityBean[] = rows.flatMap(row =>
            row.dimRows.map((dim: DimRowData, idx: number) => {
                const haz = row.hazRows[idx];

                const rawPackagingType = dim.packageType === '-1' ? '' : (dim.packageType ?? '');
                const packagingType = is3gTmsEnabled
                    ? rawPackagingType
                    : (TMS_PACKAGING_TYPE_MAP[rawPackagingType] ?? rawPackagingType);

                const rawHazardClass = haz?.imoClass ?? '';
                const hazardClass = rawHazardClass === '3.0' ? '3.1' : rawHazardClass;

            return {
                piecesTotal: parseFloat(row.pieces) || 0,
                handlingQuantity: parseFloat(row.pieces) || 0,
                    packagingType,
                length: parseFloat(dim.length ?? '0') || 0,
                width: parseFloat(dim.width ?? '0') || 0,
                height: parseFloat(dim.height ?? '0') || 0,
                    weightTotal: dimensionUnits === 'cm'
                        ? (parseFloat(dim.kg ?? '0') || 0)
                        : (parseFloat(dim.lbs ?? '0') || 0),
                    cbm: parseFloat(dim.cbm ?? '0') || 0,
                    cbf: parseFloat(dim.cbf ?? '0') || 0,
                hazardousMaterial: row.hazardous === 'Y - Yes',
                    freightClass: String(parseFloat(dim.cls ?? '0') || 0),
                nmfc: '',
                description: row.description ?? '',
                additionalMarkings: row.marks ?? '',
                unNumber: haz?.unNumber ?? '',
                    packingGroup: convertPackingGroup(haz?.pkgGroup ?? ''),
                    hazardClass,
                    hazmatEmergencyContactNumber: is3gTmsEnabled
                        ? (haz?.emergencyNumber ?? '')
                        : (haz?.emergencyContact ?? ''),
                    piecespackagingType: packagingType,
            };
            })
        );

        const pickupAcc = pickupFormRef.current?.accessorials ?? [];
        const deliveryAcc = doorDeliveryFormData?.accessorials ?? [];

        return {
            authenticationKey: '',
            originZipCode: pickupFormRef.current?.zipCode ?? '',
            originCountry: tmsContext?.countryCode ?? '',
            destinationZipCode,
            destinationCountry: tmsContext?.countryCode ?? '',
            commodities,
            accessorialCodes: [...pickupAcc, ...deliveryAcc],
            dimensionUnits,
            weightUnits,
            pickupId: '0',
            stackable: rows.every(row => row.dimRows[0]?.stackingType !== 'NS') ? 'Y' : 'N',
            referenceNumber: isIntegrationMonitoringEnabled
                ? (tmsContext?.referenceNumber ?? undefined)
                : undefined,
        };
    };

    const buildTruckerTmsPayload = (
        originZip: string,
        originCountry: string,
        destinationZip: string,
        destinationCountry: string,
        accessorials: string[],
    ): { mainBean: GetRateQuoteInputBean; moduleCode: string } => {
        const rows = mainCargoRows ?? liveCargoRowsRef.current;
        const firstDim = rows[0]?.dimRows[0];
        const dimensionUnits = DIMENSION_UNIT_MAP[firstDim?.unit ?? ''] ?? 'in';
        const weightUnits = dimensionUnits === 'cm' ? 'KG' : 'LBS';
        const commodities: TmsCommodityBean[] = rows.flatMap(row =>
            row.dimRows.map((dim: DimRowData, idx: number) => {
                const haz = row.hazRows[idx];

                const rawPackagingType = dim.packageType === '-1' ? '' : (dim.packageType ?? '');
                const packagingType = is3gTmsEnabled
                    ? rawPackagingType
                    : (TMS_PACKAGING_TYPE_MAP[rawPackagingType] ?? rawPackagingType);

                const rawHazardClass = haz?.imoClass ?? '';
                const hazardClass = rawHazardClass === '3.0' ? '3.1' : rawHazardClass;

            return {
                piecesTotal: parseFloat(row.pieces) || 0,
                handlingQuantity: parseFloat(row.pieces) || 0,
                    packagingType,
                length: parseFloat(dim.length ?? '0') || 0,
                width: parseFloat(dim.width ?? '0') || 0,
                height: parseFloat(dim.height ?? '0') || 0,
                    weightTotal: dimensionUnits === 'cm'
                        ? (parseFloat(dim.kg ?? '0') || 0)
                        : (parseFloat(dim.lbs ?? '0') || 0),
                    cbm: parseFloat(dim.cbm ?? '0') || 0,
                    cbf: parseFloat(dim.cbf ?? '0') || 0,
                    hazardousMaterial: row.hazardous === 'Y - Yes',
                    freightClass: String(parseFloat(dim.cls ?? '0') || 0),
                nmfc: '',
                description: row.description ?? '',
                additionalMarkings: row.marks ?? '',
                unNumber: haz?.unNumber ?? '',
                    packingGroup: convertPackingGroup(haz?.pkgGroup ?? ''),
                    hazardClass,
                    hazmatEmergencyContactNumber: is3gTmsEnabled
                        ? (haz?.emergencyNumber ?? '')
                        : (haz?.emergencyContact ?? ''),
                    piecespackagingType: packagingType,
            };
            })
        );
        return {
            mainBean: {
                authenticationKey: '',
                originZipCode: originZip,
                originCountry: originCountry.split('-')[0].trim(),
                destinationZipCode: destinationZip,
                destinationCountry: destinationCountry.split('-')[0].trim(),
                commodities,
                accessorialCodes: accessorials,
                dimensionUnits,
                weightUnits,
                pickupId: '0',
                stackable: rows.every(row => row.dimRows[0]?.stackingType !== 'NS') ? 'Y' : 'N',
                referenceNumber: isIntegrationMonitoringEnabled
                ? (tmsContext?.referenceNumber ?? undefined)
                : undefined,
            },
            moduleCode: MODULE_BKG,
        };
    };

    const handleFetchQuoteFromTms = async () => {
        if (hasShipmentId) {
            const proceed = await showModifyConfirmDialog();
            if (!proceed) return;
        }

        if (!validateCargoDimensions()) {
            const errors = ['Cargo dimensions are incomplete. Please fill in all dimension fields before fetching TMS rates.'];
            setValidationErrors(errors);
            setValidationOpen(true);
            return;
        }

        const warehouseError = validateWarehouse();
        if (warehouseError) { showTmsError(warehouseError); return; }

        const goodsError = validateDescriptionOfGoods();
        if (goodsError) { showTmsError(goodsError); return; }

        const cargoRows = mainCargoRows ?? liveCargoRowsRef.current;
        const cargoErrors: string[] = [];

        if (cargoRows.some(r => !r.description?.trim()))
            cargoErrors.push('Description of Goods is mandatory.');

        if (cargoRows.some(r =>
            r.dimRows.some(d =>
                !d.length?.trim() || !d.width?.trim() || !d.height?.trim() ||
                !d.pieces?.trim() || !d.cbm?.trim() || !d.cbf?.trim() ||
                !d.kg?.trim() || !d.lbs?.trim()
            )
        )) cargoErrors.push('Please enter all required cargo dimensions.');

        if (cargoErrors.length > 0) {
            setValidationErrors(cargoErrors);
            setValidationOpen(true);
            return;
        }

        setIsFetchingTmsQuote(true);

        let warehouseZipCode = '';
        const deliveryCode = (tmsContext?.deliveryLocationCode ?? '').split('-')[0].trim();
        try {
            const warehousePayload = buildWarehouseRequestPayload(deliveryCode);

            const wRes = await ApiService.post<{ success: number; result: { code: string; address5: string }; message: string }>(
                COMMON_ENDPOINTS.CARRIER_OPTIONS.GET_WAREHOUSE_DETAILS,
                warehousePayload
            );

            warehouseZipCode = wRes.data?.result?.address5 ?? '';

        } catch (e) {
            console.error('Warehouse API failed', e);
            setIsFetchingTmsQuote(false);
            return;
        }
        const payload = {
            mainBean: buildRateQuoteInputBean(warehouseZipCode),
            moduleCode: MODULE_BKG,
        };
        try {
            const qRes = await ApiService.post<TmsCarrierQuoteResult[]>(
                PHOENIX_ENDPOINTS.TMS.GET_TMS_RATE_QUOTE,
                payload
            );

            const results = qRes.data;

            if (!results || results.length === 0) {
                showTmsError('No TMS rates found for this shipment.');
                setIsFetchingTmsQuote(false);
                return;
            }
            if (results[0]?.errorMessage) {
                showTmsError(results[0].errorMessage);
                setIsFetchingTmsQuote(false);
                return;
            }

            setCarrierOptionsFormContext({
                pickupLocationCode: pickupFormRef.current?.pickupCargoAtCode ?? '',
                pickupZipCode: pickupFormRef.current?.zipCode ?? '',
                pickupAccessorial: pickupFormRef.current?.accessorials ?? [],
                deliverToLocationCode: deliveryCode ?? '',
                deliverToZipCode: warehouseZipCode,
            });
            setCarrierQuotes(results);
            setCarrierOptionsOpen(true);
        } catch {
            setIsFetchingTmsQuote(false);
            return;
        }

        setIsFetchingTmsQuote(false);
    };

    const handleRefreshOptions = async (params: RefreshOptionsParams): Promise<RefreshOptionsResult | null> => {
        const makeApiCall = async (destinationZipCode: string): Promise<CarrierQuote[] | null> => {
            const baseBean = buildRateQuoteInputBean(destinationZipCode);
            const payload = {
                mainBean: {
                    ...baseBean,
                    originZipCode: params.pickupZipCode,
                    accessorialCodes: params.accessorialCodes,
                },
                moduleCode: MODULE_BKG,
            };
            try {
                const qRes = await ApiService.post<TmsCarrierQuoteResult[]>(
                    PHOENIX_ENDPOINTS.TMS.GET_TMS_RATE_QUOTE,
                    payload
                );
                const results = qRes.data;
                if (!results || results.length === 0) return null;
                if (results[0]?.errorMessage) return null;
                return results as unknown as CarrierQuote[];
            } catch {
                return null;
            }
        };

        const [mainQuotes, altQuotes] = await Promise.all([
            makeApiCall(params.deliverToZipCode),
            params.alternateGatewayZipCode
                ? makeApiCall(params.alternateGatewayZipCode)
                : Promise.resolve(null),
        ]);

        if (!mainQuotes) return null;

        const result: RefreshOptionsResult = { mainQuotes };
        if (altQuotes && altQuotes.length > 0) {
            result.altGatewayQuotes = altQuotes;
        }

        return result;
    };

    const canAutoFetch = (): boolean => {
        const form = pickupFormRef.current;
        if (!form?.estimatedPickupDate) return false;
        if (!form?.pickupCargoAtCode?.trim()) return false;
        const totalKg = cargoRowsRef.current.reduce((sum, r) => sum + parseFloat(r.kg || '0'), 0);
        return totalKg > 0;
    };

    const doFetchRates = async () => {
        const rateMapDatas = await getOrFetchRateMapData();


        updateFieldMap();
        const form = pickupFormRef.current;
        const rows = mainCargoRows ?? liveCargoRowsRef.current;

        setTruckerCity(form?.city ?? '');
        setTruckerZip(form?.zipCode ?? '');
        setDeliveryZipCode('');
        setDeliveryLocationCode('');

        const pieces = rows.reduce((s, r) => s + (parseFloat(r.pieces) || 0), 0);
        const weight = rows.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0);
        const volume = rows.reduce((s, r) => s + (parseFloat(r.cbm) || 0), 0);
        setPiecesTotal(pieces);
        setWeightTotal(weight);
        setVolumeTotal(volume);

        setTruckerRates([]);
        setIsFetchingRates(true);
        setTruckerOptionsOpen(true);

        const wareHouseCode = routing?.warehouse?.split('-')?.[0]?.trim() || '';
        const isPickupUS = isCountryUs(form?.country ?? '');

        try {
            let warehousePostCode = '';
            let warehouseCity = '';
            let warehouseCountryCode = '';
            let warehouseUnCode = '';

            if (wareHouseCode) {
                try {
                    const wRes = await ApiService.post<{ result: WarehouseDetailsBean }>(
                        COMMON_ENDPOINTS.CARRIER_OPTIONS.GET_WAREHOUSE_DETAILS_BY_CODE,
                        { warehouseCode: wareHouseCode },
                    );
                    const wb = wRes.data?.result;
                    warehousePostCode = wb?.address5 ?? '';
                    warehouseCity = wb?.name ?? '';
                    warehouseCountryCode = wb?.countryCode ?? '';
                    warehouseUnCode = wb?.unLocationCode ?? '';
                } catch (e) {
                    console.error('Failed to fetch warehouse details for delivery location', e);
                }
            }
            if (!warehouseCity) {
                warehouseCity = routing?.warehouseName ?? '';
            }
            setDeliveryZipCode(warehousePostCode);
            setDeliveryLocationCode(warehouseCity);

            // API 3: Build commodity list from cargo rows (one entry per dim row)
            const commodities: CommodityPayload[] = rows.map(r => {
                const dim = r.dimRows[0] ?? { length: '0', width: '0', height: '0', pieces: '0' };
                const haz = r.hazRows[0];
                return {
                    pieces: parseFloat(r.pieces) || 0,
                    length: parseFloat(dim.length) || 0,
                    width: parseFloat(dim.width) || 0,
                    height: parseFloat(dim.height) || 0,
                    dimensionUnits: 'cm',
                    cbm: parseFloat(r.cbm) || 0,
                    cbf: parseFloat(r.cbf) || 0,
                    kg: parseFloat(r.kg) || 0,
                    lbs: parseFloat(r.lbs) || 0,
                    description: r.description ?? '',
                    freightClass: '',
                    hazardClass: haz?.imoClass ?? '',
                    unNumber: haz?.unNumber ?? '',
                    packingGroup: haz?.pkgGroup ?? '',
                    additionalMarkings: '',
                    packagingType: r.packaging ?? '',
                };
            });

            const tentativeDate = formatTentativeDate(form?.estimatedPickupDate);

            // if (moduleCode === MODULE_BKG && isPickupUS && isOfficeUs) {
            //     setTruckerRates([]);
            //     setTruckerOptionsOpen(true);
            //     return;
            // }

            if (isPickupUS) {
                // TMS path 
                const payload = buildTruckerTmsPayload(
                    form?.zipCode ?? '',
                    form?.country?.split('-')?.[0]?.trim() ?? '',
                    warehousePostCode,
                    warehouseCountryCode,
                    form?.accessorials ?? [],
                );
                const response = await ApiService.post<TmsCarrierQuoteResult[]>(
                    PHOENIX_ENDPOINTS.TMS.GET_TMS_RATE_QUOTE,
                    payload,
                );
                setTruckerRates(convertTmsRates(response.data ?? [], rateMapDatas, profitPercentage, 'P'));
            } else {
                // Non-TMS path
                const request: TruckRateRequestBean = {
                    truckRateSearchRequest: {
                        requestedBy: 'OCEAN',
                        rateType: 'P',
                        officeCode: loginClientBean?.officeCode ?? '',
                        truckSellProfileCode: '',
                        namedAccountCode: '',
                        originCity: form?.city ?? '',
                        originZipCode: form?.zipCode ?? '',
                        originCountryCode: form?.country?.split('-')?.[0]?.trim() ?? '',
                        originUnlocation: '',
                        destinationZipCode: warehousePostCode,
                        destinationCity: warehouseCity,
                        destinationCountryCode: warehouseCountryCode,
                        destUnlocation: warehouseUnCode,
                        tentativeDate,
                        uom: 'M',
                        packagingType: '',
                        shipmentType: 'LTL',
                        piecesTotal: pieces,
                        weightTotal: weight,
                        volumeTotal: volume,
                        hazardousMaterial: rows.some(r => r.hazardous === 'Y'),
                        commodities,
                        accessorialCodes: form?.accessorials ?? [],
                        stackable: 'Y',
                        scaleRate: '',
                        truckerResponseFileId: 0,
                    },
                    lDapUsername: ldapuserName,
                };
                const response = await ApiService.post<FetchTruckRatesResponse>(
                    API_ENDPOINTS.CARRIER_OPTIONS.FETCH_TRUCK_RATES,
                    request,
                );
                setTruckerRates(response.data?.result?.result?.rates ?? []);
            }

        } catch (e) {
            console.error('Failed to fetch truck rates', e);
        } finally {
            setIsFetchingRates(false);
        }
    };

    const doFetchRatesDRDR = async () => {
        updateFieldMap();
        const form = pickupFormRef.current;
        const rows = liveCargoRowsRef.current;
        const dd = doorDeliveryFormData;

        const rateMapDatas = await getOrFetchRateMapData();

        setTruckerCity(form?.city ?? '');
        setTruckerZip(form?.zipCode ?? '');
        setDeliveryLocationCode('');
        setDeliveryZipCode('');

        const pieces = rows.reduce((s, r) => s + (parseFloat(r.pieces) || 0), 0);
        const weight = rows.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0);
        const volume = rows.reduce((s, r) => s + (parseFloat(r.cbm) || 0), 0);
        setPiecesTotal(pieces);
        setWeightTotal(weight);
        setVolumeTotal(volume);

        setTruckerRates([]);
        setDoorDeliveryRatesForModal([]);
        setIsFetchingRates(true);
        setIsFetchingDoorDeliveryRates(true);
        setTruckerOptionsOpen(true);

        try {
            // API 2: Fetch origin warehouse (pickup/CFS)
            let warehousePostCode = '';
            let warehouseCity = '';
            let warehouseCountryCode = '';
            let warehouseUnCode = '';

            const wareHouseCode = routing?.warehouse?.split('-')?.[0]?.trim() || '';
            if (wareHouseCode) {
                try {
                    const wRes = await ApiService.post<{ result: WarehouseDetailsBean }>(
                        COMMON_ENDPOINTS.CARRIER_OPTIONS.GET_WAREHOUSE_DETAILS_BY_CODE,
                        { warehouseCode: wareHouseCode },
                    );
                    const wb = wRes.data?.result;
                    warehousePostCode = wb?.address5 ?? '';
                    warehouseCity = wb?.name ?? '';
                    warehouseCountryCode = wb?.countryCode ?? '';
                    warehouseUnCode = wb?.unLocationCode ?? '';
                } catch (e) {
                    console.error('Failed to fetch warehouse details for delivery location', e);
                }
            }
            if (!warehouseCity) {
                warehouseCity = routing?.warehouseName ?? '';
            }
            setDeliveryZipCode(warehousePostCode);
            setDeliveryLocationCode(warehouseCity);

            const commodities: CommodityPayload[] = rows.map(r => {
                const dim = r.dimRows[0] ?? { length: '0', width: '0', height: '0', pieces: '0' };
                const haz = r.hazRows[0];
                return {
                    pieces: parseFloat(r.pieces) || 0,
                    length: parseFloat(dim.length) || 0,
                    width: parseFloat(dim.width) || 0,
                    height: parseFloat(dim.height) || 0,
                    dimensionUnits: 'cm',
                    cbm: parseFloat(r.cbm) || 0,
                    cbf: parseFloat(r.cbf) || 0,
                    kg: parseFloat(r.kg) || 0,
                    lbs: parseFloat(r.lbs) || 0,
                    description: r.description ?? '',
                    freightClass: '',
                    hazardClass: haz?.imoClass ?? '',
                    unNumber: haz?.unNumber ?? '',
                    packingGroup: haz?.pkgGroup ?? '',
                    additionalMarkings: '',
                    packagingType: r.packaging ?? '',
                };
            });

            const tentativePickupDate = formatTentativeDate(form?.estimatedPickupDate);
            const tentativeDeliveryDate = formatTentativeDate(dd?.estimatedDeliveryDate);

            const isHazardous = rows.some(r => r.hazardous === 'Y');
            const isPickupUS = isCountryUs(form?.country ?? '');
            const isDeliveryUS = isCountryUs(dd?.doorDeliveryCountry ?? '');

            const skipPickupFetch = moduleCode === MODULE_BKG && isPickupUS && isOfficeUs;

            const pickupRequest: TruckRateRequestBean = {
                truckRateSearchRequest: {
                    requestedBy: 'OCEAN',
                    rateType: 'P',
                    officeCode: loginClientBean?.officeCode ?? '',
                    truckSellProfileCode: '',
                    namedAccountCode: '',
                    originCity: form?.city ?? '',
                    originZipCode: form?.zipCode ?? '',
                    originCountryCode: form?.country?.split('-')?.[0]?.trim() ?? '',
                    originUnlocation: '',
                    destinationCity: warehouseCity,
                    destinationZipCode: warehousePostCode,
                    destinationCountryCode: warehouseCountryCode,
                    destUnlocation: warehouseUnCode,
                    tentativeDate: tentativePickupDate,
                    uom: 'M',
                    packagingType: '',
                    shipmentType: 'LTL',
                    piecesTotal: pieces,
                    weightTotal: weight,
                    volumeTotal: volume,
                    hazardousMaterial: isHazardous,
                    commodities,
                    accessorialCodes: form?.accessorials ?? [],
                    stackable: 'Y',
                    scaleRate: '',
                    truckerResponseFileId: 0,
                },
                lDapUsername: ldapuserName,
            };

            const fetchDeliveryRates = async (): Promise<TruckRateV1[]> => {
                let originCity = '';
                let originZipCode = '';
                let originCountryCode = '';
                let originUnlocation = '';

                const destCfsCode = (doorDeliveryContext?.routing?.destinationWarehouse || '')
                    .split(' - ')[0]
                    .trim()
                    || doorDeliveryContext?.routing?.destinationCfsCode
                    || '';
                if (destCfsCode) {
                    try {
                        const dwRes = await ApiService.post<{ result: WarehouseDetailsBean }>(
                            COMMON_ENDPOINTS.CARRIER_OPTIONS.GET_WAREHOUSE_DETAILS_BY_CODE,
                            { warehouseCode: destCfsCode }
                        );
                        const dw = dwRes.data?.result;
                        originCity = dw?.name ?? '';
                        originZipCode = dw?.address5 ?? '';
                        originCountryCode = dw?.countryCode ?? '';
                        originUnlocation = dw?.unLocationCode ?? '';
                    } catch (e) {
                        console.error('Failed to fetch warehouse details for destination CFS', e);
                    }
                }

                const deliveryRequest: TruckRateRequestBean = {
                    truckRateSearchRequest: {
                        requestedBy: 'OCEAN',
                        rateType: 'D',
                        officeCode: loginClientBean?.officeCode ?? '',
                        truckSellProfileCode: '',
                        namedAccountCode: '',
                        originCity,
                        originZipCode,
                        originCountryCode,
                        originUnlocation,
                        destinationCity: dd?.doorDeliveryCity ?? '',
                        destinationZipCode: dd?.doorDeliveryZipCode ?? '',
                        destinationCountryCode: dd?.doorDeliveryCountry ?? '',
                        destUnlocation: '',
                        tentativeDate: tentativeDeliveryDate,
                        uom: 'M',
                        packagingType: '',
                        shipmentType: 'LTL',
                        piecesTotal: pieces,
                        weightTotal: weight,
                        volumeTotal: volume,
                        hazardousMaterial: isHazardous,
                        commodities,
                        accessorialCodes: dd?.accessorials ?? [],
                        stackable: dd?.stackable ? 'Y' : 'N',
                        scaleRate: '',
                        truckerResponseFileId: 0,
                    },
                    lDapUsername: ldapuserName,
                };
                if (isDeliveryUS) {
                    const payload = buildTruckerTmsPayload(
                        originZipCode,
                        originCountryCode,
                        dd?.doorDeliveryZipCode ?? '',
                        dd?.doorDeliveryCountry ?? '',
                        dd?.accessorials ?? [],
                    );
                    const resp = await ApiService.post<TmsCarrierQuoteResult[]>(
                        PHOENIX_ENDPOINTS.TMS.GET_TMS_RATE_QUOTE,
                        payload,
                    );
                    return convertTmsRates(resp.data ?? [], rateMapDatas, profitPercentage, 'D');
                } else {
                    const resp = await ApiService.post<FetchTruckRatesResponse>(
                        API_ENDPOINTS.CARRIER_OPTIONS.FETCH_TRUCK_RATES,
                        deliveryRequest,
                    );
                    return resp.data?.result?.result?.rates ?? [];
                }
            };


            const pickupCall = skipPickupFetch
                ? Promise.resolve([] as TruckRateV1[])
                : isPickupUS
                    ? ApiService.post<TmsCarrierQuoteResult[]>(
                        PHOENIX_ENDPOINTS.TMS.GET_TMS_RATE_QUOTE,
                        buildTruckerTmsPayload(
                            form?.zipCode ?? '',
                            form?.country?.split('-')?.[0]?.trim() ?? '',
                            warehousePostCode,
                            warehouseCountryCode,
                            form?.accessorials ?? [],
                        ),
                    ).then(r => convertTmsRates(r.data ?? [], rateMapDatas, profitPercentage, 'P'))
                    : ApiService.post<FetchTruckRatesResponse>(
                        API_ENDPOINTS.CARRIER_OPTIONS.FETCH_TRUCK_RATES,
                        pickupRequest,
                    ).then(r => r.data?.result?.result?.rates ?? []);
            const pickupDone = pickupCall
                .then(rates => { setTruckerRates(rates); })
                .catch((e) => { console.error('Failed to fetch pickup truck rates', e); })
                .finally(() => { setIsFetchingRates(false); });
            const deliveryDone = fetchDeliveryRates()
                .then(rates => { setDoorDeliveryRatesForModal(rates); })
                .catch((e) => { console.error('Failed to fetch door delivery rates', e); })
                .finally(() => { setIsFetchingDoorDeliveryRates(false); });
            await Promise.all([pickupDone, deliveryDone]);
        } catch {
            setIsFetchingRates(false);
            setIsFetchingDoorDeliveryRates(false);
        }
    };

    const handleRefreshRates = async () => {
        const rateMapDatas = await getOrFetchRateMapData();
        if (!alternateGateway.trim()) return;
        const altCode = alternateGateway.split('~')[0].trim();
        const zipFallback = alternateGateway.split('~')[2]?.trim() ?? '';
        const zipOverride = alternateGatewayZipCode.trim() || zipFallback;

        setIsFetchingAltGatewayRates(true);
        try {
            const form = pickupFormRef.current;
            const rows = liveCargoRowsRef.current;
            const pieces = rows.reduce((s, r) => s + (parseFloat(r.pieces) || 0), 0);
            const weight = rows.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0);
            const volume = rows.reduce((s, r) => s + (parseFloat(r.cbm) || 0), 0);

            let altCity = '';
            let altCountryCode = '';
            let altUnCode = '';
            try {
                const wRes = await ApiService.post<{ result: WarehouseDetailsBean }>(
                    COMMON_ENDPOINTS.CARRIER_OPTIONS.GET_WAREHOUSE_DETAILS_BY_CODE,
                    { warehouseCode: altCode }
                );
                const wb = wRes.data?.result;
                altCity = wb?.name ?? '';
                altCountryCode = wb?.countryCode ?? '';
                altUnCode = wb?.unLocationCode ?? '';
            } catch (e) {
                console.error('Failed to fetch warehouse details for alternate gateway', e);
            }

            const commodities: CommodityPayload[] = rows.map(r => {
                const dim = r.dimRows[0] ?? { length: '0', width: '0', height: '0', pieces: '0' };
                const haz = r.hazRows[0];
                return {
                    pieces: parseFloat(r.pieces) || 0,
                    length: parseFloat(dim.length) || 0,
                    width: parseFloat(dim.width) || 0,
                    height: parseFloat(dim.height) || 0,
                    dimensionUnits: 'cm',
                    cbm: parseFloat(r.cbm) || 0,
                    cbf: parseFloat(r.cbf) || 0,
                    kg: parseFloat(r.kg) || 0,
                    lbs: parseFloat(r.lbs) || 0,
                    description: r.description ?? '',
                    freightClass: '',
                    hazardClass: haz?.imoClass ?? '',
                    unNumber: haz?.unNumber ?? '',
                    packingGroup: haz?.pkgGroup ?? '',
                    additionalMarkings: '',
                    packagingType: r.packaging ?? '',
                };
            });

            const tentativeDate = formatTentativeDate(form?.estimatedPickupDate);

            const isPickupUS = isCountryUs(form?.country ?? '');

            if (isPickupUS) {
                // TMS path — alternate gateway as destination
                const payload = buildTruckerTmsPayload(
                    form?.zipCode ?? '',
                    form?.country?.split('-')?.[0]?.trim() ?? '',
                    zipOverride,
                    altCountryCode,
                    form?.accessorials ?? [],
                );
                const response = await ApiService.post<TmsCarrierQuoteResult[]>(
                    PHOENIX_ENDPOINTS.TMS.GET_TMS_RATE_QUOTE,
                    payload,
                );
                const newRates = convertTmsRates(response.data ?? [], rateMapDatas, profitPercentage, 'P');
                setAltGatewayRates(newRates);
            } else {
                // Non-TMS path — alternate gateway as destination
                const tentativeDate = formatTentativeDate(form?.estimatedPickupDate);

                const altRequest: TruckRateRequestBean = {
                    truckRateSearchRequest: {
                        requestedBy: 'OCEAN',
                        rateType: 'P',
                        officeCode: loginClientBean?.officeCode ?? '',
                        truckSellProfileCode: '',
                        namedAccountCode: '',
                        originCity: form?.city ?? '',
                        originZipCode: form?.zipCode ?? '',
                        originCountryCode: form?.country?.split('-')?.[0]?.trim() ?? '',
                        originUnlocation: '',
                        destinationZipCode: zipOverride,
                        destinationCity: altCity,
                        destinationCountryCode: altCountryCode,
                        destUnlocation: altUnCode,
                        tentativeDate,
                        uom: 'M',
                        packagingType: '',
                        shipmentType: 'LTL',
                        piecesTotal: pieces,
                        weightTotal: weight,
                        volumeTotal: volume,
                        hazardousMaterial: rows.some(r => r.hazardous === 'Y'),
                        commodities,
                        accessorialCodes: form?.accessorials ?? [],
                        stackable: 'Y',
                        scaleRate: '',
                        truckerResponseFileId: 0,
                    },
                    lDapUsername: ldapuserName,
                };
                const altResponse = await ApiService.post<FetchTruckRatesResponse>(
                    API_ENDPOINTS.CARRIER_OPTIONS.FETCH_TRUCK_RATES,
                    altRequest,
                );
                setAltGatewayRates(altResponse.data?.result?.result?.rates ?? []);
            }
        } catch (e) {
            console.error('Failed to refresh alternate gateway rates', e);
        } finally {
            setIsFetchingAltGatewayRates(false);
        }
    };

    const handleRefreshDoorDeliveryRates = async () => {
        const rateMapDatas = await getOrFetchRateMapData();
        if (!deliveryAlternateGateway.trim()) return;
        const altCode = deliveryAlternateGateway.split('~')[0].trim();
        const zipFallback = deliveryAlternateGateway.split('~')[2]?.trim() ?? '';
        const zipOverride = deliveryAlternateGatewayZipCode.trim() || zipFallback;

        const dd = doorDeliveryFormData;
        const rows = liveCargoRowsRef.current;
        const pieces = rows.reduce((s, r) => s + (parseFloat(r.pieces) || 0), 0);
        const weight = rows.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0);
        const volume = rows.reduce((s, r) => s + (parseFloat(r.cbm) || 0), 0);

        const isDeliveryUS = isCountryUs(dd?.doorDeliveryCountry ?? '');
        const tentativeDeliveryDate = formatTentativeDate(dd?.estimatedDeliveryDate);
        const isHazardous = rows.some(r => r.hazardous === 'Y');

        setIsFetchingDeliveryAltGatewayRates(true);
        try {
            let altCity = '';
            let altCountryCode = '';
            let altUnCode = '';
            try {
                const wRes = await ApiService.post<{ result: WarehouseDetailsBean }>(
                    COMMON_ENDPOINTS.CARRIER_OPTIONS.GET_WAREHOUSE_DETAILS_BY_CODE,
                    { warehouseCode: altCode },
                );
                const wb = wRes.data?.result;
                altCity = wb?.address2 ?? '';
                altCountryCode = wb?.countryCode ?? '';
                altUnCode = wb?.unLocationCode ?? '';
            } catch (e) {
                console.error('Failed to fetch warehouse details for alternate gateway', e);
            }

            const commodities: CommodityPayload[] = rows.map(r => {
                const dim = r.dimRows[0] ?? { length: '0', width: '0', height: '0', pieces: '0' };
                const haz = r.hazRows[0];
                return {
                    pieces: parseFloat(r.pieces) || 0,
                    length: parseFloat(dim.length) || 0,
                    width: parseFloat(dim.width) || 0,
                    height: parseFloat(dim.height) || 0,
                    dimensionUnits: 'cm',
                    cbm: parseFloat(r.cbm) || 0,
                    cbf: parseFloat(r.cbf) || 0,
                    kg: parseFloat(r.kg) || 0,
                    lbs: parseFloat(r.lbs) || 0,
                    description: r.description ?? '',
                    freightClass: '',
                    hazardClass: haz?.imoClass ?? '',
                    unNumber: haz?.unNumber ?? '',
                    packingGroup: haz?.pkgGroup ?? '',
                    additionalMarkings: '',
                    packagingType: r.packaging ?? '',
                };
            });

            if (isDeliveryUS) {
                const payload = buildTruckerTmsPayload(
                    zipOverride,
                    altCountryCode,
                    dd?.doorDeliveryZipCode ?? '',
                    dd?.doorDeliveryCountry ?? '',
                    dd?.accessorials ?? [],
                );
                const resp = await ApiService.post<TmsCarrierQuoteResult[]>(
                    PHOENIX_ENDPOINTS.TMS.GET_TMS_RATE_QUOTE,
                    payload,
                );
                setDeliveryAltGatewayRates(convertTmsRates(resp.data ?? [], rateMapDatas, profitPercentage, 'D'));
            } else {
                const deliveryRequest: TruckRateRequestBean = {
                    truckRateSearchRequest: {
                        requestedBy: 'OCEAN',
                        rateType: 'D',
                        officeCode: loginClientBean?.officeCode ?? '',
                        truckSellProfileCode: '',
                        namedAccountCode: '',
                        originCity: altCity,
                        originZipCode: zipOverride,
                        originCountryCode: altCountryCode,
                        originUnlocation: altUnCode,
                        destinationCity: dd?.doorDeliveryCity ?? '',
                        destinationZipCode: dd?.doorDeliveryZipCode ?? '',
                        destinationCountryCode: dd?.doorDeliveryCountry ?? '',
                        destUnlocation: '',
                        tentativeDate: tentativeDeliveryDate,
                        uom: 'M',
                        packagingType: '',
                        shipmentType: 'LTL',
                        piecesTotal: pieces,
                        weightTotal: weight,
                        volumeTotal: volume,
                        hazardousMaterial: isHazardous,
                        commodities,
                        accessorialCodes: dd?.accessorials ?? [],
                        stackable: dd?.stackable ? 'Y' : 'N',
                        scaleRate: '',
                        truckerResponseFileId: 0,
                    },
                    lDapUsername: ldapuserName,
                };
                const resp = await ApiService.post<FetchTruckRatesResponse>(
                    API_ENDPOINTS.CARRIER_OPTIONS.FETCH_TRUCK_RATES,
                    deliveryRequest,
                );
                setDeliveryAltGatewayRates(resp.data?.result?.result?.rates ?? []);
            }
        } catch (e) {
            console.error('Failed to refresh delivery alternate gateway rates', e);
        } finally {
            setIsFetchingDeliveryAltGatewayRates(false);
        }
    };

    const triggerAutoFetch = () => {
        if (!TRUCK_BOOKING_AUTO_FETCH_RATES) return;
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(() => {
            if (canAutoFetch()) doFetchRates();
        }, 600);
    };

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, []);

    useEffect(() => {
        if (externalCargoRows && externalCargoRows.length > 0) {
            setInternalCargoRows(externalCargoRows);
        }
    }, [externalCargoRows]);

    const prevPickupChargesRef = useRef<PickupCharge[]>(initialPickupCharges);
    useEffect(() => {
        if (prevPickupChargesRef.current === initialPickupCharges) return;
        prevPickupChargesRef.current = initialPickupCharges;
        if (initialPickupCharges.length > 0) {
            hasManualChargesRef.current = false;
            setPickupCharges(initialPickupCharges);
            onPickupChargesChangeRef.current?.(initialPickupCharges);
        } else if (!hasManualChargesRef.current) {
            setPickupCharges(initialPickupCharges);
        }
    }, [initialPickupCharges]);

    useEffect(() => {
        cargoRowsRef.current = internalCargoRows as CargoRow[];
        // triggerAutoFetch();
    }, [internalCargoRows]);

    const handleCargoRowsChange = (rows: unknown[]) => {
        liveCargoRowsRef.current = rows as InternalCargoRowData[];
        const live = rows as InternalCargoRowData[];
        setCargoMetrics({
            weight: live.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0),
            cube: live.reduce((s, r) => s + (parseFloat(r.cbm) || 0), 0),
            pieces: live.reduce((s, r) => s + (parseFloat(r.pieces) || 0), 0),
        });
    };

    const handleSelectRate = async (rate: TruckRateV1) => {
        const newCharges: PickupCharge[] = rate.charges.map((c, i) => ({
            id: i + 1,
            chargeDescription: c.chargeName || c.chargeCode,
            expenseCurrency: rate.header.buyCurrency || c.currency,
            expense: c.calculatedBuyAmount,
            incomeCurrency: rate.header.sellCurrency || c.currency,
            income: c.calculatedSellAmount,
            flag: 'TRK' as const,
            pickupId,
            notes: c.notes || '',
        }));

        let truckerCode = rate.header.carrier || rate.header.carrierName;
        let truckerDetails = rate.header.carrierName;

        const isPickupUS = isCountryUs(pickupFormRef.current?.country ?? '');
        if (!isPickupUS) {
            setIsFetchingCarrierDetails(true);
            try {
                const resolved = await fetchAndResolveCarrierDetails(rate.header.carrier, rate.header.carrierName);
                truckerCode = resolved.truckerCode;
                truckerDetails = resolved.truckerDetails;
            } finally {
                setIsFetchingCarrierDetails(false);
            }
        }

        const manualRows = pickupCharges.filter(c => c.flag === 'MANUAL');
        if (manualRows.length > 0) {
            setRetainManualPayload({ newCharges, truckerCode, truckerDetails });
            setRetainManualDialogOpen(true);
        } else {
            setPickupCharges(newCharges);
            hasManualChargesRef.current = true;
            onPopulateTruckerData?.({ truckerCode, truckerDetails });
            onPickupChargesChangeRef.current?.(newCharges);
            onRateSelected?.();
            setTruckerOptionsOpen(false);
        }
    };

    const handleRetainManualYes = () => {
        if (!retainManualPayload) return;
        const manualRows = pickupCharges.filter(c => c.flag === 'MANUAL');
        const merged = [...manualRows, ...retainManualPayload.newCharges];
        setPickupCharges(merged);
        hasManualChargesRef.current = true;
        onPopulateTruckerData?.({ truckerCode: retainManualPayload.truckerCode, truckerDetails: retainManualPayload.truckerDetails });
        onPickupChargesChangeRef.current?.(merged);
        onRateSelected?.();
        setRetainManualDialogOpen(false);
        setRetainManualPayload(null);
        setTruckerOptionsOpen(false);
    };

    const handleRetainManualNo = () => {
        if (!retainManualPayload) return;
        const newCharges = retainManualPayload.newCharges;
        setPickupCharges(newCharges);
        hasManualChargesRef.current = true;
        onPopulateTruckerData?.({ truckerCode: retainManualPayload.truckerCode, truckerDetails: retainManualPayload.truckerDetails });
        onPickupChargesChangeRef.current?.(newCharges);
        onRateSelected?.();
        setRetainManualDialogOpen(false);
        setRetainManualPayload(null);
        setTruckerOptionsOpen(false);
    };

    const handleFetchTruckRates = async () => {
        const hasDoorDelivery = !!doorDeliveryFormData;

        const terms: 'DRCF' | 'DRDR' = hasDoorDelivery ? 'DRDR' : 'DRCF';

        const errors: string[] = [];
        const form = pickupFormRef.current;
        const cargoRows = mainCargoRows ?? liveCargoRowsRef.current;

        await fetchRateMapping();

        if (terms === 'DRDR') {
            const dd = doorDeliveryFormData;

            errors.push(...showError(dd, doorDeliveryContext));

        }

        if (cargoRows.some(r => !r.description?.trim())) errors.push('Description of Goods is mandatory.');
        if (cargoRows.some(r => r.dimRows.some(d => !d.length?.trim() || !d.width?.trim() || !d.height?.trim() || !d.pieces?.trim() || !d.cbm?.trim() || !d.cbf?.trim() || !d.kg?.trim() || !d.lbs?.trim()))) errors.push('Please enter all required cargo dimensions.');

        const sjuRelaxed = isSjuMultiPickup && moduleCode === MODULE_BKG;
        if (!sjuRelaxed) {
            if (!form?.estimatedPickupDate) errors.push('Pickup Details Estimated Pickup Date is mandatory.');
            if (!form?.city?.trim()) errors.push('Pickup Details City is mandatory.');
            if (!form?.zipCode?.trim()) errors.push('Pickup Details Zip Code is mandatory.');
            if (!form?.country?.trim()) errors.push('Pickup Details Country is mandatory.');
            if (form?.estimatedPickupDate && routing?.etd) {
                if (new Date(form.estimatedPickupDate) > new Date(routing.etd))
                    errors.push('Estimated Pickup Date must not be after the Estimated Departure Date.');
            } else if (form?.estimatedPickupDate && routing?.ets) {
                if (new Date(form.estimatedPickupDate) > new Date(routing.ets))
                    errors.push('Estimated Pickup Date must not be after the Estimated Time of Sailing.');
            }
        }

        // Step 3: Warehouse (always — GWT validateWarehouse() reads Routing Details warehouse field)
        const warehouseError = validateTruckingWarehouse();
        if (warehouseError) errors.push(warehouseError);

        if (errors.length > 0) {
            setValidationErrors(errors);
            setValidationOpen(true);
            return;
        }

        if (terms === 'DRDR') {
            doFetchRatesDRDR();
        } else {
            doFetchRates();
        }
    };

    const handlePickupFormDataChange = (
        data: PickupDeliveryFormData,
        onHeaderDataChange: (data: HeaderData) => void,
    ) => {
        const prev = pickupFormRef.current;
        pickupFormRef.current = data;
        setCurrentPickupFormData(data);
        onHeaderDataChange({
            estimatedPickupDate: data.estimatedPickupDate,
            city: data.city,
            zipCode: data.zipCode,
        });
    };

    const handleTogglePickupAccessorial = (code: string) => {
        setCurrentPickupFormData(prev => {
            if (!prev) return prev;
            const current = prev.accessorials ?? [];
            const updated = current.includes(code)
                ? current.filter(c => c !== code)
                : [...current, code];
            const next = { ...prev, accessorials: updated };
            pickupFormRef.current = next;
            return next;
        });
    };

    const handleChargeChange = (index: number, field: keyof PickupCharge, value: string | number) => {
        hasManualChargesRef.current = true;
        setPickupCharges(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleAddCharge = () => {
        hasManualChargesRef.current = true;
        setPickupCharges(prev => {
            const maxId = prev.length > 0 ? Math.max(...prev.map(c => c.id)) : 0;
            return [
                ...prev,
                {
                    id: maxId + 1,
                    chargeDescription: '',
                    expenseCurrency: 'USD',
                    expense: 0,
                    incomeCurrency: 'USD',
                    income: 0,
                },
            ];
        });
    };

    const handleRemoveCharge = (index: number) => {
        hasManualChargesRef.current = true;
        setPickupCharges(prev => prev.filter((_, i) => i !== index));
    };

    return {
        cargoOpen,
        setCargoOpen,
        internalCargoRows,
        validationOpen,
        setValidationOpen,
        validationErrors,
        pickupCharges,
        chargesMode,
        truckerOptionsOpen,
        setTruckerOptionsOpen,
        isFetchingRates,
        isFetchingCarrierDetails,
        isFetchingDoorDeliveryRates,
        isFetchingAltGatewayRates,
        isFetchingDeliveryAltGatewayRates,
        truckerRates,
        altGatewayRates,
        doorDeliveryRatesForModal,
        truckerCity,
        truckerZip,
        deliveryLocationCode,
        deliveryZipCode,
        piecesTotal,
        weightTotal,
        volumeTotal,
        pickupId,
        handleCargoRowsChange,
        handleSelectRate,
        handleRetainManualYes,
        handleRetainManualNo,
        retainManualDialogOpen,
        handleFetchTruckRates,
        currentPickupFormData,
        handlePickupFormDataChange,
        // TMS button
        fetchTmsButtonState,
        carrierOptionsOpen,
        carrierQuotes,
        carrierOptionsFormContext,
        handleFetchQuoteFromTms,
        handleRefreshOptions,
        handleCloseCarrierOptions: () => setCarrierOptionsOpen(false),
        // TMS notifications & dialogs (for wrapper to render)
        tmsNotification,
        setTmsNotification,
        modifyConfirmOpen,
        handleModifyConfirmYes,
        handleModifyConfirmNo,
        isModifyBooking,
        handleModifyTmsBooking: () => { setIsModifyBooking(true); setCarrierOptionsOpen(true); },
        cargoMetrics,
        handleChargeChange,
        handleAddCharge,
        handleRemoveCharge,
        handleSetCharges: (charges: PickupCharge[]) => {
            setPickupCharges(charges);
            hasManualChargesRef.current = true;
            onPickupChargesChangeRef.current?.(charges);

        },
        // Alternate gateway
        alternateGateway,
        setAlternateGateway,
        alternateGatewayZipCode,
        setAlternateGatewayZipCode,
        alternateGatewayOptions,
        deliveryAlternateGatewayOptions,
        deliveryAlternateGateway,
        setDeliveryAlternateGateway,
        deliveryAlternateGatewayZipCode,
        setDeliveryAlternateGatewayZipCode,
        handleRefreshDoorDeliveryRates,
        deliveryAltGatewayRates,
        // Accessorials
        availablePickupAccessorials: availablePickupAccessorials ?? [],
        availableDeliveryAccessorials: availableDeliveryAccessorials ?? [],
        handleTogglePickupAccessorial,
        handleRefreshRates,
    };
};

export const usePickupDeliveryDetailsPanel = (initialFormData?: Partial<PickupDeliveryFormData>) => {
    const [formData, setFormData] = useState<PickupDeliveryFormData>({
        ...defaultPickupDeliveryFormData,
        ...(initialFormData ?? {}),
    });
    const [orgSearchOpen, setOrgSearchOpen] = useState(false);

    const { isVisible } = useFeatureToggle();

    const handleChange = (field: keyof PickupDeliveryFormData, value: unknown) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleAccessorialsChange = (selected: string[]) => {
        handleChange('accessorials', selected);
    };

    const handleHazardousChange = (isHazardous: boolean) => {
        setFormData(prev => {
            const already = prev.accessorials.includes('hazardous-material');
            if (isHazardous && !already) {
                return { ...prev, accessorials: [...prev.accessorials, 'hazardous-material'] };
            }
            if (!isHazardous && already) {
                return { ...prev, accessorials: prev.accessorials.filter(a => a !== 'hazardous-material') };
            }
            return prev;
        });
    };

    const handleOrgSelect = (org: {
        code: string;
        name: string;
        address: string;
        city: string;
        state: string;
        stateName?: string;
        country: string;
        zipCode?: string;
        contactName1?: string;
        contactPhone1?: string;
        contactEmail1?: string;
    }) => {
        handleChange('pickupCargoAtCode', org.code);
        handleChange('name', org.name);
        handleChange('streetAddress', org.address);
        handleChange('city', org.city);

        const stateValue = (isVisible(CommonToggleKeys.OCEAN_DISPLAY_STATE_NAME) && org.stateName)
            ? org.stateName
            : org.state;
        handleChange('state', stateValue);
        handleChange('country', org.country);
        if (org.zipCode) handleChange('zipCode', org.zipCode);
        if (org.contactName1) handleChange('contactName1', org.contactName1);
        if (org.contactPhone1) handleChange('contactPhone1', org.contactPhone1);
        if (org.contactEmail1) handleChange('contactEmail1', org.contactEmail1);
        setOrgSearchOpen(false);
    };

    return {
        formData,
        setFormData,
        orgSearchOpen,
        setOrgSearchOpen,
        handleChange,
        handleAccessorialsChange,
        handleHazardousChange,
        handleOrgSelect,
    };
};

export const useTruckerDetailsPanel = (
    initialFormData: TruckerFormData = defaultTruckerFormData
) => {
    const [formData, setFormData] = useState<TruckerFormData>(initialFormData);
    const [orgSearchOpen, setOrgSearchOpen] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);

    const handleChange = (field: keyof TruckerFormData, value: unknown) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleOrgSelect = (org: { code: string; name: string }) => {
        handleChange('truckerCode', org.code);
        handleChange('truckerDetails', org.name);
        setOrgSearchOpen(false);
    };

    useEffect(() => {
        setFormData(initialFormData);
    }, [initialFormData]);

    return {
        formData,
        setFormData,
        orgSearchOpen,
        setOrgSearchOpen,
        handleChange,
        handleOrgSelect,
        isUnlocked,
        setIsUnlocked,
    };
};

export const usePickupDeliveryDetailsPanelCoordinates = (
    formData: PickupDeliveryFormData,
    onCoordinatesChange: (lat: string, lng: string) => void,
) => {
    const [latError, setLatError] = useState('');
    const [lngError, setLngError] = useState('');

    const { isVisible } = useFeatureToggle();
    const mapProvider: 'google' | 'baidu' = isVisible(CommonToggleKeys.MAPS_ENABLE_BAIDU_MAPS) ? 'baidu' : 'google';

    const handleLatBlur = () => {
        const error = validateLatitude(formData.latitude);
        if (error) {
            setLatError(error);
            onCoordinatesChange('', formData.longitude);
        } else {
            setLatError('');
        }
    };

    const handleLngBlur = () => {
        const error = validateLongitude(formData.longitude);
        if (error) {
            setLngError(error);
            onCoordinatesChange(formData.latitude, '');
        } else {
            setLngError('');
        }
    };

    const handleLocationChange = (lat: string, lng: string) => {
        onCoordinatesChange(lat, lng);
        setLatError('');
        setLngError('');
    };

    return {
        mapProvider,
        latError,
        lngError,
        handleLatBlur,
        handleLngBlur,
        handleLocationChange,
    };
};

export const showError = (dd: DoorDeliveryFormData, context: any): string[] => {

    const errors: string[] = [];


    // Validate door delivery mandatory fields
    if (!dd?.doorDeliveryCity?.trim()) errors.push('Door Delivery City is mandatory.');
    if (!dd?.doorDeliveryZipCode?.trim()) errors.push('Door Delivery Zip Code is mandatory.');
    if (!dd?.doorDeliveryCountry?.trim()) errors.push('Door Delivery Country is mandatory.');
    if (!dd?.estimatedDeliveryDate) errors.push('Tentative Delivery Date is mandatory.');

    // BOOKING only: delivery date must not be before destination CFS ETA
    if (context?.isBkgModule && dd?.estimatedDeliveryDate && context?.routing?.destinationInlandCfsEtaDate) {
        if (new Date(dd.estimatedDeliveryDate) < new Date(context.routing.destinationInlandCfsEtaDate)) {
            errors.push('Delivery date must not be before the CFS ETA date.');
        }
    }

    const cfdrCargoRows = context?.cargoRows ?? [];
    cfdrCargoRows.forEach((row, idx) => {
        const hasDimError = row.dimRows?.length > 0 && row.dimRows.some(
            d => !d.length?.trim() || !d.width?.trim() || !d.height?.trim() || !d.pieces?.trim()
        );

        if (hasDimError) errors.push(`Please enter all required cargo dimensions.`);

        const label = `Cargo Line Item ${idx + 1}:`;

        if (row.dimRows?.length > 0) {
            if (!row.pieces?.trim()) errors.push(`${label} Pieces is mandatory.`);
            if (!row.kg?.trim()) errors.push(`${label} Kg is mandatory.`);
            if (!row.cbm?.trim()) errors.push(`${label} Cbm is mandatory.`);
            if (!row.lbs?.trim()) errors.push(`${label} Lbs is mandatory.`);
            if (!row.cbf?.trim()) errors.push(`${label} Cbf is mandatory.`);
            if (
                !row.hazardous?.trim() ||
                row.hazardous === '-1' ||
                row.hazardous === 'Please Select'
            ) {
                errors.push(`${label} Please select Hazardous.`);
            }
        }
    });


    return errors;

}

export const useDoorDeliveryAccordionContent = (
    hideFetchButton: boolean = false,
    initialCharges: PickupCharge[] = EMPTY_DOOR_DELIVERY_CHARGES,
    context?: {
        routing?: any;
        cargoRows?: CargoRow[];
        pickupCargoAtCode?: string;
        isBkgModule?: boolean;
    },
    onPopulateTrucker?: (truckerCode: string, truckerDetails: string) => void,
) => {
    const [isFetchingRates, setIsFetchingRates] = useState(false);
    const [isFetchingCarrierDetails, setIsFetchingCarrierDetails] = useState(false);
    const [validationOpen, setValidationOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [truckerSearchOpen, setTruckerSearchOpen] = useState(false);
    const [doorDeliveryCharges, setDoorDeliveryCharges] = useState<PickupCharge[]>(initialCharges);
    const [doorDeliveryRates, setDoorDeliveryRates] = useState<TruckRateV1[]>([]);
    const [deliveryAltGatewayRates, setDeliveryAltGatewayRates] = useState<TruckRateV1[]>([]);
    const [doorDeliveryCity, setDoorDeliveryCity] = useState('');
    const [doorDeliveryZip, setDoorDeliveryZip] = useState('');
    const [truckerOptionsOpen, setTruckerOptionsOpen] = useState(false);
    const [originCfsCity, setOriginCfsCity] = useState('');
    const [originCfsZipCode, setOriginCfsZipCode] = useState('');
    const [originCfsLocationCode, setOriginCfsLocationCode] = useState('');
    const [cfsPiecesTotal, setCfsPiecesTotal] = useState(0);
    const [cfsWeightTotal, setCfsWeightTotal] = useState(0);
    const [cfsVolumeTotal, setCfsVolumeTotal] = useState(0);

    const doorDeliveryFormRef = useRef<DoorDeliveryFormData | null>(null);

    const loginClientBean = useAppSelector((state: any) => state.loginClientBean?.data);
    const ldapuserName = loginClientBean?.ldapUsername ?? '';

    const { getToggleValue } = useFeatureToggle();
    const profitPercentage = Number(getToggleValue(CommonToggleKeys.TMS_PROFIT_PERCENTAGE) ?? 0);

    const handleFetchTruckRates = async (formData?: DoorDeliveryFormData) => {
        const dd = formData ?? doorDeliveryFormRef.current;

        const rateMapDatas = await getOrFetchRateMapData();

        if (!context?.routing?.warehouse?.trim()) {
            const error = 'Warehouse is mandatory.';
            setValidationErrors([error]);
            setValidationOpen(true);
            return;
        }


        const errors = showError(dd, context);

        if (errors.length > 0) {
            setValidationErrors(errors);
            setValidationOpen(true);
            return;
        }

        setDoorDeliveryCity(dd?.doorDeliveryCity ?? '');
        setDoorDeliveryZip(dd?.doorDeliveryZipCode ?? '');
        setDoorDeliveryRates([]);
        setIsFetchingRates(true);
        setTruckerOptionsOpen(true);

        const warehouseCode = context?.routing?.warehouse?.split('-')?.[0]?.trim() || '';
        const warehouseNameFallback = context?.routing?.warehouseName
            || context?.routing?.warehouse?.split('-')?.slice(1)?.join('-')?.trim()
            || '';

        const destCfsNameFromRouting = warehouseNameFallback || '';
        setOriginCfsLocationCode(destCfsNameFromRouting);
        setOriginCfsCity('');
        setOriginCfsZipCode('');

        try {
            let originCity = '';
            let originZipCode = '';
            let originCountryCode = '';
            let originUnlocation = '';
            const destCfsCode =
                (context?.routing?.destinationWarehouse || '')
                    .split(' - ')[0]
                    .trim();
            // warehouseCode
            //     || context?.routing?.destinationCfsCode
            //     || context?.routing?.destinationWarehouseCode;
            if (destCfsCode) {
                try {
                    const dwRes = await ApiService.post<{ result: WarehouseDetailsBean }>(
                        COMMON_ENDPOINTS.CARRIER_OPTIONS.GET_WAREHOUSE_DETAILS_BY_CODE,
                        { warehouseCode: destCfsCode }
                    );
                    const dw = dwRes.data?.result;
                    originCity = dw?.name ?? '';
                    originZipCode = dw?.address5 ?? '';
                    originCountryCode = dw?.countryCode ?? '';
                    originUnlocation = dw?.unLocationCode ?? '';
                    setOriginCfsCity(originCity);
                    setOriginCfsZipCode(originZipCode);
                    setOriginCfsLocationCode(dw?.name ?? '');
                } catch (e) {
                    console.error('Failed to fetch warehouse details for destination CFS', e);
                }
            }

            const rows = context?.cargoRows ?? [];
            const pieces = rows.reduce((s, r) => s + (parseFloat(r.pieces) || 0), 0);
            const weight = rows.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0);
            const volume = rows.reduce((s, r) => s + (parseFloat(r.cbm) || 0), 0);
            setCfsPiecesTotal(pieces);
            setCfsWeightTotal(weight);
            setCfsVolumeTotal(volume);

            const commodities: CommodityPayload[] = rows.map(r => {
                const dim = r.dimRows[0] ?? { length: '0', width: '0', height: '0', pieces: '0' };
                const haz = r.hazRows[0];
                return {
                    pieces: parseFloat(r.pieces) || 0,
                    length: parseFloat(dim.length) || 0,
                    width: parseFloat(dim.width) || 0,
                    height: parseFloat(dim.height) || 0,
                    dimensionUnits: 'cm',
                    cbm: parseFloat(r.cbm) || 0,
                    cbf: parseFloat(r.cbf) || 0,
                    kg: parseFloat(r.kg) || 0,
                    lbs: parseFloat(r.lbs) || 0,
                    description: r.description ?? '',
                    freightClass: '',
                    hazardClass: haz?.imoClass ?? '',
                    unNumber: haz?.unNumber ?? '',
                    packingGroup: haz?.pkgGroup ?? '',
                    additionalMarkings: '',
                    packagingType: r.packaging ?? '',
                };
            });

            const tentativeDate = formatTentativeDate(dd?.estimatedDeliveryDate);

            const request: TruckRateRequestBean = {
                truckRateSearchRequest: {
                    requestedBy: 'OCEAN',
                    rateType: 'D',
                    officeCode: loginClientBean?.officeCode ?? '',
                    truckSellProfileCode: '',
                    namedAccountCode: '',
                    originCity,
                    originZipCode,
                    originCountryCode,
                    originUnlocation,
                    destinationCity: dd?.doorDeliveryCity ?? '',
                    destinationZipCode: dd?.doorDeliveryZipCode ?? '',
                    destinationCountryCode: dd?.doorDeliveryCountry ?? '',
                    destUnlocation: '',
                    tentativeDate,
                    uom: 'M',
                    packagingType: '',
                    shipmentType: 'LTL',
                    piecesTotal: pieces,
                    weightTotal: weight,
                    volumeTotal: volume,
                    hazardousMaterial: rows.some(r => r.hazardous === 'Y'),
                    commodities,
                    accessorialCodes: dd?.accessorials ?? [],
                    stackable: dd?.stackable ? 'Y' : 'N',
                    scaleRate: '',
                    truckerResponseFileId: 0,
                },
                lDapUsername: ldapuserName,
            };

            const isDeliveryUS = isCountryUs(dd?.doorDeliveryCountry ?? '');

            if (isDeliveryUS) {
                const rows = context?.cargoRows ?? [];
                const tmsPayload = buildTmsPayload(
                    rows,
                    originZipCode,
                    originCountryCode,
                    dd?.doorDeliveryZipCode ?? '',
                    dd?.doorDeliveryCountry ?? '',
                    dd?.accessorials ?? [],
                );
                const resp = await ApiService.post<TmsCarrierQuoteResult[]>(
                    PHOENIX_ENDPOINTS.TMS.GET_TMS_RATE_QUOTE,
                    tmsPayload,
                );
                setDoorDeliveryRates(convertTmsRates(resp.data ?? [], rateMapDatas, profitPercentage, 'D'));
            } else {
                const resp = await ApiService.post<FetchTruckRatesResponse>(
                    API_ENDPOINTS.CARRIER_OPTIONS.FETCH_TRUCK_RATES,
                    request,
                );
                setDoorDeliveryRates(resp.data?.result?.result?.rates ?? []);
            }
        } catch (e) {
            console.error('Failed to fetch door delivery rates', e);
        } finally {
            setIsFetchingRates(false);
        }
    };

    const handleSelectDoorDeliveryRate = async (rate: TruckRateV1) => {
        const charges: PickupCharge[] = rate.charges.map((c, i) => ({
            id: i + 1,
            chargeDescription: c.chargeName || c.chargeCode,
            expenseCurrency: rate.header.buyCurrency || c.currency,
            expense: c.calculatedBuyAmount,
            incomeCurrency: rate.header.sellCurrency || c.currency,
            income: c.calculatedSellAmount,
            notes: c.notes || '',
        }));

        let truckerCode = rate.header.carrier || rate.header.carrierName;
        let truckerDetails = rate.header.carrierName;

        const isDeliveryUS = isCountryUs(doorDeliveryFormRef.current?.doorDeliveryCountry ?? '');
        if (!isDeliveryUS) {
            setIsFetchingCarrierDetails(true);
            try {
                const resolved = await fetchAndResolveCarrierDetails(rate.header.carrier, rate.header.carrierName);
                truckerCode = resolved.truckerCode;
                truckerDetails = resolved.truckerDetails;
            } finally {
                setIsFetchingCarrierDetails(false);
            }
        }

        setDoorDeliveryCharges(charges);
        onPopulateTrucker?.(truckerCode, truckerDetails);
        setTruckerOptionsOpen(false);
    };

    const handleRefreshAltGatewayRates = async (
        altGateway: string,
        zipCodeOverride: string,
        formData?: DoorDeliveryFormData,
    ) => {
        if (!altGateway.trim()) return;
        const altCode = altGateway.split('~')[0].trim();
        const zipFallback = altGateway.split('~')[2]?.trim() ?? '';
        const zipOverride = zipCodeOverride.trim() || zipFallback;
        const dd = formData ?? doorDeliveryFormRef.current;
        const rateMapDatas = await getOrFetchRateMapData();

        const rows = context?.cargoRows ?? [];
        const pieces = rows.reduce((s, r) => s + (parseFloat(r.pieces) || 0), 0);
        const weight = rows.reduce((s, r) => s + (parseFloat(r.kg) || 0), 0);
        const volume = rows.reduce((s, r) => s + (parseFloat(r.cbm) || 0), 0);
        const isHazardous = rows.some(r => r.hazardous === 'Y');
        const tentativeDate = formatTentativeDate(dd?.estimatedDeliveryDate);
        const isDeliveryUS = isCountryUs(dd?.doorDeliveryCountry ?? '');

        setIsFetchingRates(true);
        try {
            let altCity = '';
            let altCountryCode = '';
            let altUnCode = '';
            try {
                const wRes = await ApiService.post<{ result: WarehouseDetailsBean }>(
                    COMMON_ENDPOINTS.CARRIER_OPTIONS.GET_WAREHOUSE_DETAILS_BY_CODE,
                    { warehouseCode: altCode },
                );
                const wb = wRes.data?.result;
                altCity = wb?.address2 ?? '';
                altCountryCode = wb?.countryCode ?? '';
                altUnCode = wb?.unLocationCode ?? '';
            } catch (e) {
                console.error('Failed to fetch warehouse details for alternate gateway', e);
            }

            const commodities: CommodityPayload[] = rows.map(r => {
                const dim = r.dimRows[0] ?? { length: '0', width: '0', height: '0', pieces: '0' };
                const haz = r.hazRows[0];
                return {
                    pieces: parseFloat(r.pieces) || 0,
                    length: parseFloat(dim.length) || 0,
                    width: parseFloat(dim.width) || 0,
                    height: parseFloat(dim.height) || 0,
                    dimensionUnits: 'cm',
                    cbm: parseFloat(r.cbm) || 0,
                    cbf: parseFloat(r.cbf) || 0,
                    kg: parseFloat(r.kg) || 0,
                    lbs: parseFloat(r.lbs) || 0,
                    description: r.description ?? '',
                    freightClass: '',
                    hazardClass: haz?.imoClass ?? '',
                    unNumber: haz?.unNumber ?? '',
                    packingGroup: haz?.pkgGroup ?? '',
                    additionalMarkings: '',
                    packagingType: r.packaging ?? '',
                };
            });

            if (isDeliveryUS) {
                const tmsPayload = buildTmsPayload(
                    rows,
                    zipOverride,
                    altCountryCode,
                    dd?.doorDeliveryZipCode ?? '',
                    dd?.doorDeliveryCountry ?? '',
                    dd?.accessorials ?? [],
                );
                const resp = await ApiService.post<TmsCarrierQuoteResult[]>(
                    PHOENIX_ENDPOINTS.TMS.GET_TMS_RATE_QUOTE,
                    tmsPayload,
                );
                setDeliveryAltGatewayRates(convertTmsRates(resp.data ?? [], rateMapDatas, profitPercentage, 'D'));
            } else {
                const deliveryRequest: TruckRateRequestBean = {
                    truckRateSearchRequest: {
                        requestedBy: 'OCEAN',
                        rateType: 'D',
                        officeCode: loginClientBean?.officeCode ?? '',
                        truckSellProfileCode: '',
                        namedAccountCode: '',
                        originCity: altCity,
                        originZipCode: zipOverride,
                        originCountryCode: altCountryCode,
                        originUnlocation: altUnCode,
                        destinationCity: dd?.doorDeliveryCity ?? '',
                        destinationZipCode: dd?.doorDeliveryZipCode ?? '',
                        destinationCountryCode: dd?.doorDeliveryCountry ?? '',
                        destUnlocation: '',
                        tentativeDate,
                        uom: 'M',
                        packagingType: '',
                        shipmentType: 'LTL',
                        piecesTotal: pieces,
                        weightTotal: weight,
                        volumeTotal: volume,
                        hazardousMaterial: isHazardous,
                        commodities,
                        accessorialCodes: dd?.accessorials ?? [],
                        stackable: dd?.stackable ? 'Y' : 'N',
                        scaleRate: '',
                        truckerResponseFileId: 0,
                    },
                    lDapUsername: ldapuserName,
                };
                const resp = await ApiService.post<FetchTruckRatesResponse>(
                    API_ENDPOINTS.CARRIER_OPTIONS.FETCH_TRUCK_RATES,
                    deliveryRequest,
                );
                setDeliveryAltGatewayRates(resp.data?.result?.result?.rates ?? []);
            }
        } catch (e) {
            console.error('Failed to fetch delivery alternate gateway rates', e);
        } finally {
            setIsFetchingRates(false);
        }
    };

    // Guard: only sync when the array reference changes AND has actual content,
    // preventing inline `?? []` literals from causing an infinite render loop.
    const prevChargesRef = useRef<PickupCharge[]>(initialCharges);
    useEffect(() => {
        if (prevChargesRef.current === initialCharges) return;
        prevChargesRef.current = initialCharges;
        setDoorDeliveryCharges(initialCharges);
    }, [initialCharges]);

    const buyTotal = doorDeliveryCharges.reduce((sum, c) => sum + c.expense, 0);
    const sellTotal = doorDeliveryCharges.reduce((sum, c) => sum + c.income, 0);
    const profitLoss = sellTotal - buyTotal;

    const chargeRows = doorDeliveryCharges.length > 0
        ? doorDeliveryCharges
        : [{ id: -1, chargeDescription: '', expenseCurrency: 'USD', expense: 0, incomeCurrency: 'USD', income: 0 }];

    return {
        isFetchingRates,
        isFetchingCarrierDetails,
        validationOpen,
        setValidationOpen,
        validationErrors,
        truckerSearchOpen,
        setTruckerSearchOpen,
        handleFetchTruckRates,
        handleSelectDoorDeliveryRate,
        handleRefreshAltGatewayRates,
        doorDeliveryRates,
        deliveryAltGatewayRates,
        doorDeliveryCity,
        doorDeliveryZip,
        truckerOptionsOpen,
        setTruckerOptionsOpen,
        buyTotal,
        sellTotal,
        profitLoss,
        chargeRows,
        hideFetchButton,
        doorDeliveryFormRef,
        originCfsCity,
        originCfsZipCode,
        originCfsLocationCode,
        cfsPiecesTotal,
        cfsWeightTotal,
        cfsVolumeTotal,
    };
};

export const useTruckingDetails = (
    pickups: number[],
    doorDeliveryFormData?: DoorDeliveryFormData,
    onDoorDeliveryFormDataChange?: (field: keyof DoorDeliveryFormData, value: unknown) => void,
    initialHeaderDataMap: Record<number, HeaderData> = EMPTY_HEADER_MAP,
) => {
    const [outerOpenItems, setOuterOpenItems] = useState<string[]>(['1', '2']);
    const [collapsedSet, setCollapsedSet] = useState<Set<number>>(new Set());
    const [headerDataMap, setHeaderDataMap] = useState<Record<number, HeaderData>>(initialHeaderDataMap);
    const [doorDeliveryCollapsed, setDoorDeliveryCollapsed] = useState(false);

    // Keep latest callback in a ref so it never appears in useEffect/useMemo deps,
    // preventing a new function reference on every render from triggering re-renders.
    const onDoorDeliveryFormDataChangeRef = useRef(onDoorDeliveryFormDataChange);
    useEffect(() => { onDoorDeliveryFormDataChangeRef.current = onDoorDeliveryFormDataChange; });

    const handleToggleOuter = (id: string) => {
        setOuterOpenItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleToggleCollapse = (pickupId: number) => {
        setCollapsedSet(prev => {
            const next = new Set(prev);
            if (next.has(pickupId)) next.delete(pickupId);
            else next.add(pickupId);
            return next;
        });
    };

    const handleHeaderDataChange = (pickupId: number, data: HeaderData) => {
        setHeaderDataMap(prev => ({ ...prev, [pickupId]: data }));
    };

    const prevHeaderMapRef = useRef<Record<number, HeaderData>>(initialHeaderDataMap);
    useEffect(() => {
        if (prevHeaderMapRef.current === initialHeaderDataMap) return;
        prevHeaderMapRef.current = initialHeaderDataMap;
        setHeaderDataMap(initialHeaderDataMap);
    }, [initialHeaderDataMap]);

    // Derive hasDoorDelivery from presence of the form data only — not the callback ref,
    // which changes every render and would make isCombined unstable.
    const hasDoorDelivery = !!doorDeliveryFormData;
    const hasPickups = pickups.length > 0;
    const isCombined = hasPickups && hasDoorDelivery;

    return {
        outerOpenItems,
        collapsedSet,
        headerDataMap,
        doorDeliveryCollapsed,
        setDoorDeliveryCollapsed,
        handleToggleOuter,
        handleToggleCollapse,
        handleHeaderDataChange,
        hasDoorDelivery,
        hasPickups,
        isCombined,
    };
};

export type SortField = 'transitTime' | 'buyTotal' | 'sellTotal';
export type SortDir = 'asc' | 'desc';
export interface SortRule { field: SortField; asc: boolean; }

const TRUCKER_ITEMS_PER_PAGE = 5;

const DEFAULT_SORT_RULES: SortRule[] = [
    { field: 'sellTotal', asc: true },
    { field: 'buyTotal', asc: true },
    { field: 'transitTime', asc: true },
];

export const sortTruckRates = (rates: TruckRateV1[], rules: SortRule[]): TruckRateV1[] =>
    [...rates].sort((a, b) => {
        for (const rule of rules) {
            const va = rule.field === 'transitTime' ? a.header.transitTime
                : rule.field === 'buyTotal' ? a.header.buyTotal
                    : a.header.sellTotal;
            const vb = rule.field === 'transitTime' ? b.header.transitTime
                : rule.field === 'buyTotal' ? b.header.buyTotal
                    : b.header.sellTotal;
            const diff = rule.asc ? va - vb : vb - va;
            if (diff !== 0) return diff;
        }
        return 0;
    });

export const useTruckerOptionsModal = (rates: TruckRateV1[], doorDeliveryRates: TruckRateV1[] = [], altGatewayRates: TruckRateV1[] = [], deliveryAltGatewayRates: TruckRateV1[] = []) => {
    const [mainOpen, setMainOpen] = useState(true);
    const [ratesOpen, setRatesOpen] = useState(true);
    const [stackable, setStackable] = useState<'yes' | 'no'>('yes');
    const [shipmentType, setShipmentType] = useState('LTL');
    const [sortRules, setSortRules] = useState<SortRule[]>(DEFAULT_SORT_RULES);
    const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
    const [displayCount, setDisplayCount] = useState(TRUCKER_ITEMS_PER_PAGE);

    // Door delivery rates state
    const [doorDeliveryRatesOpen, setDoorDeliveryRatesOpen] = useState(true);
    const [doorDeliveryStackable, setDoorDeliveryStackable] = useState<'yes' | 'no'>('yes');
    const [doorDeliveryShipmentType, setDoorDeliveryShipmentType] = useState('LTL');
    const [doorDeliverySortRules, setDoorDeliverySortRules] = useState<SortRule[]>(DEFAULT_SORT_RULES);
    const [doorDeliveryExpandedRows, setDoorDeliveryExpandedRows] = useState<Set<number>>(new Set());
    const [doorDeliveryDisplayCount, setDoorDeliveryDisplayCount] = useState(TRUCKER_ITEMS_PER_PAGE);

    // Alternate gateway rates state
    const [altGatewayRatesOpen, setAltGatewayRatesOpen] = useState(true);
    const [altGatewaySortRules, setAltGatewaySortRules] = useState<SortRule[]>(DEFAULT_SORT_RULES);
    const [altGatewayExpandedRows, setAltGatewayExpandedRows] = useState<Set<number>>(new Set());
    const [altGatewayDisplayCount, setAltGatewayDisplayCount] = useState(TRUCKER_ITEMS_PER_PAGE);

    // Delivery alternate gateway rates state
    const [deliveryAltGatewayRatesOpen, setDeliveryAltGatewayRatesOpen] = useState(true);
    const [deliveryAltGatewaySortRules, setDeliveryAltGatewaySortRules] = useState<SortRule[]>(DEFAULT_SORT_RULES);
    const [deliveryAltGatewayExpandedRows, setDeliveryAltGatewayExpandedRows] = useState<Set<number>>(new Set());
    const [deliveryAltGatewayDisplayCount, setDeliveryAltGatewayDisplayCount] = useState(TRUCKER_ITEMS_PER_PAGE);

    useEffect(() => {
        setDisplayCount(TRUCKER_ITEMS_PER_PAGE);
        setExpandedRows(new Set());
    }, [rates]);

    useEffect(() => {
        setDoorDeliveryDisplayCount(TRUCKER_ITEMS_PER_PAGE);
        setDoorDeliveryExpandedRows(new Set());
    }, [doorDeliveryRates]);

    useEffect(() => {
        setAltGatewayDisplayCount(TRUCKER_ITEMS_PER_PAGE);
        setAltGatewayExpandedRows(new Set());
    }, [altGatewayRates]);

    useEffect(() => {
        setDeliveryAltGatewayDisplayCount(TRUCKER_ITEMS_PER_PAGE);
        setDeliveryAltGatewayExpandedRows(new Set());
    }, [deliveryAltGatewayRates]);

    const allOpen = mainOpen && ratesOpen
        && (doorDeliveryRates.length === 0 || doorDeliveryRatesOpen)
        && (altGatewayRates.length === 0 || altGatewayRatesOpen)
        && (deliveryAltGatewayRates.length === 0 || deliveryAltGatewayRatesOpen);

    const handleSort = (field: SortField) => {
        setSortRules(prev => prev.map(rule =>
            rule.field === field ? { ...rule, asc: !rule.asc } : rule
        ));
        setDisplayCount(TRUCKER_ITEMS_PER_PAGE);
    };

    const handleToggleRow = (idx: number) => {
        setExpandedRows(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const handleDoorDeliverySort = (field: SortField) => {
        setDoorDeliverySortRules(prev => prev.map(rule =>
            rule.field === field ? { ...rule, asc: !rule.asc } : rule
        ));
        setDoorDeliveryDisplayCount(TRUCKER_ITEMS_PER_PAGE);
    };

    const handleDoorDeliveryToggleRow = (idx: number) => {
        setDoorDeliveryExpandedRows(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const handleAltGatewaySort = (field: SortField) => {
        setAltGatewaySortRules(prev => prev.map(rule =>
            rule.field === field ? { ...rule, asc: !rule.asc } : rule
        ));
        setAltGatewayDisplayCount(TRUCKER_ITEMS_PER_PAGE);
    };

    const handleAltGatewayToggleRow = (idx: number) => {
        setAltGatewayExpandedRows(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const handleDeliveryAltGatewaySort = (field: SortField) => {
        setDeliveryAltGatewaySortRules(prev => prev.map(rule =>
            rule.field === field ? { ...rule, asc: !rule.asc } : rule
        ));
        setDeliveryAltGatewayDisplayCount(TRUCKER_ITEMS_PER_PAGE);
    };

    const handleDeliveryAltGatewayToggleRow = (idx: number) => {
        setDeliveryAltGatewayExpandedRows(prev => {
            const next = new Set(prev);
            next.has(idx) ? next.delete(idx) : next.add(idx);
            return next;
        });
    };

    const sortedRates = sortTruckRates(rates, sortRules);
    const displayedRates = sortedRates.slice(0, displayCount);
    const hasMore = displayCount < sortedRates.length;

    const doorDeliverySortedRates = sortTruckRates(doorDeliveryRates, doorDeliverySortRules);
    const doorDeliveryDisplayedRates = doorDeliverySortedRates.slice(0, doorDeliveryDisplayCount);
    const doorDeliveryHasMore = doorDeliveryDisplayCount < doorDeliverySortedRates.length;

    const altGatewaySortedRates = sortTruckRates(altGatewayRates, altGatewaySortRules);
    const altGatewayDisplayedRates = altGatewaySortedRates.slice(0, altGatewayDisplayCount);
    const altGatewayHasMore = altGatewayDisplayCount < altGatewaySortedRates.length;

    const deliveryAltGatewaySortedRates = sortTruckRates(deliveryAltGatewayRates, deliveryAltGatewaySortRules);
    const deliveryAltGatewayDisplayedRates = deliveryAltGatewaySortedRates.slice(0, deliveryAltGatewayDisplayCount);
    const deliveryAltGatewayHasMore = deliveryAltGatewayDisplayCount < deliveryAltGatewaySortedRates.length;

    return {
        mainOpen,
        setMainOpen,
        ratesOpen,
        setRatesOpen,
        stackable,
        setStackable,
        shipmentType,
        setShipmentType,
        sortRules,
        expandedRows,
        displayCount,
        setDisplayCount,
        allOpen,
        handleSort,
        handleToggleRow,
        sortedRates,
        displayedRates,
        hasMore,
        // door delivery
        doorDeliveryRatesOpen,
        setDoorDeliveryRatesOpen,
        doorDeliveryStackable,
        setDoorDeliveryStackable,
        doorDeliveryShipmentType,
        setDoorDeliveryShipmentType,
        doorDeliverySortRules,
        doorDeliveryExpandedRows,
        doorDeliveryDisplayCount,
        setDoorDeliveryDisplayCount,
        handleDoorDeliverySort,
        handleDoorDeliveryToggleRow,
        doorDeliverySortedRates,
        doorDeliveryDisplayedRates,
        doorDeliveryHasMore,
        // alternate gateway
        altGatewayRatesOpen,
        setAltGatewayRatesOpen,
        altGatewaySortRules,
        altGatewayExpandedRows,
        altGatewayDisplayCount,
        setAltGatewayDisplayCount,
        handleAltGatewaySort,
        handleAltGatewayToggleRow,
        altGatewaySortedRates,
        altGatewayDisplayedRates,
        altGatewayHasMore,
        // delivery alternate gateway
        deliveryAltGatewayRatesOpen,
        setDeliveryAltGatewayRatesOpen,
        deliveryAltGatewaySortRules,
        deliveryAltGatewayExpandedRows,
        deliveryAltGatewayDisplayCount,
        setDeliveryAltGatewayDisplayCount,
        handleDeliveryAltGatewaySort,
        handleDeliveryAltGatewayToggleRow,
        deliveryAltGatewaySortedRates,
        deliveryAltGatewayDisplayedRates,
        deliveryAltGatewayHasMore,
    };
};


export const useCarrierOptionsModal = (
    overrideFormData?: Partial<CarrierOptionsFormData>,
    onBookWithTmsResult?: (result: BookWithTmsResult) => void,
    loginClientBean: MinifiedLoginClientBean | null | undefined = undefined
) => {
    const [mainDetailsOpen, setMainDetailsOpen] = useState(true);
    const [pricingOpen, setPricingOpen] = useState(true);
    const [guaranteedOnly, setGuaranteedOnly] = useState(false);
    const [pickupAccessorial, setPickupAccessorial] = useState<string[]>([]);
    const [deliverToAccessorial, setDeliverToAccessorial] = useState<string[]>([]);
    const [pickupLocationCode, setPickupLocationCode] = useState(overrideFormData?.pickupLocationCode ?? initialCarrierOptionsFormData.pickupLocationCode);
    const [pickupZipCode, setPickupZipCode] = useState(overrideFormData?.pickupZipCode ?? initialCarrierOptionsFormData.pickupZipCode);
    const [deliverToLocationCode, setDeliverToLocationCode] = useState(overrideFormData?.deliverToLocationCode ?? initialCarrierOptionsFormData.deliverToLocationCode);
    const [deliverToZipCode, setDeliverToZipCode] = useState(overrideFormData?.deliverToZipCode ?? initialCarrierOptionsFormData.deliverToZipCode);
    const [alternateGateway, setAlternateGateway] = useState(overrideFormData?.alternateGateway ?? initialCarrierOptionsFormData.alternateGateway);
    const [zipCode, setZipCode] = useState(overrideFormData?.zipCode ?? initialCarrierOptionsFormData.zipCode);

    useEffect(() => {
        if (!overrideFormData) return;
        if (overrideFormData.pickupLocationCode !== undefined)
            setPickupLocationCode(overrideFormData.pickupLocationCode);
        if (overrideFormData.pickupZipCode !== undefined)
            setPickupZipCode(overrideFormData.pickupZipCode);
        if (overrideFormData.deliverToLocationCode !== undefined)
            setDeliverToLocationCode(overrideFormData.deliverToLocationCode);
        if (overrideFormData.deliverToZipCode !== undefined)
            setDeliverToZipCode(overrideFormData.deliverToZipCode);
        if (overrideFormData.pickupAccessorial !== undefined)
            setPickupAccessorial(overrideFormData.pickupAccessorial);
    }, [overrideFormData]);

    const {
        data: pickupLocationData,
        setQuery: setPickupLocationQuery,
    } = useGetSuggestions(tmsLocationCodeSuggestionConfig(loginClientBean));

    const {
        data: deliverToLocationData,
        setQuery: setDeliverToLocationQuery,
    } = useGetSuggestions(tmsLocationCodeSuggestionConfig(loginClientBean));

    const { data: alternateGatewayOptions } = useGetSelections(alternateGatewaySelectionConfig());

    const handlePickupAccessorialToggle = (code: string) =>
        setPickupAccessorial(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code],
        );

    const handleDeliverToAccessorialToggle = (code: string) =>
        setDeliverToAccessorial(prev =>
            prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code],
        );

    const formData: CarrierOptionsFormData = {
        ...initialCarrierOptionsFormData,
        ...overrideFormData,
        pickupLocationCode,
        pickupZipCode,
        deliverToLocationCode,
        deliverToZipCode,
        pickupAccessorial,
        deliverToAccessorial,
        alternateGateway,
        zipCode,
    };

    const handlers = {
        onPickupAccessorialToggle: handlePickupAccessorialToggle,
        onDeliverToAccessorialToggle: handleDeliverToAccessorialToggle,
        onSelectQuote: (_quote: CarrierQuote) => { },
        onPickupLocationCodeChange: (val: string) => { setPickupLocationCode(val); setPickupLocationQuery(val); },
        onPickupZipCodeChange: setPickupZipCode,
        onDeliverToLocationCodeChange: (val: string) => { setDeliverToLocationCode(val); setDeliverToLocationQuery(val); },
        onDeliverToZipCodeChange: setDeliverToZipCode,
        onAlternateGatewayChange: setAlternateGateway,
        onZipCodeChange: setZipCode,
        onBookWithTmsResult: onBookWithTmsResult ?? (() => { }),
    };

    const uiState = { mainDetailsOpen, pricingOpen, guaranteedOnly };

    const uiHandlers = {
        onToggleMainDetails: () => setMainDetailsOpen(v => !v),
        onTogglePricing: () => setPricingOpen(v => !v),
        onToggleGuaranteed: () => setGuaranteedOnly(v => !v),
        onSetAllOpen: (open: boolean) => {
            setMainDetailsOpen(open);
            setPricingOpen(open);
        },

    };

    const suggestions = {
        pickupLocationCode: { data: pickupLocationData, setQuery: setPickupLocationQuery },
        deliverToLocationCode: { data: deliverToLocationData, setQuery: setDeliverToLocationQuery },
    };

    return { formData, handlers, uiState, uiHandlers, suggestions, alternateGatewayOptions };
};

export const useFCLTruckingDetails = ({etsDate}) => {
    const featureToggle = useFeatureToggle();
    const { isVisible, getToggleValue } = featureToggle;
    const pickUpDateRef = useRef<HTMLInputElement | null>(null);
    const pickupTimeRef = useRef<HTMLInputElement | null>(null);
    const pickupTimeToRef = useRef<HTMLInputElement | null>(null);
    const chargeDescriptionRefs = useRef<(HTMLInputElement | null)[]>([]);
    const loginClientBean = useAppSelector(
        (state: any) => state.loginClientBean?.data
    );
    const { showStatus } = useStatus();
    const {
        data: pickupCodeSuggestions,
        setQuery: setPickupCodeSuggestions,
    } = useGetSuggestions(
        fclQuotePickupAndTruckerCodeSuggestionConfig(loginClientBean)
    );
    const {
        data: truckerCodeSuggestions,
        setQuery: setTruckerCodeSuggestions,
    } = useGetSuggestions(
        fclQuotePickupAndTruckerCodeSuggestionConfig(loginClientBean)
    );
    const {
        data: timeSuggestion,
        setQuery: setTimeSuggestions
    } = useGetSuggestions(
        timeSuggestionConfig(getToggleValue(CommonToggleKeys?.TIME_FORMAT))
    );
    const { data: chargeDescriptionSuggestions, setQuery: setChargeDescriptionSuggestions } = useGetSuggestions(fclQuoteChargeDescriptionSuggestionConfig(loginClientBean));
    const { data: currencySearchSuggestion, setQuery: setCurrencySearchSuggestions } = useGetSuggestions(handlingCurrencySuggestionConfig);
    const [openSearch, setOpenSearch] = useState(false);
    const [setPickupCargoAtDetailsData, toggleSetPickupCargoAtDetailsData] = useState(false);
    const [setTruckerDetailsData, toggleSetTruckerDetailsData] = useState(false);
    //    const initialData = getInitialFCLTruckingData();

    const [data, setData] = useState<FCLTruckerFormData>(getInitialFCLTruckingData);
    useEffect(() => {
        setData((prev) => ({
            ...prev,
            charges: [
                {
                    ...data.charges[0],
                    currency: loginClientBean?.localCurrency ?? "",
                },
            ],
        }));

    },[loginClientBean?.localCurrency]);

    const [showErrorMessageModal, toggleErrorMessageModal] = useState<boolean>(false);
    const [datePickerErrorMessage, setDatePickerErrorMessage] = useState<string>("");
    const millisecondsInOneDay = 24 * 60 * 60 * 1000;

    const todayDate = new Date();

    const periodOfDays = 90;

    const before = new Date(todayDate.getTime() - (periodOfDays * millisecondsInOneDay));
    const after = new Date(todayDate.getTime() + (periodOfDays * millisecondsInOneDay));
    const handleTruckingChange = <K extends keyof FCLTruckerFormData>(
        field: K,
        value: FCLTruckerFormData[K]
    ) => {
        setData((prev) => ({ ...prev, [field]: value }))
    };
    // const handleTruckingChargeChange = <K extends keyof FCLTruckerFormData>(
    //     field: K,
    //     value: FCLTruckerFormData[K],
    //     index: Number
    // ) => {
    //     setData((prev) => ({
    //         ...prev,
    //         charges: prev.charges.map((item, i) =>
    //             i === index
    //                 ? {
    //                     ...item,
    //                     [field]: value,
    //                 }
    //                 : item
    //         ),
    //     }));
    // };
    const onAdd = (index: number) => {
        const newCharge: FCLChargeItem = {
            expense: 0,
            income: 0,
            currency: loginClientBean?.localCurrency ?? "",
            chargeDescription: "",
            charge:""
        };

        setData((prev) => {
            const updatedCharges = [...prev.charges];
            updatedCharges.splice(index + 1, 0, newCharge);

            return {
                ...prev,
                charges: updatedCharges,
            };
        });
        setTimeout(() => {
            chargeDescriptionRefs.current[index + 1]?.focus();
        },0)
    };
    const onRemove = (index: number) => {
        setData((prev) => {
            let updatedCharges = [...prev.charges];
            if (updatedCharges.length === 1) {
                updatedCharges[0] = {
                    ...updatedCharges[0],
                    chargeDescription: "",
                    currency: "USD",
                    income: "",
                    expense: "",
                };
            } else {
                updatedCharges.splice(index, 1);
            }
            let totalIncome = 0;
            let totalExpense = 0;
            updatedCharges.forEach((charge) => {
                const rateOfExchange =
                    typeof charge?.rateOfExchange === "number" &&
                        charge.rateOfExchange !== 0
                        ? Number(charge.rateOfExchange)
                        : 1;
                const income =
                    charge.income !== null &&
                        charge.income !== undefined
                        ? Number(charge.income)
                        : 0;
                const expense =
                    charge.expense !== null &&
                        charge.expense !== undefined
                        ? Number(charge.expense)
                        : 0;
                totalIncome += income * rateOfExchange;
                totalExpense += expense * rateOfExchange;
            });
            return {
                ...prev,
                charges: updatedCharges,
                totalIncome,
                totalExpense,
                profitOrLoss: totalIncome - totalExpense,
            };
        });
        setTimeout(() => {
            chargeDescriptionRefs.current[0]?.focus();
        },0)
    };
    const datePickerOnBlurHandler = (event: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => {
        if ((event.target as HTMLInputElement).value != undefined && (event.target as HTMLInputElement).value != "" && (event.target as HTMLInputElement).value != null) {
            checkDateValidation({
                dateString: (event.target as HTMLInputElement).value,
                setInputValue: (val) => {
                    setData((prev) => ({ ...prev, [fieldName]: val }));
                    toggleErrorMessageModal(false);
                    setDatePickerErrorMessage("")
                },
                onDateSelection: (val) => {
                    dateSelectionHandler(val, fieldName)
                },
                setErrorMessage: (val) => {
                    toggleErrorMessageModal(true);
                    setDatePickerErrorMessage(val);
                },
            })
        }
    };

    const handleTimeSelection = (item: Record<string, unknown>, fieldName: string) => {
        setData((prev) => ({ ...prev, [fieldName]: item.time }))
    };

    const closeErrorMessageHandler = () => {
        toggleErrorMessageModal(false);
        setDatePickerErrorMessage("");
    }

    const datePickerKeyDownHandler = (event: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => {
        if (event.key === "Enter" || event.key === "Tab") {
            let error = true;
            if (/^\d{2}-\w{3}-\d{4}$/.test((event.target as HTMLInputElement).value)) {
                error = false
            }
            if (!error) {
                if (new Date((event.target as HTMLInputElement).value) < new Date(before) || new Date((event.target as HTMLInputElement).value) > new Date(after)) {
                    showStatus('warning', [`The Pickup Date should be within 90 days from today.`]);
                    setTimeout(() => {
                        // setData((prev) => ({ ...prev, [fieldName]: null }));
                        pickUpDateRef.current?.focus();
                    }, 0);
                    event.preventDefault();
                    event.stopPropagation();
                }
                if (etsDate != null) {
                    if (new Date(etsDate).setHours(0, 0, 0) < new Date((event.target as HTMLInputElement).value).setHours(0, 0, 0)) {
                        showStatus('warning', ["The Pickup Date should be less than or equal to the ETS."]);
                        setTimeout(() => {
                            setData((prev) => ({ ...prev, [fieldName]: null }));
                            pickUpDateRef.current?.focus();
                        }, 0);
                        event.preventDefault();
                        event.stopPropagation();
                    }
                }
            }
        }
    };
    const dateSelectionHandler = (selectedDate: Date | null, fieldName: string) => {
        let navigatePickupTime = true;
        const dateToCompare = new Date(selectedDate);
        if (dateToCompare < new Date(before) || dateToCompare > new Date(after)) {
            showStatus('warning', [`The Pickup Date should be within 90 days from today.`]);
            setTimeout(() => {
                pickUpDateRef.current?.focus();
            }, 0);
            navigatePickupTime = false
        }
        if (etsDate != null) {
            if (new Date(etsDate).setHours(0, 0, 0) < new Date(selectedDate).setHours(0, 0, 0)) {
                showStatus('warning', ["The Pickup Date should be less than or equal to the ETS."]);
                setTimeout(() => {
                    setData((prev) => ({ ...prev, [fieldName]: null }));
                    pickUpDateRef.current?.focus();
                }, 0);
                navigatePickupTime = false;
            }
        }
        if(navigatePickupTime)
        {
            setTimeout(() => {
                pickupTimeRef.current?.focus();
            }, 0);
        }
    }

        const timePickerOnBlurHandler = (event: React.KeyboardEvent<HTMLInputElement>, fieldName: string) => {
        if((event.target as HTMLInputElement).value != null && (event.target as HTMLInputElement).value != "")
        {
            if(getToggleValue(CommonToggleKeys?.TIME_FORMAT) == 12)
            {
                if(!(/^(0?[1-9]|1[0-2]):[0-5][0-9](am|pm)$/i).test((event.target as HTMLInputElement).value))
                {
                    showStatus('warning', ["Please enter a valid Pickup Time."]);
                    setTimeout(() => {
                        setData((prev) => ({...prev, [fieldName]: ""}));
                        if(fieldName === "pickupTime")
                        {
                            pickupTimeRef.current?.focus();
                        }
                        else
                        {
                            pickupTimeToRef.current?.focus();
                        }
                    },0)
                }
            }
            else if(getToggleValue(CommonToggleKeys?.TIME_FORMAT) == 24)
            {
                if(!(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/i).test((event.target as HTMLInputElement).value))
                {
                    showStatus('warning', ["Please enter a valid Pickup Time."]);
                    setTimeout(() => {
                        setData((prev) => ({...prev, [fieldName]: ""}));
                        if(fieldName === "pickupTime")
                        {
                            pickupTimeRef.current?.focus();
                        }
                        else
                        {
                            pickupTimeToRef.current?.focus();
                        }
                    },0)
                }
            }

        }
    };

    const handlePickupCodeSelect = (val) => {
        const value = val.selectedData.split('~');
        console.log('value :>> ', value);
        console.log('pickupEmail :>> ', value[15]);

        const formattedText = value.filter(
            (item, index) =>
                item &&
                index !== 4 &&
                index !== 6 &&
                item.trim() !== ''
        )
            .join('\n');

        const top6Lines = formattedText
            .split('\n')
            .slice(0, 6)
            .join('\n');
            console.log('CommonToggleKeys.OCN_FCL_BOOKING_RESTRUCTURING :>> ', CommonToggleKeys.OCN_FCL_BOOKING_RESTRUCTURING);
            console.log('isVisible(CommonToggleKeys.OCN_FCL_BOOKING_RESTRUCTURING) :>> ', isVisible(CommonToggleKeys.OCN_FCL_BOOKING_RESTRUCTURING));

        if(isVisible(CommonToggleKeys.OCN_FCL_BOOKING_RESTRUCTURING))
        {
            setData((prev) => ({
                ...prev, 
                pickupAtCargoCode: val.code, 
                pickupAtCargoDetails: top6Lines, 
                pickerContact: value[4], 
                pickerPhone: value[5],
                pickupEmail: value[15] || ''
             }));
        }
         else
        {
            setData((prev) => ({
                ...prev,
                pickupAtCargoCode: val.code,
                pickupAtCargoDetails: top6Lines,
                pickerContact: value[4],
                pickerPhone: value[6],
                pickupEmail: value[15] || ''
            }));
        }
    };

    const handleTruckerCodeSelect = (val) => {
      const value = val.selectedData.split('~');
      const formattedText = value
        .filter(
          (item, index) =>
            item && index !== 4 && index !== 6 && item.trim() !== ''
        )
        .join('\n');
      const top6Lines = formattedText.split('\n').slice(0, 6).join('\n');
      if (isVisible(CommonToggleKeys.OCN_FCL_BOOKING_RESTRUCTURING)) {
        setData((prev) => ({
          ...prev,
          truckerCode: val.code,
          truckerCodeDetails: top6Lines,
          truckerContact: value[4],
          truckerPhone: value[5],
          truckerEmail: value[15],
        }));
      } else {
        setData((prev) => ({
          ...prev,
          truckerCode: val.code,
          truckerCodeDetails: top6Lines,
          truckerContact: value[4],
          truckerPhone: value[6],
          truckerEmail: value[15],
        }));
      }
    };

    const handleOrganizationSearch = (val, fieldName) => {
        if(fieldName === "pickupAtCargoCode")
        {
            toggleSetPickupCargoAtDetailsData(true);
            setPickupCodeSuggestions(val.organizationCode);
        }
        else
        {
            toggleSetTruckerDetailsData(true);
            setTruckerCodeSuggestions(val.organizationCode);
            setTimeout(() => {
                handleTruckerCodeSelect(truckerCodeSuggestions[0]);
                toggleSearch();
            },1000)
        }
    };
    useEffect(() => {
        if (setPickupCargoAtDetailsData) {
            handlePickupCodeSelect(pickupCodeSuggestions[0]);
            toggleSearch();
            toggleSetPickupCargoAtDetailsData(false);
        }
    }, [pickupCodeSuggestions]);
    useEffect(() => {
        if (setTruckerDetailsData) {
            handleTruckerCodeSelect(truckerCodeSuggestions[0]);
            toggleSearch();
            toggleSetTruckerDetailsData(false);
        }
    }, [truckerCodeSuggestions]);
    const toggleSearch = () =>{
        setOpenSearch(!openSearch);
    };
    const bulkUpdateFCLTrucking = (data: Partial<FCLTruckerFormData>) => {
        setData((prev) => ({ ...prev, ...data }));
    };

    const handleTruckingChargeChange = <K extends keyof FCLTruckerFormData>(
        field: K,
        value: FCLTruckerFormData[K],
        index: number
    ) => {
        setData((prev) => ({
            ...prev,
            charges: prev.charges.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        [field]: value,
                    }
                    : item
            ),
        }));
        if (field === 'income') {
            calculation(value, index)
        }

        else if (field === "expense") {
            const charges =
                data.charges as FCLChargeItem[];
            const totalExpense = charges.reduce(
                (total, item, i) => {
                    const rateOfExchange =
                        typeof item?.rateOfExchange === "number" &&
                            item.rateOfExchange !== 0
                            ? Number(item.rateOfExchange)
                            : 1;
                    // current edited row
                    if (i === index) {
                        const currentExpense =
                            value !== ""
                                ? Number(value)
                                : 0;
                        return total + (
                            currentExpense * rateOfExchange
                        );
                    }
                    // remaining rows
                    const expenseValue =
                        item.expense !== null &&
                            item.expense !== undefined
                            ? Number(item.expense)
                            : 0;

                    return total + (
                        expenseValue * rateOfExchange
                    );
                },
                0
            );
            setData((prev) => ({
                ...prev,
                totalExpense,
                profitOrLoss:
                    Number(prev.totalIncome ?? 0) -
                    totalExpense,
            }));
        }
    };

    const calculation = (
        value: number,
        index: number
    ) => {
        const charges =
            data.charges as FCLChargeItem[];
        let expense = 0;
        const totalProfitLoss = charges.reduce(
            (total, charge, i) => {
                const rateOfExchange =
                    typeof charge?.rateOfExchange ===
                        "number" &&
                        charge.rateOfExchange !== 0
                        ? Number(charge.rateOfExchange)
                        : 1;

                expense = expense + (
                    rateOfExchange * (charge.expense !== null &&
                        charge.expense !== undefined
                        ? Number(charge.expense)
                        : 0)
                );
                // current edited row
                if (i === index) {
                    return total + (
                        rateOfExchange * value
                    );
                }
                // remaining rows
                const incomeValue =
                    charge.income !== null &&
                        charge.income !== undefined
                        ? Number(charge.income)
                        : 0;
                return total + (
                    rateOfExchange * incomeValue
                );

            },
            0
        );
        setData((prev) => ({
            ...prev,
            profitOrLoss: totalProfitLoss - expense,
            totalIncome: totalProfitLoss,
        }));
    };

    const { data: liveRateData, execute: executeRoeFetch } = useApi<
        GetCurrencyConversionRateRequest,
        GetCurrencyConversionRateResponse
    >({
        endpoint: API_ENDPOINTS.RATE_DETAILS.GET_CURRENCY_CONVERSION_RATE,
        onError: (err) => {
            console.error('Failed to fetch live ROE rates:', err.message);
        },
    });

    useEffect(() => {
        executeRoeFetch({
            schemaName: loginClientBean?.schemaName ?? '',
            company: loginClientBean?.company ?? '',
            localCurrency: loginClientBean?.localCurrency ?? '',
        });

    }, []);

    const getRateOfExchange = (
        currencyCode: string
    ): number => {
        const rateMap =
            liveRateData?.result as Record<string, number>;
        const exchangeRate =
            rateMap?.[currencyCode];

        return Number(exchangeRate) || 1;
    };

    const handleCurrencySelection = (
        res: Record<string, unknown>,
        index: number
    ) => {
        const currencyCode =
            String(res?.SUGGEST_KEY ?? '')
                .split(' - ')[0]
                .trim();

        const rateOfExchange =
            getRateOfExchange(currencyCode);

        setData((prev) => ({
            ...prev,
            charges: prev.charges.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        // currency: currencyCode,
                        rateOfExchange,
                        income: 0,
                        expense: 0,
                    }
                    : item
            ),
        }));
    };

    const handleChargeDescriptionSelection = (
        res: Record<string, unknown>,
        index: number
    ) => {
        const selectedCode = String(res?.SUGGEST_KEY ?? '');
        setData((prev) => ({
            ...prev,
            charges: prev.charges.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        chargeDescription: selectedCode,
                    }
                    : item
            ),
        }));
    };

    return {
        formData: data,
        handleTruckingChange,
        handleTruckingChargeChange,
        pickupCodeSuggestion: { data: pickupCodeSuggestions, setQuery: setPickupCodeSuggestions },
        truckerCodeSuggestion: { data: truckerCodeSuggestions, setQuery: setTruckerCodeSuggestions },
        timeSuggestion: { data: timeSuggestion, setQuery: setTimeSuggestions },
        chargeDescriptionSuggestion: { data: chargeDescriptionSuggestions, setQuery: setChargeDescriptionSuggestions },
        currencySuggestion: { data: currencySearchSuggestion, setQuery: setCurrencySearchSuggestions },
        onAdd,
        onRemove,
        datePickerOnBlurHandler,
        error: {
            showErrorModal: showErrorMessageModal,
            onClose: closeErrorMessageHandler,
            message: datePickerErrorMessage
        },
        handleTimeSelection,
        datePickerKeyDownHandler,
        dateSelectionHandler,
        pickUpDateRef,
        pickupTimeRef,
        pickupTimeToRef,
        chargeDescriptionRefs,
        timePickerOnBlurHandler,
        handlePickupCodeSelect,
        handleTruckerCodeSelect,
        handleOrganizationSearch,
        openSearch,
        toggleSearch,
        bulkUpdateFCLTrucking,
        handleCurrencySelection,
        handleChargeDescriptionSelection,
    }
};
