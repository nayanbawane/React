import React from 'react';
import { Box, Typography } from '@mui/material';
import styles from '../../../../styles/LCL/OrganizationSearch.module.css';
import type { POrganizationWidgetHeaderProps } from '@/types';

const POrganizationWidgetHeader: React.FC<POrganizationWidgetHeaderProps> = ({
    title,
    actionLabel,
    onAction,
}) => (
    <Box className={styles.header}>
        <Typography className={styles.title}>
            {title}
        </Typography>
        <Typography onClick={onAction} className={styles.actionLink}>
            {actionLabel}
        </Typography>
    </Box>
);

export default POrganizationWidgetHeader;
