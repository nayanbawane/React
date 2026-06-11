import { Box } from '@mui/material';
import styles from './TermsAndCondition.module.css';

interface TermsAndConditionsProps {
  Info?: string;
}

export default function TermsAndConditions({ Info }: TermsAndConditionsProps) {

const lines = Info?.split(/\r?\n/).filter(line => line.trim() !== '') || [];

  return (
    <Box className={styles.wrapper}>
      <Box className={styles.content}>
        <Box className={styles.subsection}>
          <ul className={styles.list}>
            {lines.map((line, index) => (
              <li key={index} className={styles.listItem}>
                {line}
              </li>
            ))}
          </ul>
        </Box>
      </Box>
    </Box>
  );
}