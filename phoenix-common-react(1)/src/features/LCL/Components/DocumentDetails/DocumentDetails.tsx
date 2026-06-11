import { IconButton } from '@mui/material';
import {
  PDatePicker,
  PModal,
  PSelect,
  PSingleValueSearchableField,
  PTextField,
  PToggleButton,
} from 'phoenix-react-lib';
import React, { useMemo, useState } from 'react';
import { useFeatureToggle } from '../../../../hooks/LCL/useFeatureToggle';
// import './DocumentDetails.css';
import '../../../../styles/LCL/DocumentDetailsGrid.css';
import UploadDocuments from '../UploadDocuments/UploadDocuments';
import {
  createDefaultDocumentRows,
  DocumentUploadFormData,
} from './documentDetails.state';
import { updateBookingDocumentDetails } from '../../../../app/slices/LCL/Booking/bookingSlice';
import {
  documentsTypeConfig,
  timeSuggestionConfig,
  useGetSelections,
  useGetSuggestions,
} from '../../../../hooks/LCL';
import { CommonToggleKeys } from '../../../../core/featureToggles/featureToggle.types';
import DocumentUpload from '../DocumentUpload/DocumentUpload';
import { useAppDispatch, useAppSelector } from '@/app/store/hooks';
import addContainerIcon from '../../../../assets/add-container.png';
import addContainerMinusIcon from '../../../../assets/add-container-minus.png';
import destinationOfficeIcon from '../../../../assets/destination-office.png';
import edocIcon from '../../../../assets/edoc-icon2.png';
import greenIcon from '../../../../assets/green-icon.png';
import greyDocumentIcon from '../../../../assets/grey-document-icon.png';
import splitArnIcon from '../../../../assets/Split_ARN-Small.png';
import statusRedIcon from '../../../../assets/icon-statusred.png';
import statusGreenIcon from '../../../../assets/icon-statusgreen.png';
import statusOrgangeIcon from '../../../../assets/icon-statusorange.png';
import uploadIcon from '../../../../assets/icon-upload.png';
import uploadHeadIcon from '../../../../assets/icon-uploadhead.png';
import visibleIcon from '../../../../assets/visible.png';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';
import { adaptLoginClientBeanToToggles } from '../../../../core/featureToggles/featureToggle.utils';

export interface DocumentDetailsProps {
  onRegisterFields?: (fields: string[]) => void;
  onFieldsChange?: (formData: any) => void;
  value?: DocumentUploadFormData[];
  moduleType?: string;
  getFileDownloadUrl?: () => string;
}

