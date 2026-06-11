import React, { useState, useCallback } from 'react';
import errorIcon from '@/assets/images/error.png';

new Image().src = errorIcon;
import { Alert, MenuItem, Select } from '@mui/material';
import { PModal, PSingleValueSearchableField } from 'phoenix-react-lib';
import { useGetSuggestions, printerSuggestionConfig, PHOENIX_ENDPOINTS } from 'phoenix-common-react';
import { useAppSelector } from '@/app/store/hooks';
import { ApiService } from '@/core/api/client';
import styles from './PrintLabel.module.css';

type PfmOption = 'EMAIL' | 'FAX' | 'PRINT';

const PFM_OPTIONS: { label: string; value: PfmOption }[] = [
  { label: 'Email - Email', value: 'EMAIL' },
  { label: 'Fax - Fax',    value: 'FAX'   },
  { label: 'Print - Print', value: 'PRINT' },
];

interface PrintLabelModalProps {
  open: boolean;
  onClose: () => void;
  referenceNumber: string | null;
  username: string;
  onSuccess?: () => void;
}

const PrintLabelModal: React.FC<PrintLabelModalProps> = ({ open, onClose, referenceNumber, username, onSuccess }) => {
  const loginClientBean = useAppSelector((state: any) => state.loginClientBean?.data);

  const [dockReceiptPfm, setDockReceiptPfm] = useState<PfmOption>('EMAIL');
  const [dockReceiptPrinter, setDockReceiptPrinter] = useState('');
  const [dockReceiptFax, setDockReceiptFax] = useState('');
  const [dockReceiptEmail, setDockReceiptEmail] = useState('');
  const [pnlPrinter, setPnlPrinter] = useState('');
  const [pnlPrinterCode, setPnlPrinterCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { data: dockPrinterSuggestions, setQuery: setDockPrinterQuery } =
    useGetSuggestions(printerSuggestionConfig(loginClientBean));

  const { data: pnlPrinterSuggestions, setQuery: setPnlPrinterQuery } =
    useGetSuggestions(printerSuggestionConfig(loginClientBean));

  const handleClose = useCallback(() => {
    setDockPrinterQuery('');
    setPnlPrinterQuery('');
    setError(null);
    setSubmitting(false);
    onClose();
  }, [onClose, setDockPrinterQuery, setPnlPrinterQuery]);

  const handleDockReceiptPfmChange = (value: PfmOption) => {
    setDockReceiptPfm(value);
    setDockReceiptPrinter('');
    setDockReceiptFax('');
    setDockReceiptEmail('');
    setDockPrinterQuery('');
  };

  const handleSubmit = useCallback(async () => {
    const isInvalid =
      (dockReceiptPfm === 'EMAIL' && dockReceiptEmail.length < 1 && pnlPrinter.length < 1) ||
      (dockReceiptPfm === 'FAX'   && dockReceiptFax.length   < 1 && pnlPrinter.length < 1) ||
      (dockReceiptPfm === 'PRINT' && dockReceiptPrinter.length < 1 && pnlPrinter.length < 1);

    if (isInvalid) {
      setError('Please enter the details before executing the reports.');
      return;
    }

    setError(null);

    const perlReportBeanList: unknown[] = [];
    const refStr = referenceNumber ?? '';
    const executeViaName = 'rpt-main-sh';

    if (pnlPrinter.length > 0) {
      perlReportBeanList.push({
        tag: 'BKGSHEET',
        key: 'PRINT',
        passkey: refStr,
        userId: username,
        printerName: pnlPrinterCode,
        executeVia: executeViaName,
        argumentMap: {
          'rpt-main-file': '',
          rpt: 'CME145',
          transport: 'PRINT',
          printer: pnlPrinter,
          outputtype: 'ASCII',
        },
      });
    }

    if (dockReceiptPrinter.length > 0 || dockReceiptFax.length > 0 || dockReceiptEmail.length > 0) {
      const dockArgMap: Record<string, string> = {
        'rpt-main-file': '',
        rpt: 'CME150',
        transport: dockReceiptPfm,
      };

      if (dockReceiptPfm === 'EMAIL') {
        dockArgMap.outputtype = 'PDF';
        dockArgMap.emailSubj = `GENERATING_DOCK_RECEIPT_FOR_${refStr}`;
        dockArgMap.emailAttachmentName = `DOCK_RECEIPT_${refStr}`;
        if (dockReceiptEmail.length > 0) dockArgMap.emailTo = dockReceiptEmail;
      }
      if (dockReceiptPfm === 'FAX' && dockReceiptFax.length > 0) {
        dockArgMap.outputtype = 'ASCII';
        dockArgMap.faxinfo = `number=${dockReceiptFax}`;
      }
      if (dockReceiptPfm === 'PRINT' && dockReceiptPrinter.length > 0) {
        dockArgMap.printer = dockReceiptPrinter;
        dockArgMap.outputtype = 'ASCII';
      }

      const dockBean: Record<string, unknown> = {
        tag: 'DOCK',
        key: 'PRINT',
        userId: username,
        passkey: refStr,
        executeVia: executeViaName,
        argumentMap: dockArgMap,
      };
      if (dockReceiptFax.length > 0) dockBean.passkey1 = dockReceiptFax;
      if (dockReceiptPrinter.length > 0) dockBean.printerName = dockReceiptPrinter;

      perlReportBeanList.push(dockBean);
    }

    setSubmitting(true);
    try {
      await ApiService.post(PHOENIX_ENDPOINTS.BOOKING.EXECUTE_PERL_REPORT, { perlReportBeanList });
      onSuccess?.();
      handleClose();
    } catch {
      setError('Failed to execute report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [
    dockReceiptPfm, dockReceiptEmail, dockReceiptFax, dockReceiptPrinter,
    pnlPrinter, pnlPrinterCode, referenceNumber, username, onSuccess, handleClose,
  ]);

  return (
    <PModal
      open={open}
      title="Generating Dock Receipt and Profit & Loss Sheet"
      onClose={handleClose}
      isCloseIcon
      width={750}
      height={error ? 230 : 190}
    >
      <div className={styles.container}>
        {error && (
          <Alert
            severity="error"
            className={styles.errorAlert}
            icon={<img src={errorIcon} alt="" className={styles.errorIcon} />}
          >
            {error}
          </Alert>
        )}
        <table className={styles.reportTable}>
          <thead>
            <tr>
              <th className={styles.labelCell}></th>
              <th className={styles.headerCell}>PFM</th>
              <th className={styles.headerCell}>Printer</th>
              <th className={styles.headerCell}>Fax Number</th>
              <th className={styles.headerCell}>Email Address</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className={styles.rowLabel}>Dock Receipt</td>
              <td className={styles.inputCell}>
                <Select
                  value={dockReceiptPfm}
                  onChange={(e) => handleDockReceiptPfmChange(e.target.value as PfmOption)}
                  size="small"
                  className={styles.pfmSelect}
                  MenuProps={{ PaperProps: { className: styles.pfmMenuPaper } }}
                >
                  {PFM_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </td>
              <td className={styles.inputCell}>
                <div className={`${styles.printerField} ${dockReceiptPfm !== 'PRINT' ? styles.fieldDisabled : ''}`}>
                  {/*@ts-ignore*/}
                  <PSingleValueSearchableField
                    id="dockReceiptPrinter"
                    data={dockPrinterSuggestions || []}
                    displayFields={['name']}
                    displayValueField="name"
                    columnHeaders={[]}
                    value={dockReceiptPrinter}
                    disabled={dockReceiptPfm !== 'PRINT'}
                    usePortal
                    onChange={(val: string) => {
                      setDockReceiptPrinter(val);
                      setDockPrinterQuery(val);
                    }}
                    onSelect={(item: any) => {
                      setDockReceiptPrinter(item?.name || '');
                      setDockPrinterQuery('');
                    }}
                  />
                </div>
              </td>
              <td className={styles.inputCell}>
                <input
                  type="text"
                  value={dockReceiptFax}
                  onChange={(e) => setDockReceiptFax(e.target.value)}
                  disabled={dockReceiptPfm !== 'FAX'}
                  className={`${styles.textInput} ${dockReceiptPfm !== 'FAX' ? styles.inputDisabled : ''}`}
                />
              </td>
              <td className={styles.inputCell}>
                <input
                  type="text"
                  value={dockReceiptEmail}
                  onChange={(e) => setDockReceiptEmail(e.target.value)}
                  disabled={dockReceiptPfm !== 'EMAIL'}
                  className={`${styles.textInput} ${dockReceiptPfm !== 'EMAIL' ? styles.inputDisabled : ''}`}
                />
              </td>
            </tr>

            <tr>
              <td className={styles.rowLabel}>Profit &amp; Loss Sheet</td>
              <td className={styles.inputCell}>
                <Select
                  value="PRINT"
                  disabled
                  size="small"
                  className={`${styles.pfmSelect} ${styles.pfmDisabled}`}
                  MenuProps={{ PaperProps: { className: styles.pfmMenuPaper } }}
                >
                  {PFM_OPTIONS.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </MenuItem>
                  ))}
                </Select>
              </td>
              <td className={styles.inputCell}>
                <div className={styles.printerField}>
                  <PSingleValueSearchableField
                    id="pnlPrinter"
                    data={pnlPrinterSuggestions || []}
                    displayFields={['name']}
                    displayValueField="name"
                    columnHeaders={[]}
                    value={pnlPrinter}
                    usePortal
                    onChange={(val: string) => {
                      setPnlPrinter(val);
                      setPnlPrinterCode('');
                      setPnlPrinterQuery(val);
                    }}
                    onSelect={(item: any) => {
                      setPnlPrinter(item?.name || '');
                      setPnlPrinterCode(item?.code || '');
                      setPnlPrinterQuery('');
                    }}
                  />
                </div>
              </td>
              <td className={styles.inputCell}></td>
              <td className={styles.inputCell}></td>
            </tr>
          </tbody>
        </table>

        <div className={styles.submitRow}>
          <button
            type="button"
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>
    </PModal>
  );
};

export default PrintLabelModal;
