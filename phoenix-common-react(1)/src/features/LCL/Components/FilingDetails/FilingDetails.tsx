import React, { useState, useRef, useEffect } from 'react';

import { Box } from '@mui/material';
import { PSelect, PTextField, PToggleButton } from 'phoenix-react-lib';
import { FilingDetailsFormData } from '@/types/LCL/filing/filing.types';

interface FilingDetailsProps {
  // formData: FilingDetailsFormData;
  // onFilingByShiftTab?: () => void;
  // onFieldsChange?: (formData: any) => void;
  // onRegisterFields?: (fields: string[]) => void;
}

export const FilingDetails: React.FC<FilingDetailsProps> = ({
  // formData,
  // onFilingByShiftTab,
  // onRegisterFields,
  // onFieldsChange,
}) => {
  const fillingByOptions = [
    { label: 'Please Select', value: '' },
    { label: 'Shipco', value: 'S' },
    { label: 'Customer', value: 'C' },
  ];

  const customAdvancedRef = useRef<HTMLInputElement>(null);

  // const isFilingByShipco = formData.fillingBy === 'S';

  // useEffect(() => {
  //   const fields = Object.keys(formData);
  //   onRegisterFields?.(fields);
  // }, []);

  // useEffect(() => {
  //   onFieldsChange?.(formData);
  // }, [formData]);

  const handleFilingByKeyDown = (event: React.KeyboardEvent) => {
    if (event.shiftKey && event.key === 'Tab') {
      event.preventDefault();
      event.stopPropagation();
      // onFilingByShiftTab?.();
    }
  };

  const onFieldChange = (field: keyof FilingDetailsFormData, value: any) => {
    // onFieldsChange?.({ ...formData, [field]: value });
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', gap: 2, px: 2, py: 1 }}>
      <Box onKeyDown={handleFilingByKeyDown}>
        <PSelect
          label="Filing By"
          placeholder=""
          // value={formData?.fillingBy}
          options={fillingByOptions}
          onChange={(value: string) => onFieldChange('fillingBy', value)}
          boxSx={{ width: '200px', flex: 'none' }}
          sx={{
            padding: 0,
            paddingLeft: '3px',
            fontSize: '12px',
            fontFamily: 'Arial, Helvetica, sans-serif',
            borderRadius: '0!important',
            color: '#666',
            minHeight: '22px',
            lineHeight: '22px',
            height: '20px',
            backgroundColor: '#fff',
          }}
        />
      </Box>

      <PTextField
        label="Customs Advanced Filing"
        inputRef={customAdvancedRef}
        // value={formData?.customsAdvancedFiling}
        slotProps={{ htmlInput: { maxLength: 20 } }}
        onChange={(event: {
          target: { value: React.SetStateAction<string> };
        }) => onFieldChange('customsAdvancedFiling', event.target.value)}
        // required={isFilingByShipco}
      />
    </Box>
  );
};

export default FilingDetails;