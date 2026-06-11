import { Box } from '@mui/material';
import {
  PDatePicker,
  PGradientButton,
  PSingleValueSearchableField,
  PToggleButton,
} from 'phoenix-react-lib';
import type {
  SailingScheduleSearchFormData,
  SailingScheduleSearchProps,
  ScheduleSuggestionItem,
} from '@/types/LCL/misc/SailingScheduleSearch.types';
import styles from '../../../../styles/LCL/SailingScheduleSearch.module.css';

function SailingScheduleSearch({
  formData,
  originSuggestions,
  destinationSuggestions,
  isDestinationDisabled,
  onFormChange,
  onOriginSelect,
  onDestinationSelect,
  onSearch,
  onClear,
  showAccurateRatesToggle,
  accurateRatesReset,
  onAccurateRatesResetChange,
}: SailingScheduleSearchProps) {
  const handleOriginSelect = (item: Record<string, unknown>) => {
    onOriginSelect(item as unknown as ScheduleSuggestionItem);
  };

  const handleDestinationSelect = (item: Record<string, unknown>) => {
    onDestinationSelect(item as unknown as ScheduleSuggestionItem);
  };

  return (
    <Box className={styles.formRoot}>
      {/* Routing Section */}
      <Box className={styles.section}>
        <Box className={styles.sectionLabel}>Routing</Box>
        <Box className={styles.sectionContent}>
          <Box className={styles.fieldGrid}>
            <Box className={styles.fieldCol}>
              <Box className={styles.fieldLabelForSailing}>Origin</Box>
              <PSingleValueSearchableField
                label=""
                value={formData.origin}
                data={originSuggestions}
                displayFields={['label']}
                columnHeaders={[]}
                onChange={(val) => onFormChange('origin', val)}
                onSelect={handleOriginSelect}
              />
            </Box>
            <Box className={styles.fieldCol}>
              <Box className={styles.fieldLabelForSailing}>Destination</Box>
              <PSingleValueSearchableField
                label=""
                value={formData.destination}
                data={destinationSuggestions}
                displayFields={['label']}
                columnHeaders={[]}
                onChange={(val) => onFormChange('destination', val)}
                onSelect={handleDestinationSelect}
                disabled={isDestinationDisabled}
              />
            </Box>
            {showAccurateRatesToggle && (
              <Box className={styles.fieldCol}>
                <Box className={styles.fieldLabel}>Show Accurate Rates</Box>
                <PToggleButton
                  label=""
                  value={accurateRatesReset ?? true}
                  onChange={onAccurateRatesResetChange ?? (() => {})}
                  yesTitle="Yes"
                  noTitle="No"
                />
              </Box>
            )}
          </Box>
        </Box>
      </Box>

      <Box className={styles.section}>
        <Box className={styles.sectionLabel}>Date</Box>
        <Box className={styles.sectionContent}>
          <Box className={styles.fieldGrid}>
            <Box className={styles.fieldCol}>
              <PDatePicker
                id="scheduleFromDate"
                label="Date From"
                value={formData.dateFrom}
                onChange={(val) => onFormChange('dateFrom', val ?? null)}
                required
              />
            </Box>
            <Box className={styles.fieldCol}>
              <PDatePicker
                id="scheduleToDate"
                label="Date To"
                value={formData.dateTo}
                onChange={(val) => onFormChange('dateTo', val ?? null)}
                required
              />
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className={styles.buttonRow}>
        <PGradientButton
          title="Go"
          onClick={onSearch}
        />
        <PGradientButton
          title="Clear All"
          onClick={onClear}
        />
      </Box>
    </Box>
  );
}

export default SailingScheduleSearch;
