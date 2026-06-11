import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import { useAppSelector, useAppDispatch } from '@/app/store/hooks';
import { ApiService } from '@/core/api/client';
import { useCargoDetails } from '@/hooks/LCL/CargoDetails/useCargodetails';
import { useCustomerDetails } from '@/hooks/LCL/CustomerDetails/useCustomerdetails';
import { useDocumentDetails } from '@/hooks/LCL/DocumentDetails/useDocumentdetails';
import { mapLoginBean } from '../../../hooks/LCL/MainDetails/Quote/PopulateMapper/populateLoginBeanMapper';
import {
  mapCargoFromPopulate,
  mapCustomerFromPopulate,
  mapDocumentDetailsFromPopulate,
  mapMainDetailsFromPopulate,
  mapRateDetailsFromPopulate,
  mapRoutingFromPopulate,
  mapFCLTruckingFromPopulate,
} from '@/hooks/LCL/MainDetails/Quote/PopulateMapper/quotePopulateMapper';
import { quotePopulateConfig } from '@/hooks/LCL/MainDetails/Quote/quotePopulateHelper';
import { useGetPopulateDataQuote } from '@/hooks/LCL/MainDetails/Quote/useGetPopulateDataQuote';
import {
  useQuoteMainDetails,
  createDefaultMainDetailsState,
} from '@/hooks/LCL/MainDetails/Quote/useQuoteMainDetails';
import { useRateDetails } from '@/hooks/LCL/RateDetails/useRateDetails';
import { useRouting } from '@/hooks/LCL/RoutingDetails/useRoutingDetails';
import {
  PGradientButton,
  PModal,
  PSingleValueSearchableField,
} from 'phoenix-react-lib';
import {
  useDoorDeliveryAccordionContent,
  useTruckingDetails,
  useTruckerDetailsPanel,
  useFCLTruckingDetails,
} from '@/hooks/LCL/TruckingDetails/useTruckingDetails';
import {
  updateMainDetails,
  updateCargoDetails,
  updateLocationInformation,
  resetForm,
  useFeatureToggle,
  BookingQuoteChargeBeanFull,
  SelectOption,
  RoutingDetails,
  initialCargoRow,
  quoteReferenceSuggestionConfig,
  useGetSuggestions,
  initialCustomerDetailFormState,
  createDefaultDocumentRows,
  defaultRateDetailsFormData,
  CommonToggleKeys,
  Clause,
  CopyModal,
  FilingDetails,
} from 'phoenix-common-react';
import {
  DocumentStatusIcons,
  IRPPopup,
  RateDetailsIcons,
  ToolBar,
  useTabId,
  useIRPController,
  mapTruckingFromPopulate,
  mapDocumentDetailsToUploadDocumentBeans,
} from 'phoenix-common-react';
import { LocationContext } from '@/context/locatioContext';
import { Accordion } from 'phoenix-react-lib';
import CargoDetails from './CargoDetails';
import CustomerDetails from './CustomerDetails';
import DocumentDetails from './DocumentDetails';
import LocationInfo from './LocationInfo';
import QuoteMainDetailsSection from './MainDetails';
import QuoteErrorBanner from './QuoteErrorBanner';
import QuoteRoutingDetails from './RoutingDetails';
import { buildQuoteSubmitPayload } from '@/hooks/LCL/MainDetails/Quote/PopulateMapper/quoteSubmitPayloadMapper';
import { validateQuoteForm } from './quoteValidation';
import { GwtBridge, gwtBridgeInstance } from 'phoenix-common-react';
import QuoteTruckingDetails from './TruckingDetails';
import { OCEAN_ENDPOINTS } from '@/core/api/config/ocean.endpoints';
import { useStatus } from '../../../context/statusContext';
import QuoteRateDetails from './RateDetails';
import { devAPIlog } from '@/components/Utils/console.extension';
import PreviewDocuments from '../Booking/PreviewDocuments';
import FCLQuoteRoutingDetails from './RoutingDetails/FCLRoutingDetails';
import FCLQuoteTruckingDetailPage from './TruckingDetails/FCLTruckingDetails';
import {
  MODULE_QUO,
  LCLFormState as QuoteMainDetailsState,
} from 'phoenix-common-react';
import { Box } from '@mui/material';
import { API_ENDPOINTS } from '@/core/api/endpoints.ts';
import styles from '../../../../styles/LCL/ToolBar.module.css';
import { calculateTEU } from '@/hooks/LCL/CargoDetails/useTeuCalculator';

// Stable empty array reference — prevents new array literals from triggering useEffect deps in child hooks
const EMPTY_PICKUPS: never[] = [];

const DOOR_TERMS = ['DRCF', 'CFDR', 'DRDR'];

// Defining local types for Accordion if not exported by phoenix-react-lib
interface AccordionItem {
  id: string;
  label: string;
  content: React.ReactNode;
  progress?: boolean;
  icon?: boolean;
  progressValue?: number;
  iconContent?: React.ReactNode;
  fieldFilledMap?: any;
}

interface AccordionProps {
  accordionData: AccordionItem[];
  openItems: string[];
  toggleItem: (id: string) => void;
}

const getValueByPath = (obj: any, path: string) =>
  path.split('.').reduce((acc: any, key: string) => acc?.[key], obj);

const RATE_DETAILS_ROW_REQUIRED_FIELDS: string[] = [
  'incomeBasis',
  'incomeRate',
  'incomeCurrency',
];

function calcRateDetailsProgress(rateRows: any[]): number {
  if (!Array.isArray(rateRows) || rateRows.length === 0) return 0;

  const activeRows = rateRows.filter((r: any) => r?.incomeChargeDetails?.chargeDescription);
  if (activeRows.length === 0) return 100;
  const total = activeRows.length * RATE_DETAILS_ROW_REQUIRED_FIELDS.length;
  const filled = activeRows.reduce((acc: number, r: any) => {
    let count = 0;

    RATE_DETAILS_ROW_REQUIRED_FIELDS.map((field: string) => {
      if (!!r[field]) count += 1;
    })

    return acc + count;
  }, 0)

  return Math.round((filled / total) * 100);
}

