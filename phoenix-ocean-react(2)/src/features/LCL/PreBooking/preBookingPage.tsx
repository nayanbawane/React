import {
  useEffect,
  useState,
  useRef,
  useContext,
  useMemo,
  useCallback,
} from 'react';
import {
  Accordion,
  AccordionItem,
  AccordionProps,
  PCommonPrompt,
  PConfirmationModal,
  PToggleButton,
} from 'phoenix-react-lib';

interface YesNoToggleGroupProps {
  value: string;
  onChange: (key: string) => void;
  options: { key: string; label: string }[];
}

function YesNoToggleGroup({ value, onChange, options }: YesNoToggleGroupProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {options.map((opt) => {
        const isSelected = value === opt.key;
        return (
          <div
            key={opt.key}
            style={{ display: 'flex', alignItems: 'center', gap: 10 }}
          >
            <PToggleButton
              value={isSelected}
              onChange={() => {
                if (!isSelected) onChange(opt.key);
              }}
            />
            <span>{opt.label}</span>
          </div>
        );
      })}
    </div>
  );
}
import PreBookingRoutingDetails from './RoutingDetails';
import {
  AccessoriesOption,
  DocumentDetails,
  IRPPopup,
  LocationInformation,
  mapDocumentDetailsToUploadDocumentBeans,
  mapTruckingFromPopulate,
  pickupACCESSORIALS,
  resetForm,
  ToolBar,
  useGetSelections,
  setReferenceDisabled,
  updatePreBookingMainDetails,
  useIRPController,
  useStackProgressBar,
  useTabId,
  useTermsAndConditionsApi,
  resetPreBookingForm,
  setReferenceNoInvalid,
  setImportQuoteNoInvalid,
  mapMainDetailsToBookingQuoteBean,
  num,
  PHOENIX_ENDPOINTS,
  mapMainDetailsToPreBookingQuoteBean,
  useFeatureToggle,
  CommonToggleKeys,
  BookingClauseBean,
  Clause,
  CopyModal,
  DocumentStatusIcons,
  initialCustomerDetailFormState,
} from 'phoenix-common-react';
import MainDetails from './MainDetails';
import PreBookingCustomerDetails from './CustomerDetails';
import { usePreBokingMainDetails } from '../../../hooks/LCL/MainDetails/PreBooking/usePreBookingMaindetails';
import { useCustomerDetails } from '../../..//hooks/LCL/CustomerDetails/useCustomerdetails';
import { useStatus } from '../../../context/statusContext';
import { useRouting } from '../../..//hooks/LCL/RoutingDetails/useRoutingDetails';
import PreBookingRateDetails from './RateDetails';
import { useRateDetails } from '@/hooks/LCL/RateDetails/useRateDetails';
import CargoDetails from '../Booking/CargoDetails';
import TruckingDetails from '../Booking/TruckingDetails/index';
import {
  useDoorDeliveryAccordionContent,
  useTruckingDetails,
} from '@/hooks/LCL/TruckingDetails/useTruckingDetails';
import { GwtBridge, gwtBridgeInstance } from 'phoenix-common-react';
import PreBookingTermsAndConditions from './TermsAndConditions';
import { useAppSelector } from '../../../app/store/hooks';
import { LocationContext } from '@/context/locatioContext';
import { useCargoDetails } from '@/hooks/LCL/CargoDetails/useCargodetails';
import { useDocumentDetails } from '@/hooks/LCL/DocumentDetails/useDocumentdetails';
import {
  buildPreBookingSubmitPayload,
  formatName,
} from '@/hooks/LCL/MainDetails/PreBooking/prebookingSubmitPayloadMapper';

import { PreBookingmapLoginBean } from '@/hooks/LCL/MainDetails/PreBooking/preBookingLoginBeanMapper';
import { OCEAN_ENDPOINTS } from '@/core/api/config/ocean.endpoints';
import { ApiService } from '@/core/api/client';
import { useGetPopulateDataPrebooking } from '@/hooks/LCL/MainDetails/PreBooking/PopulateMapper/useGetPopulateDataPrebooking';
import { prebookingPopulateConfig } from '@/hooks/LCL/MainDetails/PreBooking/PopulateMapper/prebookingPopulateHelper';
import {
  mapCargoFromPopulate,
  mapCustomerFromPopulate,
  mapDocumentDetailsFromPopulate,
  mapMainDetailsFromPopulate,
  mapRateDetailsFromPopulate,
  mapRoutingFromPopulate,
  resolveTermsAfterQuotePopulate,
} from '@/hooks/LCL/MainDetails/PreBooking/PopulateMapper/prebookingPopulateMapper';
import { useAppDispatch } from '../../../app/store/hooks';
import { useGetPopulateDataQuote } from '@/hooks/LCL/MainDetails/Quote/useGetPopulateDataQuote';
import { quotePopulateConfig } from '@/hooks/LCL/MainDetails/Quote/quotePopulateHelper';
import { buildMainBookingQuoteBean } from '@/hooks/LCL/MainDetails/Booking/bookingSubmitPayloadMapper';
import { API_ENDPOINTS } from '@/core/api/endpoints';
import { useHazRuleValidation } from '@/hooks/LCL/HazRule/useHazRuleValidation';

interface ProgressConfig {
  currentValue: number;
  fieldPriority: number;
}

interface StackState {
  progressConfig: ProgressConfig;
  fieldFilledMap: Record<string, boolean>;
}

