import React from 'react';
import { PModal } from 'phoenix-react-lib';
import styles from '../../../../styles/LCL/LocationSearch.module.css';

interface Props {
  open: boolean;
  onClose: () => void;
}

const NoFilterPopup: React.FC<Props> = ({ open, onClose }) => (
  <PModal open={open} onClose={onClose} title="Warning" width={400} height={150}>
    <div className={styles.message}>
      Please enter at least one search filter before searching.
    </div>
  </PModal>
);

export default NoFilterPopup;
