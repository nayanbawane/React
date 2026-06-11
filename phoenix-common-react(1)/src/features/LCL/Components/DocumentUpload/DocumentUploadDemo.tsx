import React, { useState } from 'react';

import { PModal } from 'phoenix-react-lib';

import DocumentUpload from './DocumentUpload';
import styles from '../../../../styles/LCL/DocumentUploadDemo.module.css';

const TYPE_OPTIONS = [
  { label: 'Email Communication', value: 'Email Communication' },
  { label: 'Carrier Notification', value: 'Carrier Notification' },
  { label: 'Booking Confirmation', value: 'Booking Confirmation' },
  {
    label: 'Claim Letter/Document from client',
    value: 'Claim Letter/Document from client',
  },
  { label: 'Invoice', value: 'Invoice' },
  { label: 'Packing List', value: 'Packing List' },
];

const DocumentUploadDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.container}>
      <button
        onClick={() => setIsOpen(true)}
        className={styles.uploadButton}
      >
        Upload Documents
      </button>

      <PModal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Upload Documents"
        width={1050}
        height="auto"
        sx={{ top: '50%', transform: 'translate(-50%, -8rem)' }}
      >
        <DocumentUpload
          typeOptions={TYPE_OPTIONS}
          defaultType="Email Communication"
          onUpload={(data, file) => console.warn('Upload:', data, file)}
          // to show Origin/Destination dropDown
          // showOriginDestination 
        />
      </PModal>
    </div>
  );
};

export default DocumentUploadDemo;