// Mandatory fields for LCL FORM
const LCL_QUOTE_PROGRESS: Record<string, string[]> = {
  mainDetails: ['createdBy', "quoteChannel", "type", "effectiveDate", "expirationDate"],
  customerDetails: ['lclForm.customerAddress', 'lclForm.customerName', 'lclForm.controllingEntity', 'lclForm.rateControllingEntity'],
  routingDetails: ['terms', 'pickupNeeded', 'portOfLoadingCode', 'portOfLoadingName', 'portOfDischargeCode', 'portOfDischargeName', 'destinationCfsCode', 'destinationCfsName', 'placeOfDeliveryCode', 'placeOfDeliveryName', 'warehouse', 'cfsCutoffDate', 'cfsCutoffTime'],
};

// Mandatory fields for FCL FORM 
const FCL_QUOTE_PROGRESS: Record<string, string[]> = {
  mainDetails: ['type', 'termName', 'controllingEntity', 'quoteChannel', 'effectiveDate', 'expirationDate', 'createdBy'],
  customerDetails: ['lclForm.customerAddress', 'lclForm.customerName'],
  routingDetails: ['loadName', 'loadCode', 'dischargeName', 'dischargeCode'],
  cargoDetails: ['containerType1'],
};

export default function QuotePage() {
  const [resetKey, setResetKey] = useState(0);
  const dispatch = useAppDispatch();

  const handleClearAll = useCallback(() => {
    dispatch(resetForm());
    gwtBridgeInstance.gwtActionFromReact('SET_REFERENCE_NUMBER_ON_TAB', {
      referenceNumber: '',
    });
    setResetKey((prev) => prev + 1);
  }, [dispatch]);

  return <QuotePageInternal key={resetKey} onClearAll={handleClearAll} />;
}

