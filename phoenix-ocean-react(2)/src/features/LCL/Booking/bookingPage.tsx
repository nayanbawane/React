import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import { useStatus } from '@/context/statusContext';
import { ApiService } from '@/core/api/client';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { OCEAN_ENDPOINTS } from '@/core/api/config/ocean.endpoints';
import { PHOENIX_ENDPOINTS } from '@/core/api/config/phoenix.endpoints';
import { useCargoDetails } from '@/hooks/LCL/CargoDetails/useCargodetails';
import { useCustomerDetails } from '@/hooks/LCL/CustomerDetails/useCustomerdetails';
import { useDocumentDetails } from '@/hooks/LCL/DocumentDetails/useDocumentdetails';
import { bookingPopulateConfig } from '@/hooks/LCL/MainDetails/Booking/bookingPopulateHelper';
import { buildMainBookingQuoteBean } from '@/hooks/LCL/MainDetails/Booking/bookingSubmitPayloadMapper';
import { useBookingMainDetails } from '@/hooks/LCL/MainDetails/Booking/useBookingMainDetails';
import { useGetPopulateDataBooking } from '@/hooks/LCL/MainDetails/Booking/useGetPopulateDataBooking';
import { mapLoginBean } from '@/hooks/LCL/MainDetails/Quote/PopulateMapper/populateLoginBeanMapper';
import { useRateDetails } from '@/hooks/LCL/RateDetails/useRateDetails';
import { LocationContext } from '@/context/locatioContext';
import { useRouting } from '@/hooks/LCL/RoutingDetails/useRoutingDetails';
import { useDoorDeliveryAccordionContent, useTruckingDetails } from '@/hooks/LCL/TruckingDetails/useTruckingDetails';
import dayjs, { Dayjs } from 'dayjs';
import { CancelBookingApiResponse, CancelBookingRequestData, CommonToggleKeys, DocumentStatusIcons, GwtBridge, gwtBridgeInstance, IRPPopup, mapBookingQuoteBeanToMainDetails, mapCargoFromPopulate, mapCustomerFromPopulate, mapDocumentDetailsToUploadDocumentBeans, mapMainDetailsToBookingQuoteBean, mapRateDetailsFromPopulate, mapRoutingFromPopulate, mapUploadDocumentBeansToDocumentDetails, mapPickupChargesToRateRows, mapDoorDeliveryChargesToRateRows, RateDetailsIcons, ToolBar, updateBookingDocumentDetails, updateBookingMainDetails, useFeatureToggle, useIRPController, useStackProgressBar, useTabId, YiYunCfsIntegrationDetails, useGetSelections, pickupACCESSORIALS, deliveryACCESSORIALS, type AccessoriesOption, mapCustomFromPopulate, mapTruckingFromPopulate, resetBookingForm, type TmsBookingContext, type PickupCharge, num, buildBookingQuoteRoutingBean,WEB_SERVICE_ENDPOINTS,processVersioning, CopyModal, mapPickupChargeBeansToRateRows, type CargoMetrics, type Clause, BookingClauseBean, initialCargoRow, initialDimRow, initialHazRow} from 'phoenix-common-react';
import { Accordion, AccordionItem, AccordionProps, PModal ,PConfirmationModal} from 'phoenix-react-lib';
import { useCallback,useMemo, useEffect, useRef, useState , useContext } from 'react';
import CargoDetails from './CargoDetails';
import CfsCargoDetails from './CfsCargoDetails';
import CustomDetails from './CustomDetails';
import FillingDetails from './FillingDetails';
import CustomerDetails from './CustomerDetails';
import DocumentDetails from './DocumentDetails';
import LocationInfo from './LocationInfo';
import BookingMainDetails from './MainDetails';
import BookingRateDetails from './RateDetails';
import BookingRoutingDetails from './RoutingDetails';
import BookingErrorBanner from './BookingErrorBanner';
import TruckingDetails from './TruckingDetails';
import { useCustomDetails } from '@/hooks/LCL/CustomDetails/useCustomdetails';
import { useFillingDetails } from '@/hooks/LCL/FillingDetails/useFillingDetails';
import { useCfsCargoDetails } from '@/hooks/LCL/CfsCargoDetails/useCfsCargoDetails';
import PreviewDocuments from './PreviewDocuments';
import PrintLabelModal from './PrintLabel';
import { useFetchBkgEserviceDetails } from '@/hooks/LCL/BkgVersionDetails/useFetchBkgEserviceDetails';
import { copyBooking } from '@/hooks/LCL/MainDetails/Booking/copyBooking';
import { useGetPopulateDataQuote } from '@/hooks/LCL/MainDetails/Quote/useGetPopulateDataQuote';
import { quotePopulateConfig } from '@/hooks/LCL/MainDetails/Quote/quotePopulateHelper';
import { eservicePopulateFromBean } from '@/hooks/LCL/BkgVersionDetails/eservicePopulateMapper';
import { applyEserviceChangedHighlights } from '@/hooks/LCL/BkgVersionDetails/phoenixEserviceMapper';
import FilingDetails from './FilingDetails';

// PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel
const joinLines = (...args: Array<string | null | undefined>): string => {
  return args.filter(Boolean).join('\n');
};

const mapHazardous = (
  code: string | null,
  shippingType: string | null = 'L'
): string => {
  if (code === 'Y') return shippingType === 'L' ? 'Y - Yes' : 'Y';
  if (code === 'N') return shippingType === 'L' ? 'N - No' : 'N';
  if (code === 'L') return code;
  if (code === 'E') return code;
  return 'Please Select';
};

const mapDimUnit = (code: string | null): string => {
  const map: Record<string, string> = {
    I: 'Inches',
    C: 'Centimeters',
    F: 'Feet',
    M: 'Meters',
  };
  return map[code ?? ''] ?? 'Inches';
};

const mapShipmentType = (code: string | null): string => {
  const map: Record<string, string> = { L: 'LTL', F: 'FTL' };
  return map[code ?? ''] ?? code ?? 'LTL';
};

const mapDimRows = (dims: any[]) => {
  if (!dims?.length) return [];
  return dims.map((d) => ({
    ...initialDimRow,
    length: String(d.length ?? ''),
    width: String(d.width ?? ''),
    height: String(d.height ?? ''),
    unit: mapDimUnit(d.unit),
    pieces: String(d.pieces ?? ''),
    cbm: String(d.cbm ?? ''),
    cbf: String(d.cbf ?? ''),
    kg: String(d.kg ?? ''),
    lbs: String(d.lbs ?? ''),
    cls: String(d.tmsClass ?? ''),
    stackable: d.stackable === 'Y' ? 'Yes' : 'No',
    shipmentType: mapShipmentType(d.shipmentType),
    stackingType: d.stackingType ?? '',
  }));
};

const mapHazRows = (list: any[], shippingType: 'F' | 'L' = 'L') => {
  if (!list?.length) return [{ ...initialHazRow }];
  const mappedHazardousList = list.map((h) => ({
    ...initialHazRow,
    imoClass: h.hazardousCode
      ? h.hazardousCode.replace(/\.0$/, '')
      : 'Please Select',
    imoSubclass: h.imoSubClass ?? 'Please Select',
    unNumber: h.unNumber ?? '',
    imoPage: h.imcoPage ?? '',
    pkgGroup: h.packagingGroup ?? 'Please Select',
    flashpointC: String(h.flashPointCelsius ?? '0'),
    flashpointF: String(h.flashpointFahrenheit ?? '0'),
    degreeUnit: h.degreeUnit ?? 'C',
    pieces: String(h.noOfpieces ?? '0'),
    packaging: h.packaging?.toLowerCase(),
    weight: String(h.weight ?? '0'),
    properShippingName: h.shipperName1 ?? '',
    shippingName: h.shippingName ?? '',
    technicalName: h.techName1 ?? '',
    placard1: h.plackard1 ?? '',
    placard2: h.plackard2 ?? '',
    emergencyNumber: h.emergencyPhone ?? '',
    emergencyContact: h.emergencyCotact ?? '',
    quantity:
      h.quantity === 'L'
        ? 'L - Limited Quantity'
        : h.quantity === 'E'
          ? 'E - Excepted Quantity'
          : 'Please Select',
    shipperName1: h.shipperName1 ?? '',
    shipperName2: h.shipperName2 ?? '',
    hrid: h.quoteCargoHazardousId ?? ''
  }))
  return shippingType === 'F' ? mappedHazardousList.sort((a, b) => Number(a.hrid) - Number(b.hrid)) : mappedHazardousList;
};

const convertCtoF = (cVal: string) => {
  if (!cVal || cVal === '-') return '';
  const c = parseFloat(cVal);
  if (isNaN(c)) return '';
  return String(Math.round(c * 1.8 + 32));
};

const convertFtoC = (fVal: string) => {
  if (!fVal || fVal === '-') return '';
  const f = parseFloat(fVal);
  if (isNaN(f)) return '';
  return String(Math.round((f - 32) / 1.8));
};

const isReeferContainer = (typeValue: string): boolean => {
  if (!typeValue) return false;
  const val = String(typeValue).toUpperCase();
  return val.includes('RF') || 
         val.includes('RH') || 
         val.includes('RE') ||
         val.includes('REEFER') || 
         val.includes('REFRIGERATED');
};

const mapCargoFromPopulateFCL = (result: any) => {
  const cargoBean = result?.bookingQuoteBean?.bookingQuoteCargoBean;
  const hzardousList = result?.bookingHazardousBeanList ?? [];
  const fclCargoRows: any[] = [];

  const mapContainerRow = (containerNum: number, containerTypeSize: string) => {
    if (containerNum > 0 || (containerTypeSize && containerTypeSize !== '-1' && containerTypeSize !== '')) {
      return {
        ...initialCargoRow,
        numberOfContainer1: String(containerNum > 0 ? containerNum : ''),
        containerType1: containerTypeSize,
        descriptionOfGoods: joinLines(
          cargoBean?.commodity1,
          cargoBean?.commodity2,
          cargoBean?.commodity3,
          cargoBean?.commodity4,
          cargoBean?.commodity5
        ),
        kg: String(cargoBean?.weight ?? ''),
        lbs: String(cargoBean?.weightLbs ?? ''),
        cbm: String(cargoBean?.cube ?? ''),
        cbf: String(cargoBean?.cubeCbf ?? ''),
        hazardous: mapHazardous(cargoBean?.hazardousCode, 'F'),
        uom: cargoBean?.uom ?? 'M',
        docRef: cargoBean?.documentReferences ?? '-1',
        isDimension: cargoBean?.dimension ?? false,
        overLengthTransmit: cargoBean?.overLengthTransmit ?? false,
        overWeightTransmit: cargoBean?.overWeightTransmit ?? false,
        hsCode: cargoBean?.cargoHsCode ?? '',
        sensitiveCargo: cargoBean?.sensitiveCargo ?? false,
        dimRows: mapDimRows(cargoBean?.cargoDimensionBeanList),
        hazRows: mapHazRows(hzardousList, 'F'),
        temperatureC: isReeferContainer(containerTypeSize)
          ? (cargoBean?.tempratureInstruction === 'C'
            ? String(cargoBean?.temprature ?? '')
            : (cargoBean?.tempratureInstruction === 'F' && cargoBean?.temprature !== null && cargoBean?.temprature !== undefined
              ? convertFtoC(String(cargoBean.temprature))
              : ''))
          : '',
        temperatureF: isReeferContainer(containerTypeSize)
          ? (cargoBean?.tempratureInstruction === 'F'
            ? String(cargoBean?.temprature ?? '')
            : (cargoBean?.tempratureInstruction === 'C' && cargoBean?.temprature !== null && cargoBean?.temprature !== undefined
              ? convertCtoF(String(cargoBean.temprature))
              : ''))
          : '',
        ventSetting: isReeferContainer(containerTypeSize)
          ? (cargoBean?.ventSetting || 'Close')
          : 'Close',
        generatorSet: isReeferContainer(containerTypeSize)
          ? (cargoBean?.genSetCode === 'Y' ? 'Yes' : cargoBean?.genSetCode === 'N' ? 'No' : 'No')
          : 'No',
      };
    }
    return null;
  };

  const row1 = mapContainerRow(cargoBean?.container1, `${cargoBean?.containerSize1 ?? ''}-${cargoBean?.containerType1 ?? '1'}`);
  const row2 = mapContainerRow(cargoBean?.container2, `${cargoBean?.containerSize2 ?? ''}-${cargoBean?.containerType2 ?? '1'}`);
  const row3 = mapContainerRow(cargoBean?.container3, `${cargoBean?.containerSize3 ?? ''}-${cargoBean?.containerType3 ?? '1'}`);

  if (row1) fclCargoRows.push(row1);
  if (row2) fclCargoRows.push(row2);
  if (row3) fclCargoRows.push(row3);

  if (fclCargoRows.length === 0) {
    fclCargoRows.push({
      ...initialCargoRow,
      numberOfContainer1: '',
      containerType1: '',
      descriptionOfGoods: '',
      kg: '',
      lbs: '',
      cbm: '',
      cbf: '',
      hazardous: 'Please Select',
      dimRows: [],
      hazRows: [{ ...initialHazRow }],
    });
  }

  return {
    cargoRows: fclCargoRows,
    internalComment: cargoBean?.lotCommentsValue ?? '',
    oldInternalComment: cargoBean?.lotCommentsValue ?? '',
    lotRows: (cargoBean?.externalLotComments ?? []).map((item: any) => ({
      type: item.code ?? '-1',
      details: item.description ?? '',
      commentId: item.commentId,
      module: item.module,
      reference: item.reference,
      code: item.code,
      name: item.name,
      freeTextInput: item.value,
      description: item.description,
      inputUserName: item.inputUserName,
      inputDate: item.inputDate,
      updateUserName: item.updateUserName,
      updateDate: item.updateDate,
      transactionFlagStatus: item.transactionFlagStatus,
      oldCode: item.oldCode,
      oldName: item.oldName,
      oldValue: item.oldValue,
      fromQuote: item.fromQuote,
      _origType: item.code ?? '-1',
      _origDetails: item.description ?? '',
    })),
  };
};
// PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel


