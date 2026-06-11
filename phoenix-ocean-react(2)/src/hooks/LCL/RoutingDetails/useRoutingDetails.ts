import { useContext, useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { ApiService } from '@/core/api/client';

import { useTermsDeliveryHandlers } from './handlers/useTermsDeliveryHandlers';
import { usePickupChangeHandlers } from './handlers/usePickupChangeHandlers';
import { useDeliveryTypeChangeHandlers } from './handlers/useDeliveryTypeChangeHandlers';
import { useCarriageTypeChangeHandlers } from './handlers/useCarriageTypeChangeHandlers';
import { useVesselSelectHandlers } from './handlers/useVesselSelectHandlers';
import { useWarehouseMappingHandler } from './handlers/useWarehouseMappingHandler';
import type { WarehouseMappingCallbacks } from './handlers/useWarehouseMappingHandler';

import {
  RoutingFormData,
  PickupDetailsFormData,
  DoorDeliveryFormData,
  PickupDeliveryFormData,
  InternalCargoRowData,
  getInitialRoutingData,
  DEFAULT_PICKUP_FORM,
  getInitialDoorDeliveryData,
  useGetSuggestions,
  locationSuggestionConfig,
  termsSuggestionConfig,
  carrierCodeSuggestionConfig,
  vesselCodeSuggestionConfig,
  useLocationInformation,
  defaultTruckerFormData,
  HeaderData,
  PickupCharge,
  TruckerFormData,
  useFeatureToggle,
  LclToggleKeys,
  useLocationData,
  findByUnlocationCode,
  CommonToggleKeys,
  formatTime,
  updatePreBookingMainDetails,
} from 'phoenix-common-react';
import type { ScheduleRow, ScheduleGroup } from 'phoenix-common-react';
import { checkDateValidation } from 'phoenix-react-lib';
import { useAppSelector } from '@/app/store/hooks';
import { LocationContext } from '@/context/locatioContext';
import { useStatus } from '../../../context/statusContext';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useDispatch } from 'react-redux';
dayjs.extend(customParseFormat);
interface CheckDateValidationParams {
  dateString: string;
  setInputValue?: (value: Date | null) => void;
  onDateSelection?: (date: Date) => void;
  setErrorMessage?: (message: string) => void;
}

const EMPTY_DOOR_DELIVERY = getInitialDoorDeliveryData();
const EMPTY_CARGO_HAZARDOUS: string[] = [];