function QuotePageInternal({ onClearAll }: { onClearAll: () => void }) {
  const [populateOpen, setPopulateOpen] = useState(false);
  const [referenceNo, setReferenceNo] = useState('');
  const featureToggle = useFeatureToggle();
  const accordionIds = [
    'mainDetails',
    'documentDetails',
    'customerDetails',
    'routingDetails',
    'cargoDetails',
    'truckingDetails',
    'rateDetails',
    'locationInformation',
  ];
  const [isPopulatedQuote, setIsPopulatedQuote] = useState(false);
  const [isCopyQuoteMode, setIsCopyQuoteMode] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>(accordionIds);
  const [progressMap, setProgressMap] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [encryptedPreviewURL, setEncryptedPreviewURL] = useState('');
  const [openPreview, setOpenPreview] = useState(false);
  const isAllOpen = openItems.length === accordionIds.length;
  const [barBanner, setBarBanner] = useState<{ messages: string[]; autoHideMs?: number }>({ messages: [] });
  const [modalBanner, setModalBanner] = useState<{ messages: string[] }>({ messages: [] });
  const dataRef = useRef<Record<string, unknown>>({});
  const prevPendingFinalRef = useRef<string | null>(null);
  const { showStatus } = useStatus();
  const dispatch = useAppDispatch();
  const [defaultClauses, setDefaultClauses] = useState<Clause[] | undefined>(
    undefined
  );

  const loginClientBean = useAppSelector(
    (state: any) => state.loginClientBean?.data
  );

  const bookingDocumentDetails = useAppSelector(
    (state: any) => state.booking?.documentDetails
  );
  const selectedQuoteType = useAppSelector(
    (state: any) => state.quoteBooking?.mainDetails?.type
  );

  const mainDetail = useQuoteMainDetails(loginClientBean, selectedQuoteType);
  const documentDetail = useDocumentDetails();
  const customerDetails = useCustomerDetails('QUO');
  const routingDetails = useRouting({
    moduleType: 'QUOTE',
    shipmentType: mainDetail?.mainDetailsValue?.type === 'F' ? 'FCL' : 'LCL',
  });
  const cargoDetails = useCargoDetails(
    undefined,
    undefined,
    undefined,
    'QUO',
    showStatus
  );
  const { isVisible } = useFeatureToggle();
  const fclTruckingDetails = useFCLTruckingDetails({ etsDate: routingDetails?.routingFormData?.loadEts });
  console.log('fclTruckingDetails :>> ', fclTruckingDetails);
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



  function calcProgressFromState(stackId: string, formData: any): number {
    const quoteType = mainDetail?.mainDetailsValue?.type === 'F' ? FCL_QUOTE_PROGRESS : LCL_QUOTE_PROGRESS;
    const fields = quoteType[stackId];
    if (!fields || !Array.isArray(fields) || fields.length === 0) return 0;
    if (!fields || fields.length === 0) return 0;
    const filled = fields.filter((path) => !!getValueByPath(formData, path) && getValueByPath(formData, path) !== '-1').length;
    return Math.round((filled / fields.length) * 100);
  }

  useEffect(() => {
    if (routingDetails.showCustomerDetailsStack === true) {
      setOpenItems((prev) => [...prev, 'customerDetails']);
      routingDetails.toggleShowCustomerDetailsStack(false);
    }
    // routingDetails object is recreated every render; only the flag value matters here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routingDetails.showCustomerDetailsStack]);

  const [customerMoreDetailsFlagValue, toggleCustomerMoreDetailsFlagValue] =
    useState<boolean>(false);
  const rateDetails = useRateDetails({
    dataRef,
    loginClientBean,
    mainDetails: mainDetail.mainDetailsValue,
    routingFormData: routingDetails.routingFormData,
    customerFormData: customerDetails.customerFormData,
    cargoFormData: cargoDetails.cargoState,
    moduleType: 'QUO',
    containerType: mainDetail.mainDetailsValue.type,
    isFromCopy: true,
    teu: cargoDetails.totalTeu,
  });
  const { locationData: locationInfoData } = useContext(LocationContext);

  const routing = routingDetails;
  const showTrucking = mainDetail.mainDetailsValue.type === 'L' ? routing.pickupState.showPickupOrDoorDelivery : mainDetail.mainDetailsValue.pickupNeeded === 'Y';
  // Stabilize args to avoid new references on every render causing infinite loops
  const truckingPickups = routing.pickupState.showPickupStack
    ? routing.pickupState.pickups
    : EMPTY_PICKUPS;
  const truckingDoorDeliveryForm = routing.pickupState.showDoorDeliverySection
    ? routing.pickupState.doorDeliveryForm
    : undefined;
  const stableDoorDeliveryHandler = routing.pickupState.showDoorDeliverySection
    ? routing.pickupHandlers.handleDoorDeliveryFieldChange
    : undefined;
  const doorDeliveryChargeRows =
    routing.pickupState.doorDeliveryChargeRows ?? EMPTY_PICKUPS;
  const truckingDetail = useTruckingDetails(
    truckingPickups,
    truckingDoorDeliveryForm,
    stableDoorDeliveryHandler
  );
  const doorDeliveryRaw = useDoorDeliveryAccordionContent(
    truckingDetail.isCombined,
    doorDeliveryChargeRows
  );
  const [direction, setDirection] = useState(
    mainDetail.mainDetailsValue.direction
  );
  const [shipmentType, setShipmentType] = useState(
    mainDetail.mainDetailsValue.type
  );
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
    const teu = cargoDetails.totalTeu;
    // const containerCount = cargo
    // const containersByEquipment =
    return {
      weight: totalWeight,
      cube: totalVolume,
      pieces: totalPieces,
      teu: teu,
    };
  }, [cargoDetails.cargoState, rateDetails.formData]);

  const handleFieldsChange = useCallback((stackId: string, formData: any) => {
    const savedRateDetails = dataRef.current?.['rateDetails'] as any;
    const preserved =
      stackId === 'rateDetails' &&
        !formData?.originalBookingQuoteChargeBeanList &&
        savedRateDetails?.originalBookingQuoteChargeBeanList
        ? { ...formData, originalBookingQuoteChargeBeanList: savedRateDetails.originalBookingQuoteChargeBeanList }
        : formData;
    dataRef.current = { ...dataRef.current, [stackId]: preserved };
  }, []);

  useEffect(() => {
    const newMap: Record<string, number> = {
      mainDetails: calcProgressFromState('mainDetails', mainDetail.mainDetailsValue),
      customerDetails: calcProgressFromState('customerDetails', customerDetails.customerFormData),
      routingDetails: calcProgressFromState('routingDetails', routingDetails.routingFormData),
      rateDetails: calcRateDetailsProgress(rateDetails.formData?.charges?.rateDetails ?? []),
    };

    if (mainDetail.mainDetailsValue.type === 'F') {
      newMap.cargoDetails = calcProgressFromState('cargoDetails', cargoDetails?.cargoState?.cargoRows[0] ?? {});
    }

    setProgressMap((prev) => {
      const changed = Object.keys(newMap).some((k) => prev[k] !== newMap[k]);
      return changed ? { ...prev, ...newMap } : prev;
    });

  }, [
    mainDetail.mainDetailsValue,
    customerDetails.customerFormData,
    routingDetails.routingFormData,
    cargoDetails.cargoState,
    rateDetails.formData,
  ]);

  const loginBean = mapLoginBean(loginClientBean);

  const {
    data: populateData,
    loading: populateLoading,
    fetchPopulateData,
  } = useGetPopulateDataQuote({
    ...quotePopulateConfig,
    loginBean,
  });

  useEffect(() => {
    // set the preview document link
    if (populateData && !populateLoading) {
      if (
        typeof populateData?.result === 'object' &&
        typeof populateData?.result?.encryptedPreviewURL === 'string'
      ) {
        setEncryptedPreviewURL(populateData.result.encryptedPreviewURL);
      }
      setIsPopulatedQuote(true);
    }
  }, [populateData, populateLoading]);

  useEffect(() => {
    const result = (populateData as any)?.result;
    const mainBean = result?.bookingQuoteBean;
    if (!mainBean) {
      if (populateData !== null) {
        showStatus('warning', ['Invalid value. No data found for the entered reference number.']);
      }
      return;
    }

    const mappedMain = mapMainDetailsFromPopulate(mainBean, isCopyQuoteMode);
    handleFieldsChange('mainDetails', mappedMain);
    mainDetail.handleMainDetailsChange(mappedMain);
    dispatch(updateMainDetails(mappedMain));
    if (mappedMain.direction) setDirection(mappedMain.direction);
    if (mappedMain.type) setShipmentType(mappedMain.type);

    const mappedDocuments = mapDocumentDetailsFromPopulate(
      result?.uploadDocumentsBeanList
    );
    documentDetail.handleDocumentDetailsChange(mappedDocuments);

    const mappedRouting = mapRoutingFromPopulate(mainBean);
    handleFieldsChange('routingDetails', mappedRouting);
    routingDetails.bulkUpdateRouting(mappedRouting);
    if (mappedRouting.pickupNeeded) {
      routingDetails.pickupHandlers.setPickupNeeded(mappedRouting.pickupNeeded);
    }

    const pickupNeededValue = mappedRouting.pickupNeeded;
    const multiplePickups = result?.multiplePickupDetailBeanList ?? [];
    const singlePickup = result?.pickupDetailBean;
    const doorDeliveryBean =
      result?.bookingQuoteBean?.doorDeliveryDetailsBean ||
      result?.doorDeliveryDetailsBean;

    if (pickupNeededValue === 'Y' || pickupNeededValue === 'T') {
      const truckingData = mapTruckingFromPopulate({
        bookingQuoteBean: mainBean,
        multiplePickupDetailBeanList: multiplePickups,
        pickupDetailBean: singlePickup,
        doorDeliveryDetailsBean: doorDeliveryBean,
      });
      routingDetails.bulkUpdateTrucking({
        ...truckingData,
        showPickupStack: true,
      });
    } else if (
      doorDeliveryBean?.doorDeliveryCountry ||
      doorDeliveryBean?.doorDeliveryAddress1
    ) {
      const truckingData = mapTruckingFromPopulate({
        bookingQuoteBean: mainBean,
        multiplePickupDetailBeanList: [],
        doorDeliveryDetailsBean: doorDeliveryBean,
      });
      routingDetails.bulkUpdateTrucking(truckingData);
    }

    const mappedCustomer = mapCustomerFromPopulate(mainBean);
    if (mappedCustomer) {
      handleFieldsChange('customerDetails', mappedCustomer);
      rateDetails.handlers.suppressRatingTypePopulate();
      customerDetails.bulkUpdateCustomer(mappedCustomer);
    }

    const mappedCargo = mapCargoFromPopulate(result);
    handleFieldsChange('cargoDetails', mappedCargo);
    cargoDetails.bulkPopulateCargo(mappedCargo);
    dispatch(updateCargoDetails(mappedCargo));

    const mapFCLTruckingDetails = mapFCLTruckingFromPopulate(
      result?.pickupDetailBean,
      loginBean
    );
    handleFieldsChange('fclTruckingDetails', mapFCLTruckingDetails);
    fclTruckingDetails.bulkUpdateFCLTrucking(mapFCLTruckingDetails);

    const mappedRateDetails = mapRateDetailsFromPopulate(
      result?.bookingQuoteChargeBeanList,
      mainBean,
      {
        showPickupSection: rateDetails.defaultState.showPickupSection,
        showDoorDeliverySection:
          rateDetails.defaultState.showDoorDeliverySection,
        showPlcSection: rateDetails.defaultState.showPlcSection,
        localCurrency: rateDetails.defaultState.localCurrency,
      }
    );
    handleFieldsChange('rateDetails', mappedRateDetails);
    rateDetails.handlers.handleRatingTypeChange(mappedRateDetails.ratingType);
    rateDetails.handlers.handleRoeTypeChange(mappedRateDetails.roeType);
    rateDetails.handlers.handleROERowsChange(
      mappedRateDetails.rateOfExchange.roeRows
    );
    rateDetails.handlers.handleRateDetailsChargesPopulate(
      mappedRateDetails.charges.rateDetails
    );
    const cargoBean = result?.bookingQuoteBean?.bookingQuoteCargoBean;
    if (cargoBean) {
      const containers = [
        {
          type: `${cargoBean?.containerSize1 ?? ''}-${cargoBean?.containerType1 ?? ''}`,
          count: cargoBean?.container1,
        },
        {
          type: `${cargoBean?.containerSize2 ?? ''}-${cargoBean?.containerType2 ?? ''}`,
          count: cargoBean?.container2,
        },
        {
          type: `${cargoBean?.containerSize3 ?? ''}-${cargoBean?.containerType3 ?? ''}`,
          count: cargoBean?.container3,
        },
      ];
      const grouped: Record<string, number> = {};
      containers.forEach((item) => {
        if (!item.type || item.type === '-') return;
        if (!item.count || Number(item.count) <= 0) return;
        const numericCount = Number(item.count);
        grouped[item.type] = (grouped[item.type] ?? 0) + numericCount;
      });
      const newList: SelectOption[] = Object.keys(grouped).map((type) => {
        const total = grouped[type];
        const containerTypeValue =
          cargoDetails.containerTypeSelect.find((opt) => opt.value === type)
            ?.label || type;
        return {
          label: `${total} X ${containerTypeValue}`,
          value: `${total}X${type}`,
        };
      });
      const currentList = rateDetails.defaultState.equipmentDetailsList || [];
      const isSame =
        newList.length === currentList.length - 1 &&
        newList.every((item) =>
          currentList.some((c) => c.value === item.value)
        );
      if (!isSame) {
        rateDetails.defaultState.setEquipmentDetailsList?.([
          { label: 'Select', value: '' },
          ...newList,
        ]);
      }
      const containerDataList = cargoDetails.getContainerDataList({ 
        numberOfContainer1: cargoBean?.container1,
        containerType1: `${cargoBean?.containerSize1 ?? ''}-${cargoBean?.containerType1 ?? ''}`,
        numberOfContainer2: cargoBean?.container2,
        containerType2: `${cargoBean?.containerSize2 ?? ''}-${cargoBean?.containerType2 ?? ''}`,
        numberOfContainer3: cargoBean?.container3,
        containerType3: `${cargoBean?.containerSize3 ?? ''}-${cargoBean?.containerType3 ?? ''}`,
      });
      calculateTEU(
            'BKG',
            {
              getContainerData: () => containerDataList,
              setTotalTeu: (value) => {
                cargoDetails.setTotalTeu(value);
              }
            },
            cargoDetails.containerTypeBean
          )
    }
    if (fclTruckingDetails) {
      const pickupCharges =
        result?.pickupDetailBean?.pickupChargeBeanList || [];

      pickupCharges.forEach((row: any, index: number) => {
        // Charge Description
        fclTruckingDetails.handleTruckingChargeChange(
          'chargeDescription',
          row?.chargeDescription ?? '',
          index
        );

        // Charge
        fclTruckingDetails.handleTruckingChargeChange(
          'charge',
          row?.charge ?? '',
          index
        );

        // Currency
        fclTruckingDetails.handleTruckingChargeChange(
          'currency',
          row?.currency ?? '',
          index
        );

        // Income
        fclTruckingDetails.handleTruckingChargeChange(
          'income',
          row?.income ?? 0,
          index
        );

        // Expense
        fclTruckingDetails.handleTruckingChargeChange(
          'expense',
          row?.expense ?? 0,
          index
        );
      });
    }
    gwtBridgeInstance.gwtActionFromReact('SET_REFERENCE_NUMBER_ON_TAB', {
      referenceNumber: String(mappedMain.referenceNumber === 0 ? '' : mappedMain.referenceNumber),
    });
  }, [populateData, handleFieldsChange]);

  useEffect(() => {
    if (showTrucking) {
      setOpenItems((prev) =>
        prev.includes('truckingDetails') ? prev : [...prev, 'truckingDetails']
      );
    }
  }, [showTrucking]);

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

  const handlePopulate = (referenceNumber: string) => {
    fetchPopulateData(referenceNumber);
    setPopulateOpen(false);
  };

  useEffect(() => {
    if (!loginClientBean) return;
    const config = gwtBridgeInstance.passPhoenixConfigurationDataToReactForQuoteLCL();
    if (config?.referenceNumber) {
      handlePopulate(config.referenceNumber);
    }
  }, [loginClientBean]);

  const handleMainDetailsChange = useCallback(
    (updatedData: QuoteMainDetailsState) => {
      let finalData = updatedData;
      if (mainDetail.mainDetailsValue.type !== updatedData?.type) {
        finalData = {
          ...createDefaultMainDetailsState(loginClientBean, isVisible), // reset all main details fields
          type: updatedData.type, // keep selected type
        };
        documentDetail.setFormData(createDefaultDocumentRows()); // reset document details
        customerDetails.setFormData(initialCustomerDetailFormState); // reset customer details
        routingDetails.resetRouting();
        cargoDetails.setCargoRows([{ ...initialCargoRow }]);
        rateDetails.setFormData(defaultRateDetailsFormData('USD', 'USD'));
      }
      handleFieldsChange('mainDetails', finalData);
      mainDetail.handleMainDetailsChange(finalData);
      dispatch(updateMainDetails(finalData));
      if (finalData.direction) setDirection(finalData.direction);
      if (finalData.type) setShipmentType(finalData.type);
    },
    [handleFieldsChange, mainDetail, dispatch, setDirection, setShipmentType]
  );

  const handleDocumentDetailsChange = useCallback(
    (formData: any) => {
      handleFieldsChange('documentDetails', formData);
      documentDetail.handleDocumentDetailsChange(formData);
    },
    [handleFieldsChange, documentDetail]
  );
  const payload = buildQuoteSubmitPayload(
    loginBean,
    dataRef.current['mainDetails'] || mainDetail.mainDetailsValue,
    dataRef.current['customerDetails'] || customerDetails.customerFormData,
    {
      routingFormData:
        dataRef.current['routingDetails'] || routingDetails.routingFormData,
      pickupForms: routingDetails.pickupState.truckingPickupForms,
      pickupTruckerForms: routingDetails.pickupState.pickupTruckerForms,
      doorDeliveryForm: routingDetails.pickupState.doorDeliveryForm,
    },
    dataRef.current['cargoDetails'] || {
      cargoRows: cargoDetails.cargoState.cargoRows,
      lotRows: cargoDetails.lotState.lotRows,
      allLotRows: cargoDetails.lotRows,
      flags: cargoDetails.flagState.flags,
      internalComment: cargoDetails.instructionState.internalComment,
      oldInternalComment: cargoDetails.oldInternalComment,
      loadingInstruction: cargoDetails.instructionState.loadingInstruction,
      warehouseInstruction: cargoDetails.instructionState.warehouseInstruction,
    },
    dataRef.current['rateDetails'] || rateDetails.formData,
    mapDocumentDetailsToUploadDocumentBeans(bookingDocumentDetails, {
      referenceNumber:
        mainDetail.mainDetailsValue.referenceNumber?.toString() ?? '0',
      referenceObject: 'QUO',
    }),
    isVisible,
    dataRef.current['fclTruckingDetails'] || fclTruckingDetails.formData
  );

  const performQuoteSave = async () => {
    setBarBanner({ messages: [], autoHideMs: undefined });
    setModalBanner({ messages: [] });
    const mainData = dataRef.current['mainDetails'] || mainDetail.mainDetailsValue;
    const customerData = dataRef.current['customerDetails'] || customerDetails.customerFormData;
    devAPIlog('::Customer Detail::', customerData);
    const routingData =
      dataRef.current['routingDetails'] || routingDetails.routingFormData;
    const cargoData = dataRef.current['cargoDetails'] || {
      cargoRows: cargoDetails.cargoState.cargoRows,
      lotRows: cargoDetails.lotState.lotRows,
      flags: cargoDetails.flagState.flags,
      internalComment: cargoDetails.instructionState.internalComment,
      loadingInstruction: cargoDetails.instructionState.loadingInstruction,
      warehouseInstruction: cargoDetails.instructionState.warehouseInstruction,
    };
    const rateData = {
      ...(dataRef.current['rateDetails'] || rateDetails.formData),
      ratingType: rateDetails.formData.ratingType,
    };

    const validation = validateQuoteForm(
      mainData,
      customerData,
      routingData,
      cargoData,
      rateData
    );
    if (!validation.valid) {
      if (validation.errors.length > 0) {
        showStatus('warning', validation.errors);
      }
      return;
    }

    const savePayload = buildQuoteSubmitPayload(
      loginBean,
      mainData,
      customerData,
      {
        routingFormData: routingData,
        pickupForms: routingDetails.pickupState.truckingPickupForms,
        pickupTruckerForms: routingDetails.pickupState.pickupTruckerForms,
        doorDeliveryForm: routingDetails.pickupState.doorDeliveryForm,
      },
      cargoData,
      rateData,
      mapDocumentDetailsToUploadDocumentBeans(bookingDocumentDetails, {
        referenceNumber: mainDetail.mainDetailsValue.referenceNumber?.toString() ?? '0',
        referenceObject: 'QUO',
      }),
      isVisible,
      dataRef.current['fclTruckingDetails'] || fclTruckingDetails.formData
    );

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = (await ApiService.post(
        OCEAN_ENDPOINTS.QUOTE.VALIDATE_AND_SAVE_DATA,
        savePayload
      )) as any;

      const quoteNumber =
        response?.data?.result?.bookingQuoteBean?.quoteNumber ||
        response?.data?.result?.bookingQuoteBean?.referenceNumber;
      if (quoteNumber) {
        setIsCopyQuoteMode(false);
        showStatus('success', [`Quote ${quoteNumber} saved successfully!`]);
        mainDetail.handleMainDetailsChange({
          ...mainDetail.mainDetailsValue,
          isCopyQuote: false,
        });
        handlePopulate(String(quoteNumber));
      } else if (Array.isArray(response?.data?.validations) && response?.data?.validations.length > 0) {
        showStatus('warning', [response?.data?.validations[0].message]);
        return;
      } else {
        showStatus('error', [response?.data?.message || 'An unexpected error occurred while saving the quote.']);

      }
    } catch (error) {
      console.error('Failed to submit quote:', error);
      showStatus('error', ['An error occurred while saving the quote.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const warning = rateDetails.defaultState.chargeWarning;
    if (warning) {
      showStatus('warning', [warning]);
    }
  }, [rateDetails.defaultState.chargeWarning]);

  const quoteReferenceNumber =
    (mainDetail.mainDetailsValue as any).referenceNumber ?? null;

  const quoteIRP = useIRPController({
    eventCode: ['BOOKING_PENDING_FINAL_UPDATED'],
    referenceNumber: quoteReferenceNumber,
    referenceType: 'QUOTE',
    title: 'Pending Final Updated - Incident Reason',
    prefetch: false,
    onConfirmed: () => performQuoteSave(),
  });

  const handleSubmit = async () => {
    setBarBanner({ messages: [], autoHideMs: undefined });
    setModalBanner({ messages: [] });
    const currentPF =
      (dataRef.current['mainDetails'] as any)?.pendingFinalQuoteStatus ?? null;
    const isUpdate = !!quoteReferenceNumber;
    const pendingFinalChangedToNo =
      prevPendingFinalRef.current !== 'N' && currentPF === 'N';

    prevPendingFinalRef.current = currentPF;

    if (isUpdate && pendingFinalChangedToNo) {
      quoteIRP.openIRP();
      return;
    }

    await performQuoteSave();
  };
  const { data: quoteReferenceSuggestions, setQuery: setQuoteReferenceQuery } =
    useGetSuggestions(quoteReferenceSuggestionConfig('L'));

  const progressOf = (stackId: string) => {
    if (typeof progressMap[stackId] === 'number') {
      return progressMap[stackId]
    }

    return 100;
  };

  const averageProgress = useMemo(() => {
    const values = Object.values(progressMap);
    if (values.length === 0) return 0;
    const sum = values.reduce((acc, v) => acc + v, 0);
    return Math.round(sum / values.length);
  }, [progressMap]);

  // trucking visibility handled above

  function getFileDownloadUrl(): string {
    const uploadDocumentsBean = (populateData as any)?.result?.uploadDocumentsBeanList;
    const encryptedPreviewURL = (populateData as any)?.result?.encryptedPreviewURL;

    const fileBaseUrl = encryptedPreviewURL.substring(0, encryptedPreviewURL.indexOf("?"));
    const params = new URLSearchParams({
      userId: loginClientBean.userId,
      download: "Y",
      generate: "N",
      schemaName: loginClientBean.schema,
      referenceNo: encodeURIComponent(uploadDocumentsBean[0].referenceNumber),
      documentId: uploadDocumentsBean[0].documentId,
    });

    if (loginClientBean.isToggleCustomer) {
      params.append("customer", "");
    }

    return `${fileBaseUrl}?${params.toString()}`;
  }

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
    ref?: React.MutableRefObject<HTMLInputElement | null>,
    accordionId?: number,
    openOnTab?: boolean,
    openOnShiftTab?: boolean
  ) => {
    const isTab = event.key === 'Tab';
    if (!isTab) return;

    const isShiftTab = event.shiftKey;
    const shouldAct = isShiftTab ? openOnShiftTab : openOnTab;

    if (!shouldAct) return;

    event.preventDefault();

    const accordionKey =
      accordionId !== undefined ? accordionIds[accordionId] : undefined;
    const isClosed =
      accordionKey !== undefined && !openItems.includes(accordionKey);
    if (isClosed && accordionKey) {
      toggleItem(accordionKey);
      setTimeout(() => ref?.current?.focus(), 300);
    } else {
      setTimeout(() => ref?.current?.focus(), 0);
    }
  };
  const hasUpdatedNumberOfContainerRateDetailsRef = useRef(false);
  const hasUpdatedContainerTypeRateDetailsRef = useRef(false);

  const handleBlur = (
    numberOfContainer: string,
    containerType: string,
    index: number,
    changedField: 'numberOfContainer' | 'containerType'
  ) => {
    const valueChange = false;
    const currentRows = rateDetails.formData?.charges?.rateDetails ?? [];
    // TODO: Need to add condition
    // if(isVisible(CommonToggleKeys.SHOW_MULTIPORT_PAIR_IN_QUOTE))
    if (
      changedField === 'numberOfContainer' &&
      !hasUpdatedNumberOfContainerRateDetailsRef.current
    ) {
      const updatedRows = currentRows.map((row) =>
        row.originDestination === '' ? { ...row, originDestination: 'O' } : row
      ) as BookingQuoteChargeBeanFull[];

      rateDetails.handlers.handleRateDetailsChargesChange(updatedRows);

      hasUpdatedNumberOfContainerRateDetailsRef.current = true;
    }

    if (
      changedField === 'containerType' &&
      !hasUpdatedContainerTypeRateDetailsRef.current
    ) {
      const updatedTypeRows = currentRows.map((row) =>
        row.equipmentDetails === '' ? { ...row, equipmentDetails: '' } : row
      ) as BookingQuoteChargeBeanFull[];

      rateDetails.handlers.handleRateDetailsChargesChange(updatedTypeRows);
      hasUpdatedContainerTypeRateDetailsRef.current = true;
    }

    cargoDetails.cargoHandlers.valueIsChanged?.(
      valueChange,
      numberOfContainer,
      containerType,
      rateDetails.defaultState
    );
  };

  const accordionItems: AccordionItem[] = useMemo(
    () => [
      {
        id: accordionIds[0],
        label: 'Main Details',
        content: (
          <QuoteMainDetailsSection
            quoteMainDetails={mainDetail}
            onFieldsChange={handleMainDetailsChange}
            onPopulateData={handlePopulate}
            onKeyDown={handleKeyDown}
            showStatus={showStatus}
            dateValidationFromRouting={routingDetails}
            isQuotePopulated={!!((populateData as any)?.result?.bookingQuoteBean && !populateLoading)}
            showBannerError={showBannerError}
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
            documentDetails={documentDetail}
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
            showBannerError={showBannerError}
            moduleType="QUO"
            containerType={'l'}
            direction={direction}
            customerDetail={customerDetails}
            onFieldsChange={(formData) =>
              handleFieldsChange('customerDetails', formData)
            }
            rateDetails={rateDetails}
            moreDetailsRef={
              customerMoreDetailsFlagValue === true
                ? undefined
                : routingDetails.customerDetailsStackMoreDetailsRef
            }
            trackingCodeRef={
              customerMoreDetailsFlagValue === true
                ? routingDetails.customerDetailsStackMoreDetailsRef
                : undefined
            }
            moreDetailsFlagValue={(res) => {
              toggleCustomerMoreDetailsFlagValue(res);
            }}
            shipmentType={mainDetail.mainDetailsValue.type}
          />
        ),
        progress: true,
        icon: false,
        progressValue: progressOf('customerDetails'),
      },
      {
        id: accordionIds[3],
        label: 'Routing Details',
        content:
          mainDetail?.mainDetailsValue?.type === 'F' ? (
            <FCLQuoteRoutingDetails
              routing={routingDetails}
              onFieldsChange={(formData: any) =>
                handleFieldsChange('routingDetails', formData)
              }
              rateDetails={rateDetails}
              mainDetail={mainDetail}
            />
          ) : (
            <QuoteRoutingDetails
              showBannerError={showBannerError}
              routing={routingDetails}
              rateDetails={rateDetails}
              mainDetailsValue={mainDetail.mainDetailsValue}
              onTruckQuoteReset={() => {
                const updated = { ...mainDetail.mainDetailsValue, truckQuote: 'No' };
                handleFieldsChange('mainDetails', updated);
                mainDetail.handleMainDetailsChange(updated);
                dispatch(updateMainDetails(updated));
              }}
              onFieldsChange={(formData: any) =>
                handleFieldsChange('routingDetails', formData)
              }
            />
          ),
        progress: true,
        icon: false,
        progressValue: progressOf('routingDetails'),
        fieldFilledMap: {},
      },
      {
        id: accordionIds[4],
        label: 'Cargo Details',
        content: (
          <CargoDetails
            moduleType={MODULE_QUO}
            cargoDetails={cargoDetails}
            rateDetails={rateDetails}
            onRegisterFields={() => { }}
            onFieldsChange={(formData) =>
              handleFieldsChange('cargoDetails', formData)
            }
            shippingType={mainDetail.mainDetailsValue.type && mainDetail.mainDetailsValue.type !== '-1' ? mainDetail.mainDetailsValue.type : 'L'}
            routingRef={routingDetails.routingRef}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
          />
        ),
        progress: true,
        icon: false,
        progressValue: progressOf('cargoDetails')
      },
      {
        id: accordionIds[5],
        label: 'Filing Details',
        content: (
          <FilingDetails
            // filingDetails={filingDetails}
            // PHX-131742: FCL Booking: cargo details section changes - Commented by dhapatel
            /* onRegisterFields={(fields) => registerFields('filingDetails', fields)} */

            // PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
            onRegisterFields={() => {}}
            
            // PHX-131742: FCL Booking: cargo details section changes - Added by dhapatel
            onFieldsChange={(formData) => handleFieldsChange('filingDetails', formData)}
          />
        ),
        progress: true,
        icon: false,
        progressValue: progressOf('customDetails'),
      },
      ...(showTrucking
        ? [
          {
            id: accordionIds[5],
            label: 'Trucking Details',
            progress: true,
            icon: mainDetail.mainDetailsValue.type === 'L' ? true : false,
            progressValue: mainDetail.mainDetailsValue.type === 'L' ? progressOf('truckingDetails') : progressOf('fclTruckingDetails'),
            content: (
              <>
                {mainDetail.mainDetailsValue.type === 'L' ? (
                  <QuoteTruckingDetails
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
                    moduleCode="QUO"
                    moduleType="QUO"
                  />
                ) : (
                  <FCLQuoteTruckingDetailPage trucking={fclTruckingDetails}
                    onFieldsChange={(formData: any) =>
                      handleFieldsChange('fclTruckingDetails', formData)
                    } />
                )}
              </>
            ),
          },
        ]
        : []),
      {
        id: accordionIds[6],
        label: 'Rate Details',
        content: (
          <QuoteRateDetails
            showBannerError={showBannerError}
            moduleType={MODULE_QUO}
            rateDetails={rateDetails}
            cargoMetrics={cargoMetrics}
            onFieldsChange={(formData) =>
              handleFieldsChange('rateDetails', formData)
            }
            shippingType={shipmentType}
            shipmentDirection={direction}
          />
        ),
        progress: true,
        icon: true,
        progressValue: progressOf('rateDetails'),
        iconContent: <RateDetailsIcons />,
      },
      {
        id: accordionIds[7],
        label: 'Location Information',
        content: <LocationInfo data={locationInfoData} />,
        progress: false,
        icon: false,
      },
    ],
    [
      accordionIds,
      mainDetail,
      documentDetail,
      customerDetails,
      routingDetails,
      cargoDetails,
      showTrucking,
      doorDeliveryRaw,
      routing,
      rateDetails,
      handleMainDetailsChange,
      handleDocumentDetailsChange,
      handleFieldsChange,
      progressMap,
      locationInfoData,
      direction,
    ]
  );

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
  const openNotes = () => {
    var openNotesPopup: any = {};
    openNotesPopup.referenceNumber =
      mainDetail.mainDetailsValue.referenceNumber?.toString() ?? '';
    openNotesPopup.type = 'java';

    const schemaName = loginBean?.userSchemaName || '';
    openNotesPopup.schemaName = schemaName;
    openNotesPopup.schema = schemaName;
    openNotesPopup.module = 'QUO';
    openNotesPopup.defaultNoteType = '';
    openNotesPopup.showClauseWidgets = 'true';
    openNotesPopup.showDocumentWidgets = 'true';

    GwtBridge.gwtActionFromReact('OPEN_NOTES_POPUP', openNotesPopup);
  };

  const tabId = useTabId;
  const openDocuments = () => {
    const schemaName = loginBean?.userSchemaName || '';

    var openDocumentsPopup: any = {};
    openDocumentsPopup.code = 'QUO';
    openDocumentsPopup.type = 'Quote';
    openDocumentsPopup.referenceNumber =
      mainDetail.mainDetailsValue.referenceNumber?.toString() ?? '';
    openDocumentsPopup.fclLcl = 'L';
    openDocumentsPopup.schemaName = schemaName;
    openDocumentsPopup.module = 'QUO';
    openDocumentsPopup.handlingOffice =
      mainDetail.mainDetailsValue.handlingOffice ?? 'NYC';
    openDocumentsPopup.customerEmail =
      customerDetails.customerFormData.lclForm.customerEmail ??
      '';
    openDocumentsPopup.destination =
      routingDetails.routingFormData.portOfDischargeName ?? '';
    openDocumentsPopup.receiverName =
      customerDetails.customerFormData.lclForm.customerName ?? '';
    openDocumentsPopup.accessCode = 'Quote';
    openDocumentsPopup.tabId = tabId;

    openDocumentsPopup.bean = JSON.stringify(payload.requestData);

    GwtBridge.gwtActionFromReact(
      'OPEN_SEND_DOCUMENTS_POPUP',
      openDocumentsPopup
    );
  };

  const oneDocsClick = () => {
    if (
      !populateData ||
      !populateData.result ||
      typeof populateData.result !== 'object'
    ) {
      showStatus('error', ['Unable to open eDocs. Please try again later.']);
      return;
    }

    const openEdocsScreen: any = {};
    openEdocsScreen.accessCode = 'edocsManagement';
    openEdocsScreen.type = 'QUO';
    openEdocsScreen.refNo =
      populateData?.result?.bookingQuoteBean?.referenceNumber ?? '13181271';
    openEdocsScreen.module = 'QUO';
    openEdocsScreen.application = 'O';
    openEdocsScreen.fullType = 'Quote Number';
    openEdocsScreen.refreshTab = true;

    GwtBridge.gwtActionFromReact('OPEN_EDOCS_SCREEN', openEdocsScreen);
  };

  const handlerToolBarOnPreview = () => {
    // This is the toolbar preview click handler
    setOpenPreview(true);
  };

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (!event.data || typeof event.data !== 'object') {
        return;
      }

      const incomingReferenceId = event.data.referenceId;
      const payload = event.data.payload;

      if (!incomingReferenceId) {
        return;
      }

      if (incomingReferenceId !== tabId) {
        return;
      }
    };

    window.parent.addEventListener('message', handler);
    return () => window.parent.removeEventListener('message', handler);
  }, [tabId]);

  useEffect(() => {
    if (loginClientBean) {

      getDefaultClauseBeanData();
    }
  }, [loginClientBean]);



  const handleCopyQuote = () => {
    dispatch(resetForm());

    setIsCopyQuoteMode(true);

    mainDetail.handleMainDetailsChange({
      ...mainDetail.mainDetailsValue,
      referenceNumber: '',
      reference: '',
      quoteNumber: '',
      rowId: null,
      isCopyQuote: true,
    });

    setReferenceNo('');
    gwtBridgeInstance.gwtActionFromReact('SET_REFERENCE_NUMBER_ON_TAB', { referenceNumber: '' });
    setPopulateOpen(true);
  };

  const getDefaultClauseBeanData = async () => {
    let clause = '';
    if (isVisible(CommonToggleKeys.DEFAULT_BOOKING_QUOTE_NSAB_CLAUSE)) {
      clause = 'NSAB';
    }

    if (isVisible(CommonToggleKeys.DEFAULT_BOOKING_QUOTE_GULF_CLAUSE)) {
      clause = 'GULF';
    }
    try {
      // await new Promise((resolve) => setTimeout(resolve, 100));
      const requestPayload = {
        clause,
      };
      const clauseResponse = (await ApiService.post(
        API_ENDPOINTS.BOOKING.GET_DEFAULT_CLAUSES_BEAN,
        requestPayload
      )) as any;
      if (clauseResponse?.data?.success == 1) {
        setDefaultClauses(clauseResponse.data.result);
      }
    } catch (error) {
      console.error('Error occurred while fetching default clauses', error);
    }
  };

  function setClauses(clausesList: Clause[]) {
    if (!clausesList) return;
    let clauseSuggestions: {
      clauseCode: string;
      clauseName: string;
      clauseDesc: string;
    }[];
    const isLocaleClause: boolean =
      loginClientBean?.locale !== 'en' &&
      loginClientBean?.officeSettingMap?.SHOW_LOCALE_CLAUSES?.[0] === 'Y';
    if (
      loginClientBean?.officeSettingMap?.CLAUSE_DESCRIPTION_ENABLE?.[0] === 'Y'
    ) {
      clauseSuggestions = clausesList.map((clause) => ({
        clauseCode: clause.clauseCode,
        clauseName: isLocaleClause
          ? clause?.clauseNameLocale
            ? clause.clauseNameLocale
            : ''
          : clause?.clauseName
            ? clause?.clauseName
            : '',
        clauseDesc: clause.clauseText ?? clause.clauseDesc ?? '',
      }));
    } else {
      clauseSuggestions = clausesList.map((clause) => ({
        clauseCode: clause.clauseCode,
        clauseName: isLocaleClause
          ? clause?.clauseNameLocale
            ? clause.clauseNameLocale
            : ''
          : clause?.clauseName
            ? clause?.clauseName
            : '',
        clauseDesc: '',
      }));
    }
    //will clear existing clauses present in UI and add newer one
    mainDetail.handleMainDetailsChange({
      ...mainDetail.mainDetailsValue,
      clauses: [...clauseSuggestions],
    });
  }

  useEffect(() => {

    if (

      mainDetail.mainDetailsValue.type === 'L' &&
      defaultClauses?.length &&
      !isPopulatedQuote
    ) {
      setClauses(defaultClauses);
    }
  }, [mainDetail.mainDetailsValue.type, defaultClauses, isPopulatedQuote,]);

  const handleCopyQuoteConfirm = async (
    referenceNumber: string
  ) => {
    if (!referenceNumber?.trim()) {
      showStatus('error', ['Please enter a quote number']);
      return;
    }

    try {
      setIsCopyQuoteMode(true);

      await fetchPopulateData(referenceNumber.trim());

      setPopulateOpen(false);

      showStatus('success', ['Quote copied successfully']);
    } catch (error) {
      console.error(error);
      showStatus('error', ['Failed to copy quote']);
    }
  };
  return (
    <>
      <QuoteErrorBanner
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
      <QuoteErrorBanner
        messages={modalBanner.messages}
        onClose={(msg) => {
          setModalBanner((prev) => ({
            messages: prev.messages.filter((m) => !msg.includes(m)),
          }))
        }}
        variant="modal"
      />

      <ToolBar
        isDataPopulated={populateData?.success === 1 && !populateLoading}
        onPreview={handlerToolBarOnPreview}
        oneDocsClick={oneDocsClick}
        onNotesClick={openNotes}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        onToggleAll={toggleAllItems}
        isAllOpen={isAllOpen}
        progress={averageProgress}
        isSaved={
          !!(
            (mainDetail.mainDetailsValue as any).reference ||
            mainDetail.mainDetailsValue.referenceNumber
          )
        } // currently loosely managed; need to fix
        onDocumentsClick={openDocuments}
        moduleType="QUO"
        disableDocuments={!mainDetail.mainDetailsValue.referenceNumber}
        onCopyQuote={handleCopyQuote}
        handleClearAll={onClearAll}
      />
      {/*@ts-ignore*/}
      <Accordion {...accordionProps} />
      { }
      {/* @ts-ignore */}
      <IRPPopup {...quoteIRP.irpPopupProps} />
      <CopyModal
        moduleType="QUO"
        open={populateOpen}
        onClose={() => setPopulateOpen(false)}
        onCopyClick={handleCopyQuoteConfirm}
        title="Copy Quote"
        label="Enter Quote Number"
        shippingType={mainDetail.mainDetailsValue.type && mainDetail.mainDetailsValue.type !== '-1' ? mainDetail.mainDetailsValue.type : 'L'}
      />
      <PreviewDocuments
        open={openPreview}
        onClose={() => setOpenPreview(false)}
        encryptedPreviewURL={encryptedPreviewURL}
      />
    </>
  );
}
