import React, { useEffect, useMemo, useState } from 'react';
import {
  PGradientButton,
  PModal,
  PSingleValueSearchableField,
} from 'phoenix-react-lib';
import { useGetSuggestions } from '../../hooks/LCL/useGetSuggestions';
import {
  bookingReferenceSuggestionConfig,
  prebookingquoteReferenceSuggestionConfig,
  quoteReferenceSuggestionConfig,
} from '../../hooks/LCL/suggestionHelpers';
import Box from '@mui/material/Box';
import { useAppSelector } from '../../app/store/hooks';
import { selectLoginClientBean } from '../../core/featureToggles/featureToggle.selectors';

interface CopyModalProps {
  moduleType: string;
  open: boolean;
  onClose: () => void;
  onCopyClick: (referenceNo: string) => void;
  title: string;
  label?: string;
  shippingType?: string;
}

export const CopyModal: React.FC<CopyModalProps> = ({
  moduleType,
  open,
  onClose,
  onCopyClick,
  title,
  label,
  shippingType
}) => {
  const [referenceNo, setReferenceNo] = useState('');
  const hasMounted = React.useRef(false);
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (!open) {
      setReferenceNo('');
    }
  }, [open]);
  const loginClientBean = useAppSelector(selectLoginClientBean);

  const {
    data: bookingReferenceSuggestions,
    setQuery: setBookingReferenceQuery,
  } = useGetSuggestions(
    bookingReferenceSuggestionConfig('L', loginClientBean as any)
  );

  const { data: quoteReferenceSuggestions, setQuery: setQuoteReferenceQuery } =
    useGetSuggestions(
      quoteReferenceSuggestionConfig(shippingType || 'L', loginClientBean as any)
    );

  const {
    data: preBookingReferenceSuggestions,
    setQuery: setPreBookingReferenceQuery,
  } = useGetSuggestions(
    prebookingquoteReferenceSuggestionConfig(loginClientBean as any)
  );

  const { suggestionData, setSuggestionQuery } = useMemo(() => {
    switch (moduleType) {
      case 'QUO':
        return {
          suggestionData: quoteReferenceSuggestions ?? [],
          setSuggestionQuery: setQuoteReferenceQuery,
        };
      case 'PREBKG':
        return {
          suggestionData: preBookingReferenceSuggestions ?? [],
          setSuggestionQuery: setPreBookingReferenceQuery,
        };
      case 'BKG':
      default:
        return {
          suggestionData: bookingReferenceSuggestions ?? [],
          setSuggestionQuery: setBookingReferenceQuery,
        };
    }
  }, [
    bookingReferenceSuggestions,
    moduleType,
    preBookingReferenceSuggestions,
    quoteReferenceSuggestions,
    setBookingReferenceQuery,
    setPreBookingReferenceQuery,
    setQuoteReferenceQuery,
  ]);

  const handleReferenceChange = (value: any) => {
    const inputValue =
      typeof value === 'string' ? value : value?.target?.value || '';

    setReferenceNo(inputValue);
    setSuggestionQuery(inputValue);
  };

  const handleCopy = () => {
    onCopyClick(referenceNo);
    setReferenceNo('');
  };

  return (
    <PModal
      open={open}
      onClose={onClose}
      title={title}
      width={450}
      height="150px"
    >
      <Box
        sx={{
          p: 2,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              minWidth: '140px',
              fontSize: '16px',
              fontWeight: 500,
            }}
          >
            {label}
          </Box>
          <Box sx={{ flex: 1 }}>
            <PSingleValueSearchableField
              id="referenceNumber"
              value={referenceNo}
              data={suggestionData}
              displayFields={['SUGGEST_VALUE']}
              displayValueField="SUGGEST_VALUE"
              columnHeaders={[]}
              onChange={handleReferenceChange}
              onSelect={(item: any) => {
                setReferenceNo(item?.SUGGEST_KEY || '');
              }}
            />
          </Box>
        </Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 3,
          }}
        >
          <PGradientButton onClick={handleCopy} title={'Copy'} />
        </Box>
      </Box>
    </PModal>
  );
};