export function DocumentDetails({
  onRegisterFields,
  onFieldsChange,
  value,
  moduleType,
  getFileDownloadUrl
}: DocumentDetailsProps = {}) {
  const loginBean = useAppSelector(selectLoginClientBean);
  const officeTimeFormat = useMemo(() => {
    if (!loginBean) return 12;

    const officeSettings = adaptLoginClientBeanToToggles(loginBean).officeSettings;
    const parsedTimeFormat = Number(officeSettings?.[CommonToggleKeys.TIME_FORMAT]);

    return Number.isFinite(parsedTimeFormat) ? parsedTimeFormat : 12;
  }, [loginBean]);

  const timeSuggestionsConfig = useMemo(
    () => timeSuggestionConfig(officeTimeFormat),
    [officeTimeFormat]
  );

  const { isVisible } = useFeatureToggle();

  const isPrebooking = moduleType === 'prebooking';
  const { data: documentTypeSelections } =
    useGetSelections(documentsTypeConfig(moduleType === 'QUO' ? 'QUO' : 'BKG'));

  const typeOptions = documentTypeSelections.map((item: any) => ({
    label: item?.code ?? '',
    value: item?.code ?? '',
    description: item?.description ?? ''

  }));

  const {
    data: timeSuggestions,
    setQuery: setTimeQuery,
    loading: isTimeLoading,
  } = useGetSuggestions(timeSuggestionsConfig);

  const dispatch = useAppDispatch();
  const rows = useAppSelector((state) => state.booking.documentDetails);

  React.useEffect(() => {
    if (!value) return;
    dispatch(
      updateBookingDocumentDetails(
        value.length ? value : createDefaultDocumentRows()
      )
    );
  }, [dispatch, value]);

  const setRows = (nextRows: DocumentUploadFormData[]) => {
    dispatch(updateBookingDocumentDetails(nextRows));
  };
  const addRow = () => {
    setRows([
      ...rows,
      {
        documentType: "",
        documentReferenceNumber: "",
        documentRequiredDate: "",
        documentRequiredTime: "",
        documentReceivedDate: "",
        documentReceivedTime: "",
        documentExpirationDate: "",
        documentCustomsOffice: "",
        channel: "",
        documentCarrier: "",
        documentShipper: "",
        agent: "",
        comments: "",
        active: "Yes",
        fileUploadKey: undefined,
      },
    ]);
  };

  const removeRow = (rowIndex: number) => {
    if (rows.length > 1) {
      setRows(rows.filter((_, index) => index !== rowIndex));
    }
  };

  const handleInputChange = (
    rowIndex: number,
    field: keyof DocumentUploadFormData,
    value: string | Date | null
  ) => {
    let normalizedValue: string | Date | null = value ?? '';

    if (
      field === 'documentRequiredDate' ||
      field === 'documentReceivedDate' ||
      field === 'documentExpirationDate'
    ) {
      if (value instanceof Date || value === null) {
        normalizedValue = formatDateOnly(value);
      }
    }

    // Add time validation for time fields
    if (field === 'documentRequiredTime' || field === 'documentReceivedTime') {
      // Only allow numbers and colon, max 5 characters (HH:MM)
      const timeValue = String(normalizedValue)
        .replace(/[^0-9:]/g, '')
        .slice(0, 5);

      // Auto-format with colon after 2 digits
      let formattedTime = timeValue;
      if (timeValue.length > 2 && !timeValue.includes(':')) {
        formattedTime = timeValue.slice(0, 2) + ':' + timeValue.slice(2);
      }

      // Validate HH:MM format - allow partial input during typing
      if (formattedTime.includes(':')) {
        // Complete or partial time with colon
        const [hours, minutes] = formattedTime.split(':');
        const hourValid =
          hours === '' || (parseInt(hours) >= 0 && parseInt(hours) <= 23);
        const minuteValid =
          minutes === '' || (parseInt(minutes) >= 0 && parseInt(minutes) <= 59);

        if (!hourValid || !minuteValid) {
          return; // Don't update if invalid
        }
      } else if (formattedTime.length > 0) {
        // Only hours entered so far (0-23)
        const hours = parseInt(formattedTime);
        if (hours > 23) {
          return; // Don't update if invalid
        }
      }

      normalizedValue = formattedTime;
    }

    const newRows = [...rows];
    let nextRow = {
      ...newRows[rowIndex],
      [field]: normalizedValue,
    };
    let selectedOption: any
    let id: any

    if (field === 'documentType') {
      const typeValue = String(normalizedValue ?? '')
        .trim()
        .toLowerCase();
      const isTypeSelected =
        typeValue.length > 0 && typeValue !== 'please select';
      selectedOption = typeOptions.find(
        option => option.value === value
      );
      id = selectedOption?.description.split('--')[0]


      if (!isTypeSelected) {
        nextRow = {
          ...nextRow,
          documentCustomsOffice: '',
          channel: '',
        };
      }
      nextRow = {
        ...nextRow,
        documentTypeId: id ?? '',

      };


    }

 
    setRows(newRows);
  };

  const [documentUploadModalState, setDocumentUploadModalState] = useState<{
    isOpen: boolean;
    rowIndex: number;
    data: {
      documentType: string;
      documentReferenceNumber: string;
      documentReceivedDate: string;
      documentReceivedTime: string;
      comments: string;
      documentMode: string;
    };
  }>({
    isOpen: false,
    rowIndex: -1,
    data: {
      documentType: '',
      documentReferenceNumber: '',
      documentReceivedDate: '',
      documentReceivedTime: '',
      comments: '',
      documentMode: 'PRI',
    },
  });

  const [arnUploadDocumentModalState, setArnUploadDocumentModalState] =
    useState<{
      isOpen: boolean;
      rowIndex: number;
      data: {
        documentType: string;
        documentReferenceNumber: string;
        documentReceivedDate: string;
        documentReceivedTime: string;
        comments: string;
        channel: string;
        documentMode: string;
      };
    }>({
      isOpen: false,
      rowIndex: -1,
      data: {
        documentType: '',
        documentReferenceNumber: '',
        documentReceivedDate: '',
        documentReceivedTime: '',
        comments: '',
        channel: '',
        documentMode: 'Private',
      },
    });

  const formatDateOnly = (value: Date | null): string => {
    if (!value) return '';
    const iso = value.toISOString();
    const [dateOnly] = iso.split('T');
    return dateOnly ?? '';
  };

  const parseDateValue = (value?: string | Date | null): Date | null => {
    if (!value) return null;
    if (value instanceof Date) return value;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const mapUploadRowsToDocumentDetails = (
    uploadRows: Array<{
      documenType: string;
      documentReferenceNumber: string;
      referenceNo: string;
      referenceType?: string;
      documentReceivedDate: Date | null;
      documentReceivedTime: string;
      comments: string;
    }>
  ): DocumentUploadFormData[] => {
    return uploadRows.map((row) => ({
      documentType: row.documenType ?? '',
      documentReferenceNumber:
        row.documentReferenceNumber || row.referenceNo || '',
      documentRequiredDate: '',
      documentRequiredTime: '',
      documentReceivedDate: formatDateOnly(row.documentReceivedDate),
      documentReceivedTime: row.documentReceivedTime ?? '',
      documentExpirationDate: '',
      documentCustomsOffice: '',
      channel: row.referenceType ?? '',
      documentCarrier: '',
      documentShipper: '',
      agent: '',
      comments: row.comments ?? '',
      active: 'Yes',
    }));
  };

  React.useEffect(() => {
    onRegisterFields?.([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    onFieldsChange?.(rows);
  }, [rows]);

  const validateRows = () => {
    return rows.some(
      (r) => r.documentType && r.documentType !== 'Please Select'
    );
  };

  const handleUploadAll = (rowIndex: number) => {
    if (!validateRows()) return;

    openDocumentUploadModal(rowIndex); // or global modal
  };

  const handleArnUpload = (rowIndex: number) => {
    if (!validateRows()) return;

    openArnUploadDocumentModal(rowIndex); // or global modal
  };

  const openDocumentUploadModal = (rowIndex: number) => {
    const rowData = rows[rowIndex];
    setDocumentUploadModalState({
      isOpen: true,
      rowIndex,
      data: {
        documentType: rowData.documentType,
        documentReferenceNumber: rowData.documentReferenceNumber,
        documentReceivedDate: rowData.documentReceivedDate,
        documentReceivedTime: rowData.documentReceivedTime,
        comments: rowData.comments,
        documentMode: 'PRI',
      },
    });
  };

  const openArnUploadDocumentModal = (rowIndex: number) => {
    const rowData = rows[rowIndex];
    setArnUploadDocumentModalState({
      isOpen: true,
      rowIndex: rowIndex,
      data: {
        documentType: rowData.documentType,
        documentReferenceNumber: rowData.documentReferenceNumber,
        documentReceivedDate: rowData.documentReceivedDate,
        documentReceivedTime: rowData.documentReceivedTime,
        comments: rowData.comments,
        channel: rowData.channel,
        documentMode: 'Private',
      },
    });
  };

  // Update modal data when rows change (for real-time sync)
  React.useEffect(() => {
    if (
      documentUploadModalState.isOpen &&
      documentUploadModalState.rowIndex !== -1
    ) {
      const rowData = rows[documentUploadModalState.rowIndex];
      setDocumentUploadModalState((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          documentType: rowData.documentType,
          documentReferenceNumber: rowData.documentReferenceNumber,
          documentReceivedDate: rowData.documentReceivedDate,
          documentReceivedTime: rowData.documentReceivedTime,
          comments: rowData.comments,
        },
      }));
    }

    if (
      arnUploadDocumentModalState.isOpen &&
      arnUploadDocumentModalState.rowIndex !== -1
    ) {
      const rowData = rows[arnUploadDocumentModalState.rowIndex];
      setArnUploadDocumentModalState((prev) => ({
        ...prev,
        data: {
          ...prev.data,
          documentType: rowData.documentType,
          documentReferenceNumber: rowData.documentReferenceNumber,
          documentReceivedDate: rowData.documentReceivedDate,
          documentReceivedTime: rowData.documentReceivedTime,
          comments: rowData.comments,
        },
      }));
    }
  }, [
    rows,
    documentUploadModalState.isOpen,
    documentUploadModalState.rowIndex,
    arnUploadDocumentModalState.isOpen,
    arnUploadDocumentModalState.rowIndex,
  ]);

  const closeDocumentUploadModal = () => {
    setDocumentUploadModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleFileUploadSuccess = (fileUploadKey: string, file: File) => {
    if (documentUploadModalState.rowIndex !== -1) {
      const newRows = [...rows];
      newRows[documentUploadModalState.rowIndex] = {
        ...newRows[documentUploadModalState.rowIndex],
        fileUploadKey,
        documentFileName: file.name,
        contentType: getContentType(file)

      };
      setRows(newRows);
    }
  };

  const getContentType = (file: File): string => {
    return file.type || 'application/octet-stream';
  };

  const handleDocumentUpload = (file: File | null) => {
    if (documentUploadModalState.rowIndex === -1 || !file) {
      return;
    }

    const newRows = [...rows];
    newRows[documentUploadModalState.rowIndex] = {
      ...newRows[documentUploadModalState.rowIndex],
      documentType: documentUploadModalState.data.documentType,
      documentReferenceNumber:
        documentUploadModalState.data.documentReferenceNumber,
      documentReceivedDate: documentUploadModalState.data.documentReceivedDate,
      documentReceivedTime: documentUploadModalState.data.documentReceivedTime,
      comments: documentUploadModalState.data.comments,
    };

    setRows(newRows);
    closeDocumentUploadModal();
  };

  const closeArnUploadDocumentModalState = () => {
    setArnUploadDocumentModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const updateModalData = (field: string, value: string | Date | null) => {
    // Apply time validation directly here for receivedTime
    if (field === 'documentReceivedTime') {
      if (typeof value !== 'string') {
        return;
      }
      // Only allow numbers and colon, max 5 characters (HH:MM)
      const timeValue = value.replace(/[^0-9:]/g, '').slice(0, 5);

      // Auto-format with colon after 2 digits
      let formattedTime = timeValue;
      if (timeValue.length > 2 && !timeValue.includes(':')) {
        formattedTime = timeValue.slice(0, 2) + ':' + timeValue.slice(2);
      }

      // Validate HH:MM format - allow partial input during typing
      if (formattedTime.includes(':')) {
        // Complete or partial time with colon
        const [hours, minutes] = formattedTime.split(':');
        const hourValid =
          hours === '' || (parseInt(hours) >= 0 && parseInt(hours) <= 23);
        const minuteValid =
          minutes === '' || (parseInt(minutes) >= 0 && parseInt(minutes) <= 59);

        if (!hourValid || !minuteValid) {
          return; // Don't update if invalid
        }
      } else if (formattedTime.length > 0) {
        // Only hours entered so far (0-23)
        const hours = parseInt(formattedTime);
        if (hours > 23) {
          return; // Don't update if invalid
        }
      }

      value = formattedTime;
    }

    // Update modal state
    setDocumentUploadModalState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }));

    setArnUploadDocumentModalState((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        [field]: value,
      },
    }));

    if (documentUploadModalState.rowIndex !== -1) {
      const fieldMapping: Record<string, keyof DocumentUploadFormData> = {
        documentType: 'documentType',
        documentReferenceNumber: 'documentReferenceNumber',
        documentReceivedDate: 'documentReceivedDate',
        documentReceivedTime: 'documentReceivedTime',
        comments: 'comments',
      };

      const formDataField = fieldMapping[field];
      if (formDataField) {
        handleInputChange(
          documentUploadModalState.rowIndex,
          formDataField,
          value
        );
      }
    }

    if (arnUploadDocumentModalState.rowIndex !== -1) {
      const fieldMapping: Record<string, keyof DocumentUploadFormData> = {
        documentType: 'documentType',
        documentReferenceNumber: 'documentReferenceNumber',
        documentReceivedDate: 'documentReceivedDate',
        documentReceivedTime: 'documentReceivedTime',
        comments: 'comments',
      };

      const formDataField = fieldMapping[field];
      if (formDataField) {
        handleInputChange(
          arnUploadDocumentModalState.rowIndex,
          formDataField,
          value
        );
      }
    }
  };

  const renderFormRow = (rowData: DocumentUploadFormData, rowIndex: number) => {
    let statusIcon = rowData.documentReceived ? statusGreenIcon : statusRedIcon;
    if (rowData.readyForUpload) statusIcon = statusOrgangeIcon;

    const isFirstRow = rowIndex === 0;
    const isTypeSelected =
      rowData.documentType.trim().length > 0 &&
      rowData.documentType.trim().toLowerCase() !== 'please select';

    return (
      <div key={`document-row-${rowIndex}`} className="document-details__row">

        {/* Icons cell — stacked: head icons on top row, action icons on bottom row */}
        <div className="document-details__icons-cell">
          {isFirstRow && (
            <div className="document-details__icons-top">
              <IconButton
                id="booking_uploadHeadButton"
                size="small"
                sx={{ p: 0.2 }}
                className="document-details__icon-button"
                onClick={() => rows.length === 1 ? handleUploadAll(rowIndex) : undefined}
              >
                <img src={uploadHeadIcon} />
              </IconButton>

              {isVisible(CommonToggleKeys.OFR_MULTIPLE_SHIPMENT_DOCUMENT_UPLOAD) && (
                <IconButton
                  id="booking_splitDocumentImage"
                  size="small"
                  sx={{ p: 0.2 }}
                  className="document-details__icon-button"
                  onClick={() => rows.length === 1 ? handleArnUpload(rowIndex) : undefined}
                >
                  <img src={splitArnIcon} />
                </IconButton>
              )}
            </div>
          )}

          <div className="document-details__icons-bottom">
            <IconButton
              size="small"
              sx={{ p: 0.2 }}
              className="document-details__icon-button"
              onClick={() => openDocumentUploadModal(rowIndex)}
            >
              <img src={uploadIcon} />
            </IconButton>

            <IconButton size="small" sx={{ p: 0.2 }} className="document-details__icon-button">
              <img src={statusIcon} />
            </IconButton>

            <IconButton size="small" sx={{ p: 0.2 }} className="document-details__icon-button">
              <img src={edocIcon} />
            </IconButton>

            <IconButton
              size="small"
              sx={{ p: 0.2 }}
              className="document-details__icon-button"
              onClick={() => {
                const fileUrl = getFileDownloadUrl();
                if (fileUrl) window.open(fileUrl, '_self');
              }}
            >
              <img src={greyDocumentIcon} />
            </IconButton>

            <IconButton size="small" sx={{ p: 0.2 }} className="document-details__icon-button">
              <img src={visibleIcon} style={{ height: '20px', width: '20px' }} />
            </IconButton>

            <IconButton size="small" sx={{ p: 0.2 }} className="document-details__icon-button">
              <img src={destinationOfficeIcon} style={{ height: '20px', width: '20px' }} />
            </IconButton>

            {moduleType !== 'QUO' && (
              <div className="document-details__icons--green-icon">
                <IconButton size="small" sx={{ p: 0.2 }} className="document-details__icon-button">
                  <img src={greenIcon} />
                </IconButton>
              </div>
            )}
          </div>
        </div>

        {/* Fields — each wrapped in a sized div so they flex-wrap naturally */}
        <div className="doc-field doc-field--type">
          <PSelect
            label={isFirstRow ? 'Type' : undefined}
            value={rowData.documentType}
            placeholder="Please Select"
            options={typeOptions}
            onChange={(value) => handleInputChange(rowIndex, 'documentType', value)}
          />
        </div>

        <div className="doc-field doc-field--ref">
          <PTextField
            label={isFirstRow ? 'Reference' : undefined}
            value={rowData.documentReferenceNumber}
            onChange={(event) =>
              handleInputChange(rowIndex, 'documentReferenceNumber', event.target.value)
            }
            inputProps={{ maxLength: 41 }}
          />
        </div>

        <div className="doc-field doc-field--date">
          <PDatePicker
            label={isFirstRow ? 'Required By Date' : undefined}
            onChange={(val) => handleInputChange(rowIndex, 'documentRequiredDate', val)}
            value={parseDateValue(rowData.documentRequiredDate)}
          />
        </div>

        <div className="doc-field doc-field--time">
          <PSingleValueSearchableField
            label={isFirstRow ? 'Time' : undefined}
            id="documentRequiredTime"
            data={timeSuggestions}
            value={rowData.documentRequiredTime}
            displayFields={['time']}
            columnHeaders={[]}
            onChange={(value) => {
              setTimeQuery(value);
              handleInputChange(rowIndex, 'documentRequiredTime', value);
            }}
            usePortal
            onSelect={(value) =>
              handleInputChange(rowIndex, 'documentRequiredTime', value.time as string)
            }
            boxSx={{ flex: 'none' }}
          />
        </div>

        <div className="doc-field doc-field--date">
          <PTextField
            label={isFirstRow ? 'Received Date' : undefined}
            value={rowData.documentReceivedDate}
            disabled
            boxSx={{ flex: 'none' }}
          />
        </div>

        <div className="doc-field doc-field--time">
          <PTextField
            label={isFirstRow ? 'Time' : undefined}
            value={rowData.documentReceivedTime}
            disabled
            boxSx={{ flex: 'none' }}
          />
        </div>

        <div className="doc-field doc-field--date">
          <PDatePicker
            label={isFirstRow ? 'Expiration Date' : undefined}
            onChange={(val) => handleInputChange(rowIndex, 'documentExpirationDate', val)}
            value={parseDateValue(rowData.documentExpirationDate)}
          />
        </div>

        <div className="doc-field doc-field--customs">
          <PTextField
            label={isFirstRow ? 'Customs Office' : undefined}
            value={rowData.documentCustomsOffice}
            onChange={(event) =>
              handleInputChange(rowIndex, 'documentCustomsOffice', event.target.value)
            }
            boxSx={{ flex: 'none' }}
            inputProps={{ maxLength: 15 }}
            disabled={!isTypeSelected}
          />
        </div>

        {(isVisible(CommonToggleKeys.OCN_ADD_SI_CHANNEL_ON_BOOKING) ||
          isVisible(CommonToggleKeys.OCN_SHOW_UPLOAD_DOCUMEN_CHANNEL)) && (
            <div className="doc-field doc-field--channel">
              <PTextField
                label={isFirstRow ? 'Channel' : undefined}
                value={rowData.channel}
                onChange={(event) =>
                  handleInputChange(rowIndex, 'channel', event.target.value)
                }
                disabled
                boxSx={{ flex: 'none' }}
              />
            </div>
          )}

        {isVisible(CommonToggleKeys.SHOW_CARRIER_BOOKING) && (
          <div className="doc-field doc-field--ref">
            <PTextField
              label={isFirstRow ? 'Custom Declaration Number' : undefined}
              value={rowData.documentCarrier}
              onChange={(event) =>
                handleInputChange(rowIndex, 'documentCarrier', event.target.value)
              }
              boxSx={{ flex: 'none' }}
              inputProps={{ maxLength: 21 }}
            />
          </div>
        )}

        {isVisible(CommonToggleKeys.SHOW_SHIPPER) && (
          <div className="doc-field doc-field--ref">
            <PTextField
              label={isFirstRow ? 'Shipper' : undefined}
              value={rowData.documentShipper}
              onChange={(event) =>
                handleInputChange(rowIndex, 'documentShipper', event.target.value)
              }
              boxSx={{ flex: 'none' }}
              inputProps={{ maxLength: 101 }}
            />
          </div>
        )}

        {isVisible(CommonToggleKeys.SHOW_COLOADER) && (
          <div className="doc-field doc-field--ref">
            <PTextField
              label={isFirstRow ? 'Broker/CoLoader' : undefined}
              value={rowData.agent}
              onChange={(event) =>
                handleInputChange(rowIndex, 'agent', event.target.value)
              }
              boxSx={{ flex: 'none' }}
              inputProps={{ maxLength: 101 }}
            />
          </div>
        )}

        <div className="doc-field doc-field--comment">
          <PTextField
            label={isFirstRow ? 'Comments' : undefined}
            value={rowData.comments}
            onChange={(event) =>
              handleInputChange(rowIndex, 'comments', event.target.value)
            }
            boxSx={{ flex: 'none' }}
            inputProps={{ maxLength: 201 }}
          />
        </div>

        <div className="doc-field doc-field--active">
          <PToggleButton
            label={isFirstRow ? 'Active' : undefined}
            onChange={(value) =>
              handleInputChange(rowIndex, 'active', value ? 'Yes' : 'No')
            }
            value={rowData.active === 'Yes'}
          />
        </div>

        <div className="doc-field doc-field--actions">
          <IconButton size="small" onClick={addRow} className="document-details__icon-button">
            <img src={addContainerIcon} />
          </IconButton>
          <IconButton size="small" onClick={() => removeRow(rowIndex)} className="document-details__icon-button">
            <img src={addContainerMinusIcon} />
          </IconButton>
        </div>

      </div>
    );
  };

  return (
    <div className="document-details">
      <div className="document-details__body">
        {rows.map((rowData, rowIndex) => renderFormRow(rowData, rowIndex))}
      </div>

      <PModal
        open={documentUploadModalState.isOpen}
        onClose={closeDocumentUploadModal}
        title="Upload Documents"
        width={1050}
        height="auto"
        sx={{ top: '50%', transform: 'translate(-50%, -8rem)' }}
      >
        <DocumentUpload
          typeOptions={typeOptions}
          value={documentUploadModalState.data}
          onFieldChange={updateModalData}
          onUpload={handleDocumentUpload}
          onFileUploadSuccess={handleFileUploadSuccess}
          data={documentUploadModalState.data}
          onChange={updateModalData}
          moduleType={moduleType}
        // When we have requirement of 8th Column origin/destination then pass data like this
        // originDestinationOptions={[
        //   { label: 'Destination', value: 'D' },
        //   { label: 'Origin', value: 'O' },
        // ]}
        />
      </PModal>

      <PModal
        open={arnUploadDocumentModalState.isOpen}
        onClose={closeArnUploadDocumentModalState}
        title="Upload Documents"
        width={1240}
        height="auto"
        sx={{ top: '50%', transform: 'translate(-50%, -8rem)' }}
      >
        <UploadDocuments
          typeOptions={typeOptions}
          onFileSelect={(file) => console.warn('File selected:', file.name)}
          onUpload={(uploadRows, file) => {
            const mappedRows = mapUploadRowsToDocumentDetails(
              uploadRows as any
            );
            if (!mappedRows.length) return;

            const targetIndex = arnUploadDocumentModalState.rowIndex;
            const updatedRows = [...rows];

            if (targetIndex >= 0 && targetIndex < updatedRows.length) {
              updatedRows[targetIndex] = {
                ...updatedRows[targetIndex],
                ...mappedRows[0],
              };
              updatedRows.push(...mappedRows.slice(1));
            } else {
              updatedRows.push(...mappedRows);
            }

            setRows(updatedRows);
            closeArnUploadDocumentModalState();
          }}
          initialRow={{
            documenType: arnUploadDocumentModalState.data.documentType,
            referenceType: arnUploadDocumentModalState.data.channel,
            referenceNo:
              arnUploadDocumentModalState.data.documentReferenceNumber,
            documentReferenceNumber:
              arnUploadDocumentModalState.data.documentReferenceNumber,
            comments: arnUploadDocumentModalState.data.comments,
          }}
          resetSeed={`${arnUploadDocumentModalState.rowIndex}-${arnUploadDocumentModalState.isOpen}`}
        />
      </PModal>
    </div>
  );
}

export default DocumentDetails;
