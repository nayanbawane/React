import { useState, useEffect } from 'react';
import { Box, IconButton } from '@mui/material';
import {
  PDatePicker,
  PSingleValueSearchableField,
  PTextField,
} from 'phoenix-react-lib';
import searchIcon from '../../../../assets/images/search-icon.png';
import styles from '../../../../styles/LCL/routing-details.module.css';
import { TransshipmentPortRow } from '@/types/LCL/routing/RoutingDetails.types';
import { useGetSuggestions, locationSuggestionConfig } from '../../../../hooks/LCL';
import { LocationSearchModal } from '../locationSearch';
import type { LocationResult } from '@/types';
import { useAppSelector } from '../../../../app/store/hooks';
import { selectLoginClientBean } from '../../../../core/featureToggles/featureToggle.selectors';
import editIcon from '../../../../assets/edit.svg';


const EditIcon = () => <img src={editIcon} alt="edit" width={22} height={22} />;


interface TransshipmentSectionProps {
  rows: TransshipmentPortRow[];
  onChange: (rows: TransshipmentPortRow[]) => void;
  locationOptions: Record<string, string>[];
  showError: (errorMessage: string, variant?: 'bar' | 'modal') => void
}

interface TransshipmentRowProps {
  row: TransshipmentPortRow;
  isEditable: boolean;
  canAdd: boolean;
  canRemove: boolean;
  onPortSelect: (id: number, item: Record<string, unknown>) => void;
  onPortCodeChange: (id: number, code: string) => void;
  onPortNameChange: (id: number, name: string) => void;
  onEtaChange: (id: number, eta: Date | null) => void;
  onEditToggle: (id: number) => void;
  onAdd: (id: number) => void;
  onRemove: (id: number) => void;
  onOpenLocationSearch: (id: number) => void;
  showError: (errorMessage: string, variant?: 'bar' | 'modal') => void
}

function TransshipmentRow({
  row,
  isEditable,
  canAdd,
  canRemove,
  onPortSelect,
  onPortCodeChange,
  onPortNameChange,
  onEtaChange,
  onEditToggle,
  onAdd,
  onRemove,
  onOpenLocationSearch,
  showError
}: TransshipmentRowProps) {
  const loginClientBean = useAppSelector(selectLoginClientBean);
  const { data: portSuggestions, setQuery: setPortQuery } = useGetSuggestions(locationSuggestionConfig(loginClientBean as any));

  return (
    <Box className={styles.grid24}>
      <Box className={`${styles.colSpan3} ${styles.searchWrap}`}>
        <PSingleValueSearchableField
          label="Transshipment Port"
          onInvalidValueSelected={() => {
            showError(`Please enter a valid Transshipment Port.`, 'modal')
            onPortCodeChange(row.id, "");
            setPortQuery("");
          }}
          value={row.portCode}
          data={portSuggestions}
          displayFields={['code', 'name', 'locode', 'country']}
          columnHeaders={['Code', 'Name', 'UnCode', 'Country']}
          onChange={(val) => {
            onPortCodeChange(row.id, val);
            setPortQuery(val);
          }}
          onSelect={(item) => onPortSelect(row.id, item as Record<string, unknown>)}
        />
        <Box className={styles.searchIcon}>
          <img
            src={searchIcon}
            alt="search"
            className={styles.searchImg}
            onClick={() => onOpenLocationSearch(row.id)}
          />
        </Box>
      </Box>

      <Box className={styles.colSpan9}>
        <PTextField
          label="Transshipment Port Name"
          value={row.portName}
          onChange={(e) => onPortNameChange(row.id, e.target.value)}
          disabled={!isEditable}
          className={styles.textField}
        />
      </Box>
      <Box className={styles.editBtnCell}>
        <IconButton
          size="small"
          onClick={() => onEditToggle(row.id)}
          className={`${styles.editBtn} ${isEditable ? styles.editBtnActive : ''}`}
        >
          <EditIcon />
        </IconButton>
      </Box>

      <Box className={`${styles.colSpan3} ${styles.mlNeg25}`}>
        <PDatePicker
          id={`transshipment-eta-${row.id}`}
          label="ETA"
          value={row.eta}
          onChange={(val) => onEtaChange(row.id, val ?? null)}
        />
      </Box>
      <Box className={`${styles.colSpan2} ${styles.flex} ${styles.flex_gap_4} ${styles.pb4_flex_center}`}>
        <IconButton size="small" onClick={() => onAdd(row.id)} disabled={!canAdd} className={styles.actionBtn}>
          +
        </IconButton>
        <IconButton size="small" onClick={() => onRemove(row.id)} disabled={!canRemove} className={styles.actionBtn}>
          −
        </IconButton>
      </Box>
    </Box>
  );
}