export const useRouting = ({
  moduleType = 'BKG',
  shipmentType = 'LCL',
  cargoHazardousValues = EMPTY_CARGO_HAZARDOUS,
  warehouseCallbacks,
}: {
  moduleType?: 'BKG' | 'QUOTE';
  shipmentType?: 'LCL' | 'FCL';
  cargoHazardousValues?: string[];
  warehouseCallbacks?: WarehouseMappingCallbacks;
} = {}) => {
  const loginClientBean = useAppSelector(
    (state: any) => state.loginClientBean?.data
  );
  const dispatch = useDispatch();
  const ApplicationClientConstant_PERIOD_OF_DAYS = 90; // Updated to 150 days
  const millisecondsInOneDay = 24 * 60 * 60 * 1000; // Convert days to milliseconds

  const todayDate = new Date();

  const periodOfDays =
    loginClientBean?.officeSettingMap?.PERIOD_OF_DAYS[0] ??
    ApplicationClientConstant_PERIOD_OF_DAYS;

  const before = new Date(
    todayDate.getTime() - periodOfDays * millisecondsInOneDay
  );
  const after = new Date(
    todayDate.getTime() + periodOfDays * millisecondsInOneDay
  );
  const { showStatus } = useStatus();
  const bookingMainDetails = useAppSelector(
    (state: any) => state.booking?.mainDetails
  );

  const featureToggle = useFeatureToggle();
  const { isVisible } = featureToggle;
  const wwaTransshipmentEnabled = isVisible(
    LclToggleKeys.WWA_TRANSSHIPMENT_PORT
  );
  const isTrkLclGate =
    isVisible(LclToggleKeys.TRUCKING_RATES_INTEGRATION) &&
    shipmentType === 'LCL';
  const isTrkLclGateRef = useRef<boolean>(false);
  isTrkLclGateRef.current = isTrkLclGate;
  const { fetchLocationData } = useLocationData();

  const isQuoteLcl = moduleType === 'QUOTE' && shipmentType === 'LCL';

  const [formData, setFormData] = useState<RoutingFormData>(() => ({
    ...getInitialRoutingData(),
    ...(isQuoteLcl ? { warehouse: 'TEMP', warehouseName: 'TEMP WAREHOUSE' } : {}),
  }));

  const [pickUpValue, setPickUpValue] = useState<string>('N');
  const [openPickupModal, setOpenPickupModal] = useState(false);
  const [showTruckingDetails, setShowTruckingDetails] = useState(false);

  const [pickups, setPickups] = useState<number[]>([0]);
  const [pickupForms, setPickupForms] = useState<
    Record<number, PickupDetailsFormData>
  >(() => ({
    0: {
      ...DEFAULT_PICKUP_FORM,
      ...(isQuoteLcl && {
        pickupCountry:
          loginClientBean?.countryCode && loginClientBean?.country
            ? `${loginClientBean.countryCode} - ${loginClientBean.country}`
            : DEFAULT_PICKUP_FORM.pickupCountry,
        estimatedPickupDate: todayDate,
      }),
    },
  }));
  const [collapsedSet, setCollapsedSet] = useState<Set<number>>(new Set());

  const [openDialog, setOpenDialog] = useState(false);
  const [removeIndex, setRemoveIndex] = useState<number | null>(null);

  const [orgSearchOpenSet, setOrgSearchOpenSet] = useState<Set<number>>(
    new Set()
  );

  const [doorDeliveryDialogOpen, setDoorDeliveryDialogOpen] = useState(false);
  const [combinedDialogOpen, setCombinedDialogOpen] = useState(false);
  const [doorDeliveryCollapsed, setDoorDeliveryCollapsed] = useState(false);
  const [showPickupStack, setShowPickupStack] = useState(false);
  const [showDoorDeliverySection, setShowDoorDeliverySection] = useState(false);
  const [doorDeliveryForm, setDoorDeliveryForm] =
    useState<DoorDeliveryFormData>(EMPTY_DOOR_DELIVERY);
  const portOfLoadingEtsRef = useRef<HTMLInputElement | null>(null);
  const locationContext = useContext(LocationContext);
  const locationCode =
    shipmentType === 'FCL'
      ? formData.dischargeCode || formData.placeOfDeliveryCode || ''
      : formData.destinationCfsCode ||
        formData.portOfDischargeCode ||
        formData.placeOfDeliveryCode ||
        '';
  const [truckingPickupForms, setTruckingPickupForms] = useState<
    Record<number, PickupDeliveryFormData>
  >({});
  const [truckingCargoRowsMap, setTruckingCargoRowsMap] = useState<
    Record<number, InternalCargoRowData[]>
  >({});
  const [pickupTruckerForms, setPickupTruckerForms] = useState<
    Record<number, TruckerFormData>
  >({});
  const [pickupChargeMap, setPickupChargeMap] = useState<
    Record<number, PickupCharge[]>
  >({});
  const [headerDataMap, setHeaderDataMap] = useState<
    Record<number, HeaderData>
  >({});
  const [doorDeliveryChargeRows, setDoorDeliveryChargeRows] = useState<
    PickupCharge[]
  >([]);

  const [debouncedLocationCode, setDebouncedLocationCode] = useState('');
  const [showDeliveryType, setShowDeliveryType] = useState(false);
  const [isFromTermsHandler, setIsFromTermsHandlerState] = useState(false);
  const isFromTermsHandlerRef = useRef(false);
  const setIsFromTermsHandler = (value: boolean) => {
    isFromTermsHandlerRef.current = value;
    setIsFromTermsHandlerState(value);
  };
  const preCarriageByRef = useRef<HTMLInputElement | null>(null);
  const customerDetailsStackMoreDetailsRef = useRef<HTMLInputElement | null>(
    null
  );
  const placeOfReceiptInputLocationSelectionRef =
    useRef<HTMLInputElement | null>(null);
  const vesselCodeInputSelectionRef = useRef<HTMLInputElement | null>(null);
  const loadInputLocationSelectionRef = useRef<HTMLInputElement | null>(null);
  const destinationInputLocationSelectionRef = useRef<HTMLInputElement | null>(
    null
  );
  const deConsolidationCodeInputLocationSelectionRef =
    useRef<HTMLInputElement | null>(null);
  const carrierPlaceOfReceiptCodeInputLocationSelectionRef =
    useRef<HTMLInputElement | null>(null);
  const dischargeInputLocationSelectionRef = useRef<HTMLInputElement | null>(
    null
  );
  const origineEtdDateRef = useRef<HTMLInputElement | null>(null);
  const etsDateRef = useRef<HTMLInputElement | null>(null);
  const etaDateRef = useRef<HTMLInputElement | null>(null);
  const etaDestinationDateRef = useRef<HTMLInputElement | null>(null);
  const [showCustomerDetailsStack, toggleShowCustomerDetailsStack] =
    useState(false);
  const [showErrorMessageModal, toggleErrorMessageModal] =
    useState<boolean>(false);
  const [datePickerErrorMessage, setDatePickerErrorMessage] =
    useState<string>('');
  const [skipNextBlurValidation, setSkipNextBlurValidation] = useState(false);
  const pf0 = pickupForms[0];
  useEffect(() => {
    if (!isTrkLclGate || !pf0) return;
    const computed = [pf0.pickupCity, pf0.pickupState, pf0.pickupZipCode]
      .filter(Boolean)
      .join(', ');
    setFormData((prev) => {
      if (prev.placeOfReceiptPickupFromName === computed) return prev;
      return { ...prev, placeOfReceiptPickupFromName: computed };
    });
  }, [pf0?.pickupCity, pf0?.pickupState, pf0?.pickupZipCode, isTrkLclGate]);

  useEffect(() => {
    if (!isTrkLclGate || !showDoorDeliverySection) return;
    const { doorDeliveryCity, doorDeliveryStateCode, doorDeliveryZipCode } = doorDeliveryForm;
    const computed = [doorDeliveryCity, doorDeliveryStateCode, doorDeliveryZipCode]
      .filter(Boolean)
      .join(', ');
    setFormData((prev) => {
      if (prev.placeOfDeliveryName === computed) return prev;
      return { ...prev, placeOfDeliveryName: computed };
    });
  }, [
    doorDeliveryForm.doorDeliveryCity,
    doorDeliveryForm.doorDeliveryStateCode,
    doorDeliveryForm.doorDeliveryZipCode,
    isTrkLclGate,
    showDoorDeliverySection,
  ]);

  const isCFSDoor = formData.terms === 'CFDR' || formData.terms === 'DRDR';

  useEffect(() => {
    if (!isCFSDoor) return;
    setFormData((prev) => {
      if (prev.placeOfDeliveryType === 'DOOR') return prev;
      return { ...prev, placeOfDeliveryType: 'DOOR' };
    });
  }, [isCFSDoor]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedLocationCode(
        shipmentType === 'FCL'
          ? formData.dischargeCode || formData.placeOfDeliveryCode || ''
          : formData.destinationCfsCode ||
              formData.portOfDischargeCode ||
              formData.placeOfDeliveryCode ||
              ''
      );
    }, 500);

    return () => clearTimeout(timer);
  }, [
    formData.destinationCfsName,
    formData.portOfDischargeName,
    formData.placeOfDeliveryName,
    formData.dischargeName,
  ]);

  const { data: locationData } = useLocationInformation({
    locationCode: debouncedLocationCode,
    officeCode: loginClientBean?.office ?? '',
  });

  useEffect(() => {
    if (locationCode) {
      if (shipmentType === 'FCL') {
        setFormData((prev) => ({
          ...prev,
          locationInformationPublic: locationData.fclPublicInfo,
          locationInformationPrivate: locationData.fclPrivateInfo,
        }));
      }
      locationContext?.setLocationData(locationData);
    } else {
      locationContext?.setLocationData(null);
    }
  }, [locationCode, locationData]);

  const [pickupValidationMessages, setPickupValidationMessages] = useState<
    string[]
  >([]);
  const [confirmedPickupForms, setConfirmedPickupForms] = useState<
    Record<number, PickupDetailsFormData>
  >({});
  const [confirmedVersions, setConfirmedVersions] = useState<
    Record<number, number>
  >({});

  const showPickupOrDoorDelivery = showPickupStack || showDoorDeliverySection;

  const handleRoutingChange = <K extends keyof RoutingFormData>(
    field: K,
    value: RoutingFormData[K]
  ) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'terms') {
        updated.deliveryType =
          value === 'CFDR' || value === 'DRCF' || value === 'DRDR' ? 'D' : '';
      }
      if (
        field === 'destinationCfsCode' &&
        typeof value === 'string' &&
        !value.trim()
      ) {
        updated.destinationCfsCode = '';
        updated.destinationCfsName = '';
        updated.destinationCfsRegion = '';
        locationContext?.setLocationData(null);
      }
      if (
        field === 'portOfDischargeCode' &&
        typeof value === 'string' &&
        !value.trim()
      ) {
        updated.portOfDischargeCode = '';
        updated.portOfDischargeName = '';
        updated.portOfDischargeRegion = '';
        locationContext?.setLocationData(null);
      }
      if (
        field === 'placeOfDeliveryCode' &&
        typeof value === 'string' &&
        !value.trim()
      ) {
        updated.placeOfDeliveryCode = '';
        updated.placeOfDeliveryName = '';
        updated.placeOfDeliveryRegion = '';
        locationContext?.setLocationData(null);
      }
      if (
        field === 'placeOfReceiptCode' &&
        typeof value === 'string' &&
        !value.trim()
      ) {
        updated.placeOfReceiptCode = '';
        updated.placeOfReceiptName = '';
        updated.placeOfReceiptRegion = '';
      }
      if (
        field === 'portOfLoadingCode' &&
        typeof value === 'string' &&
        !value.trim()
      ) {
        updated.portOfLoadingCode = '';
        updated.portOfLoadingName = '';
        updated.portOfLoadingRegion = '';
      }
      if (
        field === 'consolidationCfsCode' &&
        typeof value === 'string' &&
        !value.trim()
      ) {
        updated.consolidationCfsCode = '';
        updated.consolidationCfsName = '';
        updated.consolidationCfsRegion = '';
      }
      if (
        field === 'deconsolidationCfsCode' &&
        typeof value === 'string' &&
        !value.trim()
      ) {
        updated.deconsolidationCfsCode = '';
        updated.deconsolidationCfsName = '';
        updated.deconsolidationCfsRegion = '';
      }

      if (shipmentType === 'FCL') {
        if (field === 'preCarriageType') {
          updated.preCarriageBy = '';
          setTimeout(() => {
            preCarriageByRef.current?.focus();
          }, 0);
        }

        if (
          field === 'dischargeCode' &&
          typeof value === 'string' &&
          !value.trim()
        ) {
          updated.dischargeCode = '';
          updated.dischargeName = '';
          updated.dischargeRegion = '';
          locationContext?.setLocationData(null);
        }
      }

      return updated;
    });
    if (field === 'terms') {
      const v = value as string;
      if (v === 'CFDR' || v === 'DRDR') {
        setShowDoorDeliverySection(true);
        setShowTruckingDetails(true);
      } else {
        setShowDoorDeliverySection(false);
        setFormData((prev) => ({ ...prev, deliveryType: '-1' }));
      }
      if (v === 'DRCF' || v === 'DRDR') {
        setShowPickupStack(true);
        setShowTruckingDetails(true);
        // } else {
        //   setShowDoorDeliverySection(false);
      }
    }
  };

  const bulkUpdateRouting = (data: Partial<RoutingFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const { triggerWarehouseMapping } = useWarehouseMappingHandler({
    routingFormData: formData,
    truckingPickupForms,
    doorDeliveryForm,
    showPickupStack,
    isLotReceived: bookingMainDetails?.isLotReceived ?? false,
    isShipmentOrderTransmit:
      bookingMainDetails?.isShipmentOrderTransmit ?? false,
    moduleType,
    shipmentType,
    bookingQuoteType: bookingMainDetails?.bookingQuoteType ?? '',
    referenceNumber: bookingMainDetails?.referenceNumber ?? null,
    loginClientBean,
    cargoHazardousValues,
    updateRouting: bulkUpdateRouting,
    callbacks: warehouseCallbacks,
  });

  const warehouseTriggerRef = useRef(triggerWarehouseMapping);
  warehouseTriggerRef.current = triggerWarehouseMapping;

  const prevPickupLatRef = useRef<string>('');
  const prevDoorDeliveryLatRef = useRef<string>('');

  const cargoHazardousKey = cargoHazardousValues.join(',');

  const cargoHazardousMountRef = useRef(false);
  useEffect(() => {
    if (!cargoHazardousMountRef.current) {
      cargoHazardousMountRef.current = true;
      return;
    }
    if (!isTrkLclGateRef.current) return;
    warehouseTriggerRef.current('EO');
    warehouseTriggerRef.current('IO');
  }, [cargoHazardousKey]);

  const clearPickupDetails = () => {
    setPickupTruckerForms({});
    setPickupChargeMap({});
    setHeaderDataMap({});
    setOpenPickupModal(false);
  };

  const handleAgentNameSelect = (item: Record<string, unknown>) => {
    const name = String(item?.name || '');
    const email = String(item?.email || '');

    setFormData((prev) => ({
      ...prev,
      agentName: name,
      agentEmail: email,
    }));
  };

  const handleAgentNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      agentName: value,
    }));
  };

  const handleAgentEmailChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      agentEmail: value,
    }));
  };

  const setPickupNeeded = (value: string) => {
    setPickUpValue(value);
    setFormData((prev) => ({ ...prev, pickupNeeded: value }));
    if (value !== 'Y' && value !== 'T') {
      setOpenPickupModal(false);
      setShowTruckingDetails(false);
    }
  };

  const closePickupModal = () => {
    setOpenPickupModal(false);
    setShowTruckingDetails(true);
  };

  const handleDialogConfirm = () => {
    setOpenPickupModal(false);
    setShowTruckingDetails(true);
  };

  const handleAddPickup = () => {
    const newId = Math.max(...pickups, -1) + 1;
    setPickups((prev) => [...prev, newId]);
    setPickupForms((prev) => ({
      ...prev,
      [newId]: {
        ...DEFAULT_PICKUP_FORM,
        ...(isQuoteLcl && {
          pickupCountry:
            loginClientBean?.countryCode && loginClientBean?.country
              ? `${loginClientBean.countryCode} - ${loginClientBean.country}`
              : DEFAULT_PICKUP_FORM.pickupCountry,
          estimatedPickupDate: new Date(),
        }),
      },
    }));
    setPickupTruckerForms((prev) => ({
      ...prev,
      [newId]: { ...defaultTruckerFormData },
    }));
    setPickupChargeMap((prev) => ({ ...prev, [newId]: [] }));
  };

  const handleFormDataChange = (
    pickupId: number,
    field: keyof PickupDetailsFormData,
    value: unknown
  ) => {
    setPickupForms((prev) => ({
      ...prev,
      [pickupId]: {
        ...(prev[pickupId] ?? DEFAULT_PICKUP_FORM),
        [field]: value,
      },
    }));
  };

  const handleToggleCollapse = (id: number) => {
    setCollapsedSet((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleRemovePickup = (index: number) => {
    if (pickups.length > 1) {
      setRemoveIndex(index);
      setOpenDialog(true);
    }
  };

  const handleConfirmRemove = () => {
    if (removeIndex !== null) {
      const removedId = pickups[removeIndex];
      setPickups((prev) => prev.filter((_, i) => i !== removeIndex));
      setPickupForms((prev) => {
        const next = { ...prev };
        delete next[removedId];
        return next;
      });
      setPickupTruckerForms((prev) => {
        const next = { ...prev };
        delete next[removedId];
        return next;
      });
      setPickupChargeMap((prev) => {
        const next = { ...prev };
        delete next[removedId];
        return next;
      });
      setHeaderDataMap((prev) => {
        const next = { ...prev };
        delete next[removedId];
        return next;
      });
    }
    setOpenDialog(false);
    setRemoveIndex(null);
  };

  const handleCancelRemove = () => {
    setOpenDialog(false);
    setRemoveIndex(null);
  };

  const handleOrgSearchOpen = (id: number) => {
    setOrgSearchOpenSet((prev) => new Set(prev).add(id));
  };

  const handleOrgSearchClose = (id: number) => {
    setOrgSearchOpenSet((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handlePickupAccessorialsChange = (
    pickupId: number,
    selected: string[]
  ) => {
    handleFormDataChange(pickupId, 'accessorials', selected);
  };

  const handleDoorDeliveryFieldChange = (
    field: keyof DoorDeliveryFormData,
    value: unknown
  ) => {
    setDoorDeliveryForm((prev) => ({ ...prev, [field]: value }));
    if (
      field === 'latitude' &&
      typeof value === 'string' &&
      isTrkLclGateRef.current
    ) {
      const newLat = value.trim();
      if (newLat && newLat !== prevDoorDeliveryLatRef.current) {
        setTimeout(() => warehouseTriggerRef.current('IO'), 0);
      }
      prevDoorDeliveryLatRef.current = newLat;
    }
  };

  const bulkUpdateTrucking = (data: {
    showPickupStack?: boolean;
    showDoorDeliverySection?: boolean;
    pickups?: number[];
    pickupForms?: Record<number, PickupDeliveryFormData>;
    truckingCargoRowsMap?: Record<number, InternalCargoRowData[]>;
    pickupTruckerForms?: Record<number, TruckerFormData>;
    pickupChargeMap?: Record<number, PickupCharge[]>;
    headerDataMap?: Record<number, HeaderData>;
    doorDeliveryForm?: DoorDeliveryFormData;
    doorDeliveryChargeRows?: PickupCharge[];
  }) => {
    setShowPickupStack(!!data.showPickupStack);
    setShowDoorDeliverySection(!!data.showDoorDeliverySection);
    setPickups(data.pickups?.length ? data.pickups : [0]);
    setTruckingPickupForms(data.pickupForms ?? {});
    setTruckingCargoRowsMap(data.truckingCargoRowsMap ?? {});
    setPickupTruckerForms(data.pickupTruckerForms ?? {});
    setPickupChargeMap(data.pickupChargeMap ?? {});
    setHeaderDataMap(data.headerDataMap ?? {});
    setDoorDeliveryForm(data.doorDeliveryForm ?? EMPTY_DOOR_DELIVERY);
    setDoorDeliveryChargeRows(data.doorDeliveryChargeRows ?? []);
  };

  const clearPickupValidation = () => setPickupValidationMessages([]);

  const handlePickupFormSync = (
    pickupId: number,
    partialData: Partial<PickupDetailsFormData>
  ) => {
    setPickupForms((prev) => ({
      ...prev,
      [pickupId]: {
        ...(prev[pickupId] ?? DEFAULT_PICKUP_FORM),
        ...partialData,
      },
    }));
    if (pickupId === 0 && isTrkLclGateRef.current) {
      const newLat = partialData.latitude?.trim() ?? '';
      if (newLat && newLat !== prevPickupLatRef.current) {
        setTimeout(() => warehouseTriggerRef.current('EO'), 0);
      }
      prevPickupLatRef.current = newLat;
    }
  };

  const handleTruckingPickupFormSync = (
    pickupId: number,
    formData: PickupDeliveryFormData
  ) => {
    setTruckingPickupForms((prev) => ({
      ...prev,
      [pickupId]: formData,
    }));
    if (pickupId === 0 && isTrkLclGateRef.current) {
      const newLat = formData.latitude?.trim() ?? '';
      if (newLat && newLat !== prevPickupLatRef.current) {
        setTimeout(() => warehouseTriggerRef.current('EO'), 0);
      }
      prevPickupLatRef.current = newLat;
    }
  };

  const handleTruckerFormSync = (
    pickupId: number,
    formData: TruckerFormData
  ) => {
    setPickupTruckerForms((prev) => ({
      ...prev,
      [pickupId]: formData,
    }));
  };

  const syncPickupFormToTrucking = (pf: PickupDetailsFormData) => {
    setTruckingPickupForms((prev) => ({
      ...prev,
      0: {
        ...(prev[0] ?? {}),
        pickupCargoAtCode: pf.pickupCargoAtCode,
        postalCodeCity: pf.postalCodeCity,
        name: pf.name,
        instructions: pf.instructions,
        streetAddress: pf.streetAddress,
        estimatedPickupDate: pf.estimatedPickupDate,
        contactName1: pf.contactName,
        contactPhone1: pf.contactPhone,
        contactEmail1: pf.contactEmail,
        latitude: pf.latitude,
        longitude: pf.longitude,
        country: pf.pickupCountry,
        state: pf.pickupState,
        zipCode: pf.pickupZipCode,
        city: pf.pickupCity,
        accessorials: pf.accessorials,
      } as PickupDeliveryFormData,
    }));
  };

  const handlePickupDialogClose = () => {
    setConfirmedPickupForms({ ...pickupForms });
    setConfirmedVersions((prev) => {
      const next = { ...prev };
      pickups.forEach((id) => {
        next[id] = (prev[id] ?? 0) + 1;
      });
      return next;
    });
    closePickupModal();
    setShowPickupStack(true);
    if (isTrkLclGateRef.current) {
      const pf = pickupForms[0];
      if (pf) flushSync(() => syncPickupFormToTrucking(pf));
      warehouseTriggerRef.current('EO');
    }
  };

  const handlePickupDialogConfirm = () => {
    const invalid = pickups.some((id) => !pickupForms[id]?.estimatedPickupDate);
    if (invalid) {
      setPickupValidationMessages(['Estimated Pickup Date is required.']);
      return;
    }
    setPickupValidationMessages([]);
    setConfirmedPickupForms({ ...pickupForms });
    setConfirmedVersions((prev) => {
      const next = { ...prev };
      pickups.forEach((id) => {
        next[id] = (prev[id] ?? 0) + 1;
      });
      return next;
    });
    handleDialogConfirm();
    setShowPickupStack(true);

    if (isTrkLclGateRef.current) {
      const pf = pickupForms[0];
      if (pf) {
        updateLocationField(
          setFormData,
          'placeOfReceiptPickupFromName',
          pf.pickupCity,
          pf.pickupState,
          pf.pickupZipCode
        );
        flushSync(() => syncPickupFormToTrucking(pf));
      }
      warehouseTriggerRef.current('EO');
    }
  };

  const handleDoorDeliveryDialogClose = () => {
    setDoorDeliveryDialogOpen(false);
    setShowDoorDeliverySection(true);
    setShowTruckingDetails(true);
    if (isTrkLclGateRef.current && doorDeliveryForm.latitude?.trim()) {
      setTimeout(() => warehouseTriggerRef.current('IO'), 0);
    }
  };

  const handleDoorDeliveryDialogOk = () => {
    setDoorDeliveryDialogOpen(false);
    setShowDoorDeliverySection(true);
    setShowTruckingDetails(true);
    if (isTrkLclGateRef.current) {
      updateLocationField(
        setFormData,
        'placeOfDeliveryName',
        doorDeliveryForm.doorDeliveryCity,
        doorDeliveryForm.doorDeliveryStateCode,
        doorDeliveryForm.doorDeliveryZipCode
      );
      if (doorDeliveryForm.latitude?.trim()) {
        setTimeout(() => warehouseTriggerRef.current('IO'), 0);
      }
    }
  };

  const handleCombinedDialogClose = () => {
    setConfirmedPickupForms({ ...pickupForms });
    setConfirmedVersions((prev) => {
      const next = { ...prev };
      pickups.forEach((id) => {
        next[id] = (prev[id] ?? 0) + 1;
      });
      return next;
    });
    setCombinedDialogOpen(false);
    setShowPickupStack(true);
    setShowDoorDeliverySection(true);
    setShowTruckingDetails(true);
    if (isTrkLclGateRef.current) {
      const pf = pickupForms[0];
      if (pf) flushSync(() => syncPickupFormToTrucking(pf));
      warehouseTriggerRef.current('EO');
      if (doorDeliveryForm.latitude?.trim()) {
        setTimeout(() => warehouseTriggerRef.current('IO'), 0);
      }
    }
  };

  const handleCombinedDialogOk = () => {
    const invalid = pickups.some((id) => !pickupForms[id]?.estimatedPickupDate);
    if (invalid) {
      setPickupValidationMessages(['Estimated Pickup Date is required.']);
      return;
    }
    setPickupValidationMessages([]);
    setConfirmedPickupForms({ ...pickupForms });
    setConfirmedVersions((prev) => {
      const next = { ...prev };
      pickups.forEach((id) => {
        next[id] = (prev[id] ?? 0) + 1;
      });
      return next;
    });
    setCombinedDialogOpen(false);
    setShowPickupStack(true);
    setShowDoorDeliverySection(true);
    setShowTruckingDetails(true);
    if (isTrkLclGateRef.current) {
      const pf = pickupForms[0];
      if (pf) {
        updateLocationField(
          setFormData,
          'placeOfReceiptPickupFromName',
          pf.pickupCity,
          pf.pickupState,
          pf.pickupZipCode
        );
        updateLocationField(
          setFormData,
          'placeOfDeliveryName',
          doorDeliveryForm.doorDeliveryCity,
          doorDeliveryForm.doorDeliveryStateCode,
          doorDeliveryForm.doorDeliveryZipCode
        );
        flushSync(() => syncPickupFormToTrucking(pf));
      }
      warehouseTriggerRef.current('EO');
      if (doorDeliveryForm.latitude?.trim()) {
        setTimeout(() => warehouseTriggerRef.current('IO'), 0);
      }
    }
  };

  // --- Terms suggestion hook ---
  const { data: termsSuggestions, setQuery: setTermsQuery } = useGetSuggestions(
    termsSuggestionConfig(loginClientBean)
  );

  // --- Vessel code suggestion hook ---
  const { data: vesselSuggestions, setQuery: setVesselQuery } =
    useGetSuggestions(vesselCodeSuggestionConfig(loginClientBean));

  const voyageInputRef = useRef<HTMLInputElement>(null);

  const { handleVesselCodeSelect, handlePreCarriageVesselSelect } =
    useVesselSelectHandlers({
      setFormData,
      onFocusVoyage: () => {
        voyageInputRef.current?.focus();
      },
    });

  const { data: carrierSuggestions, setQuery: setCarrierQuery } =
    useGetSuggestions(carrierCodeSuggestionConfig(loginClientBean));

  const handleCarrierCodeSelect = (item: Record<string, unknown>) => {
    setFormData((prev) => ({ ...prev, carrierCode: String(item.label ?? '') }));
    if (isTrkLclGate) {
      warehouseTriggerRef.current('EO');
      warehouseTriggerRef.current('IO');
    }
  };

  const {
    data: locationCountryCodeData,
    setQuery: setlocationCountryCodeQuery,
  } = useGetSuggestions(locationSuggestionConfig(loginClientBean));
  useEffect(() => {
    const code = formData.carrierCode;
    if (!code || code.includes(' - ') || !loginClientBean?.schema) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      ApiService.post<{ result: Record<string, string[]> }>(
        carrierCodeSuggestionConfig(loginClientBean).endpoint,
        {
          query: '%%%%',
          reference: 'carrierQuote',
          params: { officeSchemaName: loginClientBean.schema },
        }
      )
        .then((res) => {
          if (cancelled) return;
          const resultMap = res.data?.result ?? {};
          const matchedDesc = Object.keys(resultMap).find((desc) =>
            resultMap[desc]?.some((c) => c.toUpperCase() === code.toUpperCase())
          );
          if (matchedDesc) {
            setFormData((prev) =>
              prev.carrierCode === code
                ? { ...prev, carrierCode: matchedDesc }
                : prev
            );
          }
        })
        .catch(() => {});
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [formData.carrierCode, loginClientBean?.schema]);

  const locationConfig = locationSuggestionConfig(loginClientBean);

  const { data: porSuggestions, setQuery: setPorQuery } =
    useGetSuggestions(locationConfig);
  const { data: consolCfsSuggestions, setQuery: setConsolCfsQuery } =
    useGetSuggestions(locationConfig);
  const { data: polSuggestions, setQuery: setPolQuery } =
    useGetSuggestions(locationConfig);
  const { data: podSuggestions, setQuery: setPodQuery } =
    useGetSuggestions(locationConfig);
  const { data: deconCfsSuggestions, setQuery: setDeconCfsQuery } =
    useGetSuggestions(locationConfig);
  const { data: destCfsSuggestions, setQuery: setDestCfsQuery } =
    useGetSuggestions(locationConfig);
  const { data: podCodeSuggestions, setQuery: setPodCodeQuery } =
    useGetSuggestions(locationConfig);

  const [scheduleSearchOpen, setScheduleSearchOpen] = useState(false);

  const handleOpenScheduleSearch = () => setScheduleSearchOpen(true);
  const handleCloseScheduleSearch = () => setScheduleSearchOpen(false);
  const { getToggleValue } = useFeatureToggle();

  const handleScheduleBookThis = async (
    row: ScheduleRow,
    group: ScheduleGroup,
    _isAccurateRatesReset: string = 'YES'
  ) => {
    const parseIsoDate = (dateStr: string): Date | null => {
      if (!dateStr) return null;
      const [y, m, d] = dateStr.split('-').map(Number);
      if (!y || !m || !d) return null;
      return new Date(y, m - 1, d);
    };

    const rawVoyage = row.voyageCode.trim();
    const truncatedVoyage =
      rawVoyage.length > 10 ? rawVoyage.substring(0, 10) : rawVoyage;

    if (shipmentType === 'FCL' && moduleType === 'QUOTE') {
      setFormData((prev) => ({
        ...prev,
        vesselCode: row.imoNumber,
        vesselName: row.vesselName,
        voyage: truncatedVoyage,
        carrierCode: row.carrierScac,
        loadEts: parseIsoDate(row.etd),
        dischargeEta: parseIsoDate(row.eta),
        cargoReadDate: parseIsoDate(row.eta),
      }));

      setScheduleSearchOpen(false);

      if (!loginClientBean) return;

      // UN codes from the schedule row
      const porUnCode = row.scheduleOriginCode;
      const polUnCode = row.portOfLoadingCode;
      const podUnCode = row.portOfDischargeCode;
      const dstUnCode = row.scheduleDestinationCode;
      const transshipmentCodes = row.transshipmentPorts
        .map((p) => p.portCode)
        .filter(Boolean);

      const locationDetail = [
        porUnCode,
        polUnCode,
        podUnCode,
        dstUnCode,
        ...transshipmentCodes,
      ].filter(Boolean);

      const locationData = await fetchLocationData({
        locationDetail,
        loginBean: loginClientBean,
      });

      const por = locationData
        ? (findByUnlocationCode(locationData, porUnCode) ??
          findByUnlocationCode(locationData, group.originCode))
        : null;
      const pol = locationData
        ? findByUnlocationCode(locationData, polUnCode)
        : null;
      const pod = locationData
        ? (findByUnlocationCode(locationData, podUnCode) ??
          findByUnlocationCode(locationData, group.destinationCode))
        : null;
      const dst = locationData
        ? (findByUnlocationCode(locationData, dstUnCode) ??
          findByUnlocationCode(locationData, group.destinationCode))
        : null;

      const destCode = dst?.locationCode ?? group.destinationCode;
      const destName = dst?.locationName ?? row.destinationCityName;
      const destRegion = dst?.locationRegionCode ?? '';

      setFormData((prev) => ({
        ...prev,
        placeOfReceiptCode: por?.locationCode ?? group.originCode,
        placeOfReceiptName: por?.locationName ?? row.originCityName,
        placeOfReceiptRegion: por?.locationRegionCode ?? '',
        loadCode: pol?.locationCode ?? row.portOfLoadingCode,
        loadName: pol?.locationName ?? row.portOfLoadingName,
        loadRegion: pol?.locationRegionCode ?? '',
        dischargeCode: pod?.locationCode ?? '',
        dischargeName: pod?.locationName ?? row.portOfDischargeCityName,
        dischargeRegion: pod?.locationRegionCode ?? '',
        placeOfDeliveryCode: destCode,
        placeOfDeliveryName: destName,
        placeOfDeliveryRegion: destRegion,
        originUncode: por?.unlocationCode ?? '',
        loadUnCode: pol?.unlocationCode ?? '',
        dischargeUnCode: pod?.unlocationCode ?? '',
        deConsolidationUNCode: '',
        destinationUnCode: dst?.unlocationCode ?? '',
      }));
      // if (por?.locationCode || group.originCode) {
      //   dispatch(
      //     updatePreBookingMainDetails({
      //       handlingOffice: por?.locationCode ?? group.originCode,
      //     })
      //   );
      // }
    } else {
      const cutoffParts = row.cutOffDateTime
        ? row.cutOffDateTime.split(' ')
        : [];
      const cutoffDateStr = cutoffParts[0] ?? '';
      const cutoffTimeStr = formatTime(cutoffParts[1] ?? '', Number(getToggleValue(CommonToggleKeys.TIME_FORMAT)) === 12);

      const showDestInDischarge = isVisible(
        LclToggleKeys.SHOW_DESTINATION_IN_DISCHARGE
      );
      const portOfDischargeEtaStr = showDestInDischarge
        ? row.eta
        : row.portOfDischargeDate || row.eta;

      // Set non-location fields immediately — no UN codes touch the form here
      setFormData((prev) => ({
        ...prev,
        vesselCode: row.imoNumber,
        vesselName: row.vesselName,
        voyage: truncatedVoyage,
        carrierCode: row.carrierScac,
        portOfLoadingEts: parseIsoDate(row.etd),
        portOfDischargeEta: parseIsoDate(portOfDischargeEtaStr),
        cfsCutoffDate: parseIsoDate(cutoffDateStr),
        cfsCutoffTime: cutoffTimeStr,
        cargoReadDate: parseIsoDate(row.eta),
      }));

      setScheduleSearchOpen(false);

      if (!loginClientBean) return;

      // UN codes from the schedule row
      const porUnCode = row.scheduleOriginCode;
      const polUnCode = row.portOfLoadingCode;
      const podUnCode = showDestInDischarge
        ? row.scheduleDestinationCode
        : row.portOfDischargeCode;
      const dstUnCode = row.scheduleDestinationCode;
      const transshipmentCodes = row.transshipmentPorts
        .map((p) => p.portCode)
        .filter(Boolean);

      const locationDetail = [
        porUnCode,
        polUnCode,
        podUnCode,
        dstUnCode,
        ...transshipmentCodes,
      ].filter(Boolean);

      const locationData = await fetchLocationData({
        locationDetail,
        loginBean: loginClientBean,
      });

      const por = locationData
        ? (findByUnlocationCode(locationData, porUnCode) ??
          findByUnlocationCode(locationData, group.originCode))
        : null;
      const pol = locationData
        ? findByUnlocationCode(locationData, polUnCode)
        : null;
      const pod = locationData
        ? (findByUnlocationCode(locationData, podUnCode) ??
          findByUnlocationCode(locationData, group.destinationCode))
        : null;
      const dst = locationData
        ? (findByUnlocationCode(locationData, dstUnCode) ??
          findByUnlocationCode(locationData, group.destinationCode))
        : null;

      if (isTrkLclGate && dst?.locationCountryCode) {
        setDoorDeliveryForm((prev) => ({
          ...prev,
          doorDeliveryCountry: dst.locationCountryCode,
        }));
      }

      const transshipmentPorts = row.transshipmentPorts.map((p) => {
        const resolved = locationData
          ? findByUnlocationCode(locationData, p.portCode)
          : null;
        return {
          id: 1,
          portCode: resolved?.locationCode ?? p.portCode,
          portName: resolved?.locationName ?? '',
          eta: parseIsoDate(p.portDate),
        };
      });

      const destCfsAsDestination = isVisible(
        LclToggleKeys.DESTINATION_CFS_AS_DESTINATION
      );
      const copyPodIntoDestCfs = isVisible(
        LclToggleKeys.COPY_PLACE_OF_DELIVERY_INTO_DESTINATIONCFS
      );
      const destCode = dst?.locationCode ?? group.destinationCode;
      const destName = dst?.locationName ?? row.destinationCityName;
      const destRegion = dst?.unlocationCode ?? '';

      const destFormUpdate = destCfsAsDestination
        ? {
          destinationCfsCode: destCode,
          destinationCfsName: destName,
          destinationCfsRegion: destRegion,
          destinationCfsEta: parseIsoDate(row.eta),
          destinationCfsUnCode: dst?.unlocationCode ?? '',
        }
        : copyPodIntoDestCfs
          ? {
            destinationCfsCode: destCode,
            destinationCfsName: destName,
            destinationCfsRegion: destRegion,
            destinationCfsEta: parseIsoDate(row.eta),
            destinationCfsUnCode: dst?.unlocationCode ?? '',
            placeOfDeliveryCode: destCode,
            placeOfDeliveryName: destName,
            placeOfDeliveryRegion: destRegion,
            placeOfDeliveryUnCode: dst?.unlocationCode ?? '',
          }
          : {
            placeOfDeliveryCode: destCode,
            placeOfDeliveryName: destName,
            placeOfDeliveryRegion: destRegion,
            placeOfDeliveryUnCode: dst?.unlocationCode ?? '',
          };

      setFormData((prev) => ({
        ...prev,
        placeOfReceiptCode: por?.locationCode ?? group.originCode,
        placeOfReceiptName: por?.locationName ?? row.originCityName,
        placeOfReceiptRegion: por?.locationRegionCode ?? '',
        placeOfReceiptUnCode: por?.unlocationCode ?? '',
        portOfLoadingCode: pol?.locationCode ?? row.portOfLoadingCode,
        portOfLoadingName: pol?.locationName ?? row.portOfLoadingName,
        portOfLoadingRegion: pol?.locationRegionCode ?? '',
        portOfLoadingUnCode: pol?.unlocationCode ?? '',
        portOfDischargeCode: pod?.locationCode ?? '',
        portOfDischargeName: pod?.locationName ?? row.portOfDischargeCityName,
        portOfDischargeRegion: pod?.locationRegionCode ?? '',
        portOfDischargeUnCode: pod?.unlocationCode ?? '',
        ...destFormUpdate,
        ...(wwaTransshipmentEnabled && transshipmentPorts.length > 0
          ? { transshipmentPorts }
          : {}),
      }));
      if (por?.locationCode ?? group.originCode) {
        dispatch(
          updatePreBookingMainDetails({
            handlingOffice: por?.locationCode ?? group.originCode,
          })
        );
      }

      if (isTrkLclGate) {
        setTimeout(() => {
          warehouseTriggerRef.current('EO', true);
          warehouseTriggerRef.current('IO');
        }, 0);
      }
    }
  };

  const handleLocationCodeSelect = async (
    item: Record<string, unknown>,
    codeField: keyof RoutingFormData,
    nameField: keyof RoutingFormData,
    regionField: keyof RoutingFormData
  ) => {
    const code = String(item.code ?? '');
    const locationName = String(item.name ?? '');
    const isPickupPorSelect =
      codeField === 'placeOfReceiptCode' &&
      (formData.pickupNeeded === 'Y' || formData.pickupNeeded === 'T');

    flushSync(() => {
      setFormData((prev) => ({
        ...prev,
        [codeField]: code,
        [nameField]: locationName,
        [regionField]: String(item.locode ?? ''),
        ...(isPickupPorSelect
          ? { placeOfReceiptPickupToName: locationName }
          : {}),
      }));
      if (codeField === 'destinationCfsCode') {
        const locationCountry = String(item.country ?? '');
        if (locationCountry) {
          setDoorDeliveryForm((prev) => ({
            ...prev,
            doorDeliveryCountry: locationCountry,
          }));
        }
      }
    });

    if (shipmentType === 'FCL' && moduleType === 'QUOTE') {
      const locationDetail = [
        codeField === 'placeOfReceiptCode' ? item.locode : '',
        codeField === 'loadCode' ? item.locode : '',
        codeField === 'dischargeCode' ? item.locode : '',
        codeField === 'rampCode' ? item.locode : '',
        codeField === 'placeOfDeliveryCode' ? item.locode : '',
      ];
      const locationData = await fetchLocationData({
        locationDetail,
        loginBean: loginClientBean,
      });
      setFormData((prev) => ({
        ...prev,
        [regionField]: String(locationData?.[code]?.locationRegionCode ?? ''),
        ...(nameField === 'placeOfReceiptCode' && {
          originUncode: String(locationData?.[code]?.unlocationCode ?? ''),
        }),
        ...(nameField === 'loadCode' && {
          loadUnCode: String(locationData?.[code]?.unlocationCode ?? ''),
        }),
        ...(nameField === 'dischargeCode' && {
          dischargeUnCode: String(locationData?.[code]?.unlocationCode ?? ''),
        }),
        ...(nameField === 'rampCode' && {
          deConsolidationUNCode: String(
            locationData?.[code]?.unlocationCode ?? ''
          ),
        }),
        ...(nameField === 'placeOfDeliveryCode' && {
          destinationUnCode: String(locationData?.[code]?.unlocationCode ?? ''),
        }),
      }));
    }

    if (
      code &&
      isTrkLclGate &&
      (codeField === 'portOfLoadingCode' ||
        codeField === 'placeOfReceiptCode' ||
        codeField === 'portOfDischargeCode' ||
        codeField === 'destinationCfsCode')
    ) {
      warehouseTriggerRef.current('EO', codeField === 'placeOfReceiptCode');
      warehouseTriggerRef.current('IO');
    }
  };

  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const validateVesselOnTab = async ({
    value,
    data,
    onChange,
    showStatus,
  }: any) => {
    await wait(300);
    const typedValue = value?.trim()?.toUpperCase();
    if (!typedValue) {
      return;
    }

    const percentCount = (typedValue.match(/%/g) || []).length;
    const exactMatch = data?.find(
      (item: any) =>
        item?.code?.toString()?.toUpperCase?.() === typedValue ||
        item?.name?.toUpperCase?.() === typedValue
    );

    if (percentCount > 1) {
      onChange('vesselCode', 7725130);
      onChange('vesselName', 'FAST CHALLENGER');
      return;
    }

    if (exactMatch) {
      onChange('vesselCode', exactMatch.code);
      onChange('vesselName', exactMatch.name);
      return;
    }

    showStatus?.('warning', ['Please enter a valid Vessel Code']);
    onChange('vesselCode', '');
    onChange('vesselName', '');
    if (shipmentType === 'FCL') {
      setTimeout(() => {
        vesselCodeInputSelectionRef.current?.focus();
      }, 0);
    }
  };

  const validateTermsOnTab = async ({
    value,
    data,
    onChange,
    showStatus,
  }: any) => {
    await wait(300);
    const noPickupTerms = [
      'CFCF',
      'CFCY',
      'CYCF',
      'CYCY',
      'CYDR',
      'CYRA',
      'DRCY',
      'RACY',
      'RADR',
    ];

    const typedValue = value?.trim()?.toUpperCase();

    if (!typedValue) {
      return;
    }

    const percentCount = (typedValue.match(/%/g) || []).length;

    const exactMatch = data?.find(
      (item: any) =>
        item?.label?.toUpperCase?.() === typedValue ||
        item?.value?.toUpperCase?.() === typedValue
    );

    if (percentCount > 1 || exactMatch?.value === 'DRCF') {
      onChange('terms', 'DRCF');
      onChange('termsLabel', 'DOOR / CFS');
      setOpenPickupModal(true);
      setCombinedDialogOpen?.(false);
      setDoorDeliveryDialogOpen?.(false);
      onChange('pickupNeeded', 'T');
      onChange('placeOfDeliveryType', '-1');
      onChange('placeOfReceiptPickupTo', 'TO CFS');
      onChange('placeOfReceiptPickupFrom', 'DOOR');
      return;
    }

    if (exactMatch && noPickupTerms.includes(exactMatch.value)) {
      onChange('terms', exactMatch.value);
      onChange('termsLabel', exactMatch.label);
      setDoorDeliveryDialogOpen?.(false);
      setCombinedDialogOpen?.(false);
      setOpenPickupModal(false);
      onChange('pickupNeeded', 'N');
      onChange('placeOfDeliveryType', '-1');
      onChange('placeOfReceiptPickupTo', '');
      onChange('placeOfReceiptPickupFrom', '');
      return;
    }

    if (exactMatch?.value === 'DRDR') {
      onChange('terms', exactMatch.value);
      onChange('termsLabel', exactMatch.label);
      setCombinedDialogOpen?.(true);
      setDoorDeliveryDialogOpen?.(false);
      setOpenPickupModal(false);
      onChange('pickupNeeded', 'T');
      onChange('placeOfDeliveryType', 'DOOR');
      onChange('placeOfReceiptPickupTo', 'TO CFS');
      onChange('placeOfReceiptPickupFrom', 'DOOR');
      return;
    }

    if (exactMatch?.value === 'CFDR') {
      onChange('terms', exactMatch.value);
      onChange('termsLabel', exactMatch.label);
      setDoorDeliveryDialogOpen?.(true);
      setCombinedDialogOpen?.(false);
      setOpenPickupModal(false);
      onChange('pickupNeeded', 'N');
      onChange('placeOfDeliveryType', 'DOOR');
      onChange('placeOfReceiptPickupTo', '');
      onChange('placeOfReceiptPickupFrom', '');
      return;
    }

    showStatus?.('warning', ['Please enter a valid Terms']);
    onChange('terms', '');
    onChange('termsLabel', '');
    onChange('pickupNeeded', 'N');
    onChange('placeOfDeliveryType', '-1');
    onChange('placeOfReceiptPickupTo', '');
    onChange('placeOfReceiptPickupFrom', '');
  };

  const validateLocationOnTab = async ({
    value,
    data,
    codeKey,
    nameKey,
    regionKey,
    unCodeKey,
    label,
    onChange,
    showStatus,
    updateHandlingOffice,
  }: any) => {
    await wait(300);
    const typedValue = value?.trim()?.toUpperCase();
    if (!typedValue) {
      return;
    }
    const percentCount = (typedValue.match(/%/g) || []).length;
    const matchedItem = data?.find(
      (item: any) =>
        item?.code?.toString()?.toUpperCase?.() === typedValue ||
        item?.name?.toUpperCase?.() === typedValue
    );
    if (percentCount > 1) {
      onChange(codeKey, 'DUD');
      onChange(nameKey, 'DUDINGEN');
      onChange(regionKey, 'CH');
      onChange(unCodeKey, 'CHDIG');
      return;
    }

    if (matchedItem) {
      onChange(codeKey, matchedItem.code || '');
      onChange(nameKey, matchedItem.name || '');
      onChange(regionKey, matchedItem.country || '');
      onChange(unCodeKey, matchedItem.locode || '');
      if (
        codeKey === 'placeOfReceiptCode' ||
        codeKey === 'portOfDischargeCode' ||
        codeKey === 'destinationCfsCode'
      ) {
        updateHandlingOffice?.(codeKey, String(matchedItem.code || ''));
      }
      if (shipmentType === 'FCL' && moduleType === 'QUOTE') {
        const locationDetail = [
          codeKey === 'placeOfReceiptCode' ? matchedItem.locode : '',
          codeKey === 'loadCode' ? matchedItem.locode : '',
          codeKey === 'dischargeCode' ? matchedItem.locode : '',
          codeKey === 'rampCode' ? matchedItem.locode : '',
          codeKey === 'placeOfDeliveryCode' ? matchedItem.locode : '',
        ];
        const locationData = await fetchLocationData({
          locationDetail,
          loginBean: loginClientBean,
        });
        setFormData((prev) => ({
          ...prev,
          [regionKey]: String(
            locationData?.[matchedItem.code]?.locationRegionCode ?? ''
          ),
          ...(codeKey === 'placeOfReceiptCode' && {
            originUncode: String(
              locationData?.[matchedItem.code]?.unlocationCode ?? ''
            ),
          }),
          ...(codeKey === 'loadCode' && {
            loadUnCode: String(
              locationData?.[matchedItem.code]?.unlocationCode ?? ''
            ),
          }),
          ...(codeKey === 'dischargeCode' && {
            dischargeUnCode: String(
              locationData?.[matchedItem.code]?.unlocationCode ?? ''
            ),
          }),
          ...(codeKey === 'rampCode' && {
            deConsolidationUNCode: String(
              locationData?.[matchedItem.code]?.unlocationCode ?? ''
            ),
          }),
          ...(codeKey === 'placeOfDeliveryCode' && {
            destinationUnCode: String(
              locationData?.[matchedItem.code]?.unlocationCode ?? ''
            ),
          }),
        }));
      }

      return;
    }

    showStatus?.('warning', [`Please enter a valid ${label}`]);
    onChange(codeKey, '');
    onChange(nameKey, '');
    onChange(regionKey, '');
    onChange(unCodeKey, '');
    setTimeout(() => {
      if (codeKey === 'placeOfReceiptCode')
        placeOfReceiptInputLocationSelectionRef.current?.focus();
      if (codeKey === 'loadCode')
        loadInputLocationSelectionRef.current?.focus();
      if (codeKey === 'dischargeCode')
        dischargeInputLocationSelectionRef.current?.focus();
      if (codeKey === 'rampCode')
        deConsolidationCodeInputLocationSelectionRef.current?.focus();
      if (codeKey === 'placeOfDeliveryCode')
        destinationInputLocationSelectionRef.current?.focus();
    }, 0);
  };

  const clearDoorDelivery = () => setDoorDeliveryForm(EMPTY_DOOR_DELIVERY);

  const resetRouting = () => {
    setFormData({
      ...getInitialRoutingData(),
      ...(isQuoteLcl ? { warehouse: 'TEMP', warehouseName: 'TEMP WAREHOUSE' } : {}),
    });
    setPickUpValue('N');
    setOpenPickupModal(false);
    setShowTruckingDetails(false);
    setPickups([0]);
    setPickupForms({
      0: {
        ...DEFAULT_PICKUP_FORM,
        ...(isQuoteLcl && {
          pickupCountry:
            loginClientBean?.countryCode && loginClientBean?.country
              ? `${loginClientBean.countryCode} - ${loginClientBean.country}`
              : DEFAULT_PICKUP_FORM.pickupCountry,
          estimatedPickupDate: new Date(),
        }),
      },
    });
    setCollapsedSet(new Set());
    setOpenDialog(false);
    setRemoveIndex(null);
    setOrgSearchOpenSet(new Set());
    setDoorDeliveryDialogOpen(false);
    setCombinedDialogOpen(false);
    setDoorDeliveryCollapsed(false);
    setShowPickupStack(false);
    setShowDoorDeliverySection(false);
    setDoorDeliveryForm(EMPTY_DOOR_DELIVERY);
    setTruckingPickupForms({});
    setTruckingCargoRowsMap({});
    setPickupTruckerForms({});
    setPickupChargeMap({});
    setHeaderDataMap({});
    setDoorDeliveryChargeRows([]);
    setPickupValidationMessages([]);
    setConfirmedPickupForms({});
    setConfirmedVersions({});
    setShowDeliveryType(false);
    setIsFromTermsHandler(false);
    isFromTermsHandlerRef.current = false;
  };

  const { handlePickupChange } = usePickupChangeHandlers(
    {
      formData,
      moduleType,
      shipmentType,
      isTMSLinked:
        String(loginClientBean?.isTMSLinked ?? '').toUpperCase() === 'YES',
      isFromTermsHandlerRef,
      featureToggle,
    },
    {
      setFormData,
      setPickUpValue,
      setShowPickupStack,
      setShowDoorDeliverySection,
      setOpenPickupModal,
      setCombinedDialogOpen,
      setShowTruckingDetails,
      clearPickupDetails,
      onShowHideStandardDimensions: () => {},
      onMultiCargoTmsDimShowHide: () => {},
      onShowMultStackingType: () => {},
      onModifyUIForQuoteRate: () => {},
      onSetMandatoryRoutingStyles: () => {},
      onShowHideFetchRatesButton: () => {},
      onCargoMandatoryStyle: () => {},
      onSetPickupTentativeDateFromCreatedOn: () => {},
      onShowUnlockTruckerButton: () => {},
      setFromTermsHandlerFlag: setIsFromTermsHandler,
    }
  );

  const { handleCarriageTypeChange, handleCarriageTypeKeyDown } =
    useCarriageTypeChangeHandlers({
      setFormData,
      onNavigateToPreviousSection: () => {},
    });

  const { handleDeliveryTypeChange } = useDeliveryTypeChangeHandlers(
    {
      formData,
      moduleType,
      shipmentType,
      isTMSLinked:
        String(loginClientBean?.isTMSLinked ?? '').toUpperCase() === 'YES',
      isFromTermsHandlerRef,
      featureToggle,
    },
    {
      setFormData,
      setShowDoorDeliverySection,
      setDoorDeliveryDialogOpen,
      setCombinedDialogOpen,
      clearDoorDelivery,
      onShowHideStandardDimensions: () => {},
      onSaveDoorDeliveryToParams: () => {},
      onModifyUIForQuoteRate: () => {},
      onShowHideFetchRatesButton: () => {},
      onSetPickupTentativeDateFromCreatedOn: () => {},
      onPlaceOfDeliveryLocationSearch: () => {},
      setFromTermsHandlerFlag: setIsFromTermsHandler,
    }
  );

  const { handleTermsSelect } = useTermsDeliveryHandlers(
    {
      formData,
      showDeliveryType,
      moduleType,
      shipmentType,
      isTMSLinked:
        String(loginClientBean?.isTMSLinked ?? '').toUpperCase() === 'YES',
      featureToggle,
    },
    {
      setFormData,
      setShowDeliveryType,
      setShowPickupStack,
      setShowDoorDeliverySection,
      setOpenPickupModal,
      setDoorDeliveryDialogOpen,
      setCombinedDialogOpen,
      clearDoorDelivery,
      onSaveDoorDeliveryToParams: () => {},
      onShowHideFetchRatesButton: () => {},
      onSetMandatoryRoutingStyles: () => {},
      onShowHideStandardDimensions: () => {},
      onMultiCargoTmsDimShowHide: () => {},
      onShowMultStackingType: () => {},
      onModifyUIForQuoteRate: () => {},
      onCargoMandatoryStyle: () => {},
      onSetPickupTentativeDateFromCreatedOn: () => {},
      setFromTermsHandlerFlag: setIsFromTermsHandler,
      onDeliveryTypeTriggered: (deliveryType: string) => {
        handleDeliveryTypeChange(deliveryType);
      },
      onPickupValueTriggered: (pickupValue: string) => {
        handlePickupChange(pickupValue);
      },
    }
  );

  const handlePreCarriageBySelect = (item: Record<string, unknown>) => {
    setFormData((prev) => ({
      ...prev,
      preCarriageBy: String(item.name ?? ''),
    }));
  };

  const carriageListBoxAddKeyDownHandler = (event: React.KeyboardEvent) => {
    if (event.shiftKey && event.key === 'Tab') {
      event.preventDefault();
      event.stopPropagation();
      toggleShowCustomerDetailsStack(true);
      setTimeout(() => {
        customerDetailsStackMoreDetailsRef.current?.focus();
      }, 100);
    }
  };

  const MONTHS = [
    'JAN',
    'FEB',
    'MAR',
    'APR',
    'MAY',
    'JUN',
    'JUL',
    'AUG',
    'SEP',
    'OCT',
    'NOV',
    'DEC',
  ];

  const MONTH_MAP = MONTHS.reduce(
    (acc, m, i) => {
      acc[m] = i;
      return acc;
    },
    {} as Record<string, number>
  );

  const validateDate = (day: number, month: string, year: number) => {
    if (!Number.isInteger(day) || !Number.isInteger(year)) return false;
    if (year < 1000) return false;

    const monthIndex = MONTH_MAP[month];
    if (!monthIndex) return false;

    const maxDays = dayjs(`${year}-${monthIndex}-01`).daysInMonth();
    return day >= 1 && day <= maxDays;
  };

  const parseDateParts = (input: string) => {
    let clean = input.toUpperCase();

    if (clean.includes('-')) {
      const parts = clean.split('-');
      clean = parts.join('');
    }

    const len = clean.length;

    if (len === 6) {
      const day = clean.slice(0, 2);
      const monthNum = Number(clean.slice(2, 4));
      const yearSuffix = clean.slice(4);

      if (monthNum < 1 || monthNum > 12) return null;

      const fullYear =
        new Date().getFullYear().toString().slice(0, 2) + yearSuffix;

      return {
        day,
        month: MONTHS[monthNum - 1],
        year: fullYear,
      };
    }

    if (len === 8 || len === 9) {
      const dayLen = len === 9 ? 2 : 1;

      return {
        day: clean.slice(0, dayLen),
        month: clean.slice(dayLen, dayLen + 3),
        year: clean.slice(dayLen + 3),
      };
    }

    return null;
  };

  const convertDateFormatToDefault = (dateString: string) => {
    if (!dateString) return { valid: false, formatted: '' };

    const parts = parseDateParts(dateString);
    if (!parts) return { valid: false, formatted: '' };

    const day = Number(parts.day);
    const year = Number(parts.year);

    if (!validateDate(day, parts.month, year)) {
      return { valid: false, formatted: '' };
    }

    return {
      valid: true,
      formatted: `${parts.day}-${parts.month}-${parts.year}`,
    };
  };

  const validateInputDate = (dateString: string): boolean => {
    if (!dateString) return false;

    const converted = convertDateFormatToDefault(dateString);

    if (converted.valid) {
      return true;
    }

    let dateText = '';
    let monthText = '';
    let yearText = '';

    if (dateString.includes('-')) {
      const clean = dateString.toUpperCase();

      if (clean.length === 11) {
        dateText = clean.substring(0, 2);
        monthText = clean.substring(3, 6);
        yearText = clean.substring(7, 11);
      } else if (clean.length === 10) {
        dateText = clean.substring(0, 1);
        monthText = clean.substring(2, 5);
        yearText = clean.substring(6, 10);
      } else {
        return false;
      }

      return validateDate(Number(dateText), monthText, Number(yearText));
    }

    if (dateString.length === 6) {
      dateText = dateString.substring(0, 2);
      let monthNum = Number(dateString.substring(2, 4));

      if (monthNum < 1 || monthNum > 12) {
        return false;
      }

      monthText = MONTHS[monthNum - 1];

      const yearSuffix = dateString.substring(4);
      const currentYearPrefix = new Date().getFullYear().toString().slice(0, 2);
      yearText = currentYearPrefix + yearSuffix;

      return validateDate(Number(dateText), monthText, Number(yearText));
    }

    return false;
  };

  // const checkDateValidation = ({
  //   dateString,
  //   setInputValue,
  //   onDateSelection,
  //   setErrorMessage,
  // }: CheckDateValidationParams): boolean => {
  //   const formatDate = (date: Date): string => {
  //     const day = date.getDate().toString().padStart(2, '0');
  //     const month = date.toLocaleString('en-GB', { month: 'short' }).toUpperCase(); // "APR"
  //     const year = date.getFullYear();
  //     return `${day}-${month}-${year}`;
  //   };

  //   try {
  //     if (dateString.trim().length > 0) {
  //       if (validateInputDate(dateString)) {
  //         const formatted = convertDateFormatToDefault(dateString);

  //         if (!formatted.valid) {
  //           return false;
  //         }

  //         const [day, month, year] = formatted.formatted.split("-");

  //         const calenderDate = new Date(
  //           Number(year),
  //           MONTH_MAP[month],
  //           Number(day)
  //         );

  //         const formattedDate = formatDate(calenderDate);

  //         setInputValue?.(new Date(formattedDate));

  //         if (onDateSelection) {
  //           onDateSelection(calenderDate);

  //           if (formattedDate.trim().length > 0) {
  //             return true;
  //           } else {
  //             return false;
  //           }
  //         }

  //         return true;
  //       } else {
  //         setInputValue?.(null);
  //         setErrorMessage?.("Please enter the date in the format of DD-MON-YYYY")
  //       }
  //       return false;
  //     }
  //     return true;
  //   } catch (e) {

  //     setInputValue?.(null);
  //     setErrorMessage?.("Please enter the date in the format of DD-MON-YYYY");
  //     return false;
  //   }
  // }

  const datePickerKeyDownHandler = (
    event: React.KeyboardEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    /* Place Of Receipt ETD Start */
    if (fieldName === 'placeOfReceiptEtd') {
      if (event.key === 'Enter') {
        setSkipNextBlurValidation(true);
        const origineEtdDate = (event.target as HTMLInputElement).value;
        let updatedorigineEtdDate: Date | null = null;

        if (
          origineEtdDate != '' &&
          checkDateValidation({
            dateString: origineEtdDate,
            setInputValue: (val) => {
              setFormData((prev) => ({ ...prev, [fieldName]: val }));
              updatedorigineEtdDate = val;
              toggleErrorMessageModal(false);
              setDatePickerErrorMessage('');
            },
            setErrorMessage: (val) => {
              toggleErrorMessageModal(true);
              setDatePickerErrorMessage(val);
            },
            onDateSelection: (val) => {
              dateSelectionHandler(val, fieldName);
            },
          })
        ) {
          if (updatedorigineEtdDate != null) {
            const dateToCompare = new Date(updatedorigineEtdDate);

            if (
              dateToCompare < new Date(before) ||
              dateToCompare > new Date(after)
            ) {
              // showStatus('warning', [`The ETD (Place of Receipt) should be within ${periodOfDays} days from today.`]);
              setTimeout(() => {
                setFormData((prev) => ({ ...prev, [fieldName]: null }));
                origineEtdDateRef.current?.focus();
              }, 0);
              event.preventDefault();
              event.stopPropagation();
            } else if (
              moduleType === 'BKG' &&
              isVisible(CommonToggleKeys.ALLOW_FCL_BOOKING_EDI_TO_INTTRA) &&
              shipmentType === 'FCL' &&
              formData.carrierPlaceOfReceiptEtaDate !== undefined &&
              formData.carrierPlaceOfReceiptEtaDate !== null
            ) {
              if (
                checkDateValidation({
                  dateString: formData.carrierPlaceOfReceiptEtaDate
                    .toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                    .replace(/ /g, '-'),
                })
              ) {
                if (
                  new Date(formData.carrierPlaceOfReceiptEtaDate) <
                  new Date(updatedorigineEtdDate)
                ) {
                  // showStatus('warning', [`The ETD (Place of Receipt) should be less than or equal to the ETD (Carrier Place Of Receipt).`]);
                  setTimeout(() => {
                    setFormData((prev) => ({ ...prev, [fieldName]: null }));
                    origineEtdDateRef.current?.focus();
                  }, 0);
                  event.preventDefault();
                  event.stopPropagation();
                }
              }
            } else if (formData.loadEts !== null) {
              if (
                checkDateValidation({
                  dateString: formData.loadEts
                    .toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                    .replace(/ /g, '-'),
                })
              ) {
                if (
                  new Date(formData.loadEts) < new Date(updatedorigineEtdDate)
                ) {
                  // showStatus('warning', [`The ETD (Place of Receipt) should be less than or equal to the ETS.`]);
                  setTimeout(() => {
                    setFormData((prev) => ({ ...prev, [fieldName]: null }));
                    origineEtdDateRef.current?.focus();
                  }, 0);
                  event.preventDefault();
                  event.stopPropagation();
                }
              }
            } else if (formData.loadEts !== null) {
              if (
                checkDateValidation({
                  dateString: formData.loadEts
                    .toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                    .replace(/ /g, '-'),
                })
              ) {
                if (
                  new Date(formData.loadEts) < new Date(updatedorigineEtdDate)
                ) {
                  showStatus('warning', [
                    `The ETD (Place of Receipt) should be less than or equal to the ETS.`,
                  ]);
                  setTimeout(() => {
                    setFormData((prev) => ({ ...prev, [fieldName]: null }));
                    origineEtdDateRef.current?.focus();
                  }, 0);
                  event.preventDefault();
                  event.stopPropagation();
                }
              }
            } else {
              setTimeout(() => {
                loadInputLocationSelectionRef.current?.focus();
              }, 0);
              event.preventDefault();
              event.stopPropagation();
            }
          }
        }
      }
    }
    /* Place Of Receipt ETD End */

    /* Discharge Code ETA Start */
    if (fieldName === 'dischargeEta') {
      if (isVisible(CommonToggleKeys.OCN_ROUTING_DETAILS_FIELD_POPULATE)) {
        setTimeout(() => {
          setFormData((prev) => ({
            ...prev,
            placeOfDeliveryEta: (event.target as HTMLInputElement).value,
            carrierPlaceOfDeliveryEtaDate: (event.target as HTMLInputElement)
              .value,
          }));
        }, 0);
      }

      if (formData.placeOfDeliveryEta != null) {
        if (
          new Date(formData.placeOfDeliveryEta) <
          new Date((event.target as HTMLInputElement).value)
        ) {
          setTimeout(() => {
            setFormData((prev) => ({ ...prev, placeOfDeliveryEta: null }));
          }, 0);
        }
      }

      if (
        moduleType === 'BKG' &&
        shipmentType === 'FCL' &&
        isVisible(CommonToggleKeys.SHOW_CARRIER_PLACE_OF_DELIVERY_IN_BOOKING) &&
        formData.carrierPlaceOfDeliveryEtaDate != undefined &&
        formData.carrierPlaceOfDeliveryEtaDate != null
      ) {
        if (
          new Date(formData.carrierPlaceOfDeliveryEtaDate) <
          new Date((event.target as HTMLInputElement).value)
        ) {
          setTimeout(() => {
            setFormData((prev) => ({
              ...prev,
              carrierPlaceOfDeliveryEtaDate: null,
            }));
          }, 0);
        }
      }

      if (event.key === 'Enter') {
        setSkipNextBlurValidation(true);
        const etaDate = (event.target as HTMLInputElement).value;
        let updatedETADate: Date | null = null;

        if (etaDate !== null && etaDate !== '') {
          if (
            checkDateValidation({
              dateString: etaDate,
              setInputValue: (val) => {
                setFormData((prev) => ({ ...prev, [fieldName]: val }));
                updatedETADate = val;
                toggleErrorMessageModal(false);
                setDatePickerErrorMessage('');
              },
              setErrorMessage: (val) => {
                toggleErrorMessageModal(true);
                setDatePickerErrorMessage(val);
              },
              onDateSelection: (val) => {
                dateSelectionHandler(val, fieldName);
              },
            })
          ) {
            const arrivalDate = new Date(updatedETADate);

            if (
              arrivalDate < new Date(before) ||
              arrivalDate > new Date(after)
            ) {
              // showStatus('warning', [`The ETA (Discharge) should be within ${periodOfDays} days from today.`]);
              setTimeout(() => {
                setFormData((prev) => ({ ...prev, [fieldName]: null }));
                etaDateRef.current?.focus();
              }, 0);
              if (
                isVisible(CommonToggleKeys.OCN_ROUTING_DETAILS_FIELD_POPULATE)
              ) {
                setTimeout(() => {
                  setFormData((prev) => ({
                    ...prev,
                    placeOfDeliveryEta: null,
                    carrierPlaceOfDeliveryEtaDate: null,
                  }));
                }, 0);
              }
              event.preventDefault();
              event.stopPropagation();
            }

            if (formData.loadEts !== null) {
              if (
                checkDateValidation({
                  dateString: formData.loadEts
                    .toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                    .replace(/ /g, '-'),
                })
              ) {
                if (
                  new Date(arrivalDate).setHours(0, 0, 0, 0) <
                  new Date(formData.loadEts).setHours(0, 0, 0, 0)
                ) {
                  // showStatus('warning', [`The ETA (Discharge) should be greater than or equal to the ETS.`]);
                  setTimeout(() => {
                    setFormData((prev) => ({ ...prev, [fieldName]: null }));
                    etaDateRef.current?.focus();
                  }, 0);
                  if (
                    isVisible(
                      CommonToggleKeys.OCN_ROUTING_DETAILS_FIELD_POPULATE
                    )
                  ) {
                    setTimeout(() => {
                      setFormData((prev) => ({
                        ...prev,
                        placeOfDeliveryEta: null,
                        carrierPlaceOfDeliveryEtaDate: null,
                      }));
                    }, 0);
                  }
                  event.preventDefault();
                  event.stopPropagation();
                }
              }
            }
          } else {
            setTimeout(() => {
              deConsolidationCodeInputLocationSelectionRef.current?.focus();
            }, 0);
            event.preventDefault();
            event.stopPropagation();
          }
        }
      }
    }
    /* Discharge Code ETA End */

    /* Place of Delivery Code ETA Start*/
    if (fieldName === 'placeOfDeliveryEta') {
      if (event.key === 'Enter') {
        setSkipNextBlurValidation(true);
        const etaDestinationDate = (event.target as HTMLInputElement).value;
        let updatedETADestinationDate: Date | null = null;

        if (etaDestinationDate !== null && etaDestinationDate !== '') {
          if (
            checkDateValidation({
              dateString: etaDestinationDate,
              setInputValue: (val) => {
                setFormData((prev) => ({ ...prev, [fieldName]: val }));
                updatedETADestinationDate = val;
                toggleErrorMessageModal(false);
                setDatePickerErrorMessage('');
              },
              setErrorMessage: (val) => {
                toggleErrorMessageModal(true);
                setDatePickerErrorMessage(val);
              },
              onDateSelection: (val) => {
                dateSelectionHandler(val, fieldName);
              },
            })
          ) {
            if (updatedETADestinationDate != null) {
              const dateToCompare = new Date(updatedETADestinationDate);

              if (
                dateToCompare < new Date(before) ||
                dateToCompare > new Date(after)
              ) {
                // showStatus('warning', [`The ETA (Destination) should be within ${periodOfDays} days from today.`]);
                setTimeout(() => {
                  setFormData((prev) => ({ ...prev, [fieldName]: null }));
                  etaDestinationDateRef.current?.focus();
                }, 0);
                event.preventDefault();
                event.stopPropagation();
              }

              if (formData.dischargeEta !== null) {
                if (
                  new Date(dateToCompare).setHours(0, 0, 0, 0) <
                  new Date(formData.dischargeEta).setHours(0, 0, 0, 0)
                ) {
                  // showStatus('warning', [`The ETA (Destination) should be greater than or equal to the ETA (Discharge).`]);
                  setTimeout(() => {
                    setFormData((prev) => ({ ...prev, [fieldName]: null }));
                    etaDestinationDateRef.current?.focus();
                  }, 0);
                  event.preventDefault();
                  event.stopPropagation();
                }
              }

              if (
                moduleType === 'BKG' &&
                shipmentType === 'FCL' &&
                isVisible(
                  CommonToggleKeys.SHOW_CARRIER_PLACE_OF_DELIVERY_IN_BOOKING
                ) &&
                formData.placeOfDeliveryEta != null &&
                formData.carrierPlaceOfDeliveryEtaDate != undefined &&
                formData.carrierPlaceOfDeliveryEtaDate != null
              ) {
                if (
                  new Date(dateToCompare).setHours(0, 0, 0, 0) <
                  new Date(formData.carrierPlaceOfDeliveryEtaDate).setHours(
                    0,
                    0,
                    0,
                    0
                  )
                ) {
                  // showStatus('warning', [`The ETA (Place of Delivery) should be greater than or equal to the ETA (Carrier Place of Delivery).`]);
                  setTimeout(() => {
                    setFormData((prev) => ({ ...prev, [fieldName]: null }));
                    etaDestinationDateRef.current?.focus();
                  }, 0);
                  event.preventDefault();
                  event.stopPropagation();
                }
              }
            }
          }
        }
      }
    }
    /* Place of Delivery Code ETA End*/

    /* Load Code ETA End*/
    if (fieldName === 'loadEts') {
      if (event.key === 'Enter') {
        setSkipNextBlurValidation(true);
        const etsDestinationDate = (event.target as HTMLInputElement).value;
        let updateETSDestinationDate: Date | null = null;
        if (etsDestinationDate != null && etsDestinationDate != '') {
          if (
            checkDateValidation({
              dateString: etsDestinationDate,
              setInputValue: (val) => {
                setFormData((prev) => ({ ...prev, [fieldName]: val }));
                updateETSDestinationDate = val;
                toggleErrorMessageModal(false);
                setDatePickerErrorMessage('');
              },
              setErrorMessage: (val) => {
                toggleErrorMessageModal(true);
                setDatePickerErrorMessage(val);
              },
              onDateSelection: (val) => {
                dateSelectionHandler(val, fieldName);
              },
            })
          ) {
            if (updateETSDestinationDate != null) {
              const dateToCompare = new Date(updateETSDestinationDate);

              if (
                dateToCompare < new Date(before) ||
                dateToCompare > new Date(after)
              ) {
                // showStatus('warning', [`The ETS should be within ${periodOfDays} days from today.`]);
                setTimeout(() => {
                  setFormData((prev) => ({ ...prev, [fieldName]: null }));
                  etsDateRef.current?.focus();
                }, 0);
                event.preventDefault();
                event.stopPropagation();
              }

              if (
                moduleType === 'BKG' &&
                shipmentType === 'FCL' &&
                isVisible(CommonToggleKeys.ALLOW_FCL_BOOKING_EDI_TO_INTTRA) &&
                formData.carrierPlaceOfDeliveryEtaDate != undefined &&
                formData.carrierPlaceOfDeliveryEtaDate != null
              ) {
                if (
                  dateToCompare.setHours(0, 0, 0, 0) <
                  formData.carrierPlaceOfDeliveryEtaDate.setHours(0, 0, 0, 0)
                ) {
                  showStatus('warning', [
                    `The ETS should be greater than or equal to the ETD for Carrier Place Of Receipt.`,
                  ]);
                  setTimeout(() => {
                    setFormData((prev) => ({ ...prev, [fieldName]: null }));
                    etsDateRef.current?.focus();
                  }, 0);
                  event.preventDefault();
                  event.stopPropagation();
                }
              } else if (formData.placeOfReceiptEtd !== null) {
                if (
                  dateToCompare.setHours(0, 0, 0, 0) <
                  formData.placeOfReceiptEtd.setHours(0, 0, 0, 0)
                ) {
                  // showStatus('warning', [`The ETS should be greater than or equal to the ETD for Origin.`]);
                  setTimeout(() => {
                    setFormData((prev) => ({ ...prev, [fieldName]: null }));
                    etsDateRef.current?.focus();
                  }, 0);
                  event.preventDefault();
                  event.stopPropagation();
                }
              }

              if (formData.dischargeEta !== null) {
                if (
                  dateToCompare.setHours(0, 0, 0, 0) >
                  formData.dischargeEta.setHours(0, 0, 0, 0)
                ) {
                  // showStatus('warning', [`The ETS should be less than or equal to the ETA.`]);
                  setTimeout(() => {
                    setFormData((prev) => ({ ...prev, [fieldName]: null }));
                    etsDateRef.current?.focus();
                  }, 0);
                  event.preventDefault();
                  event.stopPropagation();
                }
              }

              setFormData((prev) => ({ ...prev, sailDate: dateToCompare }));
              if (formData[fieldName] != dateToCompare.setHours(0, 0, 0, 0)) {
                setFormData((prev) => ({
                  ...prev,
                  callAccurate: !prev.callAccurate,
                }));
              }
            }
          }
        } else {
          setTimeout(() => {
            dischargeInputLocationSelectionRef.current?.focus();
          }, 0);
          event.preventDefault();
          event.stopPropagation();
        }
      }
    }
    /* Load Code ETA End*/
  };

  const datePickerOnBlurHandler = (
    event: React.KeyboardEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    if (
      (event.target as HTMLInputElement).value != undefined &&
      (event.target as HTMLInputElement).value != '' &&
      (event.target as HTMLInputElement).value != null
    ) {
      setSkipNextBlurValidation(true);
      checkDateValidation({
        dateString: (event.target as HTMLInputElement).value,
        setInputValue: (val) => {
          setFormData((prev) => ({ ...prev, [fieldName]: val }));
          toggleErrorMessageModal(false);
          setDatePickerErrorMessage('');
        },
        setErrorMessage: (val) => {
          toggleErrorMessageModal(true);
          setDatePickerErrorMessage(val);
        },
        onDateSelection: (val) => {
          dateSelectionHandler(val, fieldName);
        },
      });
    }
  };

  const dateSelectionHandler = (
    selectedDate: Date | null,
    fieldName: string
  ) => {
    if (selectedDate != null) {
      const dateToCompare = new Date(selectedDate);
      if (fieldName === 'placeOfReceiptEtd') {
        let navigateLodeWidget = false;
        let navigateCarrierPlaceOfReceiptDate = false;
        if (
          dateToCompare < new Date(before) ||
          dateToCompare > new Date(after)
        ) {
          showStatus('warning', [
            `The ETD (Place of Receipt) should be within ${periodOfDays} days from today.`,
          ]);
          setTimeout(() => {
            setFormData((prev) => ({ ...prev, [fieldName]: null }));
            origineEtdDateRef.current?.focus();
          }, 0);
          navigateLodeWidget = true;
        }

        if (
          moduleType === 'BKG' &&
          isVisible(CommonToggleKeys.ALLOW_FCL_BOOKING_EDI_TO_INTTRA) &&
          shipmentType === 'FCL' &&
          formData.carrierPlaceOfReceiptEtaDate !== undefined &&
          formData.carrierPlaceOfReceiptEtaDate !== null
        ) {
          if (
            new Date(formData.carrierPlaceOfReceiptEtaDate) <
            new Date(dateToCompare)
          ) {
            showStatus('warning', [
              `The ETD (Place of Receipt) should be less than or equal to the ETD (Carrier Place Of Receipt).`,
            ]);
            setTimeout(() => {
              setFormData((prev) => ({ ...prev, [fieldName]: null }));
              origineEtdDateRef.current?.focus();
            }, 0);
            navigateLodeWidget = true;
            navigateCarrierPlaceOfReceiptDate = true;
          }
        }

        if (formData.loadEts !== null) {
          if (
            checkDateValidation({
              dateString: formData.loadEts
                .toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })
                .replace(/ /g, '-'),
            })
          ) {
            if (new Date(formData.loadEts) < dateToCompare) {
              showStatus('warning', [
                `The ETD (Place of Receipt) should be less than or equal to the ETS.`,
              ]);
              setTimeout(() => {
                setFormData((prev) => ({ ...prev, [fieldName]: null }));
                origineEtdDateRef.current?.focus();
              }, 0);
              navigateLodeWidget = true;
            }
          }
        }

        if (
          (moduleType === 'QUOTE' &&
            shipmentType === 'FCL' &&
            isVisible(CommonToggleKeys.PULL_ACCURATE_DATA_ETD_QUOTE)) ||
          (moduleType === 'BKG' &&
            shipmentType === 'FCL' &&
            isVisible(CommonToggleKeys.PULL_ACCURATE_DATA_ETD_QUOTE))
        ) {
          if (formData[fieldName] != dateToCompare.setHours(0, 0, 0, 0)) {
            setFormData((prev) => ({
              ...prev,
              callAccurate: !prev.callAccurate,
            }));
          }
        }

        if (
          moduleType === 'BKG' &&
          shipmentType === 'FCL' &&
          isVisible(CommonToggleKeys.ALLOW_FCL_BOOKING_EDI_TO_INTTRA) &&
          formData.carrierPlaceOfReceiptEtaDate !== undefined &&
          formData.carrierPlaceOfReceiptEtaDate !== null &&
          !navigateCarrierPlaceOfReceiptDate
        ) {
          setTimeout(() => {
            carrierPlaceOfReceiptCodeInputLocationSelectionRef.current?.focus();
          }, 0);
        } else if (!navigateLodeWidget) {
          setTimeout(() => {
            loadInputLocationSelectionRef.current?.focus();
          }, 0);
        }
        navigateCarrierPlaceOfReceiptDate = false;
        navigateLodeWidget = false;
      } else if (fieldName === 'rampEta') {
        setTimeout(() => {
          destinationInputLocationSelectionRef.current?.focus();
        }, 0);
      } else if (fieldName === 'dischargeEta') {
        let isRedirectToRampCodeInputLocationSelection = true;
        if (isVisible(CommonToggleKeys.OCN_ROUTING_DETAILS_FIELD_POPULATE)) {
          setTimeout(() => {
            setFormData((prev) => ({
              ...prev,
              placeOfDeliveryEta: selectedDate,
              carrierPlaceOfDeliveryEtaDate: selectedDate,
            }));
          }, 0);
        }
        if (formData.placeOfDeliveryEta != null) {
          if (new Date(formData.placeOfDeliveryEta) < new Date(selectedDate)) {
            setTimeout(() => {
              setFormData((prev) => ({ ...prev, placeOfDeliveryEta: null }));
              etaDateRef.current?.focus();
            }, 0);
            isRedirectToRampCodeInputLocationSelection = false;
          }
        }

        if (
          moduleType === 'BKG' &&
          shipmentType === 'FCL' &&
          isVisible(
            CommonToggleKeys.SHOW_CARRIER_PLACE_OF_DELIVERY_IN_BOOKING
          ) &&
          formData.carrierPlaceOfDeliveryEtaDate != undefined &&
          formData.carrierPlaceOfDeliveryEtaDate != null
        ) {
          if (
            new Date(formData.carrierPlaceOfDeliveryEtaDate) <
            new Date(selectedDate)
          ) {
            setTimeout(() => {
              setFormData((prev) => ({
                ...prev,
                carrierPlaceOfDeliveryEtaDate: null,
              }));
              etaDateRef.current?.focus();
            }, 0);
            isRedirectToRampCodeInputLocationSelection = false;
          }
        }

        if (formData.loadEts !== null) {
          if (
            new Date(selectedDate).setHours(0, 0, 0, 0) <
            new Date(formData.loadEts).setHours(0, 0, 0, 0)
          ) {
            showStatus('warning', [
              `The ETA (Discharge) should be greater than or equal to the ETS.`,
            ]);
            setTimeout(() => {
              setFormData((prev) => ({ ...prev, [fieldName]: null }));
              etaDateRef.current?.focus();
            }, 0);
            if (
              isVisible(CommonToggleKeys.OCN_ROUTING_DETAILS_FIELD_POPULATE)
            ) {
              setTimeout(() => {
                setFormData((prev) => ({
                  ...prev,
                  placeOfDeliveryEta: null,
                  carrierPlaceOfDeliveryEtaDate: null,
                }));
              }, 0);
            }
            isRedirectToRampCodeInputLocationSelection = false;
          }
        }

        const arrivalDate = new Date(selectedDate);
        if (arrivalDate < new Date(before) || arrivalDate > new Date(after)) {
          showStatus('warning', [
            `The ETA (Discharge) should be within ${periodOfDays} days from today.`,
          ]);
          setTimeout(() => {
            setFormData((prev) => ({ ...prev, [fieldName]: null }));
            etaDateRef.current?.focus();
          }, 0);
          if (isVisible(CommonToggleKeys.OCN_ROUTING_DETAILS_FIELD_POPULATE)) {
            setTimeout(() => {
              setFormData((prev) => ({
                ...prev,
                placeOfDeliveryEta: null,
                carrierPlaceOfDeliveryEtaDate: null,
              }));
            }, 0);
          }
          isRedirectToRampCodeInputLocationSelection = false;
        }

        if (isRedirectToRampCodeInputLocationSelection) {
          setTimeout(() => {
            deConsolidationCodeInputLocationSelectionRef.current?.focus();
          }, 0);
        }
      } else if (fieldName === 'placeOfDeliveryEta') {
        if (dateToCompare != null) {
          if (formData.dischargeEta !== null) {
            if (
              new Date(dateToCompare).setHours(0, 0, 0, 0) <
              new Date(formData.dischargeEta).setHours(0, 0, 0, 0)
            ) {
              showStatus('warning', [
                `The ETA (Destination) should be greater than or equal to the ETA (Discharge).`,
              ]);
              setTimeout(() => {
                setFormData((prev) => ({ ...prev, [fieldName]: null }));
              }, 0);
            }
          }
        }

        if (
          moduleType === 'BKG' &&
          shipmentType === 'FCL' &&
          isVisible(
            CommonToggleKeys.SHOW_CARRIER_PLACE_OF_DELIVERY_IN_BOOKING
          ) &&
          formData.carrierPlaceOfDeliveryEtaDate != undefined &&
          formData.carrierPlaceOfDeliveryEtaDate != null
        ) {
          if (
            new Date(dateToCompare).setHours(0, 0, 0, 0) <
            new Date(formData.carrierPlaceOfDeliveryEtaDate).setHours(
              0,
              0,
              0,
              0
            )
          ) {
            showStatus('warning', [
              `The ETA (Place of Delivery) should be greater than or equal to the ETA (Carrier Place of Delivery).`,
            ]);
            setTimeout(() => {
              setFormData((prev) => ({ ...prev, [fieldName]: null }));
            }, 0);
          }
        }

        if (
          dateToCompare < new Date(before) ||
          dateToCompare > new Date(after)
        ) {
          showStatus('warning', [
            `The ETA (Destination) should be within ${periodOfDays} days from today.`,
          ]);
          setTimeout(() => {
            setFormData((prev) => ({ ...prev, [fieldName]: null }));
          }, 0);
        }
      } else if (fieldName === 'loadEts') {
        if (dateToCompare != null) {
          // some code is pending to add.
          if (formData.oldETSDate == null) {
            setTimeout(() => {
              setFormData((prev) => ({ ...prev, oldETSDate: selectedDate }));
            }, 0);
          }
          if (
            formData.oldETSDate?.setHours(0, 0, 0, 0) !=
            selectedDate.setHours(0, 0, 0, 0)
          ) {
            setTimeout(() => {
              setFormData((prev) => ({
                ...prev,
                carrierblCutoff: '',
                autoTitleCutoff: '',
                aesITNCutoff: '',
                carrierblCutofftime: '',
                autoTitleCutofftime: '',
                aesITNCutofftime: '',
              }));
            }, 0);
          }
          let navigateDiscargeWidget: Boolean = false;
          if (
            dateToCompare < new Date(before) ||
            dateToCompare > new Date(after)
          ) {
            showStatus('warning', [
              `The ETS should be within ${periodOfDays} days from today.`,
            ]);
            setTimeout(() => {
              setFormData((prev) => ({ ...prev, [fieldName]: null }));
              etsDateRef.current?.focus();
            }, 0);
            navigateDiscargeWidget = true;
          } else {
            if (
              moduleType === 'BKG' &&
              shipmentType === 'FCL' &&
              isVisible(CommonToggleKeys.ALLOW_FCL_BOOKING_EDI_TO_INTTRA) &&
              formData.carrierPlaceOfDeliveryEtaDate != undefined &&
              formData.carrierPlaceOfDeliveryEtaDate != null
            ) {
              if (
                new Date(dateToCompare).setHours(0, 0, 0, 0) <
                new Date(formData.carrierPlaceOfDeliveryEtaDate).setHours(
                  0,
                  0,
                  0,
                  0
                )
              ) {
                showStatus('warning', [
                  `The ETA (Place of Delivery) should be greater than or equal to the ETA (Carrier Place of Delivery).`,
                ]);
                setTimeout(() => {
                  setFormData((prev) => ({ ...prev, [fieldName]: null }));
                  etsDateRef.current?.focus();
                }, 0);
                navigateDiscargeWidget = true;
              }
            } else if (formData.placeOfReceiptEtd !== null) {
              if (
                dateToCompare.setHours(0, 0, 0, 0) <
                formData.placeOfReceiptEtd.setHours(0, 0, 0, 0)
              ) {
                showStatus('warning', [
                  `The ETS should be greater than or equal to the ETD for Origin.`,
                ]);
                setTimeout(() => {
                  setFormData((prev) => ({ ...prev, [fieldName]: null }));
                  etsDateRef.current?.focus();
                }, 0);
                navigateDiscargeWidget = true;
              }
            }

            if (formData.dischargeEta !== null) {
              if (
                dateToCompare.setHours(0, 0, 0, 0) >
                formData.dischargeEta.setHours(0, 0, 0, 0)
              ) {
                showStatus('warning', [
                  `The ETS should be less than or equal to the ETA.`,
                ]);
                setTimeout(() => {
                  setFormData((prev) => ({ ...prev, [fieldName]: null }));
                  etsDateRef.current?.focus();
                }, 0);
                navigateDiscargeWidget = true;
              }
            }
          }
          setFormData((prev) => ({ ...prev, sailDate: dateToCompare }));
          if (formData[fieldName] != dateToCompare.setHours(0, 0, 0, 0)) {
            if (
              (moduleType === 'QUOTE' &&
                shipmentType === 'FCL' &&
                isVisible(CommonToggleKeys.PULL_ACCURATE_DATA_ETD_QUOTE)) ||
              (moduleType === 'BKG' &&
                shipmentType === 'FCL' &&
                isVisible(CommonToggleKeys.PULL_ACCURATE_DATA_ETD_QUOTE))
            ) {
              if (formData.placeOfReceiptEtd !== null) {
                setFormData((prev) => ({
                  ...prev,
                  callAccurate: !prev.callAccurate,
                }));
              }
            } else {
              setFormData((prev) => ({
                ...prev,
                callAccurate: !prev.callAccurate,
              }));
            }
          }

          if (!navigateDiscargeWidget) {
            setTimeout(() => {
              dischargeInputLocationSelectionRef.current?.focus();
            }, 0);
          }
        }
      }
    }
  };
  const closeErrorMessageHandler = (fieldName) => {
    toggleErrorMessageModal(false);
    setDatePickerErrorMessage('');
    if (fieldName === 'placeOfReceiptEtd') {
      setTimeout(() => {
        origineEtdDateRef.current?.focus();
      }, 0);
    } else if (fieldName === 'dischargeEta') {
      setTimeout(() => {
        etaDateRef.current?.focus();
      }, 0);
    } else if (fieldName === 'placeOfDeliveryEta') {
      setTimeout(() => {
        etaDestinationDateRef.current?.focus();
      }, 0);
    } else if (fieldName === 'loadEts') {
      setTimeout(() => {
        etsDateRef.current?.focus();
      }, 0);
    }
  };

  const updateLocationField = (setFormData, fieldName, ...parts) => {
    const value = parts.filter(Boolean).join(', ');

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  return {
    routingFormData: formData,
    handleRoutingChange,
    bulkUpdateRouting,
    resetRouting,
    isCFSDoor,
    showTruckingDetails,
    routingRef: {
      portOfLoadingEtsRef,
      preCarriageByRef,
      loadInputLocationSelectionRef,
      destinationInputLocationSelectionRef,
      deConsolidationCodeInputLocationSelectionRef,
      carrierPlaceOfReceiptCodeInputLocationSelectionRef,
      dischargeInputLocationSelectionRef,
      origineEtdDateRef,
      etsDateRef,
      etaDateRef,
      etaDestinationDateRef,
      placeOfReceiptInputLocationSelectionRef,
      vesselCodeInputSelectionRef,
    },

    pickupState: {
      routingFormData: formData,
      isCFSDoor,
      pickUpValue,
      openPickupModal,
      pickups,
      openDialog,
      collapsedSet,
      pickupForms,
      doorDeliveryDialogOpen,
      combinedDialogOpen,
      doorDeliveryCollapsed,
      showPickupStack,
      showDoorDeliverySection,
      doorDeliveryForm,
      truckingPickupForms,
      truckingCargoRowsMap,
      pickupTruckerForms,
      pickupChargeMap,
      headerDataMap,
      doorDeliveryChargeRows,
      showPickupOrDoorDelivery,
      orgSearchOpenSet,
      showTruckingDetails,
      showDeliveryType,
      isFromTermsHandler,
      pickupValidationMessages,
      confirmedPickupForms,
      confirmedVersions,
    },

    pickupHandlers: {
      setPickupNeeded,
      setDoorDeliveryDialogOpen,
      setCombinedDialogOpen,
      setDoorDeliveryCollapsed,
      setShowPickupStack,
      resetRouting,
      handlePickupChange,
      handleAddPickup,
      handleRemovePickup,
      handleConfirmRemove,
      handleToggleCollapse,
      closePickupModal,
      handleFormDataChange,
      handleCancelRemove,
      handleOrgSearchOpen,
      handleOrgSearchClose,
      handlePickupAccessorialsChange,
      handleDoorDeliveryFieldChange,
      handlePickupDialogClose,
      handlePickupDialogConfirm,
      handleDoorDeliveryDialogClose,
      handleDoorDeliveryDialogOk,
      handleCombinedDialogClose,
      handleCombinedDialogOk,
      handleRoutingChange,
      handleAgentEmailChange,
      handleAgentNameChange,
      handleAgentNameSelect,
      clearPickupValidation,
      handlePickupFormSync,
      handleTruckingPickupFormSync,
      handleTruckerFormSync,
      handleTermsSelect,
      handleDeliveryTypeChange,
      handleCarriageTypeChange,
      handleCarriageTypeKeyDown,
      setShowDoorDeliverySection,
      setPickupValidationMessages,
    },

    voyageInputRef,
    termsSuggestion: { data: termsSuggestions, setQuery: setTermsQuery },
    vesselSuggestion: { data: vesselSuggestions, setQuery: setVesselQuery },
    handleVesselCodeSelect,
    handlePreCarriageVesselSelect,
    carrierSuggestion: { data: carrierSuggestions, setQuery: setCarrierQuery },
    handleCarrierCodeSelect,

    locationSuggestions: {
      placeOfReceipt: { data: porSuggestions, setQuery: setPorQuery },
      locationCountryCodeData: {
        data: locationCountryCodeData,
        setQuery: setlocationCountryCodeQuery,
      },
      consolidationCfs: {
        data: consolCfsSuggestions,
        setQuery: setConsolCfsQuery,
      },
      portOfLoading: { data: polSuggestions, setQuery: setPolQuery },
      portOfDischarge: { data: podSuggestions, setQuery: setPodQuery },
      deconsolidationCfs: {
        data: deconCfsSuggestions,
        setQuery: setDeconCfsQuery,
      },
      destinationCfs: { data: destCfsSuggestions, setQuery: setDestCfsQuery },
      placeOfDelivery: { data: podCodeSuggestions, setQuery: setPodCodeQuery },
    },
    handleLocationCodeSelect,
    validateLocationOnTab,
    validateTermsOnTab,
    validateVesselOnTab,

    handlePreCarriageBySelect,
    scheduleSearchOpen,
    handleOpenScheduleSearch,
    handleCloseScheduleSearch,
    handleScheduleBookThis,
    bulkUpdateTrucking,
    triggerWarehouseOnPopulate: (deliveryType: string) => {
      if (!isTrkLclGateRef.current) return;
      setTimeout(() => {
        warehouseTriggerRef.current('EO');
        if (deliveryType === 'D') warehouseTriggerRef.current('IO');
      }, 0);
    },
    carriageListBoxAddKeyDownHandler,
    showCustomerDetailsStack,
    toggleShowCustomerDetailsStack,
    customerDetailsStackMoreDetailsRef,
    datePickerKeyDownHandler,
    dateSelectionHandler,
    datePickerOnBlurHandler,
    error: {
      showErrorModal: showErrorMessageModal,
      onClose: closeErrorMessageHandler,
      message: datePickerErrorMessage,
    },
    skipNextBlurValidation,
    setSkipNextBlurValidation,
  };
};
