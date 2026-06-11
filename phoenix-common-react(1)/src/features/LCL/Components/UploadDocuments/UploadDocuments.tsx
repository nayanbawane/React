import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorkerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { PDatePicker, PModal, PSelect, PTextField } from 'phoenix-react-lib';
import { RotateCw, Triangle, X } from 'lucide-react';
import addContainerImg from '@/assets/add-container.png';
import minusContainerImg from '@/assets/add-container-minus.png';
import arrowEdocImg from '@/assets/images/arrow_edoc.jpg';
import arrowEdocActiveImg from '@/assets/images/arrow_edoc_active.jpg';
import styles from '../../../../styles/LCL/UploadDocuments.module.css';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

const FIELD_H = '26px';
const FIELD_FONT = '12px';
const FIELD_PAD = '2px 4px';
const FIELD_RADIUS = '2px';
const EMPTY_THUMB_COUNT = 10;
const THUMB_WIDTH = 70;
const THUMB_HEIGHT = 80;
const SELECTED_BORDER = '#3793C5';

const REFERENCE_TYPE_OPTIONS = [
  { label: 'Booking Number', value: 'Booking Number' },
  { label: 'AWB Number', value: 'AWB Number' },
  { label: 'Lot Number', value: 'Lot Number' },
  { label: 'Invoice Number', value: 'Invoice Number' },
];

const TYPE_OPTIONS = [
  {
    label: 'Acknowledge letter for stacking',
    value: 'Acknowledge letter for stacking',
  },
  { label: 'Carrier Notification', value: 'Carrier Notification' },
  { label: 'Booking Confirmation', value: 'Booking Confirmation' },
  {
    label: 'Claim Letter/Document from client',
    value: 'Claim Letter/Document from client',
  },
  { label: 'Email Communication', value: 'Email Communication' },
  { label: 'Invoice', value: 'Invoice' },
  { label: 'Packing List', value: 'Packing List' },
];

const MODE_OPTIONS = [
  { label: 'Private', value: 'Private' },
  { label: 'Public', value: 'Public' },
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

interface DocumentRow {
  id: string;
  referenceType: string;
  referenceNo: string;
  documenType: string;
  selectedPages: string;
  documentReferenceNumber: string;
  documentReceivedDate: Date | null;
  documentReceivedTime: string;
  comments: string;
  documentMode: string;
}

interface Option {
  label: string;
  value: string;
}

interface UploadDocumentsProps {
  typeOptions?: Option[];
  onFileSelect?: (file: File) => void;
  onUpload?: (rows: DocumentRow[], file: File | null) => void;
  getPdfViewerUrl?: (pageIndex: number) => string;
  initialRow?: Partial<DocumentRow>;
  resetSeed?: string | number;
}

const createDefaultRow = (options: Option[]): DocumentRow => ({
  id: crypto.randomUUID(),
  referenceType: REFERENCE_TYPE_OPTIONS[0].value,
  referenceNo: '0',
  documenType: options[0]?.value ?? '',
  selectedPages: '',
  documentReferenceNumber: '',
  documentReceivedDate: new Date(),
  documentReceivedTime: new Date()
    .toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })
    .replace(' ', ''),
  comments: '',
  documentMode: 'Private',
});

