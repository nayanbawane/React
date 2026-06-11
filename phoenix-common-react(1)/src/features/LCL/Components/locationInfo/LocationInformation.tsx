import React from 'react';
import styles from '../../../../styles/LCL/LocationInformation.module.css';

interface LocationInformationProps {
  data?: {
    publicInfo?: string;
    privateInfo?: string;
  };
  loading?: boolean;
}

const LocationInformation: React.FC<LocationInformationProps> = ({ data, loading }) => {
  return (
    <div className={styles.container}>

      <div className={styles.row}>
        <div className={styles.label}>Location Information(Public)</div>
        <div className={styles.value}>
          {!loading && data?.publicInfo}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.label}>Location Information(Private)</div>
        <div className={styles.value}>
          {!loading && data?.privateInfo}
        </div>
      </div>

    </div>
  );
};

export default LocationInformation;