import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Typography,
} from '@mui/material';
import React, { useEffect, useState } from 'react';
import imgArrowCollapsed from '../../../../assets/rate_arrow_collapsed.png';
import imgArrowExpanded from '../../../../assets/rate_arrow_expanded.png';
import styles from '../../../../styles/LCL/RateDetails.module.css';
import { PRateDetailsAccordionProps } from '../../../../types/LCL/RateDetails/RateDetails.types';

const PRateDetailsAccordion: React.FC<PRateDetailsAccordionProps> = ({
  title,
  children,
  defaultExpanded = true,
  disabled = false,
  forceExpanded = false,
  buttonId,
  iconButtonId,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  useEffect(() => {
    if (forceExpanded) setExpanded(true);
  }, [forceExpanded]);

  return (
    <Accordion
      id={buttonId}
      expanded={expanded}
      defaultExpanded={defaultExpanded}
      onChange={(_, val) => setExpanded(val)}
      disabled={disabled}
      className={styles.accordion}
    >
      <AccordionSummary
        expandIcon={
          <div id={iconButtonId} className={styles.accordionArrow}>
            <img
              src={expanded ? imgArrowExpanded : imgArrowCollapsed}
              alt=""
            />
          </div>
        }
        className={styles.accordionSummary}
      >
        <Typography className={styles.accordionTitle}>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
};

export default PRateDetailsAccordion;
