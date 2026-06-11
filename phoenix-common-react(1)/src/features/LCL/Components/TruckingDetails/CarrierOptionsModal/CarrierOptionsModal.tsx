import React, { useState, useEffect } from 'react';
import { TextField } from '@mui/material';
import { PModal, PGradientButton, PSelect, PRippleButton, PSingleValueSearchableField } from 'phoenix-react-lib';
import Loader from '../../Loader/Loader';
import { useSelector } from 'react-redux';

import type { CarrierOptionsModalProps } from './CarrierOptionsModal.types';
import type { CarrierQuote, AccessorialOption } from '@/types';
import type { CarrierMainDetails } from '../CarrierSelectDetails/CarrierSelectDetails.types';
import CarrierSelectDetails from '../CarrierSelectDetails/CarrierSelectDetails';
import styles from './CarrierOptionsModal.module.css';
import { useApi } from '../../../../../hooks/LCL/useApi';
import { ApiService } from '../../../../../core/api/client';
import { COMMON_ENDPOINTS } from '../../../../../core/api/config/common.endpoints';
import { PHOENIX_ENDPOINTS } from '../../../../../core/api/config/phoenix.endpoints';
import {
  GetOriginAndDestinationCityStateResponse,
  parseCityState,
} from '../../../../../hooks/LCL/Trucking/truckingService';
import {
  BookDomesticShipmentRequest, BookDomesticShipmentResponse
} from '../../../../../hooks/LCL/Trucking/bookDomesticShipmentService';
import { selectLoginClientBean } from '../../../../../core/featureToggles/featureToggle.selectors';

import truckImg from '../../../../../assets/images/trucking/truck.png';
import planeImg from '../../../../../assets/images/trucking/plane.png';
import locationImg from '../../../../../assets/images/trucking/location.png';
import flashImg from '../../../../../assets/images/trucking/flash.png';
import notificationIcon from '../../../../../assets/images/trucking/notificationIcon.png';

const FIELD_H = '20px';
const FIELD_FONT = '12px';
const FIELD_RADIUS = '0px';

const FIELD_SX = {
  '& .MuiOutlinedInput-root': {
    height: FIELD_H,
    fontSize: FIELD_FONT,
    borderRadius: FIELD_RADIUS,
    backgroundColor: '#f5f5f5',
    '& fieldset': { borderRadius: FIELD_RADIUS },
  },
  '& .MuiInputLabel-root': { fontSize: FIELD_FONT },
  '& .MuiOutlinedInput-input': { padding: '0 8px', fontSize: FIELD_FONT },
} as const;

const ZIP_SX = {
  '& .MuiOutlinedInput-root': {
    height: FIELD_H,
    fontSize: FIELD_FONT,
    borderRadius: FIELD_RADIUS,
    backgroundColor: '#ffffff',
    '& fieldset': { borderRadius: FIELD_RADIUS, borderColor: '#f44336' },
    '&:hover fieldset': { borderColor: '#f44336' },
    '&.Mui-focused fieldset': { borderColor: '#f44336' },
  },
  '& .MuiInputLabel-root': { fontSize: FIELD_FONT },
  '& .MuiOutlinedInput-input': { padding: '0 8px', fontSize: FIELD_FONT },
} as const;

const SELECT_FORM_SX = {
  width: '100%',
  height: FIELD_H,
  '& .MuiSelect-select': { fontSize: FIELD_FONT, padding: '0 8px' },
  '& .MuiOutlinedInput-notchedOutline': { borderRadius: FIELD_RADIUS },
} as const;

const SELECT_FORM_SX_LTL = {
  width: '50%',
  height: FIELD_H,
  '& .MuiSelect-select': { fontSize: FIELD_FONT, padding: '0 8px' },
  '& .MuiOutlinedInput-notchedOutline': { borderRadius: FIELD_RADIUS },
} as const;

const SELECT_BTN_SX = {
  height: '25px',
  borderRadius: '3px',
  fontSize: '12px',
  minWidth: '55px',
} as const;

const ACTION_BTN_SX = {
  height: '24px',
  borderRadius: '3px',
  fontSize: '12px',
} as const;

const ACCESSORIAL_BTN_SX = {
  height: '24px !important',
  fontSize: '11px !important',
  width: '100% !important',
  minWidth: 'unset !important',
  padding: '0 8px !important',
  borderRadius: '4px !important',
} as const;


const SHIPMENT_TYPE_OPTIONS = [
  { value: 'LTL', label: 'LTL' },
  { value: 'TRUCKLOAD', label: 'Truckload' },
] as const;



const TSA_COMPLIANT = 'TSA Compliant';

const fmt = (val: number) => `$${val.toFixed(2)}`;

function getSetting(map: Record<string, string[]>, key: string): string {
  return map[key]?.[0] ?? '';
}

interface AccessorialGroupProps {
  accessorials: AccessorialOption[];
  selected: string[];
  onToggle: (code: string) => void;
}

const AccessorialGroup: React.FC<AccessorialGroupProps> = ({ accessorials, selected, onToggle }) => (
  <div style={{ width: '80%' }}>
    <div className={styles.accessorialsLabel}>Accessorials</div>
    <div className={styles.accessorialsGrid}>
      {accessorials.map(acc => (
        <PRippleButton
          key={acc.accessorialCode}
          title={acc.description}
          active={selected.includes(acc.accessorialCode)}
          onClick={() => onToggle(acc.accessorialCode)}
          sx={ACCESSORIAL_BTN_SX}
          aria-pressed={selected.includes(acc.accessorialCode)}
        />
      ))}
    </div>
  </div>
);

interface CarrierRowProps {
  quote: CarrierQuote;
  onSelect: (quote: CarrierQuote) => void;
  loading?: boolean;
}

