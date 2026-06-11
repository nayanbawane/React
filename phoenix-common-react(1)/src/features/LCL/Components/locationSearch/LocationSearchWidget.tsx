import React from 'react';
import { PTextField, PSelect } from 'phoenix-react-lib';
import type { LocationSearchFormValues } from './types';
import styles from '../../../../styles/LCL/LocationSearch.module.css';

const LOCATION_TYPE_OPTIONS = [
  { label: 'Select', value: '-1' },
  { label: 'City', value: '0' },
  { label: 'Port', value: '1' },
  { label: 'State', value: '2' },
  { label: 'Country', value: '3' },
  { label: 'Group', value: '4' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
  { label: 'All', value: 'ALL' },
];

interface Props {
  values: LocationSearchFormValues;
  onChange: (field: keyof LocationSearchFormValues, value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  loading: boolean;
}

export const LocationSearchWidget: React.FC<Props> = ({
  values,
  onChange,
  onSearch,
  onReset,
  loading,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSearch();
  };

  return (
    <div onKeyDown={handleKeyDown}>
      <div className={styles.rowWithTop}>
        <div className={styles.sectionTitleColCenter}>Location</div>
        <div className={`${styles.sectionContent} ${styles.fieldRow}`}>
          <PTextField
            label="Code"
            value={values.code}
            onChange={(e) => onChange('code', e.target.value)}
            size="small"
            boxSx={{ width: 160 }}
          />
          <PTextField
            label="Name"
            value={values.name}
            onChange={(e) => onChange('name', e.target.value)}
            size="small"
            boxSx={{ width: 150 }}
          />
          <PTextField
            label="Country"
            value={values.country}
            onChange={(e) => onChange('country', e.target.value)}
            size="small"
            boxSx={{ width: 150 }}
          />
          <PTextField
            label="UN Code"
            value={values.unCode}
            onChange={(e) => onChange('unCode', e.target.value)}
            size="small"
            boxSx={{ width: 150 }}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.sectionTitleColCenter}>Type</div>
        <div className={`${styles.sectionContent} ${styles.fieldRow}`}>
          <PSelect
            label="Location Type"
            value={values.locationType}
            onChange={(v) => onChange('locationType', v)}
            options={LOCATION_TYPE_OPTIONS}
            boxSx={{ width: 162 }}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.sectionTitleColCenter}>Status</div>
        <div className={`${styles.sectionContent} ${styles.fieldRow}`}>
          <PSelect
            label="Status"
            value={values.status}
            onChange={(v) => onChange('status', v)}
            options={STATUS_OPTIONS}
            boxSx={{ width: 337 }}
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.sectionTitleColTop}>Miscellaneous</div>
        <div className={styles.sectionContent}>
          <div className={styles.fieldRow}>
            <PTextField
              label="Export Region"
              value={values.exportRegion}
              onChange={(e) => onChange('exportRegion', e.target.value)}
              size="small"
              boxSx={{ width: 160 }}
            />
            <PTextField
              label="Import Region"
              value={values.importRegion}
              onChange={(e) => onChange('importRegion', e.target.value)}
              size="small"
              boxSx={{ width: 150 }}
            />
            <PTextField
              label="LCL Agent"
              value={values.lclAgent}
              onChange={(e) => onChange('lclAgent', e.target.value)}
              size="small"
              boxSx={{ width: 150 }}
            />
            <PTextField
              label="FCL Agent"
              value={values.fclAgent}
              onChange={(e) => onChange('fclAgent', e.target.value)}
              size="small"
              boxSx={{ width: 150 }}
            />
          </div>
          <div className={styles.miscFieldsBottom}>
            <PTextField
              label="Deconsolidation Point"
              value={values.deconsolidationPoint}
              onChange={(e) => onChange('deconsolidationPoint', e.target.value)}
              size="small"
              boxSx={{ width: 160 }}
            />
          </div>
        </div>
      </div>

      <div className={styles.buttonArea}>
        <button
          className={styles.btn}
          onClick={onSearch}
          disabled={loading}
        >
          {loading ? 'Searching…' : 'Go'}
        </button>

        <button
          className={styles.btn}
          onClick={onReset}
          disabled={loading}
        >
          Clear All
        </button>
      </div>
    </div>
  );
};