const UploadDocuments: React.FC<UploadDocumentsProps> = ({
  typeOptions,
  onFileSelect,
  onUpload,
  getPdfViewerUrl,
  initialRow,
  resetSeed,
}) => {
  const resolvedTypeOptions =
    typeOptions && typeOptions.length > 0 ? typeOptions : TYPE_OPTIONS;
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [renderedThumbs, setRenderedThumbs] = useState<string[]>([]);
  const [isRendering, setIsRendering] = useState(false);
  const [selectedThumbIdx, setSelectedThumbIdx] = useState<number | null>(null);
  const [rows, setRows] = useState<DocumentRow[]>([
    createDefaultRow(resolvedTypeOptions),
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerSrc, setViewerSrc] = useState('');
  const [viewerTitle, setViewerTitle] = useState('');
  const [bannerState, setBannerState] = useState<
    'hidden' | 'visible' | 'fading'
  >('hidden');
  const blobUrlRef = useRef<string | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbScrollRef = useRef<HTMLDivElement>(null);

  const renderPdfThumbnails = useCallback(async (file: File) => {
    setIsRendering(true);
    setRenderedThumbs([]);
    setSelectedThumbIdx(null);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const pages: string[] = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1 });
      const scale = Math.min(
        THUMB_WIDTH / viewport.width,
        THUMB_HEIGHT / viewport.height
      );
      const scaled = page.getViewport({ scale });

      const canvas = document.createElement('canvas');
      canvas.width = scaled.width;
      canvas.height = scaled.height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        await page.render({ canvasContext: ctx, viewport: scaled }).promise;
        pages.push(canvas.toDataURL('image/jpeg', 0.85));
      }
    }

    setRenderedThumbs(pages);
    setIsRendering(false);
  }, []);

  useEffect(() => {
    if (selectedFile) {
      renderPdfThumbnails(selectedFile);
    } else {
      setRenderedThumbs([]);
      setSelectedThumbIdx(null);
    }
  }, [selectedFile, renderPdfThumbnails]);

  const initialRowRef = useRef<Partial<DocumentRow> | undefined>(initialRow);

  useEffect(() => {
    initialRowRef.current = initialRow;
  }, [initialRow]);

  useEffect(() => {
    if (resetSeed === undefined || resetSeed === null) return;
    const seedRow = initialRowRef.current;
    if (!seedRow) return;
    setRows((prev) => {
      if (prev.length === 0) {
        return [{ ...createDefaultRow(resolvedTypeOptions), ...seedRow }];
      }
      const [first, ...rest] = prev;
      return [{ ...first, ...seedRow }, ...rest];
    });
  }, [resetSeed, resolvedTypeOptions]);

  const processFile = (file: File) => {
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
      onFileSelect?.(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file?.type === 'application/pdf') {
        setSelectedFile(file);
        onFileSelect?.(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleReset = () => {
    setSelectedFile(null);
    setRenderedThumbs([]);
    setSelectedThumbIdx(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleScrollLeft = () => {
    if (thumbScrollRef.current) thumbScrollRef.current.scrollLeft -= 200;
  };

  const handleScrollRight = () => {
    if (thumbScrollRef.current) thumbScrollRef.current.scrollLeft += 200;
  };

  const handleThumbnailClick = (index: number) => {
    setSelectedThumbIdx(index);
    const fileName = selectedFile?.name.replace('.pdf', '') ?? 'Document';
    const shortName =
      fileName.length > 3 ? fileName.substring(0, 3) + '..' : fileName;
    setViewerTitle(`${shortName}(${index + 1}/${renderedThumbs.length})`);

    if (getPdfViewerUrl) {
      setViewerSrc(getPdfViewerUrl(index));
    } else if (selectedFile) {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      const blob = URL.createObjectURL(selectedFile);
      blobUrlRef.current = blob;
      setViewerSrc(`${blob}#page=${index + 1}`);
    }
    setViewerOpen(true);
  };

  const handleViewerClose = () => {
    setViewerOpen(false);
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  };

  const handleRowChange = (
    id: string,
    field: keyof DocumentRow,
    value: string | Date | null
  ) => {
    setRows((prev) =>
      prev.map((r) => (r.id === id ? { ...r, [field]: value } : r))
    );
  };

  const handleAddRow = () =>
    setRows((prev) => [...prev, createDefaultRow(resolvedTypeOptions)]);

  const handleRemoveRow = (id: string) =>
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev
    );

  const startBannerFade = () => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    setBannerState('fading');
  };

  const showValidationError = () => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    setBannerState('visible');
    bannerTimerRef.current = setTimeout(startBannerFade, 800);
  };

  const handleDismissValidation = () => startBannerFade();

  const handleBannerTransitionEnd = () => {
    if (bannerState === 'fading') setBannerState('hidden');
  };

  const handleUpload = () => {
    const isInvalid = rows.some(
      (r) => r.referenceNo.trim() === '' || r.referenceNo === '0'
    );
    if (isInvalid) {
      showValidationError();
      return;
    }
    onUpload?.(rows, selectedFile);
  };

  const showArrows = renderedThumbs.length > EMPTY_THUMB_COUNT;
  const emptyCount =
    renderedThumbs.length === 0
      ? EMPTY_THUMB_COUNT
      : Math.max(0, EMPTY_THUMB_COUNT - renderedThumbs.length);

  return (
    <>
      <Box className={styles.body}>
        {bannerState !== 'hidden' && (
          <Box
            className={`${styles.validationBanner} ${bannerState === 'fading' ? styles.validationBannerFading : ''}`}
            onTransitionEnd={handleBannerTransitionEnd}
          >
            <span className={styles.validationIcon}>
               <Triangle fill='currentColor' size={12} />
            </span>
            <span className={styles.validationText}>
              Please recheck and complete all mandatory Information.
            </span>
            <button
              className={styles.validationClose}
              onClick={handleDismissValidation}
              aria-label="Dismiss"
            >
              <X />
            </button>
          </Box>
        )}
        <Box className={styles.topSection}>
          <Box className={styles.uploadSection}>
            <span className={styles.dragLabel}>Drag &amp; Drop PDF here</span>
            <Box className={styles.fileInputWrapper}>
              <Box
                className={`${styles.fileInputRow} ${isDragging ? styles.dragging : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <button
                  className={styles.browseBtn}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse
                </button>
                <span className={styles.fileName}>
                  {selectedFile?.name ?? 'No File Chosen'}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  hidden
                  onChange={handleFileChange}
                />
              </Box>
              <button
                className={styles.resetBtn}
                onClick={handleReset}
                aria-label="Reset upload"
              >
                <RotateCw />
              </button>
            </Box>
          </Box>

          <Box className={styles.thumbnailContainer}>
            <button
              className={`${styles.arrowBtn} ${!showArrows ? styles.arrowBtnHidden : ''}`}
              onClick={handleScrollLeft}
              aria-label="Scroll left"
              tabIndex={showArrows ? 0 : -1}
            >
              <img src={arrowEdocImg} alt='<'/>
            </button>

            <Box ref={thumbScrollRef} className={styles.thumbnailScroll}>
              {isRendering && (
                <Box className={styles.renderingMsg}>Loading pages...</Box>
              )}
              {!isRendering &&
                renderedThumbs.map((src, i) => (
                  <Box
                    key={`thumb-${i}`}
                    className={styles.thumbItem}
                    onClick={() => handleThumbnailClick(i)}
                    style={{
                      outline:
                        selectedThumbIdx === i
                          ? `2px solid ${SELECTED_BORDER}`
                          : undefined,
                    }}
                  >
                    <img
                      src={src}
                      alt={`Page ${i + 1}`}
                      className={styles.thumbImg}
                    />
                    <span className={styles.thumbLabel}>Page {i + 1}</span>
                  </Box>
                ))}
              {!isRendering &&
                Array.from({ length: emptyCount }, (_, i) => (
                  <Box key={`empty-${i}`} className={styles.thumbItemEmpty} />
                ))}
            </Box>

            <button
              className={`${styles.arrowBtn} ${!showArrows ? styles.arrowBtnHidden : ''}`}
              onClick={handleScrollRight}
              aria-label="Scroll right"
              tabIndex={showArrows ? 0 : -1}
            >
             <img src={arrowEdocActiveImg} alt='>'/>
            </button>
          </Box>
        </Box>

        <Box className={styles.tableWrapper}>
          <table className={styles.docTable}>
            <thead>
              <tr>
                <th>Reference Type</th>
                <th>Reference Number</th>
                <th>Type</th>
                <th>Select Page</th>
                <th>Reference</th>
                <th>Received Date</th>
                <th>Received Time</th>
                <th>Comments</th>
                <th>Mode</th>
                <th colSpan={2} />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td>
                    <PSelect
                      value={row.referenceType}
                      onChange={(val) =>
                        handleRowChange(row.id, 'referenceType', val)
                      }
                      required
                      options={REFERENCE_TYPE_OPTIONS}
                      sx={SELECT_SX}
                      formControlSx={FORM_CONTROL_SX}
                    />
                  </td>
                  <td>
                    <PTextField
                      value={row.referenceNo}
                      onChange={(e) =>
                        handleRowChange(row.id, 'referenceNo', e.target.value)
                      }
                      required
                      textFeildSx={TEXT_FIELD_SX}
                    />
                  </td>
                  <td>
                    <PSelect
                      value={row.documenType}
                      onChange={(val) =>
                        handleRowChange(row.id, 'documenType', val)
                      }
                      required
                      options={resolvedTypeOptions}
                      sx={SELECT_SX}
                      formControlSx={FORM_CONTROL_SX}
                    />
                  </td>
                  <td>
                    <PTextField
                      value={row.selectedPages}
                      onChange={(e) =>
                        handleRowChange(row.id, 'selectedPages', e.target.value)
                      }
                      textFeildSx={TEXT_FIELD_SX}
                    />
                  </td>
                  <td>
                    <PTextField
                      value={row.documentReferenceNumber}
                      onChange={(e) =>
                        handleRowChange(
                          row.id,
                          'documentReferenceNumber',
                          e.target.value
                        )
                      }
                      textFeildSx={TEXT_FIELD_SX}
                    />
                  </td>
                  <td className={styles.dateCell}>
                    <PDatePicker
                      id={`receivedDate-${row.id}`}
                      value={row.documentReceivedDate}
                      onChange={(val) =>
                        handleRowChange(row.id, 'documentReceivedDate', val)
                      }
                    />
                  </td>
                  <td>
                    <PTextField
                      value={row.documentReceivedTime}
                      onChange={(e) =>
                        handleRowChange(row.id, 'documentReceivedTime', e.target.value)
                      }
                      textFeildSx={TEXT_FIELD_SX}
                    />
                  </td>
                  <td>
                    <PTextField
                      value={row.comments}
                      onChange={(e) =>
                        handleRowChange(row.id, 'comments', e.target.value)
                      }
                      textFeildSx={TEXT_FIELD_SX}
                    />
                  </td>
                  <td>
                    <PSelect
                      value={row.documentMode}
                      onChange={(val) => handleRowChange(row.id, 'documentMode', val)}
                      options={MODE_OPTIONS}
                      sx={SELECT_SX}
                      formControlSx={FORM_CONTROL_SX}
                    />
                  </td>
                  <td>
                    <button
                      className={styles.addRowBtn}
                      onClick={handleAddRow}
                      aria-label="Add row"
                    >
                      <img src={addContainerImg} alt="Add" />
                    </button>
                  </td>
                  <td>
                    <button
                      className={styles.removeRowBtn}
                      onClick={() => handleRemoveRow(row.id)}
                      aria-label="Remove row"
                    >
                      <img src={minusContainerImg} alt='minus'/>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>

        <Box className={styles.footer}>
          <button className={styles.uploadBtn} onClick={handleUpload}>
            Upload
          </button>
        </Box>
      </Box>

      <PModal
        open={viewerOpen}
        onClose={handleViewerClose}
        title={viewerTitle}
        width="80vw"
        height="90vh"
      >
        <iframe
          src={viewerSrc}
          className={styles.iframeViewer}
          title={viewerTitle}
        />
      </PModal>
    </>
  );
};

export default UploadDocuments;
