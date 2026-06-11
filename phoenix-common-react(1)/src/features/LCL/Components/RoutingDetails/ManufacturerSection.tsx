import { useState } from 'react';

import { ManufacturerEntry } from '@/types/LCL/routing/RoutingDetails.types';
import { Box, IconButton } from '@mui/material';

import { PTextField } from 'phoenix-react-lib';
import styles from '../../../../styles/LCL/routing-details.module.css';

interface ManufacturerSectionProps {
  entries: ManufacturerEntry[];
  onChange: (entries: ManufacturerEntry[]) => void;
  multiple?: boolean;
}

function ManufacturerSection({
  entries,
  onChange,
  multiple = false,
}: ManufacturerSectionProps) {
  const [newlyAddedId, setNewlyAddedId] = useState<string | null>(null);

  const handleAdd = () => {
    if (entries.length < 15) {
      const newId = crypto.randomUUID();
      onChange([...entries, { id: newId, name: '' }]);
      setNewlyAddedId(newId);
    }
  };

  const handleRemove = (id: string) => {
    if (entries.length > 1) {
      onChange(entries.filter((e) => e.id !== id));
    }
  };

  const handleNameChange = (id: string, name: string) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, name } : e)));
  };

  const lastIndex = entries.length - 1;
  const displayEntries = multiple ? entries : entries.slice(0, 1);

  return (
    <Box className={styles.mb4}>
      {displayEntries.map((entry, index) => (
        <Box
          key={entry.id}
          className={`${styles.flex} ${styles.flex_align_end} ${styles.flex_gap_4} ${styles.mb2}`}
        >
          <Box className={styles.w260}>
            <PTextField
              label={index === 0 ? 'Manufacturer Name' : undefined}
              value={entry.name}
              onChange={(e) => handleNameChange(entry.id, e.target.value)}
              className={styles.textField}
              inputProps={{ maxLength: 100 }}
              autoFocus={entry.id === newlyAddedId}
            />
          </Box>
          {multiple && (
            <Box className={styles.gap2}>
              <IconButton
                size="small"
                onClick={handleAdd}
                disabled={index !== lastIndex}
                className={styles.actionBtn}
              >
                +
              </IconButton>
              <IconButton
                size="small"
                onClick={() => handleRemove(entry.id)}
                className={styles.actionBtn}
              >
                −
              </IconButton>
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

export default ManufacturerSection;