const CarrierRow: React.FC<CarrierRowProps> = ({ quote, onSelect, loading }) => {
  const accessorialsTotal = quote.priceAccessorials.reduce((sum, a) => sum + a.accessorialPrice, 0);
  const hasNotes = !!quote.pricingInstructions;
  const isGuaranteed = quote.serviceLevel.toLowerCase().includes('guaranteed');
  const rowSpan = hasNotes ? 2 : 1;
  const carrierCode = quote.carrierSCAC?.toLowerCase?.() ?? '';

  const dynamicImagePath = new URL(
    `../../../../../assets/images/trucking/tms/${carrierCode}.png`,
    import.meta.url
  ).href;

  const [imgSrc, setImgSrc] = useState(dynamicImagePath);
  const [showDefaultText, setShowDefaultText] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <>
      <tr>
        <td className={styles.td} rowSpan={rowSpan}>
          <div className={styles.carrierCell}>

            <img
              src={imgSrc}
              className={styles.carrierImg}
              alt={quote.carrierName}
              onError={() => {
                setImgSrc(truckImg);
                setShowDefaultText(true);
              }}
            />

            {showDefaultText && (
              <span className={styles.carrierLogoText}>
                {quote.carrierName}
              </span>
            )}
          </div>
        </td>

        <td className={styles.td}>
          <div className={styles.transitCell}>
            <span>{quote.transitTime} Day(s)</span>
            {isGuaranteed && (
              <div className={styles.guaranteedLine}>
                <img src={flashImg} className={styles.flashImg} alt="" aria-hidden="true" />
                <span>{quote.serviceLevel}</span>
              </div>
            )}
          </div>
        </td>

        <td className={styles.td}>
          <div className={styles.iconCol}>
            <img src={locationImg} className={styles.iconImg} alt="location" />
            {quote.tsaCompliance === TSA_COMPLIANT && (
              <img src={planeImg} className={styles.iconImg} alt="TSA compliant" />
            )}
          </div>
        </td>

        <td className={styles.td}>
          <div className={styles.liabilityStack}>
            <div className={styles.liabilityRow}>
              <span className={styles.liabilityLabel}>New:</span>
              <span className={styles.liabilityNewValue}>{fmt(quote.newLiabilityCoverage)}</span>
            </div>
            <div className={styles.liabilityRow}>
              <span className={styles.liabilityLabel}>Used:</span>
              <span className={styles.liabilityUsedValue}>{fmt(quote.usedLiabilityCoverage)}</span>
            </div>
          </div>
        </td>

        <td className={styles.td}>{fmt(quote.priceLineHaul)}</td>

        <td className={styles.td}>{fmt(quote.priceFuelSurcharge)}</td>

        <td className={styles.td}>
          <div className={styles.accessorialsCell}>
            <span>{fmt(accessorialsTotal)}</span>

            {accessorialsTotal > 0 && (
              <div
                className={styles.tooltipWrapper}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <button
                  type="button"
                  className={styles.infoBtn}
                  aria-label="View accessorial details"
                >
                  <span className={styles.infoImg}
                    style={{ backgroundImage: `url(${notificationIcon})` }}></span>
                </button>

                {showTooltip && (
                  <div className={styles.tooltipPopup}>
                    {quote.priceAccessorials.map((item, index) => (
                      <div key={index} className={styles.tooltipRow}>
                        <div>{item.accessorialCode}</div>
                        <div>${item.accessorialPrice}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </td>

        <td className={styles.td}>
          <span className={styles.total}>{fmt(quote.priceTotal)}</span>
        </td>

        <td className={styles.tdSelect} rowSpan={rowSpan}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            {loading && <Loader />}
            <PGradientButton
              title="Select"
              onClick={() => onSelect(quote)}
              sx={SELECT_BTN_SX}
              disabled={loading}
            />
          </div>
        </td>
      </tr>

      {hasNotes && (
        <tr>
          <td colSpan={1}></td>
          <td colSpan={6} className={styles.notesTd}>
            {quote.pricingInstructions}
          </td>
        </tr>
      )}
    </>
  );
};

export const CarrierOptionsModal: React.FC<CarrierOptionsModalProps> = ({
  open,
  onClose,
  formData,
  quotes,
  handlers,
  uiState,
  uiHandlers,
  mainDetails,
  cargoDetails,
  moduleCode,
  suggestions,
  alternateGatewayOptions,
  availableAccessorials,
  isModifyBooking = false,
  onPopulateReference,
  onSuccess,
}) => {
  const [selectedQuote, setSelectedQuote] = useState<CarrierQuote | null>(null);
  const [selectDetailsOpen, setSelectDetailsOpen] = useState(false);
  const [localMainDetails, setLocalMainDetails] = useState<CarrierMainDetails | undefined>(mainDetails);
  const [apiCityState, setApiCityState] = useState<{
    originCity: string;
    originState: string;
    destCity: string;
    destState: string;
  } | null>(null);
  const [warehouseDestDetails, setWarehouseDestDetails] = useState<{
    companyName?: string;
    streetAddress?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
  } | null>(null);

  const mergedMainDetails = React.useMemo(() => {
    const base = localMainDetails ?? {};
    return {
      ...base,
      tmsCarrier: selectedQuote?.carrierName || base.tmsCarrier || '',
      origin: {
        ...(base.origin ?? {}),
        city: apiCityState?.originCity ?? '',
        state: apiCityState?.originState ?? '',
        zipCode: formData.pickupZipCode || base.origin?.zipCode || '',
      },
      destination: {
        ...(base.destination ?? {}),
        city: apiCityState?.destCity ?? '',
        state: apiCityState?.destState ?? '',
        zipCode: formData.deliverToZipCode || base.destination?.zipCode || '',
        ...(warehouseDestDetails?.companyName && { companyName: warehouseDestDetails.companyName }),
        ...(warehouseDestDetails?.streetAddress && { streetAddress: warehouseDestDetails.streetAddress }),
        ...(warehouseDestDetails?.contactName && { contactName: warehouseDestDetails.contactName }),
        ...(warehouseDestDetails?.contactPhone && { contactPhone: warehouseDestDetails.contactPhone }),
        ...(warehouseDestDetails?.contactEmail && { contactEmail: warehouseDestDetails.contactEmail }),
      },
    };
  }, [localMainDetails, apiCityState, formData.pickupZipCode, formData.deliverToZipCode, selectedQuote, warehouseDestDetails]);

  useEffect(() => {
    if (!selectDetailsOpen) {
      setLocalMainDetails(mainDetails);
    }
  }, [mainDetails, selectDetailsOpen]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshedMainQuotes, setRefreshedMainQuotes] = useState<CarrierQuote[] | null>(null);
  const [altGatewayQuotes, setAltGatewayQuotes] = useState<CarrierQuote[]>([]);
  const [altGatewayLabel, setAltGatewayLabel] = useState('');
  const [altPricingOpen, setAltPricingOpen] = useState(true);
  const [altGuaranteedOnly, setAltGuaranteedOnly] = useState(false);
  const [committedDestCode, setCommittedDestCode] = useState(formData.deliverToLocationCode || 'N/A');
  const [committedDestZip, setCommittedDestZip] = useState(formData.deliverToZipCode || 'N/A');

  useEffect(() => {
    if (!open) return;
    if (formData.deliverToLocationCode) setCommittedDestCode(formData.deliverToLocationCode);
    if (formData.deliverToZipCode) setCommittedDestZip(formData.deliverToZipCode);
  }, [open, formData.deliverToLocationCode, formData.deliverToZipCode]);

  const loginClientBean = useSelector(selectLoginClientBean);
  const [selectingIdx, setSelectingIdx] = useState<number | null>(null);

  const [isCityStateLoading, setIsCityStateLoading] = useState(false);
  const [tmsChargeMap, setTmsChargeMap] = useState<Record<string, { code: string; name: string }>>({})

  useEffect(() => {
    if (!open) return;
    ApiService.post<{ success: number; result: Record<string, string> }>(
      COMMON_ENDPOINTS.CARRIER_OPTIONS.GET_RATE_MAPPING,
      {}
    ).then(res => {
      if (res.data?.success === 1 && res.data?.result) {
        const parsed: Record<string, { code: string; name: string }> = {};
        Object.entries(res.data.result).forEach(([tmsCode, value]) => {
          const separatorIdx = value.indexOf('^');
          if (separatorIdx !== -1) {
            parsed[tmsCode.toUpperCase()] = {
              code: value.slice(0, separatorIdx).trim(),
              name: value.slice(separatorIdx + 1).trim(),
            };
          }
        });
        setTmsChargeMap(parsed);
      }
    }).catch(e => {
      console.error('[CarrierOptions] Failed to fetch TMS charge map', e);
    });
  }, [open]);

  const {
    execute: executeBookDomesticShipment,
    loading: isBookingLoading,
  } = useApi<BookDomesticShipmentRequest, BookDomesticShipmentResponse>({
    endpoint: PHOENIX_ENDPOINTS.TMS.BOOK_DOMESTIC_SHIPMENT,
  });

  const handleRowSelect = async (quote: CarrierQuote, idx: number) => {
    setSelectingIdx(idx);
    setIsCityStateLoading(true);

    let newOriginCity = '';
    let newOriginState = '';
    let newDestCity = '';
    let newDestState = '';

    try {
      const officeId = loginClientBean?.companyGroupName?.toUpperCase() === 'SHIPCO'
        ? 0
        : (loginClientBean?.officeId ?? 0);

      const axiosResponse = await ApiService.post<GetOriginAndDestinationCityStateResponse>(
        COMMON_ENDPOINTS.CARRIER_OPTIONS.GET_ORIGIN_AND_DESTINATION_CITY_STATE,
        {
          originZipCode: formData.pickupZipCode,
          destinationZipCode: formData.deliverToZipCode,
          moduleCode: moduleCode ?? 'BKG',
          officeId,
        }
      );

      const response = axiosResponse?.data;
      if (response?.success === 1 && response?.result) {
        const originParsed = parseCityState(response.result.originCityState);
        const destParsed = parseCityState(response.result.destinationCityState);
        newOriginCity = originParsed.city;
        newOriginState = originParsed.state;
        newDestCity = destParsed.city;
        newDestState = destParsed.state;
      }
    } catch (e) {
      console.error('[CarrierOptions] City/state lookup failed', e);
    } finally {
      setIsCityStateLoading(false);
    }

    setApiCityState({
      originCity: newOriginCity,
      originState: newOriginState,
      destCity: newDestCity,
      destState: newDestState,
    });

    const deliverToCode = formData.deliverToLocationCode?.trim();
    if (deliverToCode) {
      try {
        const wRes = await ApiService.post<{ success: number; result: { name?: string; address1?: string; contactPerson?: string; phone?: string; email?: string } }>(
          COMMON_ENDPOINTS.CARRIER_OPTIONS.GET_WAREHOUSE_DETAILS,
          {
            loginBean: {
              officeId: loginClientBean?.officeId ?? 0,
              siteId: loginClientBean?.siteId ?? 0,
            },
            warehouseCode: deliverToCode,
          }
        );
        if (wRes.data?.success === 1 && wRes.data?.result) {
          const r = wRes.data.result;
          setWarehouseDestDetails({
            companyName: r.name?.trim() || undefined,
            streetAddress: r.address1?.trim() || undefined,
            contactName: r.contactPerson?.trim() || undefined,
            contactPhone: r.phone?.trim() || undefined,
            contactEmail: r.email?.trim() || undefined,
          });
        }
      } catch (e) {
        console.error('[CarrierOptions] Failed to fetch warehouse details', e);
      }
    }

    setLocalMainDetails(prev => ({
      ...(prev ?? {}),
      tmsCarrier: quote.carrierName,
    }));

    setSelectedQuote(quote);
    setSelectingIdx(null);
    setSelectDetailsOpen(true);
  };

  const handleSelectDetailsClose = () => {
    setSelectDetailsOpen(false);
    setSelectedQuote(null);
    setApiCityState(null);
    setWarehouseDestDetails(null);
  };

  const handleBookWithTms = async (editedDetails?: CarrierMainDetails) => {
    const quote = selectedQuote;
    const origin = editedDetails?.origin ?? mergedMainDetails?.origin ?? {};
    const destination = editedDetails?.destination ?? mergedMainDetails?.destination ?? {};
    const dimBeans = cargoDetails?.tmsOrderCargoAndPricingBean?.tmsOrderDimensionBeans ?? [];
    const commodityInputs = cargoDetails?.bookDomesticShipmentInputBean?.commodities ?? [];
    const allAccessorialCodes = [...formData.pickupAccessorial, ...formData.deliverToAccessorial];

    // Build commodities array from cargo dimension beans
    const DIM_UNIT_TO_BOOKING: Record<string, string> = { I: 'In', F: 'Ft', C: 'Cm', M: 'M' };
    const firstDimUnit = dimBeans[0]?.unit ?? 'I';
    const dimensionUnits = DIM_UNIT_TO_BOOKING[firstDimUnit] ?? 'In';
    const weightUnits = firstDimUnit === 'C' ? 'Kg' : 'Lb';
    const isHazardous = cargoDetails?.tmsOrderCargoAndPricingBean?.hazardous === 'YES';
    const stackable = cargoDetails?.tmsOrderCargoAndPricingBean?.stackable ?? true;
    const commodities = dimBeans.map((dim, i) => ({
      handlingQuantity: dim.pieces,
      length: dim.length,
      width: dim.width,
      height: dim.height,
      weightTotal: dim.lbs || dim.kg,
      hazardousMaterial: isHazardous,
      piecesTotal: dim.pieces,
      freightClass: String(dim.tmsClass || ''),
      nmfc: '',
      description: commodityInputs[i]?.additionalMarkings ?? '',
      additionalMarkings: commodityInputs[i]?.additionalMarkings ?? '',
      cbm: dim.cbm,
      cbf: dim.cbf,
    }));

    const request: BookDomesticShipmentRequest = {
      mainBean: {
        shipmentId: mergedMainDetails?.shipperReferenceNumber ?? '',
        shipmentType: formData.shipmentType || 'LTL',
        stackable,
        trailerType: 'None',
        weightUnits,
        dimensionUnits,
        serviceLevel: quote?.serviceLevel ?? '',
        shipperReferenceNumber: mergedMainDetails?.shipperReferenceNumber ?? '',
        poReference: mergedMainDetails?.customerPoNumber ?? '',
        carrierSCAC: quote?.carrierSCAC ?? '',
        tariffDescription: quote?.tariffDescription ?? null,
        originAddress: {
          companyName: origin.companyName ?? '',
          streetAddress: origin.streetAddress ?? '',
          streetAddressTwo: '',
          city: origin.city ?? '',
          state: origin.state ?? '',
          zipCode: formData.pickupZipCode || origin.zipCode || '',
          country: '',
          contactName: origin.contactName ?? '',
          phone: origin.contactPhone ?? '',
          email: origin.contactEmail ?? '',
          readyTime: origin.pickupTimeFrom ?? '',
          closingTime: origin.pickupTimeTo ?? '',
          additionalInstructions: '',
        },
        destinationAddress: {
          companyName: destination.companyName ?? '',
          streetAddress: destination.streetAddress ?? '',
          streetAddressTwo: '',
          city: destination.city ?? '',
          state: destination.state ?? '',
          zipCode: formData.deliverToZipCode || destination.zipCode || '',
          country: '',
          contactName: destination.contactName ?? '',
          phone: destination.contactPhone ?? '',
          email: destination.contactEmail ?? '',
        },
        commodities,
        accessorialCodes: allAccessorialCodes,
        pickupDate: origin.pickupDate ?? '',
        doNotDispatchCarrier: false,
        driverCellPhoneNumber: null,
        totalBuy: 0.0,
        totalSell: quote?.priceTotal ?? 0.0,
        customerReferenceNumber: null,
        customerStaffReferenceNumber: null,
        billToOrganizationId: null,
        customerStaffID: null,
        hazmatEmergencyContactNumber: null,
        latitude: 0.0,
        longitude: 0.0,
        contractUse: null,
        tradingPartnerNum: null,
      },
      tmsOrderMainBean: {
        pickupLocationCode: formData.pickupLocationCode ?? '',
        pickupZipCode: formData.pickupZipCode ?? '',
        deliverToLocationCode: formData.deliverToLocationCode ?? '',
        deliverToZipCode: formData.deliverToZipCode ?? '',
        alternateGateway: formData.alternateGateway || '-1',
        shipmentType: formData.shipmentType || 'LTL',
        trailerType: '-1',
        customerPONumber: mergedMainDetails?.customerPoNumber ?? '',
        shipperReferenceNumber: mergedMainDetails?.shipperReferenceNumber ?? '',
        loadReleaseNumber: mergedMainDetails?.loadReleaseNumber ?? '',
        tmscarrier: quote?.carrierName ?? '',
        originBean: {
          companyName: origin.companyName ?? '',
          streetAddress: origin.streetAddress ?? '',
          streetAddressTwo: '',
          city: origin.city ?? '',
          state: origin.state ?? '',
          zipCode: formData.pickupZipCode || origin.zipCode || '',
          contactName: origin.contactName ?? '',
          phone: origin.contactPhone ?? '',
          email: origin.contactEmail ?? '',
        },
        destinationBean: {
          companyName: destination.companyName ?? '',
          streetAddress: destination.streetAddress ?? '',
          streetAddressTwo: '',
          city: destination.city ?? '',
          state: destination.state ?? '',
          zipCode: formData.deliverToZipCode || destination.zipCode || '',
          contactName: destination.contactName ?? '',
          phone: destination.contactPhone ?? '',
          email: destination.contactEmail ?? '',
        },
        pickupDate: origin.pickupDate ?? '',
        pickupTimeFrom: origin.pickupTimeFrom ?? '',
        pickupTimeTo: origin.pickupTimeTo ?? '',
        deliveryEstimatedDate: destination.deliveryEstimatedDate ?? '',
        pickupId: '0',
        referenceNumber: mergedMainDetails?.shipperReferenceNumber ?? '',
        tmsShipmentId: mergedMainDetails?.shipperReferenceNumber ?? '',
        transactionalFlag: isModifyBooking ? 'U' : 'B',
        moduleCode: moduleCode ?? 'BKG',
        handlingOffice: loginClientBean?.ldapOfficeCode ?? '',
        chargeCodeMap: (quote as any)?.chargeCodeMap ?? {},
      },
      rateQuoteResultBean: {
        carrierSCAC: quote?.carrierSCAC ?? '',
        carrierName: quote?.carrierName ?? '',
        tariffDescription: quote?.tariffDescription ?? '',
        transitTime: quote?.transitTime ?? 0,
        serviceLevel: quote?.serviceLevel ?? '',
        priceLineHaul: quote?.priceLineHaul ?? 0,
        priceFuelSurcharge: quote?.priceFuelSurcharge ?? 0,
        priceTotal: quote?.priceTotal ?? 0,
        pricingInstructions: quote?.pricingInstructions ?? '',
        usedLiabilityCoverage: quote?.usedLiabilityCoverage ?? 0,
        newLiabilityCoverage: quote?.newLiabilityCoverage ?? 0,
        tsaCompliance: quote?.tsaCompliance ?? '',
        errorMessage: null,
        priceAccessorials: (quote?.priceAccessorials ?? []).map(a => ({
          accessorialCode: a.accessorialCode,
          accessorialPrice: a.accessorialPrice,
        })),
      },
    };

    const rawResponse = await executeBookDomesticShipment(request);

    if (!rawResponse) {
      handlers.onBookWithTmsResult({
        success: false,
        message: 'Booking request failed. Please try again.',
        closeModal: false,
      });
      return;
    }

    let response: any = rawResponse;
    if (typeof response === 'string') {
      try {
        response = JSON.parse(response);
      } catch (e) { }
    }
    if (Array.isArray(response) && response.length > 0) {
      response = response[0];
    }
    if (response && response.data) {
      response = response.data;
    }

    const outerSuccess: number | undefined = (response as any)?.success;

    // In case the backend returns the object inside `result` wrapper like older endpoints
    if (response && response.success !== undefined && response.result) {
      response = response.result;
    }

    const errorMessage = response.errorMessage ?? null;

    if (errorMessage && outerSuccess !== 1) {
      if (errorMessage.includes('~')) {
        const parts = errorMessage.split('~');
        if (parts[0] === 'CANCEL') {
          handlers.onBookWithTmsResult({
            success: false,
            message: parts[1] ?? errorMessage,
            closeModal: true,
          });
          handleSelectDetailsClose();
          onClose();
          return;
        }
      }
      handlers.onBookWithTmsResult({
        success: false,
        message: errorMessage,
        closeModal: false,
      });
      return;
    }

    const tmsShipmentId = response.shipmentID ?? response.shipmentId ?? response.tmsShipmentId ?? '';
    const idSuffix = tmsShipmentId ? ` under TMS Shipment ID ${tmsShipmentId}` : '';
    const successMessage = isModifyBooking
      ? `TMS booking modified successfully${idSuffix}`
      : `TMS booking created successfully${idSuffix}`;
    const priceDetail = response.priceDetail ?? selectedQuote;
    const updatedCharges: PickupCharge[] = [];
    let currentId = 1;

    const settings = loginClientBean?.officeSettingMap ?? {};
    const profitPercentStr = getSetting(settings, 'TMS_PROFIT_PERCENTAGE');
    const profitPercent = parseFloat(profitPercentStr) || 0;

    const calculateExpense = (income: number): number => {
      if (profitPercent > 0) {
        const profit = (income * profitPercent) / 100;
        const computedExpense = Number((income - profit).toFixed(2));
        return computedExpense;
      }
      return 0;
    };

    if (priceDetail) {
      if ((priceDetail.priceLineHaul ?? 0) > 0) {
        const desc = response.chargeDescription?.trim() || response.localeChargeDescription?.trim() || 'Inland Freight';
        const income = priceDetail.priceLineHaul;
        const expense = calculateExpense(income);
        updatedCharges.push({
          id: currentId++,
          chargeDescription: `INL - ${desc}`,
          expenseCurrency: 'USD',
          expense,
          incomeCurrency: 'USD',
          income,
        });
      }
      if ((priceDetail.priceFuelSurcharge ?? 0) > 0) {
        const fscMapped = tmsChargeMap['FSC'];
        const income = priceDetail.priceFuelSurcharge;
        const expense = calculateExpense(income);
        updatedCharges.push({
          id: currentId++,
          chargeDescription: fscMapped
            ? `${fscMapped.code} - ${fscMapped.name}`
            : 'Fuel Surcharge',
          expenseCurrency: 'USD',
          expense,
          incomeCurrency: 'USD',
          income,
        });
      }

      let misTotal = 0;

      (priceDetail.priceAccessorials ?? []).forEach((acc) => {
        if ((acc.accessorialPrice ?? 0) > 0) {
          const rawCode = acc.accessorialCode?.toUpperCase().trim() || '';
          const mapped = tmsChargeMap[rawCode];
          const responseDesc = (acc as any).description?.trim();

          if (mapped) {
            const income = acc.accessorialPrice;
            const expense = calculateExpense(income);
            updatedCharges.push({
              id: currentId++,
              chargeDescription: `${mapped.code} - ${responseDesc || mapped.name}`,
              expenseCurrency: 'USD',
              expense,
              incomeCurrency: 'USD',
              income,
            });
          } else {
            // Unmapped accessorials accumulate into a single 'ADD' charge
            misTotal += acc.accessorialPrice;
          }
        }
      });

      if (misTotal > 0) {
        const expense = calculateExpense(misTotal);
        updatedCharges.push({
          id: currentId++,
          chargeDescription: 'ADD - Additionals',
          expenseCurrency: 'USD',
          expense,
          incomeCurrency: 'USD',
          income: misTotal,
        });
      }
    }

    if (updatedCharges.length === 0) {
      const priceTotal = selectedQuote?.priceTotal ?? response.priceDetail?.priceTotal ?? 0;
      const chargeDesc = (response.chargeDescription?.trim() || response.localeChargeDescription?.trim()) || 'INL';
      const expense = calculateExpense(priceTotal);
      updatedCharges.push({
        id: 1,
        chargeDescription: chargeDesc,
        expenseCurrency: 'USD',
        expense,
        incomeCurrency: 'USD',
        income: priceTotal,
      });
    }
    handlers.onBookWithTmsResult({
      success: true,
      message: successMessage,
      closeModal: true,
      tmsShipmentId: tmsShipmentId || undefined,
      tmsStatus: response.shipmentStatus ?? undefined,
      truckerProNumber: response.proNumber ?? undefined,
      tmsCarrier: selectedQuote?.carrierName ?? response.priceDetail?.carrierName ?? undefined,
      carrierSCAC: selectedQuote?.carrierSCAC ?? response.priceDetail?.carrierSCAC ?? undefined,
      priceTotal: response.priceDetail?.priceTotal ?? undefined,
      updatedCharges,
    });
    handleSelectDetailsClose();
    onClose();
  };

  const handleRefreshOptions = async () => {
    setCommittedDestCode(formData.deliverToLocationCode || 'N/A');
    setCommittedDestZip(formData.deliverToZipCode || 'N/A');
    setIsRefreshing(true);
    setAltGatewayQuotes([]);
    setRefreshedMainQuotes(null);

    try {
      const allAccessorials = [...formData.pickupAccessorial, ...formData.deliverToAccessorial];
      const hasAltGateway = !!(formData.alternateGateway && formData.zipCode);

      const result = await handlers.onRefreshOptions?.({
        pickupZipCode: formData.pickupZipCode,
        deliverToZipCode: formData.deliverToZipCode,
        accessorialCodes: allAccessorials,
        alternateGatewayZipCode: hasAltGateway ? formData.zipCode : undefined,
      });

      if (result) {
        setRefreshedMainQuotes(result.mainQuotes);
        if (result.altGatewayQuotes && result.altGatewayQuotes.length > 0) {
          const selectedLabel =
            alternateGatewayOptions?.find(o => o.value === formData.alternateGateway)?.label ?? '';
          setAltGatewayLabel(
            selectedLabel
              ? `Pricing Options For Alternate Gateway - ${selectedLabel}, ${formData.zipCode}`
              : `Pricing Options For ${formData.zipCode}`,
          );
          setAltGatewayQuotes(result.altGatewayQuotes);
          setAltPricingOpen(true);
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const activeQuotes = refreshedMainQuotes ?? quotes;
  const displayQuotes = uiState.guaranteedOnly
    ? activeQuotes.filter(q => q.serviceLevel.toLowerCase().includes('guaranteed'))
    : activeQuotes;

  const accessorialOptions: AccessorialOption[] = (availableAccessorials ?? []).map(o => ({
    accessorialCode: o.id,
    description: o.label,
  }));

  const pricingLabel = `Pricing Options For ${committedDestCode}, ${committedDestZip}`;
  const allOpen =
    uiState.mainDetailsOpen &&
    uiState.pricingOpen &&
    (altGatewayQuotes.length === 0 || altPricingOpen);

  const handleToggleAll = () => {
    const nextOpen = !allOpen;
    uiHandlers.onSetAllOpen(nextOpen);
    if (altGatewayQuotes.length > 0) {
      setAltPricingOpen(nextOpen);
    }
  };
  const resolvedCargoDetails = React.useMemo(() => {
    if (!selectedQuote || !cargoDetails) return cargoDetails;

    return {
      ...cargoDetails,
      tmsOrderCargoAndPricingBean: {
        ...cargoDetails.tmsOrderCargoAndPricingBean,
        rate: fmt(selectedQuote.priceLineHaul),
        priceFuelSurcharge: selectedQuote.priceFuelSurcharge,
        priceAccessorials: selectedQuote.priceAccessorials,
        priceTotal: selectedQuote.priceTotal,
      },
    };
  }, [selectedQuote, cargoDetails]);

  return (
    <PModal
      open={open}
      onClose={onClose}
      title="Carrier Options"
      width={1050}
      height="90vh"
      backgroundColor="#ffffff"
      isCloseIcon={true}
      contentSx={{ padding: '8px 10px', overflowY: 'auto' }}
    >
      <div className={styles.root}>

        <div className={styles.actionButtonsRow}>
          <PGradientButton
            title={allOpen ? 'Close All' : 'Open All'}
            onClick={handleToggleAll}
            sx={ACTION_BTN_SX}
            aria-label={allOpen ? 'Close all sections' : 'Open all sections'}
          />
          {isRefreshing
            ? <Loader />
            : (
              <PGradientButton
                title="Refresh Options"
                onClick={handleRefreshOptions}
                sx={ACTION_BTN_SX}
                aria-label="Refresh carrier options"
              />
            )
          }
          <PGradientButton
            title="Cancel"
            onClick={onClose}
            sx={ACTION_BTN_SX}
            aria-label="Cancel"
          />
        </div>

        <div className={styles.mainDetailsAccordion}>
          <div
            className={`${styles.accordionBar} ${!uiState.mainDetailsOpen ? styles.accordionBarClosed : ''}`}
            onClick={uiHandlers.onToggleMainDetails}
            role="button"
            aria-expanded={uiState.mainDetailsOpen}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && uiHandlers.onToggleMainDetails()}
          >
            <span className={styles.accordionBarTitle}>Main Details</span>
            <button
              type="button"
              className={styles.accordionToggle}
              aria-label={uiState.mainDetailsOpen ? 'Collapse main details' : 'Expand main details'}
              onClick={e => { e.stopPropagation(); uiHandlers.onToggleMainDetails(); }}
            >
              {uiState.mainDetailsOpen ? '−' : '+'}
            </button>
          </div>

          <div className={uiState.mainDetailsOpen ? styles.accordionContent : styles.accordionContentHidden}>
            <div className={styles.mainDetailsGrid}>

              <div className={styles.detailsColumn}>
                <span className={styles.subLabel}>Pickup Details</span>

                <div className={styles.inlineFieldsRow}>
                  <div className={styles.fieldRowWide}>
                    <span className={styles.fieldLabel}>Pickup Location Code</span>
                    <div className={styles.locationSuggestion}>
                      <PSingleValueSearchableField
                        label={null}
                        data={suggestions.pickupLocationCode.data}
                        displayFields={['label']}
                        columnHeaders={['Location']}
                        value={formData.pickupLocationCode}
                        usePortal
                        onChange={handlers.onPickupLocationCodeChange}
                        onSelect={(item: any) => {
                          handlers.onPickupLocationCodeChange(String(item['code'] ?? ''));
                          if (localMainDetails) {
                            setLocalMainDetails({
                              ...localMainDetails,
                              origin: {
                                ...localMainDetails.origin,
                                companyName: item.companyName || '',
                                streetAddress: item.streetAddress || '',
                                city: item.city || '',
                                state: item.state || '',
                                zipCode: item.zipCode || '',
                                contactName: item.contactName || '',
                                contactPhone: item.phone || '',
                                contactEmail: item.email || '',
                              }
                            });
                          }
                          const zip = String(item['zipCode'] ?? '');
                          if (zip) handlers.onPickupZipCodeChange(zip);
                        }}
                        showTooltip={true}
                      />
                    </div>
                  </div>
                  <div className={styles.fieldRowFlex}>
                    <span className={styles.fieldLabel}>Pickup Zip Code</span>
                    <TextField
                      size="small"
                      value={formData.pickupZipCode}
                      onChange={(e) => handlers.onPickupZipCodeChange(e.target.value)}
                      slotProps={{ htmlInput: { 'aria-label': 'Pickup zip code', 'aria-required': 'true' } }}
                      sx={ZIP_SX}
                      fullWidth
                    />
                  </div>
                </div>

                <AccessorialGroup
                  accessorials={accessorialOptions}
                  selected={formData.pickupAccessorial}
                  onToggle={handlers.onPickupAccessorialToggle}
                />
              </div>

              <div className={styles.detailsColumn}>
                <span className={styles.subLabel}>Deliver To Details</span>

                <div className={styles.inlineFieldsRow}>
                  <div className={styles.fieldRowWide}>
                    <span className={styles.fieldLabel}>Deliver To Location Code</span>
                    <div className={styles.locationSuggestion}>
                      <PSingleValueSearchableField
                        label={null}
                        data={suggestions.deliverToLocationCode.data}
                        displayFields={['label']}
                        columnHeaders={['Location']}
                        value={formData.deliverToLocationCode}
                        usePortal
                        onChange={handlers.onDeliverToLocationCodeChange}
                        onSelect={(item: any) => {
                          handlers.onDeliverToLocationCodeChange(String(item['code'] ?? ''));
                          if (localMainDetails) {
                            setLocalMainDetails({
                              ...localMainDetails,
                              destination: {
                                ...localMainDetails.destination,
                                companyName: item.companyName || '',
                                streetAddress: item.streetAddress || '',
                                city: item.city || '',
                                state: item.state || '',
                                zipCode: item.zipCode || '',
                                contactName: item.contactName || '',
                                contactPhone: item.phone || '',
                                contactEmail: item.email || '',
                              }
                            });
                          }
                          const zip = String(item['zipCode'] ?? '');
                          if (zip) handlers.onDeliverToZipCodeChange(zip);
                        }}
                        showTooltip={true}
                      />
                    </div>
                  </div>
                  <div className={styles.fieldRowFlex}>
                    <span className={styles.fieldLabel}>Deliver To Zip Code</span>
                    <TextField
                      size="small"
                      value={formData.deliverToZipCode}
                      onChange={(e) => handlers.onDeliverToZipCodeChange(e.target.value)}
                      slotProps={{ htmlInput: { 'aria-label': 'Deliver to zip code', 'aria-required': 'true' } }}
                      sx={ZIP_SX}
                      fullWidth
                    />
                  </div>
                </div>

                <AccessorialGroup
                  accessorials={accessorialOptions}
                  selected={formData.deliverToAccessorial}
                  onToggle={handlers.onDeliverToAccessorialToggle}
                />
              </div>

              <div className={styles.gatewayColumn}>
                <div className={styles.gatewayRow}>
                  <div className={styles.fieldRowFlex}>
                    <span className={styles.fieldLabel}>Alternate Gateway</span>
                    <PSelect
                      value={formData.alternateGateway}
                      onChange={(val: string) => {
                        handlers.onAlternateGatewayChange(val);
                        handlers.onZipCodeChange(val ? (val.split('~')[2] ?? '') : '');
                      }}
                      options={alternateGatewayOptions ?? [{ label: 'Please Select', value: '' }]}
                      formControlSx={SELECT_FORM_SX}
                      aria-label="Alternate gateway"
                    />
                  </div>
                  <div className={styles.fieldRowFlex}>
                    <span className={styles.fieldLabel}>Zip Code</span>
                    <TextField
                      size="small"
                      value={formData.zipCode}
                      slotProps={{ htmlInput: { readOnly: true, 'aria-label': 'Alternate gateway zip code' } }}
                      sx={FIELD_SX}
                      fullWidth
                    />
                  </div>
                </div>

                <div className={styles.fieldRowFlex}>
                  <span className={styles.fieldLabel}>Shipment Type</span>
                  <PSelect
                    value={formData.shipmentType}
                    onChange={() => { }}
                    options={SHIPMENT_TYPE_OPTIONS}
                    disabled
                    formControlSx={SELECT_FORM_SX_LTL}
                    aria-label="Shipment type"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {altGatewayQuotes.length > 0 && (
          <div className={styles.pricingSection}>
            <div
              className={`${styles.pricingHeader} ${!altPricingOpen ? styles.pricingHeaderClosed : ''}`}
              onClick={() => setAltPricingOpen(v => !v)}
              role="button"
              aria-expanded={altPricingOpen}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && setAltPricingOpen(v => !v)}
            >
              <span>{altGatewayLabel}</span>
              <button
                type="button"
                className={styles.accordionToggle}
                aria-label={altPricingOpen ? 'Collapse alternate gateway pricing' : 'Expand alternate gateway pricing'}
                onClick={e => { e.stopPropagation(); setAltPricingOpen(v => !v); }}
              >
                {altPricingOpen ? '−' : '+'}
              </button>
            </div>

            <div className={altPricingOpen ? styles.pricingAccordionContent : styles.accordionContentHidden}>
              <div className={styles.guaranteedOnlyRow}>
                <div className={styles.guaranteedLeftArea} />
                <button
                  type="button"
                  className={`${styles.guaranteedBtn} ${altGuaranteedOnly ? styles.guaranteedBtnActive : ''}`}
                  onClick={() => setAltGuaranteedOnly(v => !v)}
                  aria-pressed={altGuaranteedOnly}
                >
                  Guaranteed Only
                </button>
              </div>

              <table className={styles.pricingTable} role="table">
                <thead>
                  <tr>
                    <th scope="col" className={`${styles.th} ${styles.thCarrier}`}>Carrier</th>
                    <th scope="col" className={`${styles.th} ${styles.thTransit}`}>Transit Time</th>
                    <th scope="col" className={`${styles.th} ${styles.thIcons}`}></th>
                    <th scope="col" className={`${styles.th} ${styles.thLiab}`}>Max Liability Coverage</th>
                    <th scope="col" className={`${styles.th} ${styles.thRate}`}>Rate</th>
                    <th scope="col" className={`${styles.th} ${styles.thFsc}`}>FSC</th>
                    <th scope="col" className={`${styles.th} ${styles.thAccess}`}>Accessorials</th>
                    <th scope="col" className={`${styles.th} ${styles.thTotal}`}>Total</th>
                    <th scope="col" className={`${styles.th} ${styles.thSelect}`}></th>
                  </tr>
                </thead>
                <tbody>
                  {(altGuaranteedOnly
                    ? altGatewayQuotes.filter(q => q.serviceLevel.toLowerCase().includes('guaranteed'))
                    : altGatewayQuotes
                  ).map((quote, idx) => (
                    <CarrierRow
                      key={`alt-${quote.carrierName}-${idx}`}
                      quote={quote}
                      onSelect={(q) => handleRowSelect(q, idx)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className={styles.pricingSection}>
          <div
            className={`${styles.pricingHeader} ${!uiState.pricingOpen ? styles.pricingHeaderClosed : ''}`}
            onClick={uiHandlers.onTogglePricing}
            role="button"
            aria-expanded={uiState.pricingOpen}
            tabIndex={0}
            onKeyDown={e => e.key === 'Enter' && uiHandlers.onTogglePricing()}
          >
            <span>{pricingLabel}</span>
            <button
              type="button"
              className={styles.accordionToggle}
              aria-label={uiState.pricingOpen ? 'Collapse pricing options' : 'Expand pricing options'}
              onClick={e => { e.stopPropagation(); uiHandlers.onTogglePricing(); }}
            >
              {uiState.pricingOpen ? '−' : '+'}
            </button>
          </div>

          <div className={uiState.pricingOpen ? styles.pricingAccordionContent : styles.accordionContentHidden}>

            <div className={styles.guaranteedOnlyRow}>
              <div className={styles.guaranteedLeftArea}>
                {isCityStateLoading && <Loader />}
              </div>
              <button
                type="button"
                className={`${styles.guaranteedBtn} ${uiState.guaranteedOnly ? styles.guaranteedBtnActive : ''}`}
                onClick={uiHandlers.onToggleGuaranteed}
                aria-pressed={uiState.guaranteedOnly}
              >
                Guaranteed Only
              </button>
            </div>

            <div className={styles.tableWrapper}>
              <table className={styles.pricingTable} role="table">
                <thead>
                  <tr>
                    <th scope="col" className={`${styles.th} ${styles.thCarrier}`}>Carrier</th>
                    <th scope="col" className={`${styles.th} ${styles.thTransit}`}>Transit Time</th>
                    <th scope="col" className={`${styles.th} ${styles.thIcons}`}></th>
                    <th scope="col" className={`${styles.th} ${styles.thLiab}`}>Max Liability Coverage</th>
                    <th scope="col" className={`${styles.th} ${styles.thRate}`}>Rate</th>
                    <th scope="col" className={`${styles.th} ${styles.thFsc}`}>FSC</th>
                    <th scope="col" className={`${styles.th} ${styles.thAccess}`}>Accessorials</th>
                    <th scope="col" className={`${styles.th} ${styles.thTotal}`}>Total</th>
                    <th scope="col" className={`${styles.th} ${styles.thSelect}`}></th>
                  </tr>
                </thead>
                <tbody>
                  {displayQuotes.length === 0 ? (
                    <tr>
                      <td colSpan={9} className={styles.noRates}>
                        No Carrier rates available for selected Origin and Destination Zip code(s).
                      </td>
                    </tr>
                  ) : (
                    displayQuotes.map((quote, idx) => (
                      <CarrierRow
                        key={`${quote.carrierName}-${idx}`}
                        quote={quote}
                        onSelect={(q) => handleRowSelect(q, idx)}
                        loading={isCityStateLoading && selectingIdx === idx}
                      />
                    ))
                  )}
                </tbody>
              </table>
              {isCityStateLoading && (
                <div className={styles.loadingOverlayWhite} />
              )}
            </div>
          </div>
        </div>

      </div>

      <CarrierSelectDetails
        open={selectDetailsOpen}
        onClose={handleSelectDetailsClose}
        mainDetails={mergedMainDetails}
        cargoDetails={resolvedCargoDetails}
        onBookWithTms={handleBookWithTms}
        isBookingLoading={isBookingLoading}
      />
    </PModal>
  );
};

export default CarrierOptionsModal;
