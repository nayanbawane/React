import React, { useRef, useState } from 'react';
import { Box } from '@mui/material';
import { Triangle, X } from 'lucide-react';
import { PDatePicker, PSelect, PTextField } from 'phoenix-react-lib';

import { uploadFile } from '../../../../core/services/fileUploadService';
import styles from '../../../../styles/LCL/DocumentUpload.module.css';

const FIELD_H = '26px';
const FIELD_FONT = '12px';
const FIELD_PAD = '2px 4px';
const FIELD_RADIUS = '2px';

const MODE_OPTIONS = [
  { label: 'Private', value: 'PRI' },
  { label: 'Public', value: 'PUB' },
];

const ORIGIN_DESTINATION_OPTIONS = [
  { label: 'Origin', value: 'O' },
  { label: 'Destination', value: 'D' },
];

const SELECT_SX = {
  height: FIELD_H,
  fontSize: FIELD_FONT,
  borderRadius: FIELD_RADIUS,
  '& .MuiSelect-select': { padding: FIELD_PAD, fontSize: FIELD_FONT },
};

const FORM_CONTROL_SX = { mb: 0, mt: 0 };

const TEXT_FIELD_SX = {
  height: FIELD_H,
  fontSize: FIELD_FONT,
  borderRadius: FIELD_RADIUS,
  '& .MuiInputBase-root': { height: FIELD_H, borderRadius: FIELD_RADIUS },
  '& .MuiInputBase-input': { padding: FIELD_PAD, fontSize: FIELD_FONT },
};

interface Option {
  label: string;
  value: string;
}

