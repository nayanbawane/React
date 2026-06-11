import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { PGradientButton, PModal, Accordion } from 'phoenix-react-lib';
import Loader from '../../Loader/Loader';

import type {
  CarrierSelectDetailsProps,
  CarrierMainDetails,
  TmsOrderMainBean,
  TmsOrderCargoAndPricingBean,
  TmsOrderHazardousBean,
  TmsOrderDimensionBean,
  Commodity,
  AccordionItem,
  AccordionProps,
} from './CarrierSelectDetails.types';
import styles from '../../../../../styles/LCL/CarrierSelectDetails.module.css';
import toolbarStyles from '../../../../../styles/LCL/ToolBar.module.css';
import iconRacedit from '../../../../../assets/icon-racedithover.png';
import iconRacsave from '../../../../../assets/icon-racsavehover.png';

const EMAIL_REGEX = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

interface ValidationResult {
  errors: string[];
  warnings: string[];
  fieldErrors: Set<string>;
}

function validateEmailField(
  email: string,
  fieldKey: string,
  result: ValidationResult
): void {
  const trimmed = email.trim();
  if (!trimmed) return;

  if (trimmed.includes('/')) {
    result.warnings.push('Multiple emails should be comma(,) separated.');
  } else if (trimmed.includes(',')) {
    const hasInvalid = trimmed.split(',').some(e => !EMAIL_REGEX.test(e.trim()));
    if (hasInvalid) {
      result.errors.push('Please enter a valid email address.');
      result.fieldErrors.add(fieldKey);
    }
  } else if (!EMAIL_REGEX.test(trimmed)) {
    result.errors.push('Please enter a valid email address.');
    result.fieldErrors.add(fieldKey);
  }
}

function validateForBooking(
  data: CarrierMainDetails | undefined,
  is3gTmsEnabled: boolean
): ValidationResult {
  const result: ValidationResult = { errors: [], warnings: [], fieldErrors: new Set() };
  const origin = data?.origin ?? {};
  const destination = data?.destination ?? {};

  if (!origin.companyName?.trim()) {
    result.errors.push('Origin Company Name is mandatory.');
    result.fieldErrors.add('origin.companyName');
  }
  if (!origin.streetAddress?.trim()) {
    result.errors.push('Please enter some text for Origin Street Address.');
    result.fieldErrors.add('origin.streetAddress');
  }
  if (!origin.contactName?.trim()) {
    result.errors.push('Origin Contact Name is mandatory.');
    result.fieldErrors.add('origin.contactName');
  }
  if (!origin.contactPhone?.trim()) {
    result.errors.push('Origin Contact Phone is mandatory.');
    result.fieldErrors.add('origin.contactPhone');
  }
  if (is3gTmsEnabled) {
    validateEmailField(origin.contactEmail ?? '', 'origin.contactEmail', result);
  }

  if (!destination.companyName?.trim()) {
    result.errors.push('Destination Company Name is mandatory.');
    result.fieldErrors.add('destination.companyName');
  }
  if (!destination.streetAddress?.trim()) {
    result.errors.push('Please enter some text for Destination Street Address.');
    result.fieldErrors.add('destination.streetAddress');
  }
  if (is3gTmsEnabled) {
    validateEmailField(destination.contactEmail ?? '', 'destination.contactEmail', result);
  }

  return result;
}

const SECTION_IDS = ['mainDetails', 'cargoPricing'] as const;
const AIR_BOOKING_SHIPMENT = 'AIR_BOOKING_SHIPMENT';

const UNIT_MAP: Record<string, string> = {
  I: 'Inches', F: 'Feet', C: 'Centimeters', M: 'Meters',
};

const SUMMARY_HEADERS = [
  'Commodity Description',
  'Total Number of Pieces',
  'Total Weight (Kg)',
  'Total Weight (Lbs)',
  'Hazardous',
];
const SUMMARY_WIDTHS = ['40%', '20%', '15%', '15%', '10%'];

const HAZ_HEADERS = ['UN Number', 'IMCO Class', 'Packing Group', 'Emergency Contact #'];

