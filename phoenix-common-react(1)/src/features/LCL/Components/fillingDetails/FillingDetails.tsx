import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { PSelect, PTextField } from 'phoenix-react-lib';
import type { FillingDetailsFormData } from './FillingDetails.type';
import styles from '../../../../styles/LCL/FillingDetails.module.css';

interface SelectOption {
  label: string;
  value: string;
}

interface FillingDetailsProps {
  formData: FillingDetailsFormData;
  fillingByOptions: SelectOption[];
  onFieldChange: (field: keyof FillingDetailsFormData, value: string) => void;
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (formData: FillingDetailsFormData) => void;
}

export const FillingDetails: React.FC<FillingDetailsProps> = ({
  formData,
  fillingByOptions,
  onFieldChange,
  onRegisterFields,
  onFieldsChange,
}) => {
  useEffect(() => {
    onRegisterFields?.(Object.keys(formData));
  }, []);

  useEffect(() => {
    onFieldsChange?.(formData);
  }, [formData]);

  const isMrnMandatory = formData.fillingBy === 'FB1';

  return (
    <Box className={styles.fillingDetailsRow}>
      <PSelect
        label="Filling By"
        value={formData.fillingBy}
        options={fillingByOptions}
        onChange={(value: string) => onFieldChange('fillingBy', value)}
        boxSx={{ width: '320px', flex: 'none' }}
        className={styles.fillingByWrap}
        required
      />
      <Box className={styles.cafWrap}>
        <PTextField
          label="Customs Advanced Filing"
          value={formData.customsAdvancedFiling}
          slotProps={{ htmlInput: { inputMode: 'numeric', pattern: '[0-9]*' } }}
          required={isMrnMandatory}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            const { value } = event.target;
            if (value === '' || /^\d*$/.test(value)) {
              onFieldChange('customsAdvancedFiling', value);
            }
          }}
        />
      </Box>
    </Box>
  );
};

export default FillingDetails;
