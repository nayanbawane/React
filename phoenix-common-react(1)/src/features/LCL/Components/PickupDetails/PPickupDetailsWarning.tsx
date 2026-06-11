import Box from '@mui/material/Box';

import warningIcon from '../../../../assets/images/warning.png';
import { PGradientButton } from 'phoenix-react-lib';
import styles from '../../../../styles/LCL/PickupDetails.module.css';
import { PPickupDetailsWarningProps } from '@/types/LCL/routing/RoutingDetails.types';

const PPickupDetailsWarning = ({ onYes, onNo }: PPickupDetailsWarningProps) => {
    return (
        <Box className={styles.wrapper}>
            <Box className={styles.warningBox}>
                <Box className={styles.iconWrapper}>
                    <img src={warningIcon} alt="Warning" className={styles.warningIcon} />
                </Box>
                <Box className={styles.message}>
                    Do you want to delete the <br /> pickup?
                </Box>
            </Box>

            <Box className={styles.actionsRow}>
                <PGradientButton onClick={onYes} title='Yes' className={styles.yesBtn} />
                <PGradientButton onClick={onNo} title='No' className={styles.noBtn} />
            </Box>
        </Box>
    );
}

export default PPickupDetailsWarning;