const PRICING_HEADERS = ['Rate', 'Fuel Surcharge', 'Accessorials', 'Total Price'];

const DIM_COLS_STANDARD = [
  { label: 'Length', width: '7%' },
  { label: 'Width', width: '7%' },
  { label: 'Height', width: '7%' },
  { label: 'Measure', width: '7%' },
  { label: 'Number of Pieces', width: '15%' },
  { label: 'Types of Packaging', width: '15%' },
  { label: 'Class', width: '7%' },
  { label: 'Weight (Kg)', width: '10%' },
  { label: 'Weight (Lbs)', width: '10%' },
  { label: 'Markings', width: '15%' },
];

const DIM_COLS_3G = [
  { label: 'Length', width: '6%' },
  { label: 'Width', width: '6%' },
  { label: 'Height', width: '6%' },
  { label: 'Measure', width: '6%' },
  { label: 'Units', width: '6%' },
  { label: 'Types of Packaging', width: '10%' },
  { label: 'Inner Package Count', width: '12%' },
  { label: 'Inner Types of Packaging', width: '10%' },
  { label: 'Class', width: '6%' },
  { label: 'Weight (Kg)', width: '10%' },
  { label: 'Weight (Lbs)', width: '10%' },
  { label: 'Markings', width: '12%' },
];