function TransshipmentSection({
  rows,
  onChange,
  showError
}: TransshipmentSectionProps) {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    const hasTransshipment = rows.some(
      (row) => row.portCode
    );

    if (hasTransshipment) {
      setIsOpen(true);
    }
  }, [rows]);
  const [editableRows, setEditableRows] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (isOpen && rows.length === 0) {
      onChange([{ id: 1, portCode: '', portName: '', eta: null }]);
    }
  }, [isOpen]);
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [locationModalKey, setLocationModalKey] = useState(0);
  const [activeRowId, setActiveRowId] = useState<number | null>(null);

  const handleEditToggle = (id: number) => {
    setEditableRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleAdd = (afterId: number) => {
    if (rows.length < 3) {
      const index = rows.findIndex((r) => r.id === afterId);
      const nextId = rows.length > 0 ? Math.max(...rows.map(r => r.id)) + 1 : 1;
      const newRow: TransshipmentPortRow = { id: nextId, portCode: '', portName: '', eta: null };
      onChange([
        ...rows.slice(0, index + 1),
        newRow,
        ...rows.slice(index + 1),
      ]);
    }
  };

  const handleRemove = (id: number) => {
    if (rows.length > 1) {
      onChange(rows.filter((r) => r.id !== id));
    }
  };

  const handlePortSelect = (id: number, item: Record<string, unknown>) => {
    onChange(
      rows.map((r) =>
        r.id === id
          ? { ...r, portCode: String(item.code ?? ''), portName: String(item.name ?? '') }
          : r
      )
    );
  };

  // GWT: LocationSearchHandler.onKeyUp — if code input is empty, clear name too
  const handlePortCodeChange = (id: number, code: string) => {
    onChange(
      rows.map((r) => {
        if (r.id !== id) return r;
        return code.trim() ? { ...r, portCode: code } : { ...r, portCode: '', portName: '' };
      })
    );
  };

  const handlePortNameChange = (id: number, name: string) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, portName: name } : r)));
  };

  const handleEtaChange = (id: number, eta: Date | null) => {
    onChange(rows.map((r) => (r.id === id ? { ...r, eta } : r)));
  };

  const handleOpenLocationSearch = (rowId: number) => {
    setActiveRowId(rowId);
    setLocationModalKey((prev) => prev + 1);
    setLocationModalOpen(true);
  };

  const handleLocationSelect = (loc: LocationResult) => {
    if (!activeRowId) return;
    onChange(
      rows.map((r) =>
        r.id === activeRowId
          ? { ...r, portCode: loc.code, portName: loc.name }
          : r
      )
    );
  };

  return (
    <Box>
      <button type="button" onClick={() => setIsOpen((prev) => !prev)} className={styles.toggleBtn}>
        <span style={{ fontSize: 9 }}>{isOpen ? '▼' : '▶'}</span>
        Transshipment Port
      </button>

      <hr className="routing-divider" />
      {isOpen && (
        <>
          {rows.map((row) => (
            <TransshipmentRow
              showError={showError}
              key={row.id}
              row={row}
              isEditable={editableRows.has(row.id)}
              canAdd={rows.length < 3}
              canRemove={rows.length > 1}
              onPortSelect={handlePortSelect}
              onPortCodeChange={handlePortCodeChange}
              onPortNameChange={handlePortNameChange}
              onEtaChange={handleEtaChange}
              onEditToggle={handleEditToggle}
              onAdd={handleAdd}
              onRemove={handleRemove}
              onOpenLocationSearch={handleOpenLocationSearch}
            />
          ))}
        </>
      )}

      <LocationSearchModal
        key={locationModalKey}
        open={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        onSelect={handleLocationSelect}
        title="Transshipment Port Search"
      />
    </Box>
  );
}

export default TransshipmentSection;
