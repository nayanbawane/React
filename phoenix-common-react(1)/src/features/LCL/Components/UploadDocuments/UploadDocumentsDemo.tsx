import React, { useState } from 'react';

import { PModal } from 'phoenix-react-lib';

import UploadDocuments from './UploadDocuments';
import styles from '../../../../styles/LCL/UploadDocumentsDemo.module.css';

const UploadDocumentsDemo: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleClose = () => setIsOpen(false);

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
        onClose={handleClose}
        title="Upload Documents"
        width={1240}
        height="auto"
        sx={{ top:'50%', transform: 'translate(-50%, -8rem)' }}
      >
        <UploadDocuments
          onFileSelect={(file) => console.warn('File selected:', file.name)}
          onUpload={(rows, file) => console.warn('Upload:', rows, file)}
        />
      </PModal>
    </div>
  );
};

export default UploadDocumentsDemo;
