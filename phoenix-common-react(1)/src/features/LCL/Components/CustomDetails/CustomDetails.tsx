import React, { useState, useRef, useEffect } from 'react';

import { Box } from '@mui/material';
import { PSelect, PTextField, PToggleButton } from 'phoenix-react-lib';
import { CustomDetailsFormData } from './CustomDetails.type';

interface CustomDetailsProps {
  formData: CustomDetailsFormData;
  showSCACCode?: boolean;
  onFilingTypeShiftTab?: () => void;
  onITNNumberTab?: () => void;
  ucrEnabled?: boolean;
  mrnEnabled?: boolean;
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (formData: any) => void;
}

export const CustomDetails: React.FC<CustomDetailsProps> = ({
  formData,
  showSCACCode = false,
  onFilingTypeShiftTab,
  onITNNumberTab,
  ucrEnabled = false,
  onRegisterFields,
  onFieldsChange,
}) => {
  const fillingTypeOptions = [
    { label: 'Y - Yes', value: 'Y' },
    { label: 'N - No', value: 'N' },
  ];

  const fillingAsOptions = [
    { label: 'Please Select', value: '' },
    {
      label: 'Shipment value above $2500',
      value: 'Y',
    },
    {
      label: 'Shipment value under $2500',
      value: 'N',
    },
  ];

  const itnRef = useRef<HTMLInputElement>(null);

  const isFilingTypeYes = formData.fillingType === 'Y';
  const isShipmentAbove2500 = formData.fillingAs === 'Y';

  const fillingByOptions = [
    { label: 'Please Select', value: '' },
    { label: 'Shipco', value: 'Shipco' },
    { label: 'Customer', value: 'Customer' },
  ];

  useEffect(() => {
    const fields = Object.keys(formData);
    onRegisterFields?.(fields);
  }, []);

  useEffect(() => {
    onFieldsChange?.(formData);
  }, [formData]);

  const handleFilingTypeKeyDown = (event: React.KeyboardEvent) => {
    if (event.shiftKey && event.key === 'Tab') {
      event.preventDefault();
      event.stopPropagation();
      onFilingTypeShiftTab?.();
    }
  };

  const handleFillingAsChange = (value: string) => {
    onFieldChange('fillingAs', value);
    if (value === 'Y') {
      setTimeout(() => {
        itnRef.current?.focus();
      }, 0);
    }
  };

  const handleITNNumberKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Tab' && !event.shiftKey) {
      event.preventDefault();
      event.stopPropagation();
      onITNNumberTab?.();
    }
  };

  const onFieldChange = (field: keyof CustomDetailsFormData, value: any) => {
    onFieldsChange?.({ ...formData, [field]: value });
  };

  if (ucrEnabled) {
    return (
      <Box sx={{ width: '100%', display: 'flex', gap: 2, px: 2, py: 1 }}>
        <PSelect
          label="Filing By"
          value={formData.fillingByUCR}
          options={fillingByOptions}
          onChange={(value: string) => onFieldChange('fillingByUCR', value)}
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

        <PTextField
          label="UCR Number"
          value={formData.ucrNumberUCR}
          slotProps={{ htmlInput: { maxLength: 40 } }}
          onChange={(event: { target: { value: any } }) => {
            const value = event.target.value;
            if (/^[a-zA-Z0-9-/]*$/.test(value)) {
              onFieldChange('ucrNumberUCR', value);
            }
          }}
          onBlur={(event: { target: { value: any } }) => {
            const value = event.target.value;
            const cleanedText = value.replace(/[^a-zA-Z0-9-/]/g, '');
            if (value !== cleanedText) {
              onFieldChange('ucrNumberUCR', cleanedText);
            }
          }}
          required={formData.masterUCR}
        />

        <PToggleButton
          id="toggle-default"
          label="Master UCR"
          value={formData.masterUCR}
          onChange={() => onFieldChange('masterUCR', !formData.masterUCR)}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', gap: 2, px: 2, py: 1 }}>
      <Box onKeyDown={handleFilingTypeKeyDown}>
        <PSelect
          placeholder=""
          value={formData.fillingType}
          options={fillingTypeOptions}
          onChange={(value: string) => onFieldChange('fillingType', value)}
          label="Filing Type"
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

      {showSCACCode ? (
        <PTextField
          label="SCAC Code"
          value={formData.SCACCodeText}
          slotProps={{ htmlInput: { maxLength: 4 } }}
          onChange={(event: {
            target: { value: React.SetStateAction<string> };
          }) => onFieldChange('SCACCodeText', event.target.value)}
          required={isFilingTypeYes}
        />
      ) : (
        <Box sx={{ width: 198 }}></Box>
      )}

      <PSelect
        placeholder=""
        value={formData.fillingAs}
        options={fillingAsOptions}
        onChange={handleFillingAsChange}
        label="Filing As"
        required={isFilingTypeYes}
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

      <PTextField
        inputRef={itnRef}
        value={formData.ITNNumber}
        slotProps={{ htmlInput: { maxLength: 20 } }}
        onChange={(event: {
          target: { value: React.SetStateAction<string> };
        }) => onFieldChange('ITNNumber', event.target.value)}
        label="ITN number"
        onKeyDown={handleITNNumberKeyDown}
        required={isShipmentAbove2500}
      />
    </Box>
  );
};

