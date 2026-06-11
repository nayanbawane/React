import React from 'react';
import { PModal } from 'phoenix-react-lib';
import { LocationSearch } from './LocationSearch';
import { LocationResult } from '@/types';

export interface LocationSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect?: (loc: LocationResult) => void;
  title?: string;
}
export const LocationSearchModal: React.FC<LocationSearchModalProps> = ({
  open,
  onClose,
  onSelect,
  title = 'Location Search',
}) => {
  const handleSelect = (loc: LocationResult) => {
    onSelect?.(loc);
    onClose();
  };

  return (
    <PModal
      open={open}
      onClose={onClose}
      title={title}
      isCloseIcon={true}
      width={800}
      height={390}
    >
      <LocationSearch onSelect={handleSelect} />
    </PModal>
  );
};

