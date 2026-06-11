import React from 'react';
import { Box, Button, Typography } from '@mui/material';

import styles from '../../../../styles/LCL/PickupDetails.module.css';
import { PickupAccessoriesProps } from '@/types/LCL/routing/RoutingDetails.types';
import { DEFAULT_ACCESSORY_OPTIONS } from '../../../../InitialData/LCL';

const PickupAccessories: React.FC<PickupAccessoriesProps> = ({
  selected = [],
  onChange,
  options = DEFAULT_ACCESSORY_OPTIONS,
}) => {
  const handleToggle = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter(item => item !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  return (
    <Box>
      <Typography variant="subtitle2" className={styles.title}>
        Accessorials
      </Typography>
      <Box className={styles.grid}>
        {options.map(option => {
          const isSelected = selected.includes(option.id);
          return (
            <Button
              key={option.id}
              variant={isSelected ? 'contained' : 'outlined'}
              onClick={() => handleToggle(option.id)}
              className={`${styles.accessoryBtn} ${isSelected ? styles.accessoryBtnSelected : styles.accessoryBtnDefault}`}
            >            
              {option.label}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};

export default PickupAccessories;