export default function PreBookingMain() {
  const [resetKey, setResetKey] = useState(0);
  const dispatch = useAppDispatch();

  const handleClearAll = useCallback(() => {
    dispatch(resetPreBookingForm());
    gwtBridgeInstance.gwtActionFromReact('SET_REFERENCE_NUMBER_ON_TAB', {
      referenceNumber: '',
    });
    setResetKey((prev) => prev + 1);
  }, [dispatch]);

  return <PrebookingInternal key={resetKey} onClearAll={handleClearAll} />;
}
function PrebookingInternal({ onClearAll }: { onClearAll: () => void }) {
  const accordionIds = [
    'mainDetails',
    'documentDetails',
    'customerDetails',
    'routingDetails',
    'cargoDetails',
    'truckingDetails',
    'rateDetails',
    'locationInformation',
    'termsandconditions',
  ];
  const [stackStateMap, setStackStateMap] = useState<
    Record<string, StackState>
  >({});
  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= State -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  const { isVisible } = useFeatureToggle();
  const { validateHazRules } = useHazRuleValidation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openItems, setOpenItems] = useState(accordionIds);
  const [cargoFormData, setCargoFormData] = useState<any>(null);
  const [incompletePromptOpen, setIncompletePromptOpen] = useState(false);
  const [updatedConfirmOpen, setUpdatedConfirmOpen] = useState(false);
  const [quotePopulateConfirmOpen, setQuotePopulateConfirmOpen] =
    useState(false);
  const [quotePopulateSelectedOption, setQuotePopulateSelectedOption] =
    useState('option2');
  const [quoteDiscrepancyMessage, setQuoteDiscrepancyMessage] =
    useState<React.ReactNode>(null);
  const pendingQuoteRefNumber = useRef<string | null>(null);
  const pendingQuoteResultRef = useRef<any>(null);
  const pendingPayloadRef = useRef<any>(null);
  const [showHazSupervisorConfirm, setShowHazSupervisorConfirm] =
    useState(false);
  const [showHazOverrideRemarks, setShowHazOverrideRemarks] = useState(false);
  const [hazRestrictionMessages, setHazRestrictionMessages] = useState<
    string[]
  >([]);
  const hazPendingPayloadRef = useRef<any>(null);

  const isAllOpen = openItems.length === accordionIds.length;
  const savedBookingResponseRef = useRef<any>(null);
  const prevCargoReadDateRef = useRef<string | null>(null);
  const [cargoNotReadyConfirmOpen, setCargoNotReadyConfirmOpen] =
    useState(false);
  const [shipmentConfirmOpen, setShipmentConfirmOpen] = useState(false);
  const [isShipmentConfirmed, setIsShipmentConfirmed] = useState(false);
  const pendingShipmentRefRef = useRef<string | null>(null);
  const { showStatus } = useStatus();
  const [defaultClauses, setDefaultClauses] = useState<Clause[] | undefined>(
    undefined
  );
  const [autoSuggestClauseBean, setAutoSuggestClauseBean] = useState<
    BookingClauseBean[] | undefined
  >(undefined);
  const [isCopyBookingModalOpen, setIsCopyBookingModalOpen] = useState(false);

  const [toolbarKey, setToolbarKey] = useState(0);
  useEffect(() => {
    const urlConstantData =
      gwtBridgeInstance.passPhoenixConfigurationDataToUrlConstant();
  }, []);

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= Hooks -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  const routing = useRouting();
  const mainDetail = usePreBokingMainDetails();
  const documentDetail = useDocumentDetails();
  const customerDetail = useCustomerDetails('prebooking');
  const cargoDetails = useCargoDetails(
    undefined,
    undefined,
    undefined,
    'PREBKG',
    showStatus
  );
  const dataRef = useRef<Record<string, any>>({});
  const bookingMainDetails = useAppSelector(
    (state) => state.preBooking.mainDetails
  );

  const isShipmentConfirmedPersistent =
    isShipmentConfirmed || !!bookingMainDetails?.exportBookingNumber?.trim();
  const bookingDocumentDetails = useAppSelector(
    (state) => state.booking.documentDetails
  );
  const loginClientBean = useAppSelector(
    (state: any) => state.loginClientBean.data
  );
  const loginBean = PreBookingmapLoginBean(loginClientBean);
  const rateDetails = useRateDetails({
    dataRef,
    loginClientBean,
    mainDetails: mainDetail.preBookingFormData,
    routingFormData: routing.routingFormData,
    customerFormData: customerDetail.customerFormData,
    cargoFormData: cargoDetails.cargoState,
    moduleType: 'PREBKG',
    containerType: mainDetail.preBookingFormData.type,
    isFromCopy: true,
  });
  const { data: terms } = useTermsAndConditionsApi({
    moduleCode: 'PREBKG',
    officeId: loginClientBean?.officeId ?? 0,
    tokenKey: 'termsAndConditions',
    localeCode: loginClientBean?.officeLocale ?? '',
  });

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

  const pickupsRef = useRef(routing.pickupState.pickups);
  pickupsRef.current = routing.pickupState.pickups;
  const { data: accessorialData } = useGetSelections(pickupACCESSORIALS);
  const accessorialOptions: AccessoriesOption[] = accessorialData.map(
    (item) => ({ id: item.value, label: item.label })
  );

  useEffect(() => {
    if (loginClientBean) getDefaultClauseBeanData();
  }, [loginClientBean]);

  useEffect(() => {
    if (!loginClientBean) return;
    const config =
      gwtBridgeInstance.passPhoenixConfigurationDataToReactForPreBooking();
    if (config?.referenceNumber) {
      handlePopulate(config.referenceNumber);
    }
  }, [loginClientBean]);

  const tabId = useTabId();
  const progressBar = useStackProgressBar();
  const showTrucking = routing.pickupState.showPickupOrDoorDelivery;

  const isReferenceDisabled = useAppSelector(
    (state) => state.preBooking.isReferenceDisabled
  );

  const {
    data: populateData,
    loading: populateLoading,
    fetchPopulateBookingData,
  } = useGetPopulateDataPrebooking({
    ...prebookingPopulateConfig,
    loginBean,
  });

  const {
    data: quotepopulateData,
    loading: quotepopulateLoading,
    fetchPopulateData,
  } = useGetPopulateDataQuote({
    ...quotePopulateConfig,
    loginBean,
  });

  useEffect(() => {
    if (mainDetail?.preBookingFormData?.type !== '') {
      setClauses(defaultClauses);
    }
  }, [mainDetail?.preBookingFormData?.type, defaultClauses]);

  const dispatch = useAppDispatch();
  // =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= Context -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-==-=-=-=-=-

  const locationContext = useContext(LocationContext);

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= Handlers -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  const handleFieldsChange = (stackId: string, formData: any) => {
    dataRef.current = { ...dataRef.current, [stackId]: formData };
    progressBar.handleFieldsChange(stackId, formData);
  };

  const registerFields = (stackId: string, fields: string[]) => {
    progressBar.registerFields(stackId, fields);
  };
  // const getValueByPath = (obj: any, path: string) =>
  //   path.split('.').reduce((acc: any, key: string) => acc?.[key], obj);
  // const calcProgress = (filledCount: number, fieldPriority: number): number =>
  //   Math.min(100, (filledCount * fieldPriority) | 0);

  // const handleFieldChange = (
  //   stackId: string,
  //   value: boolean,
  //   field: string
  // ) => {
  //   setStackStateMap((prev) => {
  //     const stack = prev[stackId];
  //     if (!stack) return prev;
  //     if (!(field in stack.fieldFilledMap)) return prev;
  //     if (stack.fieldFilledMap[field] === value) return prev;
  //     const newFieldFilledMap = { ...stack.fieldFilledMap, [field]: value };
  //     const filledCount =
  //       Object.values(newFieldFilledMap).filter(Boolean).length;
  //     return {
  //       ...prev,
  //       [stackId]: {
  //         progressConfig: {
  //           fieldPriority: stack.progressConfig.fieldPriority,
  //           currentValue: calcProgress(
  //             filledCount,
  //             stack.progressConfig.fieldPriority
  //           ),
  //         },
  //         fieldFilledMap: newFieldFilledMap,
  //       },
  //     };
  //   });
  // };
  const toggleAllItems = () => {
    setOpenItems(isAllOpen ? [] : accordionIds);
  };
  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };
  const handleCopyBooking = () => {
    setIsCopyBookingModalOpen(true);
  };

  const handleCopyBookingConfirm = async (referenceNumber: string) => {
    if (!referenceNumber.trim()) {
      showStatus('error', ['Please enter a booking reference to copy']);
      return;
    }
    try {
      const response = await fetchPopulateBookingData(referenceNumber.trim(), {
        updateState: false,
      });

      const bookingToCopy = response?.result?.bookingQuoteBean;

      if (response.errorCode === '400') {
        showStatus('error', [
          'No booking data was returned for the selected reference',
        ]);
        return;
      } else {
        if (response.message === 'Success') {
          setToolbarKey((prev) => prev + 1);
          handlePopulateResponse(response.result, 'copyPrebooking');
          setIsCopyBookingModalOpen(false);
          showStatus('success', ['Booking copied successfully']);
        }
      }

      // const copiedBookingData = copyBooking(bookingToCopy, isVisible, {
      //   takenBy:
      //     loginClientBean?.ldapUser ??
      //     loginClientBean?.username ??
      //     bookingMainDetails.takenBy ??
      //     null,
      // });
      // if (!copiedBookingData?.bookingQuoteBean) {
      //   showStatus('error', ['Failed to prepare booking data for copy']);
      //   return;
      // }

      // onCopyBookingReset(copiedBookingData);
    } catch (error) {
      console.error('Error copying booking:', error);
      showStatus('error', ['Failed to copy booking']);
    }
  };

  const openNotes = () => {
    var openNotesPopup: any = {};
    openNotesPopup.referenceNumber = referenceNumber;
    openNotesPopup.type = 'java';
    const schemaName = loginBean?.schema || 'STI_COMMON';
    openNotesPopup.schemaName = schemaName;
    openNotesPopup.schema = schemaName;
    openNotesPopup.module = 'PREBKG';
    openNotesPopup.defaultNoteType = '';
    openNotesPopup.showClauseWidgets = 'true';
    openNotesPopup.showDocumentWidgets = 'true';

    GwtBridge.gwtActionFromReact('OPEN_NOTES_POPUP', openNotesPopup);
  };

  const payloadDocument = () => {
    return {
      mainBookingQuoteBean: {
        bookingQuoteBean: {
          referenceNumber: '',
          type: '',
        },
      },
    };
  };

  const openDocuments = () => {
    const schemaName = 'STI_COMMON';
    var openDocumentsPopup: any = {};
    openDocumentsPopup.code = 'PREBKG';
    openDocumentsPopup.type = 'preBooking';
    openDocumentsPopup.referenceNumber =
      bookingMainDetails.reference?.toString() ?? '';
    openDocumentsPopup.fclLcl = (dataRef.current['mainDetails']?.type).slice(
      0,
      1
    );
    openDocumentsPopup.schemaName = schemaName;
    openDocumentsPopup.module = 'PREBKG';
    openDocumentsPopup.handlingOffice =
      dataRef.current['mainDetails']?.handlingOffice;
    openDocumentsPopup.customerEmail =
      dataRef.current['customerDetails']?.customerEmail;
    openDocumentsPopup.destination =
      dataRef.current['routingDetails']?.destinationCfsName;
    openDocumentsPopup.receiverName = formatName(
      dataRef.current['customerDetails']?.customerName
    ).name1;
    openDocumentsPopup.accessCode = 'preBooking';
    openDocumentsPopup.tabId = tabId;
    openDocumentsPopup.bean = JSON.stringify(payloadDocument());

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
    openEdocsScreen.type = 'PREBKG';
    openEdocsScreen.refNo = bookingMainDetails.reference?.toString() ?? '';
    openEdocsScreen.module = 'PREBKG';
    openEdocsScreen.application = 'O';
    openEdocsScreen.fullType = 'Import Booking Number';
    openEdocsScreen.refreshTab = true;

    GwtBridge.gwtActionFromReact('OPEN_EDOCS_SCREEN', openEdocsScreen);
  };

  const handleMainDetailsChange = (formData: any) => {
    handleFieldsChange('mainDetails', formData);
    mainDetail.handleMainDetailsChange(formData);
  };
  const handleDocumentDetailsChange = (formData: any) => {
    handleFieldsChange('documentDetails', formData);
    documentDetail.handleDocumentDetailsChange(formData);
  };

  const progressOf = (stackId: string) => progressBar.progressOf(stackId);
  const referenceNumber = bookingMainDetails.reference?.toString() ?? null;

  const cancelIRP = useIRPController({
    eventCode: ['PRE_BOOKING_CANCELLED'],
    referenceNumber,
    referenceType: 'PREBKG',
    title: `Booking Cancelled - Incident Reason : ${referenceNumber ?? ''}`,
    prefetch: true,
    onConfirmed: async (formData) => {
      setIsSubmitting(true);
      const payload = {
        requestData: {
          userId: loginClientBean?.userId,
          mainBookingQuoteBean: {
            bookingQuoteBean: {
              referenceNumber: referenceNumber,
              type: 'PREBKG',
            },
          },
          incidentReasonDetailBeans: [
            {
              incidentOwner: formData.causedBy,
              incidentDetail: formData.incidentDetails,
              serviceFailureLocalDetails: formData.incidentDetails,
              referenceNumber,
              referenceType: 'PREBKG',

              categoryReasonDataMappingBean: {
                causedBy: formData.causedBy,
                incidentCategory: formData.selectedCategory,
                reason: formData.selectedReason,
                office: loginClientBean.officeCode,
                emtEventCode: formData.emtEventCode ?? '',
                incidentDetailsKey: formData.incidentDetails,
                isIncidentReasonMandatory: 'Y',
              },
            },
          ],
        },
      };
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = (await ApiService.post(
          OCEAN_ENDPOINTS.IMPORT_BOOKING.CANCEL_PREBOOKING,
          payload
        )) as any;
        // const referenceNumber =
        //   response?.result?.bookingQuoteBean?.bookingNumber?.referenceNumber;
        if (response.data.success === 1 && response.data.errorCode === null) {
          showStatus('success', [
            `Prebooking  ${referenceNumber} Cancelled  successfully!`,
          ]);
          handlePopulate(referenceNumber);
        } else {
          showStatus('error', [
            'Prebooking saved but reference number was not returned.',
          ]);
        }
      } catch (error) {
        showStatus('error', ['An error occurred while cancel the Prebooking.']);
      } finally {
        setIsSubmitting(false);
      }
    },
  });
  const confirmshipment = async () => {
    setShipmentConfirmOpen(false);
    const refNumber = pendingShipmentRefRef.current;
    pendingShipmentRefRef.current = null;
    if (!refNumber) return;
    shipmentConfirmedIrp.openIRP(refNumber);
  };
  const shipmentConfirmedIrp = useIRPController({
    eventCode: ['PRE_BOOKING_SHIPMENT_CONFIRMED'],
    referenceNumber,
    referenceType: 'PREBKG',
    title: `Update EO Booking in Pre-Booking - Incident Reason : ${referenceNumber ?? ''}`,
    prefetch: true,
    onConfirmed: async (_formData) => {
      const exportPayload = buildExportBookingPayload(referenceNumber);
      if (exportPayload) {
        var req = {
          ...exportPayload,
          incidentReasonDetailBean: [
            {
              incidentOwner: _formData?.causedBy,
              incidentDetail: _formData?.incidentDetails,
              serviceFailureLocalDetails: _formData?.incidentDetails,
              referenceNumber,
              referenceType: 'PREBKG',
              categoryReasonDataMappingBean: {
                causedBy: _formData?.causedBy,
                incidentCategory: _formData?.selectedCategory,
                reason: _formData?.selectedReason,
                office: loginClientBean?.officeCode,
                emtEventCode: _formData?.emtEventCode ?? '',
                incidentDetailsKey: _formData?.incidentDetails,
                isIncidentReasonMandatory: 'Y',
              },
            },
          ],
        };
        await executeExportBookingSave(req);
      }
      setIsShipmentConfirmed(true);
    },
  });
  const updateIRP = useIRPController({
    eventCode: ['PRE_BOOKING_UPDATED_SENT_TO_ORIGIN'],
    referenceNumber,
    referenceType: 'PREBKG',
    title: `Import Pre-Booking Updated Sent to Origin - Incident Reason : ${referenceNumber ?? ''}`,
    prefetch: true,
    onConfirmed: async (formData) => {
      setUpdatedConfirmOpen(false);
      const finalPayload = pendingPayloadRef.current;
      pendingPayloadRef.current = null;
      if (!finalPayload) return;
      //handleSubmit(finalPayload);
      const payloadWithSendToOrigin = {
        ...finalPayload,
        requestData: {
          ...finalPayload.requestData,
          mainBookingQuoteBean: {
            ...finalPayload.requestData.mainBookingQuoteBean,
            bookingQuoteBean: {
              ...finalPayload.requestData.mainBookingQuoteBean.bookingQuoteBean,
              prebookingSaveActionFlag: 'SO',
              importBookingStatus: 'PBUPD',
            },
          },
          incidentReasonDetailBeans: [
            {
              incidentOwner: formData.causedBy,
              incidentDetail: formData.incidentDetails,
              serviceFailureLocalDetails: formData.incidentDetails,
              referenceNumber,
              referenceType: 'PREBKG',

              categoryReasonDataMappingBean: {
                causedBy: formData.causedBy,
                incidentCategory: formData.selectedCategory,
                reason: formData.selectedReason,
                office: loginClientBean.officeCode,
                emtEventCode: formData.emtEventCode ?? '',
                incidentDetailsKey: formData.incidentDetails,
                isIncidentReasonMandatory: 'Y',
              },
            },
          ],
        },
      };
      executePreBookingSave(payloadWithSendToOrigin);
    },
  });
  const preBookingFinalizedIrp = useIRPController({
    eventCode: ['PRE_BOOKING_FINALIZED'],
    referenceNumber,
    referenceType: 'PREBKG',
    title: `Import Pre-Booking Finalized - Incident Reason : ${referenceNumber ?? ''}`,
    prefetch: true,
    onConfirmed: async (_formData) => {
      handleSubmit(_formData);
    },
  });
  const handlingOfficeIrp = useIRPController({
    eventCode: ['PRE_BOOKING_HANDLING_OFFICE_UPDATED'],
    referenceNumber,
    referenceType: 'PREBKG',
    title: `Import Pre-Booking Handling Office Updated - Incident Reason : ${referenceNumber ?? ''}`,
    prefetch: true,
    onConfirmed: async (_formData) => {
      handleSubmit(_formData);
    },
  });
  const eoBookingLinklIrp = useIRPController({
    eventCode: ['EXPORT_BOOKING_LINKED'],
    referenceNumber,
    referenceType: 'PREBKG',
    title: `Update EO Booking in Pre-Booking - Incident Reason : ${referenceNumber ?? ''}`,
    prefetch: true,
    onConfirmed: async (_formData) => {
      handleSubmit(_formData);
    },
  });
  const eoBookingUnLinklIrp = useIRPController({
    eventCode: ['EXPORT_BOOKING_UNLINKED'],
    referenceNumber,
    referenceType: 'PREBKG',
    title: `Update EO Booking in Pre-Booking - Incident Reason : ${referenceNumber ?? ''}`,
    prefetch: true,
    onConfirmed: async (_formData) => {
      handleSubmit(_formData);
    },
  });

  // const cancelIRP = useIRPController({
  //   eventCode: ['BOOKING_CANCELLED'],
  //   referenceNumber,
  //   referenceType: 'BKG',
  //   title: `Booking Cancelled - Incident Reason : ${referenceNumber ?? ''}`,
  //   prefetch: true,
  //   onConfirmed: async (_formData) => {
  //     // TODO: call booking cancel API with _formData
  //   },
  // });

  // const eDocsIRP = useIRPController({
  //   eventCode: ['BKG_CNF_BKG_CONFIRM'],
  //   referenceNumber,
  //   referenceType: 'BKG',
  //   title: `Send Document - Incident Reason : ${referenceNumber ?? ''}`,
  //   prefetch: true,
  //   onConfirmed: () => openDocuments(),
  // });

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

  const handlePopulate = (referenceNumber: string) => {
    fetchPopulateBookingData(referenceNumber);
  };

  const handelonPopulateQuoteData = (referenceNumber: string) => {
    pendingQuoteRefNumber.current = referenceNumber;
    fetchPopulateData(referenceNumber);
  };

  const handleResetCustomer = () => {
    handleFieldsChange('customerDetails', initialCustomerDetailFormState);
    customerDetail.bulkUpdateCustomer(initialCustomerDetailFormState);
  };

  useEffect(() => {
    const warning = rateDetails.defaultState.chargeWarning;
    if (warning) {
      showStatus('warning', [warning]);
    }
  }, [rateDetails.defaultState.chargeWarning]);

  useEffect(() => {
    if (populateData?.result) {
      handlePopulateResponse(populateData.result);
    }
  }, [populateData]);

  useEffect(() => {
    if (!quotepopulateData?.result) return;

    const result = quotepopulateData.result;
    const quoteBean = result?.bookingQuoteBean;
    if (!quoteBean) return;

    const discrepancies: string[] = [];

    // a. Place of Receipt / Place of Delivery
    const quoteRouting = quoteBean?.bookingQuoteRoutingBean;
    const existingRouting = routing.routingFormData;
    const quotePOR = quoteRouting?.originCode ?? '';
    const quotePOD = quoteRouting?.destinationCode ?? '';
    const existingPOR = existingRouting?.placeOfReceiptCode ?? '';
    const existingPOD = existingRouting?.placeOfDeliveryCode ?? '';
    if (existingPOR && quotePOR && quotePOR !== existingPOR) {
      discrepancies.push(
        `Place of Receipt: Quote [${quotePOR}] vs Pre-Booking [${existingPOR}]`
      );
    }
    if (existingPOD && quotePOD && quotePOD !== existingPOD) {
      discrepancies.push(
        `Place of Delivery: Quote [${quotePOD}] vs Pre-Booking [${existingPOD}]`
      );
    }

    // b. Cargo totals
    const quoteCargoList = quoteBean?.bookingQuoteMultiCargoBeanList ?? [];
    const quotePCS = quoteCargoList.reduce(
      (s: number, c: any) => s + Number(c.numberOfPieces ?? 0),
      0
    );
    const quoteKG = quoteCargoList.reduce(
      (s: number, c: any) => s + Number(c.weight ?? 0),
      0
    );
    const quoteLBS = quoteCargoList.reduce(
      (s: number, c: any) => s + Number(c.weightLbs ?? 0),
      0
    );
    const quoteCBM = quoteCargoList.reduce(
      (s: number, c: any) => s + Number(c.cube ?? 0),
      0
    );
    const quoteCBF = quoteCargoList.reduce(
      (s: number, c: any) => s + Number(c.cubeCbf ?? 0),
      0
    );
    const existingCargo = cargoDetails.cargoState.cargoRows;
    const existingPCS = existingCargo.reduce(
      (s: number, c: any) => s + Number(c.pieces ?? 0),
      0
    );
    const existingKG = existingCargo.reduce(
      (s: number, c: any) => s + Number(c.kg ?? 0),
      0
    );
    const existingLBS = existingCargo.reduce(
      (s: number, c: any) => s + Number(c.lbs ?? 0),
      0
    );
    const existingCBM = existingCargo.reduce(
      (s: number, c: any) => s + Number(c.cbm ?? 0),
      0
    );
    const existingCBF = existingCargo.reduce(
      (s: number, c: any) => s + Number(c.cbf ?? 0),
      0
    );
    const hasCargoMismatch =
      quotePCS !== existingPCS ||
      quoteKG !== existingKG ||
      quoteLBS !== existingLBS ||
      quoteCBM !== existingCBM ||
      quoteCBF !== existingCBF;
    if (hasCargoMismatch) {
      discrepancies.push(
        (
          <>
            Import Quote's cargo details are different from Pre-Booking's cargo
            details.
            <br />
            Quote:&nbsp;&nbsp;&nbsp;&nbsp;{quotePCS} PCS / {quoteKG} KG /{' '}
            {quoteLBS} LBS / {quoteCBM} CBM / {quoteCBF} CBF
            <br />
            Booking: {existingPCS} PCS / {existingKG} KG / {existingLBS} LBS /{' '}
            {existingCBM} CBM / {existingCBF} CBF
          </>
        ) as any
      );
    }

    // c. Hazardous
    const quoteIsHaz = quoteCargoList.some((c: any) => c.hazardousCode === 'Y');
    const existingIsHaz = existingCargo.some(
      (c: any) => c.hazardous === 'Y - Yes'
    );
    if (quoteIsHaz !== existingIsHaz) {
      discrepancies.push(
        `Hazardous: Quote is ${quoteIsHaz ? 'Hazardous' : 'Non-Hazardous'} but Pre-Booking is ${existingIsHaz ? 'Hazardous' : 'Non-Hazardous'}`
      );
    }

    // d. Terms (point v) — detect if resolved terms differ from existing prebooking terms
    const quoteTerms = (quoteBean?.terms ?? '').toUpperCase();
    const existingTerms = (existingRouting?.terms ?? '').toUpperCase();
    if (quoteTerms && existingTerms && quoteTerms !== existingTerms) {
      const resolvedTerms = resolveTermsAfterQuotePopulate(
        quoteTerms,
        existingTerms
      );
      if (resolvedTerms !== existingTerms) {
        discrepancies.push(
          `Terms: Quote [${quoteTerms}] vs Pre-Booking [${existingTerms}] → will be updated to [${resolvedTerms}]`
        );
      }
    }

    if (discrepancies.length === 0) {
      // No discrepancies — populate directly without modal
      handlePopulateResponse(result, 'quote', false);
      return;
    }

    // Discrepancies found — store result and show modal
    pendingQuoteResultRef.current = result;
    setQuotePopulateSelectedOption('option2');
    setQuoteDiscrepancyMessage(
      <>
        Differences between Import Quote and Pre-Booking are noted below:
        <br />
        <br />
        {discrepancies.map((d, i) => (
          <span key={i}>
            {i + 1}. {d}
            <br />
          </span>
        ))}
      </>
    );
    setQuotePopulateConfirmOpen(true);
  }, [quotepopulateData]);

  const handlePopulateResponse = (
    result: any,
    source: 'booking' | 'quote' | 'copyPrebooking' = 'booking',
    skipCargo: boolean = false
  ) => {
    if (!result) return;

    const mainBean = result?.bookingQuoteBean;

    if (!mainBean) return;

    if (
      result?.errorCode === null &&
      result?.message === 'SUCCESS' &&
      result?.result === null &&
      result?.result === undefined
    ) {
      dispatch(setReferenceNoInvalid(false));
    }

    if (source === 'quote') {
      dispatch(setImportQuoteNoInvalid(false));
    }

    if (result?.result === null && result?.errorCode === '400') {
      const errorMessgae = result?.message.split(':').slice(2).join(':').trim();

      showStatus('error', [
        'No booking found for reference number:',
        errorMessgae,
      ]);
    }

    const mappedMain = {
      ...mapMainDetailsFromPopulate(mainBean),
      isReferencePopulated: true,
    };

    // Seed savedBookingResponseRef so Point 7 guard works when populating an existing booking
    savedBookingResponseRef.current = mainBean;

    handleFieldsChange('mainDetails', mappedMain);
    mainDetail.handleMainDetailsChange(mappedMain);
    if (source === 'copyPrebooking') {
      mappedMain.importBookingStatus = '';
      mappedMain.reference = '';
    }
    if (mappedMain.reference !== '' && mappedMain.reference !== '0') {
      if (source === 'quote') {
        return;
      } else {
        dispatch(setReferenceDisabled(true));
      }
    }
    dispatch(updatePreBookingMainDetails(mappedMain));

    const mappedDocuments = mapDocumentDetailsFromPopulate(
      result?.uploadDocumentsBeanList
    );
    documentDetail.handleDocumentDetailsChange(mappedDocuments);

    const mappedRouting = mapRoutingFromPopulate(mainBean);

    // Seed prevCargoReadDateRef so first edit after populate is detected correctly
    prevCargoReadDateRef.current = mappedRouting.cargoReadDate
      ? String(mappedRouting.cargoReadDate)
      : null;

    // Point v: when populating from quote, resolve terms as max(quote, prebooking)
    if (source === 'quote') {
      const prebookTerms = (routing.routingFormData?.terms ?? '').toUpperCase();
      const quoteTerms = (mappedRouting.terms ?? '').toUpperCase();
      mappedRouting.terms = resolveTermsAfterQuotePopulate(
        quoteTerms,
        prebookTerms
      );
    }

    handleFieldsChange('routingDetails', mappedRouting);
    routing.bulkUpdateRouting(mappedRouting);

    if (mappedRouting.pickupNeeded) {
      routing.pickupHandlers.setPickupNeeded(mappedRouting.pickupNeeded);

      if (
        mappedRouting.pickupNeeded === 'Y' ||
        mappedRouting.pickupNeeded === 'T'
      ) {
        routing.pickupHandlers.setShowPickupStack?.(true);
      }
    }

    if (mappedRouting.deliveryType === 'D') {
      routing.pickupHandlers.setShowDoorDeliverySection?.(true);
    }

    //     if (mappedRouting.pickupNeeded) {
    //   routing.pickupHandlers.setPickupNeeded(mappedRouting.pickupNeeded);
    //   if (
    //     mappedRouting.pickupNeeded === 'Y' ||
    //     mappedRouting.pickupNeeded === 'T'
    //   ) {
    //     routing.pickupHandlers.setShowPickupStack?.(true);
    //   }
    // }

    // if (mappedRouting.deliveryType === 'D') {
    //   routing.pickupHandlers.setShowDoorDeliverySection?.(true);
    // }

    // if (mappedRouting.deliveryType) {
    //   routing.pickupHandlers.handleDeliveryTypeChange(
    //     mappedRouting.deliveryType
    //   );
    // }

    // if (mappedRouting.deliveryType === 'D') {
    //   routing.pickupHandlers.setShowDoorDeliverySection?.(true);
    // }
    const pickupNeededValue = mappedRouting.pickupNeeded;
    if (pickupNeededValue === 'Y' || pickupNeededValue === 'T') {
      const multiplePickups = result?.multiplePickupDetailBeanList ?? [];
      const singlePickup = result?.pickupDetailBean;
      const pickupListForMapping =
        multiplePickups.length > 0
          ? multiplePickups
          : singlePickup
            ? [singlePickup]
            : [];
      const truckingData = mapTruckingFromPopulate({
        multiplePickupDetailBeanList: pickupListForMapping,
        doorDeliveryDetailsBean: null,
      });
      routing.bulkUpdateTrucking({
        ...truckingData,
        showPickupStack: true,
      });
    }
    // routing.pickupHandlers.setShowPickupStack?.(true);

    // routing.pickupHandlers.setDoorDeliveryDialogOpen?.(true);

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
      routing.bulkUpdateTrucking({
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
      routing.bulkUpdateTrucking(truckingData);
    }

    const mappedCustomer = mapCustomerFromPopulate(mainBean);

    if (mappedCustomer) {
      handleFieldsChange('customerDetails', mappedCustomer);
      customerDetail.bulkUpdateCustomer(mappedCustomer);
    }

    if (!skipCargo) {
      const mappedCargo = mapCargoFromPopulate(result);
      handleFieldsChange('cargoDetails', mappedCargo);
      cargoDetails.bulkPopulateCargo(mappedCargo);
    }
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
    rateDetails.handlers.handleRateDetailsChargesChange(
      mappedRateDetails.charges.rateDetails
    );

    const mappedTrucking = mapTruckingFromPopulate(mainBean);
    if (mappedRouting.deliveryType === 'D') {
      routing.bulkUpdateTrucking({
        ...mappedTrucking,
        showDoorDeliverySection: true,
      });
    }

    if (source === 'quote') {
      const prebookHasPickup = routing.pickupState.showPickupStack;
      const quoteHasPickup = mappedTrucking.showPickupStack;

      if (quoteHasPickup) {
        // vi: quote has pickup — replace pre-booking pickup details (existing or none) with quote's
        routing.bulkUpdateTrucking(mappedTrucking);
        routing.pickupHandlers.setPickupNeeded(
          mappedRouting.pickupNeeded || 'Y'
        );
      } else {
        // vii: quote has no pickup — clear pre-booking pickup
        routing.bulkUpdateTrucking({
          ...mappedTrucking,
          showPickupStack: false,
        });
        routing.pickupHandlers.setPickupNeeded('N');
      }
    } else {
      routing.bulkUpdateTrucking({
        ...mappedTrucking,
        showPickupStack:
          mappedRouting.pickupNeeded === 'Y' ||
          mappedRouting.pickupNeeded === 'T',
        showDoorDeliverySection: mappedRouting.deliveryType === 'D',
      });
    }

    gwtBridgeInstance.gwtActionFromReact('SET_REFERENCE_NUMBER_ON_TAB', {
      referenceNumber: String(mappedMain.reference),
    });
  };

  const saveExportBooking = (referenceNumber: string) => {
    pendingShipmentRefRef.current = referenceNumber;
    setShipmentConfirmOpen(true);
  };

  const suggestClauseIconClick = async () => {
    const cargo = cargoDetails?.cargoState?.cargoRows;
    // const bookingClauseBean = {
    const clauseBean: BookingClauseBean = {
      shipmentType: mainDetail?.preBookingFormData?.type,
      handlingOffice: mainDetail?.preBookingFormData?.handlingOffice ?? '',
      pickupNeeded: routing?.routingFormData?.pickupNeeded ?? 'N',

      loadPort: routing?.routingFormData?.portOfLoadingCode,
      portOfDischarge: routing?.routingFormData?.portOfDischargeCode,
      originCode: routing?.routingFormData?.portOfRecipientCode,
      originName: routing?.routingFormData?.portOfRecipientName,
      loadPortName: routing?.routingFormData?.portOfLoadingName,

      oldOriginCode:
        populateData?.mainBookingQuoteBean?.bookingQuoteBean
          ?.bookingQuoteRoutingBean?.oldOriginCode ?? '',
      oldLoadPortName:
        populateData?.mainBookingQuoteBean?.bookingQuoteBean
          ?.bookingQuoteRoutingBean?.oldLoadName ?? '',
      schemaName: loginClientBean?.schema,
      officeId: loginClientBean?.officeId,

      weight: cargo[0]?.kg ?? '0',
      weightCbf: cargo[0]?.cbf ?? '0.0',
      weightLbs: cargo[0]?.lbs ?? '0.0',

      length: cargo[0]?.dimRows
        .reduce((sum, dim) => sum + parseFloat(dim.length || 0), '0.0')
        .toString(),

      hazardous: cargo[0]?.hazardous?.split('-')[0].trim() ?? 'N',
      oldTransshipmentVia:
        populateData?.mainBookingQuoteBean?.bookingQuoteBean?.shipmentType ??
        '',

      loadPortCountry: '',
      portOfDischargeCountry: '',
      transshipmentVia: '',
      // }
    };

    try {
      await new Promise((resolve) => setTimeout(resolve, 100));
      const response = (await ApiService.post(
        API_ENDPOINTS.BOOKING.GET_SUGGESTED_CLAUSES,
        clauseBean
      )) as any;

      const result = response?.data?.result;

      const clauseList: Clause[] = mainDetail?.preBookingFormData?.clauses;
      const updatedClauseList = [...clauseList];

      clauseBean.loadPortCountry = result?.loadPortCountry ?? '';
      clauseBean.portOfDischargeCountry = result?.dischargePortCountry ?? '';
      clauseBean.transshipmentVia = result?.transShipmentVia ?? '';

      if (clauseBean.length == 0) {
        clauseBean.length = null;
      }

      if (
        result &&
        result.bookingClauseBean &&
        result.bookingClauseBean.length > 0
      ) {
        result.bookingClauseBean.forEach((clause: Clause) => {
          const bkgClause: Clause = {
            clauseCode: clause.clauseCode,
            clauseName: clause.clauseName,
            clauseNameLocale: clause.clauseNameLocale,
            clauseDesc: clause.clauseDesc,
            clauseDescLocale: clause.clauseDescLocale,
            sequence: clause.sequence,
          };
          if (
            clauseList &&
            !clauseList.some((c) => c.clauseCode === bkgClause.clauseCode)
          ) {
            updatedClauseList.push(bkgClause);
          }
        });

        if (updatedClauseList && updatedClauseList.length > 5) {
          showStatus('warning', [
            'Only 5 item(s) allowed, Please Remove few of the Manually entered Clause(s) and Re-try.',
          ]);
        } else {
          setClauses(updatedClauseList);
        }
      }

      if (updatedClauseList && updatedClauseList.length <= 5) {
        setAutoSuggestClauseBean(clauseBean);
      }
    } catch (error) {
      console.error(
        'Error occurred while fetching clauses on icon click',
        error
      );
    }
  };

  const accordionItems: AccordionItem[] = [
    {
      id: accordionIds[0],
      label: 'Main Details',
      progress: true,
      icon: false,
      content: (
        <MainDetails
          // mainDetail={mainDetail}
          showStatus={showStatus}
          onRegisterFields={(fields) => registerFields('mainDetails', fields)}
          onFieldsChange={handleMainDetailsChange}
          onPopulateData={handlePopulate}
          onResetCustomer={handleResetCustomer}
          onPopulateQuoteData={handelonPopulateQuoteData}
          onsaveExportBooking={saveExportBooking}
          isShipmentConfirmed={isShipmentConfirmedPersistent}
          suggestClauseIconClick={suggestClauseIconClick}
        />
      ),
      progressValue: progressOf('mainDetails'),
    },
    {
      id: accordionIds[1],
      label: 'Document Details',
      progress: true,
      icon: true,
      progressValue: progressOf('documentDetails'),
      content: (
        <DocumentDetails
          moduleType="prebooking"
          onRegisterFields={(fields) =>
            registerFields('documentDetails', fields)
          }
          onFieldsChange={handleDocumentDetailsChange}
          // value={documentDetailsValue}
        />
      ),
      iconContent: <DocumentStatusIcons />,
    },
    {
      id: accordionIds[2],
      label: 'Customer Details',
      progress: true,
      icon: false,
      progressValue: progressOf('customerDetails'),
      content: (
        <PreBookingCustomerDetails
          // rateDetails={rateDetails}
          showStatus={showStatus}
          customerDetail={customerDetail}
          moduleType="prebooking"
          onRegisterFields={(fields: string[]) =>
            registerFields('customerDetails', fields)
          }
          onFieldsChange={(formData: unknown) =>
            handleFieldsChange('customerDetails', formData)
          }
        />
      ),
    },
    {
      id: accordionIds[3],
      label: 'Routing Details',
      progress: true,
      icon: false,
      progressValue: progressOf('routingDetails'),
      content: (
        <PreBookingRoutingDetails
          isAgentBooking={mainDetail.preBookingFormData?.agentBooking}
          moduleType="prebooking"
          routing={routing}
          rateDetails={rateDetails}
          onRegisterFields={(fields) =>
            registerFields('routingDetails', fields)
          }
          onFieldsChange={(formData) =>
            handleFieldsChange('routingDetails', formData)
          }
          showStatus={showStatus}
        />
      ),
    },

    {
      id: accordionIds[4],
      label: 'Cargo Details',
      progress: true,
      icon: false,
      progressValue: progressOf('cargoDetails'),
      content: (
        <CargoDetails
          cargoDetails={cargoDetails}
          rateDetails={rateDetails}
          moduleType="PREBKG"
          onRegisterFields={(fields) => registerFields('cargoDetails', fields)}
          onFieldsChange={(formData) =>
            handleFieldsChange('cargoDetails', formData)
          }
        />
      ),
    },
    ...(showTrucking
      ? [
          {
            id: accordionIds[5],
            label: 'Trucking Details',
            progress: true,
            icon: false,
            progressValue: progressOf('truckingDetails'),
            content: (
              <TruckingDetails
                moduleType="prebooking"
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
                moduleCode="PREBKG"
                shipperReference={
                  bookingMainDetails.referenceNumber != null
                    ? String(bookingMainDetails.referenceNumber)
                    : undefined
                }
                externalCargoRows={
                  routing.pickupState.pickups.length === 1
                    ? cargoDetails.truckingCargoRows
                    : undefined
                }
                onRegisterFields={(fields) =>
                  registerFields('truckingDetails', fields)
                }
                onFieldsChange={(formData) =>
                  handleFieldsChange('truckingDetails', formData)
                }
                accessorialOptions={accessorialOptions}
              />
            ),
          },
        ]
      : []),
    {
      id: accordionIds[6],
      label: 'Rate Details',
      progress: true,
      icon: true,
      progressValue: 100,
      content: (
        <PreBookingRateDetails
          moduleType="PREBKG"
          rateDetails={rateDetails}
          cargoMetrics={cargoMetrics}
          onRegisterFields={(fields) => registerFields('rateDetails', fields)}
          onFieldsChange={(formData) =>
            handleFieldsChange('rateDetails', formData)
          }
        />
      ),
    },
    {
      id: accordionIds[7],
      label: 'Location Info',
      content: <LocationInformation data={locationContext.locationData} />,
      progress: false,
      icon: false,
    },
    {
      id: accordionIds[8],
      label: 'Terms And Conditions',
      content: <PreBookingTermsAndConditions termsAndConditions={terms} />,
      progress: false,
      icon: false,
    },
  ];

  const [error, setError] = useState({
    showErrorModal: false,
    message: [] as string[],
  });

  const validateForm = () => {
    const data = dataRef.current;
    const cargoRows = cargoDetails?.cargoState?.cargoRows || [];

    const dimensionFields = [
      'length',
      'width',
      'height',
      'pieces',
      'cbm',
      'cbf',
      'kg',
      'lbs',
    ];

    const errors = new Set<string>();

    for (const cargo of cargoRows) {
      const dimRows = cargo?.dimRows || [];

      for (const dim of dimRows) {
        const hasAnyValue = dimensionFields.some((field) => {
          const value = dim[field];

          return value !== '' && value !== null && value !== undefined;
        });

        if (!hasAnyValue) continue;

        for (const field of dimensionFields) {
          const value = dim[field];

          if (value === '' || value === null || value === undefined) {
            const label =
              field === 'kg'
                ? 'KG'
                : field === 'lbs'
                  ? 'LBS'
                  : field.charAt(0).toUpperCase() + field.slice(1);

            errors.add(`${label} is mandatory.`);
          }
        }
      }
    }

    if (errors.size) {
      return {
        type: 'cargoDimension',
        errors: [...errors],
      };
    }

    if (!data.mainDetails?.preBookingChannel) {
      return 'Please select a Pre-Booking Channel';
    }

    if (!data.mainDetails?.handlingOffice) {
      return 'Please select handlingOffice';
    }

    if (!data.mainDetails?.createdBy) {
      return 'Created By is mandatory';
    }

    const customer = data.customerDetails;

    if (!customer?.customerCode) {
      return 'Customer Code is mandatory';
    }

    if (!customer?.controllingEntity || customer.controllingEntity === '-1') {
      return 'Please select Controlling Entity';
    }

    if (
      !customer?.rateControllingEntity ||
      customer.rateControllingEntity === '-1'
    ) {
      return 'Please select Rate Controlling Entity';
    }

    if (!customer?.shipperName) {
      return 'Shipper Name is mandatory';
    }

    if (!customer?.shipperEmail) {
      return 'Shipper Email is mandatory';
    }

    if (!customer?.customerName) {
      return 'Customer Name is mandatory';
    }

    if (!customer?.customerEmail) {
      return 'Customer Email is mandatory';
    }
    const routing = data.routingDetails;

    if (!routing?.terms) {
      return 'Terms is mandatory.';
    }

    if (!routing?.placeOfReceiptCode) {
      return 'Place of Receipt Code is mandatory';
    }

    if (!routing?.placeOfReceiptName && !routing?.placeOfReceiptPickupToName) {
      return 'Place of Receipt Name is mandatory';
    }

    if (!routing?.destinationCfsCode) {
      return 'Destination CFS code is mandatory';
    }

    if (!routing?.destinationCfsName) {
      return 'Destination CFS name is mandatory';
    }

    if (!routing?.destinationCfsEta) {
      return 'ETA is mandatory';
    }

    return null;
  };

  const buildExportBookingPayload = (importBookingNumber) => {
    const mainDetails = mapMainDetailsToPreBookingQuoteBean(bookingMainDetails);
    // mainDetails.status = 'P';
    // mainDetail.userReference = bookingMainDetails.userReference;

    const isNewEntry =
      !mainDetails?.referenceNumber || num(mainDetails?.referenceNumber) === 0;
    const documentDetails = mapDocumentDetailsToUploadDocumentBeans(
      bookingDocumentDetails,
      {
        referenceNumber: bookingMainDetails?.referenceNumber?.toString() ?? '',
        referenceObject: 'PREBKG',
        transactionalFlag: isNewEntry ? 'N' : 'U',
      }
    );

    const result = {
      mainBookingQuoteBean: buildMainBookingQuoteBean(
        mainDetails,
        documentDetails,
        dataRef.current['customerDetails'] || {},
        {
          routingFormData:
            dataRef.current['routingDetails'] || routing.routingFormData,
          pickupForms: routing.pickupState.pickupForms,
          pickupTruckerForms: routing.pickupState.pickupTruckerForms,
          doorDeliveryForm: routing.pickupState.doorDeliveryForm,
        },

        dataRef.current['cargoDetails'] || {
          cargoRows: cargoDetails.cargoState.cargoRows,
          lotRows: cargoDetails.lotRows,
          flags: cargoDetails.flagState.flags,
          internalComment: cargoDetails.instructionState.internalComment,
          loadingInstruction: cargoDetails.instructionState.loadingInstruction,
          warehouseInstruction:
            cargoDetails.instructionState.warehouseInstruction,
        },
        dataRef.current['rateDetails'] || rateDetails.formData,
        dataRef.current['customDetails'] || {},
        loginClientBean,
        importBookingNumber
      ),
      userid: loginBean.userId,
      incidentReasonBeanList: [],
    };

    return result;
  };

  // const buildpreBookingpayload = async () => {
  //   try {
  //     const documentDetails = await mapDocumentDetailsToUploadDocumentBeans(
  //       bookingDocumentDetails,
  //       {
  //         referenceNumber: bookingMainDetails?.reference?.toString() ?? '',
  //         referenceObject: 'PREBKG',
  //       }
  //     );

  //     return buildPreBookingSubmitPayload(
  //       loginBean,
  //       dataRef.current['mainDetails'] || {},
  //       documentDetails,
  //       dataRef.current['customerDetails'] || {},
  //       {
  //         routingFormData:
  //           dataRef.current['routingDetails'] || routing.routingFormData,
  //         pickupForms: routing.pickupState.pickupForms,
  //         doorDeliveryForm: routing.pickupState.doorDeliveryForm,
  //       },
  //       dataRef.current['cargoDetails'] || {
  //         cargoRows: cargoDetails.cargoState.cargoRows,
  //         lotRows: cargoDetails.lotRows,
  //         flags: cargoDetails.flagState.flags,
  //         internalComment: cargoDetails.instructionState.internalComment,
  //         loadingInstruction: cargoDetails.instructionState.loadingInstruction,
  //         warehouseInstruction:
  //           cargoDetails.instructionState.warehouseInstruction,
  //       },
  //       dataRef.current['rateDetails'] || {}
  //     );
  //   } catch (error) {
  //     console.error('Failed to submit quote:', error);
  //     showStatus('error', ['An error occurred while saving the Pre Booking.']);
  //     return null;
  //   }
  // };

  const getBookingStatus = () => {
    const data = dataRef.current;
    const customer = data.customerDetails;
    const routing = data.routingDetails;

    const mandatoryFields = [
      data.mainDetails?.preBookingChannel,
      data.mainDetails?.handlingOffice,
      data.mainDetails?.createdBy,

      customer?.customerCode,
      customer?.controllingEntity,
      customer?.rateControllingEntity,
      customer?.shipperName,
      customer?.shipperEmail,
      customer?.customerName,
      customer?.customerEmail,

      routing?.terms,
      routing?.placeOfReceiptCode,

      routing?.placeOfReceiptName || routing?.placeOfReceiptPickupToName,

      routing?.destinationCfsCode,
      routing?.destinationCfsName,
      routing?.destinationCfsEta,
    ];

    const hasMissingField = mandatoryFields.some(
      (field) =>
        field === undefined || field === null || field === '' || field === '-1'
    );

    return hasMissingField ? 'I' : '';
  };
  const buildpreBookingpayload = async () => {
    let status = bookingMainDetails.status;
    if (!bookingMainDetails.pendingFinal) {
      const validationError: any = validateForm();

      if (validationError !== null) {
        if (
          typeof validationError === 'object' &&
          validationError?.type === 'cargoDimension'
        ) {
          setError({
            showErrorModal: true,
            message: validationError.errors,
          });
          return null;
        }
        showStatus('warning', [
          typeof validationError === 'string'
            ? validationError
            : String(validationError),
        ]);

        return null;
      }
    } else {
      status = getBookingStatus();
    }

    const latestCargoDetails = {
      cargoRows: cargoDetails.cargoState.cargoRows,
      lotRows: cargoDetails.lotRows,
      flags: cargoDetails.flagState.flags,
      internalComment: cargoDetails.instructionState.internalComment,
      loadingInstruction: cargoDetails.instructionState.loadingInstruction,
      warehouseInstruction: cargoDetails.instructionState.warehouseInstruction,
    };

    try {
      const documentDetails = await mapDocumentDetailsToUploadDocumentBeans(
        bookingDocumentDetails,
        {
          referenceNumber: bookingMainDetails?.reference?.toString() ?? '',
          referenceObject: 'PREBKG',
        }
      );

      return buildPreBookingSubmitPayload(
        loginBean,
        dataRef.current['mainDetails'] || {},
        documentDetails,
        dataRef.current['customerDetails'] || {},
        {
          routingFormData:
            dataRef.current['routingDetails'] || routing.routingFormData,
          pickupForms: routing.pickupState.truckingPickupForms,
          pickupTruckerForms: routing.pickupState.pickupTruckerForms,
          doorDeliveryForm: routing.pickupState.doorDeliveryForm,
        },

        latestCargoDetails,

        dataRef.current['rateDetails'] || rateDetails.formData,
        status
      );
    } catch (error) {
      console.error('Failed to submit quote:', error);
      showStatus('error', ['An error occurred while saving the Pre Booking.']);
      return null;
    }
  };
  const runPreBookingSaveFlow = async (finalPayload: any) => {
    if (!bookingMainDetails.isReferencePopulated) {
      await executePreBookingSave(finalPayload);
      return;
    }

    const importBookingStatus =
      finalPayload?.requestData?.mainBookingQuoteBean?.bookingQuoteBean
        ?.importBookingStatus;

    const savedStatus = savedBookingResponseRef.current?.importBookingStatus;
    const savedStatusHasPassedPBReqRecv =
      savedStatus && savedStatus !== 'PBREQRECV';
    if (savedStatusHasPassedPBReqRecv && importBookingStatus === 'PBREQRECV') {
      showStatus('warning', [
        'Pre-Booking Request Received status cannot be applied once Pre-Booking Created has been reached.',
      ]);
      return;
    }

    const currentCargoReadDate =
      dataRef.current['routingDetails']?.cargoReadDate ?? null;
    const cargoDateChanged =
      currentCargoReadDate !== null &&
      prevCargoReadDateRef.current !== null &&
      String(currentCargoReadDate) !== String(prevCargoReadDateRef.current);
    const statusAllowsCargonrPrompt =
      importBookingStatus !== 'PBREQRECV' && importBookingStatus !== 'CARGONR';

    if (cargoDateChanged && statusAllowsCargonrPrompt) {
      pendingPayloadRef.current = finalPayload;
      setCargoNotReadyConfirmOpen(true);
      return;
    }

    prevCargoReadDateRef.current = currentCargoReadDate
      ? String(currentCargoReadDate)
      : null;

    const userOffice = loginClientBean?.office ?? '';
    const bookingOffice = bookingMainDetails?.bookingOffice ?? '';
    const isDestinationUser = bookingOffice.trim() === userOffice.trim();
    const statusTriggersPBUPDModal =
      importBookingStatus === 'PBINCOMP' || importBookingStatus === 'SHIPUNK';
    if (isDestinationUser && statusTriggersPBUPDModal) {
      pendingPayloadRef.current = finalPayload;
      setUpdatedConfirmOpen(true);
      return;
    }

    if (importBookingStatus === 'PBINCOMP') {
      pendingPayloadRef.current = finalPayload;
      setIncompletePromptOpen(true);
      return;
    }

    await executePreBookingSave(finalPayload);
  };

  // handleSubmit: called by handlePreBookingSubmit (no IRP) OR by IRP onConfirmed handlers.
  // _formData is populated only when an IRP was confirmed by the user.
  const handleSubmit = async (_formData?: any) => {
    const finalPayload = await buildpreBookingpayload();


    if (!finalPayload) return;

    // If an IRP was triggered, attach incidentReasonDetailBean to the payload
    const basePayload = _formData
      ? {
          ...finalPayload,
          requestData: {
            ...finalPayload.requestData,
            incidentReasonDetailBean: [
              {
                incidentOwner: _formData?.causedBy,
                incidentDetail: _formData?.incidentDetails,
                serviceFailureLocalDetails: _formData?.incidentDetails,
                referenceNumber,
                referenceType: 'PREBKG',
                categoryReasonDataMappingBean: {
                  causedBy: _formData?.causedBy,
                  incidentCategory: _formData?.selectedCategory,
                  reason: _formData?.selectedReason,
                  office: loginClientBean?.officeCode,
                  emtEventCode: _formData?.emtEventCode ?? '',
                  incidentDetailsKey: _formData?.incidentDetails,
                  isIncidentReasonMandatory: 'Y',
                },
              },
            ],
          },
        }
      : finalPayload;

    type PreBookingPayload = {
      requestData: {
        mainBookingQuoteBean: {
          bookingQuoteBean: Record<string, unknown>;
        } & Record<string, unknown>;
      } & Record<string, unknown>;
    } & Record<string, unknown>;

    const patchBkgBean = (
      payload: PreBookingPayload,
      fields: Record<string, string>
    ): PreBookingPayload => ({
      ...payload,
      requestData: {
        ...payload.requestData,
        mainBookingQuoteBean: {
          ...payload.requestData.mainBookingQuoteBean,
          bookingQuoteBean: {
            ...payload.requestData.mainBookingQuoteBean.bookingQuoteBean,
            ...fields,
          },
        },
      },
    });

    let hazFields: { hazardousAction: string; hazaRuleNotes: string } | null =
      null;
    try {
      const latestRouting =
        dataRef.current['routingDetails'] || routing.routingFormData;
      const latestCargo = cargoDetails.cargoState.cargoRows;
      const shipmentType =
        (dataRef.current['mainDetails']?.type as string | undefined)?.charAt(
          0
        ) || 'L';
    
      const refNumber = String(bookingMainDetails.reference ?? 0);

      const hazResult = await validateHazRules({
        cargoRows: latestCargo,
        routingFormData: latestRouting,
        shipmentType,
        referenceNumber: refNumber,
        savedBean: savedBookingResponseRef.current ?? undefined,
        currentStatus: String(bookingMainDetails.status ?? ''),
      });

      if (hazResult) {
        hazFields = {
          hazardousAction: hazResult.hazardousAction,
          hazaRuleNotes: hazResult.hazaRuleNotes,
        };
      }

      if (hazResult?.action === 'SHIPMENT_RESTRICTED') {
        const hasHazOverridePermission =
          loginClientBean?.userSettingMap?.[
            'HAZARDOUS_RESTRICTION_OVERRIDE_PERMISSION'
          ]?.[0] === 'Y';
        if (hasHazOverridePermission) {
          const restrictedPayload = patchBkgBean(basePayload, {
            hazardousAction: hazResult.hazardousAction,
            hazaRuleNotes: hazResult.hazaRuleNotes,
          });
          hazPendingPayloadRef.current = restrictedPayload;
          setHazRestrictionMessages(hazResult.rawRemarks);
          setShowHazSupervisorConfirm(true);
        } else {
          showStatus(
            'warning',
            hazResult.messages.length > 0
              ? hazResult.messages
              : [
                  'This shipment contains restricted hazardous cargo and cannot be saved.',
                ]
          );
        }
        return;
      }

      if (hazResult?.action === 'REQUIRES_APPROVAL') {
        showStatus('warning', hazResult.messages);
        await runPreBookingSaveFlow(
          patchBkgBean(basePayload, {
            pendingFinalBookingStatus: 'N',
            isHazardousPermissionOverride: 'N',
            hazardousAction: hazResult.hazardousAction,
            hazaRuleNotes: hazResult.hazaRuleNotes,
          })
        );
        return;
      }
    } catch {
      showStatus('error', [
        'Hazardous rule validation failed. Please try again or contact support.',
      ]);
      return;
    }

    await runPreBookingSaveFlow(
      patchBkgBean(basePayload, {
        // pendingFinalBookingStatus: 'N',
        hazardousAction: hazFields?.hazardousAction ?? 'SHIPMENT_ALLOWED',
        hazaRuleNotes: hazFields?.hazaRuleNotes ?? '',
      })
    );
  };

  // handlePreBookingSubmit: checks IRP conditions first, then calls handleSubmit.
  const handlePreBookingSubmit = async () => {
    const finalPayload = await buildpreBookingpayload();
    if (!finalPayload) return;

    if (finalPayload) {
      if (
        populateData &&
        populateData?.result?.bookingQuoteBean?.pendingFinalBookingStatus ===
          'Y' &&
        finalPayload?.requestData?.mainBookingQuoteBean?.bookingQuoteBean
          ?.pendingFinalBookingStatus === 'N'
      ) {
        preBookingFinalizedIrp.openIRP();
      } else if (
        populateData &&
        populateData?.result?.bookingQuoteBean &&
        populateData?.result?.bookingQuoteBean?.handlingOffice !==
          finalPayload?.requestData?.mainBookingQuoteBean?.bookingQuoteBean
            ?.handlingOffice
      ) {
        handlingOfficeIrp.openIRP();
      } else if (
        populateData &&
        populateData?.result?.bookingQuoteBean &&
        !populateData?.result?.bookingQuoteBean?.exportBookingNumber &&
        finalPayload?.requestData?.mainBookingQuoteBean?.bookingQuoteBean?.exportBookingNumber?.trim()
      ) {
        eoBookingLinklIrp.openIRP();
      } else if (
        populateData?.result?.bookingQuoteBean &&
        populateData?.result?.bookingQuoteBean?.exportBookingNumber?.trim() &&
        !finalPayload?.requestData?.mainBookingQuoteBean?.bookingQuoteBean
          ?.exportBookingNumber
      ) {
        eoBookingUnLinklIrp.openIRP();
      } else {
        handleSubmit();
      }
    } else {
      handleSubmit();
    }
  };

  const executePreBookingSave = async (finalPayload: any) => {
    // const error = validateForm();
    // if (error) {
    //   showStatus('warning', [error]);
    //   return;
    // }

    // handlePopulate('24150281');

    if (!finalPayload) return;

    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = (await ApiService.post(
        OCEAN_ENDPOINTS.IMPORT_BOOKING.VALIDATE_AND_SAVE_DATA,
        finalPayload
      )) as any;
      const referenceNumber =
        response?.data?.result?.bookingQuoteBean?.referenceNumber;

      if (referenceNumber) {
        showStatus('success', [
          `Pre-Booking  ${referenceNumber} has been saved successfully!`,
        ]);
        // onClearAll();
        gwtBridgeInstance.gwtActionFromReact('SET_REFERENCE_NUMBER_ON_TAB', {
          referenceNumber: String(referenceNumber),
        });

        handlePopulate(referenceNumber);
        savedBookingResponseRef.current =
          response?.data?.result?.bookingQuoteBean;
      } else {
        if (
          response?.data?.result === null &&
          response?.data?.errorCode === '500'
        ) {
          showStatus('error', [
            'Unable to save import booking details. Error while saving pre-booking.',
          ]);
        } else {
          showStatus('error', [
            'Prebooking saved but reference number was not returned.',
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to submit Prebooking:', error);
      showStatus('error', ['An error occurred while saving the pre-booking..']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const executeExportBookingSave = async (exportPayload) => {
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = (await ApiService.post(
        PHOENIX_ENDPOINTS.BOOKING.VALIDATE_AND_SAVE_DATA,
        exportPayload
      )) as any;

      const referenceNumber = response?.data?.bookingQuoteBean?.referenceNumber;

      if (referenceNumber) {
        showStatus('success', [
          `Booking ${referenceNumber} saved successfully!`,
        ]);
        dispatch(
          updatePreBookingMainDetails({
            exportBookingNumber: String(referenceNumber),
          })
        );
      } else {
        showStatus('error', [
          'Booking saved but reference number was not returned.',
        ]);
      }
    } catch (error) {
      console.error('Failed to submit Booking:', error);
      showStatus('error', ['An error occurred while saving the Booking.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= Accurate -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

  // AccuRate guard — only fire when ratingType is 'A'
  const isAccuRateActive = () =>
    (dataRef.current?.rateDetails as any)?.ratingType === 'A';

  // Customer: customerCode + prepaidCollect are nested inside lclForm
  const customerTriggerChanged = (newData: any, prev: any) =>
    newData?.lclForm?.customerCode !== prev?.lclForm?.customerCode ||
    newData?.lclForm?.prepaidCollect !== prev?.lclForm?.prepaidCollect;

  //=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-= Effects -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
  useEffect(() => {
    if (routing.pickupState.showPickupOrDoorDelivery) {
      setOpenItems((prev) =>
        prev.includes('truckingDetails') ? prev : [...prev, 'truckingDetails']
      );
    }
  }, [routing.pickupState.showPickupOrDoorDelivery]);
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

  const cancelPreBooking = async () => {
    if (
      referenceNumber === '' ||
      referenceNumber === '0' ||
      referenceNumber === null
    ) {
      showStatus('error', ['Please fillup referenceNumber first.']);
    } else {
      cancelIRP.openIRP();
    }
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
    dispatch(updatePreBookingMainDetails({ clauses: [...clauseSuggestions] }));
  }

  const accordionProps: AccordionProps = {
    accordionData: accordionItems,
    openItems: openItems,
    toggleItem: toggleItem,
  };

  return (
    <>
      <ToolBar
        key={toolbarKey}
        tabId={tabId}
        onNotesClick={openNotes}
        onDocumentsClick={openDocuments}
        onSubmit={handlePreBookingSubmit}
        isSubmitting={isSubmitting}
        onToggleAll={toggleAllItems}
        isAllOpen={isAllOpen}
        progress={progressBar.screenProgress}
        isDisplayPreviewButton={false}
        disableDocuments={!isReferenceDisabled}
        onCopyBooking={handleCopyBooking}
        oneDocsClick={oneDocsClick}
        // onCancelBooking={cancelIRP.openIRP}        onCancelBooking={cancelIRP.openIRP}
        onCancelBooking={cancelPreBooking}
        handleClearAll={onClearAll}
        moduleType="PREBKG"
        isCancelled={
          isShipmentConfirmedPersistent ||
          populateData?.result?.bookingQuoteBean?.status === 'C'
        }
      />
      <Accordion {...accordionProps} />
      {/* @ts-ignore */}
      <IRPPopup {...cancelIRP.irpPopupProps} />
      <IRPPopup {...handlingOfficeIrp.irpPopupProps} />
      <IRPPopup {...preBookingFinalizedIrp.irpPopupProps} />
      <IRPPopup {...updateIRP.irpPopupProps} />
      <IRPPopup {...shipmentConfirmedIrp.irpPopupProps} />
      <IRPPopup {...eoBookingLinklIrp.irpPopupProps} />
      <IRPPopup {...eoBookingUnLinklIrp.irpPopupProps} />
      {/* @ts-ignore */}
      {/* <IRPPopup {...eDocsIRP.irpPopupProps} /> */}
      <PCommonPrompt
        open={incompletePromptOpen}
        title="Incomplete Pre-Booking Remarks"
        label="Additional Remarks"
        required
        maxLength={250}
        onClose={() => {
          setIncompletePromptOpen(false);
          pendingPayloadRef.current = null;
        }}
        onSubmit={(remark) => {
          setIncompletePromptOpen(false);
          const finalPayload = pendingPayloadRef.current;
          pendingPayloadRef.current = null;
          if (!finalPayload) return;
          const payloadWithRemark = {
            ...finalPayload,
            requestData: {
              ...finalPayload.requestData,
              mainBookingQuoteBean: {
                ...finalPayload.requestData.mainBookingQuoteBean,
                bookingQuoteBean: {
                  ...finalPayload.requestData.mainBookingQuoteBean
                    .bookingQuoteBean,
                  additionalRemark: remark,
                },
              },
            },
          };
          executePreBookingSave(payloadWithRemark);
        }}
      />
      <PConfirmationModal
        open={cargoNotReadyConfirmOpen}
        title="Confirmation"
        message="Do you want to update Pre-Booking status to Cargo Not Ready?"
        variant="warning"
        sx={{
          '& .phx-PModal-module-content > .MuiBox-root': {
            margin: '0.7rem !important',
          },
        }}
        width={400}
        primaryAction={{
          label: 'Yes',
          onClick: () => {
            setCargoNotReadyConfirmOpen(false);
            const finalPayload = pendingPayloadRef.current;
            pendingPayloadRef.current = null;
            if (!finalPayload) return;
            prevCargoReadDateRef.current = String(
              dataRef.current['routingDetails']?.cargoReadDate ?? null
            );
            const payloadWithCargonr = {
              ...finalPayload,
              requestData: {
                ...finalPayload.requestData,
                mainBookingQuoteBean: {
                  ...finalPayload.requestData.mainBookingQuoteBean,
                  bookingQuoteBean: {
                    ...finalPayload.requestData.mainBookingQuoteBean
                      .bookingQuoteBean,
                    importBookingStatus: 'CARGONR',
                  },
                },
              },
            };
            executePreBookingSave(payloadWithCargonr);
          },
        }}
        secondaryAction={{
          label: 'No',
          onClick: () => {
            setCargoNotReadyConfirmOpen(false);
            const finalPayload = pendingPayloadRef.current;
            pendingPayloadRef.current = null;
            if (!finalPayload) return;
            prevCargoReadDateRef.current = String(
              dataRef.current['routingDetails']?.cargoReadDate ?? null
            );
            executePreBookingSave(finalPayload);
          },
        }}
        onClose={() => {
          setCargoNotReadyConfirmOpen(false);
          pendingPayloadRef.current = null;
        }}
      />
      <PConfirmationModal
        open={shipmentConfirmOpen}
        title="Confirmation"
        message={
          <>
            Do you want to confirm the shipment?
            <br />
            <br />
            Once confirmed, an export booking will be created, and no further
            changes can be made to the pre-booking.
          </>
        }
        variant="warning"
        sx={{
          '& .phx-PModal-module-content > .MuiBox-root': {
            margin: '0.7rem !important',
          },
        }}
        width={700}
        primaryAction={{
          label: 'Yes',
          onClick: async () => {
            confirmshipment();
          },
        }}
        secondaryAction={{
          label: 'No',
          onClick: () => {
            setShipmentConfirmOpen(false);
            pendingShipmentRefRef.current = null;
          },
        }}
        onClose={() => {
          setShipmentConfirmOpen(false);
          pendingShipmentRefRef.current = null;
        }}
      />
      <PConfirmationModal
        open={updatedConfirmOpen}
        title="Confirmation"
        message="Pre-Booking Updated. Do you want to send it to the Origin?"
        variant="warning"
        sx={{
          '& .phx-PModal-module-content > .MuiBox-root': {
            margin: '0.7rem !important',
          },
        }}
        primaryAction={{
          label: 'Save and Sent to Origin',
          onClick: () => {
            updateIRP.openIRP();
          },
        }}
        secondaryAction={{
          label: 'Save Only',
          onClick: () => {
            setUpdatedConfirmOpen(false);
            const finalPayload = pendingPayloadRef.current;
            pendingPayloadRef.current = null;
            if (!finalPayload) return;
            const payloadWithoutStatus = {
              ...finalPayload,
              requestData: {
                ...finalPayload.requestData,
                mainBookingQuoteBean: {
                  ...finalPayload.requestData.mainBookingQuoteBean,
                  bookingQuoteBean: {
                    ...finalPayload.requestData.mainBookingQuoteBean
                      .bookingQuoteBean,
                    prebookingSaveActionFlag: 'S',
                  },
                },
              },
            };
            executePreBookingSave(payloadWithoutStatus);
          },
        }}
        onClose={() => {
          setUpdatedConfirmOpen(false);
          pendingPayloadRef.current = null;
        }}
      />
      <PConfirmationModal
        open={quotePopulateConfirmOpen}
        title="Please Confirm"
        variant="warning"
        sx={{
          '& .phx-PModal-module-content > .MuiBox-root': {
            margin: '0.7rem !important',
          },
        }}
        width={700}
        message={
          <>
            <div style={{ marginBottom: 12 }}>{quoteDiscrepancyMessage}</div>
            <br></br>
            <YesNoToggleGroup
              value={quotePopulateSelectedOption}
              onChange={setQuotePopulateSelectedOption}
              options={[
                {
                  key: 'option1',
                  label:
                    'Copy Cargo Details and all Rates from Import Quote to Pre-Booking',
                },
                {
                  key: 'option2',
                  label:
                    'Copy only Rates from Import Quote to Pre-Booking and keep Cargo Details unchanged',
                },
              ]}
            />
          </>
        }
        buttonAlign="left"
        primaryAction={{
          label: 'Apply Updates',
          onClick: () => {
            setQuotePopulateConfirmOpen(false);
            const pendingResult = pendingQuoteResultRef.current;
            pendingQuoteResultRef.current = null;
            if (pendingResult)
              handlePopulateResponse(
                pendingResult,
                'quote',
                quotePopulateSelectedOption === 'option2'
              );
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            setQuotePopulateConfirmOpen(false);
            pendingQuoteResultRef.current = null;
          },
        }}
        onClose={() => {
          setQuotePopulateConfirmOpen(false);
          pendingQuoteResultRef.current = null;
        }}
      />

      <CopyModal
        moduleType="PREBKG"
        open={isCopyBookingModalOpen}
        onClose={() => {
          setIsCopyBookingModalOpen(false);
          setToolbarKey((prev) => prev + 1);
        }}
        onCopyClick={handleCopyBookingConfirm}
        title="Copy Pre-booking"
        label="Enter Pre Booking Number"
      />

      <PConfirmationModal
        open={showHazSupervisorConfirm}
        title="Hazardous Approval Override"
        variant="warning"
        width={550}
        buttonAlign="end"
        sx={{
          '& .phx-PModal-module-content > .MuiBox-root': {
            margin: '0.4rem !important',
            padding: '0.4rem !important',
            minHeight: 'unset !important',
          },
        }}
        message={
          <div style={{ padding: '4px 8px', fontSize: '13px' }}>
            {hazRestrictionMessages.map((msg, i) => (
              <div key={i}>{msg}</div>
            ))}
          </div>
        }
        primaryAction={{
          label: 'Proceed',
          onClick: () => {
            setShowHazSupervisorConfirm(false);
            setShowHazOverrideRemarks(true);
          },
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            setShowHazSupervisorConfirm(false);
            hazPendingPayloadRef.current = null;
            setHazRestrictionMessages([]);
          },
        }}
        onClose={() => {
          setShowHazSupervisorConfirm(false);
          hazPendingPayloadRef.current = null;
          setHazRestrictionMessages([]);
        }}
      />

      <PCommonPrompt
        open={showHazOverrideRemarks}
        title="Override Hazardous Restriction"
        label="Remarks"
        submitLabel="Save"
        required
        onClose={() => {
          setShowHazOverrideRemarks(false);
          hazPendingPayloadRef.current = null;
          setHazRestrictionMessages([]);
        }}
        onSubmit={(remark) => {
          setShowHazOverrideRemarks(false);
          const finalPayload = hazPendingPayloadRef.current;
          hazPendingPayloadRef.current = null;
          setHazRestrictionMessages([]);
          if (!finalPayload) return;

          const bqb =
            finalPayload.requestData?.mainBookingQuoteBean?.bookingQuoteBean ??
            {};
          const existingStatusBean = bqb.shipmentStatusUpdateBean ?? {};
          const existingEventList: any[] = existingStatusBean.eventList ?? [];

          const updatedEventList = existingEventList.map((event: any) =>
            event.eventName === 'HAZ_OVERRIDE_PERMISSION'
              ? {
                  ...event,
                  commentParams: {
                    ...event.commentParams,
                    REMARK: remark,
                  },
                }
              : event
          );

          const payloadWithOverride = {
            ...finalPayload,
            requestData: {
              ...finalPayload.requestData,
              mainBookingQuoteBean: {
                ...finalPayload.requestData.mainBookingQuoteBean,
                bookingQuoteBean: {
                  ...bqb,
                  isHazardousPermissionOverride: 'Y',
                  pendingFinalBookingStatus: 'N',
                  shipmentStatusUpdateBean: {
                    ...existingStatusBean,
                    eventList: updatedEventList,
                  },
                },
              },
            },
          };
          runPreBookingSaveFlow(payloadWithOverride);
        }}
      />
      <PConfirmationModal
        open={error.showErrorModal}
        title="Warning"
        variant="warning"
        buttonAlign="end"
        message={
          Array.isArray(error.message)
            ? error.message.join('\n')
            : error.message
        }
        secondaryAction={{
          label: 'Close',
          onClick: () => {
            setError({
              showErrorModal: false,
              message: [],
            });
          },
        }}
      />
    </>
  );
}