function formatPrice(n: number): string {
  return '$' + n.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function tdClass(colIndex: number, totalCols: number): string {
  if (colIndex === 0) return styles.tdFirst;
  if (colIndex === totalCols - 1) return styles.tdLast;
  return styles.tdMiddle;
}

const CarrierSelectDetails: React.FC<CarrierSelectDetailsProps> = ({
  open,
  onClose,
  mainDetails,
  cargoDetails,
  is3gTmsEnabled = false,
  isModifyHandlingEnabled = false,
  onBookWithTms,
  isBookingLoading = false,
}) => {
  const [openSections, setOpenSections] = useState<string[]>([...SECTION_IDS]);
  const [validationState, setValidationState] = useState<ValidationResult | null>(null);
  const [localData, setLocalData] = useState<CarrierMainDetails>(mainDetails ?? {});

  useEffect(() => {
    if (!open) {
      setValidationState(null);
      return;
    }
    setLocalData(mainDetails ?? {});
  }, [open]);

  const handleOriginChange = (field: string, value: string) => {
    setLocalData(prev => ({
      ...prev,
      origin: { ...(prev.origin ?? {}), [field]: value },
    }));
  };

  const handleDestinationChange = (field: string, value: string) => {
    setLocalData(prev => ({
      ...prev,
      destination: { ...(prev.destination ?? {}), [field]: value },
    }));
  };

  const handleBookClick = () => {
    const result = validateForBooking(localData, is3gTmsEnabled);
    if (result.errors.length > 0) {
      setValidationState(result);
      return;
    }
    setValidationState(result.warnings.length > 0 ? result : null);
    onBookWithTms?.(localData);
  };

  const handleToggleSection = (id: string) => {
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const allOpen = openSections.length === SECTION_IDS.length;
  const buttonTitle = allOpen ? 'Close All' : 'Open All';

  const handleToggleAll = () => {
    if (allOpen) {
      setOpenSections([]);
    } else {
      setOpenSections([...SECTION_IDS]);
    }
  };

  const accordionItems: AccordionItem[] = [
    {
      id: SECTION_IDS[0],
      label: 'Main Details',
      progressValue: 0,
      icon: false,
      content: (
        <MainDetailsContent
          data={localData}
          fieldErrors={validationState?.fieldErrors}
          onOriginChange={handleOriginChange}
          onDestinationChange={handleDestinationChange}
        />
      ),
    },
    {
      id: SECTION_IDS[1],
      label: 'Cargo And Pricing Details',
      progressValue: 0,
      icon: false,
      content: (
        <CargoPricingContent
          data={cargoDetails}
          is3gTmsEnabled={is3gTmsEnabled}
          isModifyHandlingEnabled={isModifyHandlingEnabled}
        />
      ),
    },
  ];

  const accordionProps: AccordionProps = {
    id: 'carrier-select-accordion',
    accordionData: accordionItems,
    openItems: openSections,
    toggleItem: handleToggleSection,
  };

  return (
    <PModal
      title="Order Overview"
      open={open}
      isCloseIcon
      onClose={onClose}
      width={1050}
      height="90vh"
      sx={{ backgroundColor: 'white' }}
      contentSx={{ pt: '4px', px: '0px', pb: '4px' }}
    >
      <Box className={styles.actionBar}>
        <PGradientButton title={buttonTitle} className={toolbarStyles.toolbarButton} onClick={handleToggleAll} />
        {isBookingLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px' }}>
            <Loader />
          </div>
        ) : (
          <PGradientButton title="Book With TMS" className={toolbarStyles.toolbarButton} onClick={handleBookClick} />
        )}
        <PGradientButton title="Cancel" className={toolbarStyles.toolbarButton} onClick={onClose} />
      </Box>

      {validationState && (validationState.errors.length > 0 || validationState.warnings.length > 0) && (
        <Box className={styles.validationNotification}>
          {validationState.errors.map((msg, i) => (
            <div key={`e-${i}`} className={styles.validationMessage}>• {msg}</div>
          ))}
          {validationState.warnings.map((msg, i) => (
            <div key={`w-${i}`} className={styles.validationMessage}>• {msg}</div>
          ))}
        </Box>
      )}

      <Box className={styles.accordionWrapper}>
        <Accordion {...accordionProps} />
      </Box>
    </PModal>
  );
};

export default CarrierSelectDetails;

interface FieldDisplayProps {
  label: string | null;
  value?: string;
  isRequired?: boolean;
  hasError?: boolean;
  hasEditIcon?: boolean;
  multiline?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

function FieldDisplay({
  label,
  value,
  isRequired = false,
  hasError = false,
  hasEditIcon = false,
  multiline = false,
  className,
  onChange,
}: FieldDisplayProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState('');

  const handleEdit = () => {
    setLocalValue(value ?? '');
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    onChange?.(localValue);
  };

  const valueClass = [
    styles.fieldValue,
    (isRequired || hasError) ? styles.fieldValueRequired : '',
    multiline ? styles.fieldValueMultiline : '',
  ].filter(Boolean).join(' ');

  const fieldContent = isEditing ? (
    <Box className={valueClass}>
      {multiline ? (
        <textarea
          className={`${styles.fieldInput} ${styles.fieldInputMultiline} ${styles.bkg_form_input_text}`}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          autoFocus
        />
      ) : (
        <input
          className={`${styles.fieldInput} ${styles.bkg_form_input_text}`}
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          autoFocus
        />
      )}
    </Box>
  ) : (
    <Box className={valueClass}>
      <span className={`${styles.fieldText} ${multiline ? styles.fieldTextMultiline : ''}`}>
        {value ?? ''}
      </span>
    </Box>
  );

  const fieldBox = (
    <Box className={styles.fieldGroup}>
      <Box component="label" className={`${styles.fieldLabel} ${className ?? ''}`}>{label}</Box>
      {fieldContent}
    </Box>
  );

  if (!hasEditIcon) {
    return fieldBox;
  }

  return (
    <>
      {fieldBox}
      <img
        src={isEditing ? iconRacsave : iconRacedit}
        alt={isEditing ? `Save ${label ?? ''}` : `Edit ${label ?? ''}`}
        className={styles.editIconBtn}
        onClick={isEditing ? handleSave : handleEdit}
        style={{ cursor: 'pointer' }}
      />
    </>
  );
}

function MainDetailsContent({
  data,
  fieldErrors,
  onOriginChange,
  onDestinationChange,
}: {
  data?: CarrierMainDetails;
  fieldErrors?: Set<string>;
  onOriginChange?: (field: string, value: string) => void;
  onDestinationChange?: (field: string, value: string) => void;
}) {
  const d = data ?? {};
  const origin = d.origin ?? {};
  const destination = d.destination ?? {};
  const fe = (key: string) => fieldErrors?.has(key) ?? false;
  const oc = (field: string) => (v: string) => onOriginChange?.(field, v);
  const dc = (field: string) => (v: string) => onDestinationChange?.(field, v);

  return (
    <Box className={styles.mainDetailsWrapper}>
      <Box className={styles.topRow}>
        <FieldDisplay className={styles.common_booking_form_label} label="Customer PO Number" value={d.customerPoNumber} />
        <FieldDisplay className={styles.common_booking_form_label} label="Shipper Reference Number" value={d.shipperReferenceNumber} />
        <FieldDisplay className={styles.common_booking_form_label} label="Load Release Number" value={d.loadReleaseNumber} />
        <FieldDisplay className={styles.common_booking_form_label} label="TMS Carrier" value={d.tmsCarrier} />
      </Box>

      <Box className={styles.locationGrid}>

        <Box className={styles.locationSection}>
          <Box className={styles.topRowTitle}>Origin</Box>
          <Box className={styles.locationFields}>

            <Box className={styles.locationRow}>
              <FieldDisplay className={styles.common_booking_form_label} label="Company Name" value={origin.companyName} hasEditIcon hasError={fe('origin.companyName')} onChange={oc('companyName')} />
              <FieldDisplay className={styles.common_booking_form_label} label="City" value={origin.city} />
            </Box>

            <Box className={styles.locationRow}>
              <FieldDisplay className={styles.common_booking_form_label} label="Street Address" value={origin.streetAddress} multiline hasEditIcon hasError={fe('origin.streetAddress')} onChange={oc('streetAddress')} />
              <FieldDisplay className={styles.common_booking_form_label} label="State" value={origin.state} />
            </Box>

            <Box className={styles.locationRow}>
              <Box className={styles.contactGroup}>
                <FieldDisplay className={styles.common_booking_form_label} label="Contact Name" value={origin.contactName} hasEditIcon hasError={fe('origin.contactName')} onChange={oc('contactName')} />
                <FieldDisplay className={styles.common_booking_form_label} label="Contact Phone" value={origin.contactPhone} hasEditIcon hasError={fe('origin.contactPhone')} onChange={oc('contactPhone')} />
              </Box>
              <span />
              <FieldDisplay className={styles.common_booking_form_label} label="Zip Code" value={origin.zipCode} />
            </Box>

            <Box className={styles.locationRow}>
              <FieldDisplay className={styles.common_booking_form_label} label="Contact Email" value={origin.contactEmail} hasEditIcon hasError={fe('origin.contactEmail')} onChange={oc('contactEmail')} />
            </Box>

            <Box className={styles.locationRow}>
              <Box className={styles.pickupGroup}>
                <FieldDisplay className={styles.common_booking_form_label} label="Pickup Date" value={origin.pickupDate} />
                <FieldDisplay className={styles.common_booking_form_label} label="Pickup Time" value={origin.pickupTimeFrom} />
                <FieldDisplay className={styles.common_booking_form_label} label={null} value={origin.pickupTimeTo} />
              </Box>
            </Box>

            <Box className={styles.locationRow}>
              <Box className={styles.fieldGroup}>
                <div className={styles.accessorialsLabel}>Accessorials</div>
                <div className={styles.accessorialsValue}>
                  <span className={styles.fieldText}>{origin.accessorials ?? ''}</span>
                </div>
              </Box>
            </Box>

          </Box>
        </Box>

        <Box className={styles.locationSection}>
          <Box className={styles.topRowTitle}>Destination</Box>
          <Box className={styles.locationFields}>

            <Box className={styles.locationRow}>
              <FieldDisplay className={styles.common_booking_form_label} label="Company Name" value={destination.companyName} hasEditIcon hasError={fe('destination.companyName')} onChange={dc('companyName')} />
              <FieldDisplay className={styles.common_booking_form_label} label="City" value={destination.city} />
            </Box>

            <Box className={styles.locationRow}>
              <FieldDisplay className={styles.common_booking_form_label} label="Street Address" value={destination.streetAddress} multiline hasEditIcon hasError={fe('destination.streetAddress')} onChange={dc('streetAddress')} />
              <FieldDisplay className={styles.common_booking_form_label} label="State" value={destination.state} />
            </Box>

            <Box className={styles.locationRow}>
              <Box className={styles.contactGroup}>
                <FieldDisplay className={styles.common_booking_form_label} label="Contact Name" value={destination.contactName} hasEditIcon onChange={dc('contactName')} />
                <FieldDisplay className={styles.common_booking_form_label} label="Contact Phone" value={destination.contactPhone} hasEditIcon onChange={dc('contactPhone')} />
              </Box>
              <span />
              <FieldDisplay className={styles.common_booking_form_label} label="Zip Code" value={destination.zipCode} />
            </Box>

            <Box className={styles.locationRow}>
              <FieldDisplay className={styles.common_booking_form_label} label="Contact Email" value={destination.contactEmail} hasEditIcon hasError={fe('destination.contactEmail')} onChange={dc('contactEmail')} />
            </Box>

            <Box className={styles.locationRow}>
              <FieldDisplay className={styles.common_booking_form_label} label="Delivery Estimated Date" value={destination.deliveryEstimatedDate} />
            </Box>

            <Box className={styles.locationRow}>
              <Box className={styles.fieldGroup}>
                <div className={styles.accessorialsLabel}>Accessorials</div>
                <div className={styles.accessorialsValue}>
                  <span className={styles.fieldText}>{destination.accessorials ?? ''}</span>
                </div>
              </Box>
            </Box>

          </Box>
        </Box>

      </Box>
    </Box>
  );
}

function CargoPricingContent({
  data,
  is3gTmsEnabled = false,
  isModifyHandlingEnabled = false,
}: {
  data?: TmsOrderMainBean;
  is3gTmsEnabled?: boolean;
  isModifyHandlingEnabled?: boolean;
}) {
  const cargo = data?.tmsOrderCargoAndPricingBean;
  const isAirBooking = data?.moduleCode?.toUpperCase() === AIR_BOOKING_SHIPMENT;
  const use3g = isAirBooking && is3gTmsEnabled && isModifyHandlingEnabled;
  const dimCols = use3g ? DIM_COLS_3G : DIM_COLS_STANDARD;
  const isHazardous = cargo?.hazardous?.toUpperCase() === 'YES';
  const commodities = data?.bookDomesticShipmentInputBean?.commodities ?? [];
  const dims = cargo?.tmsOrderDimensionBeans ?? [];
  const totalAccessorials = (cargo?.priceAccessorials ?? []).reduce(
    (sum, a) => sum + a.accessorialPrice,
    0
  );

  return (
    <Box className={styles.cargoWrapper}>
      <SummarySection cargo={cargo} />
      {isHazardous && <HazardousSection beans={cargo?.tmsOrderHazardousBean ?? []} />}
      <DimensionsSection
        dims={dims}
        commodities={commodities}
        use3g={use3g}
        dimCols={dimCols}
        isAirBooking={isAirBooking}
      />
      <PricingSection
        rate={cargo?.rate ?? ''}
        fuelSurcharge={cargo?.priceFuelSurcharge ?? 0}
        accessorials={totalAccessorials}
        total={cargo?.priceTotal ?? 0}
      />
    </Box>
  );
}

function SummarySection({ cargo }: { cargo?: TmsOrderCargoAndPricingBean }) {
  const hazardousDisplay = cargo?.hazardous === 'YES' ? 'Y' : cargo?.hazardous === 'NO' ? 'N' : '';
  const values = [
    cargo?.commodityDescription ?? '',
    cargo?.totalNumberOfPieces ?? '',
    cargo?.totalWeightKg ?? '',
    cargo?.totalWeightLbs ?? '',
    hazardousDisplay,
  ];
  const total = SUMMARY_HEADERS.length;

  return (
    <table className={styles.formTable} style={{ borderSpacing: '1px' }}>
      <colgroup>
        {SUMMARY_WIDTHS.map((w, i) => <col key={i} style={{ width: w }} />)}
      </colgroup>
      <thead>
        <tr>
          {SUMMARY_HEADERS.map((h, i) => (
            <th key={i} className={tdClass(i, total)}>
              <span className={styles.colHeader}>{h}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {values.map((v, i) => (
            <td key={i} className={tdClass(i, total)}>
              <span className={styles.colContent}>{v}</span>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function HazardousSection({ beans }: { beans: TmsOrderHazardousBean[] }) {
  const total = HAZ_HEADERS.length;

  return (
    <table className={styles.hazardousTable} style={{ borderSpacing: '1px' }}>
      <colgroup>
        {HAZ_HEADERS.map((_, i) => <col key={i} style={{ width: '25%' }} />)}
      </colgroup>
      <thead>
        <tr>
          {HAZ_HEADERS.map((h, i) => (
            <th key={i} className={tdClass(i, total)}>
              <span className={styles.colHeader}>{h}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {beans.map((bean, ri) => (
          <tr key={`${bean.unNumber}-${bean.imcoClass}-${ri}`}>
            {[bean.unNumber, bean.imcoClass, bean.packagingGroup, bean.emergencyCotact].map((v, i) => (
              <td key={i} className={tdClass(i, total)}>
                <span className={`${styles.colContent} ${styles.withLine}`}>{v ?? ''}</span>
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DimensionsSection({
  dims,
  commodities,
  use3g,
  dimCols,
  isAirBooking,
}: {
  dims: TmsOrderDimensionBean[];
  commodities: Commodity[];
  use3g: boolean;
  dimCols: typeof DIM_COLS_STANDARD;
  isAirBooking: boolean;
}) {
  const total = dimCols.length;

  return (
    <table className={styles.formTable} style={{ borderSpacing: '1px' }}>
      <colgroup>
        {dimCols.map((c, i) => <col key={i} style={{ width: c.width }} />)}
      </colgroup>
      <thead>
        <tr>
          {dimCols.map((c, i) => (
            <th key={i} className={tdClass(i, total)}>
              <span className={styles.colHeader}>{c.label}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {dims.map((dim, ri) => {
          const comIdx = isAirBooking ? ri : 0;
          const com = commodities[comIdx] ?? { packagingType: '', additionalMarkings: '' };
          const cells = use3g
            ? [
              dim.length, dim.width, dim.height, UNIT_MAP[dim.unit] ?? dim.unit,
              dim.pieces, com.packagingType,
              com.piecesTotal ?? '', com.piecespackagingType ?? '',
              dim.tmsClass, dim.kg, dim.lbs, com.additionalMarkings,
            ]
            : [
              dim.length, dim.width, dim.height, UNIT_MAP[dim.unit] ?? dim.unit,
              dim.pieces, com.packagingType,
              dim.tmsClass, dim.kg, dim.lbs, com.additionalMarkings,
            ];

          return (
            <tr key={`${dim.length}-${dim.width}-${dim.height}-${ri}`}>
              {cells.map((v, i) => (
                <td key={i} className={tdClass(i, total)}>
                  <span className={`${styles.colContent} ${styles.withLine}`}>
                    {String(v ?? '')}
                  </span>
                </td>
              ))}
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function PricingSection({
  rate,
  fuelSurcharge,
  accessorials,
  total,
}: {
  rate: string;
  fuelSurcharge: number;
  accessorials: number;
  total: number;
}) {
  const values = [
    rate,
    formatPrice(fuelSurcharge),
    formatPrice(accessorials),
    formatPrice(total),
  ];
  const n = PRICING_HEADERS.length;

  return (
    <table className={styles.formTable} style={{ borderSpacing: '1px' }}>
      <colgroup>
        {PRICING_HEADERS.map((_, i) => <col key={i} style={{ width: '25%' }} />)}
      </colgroup>
      <thead>
        <tr>
          {PRICING_HEADERS.map((h, i) => (
            <th key={i} className={`${tdClass(i, n)} ${styles.pricingCell}`}>
              <span className={styles.colHeader}>{h}</span>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        <tr>
          {values.map((v, i) => (
            <td key={i} className={`${tdClass(i, n)} ${i < n - 1 ? styles.pricingValueCell : styles.pricingCell}`}>
              <span className={styles.colContent}>{v}</span>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}