export default function BookingPage() {
  const [resetKey, setResetKey] = useState(0);
  const [pendingCopiedBookingData, setPendingCopiedBookingData] = useState<any>(null);
  const dispatch = useAppDispatch();

  const handleClearAll = useCallback(() => {
    dispatch(resetBookingForm());
    gwtBridgeInstance.gwtActionFromReact('SET_REFERENCE_NUMBER_ON_TAB', { referenceNumber: '' });
    setPendingCopiedBookingData(null);
    setResetKey((prev) => prev + 1);
  }, [dispatch]);

    const handleCopyBookingReset = useCallback((copiedBookingData: any) => {
      dispatch(resetBookingForm());
      setPendingCopiedBookingData(copiedBookingData);
      setResetKey((prev) => prev + 1);
    }, [dispatch]);

  const handlePendingCopiedBookingDataApplied = useCallback(() => {
    setPendingCopiedBookingData(null);
  }, []);

  return (
    <BookingPageInternal
      key={resetKey}
      onClearAll={handleClearAll}
      initialCopiedBookingData={pendingCopiedBookingData}
      onCopyBookingReset={handleCopyBookingReset}
      onPendingCopiedBookingDataApplied={handlePendingCopiedBookingDataApplied}
    />
  );
}

function BookingPageInternal({
  onClearAll,
  initialCopiedBookingData,
  onCopyBookingReset,
  onPendingCopiedBookingDataApplied,
}: {
  onClearAll: () => void;
  initialCopiedBookingData: any;
  onCopyBookingReset: (copiedBookingData: any) => void;
  onPendingCopiedBookingDataApplied: () => void;
}) {
  const { isVisible } = useFeatureToggle();
  const showCfsSplitStack = isVisible(CommonToggleKeys.CFS_SPLIT_BOOKING_INTEGRATION_DETAILS_STACK);

  const accordionIds = [
    'mainDetails',
    'documentDetails',
    'customerDetails',
    'routingDetails',
    'cargoDetails',
    'truckingDetails',
    'yiyunCfsIntegration',
    'customDetails',
    'rateDetails',
    'locationInformation',
    'fillingDetails',
    ...(showCfsSplitStack ? ['cfsCargoDetails'] : []),
  ];
  const dispatch = useAppDispatch();
  const [openItems, setOpenItems] = useState<string[]>(accordionIds);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isAllOpen = openItems.length === accordionIds.length;
  const [barBanner, setBarBanner] = useState<{ messages: string[]; autoHideMs?: number }>({ messages: [] });
  const [modalBanner, setModalBanner] = useState<{ messages: string[] }>({ messages: [] });
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [tmsBookingSuccess, setTmsBookingSuccess] = useState(false);
  const [tmsShipmentId, setTmsShipmentId] = useState('');
  const { showStatus } = useStatus();
  const { isVisibleTest, isLocationEnabled } = useFeatureToggle();
  const dataRef = useRef<Record<string, unknown>>({});
  const bookingMainDetails = useAppSelector((state) => state.booking.mainDetails);
  const bookingDocumentDetails = useAppSelector((state) => state.booking.documentDetails);
  const loginClientBean = useAppSelector((state: any) => state.loginClientBean?.data);
  const [globalConfigMap, setGlobalConfigMap] = useState<Array<Record<string, unknown>>>([]);
  const [transmittedBookingNumber, setTransmittedBookingNumber] = useState<string | null>(null);
  const [defaultClauses, setDefaultClauses] = useState<Clause[] | undefined>(undefined);
  const [autoSuggestClauseBean, setAutoSuggestClauseBean] = useState<BookingClauseBean[] | undefined>(undefined);

  const loginBean = mapLoginBean(loginClientBean);
  loginBean.userID = loginClientBean?.userId ?? 0;

  useEffect(() => {
    if (loginClientBean?.username && !bookingMainDetails.takenBy) {
      dispatch(updateBookingMainDetails({
        takenBy: isVisible(CommonToggleKeys.OCN_IMPORT_QUOTE_ENHANCEMENT)
          ? (loginClientBean?.ldapUser ?? loginClientBean?.username)
          : loginClientBean?.username,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loginClientBean?.username]);

  const mainDetail = useBookingMainDetails(loginBean);
  const documentDetail = useDocumentDetails();
  const customerDetail = useCustomerDetails();
  const [cargoFormData, setCargoFormData] = useState<any>(null);
  const cargoDetails = useCargoDetails(
    undefined,
    undefined,
    undefined,
    'BKG',
    showStatus
  );


  const cargoHazardousValues = useMemo(
    () => cargoDetails.cargoState.cargoRows.map((row) => row.hazardous),
    [cargoDetails.cargoState.cargoRows]
  );
  const routing = useRouting({ cargoHazardousValues });

  const customDetail = useCustomDetails();
  const fillingDetail = useFillingDetails(loginClientBean?.officeId,'BKG');
  const cfsCargoDetails = useCfsCargoDetails();
   const [openPreview, setOpenPreview] = useState(false);
   const [encryptedPreviewURL,setEncryptedPreviewURL] = useState('');
  const [showPrintLabelAction, setShowPrintLabelAction] = useState(false);
  const [isPrintLabelModalOpen, setIsPrintLabelModalOpen] = useState(false);
  const [showTransmitToWarehouseAction, setShowTransmitToWarehouseAction] = useState(false);
  const [showReTransmitToWarehouseAction, setShowReTransmitToWarehouseAction] = useState(false);
  const [fromTransmitToWarehouse, setFromTransmitToWarehouse] = useState(false);
  const [isTransmitModelOpen, setIsTransmitModelOpen] = useState(false);
  const [showCancelToWarehouseAction, setShowCancelToWarehouseAction] = useState(false);
  const [showCancelSOToWarehouseAction, setShowCancelSOToWarehouseAction] = useState(false);
  const [showHideBlpFilingStatusLabel, setShowHideBlpFilingStatusLabel] = useState(false);
  const [blpFilingStatus, setBlpFilingStatus] = useState("");
  const [statusBadgeText, setStatusBadgeText] = useState('');
  const [statusBadgeStatus, setStatusBadgeStatus] = useState<string>('pending');
  const [disableRoutingFields, setDisableRoutingFields] = useState({
        isWarehouse: false,
        isDeliveryReference: false,
        isOutportWarehouse: false,
  });
  const [isCopyBookingModalOpen, setIsCopyBookingModalOpen] = useState(false);

  const showBannerError = useCallback((messages: string[], autoHideMs?: number, variant: 'bar' | 'modal' = 'bar') => {
    if (messages.length === 0) {
      setBarBanner({ messages: [], autoHideMs: undefined });
      setModalBanner({ messages: [] });
      return;
    }
    if (variant === 'modal') {
      setModalBanner(prev => ({
        messages: [...new Set([...prev.messages, ...messages])],
      }));
    } else {
      setBarBanner(prev => ({
        messages: [...new Set([...prev.messages, ...messages])],
        autoHideMs: autoHideMs ?? prev.autoHideMs,
      }));
    }
  }, []);
  useEffect(() => {
    cargoDetails.addDimensionRowForEligibleCargoRows(
      routing.routingFormData.pickupNeeded,
      routing.routingFormData.terms
    );
  }, [
    routing.routingFormData.pickupNeeded,
    routing.routingFormData.terms,
    cargoDetails,
  ]);

  useEffect(() => {
    if (bookingMainDetails?.bookingQuoteType !== '') {
      setClauses(defaultClauses)
    }
  }, [bookingMainDetails.bookingQuoteType, defaultClauses]);

  const modalConfigRef = useRef({
    title: '',
    message: '',
    variant: '',
    onConfirm: null,
    onCancel: null,
    onClose: null,
  });

  const configCodeList: string[] = [
    'BOOKING_VALIDATION_FOR_SENSITIVE_CARGO_DOCUMENT',
    'BOOKING_REMOVE_TRANSMIT_TO_WAREHOUSE_ACTION',
    'BOOKING_TRANSMIT_CANCEL_BOOKING_DATA',
    'CANCEL_BOOKING_DATA_BOOKING_TRANSMIT',
  ];

  enum transmissionStatus {
    TRANSMITTED_SUCCESSFULLY_WAIT_APPROVAL_CODE = 'W',
    TRANSMITTED_SUCCESSFULLY_CODE = 'S',
    TRANSMISSION_FAILURE_CODE = 'F',
    TRANSMITTED_PENDING_CODE = 'P',
    RE_TRANSMITTED_PENDING_CODE = 'U',
    TRANSMITTED_ACCEPTED_CODE = 'A',
    TRANSMITTED_REJECTED_CODE = 'R',
  }

  const autoPopulatedClausesRef = useRef(false);
  useEffect(() => {
    const suggestions = cargoDetails.clauseSuggestions;
    if (!suggestions.length) {
      autoPopulatedClausesRef.current = false;
      return;
    }
    if (autoPopulatedClausesRef.current) return;
    autoPopulatedClausesRef.current = true;

    const currentClauses = bookingMainDetails.clauses ?? [];
    const existingCodes = new Set(currentClauses.map((c) => c.clauseCode));
    const slotsAvailable = 3 - currentClauses.length;
    if (slotsAvailable <= 0) return;

    const toAdd = suggestions
      .filter((s) => !existingCodes.has(s.code))
      .slice(0, slotsAvailable)
      .map((s) => ({ clauseCode: s.code, clauseName: s.name ?? null, clauseDesc: s.description ?? null }));

    if (!toAdd.length) return;
    dispatch(updateBookingMainDetails({ clauses: [...currentClauses, ...toAdd] }));
  }, [cargoDetails.clauseSuggestions]); // eslint-disable-line react-hooks/exhaustive-deps

  const cargoMetrics = useMemo(() => {
    const cargo = cargoDetails.cargoState.cargoRows;
    const totalWeight = cargo.reduce(
      (sum, row) => sum + Number(row.kg || 0),
      0
    );
    const totalVolume = cargo.reduce(
      (sum, row) => sum + Number(row.cbm || 0),
      0
    );
    const totalPieces = cargo.reduce(
      (sum, row) => sum + Number(row.pieces || 0),
      0
    );

    return {
      weight: totalWeight,
      cube: totalVolume,
      pieces: totalPieces,
    };
  }, [cargoDetails.cargoState]);

  const showTrucking = routing.pickupState.showPickupOrDoorDelivery;
  const showYiYunCfsIntegration = isVisible(CommonToggleKeys.OCEAN_BOOKING_SHOW_CFS_INTEGRATION_DETAILS);
  const [pickupCargoMetricsMap, setPickupCargoMetricsMap] = useState<Record<string, CargoMetrics>>({});
  const handlePickupCargoMetricsChange = useCallback((pickupId: number, metrics: CargoMetrics) => {
    setPickupCargoMetricsMap(prev => ({ ...prev, [String(pickupId)]: metrics }));
  }, []);
  const rateDetails = useRateDetails({
    dataRef,
    loginClientBean,
    routingFormData: routing.routingFormData,
    customerFormData: customerDetail.customerFormData,
    cargoFormData: cargoDetails.cargoState,
    moduleType:"BKG",
    pickupCargoMetricsMap,
    containerType: bookingMainDetails?.bookingQuoteType
  });
  const { locationData: locationInfoData } = useContext(LocationContext);
  const rateDetailsRef = useRef(rateDetails);
  rateDetailsRef.current = rateDetails;

  const cargoDetailsRef = useRef(cargoDetails);
  cargoDetailsRef.current = cargoDetails;

  const routingRef = useRef(routing);
  routingRef.current = routing;

  const customerDetailRef = useRef(customerDetail);
  customerDetailRef.current = customerDetail;
  const { data: accessorialData } = useGetSelections(pickupACCESSORIALS);
  const {data : doorAccessorialData} = useGetSelections(deliveryACCESSORIALS);
  const accessorialOptions: AccessoriesOption[] = accessorialData.map(
    (item) => ({ id: item.value, label: item.label })
  );
  const doorAccessorialOptions: AccessoriesOption[] = doorAccessorialData.map(
    (item) => ({ id: item.value, label: item.label })
  );

  const tabId = useTabId();
  const progressBar = useStackProgressBar();
  const formatRequestDate = (value: Dayjs | string | null) =>
    value ? dayjs(value).format("DD-MMM-YYYY").toUpperCase() : null;

  const truckingDetail = useTruckingDetails(
    routing.pickupState.showPickupStack ? routing.pickupState.pickups : [],
    routing.pickupState.showDoorDeliverySection
      ? routing.pickupState.doorDeliveryForm
      : undefined,
    routing.pickupState.showDoorDeliverySection
      ? routing.pickupHandlers.handleDoorDeliveryFieldChange
      : undefined
  );
  const doorDeliveryRaw = useDoorDeliveryAccordionContent(
    truckingDetail.isCombined,
    routing.pickupState.doorDeliveryChargeRows ?? []
  );
  const [direction,setDirection] = useState('Export')
  const handleFieldsChange = useCallback((stackId: string, formData: any) => {
    dataRef.current = { ...dataRef.current, [stackId]: formData };
    progressBar.handleFieldsChange(stackId, formData);
  }, [progressBar]);

  const handleMainDetailsChange = useCallback((formData: any) => {
    handleFieldsChange('mainDetails', formData);
    mainDetail.handleMainDetailsChange(formData);
  }, [mainDetail, handleFieldsChange]);

  const handleDocumentDetailsChange = (formData: any) => {
    handleFieldsChange('documentDetails', formData);
    documentDetail.handleDocumentDetailsChange(formData);
  };

  const referenceNumber = bookingMainDetails.referenceNumber?.toString() ?? null;

  const pickupsRef = useRef(routing.pickupState.pickups);
  pickupsRef.current = routing.pickupState.pickups;


  const getGenGlobalConfigMap = async () => {
    try {
      const response = await ApiService.post(WEB_SERVICE_ENDPOINTS.GEN_CONFIGURATION.GEN_GLOBAL_CONFIGURATION_LIST, configCodeList) as any;
      setGlobalConfigMap(response?.result);
    } catch (error) {
      console.error('Failed to fetch global configuration list:', error);
    }
  };

  useEffect(() => {
    if(loginClientBean){
      getGenGlobalConfigMap();
      getDefaultClauseBeanData();
    }
  }, [loginClientBean]);

  useEffect(() => {
    if (!loginClientBean) return;
    const config = gwtBridgeInstance.passPhoenixConfigurationDataToReactForBookingLCL();
    if (config?.referenceNumber) {
      gwtBridgeInstance.gwtActionFromReact('SET_REFERENCE_NUMBER_ON_TAB', {
        referenceNumber: config.referenceNumber,
      });
      handlePopulate(config.referenceNumber, '');
    }
  }, [loginClientBean]);

  useEffect(() => {
    if (fromTransmitToWarehouse) {
      handleSubmit()
    }
  }, [fromTransmitToWarehouse]);

  const cancelIRP = useIRPController({
    eventCode: ['BOOKING_CANCELLED'],
    referenceNumber,
    referenceType: 'BKG',
    title: `Booking Cancelled - Incident Reason : ${referenceNumber ?? ''}`,
    prefetch: true,
    onConfirmed: async (formData) => {
      const lb = mapLoginBean(loginClientBean);
      const routing = (dataRef.current['routingDetails'] as any) ?? {};
      const customer = ((dataRef.current['customerDetails'] as any)?.lclForm) ?? {};

      const cancelPayload: CancelBookingRequestData = {
        requestData: {
          loginBean: lb,
          bookingEntityBean: {
            shipmentType: 'LCL',
            referenceNumber: referenceNumber ?? '',
            customerCode: customer.customerCode ?? '',
            customerAlias: customer.customerAlias ?? '',
            customerName: customer.customerName ?? '',
            controllingEntity: customer.controllingEntity ?? '',
            dischargeCode: routing.dischargeCode ?? '',
            portOfLoadingCode: routing.loadCode ?? '',
            placeOfDeliveryCode: routing.finalCFSCode ?? '',
            eventCompletionTime: Date.now(),
            status: 3,
            bookingStatus: 'D',
            failureBecauseOf: formData.causedBy,
            serviceFailureCatagory: formData.selectedCategory,
            delayReason: formData.selectedReason,
            serviceFailureDetail: formData.incidentDetails,
            serviceFailureLocalDetails: formData.incidentDetails,
            eventCompletedUser: lb.ldapUsername,
            eventCompletedUserOffice: lb.officeCode,
            eventCompletedUserCompany: lb.userCompany,
            reasonProvidedUser: lb.ldapUsername,
            reasonProvidedUserOffice: lb.officeCode,
            reasonProvidedUserCompany: lb.userCompany,
            schema: lb.userSchemaName,
            office: lb.officeCode,
            country: lb.countryName,
            countryCode: lb.countryCode,
            region: loginClientBean?.officeRegionCode ?? '',
            receivedVia: bookingMainDetails.receivedVia ?? 'P',
            monitorBkgNrCfsUpdate: true,
          },
          bookingQuoteRoutingBean: {
            originCode: routing.originCode ?? '',
            loadCode: routing.loadCode ?? '',
            dischargeCode: routing.dischargeCode ?? '',
            destinationCode: routing.destinationCode ?? '',
            destinationName: routing.destinationName ?? '',
            finalCFSCode: routing.finalCFSCode ?? '',
            wwaSchedule: false,
            bookingQuoteChargeBeanList: [],
            manufacturerDetailsBean: {
              referenceType: null,
              referenceNumber: null,
              totalAddedManufacturerNameList: [],
              newlyAddedManufacturerNameList: [],
              removedManufacturerNameList: [],
              updatedManufacturerNameMapList: [],
              previousManufacturerNameList: [],
              previousManufacturerNameMap: {},
            },
          },
          multipleBookingEntityBean: {
            bookingEntityBeanList: [],
            emtCustomer: '',
            office: '',
            country: '',
            countryCode: '',
            region: '',
            agent: '',
            entity: '',
            eventType: '',
            eventAction: '',
            isTest: '',
            eventModule: '',
            warehouseCode: '',
            officeTimeZone: '',
            officeName: '',
            messageGenerationTime: 0,
          },
        },
      };

      try {
        const response = await ApiService.post(
          OCEAN_ENDPOINTS.INCIDENT.CANCEL_BOOKING,
          cancelPayload
        ) as CancelBookingApiResponse;

        if (response.data.success === 1) {
           const cancelResponse =  await ApiService.post(API_ENDPOINTS.BOOKING.CANCEL_BOOKING,{
            bookingNumber: referenceNumber,
            notes: '',
            bookingType: 'LCL',
            handlingOffice: lb.officeCode,
            isCallFromBKGEService: false
          });
          if(cancelResponse.data.success === 1){
            showStatus('success', [cancelResponse.data.message ?? `Booking ${referenceNumber} cancelled successfully.`]);

            void (async () => {
              try {
                const warehouseCode = routing.warehouse ?? '';
                const outerTogglesMet =
                  (isVisibleTest(CommonToggleKeys.TRANSMIT_BOOKING_TO_THIRD_PARTY) &&
                    isVisibleTest(CommonToggleKeys.TRANSMIT_CANCEL_BOOKING_TO_JYD)) ||
                  isVisibleTest(CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY);
                const isWarehouseConfigured = isVisible(CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY)
                  ? isLocationEnabled(warehouseCode, 'TRANSMIT_BOOKING_DATA_TO_WAREHOUSE')
                  : true;
                if (outerTogglesMet && isWarehouseConfigured && warehouseCode) {
                  const wResult = await ApiService.post(PHOENIX_ENDPOINTS.BOOKING.CANCEL_WAREHOUSE_TRANSMISSION, {
                    bookingReference: referenceNumber,
                    outportWarehouseCode: '',
                    deliveryReference: routing.deliveryReference ?? '',
                    warehouseName: warehouseCode,
                    isFromCancelSO: false,
                  }) as any;
                  if (wResult?.data?.result === 'SUCCESS') {
                    showStatus('success', [`Booking ${referenceNumber} cancel transmitted to warehouse successfully.`]);
                  } else {
                    showStatus('error', [`Warehouse transmission failed for booking ${referenceNumber}.`]);
                  }
                }
              } catch { showStatus('error', ['An error occurred while cancelling Warehouse transmission.']); }
            })();

            void (async () => {
              try {
                if (isVisibleTest(CommonToggleKeys.ALLOW_BOOKING_TRANSMISSION_TO_SCAN_SHIPPING) && transmittedBookingNumber) {
                  await ApiService.post(PHOENIX_ENDPOINTS.BOOKING.CANCEL_ORIGIN_BOOKING, {
                    transmittedBookingNumber: Number(transmittedBookingNumber),
                    receivedFromName: bookingMainDetails.receivedFromName ?? '',
                    officeCode: loginClientBean?.officeCode ?? '',
                  });
                }
              } catch { showStatus('error', ['An error occurred while cancelling the origin booking.']); }
            })();

            void (async () => {
              try {
                if (isVisibleTest(CommonToggleKeys.OCEAN_BKG_TRK_TRANSMISSION_ENABLE)) {
                  const trkResult = await ApiService.post(PHOENIX_ENDPOINTS.BOOKING.CANCEL_TRK_REQUEST, {
                    mainBookingQuoteBean: {
                      bookingQuoteBean: { referenceNumber: Number(referenceNumber) },
                      multiplePickupDetailBeanList: pickupsRef.current,
                    },
                  }) as any;
                  const trkList: Array<Record<string, string>> = trkResult?.data?.result ?? [];
                  trkList.forEach((entry) => {
                    const { pickupId, truckerCode, truckerName, cancelRequestResult } = entry;
                    if (pickupId && truckerCode && truckerName) {
                      if (cancelRequestResult === 'SUCCESS') {
                        showStatus('success', [`Cancel Trucking Instruction Transmitted Successfully for Pickup ID ${pickupId}, Trucker: ${truckerCode} - ${truckerName}`]);
                      } else {
                        showStatus('error', [`Cancel Trucking Instruction Transmitted Failed for Pickup ID ${pickupId}, Trucker: ${truckerCode} - ${truckerName}`]);
                      }
                    }
                  });
                }
              } catch { showStatus('error', ['An error occurred while cancelling TRK request.']); }
            })();
           }
           else{
            showStatus('error', [cancelResponse.data.message ?? 'Failed to cancel booking.']);
          }
        } else {
          showStatus('error', [response.data.message ?? 'Failed to cancel booking.']);
        }
      } catch {
        showStatus('error', ['An error occurred while cancelling the booking.']);
      }
    },
  });

  function getFileDownloadUrl(): string {
    const uploadDocumentsBean = (populateData as any)?.mainBookingQuoteBean?.uploadDocumentsBeanList;
    const encryptedPreviewURL = (populateData as any)?.mainBookingQuoteBean?.encryptedPreviewURL;

    const fileBaseUrl = encryptedPreviewURL.substring(0, encryptedPreviewURL.indexOf("?"));
    const params = new URLSearchParams({
      userId: loginClientBean.userId,
      download: "Y",
      generate: "Y",
      schemaName: loginClientBean.schema,
      referenceNo: encodeURIComponent(uploadDocumentsBean[0].referenceNumber),
      documentId: uploadDocumentsBean[0].documentId,
    });

    if (loginClientBean.isToggleCustomer) {
      params.append("customer", "");
    }

    return `${fileBaseUrl}?${params.toString()}`;
  }

  const eDocsIRP = useIRPController({
    eventCode: ['BKG_CNF_BKG_CONFIRM'],
    referenceNumber,
    referenceType: 'BKG',
    title: `Send Document - Incident Reason : ${referenceNumber ?? ''}`,
    prefetch: true,
    onConfirmed: () => openDocuments(),
  });
  
  // AccuRate guard — only fire when ratingType is 'A'
  const isAccuRateActive = () =>
    (dataRef.current?.rateDetails as any)?.ratingType === 'A';

  // Customer: customerCode + prepaidCollect are nested inside lclForm
  const customerTriggerChanged = (newData: any, prev: any) =>
    newData?.lclForm?.customerCode !== prev?.lclForm?.customerCode ||
    newData?.lclForm?.prepaidCollect !== prev?.lclForm?.prepaidCollect;

  const handleCustomerDetailsChange = (formData: any) => {
    const prev = dataRef.current?.customerDetails;
    handleFieldsChange('customerDetails', formData);
    if (isAccuRateActive() && customerTriggerChanged(formData, prev))
      (rateDetails.defaultState as any).accurateRate.handleAccurateRate();
  };

  const handleRoutingDetailsChange = (formData: any) => {
    handleFieldsChange('routingDetails', formData);
  };

  const payload = () => {
    const mainDetails = mapMainDetailsToBookingQuoteBean(bookingMainDetails);

    const isNewEntry = !mainDetails?.referenceNumber || num(mainDetails?.referenceNumber) === 0;

    const documentDetails = mapDocumentDetailsToUploadDocumentBeans(bookingDocumentDetails, {
      referenceNumber: bookingMainDetails?.referenceNumber?.toString() ?? "",
      referenceObject: "BKG",
      transactionalFlag: isNewEntry ? 'N' : 'U',
      transactionFlagStatus: isNewEntry ? 'N' : 'U',
    });
    const result =  {
      mainBookingQuoteBean: buildMainBookingQuoteBean(
        mainDetails,
        documentDetails,
        dataRef.current['customerDetails'] || {},
        {
          routingFormData:
            dataRef.current['routingDetails'] ||routing.routingFormData,
            pickupForms: routing.pickupState.truckingPickupForms,
            pickupTruckerForms: routing.pickupState.pickupTruckerForms,
            doorDeliveryForm: routing.pickupState.doorDeliveryForm,
        },
        dataRef.current['cargoDetails'] || {
          cargoRows: cargoDetails.cargoState.cargoRows,
          lotRows: cargoDetails.lotState.lotRows,
          flags: cargoDetails.flagState.flags,
          internalComment: cargoDetails.instructionState.internalComment,
          loadingInstruction: cargoDetails.instructionState.loadingInstruction,
          warehouseInstruction:
            cargoDetails.instructionState.warehouseInstruction,
        },
        dataRef.current['rateDetails'] || {},
        dataRef.current['customDetails'] || {},
        loginClientBean,
        undefined,
        isVisible
      ),
      loginBean: loginBean,
    }
    delete result.loginBean.userId; // this is to handle phoenix use case where userID is expected instead of userId. This line can be removed once phoenix is updated to use userId
    const fillingData = (dataRef.current['fillingDetails'] ?? fillingDetail.fillingDetailsFormData) as any;
    (result.mainBookingQuoteBean as any).bookingQuoteBean.bookingQuoteCustomFilingBean = {
      filingType: fillingData?.fillingBy ?? '',
      filingBy: fillingData?.customsAdvancedFiling ?? '',
    };
    return result;
  }

  const {
    data: populateData,
    loading: populateLoading,
    fetchPopulateData,
  } = useGetPopulateDataBooking({
    ...bookingPopulateConfig,
    loginBean,
  });

  const {
      data: populateQuoteData,
      loading: populateQuoteLoading,
      fetchPopulateData: fetchPopulateQuoteData,
    } = useGetPopulateDataQuote({
      ...quotePopulateConfig,
      loginBean,
    });

  useEffect(() => {
    if (populateData?.mainBookingQuoteBean) {
      populateFormWithData(populateData.mainBookingQuoteBean);
    }

    if (populateQuoteData?.result) {
      populateQuoteData.result.bookingQuoteBean = {
        ...populateQuoteData.result.bookingQuoteBean,
        referenceNumber: 0,
      }
      populateQuoteData.result?.uploadDocumentsBeanList?.forEach((doc: any) => {
        doc.documentId = null;
        doc.documentFileId = null;
      });
      
      populateFormWithData(populateQuoteData?.result);
    }

  }, [populateData, populateQuoteData, dispatch]);

  useEffect(() => {
    if (initialCopiedBookingData?.bookingQuoteBean) {
      populateFormWithData(initialCopiedBookingData);
      onPendingCopiedBookingDataApplied();
    }
  }, [initialCopiedBookingData, onPendingCopiedBookingDataApplied]);

  const populateFormWithData = (mainBookingQuoteBean: any) => {
    const result = mainBookingQuoteBean;
    const mainBean = result?.bookingQuoteBean;
    if (!mainBean) return;
    setShowPrintLabelAction(true);

    const mappedMain = mapBookingQuoteBeanToMainDetails(mainBean, result?.amendmentCodeBean, loginBean);
    setEncryptedPreviewURL(result.encryptedPreviewURL);
    dispatch(updateBookingMainDetails({
      ...mappedMain,
      isLotReceived: result?.isLotReceived ?? false,
    }));
    handleFieldsChange('mainDetails', mappedMain);
    gwtBridgeInstance.gwtActionFromReact('SET_REFERENCE_NUMBER_ON_TAB', { referenceNumber: mappedMain.referenceNumber?.toString() ?? '' });

    const transmittedNum = (mainBean as any)?.transmittedBookingNumber;
    if (transmittedNum) setTransmittedBookingNumber(String(transmittedNum));

    const mappedDocuments = mapUploadDocumentBeansToDocumentDetails(
      result?.uploadDocumentsBeanList
    );
    dispatch(updateBookingDocumentDetails(mappedDocuments));

    const mappedRouting = mapRoutingFromPopulate(result);
    handleFieldsChange('routingDetails', mappedRouting);
    routing.bulkUpdateRouting(mappedRouting);
    if (mappedRouting.pickupNeeded) {
      routing.pickupHandlers.setPickupNeeded(mappedRouting.pickupNeeded);
    }

    const mappedCustomer = mapCustomerFromPopulate(result?.bookingQuoteBean);
    if (mappedCustomer) {
      handleFieldsChange('customerDetails', mappedCustomer);
      customerDetail.bulkUpdateCustomer(mappedCustomer);
    }

    const mappedCustomDetails = mapCustomFromPopulate(result?.bookingQuoteBean);
    if (mappedCustomDetails) {
      customDetail.bulkUpdateCustom(mappedCustomDetails);
      handleFieldsChange('customDetails', mappedCustomDetails);
    }

    const customFilingBean = (mainBean as any)?.bookingQuoteCustomFilingBean;
    if (customFilingBean) {
      const mappedFillingDetails = {
        fillingBy: customFilingBean.filingType ?? '',
        customsAdvancedFiling: customFilingBean.filingBy ?? '',
      };
      fillingDetail.bulkUpdate(mappedFillingDetails);
      handleFieldsChange('fillingDetails', mappedFillingDetails);
    }

    // PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel
    const mappedCargo = result?.bookingQuoteBean?.bookingQuoteType === 'F'
      ? mapCargoFromPopulateFCL(result)
      : mapCargoFromPopulate(mainBean);
    // PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel
    handleFieldsChange('cargoDetails', mappedCargo);
    cargoDetails.bulkPopulateCargo(mappedCargo);

    const mappedTrucking = mapTruckingFromPopulate(result);
        routing.bulkUpdateTrucking(mappedTrucking);

    const mappedRateDetails = mapRateDetailsFromPopulate(
      result?.bookingQuoteChargeBeanList,
      mainBean
    );
    handleFieldsChange('rateDetails', mappedRateDetails);
    rateDetails.handlers.handleRatingTypeChange(mappedRateDetails.ratingType);
    rateDetails.handlers.handleRoeTypeChange(mappedRateDetails.roeType);
    rateDetails.handlers.handleROERowsChange(
      mappedRateDetails.rateOfExchange.roeRows
    );
    rateDetails.handlers.handleRateDetailsChargesChange(
      mappedRateDetails.charges.rateDetails
    );
  };

  // PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel
  const handleBlur = (
    numberOfContainer: string,
    containerType: string,
    index: number,
    changedField: 'numberOfContainer' | 'containerType'
  ) => {
    cargoDetails.cargoHandlers.valueIsChanged?.(
      false,
      numberOfContainer,
      containerType,
      rateDetails.defaultState
    );
  };
  // PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel

  const versioncount =
    (populateData as any)?.mainBookingQuoteBean?.versionCount ?? 0;

  const { data, loading } = useFetchBkgEserviceDetails({
    module: 'Ocean',
    shipmenttype: 'MBKG',
    referenceNumber: referenceNumber,
    shouldFetch: versioncount > 0,
    commonBean: {
      userSchemaName: loginBean.userSchemaName,
      officeCode: loginBean.officeCode,
      userFullname: loginBean.userFullname,
    },
  });

  useEffect(() => {
    if (versioncount > 0 && Object.keys(data).length > 0 && !loading) {
      dispatch(
        processVersioning({
          doDisplayVersionButton: true,
          versionPopupParameters: data,
        })
      );
    }
  }, [versioncount, data, loading, dispatch]);

  const handlePopulate = (referenceNumber: string, quoteNumber: string) => {
    if(referenceNumber){
      fetchPopulateData(referenceNumber);
    }

    if(quoteNumber){
      fetchPopulateQuoteData(quoteNumber);
    }
  };

  const handlePopulateReference = (referenceNumber: string) => {
    dispatch(updateBookingMainDetails({ referenceNumber }));
  };

  const handleTmsBookingSuccess = (shipmentId: string) => {
    setTmsBookingSuccess(true);
    setTmsShipmentId(shipmentId);
  };

  const handlePickupChargesChange = useCallback((pickupId: number, charges: PickupCharge[], truckerInfo?: { truckerName?: string; truckCity?: string; truckZipCountry?: string }) => {
    const { formData, handlers, defaultState } = rateDetailsRef.current;
    const currentRows = formData.charges.rateDetails;
    const nonPickupRows = currentRows.filter(
      (row) => !(row.truckChargeGroup === 'PTC' && (!row.pickupId || row.pickupId === String(pickupId)))
    );
    const newPtcRows = mapPickupChargesToRateRows(
      charges,
      pickupId,
      formData.rateOfExchange.baseCurrency,
      truckerInfo
    );
    handlers.handleRateDetailsChargesChange([...nonPickupRows, ...newPtcRows]);
    const chargeCurrency = charges.find(c => c.id !== -1)?.expenseCurrency;
    if (chargeCurrency && chargeCurrency !== defaultState.invoiceCurrency) {
      handlers.setInvoiceCurrency(chargeCurrency);
    }
  }, []);

  const handleDoorDeliveryChargesChange = useCallback((charges: PickupCharge[]) => {
    const { formData, handlers, defaultState } = rateDetailsRef.current;
    const currentRows = formData.charges.rateDetails;
    const nonDtcRows = currentRows.filter((row) => row.truckChargeGroup !== 'DTC');
    const newDtcRows = mapDoorDeliveryChargesToRateRows(
      charges,
      formData.rateOfExchange.baseCurrency,
    );
    handlers.handleRateDetailsChargesChange([...nonDtcRows, ...newDtcRows]);
    const chargeCurrency = charges.find(c => c.id !== -1)?.expenseCurrency;
    if (chargeCurrency && chargeCurrency !== defaultState.invoiceCurrency) {
      handlers.setInvoiceCurrency(chargeCurrency);
    }
  }, []);

  const oneDocsClick = () => {
    const schemaName =loginBean.userSchemaName;
    var openEdocsScreen: any = {};
    openEdocsScreen.accessCode = 'edocsManagement';
    openEdocsScreen.type = 'BKG';
    openEdocsScreen.refNo =
      bookingMainDetails.referenceNumber?.toString() ?? '10906448';
    openEdocsScreen.module = 'BKG';
    openEdocsScreen.application ='O';
    openEdocsScreen.fullType = 'Booking Number';
    openEdocsScreen.refreshTab=true;

    GwtBridge.gwtActionFromReact("OPEN_EDOCS_SCREEN", openEdocsScreen);
  };

  const handleSubmit = async () => {
    setErrorMessages([]);
    setIsSubmitting(true);
    setIsTransmitModelOpen(false)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await ApiService.post(PHOENIX_ENDPOINTS.BOOKING.VALIDATE_AND_SAVE_DATA, payload()) as any;

      const referenceNumber = response?.data?.bookingQuoteBean?.referenceNumber;
      if (referenceNumber) {
        showStatus('success', [`Booking ${referenceNumber} saved successfully!`]);
        populateFormWithData(response?.data);
        transmitToWarehouse(response?.data);
      } else {
        showStatus('error', ['Booking saved but reference number was not returned.']);
      }
    } catch (error) {
      console.error('Failed to submit quote:', error);
      showStatus('error', ['An error occurred while saving the quote.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearAll = () => {
    onClearAll();
  };

  const handleCopyBooking = () => {
    setIsCopyBookingModalOpen(true);
  };

  const handlePrintLabel = useCallback(() => {
    if (bookingMainDetails.preliminaryBookingStatus?.trim().toUpperCase() === 'I') {
      showStatus('warning', ['You cannot print label for a preliminary booking.']);
      return;
    }
    setIsPrintLabelModalOpen(true);
  }, [bookingMainDetails.preliminaryBookingStatus, showStatus]);

  const handleCopyBookingConfirm = async (referenceNumber: string) => {
    if (!referenceNumber.trim()) {
      showStatus('error', ['Please enter a booking reference to copy']);
      return;
    }
    try {
      const response = await fetchPopulateData(referenceNumber.trim(), {
        updateState: false,
      });
      const bookingToCopy = response?.mainBookingQuoteBean;

      if (!bookingToCopy?.bookingQuoteBean) {
        showStatus('error', ['No booking data was returned for the selected reference']);
        return;
      }

      const copiedBookingData = copyBooking(bookingToCopy, loginClientBean, isVisible, {
        takenBy:
          loginClientBean?.ldapUser ??
          loginClientBean?.username ??
          bookingMainDetails.takenBy ??
          null,
      });
      if (!copiedBookingData?.bookingQuoteBean) {
        showStatus('error', ['Failed to prepare booking data for copy']);
        return;
      }

      setIsCopyBookingModalOpen(false);
      showStatus('success', ['Booking copied successfully']);
      onCopyBookingReset(copiedBookingData);
    } catch (error) {
      console.error('Error copying booking:', error);
      showStatus('error', ['Failed to copy booking']);
    }
  };

  const registerFields = (stackId: string, fields: string[]) => {
    progressBar.registerFields(stackId, fields);
  };

  const progressOf = (stackId: string) => progressBar.progressOf(stackId);

  useEffect(() => {
    if (routing.pickupState.showPickupOrDoorDelivery) {
      setOpenItems((prev) =>
        prev.includes('truckingDetails') ? prev : [...prev, 'truckingDetails']
      );
    }
  }, [routing.pickupState.showPickupOrDoorDelivery]);

  const suggestClauseIconClick = async () => {
    const cargo = cargoDetails?.cargoState?.cargoRows;
    // const bookingClauseBean = {
    const clauseBean: BookingClauseBean = {
      shipmentType: bookingMainDetails?.bookingQuoteType,
      handlingOffice: bookingMainDetails?.handlingOffice ?? "",
      pickupNeeded: routing?.routingFormData?.pickupNeeded ?? "N",

      // ...(isVisible(CommonToggleKeys.BOOKING_TRANSSHIPMENT_PORT)
      // ? {
      loadPort: routing?.routingFormData?.portOfLoadingCode,
      portOfDischarge: routing?.routingFormData?.portOfDischargeCode,
      originCode: routing?.routingFormData?.portOfRecipientCode,
      originName: routing?.routingFormData?.portOfRecipientName,
      loadPortName: routing?.routingFormData?.portOfLoadingName,
      //   }
      // : {
      //     loadPort: routing?.routingFormData?.portOfLoading,
      //     portOfDischarge: routing?.routingFormData?.portOfDischarge,
      //     originCode: routing?.routingFormData?.originInput,
      //     originName: routing?.routingFormData?.portOfRecipientName,
      //     loadPortName: routing?.routingFormData?.portOfLoadingName,
      //   }),
      oldOriginCode: populateData?.mainBookingQuoteBean?.bookingQuoteBean?.bookingQuoteRoutingBean?.oldOriginCode ?? "",
      oldLoadPortName: populateData?.mainBookingQuoteBean?.bookingQuoteBean?.bookingQuoteRoutingBean?.oldLoadName ?? "",
      schemaName: loginClientBean?.schema,
      officeId: loginClientBean?.officeId,

      weight: cargo[0]?.kg ?? "0",
      weightCbf: cargo[0]?.cbf ?? "0.0",
      weightLbs: cargo[0]?.lbs ?? "0.0",

      length: cargo[0]?.dimRows.reduce((sum, dim) => sum + parseFloat(dim.length || 0), "0.0").toString(),

      hazardous: cargo[0]?.hazardous?.split('-')[0].trim() ?? "N",
      oldTransshipmentVia: populateData?.mainBookingQuoteBean?.bookingQuoteBean?.shipmentType ?? "",

      loadPortCountry: "",
      portOfDischargeCountry: "",
      transshipmentVia: "",
      // }
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const response = await ApiService.post(API_ENDPOINTS.BOOKING.GET_SUGGESTED_CLAUSES, clauseBean) as any;
      const result = response?.data?.result;

      const clauseList: Clause[] = bookingMainDetails.clauses;
      const updatedClauseList = [...clauseList];

      clauseBean.loadPortCountry = result.loadPortCountry ?? "";
      clauseBean.portOfDischargeCountry = result.dischargePortCountry ?? "";
      clauseBean.transshipmentVia = result.transShipmentVia ?? "";

      if (clauseBean.length == 0) {
        clauseBean.length = null;
      }

      if (result && result.bookingClauseBean.length > 0) {
        result.bookingClauseBean.forEach((clause: Clause) => {
          const bkgClause: Clause = {
            clauseCode: clause.clauseCode,
            clauseName: clause.clauseName,
            clauseNameLocale: clause.clauseNameLocale,
            clauseDesc: clause.clauseDesc,
            clauseDescLocale: clause.clauseDescLocale,
            sequence: clause.sequence,
          }
          if (clauseList && !clauseList.some(c => c.clauseCode === bkgClause.clauseCode)) {
            updatedClauseList.push(bkgClause);
          }
        });

        if (updatedClauseList && updatedClauseList.length > 5) {
          showStatus('warning', ['Only 5 item(s) allowed, Please Remove few of the Manually entered Clause(s) and Re-try.']);
        } else {
          setClauses(updatedClauseList);
        }
      }

      if (updatedClauseList && updatedClauseList.length <= 5) {
        setAutoSuggestClauseBean(clauseBean);
      }

    } catch (error) {
      console.error("Error occurred while fetching clauses on icon click", error);
    }
  }

  const accordionItems: AccordionItem[] = [
    {
      id: accordionIds[0],
      label: 'Main Details',
      content: (
        <BookingMainDetails
          onRegisterFields={(fields) => registerFields('mainDetails', fields)}
          onFieldsChange={handleMainDetailsChange}
          onPopulateData={handlePopulate}
          showStatus={showStatus}
          preloadedClauseSuggestions={cargoDetails.clauseSuggestions}
          suggestClauseIconClick={suggestClauseIconClick}

        />
      ),
      progress: true,
      icon: false,
      progressValue: progressOf('mainDetails'),
    },
    {
      id: accordionIds[1],
      label: 'Document Details',
      content: (
        <DocumentDetails
          onRegisterFields={(fields) =>
            registerFields('documentDetails', fields)
          }
          onFieldsChange={handleDocumentDetailsChange}
          getFileDownloadUrl={getFileDownloadUrl}
        />
      ),
      progress: true,
      icon: true,
      progressValue: 100,
      iconContent: <DocumentStatusIcons />,
    },
    {
      id: accordionIds[2],
      label: 'Customer Details',
      content: (
        <CustomerDetails
          moduleType='BKG'
          containerType={bookingMainDetails?.bookingQuoteType}
          direction={direction}
          rateDetails={rateDetails}
          customerDetail={customerDetail}
          shipmentType={bookingMainDetails?.bookingQuoteType}
          portOfDischarge={
            routing.pickupState.routingFormData.portOfDischargeCode
          }
          eoriPortConditions={{
            // TODO: replace with isEuropeRegion() utility once implemented
            isPortOfLoadInEurope: false,
            isDischargePortInEurope: false,
            isFrobCargo: false,
            isDestinationInEurope: false,
          }}
          onRegisterFields={(fields) =>
            registerFields('customerDetails', fields)
          }
          onFieldsChange={(formData) =>
            handleFieldsChange('customerDetails', formData)
          }
        />
      ),
      progress: true,
      icon: false,
      progressValue: progressOf('customerDetails'),
    },
    {
      id: 'fillingDetails',
      label: 'Filling Details',
      content: (
        <FillingDetails
          fillingDetail={fillingDetail}
          onRegisterFields={(fields) => registerFields('fillingDetails', fields)}
          onFieldsChange={(formData) => handleFieldsChange('fillingDetails', formData)}
        />
      ),
      progress: true,
      icon: false,
      progressValue: progressOf('fillingDetails'),
    },
    {
      id: accordionIds[3],
      label: 'Routing Details',
      content: (
        <BookingRoutingDetails
          showBannerError={showBannerError}
          routing={routing}
          rateDetails={rateDetails}
          onRegisterFields={(fields: any) =>
            registerFields('routingDetails', fields)
          }
          onFieldsChange={(formData: any) =>
            handleFieldsChange('routingDetails', formData)
          }
          accessorialOptions={accessorialOptions}
          doorAccessorialOptions ={doorAccessorialOptions}
          disableRoutingFields={disableRoutingFields}
        />
      ),
      progress: true,
      icon: false,
      progressValue: progressOf('routingDetails'),
      fieldFilledMap: {},
    },
    ...(showCfsSplitStack
      ? [
        {
          id: 'cfsCargoDetails',
          label: 'CFS Cargo Details',
          content: (
            <CfsCargoDetails
              cfsCargoDetails={cfsCargoDetails}
              rateDetails={rateDetails}
              referenceNumber={bookingMainDetails.referenceNumber ?? undefined}
            />
          ),
          progress: true,
          icon: false,
          progressValue: 100,
        },
      ]
      : []),
    {
      id: accordionIds[4],
      label: 'Cargo Details',
      content: (
        <CargoDetails
          cargoDetails={cargoDetails}
          rateDetails={rateDetails}
          moduleType="BKG"
          onRegisterFields={(fields) => registerFields('cargoDetails', fields)}
          onFieldsChange={(formData) => handleFieldsChange('cargoDetails', formData)}
          // PHX-131742: FCL Booking: cargo details section changes - Start: Added by dhapatel
          shippingType={bookingMainDetails?.bookingQuoteType && bookingMainDetails?.bookingQuoteType !== '-1' ? bookingMainDetails?.bookingQuoteType : 'L'}
          containerTypeSelect={cargoDetails.containerTypeSelect}
          fclhazardousSelect={cargoDetails.fclhazardousSelect}
          routingRef={routing.routingRef}
          onBlur={handleBlur}
          // PHX-131742: FCL Booking: cargo details section changes - End: Added by dhapatel
        />
      ),
      progress: true,
      icon: false,
      progressValue: progressOf('cargoDetails'),
    },
    ...(showYiYunCfsIntegration
      ? [
          {
            id: 'yiyunCfsIntegration',
            label: 'CFS Integration Details',
            content: <YiYunCfsIntegrationDetails />,
            progress: true,
            icon: false,
            progressValue: progressOf('yiyunCfsIntegration'),
          },
        ]
      : []),
    {
      id: accordionIds[5],
      label: 'Filing Details',
      content: (
        <FilingDetails
          // filingDetails={filingDetails}
          onRegisterFields={(fields) => registerFields('filingDetails', fields)}
          onFieldsChange={(formData) => handleFieldsChange('filingDetails', formData)}
        />
      ),
      progress: true,
      icon: false,
      progressValue: progressOf('customDetails'),
    },

    {
      id: accordionIds[6],
      label: 'Custom Details',
      content: (
        <CustomDetails
          showSCACCode={true}
          customDetail={customDetail}
          onRegisterFields={(fields) => registerFields('customDetails', fields)}
          onFieldsChange={(formData) => handleFieldsChange('customDetails', formData)}
        />
      ),
      progress: true,
      icon: false,
      progressValue: progressOf('customDetails'),
    },
    ...(showTrucking
      ? [
        {
          id: accordionIds[7],
          label: 'Trucking Details',
          progress: true,
          icon: true,
          progressValue: progressOf('truckingDetails'),
          content: (
            <TruckingDetails
              moduleType="LCL"
              doorDeliveryRaw={doorDeliveryRaw}
              routing={routing}
              pickups={
                routing.pickupState.showPickupStack
                  ? routing.pickupState.pickups
                  : []
              }
              doorDeliveryFormData={
                routing.pickupState.showDoorDeliverySection
                  ? routing.pickupState.doorDeliveryForm
                  : undefined
              }
              onDoorDeliveryFormDataChange={
                routing.pickupState.showDoorDeliverySection
                  ? routing.pickupHandlers.handleDoorDeliveryFieldChange
                  : undefined
              }
              onAddPickup={
                routing.pickupState.showPickupStack
                  ? routing.pickupHandlers.handleAddPickup
                  : undefined
              }
              onRemovePickup={
                routing.pickupState.showPickupStack
                  ? (i: number) =>
                    routing.pickupHandlers.handleRemovePickup(i)
                  : undefined
              }
              moduleCode="BKG"
              tmsContext={{
                deliveryLocationCode: routing.routingFormData.warehouse ?? '',
                deliveryZipCode: '',
                countryCode: loginClientBean?.countryCode ?? '',
                pickupType: routing.pickupState.pickUpValue ?? '',
                bookingStatus: bookingMainDetails.status ?? '',
                tmsShipmentId: tmsShipmentId,
                pendingFinalBookingStatus: bookingMainDetails.pendingFinalBookingStatus ?? 'N',
                moduleType: 'booking',
                referenceNumber: bookingMainDetails.referenceNumber?.toString() ?? '',
                profitPercentage: 0,
              } satisfies TmsBookingContext}
              shipperReference={bookingMainDetails.referenceNumber != null ? String(bookingMainDetails.referenceNumber) : undefined}
              externalCargoRows={
                routing.pickupState.pickups.length === 1
                  ? cargoDetails.truckingCargoRows
                  : undefined
              }
              mainCargoRows={cargoDetails.cargoState.cargoRows}
              cargoDetails={cargoDetails.cargoState.cargoRows}
              onRegisterFields={(fields) => registerFields('truckingDetails', fields)}
              onFieldsChange={(formData) =>
                handleFieldsChange('truckingDetails', formData)
              }
              onPopulateReference={handlePopulateReference}
              onSuccess={handleTmsBookingSuccess}
              accessorialOptions={accessorialOptions}
              doorAccessorialOptions ={doorAccessorialOptions}
              onPickupChargesChange={handlePickupChargesChange}
              onPickupCargoMetricsChange={handlePickupCargoMetricsChange}
              onDoorDeliveryChargesChange={handleDoorDeliveryChargesChange}
              onTrkStatusChange={(status) => {
                if (status === 'P') { setStatusBadgeText('TRK Transmit Pending'); setStatusBadgeStatus('pending'); }
                else if (status === 'S') { setStatusBadgeText('TRK Transmit Success'); setStatusBadgeStatus('success'); }
                else if (status === 'F') { setStatusBadgeText('TRK Transmit Failure'); setStatusBadgeStatus('failure'); }
                else if (status === 'RP') { setStatusBadgeText('TRK Re-Transmit Pending'); setStatusBadgeStatus('pending'); }
                else { setStatusBadgeText(''); }
              }}
            />
          ),
        },
      ]
      : []),
    {
      id: accordionIds[8],
      label: 'Rate Details',
      content: (
        <BookingRateDetails
          moduleType="BKG"
          rateDetails={rateDetails}
          cargoMetrics={cargoMetrics}
          pickupCargoMetricsMap={pickupCargoMetricsMap}
          onRegisterFields={(fields: any) =>
            registerFields('rateDetails', fields)
          }
          onFieldsChange={(formData: any) =>
            handleFieldsChange('rateDetails', formData)
          }
          shippingType={'L'}
        />
      ),
      progress: true,
      icon: true,
      progressValue: progressOf('rateDetails'),
      iconContent: <RateDetailsIcons />,
    },
    {
      id: accordionIds[9],
      label: 'Location Information',
      content: <LocationInfo data={locationInfoData} />,
      progress: true,
      icon: false,
      progressValue: 100,
    },
  ]


  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleAllItems = () => {
    setOpenItems(isAllOpen ? [] : accordionIds);
  };

  const accordionProps: AccordionProps = {
    accordionData: accordionItems,
    openItems: openItems,
    toggleItem: toggleItem,
  };
  const [previewOpen,setPreivewOpen]  = useState(false);
  const onpreivewOpen = () => {
    setPreivewOpen(true);
  }
  const onpreivewClose = () => {
    setPreivewOpen(false);
  }
  const openNotes = () => {
    var openNotesPopup: any = {};
    openNotesPopup.referenceNumber =
      bookingMainDetails.referenceNumber?.toString() ?? '';
    openNotesPopup.type = 'java';

    const schemaName =loginBean.userSchemaName;
    openNotesPopup.schemaName = schemaName;
    openNotesPopup.schema = schemaName;
    openNotesPopup.module = 'BKG';
    openNotesPopup.defaultNoteType = '';
    openNotesPopup.showClauseWidgets = 'true';
    openNotesPopup.showDocumentWidgets = 'true';

    GwtBridge.gwtActionFromReact('OPEN_NOTES_POPUP', openNotesPopup);
  };

  const onSetPreviewDocumentPreviewClick = () => {
    setOpenPreview(true);
  };

  const openDocuments = () => {
    const schemaName = loginBean?.userSchemaName || 'defaultSchema';

    var openDocumentsPopup: any = {};
    openDocumentsPopup.code = 'BKG';
    openDocumentsPopup.type = 'Booking';
    openDocumentsPopup.referenceNumber = bookingMainDetails.referenceNumber?.toString() ?? '';
    openDocumentsPopup.fclLcl = 'L';
    openDocumentsPopup.schemaName = schemaName;
    openDocumentsPopup.module = 'BKG';
    openDocumentsPopup.handlingOffice = bookingMainDetails?.handlingOffice ?? loginBean?.officeCode;
    openDocumentsPopup.customerEmail = customerDetail?.customerFormData?.lclForm?.customerEmail;
    openDocumentsPopup.destination = routing?.routingFormData?.portOfDischargeName;
    openDocumentsPopup.receiverName = customerDetail?.customerFormData?.lclForm?.customerName;
    openDocumentsPopup.accessCode = 'Booking';
    openDocumentsPopup.tabId = tabId;
    openDocumentsPopup.bean = JSON.stringify(payload());
    GwtBridge.gwtActionFromReact("OPEN_SEND_DOCUMENTS_POPUP", openDocumentsPopup);
  };

  useEffect(() => {
    var transmitWarehouse = loginClientBean?.locationSettingMap?.[routing?.routingFormData?.warehouse]?.OCEAN_TRANSMIT_BOOKING_LEADERRUN?.[0];
    var isTransmitToWarehouse = false;
    const isTransmitBookingToThirdPartyToggleOn = isVisible(
      CommonToggleKeys.TRANSMIT_BOOKING_TO_THIRD_PARTY
    );
    if (isTransmitBookingToThirdPartyToggleOn && transmitWarehouse && transmitWarehouse !== "Y") {
      isTransmitToWarehouse = loginClientBean?.locationSettingMap?.[routing?.routingFormData?.warehouse]?.TRANSMIT_BOOKING_TO_WAREHOUSE?.[0] === "Y";
    } else
      if (isVisible(CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY)) {
        isTransmitToWarehouse = loginClientBean?.locationSettingMap?.[routing?.routingFormData?.warehouse]?.TRANSMIT_BOOKING_DATA_TO_WAREHOUSE?.[0] === "Y";
      }
    setShowTransmitToWarehouseAction(isTransmitToWarehouse)
  }, [routing?.routingFormData]);

  const openConfirmation = ({
    title,
    message,
    variant,
    onConfirm,
    onCancel,
    onClose,
  }) => {
    modalConfigRef.current = {
      title,
      message,
      variant,
      onConfirm,
      onCancel,
      onClose,
    };

    setIsTransmitModelOpen(true);
  };

  const checkConfig = (configCode, warehouse) => {
    if (globalConfigMap && globalConfigMap.length > 0) {
      return globalConfigMap.some(data =>
        data.CODE?.toString().toLowerCase() === configCode.toLowerCase() &&
        data.VALUE?.toString().toLowerCase() === warehouse.toLowerCase()
      );
    }
    return false;
  };

  const showNotificaionOrPopupForTransmitToWarehouse = () => {
    if (isVisible(CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY)
      && loginClientBean?.locationSettingMap?.[routing?.routingFormData?.warehouse]?.TRANSMIT_BOOKING_DATA_TO_WAREHOUSE?.[0] === "Y") {
      if (isVisible(CommonToggleKeys.OCEAN_FREIGHT_EMT_IMT_BOOKING_PENDING_FINAL)
        && populateData?.mainBookingQuoteBean?.bookingQuoteBean?.pendingFinalBookingStatus === "Y"
        && loginClientBean?.locationSettingMap?.[routing?.routingFormData?.warehouse]?.OCEAN_TRANSMIT_BOOKING_LEADERRUN?.[0] !== "Y") {
        showStatus('warning', ['Booking is in Pending Final,Warehouse transmission cannot be performed']);
      } else if (isVisible(CommonToggleKeys.OCEAN_BOOKING_SHOW_SENSITIVE_CARGO)
        && checkConfig('BOOKING_VALIDATION_FOR_SENSITIVE_CARGO_DOCUMENT', routing?.routingFormData?.warehouse.split('-')[0].trim())
        && cargoDetails.cargoState.cargoRows.some(row => row.isSensitiveCargo)
        && loginClientBean?.locationSettingMap?.[routing?.routingFormData?.warehouse]?.OCEAN_TRANSMIT_BOOKING_LEADERRUN?.[0] === "Y"
        && populateData?.mainBookingQuoteBean?.bookingQuoteBean?.pendingFinalBookingStatus !== "Y"
        //upload documents check missing
      ) {
        openConfirmation({
          title: 'Validation Failed',
          message: 'Sensitive Cargo Document require to Transmit Booking Data to Warehouse.',
          variant: 'error',
          onConfirm: () => {
            setIsTransmitModelOpen(false);
          },
          onCancel: () => setIsTransmitModelOpen(false),
          onClose: () => setIsTransmitModelOpen(false),
        });
        return;
      }

      openConfirmation({
        title: 'Warning',
        message: 'Are you sure you want to transmit data to Warehouse?',
        variant: 'warning',
        onConfirm: () => {
          setFromTransmitToWarehouse(true);
          // handleSubmit();
        },
        onCancel: () => setIsTransmitModelOpen(false),
        onClose: () => setIsTransmitModelOpen(false),
      });
    } else {
      if (isVisible(CommonToggleKeys.OCEAN_FREIGHT_EMT_IMT_BOOKING_PENDING_FINAL)
        && populateData?.mainBookingQuoteBean?.bookingQuoteBean?.pendingFinalBookingStatus === "Y") {
        showStatus('warning', ['Booking is in Pending Final,Warehouse transmission cannot be performed']);
      } else {
        if (loginClientBean?.locationSettingMap?.[routing?.routingFormData?.warehouse]?.TRANSMIT_BOOKING_DATA_TO_WAREHOUSE?.[0] !== "Y"
          && checkConfig('BOOKING_VALIDATION_FOR_SENSITIVE_CARGO_DOCUMENT', routing?.routingFormData?.warehouse.split('-')[0].trim())
          && isVisible(CommonToggleKeys.OCEAN_BOOKING_SHOW_SENSITIVE_CARGO)
          && cargoDetails.cargoState.cargoRows.some(row => row.isSensitiveCargo)) {
          //upload documents check missing
          openConfirmation({
            title: 'Validation Failed',
            message: 'Sensitive Cargo Document require to Transmit Booking Data to Warehouse.',
            variant: 'error',
            onConfirm: () => {
              setIsTransmitModelOpen(false);
            },
            onCancel: () => setIsTransmitModelOpen(false),
            onClose: () => setIsTransmitModelOpen(false),
          });
          return;
        }
        openConfirmation({
          title: 'Warning',
          message: 'Are you sure you want to transmit data to Warehouse?',
          variant: 'warning',
          onConfirm: () => {
            setFromTransmitToWarehouse(true);
            // handleSubmit();
          },
          onCancel: () => setIsTransmitModelOpen(false),
          onClose: () => setIsTransmitModelOpen(false),
        });
      }
    }
  };

  function checkValidationForTransmitBooking(): boolean {
    let isValid = true;
    let packaging: string = cargoDetails.cargoState['cargoRows'][0].packaging;
    let deliveryRef: string = routing?.routingFormData?.deliveryReference;
    let marks: string = cargoDetails.cargoState['cargoRows'][0].marks;

    let errorMsg: string[] = [];

    if (!deliveryRef) {
      errorMsg.push("Delivery Reference is mandatory.");
      isValid = false;
    }
    if ((!packaging || packaging === "-1")
      && !loginClientBean?.locationSettingMap?.[routing?.routingFormData?.warehouse.split("-")[0].trim()]?.CFS_BKG_TRANSMIT_DEFAULT_PACKAGING_VALUE?.[0]) {
      errorMsg.push("Packaging is mandatory.");
      isValid = false;
    }
    if (loginClientBean?.locationSettingMap?.[routing?.routingFormData?.warehouse.split("-")[0].trim()]?.OCEAN_TRANSMIT_BOOKING_LEADERRUN?.[0]
      && !marks) {
      errorMsg.push("Marks and Numbers are mandatory.");
      isValid = false;
    }
    if (isVisible(CommonToggleKeys.OCEAN_BOOKING_SHOW_DELIVERY_TYPE_FIELD)
      && loginClientBean?.locationSettingMap?.[routing?.routingFormData?.warehouse.split("-")[0].trim()]?.BOOKING_DOCUMENT_DETAILS_TRANSMIT_TO_WAREHOUSE?.[0] !== "Y"
      && !populateData?.mainBookingQuoteBean?.isBLReferenceExist) {
      errorMsg.push("Please enter a valid Bill of Lading Number linked to Arrival Notice as a 'Reference' against uploaded 'Release Order' document.")
      isValid = false;
      showStatus('error', [errorMsg.join('\n')]);
    } else if (errorMsg.length > 0) {
      showStatus('error', [errorMsg.join('\n')]);
    }
    return isValid;
  }

  const isMappingInvalid = (
    warehouse: string,
    outportWarehouse: string,
    toggleName: string
  ): boolean => {
    const locationSettingMap = loginClientBean?.locationSettingMap as
      | Record<string, Record<string, string[]>>
      | undefined;

    const valueList = locationSettingMap?.[warehouse]?.[toggleName];

    return !(
      Array.isArray(valueList) &&
      valueList.length > 0 &&
      valueList.includes(outportWarehouse)
    );
  };

  const checkForMarksAndPackaging = (
    mainBookingQuoteBean: any
  ) => {
    let marks: string = mainBookingQuoteBean?.bookingQuoteBean?.bookingQuoteCargoBean?.marks;
    let packagingType: string = mainBookingQuoteBean?.bookingQuoteBean?.bookingQuoteCargoBean?.packagingType;
    let manufactureName: string = mainBookingQuoteBean?.bookingQuoteBean?.bookingQuoteCargoBean?.manufacturerName;

    if (!marks || marks.trim() === "") {
      showStatus('warning', ["Marks and Numbers is mandatory"]);
      return false;
    } else if (!packagingType || packagingType === '-1') {
      showStatus('warning', ["Packaging is mandatory"]);
      return false;
    } else if (isVisible(CommonToggleKeys.OCEAN_LCL_BKG_SHOW_MANUFACTURE_NAME) && manufactureName && manufactureName.trim() !== "") {
      showStatus('warning', ["Manufacturer Name is mandatory"]);
      return false;
    } else if (isVisible(CommonToggleKeys.CFS_SPLIT_BOOKING_INTEGRATION_DETAILS_STACK)
      && mainBookingQuoteBean.bookingQuoteBean.bookingQuoteType === "L"
      && loginClientBean?.locationSettingMap?.[mainBookingQuoteBean?.bookingQuoteBean?.bookingQuoteRoutingBean?.warehouse]?.CFS_SPLIT_BOOKING_INTEGRATION_DETAILS_STACK?.[0] === "Y") {
      //CfsStackSplitMainIntegrationWidget logic is there
      return false;
    } else if (loginClientBean?.locationSettingMap?.[mainBookingQuoteBean?.bookingQuoteBean?.bookingQuoteRoutingBean?.warehouse]?.CFS_BKG_TRANSMIT_PAYMENT_METHOD_MANDATORY?.[0] === "Y") {
      //CfsMainIntegrationWidget logic is there

      showStatus('warning', ["Payment Method is mandatory"]);
      return false;
    } else {
      return true;
    }
  }

  function transmitToWarehouse(mainBookingQuoteBean: any) {
    if (fromTransmitToWarehouse) {
      setFromTransmitToWarehouse(false);
      const outportWarehouseCode = mainBookingQuoteBean?.bookingQuoteBean?.bookingQuoteRoutingBean?.outportWarehouseCode;
      const warehouse = routing?.routingFormData?.warehouse.split("-")[0].trim();
      const bookingReference = mainBookingQuoteBean?.bookingQuoteBean?.referenceNumber ?? '';
      const warehouseName = routing?.routingFormData?.warehouse ?? '';
      const isOutportWarehouseInvalid = Boolean(
        outportWarehouseCode &&
        outportWarehouseCode.trim() !== "" &&
        isMappingInvalid(warehouse, outportWarehouseCode, "OUTPORT_WAREHOUSE_MAPPING")
      );

      const performTransmit = () =>
        callApiTransmitToWarehouse(
          bookingReference,
          warehouseName,
          isOutportWarehouseInvalid,
          mainBookingQuoteBean,
        );

      if (isVisible(CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY)
        && loginClientBean?.locationSettingMap?.[warehouse]?.TRANSMIT_BOOKING_DATA_TO_WAREHOUSE?.[0] === "Y") {
        if (loginClientBean?.locationSettingMap?.[warehouse]?.LOT_VALIDATION_FOR_COMMON_WAREHOUSE?.[0] === "Y"
          && populateData?.mainBookingQuoteBean?.lotExist?.toUpperCase() === "LOT_EXIST") {
          openConfirmation({
            title: 'Error',
            message: `Booking ${populateData?.mainBookingQuoteBean?.bookingQuoteBean?.referenceNumber ?? ""} is already associated with Single Lot. Phoenix cannot Transmit Data to warehouse.`,
            variant: 'error',
            onConfirm: () => {
              setIsTransmitModelOpen(false)
            },
            onCancel: setIsTransmitModelOpen(false),
            onClose: setIsTransmitModelOpen(false),
          });
          return;
        }
        if (loginClientBean?.locationSettingMap?.[warehouse]?.TRANSMIT_BOOKING_DATA_TO_WAREHOUSE?.[0] === "Y"
          && !checkValidationForTransmitBooking()) {
          return;
        }
        let messageText: string = "";
        if (loginClientBean?.locationSettingMap?.[warehouse]?.TRANSMIT_BOOKING_DATA_TO_WAREHOUSE?.[0] === "Y"
          && isVisible(CommonToggleKeys.OCEAN_BOOKING_SHOW_DELIVERY_TYPE_FIELD)
          && loginClientBean?.locationSettingMap?.[warehouse]?.BOOKING_DOCUMENT_DETAILS_TRANSMIT_TO_WAREHOUSE?.[0] === "Y") {
          let releaseOrderDocUploaded = false;
          let raildeliveryDocUploaded = false;
          let documentUploaded = false;
          if (populateData?.mainBookingQuoteBean?.uploadDocumentsBeanList) {

            for (const doc of mainBookingQuoteBean.uploadDocumentsBeanList || []) {
              const type = doc.documentType?.toUpperCase();

              if (type === 'RELEASE_ORDER') {
                releaseOrderDocUploaded = true;
              } else if (type === 'RAIL_DELIVERY_ORDER') {
                raildeliveryDocUploaded = true;
              } else {
                documentUploaded = false;
              }
            }
          } else {
            documentUploaded = false;
          }
          if (mainBookingQuoteBean?.bookingQuoteBean?.deliveryType.toUpperCase() === "REX" && !releaseOrderDocUploaded) {
            messageText = "Release Order document is not uploaded. Continue transmission?";
          } else if (mainBookingQuoteBean?.bookingQuoteBean?.deliveryType.toUpperCase() === "FTZ" && !raildeliveryDocUploaded) {
            messageText = "Rail Delivery Order document is not uploaded. Continue transmission?";
          }
        }
        if (messageText) {
          openConfirmation({
            title: 'Confirmation',
            message: messageText,
            variant: 'info',
            onConfirm: () => {
              openConfirmation({
                title: 'Warning',
                message: 'Are you sure you want to transmit data to Warehouse?',
                variant: 'warning',
                onConfirm: () => {
                  setIsTransmitModelOpen(false);
                  performTransmit();
                },
                onCancel: setIsTransmitModelOpen(false),
                onClose: setIsTransmitModelOpen(false),
              });
            },
            onCancel: setIsTransmitModelOpen(false),
            onClose: setIsTransmitModelOpen(false),
          });
        } else {
          if (outportWarehouseCode
            && (loginClientBean?.locationSettingMap?.[warehouse]?.BKG_TRANSMIT_VALIDATE_OUTPORT_WAREHOUSE_MAPPING?.[0] === "Y"
              && loginClientBean?.locationSettingMap?.[warehouse]?.OCEAN_TRANSMIT_BOOKING_LEADERRUN?.[0] === "Y")
            && isMappingInvalid(routing?.routingFormData?.warehouse,
              outportWarehouseCode, "OUTPORT_WAREHOUSE_MAPPING")) {
            let messageText = `Outport CFS ${outportWarehouseCode} is invalid for Warehouse ${warehouse}, Phoenix will transmit Booking data without Outport CFS. Are you sure you want to transmit data to Warehouse?`;
            openConfirmation({
              title: 'Warning',
              message: messageText,
              variant: 'warning',
              onConfirm: () => {
                setIsTransmitModelOpen(false)
                performTransmit();
              },
              onCancel: setIsTransmitModelOpen(false),
              onClose: setIsTransmitModelOpen(false),
            });
          } else {
            performTransmit();
          }
        }
      } else {
        if (checkForMarksAndPackaging(mainBookingQuoteBean)) {
          return;
        }
        if (outportWarehouseCode && outportWarehouseCode.trim() !== ""
          && loginClientBean?.locationSettingMap?.[warehouse]?.BKG_TRANSMIT_VALIDATE_OUTPORT_WAREHOUSE_MAPPING?.[0] === "Y"
          && isMappingInvalid(warehouse, outportWarehouseCode, "OUTPORT_WAREHOUSE_MAPPING")) {
          let messageText = `Outport CFS ${outportWarehouseCode} is invalid for Warehouse ${warehouse}, Phoenix will transmit Booking data without Outport CFS. Are you sure you want to transmit data to Warehouse?`;
          openConfirmation({
            title: 'Warning',
            message: messageText,
            variant: 'warning',
            onConfirm: () => {
              setIsTransmitModelOpen(false)
              performTransmit();
            },
            onCancel: setIsTransmitModelOpen(false),
            onClose: setIsTransmitModelOpen(false),
          });
        } else {
          performTransmit();
        }
      }
    }
  }

  const callApiTransmitToWarehouse = async (
    bookingReference: string,
    warehouseName: string,
    isOutportWarehouseInvalid: boolean,
    mainBookingQuoteBean: any
  ) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const requestPayload = {
        bookingReference,
        warehouseName,
        isOutportWarehouseInvalid,
      };
      const response = await ApiService.post(
        API_ENDPOINTS.BOOKING.TRANSMIT_TO_WAREHOUSE,
        requestPayload
      ) as any;

      const result = response?.data ?? "FAILED";

      let warehouse = routing?.routingFormData?.warehouse
      let warehouseCodeAndName = "";

      if (warehouse && warehouse.trim() !== "") {
        warehouseCodeAndName = loginClientBean?.locationSettingMap?.[warehouse]?.THIRD_PARTY_WAREHOUSE_MAPPING?.[0];
        if (warehouseCodeAndName) warehouseCodeAndName = warehouseCodeAndName.toUpperCase();
      }

      if (result === 'LOT_EXIST') {
        showStatus('error', [
          `Booking ${bookingReference} is already associated with Single Lot. Phoenix cannot Transmit Data to warehouse.`,
        ]);
      } else if (
        result === 'BOOKING_TRANSMITTED' &&
        cargoDetails.cargoState.cargoRows.some((row) => row.isSensitiveCargo)
      ) {
        showStatus('error', [
          'Sensitive Booking data is already approved from the Third Party Warehouse',
        ]);
      } else if (result === 'SUCCESS-WAIT-ARRPOVAL') {
        showStatus('error', [
          `Booking data Successfully Transmitted to ${warehouse} - Waiting for Approval.`,
        ]);
        setTransmissionStatus(
          transmissionStatus.TRANSMITTED_SUCCESSFULLY_WAIT_APPROVAL_CODE
        );
        enableDisableRoutingFields(true);
      } else if (result === 'SUCCESS') {
        let message = `Booking data Successfully Transmitted to ${warehouseCodeAndName}`;
        if (
          isVisible(
            CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY
          ) &&
          loginClientBean?.locationSettingMap?.[warehouseCodeAndName]
            ?.TRANSMIT_BOOKING_DATA_TO_WAREHOUSE?.[0] === 'Y'
        ) {
          message = `Booking data Successfully Transmitted to ${warehouse}`;
        }
        showStatus('success', [message]);
        setTransmissionStatus(transmissionStatus.TRANSMITTED_SUCCESSFULLY_CODE);
        enableDisableRoutingFields(true);

        if (
          isVisible(CommonToggleKeys.CML_CFS_INTEGRATION_DETAILS_STACK) &&
          loginClientBean?.locationSettingMap?.[warehouse]
            ?.CML_CFS_INTEGRATION_DETAILS_STACK?.[0] === 'Y' &&
          isVisible(CommonToggleKeys.SHOW_BLP_FILING_STATUS_ON_BOOKING) &&
          loginClientBean?.locationSettingMap?.[warehouse]
            ?.SHOW_BLP_FILING_STATUS_ON_BOOKING?.[0] === 'Y'
        ) {
          getCmlCfsBlpStatus('BKG', bookingReference, mainBookingQuoteBean);
        }
      } else if (result === 'NO_RESPONSE_RECEIVED') {
        let message = `Booking data transmission failure to ${warehouseCodeAndName} due to No Response from Warehouse System.`;
        if (
          isVisible(
            CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY
          ) &&
          loginClientBean?.locationSettingMap?.[warehouseCodeAndName]
            ?.TRANSMIT_BOOKING_DATA_TO_WAREHOUSE?.[0] === 'Y'
        ) {
          message = `Booking data transmission failure to ${warehouse} due to No Response from Warehouse System.`;
        }
        showStatus('error', [message]);
        setTransmissionStatus(transmissionStatus.TRANSMISSION_FAILURE_CODE);
        if (
          isVisible(
            CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY
          ) &&
          loginClientBean?.locationSettingMap?.[warehouseCodeAndName]
            ?.TRANSMIT_BOOKING_DATA_TO_WAREHOUSE?.[0] === 'Y'
        ) {
          enableDisableRoutingFields(false);
        } else {
          enableDisableRoutingFields(true);
        }
      } else if (result === 'SHIPPING_ORDER_NUMBER_CANCELLED') {
        showStatus('success', [
          `Cancel Shipping Order Number transmitted to warehouse ${warehouseCodeAndName} successfully`,
        ]);
        setTransmissionStatus(transmissionStatus.TRANSMITTED_SUCCESSFULLY_CODE);
        enableDisableRoutingFields(true);
      } else if (result === 'SHIPPING_ORDER_NUMBER_CANCEL_FAILED') {
        showStatus('error', [
          `Cancel Shipping Order Number transmission Failed to warehouse ${warehouseCodeAndName}`,
        ]);
        setTransmissionStatus(transmissionStatus.TRANSMISSION_FAILURE_CODE);
        enableDisableRoutingFields(true);
      } else {
        let message = `Booking data transmission failure to ${warehouseCodeAndName} due to ${result}`;
        if (
          isVisible(
            CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY
          ) &&
          loginClientBean?.locationSettingMap?.[warehouseCodeAndName]
            ?.TRANSMIT_BOOKING_DATA_TO_WAREHOUSE?.[0] === 'Y'
        ) {
          message = `Booking data transmission failure to ${warehouse} due to ${result}`;
        }
        showStatus('error', [message]);
        setTransmissionStatus(transmissionStatus.TRANSMISSION_FAILURE_CODE);
        if (
          isVisible(
            CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY
          ) &&
          loginClientBean?.locationSettingMap?.[warehouseCodeAndName]
            ?.TRANSMIT_BOOKING_DATA_TO_WAREHOUSE?.[0] === 'Y'
        ) {
          enableDisableRoutingFields(true);
        } else {
          enableDisableRoutingFields(true);
        }
      }
      addTransmitToWarehouseOption(true);
      if (isTransmitCancelSOToWarehouseToggleOn(routing?.routingFormData?.warehouse?.split("-")[0].trim())) {
        addCancelSOToWarehouseOption(true, routing?.routingFormData?.warehouse?.split("-")[0].trim());
      }
      return response;
    } catch (error) {
      console.error('Transmit to warehouse failed', error);
      showStatus('error', ['Failed to transmit to warehouse.']);
    }
  }

    function enableDisableRoutingFields(isDisabled: boolean) {
        if ((isVisible(CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY)
                || isVisible(CommonToggleKeys.TRANSMIT_CANCEL_DATA_TO_THIRD_PARTY))
            && loginClientBean?.locationSettingMap?.[loginClientBean?.userSettingMap?.USER_DEFAULT_WAREHOUSE?.[0]]?.TRANSMIT_BOOKING_DATA_TO_WAREHOUSE?.[0] === "Y") {
            setDisableRoutingFields((prev) => ({
                ...prev,
                isWarehouse: isDisabled,
                isDeliveryReference: isDisabled,
            }));
        } else {
            setDisableRoutingFields({
                isWarehouse: isDisabled,
                isDeliveryReference: isDisabled,
                isOutportWarehouse: isDisabled,
            });
        }
    }

  function setTransmissionStatus(status: string) {
    if(status === transmissionStatus.TRANSMITTED_SUCCESSFULLY_WAIT_APPROVAL_CODE) {
        setStatusBadgeStatus("wait");
        const leaderrunWarehouseEnable = loginClientBean?.locationSettingMap?.[routing?.routingFormData?.warehouse?.split("-")[0].trim()]?.OCEAN_TRANSMIT_BOOKING_LEADERRUN?.[0] === "Y"
        if(isTransmitToWarehouseToggleOn(routing?.routingFormData?.warehouse?.split("-")[0].trim())) {
            if(leaderrunWarehouseEnable) {
                setStatusBadgeText("Transmit OK, Approval Pending")
            }else {
                setStatusBadgeText("CFS Transmit OK, Approval Pending")
            }
        }else {
            setStatusBadgeText("Transmit OK, Approval Pending")
        }
    }else if(status === transmissionStatus.TRANSMITTED_SUCCESSFULLY_CODE) {
        //FCL condition skipped
        setStatusBadgeStatus("success");
        if(isTransmitToWarehouseToggleOn(routing?.routingFormData?.warehouse?.split("-")[0].trim())) {
            setStatusBadgeText("CFS Transmit Success")
        }else {
            setStatusBadgeText("Transmit Success")
        }
    }else if(status === transmissionStatus.TRANSMISSION_FAILURE_CODE) {
        setStatusBadgeStatus("failure");
        if(isTransmitToWarehouseToggleOn(routing?.routingFormData?.warehouse?.split("-")[0].trim())) {
            setStatusBadgeText("CFS Transmit Failure")
        }else {
            setStatusBadgeText("Transmit Failed")
        }
    }else if(status === transmissionStatus.TRANSMITTED_PENDING_CODE) {
        setStatusBadgeStatus("pending");
        if(isTransmitToWarehouseToggleOn(routing?.routingFormData?.warehouse?.split("-")[0].trim())) {
            setStatusBadgeText("CFS Transmit Pending")
        }else {
            setStatusBadgeText("Transmit Pending")
        }
    }else if(status === transmissionStatus.RE_TRANSMITTED_PENDING_CODE) {
        setStatusBadgeStatus("pending");
        if(isTransmitToWarehouseToggleOn(routing?.routingFormData?.warehouse?.split("-")[0].trim())) {
            setStatusBadgeText("CFS Re-Transmit Pending")
        }
    }else if(status === transmissionStatus.TRANSMITTED_ACCEPTED_CODE) {
        setStatusBadgeStatus("success");
        if(isTransmitToWarehouseToggleOn(routing?.routingFormData?.warehouse?.split("-")[0].trim())) {
            setStatusBadgeText("CFS Transmit Accepted")
        }else {
            setStatusBadgeText("Transmit Accepted")
        }
    }else if(status === transmissionStatus.TRANSMITTED_REJECTED_CODE){
        setStatusBadgeStatus("failure");
        if(isTransmitToWarehouseToggleOn(routing?.routingFormData?.warehouse?.split("-")[0].trim())) {
            setStatusBadgeText("CFS Transmit Rejected")
        }else {
            setStatusBadgeText("Transmit Rejected")
        }
    }
  }

  const getCmlCfsBlpStatus = async (
        module,
        bookingReference,
        mainBookingQuoteBean,
    )=> {
      try {
          await new Promise((resolve) => setTimeout(resolve, 100));
          const requestPayload = {
              bookingReference,
              module,
          };
          const cmlCfsBlpStatusResponse = await ApiService.post(
              API_ENDPOINTS.BOOKING.CML_CFS_BLP_STATUS,
              requestPayload
          ) as any;

          if(cmlCfsBlpStatusResponse?.data?.success === 1) {
              const statusMappingList = cmlCfsBlpStatusResponse?.data?.result ?? [];
              if(statusMappingList.length > 0) {
                setShowHideBlpFilingStatusLabel(true);
                let blpFilingstatus = "";
                if(mainBookingQuoteBean?.bookingQuoteBean?.fillingBy?.toUpperCase() === "SHIPCO") {
                    for (const statusMappingMap of statusMappingList) {
                        if (Object.values(statusMappingMap).includes("Pending")) {
                            blpFilingstatus = "Pending";
                            setBlpFilingStatus(blpFilingstatus);
                            break;
                        }
                        if (Object.values(statusMappingMap).includes("Failure")) {
                            blpFilingstatus = "Failure";
                            setBlpFilingStatus(blpFilingstatus);
                            break;
                        }
                        if (Object.values(statusMappingMap).includes("Pending Approval")) {
                            blpFilingstatus = "Pending Approval";
                        }
                        if (Object.values(statusMappingMap).includes("Success")) {
                            blpFilingstatus = "Success";
                        }
                        setBlpFilingStatus(blpFilingstatus);
                    }
                } else {
                    for (const statusMappingMap of statusMappingList) {
                        if (Object.values(statusMappingMap).includes("Pending")) {
                            blpFilingstatus = "Pending";
                            setBlpFilingStatus(blpFilingstatus);
                            break;
                        }
                        if (Object.values(statusMappingMap).includes("Not Required")) {
                            blpFilingstatus = "Not Required";
                            setBlpFilingStatus(blpFilingstatus);
                            break;
                        }
                    }
                }
              }else {
                  setShowHideBlpFilingStatusLabel(true);
              }
          }
      }catch (error) {
          console.error("Error occurred during calling api for cml cfs blp status", error);
      }
  }

  function addCancelSOToWarehouseOption(isShipmentOrderTransmitted, warehouse) {
    //remove options
    if (isShipmentOrderTransmitted) {
      if (isVisible(CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY)
        && loginClientBean?.locationSettingMap?.[warehouse]?.TRANSMIT_CANCEL_TO_WAREHOUSE?.[0] === "Y"
        && loginClientBean?.locationSettingMap?.[warehouse]?.OCEAN_TRANSMIT_BOOKING_LEADERRUN?.[0] !== "Y") {
          setShowCancelToWarehouseAction(true);
      } else {
        setShowCancelSOToWarehouseAction(true);
      }
    }
  }

  function addTransmitToWarehouseOption(isShipmentOrderTransmitted: boolean) {
    setShowTransmitToWarehouseAction(false);
    setShowReTransmitToWarehouseAction(false);
    if (isShipmentOrderTransmitted) {
      setShowReTransmitToWarehouseAction(true);
    } else {
      setShowTransmitToWarehouseAction(true);
    }
    let warehouse = routing?.routingFormData?.warehouse ?? "";

    if (!isVisible(CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY)
      && isVisible(CommonToggleKeys.OCEAN_BOOKING_SHOW_SENSITIVE_CARGO) && isTransmitToWarehouseToggleOn(warehouse)
      && cargoDetails.cargoState.cargoRows.some(row => row.isSensitiveCargo)
      && (populateData?.mainBookingQuoteBean?.bookingQuoteBean?.isSensitiveCargoApprovalReceived ?? false)) {
      if (checkConfig("BOOKING_REMOVE_TRANSMIT_TO_WAREHOUSE_ACTION", warehouse)) {
        setShowTransmitToWarehouseAction(false);
        setShowReTransmitToWarehouseAction(false);
      }
    }
  }

  function isTransmitCancelSOToWarehouseToggleOn(warehouseCode: string): boolean {
    let isTransmitCancelSOToWarehoseToggle = false;
    //if FCL return false;
    let leaderrunWarehouseEnable = loginClientBean?.locationSettingMap?.[warehouseCode]?.OCEAN_TRANSMIT_BOOKING_LEADERRUN?.[0];
    if (isVisible(CommonToggleKeys.TRANSMIT_BOOKING_TO_THIRD_PARTY)
      && isVisible(CommonToggleKeys.TRANSMIT_CANCEL_SO_TO_THIRD_PARTY)
      && leaderrunWarehouseEnable !== "Y") {
      if (loginClientBean?.locationSettingMap?.[warehouseCode]?.TRANSMIT_CANCEL_SO_TO_WAREHOUSE?.[0] === "Y") {
        isTransmitCancelSOToWarehoseToggle = true;
      } else {
        isTransmitCancelSOToWarehoseToggle = false;
      }
    } else if (isVisible(CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY)
      && isVisible(CommonToggleKeys.TRANSMIT_CANCEL_DATA_TO_THIRD_PARTY)) {
      if (loginClientBean?.locationSettingMap?.[warehouseCode]?.TRANSMIT_CANCEL_TO_WAREHOUSE?.[0] === "Y") {
        isTransmitCancelSOToWarehoseToggle = true;
      } else {
        isTransmitCancelSOToWarehoseToggle = false;
      }
    } else {
      isTransmitCancelSOToWarehoseToggle = false;
    }
    return isTransmitCancelSOToWarehoseToggle;
  }

  function isTransmitToWarehouseToggleOn(warehouse: string) {
    let isTransmitToWarehouseToggle: boolean = false;
    //if FCL return false
    const leaderrunWarehouseEnable = loginClientBean?.locationSettingMap?.[warehouse]?.OCEAN_TRANSMIT_BOOKING_LEADERRUN?.[0];
    if (isVisible(CommonToggleKeys.TRANSMIT_BOOKING_TO_THIRD_PARTY) && leaderrunWarehouseEnable !== "Y") {
      if (loginClientBean?.locationSettingMap?.[warehouse]?.TRANSMIT_BOOKING_TO_WAREHOUSE?.[0] === "Y") {
        isTransmitToWarehouseToggle = true;
      } else {
        isTransmitToWarehouseToggle = false;
      }
    } else if (isVisible(CommonToggleKeys.OCEAN_TRANSMIT_BOOKING_DATA_TO_THIRD_PARTY)) {
      if (loginClientBean?.locationSettingMap?.[warehouse]?.TRANSMIT_BOOKING_DATA_TO_WAREHOUSE?.[0] === "Y"
        && populateData?.mainBookingQuoteBean?.bookingQuoteBean?.status === "I") {
        isTransmitToWarehouseToggle = true;
      } else {
        isTransmitToWarehouseToggle = false;
      }
    } else {
      isTransmitToWarehouseToggle = false;
    }
    return isTransmitToWarehouseToggle;
  }

  const getDefaultClauseBeanData = async () => {
    let clause = "";
    if (isVisible(CommonToggleKeys.DEFAULT_BOOKING_QUOTE_NSAB_CLAUSE)) {
      clause = "NSAB";
    }

    if (isVisible(CommonToggleKeys.DEFAULT_BOOKING_QUOTE_GULF_CLAUSE)) {
      clause = "GULF";
    }
    try {
      // await new Promise((resolve) => setTimeout(resolve, 100));
      const requestPayload = {
        clause,
      };
      const clauseResponse = await ApiService.post(
        API_ENDPOINTS.BOOKING.GET_DEFAULT_CLAUSES_BEAN,
        requestPayload
      ) as any;
      if (clauseResponse?.data?.success == 1) {
        setDefaultClauses(clauseResponse.data.result);
      }
    } catch (error) {
      console.error("Error occurred while fetching default clauses", error);
    }
  }

  function setClauses(clausesList: Clause[]) {
    if (!clausesList) return;
    let clauseSuggestions: { clauseCode: string; clauseName: string; clauseDesc: string }[];
    const isLocaleClause: boolean = loginClientBean?.locale !== "en" && loginClientBean?.officeSettingMap?.SHOW_LOCALE_CLAUSES?.[0] === "Y";
    if (loginClientBean?.officeSettingMap?.CLAUSE_DESCRIPTION_ENABLE?.[0] === "Y") {
      clauseSuggestions = clausesList.map((clause) => ({
        clauseCode: clause.clauseCode,
        clauseName: isLocaleClause ? clause?.clauseNameLocale ? clause.clauseNameLocale : "" : clause?.clauseName ? clause?.clauseName : "",
        clauseDesc: clause.clauseText ?? clause.clauseDesc ?? "",
      }));
    } else {
      clauseSuggestions = clausesList.map((clause) => ({
        clauseCode: clause.clauseCode,
        clauseName: isLocaleClause ? clause?.clauseNameLocale ? clause.clauseNameLocale : "" : clause?.clauseName ? clause?.clauseName : "",
        clauseDesc: "",
      }));
    }
    //will clear existing clauses present in UI and add newer one
    dispatch(updateBookingMainDetails({ clauses: [...clauseSuggestions] }));
  }

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') {
        return;
      }

      const incomingReferenceId = event.data.referenceId;
      const payload = event.data.payload;

      if (!incomingReferenceId || incomingReferenceId !== tabId) {
        return;
      }

      if (payload?.changeFieldMap) {
        eservicePopulateFromBean(payload, dispatch, {
          handleRoutingChange:       routingRef.current.handleRoutingChange,
          updateCargoField:          cargoDetailsRef.current.cargoHandlers.updateCargoField,
          getCargoRows:              () => cargoDetailsRef.current.cargoState.cargoRows,
          addNewCargo:               cargoDetailsRef.current.cargoHandlers.addNewCargo,
          removeCargo:               cargoDetailsRef.current.cargoHandlers.removeCargo,
          addHazardousWithValues:    cargoDetailsRef.current.cargoHandlers.addHazardousWithValues,
          updateHazardous:           cargoDetailsRef.current.cargoHandlers.updateHazardous,
          handleCustomerPartyChange: (field, value) =>
            customerDetailRef.current.customerHandlers.handleMoreDetailsChange(field as any, value),
          handlePickupBatchChange: (fields) => {
            const pickups = routingRef.current.pickupState.pickups;
            const pickupId = pickups[0];
            if (pickupId === undefined) return;
            const current = routingRef.current.pickupState.truckingPickupForms?.[pickupId] ?? {};
            routingRef.current.pickupHandlers.handleTruckingPickupFormSync(pickupId, {
              ...current,
              ...fields,
            } as any);
          },
          handleLclFormChange: (field, value) =>
            customerDetailRef.current.customerHandlers.handleLclFormChange(field as any, value),
          handlePickupNeededChange: (value) => {
            routingRef.current.pickupHandlers.setPickupNeeded(value);
            if (value === 'Y' || value === 'T') {
              routingRef.current.pickupHandlers.setShowPickupStack(true);
              routingRef.current.pickupHandlers.closePickupModal();
            }
          },
        });
        dispatch(processVersioning({ doDisplayVersionButton: true, versionPopupParameters: payload }));
        setTimeout(() => applyEserviceChangedHighlights(payload.changeFieldMap), 0);
      }
    };

    window.addEventListener('message', handler);
    window.parent.addEventListener('message', handler);
    return () => {
      window.removeEventListener('message', handler);
      window.parent.removeEventListener('message', handler);
    };
  }, [tabId]);

  return (
    <>
      <BookingErrorBanner
        messages={barBanner.messages}
        onClose={(msg) => {
          setBarBanner((prev) => ({
            ...prev,
            messages: prev.messages.filter((m) => !msg.includes(m)),
          }))
        }}
        autoHideMs={barBanner.autoHideMs}
        variant="bar"
      />
      <BookingErrorBanner
        messages={modalBanner.messages}
        onClose={(msg) => {
          setModalBanner((prev) => ({
            messages: prev.messages.filter((m) => !msg.includes(m)),
          }))
        }}
        variant="modal"
      />
      <ToolBar
        tabId={tabId}
        onNotesClick={openNotes}
        onDocumentsClick={openDocuments}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onToggleAll={toggleAllItems}
        isAllOpen={isAllOpen}
        progress={progressBar.screenProgress}
        disableDocuments={!bookingMainDetails.referenceNumber}
        onCancelBooking={cancelIRP.openIRP}
        onCopyBooking={handleCopyBooking}
        handleClearAll={handleClearAll}
        onpriviewclic={openNotes}
        oneDocsClick={oneDocsClick}
        onPreview={onSetPreviewDocumentPreviewClick}
        tmsShipmentId={bookingMainDetails.tmsShipmentId || tmsShipmentId}
        showPrintLabelAction={showPrintLabelAction}
        onPrintLabel={handlePrintLabel}
        referenceNumber={bookingMainDetails.referenceNumber?.toString() ?? ''}
        showTransmitToWarehouseAction={showTransmitToWarehouseAction}
        showReTransmitToWarehouseAction={showReTransmitToWarehouseAction}
        transmitToWarehouse={showNotificaionOrPopupForTransmitToWarehouse}
        showCancelToWarehouseAction={showCancelToWarehouseAction}
        showCancelSOToWarehouseAction={showCancelSOToWarehouseAction}
        statusBadgeStatus={statusBadgeStatus}
        statusBadgeText={statusBadgeText}
      />
      <PreviewDocuments
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        encryptedPreviewURL={encryptedPreviewURL}
      />
      <PrintLabelModal
        open={isPrintLabelModalOpen}
        onClose={() => setIsPrintLabelModalOpen(false)}
        referenceNumber={referenceNumber}
        username={loginClientBean?.username ?? ''}
        onSuccess={() => showStatus('success', ['The selected reports are now queued for execution.'])}
      />
      <Accordion {...accordionProps} />
      {/* @ts-ignore */}
      <IRPPopup {...cancelIRP.irpPopupProps} />
      {/* @ts-ignore */}
      <IRPPopup {...eDocsIRP.irpPopupProps} />

      <PConfirmationModal
        open={isTransmitModelOpen}
        title={modalConfigRef.current?.title || ''}
        message={modalConfigRef.current?.message || ''}
        variant={modalConfigRef.current?.variant || 'warning'}
        primaryAction={{
          label: 'Ok',
          onClick: () => {
            modalConfigRef.current?.onConfirm?.();
            setIsTransmitModelOpen(false);
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            setIsTransmitModelOpen(false);
          },
        }}
        onClose={() => {
          setIsTransmitModelOpen(false);
        }}
      />

      <CopyModal
        moduleType="BKG"
        open={isCopyBookingModalOpen}
        onClose={() => setIsCopyBookingModalOpen(false)}
        onCopyClick={handleCopyBookingConfirm}
        title="Copy Booking"
        label="Enter Booking Number"
      />
    </>
  );
}