interface DocumentUploadProps {
  typeOptions: Option[];
  isReferenceDisabled?: boolean;
  acceptedFileTypes?: string;
  showOriginDestination?: boolean;
  onFileSelect?: (file: File) => void;
  onUpload?: (file: File | null) => void;
  onFileUploadSuccess?: (fileUploadKey: string, file: File) => void;
  onFileUploadError?: (error: Error, file: File) => void;
  onChange: (field: string, value: string | Date | null) => void;
  moduleType?: string;
  data: {
    documentType: string;
    documentReferenceNumber: string;
    documentReceivedDate: Date | string | null;
    documentReceivedTime: string;
    comments: string;
    documentMode: string;
    originDestination?: string;
  };
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  typeOptions,
  isReferenceDisabled = true,
  acceptedFileTypes,
  showOriginDestination = false,
  onFileSelect,
  onUpload,
  onFileUploadSuccess,
  onFileUploadError,
  data,
  onChange,
  moduleType,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [bannerState, setBannerState] = useState<
    'hidden' | 'visible' | 'fading'
  >('hidden');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [fileUploadError, setFileUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
    if (file) {
      onFileSelect?.(file);
      // Call API to upload file
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0] ?? null;
    if (file) {
      setSelectedFile(file);
      onFileSelect?.(file);
      // Call API to upload file
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleFileUpload = async (file: File) => {
    setIsUploadingFile(true);
    setFileUploadError(null);

    try {
      // Convert date to string if needed
      const dateString = data.documentReceivedDate
        ? typeof data.documentReceivedDate === 'string'
          ? data.documentReceivedDate
          : (data.documentReceivedDate as Date).toISOString().split('T')[0]
        : null;

      const response = await uploadFile(
        file,
        data.documentType,
        data.documentReferenceNumber,
        data.documentMode,
        data.comments,
        dateString,
        data.documentReceivedTime,
        data.originDestination
      );

      // Call success callback with fileUploadKey
      if (response.fileUploadKey) {
        onFileUploadSuccess?.(response.fileUploadKey, file);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'File upload failed';
      setFileUploadError(errorMessage);
      onFileUploadError?.(
        error instanceof Error ? error : new Error(errorMessage),
        file
      );
      console.error('File upload error:', error);
    } finally {
      setIsUploadingFile(false);
    }
  };

  const startBannerFade = () => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    setBannerState('fading');
  };

  const showValidationError = () => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    setBannerState('visible');
    bannerTimerRef.current = setTimeout(startBannerFade, 1000);
  };

  const handleDismissValidation = () => startBannerFade();

  const handleBannerTransitionEnd = () => {
    if (bannerState === 'fading') setBannerState('hidden');
  };

  const handleUpload = () => {
    if (!selectedFile) {
      showValidationError();
      return;
    }
    onUpload?.(selectedFile);
  };

  return (
    <Box className={styles.body}>
      {(bannerState !== 'hidden' || fileUploadError) && (
        <Box
          className={`${styles.validationBanner} ${bannerState === 'fading' ? styles.validationBannerFading : ''}`}
          onTransitionEnd={handleBannerTransitionEnd}
        >
          <span className={styles.validationIcon}>
            {' '}
            <Triangle fill="currentColor" size={12} />{' '}
          </span>
          <span className={styles.validationText}>
            {fileUploadError ||
              'Please recheck and complete all mandatory Information.'}
          </span>
          <button
            className={styles.validationClose}
            onClick={() => {
              handleDismissValidation();
              setFileUploadError(null);
            }}
            aria-label="Dismiss"
          >
            <X />
          </button>
        </Box>
      )}

      <Box className={styles.tableWrapper}>
        <table className={styles.docTable}>
          <thead>
            <tr>
              <th className={styles.colType}>Type</th>
              <th className={styles.colFile}>Choose File</th>
              <th className={styles.colReference}>Reference</th>
              <th className={styles.colDate}>Received Date</th>
              <th className={styles.colTime}>Time</th>
              <th className={styles.colComments}>Comments</th>
              <th className={styles.colMode}>Mode</th>
              {showOriginDestination && (
                <th className={styles.colOriginDest}>Origin/Destination</th>
              )}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <PSelect
                  value={data.documentType}
                  onChange={(e) => onChange('documentType', e)}
                  options={typeOptions}
                  sx={SELECT_SX}
                  formControlSx={FORM_CONTROL_SX}
                  disabled
                />
              </td>
              <td>
                <Box className={styles.fileInputWrapper}>
                  <Box
                    className={`${styles.fileInputRow} ${isDragging ? styles.dragging : ''} ${isUploadingFile ? styles.uploading : ''}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                  >
                    <button
                      className={styles.browseBtn}
                      onClick={() =>
                        !isUploadingFile && fileInputRef.current?.click()
                      }
                      disabled={isUploadingFile}
                    >
                      {isUploadingFile ? 'Uploading...' : 'Browse'}
                    </button>
                    <span className={styles.fileName}>
                      {selectedFile?.name ?? 'No File Chosen'}
                    </span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      hidden
                      accept={acceptedFileTypes}
                      onChange={handleFileChange}
                      disabled={isUploadingFile}
                    />
                  </Box>
                </Box>
              </td>
              <td>
                <PTextField
                  value={data.documentReferenceNumber}
                  onChange={(e) =>
                    onChange('documentReferenceNumber', e.target.value)
                  }
                  textFeildSx={TEXT_FIELD_SX}
                  inputProps={{ maxLength: 25 }}
                  disabled={isReferenceDisabled}
                />
              </td>
              <td className={styles.dateCell}>
                <PDatePicker
                  id="documentReceivedDate"
                  value={
                    data.documentReceivedDate
                      ? data.documentReceivedDate instanceof Date
                        ? data.documentReceivedDate
                        : new Date(data.documentReceivedDate)
                      : null
                  }
                  onChange={(val) => onChange('documentReceivedDate', val)}
                />
             
              </td>
              <td>
                <PTextField
                  value={data.documentReceivedTime}
                  onChange={(e) =>
                    onChange('documentReceivedTime', e.target.value)
                  }
                  textFeildSx={TEXT_FIELD_SX}
                />
              </td>
              <td>
                <PTextField
                  value={data.comments}
                  onChange={(e) => onChange('comments', e.target.value)}
                  textFeildSx={TEXT_FIELD_SX}
                  inputProps={{ maxLength: 200 }}
                />
              </td>
              <td>
                <PSelect
                  value={data.documentMode}
                  onChange={(val) => onChange('documentMode', val)}
                  options={MODE_OPTIONS}
                  sx={SELECT_SX}
                  formControlSx={FORM_CONTROL_SX}
                />
              </td>

              {showOriginDestination && (
                <td>
                  <PSelect
                    value={data.originDestination}
                    onChange={(val) => onChange('originDestination', val)}
                    options={ORIGIN_DESTINATION_OPTIONS}
                    sx={SELECT_SX}
                    formControlSx={FORM_CONTROL_SX}
                  />
                </td>
              )}
            </tr>
          </tbody>
        </table>
      </Box>

      <Box className={styles.footer}>
        <button
          className={styles.uploadBtn}
          onClick={handleUpload}
          disabled={isUploadingFile}
        >
          {isUploadingFile ? 'Uploading...' : 'Upload'}
        </button>
      </Box>
    </Box>
  );
};

export default DocumentUpload;
