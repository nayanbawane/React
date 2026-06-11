import React from 'react';
import { Typography } from '@mui/material';
import styles from '../../../../styles/LCL/RateDetails.module.css';
import {
  LocationField,
  ShipmentSummaryData,
} from '../../../../types/LCL/RateDetails/RateDetails.types';

export interface PRateDetailsShipmentSummeryProps {
  moduleType: string;
  data?: ShipmentSummaryData;
}

interface DisplayField {
  label: string;
  value: string;
}

// Mirrors GWT StringUtility.toNormalCamelCase — first letter of each word uppercased
const toTitleCase = (str: string): string =>
  str
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

// Mirrors GWT setRoutingData: "CODE - Name" or "" when name is absent
const formatField = (field?: LocationField): string => {
  if (!field?.name) return '';
  return `${field.code} - ${toTitleCase(field.name)}`;
};

const getBkgQuoFields = (data?: ShipmentSummaryData): DisplayField[] => [
  { label: 'Bill to Customer', value: formatField(data?.billToCustomer) },
  { label: 'Place of Receipt', value: formatField(data?.placeOfReceipt) },
  { label: 'Port of Load', value: formatField(data?.portOfLoad) },
  { label: 'Port of Discharge', value: formatField(data?.portOfDischarge) },
  { label: 'Place of Delivery', value: formatField(data?.placeOfDelivery) },
  {
    label: 'Place of Deconsolidation',
    value: formatField(data?.placeOfDeconsolidation),
  },
];

const getFields = (
  moduleType: string,
  data?: ShipmentSummaryData
): DisplayField[] => {
  switch (moduleType) {
    case 'BOOKING':
    case 'QUOTE':
      return getBkgQuoFields(data);
    // Future: case 'BOL': return getBolFields(data);
    // Future: case 'ARN': return getArnFields(data);
    default:
      return getBkgQuoFields(data);
  }
};

const PRateDetailsShipmentSummery: React.FC<PRateDetailsShipmentSummeryProps> =
  ({ moduleType, data }) => {
    const fields = getFields(moduleType, data);

    return (
      <div className={styles.shipmentSummarySection}>
        <Typography className={styles.shipmentSummaryTitle}>
          Shipment Summary Details
        </Typography>
        <div className={styles.shipmentSummaryColumns}>
          {fields.map((item) => (
            <div key={item.label} className={styles.shipmentSummaryCol}>
              <Typography className={styles.shipmentSummaryLabel}>
                {item.label}
              </Typography>
              <Typography className={styles.shipmentSummaryValue}>
                {item.value || ''}
              </Typography>
            </div>
          ))}
        </div>
      </div>
    );
  };

export default PRateDetailsShipmentSummery;
