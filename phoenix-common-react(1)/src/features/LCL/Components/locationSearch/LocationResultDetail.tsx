import React from 'react';
import styles from '../../../../styles/LCL/LocationSearch.module.css';
import { LocationResult } from '@/types';

interface Props {
  loc: LocationResult;
}

const LocationResultDetail: React.FC<Props> = ({ loc }) => {
  const miscFields = [
    { label: 'City', value: loc.city },
    { label: 'State', value: loc.state },
    { label: 'Postal Code', value: loc.postalCode },
    { label: 'Country Code', value: loc.countryCode },
    { label: 'Country', value: loc.country },
    { label: 'Receiving Warehouse', value: loc.warehouse },
    { label: 'Code Type', value: loc.codeType },
    { label: 'Location Type', value: loc.locationType },
    { label: 'Pier / Terminal', value: loc.pier },
  ];

  const infoFields = [
    { label: 'LCL – External Information', value: loc.lclExternalInfo },
    { label: 'LCL – Internal Information', value: loc.lclInternalInfo },
    { label: 'FCL – External Information', value: loc.fclExternalInfo },
    { label: 'FCL – Internal Information', value: loc.fclInternalInfo },
  ];

  const userFields = [
    { label: 'Created By', value: loc.inputUser },
    { label: 'Created On', value: loc.inputDate },
    { label: 'Updated By', value: loc.updateUser },
    { label: 'Updated On', value: loc.updateDate },
  ];

  return (
    <div className={styles.detailWrapper}>
      <div className={styles.detailRow}>
        <div className={styles.detailLabelCol}>Misc</div>
        <div className={styles.detailContentCol}>
          <div className={styles.detailGrid3}>
            {miscFields.map((f, i) => (
              <div key={i}>
                <div className={styles.detailFieldLabel}>{f.label}</div>
                <div className={styles.detailFieldValue}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.detailRow}>
        <div className={styles.detailLabelCol}>Information</div>
        <div className={styles.detailContentCol}>
          {infoFields.map((f, i) => (
            <div key={i} className={styles.infoFieldItem}>
              <div className={styles.detailFieldLabel}>{f.label}</div>
              <div
                className={styles.detailFieldValue}
                dangerouslySetInnerHTML={{ __html: f.value }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.detailRowNoBottom}>
        <div className={styles.detailLabelCol}>User</div>
        <div className={styles.detailContentCol}>
          <div className={styles.detailGrid4}>
            {userFields.map((f, i) => (
              <div key={i}>
                <div className={styles.detailFieldLabel}>{f.label}</div>
                <div className={styles.detailFieldValue}>{f.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationResultDetail;