export default CustomDetails;

// import React, { useRef, useEffect } from 'react';
// import { Box } from '@mui/material';
// import { PSelect, PTextField, PToggleButton } from 'phoenix-react-lib';
// import { CustomDetailsProps } from './CustomeDetails.type';

// export const CustomDetails: React.FC<CustomDetailsProps> = ({
//   formData,
//   onChange,
//   showSCACCode = false,
//   onFilingTypeShiftTab,
//   onITNNumberTab,
//   ucrEnabled = false,
//   onRegisterFields,
//   onFieldsChange,
// }) => {
//   const itnRef = useRef<HTMLInputElement>(null);

//   const fillingTypeOptions = [
//     { label: 'Y - Yes', value: 'Y' },
//     { label: 'N - No', value: 'N' },
//   ];

//   const fillingAsOptions = [
//     { label: 'Please Select', value: '' },
//     { label: 'Shipment value above $2500', value: 'Y' },
//     { label: 'Shipment value under $2500', value: 'N' },
//   ];

//   const fillingByOptions = [
//     { label: 'Please Select', value: '' },
//     { label: 'Shipco', value: 'Shipco' },
//     { label: 'Customer', value: 'Customer' },
//   ];

//   const isFilingTypeYes = formData.fillingType === 'Y';
//   const isShipmentAbove2500 = formData.fillingAs === 'Y';

//   useEffect(() => {
//     onRegisterFields?.([
//       'fillingType',
//       'SCACCodeText',
//       'fillingAs',
//       'ITNNumber',
//       'fillingByUCR',
//       'ucrNumberUCR',
//       'masterUCR',
//     ]);
//   }, [onRegisterFields]);

//   useEffect(() => {
//     onFieldsChange?.(formData);
//   }, [formData]);

//   const handleFilingTypeKeyDown = (event: React.KeyboardEvent) => {
//     if (event.shiftKey && event.key === 'Tab') {
//       event.preventDefault();
//       event.stopPropagation();
//       onFilingTypeShiftTab?.();
//     }
//   };

//   const handleFillingAsChange = (value: string) => {
//     onChange('fillingAs', value);
//     if (value === 'Y') {
//       setTimeout(() => {
//         itnRef.current?.focus();
//       }, 0);
//     }
//   };

//   const handleITNNumberKeyDown = (event: React.KeyboardEvent) => {
//     if (event.key === 'Tab' && !event.shiftKey) {
//       event.preventDefault();
//       event.stopPropagation();
//       onITNNumberTab?.();
//     }
//   };

//   if (ucrEnabled) {
//     return (
//       <Box sx={{ width: '100%', display: 'flex', gap: 2, px: 2, py: 1 }}>
//         <PSelect
//           label="Filing By"
//           value={formData.fillingByUCR}
//           options={fillingByOptions}
//           onChange={(value: string) => onChange('fillingByUCR', value)}
//           boxSx={{ width: '200px', flex: 'none' }}
//         />

//         <PTextField
//           label="UCR Number"
//           value={formData.ucrNumberUCR}
//           onChange={(e) => onChange('ucrNumberUCR', e.target.value)}
//           required={formData.masterUCR}
//         />

//         <PToggleButton
//           label="Master UCR"
//           value={formData.masterUCR}
//           onChange={() => onChange('masterUCR', !formData.masterUCR)}
//         />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ width: '100%', display: 'flex', gap: 2, px: 2, py: 1 }}>
//       <Box onKeyDown={handleFilingTypeKeyDown}>
//         <PSelect
//           value={formData.fillingType}
//           options={fillingTypeOptions}
//           onChange={(value: string) => onChange('fillingType', value)}
//           label="Filing Type"
//           boxSx={{ width: '200px', flex: 'none' }}
//         />
//       </Box>

//       {showSCACCode ? (
//         <PTextField
//           label="SCAC Code"
//           value={formData.SCACCodeText}
//           onChange={(e) => onChange('SCACCodeText', e.target.value)}
//           required={isFilingTypeYes}
//         />
//       ) : (
//         <Box sx={{ width: 198 }} />
//       )}

//       <PSelect
//         value={formData.fillingAs}
//         options={fillingAsOptions}
//         onChange={handleFillingAsChange}
//         label="Filing As"
//         required={isFilingTypeYes}
//         boxSx={{ width: '200px', flex: 'none' }}
//       />

//       <PTextField
//         inputRef={itnRef}
//         value={formData.ITNNumber}
//         onChange={(e) => onChange('ITNNumber', e.target.value)}
//         label="ITN number"
//         onKeyDown={handleITNNumberKeyDown}
//         required={isShipmentAbove2500}
//       />
//     </Box>
//   );
// };

// export default CustomDetails;
